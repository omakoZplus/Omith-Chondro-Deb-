import React, { useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Toast } from './components/Toast';
import { CreateView } from './views/CreateView';
import { LibraryView } from './views/LibraryView';
import { SettingsView } from './views/SettingsView';
import { SongBuilderView } from './views/SongBuilderView';
import { SnakeGame } from './components/features/SnakeGame';
import { PongGame } from './components/features/PongGame';
import { useAppStore } from './stores/useAppStore';
import { useDataStore } from './stores/useDataStore';
import { Search, Menu } from 'lucide-react';

const App: React.FC = () => {
  const { view, isMobileMenuOpen, setMobileMenuOpen, toast, closeToast, setView } = useAppStore();
  const { settings } = useDataStore();

  // Check system preference for reduced motion
  const systemReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const shouldReduceMotion = settings.reduceMotion || systemReducedMotion;

  return (
    <div 
        data-theme={settings.theme}
        className={`flex min-h-screen bg-background text-text-main font-sans selection:bg-primary/30 ${shouldReduceMotion ? 'motion-reduce' : ''}`}
    >
      
      {/* Skip Navigation Link for Accessibility */}
      <a 
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 bg-primary text-white px-4 py-2 rounded-md font-bold"
      >
        Skip to content
      </a>

      {/* Mobile Sidebar Backdrop */}
      {isMobileMenuOpen && (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
        />
      )}
      
      {/* Render Games Full Screen if active, otherwise standard layout */}
      {view === 'snake' ? (
          <SnakeGame />
      ) : view === 'pong' ? (
          <PongGame />
      ) : (
          <>
            <Sidebar />

            <main id="main-content" className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                {/* Header */}
                <header className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-border bg-background/80 backdrop-blur-xl sticky top-0 z-20 h-[72px]">
                <div className="flex items-center gap-3 flex-1 max-w-xl">
                    <button 
                        className="md:hidden p-2 -ml-2 text-text-muted hover:text-text-main rounded-lg hover:bg-element"
                        onClick={() => setMobileMenuOpen(true)}
                        aria-label="Open main menu"
                    >
                        <Menu size={20} />
                    </button>
                    
                    {/* Desktop Search Bar */}
                    <div className="hidden md:block relative w-full group max-w-[300px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-text-main transition-colors" size={16} />
                        <input 
                        type="text" 
                        placeholder="Search library..." 
                        onClick={() => setView('library')}
                        className="w-full bg-surface border border-border rounded-full py-2 pl-10 pr-4 text-sm text-text-main focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-text-muted cursor-pointer"
                        aria-label="Search library"
                        />
                    </div>
                    
                    {/* Mobile Title (When not searching) */}
                    <h1 className="md:hidden text-lg font-bold text-text-main tracking-tight ml-2">
                        StyleArchitect
                    </h1>
                </div>
                
                <div className="flex items-center gap-3 ml-4">
                    {/* Mobile Search Icon */}
                    <button 
                        className="md:hidden p-2 text-text-muted hover:text-text-main rounded-full hover:bg-element"
                        onClick={() => setView('library')}
                        title="Search Library"
                        aria-label="Search Library"
                    >
                        <Search size={20} />
                    </button>
                    
                    <button className="hidden md:block text-xs font-medium text-text-muted hover:text-text-main transition-colors">
                        My Workspace
                    </button>
                    <div className="w-8 h-8 rounded-full bg-element border border-border flex items-center justify-center">
                        <span className="text-xs font-bold text-text-main">DO</span>
                    </div>
                </div>
                </header>

                <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
                <div className="max-w-5xl mx-auto space-y-6">
                    
                    {view === 'create' && <CreateView />}
                    {view === 'songBuilder' && <SongBuilderView />}
                    {view === 'library' && <LibraryView />}
                    {view === 'settings' && <SettingsView />}

                </div>
                </div>
            </main>
          </>
      )}

      {toast && (
        <Toast 
            message={toast.message} 
            type={toast.type} 
            onClose={closeToast} 
        />
      )}
    </div>
  );
};

export default App;