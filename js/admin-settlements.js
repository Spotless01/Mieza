const token =
  localStorage.getItem("adminToken");

if (!token) {
  location.href = "admin-login.html";
}

const API_URL =
  "https://mieza.onrender.com/api";

// ======================
// TAB CONTROL
// ======================

function setActiveTab(type) {
  document
    .getElementById("vendorTab")
    ?.classList.toggle(
      "active",
      type === "vendor"
    );

  document
    .getElementById("riderTab")
    ?.classList.toggle(
      "active",
      type === "rider"
    );
}

function updateSectionIntroduction(type) {
  const title =
    document.getElementById(
      "commissionSectionTitle"
    );

  const text =
    document.getElementById(
      "commissionSectionText"
    );

  if (!title || !text) return;

  if (type === "vendor") {
    title.textContent =
      "Vendor Commissions";

    text.textContent =
      "Vendors receive product payments directly from customers and remit Mieza’s accumulated commission.";
  } else {
    title.textContent =
      "Rider Commissions";

    text.textContent =
      "Riders collect delivery fees from customers and remit Mieza’s delivery commission.";
  }
}

function showVendorCommissions() {
  setActiveTab("vendor");
  updateSectionIntroduction("vendor");
  loadVendorCommissions();
}

function showRiderCommissions() {
  setActiveTab("rider");
  updateSectionIntroduction("rider");
  loadRiderCommissions();
}

// ======================
// UI HELPERS
// ======================

function getContainer() {
  return document.getElementById(
    "settlementsContainer"
  );
}

function showLoading(message) {
  const container = getContainer();

  if (!container) return;

  container.innerHTML = `
    <div class="loading-state">
      ${escapeHtml(message)}
    </div>
  `;
}

function showError(message) {
  const container = getContainer();

  if (!container) return;

  container.innerHTML = `
    <div class="error-state">
      <strong>Unable to load commissions</strong>
      <p>${escapeHtml(message)}</p>
    </div>
  `;
}

function showEmpty(message) {
  const container = getContainer();

  if (!container) return;

  container.innerHTML = `
    <div class="empty-state">
      <strong>All clear ✅</strong>
      <p>${escapeHtml(message)}</p>
    </div>
  `;
}

