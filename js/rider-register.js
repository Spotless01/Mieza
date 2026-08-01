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

    initializeRegisterButton();

});

// ============================================
// LOAD SETTINGS
// ============================================

async function loadRegistrationSettings(){

    try{

        const response =
        await fetch(
            `${API_URL}/config/settings`
        );

        const settings =
        await response.json();

        registrationFee =
    settings.riderRegistrationFee ?? 100;

paymentRequired =
    settings.riderRegistrationPaymentRequired;

        paymentProvider =
            settings.paymentProvider || "manual";

        //----------------------------------
        // Update intro
        //----------------------------------

        const intro =
        document.querySelector(".intro");

        if(intro){

            if(paymentRequired){

                intro.innerHTML = `
Become a Mieza Delivery Rider.<br>
Registration Fee:
<strong>₵${registrationFee}</strong>
`;

            }

            else{

                intro.innerHTML = `
Become a Mieza Delivery Rider.<br>
<strong>Registration is FREE</strong>
`;

            }

        }

        //----------------------------------
        // Update Button
        //----------------------------------

        const btn =
        document.getElementById(
            "payAndRegisterBtn"
        );

        if (paymentRequired) {

    btn.textContent =
        `Pay ₵${registrationFee} & Register`;

} else {

    btn.textContent =
        "Register Free";

}

        //----------------------------------
        // Terms
        //----------------------------------

        const termsElement =
document.getElementById("termsText");

if (termsElement) {

    termsElement.textContent =
        settings.termsAndConditions ||
        "No Terms & Conditions available.";

}
    }

    catch(err){

        console.log(err);

    }

}

// ============================================
// TERMS MODAL
// ============================================

function initializeTermsModal(){

    const modal =
    document.getElementById("termsModal");

    document
    .getElementById("viewTerms")
    ?.addEventListener("click",(e)=>{

        e.preventDefault();

        modal.classList.add("show");

    });

    document
    .getElementById("closeTerms")
    ?.addEventListener("click",()=>{

        modal.classList.remove("show");

    });

    document
    .getElementById("acceptTermsBtn")
    ?.addEventListener("click",()=>{

        document.getElementById(
            "agreeTerms"
        ).checked = true;

        modal.classList.remove("show");

    });

} 

// ============================================
// PAYOUT SWITCHER
// ============================================

function initializePayoutSwitcher(){

    const payout =
    document.getElementById(
        "payoutMethod"
    );

    payout.addEventListener(
        "change",
        toggleRidePayoutFields
    );

    toggleRidePayoutFields();

}

function toggleRidePayoutFields(){

    const payoutMethod =
    document.getElementById("payoutMethod").value;

    document.getElementById("momoFields").style.display =
    payoutMethod==="momo"
    ? "block"
    : "none";

    document.getElementById("bankFields").style.display =
    payoutMethod==="bank"
    ? "block"
    : "none";

}

// ============================================
// LOCATION CAPTURE
// ============================================

function initializeLocationCapture(){

    const button =
document.getElementById(
    "getRideDriverLocation"
);

if(!button) return;

button.addEventListener("click",()=>{

        if(!navigator.geolocation){

            alert(
                "GPS is not supported."
            );

            return;

        }

        button.disabled = true;

        button.textContent =
        "Waiting for GPS...";

        navigator.geolocation.getCurrentPosition(

            async(position)=>{

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

                try{

                    const response =
                    await fetch(

`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`

                    );

                    const data =
                    await response.json();

                    document.getElementById(
                        "currentLocation"
                    ).value =
                    data.display_name;

                }

                catch{

                    document.getElementById(
                        "currentLocation"
                    ).value =
                    `${lat}, ${lng}`;

                }

                document.getElementById(
                    "locationStatus"
                ).textContent =
                "✅ Current location captured";

                button.textContent =
                "Location Captured ✓";

            },

            ()=>{

                alert(
                    "Unable to get your location."
                );

                button.disabled=false;

                button.textContent =
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

// ============================================
// REGISTER BUTTON
// ============================================

function initializeRegisterButton(){

const button =
document.getElementById("payAndRegisterBtn");

button.addEventListener("click", async ()=>{

if(!document.getElementById("agreeTerms").checked){

alert("Please accept the Terms & Conditions.");

return;

}

if(paymentRequired){

payAndRegisterRider();

}else{

registerRider("FREE_RIDER_" + Date.now());

}

});

}

async function registerRider(paymentReference){

const button =
document.getElementById("payAndRegisterBtn");

button.disabled = true;

button.textContent = "Registering...";

try{

const response = await fetch(

`${API_URL}/riders/register`,

{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({

fullName:
document.getElementById("fullName").value,

phone:
document.getElementById("phone").value,

email:
document.getElementById("email").value,

password:
document.getElementById("password").value,

vehicleType:
document.getElementById("vehicleType").value,

payoutMethod:
document.getElementById("payoutMethod").value,

momoNumber:
document.getElementById("momoNumber").value,

momoName:
document.getElementById("momoName").value,

momoNetwork:
document.getElementById("momoNetwork").value,

momoBankCode:
document.getElementById("momoBankCode").value,

bankName:
document.getElementById("bankName").value,

bankCode:
document.getElementById("bankCode").value,

accountName:
document.getElementById("accountName").value,

accountNumber:
document.getElementById("accountNumber").value,

paymentReference

})

}

);

const data =
await response.json();

alert(data.message);

if(response.ok){

window.location.href =
"rider-login.html";

}else{

button.disabled = false;

button.textContent =
paymentRequired
? `Pay ₵${registrationFee} & Register`
: "Register Free";

}

}catch(err){

console.log(err);

alert("Registration failed.");

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

function payAndRegisterRider(){

if(!paymentRequired){

registerRider("FREE_RIDER_" + Date.now());

return;

}

const email =
document.getElementById("email").value;

const fullName =
document.getElementById("fullName").value;

if(!email || !fullName){

alert("Please complete the registration form.");

return;

}

const handler = PaystackPop.setup({

key: PAYSTACK_PUBLIC_KEY,

email,

amount: registrationFee * 100,

currency:"GHS",

metadata:{

custom_fields:[

{

display_name:"Full Name",

variable_name:"full_name",

value:fullName

}

]

},

callback:function(response){

registerRider(response.reference);

},

onClose:function(){

alert("Payment cancelled.");

}

});

handler.openIframe();

}