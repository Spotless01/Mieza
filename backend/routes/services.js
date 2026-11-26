const express = require("express");
const router = express.Router();
const Service = require("../models/Service");
const adminMiddleware = require("../middleware/adminMiddleware");
const requireAdminRole = require("../middleware/requireAdminRole");

const canManageServices = [adminMiddleware, requireAdminRole("owner", "cofounder", "staff")];

router.get("/", async (req, res) => {
  try {
    const services = await Service.find({ isActive: true }).sort({ createdAt: -1 }).lean();
    res.json(services);
  } catch (error) {
    console.error("Services list error:", error);
    res.status(500).json({ message: "Unable to load services." });
  }
});

router.get("/admin/all", adminMiddleware, requireAdminRole("owner", "cofounder", "staff"), async (req, res) => {
  try {
    const services = await Service.find({}).sort({ createdAt: -1 }).lean();
    res.json({ services });
  } catch (error) {
    console.error("Admin services list error:", error);
    res.status(500).json({ message: "Unable to load all service listings." });
  }
});

router.post("/", ...canManageServices, async (req, res) => {
  try {
    const { title, category, description, providerName, location, image } = req.body;
    if (!String(title || "").trim() || !String(category || "").trim() || !String(description || "").trim()) {
      return res.status(400).json({ message: "Service title, category and description are required." });
    }
    const service = await Service.create({
      title, category, description, providerName, location, image,
      createdBy: req.admin.id
    });
    res.status(201).json({ message: "Service published.", service });
  } catch (error) {
    console.error("Service create error:", error);
    res.status(500).json({ message: "Unable to publish service." });
  }
});

router.put("/:id", ...canManageServices, async (req, res) => {
  try {
    const allowed = ["title", "category", "description", "providerName", "location", "image", "isActive"];
    const updates = {};
    allowed.forEach(key => { if (req.body[key] !== undefined) updates[key] = req.body[key]; });
    const service = await Service.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!service) return res.status(404).json({ message: "Service not found." });
    res.json({ message: "Service updated.", service });
  } catch (error) {
    res.status(500).json({ message: "Unable to update service." });
  }
});

router.delete("/:id", adminMiddleware, requireAdminRole("owner"), async (req, res) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) return res.status(404).json({ message: "Service not found." });
    res.json({ message: "Service removed." });
  } catch (error) {
    res.status(500).json({ message: "Unable to remove service." });
  }
});

module.exports = router;
