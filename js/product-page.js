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
  params.get("productId") || params.get("id") || params.get("product");

let currentViewerImages = [];
let currentViewerIndex = 0;

// =====================================
// LOAD PRODUCT
// =====================================

async function loadProduct() {
  try {
    let payload = null;
    if (productId) {
      const response = await fetch(`${API_URL}/marketplace/products/${encodeURIComponent(productId)}${shopId ? `?shopId=${encodeURIComponent(shopId)}` : ""}`, {
        headers: { "Accept": "application/json" }, cache: "no-store"
      });
      if (response.ok) {
        payload = await response.json();
      } else {
        // Fallback for older embedded-product records and legacy API responses.
        const legacyResponse = await fetch(`${API_URL}/shops`, { cache: "no-store" });
        if (legacyResponse.ok) {
          const legacyPayload = await legacyResponse.json();
          const shops = Array.isArray(legacyPayload) ? legacyPayload : (legacyPayload.shops || legacyPayload.data || []);
          for (const candidateShop of shops) {
            const candidate = (candidateShop.products || []).find(item =>
              String(item._id) === String(productId)
            );
            if (candidate) {
              payload = {
                shop: candidateShop,
                product: candidate,
                shopProducts: (candidateShop.products || []).filter(item =>
                  String(item._id) !== String(productId)
                )
              };
              break;
            }
          }
        }
        if (!payload) throw new Error(`Product detail request failed (${response.status})`);
      }
    } else if (shopId) {
      const response = await fetch(`${API_URL}/shops`, { cache: "no-store" });
      if (!response.ok) throw new Error(`Shop lookup failed (${response.status})`);
      const shops = await response.json();
      const shop = shops.find(item => String(item._id) === String(shopId));
      const legacyId = params.get("id") || params.get("product");
      const product = (shop?.products || []).find(item => String(item._id) === String(legacyId));
      if (shop && product) {
        payload = { shop, product, shopProducts: shop.products.filter(item => String(item._id) !== String(product._id)) };
      }
    }
    if (payload?.data && !payload.product) payload = payload.data;
    if (!payload?.shop || !payload?.product) throw new Error("Product response did not include product and shop");
    renderProduct(payload.shop, payload.product, payload.shopProducts || []);
  } catch (err) {
    console.error("Product loading error:", err);
    container.innerHTML = `<div class="product-load-error"><h2>We couldn't load this product</h2><p>This may be a temporary connection issue. Please return to the marketplace and try again.</p><a href="index.html#shops-section">Continue shopping</a></div>`;
  }
}

// GET ALL PRODUCT IMAGES
// =====================================

function getProductImages(
  product
) {

  const images = [];

  if (
    Array.isArray(product.images)
  ) {

    product.images.forEach(
      image => {

        if (
          image &&
          !images.includes(image)
        ) {
          images.push(image);
        }

      }
    );

  }

  if (
    product.image &&
    !images.includes(product.image)
  ) {

    images.unshift(
      product.image
    );

  }

  if (!images.length) {

    images.push(
      "images/default-product.png"
    );

  }

  return images;

}

// =====================================
// RENDER PRODUCT
// =====================================

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

