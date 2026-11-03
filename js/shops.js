// MIEZA PRODUCT-FIRST MARKETPLACE
const API_URL = "https://mieza.onrender.com/api";
const productsGrid = document.getElementById("shopsGrid");
const vendorGrid = document.getElementById("vendorDirectoryGrid");
const searchInput = document.getElementById("shopSearchInput");
const suggestions = document.getElementById("searchSuggestions");
const categoryContainer = document.getElementById("marketplaceCategories");
const sortSelect = document.getElementById("marketplaceSort");

const CATEGORY_ORDER = [
  "All categories", "All", "Food & Beverages", "Groceries", "Health & Beauty",
  "Pharmacy & Wellness", "Fashion & Clothing", "Electronics",
  "Phones & Accessories", "Home & Living", "Baby & Kids", "Automotive",
  "Building Materials", "Sports & Outdoors", "Services", "Other"
];

let allProducts = [];
let allShops = [];
let activeCategory = "All categories";
let searchTerm = "";

const CATEGORY_ALIASES = {
  "food": "Food & Beverages", "food and beverages": "Food & Beverages",
  "food & beverage": "Food & Beverages", "beverages": "Food & Beverages",
  "grocery": "Groceries", "groceries": "Groceries",
  "beauty": "Health & Beauty", "health and beauty": "Health & Beauty",
  "pharmacy": "Pharmacy & Wellness", "wellness": "Pharmacy & Wellness",
  "clothing": "Fashion & Clothing", "fashion": "Fashion & Clothing",
  "phone accessories": "Phones & Accessories", "phones": "Phones & Accessories",
  "home": "Home & Living", "household": "Home & Living",
  "baby": "Baby & Kids", "kids": "Baby & Kids",
  "building": "Building Materials", "construction": "Building Materials",
  "sports": "Sports & Outdoors", "services": "Services"
};
function normalizeCategory(value) {
  const raw = String(value || "").trim();
  if (!raw) return "Other";
  const key = raw.toLowerCase().replace(/\s+/g, " ");
  return CATEGORY_ALIASES[key] || CATEGORY_ORDER.find(c => c.toLowerCase() === key) || raw;
}


function safeText(value) {
  return String(value ?? "").replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}

function imageUrl(value, fallback = "images/default-product.png") {
  const image = String(value || "").trim();
  if (!image) return fallback;
  if (/^https?:\/\//i.test(image) || image.startsWith("data:")) return image;
  return image.startsWith("/") ? `https://mieza.onrender.com${image}` : image;
}

function money(value) {
  return `₵${Number(value || 0).toFixed(2)}`;
}

function getShopOpenStatus(hours, now = new Date()) {
  const parseTime = value => {
    const match = String(value || "").trim().match(/^(\d{1,2}):(\d{2})$/);
    if (!match) return null;
    const hour = Number(match[1]);
    const minute = Number(match[2]);
    if (hour > 23 || minute > 59) return null;
    return hour * 60 + minute;
  };

  const open = parseTime(hours?.open);
  const close = parseTime(hours?.close);
  if (open === null || close === null) return null;

  try {
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Africa/Accra",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23"
    }).formatToParts(now);
    const hour = Number(parts.find(part => part.type === "hour")?.value);
    const minute = Number(parts.find(part => part.type === "minute")?.value);
    if (!Number.isFinite(hour) || !Number.isFinite(minute)) return null;

    const current = hour * 60 + minute;
    if (open === close) return false;
    return open < close
      ? current >= open && current < close
      : current >= open || current < close;
  } catch (_) {
    return null;
  }
}

function isShopCurrentlyOpen(hours) {
  return getShopOpenStatus(hours) === true;
}


function renderCategories() {
  if (!categoryContainer) return;
  const found = new Set(allProducts.map(p => normalizeCategory(p.category)));
  // Always show the complete category directory, even when a category currently
  // has no listed products. This lets customers discover the full marketplace.
  const categories = [...CATEGORY_ORDER];
  [...found].filter(c => !categories.includes(c)).sort().forEach(c => categories.push(c));

  categoryContainer.innerHTML = categories.map(category => {
    const count = category === "All categories"
      ? allProducts.length
      : allProducts.filter(p => (p.category || "Other") === category).length;
    return `<button type="button" class="marketplace-category ${activeCategory === category ? "active" : ""}"
      data-category="${safeText(category)}"><span>${category === "All" ? "Legacy products (All)" : safeText(category)}</span><small>${count}</small></button>`;
  }).join("");
}

