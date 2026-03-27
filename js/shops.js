// ===============================
// MIEZA — SHOPS LOGIC (PRO VERSION)
// ===============================

// DOM
const shopsGrid = document.getElementById("shopsGrid");
const shopContainer = document.getElementById("shop-container");
const shopSearchInput = document.getElementById("shopSearchInput");

// ===============================
// STORAGE KEYS
// ===============================
const FEEDBACK_KEY = "shopFeedbacks";

// ===============================
// INIT
// ===============================
init();

function init() {
  loadSavedFeedback();
  renderShopCards(shops);
  setupSearch();
  startLiveStatusUpdates();
}

// ===============================
// LOAD SAVED FEEDBACK
// ===============================
function loadSavedFeedback() {
  const saved = JSON.parse(localStorage.getItem(FEEDBACK_KEY));

  if (!saved) return;

  saved.forEach(savedShop => {
    const shop = shops.find(s => s.id === savedShop.id);
    if (shop) shop.feedback = savedShop.feedback || [];
  });
}

// ===============================
// TIME HELPERS
// ===============================
function isShopOpen(openTime, closeTime) {
  const now = new Date();

  const [oH, oM] = openTime.split(":").map(Number);
  const [cH, cM] = closeTime.split(":").map(Number);

  const open = new Date();
  open.setHours(oH, oM, 0, 0);

  const close = new Date();
  close.setHours(cH, cM, 0, 0);

  if (close <= open) close.setDate(close.getDate() + 1);

  return now >= open && now <= close;
}

// ===============================
// RENDER SHOPS
// ===============================
function renderShopCards(list) {
  shopsGrid.innerHTML = "";

  if (!list.length) {
    shopsGrid.innerHTML = `
      <div class="no-results">
        <h3>No shops found</h3>
        <p>Try searching something else</p>
      </div>
    `;
    return;
  }

  list.forEach(shop => {
    const openNow = isShopOpen(
      shop.openingHours.open,
      shop.openingHours.close
    );

    const card = document.createElement("div");
    card.className = `shop-card ${openNow ? "" : "closed"}`;

    card.innerHTML = `
      <div class="shop-image">
        <img src="${shop.thumbnail}" alt="${shop.name}">
        <span class="status-badge ${openNow ? "open" : "closed"}">
          ${openNow ? "Open" : "Closed"}
        </span>
      </div>

      <div class="shop-info">
        <h3>${shop.name}</h3>
        <p class="shop-hours">
          ${shop.openingHours.open} – ${shop.openingHours.close}
        </p>
      </div>
    `;

    if (openNow) {
      card.addEventListener("click", () => loadShop(shop));
    }

    shopsGrid.appendChild(card);
  });
}

// ===============================
// LOAD SHOP (PRODUCT VIEW)
// ===============================
function loadShop(shop) {
  shopContainer.innerHTML = `
    <section class="shop-products">
      <div class="shop-header">
        <h2>${shop.name}</h2>
        <span class="shop-hours-inline">
          ${shop.openingHours.open} – ${shop.openingHours.close}
        </span>
      </div>

      <div class="products-grid">
        ${shop.products.map(product => `
          <div class="product-card">
            <img src="${product.image}" alt="${product.name}">
            <h4>${product.name}</h4>
            <p class="price">₵${product.price}</p>

            <button 
              class="add-to-cart-btn"
              data-shop="${shop.id}"
              data-product='${JSON.stringify(product)}'
            >
              Add to Cart
            </button>
          </div>
        `).join("")}
      </div>

      ${renderFeedbackSection(shop)}
    </section>
  `;

  loadFeedback(shop);
  shopContainer.scrollIntoView({ behavior: "smooth" });
}

// ===============================
// ADD TO CART
// ===============================
document.addEventListener("click", e => {
  if (!e.target.classList.contains("add-to-cart-btn")) return;

  const btn = e.target;
  const product = JSON.parse(btn.dataset.product);
  const shopId = btn.dataset.shop;

  addToCart(shopId, product, btn);
});

// ===============================
// SEARCH
// ===============================
function setupSearch() {
  shopSearchInput.addEventListener("input", () => {
    const q = shopSearchInput.value.toLowerCase().trim();

    const filtered = shops.filter(shop =>
      shop.name.toLowerCase().includes(q)
    );

    renderShopCards(filtered);
  });
}

// ===============================
// LIVE STATUS REFRESH
// ===============================
function startLiveStatusUpdates() {
  setInterval(() => {
    shopSearchInput.dispatchEvent(new Event("input"));
  }, 60000);
}

// ===============================
// FEEDBACK SECTION TEMPLATE
// ===============================
function renderFeedbackSection(shop) {
  return `
    <div class="shop-feedback" data-shop="${shop.id}">
      <h3>Customer Reviews</h3>

      <form class="feedback-form" data-shop="${shop.id}">
        <select name="rating" required>
          <option value="">Rating</option>
          <option value="5">⭐⭐⭐⭐⭐</option>
          <option value="4">⭐⭐⭐⭐</option>
          <option value="3">⭐⭐⭐</option>
          <option value="2">⭐⭐</option>
          <option value="1">⭐</option>
        </select>

        <textarea name="comment" placeholder="Write your experience..." required></textarea>
        <button type="submit">Submit</button>
      </form>

      <div class="feedback-list"></div>
    </div>
  `;
}

// ===============================
// LOAD FEEDBACK
// ===============================
function loadFeedback(shop) {
  const container = document.querySelector(
    `.shop-feedback[data-shop="${shop.id}"] .feedback-list`
  );

  container.innerHTML = "";

  if (!shop.feedback || shop.feedback.length === 0) {
    container.innerHTML = `<p>No reviews yet.</p>`;
    return;
  }

  const avg =
    shop.feedback.reduce((sum, f) => sum + f.rating, 0) /
    shop.feedback.length;

  container.innerHTML += `<p class="avg-rating">⭐ ${avg.toFixed(1)}</p>`;

  shop.feedback.forEach(f => {
    container.innerHTML += `
      <div class="feedback-item">
        <strong>⭐ ${f.rating}</strong>
        <p>${f.comment}</p>
      </div>
    `;
  });
}

// ===============================
// SUBMIT FEEDBACK
// ===============================
document.addEventListener("submit", e => {
  if (!e.target.classList.contains("feedback-form")) return;
  e.preventDefault();

  const form = e.target;
  const shopId = form.dataset.shop;
  const shop = shops.find(s => s.id === shopId);

  const rating = Number(form.rating.value);
  const comment = form.comment.value.trim();

  if (!shop.feedback) shop.feedback = [];

  shop.feedback.push({ rating, comment });

  // Save
  const data = shops.map(s => ({
    id: s.id,
    feedback: s.feedback || []
  }));

  localStorage.setItem(FEEDBACK_KEY, JSON.stringify(data));

  loadFeedback(shop);
  form.reset();

  showToast("Feedback submitted 🎉");
});

// ===============================
// TOAST (NEW UX FEATURE)
// ===============================
function showToast(message) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;

  document.body.appendChild(toast);

  setTimeout(() => toast.classList.add("show"), 100);
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}