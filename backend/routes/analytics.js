const express = require("express");
const crypto = require("crypto");
const router = express.Router();

const AnalyticsEvent = require("../models/AnalyticsEvent");
const AnalyticsVisitor = require("../models/AnalyticsVisitor");
const adminMiddleware = require("../middleware/adminMiddleware");
const requireAdminRole = require("../middleware/requireAdminRole");

const RETENTION_DAYS = 400;

function hashIdentifier(value) {
  const secret = process.env.ANALYTICS_HASH_SECRET || process.env.JWT_SECRET || "mieza-analytics-v1";
  return crypto.createHmac("sha256", secret).update(String(value)).digest("hex");
}

function cleanText(value, max = 100) {
  return String(value || "").replace(/[\u0000-\u001f<>]/g, "").trim().slice(0, max);
}

function getLocation(req) {
  // Trust only geo headers supplied by a hosting provider or trusted proxy.
  // Raw IP addresses are deliberately not stored or sent to a third-party lookup service.
  const country = cleanText(
    req.headers["cf-ipcountry"] ||
    req.headers["x-vercel-ip-country"] ||
    req.headers["cloudfront-viewer-country"] ||
    "Unknown", 80
  ).toUpperCase();
  const city = cleanText(req.headers["cf-ipcity"] || req.headers["x-vercel-ip-city"] || "", 100);
  const region = cleanText(req.headers["cf-region"] || req.headers["x-vercel-ip-country-region"] || "", 80);
  return { country: country || "Unknown", city, region };
}

function getDevice(userAgent = "") {
  const ua = String(userAgent).toLowerCase();
  if (/ipad|tablet|kindle|silk/.test(ua)) return "Tablet";
  if (/mobile|android|iphone|ipod|opera mini/.test(ua)) return "Mobile";
  if (/windows|macintosh|linux|x11/.test(ua)) return "Desktop";
  return "Unknown";
}

function getReferrerHost(value) {
  try {
    if (!value) return "";
    return new URL(value).hostname.replace(/^www\./, "").slice(0, 100);
  } catch {
    return "";
  }
}

function getSource(source, referrerHost) {
  const normalized = cleanText(source, 40).toLowerCase();
  const known = {
    google: "Google", facebook: "Facebook", instagram: "Instagram",
    tiktok: "TikTok", whatsapp: "WhatsApp", youtube: "YouTube"
  };
  if (known[normalized]) return known[normalized];
  if (!referrerHost) return "Direct";
  const host = referrerHost.toLowerCase();
  if (host.includes("google")) return "Google";
  if (host.includes("facebook") || host.includes("fb.")) return "Facebook";
  if (host.includes("instagram")) return "Instagram";
  if (host.includes("tiktok")) return "TikTok";
  if (host.includes("whatsapp")) return "WhatsApp";
  if (host.includes("youtube")) return "YouTube";
  return "Other";
}

router.post("/track", async (req, res) => {
  try {
    const visitorId = String(req.body.visitorId || "");
    const sessionId = String(req.body.sessionId || "");
    const page = cleanText(req.body.page, 200);

    if (visitorId.length < 16 || visitorId.length > 100 ||
        sessionId.length < 16 || sessionId.length > 100 ||
        !page.startsWith("/") || page.startsWith("//")) {
      return res.status(400).json({ message: "Invalid analytics event" });
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + RETENTION_DAYS * 86400000);
    const visitorHash = hashIdentifier(visitorId);
    const sessionHash = hashIdentifier(sessionId);
    const location = getLocation(req);
    const referrerHost = getReferrerHost(req.body.referrer);
    const source = getSource(req.body.source, referrerHost);

    const previousVisitor = await AnalyticsVisitor.findOneAndUpdate(
      { visitorHash },
      {
        $set: { lastSeenAt: now, lastCountry: location.country, lastCity: location.city, expiresAt },
        $setOnInsert: { firstSeenAt: now, firstCountry: location.country, firstCity: location.city }
      },
      { upsert: true, new: false }
    );

    await AnalyticsEvent.create({
      visitorHash, sessionHash, eventType: "page_view", page, source, referrerHost,
      country: location.country, region: location.region, city: location.city,
      device: getDevice(req.headers["user-agent"]), createdAt: now, expiresAt
    });

    return res.status(202).json({ accepted: true, visitorType: previousVisitor ? "returning" : "new" });
  } catch (err) {
    console.error("Analytics tracking error:", err.message);
    return res.status(500).json({ message: "Unable to record analytics event" });
  }
});

