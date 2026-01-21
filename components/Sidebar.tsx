import React from 'react';
import { Home, Library, Music2, Radio, Settings, Disc, Mic2, User, Sparkles, X, Hammer } from 'lucide-react';
import { useAppStore } from '../stores/useAppStore';

export const Sidebar: React.FC = () => {
  const { view, setView, isMobileMenuOpen, setMobileMenuOpen } = useAppStore();

  const navItemClass = (active: boolean) => 
    `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors cursor-pointer text-sm font-medium w-full text-left ${
      active 
        ? "text-white bg-primary shadow-lg shadow-primary/20" 
        : "text-text-muted hover:text-text-main hover:bg-element"
    }`;

  const handleViewChange = (newView: any) => {
      setView(newView);
      setMobileMenuOpen(false);
  };

  const handleUpgradeClick = () => {
      // 10% chance for Pong, 90% chance for Snake
      const random = Math.random();
      if (random < 0.1) {
          handleViewChange('pong');
      } else {
          handleViewChange('snake');
      }
  };

  return (
    <aside 
        className={`
            fixed inset-y-0 left-0 z-40 w-64 bg-background border-r border-border h-screen flex flex-col p-4 
            transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:inset-auto flex-shrink-0
            ${isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
        `}
        aria-label="Main Navigation"
        {...(isMobileMenuOpen ? { 'aria-modal': true, role: 'dialog' } : {})}
    >
      <div className="flex items-center justify-between mb-8 px-2">
        <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-hover rounded-full flex items-center justify-center shadow-lg shadow-primary/20">
            <Sparkles size={18} className="text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-text-main">StyleArchitect</span>
        </div>
        <button 
            onClick={() => setMobileMenuOpen(false)} 
            className="md:hidden text-text-muted hover:text-text-main p-1"
            aria-label="Close menu"
        >
            <X size={20} />
        </button>
      </div>

      <nav className="space-y-1 mb-8">
        <button onClick={() => handleViewChange('create')} className={navItemClass(view === 'create')}>
          <Music2 size={18} />
          <span>Create</span>
        </button>
        <button onClick={() => handleViewChange('songBuilder')} className={navItemClass(view === 'songBuilder')}>
          <Hammer size={18} />
          <span>Song Builder</span>
        </button>
        <button onClick={() => handleViewChange('library')} className={navItemClass(view === 'library')}>
          <Library size={18} />
          <span>Library</span>
        </button>
      </nav>

      <div className="px-3 mb-2 text-xs font-semibold text-text-muted uppercase tracking-wider">
        Collection
      </div>
      <nav className="space-y-1 mb-auto">
        <button className={navItemClass(false)}>
          <Disc size={18} />
          <span>Playlists</span>
        </button>
        <button className={navItemClass(false)}>
          <Mic2 size={18} />
          <span>Artists</span>
        </button>
      </nav>

      <div className="mt-auto border-t border-border pt-4 space-y-1">
        <button className={navItemClass(false)}>
          <User size={18} />
          <span>Profile</span>
        </button>
        <button onClick={() => handleViewChange('settings')} className={navItemClass(view === 'settings')}>
          <Settings size={18} />
          <span>Settings</span>
        </button>
      </div>
      
      <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-element to-surface border border-border">
        <p className="text-xs text-text-muted mb-2">Credits Remaining</p>
        <div className="text-lg font-bold text-text-main mb-2">Unlimited</div>
        <button 
            onClick={handleUpgradeClick} 
            className="w-full py-1.5 text-xs font-semibold bg-text-main text-background rounded-md hover:opacity-90 transition-opacity"
        >
          Upgrade Plan
        </button>
      </div>
    </aside>
  );
};