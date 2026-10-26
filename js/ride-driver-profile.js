(() => {
  "use strict";
  const API_URL = (["localhost", "127.0.0.1"].includes(window.location.hostname))
    ? "http://localhost:5001/api"
    : "https://mieza.onrender.com/api";
  const token = localStorage.getItem("rideDriverToken");
  const $ = (s) => document.querySelector(s);
  const form = $("#profileForm");
  const message = $("#profileMessage");
  const saveBtn = $("#saveBtn");
  if (!token) { window.location.href = "ride-login.html"; return; }
  function showMessage(text, type) { message.textContent = text; message.className = `profile-message ${type}`; }
  async function api(path, options = {}) {
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: { Authorization: `Bearer ${token}`, ...(options.body ? { "Content-Type": "application/json" } : {}), ...(options.headers || {}) }
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      if (response.status === 401) { localStorage.removeItem("rideDriverToken"); localStorage.removeItem("rideDriver"); window.location.href = "ride-login.html"; }
      throw new Error(data.message || `Request failed (${response.status})`);
    }
    return data;
  }
  function fill(driver) {
    for (const name of ["fullName", "email", "phone", "vehicleBrand", "vehicleModel", "vehicleColor", "plateNumber"]) {
      const input = form.elements.namedItem(name);
      if (input) input.value = driver[name] || "";
    }
    $("#vehicleType").value = driver.vehicleType || "";
    localStorage.setItem("rideDriver", JSON.stringify({ ...(JSON.parse(localStorage.getItem("rideDriver") || "{}")), ...driver }));
  }
  async function load() {
    try { const data = await api("/ride-drivers/me"); fill(data.driver || data); }
    catch (error) { showMessage(error.message, "error"); }
  }
  form.addEventListener("submit", async (event) => {
    event.preventDefault(); saveBtn.disabled = true; saveBtn.textContent = "Saving…";
    const body = Object.fromEntries(["fullName", "email", "phone", "vehicleBrand", "vehicleModel", "vehicleColor", "plateNumber"].map(name => [name, form.elements.namedItem(name).value.trim()]));
    try { const data = await api("/ride-drivers/me", { method: "PUT", body: JSON.stringify(body) }); fill(data.driver || data); showMessage(data.message || "Profile updated successfully.", "success"); }
    catch (error) { showMessage(error.message, "error"); }
    finally { saveBtn.disabled = false; saveBtn.textContent = "Save changes"; }
  });
  $("#logoutBtn").addEventListener("click", () => { localStorage.removeItem("rideDriverToken"); localStorage.removeItem("rideDriver"); window.location.href = "ride-login.html"; });
  load();
})();