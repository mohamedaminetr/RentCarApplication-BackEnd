const Vehicle = require("../models/vehicle.model");

class VehicleRepository {
  async getAll() {
    return await Vehicle.find().sort({ created_at: 1 });
  }

  async getById(id) {
    // If id is a MongoDB ObjectId
    if (id.length === 24) {
      return await Vehicle.findById(id);
    }
    // If id is numeric (from previous SQL days), this might need mapping or we just use plate
    return await Vehicle.findOne({ plate: id });
  }

  async getByPlate(plate) {
    return await Vehicle.findOne({ plate });
  }

  async create(vehicleData) {
    const vehicle = new Vehicle(vehicleData);
    return await vehicle.save();
  }

  async update(id, vehicleData) {
    if (id.length === 24) {
      return await Vehicle.findByIdAndUpdate(id, vehicleData, { new: true });
    }
    return await Vehicle.findOneAndUpdate({ plate: id }, vehicleData, { new: true });
  }

  async updateStatus(plate, status, session) {
    const options = session ? { session } : {};
    await Vehicle.findOneAndUpdate({ plate }, { status }, options);
  }

  async delete(id) {
    if (id.length === 24) {
      return await Vehicle.findByIdAndDelete(id);
    }
    return await Vehicle.findOneAndDelete({ plate: id });
  }

  async updateUtilization(plate, utilization) {
    await Vehicle.findOneAndUpdate({ plate }, { utilization });
  }
}

module.exports = new VehicleRepository();
