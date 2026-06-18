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
  "pk_test_ae5cd01bf961398b8a0a932344da0c215ba02c04";

function payAndRegisterRider() {

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

  const bankName =
    document.getElementById("bankName").value.trim();

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


if (!riderPaymentRequired) {

  registerRider({
    fullName,
    phone,
    email,
    password,
    vehicleType,
    payoutMethod,
    momoNumber,
    momoName,
    momoNetwork,
    bankName,
    accountName,
    accountNumber,
    paymentReference: null
  });

  return;

}

      },

      onClose: function() {

        alert("Payment cancelled");

      }

    });

  handler.openIframe();

}

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