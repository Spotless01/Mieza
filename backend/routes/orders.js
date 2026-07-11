const authMiddleware =
  require("../middleware/authMiddleware");

const express = require("express");
const router = express.Router();

const Order = require("../models/Order");
const Shop = require("../models/Shop");
const Notification =
require("../models/Notification");
const sendEmail =
  require("../config/brevo");

  const calculateDistance =
require("../utils/distance");

const sendSMS =
require("../config/sms");

const Rider = require("../models/Rider");

const Settings =
require("../models/Settings");

function generateDeliveryPin() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ====================================
// 🛒 CREATE ORDER
// ====================================

router.post("/", async (req, res) => {

  try {

    const subtotal =
Number(req.body.subtotal || 0);

const settings =
  await Settings.findOne();

const vendorCommissionRate =
  settings?.vendorCommissionRate || 10;

const shop =
await Shop.findById(
  req.body.shopId
);

if (!shop) {

  return res.status(404).json({
    message: "Shop not found"
  });

}

const distanceKm =
  calculateDistance(

    shop.latitude,
    shop.longitude,

    req.body.customerLatitude,
    req.body.customerLongitude
  );

const BASE_FEE = 5;

const PER_KM_RATE = 1.5;

let deliveryFee =
  Number(req.body.deliveryFee || 0);

if (!deliveryFee) {

  const BASE_FEE = 5;
  const PER_KM_RATE = 2;

  deliveryFee =
    Math.round(
      BASE_FEE +
      distanceKm * PER_KM_RATE
    );

}

const deliveryCommission =
  Number(
    (deliveryFee * 0.10).toFixed(2)
  );

const riderEarnings =
  Number(
    (deliveryFee - deliveryCommission).toFixed(2)
  );

const estimatedDeliveryMinutes =
  Math.round(distanceKm * 3);

const commissionRevenue =
  Number(
    (
      subtotal *
      (vendorCommissionRate / 100)
    ).toFixed(2)
  );

const vendorRevenue =
  Number(
    (subtotal - commissionRevenue).toFixed(2)
  );

const totalAmount =
  subtotal + deliveryFee;

const deliveryPin =
  generateDeliveryPin();

const order = new Order({

  ...req.body,

  totalAmount,

  commissionRevenue,

  distanceKm,

  estimatedDeliveryMinutes,

  deliveryFee,

deliveryCommission,

riderEarnings,

vendorRevenue,

deliveryPin,
deliveryPinVerified: false,

  settlementStatus:
  "pending",

  customerNotifications: [
    {
      message:
        "Order placed successfully."
    }
  ]

});

    await order.save();

const trackingId =
  order._id.toString();

const customerNumber =
  order.customerPhone;

// ======================================
// SEND SMS
// ======================================

try {

  console.log(
    "Sending customer SMS..."
  );

  await sendSMS(
    customerNumber,

`MIEZA

Order Confirmed ✅

Tracking ID:
${trackingId}

Delivery PIN:
${deliveryPin}

Only give this PIN to the rider AFTER receiving your complete order.

Track your order:
miezadelivery.com/track-order.html

Thank you for shopping with Mieza.`
  );

  console.log(
    "Customer SMS sent."
  );

} catch (err) {

  console.log(
    "Customer SMS failed:",
    err.message
  );

}

// ======================================
// SEND EMAIL
// ======================================

try {

  console.log(
    "Sending customer email..."
  );

  await sendEmail(

    order.customerEmail,

    "Your Mieza Delivery PIN",

    `
    <h2>Mieza Order Confirmed ✅</h2>

    <p>Hello ${order.customerName},</p>

    <p>Your order has been received successfully.</p>

    <p><strong>Tracking ID:</strong>
    ${trackingId}</p>

    <div style="
      margin:20px 0;
      padding:18px;
      background:#f3f6fb;
      border-radius:12px;
      text-align:center;
    ">

      <p style="
        margin:0;
        font-size:14px;
      ">
        Your Delivery Verification PIN
      </p>

      <h1 style="
        margin:10px 0;
        letter-spacing:4px;
        color:#0b5cff;
      ">
        ${deliveryPin}
      </h1>

    </div>

    <p>
      Only give this PIN to the rider
      <strong>after receiving your complete order.</strong>
    </p>

    <p>

      Track your order:

      <br>

      <a href="https://miezadelivery.com/track-order.html">

        Track My Order

      </a>

    </p>

    <p>
      Thank you for shopping with Mieza.
    </p>
    `
  );

  console.log(
    "Customer email sent."
  );

} catch (err) {

  console.log(
    "Customer email failed:",
    err.message
  );

}


    if (shop) {
      await Notification.create({

  shopId: shop._id,

  orderId: order._id,

  title: "New Order Received",

  message:
    `${req.body.customerName}
     placed an order worth
     GH₵ ${totalAmount}`

});

await Notification.create({

  shopId: null,

  title: "New Marketplace Order",

  message:
    `${shop.shopName}
     received an order
     worth GH₵ ${totalAmount}`

});


  const productsList =
    req.body.items
      .map(
        item =>
          `${item.name} x ${item.quantity}`
      )
      .join("\n");


      // =====================
// VENDOR SMS
// =====================

try {

  await sendSMS(
    shop.phone,

`MIEZA VENDOR

New order received ✅

Customer:
${req.body.customerName}

Order:
#${order._id.toString().slice(-6)}

Product amount:
GH₵${subtotal.toFixed(2)}

Customer transaction ID:
${order.paymentReference || "Not provided"}

Please log in, confirm the payment in your MoMo or bank account, and process the order.`
  );

  console.log(
    `Vendor SMS sent to ${shop.phone}`
  );

} catch (smsError) {

  console.log(
    "Vendor SMS failed:",
    smsError.message
  );

}

// =====================
// VENDOR EMAIL
// =====================

try {

  await sendEmail(
    shop.email,
    "New Order Received - Mieza",

    `
      <h2>New Order Received</h2>

      <p>
        A customer has submitted an order and payment details for confirmation.
      </p>

      <p>
        <strong>Order ID:</strong>
        ${order._id}
      </p>

      <p>
        <strong>Customer:</strong>
        ${req.body.customerName}
      </p>

      <p>
        <strong>Phone:</strong>
        ${req.body.customerPhone}
      </p>

      <p>
        <strong>Address:</strong>
        ${req.body.customerAddress}
      </p>

      <p>
        <strong>Products:</strong>
      </p>

      <pre>${productsList}</pre>

      <p>
        <strong>Product amount paid to you:</strong>
        GH₵${subtotal.toFixed(2)}
      </p>

      <p>
        <strong>Customer transaction ID:</strong>
        ${order.paymentReference || "Not provided"}
      </p>

      <p>
        <strong>Mieza payment reference:</strong>
        ${order.paymentInstructionReference || "Not available"}
      </p>

      <p>
        Log in to your dashboard, verify the payment in your MoMo or bank account, and confirm or reject it.
      </p>

      <p>
        <a href="https://miezadelivery.com/shop-login.html">
          Open Vendor Dashboard
        </a>
      </p>
    `
  );

  console.log(
    `Vendor email sent to ${shop.email}`
  );

} catch (mailError) {

  console.log(
    "Vendor email failed:",
    mailError.message
  );

}

  // =====================
  // ADMIN EMAIL
  // =====================

  try {

    await sendEmail(

      process.env.ADMIN_EMAIL,

      `New Order For ${shop.shopName}`,

      `
      <h2>New Order Alert</h2>

      <p><strong>Shop:</strong>
      ${shop.shopName}</p>

      <p><strong>Customer:</strong>
      ${req.body.customerName}</p>

      <p><strong>Phone:</strong>
      ${req.body.customerPhone}</p>

      <p><strong>Address:</strong>
      ${req.body.customerAddress}</p>

      <p><strong>Products:</strong></p>

      <pre>${productsList}</pre>

      <p><strong>Total:</strong>
      GH₵ ${totalAmount}</p>
      `
    );

  } catch (mailError) {

    console.log(
      "Admin email failed:",
      mailError
    );

  }

}

    res.status(201).json(order);

  } catch (err) {

    console.log(err);

    res.status(500).json({
      message: err.message
    });
  }
});


