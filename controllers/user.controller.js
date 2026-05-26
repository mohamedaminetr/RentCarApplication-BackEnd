const User = require("../models/user.model");

// Helper to map MongoDB _id to id for frontend compatibility
const mapId = (obj) => {
  if (!obj) return obj;
  const result = obj.toObject ? obj.toObject() : { ...obj };
  result.id = result._id;
  return result;
};

// GET all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ created_at: 1 });
    res.status(200).json(users.map(mapId));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error", error: err.message });
  }
};

// GET user by ID
const getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(mapId(user));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error", error: err.message });
  }
};

const createUser = async (req, res) => {
  try {
    const newUser = new User(req.body);
    await newUser.save();
    res.status(201).json(mapId(newUser));
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "Email or Phone already exists" });
    }
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const updateUser = async (req, res) => {
  const { id } = req.params;
  try {
    const updatedUser = await User.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedUser) return res.status(404).json({ message: "User not found" });
    res.json(mapId(updatedUser));
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { getAllUsers, getUserById, createUser, updateUser, deleteUser };
