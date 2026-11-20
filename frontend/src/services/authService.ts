import api from './api';
import { User } from '../types';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

export const authService = {
  login: async (email: string, password: string): Promise<{ token: string; user: User }> => {
    if (USE_MOCK) {
      // Mock Login
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          if (email === 'manager@pharmacy.com' && password === 'password123') {
            const data = {
              token: 'mock_jwt_manager_token_2026',
              user: {
                id: 'usr_01',
                email: 'manager@pharmacy.com',
                fullName: 'Phạm Hồng Kim Hà (Manager)',
                role: 'MANAGER' as const,
              },
            };
            localStorage.setItem('pharmacy_token', data.token);
            localStorage.setItem('pharmacy_user', JSON.stringify(data.user));
            resolve(data);
          } else if (email === 'pharmacist@pharmacy.com' && password === 'password123') {
            const data = {
              token: 'mock_jwt_pharmacist_token_2026',
              user: {
                id: 'usr_02',
                email: 'pharmacist@pharmacy.com',
                fullName: 'Nguyễn Văn A (Pharmacist)',
                role: 'PHARMACIST' as const,
              },
            };
            localStorage.setItem('pharmacy_token', data.token);
            localStorage.setItem('pharmacy_user', JSON.stringify(data.user));
            resolve(data);
          } else {
            reject(new Error('Email hoặc mật khẩu không hợp lệ (Thử: manager@pharmacy.com / password123)'));
          }
        }, 800);
      });
    } else {
      // Real API Call
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('pharmacy_token', res.data.token);
      localStorage.setItem('pharmacy_user', JSON.stringify(res.data.user));
      return res.data;
    }
  },

  register: async (email: string, password: string, fullName: string, role: 'PHARMACIST' | 'MANAGER'): Promise<{ token: string; user: User }> => {
    if (USE_MOCK) {
      // Mock Register
      return new Promise((resolve) => {
        setTimeout(() => {
          const data = {
            token: `mock_jwt_token_${Date.now()}`,
            user: {
              id: `usr_${Date.now()}`,
              email,
              fullName,
              role,
            },
          };
          localStorage.setItem('pharmacy_token', data.token);
          localStorage.setItem('pharmacy_user', JSON.stringify(data.user));
          resolve(data);
        }, 800);
      });
    } else {
      // Real API Call
      const res = await api.post('/auth/register', { email, password, fullName, role });
      localStorage.setItem('pharmacy_token', res.data.token);
      localStorage.setItem('pharmacy_user', JSON.stringify(res.data.user));
      return res.data;
    }
  },

  logout: () => {
    localStorage.removeItem('pharmacy_token');
    localStorage.removeItem('pharmacy_user');
  },

  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem('pharmacy_user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr) as User;
    } catch {
      return null;
    }
  },

  updateProfile: async (fullName?: string, password?: string): Promise<{ user: User }> => {
    if (USE_MOCK) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const userStr = localStorage.getItem('pharmacy_user');
          const currentUser = userStr ? JSON.parse(userStr) : null;
          if (currentUser) {
            if (fullName) currentUser.fullName = fullName;
            localStorage.setItem('pharmacy_user', JSON.stringify(currentUser));
          }
          resolve({ user: currentUser });
        }, 800);
      });
    } else {
      const res = await api.put('/auth/profile', { fullName, password });
      localStorage.setItem('pharmacy_user', JSON.stringify(res.data.user));
      return res.data;
    }
  },
};