// ====================================
// 🛍️ GET SHOP ORDERS
// ====================================

router.get(
  "/shop",
  authMiddleware,
  async (req, res) => {

    try {

      const orders = await Order.find({
        shopId: req.shopId
      }).sort({ createdAt: -1 });

      res.json(orders);

    } catch (err) {

      res.status(500).json({
        message: err.message
      });
    }
  }
);

// ====================================
// UPDATE RIDER LOCATION
// ====================================

router.put(
  "/:orderId/location",
  authMiddleware,
  async (req, res) => {

       if (
  req.body.latitude == null ||
  req.body.longitude == null
) {
  return res.status(400).json({
    message: "Coordinates required"
  });
}

    try {

      const order =
      await Order.findById(
        req.params.orderId
      );

      if (
  order.shopId.toString() !==
  req.shopId
) {
  return res.status(403).json({
    message: "Unauthorized"
  });
}

      if (!order) {

        return res.status(404).json({
          message: "Order not found"
        });

      }

      order.riderLatitude =
      req.body.latitude;

      order.riderLongitude =
      req.body.longitude;

      order.deliveryStarted = true;

      await order.save();

      res.json({
        success: true
      });

    } catch (err) {

      res.status(500).json({
        message: err.message
      });

    }

  }
);

// ====================================
// LIVE TRACKING DATA
// ====================================

