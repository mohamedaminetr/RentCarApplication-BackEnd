const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  bookingId: { type: String, required: true, unique: true },
  clientName: { type: String, required: true },
  vehicleName: { type: String, required: true },
  plate: { type: String, required: true },
  pickup: { type: String, required: true },
  returnDate: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['Pending', 'Approved', 'Active', 'Completed', 'Canceled', 'Expired'], 
    default: 'Pending' 
  },
  amount: { type: Number, required: true },
  initials: { type: String },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Booking", bookingSchema);
