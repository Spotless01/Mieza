// ===============================
// MIEZA — HOMEPAGE SHOPS LIST
// ===============================

const API_URL = "https://mieza.onrender.com/api";

const shopsGrid = document.getElementById("shopsGrid");
const shopSearchInput = document.getElementById("shopSearchInput");

let shops = [];

// LOAD SHOPS
async function fetchShops() {

  try {

    const res = await fetch(`${API_URL}/shops`);

    if (!res.ok) {
      throw new Error("Failed to fetch shops");
    }

    shops = await res.json();

    renderShopCards(shops);

  } catch (err) {

    console.error(err);

    shopsGrid.innerHTML = `
      <h2>Failed to load shops</h2>
    `;
  }
}

// RENDER SHOPS
function renderShopCards(list) {

  shopsGrid.innerHTML = "";

  if (!list.length) {

    shopsGrid.innerHTML = `
      <h2>No shops available</h2>
    `;

    return;
  }

  list.forEach(shop => {

    const card = document.createElement("div");

    card.className = "shop-card";

    card.innerHTML = `
      <div class="shop-image">
        <img
          src="${shop.thumbnail || 'images/default-shop.png'}"
          alt="${shop.shopName}"
        >
      </div>

      <div class="shop-info">

        <h3>${shop.shopName}</h3>

        <p>
          ${
            shop.openingHours
              ? `${shop.openingHours.open} - ${shop.openingHours.close}`
              : "Open"
          }
        </p>

      </div>
    `;

    // OPEN SHOP PAGE
    card.addEventListener("click", () => {

      window.location.href = `shop.html?id=${shop._id}`;

    });

    shopsGrid.appendChild(card);
  });
}

// SEARCH
function setupSearch() {

  if (!shopSearchInput) return;

  shopSearchInput.addEventListener("input", () => {

    const q = shopSearchInput.value.toLowerCase().trim();

    const filtered = shops.filter(shop =>
      shop.shopName.toLowerCase().includes(q)
    );

    renderShopCards(filtered);
  });
}

// INIT
fetchShops();
setupSearch();