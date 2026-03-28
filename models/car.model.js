class Car {
  constructor({ id, brand, model, year, price_per_day, status = "available", image_url, created_at = new Date() }) {
    this.id = id;
    this.brand = brand;
    this.model = model;
    this.year = year;
    this.price_per_day = price_per_day;
    this.status = status; // "available", "rented", or "maintenance"
    this.image_url = image_url;
    this.created_at = created_at;
  }

  static validate(car) {
    if (!car.brand) {
      return "Brand is required";
    }
    if (!car.model) {
      return "Model is required";
    }
    if (!car.year || car.year < 1886) { // first car invented in 1886
      return "Year is invalid";
    }
    if (!car.price_per_day || car.price_per_day < 0) {
      return "Price per day must be positive";
    }
    if (!["available", "rented", "maintenance"].includes(car.status)) {
      return "Status must be available, rented, or maintenance";
    }
    return null;
  }
}

module.exports = Car;

