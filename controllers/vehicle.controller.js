const vehicleService = require("../services/vehicle.service");

// Helper to map MongoDB _id to id for frontend compatibility
const mapId = (obj) => {
  if (!obj) return obj;
  const result = obj.toObject ? obj.toObject() : { ...obj };
  result.id = result._id;
  return result;
};

const getAllVehicles = async (req, res) => {
  try {
    const vehicles = await vehicleService.getAllVehicles();
    res.json(vehicles.map(mapId));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
};

const getVehicleById = async (req, res) => {
  const { id } = req.params;
  try {
    const vehicle = await vehicleService.getVehicleById(id);
    if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });
    res.json(mapId(vehicle));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
};

const createVehicle = async (req, res) => {
  try {
    const newVehicle = await vehicleService.createVehicle(req.body);
    res.status(201).json(mapId(newVehicle));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
};

const updateVehicle = async (req, res) => {
  const { id } = req.params;
  try {
    const updatedVehicle = await vehicleService.updateVehicle(id, req.body);
    if (!updatedVehicle) return res.status(404).json({ message: "Vehicle not found" });
    res.json(mapId(updatedVehicle));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
};

const deleteVehicle = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await vehicleService.deleteVehicle(id);
    if (!result) return res.status(404).json({ message: "Vehicle not found" });
    res.json({ message: "Vehicle deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
};

const recalculateUtilization = async (plate) => {
  return await vehicleService.recalculateUtilization(plate);
};

module.exports = {
  getAllVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  recalculateUtilization,
};
