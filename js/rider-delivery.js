let map;
let riderMarker;
let vendorMarker;
let customerMarker;
let watchId = null;

let vendorCoords = null;
let customerCoords = null;

const API_URL =
  "https://mieza.onrender.com";

  const rider =
  JSON.parse(
    localStorage.getItem("rider")
  );

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

document
  .getElementById("navigateVendorBtn")
  .addEventListener(
    "click",
    () => {
      if (!vendorCoords) return;

      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${vendorCoords.lat},${vendorCoords.lng}`,
        "_blank"
      );
    }
  );

document
  .getElementById("navigateCustomerBtn")
  .addEventListener(
    "click",
    () => {
      if (!customerCoords) return;

      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${customerCoords.lat},${customerCoords.lng}`,
        "_blank"
      );
    }
  );

async function loadMapboxToken() {

  const res =
    await fetch(
      `${API_URL}/api/config/mapbox`
    );

  const data =
    await res.json();

  mapboxgl.accessToken =
    data.token;

}

async function startTracking() {

  const orderId =
    document
      .getElementById("orderId")
      .value
      .trim();

  if (!orderId) {
    alert("Enter Order ID");
    return;
  }

  const token =
    localStorage.getItem("riderToken");

  if (!token) {
    alert("Rider login expired");
    return;
  }

  await loadMapboxToken();

  await fetch(
    `${API_URL}/api/rider-orders/start/${orderId}`,
    {
      method: "PUT"
    }
  );

  await loadOrderLocations(orderId);

  watchId =
    navigator.geolocation.watchPosition(

      async position => {

        const latitude =
          position.coords.latitude;

        const longitude =
          position.coords.longitude;

        await updateRiderLocation(
          orderId,
          latitude,
          longitude
        );

        updateMapRider(
          latitude,
          longitude
        );

        document
          .getElementById("status")
          .innerText =
          `Live tracking:
${new Date().toLocaleTimeString()}`;

      },

      error => {

        console.log(error);

        alert(
          "Unable to get rider location"
        );

      },

      {
        enableHighAccuracy: true,
        timeout: 30000,
        maximumAge: 0
      }

    );

}

function stopTracking() {

  if (watchId !== null) {

    navigator.geolocation.clearWatch(
      watchId
    );

    watchId = null;

  }

  document
    .getElementById("status")
    .innerText =
    "Tracking stopped";

}

async function loadOrderLocations(orderId) {

  const res =
    await fetch(
      `${API_URL}/api/orders/tracking/live/${orderId}`
    );

  const data =
    await res.json();

  vendorCoords = {
    lat: data.shopLatitude,
    lng: data.shopLongitude
  };

  customerCoords = {
    lat: data.customerLatitude,
    lng: data.customerLongitude
  };

  initMap(
    vendorCoords,
    customerCoords
  );

}

function initMap(
  vendor,
  customer
) {

  if (map) return;

  map =
    new mapboxgl.Map({
      container: "riderMap",
      style: "mapbox://styles/mapbox/streets-v12",
      center: [
        vendor.lng,
        vendor.lat
      ],
      zoom: 14
    });

  const vendorEl =
  document.createElement("div");

vendorEl.innerHTML = "🏪";

vendorEl.style.fontSize = "32px";

vendorMarker =
  new mapboxgl.Marker(vendorEl)
      .setLngLat([
        vendor.lng,
        vendor.lat
      ])
      .setPopup(
        new mapboxgl.Popup()
          .setText("Vendor / Pickup")
      )
      .addTo(map);

  const customerEl =
  document.createElement("div");

customerEl.innerHTML = "🧍‍♀️";

customerEl.style.fontSize = "32px";

customerMarker =
  new mapboxgl.Marker(customerEl)
      .setLngLat([
        customer.lng,
        customer.lat
      ])
      .setPopup(
        new mapboxgl.Popup()
          .setText("Customer / Delivery")
      )
      .addTo(map);

  const bounds =
    new mapboxgl.LngLatBounds();

  bounds.extend([
    vendor.lng,
    vendor.lat
  ]);

  bounds.extend([
    customer.lng,
    customer.lat
  ]);

  map.fitBounds(
    bounds,
    {
      padding: 80
    }
  );

}

function updateMapRider(
  latitude,
  longitude
) {

  if (!map) return;

  if (!riderMarker) {

    const riderEl =
  document.createElement("div");

riderEl.innerHTML =
`
<div style="text-align:center">
  <div style="font-size:32px">
    ${rider?.vehicleType === "car" ? "🚗" : "🏍️"}
  </div>
  <small>Rider</small>
</div>
`;

riderMarker =
  new mapboxgl.Marker(riderEl)
        .setLngLat([
          longitude,
          latitude
        ])
        .setPopup(
          new mapboxgl.Popup()
            .setText("You / Rider")
        )
        .addTo(map);

  } else {

    riderMarker.setLngLat([
      longitude,
      latitude
    ]);

  }

  map.flyTo({
    center: [
      longitude,
      latitude
    ],
    zoom: 15,
    speed: 0.8
  });

}

async function updateRiderLocation(
  orderId,
  latitude,
  longitude
) {

  const token =
    localStorage.getItem("riderToken");

  const res =
    await fetch(
      `${API_URL}/api/rider-orders/location/${orderId}`,
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

  console.log(
    "Location update:",
    res.status
  );

}