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
            <strong>Total:</strong>
            ₵${order.totalAmount}
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
  <strong>Vendor Revenue:</strong>
  ₵${order.vendorRevenue || 0}
</p>

<p>
  <strong>Mieza Commission:</strong>
  ₵${order.commissionRevenue || 0}
</p>

<p>
  <strong>Settlement:</strong>
  ${order.settlementStatus || "pending"}
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

          <select
            onchange="updateOrderStatus(
              '${order._id}',
              this.value
            )"
          >

            <option value="">
              Update Status
            </option>

            <option value="processing">
              Processing
            </option>

            <option value="ready_for_pickup">
            Ready For Pickup
            </option>

            <option value="delivered">
              Delivered
            </option>

            <option value="cancelled">
              Cancelled
            </option>

          </select>

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

    const res = await fetch(
  "https://mieza.onrender.com/api/orders/earnings/summary",
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    const data = await res.json();

    document.getElementById(
      "todaySales"
    ).textContent =
      `₵${data.todaySales || 0}`;

    document.getElementById(
      "monthSales"
    ).textContent =
      `₵${data.monthSales || 0}`;

    document.getElementById(
      "pendingSettlement"
    ).textContent =
      `₵${data.pendingSettlement || 0}`;

    document.getElementById(
      "totalPaidOut"
    ).textContent =
      `₵${data.totalPaidOut || 0}`;

    document.getElementById(
      "totalCommission"
    ).textContent =
      `₵${data.totalCommission || 0}`;

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

    const currentShop =
      await res.json();

    if (currentShop.thumbnail) {

      const img =
        document.getElementById(
          "currentShopThumbnail"
        );

      img.src =
        currentShop.thumbnail;

      img.style.display =
        "block";

    }

  } catch (err) {

    console.log(
      "Shop profile load error:",
      err
    );

  }

  if (currentShop.openingHours) {

  document.getElementById(
    "dashboardOpeningTime"
  ).value =
    currentShop.openingHours.open || "08:00";

  document.getElementById(
    "dashboardClosingTime"
  ).value =
    currentShop.openingHours.close || "22:00";

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