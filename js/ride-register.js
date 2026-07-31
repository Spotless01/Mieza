// ========================================
// MIEZA RIDE DRIVER REGISTRATION
// ========================================

// ------------------------------
// API CONFIGURATION
// ------------------------------

const API_URL = "https://mieza.onrender.com/api";

const PAYSTACK_PUBLIC_KEY =
"pk_live_8d2c51aba42a777a0e497cec1243d30a0e1df4ee";

// ------------------------------
// REGISTRATION SETTINGS
// ------------------------------

let registrationFee = 100;
let paymentRequired = true;
let paymentProvider = "manual";

// ------------------------------
// PAGE INITIALIZATION
// ------------------------------

document.addEventListener("DOMContentLoaded", async () => {

    await loadRegistrationSettings();

initializeTermsModal();

initializeLocationCapture();

initializePaymentMethodSwitcher();

initializeRegisterButton();

});

// ========================================
// LOAD SETTINGS FROM SERVER
// ========================================

async function loadRegistrationSettings(){

    try{

        const response = await fetch(
            `${API_URL}/config/settings`
        );

        const settings = await response.json();

        registrationFee =
            settings.rideDriverRegistrationFee ?? 100;

        paymentRequired =
            settings.rideDriverRegistrationPaymentRequired !== false;

        paymentProvider =
            settings.paymentProvider || "manual";

        // Update intro

        const intro =
            document.querySelector(".intro");

        if(intro){

            intro.innerHTML =
                paymentRequired
                ? `Earn money by driving with Mieza Ride.<br><strong>Registration Fee: ₵${registrationFee}</strong>`
                : `Earn money by driving with Mieza Ride.<br><strong>Registration is currently FREE.</strong>`;

        }

        // Update button

        const button =
            document.getElementById("payAndRegisterBtn");

        if(button){

            button.textContent =
                paymentRequired
                ? `Pay ₵${registrationFee} & Register`
                : "Register Driver";

        }

        // Terms

        const terms =
            document.getElementById("termsText");

        if(terms){

            terms.textContent =
                settings.termsAndConditions ||
                "No Terms & Conditions available.";

        }

    }

    catch(err){

        console.log("Settings load failed:", err);

    }

}

// ========================================
// PAYMENT METHOD SWITCHER
// ========================================

function initializePaymentMethodSwitcher(){

    const payoutMethod =
        document.getElementById("payoutMethod");

    if(!payoutMethod) return;

    payoutMethod.addEventListener("change", toggleRidePayoutFields);

    toggleRidePayoutFields();

}

function toggleRidePayoutFields(){

    const payoutMethod =
        document.getElementById("payoutMethod");

    const momoFields =
        document.getElementById("momoFields");

    const bankFields =
        document.getElementById("bankFields");

    if(!payoutMethod) return;

    if(payoutMethod.value === "momo"){

        momoFields.style.display = "block";
        bankFields.style.display = "none";

        document.getElementById("bankName").value = "";
        document.getElementById("bankCode").value = "";
        document.getElementById("accountName").value = "";
        document.getElementById("accountNumber").value = "";

    }

    else{

        momoFields.style.display = "none";
        bankFields.style.display = "block";

        document.getElementById("momoNumber").value = "";
        document.getElementById("momoName").value = "";
        document.getElementById("momoNetwork").value = "";
        document.getElementById("momoBankCode").value = "";

    }

}

// ========================================
// TERMS & CONDITIONS
// ========================================

function initializeTermsModal(){

    const viewTerms =
        document.getElementById("viewTerms");

    const termsModal =
        document.getElementById("termsModal");

    const closeTerms =
        document.getElementById("closeTerms");

    const acceptTermsBtn =
        document.getElementById("acceptTermsBtn");

    const agreeTerms =
        document.getElementById("agreeTerms");

    if(viewTerms){

        viewTerms.addEventListener("click",(e)=>{

            e.preventDefault();

            termsModal.classList.add("show");

        });

    }

    if(closeTerms){

        closeTerms.addEventListener("click",()=>{

            termsModal.classList.remove("show");

        });

    }

    if(acceptTermsBtn){

        acceptTermsBtn.addEventListener("click",()=>{

            agreeTerms.checked = true;

            termsModal.classList.remove("show");

        });

    }

}

// ========================================
// DRIVER LOCATION CAPTURE
// ========================================

