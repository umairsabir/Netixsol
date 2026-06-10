'use client';

import { Job } from '@/data/jobs';
import { useJobStore } from '@/store/useJobStore';
import Link from 'next/link';

export default function JobCard({ job }: { job: Job }) {
  const buttonColors = [
    { light: '#ff4d4d', dark: '#b30000' }, // Red
    { light: '#4d94ff', dark: '#0047b3' }, // Blue
    { light: '#4dff88', dark: '#00b33c' }, // Green
    { light: '#ffcc4d', dark: '#b38600' }, // Yellow/Amber
    { light: '#d94dff', dark: '#730099' }, // Purple
    { light: '#4dffff', dark: '#00b3b3' }, // Cyan
    { light: '#ff4db8', dark: '#b30071' }, // Pink
  ];

  const colors = buttonColors[job.id % buttonColors.length];
  const { addFilter, filters } = useJobStore();
  const tags = [job.role, job.level, ...job.languages, ...job.tools];

  return (
    <div 
      className="job-card fade-in"
      style={{
        backgroundColor: 'var(--card-bg)',
        padding: '32px 40px',
        borderRadius: 'var(--radius)',
        boxShadow: 'var(--shadow)',
        display: 'flex',
        alignItems: 'center',
        gap: '32px',
        borderLeft: job.featured ? '5px solid var(--accent)' : 'none',
        position: 'relative',
        transition: 'var(--transition)'
      }}
    >
      <div 
        className="company-logo"
        style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: `radial-gradient(circle at 35% 35%, ${colors.light} 0%, ${colors.dark} 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          color: '#fff',
          fontWeight: 800,
          fontSize: '10px',
          textAlign: 'center',
          padding: '10px',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          lineHeight: '1.2',
          transition: 'all 0.3s ease',
          position: 'relative',
          boxShadow: `
            inset 0 0 12px rgba(0,0,0,0.5), 
            0 8px 16px rgba(0,0,0,0.3),
            inset 0 4px 6px rgba(255,255,255,0.4)
          `
        }}
      >
        <span style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)', zIndex: 2 }}>{job.company}</span>
        {/* Glossy Overlay */}
        <div style={{
          position: 'absolute',
          top: '5%',
          left: '15%',
          width: '70%',
          height: '40%',
          background: 'linear-gradient(to bottom, rgba(255,255,255,0.4) 0%, transparent 100%)',
          borderRadius: '40% 40% 80% 80%',
          zIndex: 1
        }}></div>
      </div>

      <style jsx>{`
        .job-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 15px 30px -5px rgba(91, 164, 164, 0.3);
        }

        .company-logo::after {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
          opacity: 0;
          transition: opacity 0.4s ease;
        }
        
        .job-card:hover .company-logo {
          transform: translateX(-12px) scale(1.1) rotate(-8deg);
          box-shadow: 0 0 30px var(--accent), 0 12px 24px rgba(0,0,0,0.5);
        }
        
        .job-card:hover .company-logo::after {
          opacity: 1;
        }
      `}</style>

      <div style={{ flexGrow: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
          <h3 style={{ color: 'var(--accent)', fontSize: '18px' }}>{job.company}</h3>
          <div style={{ display: 'flex', gap: '8px' }}>
            {job.new && (
              <span style={{ 
                backgroundColor: 'var(--accent)', 
                color: 'white', 
                padding: '6px 8px 4px', 
                borderRadius: '20px', 
                fontSize: '11px', 
                fontWeight: 700,
                textTransform: 'uppercase'
              }}>
                New!
              </span>
            )}
            {job.featured && (
              <span style={{ 
                backgroundColor: 'var(--very-dark-grayish-cyan)', 
                color: 'white', 
                padding: '6px 8px 4px', 
                borderRadius: '20px', 
                fontSize: '11px', 
                fontWeight: 700,
                textTransform: 'uppercase'
              }}>
                Featured
              </span>
            )}
          </div>
        </div>

        <Link href={`/jobs/${job.id}`} className="job-heading-link">
          <h2 className="job-position">
            {job.position}
          </h2>
        </Link>

        <div style={{ display: 'flex', gap: '16px', color: 'var(--text-secondary)', fontSize: '15px' }}>
          <span>{job.postedAt}</span>
          <span>•</span>
          <span>{job.contract}</span>
          <span>•</span>
          <span>{job.location}</span>
        </div>
      </div>

      <div 
        style={{ 
          display: 'flex', 
          flexWrap: 'nowrap', 
          gap: '12px', 
          justifyContent: 'center',
          alignItems: 'center',
          padding: '0 20px',
          overflowX: 'auto',
          msOverflowStyle: 'none',
          scrollbarWidth: 'none'
        }}
        className="hide-scrollbar"
      >
        {tags.map((tag) => (
          <button
            key={tag}
            onClick={() => addFilter(tag)}
            style={{
              backgroundColor: 'var(--accent-light)',
              color: 'var(--accent)',
              padding: '8px 12px',
              borderRadius: '4px',
              border: 'none',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'var(--transition)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--accent)';
              e.currentTarget.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--accent-light)';
              e.currentTarget.style.color = 'var(--accent)';
            }}
          >
            {tag}
          </button>
        ))}
      </div>
      
      {/* Mobile view adjustments would normally go in CSS but I'll add a media query hook if needed */}
      <style jsx>{`
        @media (max-width: 768px) {
          div[style*="padding: 32px 40px"] {
            flex-direction: column;
            align-items: flex-start !important;
            padding: 32px 24px 24px !important;
            gap: 16px !important;
            margin-top: 40px;
          }
          div[style*="width: 88px"] {
            position: absolute !important;
            top: -44px;
            left: 24px;
            width: 48px !important;
            height: 48px !important;
          }
          div[style*="justify-content: flex-end"] {
            justify-content: flex-start !important;
            width: 100%;
            border-top: 1px solid var(--text-secondary);
            padding-top: 16px;
            max-width: none !important;
          }
        }
      `}</style>
    </div>
  );
}
