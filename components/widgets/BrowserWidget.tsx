
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { BrowserWidgetData } from '../../types';
import { Search, RotateCw, ArrowLeft, ArrowRight, Lock, Globe, ShieldCheck, Compass, X, ZoomIn, ZoomOut } from 'lucide-react';

interface Props {
  data: BrowserWidgetData;
  updateWidget: (id: string, updates: Partial<BrowserWidgetData>) => void;
}

// Window augmentation for TypeScript
declare global {
  interface Window {
    ipcRenderer: {
      invoke: (channel: string, ...args: any[]) => Promise<any>;
    };
  }
}

export const BrowserWidget: React.FC<Props> = ({ data, updateWidget }) => {
  const [inputUrl, setInputUrl] = useState(data.url);
  const containerRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number | null>(null);
  const previousBounds = useRef<DOMRect | null>(null);
  
  // Zoom State
  const [zoomLevel, setZoomLevel] = useState(1.0); // 1.0 = 100%

  // Sync Layout Loop
  const syncLayout = useCallback(() => {
    if (containerRef.current) {
      const bounds = containerRef.current.getBoundingClientRect();
      
      // Only update if bounds changed significantly (ignore sub-pixel jitter)
      if (!previousBounds.current || 
          Math.abs(bounds.x - previousBounds.current.x) > 1 ||
          Math.abs(bounds.y - previousBounds.current.y) > 1 ||
          Math.abs(bounds.width - previousBounds.current.width) > 1 ||
          Math.abs(bounds.height - previousBounds.current.height) > 1) {
        
        // IMPORTANT: If no URL, we don't show the view (hide it), so bounds don't matter much.
        // But if URL exists, we update bounds.
        // We leave a small gap at the bottom-right for the resize handle of the parent widget.
        // Parent DraggableWidget handle is at bottom-right.
        const gripSize = 16; 
        
        // We can just subtract a bit from height to reveal the resize handle area at the bottom.
        // Or essentially, just render the view slightly smaller inside the container.
        const rect = {
          x: Math.round(bounds.x),
          y: Math.round(bounds.y),
          width: Math.round(bounds.width), // Full width
          height: Math.round(bounds.height) - 10 // Leave 10px at bottom for resize handle visibility
        };

        if (data.url) {
            window.ipcRenderer.invoke('browser-view:update-bounds', data.id, rect).catch(console.error);
        } else {
            // If no URL/Start Page, hide the view
            window.ipcRenderer.invoke('browser-view:hide', data.id).catch(console.error);
        }
        previousBounds.current = bounds;
      }
    }
    requestRef.current = requestAnimationFrame(syncLayout);
  }, [data.id, data.url]);

  // Initial Setup & Cleanup
  useEffect(() => {
    if (!containerRef.current) return;
    
    // 1. Initial Creation (Only if URL exists, but we create it anyway and hide/show via syncLayout)
    const bounds = containerRef.current.getBoundingClientRect();
    const rect = {
        x: Math.round(bounds.x),
        y: Math.round(bounds.y),
        width: Math.round(bounds.width),
        height: Math.round(bounds.height)
    };
    
    // Create view
    window.ipcRenderer.invoke('browser-view:create', data.id, data.url, rect);

    // 2. Start Sync Loop
    requestRef.current = requestAnimationFrame(syncLayout);

    // 3. Cleanup on Unmount
    return () => {
      if (requestRef.current !== null) {
        cancelAnimationFrame(requestRef.current);
      }
      window.ipcRenderer.invoke('browser-view:destroy', data.id);
    };
  }, [data.id]); // Re-create if ID changes (rare)

  // Initial Visibility Sync
  useEffect(() => {
    if (!data.url) {
        window.ipcRenderer.invoke('browser-view:hide', data.id);
    } else {
        // Force a bounds update to show it
        // The syncLayout loop will pick this up next frame, but we can trigger immediate load
        window.ipcRenderer.invoke('browser-view:load', data.id, data.url);
    }
  }, [data.url, data.id]);


  // Update Zoom
  useEffect(() => {
      if (data.url) {
          window.ipcRenderer.invoke('browser-view:zoom', data.id, zoomLevel);
      }
  }, [zoomLevel, data.id, data.url]);

  // Navigate Handler
  const handleNavigate = (urlOverride?: string) => {
    let url = urlOverride || inputUrl.trim();
    if (!url) return;
    
    if (!/^https?:\/\//i.test(url)) {
      url = 'https://' + url;
    }
    
    setInputUrl(url);
    updateWidget(data.id, { url });
    // View loading is handled by effect or direct invoke
    window.ipcRenderer.invoke('browser-view:load', data.id, url);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNavigate();
    }
  };

  const handleControl = (action: 'back' | 'forward' | 'reload' | 'stop') => {
      window.ipcRenderer.invoke('browser-view:control', data.id, action);
  };

  const handleZoom = (delta: number) => {
      setZoomLevel(prev => {
          const next = Math.min(Math.max(prev + delta, 0.25), 3.0); // 25% to 300%
          return parseFloat(next.toFixed(1));
      });
  };

  // Keep input synchronized if data changes externally
  useEffect(() => {
      if (data.url !== inputUrl) {
          setInputUrl(data.url);
      }
  }, [data.url]);


  // Quick Link Component
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
      <div className="flex items-center gap-2 p-2 border-b border-white/5 bg-black/20 backdrop-blur-md relative z-10 drag-handle">
        
        {/* Navigation Controls */}
        <div className="flex items-center">
            <button onClick={() => handleControl('back')} className="p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/10 transition-colors">
                <ArrowLeft size={14} />
            </button>
            <button onClick={() => handleControl('forward')} className="p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/10 transition-colors">
                <ArrowRight size={14} />
            </button>
            <button onClick={() => handleControl('reload')} className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors">
                <RotateCw size={12} />
            </button>
        </div>
        
        {/* Address Bar */}
        <div className="flex-1 flex items-center justify-center mx-1">
            <div className="flex items-center w-full max-w-md bg-black/40 hover:bg-black/50 transition-colors rounded-full px-3 py-1 border border-white/5 focus-within:border-white/20 focus-within:bg-black/60 shadow-inner group h-7">
                <div className="mr-2 text-white/30 group-focus-within:text-indigo-400 transition-colors">
                     {data.url.startsWith('https') ? <Lock size={10} /> : <Globe size={10} />}
                </div>
                
                <input
                    type="text"
                    className="flex-1 bg-transparent border-none outline-none text-[11px] text-center group-focus-within:text-left text-white/90 placeholder-white/30 font-medium tracking-wide"
                    placeholder="Search or enter website"
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onMouseDown={(e) => e.stopPropagation()}
                    onFocus={(e) => e.target.select()}
                />
            </div>
        </div>

        {/* Zoom & Extras */}
        <div className="flex items-center gap-1">
             <div className="flex items-center bg-white/5 rounded-lg px-1 h-7 border border-white/5">
                <button onClick={() => handleZoom(-0.1)} className="p-1 text-white/40 hover:text-white transition-colors">
                    <ZoomOut size={12} />
                </button>
                <span className="text-[10px] w-8 text-center text-white/60 font-mono">
                    {Math.round(zoomLevel * 100)}%
                </span>
                <button onClick={() => handleZoom(0.1)} className="p-1 text-white/40 hover:text-white transition-colors">
                    <ZoomIn size={12} />
                </button>
             </div>
        </div>
      </div>

      {/* Content Area - Placeholder for WebContentsView */}
      <div className="flex-1 relative bg-[#0F0F12] w-full h-full">
         <div ref={containerRef} className="absolute inset-0 w-full h-full" />
         
         {/* Start Page Overlay - Visible only when NO URL is set */}
         {!data.url && (
             <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0F0F12] z-50 pointer-events-auto">
                {/* Background Decor */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-900/10 via-[#0F0F12] to-[#0F0F12] pointer-events-none" />

                <div className="mb-8 flex flex-col items-center relative z-10">
                    <Compass size={56} className="text-indigo-500 mb-4 opacity-80 drop-shadow-[0_0_15px_rgba(99,102,241,0.3)]" />
                    <h2 className="text-xl font-medium text-white/90 tracking-tight">Focus Browser</h2>
                </div>
                
                <div className="w-full max-w-sm px-6 mb-10 relative z-10">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-indigo-400 transition-colors" size={16} />
                        <input 
                            type="text" 
                            placeholder="Search the web..."
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-11 pr-4 text-sm text-white outline-none focus:border-indigo-500/50 focus:bg-white/10 transition-all shadow-xl placeholder-white/20"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleNavigate(`https://www.bing.com/search?q=${e.currentTarget.value}`);
                                }
                            }}
                            onMouseDown={(e) => e.stopPropagation()}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4 relative z-10">
                    <QuickLink name="Notion" url="https://notion.so" icon={<Compass size={20} />} />
                    <QuickLink name="Google" url="https://google.com" icon={<Search size={20} />} />
                    <QuickLink name="YouTube" url="https://youtube.com" icon={<Globe size={20} />} />
                </div>
             </div>
         )}
      </div>
    </div>
  );
};
