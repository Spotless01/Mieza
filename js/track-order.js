mapboxgl.accessToken =
MAPBOX_TOKEN;

let map;

let riderMarker;

let shopMarker;

let customerMarker;

let trackingInterval;

async function trackOrder() {

  const orderId =
    document.getElementById(
      "orderId"
    ).value.trim();

  if (!orderId) {

    alert("Enter Order ID");

    return;
  }

  try {

    const res = await fetch(
      `https://mieza.onrender.com/api/tracking/${orderId}`
    );

    const data =
      await res.json();

    if (!res.ok) {

      alert(data.message);

      return;
    }

    const container =
      document.getElementById(
        "trackingResult"
      );

    container.innerHTML = `

      <div class="tracking-card">

        <h2>
          Status:
          ${data.status.toUpperCase()}
        </h2>

        <h3>
          Notifications
        </h3>

        <div>

          ${data.notifications.map(n => `

            <div class="tracking-item">

              <p>${n.message}</p>

              <small>
                ${new Date(
                  n.createdAt
                ).toLocaleString()}
              </small>

            </div>

          `).join("")}

        </div>

      </div>

    `;

    startLiveTracking(orderId);

  } catch (err) {

    console.log(err);

    alert(
      "Unable to fetch order"
    );

  }

}

async function startLiveTracking(orderId) {

  clearInterval(trackingInterval);

  trackingInterval = setInterval(

    async () => {

      try {

        const res = await fetch(

`https://mieza.onrender.com/api/orders/tracking/live/${orderId}`

        );

        const data =
        await res.json();

        if (
  data.status === "delivered" ||
  data.status === "cancelled"
) {

  clearInterval(
    trackingInterval
  );

}

        if (!res.ok) {
          return;
        }

        const riderLat =
        data.riderLatitude;

        const riderLng =
        data.riderLongitude;

        if (
          riderLat == null ||
          riderLng == null
        ) {
          return;
        }

        if (!map) {

  map = new mapboxgl.Map({

    container: "map",

    style: "mapbox://styles/mapbox/streets-v12",

    center: [riderLng, riderLat],

    zoom: 14

  });

  shopMarker = new mapboxgl.Marker({
    color: "green"
  })
  .setLngLat([
    data.shopLongitude,
    data.shopLatitude
  ])
  .addTo(map);

  customerMarker = new mapboxgl.Marker({
    color: "blue"
  })
  .setLngLat([
    data.customerLongitude,
    data.customerLatitude
  ])
  .addTo(map);

  riderMarker = new mapboxgl.Marker({
    color: "red"
  })
  .setLngLat([
    riderLng,
    riderLat
  ])
  .addTo(map);

} else {

          riderMarker.setLngLat([
  riderLng,
  riderLat
]);

map.flyTo({

  center: [
    riderLng,
    riderLat
  ],

  zoom: 15,

  speed: 0.8

});

        }

      } catch (err) {

        console.log(err);

      }

    },

    5000

  );

}