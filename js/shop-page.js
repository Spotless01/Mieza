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

    renderShop(shop);

  } catch (err) {

    console.error(err);

    container.innerHTML = `
      <h2>Failed to load shop</h2>
    `;
  }
}

function renderShop(shop) {

  container.innerHTML = `
    <section class="shop-products">

      <div class="shop-header">
        <h2>${shop.shopName}</h2>
      </div>

      <div class="products-grid">

        ${(shop.products || []).map(product => `

          <div class="product-card">

            <img
              src="${product.image || 'images/default-product.png'}"
              alt="${product.name}"
            >

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

  const btn = e.target;

  const product = JSON.parse(btn.dataset.product);

  const shopId = btn.dataset.shop;

  addToCart(shopId, product, btn);
});

loadShop();