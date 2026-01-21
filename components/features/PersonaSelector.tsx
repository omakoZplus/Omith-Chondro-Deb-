
import React, { useState } from 'react';
import { User, Plus, Trash2, Check, Music } from 'lucide-react';
import { useDataStore } from '../../stores/useDataStore';
import { useCreateStore } from '../../stores/useCreateStore';
import { ArtistProfile } from '../../types';

export const PersonaSelector: React.FC = () => {
    const { profiles, addProfile, deleteProfile } = useDataStore();
    const { activeProfileId, setActiveProfileId } = useCreateStore();
    const [isCreating, setIsCreating] = useState(false);
    const [newName, setNewName] = useState('');
    const [newDesc, setNewDesc] = useState('');

    // Predefined colors for variety
    const colors = ['bg-indigo-500', 'bg-pink-500', 'bg-emerald-500', 'bg-purple-500', 'bg-orange-500', 'bg-cyan-500'];

    const handleCreate = () => {
        if (!newName.trim() || !newDesc.trim()) return;
        
        const color = colors[Math.floor(Math.random() * colors.length)];
        const profile: ArtistProfile = {
            id: crypto.randomUUID(),
            name: newName,
            description: newDesc,
            color
        };
        
        addProfile(profile);
        setActiveProfileId(profile.id);
        setIsCreating(false);
        setNewName('');
        setNewDesc('');
    };

    const handleToggle = (id: string) => {
        if (activeProfileId === id) setActiveProfileId(null);
        else setActiveProfileId(id);
    };

    return (
        <div className="mb-4">
            <div className="flex items-center justify-between mb-2 px-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                    <User size={12} /> Sonic Personas (Your Theme)
                </label>
                <button 
                    onClick={() => setIsCreating(!isCreating)}
                    className="text-[10px] flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-medium"
                >
                    <Plus size={10} /> {isCreating ? 'Cancel' : 'New Persona'}
                </button>
            </div>

            {/* Creation Form */}
            {isCreating && (
                <div className="bg-zinc-900 border border-white/10 rounded-lg p-3 mb-3 animate-in slide-in-from-top-2">
                    <input 
                        type="text" 
                        placeholder="Artist Name (e.g. Neon Samurai)"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="w-full bg-black/50 border border-white/10 rounded px-2 py-1.5 text-xs text-white mb-2 focus:outline-none focus:border-indigo-500"
                    />
                    <textarea 
                        placeholder="Describe their sound/theme (e.g. Dark synthwave, distorted bass, aggressive vocals, cyberpunk atmosphere)"
                        value={newDesc}
                        onChange={(e) => setNewDesc(e.target.value)}
                        className="w-full bg-black/50 border border-white/10 rounded px-2 py-1.5 text-xs text-white mb-2 focus:outline-none focus:border-indigo-500 resize-none min-h-[60px]"
                    />
                    <button 
                        onClick={handleCreate}
                        disabled={!newName || !newDesc}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-1.5 rounded text-xs font-bold transition-colors disabled:opacity-50"
                    >
                        Save Persona
                    </button>
                </div>
            )}

            {/* Profiles List */}
            {profiles.length === 0 && !isCreating ? (
                <div className="text-center py-4 border border-dashed border-white/10 rounded-lg">
                    <p className="text-xs text-zinc-500">Create a Persona to save your recurring themes/sounds.</p>
                </div>
            ) : (
                <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                    {profiles.map(profile => {
                        const isActive = activeProfileId === profile.id;
                        return (
                            <div 
                                key={profile.id}
                                onClick={() => handleToggle(profile.id)}
                                className={`
                                    relative flex-shrink-0 w-40 p-3 rounded-lg border cursor-pointer transition-all
                                    ${isActive 
                                        ? `bg-zinc-800 border-${profile.color.replace('bg-', '')} shadow-lg ring-1 ring-${profile.color.replace('bg-', '')}` 
                                        : 'bg-[#18181b] border-white/5 hover:border-white/20'
                                    }
                                `}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <div className={`w-6 h-6 rounded-full ${profile.color} flex items-center justify-center text-white text-[10px] font-bold shadow-sm`}>
                                        {profile.name.charAt(0)}
                                    </div>
                                    {isActive && <Check size={12} className="text-white" />}
                                </div>
                                <h4 className="text-xs font-bold text-white truncate mb-1">{profile.name}</h4>
                                <p className="text-[10px] text-zinc-500 line-clamp-2 leading-tight">{profile.description}</p>
                                
                                <button 
                                    onClick={(e) => { e.stopPropagation(); deleteProfile(profile.id); if(isActive) setActiveProfileId(null); }}
                                    className="absolute top-2 right-2 p-1 text-zinc-600 hover:text-red-400 opacity-0 hover:opacity-100 transition-opacity"
                                >
                                    <Trash2 size={10} />
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};