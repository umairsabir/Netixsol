'use client';

import { useJobStore } from '@/store/useJobStore';
import { X } from 'lucide-react';

export default function FilterBar() {
  const { filters, removeFilter, clearFilters } = useJobStore();

  if (filters.length === 0) return null;

  return (
    <div 
      className="fade-in"
      style={{
        backgroundColor: 'var(--card-bg)',
        padding: '20px 40px',
        borderRadius: 'var(--radius)',
        boxShadow: 'var(--shadow)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: '-112px',
        marginBottom: '40px',
        position: 'relative',
        zIndex: 10
      }}
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
        {filters.map((filter) => (
          <div 
            key={filter}
            style={{
              display: 'flex',
              alignItems: 'center',
              borderRadius: '4px',
              overflow: 'hidden'
            }}
          >
            <span 
              style={{
                backgroundColor: 'var(--accent-light)',
                color: 'var(--accent)',
                padding: '8px 12px',
                fontWeight: 700,
                fontSize: '13px'
              }}
            >
              {filter}
            </span>
            <button
              onClick={() => removeFilter(filter)}
              style={{
                backgroundColor: 'var(--accent)',
                border: 'none',
                padding: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                transition: 'var(--transition)'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--very-dark-grayish-cyan)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--accent)')}
            >
              <X size={14} strokeWidth={3} />
            </button>
          </div>
        ))}
      </div>
      <button
        onClick={clearFilters}
        style={{
          border: 'none',
          background: 'none',
          color: 'var(--text-secondary)',
          fontWeight: 700,
          cursor: 'pointer',
          fontSize: '15px',
          padding: '0'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.textDecoration = 'underline';
          e.currentTarget.style.color = 'var(--accent)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.textDecoration = 'none';
          e.currentTarget.style.color = 'var(--text-secondary)';
        }}
      >
        Clear
      </button>
    </div>
  );
}
