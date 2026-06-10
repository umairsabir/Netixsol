import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api, { setAccessToken } from '../lib/axios';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  isBlocked: boolean;
  avatar: string | null;
  subscriptionId: string | null;
  freeTrialId: string | null;
}

interface AuthTokens {
  access: { token: string; expires: string };
  refresh: { token: string; expires: string };
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  adminLogin: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleTokens = (tokens: AuthTokens) => {
    setAccessToken(tokens.access.token);
    localStorage.setItem('refreshToken', tokens.refresh.token);
  };

  const refreshUser = useCallback(async () => {
    try {
      const { data } = await api.get('/auth/me');
      setUser(data);
    } catch {
      setUser(null);
    }
  }, []);

  // Restore session on mount
  useEffect(() => {
    const restoreSession = async () => {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        setIsLoading(false);
        return;
      }
      try {
        const { data } = await api.post('/auth/refresh-tokens', { refreshToken });
        setAccessToken(data.access.token);
        localStorage.setItem('refreshToken', data.refresh.token);
        await refreshUser();
      } catch {
        setUser(null);
        localStorage.removeItem('refreshToken');
      } finally {
        setIsLoading(false);
      }
    };
    restoreSession();
  }, [refreshUser]);

  // Listen for forced logout from axios interceptor
  useEffect(() => {
    const onLogout = () => {
      setUser(null);
      setAccessToken(null);
    };
    window.addEventListener('auth:logout', onLogout);
    return () => window.removeEventListener('auth:logout', onLogout);
  }, []);

  const login = async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password });
    handleTokens(data.tokens);
    setUser(data.user);
  };

  const adminLogin = async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password });
    if (data.user?.role !== 'admin') {
      setAccessToken(null);
      localStorage.removeItem('refreshToken');
      throw new Error('Not authorized as admin');
    }
    handleTokens(data.tokens);
    setUser(data.user);
  };

  const register = async (name: string, email: string, password: string) => {
    const { data } = await api.post('/auth/register', { name, email, password });
    handleTokens(data.tokens);
    setUser(data.user);
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      await api.post('/auth/logout', { refreshToken });
    } catch { /* ignore */ }
    setAccessToken(null);
    localStorage.removeItem('refreshToken');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        login,
        adminLogin,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
