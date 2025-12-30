
import React, { useRef, useState, useEffect } from 'react';
import { motion, useDragControls } from 'framer-motion';
import { 
  Widget, 
  MemoWidgetData, 
  TodoWidgetData, 
  TimerWidgetData, 
  BookmarksWidgetData, 
  EditorWidgetData, 
  BrowserWidgetData, 
  CanvasWidgetData, 
  ReaderWidgetData, 
  PhotoWidgetData, 
  NewMemoWidgetData, 
  NewEditorWidgetData, 
  CalendarWidgetData, 
  ClockWidgetData,
  KanbanWidgetData,
  FocusSessionState,
  RadioState
} from '../types';
import { GlassCard } from './ui/GlassCard';
import { X, GripHorizontal, ArrowDownRight, Maximize2, Minimize2 } from 'lucide-react';
import { MemoWidget } from './widgets/MemoWidget';
import { TodoWidget } from './widgets/TodoWidget';
import { TimerWidget } from './widgets/TimerWidget';
import { BookmarksWidget } from './widgets/BookmarksWidget';
import { EditorWidget } from './widgets/EditorWidget';
import { BrowserWidget } from './widgets/BrowserWidget';
import { CanvasWidget } from './widgets/CanvasWidget';
import { ReaderWidget } from './widgets/ReaderWidget';
import { PhotoWidget } from './widgets/PhotoWidget';
import { NewMemoWidget } from './widgets/NewMemoWidget';
import { NewEditorWidget } from './widgets/NewEditorWidget';
import { CalendarWidget } from './widgets/CalendarWidget';
import { ClockWidget } from './widgets/ClockWidget';
import { KanbanWidget } from './widgets/KanbanWidget';

interface Props {
  widget: Widget;
  isMaximized: boolean;
  onToggleMaximize: () => void;
  containerRef: React.RefObject<HTMLDivElement>;
  updateWidget: (id: string, data: any) => void;
  removeWidget: (id: string) => void;
  updatePosition: (id: string, pos: { x: number, y: number, width?: number, height?: number }) => void;
  bringToFront: (id: string) => void;
  onFocusTask?: (taskName: string, widgetId: string) => void;
  focusSession?: FocusSessionState;
  onStopSession?: () => void;
  onCompleteTask?: (widgetId: string, taskId: string) => void;
  updateSession?: (updates: Partial<FocusSessionState>) => void;
  radioState?: RadioState;
  radioControls?: {
    toggleRadio: () => void;
    setRadioVolume: (vol: number) => void;
    nextStation: () => void;
  };
}

