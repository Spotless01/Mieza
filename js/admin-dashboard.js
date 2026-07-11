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

const isOwner =
  adminUser.role === "owner";

  document.addEventListener(
  "DOMContentLoaded",
  () => {

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
);

const isCofounder =
  adminUser.role === "cofounder";

let allShops = [];

let allRiders = [];

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

  localStorage.removeItem(
    "adminToken"
  );

  localStorage.removeItem(
    "adminUser"
  );

  location.href =
    "admin-login.html";

}

// INIT

initializeAdminDashboard();