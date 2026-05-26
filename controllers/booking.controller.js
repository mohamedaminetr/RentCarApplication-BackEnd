const bookingService = require("../services/booking.service");
const { recalculateUtilization } = require("../services/vehicle.service");

// Helper to map MongoDB _id to id for frontend compatibility
const mapId = (obj) => {
  if (!obj) return obj;
  const result = obj.toObject ? obj.toObject() : { ...obj };
  result.id = result._id;
  return result;
};

const getAllBookings = async (req, res) => {
  try {
    const bookings = await bookingService.getAllBookings();
    res.json(bookings.map(mapId));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
};

const getBookingById = async (req, res) => {
  const { id } = req.params;
  try {
    const booking = await bookingService.getBookingById(id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    res.json(mapId(booking));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
};

const createBooking = async (req, res) => {
  try {
    const newBooking = await bookingService.createReservation(req.body);
    if (newBooking.plate) await recalculateUtilization(newBooking.plate);
    res.status(201).json(mapId(newBooking));
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
};

const approveBooking = async (req, res) => {
  const { id } = req.params;
  try {
    const updatedBooking = await bookingService.approveReservation(id);
    if (updatedBooking.plate) await recalculateUtilization(updatedBooking.plate);
    res.json(mapId(updatedBooking));
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
};

const startBooking = async (req, res) => {
  const { id } = req.params;
  try {
    const updatedBooking = await bookingService.startReservation(id);
    if (updatedBooking.plate) await recalculateUtilization(updatedBooking.plate);
    res.json(mapId(updatedBooking));
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
};

const completeBooking = async (req, res) => {
  const { id } = req.params;
  try {
    const updatedBooking = await bookingService.completeReservation(id);
    if (updatedBooking.plate) await recalculateUtilization(updatedBooking.plate);
    res.json(mapId(updatedBooking));
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
};

const cancelBooking = async (req, res) => {
  const { id } = req.params;
  try {
    const updatedBooking = await bookingService.cancelReservation(id);
    if (updatedBooking.plate) await recalculateUtilization(updatedBooking.plate);
    res.json(mapId(updatedBooking));
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
};

const deleteBooking = async (req, res) => {
  const { id } = req.params;
  try {
    await bookingService.deleteBooking(id);
    res.json({ message: "Booking deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
};

const updateBooking = async (req, res) => {
  const { id } = req.params;
  try {
    const updated = await bookingService.updateBooking(id, req.body);
    res.json(mapId(updated));
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
};

module.exports = {
  getAllBookings,
  getBookingById,
  createBooking,
  approveBooking,
  startBooking,
  completeBooking,
  cancelBooking,
  deleteBooking,
  updateBooking
};
