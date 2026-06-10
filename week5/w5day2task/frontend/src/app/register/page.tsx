'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const { user, login } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [bio, setBio] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const avatarUrl = profilePicture || `https://api.dicebear.com/7.x/adventurer/svg?seed=${username || 'fallback'}`;
      const res = await axios.post('/auth/register', {
        username,
        email,
        password,
        bio,
        profilePicture: avatarUrl,
      });
      login(res.data.user, res.data.token);
      router.push('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please check inputs and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen relative flex items-start justify-center bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-950 via-slate-950 to-black px-4 pt-6 pb-12 sm:px-6 lg:px-8">
      {/* Go Back Home Button */}
      <Link
        href="/"
        className="fixed top-6 left-6 flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-200 bg-slate-900/50 backdrop-blur-md border border-slate-800/80 px-3.5 py-1.5 rounded-full transition-all duration-300 shadow-md hover:-translate-y-0.5 active:translate-y-0 z-50"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
        </svg>
        Go Back Home
      </Link>

      {/* Background glowing orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>

      <div className="max-w-md w-full space-y-5 pt-5 pb-6 px-6 backdrop-blur-xl bg-slate-900/60 border border-slate-800 rounded-3xl shadow-2xl relative z-10 mt-4 mb-8">
        <div>
          <h2 className="mt-1 text-center text-2xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Create Account
          </h2>
          <p className="mt-1 text-center text-xs text-slate-400">
            Join us to post comments, likes and follow creators
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-2.5 rounded-xl text-sm text-center">
            {error}
          </div>
        )}

        <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
          <div className="rounded-md space-y-3">
            <div>
              <label htmlFor="username" className="text-xs font-semibold text-slate-400 block mb-1">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="appearance-none rounded-lg relative block w-full px-3 py-1.5 border border-slate-800 bg-slate-950/70 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-300 text-xs"
                placeholder="john_doe"
              />
            </div>
            <div>
              <label htmlFor="email-address" className="text-xs font-semibold text-slate-400 block mb-1">
                Email Address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-lg relative block w-full px-3 py-1.5 border border-slate-800 bg-slate-950/70 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-300 text-xs"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="text-xs font-semibold text-slate-400 block mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none rounded-lg relative block w-full pl-3 pr-10 py-1.5 border border-slate-800 bg-slate-950/70 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-300 text-xs"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 focus:outline-none transition-colors duration-200"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4.5 h-4.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.815 7.815 3 3m-3-3a3 3 0 0 1-4.243-4.243m0 0-3.65-3.65m0 0a3 3 0 0 0 4.243 4.243m-4.243-4.243L19.5 19.5" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4.5 h-4.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <div>
              <label htmlFor="bio" className="text-xs font-semibold text-slate-400 block mb-1">
                Bio (Optional)
              </label>
              <textarea
                id="bio"
                name="bio"
                rows={2}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="appearance-none rounded-lg relative block w-full px-3 py-1.5 border border-slate-800 bg-slate-950/70 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-300 text-xs resize-none"
                placeholder="Tell us about yourself..."
              />
            </div>
            <div>
              <label htmlFor="avatar" className="text-xs font-semibold text-slate-400 block mb-1">
                Profile Image URL (Optional)
              </label>
              <input
                id="avatar"
                name="profilePicture"
                type="text"
                value={profilePicture}
                onChange={(e) => setProfilePicture(e.target.value)}
                className="appearance-none rounded-lg relative block w-full px-3 py-1.5 border border-slate-800 bg-slate-950/70 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-300 text-xs"
                placeholder="https://example.com/avatar.jpg"
              />
            </div>
          </div>

          <div className="pt-1">
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 shadow-lg shadow-indigo-500/20"
            >
              {loading ? 'Registering...' : 'Sign Up'}
            </button>
          </div>
        </form>

        <div className="text-center mt-3">
          <p className="text-xs text-slate-400">
            Already have an account?{' '}
            <Link href="/login" className="font-bold text-indigo-400 hover:text-indigo-300 transition-colors duration-200">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
