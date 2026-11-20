import api from './api';
import { Bill, DashboardStats, Batch, Medicine } from '../types';
import { initMockStorage } from './medicineService';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

// Mock Seed Bills
const MOCK_BILLS = (medicines: Medicine[], batches: Batch[]): Bill[] => {
  const now = new Date();
  const med1 = medicines.find(m => m.name === 'Panadol Extra') || medicines[0];
  const med3 = medicines.find(m => m.name === 'Telfast BD 60mg') || medicines[2];
  const med5 = medicines.find(m => m.name === 'Lipitor 10mg') || medicines[4];

  const bat1 = batches.find(b => b.batchNumber === 'PANA-2401') || batches[0];
  const bat5 = batches.find(b => b.batchNumber === 'TELF-2403') || batches[4];
  const bat7 = batches.find(b => b.batchNumber === 'LIPI-2404') || batches[6];

  return [
    {
      _id: 'bill_01',
      billNumber: 'HD-202608010001',
      items: [
        {
          medicineId: med1._id,
          batchId: bat1._id,
          quantity: 20,
          price: bat1.sellingPrice,
        },
        {
          medicineId: med3._id,
          batchId: bat5._id,
          quantity: 10,
          price: bat5.sellingPrice,
        }
      ],
      totalAmount: 20 * bat1.sellingPrice + 10 * bat5.sellingPrice,
      discountAmount: 1000,
      netAmount: 20 * bat1.sellingPrice + 10 * bat5.sellingPrice - 1000,
      paymentMethod: 'CASH',
      customerName: 'Nguyễn Văn B',
      pharmacistName: 'Nguyễn Văn A (Pharmacist)',
      createdAt: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 30).toISOString(),
    },
    {
      _id: 'bill_02',
      billNumber: 'HD-202607310002',
      items: [
        {
          medicineId: med5._id,
          batchId: bat7._id,
          quantity: 5,
          price: bat7.sellingPrice,
        }
      ],
      totalAmount: 5 * bat7.sellingPrice,
      discountAmount: 0,
      netAmount: 5 * bat7.sellingPrice,
      paymentMethod: 'TRANSFER',
      customerName: 'Lê Văn C',
      pharmacistName: 'Nguyễn Văn A (Pharmacist)',
      createdAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 14, 15).toISOString(),
    },
    {
      _id: 'bill_03',
      billNumber: 'HD-202606150003',
      items: [
        {
          medicineId: medicines[1]._id,
          batchId: batches[2]._id, // AMOX-2402
          quantity: 30,
          price: batches[2].sellingPrice,
        }
      ],
      totalAmount: 30 * batches[2].sellingPrice,
      discountAmount: 2000,
      netAmount: 30 * batches[2].sellingPrice - 2000,
      paymentMethod: 'CARD',
      customerName: 'Phạm Thị D',
      pharmacistName: 'Phạm Hồng Kim Hà (Manager)',
      createdAt: new Date(now.getFullYear(), now.getMonth() - 2, 15, 10, 0).toISOString(),
    }
  ];
};

const initMockBills = () => {
  initMockStorage();
  if (!localStorage.getItem('pharmacy_bills')) {
    const meds = JSON.parse(localStorage.getItem('pharmacy_medicines') || '[]');
    const batches = JSON.parse(localStorage.getItem('pharmacy_batches') || '[]');
    localStorage.setItem('pharmacy_bills', JSON.stringify(MOCK_BILLS(meds, batches)));
  }
};

