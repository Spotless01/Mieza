// ======================================
// MIEZA — DIRECT VENDOR PAYMENT CHECKOUT
// ======================================

const API_URL =
  "https://mieza.onrender.com/api";

window.shopDeliveryFees = {};
window.shopDeliveryCommissions = {};
window.shopRiderEarnings = {};
window.shopPaymentDetails = {};

document.addEventListener("DOMContentLoaded", () => {

  const form =
    document.getElementById("checkout-form");

  const btn =
    document.getElementById("placeOrderBtn");

  const success =
    document.getElementById("order-success");

  const section =
    document.getElementById("checkout-section");

  const locationBtn =
    document.getElementById("getCustomerLocation");

  if (!form) return;

  // =====================================
  // CUSTOMER LOCATION
  // =====================================

  if (locationBtn) {

    locationBtn.addEventListener("click", () => {

      if (!navigator.geolocation) {
        alert("Geolocation is not supported on this device.");
        return;
      }

      locationBtn.disabled = true;
      locationBtn.textContent = "Waiting for GPS...";

      const watchId =
        navigator.geolocation.watchPosition(

          async position => {

            const accuracy =
              position.coords.accuracy;

            if (accuracy > 200) {
              locationBtn.textContent =
                `Waiting for better GPS (${Math.round(accuracy)}m)...`;
              return;
            }

            if (accuracy > 50) {
              locationBtn.textContent =
                `Improving GPS (${Math.round(accuracy)}m)...`;
              return;
            }

            navigator.geolocation.clearWatch(watchId);

            const latitude =
              position.coords.latitude;

            const longitude =
              position.coords.longitude;

            document.getElementById("latitude").value =
              latitude;

            document.getElementById("longitude").value =
              longitude;

            document.getElementById("location").value =
              "Fetching address...";

            try {

              const response =
                await fetch(
                  `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
                  {
                    headers: {
                      Accept: "application/json"
                    }
                  }
                );

              const data =
                await response.json();

              document.getElementById("location").value =
                data?.display_name ||
                `${latitude}, ${longitude}`;

            } catch (err) {

              console.log(
                "Reverse geocoding failed:",
                err
              );

              document.getElementById("location").value =
                `${latitude}, ${longitude}`;
            }

            document.getElementById(
              "locationStatus"
            ).textContent =
              `Location captured: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;

            locationBtn.disabled = false;
            locationBtn.textContent =
              "Delivery Location Captured ✓";

            await calculateDeliveryFees(
              latitude,
              longitude
            );

            await loadVendorPaymentDetails();

          },

          error => {

            console.log(error);

            locationBtn.disabled = false;

            locationBtn.textContent =
              "📍 Use My Exact Delivery Location";

            alert(
              "Unable to retrieve your delivery location."
            );

          },

          {
            enableHighAccuracy: true,
            timeout: 30000,
            maximumAge: 0
          }

        );

    });

  }

  // =====================================
  // CALCULATE DELIVERY FEES
  // =====================================

  async function calculateDeliveryFees(
    latitude,
    longitude
  ) {

    const cart =
      getCheckoutCart();

    const uniqueShops =
      [...new Set(
        cart.map(item => item.shopId)
      )];

    window.shopDeliveryFees = {};
    window.shopDeliveryCommissions = {};
    window.shopRiderEarnings = {};

    let totalDeliveryFee = 0;
    let totalDistance = 0;

    for (const shopId of uniqueShops) {

      const res =
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
              customerLatitude: latitude,
              customerLongitude: longitude
            })
          }
        );

      const data =
        await res.json();

      if (!res.ok) {
        throw new Error(
          data.message ||
          "Failed to calculate delivery fee"
        );
      }

      window.shopDeliveryFees[shopId] =
        Number(data.deliveryFee || 0);

      window.shopDeliveryCommissions[shopId] =
        Number(data.deliveryCommission || 0);

      window.shopRiderEarnings[shopId] =
        Number(data.riderEarnings || 0);

      totalDeliveryFee +=
        Number(data.deliveryFee || 0);

      totalDistance +=
        Number(data.distanceKm || 0);
    }

    window.calculatedDeliveryFee =
      totalDeliveryFee;

    document.getElementById(
      "deliveryFee"
    ).textContent =
      `₵${formatMoney(totalDeliveryFee)}`;

    document.getElementById(
      "deliveryDistance"
    ).textContent =
      `${totalDistance.toFixed(1)} km`;

    const subtotal =
      calculateCartSubtotal(cart);

    // Only products are paid now.
    document.getElementById(
      "subtotal"
    ).textContent =
      `₵${formatMoney(subtotal)}`;

    document.getElementById(
      "total"
    ).textContent =
      `₵${formatMoney(subtotal)}`;
  }

  // =====================================
  // LOAD VENDOR PAYMENT DETAILS
  // =====================================

  async function loadVendorPaymentDetails() {

  const cart =
    getCheckoutCart();

  const uniqueShopIds =
    [...new Set(
      cart.map(item => item.shopId)
    )];

  const paymentContainer =
    document.getElementById(
      "vendorPaymentDetails"
    );

  if (!paymentContainer) return;

  paymentContainer.innerHTML =
    "<p>Loading vendor payment details...</p>";

  window.shopPaymentDetails = {};

  try {

    paymentContainer.innerHTML = "";

    for (const shopId of uniqueShopIds) {

      const res =
        await fetch(
          `${API_URL}/shops/${shopId}/payment-details`
        );

      let shop;

      try {
        shop = await res.json();
      } catch (err) {
        throw new Error(
          "The server returned an invalid response."
        );
      }

      if (!res.ok) {
        throw new Error(
          shop.message ||
          "Unable to load vendor payment details"
        );
      }

      const items =
        cart.filter(
          item => item.shopId === shopId
        );

      const shopSubtotal =
        calculateCartSubtotal(items);

      const paymentMethod =
        shop.payoutMethod === "bank"
          ? "vendor_direct_bank"
          : "vendor_direct_momo";

      const paymentReference =
        createPaymentReference(shopId);

      window.shopPaymentDetails[shopId] = {
        paymentMethod,
        paymentReference
      };

      const block =
        document.createElement("div");

      block.className =
        "vendor-payment-card";

      if (shop.payoutMethod === "bank") {

        block.innerHTML = `
          <h4>${escapeHtml(shop.shopName)}</h4>

          <div class="vendor-payment-amount">
            Pay vendor now:
            <strong>
              ₵${formatMoney(shopSubtotal)}
            </strong>
          </div>

          <p>
            <strong>Payment method:</strong>
            Bank transfer
          </p>

          <p>
            <strong>Bank:</strong>
            ${escapeHtml(shop.bankName)}
          </p>

          <p>
            <strong>Account name:</strong>
            ${escapeHtml(shop.accountName)}
          </p>

          <p>
            <strong>Account number:</strong>
            ${escapeHtml(shop.accountNumber)}
          </p>

          <p class="payment-reference">
            <strong>Use this reference:</strong>
            ${escapeHtml(paymentReference)}
          </p>

          <label for="transaction-${shopId}">
            Bank transaction ID
          </label>

          <input
            type="text"
            id="transaction-${shopId}"
            class="vendor-transaction-input"
            data-shop-id="${shopId}"
            data-payment-reference="${escapeHtml(paymentReference)}"
            placeholder="Enter bank transaction ID"
            autocomplete="off"
            required
          >
        `;

      } else {

        block.innerHTML = `
          <h4>${escapeHtml(shop.shopName)}</h4>

          <div class="vendor-payment-amount">
            Pay vendor now:
            <strong>
              ₵${formatMoney(shopSubtotal)}
            </strong>
          </div>

          <p>
            <strong>Payment method:</strong>
            Mobile Money
          </p>

          <p>
            <strong>Network:</strong>
            ${escapeHtml(shop.momoNetwork)}
          </p>

          <p>
            <strong>MoMo account name:</strong>
            ${escapeHtml(shop.momoName)}
          </p>

          <p>
            <strong>MoMo number:</strong>
            ${escapeHtml(shop.momoNumber)}
          </p>

          <p class="payment-reference">
            <strong>Use this reference:</strong>
            ${escapeHtml(paymentReference)}
          </p>

          <label for="transaction-${shopId}">
            MoMo transaction ID
          </label>

          <input
            type="text"
            id="transaction-${shopId}"
            class="vendor-transaction-input"
            data-shop-id="${shopId}"
            data-payment-reference="${escapeHtml(paymentReference)}"
            placeholder="Enter MoMo transaction ID"
            autocomplete="off"
            required
          >
        `;

      }

      paymentContainer.appendChild(block);
    }

  } catch (err) {

    console.log(
      "Vendor payment details error:",
      err
    );

    paymentContainer.innerHTML = `
      <div class="payment-load-error">
        <strong>Payment details unavailable</strong>
        <p>
          ${escapeHtml(err.message)}
        </p>
        <p>
          Please contact Mieza support or try again later.
        </p>
      </div>
    `;

  }

}

  // =====================================
  // SUBMIT ORDERS
  // =====================================

  form.addEventListener("submit", async event => {

    event.preventDefault();

    const cart =
      getCheckoutCart();

    if (!cart.length) {
      alert("Your cart is empty.");
      return;
    }

    const latitude =
      document.getElementById("latitude").value;

    const longitude =
      document.getElementById("longitude").value;

    if (!latitude || !longitude) {
      alert(
        "Please capture your exact delivery location first."
      );
      return;
    }

    if (
      !document.getElementById(
        "confirmVendorPayment"
      )?.checked
    ) {
      alert(
        "Please confirm that you have paid the vendor."
      );
      return;
    }

    const transactionInputs =
      document.querySelectorAll(
        ".vendor-transaction-input"
      );

    if (!transactionInputs.length) {
      alert(
        "Vendor payment details are not ready."
      );
      return;
    }

    for (const input of transactionInputs) {
      if (!input.value.trim()) {
        alert(
          "Please enter the transaction ID for every vendor payment."
        );
        input.focus();
        return;
      }
    }

    btn.disabled = true;
    btn.textContent =
      "Submitting order...";

    try {

      const formData =
        new FormData(form);

      const groupedByShop = {};

      cart.forEach(item => {

        if (!groupedByShop[item.shopId]) {
          groupedByShop[item.shopId] = [];
        }

        groupedByShop[item.shopId].push(item);
      });

      const createdOrderIds = [];

      for (
        const [shopId, items]
        of Object.entries(groupedByShop)
      ) {

        const shopSubtotal =
          calculateCartSubtotal(items);

        const shopDeliveryFee =
          Number(
            window.shopDeliveryFees?.[shopId] || 0
          );

        const transactionInput =
          document.getElementById(
            `transaction-${shopId}`
          );

        const transactionId =
          transactionInput?.value.trim();

        const paymentMethod =
          window.shopPaymentDetails?.[shopId]
            ?.paymentMethod ||
          "vendor_direct_momo";

          const paymentInstructionReference =
  window.shopPaymentDetails?.[shopId]
    ?.paymentReference || "";

        const orderRes =
          await fetch(
            `${API_URL}/orders`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json"
              },

              body: JSON.stringify({

                customerName:
                  formData.get("name"),

                customerPhone:
                  formData.get("phone"),

                customerEmail:
                  formData.get("email"),

                customerAddress:
                  formData.get("location"),

                customerLatitude:
                  Number(latitude),

                customerLongitude:
                  Number(longitude),

                customerNotes:
                  formData.get("notes") || "",

                shopId,

                subtotal:
                  shopSubtotal,

                deliveryFee:
                  shopDeliveryFee,

                totalAmount:
                  shopSubtotal + shopDeliveryFee,

                paymentMethod,

                paymentReference:
                  transactionId,

                  paymentInstructionReference,

                paymentStatus:
                  "awaiting_vendor_confirmation",

                deliveryPaymentMethod:
                  "cash_to_rider",

                deliveryFeeCollected:
                  false,

                status:
                  "awaiting_vendor_confirmation",

                settlementStatus:
                  "pending",

                items:
                  items.map(item => ({
                    productId:
                      item.id || item._id,

                    name:
                      item.name,

                    price:
                      Number(item.price),

                    image:
                      item.image,

                    quantity:
                      Number(item.qty)
                  }))
              })
            }
          );

        const orderData =
          await orderRes.json();

        if (!orderRes.ok) {
          throw new Error(
            orderData.message ||
            "Failed to create order"
          );
        }

        createdOrderIds.push(
          orderData._id
        );
      }

      localStorage.removeItem("miezaCart");

      localStorage.setItem(
        "lastOrderId",
        createdOrderIds[
          createdOrderIds.length - 1
        ]
      );

      localStorage.setItem(
        "lastOrderIds",
        JSON.stringify(createdOrderIds)
      );

      form.reset();

      section.classList.add("hidden");

      success.classList.remove("hidden");

      success.querySelector("h2").textContent =
        "Order Submitted 🎉";

      success.querySelector("p").innerHTML = `
        Your payment details have been sent to the vendor for confirmation.
        <br><br>
        The vendor will begin processing your order after confirming receipt.
        <br><br>
        <strong>Delivery fee:</strong>
        Pay the rider when your order arrives.
      `;

      alert(
        `Order submitted successfully.

Order ID:
${createdOrderIds[
  createdOrderIds.length - 1
]}

The vendor must confirm your product payment before preparing the order.`
      );

      updateAllCartCounts();

    } catch (err) {

      console.log(err);

      alert(
        err.message ||
        "Failed to submit your order."
      );

    } finally {

      btn.disabled = false;

      btn.textContent =
        "Submit Order for Vendor Confirmation";
    }

  });

});

// =====================================
// HELPERS
// =====================================

function getCheckoutCart() {
  return JSON.parse(
    localStorage.getItem("miezaCart")
  ) || [];
}

function calculateCartSubtotal(cart) {
  return cart.reduce(
    (sum, item) =>
      sum +
      Number(item.price) *
      Number(item.qty),
    0
  );
}

function formatMoney(value) {
  return Number(value || 0).toFixed(2);
}

function createPaymentReference(shopId) {
  return `MZ-${shopId.slice(-4).toUpperCase()}-${Date.now()
    .toString()
    .slice(-6)}`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}