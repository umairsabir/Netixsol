import { ResumeData } from './resume-schema';

const STORAGE_PREFIX = 'resume_builder_';
const RESUMES_LIST_KEY = `${STORAGE_PREFIX}list`;

// ============================================================================
// Storage Utilities
// ============================================================================

export const storage = {
  // Save a resume to localStorage
  saveResume: (resume: ResumeData): void => {
    try {
      const key = `${STORAGE_PREFIX}${resume.id}`;
      localStorage.setItem(key, JSON.stringify(resume));
      
      // Update the resumes list
      const list = storage.getResumesList();
      if (!list.find(id => id === resume.id)) {
        list.push(resume.id);
        localStorage.setItem(RESUMES_LIST_KEY, JSON.stringify(list));
      }
    } catch (error) {
      console.error('Failed to save resume:', error);
      throw error;
    }
  },

  // Load a resume from localStorage
  loadResume: (id: string): ResumeData | null => {
    try {
      const key = `${STORAGE_PREFIX}${id}`;
      const data = localStorage.getItem(key);
      if (!data) return null;
      return JSON.parse(data) as ResumeData;
    } catch (error) {
      console.error('Failed to load resume:', error);
      return null;
    }
  },

  // Get list of all resume IDs
  getResumesList: (): string[] => {
    try {
      const data = localStorage.getItem(RESUMES_LIST_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to get resumes list:', error);
      return [];
    }
  },

  // Get all resumes
  getAllResumes: (): ResumeData[] => {
    try {
      const ids = storage.getResumesList();
      return ids
        .map(id => storage.loadResume(id))
        .filter((resume): resume is ResumeData => resume !== null);
    } catch (error) {
      console.error('Failed to get all resumes:', error);
      return [];
    }
  },

  // Delete a resume
  deleteResume: (id: string): void => {
    try {
      const key = `${STORAGE_PREFIX}${id}`;
      localStorage.removeItem(key);
      
      // Update the list
      const list = storage.getResumesList();
      const filtered = list.filter(resumeId => resumeId !== id);
      localStorage.setItem(RESUMES_LIST_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Failed to delete resume:', error);
      throw error;
    }
  },

  // Clear all resumes
  clearAll: (): void => {
    try {
      const ids = storage.getResumesList();
      ids.forEach(id => {
        const key = `${STORAGE_PREFIX}${id}`;
        localStorage.removeItem(key);
      });
      localStorage.removeItem(RESUMES_LIST_KEY);
    } catch (error) {
      console.error('Failed to clear all resumes:', error);
      throw error;
    }
  },

  // Export resume as JSON
  exportResume: (resume: ResumeData): string => {
    return JSON.stringify(resume, null, 2);
  },

  // Import resume from JSON
  importResume: (json: string): ResumeData => {
    try {
      const resume = JSON.parse(json) as ResumeData;
      // Validate that it has required fields
      if (!resume.id || !resume.basics) {
        throw new Error('Invalid resume format');
      }
      return resume;
    } catch (error) {
      console.error('Failed to import resume:', error);
      throw error;
    }
  },
};

// ============================================================================
// SessionStorage utilities for temporary editor state
// ============================================================================

const SESSION_PREFIX = 'resume_builder_session_';

export const sessionStorage_util = {
  // Save temporary editor state
  saveEditorState: (resumeId: string, state: Record<string, any>): void => {
    try {
      const key = `${SESSION_PREFIX}${resumeId}`;
      sessionStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save editor state:', error);
    }
  },

  // Load temporary editor state
  loadEditorState: (resumeId: string): Record<string, any> | null => {
    try {
      const key = `${SESSION_PREFIX}${resumeId}`;
      const data = sessionStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to load editor state:', error);
      return null;
    }
  },

  // Clear editor state
  clearEditorState: (resumeId: string): void => {
    try {
      const key = `${SESSION_PREFIX}${resumeId}`;
      sessionStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to clear editor state:', error);
    }
  },
};
