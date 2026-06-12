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

          map = L.map("map").setView(
            [riderLat, riderLng],
            14
          );

          L.tileLayer(

"https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",

{
  attribution:
  "&copy; OpenStreetMap"
}

          ).addTo(map);

          shopMarker =
          L.marker([
            data.shopLatitude,
            data.shopLongitude
          ])
          .addTo(map)
          .bindPopup(
            "Vendor Location"
          );

          customerMarker =
          L.marker([
            data.customerLatitude,
            data.customerLongitude
          ])
          .addTo(map)
          .bindPopup(
            "Customer Location"
          );

          riderMarker =
          L.marker([
            riderLat,
            riderLng
          ])
          .addTo(map)
          .bindPopup(
            "Delivery Rider"
          );

        } else {

          riderMarker.setLatLng([
            riderLat,
            riderLng
          ]);

        }

      } catch (err) {

        console.log(err);

      }

    },

    5000

  );

}