// Import dependencies
const express = require("express");
const cors = require("cors");
//middleware for logging http request in app
const morgan = require("morgan");
//dotenv is used to load environment variables from a .env file into your app
require("dotenv").config({ path: "./config/dotenv.env" });
const connectDB = require("./db");

// Connect to Database
connectDB();

// Create app
const app = express();

// 🔹 Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// 🔹 Test route
app.get("/", (req, res) => {
  res.json("🚗 Rent Car API is running...");
});

// 🔹 Routes
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const vehicleRoutes = require("./routes/vehicle.routes");
const clientRoutes = require("./routes/client.routes");
const bookingRoutes = require("./routes/booking.routes");
const bookingService = require("./services/booking.service");

// Use routes
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/vehicles", vehicleRoutes);
app.use("/clients", clientRoutes);
app.use("/bookings", bookingRoutes);

// 🔹 Background tasks
setInterval(() => {
  bookingService.checkExpiredReservations();
}, 60000); // Check every minute

// 🔹 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// 🔹 Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Something went wrong",
    error: err.message,
  });
});

// 🔹 Start server
const PORT = process.env.PORT | 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