router.get("/summary", adminMiddleware, requireAdminRole("owner"), async (req, res) => {
  try {
    const days = [7, 30, 90, 365].includes(Number(req.query.days)) ? Number(req.query.days) : 30;
    const now = new Date();
    const start = new Date(now.getTime() - days * 86400000);
    const activeSince = new Date(now.getTime() - 5 * 60000);

    const [
      pageViews, uniqueRows, newVisitors, returningVisitors, activeVisitors,
      topPages, sources, locations, devices, daily
    ] = await Promise.all([
      AnalyticsEvent.countDocuments({ createdAt: { $gte: start } }),
      AnalyticsEvent.distinct("visitorHash", { createdAt: { $gte: start } }),
      AnalyticsVisitor.countDocuments({ firstSeenAt: { $gte: start }, lastSeenAt: { $gte: start } }),
      AnalyticsVisitor.countDocuments({ firstSeenAt: { $lt: start }, lastSeenAt: { $gte: start } }),
      AnalyticsVisitor.countDocuments({ lastSeenAt: { $gte: activeSince } }),
      AnalyticsEvent.aggregate([
        { $match: { createdAt: { $gte: start } } },
        { $group: { _id: "$page", views: { $sum: 1 } } },
        { $sort: { views: -1 } }, { $limit: 10 }
      ]),
      AnalyticsEvent.aggregate([
        { $match: { createdAt: { $gte: start } } },
        { $group: { _id: "$source", views: { $sum: 1 } } },
        { $sort: { views: -1 } }, { $limit: 10 }
      ]),
      AnalyticsEvent.aggregate([
        { $match: { createdAt: { $gte: start }, country: { $ne: "Unknown" } } },
        { $group: { _id: { country: "$country", city: "$city" }, visitorSet: { $addToSet: "$visitorHash" }, views: { $sum: 1 } } },
        { $project: { country: "$_id.country", city: "$_id.city", visitors: { $size: "$visitorSet" }, views: 1 } },
        { $sort: { visitors: -1, views: -1 } }, { $limit: 15 }
      ]),
      AnalyticsEvent.aggregate([
        { $match: { createdAt: { $gte: start } } },
        { $group: { _id: "$device", views: { $sum: 1 } } },
        { $sort: { views: -1 } }
      ]),
      AnalyticsEvent.aggregate([
        { $match: { createdAt: { $gte: start } } },
        { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, views: { $sum: 1 }, visitorSet: { $addToSet: "$visitorHash" } } },
        { $project: { date: "$_id", views: 1, visitors: { $size: "$visitorSet" } } },
        { $sort: { date: 1 } }
      ])
    ]);

    res.json({
      periodDays: days, generatedAt: now, pageViews, uniqueVisitors: uniqueRows.length,
      newVisitors, returningVisitors, activeVisitors,
      topPages: topPages.map(x => ({ page: x._id, views: x.views })),
      sources: sources.map(x => ({ source: x._id || "Direct", views: x.views })),
      locations: locations.map(x => ({ country: x.country, city: x.city || "City unavailable", visitors: x.visitors, views: x.views })),
      devices: devices.map(x => ({ device: x._id, views: x.views })),
      daily
    });
  } catch (err) {
    console.error("Analytics summary error:", err.message);
    res.status(500).json({ message: "Unable to load traffic analytics" });
  }
});

module.exports = router;
