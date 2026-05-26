const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  age: { type: Number },
  sexe: { type: String },
  birthday: { type: Date },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, unique: true, sparse: true },
  role: { type: String, enum: ['client', 'admin', 'superAdmin'], default: 'admin' },
  rentals: { type: Number, default: 0 },
  totalSpent: { type: Number, default: 0 },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("User", userSchema);