function initializeLocationCapture(){

    const locationBtn =
        document.getElementById("getRideDriverLocation");

    if(!locationBtn) return;

    locationBtn.addEventListener("click", () => {

        if(!navigator.geolocation){

            alert("Geolocation is not supported on this device.");

            return;

        }

        locationBtn.disabled = true;
        locationBtn.textContent = "Waiting for GPS...";

        const watchId = navigator.geolocation.watchPosition(

            async(position)=>{

                const accuracy = position.coords.accuracy;

                console.log("Driver GPS Accuracy:", accuracy);

                if(accuracy > 200){

                    locationBtn.textContent =
                        `Waiting for better GPS (${Math.round(accuracy)}m)...`;

                    return;

                }

                if(accuracy > 50){

                    locationBtn.textContent =
                        `Improving GPS (${Math.round(accuracy)}m)...`;

                    return;

                }

                navigator.geolocation.clearWatch(watchId);

                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;

                document.getElementById("latitude").value = latitude;
                document.getElementById("longitude").value = longitude;

                document.getElementById("currentLocation").value =
                    "Fetching address...";

                try{

                    const response = await fetch(

`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`

                    );

                    const data = await response.json();

                    if(data.display_name){

                        document.getElementById("currentLocation").value =
                            data.display_name;

                    }

                    else{

                        document.getElementById("currentLocation").value =
                            `${latitude}, ${longitude}`;

                    }

                }

                catch(err){

                    console.log(err);

                    document.getElementById("currentLocation").value =
                        `${latitude}, ${longitude}`;

                }

                document.getElementById("locationStatus").textContent =
                    `✅ Current location captured successfully.`;

                locationBtn.textContent =
                    "Location Captured ✓";

            },

            error=>{

                console.log(error);

                alert("Unable to retrieve current location.");

                locationBtn.disabled = false;

                locationBtn.textContent =
                    "📍 Use Exact Current Location";

            },

            {

                enableHighAccuracy:true,
                timeout:30000,
                maximumAge:0

            }

        );

    });

}

// ========================================
// REGISTER BUTTON
// ========================================

function initializeRegisterButton(){

    const button =
        document.getElementById("payAndRegisterBtn");

    if(!button) return;

    button.addEventListener("click", async ()=>{

        // Terms

        if(!document.getElementById("agreeTerms").checked){

            alert("Please accept the Terms & Conditions.");

            return;

        }

        // Required fields

        const fullName =
            document.getElementById("fullName").value.trim();

        const email =
            document.getElementById("email").value.trim();

        const phone =
            document.getElementById("phone").value.trim();

        const password =
            document.getElementById("password").value.trim();

        const vehicleType =
            document.getElementById("vehicleType").value;

        const vehicleBrand =
            document.getElementById("vehicleBrand").value.trim();

        const vehicleModel =
            document.getElementById("vehicleModel").value.trim();

        const vehicleColor =
            document.getElementById("vehicleColor").value.trim();

        const plateNumber =
            document.getElementById("plateNumber").value.trim();

        const driverLicenseNumber =
            document.getElementById("driverLicenseNumber").value.trim();

        const nationalIdNumber =
            document.getElementById("nationalIdNumber").value.trim();

        if(

            !fullName ||
            !email ||
            !phone ||
            !password ||
            !vehicleBrand ||
            !vehicleModel ||
            !vehicleColor ||
            !plateNumber ||
            !driverLicenseNumber ||
            !nationalIdNumber

        ){

            alert("Please complete all required fields.");

            return;

        }

        // GPS

        if(

            !document.getElementById("latitude").value ||
            !document.getElementById("longitude").value

        ){

            alert("Please capture your current location.");

            return;

        }

        // Build registration object

        const registrationData = {

            fullName,
            email,
            phone,
            password,

            vehicleType,
            vehicleBrand,
            vehicleModel,
            vehicleColor,

            plateNumber,
            driverLicenseNumber,
            nationalIdNumber,

            payoutMethod:
                document.getElementById("payoutMethod").value,

            momoNumber:
                document.getElementById("momoNumber").value,

            momoName:
                document.getElementById("momoName").value,

            momoNetwork:
                document.getElementById("momoNetwork").value,

            momoBankCode:
                document.getElementById("momoNetwork")
                    .selectedOptions[0]?.dataset.code || "",

            bankName:
                document.getElementById("bankName").value,

            bankCode:
                document.getElementById("bankCode").value,

            accountName:
                document.getElementById("accountName").value,

            accountNumber:
                document.getElementById("accountNumber").value

        };

        button.disabled = true;

        button.textContent =
        paymentRequired
        ? "Preparing Payment..."
        : "Registering...";

        try{

            if(paymentRequired){

                payWithPaystack(registrationData);

            }

            else{

                await saveRideRegistration(
                    registrationData,
                    null
                );

            }

        }

        catch(err){

            console.log(err);

            alert(
                err.message ||
                "Registration failed."
            );

            button.disabled = false;

            button.textContent =
            paymentRequired
            ? `Pay ₵${registrationFee} & Register`
            : "Register Driver";

        }

    });

}

