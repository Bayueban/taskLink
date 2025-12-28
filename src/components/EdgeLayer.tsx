import React from 'react';
import { X } from 'lucide-react';
import type { Edge } from '../types';

interface EdgeLayerProps {
  edges: Edge[];
  connectingSourceId: string | null;
  mousePos: { x: number; y: number };
  getNodeCenter: (nodeId: string) => { x: number; y: number };
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
}

export default function EdgeLayer({
  edges,
  connectingSourceId,
  mousePos,
  getNodeCenter,
  setEdges,
}: EdgeLayerProps) {
  return (
    <svg className="absolute top-0 left-0 overflow-visible w-1 h-1 pointer-events-none">
      <defs>
        <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="20" refY="3" orient="auto">
          <path d="M0,0 L8,3 L0,6 L0,0" fill="#94a3b8" />
        </marker>
      </defs>
      {edges.map(edge => {
        const start = getNodeCenter(edge.from);
        const end = getNodeCenter(edge.to);
        if (!start.x || !end.x) return null;
        return (
          <g key={edge.id} className="group pointer-events-auto cursor-pointer">
            {/* Invisible hit area (for easier clicking) */}
            <path 
              id={`edge-hit-${edge.id}`}
              d={`M ${start.x} ${start.y} L ${end.x} ${end.y}`} 
              stroke="transparent" 
              strokeWidth="20"
              fill="none"
            />
            {/* Visible Line */}
            <path 
              id={`edge-${edge.id}`}
              d={`M ${start.x} ${start.y} L ${end.x} ${end.y}`} 
              stroke="#94a3b8" 
              strokeWidth="2" 
              fill="none"
              markerEnd="url(#arrowhead)"
              className="group-hover:stroke-indigo-400 transition-colors"
            />
            {/* Delete Button (on hover) */}
            <foreignObject 
              x={(start.x + end.x)/2 - 12} 
              y={(start.y + end.y)/2 - 12} 
              width="24" 
              height="24"
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <div 
                onClick={(e) => {
                  e.stopPropagation();
                  setEdges(prev => prev.filter(ed => ed.id !== edge.id));
                }}
                className="w-6 h-6 bg-white border border-slate-200 rounded-full shadow-md flex items-center justify-center hover:bg-red-50 hover:border-red-200 hover:text-red-500 text-slate-400"
              >
                <X className="w-3.5 h-3.5" />
              </div>
            </foreignObject>
          </g>
        );
      })}
      
      {connectingSourceId && (() => {
        const start = getNodeCenter(connectingSourceId);
        return (
          <path 
            d={`M ${start.x} ${start.y} L ${mousePos.x} ${mousePos.y}`} 
            stroke="#6366f1" 
            strokeWidth="2" 
            strokeDasharray="6,4"
            fill="none"
            className="animate-[dash_1s_linear_infinite]"
          />
        );
      })()}
    </svg>
  );
}

