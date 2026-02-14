// ===============================
// MIEZA — SHOPS LOGIC (SAFE FEEDBACK STORAGE)
// ===============================

// DOM Elements
const shopsGrid = document.getElementById("shopsGrid");
const shopContainer = document.getElementById("shop-container");
const shopSearchInput = document.getElementById("shopSearchInput");

// ===============================
// LOAD SAVED FEEDBACK (ONCE)
// ===============================
const savedFeedback = JSON.parse(localStorage.getItem("shopFeedbacks"));
if (savedFeedback && Array.isArray(savedFeedback)) {
  savedFeedback.forEach(savedShop => {
    const shop = shops.find(s => s.id === savedShop.id);
    if (shop && savedShop.feedback) {
      shop.feedback = savedShop.feedback;
    }
  });
}

// ===============================
// TIME / OPEN STATUS
// ===============================
function isShopOpen(openTime, closeTime) {
  const now = new Date();
  const [openH, openM] = openTime.split(":").map(Number);
  const [closeH, closeM] = closeTime.split(":").map(Number);

  const open = new Date();
  open.setHours(openH, openM, 0, 0);

  const close = new Date();
  close.setHours(closeH, closeM, 0, 0);

  // Handle next-day closing
  if (close <= open) close.setDate(close.getDate() + 1);

  return now >= open && now <= close;
}

// ===============================
// RENDER SHOP CARDS
// ===============================
function renderShopCards(shopList) {
  shopsGrid.innerHTML = "";

  if (!shopList.length) {
    shopsGrid.innerHTML = `<p class="no-results">No shops found</p>`;
    return;
  }

  shopList.forEach(shop => {
    const openNow = isShopOpen(
      shop.openingHours.open,
      shop.openingHours.close
    );

    const card = document.createElement("div");
    card.className = "shop-card";
    if (!openNow) card.classList.add("closed-shop");

    card.innerHTML = `
      <img src="${shop.thumbnail}" alt="${shop.name}">
      <h3>${shop.name}</h3>
      <p class="shop-status ${openNow ? "open" : "closed"}">
        ${openNow ? "🟢 Open now" : "🔴 Closed"}
      </p>
      <p class="shop-hours">
        ${shop.openingHours.open} – ${shop.openingHours.close}
      </p>
    `;

    if (openNow) {
      card.addEventListener("click", () => loadShopProducts(shop));
    } else {
      card.style.opacity = "0.6";
      card.style.cursor = "not-allowed";
    }

    shopsGrid.appendChild(card);
  });
}

// ===============================
// LOAD PRODUCTS FOR A SHOP
// ===============================
function loadShopProducts(shop) {
  shopContainer.innerHTML = `
    <section class="shop-products">
      <h2 class="shop-title">${shop.name}</h2>
      <p class="shop-hours-inline">
        🕒 ${shop.openingHours.open} – ${shop.openingHours.close}
      </p>

      <div class="products">
        ${shop.products.map(product => `
          <div class="product">
            <img src="${product.image}" alt="${product.name}">
            <h4>${product.name}</h4>
            <p>₵${product.price}</p>

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

      <div class="shop-feedback" data-shop="${shop.id}">
        <h3>Customer Feedback</h3>

        <form class="feedback-form" data-shop="${shop.id}">
          <select name="rating" required>
            <option value="">Select rating</option>
            <option value="5">⭐⭐⭐⭐⭐</option>
            <option value="4">⭐⭐⭐⭐</option>
            <option value="3">⭐⭐⭐</option>
            <option value="2">⭐⭐</option>
            <option value="1">⭐</option>
          </select>

          <textarea name="comment" placeholder="Write your feedback" required></textarea>
          <button type="submit">Submit Feedback</button>
        </form>

        <div class="feedback-list"></div>
      </div>
    </section>
  `;

  loadFeedback(shop);
  shopContainer.scrollIntoView({ behavior: "smooth" });
}

// ===============================
// ADD TO CART (EVENT DELEGATION)
// ===============================
document.addEventListener("click", e => {
  if (!e.target.classList.contains("add-to-cart-btn")) return;

  const btn = e.target;
  const shopId = btn.dataset.shop;
  const product = JSON.parse(btn.dataset.product);

  addToCart(shopId, product, btn);
});

// ===============================
// FEEDBACK DISPLAY
// ===============================
function loadFeedback(shop) {
  const container = document.querySelector(
    `.shop-feedback[data-shop="${shop.id}"] .feedback-list`
  );

  container.innerHTML = "";

  if (!shop.feedback || !shop.feedback.length) {
    container.innerHTML = "<p>No feedback yet.</p>";
    return;
  }

  const avg =
    shop.feedback.reduce((s, f) => s + f.rating, 0) /
    shop.feedback.length;

  container.innerHTML += `<p>Average Rating: ⭐ ${avg.toFixed(1)}</p>`;

  shop.feedback.forEach(f => {
    container.innerHTML += `
      <div class="feedback-item">
        <p>⭐ ${f.rating}</p>
        <p>${f.comment}</p>
      </div>
    `;
  });
}

// ===============================
// FEEDBACK SUBMISSION (SAVE ONLY FEEDBACK)
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

  // Save only feedback to localStorage
  const feedbackData = shops.map(s => ({ id: s.id, feedback: s.feedback || [] }));
  localStorage.setItem("shopFeedbacks", JSON.stringify(feedbackData));

  loadFeedback(shop);
  form.reset();
  alert("Thank you for your feedback!");
});

// ===============================
// SHOP SEARCH
// ===============================
shopSearchInput.addEventListener("input", () => {
  const q = shopSearchInput.value.toLowerCase().trim();
  renderShopCards(
    shops.filter(s => s.name.toLowerCase().includes(q))
  );
});

// ===============================
// LIVE OPEN / CLOSED UPDATE
// ===============================
setInterval(() => {
  shopSearchInput.dispatchEvent(new Event("input"));
}, 60000);

// ===============================
// INITIAL LOAD
// ===============================
renderShopCards(shops);
