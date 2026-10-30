// ===============================
// MIEZA — HOMEPAGE SHOPS + PRODUCT SEARCH
// ===============================

const API_URL = "https://mieza.onrender.com/api";

const shopsGrid = document.getElementById("shopsGrid");
const shopSearchInput = document.getElementById("shopSearchInput");
const searchSuggestions = document.getElementById("searchSuggestions");

let shops = [];
let marketplaceProducts = [];

// Escape text before placing database values into HTML.
function escapeSearchHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[char]));
}

// ===============================
// CHECK SHOP OPEN / CLOSED
// ===============================
function isShopOpen(openTime, closeTime) {
  const now = new Date();
  const [openHour, openMinute] = openTime.split(":").map(Number);
  const [closeHour, closeMinute] = closeTime.split(":").map(Number);
  const open = new Date();
  open.setHours(openHour, openMinute, 0, 0);
  const close = new Date();
  close.setHours(closeHour, closeMinute, 0, 0);

  if (close <= open) {
    if (now < open) open.setDate(open.getDate() - 1);
    else close.setDate(close.getDate() + 1);
  }
  return now >= open && now <= close;
}

// ===============================
// LOAD SHOP RATINGS
// ===============================
async function getShopRating(shopId) {
  try {
    const res = await fetch(`${API_URL}/reviews/shop-rating/${shopId}`);
    if (!res.ok) return { average: 0, total: 0 };
    return await res.json();
  } catch (err) {
    return { average: 0, total: 0 };
  }
}

// ===============================
// LOAD SHOPS AND PRODUCTS
// ===============================
async function fetchShops() {
  try {
    const res = await fetch(`${API_URL}/shops`);
    if (!res.ok) throw new Error("Failed to fetch shops");
    shops = await res.json();

    await Promise.all(shops.map(async shop => {
      shop.ratingSummary = await getShopRating(shop._id);
    }));

    renderShopCards(shops);
  } catch (err) {
    console.error("Shop loading error:", err);
    shopsGrid.innerHTML = "<h2>Failed to load shops</h2>";
  }
}

async function fetchMarketplaceProducts() {
  try {
    const res = await fetch(`${API_URL}/marketplace/products`);
    if (!res.ok) throw new Error("Failed to fetch marketplace products");
    marketplaceProducts = await res.json();
    if (shopSearchInput && shopSearchInput.value.trim()) {
      renderSearchSuggestions(shopSearchInput.value);
    }
  } catch (err) {
    console.error("Product search loading error:", err);
    marketplaceProducts = [];
  }
}

// ===============================
// RENDER SHOPS
// ===============================
function renderShopCards(list) {
  shopsGrid.innerHTML = "";

  if (!list.length) {
    shopsGrid.innerHTML = "<h2>No shops available</h2>";
    return;
  }

  list.forEach(shop => {
    const openTime = shop.openingHours?.open || "08:00";
    const closeTime = shop.openingHours?.close || "22:00";
    const shopOpen = isShopOpen(openTime, closeTime);
    const rating = shop.ratingSummary?.average || 0;
    const totalReviews = shop.ratingSummary?.total || 0;
    const ratingText = totalReviews > 0
      ? `⭐ ${rating} · ${totalReviews} review${totalReviews > 1 ? "s" : ""}`
      : "⭐ New shop";

    const card = document.createElement("div");
    card.className = shopOpen ? "shop-card" : "shop-card shop-closed";
    card.innerHTML = `
      <div class="shop-image">
        <img src="${escapeSearchHTML(shop.thumbnail || "images/default-shop.png")}" alt="${escapeSearchHTML(shop.shopName)}">
        <span class="${shopOpen ? "open-badge" : "closed-badge"}">${shopOpen ? "Open" : "Closed"}</span>
      </div>
      <div class="shop-info">
        <h3>${escapeSearchHTML(shop.shopName)}</h3>
        <p class="shop-rating">${escapeSearchHTML(ratingText)}</p>
        <p>${escapeSearchHTML(openTime)} - ${escapeSearchHTML(closeTime)}</p>
        <button class="shop-action-btn" ${shopOpen ? "" : "disabled"}>${shopOpen ? "Shop Now" : "Closed"}</button>
      </div>`;

    card.addEventListener("click", () => {
      if (shopOpen) {
        window.location.href = `shop.html?id=${encodeURIComponent(shop._id)}`;
      } else {
        alert(`${shop.shopName} is currently closed. Please come back during opening hours.`);
      }
    });
    shopsGrid.appendChild(card);
  });
}

