const API_URL =
  "https://mieza.onrender.com/api";

let map;
let riderMarker;
let shopMarker;
let customerMarker;
let trackingInterval;
let currentOrderId = null;

// ======================================
// LOAD MAPBOX TOKEN
// ======================================

async function loadMapboxToken() {

  try {

    const res =
      await fetch(
        `${API_URL}/config/mapbox`
      );

    const data =
      await res.json();

    if (!res.ok || !data.token) {
      throw new Error(
        data.message ||
        "Map token unavailable"
      );
    }

    mapboxgl.accessToken =
      data.token;

    return true;

  } catch (err) {

    console.log(
      "Mapbox token error:",
      err
    );

    return false;

  }

}

// ======================================
// TRACK ORDER
// ======================================

async function trackOrder() {

  const btn =
    document.getElementById(
      "trackBtn"
    );

  const orderIdInput =
    document.getElementById(
      "orderId"
    );

  const orderId =
    orderIdInput.value.trim();

  if (!orderId) {

    alert(
      "Please enter your Order ID."
    );

    orderIdInput.focus();

    return;

  }

  if (btn.disabled) return;

  btn.disabled = true;

  btn.textContent =
    "Tracking Your Order...";

  try {

    const res =
      await fetch(
        `${API_URL}/tracking/${orderId}`
      );

    const data =
      await res.json();

    if (!res.ok) {

      alert(
        data.message ||
        "Order not found"
      );

      return;

    }

    currentOrderId =
      orderId;

    renderTrackingResult(
      data,
      orderId
    );

    btn.textContent =
      "Track Another Order";

    const mapTokenLoaded =
      await loadMapboxToken();

    if (
      mapTokenLoaded &&
      data.status !== "delivered" &&
      data.status !== "cancelled"
    ) {

      startLiveTracking(
        orderId
      );

    }

  } catch (err) {

    console.log(
      "Order tracking error:",
      err
    );

    alert(
      "Unable to fetch your order. Please try again."
    );

  } finally {

    btn.disabled = false;

    if (
      btn.textContent ===
      "Tracking Your Order..."
    ) {

      btn.textContent =
        "Track Order";

    }

  }

}

// ======================================
// RENDER TRACKING RESULT
// ======================================

function renderTrackingResult(
  data,
  orderId
) {

  const container =
    document.getElementById(
      "trackingResult"
    );

  const notifications =
    Array.isArray(
      data.notifications
    )
      ? data.notifications
      : [];

  const readableStatus =
    String(
      data.status || "pending"
    )
      .replaceAll("_", " ")
      .toUpperCase();

  container.innerHTML = `

    <div class="tracking-card">

      <h2>
        Status:
        ${escapeHtml(readableStatus)}
      </h2>

      <h3>
        Notifications
      </h3>

      <div>

        ${
          notifications.length
            ? notifications
                .map(notification => `

                  <div class="tracking-item">

                    <p>
                      ${escapeHtml(
                        notification.message
                      )}
                    </p>

                    <small>
                      ${
                        notification.createdAt
                          ? new Date(
                              notification.createdAt
                            ).toLocaleString()
                          : ""
                      }
                    </small>

                  </div>

                `)
                .join("")
            : `
                <div class="tracking-item">
                  <p>
                    No order updates available yet.
                  </p>
                </div>
              `
        }

      </div>

      ${
        data.status === "delivered"
          ? `
              <div class="tracking-review-box">

                <h3>
                  How was your experience?
                </h3>

                <p>
                  Rate the vendor and rider to help Mieza improve.
                </p>

                <a
                  href="review.html?orderId=${encodeURIComponent(orderId)}"
                  class="review-order-btn"
                >
                  Rate Your Order
                </a>

              </div>
            `
          : ""
      }

      ${
        data.status === "cancelled"
          ? `
              <div class="tracking-cancelled-box">
                <strong>
                  This order has been cancelled.
                </strong>
              </div>
            `
          : ""
      }

    </div>

  `;

}

