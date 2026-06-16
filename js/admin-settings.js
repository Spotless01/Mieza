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
    "businessLocation"
  ).value =
    settings.businessLocation;

  document.getElementById(
    "workingHours"
  ).value =
    settings.workingHours;

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

          businessLocation:
            document.getElementById(
              "businessLocation"
            ).value,

          workingHours:
            document.getElementById(
              "workingHours"
            ).value

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