function renderProduct(
  shop,
  product,
  shopProducts = []
) {
  // Keep seller recommendations local and safe even if an older API omits them.
  const sellerProducts = Array.isArray(shopProducts) ? shopProducts : [];

  const productImages =
    getProductImages(
      product
    );

  const mainImage =
    productImages[0];

  container.innerHTML = `

<section class="product-page">

  <div class="product-hero">

    <div class="product-main-image-box">

      <img
        src="${escapeHtml(mainImage)}"
        class="hero-image"
        id="mainProductImage"
        alt="${escapeHtml(product.name)}"
        role="button"
        tabindex="0"
        aria-label="View product images in full screen"
      >

      <span class="image-view-hint">
        Tap image to view full screen
      </span>

      ${
        productImages.length > 1
          ? `
              <span class="image-count-badge">
                1 / ${productImages.length}
              </span>
            `
          : ""
      }

    </div>

    <button
      class="back-btn floating-back"
      type="button"
      onclick="history.back()"
    >
      ← Back
    </button>

  </div>

  ${
    productImages.length > 1
      ? `
          <div class="product-thumbnail-gallery">

            ${productImages
              .map(
                (image, index) => `

                  <button
                    type="button"
                    class="product-thumbnail-btn ${
                      index === 0
                        ? "active"
                        : ""
                    }"
                    data-image-index="${index}"
                    aria-label="View product image ${index + 1}"
                  >

                    <img
                      src="${escapeHtml(image)}"
                      alt="${escapeHtml(product.name)} image ${index + 1}"
                    >

                  </button>

                `
              )
              .join("")}

          </div>
        `
      : ""
  }

  <div class="product-card">

    <div class="breadcrumb">

      <a href="index.html">
        Home
      </a>

      <span>›</span>

      <a href="shop.html?id=${encodeURIComponent(shop._id)}">
        ${escapeHtml(shop.shopName)}
      </a>

    </div>

    <h1 class="product-title">
      ${escapeHtml(product.name)}
    </h1>

    <div class="product-meta-line">
      <span>${escapeHtml(product.category || "Other")}</span>
      ${product.subcategory ? `<span>${escapeHtml(product.subcategory)}</span>` : ""}
    </div>

    <div class="price-row">

      <span class="price-badge">
        ₵${Number(product.price || 0).toFixed(2)}
      </span>

      <span class="delivery-time">
        🚴 10–20 mins
      </span>

    </div>

    <div class="description-box">

      <h3>Description</h3>

      <p>
        ${escapeHtml(
          product.description ||
          "No description available."
        )}
      </p>

    </div>

    <div class="shop-box product-seller-card">

      <div class="product-seller-identity">
        <img src="${escapeHtml(shop.thumbnail || "images/default-shop.png")}" alt="${escapeHtml(shop.shopName)}" onerror="this.src='images/default-shop.png'">
        <div>
          <h3>Sold by</h3>
          <p><strong>${escapeHtml(shop.shopName)}</strong></p>
          <small>📍 ${escapeHtml(shop.shopLocation || "Location not available")}</small>
        </div>
      </div>
      <div class="product-shop-status ${isShopCurrentlyOpen(shop.openingHours) ? "is-open" : "is-closed"}">
        ${isShopCurrentlyOpen(shop.openingHours) ? "SHOP OPEN" : "SHOP CLOSED"}
      </div>
      <a class="product-visit-shop" href="shop.html?id=${encodeURIComponent(shop._id)}">Visit shop →</a>
    </div>

    <div class="quantity-box">

      <button
        id="minusQty"
        type="button"
      >
        −
      </button>

      <span id="qty">
        1
      </span>

      <button
        id="plusQty"
        type="button"
      >
        +
      </button>

    </div>

    <div class="sticky-cart">

      <button
        id="addBtn"
        class="add-cart-large"
        type="button"
      >
        Add 1 Item • ₵${Number(
          product.price || 0
        ).toFixed(2)}
      </button>

    </div>

  </div>

</section>

  ${
    sellerProducts.length
      ? `
        <section class="seller-more-products">
          <div class="seller-more-heading">
            <div><span>MORE FROM THIS SELLER</span><h2>Other products from ${escapeHtml(shop.shopName)}</h2></div>
            <a href="shop.html?id=${encodeURIComponent(shop._id)}">View all products →</a>
          </div>
          <div class="seller-more-grid">
            ${sellerProducts.slice(0, 8).map(item => `
              <a class="seller-more-card" href="product.html?productId=${encodeURIComponent(item._id)}">
                <img src="${escapeHtml(item.image || item.images?.[0] || "images/default-product.png")}" alt="${escapeHtml(item.name)}" loading="lazy" onerror="this.src='images/default-product.png'">
                <strong>${escapeHtml(item.name)}</strong>
                <b>₵${Number(item.price || 0).toFixed(2)}</b>
              </a>
            `).join("")}
          </div>
        </section>
      `
      : ""
  }

  `;

  setupProductGallery(
    productImages
  );

  setupQuantityControls(
    shop,
    product
  );

}

