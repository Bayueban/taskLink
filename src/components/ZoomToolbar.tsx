import { ZoomIn, ZoomOut } from 'lucide-react';
import type { ViewState } from '../types';
import { MIN_SCALE, MAX_SCALE } from '../constants';

interface ZoomToolbarProps {
  viewState: ViewState;
  setViewState: (state: ViewState | ((prev: ViewState) => ViewState)) => void;
}

export default function ZoomToolbar({ viewState, setViewState }: ZoomToolbarProps) {
  return (
    <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-1 p-1.5 bg-white/80 backdrop-blur-md border border-white/20 rounded-full shadow-lg shadow-slate-200/50 z-20">
      <button 
        onClick={() => setViewState(prev => ({...prev, scale: Math.min(MAX_SCALE, prev.scale * 1.1)}))}
        className="p-2 rounded-full text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
      >
        <ZoomIn className="w-5 h-5" />
      </button>
      <span className="text-xs font-semibold text-slate-600 min-w-[3rem] text-center select-none">
        {Math.round(viewState.scale * 100)}%
      </span>
      <button 
        onClick={() => setViewState(prev => ({...prev, scale: Math.max(MIN_SCALE, prev.scale * 0.9)}))}
        className="p-2 rounded-full text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
      >
        <ZoomOut className="w-5 h-5" />
      </button>
    </div>
  );
}

