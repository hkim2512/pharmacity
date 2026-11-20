import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Shield, Lock, CheckCircle, ShieldAlert, ArrowLeft } from 'lucide-react';
import { authService } from '../../services/authService';

export default function Profile() {
  const currentUser = authService.getCurrentUser();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState(currentUser?.fullName || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName) return;

    if (password && password !== confirmPassword) {
      setError('Mật khẩu nhập lại không khớp!');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      await authService.updateProfile(fullName, password || undefined);
      
      setSuccess('Cập nhật thông tin tài khoản thành công!');
      setPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || err.message || 'Lỗi khi cập nhật tài khoản');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (currentUser?.role === 'MANAGER') {
      navigate('/');
    } else {
      navigate('/pos');
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Back button */}
      <button
        onClick={handleBack}
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-emerald-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Quay lại trang chính
      </button>

      {/* Title */}
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 leading-none">Thông tin tài khoản</h2>
        <p className="text-sm text-slate-500 mt-1">Quản lý hồ sơ cá nhân và thay đổi mật khẩu của bạn.</p>
      </div>

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
          {success}
        </div>
      )}

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl text-xs font-semibold flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {/* Profile Card Summary */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-600 text-2xl font-bold shrink-0">
            {currentUser?.fullName.charAt(0).toUpperCase()}
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-extrabold text-slate-800 leading-none">{currentUser?.fullName}</h3>
            <p className="text-xs text-slate-400 font-medium">{currentUser?.email}</p>
            <span className="inline-block text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider mt-1">
              {currentUser?.role === 'MANAGER' ? 'Quản lý hệ thống' : 'Dược sĩ quầy'}
            </span>
          </div>
        </div>

        {/* Edit Form */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-800 pb-2 border-b border-slate-100">
            Chỉnh sửa thông tin
          </h3>
          <form onSubmit={handleUpdate} className="space-y-4 text-xs font-semibold text-slate-600">
            <div className="space-y-1.5">
              <label>Họ và tên</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white transition-all text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label>Địa chỉ Email (Không thể thay đổi)</label>
              <div className="relative opacity-60">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  disabled
                  value={currentUser?.email || ''}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs cursor-not-allowed"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label>Mật khẩu mới (Để trống nếu không đổi)</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white transition-all text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label>Nhập lại mật khẩu mới</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
                'Lưu thay đổi'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
