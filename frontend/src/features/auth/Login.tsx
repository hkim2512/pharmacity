import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, UserCheck, ShieldAlert } from 'lucide-react';
import { authService } from '../../services/authService';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    try {
      setLoading(true);
      setError('');
      const res = await authService.login(email, password);
      if (res.user.role === 'MANAGER') {
        navigate('/');
      } else {
        navigate('/pos');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Lỗi khi đăng nhập');
    } finally {
      setLoading(false);
    }
  };

  const fillQuickAccount = (role: 'PHARMACIST' | 'MANAGER') => {
    if (role === 'MANAGER') {
      setEmail('manager@pharmacy.com');
      setPassword('password123');
    } else {
      setEmail('pharmacist@pharmacy.com');
      setPassword('password123');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl p-8 max-w-md w-full shadow-lg space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center text-2xl font-black mx-auto shadow-lg shadow-emerald-500/10">
            ➕
          </div>
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight leading-none pt-2">Đăng nhập hệ thống</h2>
          <p className="text-xs text-slate-400">Vui lòng cung cấp thông tin để vào quầy bán thuốc.</p>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl text-xs font-semibold flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0" />
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4 text-xs font-semibold text-slate-600">
          <div className="space-y-1.5">
            <label>Địa chỉ Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="VD: pharmacist@pharmacy.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white transition-all text-xs"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label>Mật khẩu</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white transition-all text-xs"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/10 text-xs transition-colors flex items-center justify-center"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              'Đăng nhập hệ thống'
            )}
          </button>
        </form>

        {/* Quick Accounts selector */}
        <div className="border-t border-slate-100 pt-4 space-y-3">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">
            Tài khoản thử nghiệm nhanh (Click để điền)
          </p>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <button
              onClick={() => fillQuickAccount('PHARMACIST')}
              className="py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 font-bold text-slate-700 flex items-center justify-center gap-1.5 transition-colors"
            >
              <UserCheck className="w-4 h-4 text-slate-500" />
              Dược sĩ (Cơ bản)
            </button>
            <button
              onClick={() => fillQuickAccount('MANAGER')}
              className="py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 font-bold text-slate-700 flex items-center justify-center gap-1.5 transition-colors"
            >
              <UserCheck className="w-4 h-4 text-emerald-500" />
              Quản lý (Báo cáo)
            </button>
          </div>
        </div>

        {/* Link to Register */}
        <div className="text-center pt-2 text-xs text-slate-500">
          <span>Chưa có tài khoản? </span>
          <Link to="/register" className="text-emerald-600 hover:text-emerald-500 font-bold underline">
            Đăng ký ngay
          </Link>
        </div>
      </div>
    </div>
  );
}
