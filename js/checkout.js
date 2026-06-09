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

      navigator.geolocation.getCurrentPosition(

        async position => {

  const lat =
    position.coords.latitude;

  const lng =
    position.coords.longitude;

  document.getElementById(
    "latitude"
  ).value = lat;

  document.getElementById(
    "longitude"
  ).value = lng;

  const cart =
JSON.parse(
  localStorage.getItem("miezaCart")
) || [];

if (cart.length > 0) {

  const groupedShops = {};

cart.forEach(item => {

  if (!groupedShops[item.shopId]) {

    groupedShops[item.shopId] = [];

  }

  groupedShops[item.shopId].push(item);

});

let totalDeliveryFee = 0;

let totalDistance = 0;

window.shopDeliveryFees = {};

const uniqueShops = [
  ...new Set(
    cart.map(item => item.shopId)
  )
];

for (const shopId of uniqueShops) {

  const deliveryRes =
    await fetch(
      `${API_URL}/delivery/calculate`,
      {
        method: "POST",

        headers: {
          "Content-Type":
          "application/json"
        },

        body: JSON.stringify({

          shopId,

          customerLatitude: lat,

          customerLongitude: lng

        })
      }
    );

  const deliveryData =
    await deliveryRes.json();

    window.shopDeliveryFees[shopId] =
  deliveryData.deliveryFee;

  totalDeliveryFee +=
    deliveryData.deliveryFee;

  totalDistance +=
    deliveryData.distanceKm;
}

document.getElementById(
  "deliveryFee"
).textContent =
  `₵${totalDeliveryFee}`;

document.getElementById(
  "deliveryDistance"
).textContent =
  `${totalDistance.toFixed(1)} km`;

const subtotal =
  cart.reduce(
    (sum, item) =>
      sum + (item.price * item.qty),
    0
  );

const grandTotal =
  subtotal +
  totalDeliveryFee;

document.getElementById(
  "total"
).textContent =
  `₵${grandTotal}`;

window.calculatedDeliveryFee =
  totalDeliveryFee;

} // <-- CLOSE if(cart.length > 0)

try {

  const response =
    await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );

    const data =
      await response.json();

    const address =
      data.address;

    const locationText =
      `${
        address.suburb ||
        address.neighbourhood ||
        address.city_district ||
        ""
      }, ${
        address.city ||
        address.town ||
        address.county ||
        ""
      }`;

    document.querySelector(
      "input[name='location']"
    ).value =
      locationText;

  } catch(err) {

    console.log(err);

    document.querySelector(
      "input[name='location']"
    ).value =
      `${lat}, ${lng}`;

  }

  locationBtn.textContent =
    "Location Added ✓";

},

        err => {

          alert(
            "Unable to get location"
          );

          console.log(err);

          locationBtn.textContent =
            "Use My Current Location";
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