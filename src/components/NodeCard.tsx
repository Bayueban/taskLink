import React from 'react';
import { Link as LinkIcon, Minimize2, Trash2 } from 'lucide-react';
import type { Node, Todo } from '../types';
import { COLORS } from '../constants';

interface NodeCardProps {
  node: Node;
  todo?: Todo;
  isSelected: boolean;
  connectingSourceId: string | null;
  onMouseDown: (e: React.MouseEvent, node: Node) => void;
  onResizeMouseDown: (e: React.MouseEvent, node: Node) => void;
  startConnecting: (e: React.MouseEvent, nodeId: string) => void;
  resetNodeSize: (e: React.MouseEvent, nodeId: string) => void;
  deleteNode: (id: string) => void;
  updateNodeTitle: (id: string, newTitle: string) => void;
  updateNodeContent: (id: string, newContent: string) => void;
  updateNodeColor: (id: string, newColor: string) => void;
}

export default function NodeCard({
  node,
  todo,
  isSelected,
  connectingSourceId,
  onMouseDown,
  onResizeMouseDown,
  startConnecting,
  resetNodeSize,
  deleteNode,
  updateNodeTitle,
  updateNodeContent,
  updateNodeColor,
}: NodeCardProps) {
  const isCompleted = todo?.completed || false;

  return (
    <div
      key={node.id}
      id={`node-${node.id}`}
      onMouseDown={(e) => onMouseDown(e, node)}
      style={{
        transform: `translate(${node.x}px, ${node.y}px)`,
        width: node.width,
        height: node.height,
        backgroundColor: node.color || '#ffffff',
      }}
      className={`absolute rounded-2xl flex flex-col transition-shadow duration-200 group
        ${isSelected 
          ? 'z-50 shadow-xl ring-2 ring-indigo-500 ring-offset-2 ring-offset-[#f8fafc]' 
          : 'z-10 shadow-sm border border-slate-200/60 hover:shadow-md'
        }
        ${isCompleted ? 'opacity-60 grayscale-[0.5] border-2 border-green-400' : ''}
      `}
    >
      {/* Context Toolbar (Floating Left) */}
      {isSelected && (
        <div 
          className="absolute top-0 -left-16 w-12 flex flex-col gap-3 bg-white/90 backdrop-blur border border-slate-100 p-2 rounded-2xl shadow-xl shadow-slate-200/50 animate-in fade-in slide-in-from-right-4 duration-200 z-50"
          onMouseDown={(e) => e.stopPropagation()} 
        >
          <div className="flex flex-col gap-2 border-b border-slate-100 pb-2">
            <button 
              onClick={(e) => startConnecting(e, node.id)}
              className={`p-2 rounded-xl transition-all ${connectingSourceId === node.id ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-200' : 'text-slate-400 hover:bg-indigo-50 hover:text-indigo-600'}`}
            >
              <LinkIcon className="w-4 h-4" />
            </button>
            <button 
              onClick={(e) => resetNodeSize(e, node.id)}
              className="p-2 rounded-xl text-slate-400 hover:bg-slate-50 hover:text-slate-700 transition-all"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
            <button 
              onClick={() => deleteNode(node.id)}
              className="p-2 rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          
          {/* Color Palette */}
          {node.type === 'text' && (
            <div className="grid grid-cols-1 gap-1.5 place-items-center">
              {COLORS.map(c => (
                <button 
                  key={c}
                  onClick={() => updateNodeColor(node.id, c)}
                  className={`w-4 h-4 rounded-full border border-slate-200 shadow-sm transition-transform hover:scale-125 ${node.color === c ? 'ring-2 ring-slate-400 scale-110' : ''}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Completed Badge */}
      {isCompleted && (
        <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded-full shadow-md z-10">
          ✓ 已完成
        </div>
      )}

      {/* Content */}
      {node.type === 'text' ? (
        <div className="flex flex-col h-full p-5 pt-3">
          <input
            type="text"
            value={node.title}
            onChange={(e) => updateNodeTitle(node.id, e.target.value)}
            className="w-full bg-transparent text-slate-900 font-bold text-lg mb-2 outline-none placeholder:text-slate-300"
            placeholder="Untitled"
          />
          <textarea
            value={node.content}
            onChange={(e) => updateNodeContent(node.id, e.target.value)}
            className="w-full flex-1 bg-transparent text-slate-600 text-sm leading-relaxed resize-none outline-none placeholder:text-slate-300"
            placeholder="Type something..."
          />
        </div>
      ) : (
        <div className="relative w-full h-full rounded-2xl overflow-hidden group/img">
           <img 
             src={node.content} 
             alt="Node" 
             className="w-full h-full object-cover select-none pointer-events-none" 
           />
           <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/5 transition-colors" />
        </div>
      )}
      
      {/* Resize Handle */}
      {isSelected && (
        <div 
          className="absolute bottom-2 right-2 cursor-nwse-resize z-20 text-slate-300 hover:text-indigo-500 transition-colors p-1"
          onMouseDown={(e) => onResizeMouseDown(e, node)}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
             <path d="M12 12L12 2L2 12H12Z" />
          </svg>
        </div>
      )}
    </div>
  );
}