export const DraggableWidget: React.FC<Props> = ({ 
  widget, 
  isMaximized,
  onToggleMaximize,
  containerRef, 
  updateWidget, 
  removeWidget, 
  updatePosition,
  bringToFront,
  onFocusTask,
  focusSession,
  onStopSession,
  onCompleteTask,
  updateSession,
  radioState,
  radioControls
}) => {
  const nodeRef = useRef<HTMLDivElement>(null);
  const dragControls = useDragControls();
  const [isResizing, setIsResizing] = useState(false);

  // Check if this specific widget is the active focus widget
  const isFocusActive = focusSession?.isActive && focusSession?.activeWidgetId === widget.id;
  const isFocusPaused = isFocusActive && focusSession?.isPaused;

  // KEY LOGIC CHANGE: Only morph to dot if active AND NOT paused.
  // If paused, we want to see the original widget (List View).
  const isCompactMode = isFocusActive && !isFocusPaused;

  const width = widget.position.width || 300;
  const height = widget.position.height || 300;

  // -- Dynamic Positioning Logic --
  // 1. Running State: Top Center Capsule
  const dotWidth = 240; // Default expanded width for controls
  const dotX = window.innerWidth / 2 - (dotWidth / 2); // Center X
  const dotY = 24; // Top Margin

  // Determine Render Props
  let renderX, renderY, renderWidth, renderHeight, renderRadius;
  let renderZ = widget.zIndex;

  if (isCompactMode) {
      // Running: Capsule/Dot
      renderZ = 9999; // Always on top
      renderX = dotX; // Note: The Widget itself will handle the variable width based on hover
      renderY = dotY;
      renderWidth = 'auto'; // Allow internal content to dictate width
      renderHeight = 'auto';
      renderRadius = 9999;
  } else if (isMaximized) {
      renderX = 0;
      renderY = 0;
      renderWidth = '100%';
      renderHeight = '100%';
      renderRadius = 0;
      renderZ = 6000;
  } else {
      // Normal or Paused state (Restores to original position)
      renderX = widget.position.x;
      renderY = widget.position.y;
      renderWidth = width;
      renderHeight = height;
      renderRadius = 16;
      if (isFocusPaused) renderZ = 9999; // Keep on top if paused
  }

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    bringToFront(widget.id);
  };

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!nodeRef.current) return;
      const newWidth = Math.max(150, e.clientX - nodeRef.current.getBoundingClientRect().left);
      const newHeight = Math.max(150, e.clientY - nodeRef.current.getBoundingClientRect().top);
      updatePosition(widget.id, { 
          x: widget.position.x, 
          y: widget.position.y,
          width: newWidth,
          height: newHeight
      });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, widget.id, updatePosition, widget.position.x, widget.position.y]);

  const renderContent = () => {
    switch (widget.type) {
      case 'MEMO': return <MemoWidget data={widget as MemoWidgetData} updateWidget={updateWidget} />;
      case 'TODO': return (
        <TodoWidget 
          data={widget as TodoWidgetData} 
          updateWidget={updateWidget} 
          onFocusTask={(task) => onFocusTask?.(task, widget.id)} 
          focusSession={focusSession}
          onStopSession={onStopSession}
          onCompleteTask={(taskId) => onCompleteTask?.(widget.id, taskId)}
          updateSession={updateSession}
          radioState={radioState}
          radioControls={radioControls}
        />
      );
      case 'TIMER': return <TimerWidget data={widget as TimerWidgetData} updateWidget={updateWidget} />;
      case 'BOOKMARKS': return <BookmarksWidget data={widget as BookmarksWidgetData} updateWidget={updateWidget} />;
      case 'EDITOR': return <EditorWidget data={widget as EditorWidgetData} updateWidget={updateWidget} />;
      case 'BROWSER': return <BrowserWidget data={widget as BrowserWidgetData} updateWidget={updateWidget} />;
      case 'CANVAS': return <CanvasWidget data={widget as CanvasWidgetData} updateWidget={updateWidget} />;
      case 'READER': return <ReaderWidget data={widget as ReaderWidgetData} updateWidget={updateWidget} />;
      case 'PHOTO': return <PhotoWidget data={widget as PhotoWidgetData} updateWidget={updateWidget} />;
      case 'NEW_MEMO': return <NewMemoWidget data={widget as NewMemoWidgetData} updateWidget={updateWidget} />;
      case 'NEW_EDITOR': return <NewEditorWidget data={widget as NewEditorWidgetData} updateWidget={updateWidget} />;
      case 'CALENDAR': return <CalendarWidget data={widget as CalendarWidgetData} updateWidget={updateWidget} />;
      case 'CLOCK': return <ClockWidget data={widget as ClockWidgetData} updateWidget={updateWidget} />;
      case 'KANBAN': return <KanbanWidget data={widget as KanbanWidgetData} updateWidget={updateWidget} />;
      default: return null;
    }
  };

  // Special styling logic
  const isPhoto = widget.type === 'PHOTO';
  const isNewWidget = 
    widget.type === 'NEW_MEMO' || 
    widget.type === 'NEW_EDITOR' || 
    widget.type === 'CALENDAR' || 
    widget.type === 'CLOCK' || 
    widget.type === 'TODO' || 
    widget.type === 'KANBAN';
    
  const isDarkTheme = isNewWidget && (widget as any).theme === 'DARK';

  // Override class for specific widget types
  let glassOverrideClass = '';
  if (isPhoto) {
    glassOverrideClass = '!bg-transparent !border-0 !shadow-none';
  } else if (isNewWidget) {
    if (isDarkTheme) {
        glassOverrideClass = '!bg-[#18181b] !backdrop-blur-none !border-zinc-800 text-zinc-300 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)]';
    } else {
        glassOverrideClass = '!bg-white !backdrop-blur-none !border-white/20 text-slate-800 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)]';
    }
  }

  // Focus Mode Overrides
  if (isCompactMode) {
      glassOverrideClass = '!bg-[#0F0F12] !border-white/10 !shadow-lg !overflow-hidden !backdrop-blur-xl';
  }

  // Photo widgets need overflow visible for the pin to stick out
  const overflowClass = isPhoto ? 'overflow-visible' : 'overflow-hidden';

  // Control button colors based on background
  const controlBtnClass = isNewWidget 
    ? (isDarkTheme ? 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800' : 'text-slate-400 hover:text-slate-800 hover:bg-slate-100')
    : 'text-white/50 hover:text-white hover:bg-white/10';

  const controlGripClass = isNewWidget
    ? (isDarkTheme ? 'text-zinc-600 hover:text-zinc-400' : 'text-slate-300 hover:text-slate-500')
    : 'text-white/50 hover:text-white';


  // --- DRAG LOGIC ---
  const handlePointerDown = (e: React.PointerEvent) => {
    // 1. Bring to front on interaction
    bringToFront(widget.id);

    // 2. Prevent drag if maximizing, resizing, or in compact mode
    if (isResizing || isMaximized || isCompactMode) return;

    // 3. Prevent widget drag if interacting with inputs/buttons
    // This allows selecting text or clicking buttons without moving the widget.
    const target = e.target as HTMLElement;
    const isInteractive = 
        target.tagName === 'INPUT' || 
        target.tagName === 'TEXTAREA' || 
        target.tagName === 'BUTTON' || 
        target.tagName === 'SELECT' ||
        target.isContentEditable ||
        target.closest('button') !== null ||
        target.closest('.no-drag') !== null;

    if (isInteractive) return;

    // 4. Start Drag
    // IMPORTANT: Child components (like Todo items) that have their own drag handles
    // MUST call e.stopPropagation() on their onPointerDown events.
    // If they do, this handler won't fire, and the widget won't move.
    dragControls.start(e);
  };

  return (
    <motion.div
      layout
      drag={!isResizing && !isMaximized && !isCompactMode}
      dragListener={false} // Disable auto listeners, use controls
      dragControls={dragControls}
      dragConstraints={containerRef}
      dragElastic={0.1}
      dragMomentum={false}
      initial={{ x: widget.position.x, y: widget.position.y, opacity: 0, scale: 0.9 }}
      animate={{ 
        x: renderX, 
        y: renderY, 
        width: renderWidth,
        height: renderHeight,
        zIndex: renderZ,
        opacity: 1, 
        scale: 1,
        borderRadius: renderRadius
      }}
      transition={{
          duration: 0.6,
          ease: [0.2, 0.8, 0.2, 1]
      }}
      onDragEnd={(_, info) => {
        if (nodeRef.current && !isMaximized && !isCompactMode) {
            const rect = nodeRef.current.getBoundingClientRect();
            updatePosition(widget.id, { x: rect.left, y: rect.top, width, height });
        }
      }}
      onPointerDown={handlePointerDown}
      style={{ 
        position: isMaximized || isCompactMode ? 'fixed' : 'absolute',
      }}
      ref={nodeRef}
      className="touch-none"
    >
      <GlassCard 
        style={{ borderRadius: renderRadius }}
        className={`w-full h-full relative group flex flex-col ${overflowClass} transition-shadow duration-200 border-white/20 ${!isMaximized && !isPhoto && !isCompactMode && 'hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)]'} ${isMaximized ? '!rounded-none !border-0' : ''} ${glassOverrideClass}`}
      >
        
        {/* Header Controls - Hide during Focus Mode (Compact) */}
        {!isCompactMode && (
          <div className={`absolute top-0 left-0 right-0 h-8 flex justify-between items-center px-2 z-40 transition-opacity ${isPhoto ? 'bg-gradient-to-b from-black/50 to-transparent' : ''} ${isMaximized ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
            <div 
              className={`cursor-move p-1 ${controlGripClass} ${isMaximized ? 'opacity-0 pointer-events-none' : ''}`}
              onPointerDown={(e) => {
                // Explicit header drag handle
                dragControls.start(e);
                bringToFront(widget.id);
              }}
            >
              <GripHorizontal size={16} dropShadow={isPhoto ? "0 1px 2px rgba(0,0,0,0.5)" : undefined} />
            </div>
            <div className="flex items-center gap-1">
              <button 
                onClick={(e) => { e.stopPropagation(); onToggleMaximize(); }}
                className={`p-1 transition-colors rounded ${controlBtnClass}`}
                title={isMaximized ? "Restore" : "Fullscreen"}
              >
                {isMaximized ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); removeWidget(widget.id); }}
                className={`p-1 transition-colors rounded ${isNewWidget ? (isDarkTheme ? 'text-zinc-600 hover:text-red-400 hover:bg-red-900/20' : 'text-slate-400 hover:text-red-500 hover:bg-red-50') : 'text-white/50 hover:text-red-300 hover:bg-white/10'}`}
                title="Close Widget"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}

        <div 
          className="flex-1 overflow-hidden pt-0" 
          style={{ paddingTop: isPhoto || isNewWidget || isCompactMode ? 0 : '0.5rem' }}
        >
            {renderContent()}
        </div>

        {!isMaximized && !isCompactMode && (
            <div 
                className={`absolute bottom-0 right-0 p-1 cursor-nwse-resize opacity-0 group-hover:opacity-100 z-20 ${isNewWidget ? (isDarkTheme ? 'text-zinc-600 hover:text-zinc-400' : 'text-slate-300 hover:text-slate-500') : 'text-white/30 hover:text-white'}`}
                onMouseDown={handleResizeStart}
            >
                <ArrowDownRight size={16} />
            </div>
        )}
      </GlassCard>
    </motion.div>
  );
};
