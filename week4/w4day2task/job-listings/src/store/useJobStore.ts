import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface JobStore {
  filters: string[];
  addFilter: (filter: string) => void;
  removeFilter: (filter: string) => void;
  clearFilters: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export const useJobStore = create<JobStore>()(
  persist(
    (set) => ({
      filters: [],
      addFilter: (filter) =>
        set((state) => ({
          filters: state.filters.includes(filter)
            ? state.filters
            : [...state.filters, filter],
        })),
      removeFilter: (filter) =>
        set((state) => ({
          filters: state.filters.filter((f) => f !== filter),
        })),
      clearFilters: () => set({ filters: [] }),
      theme: 'dark',
      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === 'light' ? 'dark' : 'light',
        })),
    }),
    {
      name: 'job-listings-storage',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
