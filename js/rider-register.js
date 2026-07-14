const RIDER_REGISTRATION_FEE = 100;

let riderRegistrationFee =
  RIDER_REGISTRATION_FEE;

let riderPaymentRequired =
  true;

async function loadRiderRegistrationSettings() {

  const res =
    await fetch(
      "https://mieza.onrender.com/api/config/settings"
    );

  const settings =
    await res.json();

  riderRegistrationFee =
    settings.riderRegistrationFee || 100;

  riderPaymentRequired =
    settings.riderRegistrationPaymentRequired !== false;

  const termsText =
    document.getElementById("termsText");

  if (termsText) {
    termsText.textContent =
      settings.termsAndConditions ||
      "No terms and conditions available.";
  }

  const btn =
    document.querySelector(".login-btn");

  if (btn) {
    btn.textContent =
      riderPaymentRequired
        ? `Pay ₵${riderRegistrationFee} & Register`
        : "Register Rider";
  }

}

const PAYSTACK_PUBLIC_KEY =
  "pk_live_8d2c51aba42a777a0e497cec1243d30a0e1df4ee";

  document.addEventListener("DOMContentLoaded", () => {

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

});

function payAndRegisterRider() {
  if (
  !document.getElementById("agreeTerms")?.checked
) {
  alert(
    "Please read and agree to the Terms & Conditions before registering."
  );
  return;
}

  const fullName =
    document.getElementById("fullName").value.trim();

  const phone =
    document.getElementById("phone").value.trim();

  const email =
    document.getElementById("email").value.trim().toLowerCase();

  const password =
    document.getElementById("password").value.trim();

  const vehicleType =
    document.getElementById("vehicleType").value;

  const payoutMethod =
    document.getElementById("payoutMethod").value;

  const momoNumber =
    document.getElementById("momoNumber").value.trim();

  const momoName =
    document.getElementById("momoName").value.trim();

  const momoNetwork =
    document.getElementById("momoNetwork").value;

    const momoBankCode =
  document.getElementById("momoNetwork")
    .selectedOptions[0]
    ?.dataset.code || "";

  const bankName =
    document.getElementById("bankName").value.trim();

    const bankCode =
  document.getElementById("bankCode")
    ?.value || "";

  const accountName =
    document.getElementById("accountName").value.trim();

  const accountNumber =
    document.getElementById("accountNumber").value.trim();

  if (
    !fullName ||
    !phone ||
    !email ||
    !password
  ) {
    alert("Please fill all required fields");
    return;
  }

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

  // FREE REGISTRATION
if (!riderPaymentRequired) {

  registerRider({
    fullName,
    phone,
    email,
    password,
    vehicleType,
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
  cleanAccountNumber,
    paymentReference: null
  });

  return;
}

  const handler =
    PaystackPop.setup({

      key:
        PAYSTACK_PUBLIC_KEY,

      email,

      amount:
  riderRegistrationFee * 100,

      currency:
        "GHS",

      ref:
        "MIEZA_RIDER_" + Date.now(),

      callback: function(response) {

        registerRider({
  fullName,
  phone,
  email,
  password,
  vehicleType,
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
    cleanAccountNumber,

  paymentReference:
    response.reference
});

},

      onClose: function() {

        alert("Payment cancelled");

      }

    });

  handler.openIframe();

}

function toggleRiderPayoutFields() {

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

  const bankName =
    document.getElementById(
      "bankName"
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

    momoNumber.value = "";
    momoName.value = "";
    momoNetwork.value = "";

  } else {

    momoFields.style.display =
      "block";

    bankFields.style.display =
      "none";

    bankName.value = "";
    accountName.value = "";
    accountNumber.value = "";

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
      toggleRiderPayoutFields
    );

    toggleRiderPayoutFields();

  }
);

async function registerRider(data) {

  try {

    const res =
      await fetch(
        "https://mieza.onrender.com/api/rider-auth/register",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body:
            JSON.stringify(data)
        }
      );

    const result =
      await res.json();

    if (!res.ok) {
      alert(result.message || "Registration failed");
      return;
    }

    alert(
      "Rider registered successfully. Please wait for admin approval."
    );

    window.location.href =
      "rider-login.html";

  } catch (err) {

    console.log(err);

    alert("Server error");

  }

}

loadRiderRegistrationSettings();