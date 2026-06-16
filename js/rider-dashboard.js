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

  } catch (err) {

    console.log(err);

  }

  loadRiderEarnings();

}

async function loadOrders() {

try {

const res =
await fetch(
"https://mieza.onrender.com/api/rider-orders/available"
);

const orders =
await res.json();

console.log("Available Orders Response:", orders);

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
Customer:
${order.customerName}
</p>

<p>
Address:
${order.customerAddress}
</p>

<p>
Delivery Fee:
₵${order.deliveryFee}
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

}

catch(err) {

console.log(err);

}

}

async function acceptOrder(
orderId
) {

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

}

catch(err) {

console.log(err);

}

}

async function loadMyOrders() {

try {

const res =
await fetch(

`https://mieza.onrender.com/api/rider-orders/my-orders/${rider._id}`

);

const orders =
await res.json();

console.log("My Orders Response:", orders);

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
Customer:
${order.customerName}
</p>

<p>
Status:
${order.status}
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

}

catch(err) {

console.log(err);

}

}

async function startDelivery(
orderId
) {

try {

await fetch(

`https://mieza.onrender.com/api/rider-orders/start/${orderId}`,

{
method: "PUT"
}

);

window.location.href =
`rider-delivery.html?orderId=${orderId}`;

}

catch(err) {

console.log(err);

}

}

async function completeDelivery(
orderId
) {

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

}

catch(err) {

console.log(err);

}

}




function logout() {

  localStorage.removeItem("riderToken");

  localStorage.removeItem("rider");

  window.location.href =
    "rider-login.html";

}

loadRiderEarnings();

loadOrders();

loadMyOrders();

setInterval(() => {

loadOrders();

loadMyOrders();

}, 5000);