function filteredProducts() {
  let list = allProducts.filter(product => {
    const category = normalizeCategory(product.category);
    if (activeCategory !== "All categories" && category !== activeCategory) return false;
    if (!searchTerm) return true;
    const haystack = [
      product.name, product.description, product.category, product.subcategory,
      product.shopName, product.shopLocation
    ].join(" ").toLowerCase();
    return haystack.includes(searchTerm);
  });

  const sort = sortSelect?.value || "recommended";
  if (sort === "price-low") list.sort((a,b) => Number(a.price)-Number(b.price));
  if (sort === "price-high") list.sort((a,b) => Number(b.price)-Number(a.price));
  if (sort === "name") list.sort((a,b) => String(a.name).localeCompare(String(b.name)));
  if (sort === "newest") list.sort((a,b) => new Date(b.createdAt || 0)-new Date(a.createdAt || 0));
  return list;
}

function renderProducts() {
  if (!productsGrid) return;
  const list = filteredProducts();
  const title = document.getElementById("marketplaceResultsTitle");
  const count = document.getElementById("marketplaceResultsCount");
  const active = document.getElementById("marketplaceActiveFilters");
  if (title) title.textContent = activeCategory === "All categories" ? "All products" : activeCategory;
  if (count) count.textContent = `${list.length} product${list.length === 1 ? "" : "s"} available`;
  if (active) active.innerHTML = [
    activeCategory !== "All categories" ? `<span>${safeText(activeCategory)} <button data-clear-category aria-label="Clear category">×</button></span>` : "",
    searchTerm ? `<span>Search: ${safeText(searchInput.value.trim())} <button data-clear-search aria-label="Clear search">×</button></span>` : ""
  ].filter(Boolean).join("");

  if (!list.length) {
    productsGrid.innerHTML = `<div class="marketplace-empty"><div>🛍️</div><h3>No products found</h3><p>Try another search or category.</p><button type="button" id="emptyClearFilters">Clear filters</button></div>`;
    return;
  }

  productsGrid.innerHTML = list.map(product => {
    const id = safeText(product._id);
    const shopId = safeText(product.shopId);
    const name = safeText(product.name || "Untitled product");
    const category = safeText(product.category || "Other");
    const shop = safeText(product.shopName || "Mieza vendor");
    const img = safeText(imageUrl(product.image || product.images?.[0] || product.thumbnail));
    const description = safeText(product.description || "");
    const shopStatus = getShopOpenStatus(product.openingHours);
    const shopOpen = shopStatus === true;
    const shopStatusLabel = shopStatus === null ? "HOURS UNAVAILABLE" : shopOpen ? "SHOP OPEN" : "SHOP CLOSED";
    return `<article class="marketplace-product-card ${shopOpen ? "" : "shop-is-closed"}">
      <a class="marketplace-product-link" href="product.html?shopId=${encodeURIComponent(shopId)}&productId=${encodeURIComponent(id)}" aria-label="View ${name}">
        <div class="marketplace-product-image"><img src="${img}" alt="${name}" loading="lazy" onerror="this.src='images/default-product.png'"><span class="marketplace-product-category">${category}</span></div>
        <div class="marketplace-product-copy">
          <h3>${name}</h3>
          <p class="marketplace-product-description">${description || "Discover more about this product."}</p>
          <strong class="marketplace-product-price">${money(product.price)}</strong>
          <span class="marketplace-seller">Sold by <b>${shop}</b></span>
          <span class="marketplace-shop-status ${shopStatus === null ? "is-unknown" : shopOpen ? "is-open" : "is-closed"}">${shopStatusLabel}</span>
        </div>
      </a>
      <div class="marketplace-product-actions">
        <button type="button" class="marketplace-add-btn" data-product-id="${id}" data-shop-id="${shopId}">Add to Cart</button>
        <a href="shop.html?id=${encodeURIComponent(shopId)}">Visit shop</a>
      </div>
    </article>`;
  }).join("");
}

