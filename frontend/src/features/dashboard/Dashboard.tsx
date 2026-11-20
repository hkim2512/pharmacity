import React, { useEffect, useState } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { TrendingUp, Award, AlertTriangle, HelpCircle, DollarSign, Package } from 'lucide-react';
import { saleService } from '../../services/saleService';
import { DashboardStats } from '../../types';
import { formatPrice } from '../../utils/format';

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await saleService.getSalesStats();
        setStats(data);
        setError('');
      } catch (err: any) {
        console.error(err);
        setError('Không thể tải dữ liệu thống kê từ hệ thống.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-2">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-semibold text-slate-500">Đang tải báo cáo thống kê...</span>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center text-rose-700">
        <p className="font-bold">{error || 'Có lỗi xảy ra khi load thống kê.'}</p>
      </div>
    );
  }

  const kpis = [
    {
      title: 'Doanh thu hôm nay',
      value: formatPrice(stats.todaySales),
      icon: DollarSign,
      color: 'bg-emerald-500 text-white',
      bgGlow: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    },
    {
      title: 'Tổng giá trị tồn kho',
      value: formatPrice(stats.totalStockValue),
      icon: Package,
      color: 'bg-blue-500 text-white',
      bgGlow: 'bg-blue-50 text-blue-700 border-blue-100',
    },
    {
      title: 'Lô thuốc hết hạn',
      value: stats.expiredCount.toString(),
      icon: AlertTriangle,
      color: 'bg-rose-500 text-white',
      bgGlow: stats.expiredCount > 0 ? 'bg-rose-50 text-rose-700 border-rose-100 animate-pulse' : 'bg-slate-50 text-slate-700 border-slate-100',
    },
    {
      title: 'Lô thuốc cận hạn (3 tháng)',
      value: stats.nearExpiryCount.toString(),
      icon: HelpCircle,
      color: 'bg-amber-500 text-white',
      bgGlow: stats.nearExpiryCount > 0 ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-slate-50 text-slate-700 border-slate-100',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 leading-none">Bảng điều khiển hệ thống</h2>
        <p className="text-sm text-slate-500 mt-1">Số liệu tổng quan hoạt động kinh doanh nhà thuốc thời gian thực.</p>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.title} className={`rounded-2xl border p-6 flex items-center justify-between shadow-sm bg-white border-slate-200`}>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{kpi.title}</p>
                <p className="text-xl font-extrabold text-slate-800 leading-none">{kpi.value}</p>
              </div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${kpi.color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sales Chart */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                Doanh thu & Lợi nhuận
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Xu hướng kinh doanh trong 6 tháng gần nhất.</p>
            </div>
          </div>
          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="label" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip 
                  formatter={(value: any) => [formatPrice(Number(value || 0)), '']}
                  contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '12px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Area name="Doanh thu" type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
                <Area name="Lợi nhuận" type="monotone" dataKey="profit" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorProfit)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick info / top products */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-500" />
                Hoạt động nổi bật
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Tổng quan vận hành và các cột mốc.</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                <div className="text-sm">
                  <p className="font-bold text-slate-700">POS thông minh</p>
                  <p className="text-xs text-slate-400">Đã cập nhật kiểm tra hạn dùng theo lô (FIFO).</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                <div className="text-sm">
                  <p className="font-bold text-slate-700">Tự động trừ kho</p>
                  <p className="text-xs text-slate-400">Xuất hóa đơn tự động cập nhật số lượng tồn lô hàng.</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                <div className="text-sm">
                  <p className="font-bold text-slate-700">Báo cáo chuẩn xác</p>
                  <p className="text-xs text-slate-400">Tính toán lợi nhuận ròng dựa trên chênh lệch giá gốc.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 mt-6 flex items-center gap-3">
            <span className="text-2xl">💡</span>
            <p className="text-[11px] text-emerald-800 leading-relaxed font-semibold">
              <strong>Mẹo vận hành:</strong> Hãy kiểm tra danh sách kho thường xuyên để chủ động thanh lý các lô thuốc sắp hết hạn (cảnh báo màu vàng).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
