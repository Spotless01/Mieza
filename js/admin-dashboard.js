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
    "https://mieza.onrender.com/api/admin/stats"
  );

  const stats =
    await res.json();

  document.getElementById(
    "totalOrders"
  ).textContent =
    stats.totalOrders;

  document.getElementById(
    "revenue"
  ).textContent =
    `₵${stats.revenue}`;

  document.getElementById(
    "commission"
  ).textContent =
    `₵${stats.commissions}`;

}

// =====================
// LOAD SHOPS
// =====================

async function loadShops() {

  const res = await fetch(
    "https://mieza.onrender.com/api/admin/shops"
  );

  const shops =
    await res.json();

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

${shop.isActive
? "Active"
: "Suspended"}

</td>

<td>

<button
onclick="approveShop(
'${shop._id}'
)">
Approve
</button>

<button
onclick="suspendShop(
'${shop._id}'
)">
Suspend
</button>

</td>

</tr>

`;

  });

}

// =====================
// APPROVE SHOP
// =====================

async function approveShop(id) {

  await fetch(

`https://mieza.onrender.com/api/admin/shops/${id}/approve`,

{
method:"PUT"
}

  );

  loadShops();

}

// =====================
// SUSPEND SHOP
// =====================

async function suspendShop(id) {

  await fetch(

`https://mieza.onrender.com/api/admin/shops/${id}/suspend`,

{
method:"PUT"
}

  );

  loadShops();

}

// =====================
// LOAD ORDERS
// =====================

async function loadOrders() {

  const res =
    await fetch(

"https://mieza.onrender.com/api/admin/orders"

    );

  const orders =
    await res.json();

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