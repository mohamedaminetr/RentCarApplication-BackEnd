const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/booking.controller");
const authenticateToken = require("../middleware/auth.middleware");

// All booking routes are protected
router.use(authenticateToken);

router.get("/", bookingController.getAllBookings);
router.get("/:id", bookingController.getBookingById);
router.post("/", bookingController.createBooking);
router.put("/:id", bookingController.updateBooking);
router.delete("/:id", bookingController.deleteBooking);

module.exports = router;
