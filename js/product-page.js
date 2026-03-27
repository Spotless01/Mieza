const container = document.getElementById("productPage");

// GET PARAMS
const params = new URLSearchParams(window.location.search);
const shopId = params.get("shop");
const productId = parseInt(params.get("product"));

const shop = shops.find(s => s.id === shopId);
const product = shop?.products.find(p => p.id === productId);

if (!shop || !product) {
  container.innerHTML = "<h2>Product not found</h2>";
} else {
  renderProduct(shop, product);
}

function renderProduct(shop, product) {
  container.innerHTML = `
    <section class="product-page">

      <p class="breadcrumb">
        <a href="index.html">Home</a> / 
        <a href="shop.html?id=${shop.id}">${shop.name}</a> / 
        ${product.name}
      </p>

      <button onclick="history.back()" class="back-btn">← Back</button>

      <div class="product-layout">

        <div class="product-images">
          <img src="${product.image}" id="mainImage">
        </div>

        <div class="product-details">
          <h2>${product.name}</h2>
          <p class="product-price">₵${product.price}</p>

          <p class="product-description">
            ${product.description || "No description available"}
          </p>

          <button id="addBtn">Add to Cart</button>
        </div>

      </div>
    </section>
  `;

  // ADD TO CART
  document.getElementById("addBtn").onclick = () => {
    addToCart(shop.id, product);
  };

  // IMAGE ZOOM
  document.getElementById("mainImage").onclick = () => {
    openImageModal(product.image);
  };
}