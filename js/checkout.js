// ================================
// MIEZA — CHECKOUT SYSTEM
// ================================

const API_URL = "https://mieza.onrender.com/api";

const PAYSTACK_PUBLIC_KEY =
  "pk_test_ae5cd01bf961398b8a0a932344da0c215ba02c04";

document.addEventListener("DOMContentLoaded", () => {

  const form =
    document.getElementById("checkout-form");

  const btn =
    document.getElementById("placeOrderBtn");

  const success =
    document.getElementById("order-success");

  const section =
    document.getElementById("checkout-section");

  if (!form) return;


  const locationBtn =
  document.getElementById(
    "getCustomerLocation"
  );

if (locationBtn) {

  locationBtn.addEventListener(
    "click",
    () => {

      if (
        !navigator.geolocation
      ) {

        alert(
          "Geolocation not supported"
        );

        return;
      }

      locationBtn.textContent =
        "Getting location...";

        locationBtn.textContent =
"Waiting for GPS...";

      const watchId =
navigator.geolocation.watchPosition(

async (position) => {

  const latitude =
    position.coords.latitude;

  const longitude =
    position.coords.longitude;

    console.log(
  "Accuracy:",
  position.coords.accuracy
);

if (position.coords.accuracy > 200) {

  locationBtn.textContent =
    `Waiting for better GPS (${Math.round(position.coords.accuracy)}m)...`;

  return;

}

if (position.coords.accuracy > 50) {

  locationBtn.textContent =
    `Improving GPS (${Math.round(position.coords.accuracy)}m)...`;

  return;

}

  console.log(
    "Latitude:",
    latitude
  );

  console.log(
    "Longitude:",
    longitude
  );

  navigator.geolocation.clearWatch(
  watchId
);

  locationBtn.textContent =
    "Use Current Location";

  // Put these into your form fields
document.getElementById(
  "latitude"
).value = latitude;

document.getElementById(
  "longitude"
).value = longitude;

// Put coordinates into hidden fields
document.getElementById(
  "latitude"
).value = latitude;

document.getElementById(
  "longitude"
).value = longitude;

// Temporary text while fetching address
document.getElementById(
  "location"
).value =
  "Fetching address...";

try {

  const response =
    await fetch(

`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,

    {
      headers: {
        "Accept":
          "application/json"
      }
    }

  );

  const data =
    await response.json();

  console.log(
    "NOMINATIM RESPONSE:",
    data
  );

  if (
    data &&
    data.display_name
  ) {

    document.getElementById(
      "location"
    ).value =
      data.display_name;

  } else {

    document.getElementById(
      "location"
    ).value =
      `${latitude}, ${longitude}`;

  }

} catch (err) {

  console.log(
    "Reverse geocoding failed:",
    err
  );

  document.getElementById(
    "location"
  ).value =
    `${latitude}, ${longitude}`;

}

document.getElementById(
  "locationStatus"
).textContent =
`Location captured:
${latitude.toFixed(5)},
${longitude.toFixed(5)}`;

},


(error) => {

  console.log(error);

  locationBtn.textContent =
    "Use Current Location";

  alert(
    "Unable to get your location"
  );

},

{
  enableHighAccuracy: true,
  timeout: 30000,
  maximumAge: 0
}

);

    }
  );

}

  // =====================================
  // PLACE ORDER
  // =====================================

  form.addEventListener("submit", async e => {

    e.preventDefault();

    const cart =
      JSON.parse(
        localStorage.getItem("miezaCart")
      ) || [];

    if (cart.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    btn.textContent = "Placing order...";
    btn.disabled = true;

    try {

      const data = new FormData(form);

      // =====================================
      // GROUP CART BY SHOP
      // =====================================

      const groupedByShop = {};

      cart.forEach(item => {

        if (!groupedByShop[item.shopId]) {
          groupedByShop[item.shopId] = [];
        }

        groupedByShop[item.shopId].push(item);
      });

      
      // =====================================
// TOTAL AMOUNT
// =====================================

const subtotal = cart.reduce(
  (sum, item) =>
    sum + item.price * item.qty,
  0
);

const deliveryFee =
  window.calculatedDeliveryFee || 0;

const grandTotal =
  subtotal + deliveryFee;

// =====================================
// PAYSTACK PAYMENT
// =====================================
const handler = PaystackPop.setup({

  key: PAYSTACK_PUBLIC_KEY,

  email: data.get("email"),

  amount: grandTotal * 100,

  currency: "GHS",

  ref: "MIEZA_" + Date.now(),

  callback: function(response) {

  console.log(
    "PAYSTACK CALLBACK:",
    response
  );

  (async () => {

    try {

      // =============================
      // VERIFY PAYMENT
      // =============================

      console.log(
  "Reference being verified:",
  response.reference
);

let verifyData = null;

for (let i = 0; i < 5; i++) {

  const verifyRes = await fetch(
    `${API_URL}/payment/verify/${response.reference}`
  );

  verifyData =
    await verifyRes.json();

  console.log(
    `Verification attempt ${i + 1}:`,
    verifyData
  );

  if (
    verifyData &&
    verifyData.data &&
    verifyData.data.status === "success"
  ) {
    break;
  }

  await new Promise(resolve =>
    setTimeout(resolve, 3000)
  );
}

      // =============================
      // CHECK PAYMENT STATUS
      // =============================

      if (
  !verifyData ||
  !verifyData.data ||
  verifyData.data.status !== "success"
) {

  console.log(
    "Verification response:",
    verifyData
  );

  alert(
    "Payment verification failed"
  );

  return;
}

      // =============================
      // CREATE ORDERS
      // =============================

      for (const shopId in groupedByShop) {

  const items =
    groupedByShop[shopId];

  const shopSubtotal =
    items.reduce(
      (sum, item) =>
        sum + item.price * item.qty,
      0
    );

  const shopDeliveryFee =

  window.shopDeliveryFees?.[shopId] || 0;


  const totalAmount =
    shopSubtotal + shopDeliveryFee;

    const commissionRevenue =
  shopSubtotal * 0.10;

const vendorRevenue =
  shopSubtotal - commissionRevenue;

  const orderRes = await fetch(
    `${API_URL}/orders`,
    {
      method: "POST",

      headers: {
        "Content-Type":
          "application/json"
      },

      body: JSON.stringify({

  customerName: data.get("name"),
  customerPhone: data.get("phone"),
  customerEmail: data.get("email"),
  customerAddress: data.get("location"),

  customerLatitude:
  document.getElementById(
    "latitude"
  ).value,

customerLongitude:
  document.getElementById(
    "longitude"
  ).value,

  shopId,

  paymentReference:
    response.reference,

  subtotal: shopSubtotal,

  deliveryFee: shopDeliveryFee,

  totalAmount,

  commissionRevenue,

  vendorRevenue,

  settlementStatus: "pending",

  items: items.map(item => ({
    productId: item._id || item.id,
    name: item.name,
    price: item.price,
    image: item.image,
    quantity: item.qty
  }))
})
    }
  );

  const orderData =
    await orderRes.json();

  localStorage.setItem(
    "lastOrderId",
    orderData._id
  );
}
      // =============================
      // CLEAR CART
      // =============================

      localStorage.removeItem(
        "miezaCart"
      );

      // =============================
      // RESET FORM
      // =============================

      form.reset();

      // =============================
      // SHOW SUCCESS
      // =============================

      section.style.display =
        "none";

      success.style.display =
        "block";

      success.classList.remove(
        "hidden"
      );

      alert(
`Payment successful!

Your Order ID is:

${localStorage.getItem("lastOrderId")}

Please save this ID to track your order.`
);

    } catch (err) {

      console.log(err);

      alert("Order failed");

    }

  })();

},

  onClose: function() {

    alert("Payment cancelled");

  }

});

handler.openIframe();

  } catch (err) {

      console.log(err);

      alert("Order failed");

    } finally {

      btn.textContent = "Place Order";

      btn.disabled = false;
    }
  });
});