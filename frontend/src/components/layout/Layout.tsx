import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Pill, FileText, LogOut, User as UserIcon } from 'lucide-react';
import { authService } from '../../services/authService';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = authService.getCurrentUser();

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const menuItems = [
    { path: '/', label: 'Tổng quan (Dashboard)', icon: LayoutDashboard, roles: ['MANAGER'] },
    { path: '/pos', label: 'Quầy bán thuốc (POS)', icon: ShoppingCart, roles: ['PHARMACIST', 'MANAGER'] },
    { path: '/inventory', label: 'Quản lý kho (FIFO)', icon: Pill, roles: ['MANAGER'] },
    { path: '/bills', label: 'Lịch sử hóa đơn', icon: FileText, roles: ['PHARMACIST', 'MANAGER'] },
  ].filter(item => item.roles.includes(currentUser?.role || ''));

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0">
        {/* Brand */}
        <div className="h-16 flex items-center px-6 border-b border-slate-200 gap-2 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white font-black text-lg">
            ➕
          </div>
          <div>
            <h1 className="font-extrabold text-sm text-slate-900 tracking-tight leading-none">PHARMACY POS</h1>
            <p className="text-[10px] text-emerald-600 font-semibold tracking-wide uppercase mt-0.5">Inventory & Sales</p>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/10'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Logout at bottom */}
        <div className="p-4 border-t border-slate-200 shrink-0">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors duration-200"
          >
            <LogOut className="w-4 h-4 text-rose-500" />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
              {currentUser?.role === 'MANAGER' ? 'Quản lý' : 'Dược sĩ'}
            </span>
          </div>

          <button 
            onClick={() => navigate('/profile')}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer group text-left"
            title="Xem hồ sơ cá nhân"
          >
            <div className="text-right">
              <p className="text-sm font-bold text-slate-800 leading-none group-hover:text-emerald-600 transition-colors">{currentUser?.fullName}</p>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">{currentUser?.email}</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 group-hover:border-emerald-500 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-all">
              <UserIcon className="w-4 h-4" />
            </div>
          </button>
        </header>

        {/* Dynamic page content */}
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
