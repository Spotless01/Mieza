const token =
localStorage.getItem(
  "adminToken"
);

if (!token) {

  location.href =
  "admin-login.html";

}

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

  const table =
    document.getElementById(
      "shopsTable"
    );

  table.innerHTML = "";

  shops.forEach(shop => {

    table.innerHTML += `

<tr>

<td>${shop.shopName}</td>

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
      onclick="approveShop('${shop._id}')">
      Approve
      </button>
    `
    : shop.isActive
      ? `
        <button
        onclick="suspendShop('${shop._id}')">
        Suspend
        </button>
      `
      : `
        <button
        onclick="activateShop('${shop._id}')">
        Activate
        </button>
      `
}

</td>

</tr>

`;

  });

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

  const container =
    document.getElementById(
      "ordersTable"
    );

  container.innerHTML = "";

  orders.forEach(order => {

    container.innerHTML += `

<div class="card">

<h4>
Order #${order._id.slice(-6)}
</h4>

<p>
Customer:
${order.customerName}
</p>

<p>
Total:
₵${order.totalAmount}
</p>

<p>
Status:
${order.status}
</p>

</div>

`;

  });

}

// =====================
// LOGOUT
// =====================

function logoutAdmin() {

  localStorage.removeItem(
    "adminToken"
  );

  location.href =
    "admin-login.html";

}

// INIT

loadStats();

loadShops();

loadOrders();