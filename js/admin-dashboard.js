const token =
  localStorage.getItem(
    "adminToken"
  );

let adminUser = null;
let isOwner = false;
let isCofounder = false;

async function initializeAdminDashboard() {

  adminUser =
    await verifyAdminAccess([
      "owner",
      "cofounder"
    ]);

  if (!adminUser) return;

  isOwner =
    adminUser.role === "owner";

  isCofounder =
    adminUser.role === "cofounder";

  setupAdminInterface();

  await Promise.all([
    loadStats(),
    loadShops(),
    loadOrders(),
    loadRiders(),
    loadRideDrivers(),
    loadAdminNotifications()
]);

  setInterval(
    loadAdminNotifications,
    10000
  );

}


function setupAdminInterface() {

  const adminName =
    document.getElementById(
      "loggedInAdmin"
    );

  if (adminName) {

    adminName.textContent =
      `${adminUser.name} — ${
        isOwner
          ? "Owner"
          : "Co-founder"
      }`;

  }

  if (!isOwner) {

    document
      .querySelectorAll(
        ".owner-only"
      )
      .forEach(element => {

        element.style.display =
          "none";

      });

  }

}

let allShops = [];

let allRiders = [];

let allRideDrivers = [];

let allOrders = [];

// =====================
// LOAD STATS
// =====================

async function loadStats() {

  const res = await fetch(
  "https://mieza.onrender.com/api/admin/stats",
  {
    headers: {
      Authorization: `Bearer ${token}`
    }
  }
);

  if (!res.ok) {

  alert("Failed to load stats");

  return;
}

const stats = await res.json();

  document.getElementById(
    "totalOrders"
  ).textContent =
    stats.totalOrders;

  document.getElementById(
  "productRevenue"
).textContent =
  `₵${stats.productRevenue}`;

document.getElementById(
  "deliveryRevenue"
).textContent =
  `₵${stats.deliveryRevenue}`;

  document.getElementById(
  "deliveryCommission"
).textContent =
  `₵${stats.deliveryCommission || 0}`;

document.getElementById(
  "riderEarnings"
).textContent =
  `₵${stats.riderEarnings || 0}`;

document.getElementById(
  "pendingRiderSettlement"
).textContent =
  `₵${Number(
    stats.riderCommissionOwed || 0
  ).toFixed(2)}`;

  const vendorCommissionOwedEl =
  document.getElementById(
    "vendorCommissionOwed"
  );

if (vendorCommissionOwedEl) {
  vendorCommissionOwedEl.textContent =
    `₵${Number(
      stats.vendorCommissionOwed || 0
    ).toFixed(2)}`;
}

const vendorCommissionPaidEl =
  document.getElementById(
    "vendorCommissionPaid"
  );

if (vendorCommissionPaidEl) {
  vendorCommissionPaidEl.textContent =
    `₵${Number(
      stats.vendorCommissionPaid || 0
    ).toFixed(2)}`;
}

const riderCommissionPaidEl =
  document.getElementById(
    "riderCommissionPaid"
  );

if (riderCommissionPaidEl) {
  riderCommissionPaidEl.textContent =
    `₵${Number(
      stats.riderCommissionPaid || 0
    ).toFixed(2)}`;
}

document.getElementById(
  "totalRiders"
).textContent =
  stats.totalRiders || 0;

  document.getElementById(
  "totalVendors"
).textContent =
  stats.totalVendors || 0;

document.getElementById(
  "activeVendors"
).textContent =
  stats.activeVendors || 0;

document.getElementById(
  "pendingVendors"
).textContent =
  stats.pendingVendors || 0;

document.getElementById(
  "suspendedVendors"
).textContent =
  stats.suspendedVendors || 0;

document.getElementById(
  "marketplaceRevenue"
).textContent =
  `₵${stats.totalMarketplaceRevenue}`;

document.getElementById(
  "vendorRevenue"
).textContent =
  `₵${stats.vendorRevenue}`;

  const commissionEl =
  document.getElementById(
    "commissionRevenue"
  );

if (commissionEl) {
  commissionEl.textContent =
    `₵${stats.commissionRevenue}`;
}

document.getElementById(
  "registrationRevenue"
).textContent =
  `₵${stats.registrationRevenue}`;

document.getElementById(
  "miezaRevenue"
).textContent =
  `₵${stats.miezaRevenue}`;

}

