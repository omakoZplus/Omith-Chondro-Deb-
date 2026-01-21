
import React, { useRef, useEffect, useState, useMemo } from 'react';
import { useCreateStore } from '../../stores/useCreateStore';
import { useDataStore } from '../../stores/useDataStore';
import { useAppStore } from '../../stores/useAppStore';
import { enhanceDescription, generateSurpriseTheme } from '../../services/geminiService';
import { TemplateLibrary } from './TemplateLibrary';
import { RefreshCw, Dices, Wand2, Globe, ChevronDown, Zap, LayoutTemplate, FileJson, FileText, AlignLeft, Sparkles } from 'lucide-react';
import { GenerationStatus, SunoVersion, PromptFormat } from '../../types';
import { LANGUAGES } from '../../constants/languages';
import { STUDIO_GENRES, STUDIO_MOODS, STUDIO_INSTRUMENTS_GROUPS, STUDIO_PRODUCTION_GROUPS } from '../../constants/songStudioData';

export const InputSection: React.FC = () => {
    const { 
        themeInput, setThemeInput, creationMode, status, 
        lyricsModel, lyricsLanguage, setLyricsModel, setLyricsLanguage,
        sunoVersion, setSunoVersion,
        promptFormat, setPromptFormat,
        setError 
    } = useCreateStore();
    const { settings } = useDataStore();
    const { showToast } = useAppStore();
    
    const [isEnhancing, setIsEnhancing] = useState(false);
    const [isRandomizing, setIsRandomizing] = useState(false);
    const [isTemplateLibraryOpen, setIsTemplateLibraryOpen] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    
    // Autocomplete State
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0);

    // Flatten all studio data for search
    const ALL_TERMS = useMemo(() => {
        return [
            ...STUDIO_GENRES,
            ...STUDIO_MOODS,
            ...Object.values(STUDIO_INSTRUMENTS_GROUPS).flat(),
            ...Object.values(STUDIO_PRODUCTION_GROUPS).flat()
        ].sort();
    }, []);

    // Initialize version from settings on mount (only once)
    useEffect(() => {
        if (settings.defaultSunoVersion && sunoVersion === 'v5') {
            // Only override if still on initial default, or force sync could happen here
        }
    }, []);

    useEffect(() => {
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto';
          textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    }, [themeInput, creationMode]);

    const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const val = e.target.value;
        setThemeInput(val);

        // Simple suggestion logic: look at the last word being typed
        if (creationMode === 'style' || creationMode === 'lyrics') {
            const cursorPosition = e.target.selectionStart;
            const textBeforeCursor = val.slice(0, cursorPosition);
            const words = textBeforeCursor.split(/[\s,]+/);
            const lastWord = words[words.length - 1];

            if (lastWord.length >= 2) {
                const matches = ALL_TERMS.filter(term => 
                    term.toLowerCase().startsWith(lastWord.toLowerCase()) && 
                    term.toLowerCase() !== lastWord.toLowerCase()
                ).slice(0, 5); // Limit to 5 suggestions
                setSuggestions(matches);
                setActiveSuggestionIndex(0);
            } else {
                setSuggestions([]);
            }
        }
    };

    const applySuggestion = (suggestion: string) => {
        const cursorPosition = textareaRef.current?.selectionStart || themeInput.length;
        const textBeforeCursor = themeInput.slice(0, cursorPosition);
        const textAfterCursor = themeInput.slice(cursorPosition);
        
        const words = textBeforeCursor.split(/([\s,]+)/);
        let lastWordIndex = -1;
        
        // Find the index of the last actual word (skipping separators)
        for (let i = words.length - 1; i >= 0; i--) {
            if (/\S/.test(words[i])) {
                lastWordIndex = i;
                break;
            }
        }

        if (lastWordIndex !== -1) {
            words[lastWordIndex] = suggestion;
            const newText = words.join('') + textAfterCursor;
            setThemeInput(newText);
            setSuggestions([]);
            
            // Refocus and place cursor at end of inserted word
            setTimeout(() => {
                if (textareaRef.current) {
                    textareaRef.current.focus();
                    // Simple heuristic to set cursor, user might need to adjust manually if editing in middle
                }
            }, 0);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (suggestions.length > 0) {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setActiveSuggestionIndex(prev => (prev + 1) % suggestions.length);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setActiveSuggestionIndex(prev => (prev - 1 + suggestions.length) % suggestions.length);
            } else if (e.key === 'Tab' || e.key === 'Enter') {
                e.preventDefault();
                applySuggestion(suggestions[activeSuggestionIndex]);
            } else if (e.key === 'Escape') {
                setSuggestions([]);
            }
        }
        
        if (e.key === 'Enter' && e.metaKey) {
            // We would trigger generate here if connected
        }
    };

    const handleEnhance = async () => {
        if (!themeInput.trim()) return;
        setIsEnhancing(true);
        setError(null);
        try {
            const enhancedText = await enhanceDescription(themeInput, creationMode, settings.enableGoogleSearch);
            setThemeInput(enhancedText);
            showToast("Idea enhanced successfully!");
        } catch (err) {
            console.error(err);
            showToast("Failed to enhance description", "error");
        } finally {
            setIsEnhancing(false);
        }
    };
    
    const handleSurprise = async () => {
        setIsRandomizing(true);
        setError(null);
        try {
            const surpriseTheme = await generateSurpriseTheme();
            setThemeInput(surpriseTheme);
        } catch (err) {
            console.error(err);
            showToast("Failed to generate surprise theme", "error");
        } finally {
            setIsRandomizing(false);
        }
    };

    const handleTemplateSelect = (template: string) => {
        setThemeInput(template);
        showToast("Template loaded");
    };

    return (
        <>
            <div className="px-4 pt-2 relative">
                <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-2 gap-2">
                    <label className="block text-xs font-medium text-text-muted uppercase tracking-wider">
                        {creationMode === 'style' ? 'Song Theme / Description' : 
                            creationMode === 'image' ? 'Additional Context' : 
                            creationMode === 'audio' ? 'Additional Context' : 'Song Topic'}
                    </label>
                    <div className="flex flex-wrap items-center gap-2">
                        {/* Suno Version Selector (Style Only) */}
                        {creationMode === 'style' && (
                            <div className="flex bg-element rounded-md p-0.5 border border-border" role="radiogroup" aria-label="Suno Version">
                                {(['v5', 'v4.5', 'v4'] as SunoVersion[]).map(ver => (
                                    <button
                                        key={ver}
                                        onClick={() => setSunoVersion(ver)}
                                        className={`px-2 py-0.5 text-[10px] font-bold rounded transition-colors ${
                                            sunoVersion === ver 
                                            ? 'bg-primary/20 text-primary shadow-sm' 
                                            : 'text-text-muted hover:text-text-main'
                                        }`}
                                        title={ver === 'v4' ? 'Max 200 chars' : 'Max 1000 chars'}
                                    >
                                        {ver === 'v5' ? 'V5' : ver === 'v4.5' ? 'V4.5' : 'V4'}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Prompt Format Selector (Style Only) */}
                        {creationMode === 'style' && (
                            <div className="flex bg-element rounded-md p-0.5 border border-border" role="radiogroup" aria-label="Prompt Format">
                                {[
                                    { id: 'standard', label: 'Normal', icon: AlignLeft },
                                    { id: 'json', label: 'JSON', icon: FileJson },
                                    { id: 'descriptive', label: 'Story', icon: FileText }
                                ].map((fmt) => (
                                    <button
                                        key={fmt.id}
                                        onClick={() => setPromptFormat(fmt.id as PromptFormat)}
                                        className={`px-2 py-0.5 text-[10px] font-bold rounded transition-colors flex items-center gap-1 ${
                                            promptFormat === fmt.id 
                                            ? 'bg-indigo-500/20 text-indigo-300 shadow-sm' 
                                            : 'text-text-muted hover:text-text-main'
                                        }`}
                                        title={`Output format: ${fmt.label}`}
                                    >
                                        <fmt.icon size={10} />
                                        <span className="hidden sm:inline">{fmt.label}</span>
                                    </button>
                                ))}
                            </div>
                        )}

                        <div className="h-4 w-px bg-border mx-1 hidden md:block"></div>

                        <button
                            onClick={() => setIsTemplateLibraryOpen(true)}
                            disabled={status === GenerationStatus.THINKING}
                            className="flex items-center gap-1.5 text-[10px] font-medium bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200 px-2 py-1 rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                            title="Open Template Library"
                        >
                            <LayoutTemplate size={10} className="group-hover:text-indigo-400 transition-colors" />
                            <span className="hidden sm:inline">Templates</span>
                        </button>

                        {(creationMode === 'style' || creationMode === 'lyrics') && (
                            <button 
                                onClick={handleSurprise}
                                disabled={isRandomizing || status === GenerationStatus.THINKING}
                                className="flex items-center gap-1.5 text-[10px] font-medium bg-element text-text-muted hover:bg-background hover:text-text-main px-2 py-1 rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Surprise Me"
                                aria-label="Surprise Me with a random theme"
                            >
                                {isRandomizing ? <RefreshCw size={10} className="animate-spin" /> : <Dices size={10} />}
                                <span className="hidden md:inline">Surprise Me</span>
                            </button>
                        )}
                        <button 
                            onClick={handleEnhance}
                            disabled={!themeInput.trim() || isEnhancing || status === GenerationStatus.THINKING}
                            className="flex items-center gap-1.5 text-[10px] font-medium bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary-hover px-2 py-1 rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Enhance with AI"
                            aria-label="Enhance input with AI"
                        >
                            {isEnhancing ? <RefreshCw size={10} className="animate-spin" /> : <Wand2 size={10} />}
                            <span className="hidden md:inline">{isEnhancing ? 'Enhancing...' : 'Enhance'}</span>
                        </button>
                    </div>
                </div>
                
                <div className="relative">
                    <textarea
                        ref={textareaRef}
                        value={themeInput}
                        onChange={handleInput}
                        onKeyDown={handleKeyDown}
                        placeholder={creationMode === 'style' 
                            ? `Describe your song idea... (Model: Suno ${sunoVersion.toUpperCase()})`
                            : creationMode === 'image' 
                                ? "Add specific details to the image... (Optional)" 
                                : creationMode === 'audio' 
                                    ? "Add context about this audio... (Optional)"
                                    : "What is this song about? (e.g., A heartbreak ballad)"}
                        className="w-full bg-transparent text-base md:text-xl text-text-main placeholder:text-text-muted focus:outline-none resize-none min-h-[60px] leading-relaxed"
                        disabled={status === GenerationStatus.THINKING}
                        autoComplete="off"
                        spellCheck={false}
                    />

                    {/* Suggestions Popover */}
                    {suggestions.length > 0 && (
                        <div className="absolute top-full left-0 z-50 mt-1 w-64 bg-[#18181b] border border-white/10 rounded-lg shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-1">
                            <div className="text-[10px] font-bold text-zinc-500 uppercase px-3 py-1.5 bg-zinc-900/50 flex items-center gap-1">
                                <Sparkles size={10} /> Suggestions
                            </div>
                            {suggestions.map((suggestion, index) => (
                                <button
                                    key={suggestion}
                                    onClick={() => applySuggestion(suggestion)}
                                    className={`w-full text-left px-3 py-2 text-xs transition-colors flex items-center justify-between ${
                                        index === activeSuggestionIndex 
                                        ? 'bg-indigo-500/20 text-indigo-300' 
                                        : 'text-zinc-300 hover:bg-zinc-800'
                                    }`}
                                >
                                    {suggestion}
                                    {index === activeSuggestionIndex && <kbd className="text-[9px] bg-black/20 px-1 rounded">Tab</kbd>}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            
            {creationMode === 'lyrics' && (
                <div className="px-4 pb-4 pt-2 border-t border-border mt-2 flex flex-wrap items-center gap-4">
                    <div className="flex bg-element rounded-lg p-1 border border-border" role="radiogroup" aria-label="Lyrics Model">
                        <button 
                            onClick={() => setLyricsModel('flash')}
                            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${lyricsModel === 'flash' ? 'bg-surface text-text-main shadow-sm' : 'text-text-muted hover:text-text-main'}`}
                            role="radio"
                            aria-checked={lyricsModel === 'flash'}
                        >
                            Flash
                        </button>
                        <button 
                            onClick={() => setLyricsModel('pro')}
                            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${lyricsModel === 'pro' ? 'bg-primary/20 text-primary' : 'text-text-muted hover:text-text-main'}`}
                            role="radio"
                            aria-checked={lyricsModel === 'pro'}
                        >
                            Pro
                        </button>
                    </div>

                    <div className="relative">
                    <Globe size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                    <select 
                        value={lyricsLanguage}
                        onChange={(e) => setLyricsLanguage(e.target.value)}
                        className="bg-element border border-border rounded-lg py-1.5 pl-9 pr-8 text-xs font-medium text-text-main focus:outline-none appearance-none cursor-pointer hover:bg-background transition-colors"
                        aria-label="Lyrics Language"
                    >
                        {LANGUAGES.map(lang => <option key={lang} value={lang}>{lang}</option>)}
                    </select>
                    <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                    </div>
                </div>
            )}

            {/* Template Library Modal */}
            <TemplateLibrary 
                isOpen={isTemplateLibraryOpen}
                onClose={() => setIsTemplateLibraryOpen(false)}
                onSelect={handleTemplateSelect}
                mode={creationMode}
            />
        </>
    );
};
