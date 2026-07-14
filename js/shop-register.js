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

    const termsText =
      document.getElementById("termsText");

    if (termsText) {
      termsText.textContent =
        settings.termsAndConditions ||
        "No terms and conditions available.";
    }

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

    const agreeTerms =
  document.getElementById("agreeTerms");

const viewTerms =
  document.getElementById("viewTerms");

const termsModal =
  document.getElementById("termsModal");

const closeTerms =
  document.getElementById("closeTerms");

const acceptTermsBtn =
  document.getElementById("acceptTermsBtn");

if (viewTerms && termsModal) {
  viewTerms.addEventListener("click", e => {
    e.preventDefault();
    termsModal.classList.add("show");
  });
}

if (closeTerms && termsModal) {
  closeTerms.addEventListener("click", () => {
    termsModal.classList.remove("show");
  });
}

if (acceptTermsBtn && termsModal && agreeTerms) {
  acceptTermsBtn.addEventListener("click", () => {
    agreeTerms.checked = true;
    termsModal.classList.remove("show");
  });
}

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

    if (
  !document.getElementById("agreeTerms")?.checked
) {
  alert(
    "Please read and agree to the Terms & Conditions before registering."
  );
  return;
}

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

const momoBankCode =
  document.getElementById(
    "momoNetwork"
  )
    .selectedOptions[0]
    ?.dataset.code || "";

const bankName =
  document.getElementById(
    "bankName"
  ).value.trim();

const bankCode =
  document.getElementById(
    "bankCode"
  )?.value || "";

const accountName =
  document.getElementById(
    "accountName"
  ).value.trim();

const accountNumber =
  document.getElementById(
    "accountNumber"
  ).value.trim();

// =========================
// VALIDATE PAYOUT DETAILS
// =========================

if (
  payoutMethod === "momo" &&
  (
    !momoNumber ||
    !momoName ||
    !momoNetwork
  )
) {

  alert(
    "Please complete all Mobile Money details."
  );

  return;
}

if (
  payoutMethod === "bank" &&
  (
    !bankName ||
    !accountName ||
    !accountNumber
  )
) {

  alert(
    "Please complete all bank account details."
  );

  return;
}

// =========================
// KEEP ONLY SELECTED METHOD
// =========================

const cleanMomoNumber =
  payoutMethod === "momo"
    ? momoNumber
    : "";

const cleanMomoName =
  payoutMethod === "momo"
    ? momoName
    : "";

const cleanMomoNetwork =
  payoutMethod === "momo"
    ? momoNetwork
    : "";

const cleanMomoBankCode =
  payoutMethod === "momo"
    ? momoBankCode
    : "";

const cleanBankName =
  payoutMethod === "bank"
    ? bankName
    : "";

const cleanBankCode =
  payoutMethod === "bank"
    ? bankCode
    : "";

const cleanAccountName =
  payoutMethod === "bank"
    ? accountName
    : "";

const cleanAccountNumber =
  payoutMethod === "bank"
    ? accountNumber
    : "";

// =========================
// DISABLE BUTTON
// =========================

if (payBtn.disabled) return;

payBtn.disabled = true;

payBtn.textContent =
  shopPaymentRequired
    ? "Processing payment..."
    : "Registering Shop...";

// =========================
// PREPARE REGISTRATION DATA
// =========================

