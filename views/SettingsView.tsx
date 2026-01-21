
import React, { useRef } from 'react';
import { useDataStore } from '../stores/useDataStore';
import { useAppStore } from '../stores/useAppStore';
import { AppSettings, AppTheme, SunoVersion } from '../types';
import { Save, Download, Upload, Trash2, Zap, Globe, Layout, Ban, ClipboardCopy, RotateCcw, Search, Image, Mic2, Brain, Palette, Music } from 'lucide-react';

const LANGUAGES = ["English", "Japanese", "Korean", "Spanish", "French", "German", "Italian", "Chinese (Mandarin)", "Russian", "Portuguese", "Indonesian", "Vietnamese", "Thai"];

const THEMES: { id: AppTheme; label: string; colors: string[] }[] = [
    { id: 'dark', label: 'Dark', colors: ['#09090b', '#6366f1'] },
    { id: 'light', label: 'Light', colors: ['#f4f4f5', '#4f46e5'] },
    { id: 'retro', label: 'Retro', colors: ['#1a103c', '#d946ef'] },
    { id: 'hacker', label: 'Hacker', colors: ['#000000', '#22c55e'] },
    { id: 'folk', label: 'Folk', colors: ['#1c1917', '#d97706'] },
];

export const SettingsView: React.FC = () => {
  const { settings, history, updateSettings, resetSettings, clearHistory, importHistory } = useDataStore();
  const { showToast } = useAppStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleToggle = (key: keyof AppSettings, value: any) => {
    updateSettings({ [key]: value });
  };

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(history));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "style_architect_history.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const content = e.target?.result as string;
            const parsed = JSON.parse(content);
            if (Array.isArray(parsed)) {
                importHistory(parsed);
                showToast(`Imported ${parsed.length} items`);
            } else {
                showToast("Invalid history file format", "error");
            }
        } catch (err) {
            console.error(err);
            showToast("Failed to parse file", "error");
        }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };
  
  const handleReset = () => {
      if(confirm("Reset all settings to default?")) {
          resetSettings();
          showToast("Settings reset to defaults");
      }
  };
  
  const handleClearHistory = () => {
       if(confirm("Are you sure you want to clear all history? This cannot be undone.")) {
          clearHistory();
          showToast("History cleared");
      }
  };

  return (
    <div className="animate-in fade-in slide-in-from-right-4 max-w-4xl mx-auto pb-20">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2 text-text-main">Settings</h2>
        <p className="text-text-muted text-sm">Manage your global preferences and data.</p>
      </div>

      <div className="space-y-6">
        {/* Appearance Section */}
        <section className="bg-surface border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-text-main">
              <Palette size={18} className="text-text-muted" /> 
              Appearance & Theme
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {THEMES.map(theme => (
                  <button
                    key={theme.id}
                    onClick={() => handleToggle('theme', theme.id)}
                    className={`group relative p-3 rounded-xl border transition-all text-left ${
                        settings.theme === theme.id 
                        ? 'border-primary bg-primary/5 ring-1 ring-primary' 
                        : 'border-border bg-background hover:bg-element hover:border-text-muted'
                    }`}
                  >
                      <div className="flex gap-1.5 mb-2">
                          <div className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: theme.colors[0] }}></div>
                          <div className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: theme.colors[1] }}></div>
                      </div>
                      <div className="text-xs font-medium text-text-main">{theme.label}</div>
                      {settings.theme === theme.id && (
                          <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                      )}
                  </button>
              ))}
          </div>
        </section>

        {/* Interface & Workflow Section */}
        <section className="bg-surface border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-text-main">
              <Layout size={18} className="text-text-muted" /> 
              Interface & Workflow
          </h3>
          <div className="grid gap-6">
              <div className="flex items-center justify-between">
                  <div>
                      <label className="block text-sm font-medium text-text-main">Default Mode</label>
                      <p className="text-xs text-text-muted">Which tool to open on startup</p>
                  </div>
                  <div className="flex bg-element p-1 rounded-lg border border-border">
                      {['style', 'lyrics', 'image', 'audio'].map(mode => (
                          <button 
                            key={mode}
                            onClick={() => handleToggle('defaultCreationMode', mode)}
                            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors capitalize ${settings.defaultCreationMode === mode ? 'bg-surface text-text-main shadow-sm' : 'text-text-muted hover:text-text-main'}`}
                          >
                              {mode === 'image' ? 'Visual' : mode}
                          </button>
                      ))}
                  </div>
              </div>

              <div className="flex items-center justify-between border-t border-border pt-4">
                  <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${settings.autoCopy ? 'bg-primary/10 text-primary' : 'bg-element text-text-muted'}`}>
                          <ClipboardCopy size={18} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text-main">Auto-Copy Results</label>
                        <p className="text-xs text-text-muted">Automatically copy generated content to clipboard</p>
                      </div>
                  </div>
                  <button 
                    onClick={() => handleToggle('autoCopy', !settings.autoCopy)}
                    className={`w-11 h-6 rounded-full transition-colors relative ${settings.autoCopy ? 'bg-primary' : 'bg-element'}`}
                  >
                      <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${settings.autoCopy ? 'left-6' : 'left-1'}`} />
                  </button>
              </div>

              <div className="flex items-center justify-between border-t border-border pt-4">
                  <div>
                      <label className="block text-sm font-medium text-text-main">Reduced Motion</label>
                      <p className="text-xs text-text-muted">Disable animations for a faster feel</p>
                  </div>
                  <button 
                    onClick={() => handleToggle('reduceMotion', !settings.reduceMotion)}
                    className={`w-11 h-6 rounded-full transition-colors relative ${settings.reduceMotion ? 'bg-primary' : 'bg-element'}`}
                  >
                      <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${settings.reduceMotion ? 'left-6' : 'left-1'}`} />
                  </button>
              </div>
          </div>
        </section>

        {/* Generator Defaults */}
        <section className="bg-surface border border-border rounded-xl p-6">
           <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-text-main">
              <Zap size={18} className="text-text-muted" /> 
              Generator Defaults
          </h3>
          <div className="space-y-6">
              
              {/* Google Search Toggle */}
              <div className="flex items-center justify-between pb-6 border-b border-border">
                  <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${settings.enableGoogleSearch ? 'bg-primary/10 text-primary' : 'bg-element text-text-muted'}`}>
                          <Search size={18} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text-main">Enable Google Search Grounding</label>
                        <p className="text-xs text-text-muted max-w-md">
                            Allows the AI to research real-world genres, artists, and facts. Improves accuracy for complex requests but may slow down generation.
                        </p>
                      </div>
                  </div>
                  <button 
                    onClick={() => handleToggle('enableGoogleSearch', !settings.enableGoogleSearch)}
                    className={`w-11 h-6 rounded-full transition-colors relative ${settings.enableGoogleSearch ? 'bg-primary' : 'bg-element'}`}
                  >
                      <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${settings.enableGoogleSearch ? 'left-6' : 'left-1'}`} />
                  </button>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                  {/* Default Suno Version */}
                  <div>
                      <label className="block text-sm font-medium text-text-main mb-1 flex items-center gap-2">
                          <Music size={14} className="text-text-muted" /> Default Suno Version
                      </label>
                      <p className="text-xs text-text-muted mb-2">Preferred model version</p>
                      <div className="flex bg-element p-1 rounded-lg border border-border w-fit">
                        {(['v5', 'v4.5', 'v4'] as SunoVersion[]).map(ver => (
                            <button
                                key={ver}
                                onClick={() => handleToggle('defaultSunoVersion', ver)}
                                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${settings.defaultSunoVersion === ver ? 'bg-surface text-text-main shadow-sm' : 'text-text-muted hover:text-text-main'}`}
                            >
                                {ver.toUpperCase()}
                            </button>
                        ))}
                    </div>
                  </div>

                  {/* Visual Vibe Mode Output */}
                  <div>
                      <label className="block text-sm font-medium text-text-main mb-1 flex items-center gap-2">
                          <Image size={14} className="text-text-muted" /> Visual Vibe Output
                      </label>
                      <p className="text-xs text-text-muted mb-2">What to generate from images</p>
                      <div className="flex bg-element p-1 rounded-lg border border-border w-fit">
                        <button 
                            onClick={() => handleToggle('defaultImageModeOutput', 'instrumental')}
                            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${settings.defaultImageModeOutput === 'instrumental' ? 'bg-surface text-text-main shadow-sm' : 'text-text-muted hover:text-text-main'}`}
                        >
                            Instrumental
                        </button>
                        <button 
                            onClick={() => handleToggle('defaultImageModeOutput', 'lyrics')}
                            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${settings.defaultImageModeOutput === 'lyrics' ? 'bg-surface text-text-main shadow-sm' : 'text-text-muted hover:text-text-main'}`}
                        >
                            Lyrics
                        </button>
                    </div>
                  </div>

                  {/* Audio Analyzer Output */}
                  <div>
                      <label className="block text-sm font-medium text-text-main mb-1 flex items-center gap-2">
                          <Mic2 size={14} className="text-text-muted" /> Audio Analyzer Output
                      </label>
                      <p className="text-xs text-text-muted mb-2">What to generate from audio</p>
                      <div className="flex bg-element p-1 rounded-lg border border-border w-fit">
                        <button 
                            onClick={() => handleToggle('defaultAudioModeOutput', 'instrumental')}
                            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${settings.defaultAudioModeOutput === 'instrumental' ? 'bg-surface text-text-main shadow-sm' : 'text-text-muted hover:text-text-main'}`}
                        >
                            Instrumental
                        </button>
                        <button 
                            onClick={() => handleToggle('defaultAudioModeOutput', 'lyrics')}
                            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${settings.defaultAudioModeOutput === 'lyrics' ? 'bg-surface text-text-main shadow-sm' : 'text-text-muted hover:text-text-main'}`}
                        >
                            Lyrics
                        </button>
                    </div>
                  </div>

                  {/* Default Language */}
                  <div>
                      <label className="block text-sm font-medium text-text-main mb-1">Default Language</label>
                      <p className="text-xs text-text-muted mb-2">Preferred language for lyrics</p>
                      <div className="relative w-full md:w-64">
                        <select 
                            value={settings.defaultLanguage}
                            onChange={(e) => handleToggle('defaultLanguage', e.target.value)}
                            className="w-full bg-element border border-border rounded-lg py-2 pl-3 pr-8 text-sm text-text-main focus:outline-none appearance-none"
                        >
                            {LANGUAGES.map(lang => <option key={lang} value={lang}>{lang}</option>)}
                        </select>
                        <Globe size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                      </div>
                  </div>

                  {/* Creativity Level */}
                  <div>
                      <label className="block text-sm font-medium text-text-main mb-1 flex justify-between">
                          <span>Creativity Level</span>
                          <span className="text-xs font-normal text-text-muted">{settings.defaultTemperature ?? 0.8}</span>
                      </label>
                      <p className="text-xs text-text-muted mb-2">Lower for precision, higher for wild ideas</p>
                      <div className="flex items-center gap-3">
                          <span className="text-xs text-text-muted">Safe</span>
                          <input 
                            type="range" 
                            min="0.0" 
                            max="2.0" 
                            step="0.1"
                            value={settings.defaultTemperature ?? 0.8}
                            onChange={(e) => handleToggle('defaultTemperature', parseFloat(e.target.value))}
                            className="w-full h-2 bg-element rounded-lg appearance-none cursor-pointer accent-primary"
                          />
                          <span className="text-xs text-text-muted">Wild</span>
                      </div>
                  </div>
              </div>

              <div className="border-t border-border pt-4">
                  <label className="block text-sm font-medium text-text-main mb-1 flex items-center gap-2">
                      <Ban size={14} className="text-red-400" />
                      Global Negative Prompt
                  </label>
                  <p className="text-xs text-text-muted mb-2">Elements to ALWAYS avoid in every generation (e.g. "live, fading out, spoken intro")</p>
                  <textarea
                    value={settings.globalNegativePrompt}
                    onChange={(e) => handleToggle('globalNegativePrompt', e.target.value)}
                    placeholder="Enter keywords to exclude..."
                    className="w-full bg-element border border-border rounded-lg p-3 text-sm text-text-main focus:outline-none focus:border-primary/50 min-h-[80px] resize-none placeholder:text-text-muted"
                  />
              </div>
          </div>
        </section>

        {/* Advanced & Experimental Section */}
        <section className="bg-surface border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-primary">
              <Brain size={18} /> 
              Advanced & Experimental
          </h3>
          <div className="grid gap-6">
              <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${settings.enableDeepMode ? 'bg-primary/10 text-primary' : 'bg-element text-text-muted'}`}>
                          <Zap size={18} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text-main">Deep Mode (Style Only)</label>
                        <p className="text-xs text-text-muted max-w-md">
                            Enables extended reasoning time for Style generation. The model will "think" longer to analyze complex theory and constraints. 
                            <span className="block mt-1 text-primary font-semibold">Significantly increases wait time.</span>
                        </p>
                      </div>
                  </div>
                  <button 
                    onClick={() => handleToggle('enableDeepMode', !settings.enableDeepMode)}
                    className={`w-11 h-6 rounded-full transition-colors relative ${settings.enableDeepMode ? 'bg-primary' : 'bg-element'}`}
                  >
                      <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${settings.enableDeepMode ? 'left-6' : 'left-1'}`} />
                  </button>
              </div>
          </div>
        </section>

        {/* Data Section */}
        <section className="bg-surface border border-border rounded-xl p-6">
           <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-text-main">
              <Save size={18} className="text-text-muted" /> 
              Data & Storage
          </h3>
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <div className="text-sm text-text-muted">
                  <p>Data is stored locally in your browser.</p>
                  <p className="text-xs mt-1">History items: <span className="text-text-main font-mono">{history.length}</span></p>
              </div>
              <div className="flex flex-wrap gap-3">
                   <input 
                        type="file" 
                        ref={fileInputRef}
                        className="hidden" 
                        accept=".json"
                        onChange={handleImport}
                   />
                   <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2 bg-element hover:bg-surface hover:border-text-muted text-text-main text-xs font-medium rounded-lg transition-colors border border-border"
                   >
                       <Upload size={14} /> Import
                   </button>
                   <button 
                    onClick={handleExport}
                    className="flex items-center gap-2 px-4 py-2 bg-element hover:bg-surface hover:border-text-muted text-text-main text-xs font-medium rounded-lg transition-colors border border-border"
                   >
                       <Download size={14} /> Export
                   </button>
                   
                   <div className="w-px h-6 bg-border mx-1"></div>

                   <button 
                    onClick={handleReset}
                    className="flex items-center gap-2 px-4 py-2 bg-element hover:bg-surface hover:border-text-muted text-text-muted hover:text-text-main text-xs font-medium rounded-lg transition-colors border border-border"
                   >
                       <RotateCcw size={14} /> Reset Settings
                   </button>
                   
                   <button 
                    onClick={handleClearHistory}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-medium rounded-lg transition-colors border border-red-500/10"
                   >
                       <Trash2 size={14} /> Clear History
                   </button>
              </div>
          </div>
        </section>

        <div className="flex justify-center pt-8 text-xs text-text-muted">
            <p>Version 1.3.1 • Powered by Google Gemini</p>
        </div>
      </div>
    </div>
  );
};
