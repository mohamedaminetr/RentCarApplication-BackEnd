const vehicleRepository = require("../repositories/vehicle.repository");
const bookingRepository = require("../repositories/booking.repository");

class VehicleService {
  async getAllVehicles() {
    return await vehicleRepository.getAll();
  }

  async getVehicleById(id) {
    return await vehicleRepository.getById(id);
  }

  async createVehicle(vehicleData) {
    return await vehicleRepository.create(vehicleData);
  }

  async updateVehicle(id, vehicleData) {
    return await vehicleRepository.update(id, vehicleData);
  }

  async deleteVehicle(id) {
    return await vehicleRepository.delete(id);
  }

  async recalculateUtilization(plate) {
    const PERIOD_DAYS = 30;
    const bookings = await bookingRepository.getBookingsByPlateInLast30Days(plate);
    
    let rentedDays = 0;
    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - PERIOD_DAYS);

    bookings.forEach(booking => {
      const pickup = new Date(booking.pickup);
      const returnDate = new Date(booking.returnDate);
      
      const start = pickup < thirtyDaysAgo ? thirtyDaysAgo : pickup;
      const end = returnDate > now ? now : returnDate;
      
      if (end > start) {
        const diffTime = Math.abs(end - start);
        const diffDays = diffTime / (1000 * 60 * 60 * 24);
        rentedDays += diffDays;
      }
    });

    const utilization = Math.min(100, Math.round((rentedDays / PERIOD_DAYS) * 100));
    await vehicleRepository.updateUtilization(plate, utilization);
    return utilization;
  }
}

module.exports = new VehicleService();
