const User = require("../models/user.model");
const bcrypt = require("bcryptjs");

// Helper to map User to Client response
const mapUserToClient = (user) => {
  const userObj = user.toObject ? user.toObject() : user;
  return {
    ...userObj,
    id: userObj._id,
    name: `${userObj.firstName} ${userObj.lastName}`.trim()
  };
};

// Get all clients (users with role='client')
const getAllClients = async (req, res) => {
  try {
    const clients = await User.find({ role: 'client' }).sort({ created_at: 1 });
    res.json(clients.map(mapUserToClient));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
};

// Get client by ID
const getClientById = async (req, res) => {
  const { id } = req.params;
  try {
    const client = await User.findOne({ _id: id, role: 'client' });
    if (!client) return res.status(404).json({ message: "Client not found" });
    res.json(mapUserToClient(client));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
};

// Create new client (inserts into users)
const createClient = async (req, res) => {
  const { name, email, phone, rentals, totalSpent, status, avatarClass, initials } = req.body;
  try {
    const parts = name ? name.split(' ') : ['Unknown'];
    const firstName = parts[0];
    const lastName = parts.slice(1).join(' ') || 'Unknown';
    
    // Default password for clients created by admin
    const defaultPassword = await bcrypt.hash('Client@2025', 10);

    const newUser = new User({
      firstName,
      lastName,
      email,
      phone,
      password: defaultPassword,
      role: 'client',
      rentals: rentals || 0,
      totalSpent: totalSpent || 0,
      status: status || "active",
      avatarClass: avatarClass || "av-teal",
      initials
    });

    await newUser.save();
    res.status(201).json(mapUserToClient(newUser));
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      return res.status(400).json({ message: "User with this email already exists" });
    }
    res.status(500).json({ message: "Database error" });
  }
};

// Update client (updates users table)
const updateClient = async (req, res) => {
  const { id } = req.params;
  const { name, email, phone, rentals, totalSpent, status, avatarClass, initials } = req.body;
  try {
    const parts = name ? name.split(' ') : ['Unknown'];
    const firstName = parts[0];
    const lastName = parts.slice(1).join(' ') || 'Unknown';

    const updatedUser = await User.findOneAndUpdate(
      { _id: id, role: 'client' },
      { 
        firstName, 
        lastName, 
        email, 
        phone, 
        rentals, 
        totalSpent, 
        status, 
        avatarClass, 
        initials 
      },
      { new: true }
    );

    if (!updatedUser) return res.status(404).json({ message: "Client not found" });
    res.json(mapUserToClient(updatedUser));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
};

// Delete client
const deleteClient = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedUser = await User.findOneAndDelete({ _id: id, role: 'client' });
    if (!deletedUser) return res.status(404).json({ message: "Client not found" });
    res.json({ message: "Client deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
};

module.exports = { getAllClients, getClientById, createClient, updateClient, deleteClient };
