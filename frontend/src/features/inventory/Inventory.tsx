import React, { useEffect, useState } from 'react';
import { Pill, Plus, Calendar, DollarSign, ChevronDown, ChevronUp, AlertCircle, Sparkles } from 'lucide-react';
import { medicineService } from '../../services/medicineService';
import { Medicine, Batch } from '../../types';
import { formatPrice, formatDate } from '../../utils/format';

export default function Inventory() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [expandedMedId, setExpandedMedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Forms states
  const [showAddMedForm, setShowAddMedForm] = useState(false);
  const [showAddBatchForm, setShowAddBatchForm] = useState(false);

  // New Medicine fields
  const [medName, setMedName] = useState('');
  const [medIngredient, setMedIngredient] = useState('');
  const [medCategory, setMedCategory] = useState('Giảm đau & Hạ sốt');
  const [medUnit, setMedUnit] = useState('Viên');
  const [medMinStock, setMedMinStock] = useState<number>(100);

  // New Batch fields
  const [selectedMedId, setSelectedMedId] = useState('');
  const [batchNum, setBatchNum] = useState('');
  const [batchQty, setBatchQty] = useState<number>(100);
  const [batchMfg, setBatchMfg] = useState('');
  const [batchExp, setBatchExp] = useState('');
  const [batchPurchase, setBatchPurchase] = useState<number>(1000);
  const [batchSelling, setBatchSelling] = useState<number>(1500);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const data = await medicineService.getMedicines();
      setMedicines(data);
      if (data.length > 0 && !selectedMedId) {
        setSelectedMedId(data[0]._id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedMedId(expandedMedId === id ? null : id);
  };

  const handleCreateMedicine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!medName) return;
    try {
      await medicineService.createMedicine({
        name: medName,
        activeIngredient: medIngredient,
        category: medCategory,
        unit: medUnit,
        minStockLevel: medMinStock,
      });
      // Reset form
      setMedName('');
      setMedIngredient('');
      setShowAddMedForm(false);
      // Reload list
      fetchInventory();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Lỗi thêm thuốc');
    }
  };

  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMedId || !batchNum || !batchExp) return;
    try {
      await medicineService.addBatch(selectedMedId, {
        batchNumber: batchNum.toUpperCase(),
        quantity: batchQty,
        mfgDate: batchMfg || undefined,
        expDate: batchExp,
        purchasePrice: batchPurchase,
        sellingPrice: batchSelling,
      });
      // Reset form
      setBatchNum('');
      setBatchQty(100);
      setBatchMfg('');
      setBatchExp('');
      setShowAddBatchForm(false);
      // Reload list
      fetchInventory();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Lỗi thêm lô hàng');
    }
  };

  return (
    <div className="space-y-8">
      {/* Title & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 leading-none">Quản lý kho thuốc theo Lô (FIFO)</h2>
          <p className="text-sm text-slate-500 mt-1">Phân loại thuốc theo lô sản xuất, ngày hết hạn và định mức tồn tối thiểu.</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setShowAddMedForm(!showAddMedForm)}
            className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 font-bold text-xs text-slate-700 flex items-center gap-2 bg-white transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4 text-slate-500" />
            Định nghĩa thuốc mới
          </button>
          <button
            onClick={() => setShowAddBatchForm(!showAddBatchForm)}
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 font-bold text-xs text-white flex items-center gap-2 transition-colors shadow-lg shadow-emerald-500/10"
          >
            <Plus className="w-4 h-4" />
            Nhập lô hàng mới
          </button>
        </div>
      </div>

      {/* Forms Drawer overlay grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Form: Add New Medicine Definition */}
        {showAddMedForm && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
              <Pill className="w-4 h-4 text-emerald-500" />
              Định nghĩa loại thuốc mới
            </h3>
            <form onSubmit={handleCreateMedicine} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-500">Tên thuốc (*)</label>
                  <input
                    type="text"
                    required
                    value={medName}
                    onChange={(e) => setMedName(e.target.value)}
                    placeholder="VD: Efferalgan 500mg"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-500">Hoạt chất chính</label>
                  <input
                    type="text"
                    value={medIngredient}
                    onChange={(e) => setMedIngredient(e.target.value)}
                    placeholder="VD: Paracetamol"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-500">Danh mục</label>
                  <select
                    value={medCategory}
                    onChange={(e) => setMedCategory(e.target.value)}
                    className="w-full px-2.5 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option>Giảm đau & Hạ sốt</option>
                    <option>Thuốc kháng sinh</option>
                    <option>Thuốc kháng dị ứng</option>
                    <option>Thuốc trị tiểu đường</option>
                    <option>Thuốc trị mỡ máu</option>
                    <option>Vitamin & Khoáng chất</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-500">Đơn vị tính</label>
                  <select
                    value={medUnit}
                    onChange={(e) => setMedUnit(e.target.value)}
                    className="w-full px-2.5 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option>Viên</option>
                    <option>Vỉ</option>
                    <option>Hộp</option>
                    <option>Chai</option>
                    <option>Tuýp</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-500">Định mức tồn tối thiểu</label>
                  <input
                    type="number"
                    value={medMinStock}
                    onChange={(e) => setMedMinStock(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddMedForm(false)}
                  className="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 font-bold"
                >
                  Xác nhận lưu
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Form: Add New Batch (Nhập Lô Hàng) */}
        {showAddBatchForm && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
              <Calendar className="w-4 h-4 text-emerald-500" />
              Nhập lô hàng dược phẩm mới
            </h3>
            <form onSubmit={handleCreateBatch} className="space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 space-y-1">
                  <label className="font-bold text-slate-500">Chọn loại thuốc (*)</label>
                  <select
                    value={selectedMedId}
                    onChange={(e) => setSelectedMedId(e.target.value)}
                    className="w-full px-2.5 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    {medicines.map(m => (
                      <option key={m._id} value={m._id}>{m.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-500">Số lô (*)</label>
                  <input
                    type="text"
                    required
                    value={batchNum}
                    onChange={(e) => setBatchNum(e.target.value)}
                    placeholder="VD: LOT-2026A"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-500">Số lượng nhập</label>
                  <input
                    type="number"
                    value={batchQty}
                    onChange={(e) => setBatchQty(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-500">Ngày sản xuất (MFG)</label>
                  <input
                    type="date"
                    value={batchMfg}
                    onChange={(e) => setBatchMfg(e.target.value)}
                    className="w-full px-2 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-500">Ngày hết hạn (EXP) (*)</label>
                  <input
                    type="date"
                    required
                    value={batchExp}
                    onChange={(e) => setBatchExp(e.target.value)}
                    className="w-full px-2 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-500">Giá nhập kho (VND/đơn vị)</label>
                  <input
                    type="number"
                    value={batchPurchase}
                    onChange={(e) => setBatchPurchase(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-500">Giá bán lẻ (VND/đơn vị)</label>
                  <input
                    type="number"
                    value={batchSelling}
                    onChange={(e) => setBatchSelling(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddBatchForm(false)}
                  className="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 font-bold"
                >
                  Xác nhận nhập
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Main Inventory List */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm overflow-hidden">
        {loading && medicines.length === 0 ? (
          <div className="text-center py-12 text-slate-400 font-semibold">Đang cập nhật kho...</div>
        ) : (
          <div className="space-y-4">
            {/* Table Header */}
            <div className="hidden sm:grid grid-cols-12 gap-4 text-xs font-bold text-slate-400 uppercase tracking-wider pb-3 border-b border-slate-100 px-4">
              <div className="col-span-4">Tên thuốc & hoạt chất</div>
              <div className="col-span-2">Danh mục</div>
              <div className="col-span-2 text-right">Tổng tồn kho</div>
              <div className="col-span-2 text-right">Giá bán rẻ nhất</div>
              <div className="col-span-2 text-center">Trạng thái lô</div>
            </div>

            {/* Table Body */}
            {medicines.map((med) => {
              const isExpanded = expandedMedId === med._id;
              return (
                <div
                  key={med._id}
                  className={`border rounded-xl transition-all duration-200 ${
                    isExpanded ? 'border-emerald-500 bg-emerald-50/5' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {/* Row Summary */}
                  <div
                    onClick={() => toggleExpand(med._id)}
                    className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center text-xs py-4 px-4 cursor-pointer select-none"
                  >
                    <div className="col-span-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center font-bold text-sm shrink-0">
                        💊
                      </div>
                      <div className="min-w-0">
                        <p className="font-extrabold text-slate-800 truncate text-sm">{med.name}</p>
                        <p className="text-[10px] text-slate-400 truncate mt-0.5">{med.activeIngredient || 'Không có hoạt chất'}</p>
                      </div>
                    </div>

                    <div className="col-span-2">
                      <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-semibold">
                        {med.category}
                      </span>
                    </div>

                    <div className="col-span-2 text-left sm:text-right font-black text-slate-700">
                      {med.totalQuantity} {med.unit}
                      {med.isLowStock && (
                        <p className="text-[9px] text-amber-600 font-bold sm:text-right">Dưới định mức ({med.minStockLevel})</p>
                      )}
                    </div>

                    <div className="col-span-2 text-left sm:text-right font-black text-emerald-600">
                      {med.totalQuantity > 0 ? formatPrice(med.lowestPrice) : 'Hết hàng'}
                    </div>

                    <div className="col-span-2 flex items-center justify-between sm:justify-center gap-2">
                      <div className="flex gap-1">
                        {med.hasExpired && (
                          <span className="text-[9px] bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded-full font-bold">Hết hạn</span>
                        )}
                        {med.hasNearExpiry && !med.hasExpired && (
                          <span className="text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-full font-bold">Cận hạn</span>
                        )}
                        {!med.hasExpired && !med.hasNearExpiry && med.totalQuantity > 0 && (
                          <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-full font-bold">An toàn</span>
                        )}
                      </div>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </div>
                  </div>

                  {/* Expanded Batches (FIFO details) */}
                  {isExpanded && (
                    <div className="border-t border-slate-100 bg-white p-4 rounded-b-xl space-y-3">
                      <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                        Danh sách các lô hàng có sẵn (Xuất theo thứ tự hạn gần nhất trước - FIFO):
                      </h4>

                      {med.batches.length === 0 ? (
                        <p className="text-xs text-slate-400 italic py-2">Thuốc chưa được nhập bất kỳ lô hàng nào.</p>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs font-sans text-slate-700">
                            <thead>
                              <tr className="border-b border-slate-200 text-slate-400 font-bold">
                                <th className="py-2">Mã số lô</th>
                                <th className="py-2 text-right">Số lượng tồn</th>
                                <th className="py-2 text-center">NSX (MFG)</th>
                                <th className="py-2 text-center">HSD (EXP)</th>
                                <th className="py-2 text-right">Giá nhập</th>
                                <th className="py-2 text-right">Giá bán</th>
                                <th className="py-2 text-center">Tình trạng</th>
                              </tr>
                            </thead>
                            <tbody>
                              {med.batches.map((batch) => {
                                const expDate = new Date(batch.expDate);
                                const now = new Date();
                                const threeMonthsLater = new Date();
                                threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);

                                let statusBadge = <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-semibold">Còn hạn</span>;
                                if (expDate <= now) {
                                  statusBadge = <span className="bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full font-bold">Hết hạn</span>;
                                } else if (expDate <= threeMonthsLater) {
                                  statusBadge = <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">Cận hạn</span>;
                                }

                                return (
                                  <tr key={batch._id} className="border-b border-slate-100 hover:bg-slate-50/50">
                                    <td className="py-2.5 font-bold text-slate-800">{batch.batchNumber}</td>
                                    <td className="py-2.5 text-right font-semibold">{batch.quantity} {med.unit}</td>
                                    <td className="py-2.5 text-center text-slate-400">{batch.mfgDate ? formatDate(batch.mfgDate) : 'N/A'}</td>
                                    <td className="py-2.5 text-center font-semibold">{formatDate(batch.expDate)}</td>
                                    <td className="py-2.5 text-right text-slate-500">{formatPrice(batch.purchasePrice)}</td>
                                    <td className="py-2.5 text-right text-emerald-600 font-extrabold">{formatPrice(batch.sellingPrice)}</td>
                                    <td className="py-2.5 text-center text-[10px]">{statusBadge}</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
