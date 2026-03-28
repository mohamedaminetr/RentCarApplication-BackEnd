const { Pool } = require("pg");

// Create a connection pool
const pool = new Pool({
  user: "postgres",       // your PostgreSQL user
  host: "localhost",
  database: "rentcar_db", // your database name
  password: "1234",
  port: 5433,
});

module.exports = pool;