router.get(
  "/tracking/live/:orderId",
  async (req, res) => {

    try {

      const order =
      await Order.findById(
        req.params.orderId
      );

      if (!order) {

        return res.status(404).json({
          message: "Order not found"
        });

      }

      const shop =
await Shop.findById(
  order.shopId
);

      if (!shop) {

  return res.status(404).json({
    message: "Shop not found"
  });

}

if (
  shop.latitude == null ||
  shop.longitude == null
) {
  return res.status(400).json({
    message: "Shop location not set"
  });
}

      res.json({

        shopLatitude:
          shop.latitude,

        shopLongitude:
          shop.longitude,

        customerLatitude:
          order.customerLatitude,

        customerLongitude:
          order.customerLongitude,

        riderLatitude:
          order.riderLatitude,

        riderLongitude:
          order.riderLongitude,

        status:
          order.status

      });

    } catch (err) {

      res.status(500).json({
        message: err.message
      });

    }

  }
);

// ====================================
// CONFIRM OR REJECT CUSTOMER PAYMENT
// ====================================

router.put(
  "/:orderId/payment-confirmation",
  authMiddleware,
  async (req, res) => {

    try {

      const { action } = req.body;

      if (
        action !== "confirm" &&
        action !== "reject"
      ) {
        return res.status(400).json({
          message: "Action must be confirm or reject"
        });
      }

      const order =
        await Order.findById(req.params.orderId);

      if (!order) {
        return res.status(404).json({
          message: "Order not found"
        });
      }

      if (
        order.shopId.toString() !==
        req.shopId
      ) {
        return res.status(403).json({
          message: "Unauthorized"
        });
      }

      if (order.paymentStatus === "confirmed") {
        return res.status(400).json({
          message: "This payment has already been confirmed"
        });
      }

      if (
        order.status === "delivered" ||
        order.status === "cancelled"
      ) {
        return res.status(400).json({
          message: "This order can no longer be updated"
        });
      }

      if (action === "confirm") {

        order.paymentStatus = "confirmed";

        order.vendorPaymentConfirmedAt =
          new Date();

        order.status = "processing";

        order.customerNotifications.push({
          message:
            "The vendor confirmed your payment and is preparing your order."
        });

        await order.save();

        try {

          await sendSMS(
            order.customerPhone,
`MIEZA

Payment Confirmed ✅

The vendor has confirmed your payment and is preparing your order.

Order:
#${order._id.toString().slice(-6)}

Thank you for using Mieza.`
          );

        } catch (smsErr) {

          console.log(
            "Payment confirmation SMS failed:",
            smsErr.message
          );

        }

        try {

          await sendEmail(
            order.customerEmail,
            "Payment Confirmed - Mieza",
            `
              <h2>Payment Confirmed ✅</h2>

              <p>Hello ${order.customerName},</p>

              <p>
                The vendor has confirmed receiving your payment.
              </p>

              <p>
                Your order is now being prepared.
              </p>

              <p>
                <strong>Order ID:</strong>
                ${order._id}
              </p>

              <p>Thank you for using Mieza.</p>
            `
          );

        } catch (mailErr) {

          console.log(
            "Payment confirmation email failed:",
            mailErr.message
          );

        }

        return res.json({
          message: "Customer payment confirmed",
          order
        });

      }

      order.paymentStatus = "rejected";
      order.status = "cancelled";

      order.customerNotifications.push({
        message:
          "The vendor could not confirm your payment. Please check the transaction details and contact the vendor or Mieza support."
      });

      await order.save();

      try {

        await sendSMS(
          order.customerPhone,
`MIEZA

Payment Could Not Be Confirmed

The vendor could not verify your payment for order #${order._id.toString().slice(-6)}.

Please check your transaction details and contact the vendor or Mieza support.`
        );

      } catch (smsErr) {

        console.log(
          "Payment rejection SMS failed:",
          smsErr.message
        );

      }

      try {

        await sendEmail(
          order.customerEmail,
          "Payment Could Not Be Confirmed - Mieza",
          `
            <h2>Payment Could Not Be Confirmed</h2>

            <p>Hello ${order.customerName},</p>

            <p>
              The vendor could not verify the payment for your order.
            </p>

            <p>
              <strong>Order ID:</strong>
              ${order._id}
            </p>

            <p>
              Please check your transaction details and contact the vendor or Mieza support.
            </p>
          `
        );

      } catch (mailErr) {

        console.log(
          "Payment rejection email failed:",
          mailErr.message
        );

      }

      return res.json({
        message:
          "Customer payment rejected and order cancelled",
        order
      });

    } catch (err) {

      console.log(
        "Payment confirmation error:",
        err
      );

      res.status(500).json({
        message:
          "Unable to update payment confirmation"
      });

    }

  }
);

