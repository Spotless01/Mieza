const token =
localStorage.getItem("rideDriverToken");

if(!token){

window.location.href="ride-login.html";

}

const driver =
JSON.parse(
localStorage.getItem("rideDriver")
);

document.getElementById(
"driverName"
).innerHTML =
`Welcome back, ${driver.fullName} 👋`;

document.getElementById(
"driverRating"
).innerHTML =
`⭐ ${driver.averageRating}`;

document.getElementById(
"walletBalance"
).innerHTML =
`₵${Number(driver.walletBalance).toFixed(2)}`;

document.getElementById(
"todayEarnings"
).innerHTML =
"₵0.00";

document.getElementById(
"todayTrips"
).innerHTML =
driver.totalTrips || 0;

const statusText =
document.getElementById("statusText");

const statusDot =
document.getElementById("statusDot");

const statusLabel =
document.getElementById("driverStatus");

const toggleBtn =
document.getElementById(
"toggleAvailability"
);

updateStatusUI();

function updateStatusUI(){

const currentDriver =
JSON.parse(
localStorage.getItem("rideDriver")
);

if(currentDriver.isAvailable){

statusLabel.innerHTML="ONLINE";

statusText.innerHTML=
"You are available for ride requests.";

statusDot.classList.remove(
"offline"
);

statusDot.classList.add(
"online"
);

toggleBtn.innerHTML=
"Go Offline";

}else{

statusLabel.innerHTML="OFFLINE";

statusText.innerHTML=
"You are currently unavailable for ride requests.";

statusDot.classList.remove(
"online"
);

statusDot.classList.add(
"offline"
);

toggleBtn.innerHTML=
"Go Online";

}

}

toggleBtn.onclick =
async ()=>{

const res =
await fetch(

"https://mieza.onrender.com/api/ride-drivers/availability",

{

method:"PUT",

headers:{

Authorization:
`Bearer ${token}`

}

}

);

const data =
await res.json();

if(!res.ok){

alert(
data.message
);

return;

}

driver.isAvailable =
data.isAvailable;

localStorage.setItem(

"rideDriver",

JSON.stringify(driver)

);

updateStatusUI();

};

document.getElementById(
"logoutBtn"
).onclick=()=>{

localStorage.removeItem(
"rideDriverToken"
);

localStorage.removeItem(
"rideDriver"
);

window.location.href=
"ride-login.html";

};