// =====================================
// PRODUCT GALLERY
// =====================================

function setupProductGallery(
  images
) {

  const mainImage =
    document.getElementById(
      "mainProductImage"
    );

  const imageCountBadge =
    document.querySelector(
      ".image-count-badge"
    );

  const thumbnailButtons =
    document.querySelectorAll(
      ".product-thumbnail-btn"
    );

  let selectedIndex = 0;

  function selectImage(
    index
  ) {

    selectedIndex =
      index;

    mainImage.src =
      images[index];

    if (imageCountBadge) {

      imageCountBadge.textContent =
        `${index + 1} / ${images.length}`;

    }

    thumbnailButtons.forEach(
      button => {

        button.classList.toggle(
          "active",
          Number(
            button.dataset.imageIndex
          ) === index
        );

      }
    );

  }

  thumbnailButtons.forEach(
    button => {

      button.addEventListener(
        "click",
        () => {

          const index =
            Number(
              button.dataset.imageIndex
            );

          selectImage(index);

        }
      );

    }
  );

  mainImage.addEventListener(
    "click",
    () => {

      openProductImageViewer(
        images,
        selectedIndex
      );

    }
  );

  mainImage.addEventListener(
    "keydown",
    event => {

      if (
        event.key === "Enter" ||
        event.key === " "
      ) {

        event.preventDefault();

        openProductImageViewer(
          images,
          selectedIndex
        );

      }

    }
  );

}

// =====================================
// FULL-SCREEN IMAGE VIEWER
// =====================================

function openProductImageViewer(
  images,
  startIndex = 0
) {

  currentViewerImages =
    images;

  currentViewerIndex =
    startIndex;

  const existingViewer =
    document.getElementById(
      "productImageViewer"
    );

  if (existingViewer) {
    existingViewer.remove();
  }

  const viewer =
    document.createElement(
      "div"
    );

  viewer.id =
    "productImageViewer";

  viewer.className =
    "product-image-viewer";

  viewer.innerHTML = `

    <button
      type="button"
      class="viewer-close"
      aria-label="Close image viewer"
    >
      ×
    </button>

    ${
      images.length > 1
        ? `
            <button
              type="button"
              class="viewer-arrow viewer-prev"
              aria-label="Previous image"
            >
              ‹
            </button>
          `
        : ""
    }

    <div class="viewer-image-wrapper">

      <img
        class="viewer-image"
        src="${escapeHtml(
          images[currentViewerIndex]
        )}"
        alt="Full product view"
      >

      <div class="viewer-counter">
        ${currentViewerIndex + 1} / ${images.length}
      </div>

    </div>

    ${
      images.length > 1
        ? `
            <button
              type="button"
              class="viewer-arrow viewer-next"
              aria-label="Next image"
            >
              ›
            </button>
          `
        : ""
    }

  `;

  document.body.appendChild(
    viewer
  );

  document.body.classList.add(
    "image-viewer-open"
  );

  viewer
    .querySelector(
      ".viewer-close"
    )
    .addEventListener(
      "click",
      closeProductImageViewer
    );

  viewer
    .querySelector(
      ".viewer-prev"
    )
    ?.addEventListener(
      "click",
      showPreviousViewerImage
    );

  viewer
    .querySelector(
      ".viewer-next"
    )
    ?.addEventListener(
      "click",
      showNextViewerImage
    );

  viewer.addEventListener(
    "click",
    event => {

      if (
        event.target === viewer
      ) {

        closeProductImageViewer();

      }

    }
  );

  document.addEventListener(
    "keydown",
    handleViewerKeyboard
  );

  setupViewerSwipe(
    viewer
  );

}

// =====================================
// VIEWER CONTROLS
// =====================================

