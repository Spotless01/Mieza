// ========================================
// MIEZA RIDE DRIVER REGISTRATION
// ========================================

// ---------- Configuration ----------

const API_URL =
"https://mieza.onrender.com/api";

const PAYSTACK_PUBLIC_KEY =
"pk_live_8d2c51aba42a777a0e497cec1243d30a0e1df4ee";

// ---------- Registration Settings ----------

let registrationFee = 100;

let paymentRequired = true;

let paymentProvider = "manual";

// ========================================
// INITIALIZE PAGE
// ========================================

document.addEventListener("DOMContentLoaded", async ()=>{

    await loadRegistrationSettings();

    initializeTermsModal();

    initializeLocationCapture();

    toggleRidePayoutFields();

    document
        .getElementById("payoutMethod")
        ?.addEventListener(
            "change",
            toggleRidePayoutFields
        );

});

// ========================================
// LOAD REGISTRATION SETTINGS
// ========================================

async function loadRegistrationSettings(){

    try{

        const res =
        await fetch(
        `${API_URL}/config/settings`
        );

        const settings =
        await res.json();

        registrationFee =
        settings.rideDriverRegistrationFee ?? 100;

        paymentRequired =
        settings.rideDriverRegistrationPaymentRequired !== false;

        paymentProvider =
        settings.paymentProvider || "manual";

        // Update intro text

        const intro =
        document.querySelector(".intro");

        if(intro){

            intro.innerHTML =
            paymentRequired
            ? `Earn money by driving with Mieza Ride.<br><strong>Registration Fee: ₵${registrationFee}</strong>`
            : `Earn money by driving with Mieza Ride.<br><strong>Registration is currently FREE.</strong>`;

        }

        // Update button

        const btn =
        document.getElementById(
        "payAndRegisterBtn"
        );

        if(btn){

            btn.textContent =
            paymentRequired
            ? `Pay ₵${registrationFee} & Register`
            : "Register Driver";

        }

        // Load Terms

        const terms =
        document.getElementById(
        "termsText"
        );

        if(terms){

            terms.textContent =
            settings.termsAndConditions ||
            "No terms available.";

        }

    }

    catch(err){

        console.log(err);

    }

}

// ========================================
// DRIVER LOCATION CAPTURE
// ========================================

function initializeLocationCapture(){

    const locationBtn =
    document.getElementById(
    "getRideDriverLocation"
    );

    if(!locationBtn) return;

    locationBtn.addEventListener("click", async ()=>{

        if(!navigator.geolocation){

            alert(
            "Geolocation is not supported by your device."
            );

            return;

        }

        locationBtn.disabled = true;

        locationBtn.textContent =
        "Waiting for GPS...";

        const watchId =
        navigator.geolocation.watchPosition(

            async(position)=>{

                const accuracy =
                position.coords.accuracy;

                console.log(
                "Driver GPS Accuracy:",
                accuracy
                );

                // Wait until GPS becomes accurate

                if(accuracy > 50){

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
                "currentLocation"
                ).value =
                "Finding address...";

                try{

                    const response =
                    await fetch(

                    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`

                    );

                    const data =
                    await response.json();

                    if(data.display_name){

                        document.getElementById(
                        "currentLocation"
                        ).value =
                        data.display_name;

                    }

                    else{

                        document.getElementById(
                        "currentLocation"
                        ).value =
                        `${latitude}, ${longitude}`;

                    }

                }

                catch(err){

                    document.getElementById(
                    "currentLocation"
                    ).value =
                    `${latitude}, ${longitude}`;

                }

                document.getElementById(
                "locationStatus"
                ).textContent =
                "✅ Current location captured successfully.";

                locationBtn.textContent =
                "Location Captured ✓";

            },

            ()=>{

                alert(
                "Unable to retrieve your current location."
                );

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
// TOGGLE DRIVER PAYOUT FIELDS
// ========================================

function toggleRidePayoutFields(){

    const payoutMethod =
    document.getElementById("payoutMethod");

    const momoFields =
    document.getElementById("momoFields");

    const bankFields =
    document.getElementById("bankFields");

    if(!payoutMethod) return;

    if(payoutMethod.value==="momo"){

        momoFields.style.display="block";
        bankFields.style.display="none";

        document.getElementById("bankName").value="";
        document.getElementById("bankCode").value="";
        document.getElementById("accountName").value="";
        document.getElementById("accountNumber").value="";

    }

    else{

        momoFields.style.display="none";
        bankFields.style.display="block";

        document.getElementById("momoNumber").value="";
        document.getElementById("momoName").value="";
        document.getElementById("momoNetwork").value="";
        document.getElementById("momoBankCode").value="";

    }

}

// ========================================
// TERMS & CONDITIONS MODAL
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

    if(viewTerms && termsModal){

        viewTerms.addEventListener("click",(e)=>{

            e.preventDefault();

            termsModal.classList.add("show");

        });

    }

    if(closeTerms && termsModal){

        closeTerms.addEventListener("click",()=>{

            termsModal.classList.remove("show");

        });

    }

    if(acceptTermsBtn && agreeTerms){

        acceptTermsBtn.addEventListener("click",()=>{

            agreeTerms.checked = true;

            termsModal.classList.remove("show");

        });

    }

}