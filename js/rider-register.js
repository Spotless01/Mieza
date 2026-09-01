// ============================================================
// MIEZA RIDER REGISTRATION
// ============================================================


// ============================================================
// CONFIG
// ============================================================

const API_URL =
  "https://mieza.onrender.com/api";


const PAYSTACK_PUBLIC_KEY =
  "pk_live_8d2c51aba42a777a0e497cec1243d30a0e1df4ee";


let registrationFee = 100;

let paymentRequired = true;

let paymentProvider = "manual";


// ============================================================
// PAGE LOAD
// ============================================================

document.addEventListener(
  "DOMContentLoaded",
  async () => {

    await loadRegistrationSettings();

    initializeTermsModal();

    initializeLocationCapture();

    initializePayoutSwitcher();

    initializeVehicleSwitcher();

    initializeRegisterButton();

  }
);


// ============================================================
// LOAD REGISTRATION SETTINGS
// ============================================================

async function loadRegistrationSettings() {

  try {

    const response =
      await fetch(
        `${API_URL}/config/settings`
      );


    if (!response.ok) {
      throw new Error(
        "Unable to load registration settings."
      );
    }


    const settings =
      await response.json();


    registrationFee =
      Number(
        settings.riderRegistrationFee ??
        100
      );


    paymentRequired =
      settings.riderRegistrationPaymentRequired ??
      true;


    paymentProvider =
      settings.paymentProvider ||
      "manual";


    // ==========================================
    // INTRO
    // ==========================================

    const intro =
      document.querySelector(".intro");


    if (intro) {

      if (paymentRequired) {

        intro.innerHTML =
          `
          Become a Mieza Delivery Rider.<br>
          Registration Fee:
          <strong>
            ₵${registrationFee}
          </strong>
          `;

      } else {

        intro.innerHTML =
          `
          Become a Mieza Delivery Rider.<br>
          <strong>
            Registration is FREE
          </strong>
          `;

      }

    }


    // ==========================================
    // REGISTER BUTTON
    // ==========================================

    const button =
      document.getElementById(
        "payAndRegisterBtn"
      );


    if (button) {

      button.textContent =
        paymentRequired
          ? `Pay ₵${registrationFee} & Register`
          : "Register Free";

    }


    // ==========================================
    // TERMS
    // ==========================================

    const termsElement =
      document.getElementById(
        "termsText"
      );


    if (termsElement) {

      termsElement.textContent =
        settings.termsAndConditions ||
        "No Terms & Conditions available.";

    }


  } catch (err) {

    console.error(
      "Registration settings error:",
      err
    );


    const intro =
      document.querySelector(".intro");


    if (intro) {

      intro.innerHTML =
        `
        Become a Mieza Delivery Rider.
        `;

    }


    const button =
      document.getElementById(
        "payAndRegisterBtn"
      );


    if (button) {

      button.textContent =
        paymentRequired
          ? `Pay ₵${registrationFee} & Register`
          : "Register Free";

    }

  }

}


// ============================================================
// TERMS MODAL
// ============================================================

function initializeTermsModal() {

  const modal =
    document.getElementById(
      "termsModal"
    );


  const viewTerms =
    document.getElementById(
      "viewTerms"
    );


  const closeTerms =
    document.getElementById(
      "closeTerms"
    );


  const acceptTerms =
    document.getElementById(
      "acceptTermsBtn"
    );


  viewTerms?.addEventListener(
    "click",
    event => {

      event.preventDefault();

      modal?.classList.add(
        "show"
      );

    }
  );


  closeTerms?.addEventListener(
    "click",
    () => {

      modal?.classList.remove(
        "show"
      );

    }
  );


  acceptTerms?.addEventListener(
    "click",
    () => {

      const checkbox =
        document.getElementById(
          "agreeTerms"
        );


      if (checkbox) {
        checkbox.checked = true;
      }


      modal?.classList.remove(
        "show"
      );

    }
  );

}


// ============================================================
// PAYOUT SWITCHER
// ============================================================

function initializePayoutSwitcher() {

  const payout =
    document.getElementById(
      "payoutMethod"
    );


  if (!payout) {
    return;
  }


  payout.addEventListener(
    "change",
    toggleRidePayoutFields
  );


  toggleRidePayoutFields();

}


