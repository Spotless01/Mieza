const token =
localStorage.getItem("adminToken");

if (!token) {
  location.href =
    "admin-login.html";
}

async function loadSettings() {

  const res =
    await fetch(
      "https://mieza.onrender.com/api/admin/settings",
      {
        headers: {
          Authorization:
            `Bearer ${token}`
        }
      }
    );

  const settings =
    await res.json();

  document.getElementById(
    "vendorCommissionRate"
  ).value =
    settings.vendorCommissionRate;

  document.getElementById(
    "riderCommissionRate"
  ).value =
    settings.riderCommissionRate;

  document.getElementById(
    "supportEmail"
  ).value =
    settings.supportEmail;

  document.getElementById(
    "supportPhone1"
  ).value =
    settings.supportPhone1;

  document.getElementById(
    "supportPhone2"
  ).value =
    settings.supportPhone2;

  document.getElementById(
    "supportPhone3"
  ).value =
    settings.supportPhone3;

  document.getElementById(
    "supportPhone4"
  ).value =
    settings.supportPhone4;

  document.getElementById(
    "businessLocation"
  ).value =
    settings.businessLocation;

  document.getElementById(
    "workingHours"
  ).value =
    settings.workingHours;

  document.getElementById(
  "shopRegistrationFee"
  ).value =
    settings.shopRegistrationFee || 200;

  document.getElementById(
    "riderRegistrationFee"
  ).value =
    settings.riderRegistrationFee || 100;

  document.getElementById(
    "shopRegistrationPaymentRequired"
  ).value =
    String(
      settings.shopRegistrationPaymentRequired
    );

  document.getElementById(
    "riderRegistrationPaymentRequired"
  ).value =
    String(
      settings.riderRegistrationPaymentRequired
    );

    document.getElementById(
    "autoPayoutEnabled"
  ).value =
    String(settings.autoPayoutEnabled);

  document.getElementById(
    "settlementFrequency"
  ).value =
    settings.settlementFrequency || "daily";

  document.getElementById(
    "settlementHour"
  ).value =
    settings.settlementHour ?? 22;

  document.getElementById(
    "minimumSettlementAmount"
  ).value =
    settings.minimumSettlementAmount ?? 50;

  document.getElementById(
    "retryFailedSettlements"
  ).value =
    String(settings.retryFailedSettlements);

}

async function saveSettings() {

  const res =
    await fetch(
      "https://mieza.onrender.com/api/admin/settings",
      {
        method: "PUT",

        headers: {
          "Content-Type":
            "application/json",

          Authorization:
            `Bearer ${token}`
        },

        body: JSON.stringify({

          vendorCommissionRate:
            document.getElementById(
              "vendorCommissionRate"
            ).value,

          riderCommissionRate:
            document.getElementById(
              "riderCommissionRate"
            ).value,

          supportEmail:
            document.getElementById(
              "supportEmail"
            ).value,

          supportPhone1:
            document.getElementById(
              "supportPhone1"
            ).value,

          supportPhone2:
            document.getElementById(
              "supportPhone2"
            ).value,

            supportPhone3:
            document.getElementById(
              "supportPhone3"
            ).value,

            supportPhone4:
            document.getElementById(
              "supportPhone4"
            ).value,

          businessLocation:
            document.getElementById(
              "businessLocation"
            ).value,

          workingHours:
            document.getElementById(
              "workingHours"
            ).value,

            shopRegistrationFee:
            document.getElementById(
              "shopRegistrationFee"
            ).value,

          riderRegistrationFee:
            document.getElementById(
              "riderRegistrationFee"
            ).value,

          shopRegistrationPaymentRequired:
            document.getElementById(
              "shopRegistrationPaymentRequired"
            ).value === "true",

          riderRegistrationPaymentRequired:
            document.getElementById(
              "riderRegistrationPaymentRequired"
            ).value === "true",

            autoPayoutEnabled:
            document.getElementById(
              "autoPayoutEnabled"
            ).value === "true",

          settlementFrequency:
            document.getElementById(
              "settlementFrequency"
            ).value,

          settlementHour:
            document.getElementById(
              "settlementHour"
            ).value,

          minimumSettlementAmount:
            document.getElementById(
              "minimumSettlementAmount"
            ).value,

          retryFailedSettlements:
            document.getElementById(
              "retryFailedSettlements"
            ).value === "true",

                  })
                }
              );

            const data =
              await res.json();

            alert(
              data.message ||
              "Settings saved"
            );

}

loadSettings();