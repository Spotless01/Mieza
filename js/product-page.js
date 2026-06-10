const API_URL =
  "https://mieza.onrender.com/api";

const container =
  document.getElementById(
    "productPage"
  );

const params =
  new URLSearchParams(
    window.location.search
  );

const shopId =
  params.get("shopId");

const productId =
  params.get("productId");

async function loadProduct() {

  try {

    const res =
      await fetch(
        `${API_URL}/shops`
      );

    const shops =
      await res.json();

    const shop =
      shops.find(
        s => s._id === shopId
      );

    if (!shop) {

      container.innerHTML =
        "<h2>Shop not found</h2>";

      return;
    }

    const product =
      shop.products.find(
        p => p._id === productId
      );

    if (!product) {

      container.innerHTML =
        "<h2>Product not found</h2>";

      return;
    }

    renderProduct(
      shop,
      product
    );

  } catch (err) {

    console.log(err);

    container.innerHTML =
      "<h2>Failed to load product</h2>";

  }

}

function renderProduct(
  shop,
  product
) {

  container.innerHTML = `

<section class="product-page">

  <p class="breadcrumb">

    <a href="index.html">
      Home
    </a>

    /

    <a href="shop.html?id=${shop._id}">
      ${shop.shopName}
    </a>

    /

    ${product.name}

  </p>

  <button
    onclick="history.back()"
    class="back-btn"
  >
    ← Back
  </button>

  <div class="product-layout">

    <div class="product-images">

      <img
        src="${product.image}"
        class="main-product-image"
      >

    </div>

    <div class="product-details">

      <h2>
        ${product.name}
      </h2>

      <p class="product-price">
        ₵${product.price}
      </p>

      <p class="product-description">
        ${product.description || ""}
      </p>

      <button
        id="addBtn"
        class="btn-primary"
      >
        Add To Cart
      </button>

    </div>

  </div>

</section>

`;

  document.getElementById(
    "addBtn"
  ).onclick = () => {

    addToCart(
      shop._id,
      product
    );

  };

}

loadProduct();