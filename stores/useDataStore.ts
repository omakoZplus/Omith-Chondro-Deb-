
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { HistoryItem, AppSettings, CreationMode, OutputMode, ArtistProfile } from '../types';

const DEFAULT_SETTINGS: AppSettings = {
    theme: 'dark',
    defaultCreationMode: 'style',
    defaultLyricsModel: 'pro',
    defaultStyleModel: 'pro',
    defaultTemperature: 0.8,
    defaultLanguage: 'English',
    globalNegativePrompt: '',
    reduceMotion: false,
    autoCopy: false,
    enableGoogleSearch: true,
    enableDeepMode: false,
    defaultImageModeOutput: 'instrumental',
    defaultAudioModeOutput: 'instrumental',
    defaultSunoVersion: 'v5'
};

interface DataState {
  history: HistoryItem[];
  settings: AppSettings;
  profiles: ArtistProfile[];
  
  addToHistory: (item: HistoryItem) => void;
  clearHistory: () => void;
  deleteHistoryItems: (ids: string[]) => void;
  toggleFavorite: (id: string) => void;
  importHistory: (items: HistoryItem[]) => void;
  
  updateSettings: (settings: Partial<AppSettings>) => void;
  resetSettings: () => void;

  addProfile: (profile: ArtistProfile) => void;
  deleteProfile: (id: string) => void;
}

export const useDataStore = create<DataState>()(
  persist(
    (set, get) => ({
      history: [],
      settings: DEFAULT_SETTINGS,
      profiles: [],

      addToHistory: (item) => {
        const currentHistory = get().history;
        // Keep in memory state, limit to 50
        const updated = [item, ...currentHistory].slice(0, 50);
        set({ history: updated });
      },

      clearHistory: () => set({ history: [] }),
      
      deleteHistoryItems: (ids) => {
          set((state) => ({
              history: state.history.filter(item => !ids.includes(item.id))
          }));
      },

      toggleFavorite: (id) => {
          set((state) => ({
              history: state.history.map(item => 
                  item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
              )
          }));
      },
      
      importHistory: (items) => set({ history: items }),

      updateSettings: (newSettings) => set((state) => ({ 
        settings: { ...state.settings, ...newSettings } 
      })),

      resetSettings: () => set({ settings: DEFAULT_SETTINGS }),

      addProfile: (profile) => set((state) => ({
          profiles: [...state.profiles, profile]
      })),

      deleteProfile: (id) => set((state) => ({
          profiles: state.profiles.filter(p => p.id !== id)
      })),
    }),
    {
      name: 'suno_architect_storage',
      partialize: (state) => ({
        settings: state.settings,
        profiles: state.profiles,
        // Strip base64 media from localStorage to prevent QuotaExceededError
        history: state.history.slice(0, 50).map(item => {
            const { imageBase64, audioBase64, ...rest } = item;
            return rest;
        })
      })
    }
  )
);