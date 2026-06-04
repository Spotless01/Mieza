const token =
localStorage.getItem(
  "adminToken"
);

if (!token) {

  location.href =
    "admin-login.html";

}

// ======================
// LOAD SETTLEMENTS
// ======================

async function loadSettlements() {

  try {

    const res = await fetch(

      "https://mieza.onrender.com/api/admin/settlements",

      {

        headers: {

          Authorization:
            `Bearer ${token}`

        }

      }

    );

    const settlements =
      await res.json();

    const container =
      document.getElementById(
        "settlementsContainer"
      );

    container.innerHTML = "";

    if (
      settlements.length === 0
    ) {

      container.innerHTML =
        "<p>No pending settlements.</p>";

      return;

    }

    settlements.forEach(shop => {

      container.innerHTML += `

      <div class="card">

        <h3>
          ${shop.shopName}
        </h3>

        <p>
          Owner:
          ${shop.ownerName}
        </p>

        <p>
          Phone:
          ${shop.phone}
        </p>

        <p>
          Email:
          ${shop.email}
        </p>

        <p>
          Pending Settlement:
          ₵${shop.pendingSettlement}
        </p>

        <button
        onclick="payVendor('${shop.shopId}')">

          Mark As Paid

        </button>

        <button
        onclick="viewDetails('${shop.shopId}')">

          View Details

        </button>

      </div>

      `;

    });

  } catch (err) {

    console.log(err);

  }

}

// ======================
// PAY VENDOR
// ======================

async function payVendor(id) {

  const confirmPay =
    confirm(
      "Mark vendor as paid?"
    );

  if (!confirmPay)
    return;

  try {

    const res = await fetch(

      `https://mieza.onrender.com/api/admin/shops/${id}/settle`,

      {

        method: "POST",

        headers: {

          Authorization:
            `Bearer ${token}`

        }

      }

    );

    const data =
      await res.json();

    alert(data.message);

    loadSettlements();

  } catch (err) {

    console.log(err);

  }

}

// ======================
// VIEW SHOP DETAILS
// ======================

function viewDetails(id) {

  localStorage.setItem(
    "selectedShop",
    id
  );

  location.href =
    "admin-shop-details.html";

}

loadSettlements();