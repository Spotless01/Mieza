const token =
localStorage.getItem(
  "adminToken"
);

const shopId =
localStorage.getItem(
  "selectedShop"
);

if (!token || !shopId) {

  location.href =
    "admin-dashboard.html";

}

// ======================
// LOAD SHOP DETAILS
// ======================

async function loadShopDetails() {

  const res = await fetch(

    `https://mieza.onrender.com/api/admin/shops/${shopId}/details`,

    {

      headers: {

        Authorization:
          `Bearer ${token}`

      }

    }

  );

  const shop =
    await res.json();

  document.getElementById(
    "shopName"
  ).textContent =
    shop.shopName;

  document.getElementById(
    "shopInfo"
  ).innerHTML = `

<div class="card">

<p>
Owner:
${shop.ownerName}
</p>

<p>
Email:
${shop.email}
</p>

<p>
Phone:
${shop.phone}
</p>

<hr>

<p>
Product Revenue:
₵${shop.productRevenue}
</p>

<p>
Commission Revenue:
₵${shop.commissionRevenue}
</p>

<p>
Vendor Revenue:
₵${shop.vendorRevenue}
</p>

<p>
Pending Settlement:
₵${shop.pendingSettlement}
</p>

<hr>

<p>
Payout Method:
${shop.payoutMethod || "-"}
</p>

<p>
MoMo Name:
${shop.momoName || "-"}
</p>

<p>
MoMo Number:
${shop.momoNumber || "-"}
</p>

<p>
Network:
${shop.momoNetwork || "-"}
</p>

<p>
Bank:
${shop.bankName || "-"}
</p>

<p>
Account Name:
${shop.accountName || "-"}
</p>

<p>
Account Number:
${shop.accountNumber || "-"}
</p>

</div>

`;

  renderOrders(shop.orders);

  loadSettlements();
}

// ======================
// ORDERS
// ======================

function renderOrders(orders) {

  const container =
    document.getElementById(
      "ordersContainer"
    );

  let html = `

<table>

<tr>

<th>Order ID</th>

<th>Total</th>

<th>Status</th>

<th>Settlement</th>

</tr>

`;

  orders.forEach(order => {

    html += `

<tr>

<td>
${order._id.slice(-6)}
</td>

<td>
₵${order.totalAmount}
</td>

<td>
${order.status}
</td>

<td>
${order.settlementStatus}
</td>

</tr>

`;

  });

  html += "</table>";

  container.innerHTML = html;
}

// ======================
// SETTLEMENT HISTORY
// ======================

async function loadSettlements() {

  const res = await fetch(

    `https://mieza.onrender.com/api/admin/shops/${shopId}/settlements`,

    {

      headers: {

        Authorization:
          `Bearer ${token}`

      }

    }

  );

  const settlements =
    await res.json();

  const container =
    document.getElementById(
      "settlementContainer"
    );

  if (
    settlements.length === 0
  ) {

    container.innerHTML =
      "<p>No settlements yet</p>";

    return;

  }

  let html = `

<table>

<tr>

<th>Date</th>

<th>Amount</th>

<th>Status</th>

</tr>

`;

  settlements.forEach(item => {

    html += `

<tr>

<td>
${new Date(
  item.createdAt
).toLocaleDateString()}
</td>

<td>
₵${item.amountPaid}
</td>

<td>
${item.status}
</td>

</tr>

`;

  });

  html += "</table>";

  container.innerHTML = html;
}

loadShopDetails();