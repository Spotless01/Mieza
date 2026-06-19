// ================================
// MIEZA — SHOP REGISTRATION PAYMENT
// ================================

const REGISTRATION_FEE = 200;

let shopRegistrationFee =
  REGISTRATION_FEE;

let shopPaymentRequired =
  true;

const PAYSTACK_PUBLIC_KEY =
  "pk_live_8d2c51aba42a777a0e497cec1243d30a0e1df4ee";

  async function loadRegistrationSettings() {

  try {

    const res =
      await fetch(
        "https://mieza.onrender.com/api/config/settings"
      );

    const settings =
      await res.json();

    shopRegistrationFee =
      settings.shopRegistrationFee || 200;

    shopPaymentRequired =
      settings.shopRegistrationPaymentRequired !== false;

    const payBtn =
      document.getElementById(
        "payAndRegisterBtn"
      );

    if (payBtn) {

      payBtn.textContent =
        shopPaymentRequired
          ? `Pay ₵${shopRegistrationFee} & Register`
          : "Register Shop";

    }

    const intro =
      document.querySelector(
        ".intro"
      );

    if (intro) {

      intro.innerHTML =
        shopPaymentRequired
          ? `Join Ghana’s growing local marketplace.
Registration fee: <strong>₵${shopRegistrationFee} one-time</strong>`
          : `Join Ghana’s growing local marketplace.
Registration is currently <strong>free</strong>.`;

    }

  } catch (err) {

    console.log(
      "Failed to load registration settings:",
      err
    );

  }

}

document.addEventListener("DOMContentLoaded", () => {

  const payBtn =
    document.getElementById("payAndRegisterBtn");

 // ===================================
// GET SHOP GPS LOCATION
// ===================================

const locationBtn =
document.getElementById(
  "getShopLocation"
);

if (locationBtn) {

  locationBtn.addEventListener(
    "click",
    () => {

      if (!navigator.geolocation) {

        alert(
          "Geolocation is not supported on this device."
        );

        return;
      }

      locationBtn.disabled = true;

      locationBtn.textContent =
        "Waiting for GPS...";

      const watchId =
        navigator.geolocation.watchPosition(

          async position => {

            const accuracy =
              position.coords.accuracy;

            console.log(
              "Shop GPS Accuracy:",
              accuracy
            );

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

            navigator.geolocation.clearWatch(
              watchId
            );

            const latitude =
              position.coords.latitude;

            const longitude =
              position.coords.longitude;

            document.getElementById(
              "latitude"
            ).value = latitude;

            document.getElementById(
              "longitude"
            ).value = longitude;

            document.getElementById(
              "shopLocation"
            ).value =
              "Fetching shop address...";

            try {

              const response =
                await fetch(
                  `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
                );

              const data =
                await response.json();

              console.log(
                "SHOP NOMINATIM RESPONSE:",
                data
              );

              if (
                data &&
                data.display_name
              ) {

                document.getElementById(
                  "shopLocation"
                ).value =
                  data.display_name;

              } else {

                document.getElementById(
                  "shopLocation"
                ).value =
                  `${latitude}, ${longitude}`;

              }

            } catch (err) {

              console.log(
                "Shop reverse geocoding failed:",
                err
              );

              document.getElementById(
                "shopLocation"
              ).value =
                `${latitude}, ${longitude}`;

            }

            document.getElementById(
              "locationStatus"
            ).textContent =
              `✅ Shop location captured:
${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;

            locationBtn.textContent =
              "Shop Location Captured ✓";

            console.log(
              "Shop Coordinates:",
              latitude,
              longitude
            );

          },

          error => {

            console.log(error);

            alert(
              "Unable to retrieve shop location."
            );

            locationBtn.disabled =
              false;

            locationBtn.textContent =
              "📍 Use Exact Shop Location";

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
    const latitude =
  document.getElementById(
    "latitude"
  ).value;

const longitude =
  document.getElementById(
    "longitude"
  ).value;

const shopLocation =
  document.getElementById(
    "shopLocation"
  ).value;

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

if (
  !latitude ||
  !longitude ||
  !shopLocation
) {

  alert(
    "Please click 'Use Exact Shop Location' before registering."
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

const registrationData = {

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

};

if (shopPaymentRequired) {

  payWithPaystack(
    registrationData
  );

} else {

  saveShopRegistration(
    registrationData,
    null
  );

}


  });

});

loadRegistrationSettings();

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
  shopRegistrationFee * 100,

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