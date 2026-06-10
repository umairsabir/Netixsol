'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

interface User {
  id: string;
  _id?: string;
  email: string;
  role: string;
  name?: string;
  points?: number;
  avatar?: string | null;
  loginActivity?: { method: string; timestamp: string }[];
  authIdentities?: { provider: string; providerId: string }[];
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  login: (data: { user: User; access_token: string; refresh_token: string }) => void;
  logout: () => void;
  updateTokens: (token: string, refreshToken: string) => void;
  refreshUser: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);


export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const storedUser = localStorage.getItem('user');

    if (storedUser && token) {
      // Optimistic UI: load cached user immediately only if token exists
      setUser(JSON.parse(storedUser));
    } else {
      // Clean up in case one of them is missing or stale
      localStorage.removeItem('user');
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      setUser(null);
    }
    
    if (!token) {
      setIsLoading(false);
      return;
    }

    api.get('/auth/profile').then(res => {
      localStorage.setItem('user', JSON.stringify(res.data));
      setUser(res.data);
    }).catch(async () => {
      // Access token expired — try refresh token before logging out
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const { data } = await api.post('/auth/refresh', { refreshToken });
          localStorage.setItem('access_token', data.access_token);
          localStorage.setItem('refresh_token', data.refresh_token);
          localStorage.setItem('user', JSON.stringify(data.user));
          setUser(data.user);
        } catch {
          localStorage.removeItem('user');
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          setUser(null);
        }
      } else {
        localStorage.removeItem('user');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setUser(null);
      }
    }).finally(() => {
      setIsLoading(false);
    });
  }, []);

  const refreshUser = async () => {
    try {
      const response = await api.get('/auth/profile');
      const updatedUser = response.data;
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  };

  const login = (data: { user: User; access_token: string; refresh_token: string }) => {
    localStorage.setItem('user', JSON.stringify(data.user));
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('refresh_token', data.refresh_token);
    setUser(data.user);
  };

  const logout = async () => {
    const role = user?.role;
    try {
      await api.post('/auth/logout');
    } catch(e) {
      console.error(e);
    }
    localStorage.removeItem('user');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
    if (role === 'admin' || role === 'super_admin') {
      router.push('/admin/login');
    } else {
      router.push('/login');
    }
  };

  return (
    <AuthContext.Provider value={{ user, token: null, refreshToken: null, login, logout, updateTokens: () => {}, refreshUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
