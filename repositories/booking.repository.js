const Booking = require("../models/booking.model");
const mongoose = require("mongoose");

class BookingRepository {
  async getAll() {
    return await Booking.find().sort({ created_at: 1 });
  }

  async getById(id) {
    if (id.length === 24) {
      return await Booking.findById(id);
    }
    return await Booking.findOne({ bookingId: id });
  }

  async getByBookingId(bookingId) {
    return await Booking.findOne({ bookingId });
  }

  async checkOverlap(plate, pickup, returnDate) {
    // Overlap condition in MongoDB
    // (StartA <= EndB) and (EndA >= StartB)
    const overlappingBooking = await Booking.findOne({
      plate,
      status: { $in: ["Pending", "Approved", "Active"] },
      $nor: [{ returnDate: { $lte: pickup } }, { pickup: { $gte: returnDate } }],
    });
    return !!overlappingBooking;
  }

  async create(bookingData, session) {
    const options = session ? { session } : {};
    const booking = new Booking(bookingData);
    const result = await booking.save(options);
    return result;
  }

  async update(id, bookingData, session) {
    const options = { new: true };
    if (session) options.session = session;

    if (id.length === 24) {
      return await Booking.findByIdAndUpdate(id, bookingData, options);
    }
    return await Booking.findOneAndUpdate({ bookingId: id }, bookingData, options);
  }

  async delete(id) {
    if (id.length === 24) {
      return await Booking.findByIdAndDelete(id);
    }
    return await Booking.findOneAndDelete({ bookingId: id });
  }

  async updateStatus(id, status, session) {
    const options = { new: true };
    if (session) options.session = session;

    if (id.length === 24) {
      return await Booking.findByIdAndUpdate(id, { status }, options);
    }
    return await Booking.findOneAndUpdate({ bookingId: id }, { status }, options);
  }

  async getBookingsByPlateInLast30Days(plate) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return await Booking.find({
      plate,
      status: { $in: ["Approved", "Active", "Completed"] },
      created_at: { $gte: thirtyDaysAgo },
    });
  }

  // Transaction helper for MongoDB
  async withTransaction(callback) {
    // Check if we are running on a replica set (required for transactions)
    const isReplicaSet = mongoose.connection.getClient().topology?.description?.type !== 'Single';

    if (!isReplicaSet) {
      console.warn("⚠️ Standalone MongoDB detected. Transactions are disabled. For atomicity, use a Replica Set.");
      return await callback(null);
    }

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const result = await callback(session);
      await session.commitTransaction();
      return result;
    } catch (e) {
      await session.abortTransaction();
      throw e;
    } finally {
      session.endSession();
    }
  }
}

module.exports = new BookingRepository();
