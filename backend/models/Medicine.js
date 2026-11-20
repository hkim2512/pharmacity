const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    activeIngredient: {
      type: String,
      trim: true,
      default: '',
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    unit: {
      type: String,
      required: true,
      default: 'Viên', // Viên, Vỉ, Hộp, Chai, Tuýp
    },
    minStockLevel: {
      type: Number,
      required: true,
      default: 50, // Báo động khi số lượng tồn kho tổng dưới mức này
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Medicine', medicineSchema);
