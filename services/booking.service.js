const bookingRepository = require("../repositories/booking.repository");
const vehicleRepository = require("../repositories/vehicle.repository");
const userRepository = require("../repositories/user.repository");
const Booking = require("../models/booking.model");
const nodemailer = require("nodemailer");

// Email Transporter (Configured for Gmail)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER || "mohamedamine.trimech@gmail.com",
    pass: process.env.GMAIL_PASS || "uevk mtyw bxjv nopt",
  },
});

class BookingService {
  async getAllBookings() {
    return await bookingRepository.getAll();
  }

  async getBookingById(id) {
    return await bookingRepository.getById(id);
  }

  async createReservation(bookingData) {
    const { plate, pickup, returnDate, clientName } = bookingData;

    // 1. Validate dates
    const pickupDate = new Date(pickup);
    const returnDateObj = new Date(returnDate);
    const now = new Date();

    if (pickupDate < now && pickupDate.toDateString() !== now.toDateString()) {
      throw new Error("Pickup date cannot be in the past");
    }
    if (returnDateObj <= pickupDate) {
      throw new Error("Return date must be after pickup date");
    }

    // 2. Calculate total price
    const vehicle = await vehicleRepository.getByPlate(plate);
    if (!vehicle) throw new Error("Vehicle not found");

    const diffTime = Math.abs(returnDateObj - pickupDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
    const totalAmount = diffDays * vehicle.ratePerDay;

    bookingData.amount = totalAmount;
    bookingData.vehicleName = vehicle.name;
    bookingData.bookingId = bookingData.bookingId || `RES-${Math.floor(Math.random() * 100000)}`;

    // 3. Check availability & Create with Transaction
    return await bookingRepository.withTransaction(async (client) => {
      const isOverlapping = await bookingRepository.checkOverlap(plate, pickup, returnDate);
      if (isOverlapping) {
        throw new Error("Car is already booked for these dates");
      }

      // Create booking as Pending
      const newBooking = await bookingRepository.create(
        { ...bookingData, status: "Pending" },
        client,
      );

      // Update user stats
      await userRepository.updateStats(clientName, totalAmount, 1);

      // Notify admins
      this.notifyAdmins(newBooking);

      return newBooking;
    });
  }

  async approveReservation(id) {
    return await bookingRepository.withTransaction(async (client) => {
      const booking = await bookingRepository.getById(id);
      if (!booking) throw new Error("Booking not found");
      if (booking.status !== "Pending")
        throw new Error("Only pending reservations can be approved");

      // Update booking status to Approved
      const updatedBooking = await bookingRepository.updateStatus(id, "Approved", client);

      // Update vehicle status to Reserved
      await vehicleRepository.updateStatus(booking.plate, "Reserved", client);

      return updatedBooking;
    });
  }

  async startReservation(id) {
    return await bookingRepository.withTransaction(async (client) => {
      const booking = await bookingRepository.getById(id);
      if (!booking) throw new Error("Booking not found");
      if (booking.status !== "Approved")
        throw new Error("Only approved reservations can be started");

      // Update booking status to Active
      const updatedBooking = await bookingRepository.updateStatus(id, "Active", client);

      // Update vehicle status to Rented
      await vehicleRepository.updateStatus(booking.plate, "Rented", client);

      return updatedBooking;
    });
  }

  async completeReservation(id) {
    return await bookingRepository.withTransaction(async (client) => {
      const booking = await bookingRepository.getById(id);
      if (!booking) throw new Error("Booking not found");
      if (booking.status !== "Active") throw new Error("Only active reservations can be completed");

      // Update booking status to Completed
      const updatedBooking = await bookingRepository.updateStatus(id, "Completed", client);

      // Update vehicle status to Available
      await vehicleRepository.updateStatus(booking.plate, "Available", client);

      return updatedBooking;
    });
  }

  async cancelReservation(id) {
    return await bookingRepository.withTransaction(async (client) => {
      const booking = await bookingRepository.getById(id);
      if (!booking) throw new Error("Booking not found");
      if (["Completed", "Canceled"].includes(booking.status)) {
        throw new Error("Cannot cancel a completed or already canceled reservation");
      }

      // Update booking status to Canceled
      const updatedBooking = await bookingRepository.updateStatus(id, "Canceled", client);

      // Update vehicle status back to Available
      await vehicleRepository.updateStatus(booking.plate, "Available", client);

      // Revert user stats
      await userRepository.updateStats(booking.clientName, -parseFloat(booking.amount), -1);

      return updatedBooking;
    });
  }

  async notifyAdmins(booking) {
    try {
      const admins = await userRepository.getAdmins();
      const adminEmails = admins.map((a) => a.email).join(",");

      if (adminEmails) {
        await transporter.sendMail({
          from: process.env.GMAIL_USER || "YOUR_GMAIL_ADDRESS",
          to: adminEmails,
          subject: `New Reservation Request: ${booking.bookingId}`,
          text: `A new booking request has been submitted.\n\nClient: ${booking.clientName}\nVehicle: ${booking.vehicleName}\nPickup Date: ${booking.pickup}\nReturn Date: ${booking.returnDate}\nAmount: ${booking.amount}\n\nPlease log in to the dashboard to manage this reservation.`,
        });
      }
    } catch (emailErr) {
      console.error("❌ Email notification failed:", emailErr.message);
    }
  }

  async deleteBooking(id) {
    const booking = await bookingRepository.getById(id);
    if (!booking) throw new Error("Booking not found");

    const result = await bookingRepository.delete(id);

    // If deleted booking was active or approved, make car available
    if (["Approved", "Active"].includes(booking.status)) {
      await vehicleRepository.updateStatus(booking.plate, "Available");
    }

    // Revert user stats
    await userRepository.updateStats(booking.clientName, -parseFloat(booking.amount), -1);

    return result;
  }

  async updateBooking(id, bookingData) {
    return await bookingRepository.update(id, bookingData);
  }

  async checkExpiredReservations() {
    const EXPIRATION_MINUTES = 30;
    const now = new Date();
    const expirationTime = new Date(now.getTime() - EXPIRATION_MINUTES * 60000);

    // Find all Pending bookings created before expirationTime
    const expiredBookings = await Booking.find({
      status: "Pending",
      created_at: { $lt: expirationTime },
    });

    for (const booking of expiredBookings) {
      console.log(`Expiring reservation ${booking._id}...`);
      try {
        await bookingRepository.withTransaction(async (session) => {
          await bookingRepository.updateStatus(booking._id, "Expired", session);
        });
      } catch (err) {
        console.error(`Failed to expire reservation ${booking._id}:`, err.message);
      }
    }
  }
}

module.exports = new BookingService();
