const mongoose = require('mongoose');

const batchSchema = new mongoose.Schema(
  {
    medicineId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Medicine',
      required: true,
    },
    batchNumber: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    mfgDate: {
      type: Date,
    },
    expDate: {
      type: Date,
      required: true,
    },
    purchasePrice: {
      type: Number,
      required: true,
      min: 0,
    },
    sellingPrice: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { timestamps: true }
);

// Tránh trùng lặp số lô cho cùng một loại thuốc
batchSchema.index({ medicineId: 1, batchNumber: 1 }, { unique: true });

module.exports = mongoose.model('Batch', batchSchema);
