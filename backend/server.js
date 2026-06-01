require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");

const shopRoutes = require("./routes/shops");
const marketplaceRoutes = require("./routes/marketplace");
const orderRoutes = require("./routes/orders");
const authRoutes = require("./routes/authRoutes");

const notificationRoutes =
  require("./routes/notifications");

const app = express();

const path = require("path");

const paymentRoutes =
  require("./routes/payment");

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
app.use("/api/payment", paymentRoutes);

app.use(
  "/api/notifications",
  notificationRoutes
);

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

};

startServer();