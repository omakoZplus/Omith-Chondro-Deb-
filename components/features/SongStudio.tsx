import React, { useState } from 'react';
import { useCreateStore } from '../../stores/useCreateStore';
import { 
    STUDIO_GENRES, STUDIO_MOODS, STUDIO_VOCALS, 
    STUDIO_INSTRUMENTS_GROUPS, STUDIO_PRODUCTION_GROUPS, STUDIO_VSTS_GROUPS 
} from '../../constants/songStudioData';
import { ChevronDown, ChevronUp, X, Music, Sliders, Speaker } from 'lucide-react';

export const SongStudio: React.FC = () => {
    const {
        studioGenre, setStudioGenre,
        studioMood, setStudioMood,
        studioVocals, setStudioVocals,
        studioInstruments, toggleStudioInstrument,
        studioProduction, toggleStudioProduction,
        studioVst, toggleStudioVst,
        studioInfluences, setStudioInfluences,
        bpm, setBpm,
        resetStudio
    } = useCreateStore();

    const [isExpanded, setIsExpanded] = useState(true);

    const GroupedPillGrid = ({ groups, selected, onToggle }: { groups: Record<string, string[]>, selected: string[], onToggle: (v: string) => void }) => {
        // Ensure selected is always an array
        const activeItems = Array.isArray(selected) ? selected : [];
        
        return (
            <div className="space-y-4">
                {Object.entries(groups).map(([category, items]) => (
                    <div key={category} className="space-y-2">
                        <h5 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">{category}</h5>
                        <div className="flex flex-wrap gap-2">
                            {items.map(item => {
                                const isActive = activeItems.includes(item);
                                return (
                                    <button
                                        key={item}
                                        onClick={() => onToggle(item)}
                                        className={`px-2.5 py-1 text-[10px] md:text-xs font-medium rounded-full border transition-all ${
                                            isActive 
                                            ? 'bg-indigo-500 border-indigo-500 text-white shadow-md shadow-indigo-500/20' 
                                            : 'bg-[#18181b] border-white/10 text-zinc-400 hover:text-white hover:border-white/20'
                                        }`}
                                    >
                                        {item}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const instrumentsCount = Array.isArray(studioInstruments) ? studioInstruments.length : 0;
    const productionCount = Array.isArray(studioProduction) ? studioProduction.length : 0;
    const vstCount = Array.isArray(studioVst) ? studioVst.length : 0;

    return (
        <div className="bg-[#18181b]/50 border-b border-white/5 pb-4 mb-4">
            <div 
                className="px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-2">
                    <span className="w-1.5 h-4 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full"></span>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wide">Song Studio</h3>
                    <span className="text-[10px] px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded-md border border-indigo-500/20 font-medium">
                        Advanced Builder
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    {(studioGenre || studioMood || instrumentsCount > 0 || bpm || studioInfluences) && (
                         <button 
                            onClick={(e) => { e.stopPropagation(); resetStudio(); }}
                            className="text-[10px] text-zinc-500 hover:text-red-400 flex items-center gap-1 transition-colors"
                         >
                             <X size={12} /> Clear All
                         </button>
                    )}
                    {isExpanded ? <ChevronUp size={16} className="text-zinc-500" /> : <ChevronDown size={16} className="text-zinc-500" />}
                </div>
            </div>

            {isExpanded && (
                <div className="px-4 space-y-5 animate-in slide-in-from-top-2 duration-200">
                    {/* Row 1: Core Style */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Musical Genre</label>
                            <div className="relative">
                                <select 
                                    value={studioGenre} 
                                    onChange={(e) => setStudioGenre(e.target.value)}
                                    className="w-full bg-[#09090b] border border-white/10 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500/50 appearance-none"
                                >
                                    <option value="">Select a genre...</option>
                                    {STUDIO_GENRES.map(g => <option key={g} value={g}>{g}</option>)}
                                </select>
                                <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Mood / Emotion</label>
                            <div className="relative">
                                <select 
                                    value={studioMood} 
                                    onChange={(e) => setStudioMood(e.target.value)}
                                    className="w-full bg-[#09090b] border border-white/10 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500/50 appearance-none"
                                >
                                    <option value="">Select a mood...</option>
                                    {STUDIO_MOODS.map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                                <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                             <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Vocals</label>
                             <div className="relative">
                                <select 
                                    value={studioVocals} 
                                    onChange={(e) => setStudioVocals(e.target.value)}
                                    className="w-full bg-[#09090b] border border-white/10 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500/50 appearance-none"
                                >
                                    <option value="">Select a vocal style...</option>
                                    {STUDIO_VOCALS.map(v => <option key={v} value={v}>{v}</option>)}
                                </select>
                                <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                             </div>
                        </div>
                    </div>

                    {/* Row 2: BPM & Influences */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="space-y-1.5 md:col-span-1">
                             <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">BPM</label>
                             <input 
                                type="text"
                                value={bpm}
                                onChange={(e) => setBpm(e.target.value)}
                                placeholder="Ex: 128"
                                className="w-full bg-[#09090b] border border-white/10 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500/50 placeholder:text-zinc-700"
                             />
                        </div>
                        <div className="md:col-span-3 space-y-1.5">
                             <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Style Influences (Vibe Only)</label>
                             <input 
                                type="text"
                                value={studioInfluences}
                                onChange={(e) => setStudioInfluences(e.target.value)}
                                placeholder="Ex: Daft Punk, Hans Zimmer, Cyberpunk 2077 OST, The Weeknd..."
                                className="w-full bg-[#09090b] border border-white/10 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500/50 placeholder:text-zinc-700"
                             />
                        </div>
                    </div>

                    {/* Row 3: Instruments */}
                    <div className="space-y-3 bg-[#09090b]/40 p-4 rounded-xl border border-white/5">
                        <label className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center justify-between border-b border-white/5 pb-2">
                            <span className="flex items-center gap-2"><Music size={14} /> Key Instruments</span>
                            <span className="text-zinc-600 font-normal text-[10px]">{instrumentsCount} selected</span>
                        </label>
                        <GroupedPillGrid groups={STUDIO_INSTRUMENTS_GROUPS} selected={studioInstruments} onToggle={toggleStudioInstrument} />
                    </div>

                    {/* Row 4: Production */}
                    <div className="space-y-3 bg-[#09090b]/40 p-4 rounded-xl border border-white/5">
                        <label className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center justify-between border-b border-white/5 pb-2">
                             <span className="flex items-center gap-2"><Sliders size={14} /> Production Techniques / Styles</span>
                            <span className="text-zinc-600 font-normal text-[10px]">{productionCount} selected</span>
                        </label>
                        <GroupedPillGrid groups={STUDIO_PRODUCTION_GROUPS} selected={studioProduction} onToggle={toggleStudioProduction} />
                    </div>

                    {/* Row 5: VST / Sound Design */}
                    <div className="space-y-3 bg-[#09090b]/40 p-4 rounded-xl border border-white/5">
                        <label className="text-xs font-bold text-pink-400 uppercase tracking-wider flex items-center justify-between border-b border-white/5 pb-2">
                             <span className="flex items-center gap-2"><Speaker size={14} /> Key VST / Sound Design</span>
                            <span className="text-zinc-600 font-normal text-[10px]">{vstCount} selected</span>
                        </label>
                        <GroupedPillGrid groups={STUDIO_VSTS_GROUPS} selected={studioVst} onToggle={toggleStudioVst} />
                    </div>
                </div>
            )}
        </div>
    );
};