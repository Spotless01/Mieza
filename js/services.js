(() => {
  const API = "https://mieza.onrender.com/api/services";
  const grid = document.getElementById("miezaServicesGrid");
  if (!grid) return;
  const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const makeWhatsApp = service => {
    const message = `Hello Mieza, I would like to enquire about this service:\\nService: ${service.title}\\nCategory: ${service.category}\\nLocation: ${service.location || "Please advise"}\\nPlease explain availability, the price and payment process.`;
    return `https://wa.me/233551836194?text=${encodeURIComponent(message)}`;
  };
  async function load() {
    try {
      const response = await fetch(API);
      if (!response.ok) throw new Error("Services could not be loaded");
      const services = await response.json();
      if (!services.length) {
        grid.innerHTML = `<div class="mieza-services-empty"><h3>New services are coming</h3><p>Contact Mieza and tell us which service you need. We will help you with the next steps.</p><a href="https://wa.me/233551836194?text=Hello%20Mieza%2C%20I%20am%20looking%20for%20a%20local%20service." target="_blank" rel="noopener">Ask Mieza on WhatsApp</a></div>`;
        return;
      }
      grid.innerHTML = services.map(service => `
        <article class="mieza-service-card">
          ${service.image ? `<img src="${escapeHtml(service.image)}" alt="${escapeHtml(service.title)}" loading="lazy">` : `<div class="mieza-service-placeholder" aria-hidden="true">✦</div>`}
          <div class="mieza-service-card-copy">
            <span class="mieza-service-category">${escapeHtml(service.category)}</span>
            <h3>${escapeHtml(service.title)}</h3>
            <p>${escapeHtml(service.description)}</p>
            <small>${escapeHtml(service.location || "Location confirmed by Mieza")}</small>
            <a href="${makeWhatsApp(service)}" target="_blank" rel="noopener">Enquire / Book this service</a>
          </div>
        </article>`).join("");
    } catch (error) {
      console.error("Mieza services error:", error);
      grid.innerHTML = `<div class="mieza-services-empty"><h3>Services are temporarily unavailable</h3><p>Please contact Mieza directly for assistance.</p><a href="https://wa.me/233551836194" target="_blank" rel="noopener">Chat with Mieza</a></div>`;
    }
  }
  load();
})();
