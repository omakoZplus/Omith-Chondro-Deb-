
export interface StylePrompt {
  title: string;
  description: string;
  content: string;
  tags: string[];
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface GenerationResult {
  prompts: StylePrompt[];
  groundingSources?: GroundingSource[];
}

export interface LyricsResult {
    title: string;
    lyrics: string;
    stylePrompt?: string;       // Primary prompt (Flash mode)
    stylePrompts?: string[];    // Multiple prompts (Pro mode: v1, v2, v3)
    type: 'flash' | 'pro';
    translation?: {
        language: string;
        title: string;
        lyrics: string;
    };
    groundingSources?: GroundingSource[];
}

export interface GenerationConstraints {
    bpm?: string;
    key?: string;
    negativePrompt?: string;
}

export interface ArtistProfile {
    id: string;
    name: string;
    description: string; // The "Base Sound" or "Theme"
    color: string;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  theme: string;
  type: 'style' | 'lyrics' | 'image' | 'audio';
  prompts?: StylePrompt[];
  lyrics?: LyricsResult;
  imageBase64?: string;
  audioBase64?: string;
  isFavorite?: boolean;
}

export enum GenerationStatus {
  IDLE = 'IDLE',
  THINKING = 'THINKING',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR'
}

export type ViewMode = 'create' | 'library' | 'settings' | 'songBuilder' | 'snake' | 'pong';
export type CreationMode = 'style' | 'lyrics' | 'image' | 'audio';
export type OutputMode = 'instrumental' | 'lyrics';
export type AppTheme = 'dark' | 'light' | 'retro' | 'hacker' | 'folk';
export type SunoVersion = 'v5' | 'v4.5' | 'v4';
export type PromptFormat = 'standard' | 'json' | 'descriptive';

export interface AppSettings {
    theme: AppTheme;
    defaultCreationMode: CreationMode;
    defaultLyricsModel: 'flash' | 'pro';
    defaultStyleModel: 'flash' | 'pro';
    defaultTemperature: number;
    defaultLanguage: string;
    globalNegativePrompt: string;
    reduceMotion: boolean;
    autoCopy: boolean;
    enableGoogleSearch: boolean;
    enableDeepMode: boolean;
    defaultImageModeOutput: OutputMode;
    defaultAudioModeOutput: OutputMode;
    defaultSunoVersion: SunoVersion;
}