const token =
  localStorage.getItem("shopToken");

const shop =
  JSON.parse(
    localStorage.getItem("shop")
  );

// NOT LOGGED IN
if (!token || !shop) {

  location.href =
    "shop-login.html";
}

// DISPLAY SHOP NAME
document.getElementById(
  "shopName"
).textContent = shop.shopName;

// ==========================
// LOAD NOTIFICATIONS
// ==========================

async function loadNotifications() {

  try {

    const res = await fetch(
      "https://mieza.onrender.com/api/notifications/shop",
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    const notifications =
      await res.json();

    const dropdown =
      document.getElementById(
        "notificationDropdown"
      );

    const badge =
      document.getElementById(
        "notificationCount"
      );

    dropdown.innerHTML = "";

    badge.textContent =
      notifications.length;

    if (!notifications.length) {

      dropdown.innerHTML =
        "<p>No notifications</p>";

      return;
    }

    notifications.forEach(n => {

      dropdown.innerHTML += `

<div
  class="notification-item"
  onclick="openNotification(
  '${n._id}',
  '${n.orderId || ""}'
)"
>

  <strong>
    ${n.title}
  </strong>

  <p>
    ${n.message}
  </p>

  <small>
    ${new Date(
      n.createdAt
    ).toLocaleString()}
  </small>

</div>

`;
    });

  } catch (err) {

    console.log(err);

  }

}

// ==========================
// TOGGLE NOTIFICATIONS
// ==========================

function toggleNotifications() {

  const dropdown =
    document.getElementById(
      "notificationDropdown"
    );

  if (
    dropdown.style.display ===
    "block"
  ) {

    dropdown.style.display =
      "none";

  } else {

    dropdown.style.display =
      "block";

  }

}

// ==========================
// ADD PRODUCT
// ==========================
async function addProduct() {
  const name = document.getElementById("productName").value;
  const price = document.getElementById("productPrice").value;
  const description = document.getElementById("productDescription").value;
 const image =
  document.getElementById("productImage").files[0];

  if (!name || !price) {
  alert("Fill all fields");
  return;
}

const formData = new FormData();

formData.append("name", name);
formData.append("price", price);
formData.append("description", description);

if (image) {
  formData.append("image", image);
}

  const res = await fetch("https://mieza.onrender.com/api/shops/products", {
    method: "POST",
    headers: {
  Authorization: `Bearer ${token}`
},

body: formData
  });

  const data = await res.json();

  if (!res.ok) {
    alert(data.message);
    return;
  }

  alert("✅ Product uploaded!");
  loadProducts();
}

// ==========================
// LOAD PRODUCTS
// ==========================
async function loadProducts() {

  try {

    const res = await fetch(
      "https://mieza.onrender.com/api/shops/my-shop",
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    const currentShop =
      await res.json();

    const container =
      document.getElementById("products");

    container.innerHTML = "";

    if (!currentShop.products.length) {

      container.innerHTML =
        "<p>No products uploaded yet</p>";

      return;
    }

    currentShop.products.forEach(p => {

      container.innerHTML += `

        <div class="product-card">

          <img
            src="${p.image}"
            class="product-image"
          >

          <h4>${p.name}</h4>

          <p>₵${p.price}</p>

          <p>${p.description}</p>

          <div class="product-actions">

            <button onclick="editProduct(
              '${p._id}',
              '${p.name}',
              '${p.price}',
              '${p.description}',
              '${p.image}'
            )">
              Edit
            </button>

            <button onclick="deleteProduct('${p._id}')">
              Delete
            </button>

          </div>

        </div>
      `;
    });

  } catch (err) {

    console.log(err);
  }
}


async function deleteProduct(productId) {

  const confirmDelete =
    confirm("Delete this product?");

  if (!confirmDelete) return;

  try {

    const res = await fetch(
      `https://mieza.onrender.com/api/shops/products/${productId}`,
      {
        method: "DELETE",

        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    const data = await res.json();

    if (!res.ok) {
      alert(data.message);
      return;
    }

    alert("✅ Product deleted");

    loadProducts();

  } catch (err) {

    console.log(err);

    alert("Delete failed");
  }
}


async function editProduct(
  productId,
  oldName,
  oldPrice,
  oldDescription,
  oldImage
) {

  const name =
    prompt("Product name:", oldName);

  const price =
    prompt("Price:", oldPrice);

  const description =
    prompt("Description:", oldDescription);

  const image =
    prompt("Image URL:", oldImage);

  if (!name || !price) return;

  try {

    const res = await fetch(
      `https://mieza.onrender.com/api/shops/products/${productId}`,
      {
        method: "PUT",

        headers: {
          "Content-Type": "application/json",

          Authorization: `Bearer ${token}`
        },

        body: JSON.stringify({
          name,
          price,
          description,
          image
        })
      }
    );

    const data = await res.json();

    if (!res.ok) {
      alert(data.message);
      return;
    }

    alert("✅ Product updated");

    loadProducts();

  } catch (err) {

    console.log(err);

    alert("Update failed");
  }
}


// ==========================
// LOAD SHOP ORDERS
// ==========================

async function loadOrders() {

  try {

    const res = await fetch(
      "https://mieza.onrender.com/api/orders/shop",
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    const orders = await res.json();

    const container =
      document.getElementById(
        "ordersContainer"
      );

    container.innerHTML = "";

    if (!orders.length) {

      container.innerHTML =
        "<p>No orders yet</p>";

      return;
    }

    orders.forEach(order => {

      container.innerHTML += `

        <div
          class="order-card"
          id="order-${order._id}"
        >

          <h4>
            Order #${order._id.slice(-6)}
          </h4>

          <p>
            <strong>Customer:</strong>
            ${order.customerName}
          </p>

          <p>
            <strong>Phone:</strong>
            ${order.customerPhone}
          </p>

          <p>
            <strong>Email:</strong>
            ${order.customerEmail}
          </p>

          <p>
            <strong>Address:</strong>
            ${order.customerAddress}
          </p>

          <p>
            <strong>Status:</strong>
            <span class="status">
              ${order.status}
            </span>
          </p>

          <p>
  <strong>Product Amount Paid to You:</strong>
  ₵${Number(order.subtotal || 0).toFixed(2)}
</p>

<p>
  <strong>Delivery Fee Payable to Rider:</strong>
  ₵${Number(order.deliveryFee || 0).toFixed(2)}
</p>

<p>
  <strong>Customer Transaction ID:</strong>
  ${order.paymentReference || "Not provided"}
</p>

<p>
  <strong>Mieza Payment Reference:</strong>
  ${order.paymentInstructionReference || "Not available"}
</p>

<p>
  <strong>Payment Status:</strong>
  <span class="status">
    ${order.paymentStatus || "awaiting_vendor_confirmation"}
  </span>
</p>

          <p>
  <strong>Distance:</strong>
  ${order.distanceKm || 0} km
</p>

<p>
  <strong>Delivery Fee:</strong>
  ₵${order.deliveryFee || 0}
</p>

<p>
  <strong>Estimated Delivery:</strong>
  ${order.estimatedDeliveryMinutes || 0} mins
</p>

<p>
  <strong>Your Net Revenue:</strong>
  ₵${Number(
    order.vendorRevenue || 0
  ).toFixed(2)}
</p>

<p>
  <strong>Mieza Commission:</strong>
  ₵${Number(
    order.commissionRevenue || 0
  ).toFixed(2)}
</p>

<p>
  <strong>Commission Status:</strong>
  ${order.vendorCommissionStatus || "pending"}
</p>

          <div class="order-products">

            ${order.items.map(item => `

              <div class="order-product">

                <img
                  src="${item.image}"
                  width="60"
                >

                <div>
                  <p>${item.name}</p>
                  <small>
                    Qty: ${item.quantity}
                  </small>
                </div>

              </div>

            `).join("")}

          </div>

          ${
  order.paymentStatus ===
  "awaiting_vendor_confirmation"
    ? `
      <div class="vendor-payment-actions">

        <p class="payment-check-notice">
          Check your MoMo or bank account and confirm that the exact product amount was received.
        </p>

        <button
          class="confirm-payment-btn"
          onclick="confirmCustomerPayment(
            '${order._id}',
            'confirm'
          )"
        >
          Confirm Customer Payment
        </button>

        <button
          class="reject-payment-btn"
          onclick="confirmCustomerPayment(
            '${order._id}',
            'reject'
          )"
        >
          Payment Not Received
        </button>

      </div>
    `
    : ""
}

${
  order.paymentStatus === "confirmed"
    ? `
      <p class="payment-confirmed-label">
        ✅ Customer payment confirmed
      </p>
    `
    : ""
}

${
  order.paymentStatus === "rejected"
    ? `
      <p class="payment-rejected-label">
        ❌ Customer payment rejected
      </p>
    `
    : ""
}

          ${
  order.paymentStatus === "confirmed" &&
  order.status !== "delivered" &&
  order.status !== "cancelled"
    ? `
      <select
        onchange="updateOrderStatus(
          '${order._id}',
          this.value
        )"
      >

        <option value="">
          Update Order Status
        </option>

        <option value="processing">
          Processing
        </option>

        <option value="ready_for_pickup">
          Ready For Pickup
        </option>

        <option value="cancelled">
          Cancel Order
        </option>

      </select>
    `
    : ""
}

          ${order.status === "ready_for_pickup"
? `

`
: ""}

        </div>
      `;
    });

  } catch (err) {

    console.log(err);
  }
}


// ==========================
// UPDATE ORDER STATUS
// ==========================

async function updateOrderStatus(
  orderId,
  status
) {

  if (!status) return;

  try {

    const res = await fetch(
      `https://mieza.onrender.com/api/orders/${orderId}`,
      {

        method: "PUT",

        headers: {
          "Content-Type": "application/json",

          Authorization:
            `Bearer ${token}`
        },

        body: JSON.stringify({
          status
        })
      }
    );

    const data = await res.json();

    if (!res.ok) {

      alert(data.message);
      return;
    }

    alert("✅ Order updated");

    loadOrders();

  } catch (err) {

    console.log(err);

    alert("Update failed");
  }
}

async function confirmCustomerPayment(
  orderId,
  action
) {

  const message =
    action === "confirm"
      ? "Have you checked your MoMo or bank account and confirmed that the exact product payment was received?"
      : "Are you sure the payment was not received? This will cancel the order.";

  const confirmed =
    confirm(message);

  if (!confirmed) return;

  try {

    const res =
      await fetch(
        `https://mieza.onrender.com/api/orders/${orderId}/payment-confirmation`,
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`
          },

          body: JSON.stringify({
            action
          })
        }
      );

    const data =
      await res.json();

    if (!res.ok) {

      alert(
        data.message ||
        "Unable to update payment"
      );

      return;
    }

    alert(data.message);

    await loadOrders();

    await loadEarnings();

  } catch (err) {

    console.log(err);

    alert(
      "Server error. Please try again."
    );

  }

}

async function openNotification(
  notificationId,
  orderId
) {

  try {

    await fetch(
  `https://mieza.onrender.com/api/notifications/${notificationId}/read`,
  {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`
    }
  }
);

await loadNotifications();

document.getElementById(
  "notificationDropdown"
).style.display = "none";

    const orderCard =
      document.getElementById(
        `order-${orderId}`
      );

    if (orderCard) {

      orderCard.scrollIntoView({

        behavior: "smooth",

        block: "center"

      });

      orderCard.style.border =
        "3px solid orange";

      setTimeout(() => {

        orderCard.style.border = "";

      }, 3000);

    }

  } catch (err) {

    console.log(err);

  }

}

async function updateShopThumbnail() {

  const fileInput =
    document.getElementById("shopThumbnailFile");

  const urlInput =
    document.getElementById("shopThumbnailUrl");

  const file =
    fileInput.files[0];

  const thumbnailUrl =
    urlInput.value.trim();

  if (!file && !thumbnailUrl) {
    alert("Please upload an image or paste an image URL.");
    return;
  }

  const formData =
    new FormData();

  if (file) {
    formData.append("thumbnail", file);
  }

  if (thumbnailUrl) {
    formData.append("thumbnailUrl", thumbnailUrl);
  }

  try {

    const res =
      await fetch(
        "https://mieza.onrender.com/api/shops/thumbnail",
        {
          method: "PUT",
          headers: {
            Authorization:
              `Bearer ${token}`
          },
          body: formData
        }
      );

    const data =
      await res.json();

    if (!res.ok) {
      alert(data.message || "Thumbnail update failed");
      return;
    }

    alert("Thumbnail updated successfully");

    document.getElementById(
      "currentShopThumbnail"
    ).src = data.thumbnail;

    document.getElementById(
      "currentShopThumbnail"
    ).style.display = "block";

    fileInput.value = "";
    urlInput.value = "";

  } catch (err) {

    console.log(err);
    alert("Server error");

  }

}

// ==========================
// Logout
// ==========================
function logout() {
  localStorage.clear();
  location.href = "shop-login.html";
}


async function loadEarnings() {

  try {

    const res =
      await fetch(
        "https://mieza.onrender.com/api/orders/earnings/summary",
        {
          headers: {
            Authorization:
              `Bearer ${token}`
          }
        }
      );

    const data =
      await res.json();

    if (!res.ok) {

      console.log(
        data.message ||
        "Earnings request failed"
      );

      return;
    }

    document.getElementById(
      "todaySales"
    ).textContent =
      `₵${Number(
        data.todaySales || 0
      ).toFixed(2)}`;

    document.getElementById(
      "monthSales"
    ).textContent =
      `₵${Number(
        data.monthSales || 0
      ).toFixed(2)}`;

    document.getElementById(
      "pendingSettlement"
    ).textContent =
      `₵${Number(
        data.commissionOwed || 0
      ).toFixed(2)}`;

    document.getElementById(
      "totalPaidOut"
    ).textContent =
      `₵${Number(
        data.commissionPaid || 0
      ).toFixed(2)}`;

    document.getElementById(
      "totalCommission"
    ).textContent =
      `₵${Number(
        data.totalCommissionAccrued || 0
      ).toFixed(2)}`;

  } catch (err) {

    console.log(
      "Earnings load error:",
      err
    );

  }

}

async function loadShopProfile() {

  try {

    const res = await fetch(
      "https://mieza.onrender.com/api/shops/my-shop",
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    const currentShop = await res.json();

    if (!res.ok) {
      console.log(currentShop.message);
      return;
    }

    if (currentShop.thumbnail) {

      const img =
        document.getElementById("currentShopThumbnail");

      if (img) {
        img.src = currentShop.thumbnail;
        img.style.display = "block";
      }

    }

    if (currentShop.openingHours) {

      const openInput =
        document.getElementById("dashboardOpeningTime");

      const closeInput =
        document.getElementById("dashboardClosingTime");

      if (openInput) {
        openInput.value =
          currentShop.openingHours.open || "08:00";
      }

      if (closeInput) {
        closeInput.value =
          currentShop.openingHours.close || "22:00";
      }

    }

  } catch (err) {

    console.log("Shop profile load error:", err);

  }

}

async function updateOpeningHours() {

  const openingTime =
    document.getElementById(
      "dashboardOpeningTime"
    ).value;

  const closingTime =
    document.getElementById(
      "dashboardClosingTime"
    ).value;

  if (!openingTime || !closingTime) {
    alert("Please select opening and closing time.");
    return;
  }

  try {

    const res =
      await fetch(
        "https://mieza.onrender.com/api/shops/opening-hours",
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
            Authorization:
              `Bearer ${token}`
          },

          body: JSON.stringify({
            openingTime,
            closingTime
          })
        }
      );

    const data =
      await res.json();

    if (!res.ok) {
      alert(data.message || "Failed to update opening hours");
      return;
    }

    alert("Opening hours updated successfully");

  } catch (err) {

    console.log(err);
    alert("Server error");

  }

}

// INIT
loadShopProfile();

loadProducts();

loadOrders();

loadNotifications();

loadEarnings();

setInterval(() => {

  loadNotifications();

  loadEarnings();

}, 10000);