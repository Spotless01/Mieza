// ===============================
// MIEZA — HOMEPAGE SHOPS LIST
// ===============================

const API_URL = "https://mieza.onrender.com/api";

const shopsGrid =
  document.getElementById("shopsGrid");

const shopSearchInput =
  document.getElementById("shopSearchInput");

let shops = [];

// ===============================
// CHECK SHOP OPEN / CLOSED
// ===============================

function isShopOpen(openTime, closeTime) {

  const now = new Date();

  const [openHour, openMinute] =
    openTime.split(":").map(Number);

  const [closeHour, closeMinute] =
    closeTime.split(":").map(Number);

  const open = new Date();
  open.setHours(openHour, openMinute, 0, 0);

  const close = new Date();
  close.setHours(closeHour, closeMinute, 0, 0);

  // Handles shops that close after midnight
  if (close <= open) {

    if (now < open) {
      open.setDate(open.getDate() - 1);
    } else {
      close.setDate(close.getDate() + 1);
    }

  }

  return now >= open && now <= close;
}

// ===============================
// LOAD SHOPS
// ===============================

async function fetchShops() {

  try {

    const res =
      await fetch(`${API_URL}/shops`);

    if (!res.ok) {
      throw new Error("Failed to fetch shops");
    }

    shops =
      await res.json();

    renderShopCards(shops);

  } catch (err) {

    console.error(err);

    shopsGrid.innerHTML = `
      <h2>Failed to load shops</h2>
    `;
  }
}

// ===============================
// RENDER SHOPS
// ===============================

function renderShopCards(list) {

  shopsGrid.innerHTML = "";

  if (!list.length) {

    shopsGrid.innerHTML = `
      <h2>No shops available</h2>
    `;

    return;
  }

  list.forEach(shop => {

    const openTime =
      shop.openingHours?.open || "08:00";

    const closeTime =
      shop.openingHours?.close || "22:00";

    const shopOpen =
      isShopOpen(openTime, closeTime);

    const card =
      document.createElement("div");

    card.className =
      shopOpen
        ? "shop-card"
        : "shop-card shop-closed";

    card.innerHTML = `
      <div class="shop-image">
        <img
          src="${shop.thumbnail || 'images/default-shop.png'}"
          alt="${shop.shopName}"
        >

        <span class="${shopOpen ? "open-badge" : "closed-badge"}">
          ${shopOpen ? "Open" : "Closed"}
        </span>
      </div>

      <div class="shop-info">

        <h3>${shop.shopName}</h3>

        <p>
          ${openTime} - ${closeTime}
        </p>

        <button
          class="shop-action-btn"
          ${shopOpen ? "" : "disabled"}
        >
          ${shopOpen ? "Shop Now" : "Closed"}
        </button>

      </div>
    `;

    if (shopOpen) {

      card.addEventListener("click", () => {

        window.location.href =
          `shop.html?id=${shop._id}`;

      });

    } else {

      card.addEventListener("click", () => {

        alert(
          `${shop.shopName} is currently closed. Please come back during opening hours.`
        );

      });

    }

    shopsGrid.appendChild(card);

  });
}

// ===============================
// SEARCH
// ===============================

function setupSearch() {

  if (!shopSearchInput) return;

  shopSearchInput.addEventListener("input", () => {

    const q =
      shopSearchInput.value
        .toLowerCase()
        .trim();

    const filtered =
      shops.filter(shop =>
        shop.shopName
          .toLowerCase()
          .includes(q)
      );

    renderShopCards(filtered);

  });
}

// Refresh open/closed labels every 1 minute
setInterval(() => {
  renderShopCards(shops);
}, 60000);

// INIT
fetchShops();
setupSearch();