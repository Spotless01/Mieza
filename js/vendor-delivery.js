let trackingInterval = null;

const API_URL =
"https://mieza.onrender.com";

document
.getElementById("startBtn")
.addEventListener(
  "click",
  startTracking
);

document
.getElementById("stopBtn")
.addEventListener(
  "click",
  stopTracking
);

function startTracking() {

  const orderId =
  document
  .getElementById("orderId")
  .value
  .trim();

  if (!orderId) {

    alert(
      "Enter Order ID"
    );

    return;
  }

  updateLocation(orderId);

  trackingInterval =
  setInterval(() => {

    updateLocation(orderId);

  }, 5000);

  document
  .getElementById("status")
  .innerText =
  "Tracking started";

}

function stopTracking() {

  clearInterval(
    trackingInterval
  );

  document
  .getElementById("status")
  .innerText =
  "Tracking stopped";

}

function updateLocation(orderId) {

  navigator.geolocation.getCurrentPosition(

    async position => {

      const token =
      localStorage.getItem(
        "vendorToken"
      );

      try {

        await fetch(

`${API_URL}/api/orders/${orderId}/location`,

{
  method: "PUT",

  headers: {
    "Content-Type":
    "application/json",

    Authorization:
    `Bearer ${token}`
  },

  body: JSON.stringify({

    latitude:
    position.coords.latitude,

    longitude:
    position.coords.longitude

  })
}

);

document
.getElementById("status")
.innerText =

`Updated:
${new Date()
.toLocaleTimeString()}`;

      } catch (err) {

        console.log(err);

      }

    }

  );

}