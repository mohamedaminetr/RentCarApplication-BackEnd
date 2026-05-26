const User = require("../models/user.model");

class UserRepository {
  async updateStats(clientName, amountChange, rentalChange, session) {
    const options = { new: true };
    if (session) options.session = session;

    const names = clientName.split(" ");
    const firstName = names[0];
    const lastName = names.slice(1).join(" ");

    await User.findOneAndUpdate(
      { firstName, lastName },
      {
        $inc: {
          rentals: rentalChange,
          totalSpent: amountChange,
        },
      },
      options,
    );
  }

  async getAdmins() {
    return await User.find({ role: { $in: ["admin", "superAdmin"] } }, { email: 1 });
  }

  async findByEmail(email) {
    return await User.findOne({ email });
  }

  async create(userData) {
    const user = new User(userData);
    return await user.save();
  }
}

module.exports = new UserRepository();
