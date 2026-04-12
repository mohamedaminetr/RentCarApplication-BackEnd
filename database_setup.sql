-- SQL Setup for RentCar Application

-- 1. Users Table (for Authentication - Admins/Staff)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    "firstName" VARCHAR(100),
    "lastName" VARCHAR(100),
    age INTEGER,
    sexe VARCHAR(10),
    birthday DATE,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20) UNIQUE,
    role VARCHAR(20) DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Clients Table
CREATE TABLE IF NOT EXISTS clients (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    rentals INTEGER DEFAULT 0,
    "totalSpent" DECIMAL(10, 2) DEFAULT 0,
    status VARCHAR(20) CHECK (status IN ('vip', 'active', 'inactive')) DEFAULT 'active',
    "avatarClass" VARCHAR(50) DEFAULT 'av-teal',
    initials VARCHAR(5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Vehicles (Fleet) Table
CREATE TABLE IF NOT EXISTS vehicles (
    id SERIAL PRIMARY KEY,
    plate VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50),
    year INTEGER,
    "ratePerDay" DECIMAL(10, 2),
    mileage INTEGER,
    fuel VARCHAR(20),
    status VARCHAR(20) CHECK (status IN ('available', 'rented', 'service')) DEFAULT 'available',
    utilization INTEGER DEFAULT 0,
    image TEXT,
    "returnDate" VARCHAR(50),
    "readyDate" VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    "bookingId" VARCHAR(20) UNIQUE NOT NULL,
    "clientName" VARCHAR(100) NOT NULL,
    "vehicleName" VARCHAR(100) NOT NULL,
    plate VARCHAR(20) REFERENCES vehicles(plate) ON UPDATE CASCADE,
    pickup VARCHAR(50),
    "returnDate" VARCHAR(50),
    status VARCHAR(20) CHECK (status IN ('Pending', 'Confirmed', 'Completed', 'Cancelled')) DEFAULT 'Pending',
    amount VARCHAR(20),
    initials VARCHAR(5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