// =====================
// LOAD SHOPS
// =====================
async function loadShops() {

  const res = await fetch(
    "https://mieza.onrender.com/api/admin/shops",
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  const shops = await res.json();

  if (!res.ok) {
    alert(shops.message);
    return;
  }

  allShops = shops;

  renderShops(shops);

}


function renderShops(shops) {

  const table =
    document.getElementById(
      "shopsTable"
    );

  table.innerHTML = "";

  shops.forEach(shop => {

    table.innerHTML += `

<tr>

<td>
  <a href="#"
     onclick="viewShopDetails('${shop._id}')">
     ${shop.shopName}
  </a>
</td>

<td>${shop.ownerName}</td>

<td>
${
  !shop.isApproved
    ? "Pending"
    : shop.isActive
      ? "Active"
      : "Suspended"
}
</td>

<td>

${
  !shop.isApproved
    ? `
      <button
        onclick="approveShop('${shop._id}')"
      >
        Approve
      </button>
    `
    : ""
}

${
  isOwner &&
  shop.isApproved &&
  shop.isActive
    ? `
      <button
        onclick="suspendShop('${shop._id}')"
      >
        Suspend
      </button>
    `
    : ""
}

${
  isOwner &&
  shop.isApproved &&
  !shop.isActive
    ? `
      <button
        onclick="activateShop('${shop._id}')"
      >
        Activate
      </button>
    `
    : ""
}

${
  isOwner
    ? `
      <button
        onclick="deleteShop('${shop._id}')"
        style="
          background:#dc2626;
          margin-left:6px;
        "
      >
        Delete
      </button>
    `
    : ""
}

</td>

</tr>

`;

  });

}

function filterShops() {

  const search =
    document.getElementById(
      "shopSearchInput"
    ).value.toLowerCase();

  const status =
    document.getElementById(
      "shopStatusFilter"
    ).value;

  const filtered =
    allShops.filter(shop => {

      const matchesSearch =
        shop.shopName
          ?.toLowerCase()
          .includes(search) ||
        shop.ownerName
          ?.toLowerCase()
          .includes(search) ||
        shop.phone
          ?.toLowerCase()
          .includes(search) ||
        shop.email
          ?.toLowerCase()
          .includes(search);

      const shopStatus =
        !shop.isApproved
          ? "pending"
          : shop.isActive
            ? "active"
            : "suspended";

      const matchesStatus =
        status === "all" ||
        status === shopStatus;

      return (
        matchesSearch &&
        matchesStatus
      );

    });

  renderShops(filtered);

}

// =====================
// APPROVE SHOP
// =====================

async function approveShop(id) {

const res = await fetch(
  `https://mieza.onrender.com/api/admin/shops/${id}/approve`,
  {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`
    }
  }
);

if (!res.ok) {

  const data = await res.json();

  alert(data.message);

  return;
}

  loadShops();
loadStats();
loadAdminNotifications();

}

// =====================
// SUSPEND SHOP
// =====================

async function suspendShop(id) {

  const res = await fetch(
  `https://mieza.onrender.com/api/admin/shops/${id}/suspend`,
  {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`
    }
  }
);

if (!res.ok) {

  const data = await res.json();

  alert(data.message);

  return;
}

  loadShops();

}

async function activateShop(id) {

  const res = await fetch(
  `https://mieza.onrender.com/api/admin/shops/${id}/activate`,
  {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`
    }
  }
);

if (!res.ok) {

  const data = await res.json();

  alert(data.message);

  return;
}

  loadShops();

}

// =====================
// LOAD ORDERS
// =====================
async function loadOrders() {

  const res =
    await fetch(
      "https://mieza.onrender.com/api/admin/orders",
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

  const orders = await res.json();

  if (!res.ok) {
    alert(orders.message);
    return;
  }

  allOrders = orders;

  renderOrders(orders);

}


function renderOrders(orders) {

  const container =
    document.getElementById(
      "ordersTable"
    );

  container.innerHTML = "";

  orders.forEach(order => {

    const pickupMap =
`https://www.google.com/maps?q=${order.vendorLatitude},${order.vendorLongitude}`;

    const deliveryMap =
`https://www.google.com/maps?q=${order.customerLatitude},${order.customerLongitude}`;

    container.innerHTML += `

<div class="card">

<h4>
Order #${order._id.slice(-6)}
</h4>

<p>
<strong>Shop:</strong>
${order.vendorName || "Unknown Shop"}
</p>

<p>
<strong>Shop Owner:</strong>
${order.vendorOwner || "N/A"}
</p>

<p>
<strong>Shop Phone:</strong>
<a href="tel:${order.vendorPhone || ""}">
${order.vendorPhone || "N/A"}
</a>
</p>

<p>
<strong>Customer:</strong>
${order.customerName}
</p>

<p>
<strong>Customer Phone:</strong>
<a href="tel:${order.customerPhone}">
${order.customerPhone}
</a>
</p>

<p>
<strong>Customer Address:</strong>
${order.customerAddress}
</p>

<p>
<strong>Vendor Address:</strong>
${order.vendorLocation || "N/A"}
</p>

<p>
<strong>Distance:</strong>
${order.distanceKm || 0} km
</p>

<p>
<strong>Total:</strong>
₵${order.totalAmount}
</p>

<p>
<strong>Status:</strong>
${order.status}
</p>

<p>
<a href="${pickupMap}" target="_blank">
📍 Pickup Location
</a>
</p>

<p>
<a href="${deliveryMap}" target="_blank">
🚚 Delivery Location
</a>
</p>

</div>

`;

  });

}


function filterOrders() {

  const search =
    document.getElementById(
      "orderSearchInput"
    ).value.toLowerCase();

  const status =
    document.getElementById(
      "orderStatusFilter"
    ).value;

  const filtered =
    allOrders.filter(order => {

      const matchesSearch =
        order._id
          ?.toLowerCase()
          .includes(search) ||
        order.customerName
          ?.toLowerCase()
          .includes(search) ||
        order.customerPhone
          ?.toLowerCase()
          .includes(search) ||
        order.vendorName
          ?.toLowerCase()
          .includes(search) ||
        order.vendorPhone
          ?.toLowerCase()
          .includes(search);

      const matchesStatus =
        status === "all" ||
        order.status === status;

      return (
        matchesSearch &&
        matchesStatus
      );

    });

  renderOrders(filtered);

}

async function viewShopDetails(shopId) {

  const res =
    await fetch(
      `https://mieza.onrender.com/api/admin/shops/${shopId}/details`,
      {
        headers: {
          Authorization:
            `Bearer ${token}`
        }
      }
    );

  const data =
    await res.json();

  document.getElementById(
    "shopDetailsCard"
  ).style.display = "block";

  document.getElementById(
  "shopDetails"
).innerHTML = `

<p><strong>Shop:</strong>
${data.shopName}</p>

<p><strong>Owner:</strong>
${data.ownerName}</p>

<p><strong>Email:</strong>
${data.email}</p>

<p><strong>Phone:</strong>
${data.phone}</p>

<p><strong>Location:</strong>
${data.shopLocation || "Not Set"}</p>

${
  data.latitude && data.longitude
  ? `
    <p>
      <a
        href="https://www.google.com/maps?q=${data.latitude},${data.longitude}"
        target="_blank"
        class="btn"
      >
        📍 Open Pickup Location
      </a>
    </p>
  `
  : ""
}

<hr>

<p><strong>Total Orders:</strong>
${data.totalOrders}</p>

<p><strong>Product Revenue:</strong>
₵${data.productRevenue}</p>

<p>
  <strong>Total Commission Accrued:</strong>
  ₵${Number(
    data.commissionRevenue || 0
  ).toFixed(2)}
</p>

<p>
  <strong>Vendor Net Revenue:</strong>
  ₵${Number(
    data.vendorRevenue || 0
  ).toFixed(2)}
</p>

<p>
  <strong>Commission Owed to Mieza:</strong>
  ₵${Number(
    data.commissionOwed || 0
  ).toFixed(2)}
</p>

<p>
  <strong>Commission Paid:</strong>
  ₵${Number(
    data.commissionPaid || 0
  ).toFixed(2)}
</p>

<hr>

<h4>Orders</h4>

${
  data.orders.map(order => `

  <div style="
    border:1px solid #ddd;
    padding:10px;
    margin-bottom:10px;
  ">

    <p>
      <strong>Customer:</strong>
      ${order.customerName}
    </p>

    <p>
      <strong>Phone:</strong>
      ${order.customerPhone}
    </p>

    <p>
      <strong>Address:</strong>
      ${order.customerAddress}
    </p>

    <p>
      <strong>Total:</strong>
      ₵${order.totalAmount}
    </p>

    <p>
      <strong>Status:</strong>
      ${order.status}
    </p>

    ${
      order.customerLatitude &&
      order.customerLongitude
      ? `
      <a
        href="https://www.google.com/maps?q=${order.customerLatitude},${order.customerLongitude}"
        target="_blank"
        class="btn"
      >
        🚚 Deliver To Customer
      </a>
      `
      : ""
    }

  </div>

`).join("")
}

`;
}

async function loadRiders() {

  const res =
    await fetch(
      "https://mieza.onrender.com/api/admin/riders",
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
    alert(
      riders.message ||
      "Failed to load riders"
    );
    return;
  }

  allRiders = riders;

  renderRiders(riders);

}


function renderRiders(riders) {

  const table =
    document.getElementById(
      "ridersTable"
    );

  table.innerHTML = "";

  riders.forEach(rider => {

    table.innerHTML += `

<tr>

<td>${rider.fullName}</td>

<td>
  <a href="tel:${rider.phone}">
    ${rider.phone}
  </a>
</td>

<td>${rider.vehicleType}</td>

<td>
${
  !rider.isApproved
    ? "Pending Approval"
    : rider.isActive
      ? "Active"
      : "Suspended"
}
</td>

<td>
  ₵${Number(
    rider.totalEarnings || 0
  ).toFixed(2)}
</td>

<td>
  ₵${Number(
    rider.commissionOwed || 0
  ).toFixed(2)}
</td>

<td>

${
  !rider.isApproved
    ? `
      <button
        onclick="approveRider('${rider._id}')"
      >
        Approve
      </button>
    `
    : ""
}

${
  isOwner &&
  rider.isApproved &&
  rider.isActive
    ? `
      <button
        onclick="suspendRider('${rider._id}')"
      >
        Suspend
      </button>
    `
    : ""
}

${
  isOwner &&
  rider.isApproved &&
  !rider.isActive
    ? `
      <button
        onclick="activateRider('${rider._id}')"
      >
        Activate
      </button>
    `
    : ""
}

${
  isOwner
    ? `
      <button
        onclick="deleteRider('${rider._id}')"
        style="
          background:#dc2626;
          margin-left:6px;
        "
      >
        Delete
      </button>
    `
    : ""
}

</td>

</tr>

`;

  });

}


function filterRiders() {

  const search =
    document.getElementById(
      "riderSearchInput"
    ).value.toLowerCase();

  const status =
    document.getElementById(
      "riderStatusFilter"
    ).value;

  const filtered =
    allRiders.filter(rider => {

      const matchesSearch =
        rider.fullName
          ?.toLowerCase()
          .includes(search) ||
        rider.phone
          ?.toLowerCase()
          .includes(search) ||
        rider.email
          ?.toLowerCase()
          .includes(search) ||
        rider.vehicleType
          ?.toLowerCase()
          .includes(search);

      const riderStatus =
        !rider.isApproved
          ? "pending"
          : rider.isActive
            ? "active"
            : "suspended";

      const matchesStatus =
        status === "all" ||
        status === riderStatus;

      return (
        matchesSearch &&
        matchesStatus
      );

    });

  renderRiders(filtered);

}


async function approveRider(id) {

  const res =
    await fetch(
      `https://mieza.onrender.com/api/admin/riders/${id}/approve`,
      {
        method: "PUT",

        headers: {
          Authorization:
            `Bearer ${token}`
        }
      }
    );

  const data =
    await res.json();

  alert(
    data.message ||
    "Rider approved"
  );

  loadRiders();
  loadStats();
  loadAdminNotifications();

}

async function suspendRider(id) {

  const res =
    await fetch(
      `https://mieza.onrender.com/api/admin/riders/${id}/suspend`,
      {
        method: "PUT",

        headers: {
          Authorization:
            `Bearer ${token}`
        }
      }
    );

  const data =
    await res.json();

  alert(
    data.message ||
    "Rider suspended"
  );

  loadRiders();
  loadAdminNotifications();

}

async function activateRider(id) {

  const res =
    await fetch(
      `https://mieza.onrender.com/api/admin/riders/${id}/activate`,
      {
        method: "PUT",

        headers: {
          Authorization:
            `Bearer ${token}`
        }
      }
    );

  const data =
    await res.json();

  alert(
    data.message ||
    "Rider activated"
  );

  loadRiders();
  loadAdminNotifications();

}

async function deleteShop(id) {

  const confirmDelete =
    confirm(
      "Are you sure you want to permanently delete this shop?"
    );

  if (!confirmDelete) return;

  const res =
    await fetch(
      `https://mieza.onrender.com/api/admin/shops/${id}`,
      {
        method: "DELETE",

        headers: {
          Authorization:
            `Bearer ${token}`
        }
      }
    );

  const data =
    await res.json();

  alert(data.message);

  if (res.ok) {
  loadShops();
  loadStats();
  loadOrders();
  loadAdminNotifications();
}

}


async function deleteRider(id) {

  const confirmDelete =
    confirm(
      "Are you sure you want to permanently delete this rider?"
    );

  if (!confirmDelete) return;

  const res =
    await fetch(
      `https://mieza.onrender.com/api/admin/riders/${id}`,
      {
        method: "DELETE",

        headers: {
          Authorization:
            `Bearer ${token}`
        }
      }
    );

  const data =
    await res.json();

  alert(data.message);

  if (res.ok) {
  loadRiders();
  loadStats();
  loadOrders();
  loadAdminNotifications();
}

}


async function loadAdminNotifications() {

  const res =
    await fetch(
      "https://mieza.onrender.com/api/admin/notifications",
      {
        headers: {
          Authorization:
            `Bearer ${token}`
        }
      }
    );

  const data =
    await res.json();

  document.getElementById(
    "adminNotificationCount"
  ).textContent =
    data.totalPending || 0;

  const box =
    document.getElementById(
      "adminNotificationBox"
    );

  box.innerHTML = "";

  if (!data.totalPending) {

    box.innerHTML =
      "<p>No new pending registrations.</p>";

    return;

  }

  data.pendingShops.forEach(shop => {

    box.innerHTML += `

<div class="admin-notification-item">
  <strong>New Shop Pending Approval</strong>
  <p>${shop.name}</p>
  <small>${shop.phone} • ${shop.email}</small>
</div>

`;

  });

  data.pendingRiders.forEach(rider => {

    box.innerHTML += `

<div class="admin-notification-item">
  <strong>New Rider Pending Approval</strong>
  <p>${rider.name} - ${rider.vehicleType}</p>
  <small>${rider.phone} • ${rider.email}</small>
</div>

`;

  });

}

function toggleAdminNotifications() {

  const box =
    document.getElementById(
      "adminNotificationBox"
    );

  box.style.display =
    box.style.display === "none"
      ? "block"
      : "none";

}



// =====================
// LOGOUT
// =====================

function logoutAdmin() {
  localStorage.removeItem("adminToken");
  localStorage.removeItem("adminUser");

  window.location.replace(
    "admin-login.html"
  );
}


// =====================================================
// RIDE DRIVERS
// =====================================================

async function loadRideDrivers() {

  try {

    const res = await fetch(
      "https://mieza.onrender.com/api/admin/ride-drivers",
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    const drivers = await res.json();

    if (!res.ok) {

      alert(
        drivers.message ||
        "Failed to load ride drivers."
      );

      return;
    }

    allRideDrivers = Array.isArray(drivers)
      ? drivers
      : [];

    renderRideDrivers(allRideDrivers);

  } catch (error) {

    console.error(
      "LOAD RIDE DRIVERS ERROR:",
      error
    );

    alert(
      "Unable to load ride drivers."
    );

  }

}


// =====================================================
// RENDER RIDE DRIVERS
// =====================================================

function renderRideDrivers(drivers) {

  const table =
    document.getElementById(
      "rideDriversTable"
    );

  if (!table) return;

  table.innerHTML = "";


  if (!drivers.length) {

    table.innerHTML = `
      <tr>
        <td
          colspan="5"
          class="ride-driver-empty"
        >
          No ride drivers found.
        </td>
      </tr>
    `;

    return;
  }


  drivers.forEach(driver => {

    const vehicleName =
      [
        driver.vehicleBrand,
        driver.vehicleModel
      ]
      .filter(Boolean)
      .join(" ") ||
      driver.vehicleType ||
      "Not provided";


    const status =
      !driver.isApproved
        ? "Pending Approval"
        : driver.isActive
          ? "Active"
          : "Suspended";


    const statusClass =
      !driver.isApproved
        ? "pending"
        : driver.isActive
          ? "active"
          : "suspended";


    const profilePhoto =
      driver.profilePhoto ||
      "";


    table.innerHTML += `

      <tr>

        <td>

          <div class="ride-driver-table-driver">

            ${
              profilePhoto
                ? `
                  <img
                    src="${escapeHtml(profilePhoto)}"
                    alt="${escapeHtml(driver.fullName || "Ride Driver")}"
                    class="ride-driver-table-avatar"
                  >
                `
                : `
                  <div class="ride-driver-table-avatar placeholder">
                    ${getDriverInitials(driver.fullName)}
                  </div>
                `
            }

            <div>

              <strong>
                ${escapeHtml(
                  driver.fullName ||
                  "Unnamed Driver"
                )}
              </strong>

              <small>
                ${escapeHtml(
                  driver.email ||
                  "No email"
                )}
              </small>

            </div>

          </div>

        </td>


        <td>

          <a
            href="tel:${escapeHtml(driver.phone || "")}"
          >
            ${escapeHtml(
              driver.phone ||
              "N/A"
            )}
          </a>

        </td>


        <td>

          <div class="ride-driver-vehicle-summary">

            <strong>
              ${escapeHtml(vehicleName)}
            </strong>

            <small>
              ${escapeHtml(
                driver.vehicleColor ||
                "Color not provided"
              )}
            </small>

          </div>

        </td>


        <td>

          <span
            class="
              ride-driver-status
              ${statusClass}
            "
          >
            ${status}
          </span>

        </td>


        <td>

          <div class="ride-driver-actions">

            <button
              type="button"
              class="ride-driver-view-btn"
              onclick="viewRideDriverDetails('${driver._id}')"
            >
              View Details
            </button>


            ${
              !driver.isApproved
                ? `
                  <button
                    type="button"
                    onclick="approveRideDriver('${driver._id}')"
                  >
                    Approve
                  </button>
                `
                : ""
            }


            ${
              isOwner &&
              driver.isApproved &&
              driver.isActive
                ? `
                  <button
                    type="button"
                    class="ride-driver-warning-btn"
                    onclick="suspendRideDriver('${driver._id}')"
                  >
                    Suspend
                  </button>
                `
                : ""
            }


            ${
              isOwner &&
              driver.isApproved &&
              !driver.isActive
                ? `
                  <button
                    type="button"
                    onclick="activateRideDriver('${driver._id}')"
                  >
                    Activate
                  </button>
                `
                : ""
            }


            ${
              isOwner
                ? `
                  <button
                    type="button"
                    class="ride-driver-delete-btn"
                    onclick="deleteRideDriver('${driver._id}')"
                  >
                    Delete
                  </button>
                `
                : ""
            }

          </div>

        </td>

      </tr>

    `;

  });

}


// =====================================================
// FILTER RIDE DRIVERS
// =====================================================

function filterRideDrivers() {

  const searchInput =
    document.getElementById(
      "rideDriverSearchInput"
    );

  const statusInput =
    document.getElementById(
      "rideDriverStatusFilter"
    );


  const search =
    searchInput
      ? searchInput.value
          .trim()
          .toLowerCase()
      : "";


  const status =
    statusInput
      ? statusInput.value
      : "all";


  const filtered =
    allRideDrivers.filter(driver => {

      const matchesSearch =

        driver.fullName
          ?.toLowerCase()
          .includes(search)

        ||

        driver.phone
          ?.toLowerCase()
          .includes(search)

        ||

        driver.email
          ?.toLowerCase()
          .includes(search)

        ||

        driver.vehicleType
          ?.toLowerCase()
          .includes(search)

        ||

        driver.vehicleBrand
          ?.toLowerCase()
          .includes(search)

        ||

        driver.vehicleModel
          ?.toLowerCase()
          .includes(search)

        ||

        driver.plateNumber
          ?.toLowerCase()
          .includes(search);


      const driverStatus =

        !driver.isApproved
          ? "pending"
          : driver.isActive
            ? "active"
            : "suspended";


      return (

        matchesSearch &&

        (
          status === "all" ||
          status === driverStatus
        )

      );

    });


  renderRideDrivers(filtered);

}


// =====================================================
// VIEW RIDE DRIVER DETAILS
// =====================================================

function viewRideDriverDetails(id) {

  const driver =
    allRideDrivers.find(
      item => item._id === id
    );


  if (!driver) {

    alert(
      "Ride driver information could not be found."
    );

    return;
  }


  const modal =
    document.getElementById(
      "rideDriverDetailsModal"
    );

  const details =
    document.getElementById(
      "rideDriverDetails"
    );


  if (!modal || !details) return;


  document.getElementById(
    "rideDriverModalTitle"
  ).textContent =
    driver.fullName ||
    "Ride Driver Details";


  details.innerHTML =
    buildRideDriverDetails(driver);


  modal.classList.add("show");

  modal.setAttribute(
    "aria-hidden",
    "false"
  );


  document.body.classList.add(
    "ride-driver-modal-open"
  );

}


// =====================================================
// BUILD DRIVER DETAILS
// =====================================================

function buildRideDriverDetails(driver) {

  const status =
    !driver.isApproved
      ? "Pending Approval"
      : driver.isActive
        ? "Active"
        : "Suspended";


  const statusClass =
    !driver.isApproved
      ? "pending"
      : driver.isActive
        ? "active"
        : "suspended";


  const vehiclePhotos =
    Array.isArray(
      driver.vehiclePhotos
    )
      ? driver.vehiclePhotos
      : [];


  const currentLocation =
    driver.currentLocation || {};


  const hasCoordinates =
    currentLocation.latitude !== undefined &&
    currentLocation.longitude !== undefined;


  const mapsUrl =
    hasCoordinates
      ? `https://www.google.com/maps?q=${encodeURIComponent(
          currentLocation.latitude
        )},${encodeURIComponent(
          currentLocation.longitude
        )}`
      : "";


  return `

    <!-- =========================================
         DRIVER PROFILE
    ========================================== -->

    <div class="ride-driver-profile-section">

      <div class="ride-driver-profile">

        ${
          driver.profilePhoto
            ? `
              <img
                src="${escapeHtml(driver.profilePhoto)}"
                alt="${escapeHtml(driver.fullName || "Ride Driver")}"
                class="ride-driver-profile-photo"
                onclick="openRideDriverImage('${escapeJs(driver.profilePhoto)}')"
              >
            `
            : `
              <div class="ride-driver-profile-photo placeholder">
                ${getDriverInitials(driver.fullName)}
              </div>
            `
        }


        <div class="ride-driver-profile-info">

          <span class="ride-driver-modal-eyebrow">
            DRIVER PROFILE
          </span>

          <h3>
            ${escapeHtml(
              driver.fullName ||
              "Not provided"
            )}
          </h3>

          <p>
            ${escapeHtml(
              driver.email ||
              "No email provided"
            )}
          </p>

          <span
            class="
              ride-driver-status
              ${statusClass}
            "
          >
            ${status}
          </span>

        </div>

      </div>

    </div>


    <!-- =========================================
         PERSONAL INFORMATION
    ========================================== -->

    <div class="ride-driver-detail-section">

      <div class="ride-driver-detail-section-header">

        <h3>Personal Information</h3>

        <span>Identity & contact</span>

      </div>


      <div class="ride-driver-detail-grid">

        ${driverDetail(
          "Full Name",
          driver.fullName
        )}

        ${driverDetail(
          "Phone",
          driver.phone,
          driver.phone
            ? `tel:${driver.phone}`
            : null
        )}

        ${driverDetail(
          "Email",
          driver.email,
          driver.email
            ? `mailto:${driver.email}`
            : null
        )}

        ${driverDetail(
          "Ghana Card / National ID",
          driver.nationalIdNumber
        )}

        ${driverDetail(
          "Driver's Licence Number",
          driver.driverLicenseNumber
        )}

        ${driverDetail(
          "Registration Date",
          formatDriverDate(driver.createdAt)
        )}

      </div>

    </div>


    <!-- =========================================
         VEHICLE INFORMATION
    ========================================== -->

    <div class="ride-driver-detail-section">

      <div class="ride-driver-detail-section-header">

        <h3>Vehicle Information</h3>

        <span>Vehicle verification</span>

      </div>


      <div class="ride-driver-detail-grid">

        ${driverDetail(
          "Vehicle Type",
          driver.vehicleType
        )}

        ${driverDetail(
          "Vehicle Brand",
          driver.vehicleBrand
        )}

        ${driverDetail(
          "Vehicle Model",
          driver.vehicleModel
        )}

        ${driverDetail(
          "Vehicle Color",
          driver.vehicleColor
        )}

        ${driverDetail(
          "Plate Number",
          driver.plateNumber
        )}

      </div>


      ${
        vehiclePhotos.length
          ? `

            <div class="ride-driver-photo-section">

              <h4>
                Vehicle Photos
              </h4>

              <div class="ride-driver-photo-grid">

                ${vehiclePhotos.map(
                  (photo, index) => `

                    <button
                      type="button"
                      class="ride-driver-photo-card"
                      onclick="openRideDriverImage('${escapeJs(photo)}')"
                    >

                      <img
                        src="${escapeHtml(photo)}"
                        alt="Vehicle photo ${index + 1}"
                      >

                      <span>
                        Photo ${index + 1}
                      </span>

                    </button>

                  `
                ).join("")}

              </div>

            </div>

          `
          : `
            <div class="ride-driver-no-data">
              No vehicle photos uploaded.
            </div>
          `
      }

    </div>


    <!-- =========================================
         LOCATION
    ========================================== -->

    <div class="ride-driver-detail-section">

      <div class="ride-driver-detail-section-header">

        <h3>Current Location</h3>

        <span>Driver location</span>

      </div>


      <div class="ride-driver-location-card">

        <div class="ride-driver-location-icon">
          📍
        </div>

        <div>

          <strong>
            ${
              currentLocation.address
                ? escapeHtml(
                    currentLocation.address
                  )
                : "Address not available"
            }
          </strong>

          ${
            hasCoordinates
              ? `
                <small>
                  Latitude:
                  ${escapeHtml(
                    String(
                      currentLocation.latitude
                    )
                  )}
                  &nbsp; • &nbsp;
                  Longitude:
                  ${escapeHtml(
                    String(
                      currentLocation.longitude
                    )
                  )}
                </small>
              `
              : `
                <small>
                  GPS coordinates not available.
                </small>
              `
          }

        </div>

        ${
          mapsUrl
            ? `
              <a
                href="${mapsUrl}"
                target="_blank"
                rel="noopener noreferrer"
                class="ride-driver-map-btn"
              >
                Open Map
              </a>
            `
            : ""
        }

      </div>

    </div>


    <!-- =========================================
         PAYOUT INFORMATION
    ========================================== -->

    <div class="ride-driver-detail-section">

      <div class="ride-driver-detail-section-header">

        <h3>Payout Information</h3>

        <span>
          ${escapeHtml(
            driver.payoutMethod ||
            "Not specified"
          )}
        </span>

      </div>


      ${
        driver.payoutMethod === "momo"
          ? `

            <div class="ride-driver-detail-grid">

              ${driverDetail(
                "Mobile Money Number",
                driver.momoNumber
              )}

              ${driverDetail(
                "Mobile Money Name",
                driver.momoName
              )}

              ${driverDetail(
                "Network",
                driver.momoNetwork
              )}

              ${driverDetail(
                "MoMo Bank Code",
                driver.momoBankCode
              )}

            </div>

          `
          : `

            <div class="ride-driver-detail-grid">

              ${driverDetail(
                "Bank Name",
                driver.bankName
              )}

              ${driverDetail(
                "Bank Code",
                driver.bankCode
              )}

              ${driverDetail(
                "Account Name",
                driver.accountName
              )}

              ${driverDetail(
                "Account Number",
                driver.accountNumber
              )}

            </div>

          `
      }

    </div>


    <!-- =========================================
         DRIVER ACTIVITY
    ========================================== -->

    <div class="ride-driver-detail-section">

      <div class="ride-driver-detail-section-header">

        <h3>Driver Activity</h3>

        <span>Account status</span>

      </div>


      <div class="ride-driver-stat-grid">

        ${driverStat(
          "Approval",
          driver.isApproved
            ? "Approved"
            : "Pending"
        )}

        ${driverStat(
          "Account",
          driver.isActive
            ? "Active"
            : "Suspended"
        )}

        ${driverStat(
          "Online",
          driver.isOnline
            ? "Yes"
            : "No"
        )}

        ${driverStat(
          "Available",
          driver.isAvailable
            ? "Yes"
            : "No"
        )}

        ${driverStat(
          "Total Trips",
          driver.totalTrips ?? 0
        )}

        ${driverStat(
          "Average Rating",
          driver.averageRating ?? 0
        )}

        ${driverStat(
          "Wallet Balance",
          `₵${Number(
            driver.walletBalance || 0
          ).toFixed(2)}`
        )}

      </div>

    </div>


    <!-- =========================================
         PAYMENT / REGISTRATION
    ========================================== -->

    <div class="ride-driver-detail-section">

      <div class="ride-driver-detail-section-header">

        <h3>Registration</h3>

        <span>Payment record</span>

      </div>


      <div class="ride-driver-detail-grid">

        ${driverDetail(
          "Registration Fee",
          `₵${Number(
            driver.registrationFee || 0
          ).toFixed(2)}`
        )}

        ${driverDetail(
          "Payment Reference",
          driver.paystackReference
        )}

      </div>

    </div>


    <!-- =========================================
         ACTIONS
    ========================================== -->

    <div class="ride-driver-modal-actions">

      ${
        !driver.isApproved
          ? `
            <button
              type="button"
              onclick="approveRideDriver('${driver._id}'); closeRideDriverDetails();"
            >
              Approve Driver
            </button>
          `
          : ""
      }


      ${
        isOwner &&
        driver.isApproved &&
        driver.isActive
          ? `
            <button
              type="button"
              class="ride-driver-warning-btn"
              onclick="suspendRideDriver('${driver._id}'); closeRideDriverDetails();"
            >
              Suspend Driver
            </button>
          `
          : ""
      }


      ${
        isOwner &&
        driver.isApproved &&
        !driver.isActive
          ? `
            <button
              type="button"
              onclick="activateRideDriver('${driver._id}'); closeRideDriverDetails();"
            >
              Activate Driver
            </button>
          `
          : ""
      }


      <button
        type="button"
        class="ride-driver-secondary-btn"
        onclick="closeRideDriverDetails()"
      >
        Close
      </button>

    </div>

  `;

}


// =====================================================
// DETAIL FIELD HELPER
// =====================================================

function driverDetail(
  label,
  value,
  href = null
) {

  const displayValue =
    value !== undefined &&
    value !== null &&
    String(value).trim() !== ""
      ? String(value)
      : "Not provided";


  return `

    <div class="ride-driver-detail-item">

      <span>
        ${escapeHtml(label)}
      </span>


      ${
        href
          ? `
            <a
              href="${escapeHtml(href)}"
            >
              ${escapeHtml(displayValue)}
            </a>
          `
          : `
            <strong>
              ${escapeHtml(displayValue)}
            </strong>
          `
      }

    </div>

  `;

}


// =====================================================
// STAT HELPER
// =====================================================

function driverStat(
  label,
  value
) {

  return `

    <div class="ride-driver-stat">

      <span>
        ${escapeHtml(label)}
      </span>

      <strong>
        ${escapeHtml(
          String(value)
        )}
      </strong>

    </div>

  `;

}


// =====================================================
// CLOSE DETAILS MODAL
// =====================================================

function closeRideDriverDetails() {

  const modal =
    document.getElementById(
      "rideDriverDetailsModal"
    );


  if (!modal) return;


  modal.classList.remove("show");

  modal.setAttribute(
    "aria-hidden",
    "true"
  );


  document.body.classList.remove(
    "ride-driver-modal-open"
  );

}


// =====================================================
// OPEN IMAGE
// =====================================================

function openRideDriverImage(url) {

  const modal =
    document.getElementById(
      "rideDriverImageModal"
    );

  const image =
    document.getElementById(
      "rideDriverPreviewImage"
    );


  if (!modal || !image || !url) {
    return;
  }


  image.src = url;

  modal.classList.add("show");

  modal.setAttribute(
    "aria-hidden",
    "false"
  );

}


// =====================================================
// CLOSE IMAGE
// =====================================================

function closeRideDriverImage() {

  const modal =
    document.getElementById(
      "rideDriverImageModal"
    );

  const image =
    document.getElementById(
      "rideDriverPreviewImage"
    );


  if (!modal) return;


  modal.classList.remove("show");

  modal.setAttribute(
    "aria-hidden",
    "true"
  );


  if (image) {
    image.src = "";
  }

}


// =====================================================
// DRIVER INITIALS
// =====================================================

function getDriverInitials(name) {

  if (!name) return "RD";


  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(
      word =>
        word.charAt(0)
    )
    .join("")
    .toUpperCase();

}


// =====================================================
// DATE FORMAT
// =====================================================

function formatDriverDate(date) {

  if (!date) {
    return "Not available";
  }


  const parsed =
    new Date(date);


  if (Number.isNaN(
    parsed.getTime()
  )) {

    return String(date);

  }


  return parsed.toLocaleDateString(
    "en-GH",
    {
      day: "2-digit",
      month: "long",
      year: "numeric"
    }
  );

}


// =====================================================
// HTML ESCAPE
// Prevents driver data from injecting HTML
// =====================================================

function escapeHtml(value) {

  if (
    value === undefined ||
    value === null
  ) {

    return "";

  }


  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}


// =====================================================
// JAVASCRIPT STRING ESCAPE
// =====================================================

function escapeJs(value) {

  if (
    value === undefined ||
    value === null
  ) {

    return "";

  }


  return String(value)
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r");

}


// =====================================================
// KEYBOARD SUPPORT
// =====================================================

document.addEventListener(
  "keydown",
  event => {

    if (
      event.key === "Escape"
    ) {

      closeRideDriverImage();

      closeRideDriverDetails();

    }

  }
);


// =====================================================
// APPROVE RIDE DRIVER
// =====================================================

async function approveRideDriver(id) {

  try {

    const res =
      await fetch(
        `https://mieza.onrender.com/api/admin/ride-drivers/${id}/approve`,
        {
          method: "PUT",

          headers: {
            Authorization:
              `Bearer ${token}`
          }

        }
      );


    const data =
      await res.json();


    alert(
      data.message ||
      "Ride driver approved."
    );


    if (res.ok) {

      await loadRideDrivers();

      await loadStats();

      await loadAdminNotifications();

    }

  } catch (error) {

    console.error(
      "APPROVE RIDE DRIVER ERROR:",
      error
    );

    alert(
      "Unable to approve ride driver."
    );

  }

}


// =====================================================
// SUSPEND RIDE DRIVER
// =====================================================

async function suspendRideDriver(id) {

  try {

    const res =
      await fetch(
        `https://mieza.onrender.com/api/admin/ride-drivers/${id}/suspend`,
        {
          method: "PUT",

          headers: {
            Authorization:
              `Bearer ${token}`
          }

        }
      );


    const data =
      await res.json();


    alert(
      data.message ||
      "Ride driver suspended."
    );


    if (res.ok) {

      await loadRideDrivers();

      await loadAdminNotifications();

    }

  } catch (error) {

    console.error(
      "SUSPEND RIDE DRIVER ERROR:",
      error
    );

    alert(
      "Unable to suspend ride driver."
    );

  }

}


// =====================================================
// ACTIVATE RIDE DRIVER
// =====================================================

async function activateRideDriver(id) {

  try {

    const res =
      await fetch(
        `https://mieza.onrender.com/api/admin/ride-drivers/${id}/activate`,
        {
          method: "PUT",

          headers: {
            Authorization:
              `Bearer ${token}`
          }

        }
      );


    const data =
      await res.json();


    alert(
      data.message ||
      "Ride driver activated."
    );


    if (res.ok) {

      await loadRideDrivers();

      await loadAdminNotifications();

    }

  } catch (error) {

    console.error(
      "ACTIVATE RIDE DRIVER ERROR:",
      error
    );

    alert(
      "Unable to activate ride driver."
    );

  }

}


// =====================================================
// DELETE RIDE DRIVER
// =====================================================

async function deleteRideDriver(id) {

  const confirmDelete =
    confirm(
      "Are you sure you want to permanently delete this ride driver?"
    );


  if (!confirmDelete) return;


  try {

    const res =
      await fetch(
        `https://mieza.onrender.com/api/admin/ride-drivers/${id}`,
        {
          method: "DELETE",

          headers: {
            Authorization:
              `Bearer ${token}`
          }

        }
      );


    const data =
      await res.json();


    alert(
      data.message ||
      "Ride driver deleted."
    );


    if (res.ok) {

      closeRideDriverDetails();

      await loadRideDrivers();

      await loadStats();

      await loadAdminNotifications();

    }

  } catch (error) {

    console.error(
      "DELETE RIDE DRIVER ERROR:",
      error
    );

    alert(
      "Unable to delete ride driver."
    );

  }

}

// INIT

initializeAdminDashboard();