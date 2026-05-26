const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema({
  plate: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  type: { type: String },
  year: { type: Number },
  ratePerDay: { type: Number, required: true },
  mileage: { type: Number },
  fuel: { type: String },
  status: { 
    type: String, 
    enum: ['Available', 'Reserved', 'Rented', 'Maintenance'], 
    default: 'Available' 
  },
  utilization: { type: Number, default: 0 },
  image: { type: String },
  returnDate: { type: String },
  readyDate: { type: String },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Vehicle", vehicleSchema);
