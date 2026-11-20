import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './features/dashboard/Dashboard';
import POSCashier from './features/pos/POSCashier';
import Inventory from './features/inventory/Inventory';
import BillsHistory from './features/bills/BillsHistory';
import Login from './features/auth/Login';
import Register from './features/auth/Register';
import Profile from './features/auth/Profile';
import { authService } from './services/authService';

// Component bảo vệ Route kiểm tra đăng nhập
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const currentUser = authService.getCurrentUser();
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  return <Layout>{children}</Layout>;
};

// Component bảo vệ Route giới hạn cho Quản lý
const ManagerRoute = ({ children }: { children: React.ReactNode }) => {
  const currentUser = authService.getCurrentUser();
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  if (currentUser.role !== 'MANAGER') {
    return <Navigate to="/pos" replace />;
  }
  return <Layout>{children}</Layout>;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Dashboard & POS Layout Routes */}
        <Route
          path="/"
          element={
            <ManagerRoute>
              <Dashboard />
            </ManagerRoute>
          }
        />
        <Route
          path="/pos"
          element={
            <ProtectedRoute>
              <POSCashier />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inventory"
          element={
            <ManagerRoute>
              <Inventory />
            </ManagerRoute>
          }
        />
        <Route
          path="/bills"
          element={
            <ProtectedRoute>
              <BillsHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
