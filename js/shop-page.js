const API_URL = "https://mieza.onrender.com/api";

const params = new URLSearchParams(window.location.search);
const shopId = params.get("id");

const container = document.getElementById("shop-container");

async function loadShop() {
  try {
    const res = await fetch(`${API_URL}/shops`);
    const shops = await res.json();

    const shop = shops.find(s => s._id === shopId);

    if (!shop) {
      container.innerHTML = "<h2>Shop not found</h2>";
      return;
    }

    let rating = {
  average: 0,
  total: 0
};

let reviews = [];

try {
  const ratingRes =
    await fetch(`${API_URL}/reviews/shop-rating/${shopId}`);

  if (ratingRes.ok) {
    rating = await ratingRes.json();
  }

  const reviewsRes =
    await fetch(`${API_URL}/reviews/shop/${shopId}`);

  if (reviewsRes.ok) {
    reviews = await reviewsRes.json();
  }

} catch (err) {
  console.log("Reviews not available yet:", err);
}

    renderShop(shop, rating, reviews);

  } catch (err) {
    console.error(err);
    container.innerHTML = `<h2>Failed to load shop</h2>`;
  }
}

function renderStars(rating) {
  const value = Math.round(Number(rating || 0));
  return "★".repeat(value) + "☆".repeat(5 - value);
}

function renderShop(shop, rating, reviews) {
  container.innerHTML = `
    <section class="shop-products">

      <div class="shop-header upgraded-shop-header">
        <h2>${shop.shopName}</h2>

        <div class="shop-rating-summary">
          <span class="rating-stars">
            ${rating.total > 0 ? renderStars(rating.average) : "☆☆☆☆☆"}
          </span>

          <span>
            ${rating.total > 0
              ? `${rating.average} (${rating.total} review${rating.total > 1 ? "s" : ""})`
              : "New shop"}
          </span>
        </div>
      </div>

      <div class="shop-reviews-section">
        <h3>Customer Reviews</h3>

        ${
          reviews.length
            ? reviews.slice(0, 3).map(review => `
              <div class="shop-review-card">
                <div class="review-stars">
                  ${renderStars(review.shopRating)}
                </div>

                <p>
                  ${review.shopReview || "No written review."}
                </p>

                <small>
                  — ${review.customerName || "Customer"}
                </small>
              </div>
            `).join("")
            : `<p class="no-reviews">No reviews yet.</p>`
        }
      </div>

      <h3 class="products-title">Menu</h3>

      <div class="products-grid">
        ${(shop.products || []).map(product => `
          <div
            class="product-card"
            onclick="
              location.href=
              'product.html?shopId=${shop._id}&productId=${product._id}'
            "
          >
            <div class="product-image-wrapper">
              <img
                src="${product.image || 'images/default-product.png'}"
                alt="${product.name}"
              >
            </div>

            <div class="product-info">
              <h3>${product.name}</h3>

              <p>${product.description || ""}</p>

              <p class="price">₵${product.price}</p>

              <button
                class="add-to-cart-btn"
                data-shop="${shop._id}"
                data-product='${JSON.stringify(product)}'
              >
                Add to Cart
              </button>
            </div>
          </div>
        `).join("")}
      </div>

    </section>
  `;
}

document.addEventListener("click", e => {
  if (!e.target.classList.contains("add-to-cart-btn")) return;

  e.stopPropagation();

  const btn = e.target;
  const product = JSON.parse(btn.dataset.product);
  const shopId = btn.dataset.shop;

  addToCart(shopId, product, btn);
});

loadShop();