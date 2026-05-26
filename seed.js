const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config({ path: "./config/dotenv.env" });
const User = require("./models/user.model");
const Vehicle = require("./models/vehicle.model");

const seedData = async () => {
  try {
    const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/rentcar_db?retryWrites=false";
    await mongoose.connect(uri);
    console.log("Connected to MongoDB...");

    // Clear existing data
    await User.deleteMany({});
    await Vehicle.deleteMany({});
    console.log("Cleared existing data.");

    // Create Admin
    const hashedPassword = await bcrypt.hash("admin123", 10);
    const admin = await User.create({
      firstName: "Admin",
      lastName: "User",
      email: "admin@rentcar.com",
      password: hashedPassword,
      role: "admin"
    });
    console.log("Admin user created.");

    // Create Client
    const clientPassword = await bcrypt.hash("client123", 10);
    const client = await User.create({
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      password: clientPassword,
      role: "client"
    });
    console.log("Client user created.");

    // Create Vehicles
    const vehicles = [
      {
        plate: "ABC-1234",
        name: "Tesla Model 3",
        type: "Electric",
        year: 2023,
        ratePerDay: 150,
        mileage: 5000,
        fuel: "Electric",
        status: "Available",
        image: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&q=80&w=2071"
      },
      {
        plate: "XYZ-5678",
        name: "BMW M4",
        type: "Sport",
        year: 2022,
        ratePerDay: 250,
        mileage: 12000,
        fuel: "Petrol",
        status: "Available",
        image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=2070"
      }
    ];

    await Vehicle.insertMany(vehicles);
    console.log("Vehicles created.");

    console.log("Seed completed successfully!");
    process.exit();
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  }
};

seedData();
