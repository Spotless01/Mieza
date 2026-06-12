window.addEventListener(
  "DOMContentLoaded",
  () => {

    const params =
      new URLSearchParams(
        window.location.search
      );

    const orderId =
      params.get("orderId");

    if (orderId) {

      document.getElementById(
        "orderId"
      ).value = orderId;

    }

  }
);

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

async function startTracking() {

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

 const token =
    localStorage.getItem("shopToken");

  try {

    await fetch(
      `${API_URL}/api/orders/${orderId}`,
      {

        method: "PUT",

        headers: {

          "Content-Type":
            "application/json",

          Authorization:
            `Bearer ${token}`

        },

        body: JSON.stringify({

          status: "out_for_delivery"

        })

      }
    );

  } catch (err) {

    console.log(err);

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

      try {

        const latitude =
          position.coords.latitude;

        const longitude =
          position.coords.longitude;

        const token =
localStorage.getItem("shopToken");

        if (!token) {

          alert(
            "Vendor login expired"
          );

          return;
        }

        console.log("Token:", token);

console.log("Latitude:", latitude);
console.log("Longitude:", longitude);

        const res = await fetch(

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

              latitude,
              longitude

            })

          }

        );

        console.log("Response Status:", res.status);

        if (!res.ok) {

  const error =
    await res.json();

  console.log(
    "Server Error:",
    error
  );

  document
    .getElementById("status")
    .innerText =

    `Error:
${error.message}`;

  return;
}

        document
          .getElementById("status")
          .innerText =

          `Updated:
${new Date()
  .toLocaleTimeString()}`;

      }

      catch (err) {

        console.log(err);

      }

    },

    err => {

      console.log(err);

      alert(
        "Unable to get location"
      );

    }

  );

}