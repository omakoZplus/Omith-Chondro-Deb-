
import React, { useState, useEffect, useRef } from 'react';
import { Copy, ExternalLink, AlertTriangle, Sliders, Send, Heart, ArrowRightCircle, Plus } from 'lucide-react';
import { StylePrompt } from '../types';
import { remixStyle, expandPromptTags } from '../services/geminiService';
import { useCreateStore } from '../stores/useCreateStore';
import { useAppStore } from '../stores/useAppStore';
import { useBuilderStore } from '../stores/useBuilderStore';

interface PromptCardProps {
  prompt: StylePrompt;
  index: number;
  onCopy: (text: string) => void;
  onTagClick?: (tag: string) => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

export const PromptCard: React.FC<PromptCardProps> = ({ prompt, index, onCopy, onTagClick, isFavorite, onToggleFavorite }) => {
  const [content, setContent] = useState(prompt.content || "");
  const [tags, setTags] = useState<string[]>(() => {
    if (Array.isArray(prompt.tags)) return prompt.tags;
    if (typeof prompt.tags === 'string') return (prompt.tags as string).split(',').map(t => t.trim());
    return [];
  });
  const [isFocused, setIsFocused] = useState(false);
  const [isRemixing, setIsRemixing] = useState(false);
  const [remixInput, setRemixInput] = useState('');
  const [isRemixLoading, setIsRemixLoading] = useState(false);
  const [isTagsExpanding, setIsTagsExpanding] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const { setView, showToast } = useAppStore();
  const { setStyle } = useBuilderStore();

  const charCount = (content || "").length;
  const isOverLimit = charCount > 1000;

  useEffect(() => {
    setContent(prompt.content || "");
    if (Array.isArray(prompt.tags)) {
        setTags(prompt.tags);
    } else if (typeof prompt.tags === 'string') {
        setTags((prompt.tags as string).split(',').map(t => t.trim()).filter(Boolean));
    } else {
        setTags([]);
    }
  }, [prompt]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [content]);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    onCopy(content);
  };

  const handleOpenSuno = () => {
    window.open('https://suno.com/create', '_blank');
  };

  const handleRemix = async () => {
      if (!remixInput.trim()) return;
      setIsRemixLoading(true);
      try {
          const newContent = await remixStyle(content, remixInput);
          setContent(newContent || content);
          setRemixInput('');
          setIsRemixing(false);
      } catch (e) {
          console.error(e);
      } finally {
          setIsRemixLoading(false);
      }
  };

  const handleExpandTags = async () => {
      setIsTagsExpanding(true);
      try {
          const newTags = await expandPromptTags(content, tags);
          if (newTags && newTags.length > 0) {
              setTags(prev => [...prev, ...newTags]);
          }
      } catch (e) {
          console.error(e);
      } finally {
          setIsTagsExpanding(false);
      }
  };

  const handleSendToBuilder = () => {
      setStyle(content);
      setView('songBuilder');
      showToast("Style sent to Song Builder");
  };