function renderVendors() {
  if (!vendorGrid) return;
  if (!allShops.length) {
    vendorGrid.innerHTML = "<p>Vendor storefronts will appear here.</p>";
    return;
  }
  vendorGrid.innerHTML = allShops.map(shop => {
    const count = (shop.products || []).length;
    const thumb = safeText(imageUrl(shop.thumbnail, "images/default-shop.png"));
    return `<a class="vendor-directory-card" href="shop.html?id=${encodeURIComponent(shop._id)}">
      <img src="${thumb}" alt="${safeText(shop.shopName)}" loading="lazy" onerror="this.src='images/default-shop.png'">
      <span><strong>${safeText(shop.shopName)}</strong><small>${safeText(shop.shopLocation || "Mieza vendor")} · ${count} product${count === 1 ? "" : "s"}</small></span>
      <b aria-hidden="true">→</b>
    </a>`;
  }).join("");
}

function renderSuggestions() {
  if (!suggestions) return;
  const q = searchTerm;
  if (q.length < 2) { suggestions.hidden = true; suggestions.innerHTML = ""; return; }
  const matches = allProducts.filter(p =>
    [p.name,p.description,p.category,p.subcategory,p.shopName].join(" ").toLowerCase().includes(q)
  ).slice(0,6);
  suggestions.innerHTML = matches.length ? matches.map(p => `
    <a class="search-suggestion-item" href="product.html?shopId=${encodeURIComponent(p.shopId || "")}&productId=${encodeURIComponent(p._id)}">
      <img src="${safeText(imageUrl(p.image || p.images?.[0]))}" alt="">
      <span class="search-suggestion-copy"><strong>${safeText(p.name)}</strong><small>${safeText(p.shopName)} · ${money(p.price)}</small></span>
      <span>›</span>
    </a>`).join("") : `<div class="search-no-results">No matching products found.</div>`;
  suggestions.hidden = false;
}

async function loadMarketplace() {
  try {
    const [productResponse, shopResponse] = await Promise.all([
      fetch(`${API_URL}/marketplace/products`),
      fetch(`${API_URL}/shops`)
    ]);
    if (!productResponse.ok) throw new Error("Could not load products");
    allProducts = (await productResponse.json()).map(product => ({ ...product, category: normalizeCategory(product.category) }));
    allShops = shopResponse.ok ? await shopResponse.json() : [];
    renderCategories();
    renderProducts();
    renderVendors();
    updateMarketplaceCartCount();
  } catch (error) {
    console.error("Marketplace loading error:", error);
    if (productsGrid) productsGrid.innerHTML = `<div class="marketplace-empty"><h3>Marketplace temporarily unavailable</h3><p>Please refresh the page in a moment.</p></div>`;
  }
}

function updateMarketplaceCartCount() {
  try {
    const cart = JSON.parse(localStorage.getItem("miezaCart") || "[]");
    const count = cart.reduce((sum, item) => sum + Number(item.qty || 0), 0);
    const el = document.getElementById("marketplaceCartCount");
    if (el) el.textContent = count;
  } catch (_) {}
}

categoryContainer?.addEventListener("click", event => {
  const button = event.target.closest("[data-category]");
  if (!button) return;
  activeCategory = button.dataset.category;
  renderCategories();
  renderProducts();
});
searchInput?.addEventListener("input", () => {
  searchTerm = searchInput.value.trim().toLowerCase();
  renderProducts();
  renderSuggestions();
});
sortSelect?.addEventListener("change", renderProducts);
document.getElementById("clearMarketplaceFilters")?.addEventListener("click", clearFilters);
productsGrid?.addEventListener("click", event => {
  if (event.target.closest("#emptyClearFilters")) return clearFilters();
  const addButton = event.target.closest(".marketplace-add-btn");
  if (!addButton) return;
  const product = allProducts.find(p => String(p._id) === addButton.dataset.productId);
  if (!product || typeof addToCart !== "function") return;
  addToCart(product.shopId, product, addButton);
  updateMarketplaceCartCount();
});
document.getElementById("marketplaceActiveFilters")?.addEventListener("click", event => {
  if (event.target.closest("[data-clear-category]")) activeCategory = "All categories";
  if (event.target.closest("[data-clear-search]")) {
    searchTerm = "";
    if (searchInput) searchInput.value = "";
  }
  renderCategories(); renderProducts(); renderSuggestions();
});
function clearFilters() {
  activeCategory = "All categories"; searchTerm = "";
  if (searchInput) searchInput.value = "";
  if (sortSelect) sortSelect.value = "recommended";
  renderCategories(); renderProducts(); renderSuggestions();
}
loadMarketplace();