// ========================================
// PAYSTACK PAYMENT
// ========================================

function payWithPaystack(data){

    const handler = PaystackPop.setup({

        key: PAYSTACK_PUBLIC_KEY,

        email: data.email,

        amount: registrationFee * 100,

        currency: "GHS",

        ref: "MIEZA_RIDE_" + Date.now(),

        metadata: {

            custom_fields: [

                {
                    display_name: "Driver",
                    value: data.fullName
                },

                {
                    display_name: "Phone",
                    value: data.phone
                },

                {
                    display_name: "Vehicle",
                    value: data.vehicleType
                }

            ]

        },

        callback: async function(response){

            await saveRideRegistration(
                data,
                response.reference
            );

        },

        onClose:function(){

    const button =
        document.getElementById("payAndRegisterBtn");

    button.disabled = false;

    button.textContent =
        `Pay ₵${registrationFee} & Register`;

    alert("Payment cancelled.");

}

    });

    handler.openIframe();

}


// ========================================
// IMAGE TO BASE64
// ========================================

function fileToBase64(file){

    return new Promise((resolve,reject)=>{

        if(!file){

            resolve("");

            return;

        }

        const reader = new FileReader();

        reader.onload = ()=>resolve(reader.result);

        reader.onerror = reject;

        reader.readAsDataURL(file);

    });

}

// ========================================
// MULTIPLE FILES TO BASE64
// ========================================

async function filesToBase64(files){

    const results = [];

    for(const file of files){

        results.push(await fileToBase64(file));

    }

    return results;

}

// ========================================
// SAVE RIDE DRIVER REGISTRATION
// ========================================

async function saveRideRegistration(data, paymentReference){

    const button =
        document.getElementById("payAndRegisterBtn");

    try{

        const formData = new FormData();

        // Basic Details
        formData.append("fullName", data.fullName);
        formData.append("email", data.email);
        formData.append("phone", data.phone);
        formData.append("password", data.password);

        // Location
        formData.append(
            "latitude",
            document.getElementById("latitude").value
        );

        formData.append(
            "longitude",
            document.getElementById("longitude").value
        );

        formData.append(
            "address",
            document.getElementById("currentLocation").value
        );

        // Vehicle
        formData.append("vehicleType", data.vehicleType);
        formData.append("vehicleBrand", data.vehicleBrand);
        formData.append("vehicleModel", data.vehicleModel);
        formData.append("vehicleColor", data.vehicleColor);
        formData.append("plateNumber", data.plateNumber);

        // Identification
        formData.append(
            "driverLicenseNumber",
            data.driverLicenseNumber
        );

        formData.append(
            "nationalIdNumber",
            data.nationalIdNumber
        );

        // Payout
        formData.append(
            "payoutMethod",
            data.payoutMethod
        );

        formData.append(
            "momoNumber",
            data.momoNumber || ""
        );

        formData.append(
            "momoName",
            data.momoName || ""
        );

        formData.append(
            "momoNetwork",
            data.momoNetwork || ""
        );

        formData.append(
            "momoBankCode",
            data.momoBankCode || ""
        );

        formData.append(
            "bankName",
            data.bankName || ""
        );

        formData.append(
            "bankCode",
            data.bankCode || ""
        );

        formData.append(
            "accountName",
            data.accountName || ""
        );

        formData.append(
            "accountNumber",
            data.accountNumber || ""
        );

        // Payment Reference
        if(paymentReference){

            formData.append(
                "paystackReference",
                paymentReference
            );

        }

        // Profile Photo
        const profilePhoto =
            document.getElementById("shopThumbnailFile").files[0];

        if(profilePhoto){

            formData.append(
                "profilePhoto",
                profilePhoto
            );

        }

        // Vehicle Photos
        const vehiclePhotos =
            document.getElementById("vehiclePhotos").files;

        for(const photo of vehiclePhotos){

            formData.append(
                "vehiclePhotos",
                photo
            );

        }

        const response =
            await fetch(
    `${API_URL}/ride-drivers/register`,
                {
                    method:"POST",
                    body:formData
                }
            );

        const result =
            await response.json();

        if(!response.ok){

            throw new Error(
                result.message ||
                "Registration failed."
            );

        }

        alert(
            "🎉 Registration submitted successfully!\n\nYour account will become active after approval."
        );

        window.location.href =
            "ride-login.html";

    }

    catch(error){

        console.error(error);

        alert(
            error.message ||
            "Registration failed."
        );

        button.disabled = false;

        button.textContent =
            paymentRequired
            ? `Pay ₵${registrationFee} & Register`
            : "Register Driver";

    }

}