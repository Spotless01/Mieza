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
  `₵${Number(data.commissionOwed || 0).toFixed(2)}`;

document.getElementById(
  "riderTotalPaidOut"
).textContent =
  `₵${Number(data.commissionPaid || 0).toFixed(2)}`;

document.getElementById(
  "riderMiezaCommission"
).textContent =
  `₵${Number(data.totalCommissionAccrued || 0).toFixed(2)}`;

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
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        }
      );

    const data =
      await res.json();

    if (!res.ok) {
      alert(data.message || "Failed to accept delivery");
      return;
    }

    alert(data.message || "Delivery accepted");

    loadOrders();
    loadMyOrders();
    loadRiderEarnings();

  } catch (err) {

    console.log(err);

    alert("Server error");

  }

}

// ==============================
// MY ORDERS
// ==============================

async function loadMyOrders() {

  try {


    const savedPins = {};

document
  .querySelectorAll(
    ".delivery-pin-box input"
  )
  .forEach(input => {

    const orderId =
      input.id.replace("pin-", "");

    savedPins[orderId] =
      input.value;

  });

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

${
  order.status === "assigned_to_rider"
    ? `
      <button
        onclick="startDelivery('${order._id}')"
      >
        Start Delivery
      </button>
    `
    : ""
}

${
  order.status === "out_for_delivery"
    ? `
      <div class="delivery-pin-box">

        <label for="pin-${order._id}">
          Customer delivery PIN
        </label>

        <input
          type="text"
          inputmode="numeric"
          pattern="[0-9]*"
          id="pin-${order._id}"
          placeholder="Enter 6-digit PIN"
          maxlength="6"
          autocomplete="one-time-code"
        >

        <button
          onclick="completeDelivery('${order._id}')"
        >
          Verify PIN & Complete
        </button>

      </div>
    `
    : ""
}

${
  order.status === "delivered"
    ? `
      <p class="delivery-completed-label">
        ✅ Delivery completed
      </p>
    `
    : ""
}

</div>

`;

    });

    Object.entries(savedPins)
  .forEach(([orderId, pin]) => {

    const input =
      document.getElementById(
        `pin-${orderId}`
      );

    if (input) {
      input.value = pin;
    }

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

    const pinInput =
      document.getElementById(
        `pin-${orderId}`
      );

    const deliveryPin =
      pinInput?.value.trim();

    if (!deliveryPin) {
      alert(
        "Please enter the delivery PIN from the customer."
      );
      return;
    }

    const res =
      await fetch(
        `https://mieza.onrender.com/api/rider-orders/complete/${orderId}`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },

          body: JSON.stringify({
            deliveryPin
          })
        }
      );

    const data =
      await res.json();

    if (!res.ok) {
      alert(
        data.message ||
        "Failed to complete delivery"
      );
      return;
    }

    alert(
      data.message ||
      "Delivery completed successfully"
    );

    loadMyOrders();
    loadRiderEarnings();

  } catch (err) {

    console.log(err);

    alert("Server error");

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
  loadRiderEarnings();

  const activeElement =
    document.activeElement;

  const riderTypingPin =
    activeElement &&
    activeElement.matches(
      ".delivery-pin-box input"
    );

  if (!riderTypingPin) {
    loadMyOrders();
  }

}, 15000);