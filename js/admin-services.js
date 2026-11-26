(() => {
  const API = "https://mieza.onrender.com/api/services";
  const token = localStorage.getItem("adminToken");
  let role = "";
  let canManage = false;
  let isFounder = false;
  const list = document.getElementById("adminServicesList");
  const form = document.getElementById("serviceEditorForm");
  if (!list || !form) return;

  const $ = id => document.getElementById(id);
  const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const authHeaders = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${token}` });
  const feedback = (message, isError = false) => {
    $("serviceFormFeedback").textContent = message;
    $("serviceFormFeedback").style.color = isError ? "#b91c1c" : "#166534";
  };
  const resetForm = () => {
    form.reset();
    $("serviceEditId").value = "";
    $("serviceFormTitle").textContent = "Publish a new service";
    $("saveServiceButton").textContent = "Publish service";
    $("cancelServiceEditButton").hidden = true;
    feedback("");
  };

  async function request(url, options = {}) {
    const response = await fetch(url, { ...options, headers: { ...authHeaders(), ...(options.headers || {}) } });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.message || `Request failed (${response.status})`);
    return data;
  }

  async function loadServices() {
    list.innerHTML = "<p>Loading service listings…</p>";
    try {
      const response = await fetch(API, { cache: "no-store" });
      if (!response.ok) throw new Error("Unable to load service listings.");
      const services = await response.json();
      $("adminServicesCount").textContent = `${services.length} active listing${services.length === 1 ? "" : "s"}`;
      if (!services.length) {
        list.innerHTML = "<p>No service listings yet. Use the form above to publish the first one.</p>";
        return;
      }
      list.innerHTML = services.map(service => renderService(service, true)).join("");
      // Fetch inactive entries for administrators through the authenticated endpoint below.
      try {
        const allResponse = await request(`${API}/admin/all`);
        const allServices = Array.isArray(allResponse.services) ? allResponse.services : services;
        $("adminServicesCount").textContent = `${allServices.filter(x => x.isActive).length} active · ${allServices.length} total`;
        list.innerHTML = allServices.map(service => renderService(service, false)).join("");
      } catch (error) {
        // Existing deployments without the all-list endpoint still show public active listings.
        console.info("Inactive service list not available:", error.message);
      }
    } catch (error) {
      list.innerHTML = `<p>${escapeHtml(error.message)}</p>`;
      $("adminServicesCount").textContent = "Unavailable";
    }
  }

  function renderService(service) {
    const active = service.isActive !== false;
    return `<article class="admin-service-item" data-service-id="${escapeHtml(service._id)}">
      ${service.image ? `<img src="${escapeHtml(service.image)}" alt="${escapeHtml(service.title)}">` : ""}
      <span class="admin-service-status ${active ? "" : "inactive"}">${active ? "Active · Public" : "Inactive · Hidden"}</span>
      <h4>${escapeHtml(service.title)}</h4>
      <strong>${escapeHtml(service.category)}</strong>
      <p>${escapeHtml(service.description)}</p>
      <small>${escapeHtml(service.providerName || "Mieza service partner")} · ${escapeHtml(service.location || "Location not specified")}</small>
      <div class="admin-service-actions">
        <button type="button" data-action="edit">Edit</button>
        <button type="button" data-action="toggle">${active ? "Deactivate" : "Reactivate"}</button>
        ${isFounder ? '<button type="button" class="delete-service" data-action="delete">Delete</button>' : ""}
      </div>
    </article>`;
  }

  list.addEventListener("click", async event => {
    const button = event.target.closest("button[data-action]");
    if (!button) return;
    const card = button.closest("[data-service-id]");
    const serviceId = card?.dataset.serviceId;
    if (!serviceId) return;
    const action = button.dataset.action;
    try {
      const all = await request(`${API}/admin/all`);
      const service = (all.services || []).find(item => item._id === serviceId);
      if (!service) throw new Error("Service listing not found.");
      if (action === "edit") {
        $("serviceEditId").value = service._id;
        $("serviceTitle").value = service.title || "";
        $("serviceCategory").value = service.category || "";
        $("serviceProvider").value = service.providerName || "";
        $("serviceLocation").value = service.location || "";
        $("serviceImage").value = service.image || "";
        $("serviceDescription").value = service.description || "";
        $("serviceFormTitle").textContent = "Edit service listing";
        $("saveServiceButton").textContent = "Save changes";
        $("cancelServiceEditButton").hidden = false;
        $("serviceManagementSection").scrollIntoView({ behavior: "smooth" });
        return;
      }
      if (action === "toggle") {
        await request(`${API}/${serviceId}`, { method: "PUT", body: JSON.stringify({ isActive: !service.isActive }) });
        feedback(service.isActive ? "Service deactivated." : "Service reactivated.");
      } else if (action === "delete") {
        if (!isFounder) throw new Error("Only the founder can permanently delete service listings.");
        if (!window.confirm(`Permanently delete "${service.title}"? This cannot be undone.`)) return;
        await request(`${API}/${serviceId}`, { method: "DELETE" });
        feedback("Service permanently deleted.");
      }
      await loadServices();
    } catch (error) {
      feedback(error.message, true);
    }
  });

  form.addEventListener("submit", async event => {
    event.preventDefault();
    if (!canManage) return feedback("You do not have permission to manage services.", true);
    const id = $("serviceEditId").value;
    const payload = {
      title: $("serviceTitle").value.trim(),
      category: $("serviceCategory").value.trim(),
      description: $("serviceDescription").value.trim(),
      providerName: $("serviceProvider").value.trim(),
      location: $("serviceLocation").value.trim(),
      image: $("serviceImage").value.trim()
    };
    if (!payload.title || !payload.category || !payload.description) return feedback("Complete all required fields.", true);
    $("saveServiceButton").disabled = true;
    try {
      await request(id ? `${API}/${id}` : API, { method: id ? "PUT" : "POST", body: JSON.stringify(payload) });
      resetForm();
      feedback(id ? "Service listing updated." : "Service published successfully.");
      await loadServices();
    } catch (error) {
      feedback(error.message, true);
    } finally {
      $("saveServiceButton").disabled = false;
    }
  });

  $("cancelServiceEditButton").addEventListener("click", resetForm);
  $("refreshServicesButton").addEventListener("click", loadServices);

  (async () => {
    const admin = await verifyAdminAccess(["owner", "cofounder", "staff"]);
    if (!admin) return;
    role = admin.role;
    canManage = ["owner", "cofounder", "staff"].includes(role);
    isFounder = role === "owner";
    if (!canManage) {
      $("serviceManagementSection").hidden = true;
      return;
    }
    loadServices();
  })();
})();
