
import React from 'react';

export const PromptCardSkeleton = () => (
  <div className="bg-[#18181b] border border-white/5 rounded-xl p-5 flex flex-col h-full animate-pulse">
    <div className="flex justify-between items-start mb-3">
      <div className="w-full">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-4 bg-zinc-800 rounded"></div>
          <div className="w-32 h-4 bg-zinc-800 rounded"></div>
        </div>
        <div className="w-full h-3 bg-zinc-800 rounded mb-1"></div>
        <div className="w-2/3 h-3 bg-zinc-800 rounded"></div>
      </div>
    </div>
    <div className="flex gap-1.5 mb-4">
      <div className="w-12 h-5 bg-zinc-800 rounded-full"></div>
      <div className="w-16 h-5 bg-zinc-800 rounded-full"></div>
      <div className="w-10 h-5 bg-zinc-800 rounded-full"></div>
    </div>
    <div className="flex-grow mb-4 bg-zinc-900/50 rounded-lg h-32 border border-white/5"></div>
    <div className="flex gap-2 mt-auto pt-2 border-t border-white/5">
      <div className="flex-1 h-8 bg-zinc-800 rounded-lg"></div>
      <div className="w-8 h-8 bg-zinc-800 rounded-lg"></div>
      <div className="w-8 h-8 bg-zinc-800 rounded-lg"></div>
    </div>
  </div>
);

export const LyricsSkeleton = () => (
    <div className="bg-[#18181b] border border-white/5 rounded-xl overflow-hidden flex flex-col h-full max-w-2xl mx-auto animate-pulse">
        <div className="p-6 border-b border-white/5 bg-[#202023]/50 flex items-center justify-between">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-zinc-800"></div>
                <div className="space-y-2">
                    <div className="w-32 h-4 bg-zinc-800 rounded"></div>
                    <div className="w-20 h-3 bg-zinc-800 rounded"></div>
                </div>
             </div>
        </div>
        <div className="p-8 space-y-4">
            <div className="w-24 h-4 bg-zinc-800 rounded mb-4"></div>
            <div className="w-full h-3 bg-zinc-800 rounded"></div>
            <div className="w-full h-3 bg-zinc-800 rounded"></div>
            <div className="w-3/4 h-3 bg-zinc-800 rounded"></div>
            <div className="w-full h-3 bg-zinc-800 rounded"></div>
            
            <div className="w-24 h-4 bg-zinc-800 rounded mt-8 mb-4"></div>
            <div className="w-full h-3 bg-zinc-800 rounded"></div>
            <div className="w-full h-3 bg-zinc-800 rounded"></div>
            <div className="w-2/3 h-3 bg-zinc-800 rounded"></div>
        </div>
    </div>
);
