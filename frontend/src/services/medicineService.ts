import api from './api';
import { Medicine, Batch } from '../types';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

// Mock Seed Data
const MOCK_MEDICINES: Medicine[] = [
  {
    _id: 'med_01',
    name: 'Panadol Extra',
    activeIngredient: 'Paracetamol 500mg, Caffeine 65mg',
    category: 'Giảm đau & Hạ sốt',
    unit: 'Viên',
    minStockLevel: 100,
    batches: [],
    totalQuantity: 0,
    lowestPrice: 0,
    isLowStock: false,
    hasExpired: false,
    hasNearExpiry: false,
  },
  {
    _id: 'med_02',
    name: 'Amoxicillin 500mg',
    activeIngredient: 'Amoxicillin Trihydrate 500mg',
    category: 'Thuốc kháng sinh',
    unit: 'Viên',
    minStockLevel: 150,
    batches: [],
    totalQuantity: 0,
    lowestPrice: 0,
    isLowStock: false,
    hasExpired: false,
    hasNearExpiry: false,
  },
  {
    _id: 'med_03',
    name: 'Telfast BD 60mg',
    activeIngredient: 'Fexofenadine HCl 60mg',
    category: 'Thuốc kháng dị ứng',
    unit: 'Viên',
    minStockLevel: 50,
    batches: [],
    totalQuantity: 0,
    lowestPrice: 0,
    isLowStock: false,
    hasExpired: false,
    hasNearExpiry: false,
  },
  {
    _id: 'med_04',
    name: 'Glucophage 850mg',
    activeIngredient: 'Metformin Hydrochloride 850mg',
    category: 'Thuốc trị tiểu đường',
    unit: 'Viên',
    minStockLevel: 80,
    batches: [],
    totalQuantity: 0,
    lowestPrice: 0,
    isLowStock: false,
    hasExpired: false,
    hasNearExpiry: false,
  },
  {
    _id: 'med_05',
    name: 'Lipitor 10mg',
    activeIngredient: 'Atorvastatin Calcium 10mg',
    category: 'Thuốc trị mỡ máu',
    unit: 'Viên',
    minStockLevel: 40,
    batches: [],
    totalQuantity: 0,
    lowestPrice: 0,
    isLowStock: false,
    hasExpired: false,
    hasNearExpiry: false,
  },
];

const now = new Date();
const expFar = new Date(now.getFullYear() + 2, now.getMonth(), now.getDate()).toISOString();
const expNear = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate()).toISOString();
const expExpired = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()).toISOString();

const MOCK_BATCHES: Batch[] = [
  // Panadol (med_01)
  {
    _id: 'bat_01',
    medicineId: 'med_01',
    batchNumber: 'PANA-2401',
    quantity: 200,
    mfgDate: new Date(now.getFullYear() - 1, 0, 1).toISOString(),
    expDate: expFar,
    purchasePrice: 1200,
    sellingPrice: 1800,
  },
  {
    _id: 'bat_02',
    medicineId: 'med_01',
    batchNumber: 'PANA-2311',
    quantity: 80,
    mfgDate: new Date(now.getFullYear() - 1, 10, 1).toISOString(),
    expDate: expNear,
    purchasePrice: 1100,
    sellingPrice: 1700,
  },
  // Amoxicillin (med_02)
  {
    _id: 'bat_03',
    medicineId: 'med_02',
    batchNumber: 'AMOX-2402',
    quantity: 500,
    mfgDate: new Date(now.getFullYear() - 1, 1, 15).toISOString(),
    expDate: expFar,
    purchasePrice: 1500,
    sellingPrice: 2200,
  },
  {
    _id: 'bat_04',
    medicineId: 'med_02',
    batchNumber: 'AMOX-2209',
    quantity: 20,
    mfgDate: new Date(now.getFullYear() - 3, 8, 1).toISOString(),
    expDate: expExpired,
    purchasePrice: 1300,
    sellingPrice: 2000,
  },
  // Telfast (med_03)
  {
    _id: 'bat_05',
    medicineId: 'med_03',
    batchNumber: 'TELF-2403',
    quantity: 120,
    mfgDate: new Date(now.getFullYear() - 1, 2, 20).toISOString(),
    expDate: expFar,
    purchasePrice: 3200,
    sellingPrice: 4500,
  },
  // Glucophage (med_04)
  {
    _id: 'bat_06',
    medicineId: 'med_04',
    batchNumber: 'GLUC-2305',
    quantity: 30, // Tồn ít để báo low stock
    mfgDate: new Date(now.getFullYear() - 1, 4, 10).toISOString(),
    expDate: expFar,
    purchasePrice: 2800,
    sellingPrice: 4000,
  },
  // Lipitor (med_05)
  {
    _id: 'bat_07',
    medicineId: 'med_05',
    batchNumber: 'LIPI-2404',
    quantity: 150,
    mfgDate: new Date(now.getFullYear() - 1, 3, 5).toISOString(),
    expDate: expFar,
    purchasePrice: 8500,
    sellingPrice: 12000,
  },
  {
    _id: 'bat_08',
    medicineId: 'med_05',
    batchNumber: 'LIPI-2301',
    quantity: 50,
    mfgDate: new Date(now.getFullYear() - 1, 0, 5).toISOString(),
    expDate: expNear,
    purchasePrice: 8000,
    sellingPrice: 11000,
  },
];

