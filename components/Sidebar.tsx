
import React, { useState } from 'react';
import { Space } from '../types';
import { Layout, Plus, Trash2, Home, BookOpen, Coffee, Monitor, ChevronLeft, PanelLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  spaces: Space[];
  activeSpaceId: string;
  setActiveSpace: (id: string) => void;
  addSpace: (name: string, theme: 'LOFI' | 'REALISTIC') => void;
  removeSpace: (id: string) => void;
  isHidden: boolean;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<Props> = ({ spaces, activeSpaceId, setActiveSpace, addSpace, removeSpace, isHidden, isOpen, setIsOpen }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newTheme, setNewTheme] = useState<'LOFI' | 'REALISTIC'>('LOFI');

  const activeSpace = spaces.find(s => s.id === activeSpaceId);

  const handleCreate = () => {
    if (newName.trim()) {
      addSpace(newName, newTheme);
      setNewName('');
      setIsCreating(false);
    }
  };

  const getIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('study') || n.includes('read')) return <BookOpen size={16} />;
    if (n.includes('code') || n.includes('work')) return <Monitor size={16} />;
    if (n.includes('chill') || n.includes('relax')) return <Coffee size={16} />;
    return <Layout size={16} />;
  };

  if (isHidden) return null;

  // Check if current background is one of the light "Minimal Themes" (Mist or Sand)
  const isLightTheme = activeSpace?.backgroundType === 'COLOR' && 
    (activeSpace.backgroundUrl === '#f1f5f9' || activeSpace.backgroundUrl === '#fdf6e3');

  // Colors based on theme brightness
  const textColorPrimary = isLightTheme ? 'text-slate-800' : 'text-white';
  const textColorSecondary = isLightTheme ? 'text-slate-500' : 'text-white/50';
  const textColorMuted = isLightTheme ? 'text-slate-400' : 'text-white/30';
  const hoverBg = isLightTheme ? 'hover:bg-black/5' : 'hover:bg-white/5';
  const activeBg = isLightTheme ? 'bg-black/5 text-slate-900 shadow-sm' : 'bg-white/10 text-white shadow-sm';
  const iconColorActive = isLightTheme ? 'text-slate-900' : 'text-white';
  const iconColorInactive = isLightTheme ? 'text-slate-400' : 'text-white/40';

  // Dynamic Background Style for Arc Aesthetic
  const sidebarStyle = activeSpace?.backgroundType === 'COLOR' 
    ? { backgroundColor: activeSpace.backgroundUrl, opacity: 0.95 }
    : { backgroundColor: 'rgba(30, 30, 36, 0.9)' };

  return (
    <>
      {/* Simple Toggle Button (Visible ONLY when closed) */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            onClick={() => setIsOpen(true)}
            className="fixed top-6 left-6 z-[6001] p-2.5 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all shadow-lg flex items-center justify-center"
          >
            <PanelLeft size={20} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Sidebar Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed left-0 top-0 bottom-0 w-64 z-[6000]"
          >
            <div 
                className="w-full h-full flex flex-col p-3 relative shadow-[4px_0_24px_rgba(0,0,0,0.2)] backdrop-blur-3xl transition-colors duration-700"
                style={sidebarStyle}
                onClick={(e) => e.stopPropagation()}
            >
              {activeSpace?.backgroundType === 'COLOR' && (
                 <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay" 
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
                 />
              )}

              {/* Clickable Header to Collapse Sidebar - Arrow is now inside for perfect alignment */}
              <div 
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-2 mb-8 px-2 py-2 mt-2 relative z-10 cursor-pointer ${hoverBg} rounded-xl transition-colors group`}
                title="Collapse Sidebar"
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${isLightTheme ? 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 group-hover:bg-indigo-500/20' : 'bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 group-hover:bg-indigo-500/30'}`}>
                  <Home size={16} />
                </div>
                <h1 className={`text-sm font-bold tracking-wide transition-colors ${textColorPrimary} ${isLightTheme ? 'group-hover:text-indigo-600' : 'group-hover:text-indigo-200'}`}>Focus</h1>
                
                {/* Arrow moved inside the flex container */}
                <div className={`ml-auto p-1.5 rounded-lg ${textColorMuted} ${isLightTheme ? 'group-hover:text-slate-800' : 'group-hover:text-white'} transition-colors flex items-center justify-center`}>
                   <ChevronLeft size={16} />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto space-y-1 scrollbar-hide px-1 relative z-10">
                <div className={`text-[10px] font-bold uppercase tracking-widest px-3 mb-2 ${textColorMuted}`}>My Spaces</div>
                {spaces.map(space => (
                  <button
                    key={space.id}
                    onClick={() => setActiveSpace(space.id)}
                    className={`w-full group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${
                      activeSpaceId === space.id 
                        ? activeBg 
                        : `${textColorSecondary} ${hoverBg} ${isLightTheme ? 'hover:text-slate-800' : 'hover:text-white'}`
                    }`}
                  >
                    <span className={activeSpaceId === space.id ? iconColorActive : iconColorInactive}>
                      {getIcon(space.name)}
                    </span>
                    <span className="flex-1 text-left truncate">{space.name}</span>
                    {spaces.length > 1 && (
                      <span 
                        onClick={(e) => { e.stopPropagation(); removeSpace(space.id); }}
                        className={`opacity-0 group-hover:opacity-100 p-1 rounded transition-all ${isLightTheme ? 'hover:bg-black/10 text-slate-400 hover:text-red-500' : 'hover:bg-white/10 text-white/40 hover:text-red-300'}`}
                      >
                        <Trash2 size={12} />
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {isCreating ? (
                <div className={`mt-auto p-3 rounded-xl border animate-in fade-in slide-in-from-bottom-2 relative z-10 ${isLightTheme ? 'bg-black/5 border-black/5' : 'bg-white/5 border-white/5'}`}>
                  <input 
                    autoFocus
                    placeholder="Name"
                    className={`w-full bg-transparent border-b text-sm pb-1 mb-2 outline-none transition-colors ${isLightTheme ? 'border-black/10 text-slate-800 placeholder-slate-400 focus:border-indigo-500' : 'border-white/10 text-white placeholder-white/20 focus:border-indigo-500/50'}`}
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                  />
                  <div className="flex gap-1.5 mb-2">
                    <button 
                      onClick={() => setNewTheme('LOFI')}
                      className={`flex-1 text-[10px] py-1 rounded-md border ${newTheme === 'LOFI' ? 'bg-indigo-500/20 border-indigo-500/30 ' + (isLightTheme ? 'text-indigo-700' : 'text-white') : (isLightTheme ? 'border-black/5 text-slate-500 hover:bg-black/5' : 'border-white/5 text-white/30 hover:bg-white/5')}`}
                    >
                      Lofi
                    </button>
                    <button 
                      onClick={() => setNewTheme('REALISTIC')}
                      className={`flex-1 text-[10px] py-1 rounded-md border ${newTheme === 'REALISTIC' ? 'bg-indigo-500/20 border-indigo-500/30 ' + (isLightTheme ? 'text-indigo-700' : 'text-white') : (isLightTheme ? 'border-black/5 text-slate-500 hover:bg-black/5' : 'border-white/5 text-white/30 hover:bg-white/5')}`}
                    >
                      Real
                    </button>
                  </div>
                  <div className="flex gap-1.5">
                    <button onClick={() => setIsCreating(false)} className={`flex-1 py-1 rounded-md text-[10px] ${isLightTheme ? 'text-slate-500 hover:bg-black/5' : 'text-white/40 hover:bg-white/5'}`}>Cancel</button>
                    <button onClick={handleCreate} className={`flex-1 py-1 rounded-md text-[10px] font-medium ${isLightTheme ? 'bg-black/10 text-slate-800 hover:bg-black/20' : 'bg-white/10 text-white hover:bg-white/20'}`}>Create</button>
                  </div>
                </div>
              ) : (
                <button 
                  onClick={() => setIsCreating(true)}
                  className={`mt-auto flex items-center gap-3 w-full px-3 py-2.5 rounded-lg transition-all text-sm font-medium relative z-10 ${textColorMuted} ${hoverBg} ${isLightTheme ? 'hover:text-slate-800' : 'hover:text-white'}`}
                >
                  <Plus size={16} />
                  <span>New Space</span>
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