// ===============================
// SEARCH MATCHING AND SUGGESTIONS
// ===============================
function getMatchScore(text, query) {
  const value = String(text || "").toLowerCase().trim();
  if (!value) return 0;
  if (value === query) return 100;
  if (value.startsWith(query)) return 80;
  if (value.includes(query)) return 60;

  const words = query.split(/\s+/).filter(Boolean);
  const matched = words.filter(word => value.includes(word)).length;
  return words.length ? Math.round((matched / words.length) * 40) : 0;
}

function renderSearchSuggestions(rawQuery) {
  if (!searchSuggestions) return;
  const query = String(rawQuery || "").toLowerCase().trim();

  if (query.length < 2) {
    searchSuggestions.hidden = true;
    searchSuggestions.innerHTML = "";
    return;
  }

  const shopMatches = shops
    .map(shop => ({ shop, score: getMatchScore(shop.shopName, query) }))
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);

  const productMatches = marketplaceProducts
    .map(product => ({
      product,
      score: Math.max(
        getMatchScore(product.name, query),
        getMatchScore(product.description, query) * 0.65
      )
    }))
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);

  const sections = [];

  if (productMatches.length) {
    sections.push(`
      <div class="search-suggestion-heading">Products</div>
      ${productMatches.map(({ product }) => `
        <button type="button" class="search-suggestion-item product-search-result"
          data-shop-id="${escapeSearchHTML(product.shopId)}"
          data-product-id="${escapeSearchHTML(product._id)}">
          <img src="${escapeSearchHTML(product.image || product.thumbnail || "images/default-product.png")}"
            alt="" onerror="this.src='images/default-product.png'">
          <span class="search-suggestion-copy">
            <strong>${escapeSearchHTML(product.name)}</strong>
            <small>${escapeSearchHTML(product.shopName || "Mieza shop")} · ₵${Number(product.price || 0).toFixed(2)}</small>
          </span>
          <span class="search-result-arrow">›</span>
        </button>
      `).join("")}
    `);
  }

  if (shopMatches.length) {
    sections.push(`
      <div class="search-suggestion-heading">Shops</div>
      ${shopMatches.map(({ shop }) => `
        <button type="button" class="search-suggestion-item shop-search-result"
          data-shop-id="${escapeSearchHTML(shop._id)}">
          <img src="${escapeSearchHTML(shop.thumbnail || "images/default-shop.png")}" alt="">
          <span class="search-suggestion-copy">
            <strong>${escapeSearchHTML(shop.shopName)}</strong>
            <small>Visit shop</small>
          </span>
          <span class="search-result-arrow">›</span>
        </button>
      `).join("")}
    `);
  }

  if (!sections.length) {
    searchSuggestions.innerHTML = `<div class="search-no-results">No matching shops or products found.</div>`;
  } else {
    searchSuggestions.innerHTML = sections.join("");
  }

  searchSuggestions.hidden = false;
}

function setupSearch() {
  if (!shopSearchInput) return;

  shopSearchInput.addEventListener("input", () => {
    const query = shopSearchInput.value.trim().toLowerCase();
    renderSearchSuggestions(query);

    // Keep the existing shop grid filtering behaviour.
    const filtered = query
      ? shops.filter(shop => String(shop.shopName || "").toLowerCase().includes(query))
      : shops;
    renderShopCards(filtered);
  });

  shopSearchInput.addEventListener("keydown", event => {
    if (event.key === "Escape" && searchSuggestions) {
      searchSuggestions.hidden = true;
    }
  });

  searchSuggestions?.addEventListener("click", event => {
    const productResult = event.target.closest(".product-search-result");
    const shopResult = event.target.closest(".shop-search-result");

    if (productResult) {
      const shopId = productResult.dataset.shopId;
      const productId = productResult.dataset.productId;
      if (shopId && productId) {
        window.location.href = `product.html?shopId=${encodeURIComponent(shopId)}&productId=${encodeURIComponent(productId)}`;
      }
      return;
    }

    if (shopResult?.dataset.shopId) {
      window.location.href = `shop.html?id=${encodeURIComponent(shopResult.dataset.shopId)}`;
    }
  });

  document.addEventListener("click", event => {
    if (!event.target.closest(".shop-search")) {
      if (searchSuggestions) searchSuggestions.hidden = true;
    }
  });

  shopSearchInput.addEventListener("focus", () => {
    if (shopSearchInput.value.trim().length >= 2) {
      renderSearchSuggestions(shopSearchInput.value);
    }
  });
}

// Refresh open/closed labels every minute.
setInterval(() => {
  if (shopSearchInput?.value.trim()) return;
  renderShopCards(shops);
}, 60000);

// INIT
setupSearch();
fetchShops();
fetchMarketplaceProducts();