// ======================================
// LIVE TRACKING
// ======================================

function startLiveTracking(
  orderId
) {

  clearInterval(
    trackingInterval
  );

  updateLiveTracking(
    orderId
  );

  trackingInterval =
    setInterval(
      () => {

        updateLiveTracking(
          orderId
        );

      },
      5000
    );

}

// ======================================
// FETCH LIVE LOCATION + STATUS
// ======================================

async function updateLiveTracking(
  orderId
) {

  try {

    const res =
      await fetch(
        `${API_URL}/orders/tracking/live/${orderId}`
      );

    const data =
      await res.json();

    if (!res.ok) {

      console.log(
        data.message ||
        "Live tracking unavailable"
      );

      return;

    }

    if (
      data.status === "delivered" ||
      data.status === "cancelled"
    ) {

      clearInterval(
        trackingInterval
      );

      await refreshTrackingDetails(
        orderId
      );

      return;

    }

    const riderLat =
      Number(
        data.riderLatitude
      );

    const riderLng =
      Number(
        data.riderLongitude
      );

    if (
      !Number.isFinite(riderLat) ||
      !Number.isFinite(riderLng)
    ) {

      return;

    }

    updateMap(
      data,
      riderLat,
      riderLng
    );

  } catch (err) {

    console.log(
      "Live tracking error:",
      err
    );

  }

}

// ======================================
// REFRESH STATUS AFTER DELIVERY
// ======================================

async function refreshTrackingDetails(
  orderId
) {

  try {

    const res =
      await fetch(
        `${API_URL}/tracking/${orderId}`
      );

    const data =
      await res.json();

    if (!res.ok) return;

    renderTrackingResult(
      data,
      orderId
    );

  } catch (err) {

    console.log(
      "Tracking refresh failed:",
      err
    );

  }

}

// ======================================
// CREATE OR UPDATE MAP
// ======================================

function updateMap(
  data,
  riderLat,
  riderLng
) {

  const mapContainer =
    document.getElementById(
      "map"
    );

  if (!mapContainer) return;

  if (!map) {

    map =
      new mapboxgl.Map({

        container:
          "map",

        style:
          "mapbox://styles/mapbox/streets-v12",

        center: [
          riderLng,
          riderLat
        ],

        zoom:
          14

      });

    const shopLat =
      Number(
        data.shopLatitude
      );

    const shopLng =
      Number(
        data.shopLongitude
      );

    if (
      Number.isFinite(shopLat) &&
      Number.isFinite(shopLng)
    ) {

      shopMarker =
        new mapboxgl.Marker({
          color: "green"
        })
          .setLngLat([
            shopLng,
            shopLat
          ])
          .addTo(map);

    }

    const customerLat =
      Number(
        data.customerLatitude
      );

    const customerLng =
      Number(
        data.customerLongitude
      );

    if (
      Number.isFinite(
        customerLat
      ) &&
      Number.isFinite(
        customerLng
      )
    ) {

      customerMarker =
        new mapboxgl.Marker({
          color: "blue"
        })
          .setLngLat([
            customerLng,
            customerLat
          ])
          .addTo(map);

    }

    riderMarker =
      new mapboxgl.Marker({
        color: "red"
      })
        .setLngLat([
          riderLng,
          riderLat
        ])
        .addTo(map);

  } else {

    if (riderMarker) {

      riderMarker.setLngLat([
        riderLng,
        riderLat
      ]);

    }

    map.flyTo({

      center: [
        riderLng,
        riderLat
      ],

      zoom:
        15,

      speed:
        0.8

    });

  }

}

// ======================================
// HTML SAFETY
// ======================================

function escapeHtml(
  value
) {

  return String(
    value ?? ""
  )
    .replaceAll(
      "&",
      "&amp;"
    )
    .replaceAll(
      "<",
      "&lt;"
    )
    .replaceAll(
      ">",
      "&gt;"
    )
    .replaceAll(
      '"',
      "&quot;"
    )
    .replaceAll(
      "'",
      "&#039;"
    );

}