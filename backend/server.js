require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");

const shopRoutes = require("./routes/shops");
const marketplaceRoutes = require("./routes/marketplace");
const orderRoutes = require("./routes/orders");
const authRoutes = require("./routes/authRoutes");

const riderAuthRoutes =
require("./routes/riderAuth");

const riderOrdersRoutes =
require("./routes/riderOrders");

const notificationRoutes =
  require("./routes/notifications");

  const trackingRoutes =
  require("./routes/tracking");

const app = express();

const path = require("path");

const paymentRoutes =
  require("./routes/payment");

  const adminAuthRoutes =
require("./routes/adminAuth");

const adminRoutes =
require("./routes/admin");

const deliveryRoutes =
require("./routes/delivery");

const configRoutes =
require("./routes/config");

const sendSMS =
require("./config/sms");

const { runAutoPayouts } =
  require("./services/autoPayoutService");

  const reviewRoutes =
require("./routes/reviews");

const Settings =
  require("./models/Settings");

// Middleware
app.use(cors());
app.use(express.json());

app.use("/uploads",
  express.static(
    path.join(__dirname, "uploads")
  )
);

// Routes
app.use("/api/shops", shopRoutes);
app.use("/api/marketplace", marketplaceRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/auth", authRoutes);
app.use(
"/api/rider-auth",
riderAuthRoutes
);

app.use(
"/api/rider-orders",
riderOrdersRoutes
);

app.use("/api/payment", paymentRoutes);

app.use(
  "/api/notifications",
  notificationRoutes
);

app.use(
  "/api/tracking",
  trackingRoutes
);

app.use(
  "/api/admin-auth",
  adminAuthRoutes
);

app.use(
  "/api/admin",
  adminRoutes
);

app.use(
  "/api/delivery",
  deliveryRoutes
);

app.use(
  "/api/config",
  configRoutes
);

app.use(
"/api/reviews",
reviewRoutes
);


app.post("/api/test-sms", async (req, res) => {

  try {

    await sendSMS(
      req.body.phone,
      "Hello from Mieza. SMS setup is working."
    );

    res.json({
      message: "Test SMS sent"
    });

  } catch (err) {

    res.status(500).json({
      message: err.message
    });

  }

});

// Test route
app.get("/", (req, res) => {
  res.send("Mieza backend running 🚀");
});

// Start server AFTER DB connects
const startServer = async () => {

  await connectDB();

  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });

    // ==============================
  // AUTO PAYOUT SCHEDULER
  // ==============================

  setInterval(async () => {

    try {

      const settings =
        await Settings.findOne();

      if (!settings?.autoPayoutEnabled) {
        return;
      }

      const now =
        new Date();

      const currentHour =
        now.getHours();

      const settlementHour =
        settings.settlementHour ?? 22;

      if (currentHour === settlementHour) {

        console.log(
          "Running Mieza automatic payouts..."
        );

        await runAutoPayouts();

      }

    } catch (err) {

      console.log(
        "Auto payout scheduler error:",
        err.message
      );

    }

  }, 60 * 60 * 1000);

};

startServer();