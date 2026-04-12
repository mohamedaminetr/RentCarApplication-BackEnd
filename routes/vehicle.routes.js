const express = require("express");
const router = express.Router();
const vehicleController = require("../controllers/vehicle.controller");
const authenticateToken = require("../middleware/auth.middleware");
// All client routes are protected
router.use(authenticateToken);
// Public routes
router.get("/", vehicleController.getAllVehicles);
router.get("/:id", vehicleController.getVehicleById);

// Protected routes
router.post("/", vehicleController.createVehicle);
router.put("/:id", vehicleController.updateVehicle);
router.delete("/:id", vehicleController.deleteVehicle);

module.exports = router;