// ====================================
// 🔄 Update Order Status
// ====================================

router.put(
  "/:orderId",
  authMiddleware,
  async (req, res) => {

    try {

      const order = await Order.findById(
        req.params.orderId
      );

      if (!order) {
        return res.status(404).json({
          message: "Order not found"
        });
      }

      // Security check
      if (
        order.shopId.toString() !==
        req.shopId
      ) {
        return res.status(403).json({
          message: "Unauthorized"
        });
      }

      if (
  order.paymentStatus !== "confirmed" &&
  (
    req.body.status === "processing" ||
    req.body.status === "ready_for_pickup"
  )
) {
  return res.status(400).json({
    message:
      "Confirm the customer's payment before preparing this order."
  });
}

      const newStatus =
  req.body.status;

const allowedStatuses = [

  "processing",

  "ready_for_pickup",

  "cancelled"

];

if (
  !allowedStatuses.includes(
    newStatus
  )
) {

  return res.status(400).json({
    message:
    "Invalid status"
  });

}

const previousStatus = order.status;

order.status = newStatus;

if (
  newStatus === "ready_for_pickup" &&
  previousStatus !== "ready_for_pickup"
) {

  console.log(
    `Order ${order._id} ready for pickup`
  );

  try {

    const riders =
      await Rider.find({
        isApproved: true,
        isActive: true,
        isAvailable: true
      });

    const shop =
      await Shop.findById(order.shopId);

    const riderNotificationResults =
  await Promise.allSettled(

    riders.map(async rider => {

      const notificationResults =
        await Promise.allSettled([

          sendSMS(
            rider.phone,

`MIEZA DELIVERY

New order available for pickup.

Shop:
${shop?.shopName || "Mieza vendor"}

Order:
#${order._id.toString().slice(-6)}

Delivery fee:
GH₵${Number(order.deliveryFee || 0).toFixed(2)}

Your earnings:
GH₵${Number(order.riderEarnings || 0).toFixed(2)}

Log in to your rider dashboard to accept.`
          ),

          sendEmail(
            rider.email,
            "New Delivery Available - Mieza",

            `
              <h2>New Delivery Available 🚚</h2>

              <p>Hello ${rider.fullName},</p>

              <p>
                A new order is ready for pickup.
              </p>

              <p>
                <strong>Shop:</strong>
                ${shop?.shopName || "Mieza vendor"}
              </p>

              <p>
                <strong>Order:</strong>
                #${order._id.toString().slice(-6)}
              </p>

              <p>
                <strong>Delivery fee:</strong>
                GH₵${Number(order.deliveryFee || 0).toFixed(2)}
              </p>

              <p>
                <strong>Your earnings:</strong>
                GH₵${Number(order.riderEarnings || 0).toFixed(2)}
              </p>

              <p>
                Log in to your rider dashboard to accept the delivery.
              </p>

              <p>
                <a href="https://miezadelivery.com/rider-login.html">
                  Open Rider Dashboard
                </a>
              </p>
            `
          )

        ]);

      const smsResult =
        notificationResults[0];

      const emailResult =
        notificationResults[1];

      if (smsResult.status === "rejected") {
        console.log(
          `Rider SMS failed for ${rider.fullName}:`,
          smsResult.reason?.message ||
          smsResult.reason
        );
      } else {
        console.log(
          `Rider SMS sent to ${rider.fullName}`
        );
      }

      if (emailResult.status === "rejected") {
        console.log(
          `Rider email failed for ${rider.fullName}:`,
          emailResult.reason?.message ||
          emailResult.reason
        );
      } else {
        console.log(
          `Rider email sent to ${rider.fullName}`
        );
      }

    })

  );

const failedRiderNotifications =
  riderNotificationResults.filter(
    result => result.status === "rejected"
  );

console.log(
  `Rider notifications processed for ${riders.length} riders`
);

if (failedRiderNotifications.length) {
  console.log(
    `${failedRiderNotifications.length} rider notification task(s) failed unexpectedly`
  );
}

console.log(
  `Rider SMS/email alerts sent to ${riders.length} riders`
);

  } catch (smsErr) {

    console.log(
      "Rider SMS notification failed:",
      smsErr.message
    );

  }

}

order.customerNotifications.push({

  message:
    `Your order is now ${newStatus}`

});
      await order.save();

    try {

  await sendEmail(

    order.customerEmail,

    `Order Update - ${newStatus}`,

    `
    <h2>Mieza Order Update</h2>

    <p>Hello ${order.customerName},</p>

    <p>Your order status has changed.</p>

    <p>
      <strong>Status:</strong>
      ${newStatus}
    </p>

    <p>
      Order ID:
      ${order._id}
    </p>

    <p>
      Thank you for using Mieza.
    </p>
    `
  );

} catch (mailError) {

  console.log(
    "Customer email failed:",
    mailError
  );

}

      res.json(order);

    } catch (err) {

      res.status(500).json({
        message: err.message
      });
    }
  }
);