// Khởi tạo LocalStorage cho Mock Mode
export const initMockStorage = () => {
  if (!localStorage.getItem('pharmacy_medicines')) {
    localStorage.setItem('pharmacy_medicines', JSON.stringify(MOCK_MEDICINES));
  }
  if (!localStorage.getItem('pharmacy_batches')) {
    localStorage.setItem('pharmacy_batches', JSON.stringify(MOCK_BATCHES));
  }
};

export const medicineService = {
  getMedicines: async (): Promise<Medicine[]> => {
    if (USE_MOCK) {
      initMockStorage();
      const meds: Medicine[] = JSON.parse(localStorage.getItem('pharmacy_medicines') || '[]');
      const batches: Batch[] = JSON.parse(localStorage.getItem('pharmacy_batches') || '[]');

      const nowTime = new Date().getTime();
      const threeMonthsLater = new Date();
      threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);
      const threeMonthsLaterTime = threeMonthsLater.getTime();

      return meds.map(med => {
        const medBatches = batches.filter(b => b.medicineId === med._id);
        let totalQuantity = 0;
        let lowestPrice = 0;
        let hasExpired = false;
        let hasNearExpiry = false;

        if (medBatches.length > 0) {
          lowestPrice = Math.min(...medBatches.map(b => b.sellingPrice));
        }

        medBatches.forEach(b => {
          totalQuantity += b.quantity;
          const expTime = new Date(b.expDate).getTime();
          if (expTime <= nowTime) {
            hasExpired = true;
          } else if (expTime <= threeMonthsLaterTime) {
            hasNearExpiry = true;
          }
        });

        return {
          ...med,
          batches: medBatches,
          totalQuantity,
          lowestPrice,
          isLowStock: totalQuantity < med.minStockLevel,
          hasExpired,
          hasNearExpiry
        };
      });
    } else {
      const res = await api.get('/medicines');
      return res.data;
    }
  },

  createMedicine: async (data: Omit<Medicine, '_id' | 'batches' | 'totalQuantity' | 'lowestPrice' | 'isLowStock' | 'hasExpired' | 'hasNearExpiry'>): Promise<Medicine> => {
    if (USE_MOCK) {
      initMockStorage();
      const meds = JSON.parse(localStorage.getItem('pharmacy_medicines') || '[]');
      const newMed: Medicine = {
        ...data,
        _id: `med_${Date.now()}`,
        batches: [],
        totalQuantity: 0,
        lowestPrice: 0,
        isLowStock: true,
        hasExpired: false,
        hasNearExpiry: false
      };
      meds.push(newMed);
      localStorage.setItem('pharmacy_medicines', JSON.stringify(meds));
      return newMed;
    } else {
      const res = await api.post('/medicines', data);
      return res.data;
    }
  },

  addBatch: async (medicineId: string, data: Omit<Batch, '_id' | 'medicineId'>): Promise<Batch> => {
    if (USE_MOCK) {
      initMockStorage();
      const batches = JSON.parse(localStorage.getItem('pharmacy_batches') || '[]');
      const newBatch: Batch = {
        ...data,
        _id: `bat_${Date.now()}`,
        medicineId
      };
      batches.push(newBatch);
      localStorage.setItem('pharmacy_batches', JSON.stringify(batches));
      return newBatch;
    } else {
      const res = await api.post(`/medicines/${medicineId}/batches`, data);
      return res.data;
    }
  },

  updateBatch: async (batchId: string, data: Partial<Omit<Batch, '_id' | 'medicineId' | 'batchNumber'>>): Promise<Batch> => {
    if (USE_MOCK) {
      initMockStorage();
      const batches: Batch[] = JSON.parse(localStorage.getItem('pharmacy_batches') || '[]');
      const idx = batches.findIndex(b => b._id === batchId);
      if (idx === -1) throw new Error('Không tìm thấy lô hàng');

      batches[idx] = {
        ...batches[idx],
        ...data
      };
      localStorage.setItem('pharmacy_batches', JSON.stringify(batches));
      return batches[idx];
    } else {
      const res = await api.put(`/medicines/batches/${batchId}`, data);
      return res.data;
    }
  }
};
