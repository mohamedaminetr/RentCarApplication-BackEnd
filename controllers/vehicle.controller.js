const pool = require("../db");

/**
 * Recalculates and persists the utilization % for a given vehicle.
 *
 * Formula:
 *   utilization (%) = (rentedDaysInPeriod / periodDays) × 100
 *
 * Where:
 *   rentedDaysInPeriod = SUM of (returnDate - pickup) in days
 *                        for all Confirmed or Completed bookings
 *                        whose pickup date falls within the last 30 days
 *   periodDays         = 30  (sliding window)
 *
 * Result is clamped between 0 and 100 and rounded to the nearest integer.
 *
 * Example:
 *   A vehicle was booked for two trips: 5 days + 10 days = 15 days rented
 *   utilization = (15 / 30) × 100 = 50%
 */
async function recalculateUtilization(plate) {
  const PERIOD_DAYS = 30;

  const result = await pool.query(
    `SELECT COALESCE(
       SUM(
         GREATEST(
           -- Clamp overlap to [0, PERIOD_DAYS] so out-of-range dates don't skew the result
           LEAST("returnDate"::date, NOW()::date)
           - GREATEST(pickup::date, (NOW() - INTERVAL '${PERIOD_DAYS} days')::date),
           0
         )
       ), 0
     ) AS rented_days
     FROM bookings
     WHERE plate = $1
       AND status IN ('Confirmed', 'Completed')
       AND pickup::date >= (NOW() - INTERVAL '${PERIOD_DAYS} days')::date`,
    [plate]
  );

  const rentedDays   = parseFloat(result.rows[0].rented_days) || 0;
  // utilization = (rentedDays / PERIOD_DAYS) * 100, clamped to [0, 100]
  const utilization  = Math.min(100, Math.round((rentedDays / PERIOD_DAYS) * 100));

  await pool.query(
    `UPDATE vehicles SET utilization = $1 WHERE plate = $2`,
    [utilization, plate]
  );
}

// Get all vehicles
const getAllVehicles = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM vehicles ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
};

// Get vehicle by ID
const getVehicleById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("SELECT * FROM vehicles WHERE id = $1", [id]);
    if (result.rows.length === 0) return res.status(404).json({ message: "Vehicle not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
};

// Create new vehicle
const createVehicle = async (req, res) => {
  const { plate, name, type, year, ratePerDay, mileage, fuel, status, image } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO vehicles (plate, name, type, year, "ratePerDay", mileage, fuel, status, image)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [plate, name, type, year, ratePerDay, mileage, fuel, status || "available", image]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
};

// Update vehicle
const updateVehicle = async (req, res) => {
  const { id } = req.params;
  const { plate, name, type, year, ratePerDay, mileage, fuel, status, image } = req.body;
  try {
    const result = await pool.query(
      `UPDATE vehicles 
       SET plate=$1, name=$2, type=$3, year=$4, "ratePerDay"=$5, mileage=$6, fuel=$7, status=$8, image=$9
       WHERE id=$10 RETURNING *`,
      [plate, name, type, year, ratePerDay, mileage, fuel, status, image, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: "Vehicle not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
};

// Delete vehicle
const deleteVehicle = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("DELETE FROM vehicles WHERE id = $1 RETURNING *", [id]);
    if (result.rows.length === 0) return res.status(404).json({ message: "Vehicle not found" });
    res.json({ message: "Vehicle deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
};

module.exports = { getAllVehicles, getVehicleById, createVehicle, updateVehicle, deleteVehicle };