function updateViewerImage() {

  const viewerImage =
    document.querySelector(
      ".viewer-image"
    );

  const counter =
    document.querySelector(
      ".viewer-counter"
    );

  if (!viewerImage) return;

  viewerImage.src =
    currentViewerImages[
      currentViewerIndex
    ];

  if (counter) {

    counter.textContent =
      `${currentViewerIndex + 1} / ${currentViewerImages.length}`;

  }

}

function showPreviousViewerImage() {

  currentViewerIndex =
    (
      currentViewerIndex -
      1 +
      currentViewerImages.length
    ) %
    currentViewerImages.length;

  updateViewerImage();

}

function showNextViewerImage() {

  currentViewerIndex =
    (
      currentViewerIndex +
      1
    ) %
    currentViewerImages.length;

  updateViewerImage();

}

function closeProductImageViewer() {

  document
    .getElementById(
      "productImageViewer"
    )
    ?.remove();

  document.body.classList.remove(
    "image-viewer-open"
  );

  document.removeEventListener(
    "keydown",
    handleViewerKeyboard
  );

}

function handleViewerKeyboard(
  event
) {

  if (
    event.key === "Escape"
  ) {

    closeProductImageViewer();

  }

  if (
    event.key ===
    "ArrowLeft"
  ) {

    showPreviousViewerImage();

  }

  if (
    event.key ===
    "ArrowRight"
  ) {

    showNextViewerImage();

  }

}

// =====================================
// MOBILE SWIPE
// =====================================

function setupViewerSwipe(
  viewer
) {

  let touchStartX =
    null;

  viewer.addEventListener(
    "touchstart",
    event => {

      touchStartX =
        event.changedTouches[0]
          .clientX;

    },
    {
      passive: true
    }
  );

  viewer.addEventListener(
    "touchend",
    event => {

      if (
        touchStartX === null
      ) {
        return;
      }

      const touchEndX =
        event.changedTouches[0]
          .clientX;

      const distance =
        touchEndX -
        touchStartX;

      if (
        Math.abs(distance) >
        50
      ) {

        if (distance > 0) {

          showPreviousViewerImage();

        } else {

          showNextViewerImage();

        }

      }

      touchStartX =
        null;

    },
    {
      passive: true
    }
  );

}

// =====================================
// QUANTITY + CART
// =====================================

function setupQuantityControls(
  shop,
  product
) {

  let qty = 1;

  const qtyText =
    document.getElementById(
      "qty"
    );

  const addBtn =
    document.getElementById(
      "addBtn"
    );

  const price =
    Number(
      product.price || 0
    );

  function updateAddButton() {

    addBtn.textContent =
      `Add ${qty} Item${
        qty > 1
          ? "s"
          : ""
      } • ₵${(
        price * qty
      ).toFixed(2)}`;

  }

  document.getElementById(
    "minusQty"
  ).onclick = () => {

    if (qty > 1) {

      qty--;

      qtyText.textContent =
        qty;

      updateAddButton();

    }

  };

  document.getElementById(
    "plusQty"
  ).onclick = () => {

    qty++;

    qtyText.textContent =
      qty;

    updateAddButton();

  };

  addBtn.onclick = () => {

    for (
      let i = 0;
      i < qty;
      i++
    ) {

      addToCart(
        shop._id,
        product
      );

    }

    animateCart();

  };

}

// =====================================
// CART ANIMATION
// =====================================

function animateCart() {

  const cart =
    document.getElementById(
      "floatingCart"
    );

  if (!cart) return;

  cart.classList.remove(
    "show"
  );

  void cart.offsetWidth;

  cart.classList.add(
    "show"
  );

}

// =====================================
// HTML SAFETY
// =====================================

function escapeHtml(
  value
) {

  return String(
    value ?? ""
  )
    .replaceAll(
      "&",
      "&amp;"
    )
    .replaceAll(
      "<",
      "&lt;"
    )
    .replaceAll(
      ">",
      "&gt;"
    )
    .replaceAll(
      '"',
      "&quot;"
    )
    .replaceAll(
      "'",
      "&#039;"
    );

}

loadProduct();