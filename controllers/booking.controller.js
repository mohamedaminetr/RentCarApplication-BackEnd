const pool = require("../db");
const { recalculateUtilization } = require("./vehicle.controller");
const nodemailer = require("nodemailer");

// Email Transporter Skeleton (Configured for Gmail as requested)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER || "mohamedamine.trimech@gmail.com",
    pass: process.env.GMAIL_PASS || "uevk mtyw bxjv nopt",
  },
});

// Get all bookings
const getAllBookings = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, "bookingId", "clientName", "vehicleName", plate, pickup, "returnDate", status, amount, initials FROM bookings ORDER BY id ASC`,
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
};

// Get booking by ID
const getBookingById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `SELECT id, "bookingId", "clientName", "vehicleName", plate, pickup, "returnDate", status, amount, initials FROM bookings WHERE id = $1`,
      [id],
    );
    if (result.rows.length === 0) return res.status(404).json({ message: "Booking not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
};

// Create new booking
const createBooking = async (req, res) => {
  const {
    bookingId,
    clientName,
    vehicleName,
    plate,
    pickup,
    returnDate,
    status,
    amount,
    initials,
  } = req.body;
  try {
    // Generate a default bookingId if not provided (e.g. from client app)
    const finalBookingId = bookingId || `RES-${Math.floor(Math.random() * 10000)}`;

    const result = await pool.query(
      `INSERT INTO bookings ("bookingId", "clientName", "vehicleName", plate, pickup, "returnDate", status, amount, initials)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id, "bookingId", "clientName", "vehicleName", plate, pickup, "returnDate", status, amount, initials`,
      [
        finalBookingId,
        clientName,
        vehicleName,
        plate,
        pickup,
        returnDate,
        status || "Pending",
        amount,
        initials,
      ],
    );

    // Update Client Stats in users table
    const numericAmount = parseFloat(String(amount).replace(/[^0-9.-]+/g, "")) || 0;
    await pool.query(
      `UPDATE users SET rentals = rentals + 1, "totalSpent" = "totalSpent" + $1 WHERE ("firstName" || ' ' || "lastName") = $2`,
      [numericAmount, clientName],
    );

    // Recalculate vehicle utilization based on all bookings in the last 30 days
    if (plate) await recalculateUtilization(plate);

    // If it's a pending reservation from a client, notify the admins
    if (!status || status === "Pending") {
      try {
        const admins = await pool.query(
          "SELECT email FROM users WHERE role IN ('admin', 'superAdmin')",
        );
        const adminEmails = admins.rows.map((a) => a.email).join(",");

        if (adminEmails) {
          await transporter.sendMail({
            from: process.env.GMAIL_USER || "YOUR_GMAIL_ADDRESS",
            to: adminEmails,
            subject: `New Reservation Request from ${clientName}`,
            text: `A new booking request has been submitted.\n\nClient: ${clientName}\nVehicle: ${vehicleName}\nPickup Date: ${pickup}\nReturn Date: ${returnDate}\nAmount: ${amount}\n\nPlease log in to the dashboard to accept or reject this reservation.`,
          });
          console.log(`✅ Notification email sent to admins: ${adminEmails}`);
        }
      } catch (emailErr) {
        console.error(
          "❌ Failed to send email notification (Check Gmail API credentials):",
          emailErr.message,
        );
      }
    }

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    if (err.constraint === "bookings_bookingId_key") {
      return res.status(400).json({ message: "Booking ID already exists" });
    }
    res.status(500).json({ message: "Database error" });
  }
};

// Update booking
const updateBooking = async (req, res) => {
  const { id } = req.params;
  const {
    bookingId,
    clientName,
    vehicleName,
    plate,
    pickup,
    returnDate,
    status,
    amount,
    initials,
  } = req.body;
  try {
    const result = await pool.query(
      `UPDATE bookings 
       SET "bookingId"=$1, "clientName"=$2, "vehicleName"=$3, plate=$4, pickup=$5, "returnDate"=$6, status=$7, amount=$8, initials=$9
       WHERE id=$10
       RETURNING id, "bookingId", "clientName", "vehicleName", plate, pickup, "returnDate", status, amount, initials`,
      [bookingId, clientName, vehicleName, plate, pickup, returnDate, status, amount, initials, id],
    );
    if (result.rows.length === 0) return res.status(404).json({ message: "Booking not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
};

// Delete booking
const deleteBooking = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("DELETE FROM bookings WHERE id = $1 RETURNING *", [id]);
    if (result.rows.length === 0) return res.status(404).json({ message: "Booking not found" });

    // Revert Client Stats in users table
    const deletedBooking = result.rows[0];
    const numericAmount = parseFloat(String(deletedBooking.amount).replace(/[^0-9.-]+/g, "")) || 0;
    await pool.query(
      `UPDATE users SET rentals = GREATEST(rentals - 1, 0), "totalSpent" = GREATEST("totalSpent" - $1, 0) WHERE ("firstName" || ' ' || "lastName") = $2`,
      [numericAmount, deletedBooking.clientName],
    );

    // Recalculate vehicle utilization after the booking is removed
    if (deletedBooking.plate) await recalculateUtilization(deletedBooking.plate);

    res.json({ message: "Booking deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
};

module.exports = { getAllBookings, getBookingById, createBooking, updateBooking, deleteBooking };
