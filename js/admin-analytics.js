const analyticsToken = localStorage.getItem("adminToken");
let analyticsAdmin = null;

async function initializeAnalyticsPage() {
  if (typeof verifyAdminAccess !== "function") {
    window.location.href = "admin-login.html";
    return;
  }
  analyticsAdmin = await verifyAdminAccess(["owner"]);
  if (!analyticsAdmin) return;
  await loadTrafficAnalytics();
}

function analyticsEscape(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[char]));
}

function analyticsNumber(value) {
  return new Intl.NumberFormat().format(Number(value || 0));
}

async function loadTrafficAnalytics() {
  const range = document.getElementById("analyticsRange");
  const days = range?.value || "30";
  const refresh = document.getElementById("refreshAnalytics");
  if (refresh) {
    refresh.disabled = true;
    refresh.textContent = "Loading…";
  }

  try {
    const response = await fetch(
      `https://mieza.onrender.com/api/analytics/summary?days=${encodeURIComponent(days)}`,
      { headers: { Authorization: `Bearer ${analyticsToken}` }, cache: "no-store" }
    );
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Unable to load analytics");
    }

    setAnalyticsText("uniqueVisitors", analyticsNumber(data.uniqueVisitors));
    setAnalyticsText("pageViews", analyticsNumber(data.pageViews));
    setAnalyticsText("newVisitors", analyticsNumber(data.newVisitors));
    setAnalyticsText("returningVisitors", analyticsNumber(data.returningVisitors));
    setAnalyticsText("activeVisitors", analyticsNumber(data.activeVisitors));

    renderDailyTraffic(data.daily || []);
    renderAnalyticsBars("sourceList", data.sources || [], "source", "views");
    renderAnalyticsBars("deviceList", data.devices || [], "device", "views");
    renderTopPages(data.topPages || []);
    renderLocations(data.locations || []);
  } catch (error) {
    console.error("Traffic analytics error:", error);
    ["uniqueVisitors", "pageViews", "newVisitors", "returningVisitors", "activeVisitors"]
      .forEach(id => setAnalyticsText(id, "—"));
    ["dailyChart", "sourceList", "deviceList", "pageList", "locationList"]
      .forEach(id => {
        const element = document.getElementById(id);
        if (element) element.innerHTML = `<div class="analytics-empty">${analyticsEscape(error.message)}</div>`;
      });
  } finally {
    if (refresh) {
      refresh.disabled = false;
      refresh.textContent = "Refresh";
    }
  }
}

function setAnalyticsText(id, value) {
  const element = document.getElementById(id);
  if (element) element.textContent = value;
}

function renderDailyTraffic(rows) {
  const container = document.getElementById("dailyChart");
  if (!container) return;
  if (!rows.length) {
    container.innerHTML = '<div class="analytics-empty">No visits recorded for this period yet.</div>';
    return;
  }
  const max = Math.max(1, ...rows.map(row => Number(row.views || 0)));
  container.innerHTML = rows.map(row => {
    const height = Math.max(2, (Number(row.views || 0) / max) * 100);
    const label = new Date(`${row.date}T00:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric" });
    return `<div class="analytics-day" title="${analyticsEscape(label)}: ${analyticsNumber(row.views)} page views">
      <div class="analytics-day-bar" style="height:${height}%"></div>
      <span class="analytics-day-label">${analyticsEscape(label)}</span>
    </div>`;
  }).join("");
}

function renderAnalyticsBars(id, rows, labelKey, valueKey) {
  const container = document.getElementById(id);
  if (!container) return;
  if (!rows.length) {
    container.innerHTML = '<div class="analytics-empty">No data recorded yet.</div>';
    return;
  }
  const max = Math.max(1, ...rows.map(row => Number(row[valueKey] || 0)));
  container.innerHTML = rows.map(row => {
    const value = Number(row[valueKey] || 0);
    const width = Math.max(2, (value / max) * 100);
    return `<div class="analytics-bar-row">
      <span class="analytics-bar-label" title="${analyticsEscape(row[labelKey])}">${analyticsEscape(row[labelKey] || "Unknown")}</span>
      <div class="analytics-track"><div class="analytics-fill" style="width:${width}%"></div></div>
      <strong class="analytics-value">${analyticsNumber(value)}</strong>
    </div>`;
  }).join("");
}

function renderTopPages(rows) {
  const container = document.getElementById("pageList");
  if (!container) return;
  if (!rows.length) {
    container.innerHTML = '<div class="analytics-empty">No page views recorded yet.</div>';
    return;
  }
  container.innerHTML = `<table class="analytics-table"><thead><tr><th>Page</th><th>Views</th></tr></thead><tbody>${
    rows.map(row => `<tr><td>${analyticsEscape(row.page)}</td><td>${analyticsNumber(row.views)}</td></tr>`).join("")
  }</tbody></table>`;
}

function renderLocations(rows) {
  const container = document.getElementById("locationList");
  if (!container) return;
  if (!rows.length) {
    container.innerHTML = '<div class="analytics-empty">Location data is not being provided by the current hosting/proxy layer yet.</div>';
    return;
  }
  container.innerHTML = `<table class="analytics-table"><thead><tr><th>Country / City</th><th>Visitors</th><th>Views</th></tr></thead><tbody>${
    rows.map(row => `<tr><td>${analyticsEscape(row.country)}${row.city && row.city !== "City unavailable" ? ` · ${analyticsEscape(row.city)}` : ""}</td><td>${analyticsNumber(row.visitors)}</td><td>${analyticsNumber(row.views)}</td></tr>`).join("")
  }</tbody></table>`;
}

function logoutAnalytics() {
  if (typeof logoutAdmin === "function") {
    logoutAdmin();
  } else {
    localStorage.removeItem("adminToken");
    window.location.href = "admin-login.html";
  }
}

document.getElementById("refreshAnalytics")?.addEventListener("click", loadTrafficAnalytics);
document.getElementById("analyticsRange")?.addEventListener("change", loadTrafficAnalytics);
initializeAnalyticsPage();