const registrationData = {

  shopName,
  ownerName,
  email,
  phone,
  password,

  payoutMethod,

  momoNumber:
    cleanMomoNumber,

  momoName:
    cleanMomoName,

  momoNetwork:
    cleanMomoNetwork,

  momoBankCode:
    cleanMomoBankCode,

  bankName:
    cleanBankName,

  bankCode:
    cleanBankCode,

  accountName:
    cleanAccountName,

  accountNumber:
    cleanAccountNumber

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

function toggleShopPayoutFields() {

  const payoutMethod =
    document.getElementById(
      "payoutMethod"
    );

  const momoFields =
    document.getElementById(
      "momoFields"
    );

  const bankFields =
    document.getElementById(
      "bankFields"
    );

  if (
    !payoutMethod ||
    !momoFields ||
    !bankFields
  ) {
    return;
  }

  const momoNumber =
    document.getElementById(
      "momoNumber"
    );

  const momoName =
    document.getElementById(
      "momoName"
    );

  const momoNetwork =
    document.getElementById(
      "momoNetwork"
    );

  const momoBankCode =
    document.getElementById(
      "momoBankCode"
    );

  const bankName =
    document.getElementById(
      "bankName"
    );

  const bankCode =
    document.getElementById(
      "bankCode"
    );

  const accountName =
    document.getElementById(
      "accountName"
    );

  const accountNumber =
    document.getElementById(
      "accountNumber"
    );

  if (
    payoutMethod.value === "bank"
  ) {

    momoFields.style.display =
      "none";

    bankFields.style.display =
      "block";

    if (momoNumber) {
      momoNumber.value = "";
    }

    if (momoName) {
      momoName.value = "";
    }

    if (momoNetwork) {
      momoNetwork.value = "";
    }

    if (momoBankCode) {
      momoBankCode.value = "";
    }

  } else {

    momoFields.style.display =
      "block";

    bankFields.style.display =
      "none";

    if (bankName) {
      bankName.value = "";
    }

    if (bankCode) {
      bankCode.value = "";
    }

    if (accountName) {
      accountName.value = "";
    }

    if (accountNumber) {
      accountNumber.value = "";
    }

  }

}

document.addEventListener(
  "DOMContentLoaded",
  () => {

    const payoutMethod =
      document.getElementById(
        "payoutMethod"
      );

    payoutMethod?.addEventListener(
      "change",
      toggleShopPayoutFields
    );

    toggleShopPayoutFields();

  }
);

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

    const formData =
  new FormData();

const thumbnailFile =
  document.getElementById(
    "shopThumbnailFile"
  )?.files[0];

const thumbnailUrl =
  document.getElementById(
    "shopThumbnailUrl"
  )?.value.trim();

formData.append("shopName", data.shopName);
formData.append("ownerName", data.ownerName);
formData.append("email", data.email.trim().toLowerCase());
formData.append("phone", data.phone);
formData.append("password", data.password);

formData.append(
  "shopLocation",
  document.getElementById("shopLocation").value
);

formData.append(
  "latitude",
  document.getElementById("latitude").value
);

formData.append(
  "longitude",
  document.getElementById("longitude").value
);

formData.append(
  "openingTime",
  document.getElementById("openingTime").value
);

formData.append(
  "closingTime",
  document.getElementById("closingTime").value
);

formData.append("paymentReference", reference || "");

formData.append("payoutMethod", data.payoutMethod);
formData.append("momoNumber", data.momoNumber);
formData.append("momoName", data.momoName);
formData.append("momoNetwork", data.momoNetwork);
formData.append("momoBankCode", data.momoBankCode);
formData.append("bankName", data.bankName);
formData.append("bankCode", data.bankCode);
formData.append("accountName", data.accountName);
formData.append("accountNumber", data.accountNumber);

if (thumbnailFile) {
  formData.append("thumbnail", thumbnailFile);
}

if (thumbnailUrl) {
  formData.append("thumbnailUrl", thumbnailUrl);
}

    const res = await fetch(

      "https://mieza.onrender.com/api/shops/register",

      {
  method: "POST",
  body: formData
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
alert(
  "Shop registered successfully. Please wait for admin approval before logging in."
);

localStorage.removeItem(
  "shopToken"
);

localStorage.removeItem(
  "shop"
);

localStorage.removeItem(
  "shopData"
);

window.location.replace(
  "shop-login.html"
);

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
    shopPaymentRequired
      ? `Pay ₵${shopRegistrationFee} & Register`
      : "Register Shop";
}