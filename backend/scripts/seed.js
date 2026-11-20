const mongoose = require('mongoose');
const User = require('../models/User');
const Medicine = require('../models/Medicine');
const Batch = require('../models/Batch');
const Bill = require('../models/Bill');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/pharmacy_system';

const seedData = async () => {
  try {
    console.log('Đang kết nối database để seed...');
    await mongoose.connect(MONGO_URI);
    console.log('Kết nối thành công! Đang xóa dữ liệu cũ...');

    // Clear existing data
    await User.deleteMany({});
    await Medicine.deleteMany({});
    await Batch.deleteMany({});
    await Bill.deleteMany({});

    console.log('Đang tạo người dùng mẫu...');
    // Create Users (password is automatically hashed by model pre-save hook)
    const manager = await User.create({
      email: 'manager@pharmacy.com',
      password: 'password123',
      fullName: 'Phạm Hồng Kim Hà (Manager)',
      role: 'MANAGER',
    });

    const pharmacist = await User.create({
      email: 'pharmacist@pharmacy.com',
      password: 'password123',
      fullName: 'Nguyễn Văn A (Pharmacist)',
      role: 'PHARMACIST',
    });

    console.log('Đang tạo danh mục thuốc...');
    // Create Medicines
    const med1 = await Medicine.create({
      name: 'Panadol Extra',
      activeIngredient: 'Paracetamol 500mg, Caffeine 65mg',
      category: 'Giảm đau & Hạ sốt',
      unit: 'Viên',
      minStockLevel: 100,
    });

    const med2 = await Medicine.create({
      name: 'Amoxicillin 500mg',
      activeIngredient: 'Amoxicillin Trihydrate 500mg',
      category: 'Thuốc kháng sinh',
      unit: 'Viên',
      minStockLevel: 150,
    });

    const med3 = await Medicine.create({
      name: 'Telfast BD 60mg',
      activeIngredient: 'Fexofenadine HCl 60mg',
      category: 'Thuốc kháng dị ứng',
      unit: 'Viên',
      minStockLevel: 50,
    });

    const med4 = await Medicine.create({
      name: 'Glucophage 850mg',
      activeIngredient: 'Metformin Hydrochloride 850mg',
      category: 'Thuốc trị tiểu đường',
      unit: 'Viên',
      minStockLevel: 80,
    });

    const med5 = await Medicine.create({
      name: 'Lipitor 10mg',
      activeIngredient: 'Atorvastatin Calcium 10mg',
      category: 'Thuốc trị mỡ máu',
      unit: 'Viên',
      minStockLevel: 40,
    });

    console.log('Đang tạo các lô thuốc (Batches) bao gồm lô mới, lô cận hạn và lô hết hạn...');
    // Define dates helper
    const now = new Date();
    
    // Expired dates (1 year ago)
    const exp1Y = new Date();
    exp1Y.setFullYear(now.getFullYear() - 1);
    
    // Near expiry dates (1 month from now)
    const expNear = new Date();
    expNear.setMonth(now.getMonth() + 1);

    // Far expiry dates (2 years from now)
    const expFar = new Date();
    expFar.setFullYear(now.getFullYear() + 2);

    // Batches for Panadol (med1)
    await Batch.create([
      {
        medicineId: med1._id,
        batchNumber: 'PANA-2401',
        quantity: 200,
        mfgDate: new Date(now.getFullYear() - 1, 0, 1),
        expDate: expFar,
        purchasePrice: 1200,
        sellingPrice: 1800,
      },
      {
        medicineId: med1._id,
        batchNumber: 'PANA-2311',
        quantity: 80,
        mfgDate: new Date(now.getFullYear() - 1, 10, 1),
        expDate: expNear, // Cận hạn
        purchasePrice: 1100,
        sellingPrice: 1700,
      }
    ]);

    // Batches for Amoxicillin (med2)
    await Batch.create([
      {
        medicineId: med2._id,
        batchNumber: 'AMOX-2402',
        quantity: 500,
        mfgDate: new Date(now.getFullYear() - 1, 1, 15),
        expDate: expFar,
        purchasePrice: 1500,
        sellingPrice: 2200,
      },
      {
        medicineId: med2._id,
        batchNumber: 'AMOX-2209',
        quantity: 20,
        mfgDate: new Date(now.getFullYear() - 3, 8, 1),
        expDate: exp1Y, // Đã hết hạn
        purchasePrice: 1300,
        sellingPrice: 2000,
      }
    ]);

    // Batches for Telfast (med3)
    await Batch.create([
      {
        medicineId: med3._id,
        batchNumber: 'TELF-2403',
        quantity: 120,
        mfgDate: new Date(now.getFullYear() - 1, 2, 20),
        expDate: expFar,
        purchasePrice: 3200,
        sellingPrice: 4500,
      }
    ]);

    // Batches for Glucophage (med4)
    await Batch.create([
      {
        medicineId: med4._id,
        batchNumber: 'GLUC-2305',
        quantity: 30, // Tồn ít để báo low stock
        mfgDate: new Date(now.getFullYear() - 1, 4, 10),
        expDate: expFar,
        purchasePrice: 2800,
        sellingPrice: 4000,
      }
    ]);

    // Batches for Lipitor (med5)
    await Batch.create([
      {
        medicineId: med5._id,
        batchNumber: 'LIPI-2404',
        quantity: 150,
        mfgDate: new Date(now.getFullYear() - 1, 3, 5),
        expDate: expFar,
        purchasePrice: 8500,
        sellingPrice: 12000,
      },
      {
        medicineId: med5._id,
        batchNumber: 'LIPI-2301',
        quantity: 50,
        mfgDate: new Date(now.getFullYear() - 1, 0, 5),
        expDate: expNear, // Cận hạn
        purchasePrice: 8000,
        sellingPrice: 11000,
      }
    ]);

    console.log('Đang tạo các hóa đơn bán thuốc mẫu để hiển thị biểu đồ...');
    // Create Bills
    // Bill 1 (Today)
    const bill1 = await Bill.create({
      billNumber: 'HD-202608010001',
      items: [
        {
          medicineId: med1._id,
          batchId: await Batch.findOne({ batchNumber: 'PANA-2401' }),
          quantity: 20,
          price: 1800,
        },
        {
          medicineId: med3._id,
          batchId: await Batch.findOne({ batchNumber: 'TELF-2403' }),
          quantity: 10,
          price: 4500,
        }
      ],
      totalAmount: 20 * 1800 + 10 * 4500,
      discountAmount: 1000,
      netAmount: 20 * 1800 + 10 * 4500 - 1000,
      paymentMethod: 'CASH',
      customerName: 'Nguyễn Văn B',
      pharmacistName: 'Nguyễn Văn A (Pharmacist)',
      createdAt: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 30),
    });

    // Bill 2 (Yesterday)
    const bill2 = await Bill.create({
      billNumber: 'HD-202607310002',
      items: [
        {
          medicineId: med5._id,
          batchId: await Batch.findOne({ batchNumber: 'LIPI-2404' }),
          quantity: 5,
          price: 12000,
        }
      ],
      totalAmount: 5 * 12000,
      discountAmount: 0,
      netAmount: 5 * 12000,
      paymentMethod: 'TRANSFER',
      customerName: 'Lê Văn C',
      pharmacistName: 'Nguyễn Văn A (Pharmacist)',
      createdAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 14, 15),
    });

    // Bill 3 (2 months ago)
    const bill3 = await Bill.create({
      billNumber: 'HD-202606150003',
      items: [
        {
          medicineId: med2._id,
          batchId: await Batch.findOne({ batchNumber: 'AMOX-2402' }),
          quantity: 30,
          price: 2200,
        }
      ],
      totalAmount: 30 * 2200,
      discountAmount: 2000,
      netAmount: 30 * 2200 - 2000,
      paymentMethod: 'CARD',
      customerName: 'Phạm Thị D',
      pharmacistName: 'Phạm Hồng Kim Hà (Manager)',
      createdAt: new Date(now.getFullYear(), now.getMonth() - 2, 15, 10, 0),
    });

    console.log('Seed dữ liệu nhà thuốc hoàn tất thành công!');
    mongoose.connection.close();
  } catch (error) {
    console.error('Lỗi khi seed dữ liệu:', error);
    mongoose.connection.close();
  }
};

seedData();
