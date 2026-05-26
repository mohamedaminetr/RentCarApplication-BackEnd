const pool = require("../db");
const bcrypt = require("bcryptjs");

// Get all clients (users with role='client')
const getAllClients = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT *, ("firstName" || ' ' || "lastName") AS name FROM users WHERE role = 'client' ORDER BY id ASC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
};

// Get client by ID
const getClientById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `SELECT *, ("firstName" || ' ' || "lastName") AS name FROM users WHERE id = $1 AND role = 'client'`,
      [id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: "Client not found" });
    res.json(result.rows[0]);
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

    const result = await pool.query(
      `INSERT INTO users ("firstName", "lastName", email, phone, password, role, rentals, "totalSpent", status, "avatarClass", initials)
       VALUES ($1, $2, $3, $4, $5, 'client', $6, $7, $8, $9, $10) RETURNING *, ("firstName" || ' ' || "lastName") AS name`,
      [firstName, lastName, email, phone, defaultPassword, rentals || 0, totalSpent || 0, status || "active", avatarClass || "av-teal", initials]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    if (err.constraint === "users_email_key") {
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

    const result = await pool.query(
      `UPDATE users 
       SET "firstName"=$1, "lastName"=$2, email=$3, phone=$4, rentals=$5, "totalSpent"=$6, status=$7, "avatarClass"=$8, initials=$9
       WHERE id=$10 AND role='client' RETURNING *, ("firstName" || ' ' || "lastName") AS name`,
      [firstName, lastName, email, phone, rentals, totalSpent, status, avatarClass, initials, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: "Client not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
};

// Delete client
const deleteClient = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("DELETE FROM users WHERE id = $1 AND role = 'client' RETURNING *", [id]);
    if (result.rows.length === 0) return res.status(404).json({ message: "Client not found" });
    res.json({ message: "Client deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
};

module.exports = { getAllClients, getClientById, createClient, updateClient, deleteClient };
