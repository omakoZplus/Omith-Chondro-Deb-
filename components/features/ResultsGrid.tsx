import React from 'react';
import { useCreateStore } from '../../stores/useCreateStore';
import { useAppStore } from '../../stores/useAppStore';
import { GenerationStatus } from '../../types';
import { PromptCard } from '../PromptCard';
import { LyricsCard } from '../LyricsCard';
import { PromptCardSkeleton, LyricsSkeleton } from '../Skeletons';
import { Search, ExternalLink, AlertCircle } from 'lucide-react';

export const ResultsGrid: React.FC = () => {
    const { 
        status, styleResults, lyricsResult, groundingSources, 
        creationMode, setThemeInput, themeInput
    } = useCreateStore();
    const { showToast } = useAppStore();

    const handleTagClick = (tag: string) => {
        const prev = themeInput;
        const separator = prev.trim().length > 0 ? (prev.trim().endsWith(',') ? ' ' : ', ') : '';
        setThemeInput(prev + separator + tag);
        showToast(`Added "${tag}" to input`);
    };

    const hasSources = Array.isArray(groundingSources) && groundingSources.length > 0;
    const hasStyles = Array.isArray(styleResults) && styleResults.length > 0;

    return (
        <section className="mt-8" aria-live="polite" aria-atomic="true">
            {/* Grounding Sources - Show if available regardless of mode */}
            {hasSources && (
                <div className="mb-6 bg-indigo-500/5 border border-indigo-500/20 rounded-xl p-4 animate-in fade-in slide-in-from-top-2">
                    <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                        <Search size={12} /> Researched Sources
                    </h4>
                    <div className="flex flex-wrap gap-3">
                        {groundingSources.map((source, idx) => (
                            <a 
                                key={idx} 
                                href={source.uri} 
                                target="_blank" 
                                rel="noreferrer"
                                className="flex items-center gap-1.5 text-xs text-zinc-300 hover:text-white bg-zinc-900/50 hover:bg-zinc-800 px-2 py-1.5 rounded-md border border-white/5 transition-colors"
                            >
                                <ExternalLink size={10} className="opacity-50" />
                                <span className="truncate max-w-[200px]">{source.title}</span>
                            </a>
                        ))}
                    </div>
                </div>
            )}

            {/* Empty State / Error Check */}
            {status === GenerationStatus.COMPLETE && !lyricsResult && !hasStyles && (
                <div className="col-span-full text-center py-12 bg-[#18181b] border border-white/5 rounded-xl animate-in fade-in" role="alert">
                        <AlertCircle className="w-10 h-10 text-zinc-500 mx-auto mb-3" />
                        <p className="text-zinc-300 font-medium">No valid prompts found</p>
                        <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                            The AI generated a response, but it wasn't in the expected format. 
                            Try disabling "Google Search Grounding" or simplifying your input.
                        </p>
                </div>
            )}

            {/* Style Results */}
            {(hasStyles || (status === GenerationStatus.THINKING && !lyricsResult)) && !lyricsResult && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {status === GenerationStatus.THINKING && (
                        <>
                            <PromptCardSkeleton />
                            <PromptCardSkeleton />
                            <PromptCardSkeleton />
                        </>
                    )}
                    
                    {status === GenerationStatus.COMPLETE && styleResults?.map((prompt, index) => (
                        <div key={index} className="animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: `${index * 100}ms` }}>
                            <PromptCard 
                                prompt={prompt} 
                                index={index} 
                                onCopy={() => showToast('Prompt copied to clipboard')}
                                onTagClick={handleTagClick}
                            />
                        </div>
                    ))}
                </div>
            )}

            {/* Lyrics Results */}
            {(lyricsResult || (status === GenerationStatus.THINKING && creationMode === 'lyrics')) && (
                <div className="w-full">
                    {status === GenerationStatus.THINKING && (
                        <LyricsSkeleton />
                    )}

                    {status === GenerationStatus.COMPLETE && lyricsResult && (
                        <div className="animate-in fade-in slide-in-from-bottom-4">
                            <LyricsCard 
                                result={lyricsResult}
                                onCopy={() => showToast('Lyrics copied to clipboard')} 
                            />
                        </div>
                    )}
                </div>
            )}
        </section>
    );
};