export const saleService = {
  checkout: async (data: {
    items: { medicineId: string; quantity: number }[];
    discountAmount?: number;
    paymentMethod?: 'CASH' | 'CARD' | 'TRANSFER';
    customerName?: string;
    pharmacistName?: string;
  }): Promise<Bill> => {
    if (USE_MOCK) {
      initMockBills();
      const batches: Batch[] = JSON.parse(localStorage.getItem('pharmacy_batches') || '[]');
      const meds: Medicine[] = JSON.parse(localStorage.getItem('pharmacy_medicines') || '[]');
      const bills = JSON.parse(localStorage.getItem('pharmacy_bills') || '[]');

      const deductedItems = [];
      let totalAmount = 0;
      const now = new Date();

      for (let item of data.items) {
        const { medicineId, quantity: requestedQty } = item;

        // Thuật toán FIFO trên LocalStorage
        const medBatches = batches
          .filter(b => b.medicineId === medicineId && b.quantity > 0 && new Date(b.expDate) > now)
          .sort((a, b) => new Date(a.expDate).getTime() - new Date(b.expDate).getTime());

        const totalAvailable = medBatches.reduce((sum, b) => sum + b.quantity, 0);
        if (totalAvailable < requestedQty) {
          const medName = meds.find(m => m._id === medicineId)?.name || 'Thuốc';
          throw new Error(`Thuốc "${medName}" không đủ số lượng trong kho. Hiện tại chỉ còn ${totalAvailable}.`);
        }

        let remainingToDeduct = requestedQty;
        for (let batch of medBatches) {
          if (remainingToDeduct <= 0) break;

          const batchIdx = batches.findIndex(b => b._id === batch._id);
          const deductQty = Math.min(batches[batchIdx].quantity, remainingToDeduct);
          
          batches[batchIdx].quantity -= deductQty;
          remainingToDeduct -= deductQty;

          deductedItems.push({
            medicineId,
            batchId: batch._id,
            quantity: deductQty,
            price: batch.sellingPrice,
            // Thêm thông số để hiển thị luôn
            medicineDetail: {
              name: meds.find(m => m._id === medicineId)?.name || 'Thuốc',
              unit: meds.find(m => m._id === medicineId)?.unit || 'Viên',
              activeIngredient: meds.find(m => m._id === medicineId)?.activeIngredient || ''
            }
          });

          totalAmount += deductQty * batch.sellingPrice;
        }
      }

      // Lưu lại các lô thuốc mới sau khi trừ số lượng
      localStorage.setItem('pharmacy_batches', JSON.stringify(batches));

      const billNumber = `HD-${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${(bills.length + 1).toString().padStart(4, '0')}`;
      const discount = data.discountAmount || 0;
      const netAmount = Math.max(totalAmount - discount, 0);

      const newBill: Bill = {
        _id: `bill_${Date.now()}`,
        billNumber,
        items: deductedItems,
        totalAmount,
        discountAmount: discount,
        netAmount,
        paymentMethod: data.paymentMethod || 'CASH',
        customerName: data.customerName || 'Khách vãng lai',
        pharmacistName: data.pharmacistName || 'Dựơc sĩ',
        createdAt: now.toISOString()
      };

      bills.unshift(newBill); // Cho lên đầu danh sách
      localStorage.setItem('pharmacy_bills', JSON.stringify(bills));
      return newBill;
    } else {
      const res = await api.post('/sales/checkout', data);
      return res.data;
    }
  },

  getBills: async (): Promise<Bill[]> => {
    if (USE_MOCK) {
      initMockBills();
      const bills = JSON.parse(localStorage.getItem('pharmacy_bills') || '[]');
      return bills;
    } else {
      const res = await api.get('/sales/bills');
      return res.data;
    }
  },

  getSalesStats: async (): Promise<DashboardStats> => {
    if (USE_MOCK) {
      initMockBills();
      const bills: Bill[] = JSON.parse(localStorage.getItem('pharmacy_bills') || '[]');
      const batches: Batch[] = JSON.parse(localStorage.getItem('pharmacy_batches') || '[]');

      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

      let todaySales = 0;
      let totalSales = 0;
      let totalProfit = 0;

      bills.forEach(bill => {
        totalSales += bill.netAmount;
        const billTime = new Date(bill.createdAt).getTime();
        if (billTime >= todayStart) {
          todaySales += bill.netAmount;
        }

        // Tính lợi nhuận trong mock mode
        bill.items.forEach(item => {
          const sellingPrice = item.price;
          const originalBatch = batches.find(b => b._id === item.batchId);
          const purchasePrice = originalBatch ? originalBatch.purchasePrice : (sellingPrice * 0.7);
          totalProfit += (sellingPrice - purchasePrice) * item.quantity;
        });
      });

      // Giá trị tồn kho hiện tại
      let totalStockValue = 0;
      let expiredCount = 0;
      let nearExpiryCount = 0;
      const threeMonthsLaterTime = new Date().setMonth(now.getMonth() + 3);

      batches.forEach(b => {
        totalStockValue += b.quantity * b.purchasePrice;
        const expTime = new Date(b.expDate).getTime();
        if (expTime <= now.getTime()) {
          expiredCount++;
        } else if (expTime <= threeMonthsLaterTime) {
          nearExpiryCount++;
        }
      });

      // Tạo thống kê biểu đồ 6 tháng
      const monthlyData: Record<string, { label: string; revenue: number; profit: number }> = {};
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
            const originalBatch = batches.find(b => b._id === item.batchId);
            const purchase = originalBatch ? originalBatch.purchasePrice : (item.price * 0.7);
            billProfit += (item.price - purchase) * item.quantity;
          });
          monthlyData[key].profit += billProfit;
        }
      });

      return {
        todaySales,
        totalSales,
        totalProfit,
        totalStockValue,
        expiredCount,
        nearExpiryCount,
        chartData: Object.values(monthlyData)
      };
    } else {
      const res = await api.get('/sales/stats');
      return res.data;
    }
  }
};
