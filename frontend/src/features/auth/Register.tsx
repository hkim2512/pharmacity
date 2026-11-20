import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, UserPlus, ShieldAlert, BadgeHelp } from 'lucide-react';
import { authService } from '../../services/authService';

export default function Register() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'PHARMACIST' | 'MANAGER'>('PHARMACIST');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !fullName) return;
    try {
      setLoading(true);
      setError('');
      const res = await authService.register(email, password, fullName, role);
      if (res.user.role === 'MANAGER') {
        navigate('/');
      } else {
        navigate('/pos');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Lỗi khi đăng ký tài khoản');
    } finally {
      setLoading(false);
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
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight leading-none pt-2">Đăng ký tài khoản mới</h2>
          <p className="text-xs text-slate-400">Tạo tài khoản Dược sĩ hoặc Quản lý để sử dụng hệ thống.</p>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl text-xs font-semibold flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0" />
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleRegister} className="space-y-4 text-xs font-semibold text-slate-600">
          <div className="space-y-1.5">
            <label>Họ và tên (*)</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="VD: Nguyễn Văn A"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white transition-all text-xs"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label>Địa chỉ Email (*)</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="VD: duocsi@pharmacy.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white transition-all text-xs"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label>Mật khẩu (*)</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Tối thiểu 6 ký tự"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white transition-all text-xs"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="flex items-center gap-1">
              Vai trò hệ thống
              <span title="Dược sĩ chỉ được POS bán hàng, Quản lý được xem doanh thu và kho hàng.">
                <BadgeHelp className="w-3.5 h-3.5 text-slate-400" />
              </span>
            </label>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <button
                type="button"
                onClick={() => setRole('PHARMACIST')}
                className={`py-2 text-xs font-semibold rounded-xl border text-center transition-all ${
                  role === 'PHARMACIST'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-bold'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                Dược sĩ (Bán hàng)
              </button>
              <button
                type="button"
                onClick={() => setRole('MANAGER')}
                className={`py-2 text-xs font-semibold rounded-xl border text-center transition-all ${
                  role === 'MANAGER'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-bold'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                Quản lý (Báo cáo/Kho)
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/10 text-xs transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                Đăng ký tài khoản
              </>
            )}
          </button>
        </form>

        {/* Back to Login link */}
        <div className="text-center pt-2 text-xs text-slate-500">
          <span>Đã có tài khoản? </span>
          <Link to="/login" className="text-emerald-600 hover:text-emerald-500 font-bold underline">
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    </div>
  );
}
