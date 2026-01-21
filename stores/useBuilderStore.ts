
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface BuilderState {
  title: string;
  style: string;
  lyrics: string;
  bpm: string;
  keySignature: string;
  
  setTitle: (v: string) => void;
  setStyle: (v: string) => void;
  setLyrics: (v: string) => void;
  setBpm: (v: string) => void;
  setKeySignature: (v: string) => void;
  resetBuilder: () => void;
  loadProject: (data: { title?: string, style?: string, lyrics?: string }) => void;
}

export const useBuilderStore = create<BuilderState>()(
    persist(
        (set) => ({
            title: '',
            style: '',
            lyrics: '',
            bpm: '',
            keySignature: '',

            setTitle: (v) => set({ title: v }),
            setStyle: (v) => set({ style: v }),
            setLyrics: (v) => set({ lyrics: v }),
            setBpm: (v) => set({ bpm: v }),
            setKeySignature: (v) => set({ keySignature: v }),
            
            resetBuilder: () => set({ title: '', style: '', lyrics: '', bpm: '', keySignature: '' }),
            
            loadProject: (data) => set((state) => ({
                title: data.title || state.title,
                style: data.style || state.style,
                lyrics: data.lyrics || state.lyrics
            }))
        }),
        {
            name: 'suno_architect_builder'
        }
    )
);
