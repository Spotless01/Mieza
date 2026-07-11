const token =
  localStorage.getItem(
    "adminToken"
  );

let currentAdmin = null;

// ===================================
// INITIALIZE OWNER-ONLY SETTINGS PAGE
// ===================================

async function initializeSettingsPage() {

  currentAdmin =
    await verifyAdminAccess([
      "owner"
    ]);

  if (!currentAdmin) return;

  await loadSettings();

}

// ===================================
// LOAD SETTINGS
// ===================================

async function loadSettings() {

  try {

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

    if (!res.ok) {

      alert(
        settings.message ||
        "Unable to load settings"
      );

      return;
    }

    document.getElementById(
      "vendorCommissionRate"
    ).value =
      settings.vendorCommissionRate ?? 10;

    document.getElementById(
      "riderCommissionRate"
    ).value =
      settings.riderCommissionRate ?? 10;

    document.getElementById(
      "supportEmail"
    ).value =
      settings.supportEmail || "";

    document.getElementById(
      "supportPhone1"
    ).value =
      settings.supportPhone1 || "";

    document.getElementById(
      "supportPhone2"
    ).value =
      settings.supportPhone2 || "";

    document.getElementById(
      "supportPhone3"
    ).value =
      settings.supportPhone3 || "";

    document.getElementById(
      "supportPhone4"
    ).value =
      settings.supportPhone4 || "";

    document.getElementById(
      "supportPhone5"
    ).value =
      settings.supportPhone5 || "";

    document.getElementById(
      "termsAndConditions"
    ).value =
      settings.termsAndConditions || "";

    document.getElementById(
      "businessLocation"
    ).value =
      settings.businessLocation || "";

    document.getElementById(
      "workingHours"
    ).value =
      settings.workingHours || "";

    document.getElementById(
      "shopRegistrationFee"
    ).value =
      settings.shopRegistrationFee ?? 200;

    document.getElementById(
      "riderRegistrationFee"
    ).value =
      settings.riderRegistrationFee ?? 100;

    document.getElementById(
      "shopRegistrationPaymentRequired"
    ).value =
      String(
        settings.shopRegistrationPaymentRequired ??
        false
      );

    document.getElementById(
      "riderRegistrationPaymentRequired"
    ).value =
      String(
        settings.riderRegistrationPaymentRequired ??
        false
      );

    document.getElementById(
      "autoPayoutEnabled"
    ).value =
      String(
        settings.autoPayoutEnabled ??
        false
      );

    document.getElementById(
      "settlementFrequency"
    ).value =
      settings.settlementFrequency ||
      "monthly";

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
      String(
        settings.retryFailedSettlements ??
        false
      );

  } catch (err) {

    console.log(
      "Settings load error:",
      err
    );

    alert(
      "Unable to load settings. Please try again."
    );

  }

}

// ===================================
// SAVE SETTINGS
// ===================================

async function saveSettings() {

  try {

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
              Number(
                document.getElementById(
                  "vendorCommissionRate"
                ).value
              ),

            riderCommissionRate:
              Number(
                document.getElementById(
                  "riderCommissionRate"
                ).value
              ),

            supportEmail:
              document.getElementById(
                "supportEmail"
              ).value.trim(),

            supportPhone1:
              document.getElementById(
                "supportPhone1"
              ).value.trim(),

            supportPhone2:
              document.getElementById(
                "supportPhone2"
              ).value.trim(),

            supportPhone3:
              document.getElementById(
                "supportPhone3"
              ).value.trim(),

            supportPhone4:
              document.getElementById(
                "supportPhone4"
              ).value.trim(),

            supportPhone5:
              document.getElementById(
                "supportPhone5"
              ).value.trim(),

            termsAndConditions:
              document.getElementById(
                "termsAndConditions"
              ).value.trim(),

            businessLocation:
              document.getElementById(
                "businessLocation"
              ).value.trim(),

            workingHours:
              document.getElementById(
                "workingHours"
              ).value.trim(),

            shopRegistrationFee:
              Number(
                document.getElementById(
                  "shopRegistrationFee"
                ).value
              ),

            riderRegistrationFee:
              Number(
                document.getElementById(
                  "riderRegistrationFee"
                ).value
              ),

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
              Number(
                document.getElementById(
                  "settlementHour"
                ).value
              ),

            minimumSettlementAmount:
              Number(
                document.getElementById(
                  "minimumSettlementAmount"
                ).value
              ),

            retryFailedSettlements:
              document.getElementById(
                "retryFailedSettlements"
              ).value === "true"

          })
        }
      );

    const data =
      await res.json();

    if (!res.ok) {

      alert(
        data.message ||
        "Unable to save settings"
      );

      return;
    }

    alert(
      data.message ||
      "Settings saved successfully"
    );

  } catch (err) {

    console.log(
      "Settings save error:",
      err
    );

    alert(
      "Unable to save settings. Please try again."
    );

  }

}

initializeSettingsPage();