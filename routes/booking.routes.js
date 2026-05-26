const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/booking.controller");
const authenticateToken = require("../middleware/auth.middleware");
const checkRole = require("../middleware/role.middleware");

// All booking routes are protected
router.use(authenticateToken);

// Admin can see all, client should only see their own (logic handled in service/repo if needed, but for now keeping it simple)
router.get("/", bookingController.getAllBookings);
router.get("/:id", bookingController.getBookingById);

// Clients and Admins can create reservations
router.post("/", checkRole(["client", "admin", "superAdmin"]), bookingController.createBooking);

// Status update routes
// Only Admins can approve/start/complete
router.put("/:id/approve", checkRole(["admin", "superAdmin"]), bookingController.approveBooking);
router.put("/:id/start", checkRole(["admin", "superAdmin"]), bookingController.startBooking);
router.put("/:id/complete", checkRole(["admin", "superAdmin"]), bookingController.completeBooking);

// Both can cancel (Client can cancel their own, Admin can cancel any)
router.put(
  "/:id/cancel",
  checkRole(["client", "admin", "superAdmin"]),
  bookingController.cancelBooking,
);

// Only Admins can delete
router.delete("/:id", checkRole(["admin", "superAdmin"]), bookingController.deleteBooking);

module.exports = router;
