import React from 'react';
import { useBuilderStore } from '../stores/useBuilderStore';
import { useAppStore } from '../stores/useAppStore';
import { Copy, Save, Trash2, Music, Type, Settings2, Check } from 'lucide-react';

export const SongBuilderView: React.FC = () => {
    const { 
        title, style, lyrics, bpm, keySignature,
        setTitle, setStyle, setLyrics, setBpm, setKeySignature, resetBuilder 
    } = useBuilderStore();
    const { showToast } = useAppStore();

    const handleCopyFull = () => {
        const fullSong = `Title: ${title}
Style: ${style}
Meta: ${bpm ? `BPM: ${bpm}` : ''} ${keySignature ? `Key: ${keySignature}` : ''}

[Lyrics]
${lyrics}`;
        navigator.clipboard.writeText(fullSong);
        showToast("Full song copied to clipboard");
    };

    const styleLength = (style || "").length;

    return (
        <div className="animate-in fade-in h-[calc(100vh-140px)] flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-2xl font-bold">Song Builder</h2>
                    <p className="text-xs text-zinc-400">Combine style and lyrics into a complete song.</p>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={resetBuilder}
                        className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Clear Workspace"
                    >
                        <Trash2 size={18} />
                    </button>
                    <button 
                        onClick={handleCopyFull}
                        className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg text-xs font-bold hover:bg-zinc-200 transition-colors"
                    >
                        <Copy size={14} /> Copy Full Song
                    </button>
                </div>
            </div>

            {/* Meta Data Bar */}
            <div className="bg-[#18181b] border border-white/5 rounded-xl p-4 mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                 <div className="md:col-span-1">
                     <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1 block">Song Title</label>
                     <input 
                        type="text" 
                        value={title || ""}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Untitled Song"
                        className="w-full bg-transparent border-b border-white/10 py-1 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors font-semibold"
                     />
                 </div>
                 <div className="grid grid-cols-2 gap-4 md:col-span-2">
                     <div>
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1 block">BPM</label>
                        <input 
                            type="text" 
                            value={bpm || ""}
                            onChange={(e) => setBpm(e.target.value)}
                            placeholder="e.g. 128"
                            className="w-full bg-transparent border-b border-white/10 py-1 text-sm text-zinc-300 focus:outline-none focus:border-indigo-500 transition-colors"
                        />
                     </div>
                     <div>
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1 block">Key</label>
                        <input 
                            type="text" 
                            value={keySignature || ""}
                            onChange={(e) => setKeySignature(e.target.value)}
                            placeholder="e.g. C Minor"
                            className="w-full bg-transparent border-b border-white/10 py-1 text-sm text-zinc-300 focus:outline-none focus:border-indigo-500 transition-colors"
                        />
                     </div>
                 </div>
            </div>

            {/* Editor Workspace */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 min-h-0">
                {/* Style Panel */}
                <div className="bg-[#18181b] border border-white/5 rounded-xl flex flex-col overflow-hidden">
                    <div className="px-4 py-2 border-b border-white/5 bg-zinc-900/50 flex items-center justify-between">
                         <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
                             <Music size={12} /> Style Prompt
                         </span>
                         <button 
                            onClick={() => { navigator.clipboard.writeText(style); showToast("Style copied"); }}
                            className="text-zinc-500 hover:text-white"
                         >
                             <Copy size={12} />
                         </button>
                    </div>
                    <textarea 
                        value={style || ""}
                        onChange={(e) => setStyle(e.target.value)}
                        placeholder="Paste your style prompt here..."
                        className="flex-1 w-full bg-[#09090b] p-4 text-sm text-zinc-300 font-mono resize-none focus:outline-none leading-relaxed"
                        spellCheck={false}
                    />
                    <div className="px-4 py-2 border-t border-white/5 bg-zinc-900/30 text-right">
                         <span className={`text-[10px] ${styleLength > 1000 ? 'text-red-500 font-bold' : 'text-zinc-600'}`}>
                             {styleLength} / 1000 chars
                         </span>
                    </div>
                </div>

                {/* Lyrics Panel */}
                <div className="bg-[#18181b] border border-white/5 rounded-xl flex flex-col overflow-hidden">
                    <div className="px-4 py-2 border-b border-white/5 bg-zinc-900/50 flex items-center justify-between">
                         <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider flex items-center gap-2">
                             <Type size={12} /> Lyrics
                         </span>
                         <button 
                            onClick={() => { navigator.clipboard.writeText(lyrics); showToast("Lyrics copied"); }}
                            className="text-zinc-500 hover:text-white"
                         >
                             <Copy size={12} />
                         </button>
                    </div>
                    <textarea 
                        value={lyrics || ""}
                        onChange={(e) => setLyrics(e.target.value)}
                        placeholder="[Verse 1]&#10;Type your lyrics here..."
                        className="flex-1 w-full bg-[#09090b] p-4 text-sm text-zinc-300 font-mono resize-none focus:outline-none leading-relaxed"
                        spellCheck={false}
                    />
                </div>
            </div>
        </div>
    );
};