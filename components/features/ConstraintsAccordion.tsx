
import React, { useState } from 'react';
import { Sliders } from 'lucide-react';
import { useCreateStore } from '../../stores/useCreateStore';

export const ConstraintsAccordion: React.FC = () => {
    const { 
        bpm, setBpm, 
        keySignature, setKeySignature, 
        negativePrompt, setNegativePrompt,
        creationMode 
    } = useCreateStore();
    
    const [showConstraints, setShowConstraints] = useState(false);

    return (
        <div className="px-4 pb-4">
            <button 
                onClick={() => setShowConstraints(!showConstraints)}
                className="flex items-center gap-1 text-[10px] text-zinc-500 hover:text-zinc-300 transition-colors mt-2"
            >
                <Sliders size={10} />
                {showConstraints ? 'Hide Constraints' : 'Technical Constraints (Optional)'}
            </button>
            
            {showConstraints && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3 animate-in slide-in-from-top-2">
                    {/* BPM is hidden in Style mode because it is present in Song Studio */}
                    {creationMode !== 'style' && (
                        <input 
                            type="text" 
                            value={bpm}
                            onChange={(e) => setBpm(e.target.value)}
                            placeholder="BPM (e.g. 140)"
                            className="bg-[#18181b] border border-white/10 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500/50 placeholder:text-zinc-600"
                        />
                    )}
                    <input 
                        type="text" 
                        value={keySignature}
                        onChange={(e) => setKeySignature(e.target.value)}
                        placeholder="Key (e.g. C Minor)"
                        className="bg-[#18181b] border border-white/10 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500/50 placeholder:text-zinc-600"
                    />
                    <input 
                        type="text" 
                        value={negativePrompt}
                        onChange={(e) => setNegativePrompt(e.target.value)}
                        placeholder="Negative Prompt (No Guitars)"
                        className="bg-[#18181b] border border-white/10 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500/50 placeholder:text-zinc-600"
                    />
                </div>
            )}
        </div>
    );
};
