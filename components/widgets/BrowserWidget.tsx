
import React, { useState } from 'react';
import { BrowserWidgetData } from '../../types';
import { Search, RotateCw, ArrowLeft, ArrowRight, Lock, Globe, ShieldCheck, Compass } from 'lucide-react';

interface Props {
  data: BrowserWidgetData;
  updateWidget: (id: string, updates: Partial<BrowserWidgetData>) => void;
}

export const BrowserWidget: React.FC<Props> = ({ data, updateWidget }) => {
  const [inputUrl, setInputUrl] = useState(data.url);
  const [isLoading, setIsLoading] = useState(false);

  const handleNavigate = (urlOverride?: string) => {
    let url = urlOverride || inputUrl.trim();
    if (!url) return;
    
    if (!/^https?:\/\//i.test(url)) {
      url = 'https://' + url;
    }
    
    setInputUrl(url);
    updateWidget(data.id, { url });
    setIsLoading(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNavigate();
    }
  };

  const onLoad = () => {
    setIsLoading(false);
  };

  const QuickLink = ({ name, url, icon }: { name: string, url: string, icon: React.ReactNode }) => (
    <button 
        onClick={() => handleNavigate(url)}
        className="flex flex-col items-center gap-3 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all group"
    >
        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/70 group-hover:text-white group-hover:scale-110 transition-all">
            {icon}
        </div>
        <span className="text-xs font-medium text-white/60 group-hover:text-white">{name}</span>
    </button>
  );

  return (
    <div className="h-full w-full flex flex-col bg-[#1E1E24] overflow-hidden">
      {/* Modern Toolbar */}
      <div className="flex items-center gap-3 p-3 border-b border-white/5 bg-black/20 backdrop-blur-md relative z-10">
        
        {/* Navigation Controls */}
        <div className="flex items-center gap-1">
            <button className="p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-30">
                <ArrowLeft size={16} />
            </button>
            <button className="p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-30">
                <ArrowRight size={16} />
            </button>
            <button 
                onClick={() => handleNavigate()}
                className={`p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors ${isLoading ? 'animate-spin' : ''}`}
            >
                <RotateCw size={14} />
            </button>
        </div>
        
        {/* Address Bar */}
        <div className="flex-1 flex items-center justify-center">
            <div className="flex items-center w-full max-w-md bg-black/40 hover:bg-black/50 transition-colors rounded-full px-4 py-1.5 border border-white/5 focus-within:border-white/20 focus-within:bg-black/60 shadow-inner group">
                <div className="mr-2 text-white/30 group-focus-within:text-indigo-400 transition-colors">
                     {data.url.startsWith('https') ? <Lock size={10} /> : <Globe size={12} />}
                </div>
                
                <input
                    type="text"
                    className="flex-1 bg-transparent border-none outline-none text-xs text-center group-focus-within:text-left text-white/90 placeholder-white/30 font-medium tracking-wide"
                    placeholder="Search or enter website"
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onMouseDown={(e) => e.stopPropagation()}
                    onFocus={(e) => e.target.select()}
                />
            </div>
        </div>

        {/* Placeholder for menu/extensions */}
        <div className="w-[88px] flex justify-end">
            <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                <ShieldCheck size={14} />
            </div>
        </div>
      </div>

      {/* Loading Progress Bar */}
      {isLoading && (
        <div className="h-0.5 w-full bg-white/5 overflow-hidden absolute top-[60px] z-20">
            <div className="h-full bg-indigo-500 w-1/3 animate-[loading_1.5s_ease-in-out_infinite]" />
        </div>
      )}

      {/* Content Area */}
      <div className="flex-1 relative bg-white">
        {data.url ? (
          <iframe
            src={data.url}
            className="w-full h-full border-none bg-white"
            title="Browser"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            onLoad={onLoad}
          />
        ) : (
          /* Start Page / New Tab */
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0F0F12] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-[#0F0F12] to-[#0F0F12]">
            <div className="mb-8 flex flex-col items-center">
                <Compass size={64} className="text-indigo-500 mb-4 opacity-80 drop-shadow-[0_0_15px_rgba(99,102,241,0.3)]" />
                <h2 className="text-xl font-medium text-white/90 tracking-tight">Focus Browser</h2>
            </div>
            
            <div className="w-full max-w-md px-6 mb-10">
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-indigo-400 transition-colors" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search the web..."
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white outline-none focus:border-indigo-500/50 focus:bg-white/10 transition-all shadow-xl"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleNavigate(`https://www.bing.com/search?q=${e.currentTarget.value}`);
                            }
                        }}
                        onMouseDown={(e) => e.stopPropagation()}
                    />
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
                <QuickLink name="Wikipedia" url="https://www.wikipedia.org" icon={<Globe size={20} />} />
                <QuickLink name="Bing" url="https://www.bing.com" icon={<Search size={20} />} />
                <QuickLink name="News" url="https://www.bbc.com" icon={<Compass size={20} />} />
            </div>

            <p className="absolute bottom-6 text-[10px] text-white/20 max-w-xs text-center">
                Note: Many major websites (Google, YouTube) block embedding. Use simplified versions or alternatives.
            </p>
          </div>
        )}
      </div>
      
      <style>{`
        @keyframes loading {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(300%); }
        }
      `}</style>
    </div>
  );
};
