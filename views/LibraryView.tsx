
import React, { useState, useMemo } from 'react';
import { useDataStore } from '../stores/useDataStore';
import { useCreateStore } from '../stores/useCreateStore';
import { useAppStore } from '../stores/useAppStore';
import { Trash2, Clock, Music, Image as ImageIcon, Mic2, ArrowRight, Heart, Search, Filter, CheckSquare } from 'lucide-react';

export const LibraryView: React.FC = () => {
    const { history, clearHistory, deleteHistoryItems, toggleFavorite } = useDataStore();
    const { restoreFromHistory } = useCreateStore();
    const { setView, setMobileMenuOpen, showToast } = useAppStore();

    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<'all' | 'style' | 'lyrics' | 'image' | 'audio'>('all');
    const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
    const [isSelectionMode, setIsSelectionMode] = useState(false);

    const filteredHistory = useMemo(() => {
        return history.filter(item => {
            const matchesSearch = item.theme.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesType = filterType === 'all' || item.type === filterType;
            const matchesFav = showFavoritesOnly ? item.isFavorite : true;
            return matchesSearch && matchesType && matchesFav;
        });
    }, [history, searchQuery, filterType, showFavoritesOnly]);

    const handleRestore = (item: any) => {
        if (isSelectionMode) return;
        restoreFromHistory(item);
        if (item.type === 'image' && !item.imageBase64) {
            showToast("Original image not saved in history", "error");
        } else if (item.type === 'audio' && !item.audioBase64) {
             showToast("Original audio not saved in history", "error");
        }
        setView('create');
        setMobileMenuOpen(false);
    };

    const handleClear = () => {
        if(confirm("Are you sure you want to clear all history? This cannot be undone.")) {
            clearHistory();
            showToast("History cleared");
        }
    };

    const handleToggleSelect = (id: string) => {
        const newSet = new Set(selectedItems);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedItems(newSet);
    };

    const handleDeleteSelected = () => {
        if (selectedItems.size === 0) return;
        if(confirm(`Delete ${selectedItems.size} items?`)) {
            deleteHistoryItems(Array.from(selectedItems));
            setSelectedItems(new Set());
            setIsSelectionMode(false);
            showToast("Items deleted");
        }
    };

    const toggleSelectionMode = () => {
        setIsSelectionMode(!isSelectionMode);
        setSelectedItems(new Set());
    };

    return (
        <div className="animate-in fade-in slide-in-from-right-4 pb-20">
            <div className="flex flex-col gap-4 mb-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">Your Library</h2>
                    <div className="flex items-center gap-2">
                         {isSelectionMode && selectedItems.size > 0 && (
                            <button 
                                onClick={handleDeleteSelected}
                                className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-600 transition-colors flex items-center gap-2"
                                aria-label={`Delete ${selectedItems.size} selected items`}
                            >
                                <Trash2 size={14} /> Delete ({selectedItems.size})
                            </button>
                         )}
                         <button 
                            onClick={toggleSelectionMode}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border border-white/10 flex items-center gap-2 ${isSelectionMode ? 'bg-indigo-500 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`}
                            aria-label={isSelectionMode ? "Cancel selection" : "Select items to delete"}
                         >
                             <CheckSquare size={14} /> {isSelectionMode ? 'Cancel' : 'Select'}
                         </button>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                        <input 
                            type="text" 
                            placeholder="Search history..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-[#18181b] border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm text-zinc-200 focus:outline-none focus:border-white/20"
                            aria-label="Search History"
                        />
                    </div>
                    
                    <div className="flex items-center gap-2 overflow-x-auto pb-1" role="group" aria-label="Filters">
                         <button 
                            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                            className={`px-3 py-2 rounded-lg text-xs font-medium border border-white/5 flex items-center gap-1.5 whitespace-nowrap transition-colors ${showFavoritesOnly ? 'bg-pink-500/10 text-pink-400 border-pink-500/20' : 'bg-[#18181b] text-zinc-400 hover:text-white'}`}
                            aria-pressed={showFavoritesOnly}
                         >
                             <Heart size={14} fill={showFavoritesOnly ? "currentColor" : "none"} /> Favorites
                         </button>
                         <div className="w-px h-6 bg-white/10"></div>
                         {['all', 'style', 'lyrics', 'image', 'audio'].map(t => (
                             <button
                                key={t}
                                onClick={() => setFilterType(t as any)}
                                className={`px-3 py-2 rounded-lg text-xs font-medium border border-white/5 capitalize whitespace-nowrap transition-colors ${filterType === t ? 'bg-zinc-700 text-white' : 'bg-[#18181b] text-zinc-400 hover:text-white'}`}
                                aria-pressed={filterType === t}
                             >
                                 {t === 'image' ? 'Visual' : t}
                             </button>
                         ))}
                    </div>
                </div>
            </div>

            {filteredHistory.length === 0 ? (
                <div className="text-center py-20 text-zinc-500 bg-[#121212] border border-white/5 rounded-2xl">
                    <Clock size={48} className="mx-auto mb-4 opacity-20" />
                    <p className="text-lg font-medium mb-2">No items found</p>
                    <p className="text-sm">Try adjusting filters or create something new.</p>
                    {history.length > 0 && (
                         <button 
                            onClick={() => { setSearchQuery(''); setFilterType('all'); setShowFavoritesOnly(false); }}
                            className="mt-4 text-xs text-indigo-400 hover:text-indigo-300"
                         >
                             Clear filters
                         </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-3">
                    {filteredHistory.map((item) => (
                        <div 
                            key={item.id} 
                            onClick={() => isSelectionMode ? handleToggleSelect(item.id) : handleRestore(item)}
                            className={`relative bg-[#18181b] border rounded-xl p-4 flex items-center justify-between transition-all group cursor-pointer 
                                ${selectedItems.has(item.id) 
                                    ? 'border-indigo-500 bg-indigo-500/5' 
                                    : 'border-white/5 hover:bg-[#202023] hover:border-white/10'}`}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    isSelectionMode ? handleToggleSelect(item.id) : handleRestore(item);
                                }
                            }}
                            aria-label={`${isSelectionMode ? (selectedItems.has(item.id) ? 'Deselect' : 'Select') : 'Restore'} ${item.theme}`}
                            aria-pressed={isSelectionMode ? selectedItems.has(item.id) : undefined}
                        >
                            <div className="flex items-center gap-4 overflow-hidden">
                                {isSelectionMode && (
                                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedItems.has(item.id) ? 'bg-indigo-500 border-indigo-500' : 'border-zinc-600 bg-transparent'}`}>
                                        {selectedItems.has(item.id) && <ArrowRight size={12} className="text-white" />}
                                    </div>
                                )}
                                
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 
                                    ${item.type === 'style' ? 'bg-indigo-500/10 text-indigo-400' : 
                                        item.type === 'image' ? 'bg-pink-500/10 text-pink-400' : 
                                        item.type === 'audio' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-purple-500/10 text-purple-400'}`}>
                                    {item.type === 'style' ? <Music size={20} /> : item.type === 'image' ? <ImageIcon size={20} /> : item.type === 'audio' ? <Mic2 size={20} /> : <Mic2 size={20} />}
                                </div>
                                <div className="min-w-0">
                                    <h4 className={`font-medium truncate ${item.isFavorite ? 'text-pink-100' : 'text-zinc-200'}`}>
                                        {item.theme}
                                    </h4>
                                    <p className="text-xs text-zinc-500 flex items-center gap-2">
                                        <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                                        <span>•</span>
                                        <span className="capitalize">{item.type === 'image' ? 'Visual Vibe' : item.type === 'audio' ? 'Audio Analysis' : item.type}</span>
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                                {item.isFavorite && !isSelectionMode && (
                                     <Heart size={14} className="text-pink-500 fill-pink-500" />
                                )}
                                
                                {!isSelectionMode && (
                                    <>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); toggleFavorite(item.id); }}
                                            className="p-2 text-zinc-600 hover:text-pink-500 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                                            aria-label={item.isFavorite ? "Unfavorite" : "Favorite"}
                                        >
                                            <Heart size={16} fill={item.isFavorite ? "currentColor" : "none"} />
                                        </button>
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white text-black p-2 rounded-lg hover:bg-zinc-200">
                                            <ArrowRight size={16} />
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
