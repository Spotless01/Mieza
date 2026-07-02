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

function renderProduct(shop, product) {

  container.innerHTML = `

<section class="product-page">

<div class="product-hero">

<img
src="${product.image}"
class="hero-image"
alt="${product.name}"
>

<button
class="back-btn floating-back"
onclick="history.back()"
>
← Back
</button>

</div>

<div class="product-card">

<div class="breadcrumb">

<a href="index.html">
Home
</a>

<span>›</span>

<a href="shop.html?id=${shop._id}">
${shop.shopName}
</a>

</div>

<h1 class="product-title">
${product.name}
</h1>

<div class="price-row">

<span class="price-badge">
₵${product.price}
</span>

<span class="delivery-time">
🚴 20–40 mins
</span>

</div>

<div class="description-box">

<h3>Description</h3>

<p>

${product.description || "No description available."}

</p>

</div>

<div class="shop-box">

<h3>Sold by</h3>

<p>

<strong>${shop.shopName}</strong>

</p>

<p>

📍 ${shop.shopLocation}

</p>

</div>

<div class="quantity-box">

<button
id="minusQty"
>
−
</button>

<span id="qty">
1
</span>

<button
id="plusQty"
>
+
</button>

</div>

<div class="sticky-cart">

<button
id="addBtn"
class="add-cart-large"
>

Add 1 Item • ₵${product.price}

</button>

</div>

</div>

</section>

`;

let qty = 1;

const qtyText =
document.getElementById("qty");

const addBtn =
document.getElementById("addBtn");

document.getElementById("minusQty").onclick =
() => {

if(qty>1){

qty--;

qtyText.textContent=qty;

addBtn.textContent=
`Add ${qty} Item${qty>1?"s":""} • ₵${product.price*qty}`;

}

};

document.getElementById("plusQty").onclick =
() => {

qty++;

qtyText.textContent=qty;

addBtn.textContent=
`Add ${qty} Item${qty>1?"s":""} • ₵${product.price*qty}`;

};

addBtn.onclick=()=>{

for(let i=0;i<qty;i++){

addToCart(shop._id,product);

}

};

}

loadProduct();