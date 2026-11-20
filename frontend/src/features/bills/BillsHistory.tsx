import React, { useEffect, useState } from 'react';
import { FileText, Eye, Printer, X, Search } from 'lucide-react';
import { saleService } from '../../services/saleService';
import { Bill } from '../../types';
import { formatPrice, formatDate } from '../../utils/format';

export default function BillsHistory() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);

  const fetchBills = async () => {
    try {
      setLoading(true);
      const data = await saleService.getBills();
      setBills(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const filteredBills = bills.filter(
    (b) =>
      b.billNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.pharmacistName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 leading-none">Nhật ký hóa đơn bán hàng</h2>
        <p className="text-sm text-slate-500 mt-1">Tra cứu lịch sử hóa đơn bán lẻ đã xuất từ quầy thu ngân.</p>
      </div>

      {/* Search & List */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col gap-6">
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm kiếm theo số hóa đơn, tên khách hàng hoặc dược sĩ thu ngân..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white transition-all"
          />
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-400 font-semibold">Đang tải nhật ký...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans text-slate-700">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold">
                  <th className="py-3 px-4">Số hóa đơn</th>
                  <th className="py-3 px-4">Thời gian</th>
                  <th className="py-3 px-4">Khách hàng</th>
                  <th className="py-3 px-4">Thu ngân</th>
                  <th className="py-3 px-4 text-center">Hình thức</th>
                  <th className="py-3 px-4 text-right">Tổng tiền</th>
                  <th className="py-3 px-4 text-center">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredBills.map((bill) => (
                  <tr key={bill._id} className="border-b border-slate-100 hover:bg-slate-50/50">
                    <td className="py-3.5 px-4 font-bold text-slate-850">{bill.billNumber}</td>
                    <td className="py-3.5 px-4 text-slate-450">{new Date(bill.createdAt).toLocaleString('vi-VN')}</td>
                    <td className="py-3.5 px-4">{bill.customerName}</td>
                    <td className="py-3.5 px-4">{bill.pharmacistName}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold uppercase tracking-wider text-[10px]">
                        {bill.paymentMethod === 'TRANSFER' ? 'Chuyển khoản' : bill.paymentMethod === 'CARD' ? 'Thẻ' : 'Tiền mặt'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right text-emerald-600 font-extrabold">{formatPrice(bill.netAmount)}</td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => setSelectedBill(bill)}
                        className="p-1 px-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 font-bold text-[10px] text-slate-600 inline-flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-400" />
                        Xem chi tiết
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredBills.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-400 font-semibold">
                      Không tìm thấy hóa đơn nào phù hợp.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Bill Detail Modal */}
      {selectedBill && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl p-6 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4 shrink-0">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-500" />
                Chi tiết hóa đơn {selectedBill.billNumber}
              </h3>
              <button onClick={() => setSelectedBill(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Printable Receipt layout */}
            <div id="receipt-print-area" className="flex-1 overflow-y-auto border border-slate-200 rounded-xl p-4 bg-slate-50 text-xs font-mono text-slate-800 space-y-4">
              <div className="text-center border-b border-dashed border-slate-300 pb-3 space-y-1">
                <h4 className="text-sm font-bold tracking-tight">NHÀ THUỐC PHARMACY POS</h4>
                <p className="text-[10px] text-slate-400">123 Đường IUH, Gò Vấp, TP.HCM</p>
                <p className="text-[10px] text-slate-400">ĐT: 0987.654.321</p>
              </div>

              <div className="space-y-1">
                <p><strong>Mã HĐ:</strong> {selectedBill.billNumber}</p>
                <p><strong>Ngày xuất:</strong> {new Date(selectedBill.createdAt).toLocaleString('vi-VN')}</p>
                <p><strong>Thu ngân:</strong> {selectedBill.pharmacistName}</p>
                <p><strong>Khách hàng:</strong> {selectedBill.customerName}</p>
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
                  {selectedBill.items.map((item, idx) => (
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
                <p>Tạm tính: {formatPrice(selectedBill.totalAmount)}</p>
                <p className="text-rose-600">Chiết khấu: -{formatPrice(selectedBill.discountAmount)}</p>
                <p className="text-sm font-extrabold text-emerald-600">Thanh toán ({selectedBill.paymentMethod}): {formatPrice(selectedBill.netAmount)}</p>
              </div>

              <div className="text-center pt-4 border-t border-dashed border-slate-300 text-[10px] text-slate-400">
                Hóa đơn lưu trữ hệ thống.
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
                onClick={() => setSelectedBill(null)}
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
