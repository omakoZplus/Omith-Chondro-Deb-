import { create } from 'zustand';
import { ViewMode } from '../types';

interface AppState {
  view: ViewMode;
  toast: { message: string, type: 'success' | 'error' } | null;
  isMobileMenuOpen: boolean;
  setView: (view: ViewMode) => void;
  showToast: (message: string, type?: 'success' | 'error') => void;
  closeToast: () => void;
  setMobileMenuOpen: (isOpen: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  view: 'create',
  toast: null,
  isMobileMenuOpen: false,
  setView: (view) => set({ view }),
  showToast: (message, type = 'success') => set({ toast: { message, type } }),
  closeToast: () => set({ toast: null }),
  setMobileMenuOpen: (isOpen) => set({ isMobileMenuOpen: isOpen }),
}));