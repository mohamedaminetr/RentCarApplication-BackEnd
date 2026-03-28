class User {
  constructor({ id, firstName, lastName, age, sexe, birthday, email, password, phone, role, created_at=new Date() }) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.age = age;
    this.sexe = sexe;
    this.birthday = birthday;
    this.email = email;
    this.password = password;
    this.phone = phone;
    this.role = role; // "client" or "admin"
    this.created_at = created_at;
  }

  static validate(user) {
    if (!user.firstName || !user.lastName) {
      return "First name and last name are required";
    }

    if (user.age && user.age < 0) {
      return "Age must be positive";
    }

    if (!user.email) {
      return "Email is required";
    }

    if (!user.password) {
      return "Password is required";
    }

    return null;
  }
}

module.exports = User;

