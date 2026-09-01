// ============================================
// MIEZA RIDE DRIVER REGISTRATION
// ============================================

// -------------------------------
// CONFIG
// -------------------------------

const API_URL = "https://mieza.onrender.com/api";

const PAYSTACK_PUBLIC_KEY =
    "pk_live_8d2c51aba42a777a0e497cec1243d30a0e1df4ee";

let registrationFee = 100;
let paymentRequired = true;
let paymentProvider = "manual";

// -------------------------------
// PAGE LOAD
// -------------------------------

document.addEventListener("DOMContentLoaded", async () => {

    await loadRegistrationSettings();

    initializeTermsModal();

    initializeLocationCapture();

    initializePayoutSwitcher();

    initializeVehicleSwitcher();

    initializeRegisterButton();

});


// ============================================
// LOAD REGISTRATION SETTINGS
// ============================================

async function loadRegistrationSettings() {

    try {

        const response = await fetch(
            `${API_URL}/config/settings`,
            {
                cache: "no-store"
            }
        );

        if (!response.ok) {
            throw new Error(
                `Settings request failed: ${response.status}`
            );
        }

        const settings = await response.json();

        registrationFee =
            settings.riderRegistrationFee ?? 100;

        paymentRequired =
            settings.riderRegistrationPaymentRequired !== false;

        paymentProvider =
            settings.paymentProvider || "manual";


        // ----------------------------------
        // UPDATE INTRO
        // ----------------------------------

        const intro =
            document.querySelector(".intro");

        if (intro) {

            if (paymentRequired) {

                intro.innerHTML = `
                    Become a Mieza Delivery Rider.<br>
                    Registration Fee:
                    <strong>₵${registrationFee}</strong>
                `;

            } else {

                intro.innerHTML = `
                    Become a Mieza Delivery Rider.<br>
                    <strong>Registration is FREE</strong>
                `;

            }

        }


        // ----------------------------------
        // UPDATE REGISTER BUTTON
        // ----------------------------------

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


        // ----------------------------------
        // TERMS & CONDITIONS
        // ----------------------------------

        const termsElement =
            document.getElementById("termsText");

        if (termsElement) {

            termsElement.textContent =
                settings.termsAndConditions ||
                "No Terms & Conditions available.";

        }

    }

    catch (error) {

        console.error(
            "Registration settings load failed:",
            error
        );

        const intro =
            document.querySelector(".intro");

        if (intro) {

            intro.innerHTML = `
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


// ============================================
// TERMS MODAL
// ============================================

function initializeTermsModal() {

    const modal =
        document.getElementById("termsModal");

    const viewTerms =
        document.getElementById("viewTerms");

    const closeTerms =
        document.getElementById("closeTerms");

    const acceptTerms =
        document.getElementById("acceptTermsBtn");

    const agreementCheckbox =
        document.getElementById("agreeTerms");


    if (!modal) {
        return;
    }


    // VIEW TERMS

    viewTerms?.addEventListener(
        "click",
        (event) => {

            event.preventDefault();

            modal.classList.add("show");

            modal.setAttribute(
                "aria-hidden",
                "false"
            );

        }
    );


    // CLOSE TERMS

    closeTerms?.addEventListener(
        "click",
        () => {

            modal.classList.remove("show");

            modal.setAttribute(
                "aria-hidden",
                "true"
            );

        }
    );


    // ACCEPT TERMS

    acceptTerms?.addEventListener(
        "click",
        () => {

            if (agreementCheckbox) {

                agreementCheckbox.checked = true;

            }

            modal.classList.remove("show");

            modal.setAttribute(
                "aria-hidden",
                "true"
            );

        }
    );


    // CLICK OUTSIDE MODAL

    modal.addEventListener(
        "click",
        (event) => {

            if (event.target === modal) {

                modal.classList.remove("show");

                modal.setAttribute(
                    "aria-hidden",
                    "true"
                );

            }

        }
    );

}


// ============================================
// PAYOUT SWITCHER
// ============================================

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

    const payoutMethodElement =
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
        !payoutMethodElement ||
        !momoFields ||
        !bankFields
    ) {
        return;
    }


    const payoutMethod =
        payoutMethodElement.value;


    const isMomo =
        payoutMethod === "momo";

    const isBank =
        payoutMethod === "bank";


    // ----------------------------------
    // DISPLAY CORRECT SECTION
    // ----------------------------------

    momoFields.style.display =
        isMomo
            ? "block"
            : "none";

    bankFields.style.display =
        isBank
            ? "block"
            : "none";


    // ----------------------------------
    // MOMO REQUIRED FIELDS
    // ----------------------------------

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


    // ----------------------------------
    // BANK REQUIRED FIELDS
    // ----------------------------------

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
            isBank;

    }

    if (accountName) {

        accountName.required =
            isBank;

    }

    if (accountNumber) {

        accountNumber.required =
            isBank;

    }

}


// ============================================
// VEHICLE SWITCHER
// ============================================

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

    const vehicleSelect =
        document.getElementById(
            "vehicleType"
        );

    const vehicleFields =
        document.getElementById(
            "vehicleFields"
        );


    if (
        !vehicleSelect ||
        !vehicleFields
    ) {
        return;
    }


    const vehicle =
        vehicleSelect.value;


    if (vehicle === "bicycle") {

        vehicleFields.style.display =
            "none";

    } else {

        vehicleFields.style.display =
            "block";

    }

}


// ============================================
// LOCATION CAPTURE
// ============================================

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
        captureCurrentLocation
    );

}


// ============================================
// CAPTURE CURRENT GPS LOCATION
// ============================================

function captureCurrentLocation() {

    const button =
        document.getElementById(
            "getRideDriverLocation"
        );

    const locationInput =
        document.getElementById(
            "currentLocation"
        );

    const latitudeInput =
        document.getElementById(
            "latitude"
        );

    const longitudeInput =
        document.getElementById(
            "longitude"
        );

    const locationStatus =
        document.getElementById(
            "locationStatus"
        );


    if (!navigator.geolocation) {

        alert(
            "GPS is not supported by this device."
        );

        return;

    }


    if (!button) {
        return;
    }


    // ----------------------------------
    // RESET STATUS
    // ----------------------------------

    button.disabled = true;

    button.textContent =
        "Waiting for GPS...";


    if (locationStatus) {

        locationStatus.textContent =
            "Requesting your exact GPS location...";

    }


    // ----------------------------------
    // REQUEST GPS
    // ----------------------------------

    navigator.geolocation.getCurrentPosition(

        async (position) => {

            try {

                const latitude =
                    Number(
                        position.coords.latitude
                    );

                const longitude =
                    Number(
                        position.coords.longitude
                    );


                // ----------------------------------
                // VALIDATE GPS
                // ----------------------------------

                if (
                    !Number.isFinite(latitude) ||
                    !Number.isFinite(longitude)
                ) {

                    throw new Error(
                        "Invalid GPS coordinates received."
                    );

                }


                // ----------------------------------
                // STORE GPS IN HIDDEN INPUTS
                // ----------------------------------

                if (latitudeInput) {

                    latitudeInput.value =
                        latitude;

                }

                if (longitudeInput) {

                    longitudeInput.value =
                        longitude;

                }


                // ----------------------------------
                // TEMPORARY LOCATION
                // ----------------------------------

                if (locationInput) {

                    locationInput.value =
                        `${latitude}, ${longitude}`;

                }


                if (locationStatus) {

                    locationStatus.textContent =
                        "GPS coordinates captured. Getting address...";

                }


                // ----------------------------------
                // REVERSE GEOCODING
                // ----------------------------------

                try {

                    const reverseUrl =
                        "https://nominatim.openstreetmap.org/reverse" +
                        `?format=jsonv2` +
                        `&lat=${encodeURIComponent(latitude)}` +
                        `&lon=${encodeURIComponent(longitude)}` +
                        `&zoom=18` +
                        `&addressdetails=1`;


                    const response =
                        await fetch(
                            reverseUrl,
                            {
                                headers: {
                                    "Accept":
                                        "application/json"
                                }
                            }
                        );


                    if (!response.ok) {

                        throw new Error(
                            `Reverse geocoding failed: ${response.status}`
                        );

                    }


                    const data =
                        await response.json();


                    if (
                        data &&
                        data.display_name
                    ) {

                        if (locationInput) {

                            locationInput.value =
                                data.display_name;

                        }

                    }

                }

                catch (geocodeError) {

                    console.warn(
                        "Reverse geocoding failed:",
                        geocodeError
                    );

                    // Keep coordinates as fallback.
                    if (locationInput) {

                        locationInput.value =
                            `${latitude}, ${longitude}`;

                    }

                }


                // ----------------------------------
                // SUCCESS
                // ----------------------------------

                if (locationStatus) {

                    locationStatus.textContent =
                        "Current GPS location captured successfully.";

                }


                button.disabled = false;

                button.textContent =
                    "Location Captured ✓";

            }

            catch (error) {

                console.error(
                    "GPS processing error:",
                    error
                );

                if (locationStatus) {

                    locationStatus.textContent =
                        "Unable to process GPS location.";

                }

                button.disabled = false;

                button.textContent =
                    "Use My Current Location";

            }

        },


        // ----------------------------------
        // GPS ERROR
        // ----------------------------------

        (error) => {

            console.error(
                "Geolocation error:",
                error
            );


            let message =
                "Unable to get your current location.";


            if (error) {

                switch (error.code) {

                    case error.PERMISSION_DENIED:

                        message =
                            "Location permission was denied. Please allow location access and try again.";

                        break;


                    case error.POSITION_UNAVAILABLE:

                        message =
                            "Your GPS location is currently unavailable. Please move to an area with a better GPS signal and try again.";

                        break;


                    case error.TIMEOUT:

                        message =
                            "GPS request timed out. Please try again.";

                        break;

                }

            }


            if (locationStatus) {

                locationStatus.textContent =
                    message;

            }


            alert(message);


            button.disabled = false;

            button.textContent =
                "Use My Current Location";

        },


        // ----------------------------------
        // GPS OPTIONS
        // ----------------------------------

        {
            enableHighAccuracy: true,
            timeout: 30000,
            maximumAge: 0
        }

    );

}


// ============================================
// REGISTER BUTTON
// ============================================

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

            // ----------------------------------
            // TERMS
            // ----------------------------------

            const termsAccepted =
                document.getElementById(
                    "agreeTerms"
                )?.checked;


            if (!termsAccepted) {

                alert(
                    "Please accept the Terms & Conditions."
                );

                return;

            }


            // ----------------------------------
            // PAYMENT
            // ----------------------------------

            if (paymentRequired) {

                payAndRegisterRider();

            } else {

                registerRider(
                    `FREE_RIDER_${Date.now()}`
                );

            }

        }
    );

}


// ============================================
// VALIDATE REGISTRATION FORM
// ============================================

function validateRegistrationForm() {

    const fullName =
        document.getElementById(
            "fullName"
        )?.value.trim();

    const phone =
        document.getElementById(
            "phone"
        )?.value.trim();

    const email =
        document.getElementById(
            "email"
        )?.value.trim();

    const password =
        document.getElementById(
            "password"
        )?.value.trim();

    const vehicleType =
        document.getElementById(
            "vehicleType"
        )?.value;


    if (
        !fullName ||
        !phone ||
        !email ||
        !password ||
        !vehicleType
    ) {

        alert(
            "Please complete all required fields."
        );

        return false;

    }


    // ----------------------------------
    // LOCATION
    // ----------------------------------

    const latitude =
        document.getElementById(
            "latitude"
        )?.value;

    const longitude =
        document.getElementById(
            "longitude"
        )?.value;


    if (
        latitude === "" ||
        longitude === "" ||
        latitude === null ||
        longitude === null ||
        latitude === undefined ||
        longitude === undefined
    ) {

        alert(
            "Please capture your current GPS location before registering."
        );

        return false;

    }


    // ----------------------------------
    // GHANA CARD
    // ----------------------------------

    const nationalIdNumber =
        document.getElementById(
            "nationalIdNumber"
        )?.value.trim();


    if (!nationalIdNumber) {

        alert(
            "Please enter your Ghana Card Number."
        );

        return false;

    }


    // ----------------------------------
    // VEHICLE VALIDATION
    // ----------------------------------

    if (vehicleType !== "bicycle") {

        const driverLicenseNumber =
            document.getElementById(
                "driverLicenseNumber"
            )?.value.trim();

        const vehicleBrand =
            document.getElementById(
                "vehicleBrand"
            )?.value.trim();

        const vehicleModel =
            document.getElementById(
                "vehicleModel"
            )?.value.trim();

        const vehicleColor =
            document.getElementById(
                "vehicleColor"
            )?.value.trim();

        const plateNumber =
            document.getElementById(
                "plateNumber"
            )?.value.trim();


        if (
            !driverLicenseNumber ||
            !vehicleBrand ||
            !vehicleModel ||
            !vehicleColor ||
            !plateNumber
        ) {

            alert(
                "Please complete all required vehicle information."
            );

            return false;

        }

    }


    return true;

}


// ============================================
// REGISTER RIDER
// ============================================

async function registerRider(paymentReference) {

    const button =
        document.getElementById(
            "payAndRegisterBtn"
        );


    // ----------------------------------
    // VALIDATE
    // ----------------------------------

    if (!validateRegistrationForm()) {

        return;

    }


    button.disabled = true;

    button.textContent =
        "Registering...";


    try {

        // ----------------------------------
        // BASIC INFORMATION
        // ----------------------------------

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
            ).value.trim();

        const vehicleType =
            document.getElementById(
                "vehicleType"
            ).value;


        // ----------------------------------
        // LOCATION
        // ----------------------------------

        const currentLocation =
            document.getElementById(
                "currentLocation"
            ).value.trim();

        const latitude =
            Number(
                document.getElementById(
                    "latitude"
                ).value
            );

        const longitude =
            Number(
                document.getElementById(
                    "longitude"
                ).value
            );


        // ----------------------------------
        // VEHICLE
        // ----------------------------------

        const driverLicenseNumber =
            document.getElementById(
                "driverLicenseNumber"
            )?.value.trim() || "";

        const vehicleBrand =
            document.getElementById(
                "vehicleBrand"
            )?.value.trim() || "";

        const vehicleModel =
            document.getElementById(
                "vehicleModel"
            )?.value.trim() || "";

        const vehicleColor =
            document.getElementById(
                "vehicleColor"
            )?.value.trim() || "";

        const plateNumber =
            document.getElementById(
                "plateNumber"
            )?.value.trim() || "";


        // ----------------------------------
        // GHANA CARD
        // ----------------------------------

        const nationalIdNumber =
            document.getElementById(
                "nationalIdNumber"
            )?.value.trim() || "";


        // ----------------------------------
        // PAYOUT
        // ----------------------------------

        const payoutMethod =
            document.getElementById(
                "payoutMethod"
            ).value;

        const momoNumber =
            document.getElementById(
                "momoNumber"
            )?.value.trim() || "";

        const momoName =
            document.getElementById(
                "momoName"
            )?.value.trim() || "";

        const momoNetwork =
            document.getElementById(
                "momoNetwork"
            )?.value || "";

        const momoBankCode =
            document.getElementById(
                "momoBankCode"
            )?.value || "";

        const bankName =
            document.getElementById(
                "bankName"
            )?.value.trim() || "";

        const bankCode =
            document.getElementById(
                "bankCode"
            )?.value || "";

        const accountName =
            document.getElementById(
                "accountName"
            )?.value.trim() || "";

        const accountNumber =
            document.getElementById(
                "accountNumber"
            )?.value.trim() || "";


        // ==================================
        // IMPORTANT LOCATION PAYLOAD
        // ==================================

        /*
         * Your backend already accepts:
         *
         * currentLocation
         * currentLatitude
         * currentLongitude
         *
         * We send all three.
         *
         * currentLocation remains a STRING because
         * that matches your existing Rider model/backend.
         */

        const registrationPayload = {

            // ------------------------------
            // PERSONAL
            // ------------------------------

            fullName,

            phone,

            email,

            password,


            // ------------------------------
            // VEHICLE
            // ------------------------------

            vehicleType,

            driverLicenseNumber,

            vehicleBrand,

            vehicleModel,

            vehicleColor,

            plateNumber,


            // ------------------------------
            // LOCATION
            // ------------------------------

            currentLocation,

            currentLatitude: latitude,

            currentLongitude: longitude,


            // ------------------------------
            // GHANA CARD
            // ------------------------------

            nationalIdNumber,


            // ------------------------------
            // PAYOUT
            // ------------------------------

            payoutMethod,

            momoNumber,

            momoName,

            momoNetwork,

            momoBankCode,

            bankName,

            bankCode,

            accountName,

            accountNumber,


            // ------------------------------
            // PAYMENT
            // ------------------------------

            paymentReference

        };


        console.log(
            "Submitting rider registration:",
            {
                ...registrationPayload,
                password: "[HIDDEN]"
            }
        );


        // ==================================
        // SEND TO BACKEND
        // ==================================

        const response =
            await fetch(
                `${API_URL}/riders/register`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            registrationPayload
                        )
                }
            );


        // ----------------------------------
        // READ RESPONSE
        // ----------------------------------

        let data = {};

        try {

            data =
                await response.json();

        }

        catch {

            data = {
                message:
                    "Unexpected server response."
            };

        }


        // ----------------------------------
        // SUCCESS
        // ----------------------------------

        if (response.ok) {

            alert(
                data.message ||
                "Registration successful."
            );


            window.location.href =
                "rider-login.html";


            return;

        }


        // ----------------------------------
        // SERVER ERROR
        // ----------------------------------

        alert(
            data.message ||
            "Registration failed."
        );


        button.disabled = false;

        button.textContent =
            paymentRequired
                ? `Pay ₵${registrationFee} & Register`
                : "Register Free";

    }

    catch (error) {

        console.error(
            "Rider registration error:",
            error
        );


        alert(
            "Registration failed. Please check your internet connection and try again."
        );


        button.disabled = false;

        button.textContent =
            paymentRequired
                ? `Pay ₵${registrationFee} & Register`
                : "Register Free";

    }

}


// ============================================
// PAYSTACK + REGISTER
// ============================================

function payAndRegisterRider() {

    if (!paymentRequired) {

        registerRider(
            `FREE_RIDER_${Date.now()}`
        );

        return;

    }


    // ----------------------------------
    // VALIDATE FORM BEFORE PAYMENT
    // ----------------------------------

    if (!validateRegistrationForm()) {

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


    // ----------------------------------
    // CHECK PAYSTACK
    // ----------------------------------

    if (
        typeof PaystackPop ===
        "undefined"
    ) {

        alert(
            "Payment service is currently unavailable. Please try again later."
        );

        return;

    }


    // ----------------------------------
    // PAYSTACK
    // ----------------------------------

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
                            "Vehicle Type",

                        variable_name:
                            "vehicle_type",

                        value:
                            document.getElementById(
                                "vehicleType"
                            )?.value || ""
                    }

                ]

            },


            callback:
                function (response) {

                    if (
                        response &&
                        response.reference
                    ) {

                        registerRider(
                            response.reference
                        );

                    } else {

                        alert(
                            "Payment was completed but no payment reference was received."
                        );

                    }

                },


            onClose:
                function () {

                    console.log(
                        "Paystack payment window closed."
                    );

                }

        });


    handler.openIframe();

}


// ============================================
// OPTIONAL DEBUG HELPER
// ============================================

function getCapturedRiderLocation() {

    const location =
        document.getElementById(
            "currentLocation"
        )?.value || "";

    const latitude =
        document.getElementById(
            "latitude"
        )?.value || "";

    const longitude =
        document.getElementById(
            "longitude"
        )?.value || "";


    return {

        address:
            location,

        latitude:
            latitude,

        longitude:
            longitude

    };

}