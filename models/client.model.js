const mongoose = require("mongoose");

const clientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  rentals: { type: Number, default: 0 },
  totalSpent: { type: Number, default: 0 },
  status: { type: String, enum: ['vip', 'active', 'inactive'], default: 'active' },
  avatarClass: { type: String, default: 'av-teal' },
  initials: { type: String },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Client", clientSchema);
