const API_URL =
"https://mieza.onrender.com/api";

document
.getElementById("loginBtn")
.addEventListener("click", loginDriver);

async function loginDriver(){

const email =
document
.getElementById("email")
.value.trim()
.toLowerCase();

const password =
document
.getElementById("password")
.value;

if(!email || !password){

alert("Please enter email and password.");

return;

}

try{

const res =
await fetch(

`${API_URL}/ride-drivers/login`,

{

method:"POST",

headers:{

"Content-Type":
"application/json"

},

body:JSON.stringify({

email,
password

})

}

);

const data =
await res.json();

if(!res.ok){

alert(
data.message ||
"Login failed."
);

return;

}

localStorage.setItem(
"rideDriverToken",
data.token
);

localStorage.setItem(
"rideDriver",
JSON.stringify(data.driver)
);

window.location.replace(
"ride-driver-dashboard.html"
);

}

catch(err){

console.log(err);

alert(
"Unable to login."
);

}

}