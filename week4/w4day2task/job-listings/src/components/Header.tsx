'use client';

import { useJobStore } from '@/store/useJobStore';
import { Sun, Moon, Rocket } from 'lucide-react';

export default function Header() {
  const { theme, toggleTheme } = useJobStore();

  return (
    <header 
      className="header" 
      style={{ position: 'relative', overflow: 'hidden', height: '180px', backgroundColor: '#00bfa5' }}
      onMouseMove={(e) => {
        const circles = document.querySelectorAll('.header-circle');
        const x = e.clientX / window.innerWidth;
        const y = e.clientY / 180;
        circles.forEach((circle, index) => {
          const speed = (index + 1) * 15;
          (circle as HTMLElement).style.transform = `translate(${x * speed}px, ${y * speed}px)`;
        });
      }}
    >
      {/* Background Circles from Image */}
      <div className="header-circle circle-1"></div>
      <div className="header-circle circle-2"></div>
      <div className="header-circle circle-3"></div>
      
      <div 
        style={{
          maxWidth: '1110px',
          margin: '0 auto',
          padding: '40px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'relative',
          zIndex: 10,
          height: '100%'
        }}
      >
        {/* Left Side: Icon + Text */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div className="glass-icon rocket-container">
            <Rocket size={32} color="white" className="rocket-icon" />
          </div>
          <div style={{ color: 'white' }}>
            <h1 style={{ fontSize: '32px', fontWeight: 800, margin: 0, letterSpacing: '-0.5px' }}>Job Listings</h1>
            <p style={{ margin: '4px 0 0', opacity: 0.9, fontSize: '15px', fontWeight: 500 }}>Find your dream developer role</p>
          </div>
        </div>

        {/* Right Side: Toggle */}
        <button
          onClick={toggleTheme}
          className="glass-toggle"
          aria-label="Toggle Theme"
        >
          {theme === 'light' ? <Moon size={22} fill="white" /> : <Sun size={22} fill="white" />}
        </button>
      </div>
    </header>
  );
}
