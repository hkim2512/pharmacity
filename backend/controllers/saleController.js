const Bill = require('../models/Bill');
const Batch = require('../models/Batch');
const Medicine = require('../models/Medicine');

// API POS Checkout với thuật toán FIFO
exports.checkout = async (req, res) => {
  const { items, discountAmount = 0, paymentMethod = 'CASH', customerName, pharmacistName } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ message: 'Giỏ hàng không được để trống' });
  }

  try {
    const deductedItems = [];
    let totalAmount = 0;
    const now = new Date();

    // 1. Duyệt qua từng loại thuốc trong giỏ hàng để thực hiện trừ kho theo FIFO
    for (let item of items) {
      const { medicineId, quantity: requestedQty } = item;

      // Tìm tất cả lô thuốc khả dụng (còn hạn sử dụng và số lượng > 0), sắp xếp theo hạn sử dụng tăng dần (Lô hết hạn trước bán trước)
      const batches = await Batch.find({
        medicineId,
        quantity: { $gt: 0 },
        expDate: { $gt: now }
      }).sort({ expDate: 1 });

      const totalAvailable = batches.reduce((sum, b) => sum + b.quantity, 0);
      if (totalAvailable < requestedQty) {
        const med = await Medicine.findById(medicineId);
        return res.status(400).json({ 
          message: `Thuốc "${med ? med.name : medicineId}" không đủ số lượng trong kho. Hiện tại chỉ còn ${totalAvailable}.` 
        });
      }

      // Trừ số lượng theo lô (FIFO)
      let remainingToDeduct = requestedQty;
      for (let batch of batches) {
        if (remainingToDeduct <= 0) break;

        const deductQty = Math.min(batch.quantity, remainingToDeduct);
        batch.quantity -= deductQty;
        remainingToDeduct -= deductQty;

        // Lưu thông tin lô đã trừ
        deductedItems.push({
          medicineId,
          batchId: batch._id,
          quantity: deductQty,
          price: batch.sellingPrice
        });

        totalAmount += deductQty * batch.sellingPrice;

        // Lưu thay đổi của lô vào DB
        await batch.save();
      }
    }

    // 2. Tạo mã số hóa đơn ngẫu nhiên duy nhất
    const count = await Bill.countDocuments();
    const billNumber = `HD-${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${(count + 1).toString().padStart(4, '0')}`;

    const netAmount = Math.max(totalAmount - discountAmount, 0);

    // 3. Tạo hóa đơn
    const bill = await Bill.create({
      billNumber,
      items: deductedItems,
      totalAmount,
      discountAmount,
      netAmount,
      paymentMethod,
      customerName,
      pharmacistName: pharmacistName || 'Dược sĩ'
    });

    res.status(201).json(bill);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi thực hiện thanh toán hóa đơn', error: error.message });
  }
};

// Lấy danh sách hóa đơn lịch sử
exports.getBills = async (req, res) => {
  try {
    const bills = await Bill.find()
      .populate('items.medicineId', 'name unit activeIngredient')
      .sort({ createdAt: -1 });
    res.status(200).json(bills);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy lịch sử hóa đơn', error: error.message });
  }
};

// Lấy thống kê báo cáo doanh thu & biểu đồ dashboard
exports.getSalesStats = async (req, res) => {
  try {
    const bills = await Bill.find().populate('items.batchId').lean();
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    let todaySales = 0;
    let totalSales = 0;
    let totalProfit = 0;

    bills.forEach(bill => {
      totalSales += bill.netAmount;
      if (new Date(bill.createdAt) >= todayStart) {
        todaySales += bill.netAmount;
      }

      // Tính lợi nhuận: Lấy giá bán trừ giá nhập từ lô hàng gốc
      bill.items.forEach(item => {
        const sellingPrice = item.price;
        const purchasePrice = item.batchId ? item.batchId.purchasePrice : (sellingPrice * 0.7); // Fallback lợi nhuận 30%
        totalProfit += (sellingPrice - purchasePrice) * item.quantity;
      });
    });

    // Thống kê giá trị kho hàng hiện tại
    const activeBatches = await Batch.find().lean();
    let totalStockValue = 0;
    let expiredCount = 0;
    let nearExpiryCount = 0;
    const threeMonthsLater = new Date();
    threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);

    activeBatches.forEach(b => {
      totalStockValue += b.quantity * b.purchasePrice;
      const expDate = new Date(b.expDate);
      if (expDate <= now) {
        expiredCount++;
      } else if (expDate <= threeMonthsLater) {
        nearExpiryCount++;
      }
    });

    // Tổng hợp doanh số theo tháng (6 tháng gần nhất) để vẽ biểu đồ
    const monthlyData = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
      const label = `Tháng ${d.getMonth() + 1}/${d.getFullYear().toString().slice(-2)}`;
      monthlyData[key] = { label, revenue: 0, profit: 0 };
    }

    bills.forEach(bill => {
      const date = new Date(bill.createdAt);
      const key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      if (monthlyData[key]) {
        monthlyData[key].revenue += bill.netAmount;
        
        let billProfit = 0;
        bill.items.forEach(item => {
          const purchase = item.batchId ? item.batchId.purchasePrice : (item.price * 0.7);
          billProfit += (item.price - purchase) * item.quantity;
        });
        monthlyData[key].profit += billProfit;
      }
    });

    const chartData = Object.values(monthlyData);

    res.status(200).json({
      todaySales,
      totalSales,
      totalProfit,
      totalStockValue,
      expiredCount,
      nearExpiryCount,
      chartData
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy thống kê báo cáo', error: error.message });
  }
};
