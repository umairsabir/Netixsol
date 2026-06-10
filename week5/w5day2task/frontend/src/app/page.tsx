'use client';

import React from 'react';
import { useAuth } from '../context/AuthContext';
import NotificationBell from '../components/NotificationBell';
import CommentSection from '../components/CommentSection';
import ProfileCard from '../components/ProfileCard';
import ThemeToggle from '../components/ThemeToggle';
import Link from 'next/link';
import { LogOut, LogIn, UserPlus, MessageSquare, Terminal, Zap } from 'lucide-react';

export default function HomePage() {
  const { user, logout, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-indigo-500 border-r-2 border-violet-500"></div>
          <span className="text-xs font-semibold tracking-widest text-slate-500 uppercase animate-pulse">Syncing Session...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 relative selection:bg-indigo-500 selection:text-white">
      {/* Floating Background Ambient Glowing Orbs */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[130px] pointer-events-none animate-float-slow"></div>
      <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-violet-500/5 rounded-full blur-[120px] pointer-events-none animate-float-medium"></div>
      <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Floating Header Navbar */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-slate-950/65 border-b border-slate-900/80 px-4 py-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-black bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent hover:scale-105 transition-transform duration-300">
              Comment system
            </span>
            <span className="flex items-center gap-1 px-2.5 py-0.5 text-[9px] font-black tracking-wider text-indigo-300 bg-indigo-500/10 border border-indigo-500/25 rounded-full animate-pulse">
              <Zap className="w-2.5 h-2.5 text-indigo-400" />
              LIVE
            </span>
          </Link>

          <nav className="flex items-center gap-4">
            <ThemeToggle />
            {user ? (
              <>
                <NotificationBell />
                <div className="hidden sm:block text-right">
                  <span className="block text-[9px] font-black text-slate-500 uppercase tracking-widest">Logged in</span>
                  <span className="block text-sm font-bold text-indigo-300 hover:text-indigo-200 transition-colors">{user.username}</span>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center gap-1.5 py-2 px-4 rounded-xl text-xs font-bold text-slate-400 hover:text-slate-100 hover:bg-slate-900 border border-slate-900 hover:border-slate-800 transition-all duration-200"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Logout
                </button>
              </>
            ) : (
              <div className="flex gap-2">
                <Link
                  href="/login"
                  className="flex items-center gap-1.5 py-2 px-4 rounded-xl text-xs font-bold text-slate-400 hover:text-slate-100 border border-transparent hover:bg-slate-900/50 transition-all"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="flex items-center gap-1.5 py-2.5 px-5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 hover:-translate-y-0.5 transition-all duration-300 shadow-lg shadow-indigo-500/25 animate-glow-pulse"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  Sign Up
                </Link>
              </div>
            )}
          </nav>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 relative z-10">
        {!user && (
          <div className="mb-6 p-8 rounded-3xl backdrop-blur-xl bg-slate-900/25 border border-slate-900/80 text-center relative overflow-hidden">
            <div className="absolute -top-12 -left-12 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight bg-gradient-to-r from-slate-100 via-indigo-200 to-purple-100 bg-clip-text text-transparent">
              Real-time WebSockets Discussions
            </h1>
            <p className="mt-3 text-slate-400 text-xs max-w-xl mx-auto leading-relaxed font-medium">
              Join a dynamic community dashboard synced instantly via NestJS WebSockets. Post discussions, toggle reactions, add nested replies and receive immediate alerts without refreshing!
            </p>
            <div className="mt-6 flex justify-center">
              <Link href="/register" className="py-2.5 px-6 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-lg shadow-indigo-500/20">
                Get Started
              </Link>
            </div>
          </div>
        )}

        {/* Dynamic Responsive Splitted Grid Layout */}
        {user ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Comments Feed Column */}
            <div className="lg:col-span-8 space-y-6">
              <CommentSection />
            </div>

            {/* User Profile Column */}
            <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
              <ProfileCard />
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-6 w-full">
            <CommentSection />
          </div>
        )}
      </main>


    </div>
  );
}