function toggleRidePayoutFields() {

  const payoutMethod =
    document.getElementById(
      "payoutMethod"
    )?.value;


  const momoFields =
    document.getElementById(
      "momoFields"
    );


  const bankFields =
    document.getElementById(
      "bankFields"
    );


  if (!momoFields || !bankFields) {
    return;
  }


  const isMomo =
    payoutMethod === "momo";


  momoFields.style.display =
    isMomo
      ? "block"
      : "none";


  bankFields.style.display =
    isMomo
      ? "none"
      : "block";


  // ==========================================
  // MOMO
  // ==========================================

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


  if (momoNumber) {
    momoNumber.required =
      isMomo;
  }


  if (momoName) {
    momoName.required =
      isMomo;
  }


  if (momoNetwork) {
    momoNetwork.required =
      isMomo;
  }


  // ==========================================
  // BANK
  // ==========================================

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


  if (bankName) {
    bankName.required =
      !isMomo;
  }


  if (accountName) {
    accountName.required =
      !isMomo;
  }


  if (accountNumber) {
    accountNumber.required =
      !isMomo;
  }

}


// ============================================================
// VEHICLE SWITCHER
// ============================================================

function initializeVehicleSwitcher() {

  const vehicleSelect =
    document.getElementById(
      "vehicleType"
    );


  if (!vehicleSelect) {
    return;
  }


  vehicleSelect.addEventListener(
    "change",
    toggleVehicleFields
  );


  toggleVehicleFields();

}


function toggleVehicleFields() {

  const vehicle =
    document.getElementById(
      "vehicleType"
    )?.value;


  const vehicleFields =
    document.getElementById(
      "vehicleFields"
    );


  if (!vehicleFields) {
    return;
  }


  const isBicycle =
    vehicle === "bicycle";


  vehicleFields.style.display =
    isBicycle
      ? "none"
      : "block";


  // ==========================================
  // VEHICLE INPUTS
  // ==========================================

  const fields = [

    "vehicleBrand",

    "vehicleModel",

    "vehicleColor",

    "plateNumber",

    "driverLicenseNumber"

  ];


  fields.forEach(
    id => {

      const input =
        document.getElementById(
          id
        );


      if (input) {

        input.required =
          !isBicycle;

      }

    }
  );

}


// ============================================================
// LOCATION CAPTURE
// ============================================================

function initializeLocationCapture() {

  const button =
    document.getElementById(
      "getRideDriverLocation"
    );


  if (!button) {
    return;
  }


  button.addEventListener(
    "click",
    captureLocation
  );

}


