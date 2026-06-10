'use client';

import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ResumeData } from '@/lib/resume-schema';
import { storage } from '@/lib/storage';
import { createDefaultResume, createEmptyResume } from '@/lib/resume-defaults';

const RESUME_QUERY_KEY = 'resume';

// ============================================================================
// useResume Hook - Load and manage a single resume
// ============================================================================

export const useResume = (resumeId: string | null) => {
  return useQuery({
    queryKey: [RESUME_QUERY_KEY, resumeId],
    queryFn: async () => {
      if (!resumeId) return null;
      const resume = storage.loadResume(resumeId);
      if (!resume) {
        throw new Error(`Resume ${resumeId} not found`);
      }
      return resume;
    },
    enabled: !!resumeId,
    staleTime: Infinity,
  });
};

// ============================================================================
// useUpdateResume Hook - Update resume data
// ============================================================================

export const useUpdateResume = (resumeId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (resume: ResumeData) => {
      storage.saveResume(resume);
      return resume;
    },
    onSuccess: (updatedResume) => {
      queryClient.setQueryData([RESUME_QUERY_KEY, resumeId], updatedResume);
    },
  });
};

// ============================================================================
// useResumes Hook - Get list of all resumes
// ============================================================================

export const useResumes = () => {
  return useQuery({
    queryKey: [RESUME_QUERY_KEY, 'list'],
    queryFn: () => storage.getAllResumes(),
    staleTime: Infinity,
  });
};

// ============================================================================
// useCreateResume Hook - Create a new resume
// ============================================================================

export const useCreateResume = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (config: { name?: string; template?: 'default' | 'empty' } = {}) => {
      const resume = config.template === 'empty' 
        ? createEmptyResume(config.name) 
        : createDefaultResume(config.name);
      storage.saveResume(resume);
      return resume;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [RESUME_QUERY_KEY, 'list'] });
    },
  });
};

// ============================================================================
// useDeleteResume Hook - Delete a resume
// ============================================================================

export const useDeleteResume = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (resumeId: string) => {
      storage.deleteResume(resumeId);
      return resumeId;
    },
    onSuccess: (deletedId) => {
      queryClient.removeQueries({ queryKey: [RESUME_QUERY_KEY, deletedId] });
      queryClient.invalidateQueries({ queryKey: [RESUME_QUERY_KEY, 'list'] });
    },
  });
};

// ============================================================================
// useDuplicateResume Hook - Duplicate an existing resume
// ============================================================================

export const useDuplicateResume = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (resumeId: string) => {
      const original = storage.loadResume(resumeId);
      if (!original) {
        throw new Error(`Resume ${resumeId} not found`);
      }

      const duplicate: ResumeData = {
        ...original,
        id: Math.random().toString(36).substring(2, 11),
        name: `${original.name} (Copy)`,
        metadata: {
          template: "modern",
          css: "",
          notes: "",
          ...original.metadata,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      };

      storage.saveResume(duplicate);
      return duplicate;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [RESUME_QUERY_KEY, 'list'] });
    },
  });
};

// ============================================================================
// useLocalStorage Hook - Direct localStorage sync
// ============================================================================

export const useLocalStorage = <T,>(key: string, initialValue: T) => {
  // Get value from localStorage or use initial value
  const getStoredValue = (): T => {
    try {
      if (typeof window === 'undefined') {
        return initialValue;
      }
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return initialValue;
    }
  };

  const [storedValue, setStoredValue] = React.useState<T>(getStoredValue);

  // Update localStorage when value changes
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);

      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  };

  return [storedValue, setValue] as const;
};
