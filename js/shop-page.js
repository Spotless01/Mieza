const container = document.getElementById("shopPage");

// GET URL PARAM
const params = new URLSearchParams(window.location.search);
const shopId = params.get("id");

const shop = shops.find(s => s.id === shopId);

if (!shop) {
  container.innerHTML = "<h2>Shop not found</h2>";
} else {
  renderShop(shop);
}

function renderShop(shop) {
  container.innerHTML = `
    <section class="shop-products">

      <h2>${shop.name}</h2>

      <div class="products-grid">
        ${shop.products.map(p => `
          <div class="product-card" data-id="${p.id}">
            <img src="${p.image}">
            <h4>${p.name}</h4>
            <p>₵${p.price}</p>
          </div>
        `).join("")}
      </div>

    </section>
  `;

  // CLICK PRODUCT → GO TO PRODUCT PAGE
  document.querySelectorAll(".product-card").forEach(card => {
    card.addEventListener("click", () => {
      const productId = card.dataset.id;
      window.location.href = `product.html?shop=${shop.id}&product=${productId}`;
    });
  });
}