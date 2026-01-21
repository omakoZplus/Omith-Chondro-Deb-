
import { create } from 'zustand';
import { CreationMode, GenerationStatus, StylePrompt, LyricsResult, GroundingSource, HistoryItem, SunoVersion, PromptFormat } from '../types';

interface CreateState {
  themeInput: string;
  creationMode: CreationMode;
  selectedImage: string | null;
  selectedAudio: string | null;
  status: GenerationStatus;
  error: string | null;
  
  // Results
  styleResults: StylePrompt[];
  lyricsResult: LyricsResult | null;
  groundingSources: GroundingSource[];
  
  // Constraints
  bpm: string;
  keySignature: string;
  negativePrompt: string;
  
  // Lyrics Options
  lyricsModel: 'flash' | 'pro';
  lyricsLanguage: string;
  
  // Version & Format Control
  sunoVersion: SunoVersion;
  promptFormat: PromptFormat;
  
  // Sonic Persona (Theme Engine)
  activeProfileId: string | null;

  // Song Studio State
  studioGenre: string;
  studioMood: string;
  studioVocals: string;
  studioInstruments: string[];
  studioProduction: string[];
  studioVst: string[];
  studioInfluences: string;

  // Actions
  setThemeInput: (v: string) => void;
  setCreationMode: (v: CreationMode) => void;
  setSelectedImage: (v: string | null) => void;
  setSelectedAudio: (v: string | null) => void;
  setStatus: (v: GenerationStatus) => void;
  setError: (v: string | null) => void;
  setResults: (data: { styles?: StylePrompt[], lyrics?: LyricsResult | null, sources?: GroundingSource[] }) => void;
  
  setBpm: (v: string) => void;
  setKeySignature: (v: string) => void;
  setNegativePrompt: (v: string) => void;
  
  setLyricsModel: (v: 'flash' | 'pro') => void;
  setLyricsLanguage: (v: string) => void;
  setSunoVersion: (v: SunoVersion) => void;
  setPromptFormat: (v: PromptFormat) => void;
  setActiveProfileId: (v: string | null) => void;

  setLyricsTranslation: (data: { language: string, title: string, lyrics: string }) => void;

  // Studio Actions
  setStudioGenre: (v: string) => void;
  setStudioMood: (v: string) => void;
  setStudioVocals: (v: string) => void;
  setStudioInfluences: (v: string) => void;
  toggleStudioInstrument: (v: string) => void;
  toggleStudioProduction: (v: string) => void;
  toggleStudioVst: (v: string) => void;
  resetStudio: () => void;

  restoreFromHistory: (item: HistoryItem) => void;
}

export const useCreateStore = create<CreateState>((set) => ({
  themeInput: '',
  creationMode: 'style',
  selectedImage: null,
  selectedAudio: null,
  status: GenerationStatus.IDLE,
  error: null,
  
  styleResults: [],
  lyricsResult: null,
  groundingSources: [],
  
  bpm: '',
  keySignature: '',
  negativePrompt: '',
  
  lyricsModel: 'pro',
  lyricsLanguage: 'English',
  sunoVersion: 'v5',
  promptFormat: 'standard',
  activeProfileId: null,

  // Song Studio Defaults
  studioGenre: '',
  studioMood: '',
  studioVocals: '',
  studioInstruments: [],
  studioProduction: [],
  studioVst: [],
  studioInfluences: '',

  setThemeInput: (v) => set({ themeInput: v }),
  setCreationMode: (v) => set({ creationMode: v }),
  setSelectedImage: (v) => set({ selectedImage: v }),
  setSelectedAudio: (v) => set({ selectedAudio: v }),
  setStatus: (v) => set({ status: v }),
  setError: (v) => set({ error: v }),
  setResults: ({ styles, lyrics, sources }) => set(state => ({
      styleResults: styles !== undefined ? styles : state.styleResults,
      lyricsResult: lyrics !== undefined ? lyrics : state.lyricsResult,
      groundingSources: sources !== undefined ? sources : state.groundingSources
  })),
  
  setBpm: (v) => set({ bpm: v }),
  setKeySignature: (v) => set({ keySignature: v }),
  setNegativePrompt: (v) => set({ negativePrompt: v }),
  
  setLyricsModel: (v) => set({ lyricsModel: v }),
  setLyricsLanguage: (v) => set({ lyricsLanguage: v }),
  setSunoVersion: (v) => set({ sunoVersion: v }),
  setPromptFormat: (v) => set({ promptFormat: v }),
  setActiveProfileId: (v) => set({ activeProfileId: v }),

  setLyricsTranslation: (data) => set((state) => ({
      lyricsResult: state.lyricsResult ? { ...state.lyricsResult, translation: data } : null
  })),

  setStudioGenre: (v) => set({ studioGenre: v }),
  setStudioMood: (v) => set({ studioMood: v }),
  setStudioVocals: (v) => set({ studioVocals: v }),
  setStudioInfluences: (v) => set({ studioInfluences: v }),
  
  toggleStudioInstrument: (v) => set((state) => {
      const current = state.studioInstruments;
      return { studioInstruments: current.includes(v) ? current.filter(i => i !== v) : [...current, v] };
  }),
  toggleStudioProduction: (v) => set((state) => {
      const current = state.studioProduction;
      return { studioProduction: current.includes(v) ? current.filter(i => i !== v) : [...current, v] };
  }),
  toggleStudioVst: (v) => set((state) => {
      const current = state.studioVst;
      return { studioVst: current.includes(v) ? current.filter(i => i !== v) : [...current, v] };
  }),
  
  resetStudio: () => set({
      studioGenre: '',
      studioMood: '',
      studioVocals: '',
      studioInstruments: [],
      studioProduction: [],
      studioVst: [],
      studioInfluences: '',
      bpm: '' // Reset BPM as well since it's part of studio now
  }),

  restoreFromHistory: (item) => {
      set({
          themeInput: item.theme,
          styleResults: item.prompts || [],
          lyricsResult: item.lyrics || null,
          creationMode: item.type,
          groundingSources: [], // Reset sources on restore usually
          status: GenerationStatus.COMPLETE,
          error: null
      });

      if (item.type === 'image' && item.imageBase64) {
          set({ selectedImage: item.imageBase64 });
      }
      if (item.type === 'audio' && item.audioBase64) {
          set({ selectedAudio: item.audioBase64 });
      }
  }
}));