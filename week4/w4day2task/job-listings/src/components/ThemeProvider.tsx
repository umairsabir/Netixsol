'use client';

import { useEffect } from 'react';
import { useJobStore } from '@/store/useJobStore';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useJobStore((state) => state.theme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return <>{children}</>;
}
