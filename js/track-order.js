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

  } catch (err) {

    console.log(err);

    alert(
      "Unable to fetch order"
    );

  }

}