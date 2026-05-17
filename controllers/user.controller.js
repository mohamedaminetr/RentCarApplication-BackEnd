// user.controller.js
const pool = require("../db"); // PostgreSQL connection pool
const User = require("../models/user.model");
// GET all users
const getAllUsers = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM users ORDER BY id ASC");
    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error", error: err.message });
  }
};

// GET user by ID
const getUserById = async (req, res) => {
  const id = req.params.selected_id;
  try {
    const result = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
    if (result.rows.length === 0)
      return res.status(404).json({ message: "User not found" });
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error", error: err.message });
  }
};

const createUser = async (req, res) => {
  // 1️⃣ Destructure request body
  const {
    firstName,
    lastName,
    age,
    sexe,
    birthday,
    email,
    password,
    phone,
    role,
  } = req.body;

  // 2️⃣ Create a new User instance
  const newUser = new User({
    id: null, // PostgreSQL will auto-generate
    firstName,
    lastName,
    age,
    sexe,
    birthday,
    email,
    password,
    phone,
    role,
  });

  // 3️⃣ Validate the user using the model
  const validationError = User.validate(newUser);
  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  try {
    // 4️⃣ Insert into database
    const result = await pool.query(
      `INSERT INTO users ("firstName", "lastName", age, sexe, birthday, email, password, phone, role, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [
        newUser.firstName,
        newUser.lastName,
        newUser.age,
        newUser.sexe,
        newUser.birthday,
        newUser.email,
        newUser.password,
        newUser.phone,
        newUser.role,
        newUser.created_at,
      ],
    );

    // 5️⃣ Return the created user
    res.status(201).json(result.rows[0]);
  } catch (err) {
    // Handle database constraints
    if (err.constraint === "users_fullname_unique") {
      return res
        .status(400)
        .json({ message: "A user with this full name already exists" });
    }
    if (err.constraint === "users_email_key") {
      return res
        .status(400)
        .json({ message: "A user with this email already exists" });
    }
    if (err.constraint === "users_phone_key") {
      return res
        .status(400)
        .json({ message: "A user with this phone already exists" });
    }
    console.error(err);
    res.status(500).json({ message: "Database error", error: err.message });
  }
};

module.exports = { createUser };

// UPDATE user
const updateUser = async (req, res) => {
  const id = req.params.id;
  const { firstName, lastName, age, sexe, birthday, email, password, phone } = req.body;

  try {
    // Fetch existing user to retain password if not provided
    const existingResult = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
    if (existingResult.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    const existingUser = existingResult.rows[0];

    // Determine final password
    let finalPassword = existingUser.password;
    if (password && password.trim() !== '') {
      const bcrypt = require("bcryptjs");
      finalPassword = await bcrypt.hash(password, 10);
    }

    const result = await pool.query(
      `UPDATE users
       SET "firstName"=$1, "lastName"=$2, age=$3, sexe=$4, birthday=$5, email=$6, password=$7, phone=$8
       WHERE id=$9 RETURNING *`,
      [
        firstName || existingUser.firstName,
        lastName || existingUser.lastName,
        age !== undefined ? age : existingUser.age,
        sexe || existingUser.sexe,
        birthday || existingUser.birthday,
        email || existingUser.email,
        finalPassword,
        phone || existingUser.phone,
        id
      ]
    );

    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error", error: err.message });
  }
};

// DELETE user
const deleteUser = async (req, res) => {
  const id = req.params.id;
  try {
    const result = await pool.query(
      "DELETE FROM users WHERE id=$1 RETURNING *",
      [id],
    );
    if (result.rows.length === 0)
      return res.status(404).json({ message: "User not found" });
    res.status(200).json({ message: "User deleted", user: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error", error: err.message });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};
