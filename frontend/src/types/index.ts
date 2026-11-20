export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'PHARMACIST' | 'MANAGER';
}

export interface Batch {
  _id: string;
  medicineId: string;
  batchNumber: string;
  quantity: number;
  mfgDate?: string;
  expDate: string;
  purchasePrice: number;
  sellingPrice: number;
}

export interface Medicine {
  _id: string;
  name: string;
  activeIngredient: string;
  category: string;
  unit: string;
  minStockLevel: number;
  batches: Batch[];
  totalQuantity: number;
  lowestPrice: number;
  isLowStock: boolean;
  hasExpired: boolean;
  hasNearExpiry: boolean;
}

export interface BillItem {
  medicineId: string;
  batchId: string;
  quantity: number;
  price: number;
  // Bổ sung để hiển thị ở lịch sử hóa đơn
  medicineDetail?: {
    name: string;
    unit: string;
    activeIngredient?: string;
  };
}

export interface Bill {
  _id: string;
  billNumber: string;
  items: BillItem[];
  totalAmount: number;
  discountAmount: number;
  netAmount: number;
  paymentMethod: 'CASH' | 'CARD' | 'TRANSFER';
  customerName: string;
  pharmacistName: string;
  createdAt: string;
}

export interface ChartDataPoint {
  label: string;
  revenue: number;
  profit: number;
}

export interface DashboardStats {
  todaySales: number;
  totalSales: number;
  totalProfit: number;
  totalStockValue: number;
  expiredCount: number;
  nearExpiryCount: number;
  chartData: ChartDataPoint[];
}