  return (
    <div className="group relative bg-surface hover:border-primary/30 border border-border rounded-xl p-5 md:p-6 transition-all duration-300 flex flex-col h-full shadow-sm hover:shadow-lg hover:shadow-primary/5">
      
      {/* Header Info */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-1.5 py-0.5 rounded bg-element text-[10px] font-bold text-text-muted uppercase tracking-wider">
              V{index + 1}
            </span>
            <h3 className="font-semibold text-text-main truncate">{prompt.title || "Untitled Variation"}</h3>
          </div>
          <p className="text-xs text-text-muted leading-relaxed mb-3 pr-4 line-clamp-2">
            {prompt.description || "AI-generated style description"}
          </p>

          {/* Tags Display */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {tags.length > 0 ? tags.map((tag, i) => (
              <button 
                key={i} 
                onClick={() => onTagClick?.(tag)}
                className="px-2 py-1 rounded-md bg-element border border-border text-[10px] font-medium text-text-muted hover:text-text-main hover:bg-background transition-colors"
              >
                #{tag}
              </button>
            )) : (
              <span className="text-[10px] text-zinc-700 italic">No tags generated</span>
            )}
            <button
                onClick={handleExpandTags}
                disabled={isTagsExpanding || !content}
                className="px-2 py-1 rounded-md bg-element/50 border border-border text-text-muted hover:text-primary hover:bg-element transition-all disabled:opacity-50"
                title="Generate more tags"
              >
                  {isTagsExpanding ? (
                      <div className="w-3 h-3 border-2 border-text-muted border-t-transparent rounded-full animate-spin" />
                  ) : (
                      <Plus size={12} />
                  )}
              </button>
          </div>
        </div>

        {/* Favorite Button */}
        {onToggleFavorite && (
          <button 
             onClick={onToggleFavorite}
             className={`p-2 rounded-full transition-colors ${isFavorite ? 'text-pink-500 bg-pink-500/10' : 'text-text-muted hover:text-pink-500 hover:bg-element'}`}
             aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
              <Heart size={16} fill={isFavorite ? "currentColor" : "none"} />
          </button>
        )}
      </div>

      {/* Editable Content Area */}
      <div className={`relative flex-grow mb-4 bg-background rounded-lg p-3 border transition-colors ${
        isOverLimit ? 'border-red-500/30' : isFocused ? 'border-primary/50' : 'border-border group-hover:border-primary/20'
      }`}>
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={!content ? "No content generated. Try adding more detail to your request." : ""}
          className="w-full bg-transparent text-sm text-text-main font-mono leading-relaxed whitespace-pre-wrap break-words resize-none focus:outline-none min-h-[140px] placeholder:text-zinc-700 placeholder:italic"
          spellCheck="false"
          aria-label="Style Prompt Content"
        />
        <div className="absolute bottom-2 right-2 flex items-center gap-1 pointer-events-none">
            {isOverLimit && <AlertTriangle size={10} className="text-red-500" />}
            <span className={`text-[10px] ${isOverLimit ? 'text-red-500 font-bold' : 'text-text-muted'}`}>
            {charCount} / 1000
            </span>
        </div>
      </div>

      {/* Remix Input */}
      {isRemixing && (
          <div className="mb-4 animate-in fade-in slide-in-from-top-2">
              <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={remixInput}
                    onChange={(e) => setRemixInput(e.target.value)}
                    placeholder="Faster? Darker? Add cello?"
                    className="flex-1 bg-element border border-border rounded-md px-3 py-2 text-xs text-text-main focus:outline-none focus:border-primary/50"
                  />
                  <button 
                    onClick={handleRemix} 
                    disabled={isRemixLoading || !remixInput.trim()}
                    className="bg-primary hover:bg-primary-hover text-white rounded-md px-3 py-2 text-xs font-medium disabled:opacity-50 flex items-center justify-center"
                  >
                      {isRemixLoading ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send size={12} />}
                  </button>
              </div>
          </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 mt-auto pt-2 border-t border-border">
        <button 
          onClick={handleCopy}
          disabled={!content}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-semibold transition-all bg-text-main text-background hover:opacity-90 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Copy size={16} />
          Copy
        </button>

        <button 
            onClick={handleSendToBuilder}
            disabled={!content}
            className="p-2.5 rounded-lg bg-element hover:bg-background text-text-muted hover:text-text-main transition-colors border border-border disabled:opacity-50" 
            title="Edit in Song Builder"
        >
            <ArrowRightCircle size={18} />
        </button>

        <button 
            onClick={() => setIsRemixing(!isRemixing)}
            disabled={!content}
            className={`p-2.5 rounded-lg border border-border transition-colors disabled:opacity-50 ${isRemixing ? 'bg-primary/20 text-primary' : 'bg-element hover:bg-background text-text-muted'}`}
            title="Remix this prompt"
        >
            <Sliders size={18} />
        </button>
        
        <button 
            onClick={handleOpenSuno}
            className="p-2.5 rounded-lg bg-element hover:bg-background text-text-muted hover:text-text-main transition-colors border border-border" 
            title="Open Suno"
        >
            <ExternalLink size={18} />
        </button>
      </div>
    </div>
  );
};
