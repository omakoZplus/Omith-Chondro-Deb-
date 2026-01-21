
import React from 'react';
import { useCreateStore } from '../stores/useCreateStore';
import { useDataStore } from '../stores/useDataStore';
import { useGenerator } from '../hooks/useGenerator';
import { MediaInput } from '../components/features/MediaInput';
import { InputSection } from '../components/features/InputSection';
import { ConstraintsAccordion } from '../components/features/ConstraintsAccordion';
import { ResultsGrid } from '../components/features/ResultsGrid';
import { SongStudio } from '../components/features/SongStudio';
import { PersonaSelector } from '../components/features/PersonaSelector';
import { Music, Mic2, Image, Sparkles, AlertCircle } from 'lucide-react';
import { GenerationStatus } from '../types';

export const CreateView: React.FC = () => {
    const { 
        creationMode, setCreationMode, status, error, 
        themeInput, selectedImage, selectedAudio,
        studioGenre, studioMood 
    } = useCreateStore();
    const { settings } = useDataStore();
    const { handleGenerate } = useGenerator();

    const getActionButtonText = () => {
        if (status === GenerationStatus.THINKING) {
           if (creationMode === 'style' && settings.enableDeepMode) return "Thinking Deeply...";
           return "Generating...";
        }
        
        let action = "Generate";
        let subject = "Prompts";
        
        if (creationMode === 'lyrics') {
            subject = "Lyrics";
        } else if (creationMode === 'image') {
            subject = settings.defaultImageModeOutput === 'lyrics' ? "Lyrics from Vibe" : "Prompts from Vibe";
        } else if (creationMode === 'audio') {
            subject = settings.defaultAudioModeOutput === 'lyrics' ? "Lyrics from Audio" : "Prompts from Audio";
        }
        
        return `${action} ${subject}`;
    };

    return (
        <div className="animate-in fade-in">
             {/* Mode Switcher */}
             <div className="flex items-center justify-center mb-6">
                <div 
                    className="bg-surface p-1 rounded-xl border border-border flex gap-1 w-full md:w-auto overflow-x-auto"
                    role="tablist"
                    aria-label="Creation Mode"
                >
                    {[
                        { id: 'style', label: 'Style', icon: Music },
                        { id: 'lyrics', label: 'Lyrics', icon: Mic2 },
                        { id: 'image', label: 'Visual', icon: Image },
                        { id: 'audio', label: 'Audio', icon: Music }
                    ].map(mode => (
                        <button 
                            key={mode.id}
                            onClick={() => setCreationMode(mode.id as any)}
                            className={`flex-1 md:flex-none px-4 md:px-6 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
                                creationMode === mode.id 
                                ? 'bg-element text-text-main shadow-sm' 
                                : 'text-text-muted hover:text-text-main hover:bg-background/50'
                            }`}
                            role="tab"
                            aria-selected={creationMode === mode.id}
                        >
                            <mode.icon size={16} /> {mode.label}
                        </button>
                    ))}
                </div>
            </div>

            <section className="space-y-4">
                {/* Removed overflow-hidden to allow Template dropdown to show */}
                <div className="bg-surface border border-border rounded-2xl p-1 transition-all ring-1 ring-border focus-within:ring-primary/30 shadow-sm">
                    <MediaInput />
                    
                    {/* Persona Selector for "Your Theme" */}
                    {creationMode === 'style' && (
                        <div className="px-4 pt-2">
                             <PersonaSelector />
                        </div>
                    )}

                    {creationMode === 'style' && <SongStudio />}
                    
                    <InputSection />
                    {creationMode !== 'lyrics' && <ConstraintsAccordion />}
                </div>

                <div className="flex justify-end pt-2">
                    <button
                        onClick={handleGenerate}
                        disabled={(creationMode !== 'image' && creationMode !== 'audio' && !themeInput.trim() && !studioGenre && !studioMood) || 
                                 (creationMode === 'image' && !selectedImage) || 
                                 (creationMode === 'audio' && !selectedAudio) || 
                                 status === GenerationStatus.THINKING}
                        className="bg-primary text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-primary-hover transition-all shadow-lg shadow-primary/20 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                        aria-live="polite"
                    >
                        {status === GenerationStatus.THINKING ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                {getActionButtonText()}
                            </>
                        ) : (
                            <>
                                <Sparkles size={16} />
                                {getActionButtonText()}
                            </>
                        )}
                    </button>
                </div>
            </section>

             {/* Error State */}
             {status === GenerationStatus.ERROR && error && (
                <div 
                    className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3 text-red-400 animate-in fade-in slide-in-from-top-2 mt-4"
                    role="alert"
                >
                    <AlertCircle size={20} />
                    <p>{error}</p>
                </div>
            )}

            <ResultsGrid />
        </div>
    );
};