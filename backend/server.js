require("dotenv").config();
const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");
const shopRoutes = require("./routes/shops");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/shops", shopRoutes);

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

const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);
