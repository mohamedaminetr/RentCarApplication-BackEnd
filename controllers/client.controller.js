const pool = require("../db");

// Get all clients
const getAllClients = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM clients ORDER BY id ASC");
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
    const result = await pool.query("SELECT * FROM clients WHERE id = $1", [id]);
    if (result.rows.length === 0) return res.status(404).json({ message: "Client not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
};

// Create new client
const createClient = async (req, res) => {
  const { name, email, phone, rentals, totalSpent, status, avatarClass, initials } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO clients (name, email, phone, rentals, "totalSpent", status, "avatarClass", initials)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [name, email, phone, rentals || 0, totalSpent || 0, status || "active", avatarClass || "av-teal", initials]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    if (err.constraint === "clients_email_key") {
      return res.status(400).json({ message: "Client with this email already exists" });
    }
    res.status(500).json({ message: "Database error" });
  }
};

// Update client
const updateClient = async (req, res) => {
  const { id } = req.params;
  const { name, email, phone, rentals, totalSpent, status, avatarClass, initials } = req.body;
  try {
    const result = await pool.query(
      `UPDATE clients 
       SET name=$1, email=$2, phone=$3, rentals=$4, "totalSpent"=$5, status=$6, "avatarClass"=$7, initials=$8
       WHERE id=$9 RETURNING *`,
      [name, email, phone, rentals, totalSpent, status, avatarClass, initials, id]
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
    const result = await pool.query("DELETE FROM clients WHERE id = $1 RETURNING *", [id]);
    if (result.rows.length === 0) return res.status(404).json({ message: "Client not found" });
    res.json({ message: "Client deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
};

module.exports = { getAllClients, getClientById, createClient, updateClient, deleteClient };