function formatMoney(value) {
  return Number(value || 0).toFixed(2);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// ======================
// LOAD VENDOR COMMISSIONS
// ======================

async function loadVendorCommissions() {
  showLoading(
    "Loading vendor commissions..."
  );

  try {
    const res =
      await fetch(
        `${API_URL}/admin/settlements`,
        {
          headers: {
            Authorization:
              `Bearer ${token}`
          }
        }
      );

    const vendors =
      await res.json();

    if (!res.ok) {
      throw new Error(
        vendors.message ||
        "Failed to load vendor commissions"
      );
    }

    const container =
      getContainer();

    container.innerHTML = "";

    if (!vendors.length) {
      showEmpty(
        "No unpaid vendor commissions."
      );
      return;
    }

    vendors.forEach(vendor => {
      const card =
        document.createElement("div");

      card.className =
        "commission-card";

      card.innerHTML = `
        <h3>
          ${escapeHtml(vendor.shopName)}
        </h3>

        <p>
          <strong>Owner:</strong>
          ${escapeHtml(vendor.ownerName)}
        </p>

        <p>
          <strong>Phone:</strong>
          <a href="tel:${escapeHtml(vendor.phone)}">
            ${escapeHtml(vendor.phone)}
          </a>
        </p>

        <p>
          <strong>Email:</strong>
          ${escapeHtml(vendor.email)}
        </p>

        <div class="commission-amount">
          Vendor Commission Owed:
          ₵${formatMoney(
            vendor.commissionOwed
          )}
        </div>

        <p>
          The vendor has already received
          the product payment directly from
          the customer.
        </p>

        <div class="commission-actions">

          <button
            type="button"
            class="confirm-commission-btn"
            onclick="confirmVendorCommission(
              '${vendor.shopId}'
            )"
          >
            Confirm Commission Received
          </button>

          <button
            type="button"
            class="view-details-btn"
            onclick="viewDetails(
              '${vendor.shopId}'
            )"
          >
            View Details
          </button>

        </div>
      `;

      container.appendChild(card);
    });

  } catch (err) {
    console.log(
      "Vendor commissions error:",
      err
    );

    showError(err.message);
  }
}

// ======================
// LOAD RIDER COMMISSIONS
// ======================

async function loadRiderCommissions() {
  showLoading(
    "Loading rider commissions..."
  );

  try {
    const res =
      await fetch(
        `${API_URL}/admin/rider-settlements`,
        {
          headers: {
            Authorization:
              `Bearer ${token}`
          }
        }
      );

    const riders =
      await res.json();

    if (!res.ok) {
      throw new Error(
        riders.message ||
        "Failed to load rider commissions"
      );
    }

    const container =
      getContainer();

    container.innerHTML = "";

    if (!riders.length) {
      showEmpty(
        "No unpaid rider commissions."
      );
      return;
    }

    riders.forEach(rider => {
      const card =
        document.createElement("div");

      card.className =
        "commission-card";

      card.innerHTML = `
        <h3>
          ${escapeHtml(rider.fullName)}
        </h3>

        <p>
          <strong>Phone:</strong>
          <a href="tel:${escapeHtml(rider.phone)}">
            ${escapeHtml(rider.phone)}
          </a>
        </p>

        <p>
          <strong>Email:</strong>
          ${escapeHtml(rider.email)}
        </p>

        <p>
          <strong>Vehicle:</strong>
          ${escapeHtml(rider.vehicleType)}
        </p>

        <div class="commission-amount">
          Rider Commission Owed:
          ₵${formatMoney(
            rider.commissionOwed
          )}
        </div>

        <p>
          The rider has already collected
          the delivery fee directly from
          the customer.
        </p>

        <div class="commission-actions">

          <button
            type="button"
            class="confirm-commission-btn"
            onclick="confirmRiderCommission(
              '${rider.riderId}'
            )"
          >
            Confirm Commission Received
          </button>

        </div>
      `;

      container.appendChild(card);
    });

  } catch (err) {
    console.log(
      "Rider commissions error:",
      err
    );

    showError(err.message);
  }
}

// ======================
// CONFIRM VENDOR COMMISSION
// ======================

async function confirmVendorCommission(
  shopId
) {
  const paymentReference =
    prompt(
      "Enter the MoMo or bank transaction ID used by the vendor to pay Mieza:"
    );

  if (
    paymentReference === null
  ) {
    return;
  }

  const cleanedReference =
    paymentReference.trim();

  if (!cleanedReference) {
    alert(
      "A payment reference is required."
    );
    return;
  }

  const approved =
    confirm(
      "Have you verified that Mieza received this vendor commission payment?"
    );

  if (!approved) return;

  try {
    const res =
      await fetch(
        `${API_URL}/admin/shops/${shopId}/commission-paid`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`
          },

          body: JSON.stringify({
            paymentReference:
              cleanedReference
          })
        }
      );

    const data =
      await res.json();

    if (!res.ok) {
      alert(
        data.message ||
        "Unable to confirm vendor commission"
      );
      return;
    }

    alert(
      `${data.message}\n\nAmount received: ₵${formatMoney(
        data.amountPaid
      )}`
    );

    await loadVendorCommissions();

  } catch (err) {
    console.log(err);

    alert(
      "Server error. Please try again."
    );
  }
}

// ======================
// CONFIRM RIDER COMMISSION
// ======================

async function confirmRiderCommission(
  riderId
) {
  const paymentReference =
    prompt(
      "Enter the MoMo or bank transaction ID used by the rider to pay Mieza:"
    );

  if (
    paymentReference === null
  ) {
    return;
  }

  const cleanedReference =
    paymentReference.trim();

  if (!cleanedReference) {
    alert(
      "A payment reference is required."
    );
    return;
  }

  const approved =
    confirm(
      "Have you verified that Mieza received this rider commission payment?"
    );

  if (!approved) return;

  try {
    const res =
      await fetch(
        `${API_URL}/admin/riders/${riderId}/commission-paid`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`
          },

          body: JSON.stringify({
            paymentReference:
              cleanedReference
          })
        }
      );

    const data =
      await res.json();

    if (!res.ok) {
      alert(
        data.message ||
        "Unable to confirm rider commission"
      );
      return;
    }

    alert(
      `${data.message}\n\nAmount received: ₵${formatMoney(
        data.amountPaid
      )}`
    );

    await loadRiderCommissions();

  } catch (err) {
    console.log(err);

    alert(
      "Server error. Please try again."
    );
  }
}

// ======================
// VIEW SHOP DETAILS
// ======================

function viewDetails(shopId) {
  localStorage.setItem(
    "selectedShop",
    shopId
  );

  location.href =
    "admin-shop-details.html";
}

// ======================
// INIT
// ======================

showVendorCommissions();