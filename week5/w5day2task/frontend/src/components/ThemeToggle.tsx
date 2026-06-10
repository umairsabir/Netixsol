'use client';

import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Check localStorage or system preference
    try {
      const savedTheme = localStorage.getItem('theme') as 'dark' | 'light' | null;
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const initialTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
      
      setTheme(initialTheme);
      
      if (initialTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (e) {
      console.error(e);
    }
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    
    try {
      localStorage.setItem('theme', nextTheme);
      if (nextTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (!mounted) {
    // Render a transparent placeholder to avoid layout shifts before hydration
    return <div className="w-9.5 h-9.5" />;
  }

  return (
    <button
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      className="relative flex items-center justify-center w-9.5 h-9.5 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-900/30 text-slate-400 hover:text-slate-200 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer overflow-hidden shadow-inner"
    >
      <div className="relative w-5 h-5 flex items-center justify-center">
        {theme === 'dark' ? (
          <Sun className="w-5 h-5 text-amber-400 transition-all duration-500 rotate-0 scale-100 animate-spin-slow" />
        ) : (
          <Moon className="w-5 h-5 text-indigo-500 transition-all duration-500 rotate-180 scale-100" />
        )}
      </div>
    </button>
  );
}
