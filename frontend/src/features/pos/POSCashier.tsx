import React, { useEffect, useState } from 'react';
import { Search, ShoppingCart, User, Plus, Minus, Trash2, Printer, CheckCircle, Percent } from 'lucide-react';
import { medicineService } from '../../services/medicineService';
import { saleService } from '../../services/saleService';
import { authService } from '../../services/authService';
import { Medicine, Bill } from '../../types';
import { formatPrice } from '../../utils/format';

interface CartItem {
  medicine: Medicine;
  quantity: number;
}

export default function POSCashier() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discount, setDiscount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD' | 'TRANSFER'>('CASH');
  const [customerName, setCustomerName] = useState('Khách vãng lai');
  const [loading, setLoading] = useState(false);
  const [checkoutSuccessBill, setCheckoutSuccessBill] = useState<Bill | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const currentUser = authService.getCurrentUser();

  const fetchMedicines = async () => {
    try {
      const data = await medicineService.getMedicines();
      setMedicines(data);
    } catch (err) {
      console.error('Không thể lấy danh sách thuốc', err);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  // Filter medicines by search query (name or active ingredient)
  const filteredMedicines = medicines.filter(
    (med) =>
      med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      med.activeIngredient.toLowerCase().includes(searchQuery.toLowerCase()) ||
      med.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addToCart = (med: Medicine) => {
    // Không cho bán thuốc đã hết hàng hoàn toàn
    if (med.totalQuantity <= 0) {
      alert(`Thuốc "${med.name}" đã hết hàng trong kho!`);
      return;
    }

    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.medicine._id === med._id);
      if (existing) {
        // Kiểm tra xem số lượng mua có vượt quá số lượng tồn kho hay không
        if (existing.quantity + 1 > med.totalQuantity) {
          alert(`Không thể thêm. Chỉ còn tồn kho ${med.totalQuantity} đơn vị.`);
          return prevCart;
        }
        return prevCart.map((item) =>
          item.medicine._id === med._id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        return [...prevCart, { medicine: med, quantity: 1 }];
      }
    });
  };

  const updateCartQty = (medId: string, delta: number) => {
    setCart((prevCart) => {
      return prevCart
        .map((item) => {
          if (item.medicine._id === medId) {
            const newQty = item.quantity + delta;
            if (newQty > item.medicine.totalQuantity) {
              alert(`Chỉ còn tồn kho tối đa ${item.medicine.totalQuantity} đơn vị.`);
              return item;
            }
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter((item) => item.quantity > 0);
    });
  };

  const removeFromCart = (medId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.medicine._id !== medId));
  };

  // Calculate cart costs
  const totalAmount = cart.reduce((sum, item) => sum + item.quantity * item.medicine.lowestPrice, 0);
  const netAmount = Math.max(totalAmount - discount, 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    try {
      setLoading(true);
      setErrorMessage('');

      const checkoutItems = cart.map((item) => ({
        medicineId: item.medicine._id,
        quantity: item.quantity,
      }));

      const bill = await saleService.checkout({
        items: checkoutItems,
        discountAmount: discount,
        paymentMethod,
        customerName: customerName || 'Khách vãng lai',
        pharmacistName: currentUser?.fullName || 'Dược sĩ',
      });

      // Show receipt modal
      setCheckoutSuccessBill(bill);
      // Reset POS state
      setCart([]);
      setDiscount(0);
      setCustomerName('Khách vãng lai');
      // Refresh inventory in POS
      fetchMedicines();
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.response?.data?.message || err.message || 'Lỗi khi thanh toán');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="h-full flex flex-col gap-6">
      {/* Title */}
      <div className="flex justify-between items-center shrink-0">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 leading-none">Quầy xuất hóa đơn bán thuốc</h2>
          <p className="text-sm text-slate-500 mt-1">Tìm kiếm thuốc nhanh và thanh toán tự động theo lô hàng hạn gần trước (FIFO).</p>
        </div>
      </div>

      {errorMessage && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl text-sm font-semibold shrink-0">
          ⚠️ {errorMessage}
        </div>
      )}

      {/* POS Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-0">
        {/* Left Side: Medicine selection list (8 cols) */}
        <div className="lg:col-span-7 flex flex-col min-h-0 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          {/* Search bar */}
          <div className="relative mb-6">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm thuốc theo tên, hoạt chất chính hoặc danh mục..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
            />
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto pr-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredMedicines.map((med) => {
                const isOutOfStock = med.totalQuantity <= 0;
                return (
                  <button
                    key={med._id}
                    disabled={isOutOfStock}
                    onClick={() => addToCart(med)}
                    className={`text-left p-4 rounded-xl border border-slate-200 hover:border-emerald-500 hover:shadow-md hover:shadow-emerald-500/5 transition-all flex flex-col justify-between h-36 ${
                      isOutOfStock ? 'opacity-50 cursor-not-allowed bg-slate-50' : 'bg-white'
                    }`}
                  >
                    <div className="space-y-1 w-full">
                      <div className="flex justify-between items-start gap-1 w-full">
                        <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                          {med.category}
                        </span>
                        {med.isLowStock && !isOutOfStock && (
                          <span className="text-[10px] text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded font-bold">
                            Tồn ít
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-extrabold text-slate-800 line-clamp-1">{med.name}</h4>
                      <p className="text-[10px] text-slate-500 truncate leading-none">
                        Hoạt chất: {med.activeIngredient || 'N/A'}
                      </p>
                    </div>

                    <div className="flex justify-between items-end w-full border-t border-slate-100 pt-2.5">
                      <div>
                        <p className="text-[10px] text-slate-400 leading-none">Đơn giá bán</p>
                        <p className="text-sm font-black text-emerald-600 mt-1">{formatPrice(med.lowestPrice)}</p>
                      </div>
                      <span
                        className={`text-xs font-extrabold px-2 py-1 rounded-lg ${
                          isOutOfStock ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {isOutOfStock ? 'Hết hàng' : `Kho: ${med.totalQuantity} ${med.unit}`}
                      </span>
                    </div>
                  </button>
                );
              })}

              {filteredMedicines.length === 0 && (
                <div className="col-span-2 text-center py-12 text-slate-400 font-semibold">
                  Không tìm thấy loại thuốc nào phù hợp.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Bill Cart details (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col min-h-0">
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 pb-4 border-b border-slate-100 shrink-0">
            <ShoppingCart className="w-5 h-5 text-emerald-500" />
            Giỏ hàng bán lẻ ({cart.length})
          </h3>

          {/* Cart item list */}
          <div className="flex-1 overflow-y-auto py-4 space-y-4 min-h-0">
            {cart.map((item) => (
              <div key={item.medicine._id} className="flex items-center justify-between gap-3 bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-bold text-slate-800 truncate leading-snug">{item.medicine.name}</h4>
                  <p className="text-xs text-emerald-600 font-extrabold mt-0.5">{formatPrice(item.medicine.lowestPrice)}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateCartQty(item.medicine._id, -1)}
                    className="w-7 h-7 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-sm font-black w-6 text-center text-slate-700">{item.quantity}</span>
                  <button
                    onClick={() => updateCartQty(item.medicine._id, 1)}
                    className="w-7 h-7 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={() => removeFromCart(item.medicine._id)}
                  className="w-7 h-7 text-rose-500 hover:bg-rose-50 rounded-lg flex items-center justify-center transition-colors"
                  title="Xóa khỏi giỏ"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}

            {cart.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center py-12 text-slate-400 text-center space-y-2">
                <span className="text-4xl">💊</span>
                <p className="text-sm font-semibold">Giỏ hàng trống. Click chọn thuốc ở danh mục để bắt đầu xuất đơn.</p>
              </div>
            )}
          </div>

          {/* Form details & Checkout */}
          <div className="border-t border-slate-100 pt-4 space-y-4 shrink-0">
            {/* Customer Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tên khách hàng</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Chiết khấu (VND)</label>
                <div className="relative">
                  <Percent className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    value={discount || ''}
                    onChange={(e) => setDiscount(Math.max(Number(e.target.value), 0))}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Hình thức thanh toán</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'CASH', label: 'Tiền mặt' },
                  { value: 'TRANSFER', label: 'Chuyển khoản' },
                  { value: 'CARD', label: 'Thẻ tín dụng' },
                ].map((item) => (
                  <button
                    key={item.value}
                    onClick={() => setPaymentMethod(item.value as any)}
                    className={`py-2 text-xs font-semibold rounded-lg border text-center transition-all ${
                      paymentMethod === item.value
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-bold'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Calculations */}
            <div className="space-y-2 pt-2 border-t border-slate-50 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Tạm tính:</span>
                <span className="font-semibold">{formatPrice(totalAmount)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Chiết khấu:</span>
                <span className="font-semibold text-rose-500">-{formatPrice(discount)}</span>
              </div>
              <div className="flex justify-between text-slate-900 text-sm font-black pt-1">
                <span>Tổng thực thu:</span>
                <span className="text-emerald-600 text-base">{formatPrice(netAmount)}</span>
              </div>
            </div>

            {/* Checkout Button */}
            <button
              onClick={handleCheckout}
              disabled={cart.length === 0 || loading}
              className={`w-full py-3 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 shadow-lg ${
                cart.length === 0 || loading
                  ? 'bg-slate-200 cursor-not-allowed shadow-none'
                  : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/10'
              }`}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Thanh toán & Xuất hóa đơn'
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Bill Receipt Modal (Checkout success popup) */}
      {checkoutSuccessBill && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl p-6 flex flex-col max-h-[90vh]">
            <div className="flex items-center gap-2 text-emerald-600 font-bold text-lg mb-4 shrink-0">
              <CheckCircle className="w-6 h-6 text-emerald-500" />
              Thanh toán thành công!
            </div>

            {/* Printable Receipt layout */}
            <div id="receipt-print-area" className="flex-1 overflow-y-auto border border-slate-200 rounded-xl p-4 bg-slate-50 text-xs font-mono text-slate-800 space-y-4">
              <div className="text-center border-b border-dashed border-slate-300 pb-3 space-y-1">
                <h4 className="text-sm font-bold tracking-tight">NHÀ THUỐC PHARMACY POS</h4>
                <p className="text-[10px] text-slate-400">123 Đường IUH, Gò Vấp, TP.HCM</p>
                <p className="text-[10px] text-slate-400">ĐT: 0987.654.321</p>
              </div>

              <div className="space-y-1">
                <p><strong>Mã HĐ:</strong> {checkoutSuccessBill.billNumber}</p>
                <p><strong>Ngày xuất:</strong> {new Date(checkoutSuccessBill.createdAt).toLocaleString('vi-VN')}</p>
                <p><strong>Thu ngân:</strong> {checkoutSuccessBill.pharmacistName}</p>
                <p><strong>Khách hàng:</strong> {checkoutSuccessBill.customerName}</p>
              </div>

              {/* Items List */}
              <table className="w-full text-left border-t border-b border-dashed border-slate-300 py-2">
                <thead>
                  <tr className="font-bold border-b border-dashed border-slate-300">
                    <th className="py-1">Thuốc</th>
                    <th className="py-1 text-center">SL</th>
                    <th className="py-1 text-right">Đ.Giá</th>
                    <th className="py-1 text-right">T.Tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {checkoutSuccessBill.items.map((item, idx) => (
                    <tr key={idx} className="border-b border-slate-100">
                      <td className="py-1 font-bold">{item.medicineDetail?.name || 'Thuốc'}</td>
                      <td className="py-1 text-center">{item.quantity}</td>
                      <td className="py-1 text-right">{formatPrice(item.price)}</td>
                      <td className="py-1 text-right">{formatPrice(item.quantity * item.price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Costs summary */}
              <div className="space-y-1 pt-2 text-right">
                <p>Tạm tính: {formatPrice(checkoutSuccessBill.totalAmount)}</p>
                <p className="text-rose-600">Chiết khấu: -{formatPrice(checkoutSuccessBill.discountAmount)}</p>
                <p className="text-sm font-extrabold text-emerald-600">Thanh toán ({checkoutSuccessBill.paymentMethod}): {formatPrice(checkoutSuccessBill.netAmount)}</p>
              </div>

              <div className="text-center pt-4 border-t border-dashed border-slate-300 text-[10px] text-slate-400">
                Cảm ơn Quý khách. Hẹn gặp lại!
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-4 mt-6 shrink-0">
              <button
                onClick={handlePrint}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 font-bold text-sm text-slate-700 flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" />
                In hóa đơn
              </button>
              <button
                onClick={() => setCheckoutSuccessBill(null)}
                className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 font-bold text-sm text-white flex items-center justify-center"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