async function captureLocation() {

  const button =
    document.getElementById(
      "getRideDriverLocation"
    );


  if (!navigator.geolocation) {

    alert(
      "GPS is not supported on this device."
    );

    return;

  }


  button.disabled = true;

  button.textContent =
    "Waiting for GPS...";


  navigator.geolocation.getCurrentPosition(

    async position => {

      const lat =
        position.coords.latitude;


      const lng =
        position.coords.longitude;


      document.getElementById(
        "latitude"
      ).value = lat;


      document.getElementById(
        "longitude"
      ).value = lng;


      try {

        const response =
          await fetch(

            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(
              lat
            )}&lon=${encodeURIComponent(
              lng
            )}`,

            {
              headers: {
                Accept:
                  "application/json"
              }
            }

          );


        const data =
          await response.json();


        document.getElementById(
          "currentLocation"
        ).value =
          data.display_name ||
          `${lat}, ${lng}`;


      } catch (err) {

        document.getElementById(
          "currentLocation"
        ).value =
          `${lat}, ${lng}`;

      }


      document.getElementById(
        "locationStatus"
      ).textContent =
        "Current location captured";


      button.textContent =
        "Location Captured";


      button.disabled = false;

    },


    error => {

      console.error(
        "GPS error:",
        error
      );


      alert(
        "Unable to get your current location. Please enable location access and try again."
      );


      button.disabled = false;


      button.textContent =
        "Use My Current Location";

    },


    {

      enableHighAccuracy: true,

      timeout: 30000,

      maximumAge: 0

    }

  );

}


// ============================================================
// REGISTER BUTTON
// ============================================================

function initializeRegisterButton() {

  const button =
    document.getElementById(
      "payAndRegisterBtn"
    );


  if (!button) {
    return;
  }


  button.addEventListener(
    "click",
    async () => {

      if (
        !validateRegistrationForm()
      ) {

        return;

      }


      if (
        paymentRequired
      ) {

        payAndRegisterRider();

      } else {

        await registerRider(
          `FREE_RIDER_${Date.now()}`
        );

      }

    }
  );

}


// ============================================================
// VALIDATE FORM
// ============================================================

function validateRegistrationForm() {

  const agreeTerms =
    document.getElementById(
      "agreeTerms"
    );


  if (
    !agreeTerms?.checked
  ) {

    alert(
      "Please accept the Terms & Conditions."
    );

    return false;

  }


  const requiredIds = [

    "fullName",

    "phone",

    "email",

    "password",

    "nationalIdNumber",

    "vehicleType"

  ];


  for (
    const id of requiredIds
  ) {

    const element =
      document.getElementById(
        id
      );


    if (
      !element ||
      !element.value.trim()
    ) {

      alert(
        "Please complete all required fields."
      );


      element?.focus();


      return false;

    }

  }


  const vehicleType =
    document.getElementById(
      "vehicleType"
    ).value;


  if (
    vehicleType !== "bicycle"
  ) {

    const vehicleRequiredIds = [

      "vehicleBrand",

      "vehicleModel",

      "vehicleColor",

      "plateNumber",

      "driverLicenseNumber"

    ];


    for (
      const id of vehicleRequiredIds
    ) {

      const element =
        document.getElementById(
          id
        );


      if (
        !element ||
        !element.value.trim()
      ) {

        alert(
          "Please complete all vehicle information."
        );


        element?.focus();


        return false;

      }

    }

  }


  const payoutMethod =
    document.getElementById(
      "payoutMethod"
    ).value;


  if (
    payoutMethod === "momo"
  ) {

    const momoIds = [

      "momoNumber",

      "momoName",

      "momoNetwork"

    ];


    for (
      const id of momoIds
    ) {

      const element =
        document.getElementById(
          id
        );


      if (
        !element ||
        !element.value.trim()
      ) {

        alert(
          "Please complete your Mobile Money payout details."
        );


        element?.focus();


        return false;

      }

    }

  } else {

    const bankIds = [

      "bankName",

      "accountName",

      "accountNumber"

    ];


    for (
      const id of bankIds
    ) {

      const element =
        document.getElementById(
          id
        );


      if (
        !element ||
        !element.value.trim()
      ) {

        alert(
          "Please complete your bank payout details."
        );


        element?.focus();


        return false;

      }

    }

  }


  // ==========================================
  // PROFILE PHOTO
  // ==========================================

  const profilePhoto =
    document.getElementById(
      "profilePhoto"
    )?.files?.[0];


  if (profilePhoto) {

    if (
      profilePhoto.size >
      5 * 1024 * 1024
    ) {

      alert(
        "Profile photo must not exceed 5MB."
      );

      return false;

    }

  }


  // ==========================================
  // VEHICLE PHOTOS
  // ==========================================

  const vehiclePhotos =
    document.getElementById(
      "vehiclePhotos"
    )?.files || [];


  if (
    vehiclePhotos.length > 5
  ) {

    alert(
      "You can upload a maximum of 5 vehicle photos."
    );

    return false;

  }


  for (
    const file of vehiclePhotos
  ) {

    if (
      file.size >
      5 * 1024 * 1024
    ) {

      alert(
        "Each vehicle photo must not exceed 5MB."
      );

      return false;

    }

  }


  return true;

}


// ============================================================
// UPLOAD RIDER IMAGES
// ============================================================

async function uploadRiderImages() {

  const formData =
    new FormData();


  const profilePhoto =
    document.getElementById(
      "profilePhoto"
    )?.files?.[0];


  if (profilePhoto) {

    formData.append(
      "profilePhoto",
      profilePhoto
    );

  }


  const vehiclePhotos =
    document.getElementById(
      "vehiclePhotos"
    )?.files || [];


  for (
    const file of vehiclePhotos
  ) {

    formData.append(
      "vehiclePhotos",
      file
    );

  }


  // ==========================================
  // NOTHING TO UPLOAD
  // ==========================================

  if (
    !profilePhoto &&
    vehiclePhotos.length === 0
  ) {

    return {

      profilePhoto: "",

      vehiclePhotos: []

    };

  }


  const response =
    await fetch(

      `${API_URL}/riders/upload`,

      {

        method:
          "POST",

        body:
          formData

      }

    );


  const data =
    await response.json();


  if (!response.ok) {

    throw new Error(
      data.message ||
      "Unable to upload rider images."
    );

  }


  return data;

}


// ============================================================
// REGISTER RIDER
// ============================================================

async function registerRider(
  paymentReference
) {

  const button =
    document.getElementById(
      "payAndRegisterBtn"
    );


  button.disabled = true;

  button.textContent =
    "Uploading documents...";


  try {

    // ========================================
    // UPLOAD IMAGES
    // ========================================

    const uploadedImages =
      await uploadRiderImages();


    button.textContent =
      "Registering rider...";


    // ========================================
    // COLLECT FORM VALUES
    // ========================================

    const fullName =
      document.getElementById(
        "fullName"
      ).value.trim();


    const phone =
      document.getElementById(
        "phone"
      ).value.trim();


    const email =
      document.getElementById(
        "email"
      ).value.trim();


    const password =
      document.getElementById(
        "password"
      ).value;


    const vehicleType =
      document.getElementById(
        "vehicleType"
      ).value;


    const currentLocation =
      document.getElementById(
        "currentLocation"
      ).value.trim();


    const latitude =
      document.getElementById(
        "latitude"
      ).value;


    const longitude =
      document.getElementById(
        "longitude"
      ).value;


    const nationalIdNumber =
      document.getElementById(
        "nationalIdNumber"
      ).value.trim();


    const payoutMethod =
      document.getElementById(
        "payoutMethod"
      ).value;


    // ========================================
    // REGISTER REQUEST
    // ========================================

    const response =
      await fetch(

        `${API_URL}/riders/register`,

        {

          method:
            "POST",

          headers: {

            "Content-Type":
              "application/json"

          },

          body:
            JSON.stringify({

              fullName,

              phone,

              email,

              password,

              vehicleType,

              driverLicenseNumber:
                document.getElementById(
                  "driverLicenseNumber"
                ).value.trim(),

              vehicleBrand:
                document.getElementById(
                  "vehicleBrand"
                ).value.trim(),

              vehicleModel:
                document.getElementById(
                  "vehicleModel"
                ).value.trim(),

              vehicleColor:
                document.getElementById(
                  "vehicleColor"
                ).value.trim(),

              plateNumber:
                document.getElementById(
                  "plateNumber"
                ).value.trim(),

              profilePhoto:
                uploadedImages.profilePhoto ||
                "",

              vehiclePhotos:
                uploadedImages.vehiclePhotos ||
                [],

              nationalIdNumber,

              currentLocation,

              currentLatitude:
                latitude
                  ? Number(latitude)
                  : null,

              currentLongitude:
                longitude
                  ? Number(longitude)
                  : null,

              payoutMethod,

              momoNumber:
                document.getElementById(
                  "momoNumber"
                ).value.trim(),

              momoName:
                document.getElementById(
                  "momoName"
                ).value.trim(),

              momoNetwork:
                document.getElementById(
                  "momoNetwork"
                ).value,

              momoBankCode:
                document.getElementById(
                  "momoBankCode"
                ).value.trim(),

              bankName:
                document.getElementById(
                  "bankName"
                ).value.trim(),

              bankCode:
                document.getElementById(
                  "bankCode"
                ).value.trim(),

              accountName:
                document.getElementById(
                  "accountName"
                ).value.trim(),

              accountNumber:
                document.getElementById(
                  "accountNumber"
                ).value.trim(),

              paymentReference

            })

        }

      );


    const data =
      await response.json();


    if (!response.ok) {

      throw new Error(
        data.message ||
        "Registration failed."
      );

    }


    alert(
      data.message ||
      "Rider registered successfully."
    );


    window.location.href =
      "rider-login.html";


  } catch (err) {

    console.error(
      "RIDER REGISTRATION ERROR:",
      err
    );


    alert(
      err.message ||
      "Registration failed. Please try again."
    );


    button.disabled = false;


    button.textContent =
      paymentRequired
        ? `Pay ₵${registrationFee} & Register`
        : "Register Free";

  }

}


// ============================================================
// PAYSTACK + REGISTER
// ============================================================

function payAndRegisterRider() {

  if (!paymentRequired) {

    registerRider(
      `FREE_RIDER_${Date.now()}`
    );

    return;

  }


  const email =
    document.getElementById(
      "email"
    ).value.trim();


  const fullName =
    document.getElementById(
      "fullName"
    ).value.trim();


  if (
    !email ||
    !fullName
  ) {

    alert(
      "Please complete the registration form."
    );

    return;

  }


  if (
    typeof PaystackPop ===
    "undefined"
  ) {

    alert(
      "Paystack could not be loaded. Please refresh the page and try again."
    );

    return;

  }


  const handler =
    PaystackPop.setup({

      key:
        PAYSTACK_PUBLIC_KEY,

      email,

      amount:
        Math.round(
          Number(
            registrationFee
          ) * 100
        ),

      currency:
        "GHS",

      metadata: {

        custom_fields: [

          {

            display_name:
              "Full Name",

            variable_name:
              "full_name",

            value:
              fullName

          },

          {

            display_name:
              "Registration Type",

            variable_name:
              "registration_type",

            value:
              "Mieza Rider"

          }

        ]

      },


      callback:
        function (
          response
        ) {

          registerRider(
            response.reference
          );

        },


      onClose:
        function () {

          alert(
            "Payment cancelled."
          );

        }

    });


  handler.openIframe();

}