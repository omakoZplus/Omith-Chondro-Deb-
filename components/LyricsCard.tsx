
import React, { useState, useEffect } from 'react';
import { Copy, ExternalLink, FileText, Music, Heart, ArrowRightCircle, Languages, Loader2, Sparkles } from 'lucide-react';
import { LyricsResult } from '../types';
import { useCreateStore } from '../stores/useCreateStore';
import { useAppStore } from '../stores/useAppStore';
import { useBuilderStore } from '../stores/useBuilderStore';
import { LANGUAGES } from '../constants/languages';
import { translateLyrics } from '../services/geminiService';

interface LyricsCardProps {
  result: LyricsResult;
  onCopy: (text: string) => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

export const LyricsCard: React.FC<LyricsCardProps> = ({ result, onCopy, isFavorite, onToggleFavorite }) => {
  const [activePromptIndex, setActivePromptIndex] = useState(0);
  const [targetLang, setTargetLang] = useState('English');
  const [isTranslating, setIsTranslating] = useState(false);
  const [viewMode, setViewMode] = useState<'original' | 'translated'>('original');

  const { setLyricsTranslation } = useCreateStore();
  const { setView, showToast } = useAppStore();
  const { setLyrics, setTitle, setStyle } = useBuilderStore();

  // Determine available prompts
  // Logic: If result.stylePrompts exists (Pro mode), use it.
  // If not, fallback to result.stylePrompt (Flash mode) as a single item array.
  const availablePrompts = (result.stylePrompts && Array.isArray(result.stylePrompts) && result.stylePrompts.length > 0) 
        ? result.stylePrompts 
        : (result.stylePrompt ? [result.stylePrompt] : []);

  const currentPrompt = availablePrompts[activePromptIndex] || "No style style generated.";

  // Switch view mode if translation becomes available
  useEffect(() => {
      if (result.translation) {
          setViewMode('translated');
          setTargetLang(result.translation.language);
      } else {
          setViewMode('original');
      }
  }, [result.translation]);

  useEffect(() => {
    setActivePromptIndex(0);
  }, [result.title]);

  const handleCopy = () => {
    const text = viewMode === 'translated' && result.translation ? result.translation.lyrics : result.lyrics;
    navigator.clipboard.writeText(text);
    onCopy(text);
  };
  
  const handleCopyStyle = () => {
      if (currentPrompt) {
        navigator.clipboard.writeText(currentPrompt);
        onCopy(currentPrompt);
      }
  };

  const handleOpenSuno = () => {
    window.open('https://suno.com/create', '_blank');
  };

  const handleSendToBuilder = () => {
      const title = viewMode === 'translated' && result.translation ? result.translation.title : result.title;
      const lyrics = viewMode === 'translated' && result.translation ? result.translation.lyrics : result.lyrics;
      
      setLyrics(lyrics);
      setTitle(title);
      if (currentPrompt) setStyle(currentPrompt);
      setView('songBuilder');
      showToast("Sent to Song Builder");
  };

  const handleTranslate = async () => {
      if (!targetLang) return;
      setIsTranslating(true);
      try {
          const translation = await translateLyrics(result.title, result.lyrics, targetLang);
          setLyricsTranslation({
              language: targetLang,
              title: translation.title,
              lyrics: translation.lyrics
          });
          showToast(`Translated to ${targetLang}`);
      } catch (e) {
          console.error(e);
          showToast("Translation failed", "error");
      } finally {
          setIsTranslating(false);
      }
  };

  const currentTitle = viewMode === 'translated' && result.translation ? result.translation.title : result.title;
  const currentLyrics = (viewMode === 'translated' && result.translation ? result.translation.lyrics : result.lyrics) || "";

  // Process lyrics to highlight tags
  const formattedLyrics = typeof currentLyrics === 'string' && currentLyrics.length > 0
    ? currentLyrics.split('\n').map((line, i) => {
        const trimmed = line.trim();
        // Detect headers like [Verse], [Chorus], or Verse 1:
        if ((trimmed.startsWith('[') && trimmed.endsWith(']')) || /^(Verse|Chorus|Bridge|Intro|Outro|Hook|Pre-Chorus).*:?$/i.test(trimmed)) {
            return <div key={i} className="text-primary font-bold mt-4 mb-2 text-sm uppercase tracking-wide">{trimmed}</div>;
        }
        return <div key={i} className="min-h-[1.5em] text-zinc-300">{line}</div>;
      })
    : <div className="text-zinc-500 italic p-4">No lyrics content available.</div>;

  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden flex flex-col h-full max-w-3xl mx-auto shadow-xl shadow-black/20">
      
      {/* Header Section */}
      <div className="p-6 border-b border-border bg-gradient-to-b from-surface to-background/50">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center border border-white/5">
                    <FileText size={24} className="text-primary" />
                </div>
                <div>
                    <h3 className="font-bold text-text-main text-xl leading-tight">{currentTitle}</h3>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-text-muted capitalize flex items-center gap-1">
                            <Sparkles size={10} /> {result.type} Model
                        </span>
                        {result.type === 'pro' && (
                            <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-1.5 py-0.5 rounded font-medium">
                                Multi-Style
                            </span>
                        )}
                    </div>
                </div>
            </div>
            
            <div className="flex items-center gap-2 self-start md:self-center">
                {onToggleFavorite && (
                    <button 
                        onClick={onToggleFavorite}
                        className={`p-2.5 rounded-lg transition-colors border border-transparent ${isFavorite ? 'text-pink-500 bg-pink-500/10 border-pink-500/20' : 'text-text-muted hover:text-pink-500 hover:bg-element hover:border-border'}`}
                        aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                    >
                        <Heart size={18} fill={isFavorite ? "currentColor" : "none"} />
                    </button>
                )}
                <button 
                    onClick={handleSendToBuilder} 
                    className="p-2.5 bg-element hover:bg-zinc-700 rounded-lg text-text-muted hover:text-text-main transition-colors border border-border" 
                    title="Edit in Song Builder"
                >
                    <ArrowRightCircle size={18} />
                </button>
                <button 
                    onClick={handleCopy} 
                    className="p-2.5 bg-element hover:bg-zinc-700 rounded-lg text-text-muted hover:text-text-main transition-colors border border-border" 
                    title="Copy Lyrics"
                >
                    <Copy size={18} />
                </button>
                <button 
                    onClick={handleOpenSuno} 
                    className="p-2.5 bg-element hover:bg-zinc-700 rounded-lg text-text-muted hover:text-text-main transition-colors border border-border" 
                    title="Open Suno"
                >
                    <ExternalLink size={18} />
                </button>
            </div>
          </div>

          {/* Translation Bar */}
          <div className="flex flex-wrap items-center gap-2 bg-[#09090b]/50 p-2 rounded-lg border border-border mt-2">
              <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                  <Languages size={14} className="text-text-muted ml-1" />
                  <select 
                     value={targetLang}
                     onChange={(e) => setTargetLang(e.target.value)}
                     className="bg-transparent text-xs text-text-main font-medium focus:outline-none w-full cursor-pointer"
                  >
                      {LANGUAGES.map(lang => (
                          <option key={lang} value={lang} className="bg-[#18181b] text-zinc-200">
                              {lang}
                          </option>
                      ))}
                  </select>
              </div>
              <button
                  onClick={handleTranslate}
                  disabled={isTranslating}
                  className="bg-primary/20 hover:bg-primary/30 text-primary px-3 py-1.5 rounded-md text-xs font-bold transition-colors disabled:opacity-50 flex items-center gap-1.5"
              >
                  {isTranslating ? <Loader2 size={12} className="animate-spin" /> : <Languages size={12} />}
                  Auto Translate
              </button>
          </div>

          {/* View Tabs */}
          {result.translation && (
              <div className="flex gap-1 mt-4">
                  <button 
                      onClick={() => setViewMode('original')}
                      className={`px-4 py-2 text-xs font-bold border-b-2 transition-colors ${viewMode === 'original' ? 'border-primary text-text-main' : 'border-transparent text-text-muted hover:text-text-main'}`}
                  >
                      Original
                  </button>
                  <button 
                      onClick={() => setViewMode('translated')}
                      className={`px-4 py-2 text-xs font-bold border-b-2 transition-colors ${viewMode === 'translated' ? 'border-primary text-text-main' : 'border-transparent text-text-muted hover:text-text-main'}`}
                  >
                      Translated ({result.translation.language})
                  </button>
              </div>
          )}
      </div>

      <div className="p-6 md:p-8 overflow-y-auto max-h-[600px] bg-[#09090b] font-mono text-sm leading-relaxed custom-scrollbar relative">
          
          {/* Suggested Style Prompt Card */}
          {availablePrompts.length > 0 && (
              <div className="mb-8 p-1 rounded-xl bg-gradient-to-r from-zinc-800 to-zinc-900 shadow-lg">
                  <div className="bg-[#18181b] rounded-lg overflow-hidden border border-white/5">
                      {/* Card Header */}
                      <div className="flex items-center justify-between px-4 py-3 bg-white/5 border-b border-white/5">
                          <div className="flex items-center gap-3">
                              <div className="p-1.5 bg-indigo-500/20 rounded-md">
                                <Music size={14} className="text-indigo-400" />
                              </div>
                              <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                                  Generated Style
                              </h4>
                              
                              {/* Style Tabs */}
                              {availablePrompts.length > 1 && (
                                  <div className="flex gap-1 ml-2 bg-black/40 p-0.5 rounded-md">
                                      {availablePrompts.map((_, idx) => (
                                          <button
                                            key={idx}
                                            onClick={() => setActivePromptIndex(idx)}
                                            className={`px-2 py-0.5 text-[10px] font-bold rounded transition-all ${
                                                activePromptIndex === idx 
                                                ? 'bg-indigo-600 text-white shadow-sm' 
                                                : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
                                            }`}
                                          >
                                              V{idx + 1}
                                          </button>
                                      ))}
                                  </div>
                              )}
                          </div>
                          
                          <button 
                            onClick={handleCopyStyle}
                            className="text-[10px] font-bold bg-white/10 hover:bg-white/20 text-white px-2 py-1 rounded transition-colors flex items-center gap-1.5"
                          >
                              <Copy size={10} /> Copy Style
                          </button>
                      </div>

                      {/* Style Content */}
                      <div className="p-4 bg-[#121212]">
                          <p className="text-sm text-indigo-100 font-sans leading-relaxed animate-in fade-in duration-300 whitespace-pre-wrap">
                              {currentPrompt}
                          </p>
                      </div>
                  </div>
              </div>
          )}
      
          {/* Lyrics Content */}
          <div className="pl-2 border-l-2 border-white/10">
            {formattedLyrics}
          </div>
      </div>
    </div>
  );
};