// ====================================
// VENDOR SALES + COMMISSION SUMMARY
// ====================================

router.get(
  "/earnings/summary",
  authMiddleware,
  async (req, res) => {

    try {

      const orders =
        await Order.find({
          shopId: req.shopId,

          // Only successfully completed orders
          // should create final commission obligations.
          status: "delivered",

          paymentStatus: "confirmed"
        });

      const now =
        new Date();

      const startOfToday =
        new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate()
        );

      const startOfMonth =
        new Date(
          now.getFullYear(),
          now.getMonth(),
          1
        );

      const getCompletedDate = order =>
        order.deliveredAt ||
        order.updatedAt ||
        order.createdAt;

      const todayOrders =
        orders.filter(order =>
          new Date(
            getCompletedDate(order)
          ) >= startOfToday
        );

      const monthOrders =
        orders.filter(order =>
          new Date(
            getCompletedDate(order)
          ) >= startOfMonth
        );

      const sumProductSales = list =>
        list.reduce(
          (sum, order) =>
            sum +
            Number(order.subtotal || 0),
          0
        );

      const unpaidCommissionOrders =
        orders.filter(order =>
          order.vendorCommissionStatus !== "paid"
        );

      const paidCommissionOrders =
        orders.filter(order =>
          order.vendorCommissionStatus === "paid"
        );

      const commissionOwed =
        unpaidCommissionOrders.reduce(
          (sum, order) =>
            sum +
            Number(
              order.commissionRevenue || 0
            ),
          0
        );

      const commissionPaid =
        paidCommissionOrders.reduce(
          (sum, order) =>
            sum +
            Number(
              order.commissionRevenue || 0
            ),
          0
        );

      const totalCommissionAccrued =
        orders.reduce(
          (sum, order) =>
            sum +
            Number(
              order.commissionRevenue || 0
            ),
          0
        );

      res.json({

        todaySales:
          sumProductSales(todayOrders),

        monthSales:
          sumProductSales(monthOrders),

        commissionOwed,

        commissionPaid,

        totalCommissionAccrued

      });

    } catch (err) {

      console.log(
        "Vendor earnings summary error:",
        err
      );

      res.status(500).json({
        message:
          "Unable to load vendor earnings summary"
      });

    }

  }
);


module.exports = router;