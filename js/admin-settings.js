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
      "flatDeliveryFee"
    ).value =
      settings.flatDeliveryFee ?? 10;

    document.getElementById(
      "perKmRate"
    ).value =
      settings.perKmRate ?? 2;

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

      document.getElementById(
  "paymentMode"
).value =
  settings.paymentMode ||
  "direct_vendor";

document.getElementById(
  "paystackEnvironment"
).value =
  settings.paystackEnvironment ||
  "test";

document.getElementById(
  "paystackSplitEnabled"
).value =
  String(
    settings.paystackSplitEnabled ??
    false
  );

updatePaymentModeStatus(
  settings
);

await loadPaystackReadiness();

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

              flatDeliveryFee:
              Number(
                document.getElementById(
                  "flatDeliveryFee"
                ).value
              ),

            perKmRate:
              Number(
                document.getElementById(
                  "perKmRate"
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
              ).value === "true",

              retryFailedSettlements:
  document.getElementById(
    "retryFailedSettlements"
  ).value === "true",

paymentMode:
  document.getElementById(
    "paymentMode"
  ).value,

paystackEnvironment:
  document.getElementById(
    "paystackEnvironment"
  ).value,

paystackSplitEnabled:
  document.getElementById(
    "paystackSplitEnabled"
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

    await loadSettings();

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

function updatePaymentModeStatus(
  settings
) {

  const box =
    document.getElementById(
      "paystackReadiness"
    );

  if (!box) return;

  const paymentMode =
    settings.paymentMode ||
    "direct_vendor";

  const environment =
    settings.paystackEnvironment ||
    "test";

  const splitEnabled =
    settings.paystackSplitEnabled ===
    true;

  if (
    paymentMode ===
    "direct_vendor"
  ) {

    box.innerHTML = `

      <strong>
        Current Payment Mode
      </strong>

      <p style="
        margin-top:10px;
        color:#166534;
        font-weight:700;
      ">
        ● Direct Vendor Payment is active
      </p>

      <p style="
        margin-top:8px;
        color:#6b7280;
      ">
        Customers pay vendors directly for products
        and pay delivery fees directly to riders.
      </p>

    `;

    return;
  }

  box.innerHTML = `

    <strong>
      Current Payment Mode
    </strong>

    <p style="
      margin-top:10px;
      color:${
        splitEnabled
          ? "#166534"
          : "#b45309"
      };
      font-weight:700;
    ">
      ${
        splitEnabled
          ? "● Paystack Split Payments enabled"
          : "● Paystack Split Payments selected but disabled"
      }
    </p>

    <p style="
      margin-top:8px;
      color:#6b7280;
    ">
      Environment:
      <strong>
        ${environment.toUpperCase()}
      </strong>
    </p>

  `;

}

// ===================================
// LOAD PAYSTACK READINESS
// ===================================

async function loadPaystackReadiness() {

  const readinessBox =
    document.getElementById(
      "paystackReadiness"
    );

  const paymentModeInput =
    document.getElementById(
      "paymentMode"
    );

  const splitEnabledInput =
    document.getElementById(
      "paystackSplitEnabled"
    );

  if (!readinessBox) return;

  readinessBox.innerHTML = `
    <strong>Paystack Readiness</strong>

    <p style="margin-top:10px;color:#6b7280;">
      Checking Paystack setup...
    </p>
  `;

  try {

    const res =
      await fetch(
        "https://mieza.onrender.com/api/admin/paystack-readiness",
        {
          headers: {
            Authorization:
              `Bearer ${token}`
          }
        }
      );

    const data =
      await res.json();

    if (!res.ok) {

      readinessBox.innerHTML = `
        <strong>Paystack Readiness</strong>

        <p style="
          margin-top:10px;
          color:#b91c1c;
        ">
          ${
            escapeSettingsHtml(
              data.message ||
              "Unable to check Paystack readiness"
            )
          }
        </p>
      `;

      return;

    }

    renderPaystackReadiness(
      data
    );

    // Prevent unsafe activation
    if (!data.canEnable) {

      if (
        splitEnabledInput &&
        splitEnabledInput.value !==
          "true"
      ) {
        splitEnabledInput.value =
          "false";
      }

      if (
        paymentModeInput &&
        paymentModeInput.value ===
          "direct_vendor"
      ) {
        splitEnabledInput.disabled =
          true;
      }

    } else {

      if (splitEnabledInput) {
        splitEnabledInput.disabled =
          false;
      }

    }

  } catch (err) {

    console.log(
      "Paystack readiness load error:",
      err
    );

    readinessBox.innerHTML = `
      <strong>Paystack Readiness</strong>

      <p style="
        margin-top:10px;
        color:#b91c1c;
      ">
        Unable to connect to the readiness checker.
      </p>
    `;

  }

}

function renderPaystackReadiness(
  data
) {

  const readinessBox =
    document.getElementById(
      "paystackReadiness"
    );

  if (!readinessBox) return;

  const statusColor =
    data.canEnable
      ? "#166534"
      : "#b45309";

  const statusBackground =
    data.canEnable
      ? "#f0fdf4"
      : "#fffbeb";

  const statusBorder =
    data.canEnable
      ? "#bbf7d0"
      : "#fde68a";

  const warnings =
    Array.isArray(data.warnings)
      ? data.warnings
      : [];

  const missingSubaccounts =
    Array.isArray(
      data.missingSubaccount
    )
      ? data.missingSubaccount
      : [];

  const missingBankDetails =
    Array.isArray(
      data.missingBankDetails
    )
      ? data.missingBankDetails
      : [];

  const momoOnlyVendors =
    Array.isArray(
      data.momoOnlyVendors
    )
      ? data.momoOnlyVendors
      : [];

  readinessBox.style.background =
    statusBackground;

  readinessBox.style.borderColor =
    statusBorder;

  readinessBox.innerHTML = `

    <strong style="
      font-size:18px;
    ">
      Paystack Readiness
    </strong>

    <p style="
      margin-top:12px;
      color:${statusColor};
      font-weight:800;
    ">
      ${
        data.canEnable
          ? "✅ Paystack is technically ready"
          : "⚠️ Paystack is not ready yet"
      }
    </p>

    <div class="paystack-readiness-grid">

      ${createReadinessItem(
        data.secretKeyConfigured,
        `${
          String(
            data.environment || "test"
          ).toUpperCase()
        } secret key configured`
      )}

      ${createReadinessItem(
        data.webhookConfigured,
        "Webhook configured"
      )}

      ${createReadinessItem(
        data.allVendorsReady,
        `${Number(
          data.vendorsReady || 0
        )} of ${Number(
          data.totalActiveVendors || 0
        )} active vendors ready`
      )}

      ${createReadinessItem(
        data.environment === "live",
        `Environment: ${
          String(
            data.environment || "test"
          ).toUpperCase()
        }`
      )}

    </div>

    <div style="
      margin-top:16px;
      padding:14px;
      border-radius:12px;
      background:rgba(255,255,255,.7);
    ">

      <p>
        <strong>Current payment mode:</strong>
        ${
          data.paymentMode ===
          "paystack_split"
            ? "Paystack Automatic Split"
            : "Direct Vendor Payment"
        }
      </p>

      <p style="margin-top:6px;">
        <strong>Split safety switch:</strong>
        ${
          data.splitEnabled
            ? "Enabled"
            : "Disabled"
        }
      </p>

      <p style="margin-top:6px;">
        <strong>Vendors not ready:</strong>
        ${Number(
          data.vendorsNotReady || 0
        )}
      </p>

    </div>

    ${
      warnings.length
        ? `
            <div class="paystack-warning-list">

              <h4>
                Requirements still missing
              </h4>

              <ul>
                ${warnings
                  .map(
                    warning => `
                      <li>
                        ${escapeSettingsHtml(
                          warning
                        )}
                      </li>
                    `
                  )
                  .join("")}
              </ul>

            </div>
          `
        : ""
    }

    ${
      momoOnlyVendors.length
        ? `
            <div class="paystack-vendor-list">

              <h4>
                Vendors with only Mobile Money details
              </h4>

              ${momoOnlyVendors
                .map(
                  shop => `
                    <div class="paystack-vendor-item">

                      <strong>
                        ${escapeSettingsHtml(
                          shop.shopName
                        )}
                      </strong>

                      <small>
                        Bank details will be required before creating a Paystack subaccount.
                      </small>

                    </div>
                  `
                )
                .join("")}

            </div>
          `
        : ""
    }

    ${
      missingBankDetails.length
        ? `
            <div class="paystack-vendor-list">

              <h4>
                Vendors with incomplete bank details
              </h4>

              ${missingBankDetails
                .map(
                  shop => `
                    <div class="paystack-vendor-item">

                      <strong>
                        ${escapeSettingsHtml(
                          shop.shopName
                        )}
                      </strong>

                      <small>
                        Missing:
                        ${getMissingBankFields(
                          shop.missing
                        )}
                      </small>

                    </div>
                  `
                )
                .join("")}

            </div>
          `
        : ""
    }

    ${
      missingSubaccounts.length
        ? `
            <div class="paystack-vendor-list">

              <h4>
                Ready for subaccount creation
              </h4>

              ${missingSubaccounts
                .map(
                  shop => `
                    <div class="paystack-vendor-item">

                      <strong>
                        ${escapeSettingsHtml(
                          shop.shopName
                        )}
                      </strong>

                      <small>
                        Bank account ending in
                        ${escapeSettingsHtml(
                          shop.accountNumberLastFour ||
                          "----"
                        )}
                      </small>

                    </div>
                  `
                )
                .join("")}

            </div>
          `
        : ""
    }

  `;

}


function createReadinessItem(
  ready,
  label
) {

  return `

    <div class="paystack-readiness-item">

      <span class="${
        ready
          ? "readiness-success"
          : "readiness-pending"
      }">

        ${
          ready
            ? "✓"
            : "!"
        }

      </span>

      <span>
        ${escapeSettingsHtml(label)}
      </span>

    </div>

  `;

}

function getMissingBankFields(
  missing
) {

  const fields = [];

  if (missing?.bankCode) {
    fields.push(
      "bank code"
    );
  }

  if (missing?.accountName) {
    fields.push(
      "account name"
    );
  }

  if (missing?.accountNumber) {
    fields.push(
      "account number"
    );
  }

  return fields.length
    ? fields.join(", ")
    : "unknown details";

}

function escapeSettingsHtml(
  value
) {

  return String(
    value ?? ""
  )
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}

document.addEventListener(
  "DOMContentLoaded",
  () => {

    const environmentInput =
      document.getElementById(
        "paystackEnvironment"
      );

    const paymentModeInput =
      document.getElementById(
        "paymentMode"
      );

    const splitInput =
      document.getElementById(
        "paystackSplitEnabled"
      );

    environmentInput
      ?.addEventListener(
        "change",
        () => {

          splitInput.value =
            "false";

          splitInput.disabled =
            true;

        }
      );

    paymentModeInput
      ?.addEventListener(
        "change",
        event => {

          if (
            event.target.value ===
            "direct_vendor"
          ) {

            splitInput.value =
              "false";

          }

        }
      );

  }
);

initializeSettingsPage();