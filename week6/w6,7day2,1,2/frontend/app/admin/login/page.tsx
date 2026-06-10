'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import api from '@/lib/api';
import { Eye, EyeOff } from 'lucide-react';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/auth/login', { email, password });
      // Disallow normal users from logging in via admin login
      if (data.user.role !== 'admin' && data.user.role !== 'super_admin') {
        setError('Unauthorized. Only admins can log in here.');
        return;
      }
      login(data);
      router.push('/admin');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-gray-900 border-t-4 border-blue-600">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-2xl">
        <div className="mb-8 text-center flex flex-col items-center justify-center">
            <svg width="175" height="49" viewBox="0 0 175 49" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-2">
                <path fillRule="evenodd" clipRule="evenodd" d="M112.875 48.4688L130.313 27.2812C131.532 25.7812 132.282 24.2812 136.125 24.2812C141.469 24.2812 148.407 23.0625 154.219 21.75C162.282 19.9688 169.032 16.5938 174.375 13.9688C172.875 16.875 162.657 19.875 157.5 22.5938C162 21.4688 162.844 21.1875 167.25 19.6875C163.969 22.6875 160.125 22.4062 154.782 25.0312C158.719 24.1875 158.907 24.1875 162.75 22.9688C160.407 25.5 155.907 25.125 152.438 27.0938C156 26.5312 155.719 26.7188 159 25.7812C156.657 27.2812 152.719 29.7188 145.407 32.7188L131.532 35.9062C130.5 36.0938 127.969 36.375 125.813 38.4375C123.094 41.1562 119.344 44.3438 118.219 45.0938C116.907 46.125 115.407 47.9062 112.875 48.4688ZM111.75 47.625L127.594 27.1875C128.813 25.5938 129.094 23.5312 126 22.4062C121.782 20.8125 117.188 20.4375 113.063 18.75C104.532 15.4688 99.5629 7.59375 94.5004 0C92.8129 3.28125 99.1879 7.40625 100.688 11.625C98.2504 9.1875 96.0004 6.65625 94.0317 3.84375C93.7504 7.6875 99.3754 10.125 101.063 14.3438C98.7192 12.2812 96.4692 10.2188 94.5942 7.96875C93.9379 11.1562 100.594 14.1562 101.438 17.0625C99.1879 15.5625 97.0317 13.875 95.4379 12C95.8129 14.1562 98.0629 17.1562 102.657 20.8125C107.063 24.9375 114.282 30.0938 114.469 37.125C114.469 39.2812 113.532 40.9688 112.5 42.8438C111.844 44.0625 111.375 45.75 111.75 47.625Z" fill="#949599" />
                <path fillRule="evenodd" clipRule="evenodd" d="M0 47.8125H5.8125L10.4062 38.1562H21.6562L23.5312 47.8125H32.9062L24.375 13.3125H18.2812L0 47.8125ZM12 34.875L18.1875 23.0625L20.9062 34.875H12ZM41.4375 23.0625H49.3125L48.75 28.4062C51.0938 24.2812 53.5312 22.4062 56.1562 23.0625L55.125 30.9375C51.5625 29.4375 49.125 30.5625 48.0938 34.4062L46.5938 47.8125H38.25L41.4375 23.0625ZM62.3438 23.0625H69.9375L66.375 47.8125H58.7812L62.3438 23.0625ZM78.5625 15.5625H85.875L83.3438 33.6562H85.2188L94.3125 23.0625H101.625L91.5 33.6562L98.625 47.8125H88.875L84.75 37.0312H82.7812L81.2812 47.8125H73.875L78.5625 15.5625Z" fill="#0D3F84" />
            </svg>
            <h2 className="text-xl font-bold text-gray-800 tracking-tight">Admin Portal</h2>
        </div>
        
        {error && <div className="mb-4 text-red-500 text-center text-sm font-semibold">{error}</div>}
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full rounded-md border border-gray-300 p-2.5 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-md border border-gray-300 p-2.5 pr-10 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mt-6 transition-colors"
          >
            Authenticate
          </button>
        </form>
      </div>
    </div>
  );
}
