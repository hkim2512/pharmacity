const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const medicineRoutes = require('./routes/medicineRoutes');
const saleRoutes = require('./routes/saleRoutes');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/pharmacy_system';

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/sales', saleRoutes);

// Base route
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Pharmacy Management API System is Running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Lỗi hệ thống máy chủ', error: err.message });
});

// Connect to MongoDB & Start Server
console.log('Đang kết nối đến MongoDB...');
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('Kết nối thành công cơ sở dữ liệu MongoDB!');
    app.listen(PORT, () => {
      console.log(`Máy chủ đang chạy trên cổng ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Không thể kết nối đến MongoDB:', err.message);
  });
