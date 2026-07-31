// ======================================
// MIEZA RIDE DRIVER DASHBOARD
// ======================================

const driverToken =
localStorage.getItem("rideDriverToken");

const driver =
JSON.parse(
localStorage.getItem("rideDriver") || "null"
);

// ===============================
// REQUIRE LOGIN
// ===============================

if(!driverToken || !driver){

    window.location.replace(
        "ride-driver-login.html"
    );

}

// ===============================
// DISPLAY DRIVER NAME
// ===============================

document.addEventListener(
"DOMContentLoaded",
()=>{

    const heading =
    document.querySelector("h2");

    if(heading){

        heading.textContent =
        `Welcome, ${driver.fullName}`;

    }

});

const toggleBtn =
document.getElementById(
"toggleAvailability"
);

toggleBtn.addEventListener(
"click",
toggleAvailability
);

async function toggleAvailability(){

try{

const res =
await fetch(

"https://mieza.onrender.com/api/ride-drivers/availability",

{

method:"PUT",

headers:{

Authorization:
`Bearer ${driverToken}`

}

}

);

const data =
await res.json();

if(!res.ok){

alert(data.message);

return;

}

driver.isOnline =
data.isOnline;

driver.isAvailable =
data.isAvailable;

localStorage.setItem(

"rideDriver",

JSON.stringify(driver)

);

updateAvailabilityUI();

}

catch(err){

console.log(err);

}

}


function updateAvailabilityUI(){

const status =
document.getElementById(
"driverStatus"
);

const btn =
document.getElementById(
"toggleAvailability"
);

if(driver.isOnline){

status.textContent =
"🟢 Online";

btn.textContent =
"Go Offline";

}

else{

status.textContent =
"🔴 Offline";

btn.textContent =
"Go Online";

}

}

updateAvailabilityUI();

// ===============================
// LOGOUT
// ===============================

document
.getElementById("logoutBtn")
.addEventListener("click",()=>{

    localStorage.removeItem(
    "rideDriverToken"
    );

    localStorage.removeItem(
    "rideDriver"
    );

    window.location.replace(
    "ride-login.html"
    );

});