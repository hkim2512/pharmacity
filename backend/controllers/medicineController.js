const Medicine = require('../models/Medicine');
const Batch = require('../models/Batch');

// Lấy danh sách thuốc kèm thông tin tổng hợp lô hàng
exports.getMedicines = async (req, res) => {
  try {
    const medicines = await Medicine.find().lean();
    const result = [];

    for (let med of medicines) {
      // Tìm các lô của thuốc này
      const batches = await Batch.find({ medicineId: med._id }).lean();
      
      let totalQuantity = 0;
      let hasExpired = false;
      let hasNearExpiry = false; // Hạn dùng dưới 3 tháng
      const now = new Date();
      const threeMonthsLater = new Date();
      threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);

      let lowestPrice = 0;
      if (batches.length > 0) {
        lowestPrice = Math.min(...batches.map(b => b.sellingPrice));
      }

      batches.forEach(b => {
        totalQuantity += b.quantity;
        const expDate = new Date(b.expDate);
        if (expDate <= now) {
          hasExpired = true;
        } else if (expDate <= threeMonthsLater) {
          hasNearExpiry = true;
        }
      });

      result.push({
        ...med,
        batches,
        totalQuantity,
        lowestPrice,
        isLowStock: totalQuantity < med.minStockLevel,
        hasExpired,
        hasNearExpiry,
      });
    }

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy danh sách thuốc', error: error.message });
  }
};

// Thêm định nghĩa thuốc mới
exports.createMedicine = async (req, res) => {
  const { name, activeIngredient, category, unit, minStockLevel } = req.body;
  try {
    const existing = await Medicine.findOne({ name: name.trim() });
    if (existing) {
      return res.status(400).json({ message: 'Tên thuốc đã tồn tại' });
    }
    const medicine = await Medicine.create({
      name: name.trim(),
      activeIngredient: activeIngredient?.trim(),
      category: category.trim(),
      unit: unit.trim(),
      minStockLevel,
    });
    res.status(201).json(medicine);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi thêm thuốc', error: error.message });
  }
};

// Thêm lô hàng mới cho thuốc
exports.addBatch = async (req, res) => {
  const { medicineId } = req.params;
  const { batchNumber, quantity, mfgDate, expDate, purchasePrice, sellingPrice } = req.body;
  try {
    const medicine = await Medicine.findById(medicineId);
    if (!medicine) {
      return res.status(404).json({ message: 'Không tìm thấy thuốc' });
    }
    const batch = await Batch.create({
      medicineId,
      batchNumber: batchNumber.trim().toUpperCase(),
      quantity,
      mfgDate,
      expDate,
      purchasePrice,
      sellingPrice,
    });
    res.status(201).json(batch);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi thêm lô hàng', error: error.message });
  }
};

// Cập nhật thông tin lô thuốc
exports.updateBatch = async (req, res) => {
  const { batchId } = req.params;
  const { quantity, sellingPrice, expDate } = req.body;
  try {
    const batch = await Batch.findById(batchId);
    if (!batch) {
      return res.status(404).json({ message: 'Không tìm thấy lô hàng' });
    }
    if (quantity !== undefined) batch.quantity = quantity;
    if (sellingPrice !== undefined) batch.sellingPrice = sellingPrice;
    if (expDate !== undefined) batch.expDate = expDate;

    await batch.save();
    res.status(200).json(batch);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi cập nhật lô hàng', error: error.message });
  }
};
