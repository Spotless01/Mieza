const token =
localStorage.getItem(
  "adminToken"
);

if (!token) {

  location.href =
    "admin-login.html";

}

// ======================
// TAB CONTROL
// ======================

function setActiveTab(type) {

  document
    .getElementById("vendorTab")
    .classList.remove("active");

  document
    .getElementById("riderTab")
    .classList.remove("active");

  if (type === "vendor") {

    document
      .getElementById("vendorTab")
      .classList.add("active");

  } else {

    document
      .getElementById("riderTab")
      .classList.add("active");

  }

}

function showVendorSettlements() {

  setActiveTab("vendor");

  loadVendorSettlements();

}

function showRiderSettlements() {

  setActiveTab("rider");

  loadRiderSettlements();

}

// ======================
// LOAD VENDOR SETTLEMENTS
// ======================

async function loadVendorSettlements() {

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
        "<p>No pending vendor settlements.</p>";

      return;

    }

    settlements.forEach(shop => {

      container.innerHTML += `

      <div class="card">

        <h3>${shop.shopName}</h3>

        <p>
          <strong>Owner:</strong>
          ${shop.ownerName}
        </p>

        <p>
          <strong>Phone:</strong>
          <a href="tel:${shop.phone}">
            ${shop.phone}
          </a>
        </p>

        <p>
          <strong>Email:</strong>
          ${shop.email}
        </p>

        <p>
          <strong>Pending Vendor Settlement:</strong>
          ₵${shop.pendingSettlement}
        </p>

        <button onclick="payVendor('${shop.shopId}')">
          Mark Vendor As Paid
        </button>

        <button onclick="viewDetails('${shop.shopId}')">
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
// LOAD RIDER SETTLEMENTS
// ======================

async function loadRiderSettlements() {

  try {

    const res = await fetch(

      "https://mieza.onrender.com/api/admin/rider-settlements",

      {
        headers: {
          Authorization:
            `Bearer ${token}`
        }
      }

    );

    const riders =
      await res.json();

    const container =
      document.getElementById(
        "settlementsContainer"
      );

    container.innerHTML = "";

    if (
      riders.length === 0
    ) {

      container.innerHTML =
        "<p>No pending rider settlements.</p>";

      return;

    }

    riders.forEach(rider => {

      container.innerHTML += `

      <div class="card">

        <h3>${rider.fullName}</h3>

        <p>
          <strong>Phone:</strong>
          <a href="tel:${rider.phone}">
            ${rider.phone}
          </a>
        </p>

        <p>
          <strong>Email:</strong>
          ${rider.email}
        </p>

        <p>
          <strong>Vehicle:</strong>
          ${rider.vehicleType}
        </p>

        <hr>

        <p>
          <strong>Payout Method:</strong>
          ${rider.payoutMethod}
        </p>

        ${
          rider.payoutMethod === "momo"
          ? `
            <p><strong>MoMo Number:</strong> ${rider.momoNumber}</p>
            <p><strong>MoMo Name:</strong> ${rider.momoName}</p>
            <p><strong>Network:</strong> ${rider.momoNetwork}</p>
          `
          : `
            <p><strong>Bank:</strong> ${rider.bankName}</p>
            <p><strong>Account Name:</strong> ${rider.accountName}</p>
            <p><strong>Account Number:</strong> ${rider.accountNumber}</p>
          `
        }

        <hr>

        <p>
          <strong>Pending Rider Settlement:</strong>
          ₵${rider.pendingSettlement}
        </p>

        <button onclick="payRider('${rider.riderId}')">
          Mark Rider As Paid
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

    loadVendorSettlements();

  } catch (err) {

    console.log(err);

  }

}

// ======================
// PAY RIDER
// ======================

async function payRider(id) {

  const confirmPay =
    confirm(
      "Mark rider as paid?"
    );

  if (!confirmPay)
    return;

  try {

    const res = await fetch(

      `https://mieza.onrender.com/api/admin/riders/${id}/settle`,

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

    loadRiderSettlements();

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

// INIT
loadVendorSettlements();