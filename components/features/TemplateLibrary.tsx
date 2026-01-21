
import React, { useState, useMemo } from 'react';
import { X, Search, Music, Mic2, Gamepad2, Tv, LayoutList, ListMusic, Check, ChevronRight, Palette } from 'lucide-react';
import { STYLE_CATEGORIES, LYRICS_STRUCTURES, LYRICS_TOPICS } from '../../constants/templates';
import { CreationMode } from '../../types';

interface TemplateLibraryProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (value: string) => void;
  mode: CreationMode;
}

export const TemplateLibrary: React.FC<TemplateLibraryProps> = ({ isOpen, onClose, onSelect, mode }) => {
  // Dynamically set default tab to the first category key to avoid "Standard Genres" hardcoding error
  const defaultStyleTab = Object.keys(STYLE_CATEGORIES)[0] || 'Pop & Electronic';
  const [activeTab, setActiveTab] = useState<string>(mode === 'style' ? defaultStyleTab : 'Structure');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Lyrics Mode State
  const [selectedStructure, setSelectedStructure] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);

  if (!isOpen) return null;

  // Icons for categories
  const getCategoryIcon = (cat: string) => {
      if (cat.includes("Game")) return <Gamepad2 size={16} />;
      if (cat.includes("Anime") || cat.includes("TV")) return <Tv size={16} />;
      if (cat.includes("BGM")) return <LayoutList size={16} />;
      if (cat.includes("Pop") || cat.includes("Electronic")) return <Music size={16} />;
      if (cat.includes("Rock") || cat.includes("Metal")) return <Music size={16} />;
      return <ListMusic size={16} />;
  };

  const handleLyricsCombine = () => {
      let result = "";
      if (selectedStructure) result += `Structure: ${selectedStructure}\n`;
      if (selectedTopic) result += `Topic: ${selectedTopic}\n`;
      if (selectedStyle) result += `Musical Style: ${selectedStyle}`;
      onSelect(result.trim());
      onClose();
  };

  const renderStyleMode = () => {
      const filteredCategories = Object.entries(STYLE_CATEGORIES).map(([cat, items]) => {
          const filteredItems = items.filter(item => 
              item.label.toLowerCase().includes(searchQuery.toLowerCase()) || 
              item.value.toLowerCase().includes(searchQuery.toLowerCase()) ||
              item.tags?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
          );
          return { category: cat, items: filteredItems };
      }).filter(c => c.items.length > 0);

      return (
          <div className="flex flex-col md:flex-row h-full">
              {/* Sidebar Tabs */}
              <div className="w-full md:w-56 bg-zinc-900/50 border-b md:border-b-0 md:border-r border-white/5 p-2 flex md:flex-col overflow-x-auto md:overflow-visible shrink-0 gap-2 custom-scrollbar">
                  {Object.keys(STYLE_CATEGORIES).map(cat => (
                      <button
                        key={cat}
                        onClick={() => setActiveTab(cat)}
                        className={`px-3 py-2.5 rounded-lg text-xs font-medium text-left flex items-center gap-2 whitespace-nowrap transition-colors ${activeTab === cat ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'}`}
                      >
                          {getCategoryIcon(cat)}
                          <span className="truncate">{cat}</span>
                      </button>
                  ))}
              </div>

              {/* Grid Content */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#09090b]">
                  {filteredCategories.map(({ category, items }) => (
                      <div key={category} className={`mb-8 ${activeTab !== category && searchQuery === '' ? 'hidden' : 'block'}`}>
                           <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                               {getCategoryIcon(category)} {category}
                           </h3>
                           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                               {items.map((item, idx) => (
                                   <button
                                      key={idx}
                                      onClick={() => { onSelect(item.value); onClose(); }}
                                      className="group bg-zinc-900 border border-white/5 hover:border-indigo-500/50 hover:bg-zinc-800 p-4 rounded-xl text-left transition-all h-full flex flex-col"
                                   >
                                       <div className="flex items-center justify-between mb-2">
                                           <span className="font-bold text-sm text-zinc-200 group-hover:text-indigo-400 transition-colors">{item.label}</span>
                                           {item.tags && (
                                               <span className="text-[10px] bg-black/50 px-1.5 py-0.5 rounded text-zinc-500">{item.tags[0]}</span>
                                           )}
                                       </div>
                                       <p className="text-xs text-zinc-500 line-clamp-3 group-hover:text-zinc-400 transition-colors">{item.value}</p>
                                   </button>
                               ))}
                           </div>
                      </div>
                  ))}
                  {filteredCategories.length === 0 && (
                      <div className="text-center py-20 text-zinc-500">
                          <p>No templates found matching "{searchQuery}"</p>
                      </div>
                  )}
              </div>
          </div>
      );
  };

  const renderLyricsMode = () => {
      // Step based UI for Lyrics
      return (
          <div className="flex flex-col h-full bg-[#09090b]">
               <div className="flex-1 overflow-y-auto p-4 md:p-6">
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                       {/* Step 1: Structure */}
                       <section className="space-y-4">
                           <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-2 sticky top-0 bg-[#09090b] z-10 py-2 border-b border-white/5">
                               <div className="w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center text-xs">1</div>
                               Structure
                           </h3>
                           <div className="space-y-2">
                               {LYRICS_STRUCTURES.filter(i => i.label.toLowerCase().includes(searchQuery.toLowerCase())).map((item) => (
                                   <button
                                      key={item.label}
                                      onClick={() => setSelectedStructure(selectedStructure === item.value ? null : item.value)}
                                      className={`w-full text-left p-3 rounded-lg border text-xs transition-all ${selectedStructure === item.value ? 'bg-indigo-500/10 border-indigo-500 text-indigo-200' : 'bg-zinc-900 border-white/5 text-zinc-400 hover:border-white/10'}`}
                                   >
                                       <div className="font-bold mb-1 flex justify-between">
                                           {item.label}
                                           {selectedStructure === item.value && <Check size={14} />}
                                       </div>
                                       <div className="opacity-60 font-mono text-[10px] line-clamp-2">{item.value}</div>
                                   </button>
                               ))}
                           </div>
                       </section>

                       {/* Step 2: Topic */}
                       <section className="space-y-4">
                           <h3 className="text-sm font-bold text-purple-400 uppercase tracking-wider flex items-center gap-2 sticky top-0 bg-[#09090b] z-10 py-2 border-b border-white/5">
                               <div className="w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center text-xs">2</div>
                               Topic
                           </h3>
                           <div className="space-y-2">
                               {LYRICS_TOPICS.filter(i => i.label.toLowerCase().includes(searchQuery.toLowerCase())).map((item) => (
                                   <button
                                      key={item.label}
                                      onClick={() => setSelectedTopic(selectedTopic === item.value ? null : item.value)}
                                      className={`w-full text-left p-3 rounded-lg border text-xs transition-all ${selectedTopic === item.value ? 'bg-purple-500/10 border-purple-500 text-purple-200' : 'bg-zinc-900 border-white/5 text-zinc-400 hover:border-white/10'}`}
                                   >
                                       <div className="font-bold mb-1 flex justify-between">
                                           {item.label}
                                           {selectedTopic === item.value && <Check size={14} />}
                                       </div>
                                       <div className="opacity-60 line-clamp-2">{item.value}</div>
                                   </button>
                               ))}
                           </div>
                       </section>

                       {/* Step 3: Style (Reused from Style Mode) */}
                       <section className="space-y-4">
                           <h3 className="text-sm font-bold text-pink-400 uppercase tracking-wider flex items-center gap-2 sticky top-0 bg-[#09090b] z-10 py-2 border-b border-white/5">
                               <div className="w-6 h-6 rounded-full bg-pink-500 text-white flex items-center justify-center text-xs">3</div>
                               Style Vibe
                           </h3>
                           <div className="space-y-4">
                               {Object.entries(STYLE_CATEGORIES).map(([cat, items]) => {
                                   const relevantItems = items.filter(i => i.label.toLowerCase().includes(searchQuery.toLowerCase()));
                                   if (relevantItems.length === 0) return null;
                                   
                                   return (
                                       <div key={cat} className="space-y-2">
                                           <div className="text-[10px] font-bold text-zinc-500 uppercase px-1">{cat}</div>
                                           {relevantItems.map((item) => (
                                               <button
                                                  key={item.label}
                                                  onClick={() => setSelectedStyle(selectedStyle === item.value ? null : item.value)}
                                                  className={`w-full text-left p-3 rounded-lg border text-xs transition-all ${selectedStyle === item.value ? 'bg-pink-500/10 border-pink-500 text-pink-200' : 'bg-zinc-900 border-white/5 text-zinc-400 hover:border-white/10'}`}
                                               >
                                                   <div className="font-bold mb-1 flex justify-between">
                                                       {item.label}
                                                       {selectedStyle === item.value && <Check size={14} />}
                                                   </div>
                                                   <div className="opacity-60 line-clamp-2">{item.value}</div>
                                               </button>
                                           ))}
                                       </div>
                                   );
                               })}
                           </div>
                       </section>
                   </div>
               </div>

               {/* Footer */}
               <div className="p-4 border-t border-white/10 bg-zinc-900 flex justify-between items-center shrink-0">
                   <div className="text-xs text-zinc-500">
                       {(selectedStructure ? 1 : 0) + (selectedTopic ? 1 : 0) + (selectedStyle ? 1 : 0)} items selected
                   </div>
                   <button 
                      onClick={handleLyricsCombine}
                      disabled={!selectedStructure && !selectedTopic && !selectedStyle}
                      className="bg-white text-black px-6 py-2 rounded-lg font-bold text-sm hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                   >
                       Use Template <ChevronRight size={16} />
                   </button>
               </div>
          </div>
      );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-6">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>

      {/* Modal Container */}
      <div className="relative w-full max-w-6xl h-full md:h-[85vh] bg-[#09090b] md:rounded-2xl border border-white/10 shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-zinc-900 shrink-0">
             <div className="flex items-center gap-3">
                 <h2 className="text-lg font-bold text-white flex items-center gap-2">
                     {mode === 'lyrics' ? <Mic2 size={20} className="text-purple-400" /> : <Music size={20} className="text-indigo-400" />}
                     Template Library
                 </h2>
                 <span className="text-xs px-2 py-0.5 rounded bg-white/10 text-zinc-400 border border-white/5 hidden sm:inline-block">
                     {mode === 'lyrics' ? 'Lyrics Builder' : 'Style Browser'}
                 </span>
             </div>
             
             <div className="flex items-center gap-3">
                 <div className="relative hidden md:block w-64">
                     <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                     <input 
                        type="text" 
                        placeholder="Search templates..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-black/50 border border-white/10 rounded-full py-1.5 pl-9 pr-4 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500/50"
                     />
                 </div>
                 <button onClick={onClose} className="p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                     <X size={20} />
                 </button>
             </div>
        </div>

        {/* Mobile Search Bar (Below header) */}
        <div className="md:hidden p-2 border-b border-white/10 bg-zinc-900 shrink-0">
            <div className="relative">
                 <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                 <input 
                    type="text" 
                    placeholder="Search templates..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-lg py-2 pl-9 pr-4 text-xs text-zinc-200 focus:outline-none"
                 />
             </div>
        </div>

        {/* Body */}
        <div className="flex-1 min-h-0 relative">
            {mode === 'lyrics' ? renderLyricsMode() : renderStyleMode()}
        </div>

      </div>
    </div>
  );
};
