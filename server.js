// Import dependencies
const express = require('express');
const cors = require('cors');
//middleware for logging http request in app 
const morgan = require('morgan');
//dotenv is used to load environment variables from a .env file into your app
require('dotenv').config();

// Create app
const app = express();

// 🔹 Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// 🔹 Test route
app.get('/', (req, res) => {
  res.json('🚗 Rent Car API is running...');
});

// 🔹 Routes
const userRoutes = require('./routes/user.routes');
const carRoutes = require('./routes/car.routes');


// Use routes
app.use('/users', userRoutes);
app.use('/cars', carRoutes);

// 🔹 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// 🔹 Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong',
    error: err.message,
  });
});

// 🔹 Start server
const PORT = process.env.PORT | 3000 ;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});