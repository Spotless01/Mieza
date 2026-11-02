(() => {
  "use strict";

  // Analytics is opt-in. No visitor identifier is created until consent is granted.
  const CONSENT_KEY = "mieza_analytics_consent";
  const VISITOR_KEY = "mieza_analytics_visitor";
  const SESSION_KEY = "mieza_analytics_session";
  const API_URL = "https://mieza.onrender.com/api/analytics/track";

  function makeId() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      return window.crypto.randomUUID();
    }
    return "mz-" + Date.now().toString(36) + "-" +
      Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
  }

  function getOrCreate(storage, key) {
    let value = storage.getItem(key);
    if (!value) {
      value = makeId();
      storage.setItem(key, value);
    }
    return value;
  }

  function sourceFromUrl() {
    try {
      const params = new URLSearchParams(window.location.search);
      const source = (params.get("utm_source") || "").toLowerCase();
      const known = ["google", "facebook", "instagram", "tiktok", "whatsapp", "youtube"];
      return known.includes(source) ? source : "";
    } catch (_) {
      return "";
    }
  }

  function trackPageView() {
    if (localStorage.getItem(CONSENT_KEY) !== "accepted") return;

    const payload = {
      visitorId: getOrCreate(localStorage, VISITOR_KEY),
      sessionId: getOrCreate(sessionStorage, SESSION_KEY),
      page: window.location.pathname.slice(0, 200) || "/",
      referrer: document.referrer || "",
      source: sourceFromUrl()
    };

    const body = JSON.stringify(payload);
    try {
      if (navigator.sendBeacon) {
        const blob = new Blob([body], { type: "application/json" });
        if (navigator.sendBeacon(API_URL, blob)) return;
      }
    } catch (_) {}

    fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
      credentials: "omit"
    }).catch(() => {});
  }

  function showConsentNotice() {
    if (localStorage.getItem(CONSENT_KEY)) {
      if (localStorage.getItem(CONSENT_KEY) === "accepted") trackPageView();
      return;
    }

    const notice = document.createElement("aside");
    notice.id = "miezaAnalyticsConsent";
    notice.setAttribute("role", "dialog");
    notice.setAttribute("aria-label", "Anonymous analytics preference");
    notice.innerHTML = `
      <div class="mieza-analytics-consent-copy">
        <strong>Help us improve Mieza</strong>
        <span>Allow anonymous usage statistics such as pages visited and approximate location (when provided by our hosting service). We do not store your raw IP address or collect your exact GPS location.</span>
      </div>
      <div class="mieza-analytics-consent-actions">
        <button type="button" data-choice="declined">No thanks</button>
        <button type="button" data-choice="accepted">Allow analytics</button>
      </div>
    `;
    document.body.appendChild(notice);

    notice.addEventListener("click", event => {
      const button = event.target.closest("button[data-choice]");
      if (!button) return;
      localStorage.setItem(CONSENT_KEY, button.dataset.choice);
      notice.remove();
      if (button.dataset.choice === "accepted") trackPageView();
    });
  }

  function addStyles() {
    if (document.getElementById("miezaAnalyticsConsentStyles")) return;
    const style = document.createElement("style");
    style.id = "miezaAnalyticsConsentStyles";
    style.textContent = `
      #miezaAnalyticsConsent{position:fixed;z-index:99999;left:16px;right:16px;bottom:16px;max-width:760px;margin:auto;background:#101827;color:#fff;border:1px solid rgba(255,255,255,.18);border-radius:14px;padding:16px;box-shadow:0 12px 36px rgba(0,0,0,.24);display:flex;gap:18px;align-items:center;justify-content:space-between;font:14px/1.5 Arial,sans-serif}
      .mieza-analytics-consent-copy{display:grid;gap:4px}.mieza-analytics-consent-copy strong{font-size:15px}.mieza-analytics-consent-copy span{color:#d1d5db}
      .mieza-analytics-consent-actions{display:flex;gap:8px;flex-shrink:0}.mieza-analytics-consent-actions button{border:1px solid #64748b;border-radius:8px;padding:9px 12px;background:transparent;color:#fff;cursor:pointer;font-weight:600}.mieza-analytics-consent-actions button[data-choice=accepted]{background:#2563eb;border-color:#2563eb}
      @media(max-width:620px){#miezaAnalyticsConsent{align-items:stretch;flex-direction:column}.mieza-analytics-consent-actions{justify-content:flex-end;flex-wrap:wrap}}
    `;
    document.head.appendChild(style);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      addStyles();
      showConsentNotice();
    }, { once: true });
  } else {
    addStyles();
    showConsentNotice();
  }
})();
