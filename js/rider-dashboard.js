const rider =
JSON.parse(
  localStorage.getItem("rider")
);

const token =
localStorage.getItem(
  "riderToken"
);

if (!rider || !token) {

  location.href =
    "rider-login.html";

}

if (
  rider &&
  rider.isApproved === false
) {

  alert(
    "Your rider account is awaiting admin approval."
  );

  localStorage.removeItem("rider");
  localStorage.removeItem("riderToken");

  location.href =
    "rider-login.html";

}

// ==============================
// LOAD RIDER EARNINGS
// ==============================

async function loadRiderEarnings() {

  try {

    const res =
      await fetch(
        `https://mieza.onrender.com/api/rider-orders/earnings/${rider._id}`
      );

    const data =
      await res.json();

    document.getElementById(
      "riderTodayEarnings"
    ).textContent =
      `₵${data.todayEarnings || 0}`;

    document.getElementById(
      "riderWeekEarnings"
    ).textContent =
      `₵${data.weekEarnings || 0}`;

    document.getElementById(
      "riderMonthEarnings"
    ).textContent =
      `₵${data.monthEarnings || 0}`;

    document.getElementById(
      "riderPendingSettlement"
    ).textContent =
      `₵${data.pendingSettlement || 0}`;

    document.getElementById(
      "riderTotalPaidOut"
    ).textContent =
      `₵${data.totalPaidOut || 0}`;

    document.getElementById(
      "riderMiezaCommission"
    ).textContent =
      `₵${data.totalMiezaCommission || 0}`;

  } catch (err) {

    console.log(err);

  }

}

// ==============================
// AVAILABLE ORDERS
// ==============================

async function loadOrders() {

  try {

    const res =
      await fetch(
        "https://mieza.onrender.com/api/rider-orders/available"
      );

    const orders =
      await res.json();

    const container =
      document.getElementById(
        "ordersContainer"
      );

    container.innerHTML = "";

    if (!orders.length) {

      container.innerHTML =
        "<p>No deliveries available</p>";

      return;

    }

    orders.forEach(order => {

      container.innerHTML += `

<div class="order-card">

<h3>
Order #${order._id.slice(-6)}
</h3>

<p>
<strong>Customer:</strong>
${order.customerName}
</p>

<p>
<strong>Address:</strong>
${order.customerAddress}
</p>

<p>
<strong>Distance:</strong>
${order.distanceKm || 0} km
</p>

<p>
<strong>Delivery Fee:</strong>
₵${order.deliveryFee || 0}
</p>

<p>
<strong>Mieza Commission:</strong>
₵${order.deliveryCommission || 0}
</p>

<p>
<strong>Your Earnings:</strong>
₵${order.riderEarnings || 0}
</p>

<p>
<strong>Customer Phone:</strong>
<a href="tel:${order.customerPhone}">
${order.customerPhone}
</a>
</p>

<p>
<strong>Vendor:</strong>
${order.shopId?.shopName || "Vendor"}
</p>

<p>
<strong>Vendor Phone:</strong>
<a href="tel:${order.shopId?.phone || ""}">
${order.shopId?.phone || "Not available"}
</a>
</p>

<button
onclick="acceptOrder('${order._id}')"
>
Accept Delivery
</button>

</div>

`;

    });

  } catch (err) {

    console.log(err);

  }

}

// ==============================
// ACCEPT ORDER
// ==============================

async function acceptOrder(orderId) {

  try {

    const res =
      await fetch(
        `https://mieza.onrender.com/api/rider-orders/accept/${orderId}`,
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({
            riderId:
              rider._id
          })
        }
      );

    const data =
      await res.json();

    alert(
      data.message
    );

    loadOrders();
    loadMyOrders();
    loadRiderEarnings();

  } catch (err) {

    console.log(err);

  }

}

// ==============================
// MY ORDERS
// ==============================

async function loadMyOrders() {

  try {

    const res =
      await fetch(
        `https://mieza.onrender.com/api/rider-orders/my-orders/${rider._id}`
      );

    const orders =
      await res.json();

    const container =
      document.getElementById(
        "myOrdersContainer"
      );

    container.innerHTML = "";

    if (!orders.length) {

      container.innerHTML =
        "<p>No assigned deliveries</p>";

      return;

    }

    orders.forEach(order => {

      container.innerHTML += `

<div class="order-card">

<h3>
Order #${order._id.slice(-6)}
</h3>

<p>
<strong>Customer:</strong>
${order.customerName}
</p>

<p>
<strong>Status:</strong>
${order.status}
</p>

<p>
<strong>Distance:</strong>
${order.distanceKm || 0} km
</p>

<p>
<strong>Delivery Fee:</strong>
₵${order.deliveryFee || 0}
</p>

<p>
<strong>Mieza Commission:</strong>
₵${order.deliveryCommission || 0}
</p>

<p>
<strong>Your Earnings:</strong>
₵${order.riderEarnings || 0}
</p>

<p>
<strong>Customer Phone:</strong>
<a href="tel:${order.customerPhone}">
${order.customerPhone}
</a>
</p>

<p>
<strong>Vendor:</strong>
${order.shopId?.shopName || "Vendor"}
</p>

<p>
<strong>Vendor Phone:</strong>
<a href="tel:${order.shopId?.phone || ""}">
${order.shopId?.phone || "Not available"}
</a>
</p>

<button
onclick="startDelivery('${order._id}')"
>
Start Delivery
</button>

<button
onclick="completeDelivery('${order._id}')"
>
Complete Delivery
</button>

</div>

`;

    });

  } catch (err) {

    console.log(err);

  }

}

// ==============================
// START DELIVERY
// ==============================

async function startDelivery(orderId) {

  try {

    await fetch(
      `https://mieza.onrender.com/api/rider-orders/start/${orderId}`,
      {
        method: "PUT"
      }
    );

    window.location.href =
      `rider-delivery.html?orderId=${orderId}`;

  } catch (err) {

    console.log(err);

  }

}

// ==============================
// COMPLETE DELIVERY
// ==============================

async function completeDelivery(orderId) {

  try {

    await fetch(
      `https://mieza.onrender.com/api/rider-orders/complete/${orderId}`,
      {
        method: "PUT"
      }
    );

    alert(
      "Delivery completed"
    );

    loadMyOrders();
    loadRiderEarnings();

  } catch (err) {

    console.log(err);

  }

}

// ==============================
// LOGOUT
// ==============================

function logout() {

  localStorage.removeItem("riderToken");
  localStorage.removeItem("rider");

  window.location.href =
    "rider-login.html";

}

// ==============================
// INIT
// ==============================

loadRiderEarnings();

loadOrders();

loadMyOrders();

setInterval(() => {

  loadOrders();

  loadMyOrders();

  loadRiderEarnings();

}, 5000);