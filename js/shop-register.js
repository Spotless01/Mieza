// ================================
// MIEZA — SHOP REGISTRATION PAYMENT
// ================================

const REGISTRATION_FEE = 200;

const PAYSTACK_PUBLIC_KEY =
  "pk_test_ae5cd01bf961398b8a0a932344da0c215ba02c04";

document.addEventListener("DOMContentLoaded", () => {

  const payBtn =
    document.getElementById("payAndRegisterBtn");

  if (!payBtn) return;

  payBtn.addEventListener("click", () => {

    // =========================
    // GET FORM VALUES
    // =========================

    const shopName =
      document.getElementById("shopName")
      ?.value.trim();

    const ownerName =
      document.getElementById("ownerName")
      ?.value.trim();

    const email =
      document.getElementById("email")
      ?.value.trim();

    const phone =
      document.getElementById("phone")
      ?.value.trim();

    const password =
      document.getElementById("password")
      ?.value.trim();

    // =========================
    // VALIDATE
    // =========================

    if (
      !shopName ||
      !ownerName ||
      !email ||
      !phone ||
      !password
    ) {

      alert(
        "Please fill all required fields."
      );

      return;
    }

    // =========================
    // DISABLE BUTTON
    // =========================

    payBtn.disabled = true;

    payBtn.textContent =
      "Processing payment...";

    // =========================
    // START PAYMENT
    // =========================

    const payoutMethod =
document.getElementById(
"payoutMethod"
).value;

const momoNumber =
document.getElementById(
"momoNumber"
).value.trim();

const momoName =
document.getElementById(
"momoName"
).value.trim();

const momoNetwork =
document.getElementById(
"momoNetwork"
).value;

const bankName =
document.getElementById(
"bankName"
).value.trim();

const accountName =
document.getElementById(
"accountName"
).value.trim();

const accountNumber =
document.getElementById(
"accountNumber"
).value.trim();

payWithPaystack({

shopName,
ownerName,
email,
phone,
password,

payoutMethod,

momoNumber,
momoName,
momoNetwork,

bankName,
accountName,
accountNumber

});


  });

});

// ===================================
// PAYSTACK
// ===================================

function payWithPaystack(data) {

  const handler =
    PaystackPop.setup({

      key:
        PAYSTACK_PUBLIC_KEY,

      email:
        data.email,

      amount:
        REGISTRATION_FEE * 100,

      currency:
        "GHS",

      ref:
        "MIEZA_" + Date.now(),

      metadata: {

        custom_fields: [

          {
            display_name:
              "Shop Name",

            value:
              data.shopName
          },

          {
            display_name:
              "Owner Name",

            value:
              data.ownerName
          },

          {
            display_name:
              "Phone",

            value:
              data.phone
          }

        ]
      },

      // =========================
      // PAYMENT SUCCESS
      // =========================

      callback: function(response) {

        saveShopRegistration(
          data,
          response.reference
        );
      },

      // =========================
      // PAYMENT CLOSED
      // =========================

      onClose: function() {

        alert("Payment cancelled.");

        resetButton();
      }

    });

  handler.openIframe();

}

// ===================================
// SAVE SHOP
// ===================================

async function saveShopRegistration(
  data,
  reference
) {

  try {

    const res = await fetch(

      "https://mieza.onrender.com/api/shops/register",

      {

        method: "POST",

        headers: {
          "Content-Type":
            "application/json"
        },

        body: JSON.stringify({

          shopName:
            data.shopName,

          ownerName:
            data.ownerName,

          email:
  data.email.trim().toLowerCase(),

          phone:
            data.phone,

          password:
            data.password,

            shopLocation:
            document.getElementById(
              "shopLocation"
            ).value,

          latitude:
            document.getElementById(
              "latitude"
            ).value,

          longitude:
            document.getElementById(
              "longitude"
            ).value,

          paymentReference:
reference,

payoutMethod:
data.payoutMethod,

momoNumber:
data.momoNumber,

momoName:
data.momoName,

momoNetwork:
data.momoNetwork,

bankName:
data.bankName,

accountName:
data.accountName,

accountNumber:
data.accountNumber

        })

      }
    );

    const result =
      await res.json();

    // =========================
    // FAILED
    // =========================

    if (!res.ok) {

      alert(
        result.message ||
        "Registration failed"
      );

      resetButton();

      return;
    }

    // =========================
    // SUCCESS
    // =========================

    alert(
      "🎉 Shop registered successfully!"
    );

    localStorage.setItem(
  "shopData",
  JSON.stringify(result)
);

// SAVE LOGIN SESSION
localStorage.setItem(
  "shopToken",
  result.token || ""
);

window.location.href =
  "shop-dashboard.html";

  } catch (err) {

    console.error(err);

    alert(
      "Server error. Please try again."
    );

    resetButton();
  }

}

// ===================================
// RESET BUTTON
// ===================================

function resetButton() {

  const payBtn =
    document.getElementById(
      "payAndRegisterBtn"
    );

  payBtn.disabled = false;

  payBtn.textContent =
    "Pay ₵200 & Register";
}