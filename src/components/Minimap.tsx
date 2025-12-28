import React from 'react';
import type { Node, ViewState } from '../types';
import { WORLD_LIMIT, WORLD_SIZE } from '../constants';

interface MinimapProps {
  nodes: Node[];
  viewState: ViewState;
  canvasRef: React.RefObject<HTMLDivElement>;
  setViewState: (state: ViewState) => void;
}

export default function Minimap({ nodes, viewState, canvasRef, setViewState }: MinimapProps) {
  const getMinimapData = () => {
    // 1. Static World Bounds (-4000 to +4000)
    const minX = -WORLD_LIMIT;
    const minY = -WORLD_LIMIT;
    const worldW = WORLD_SIZE;
    const worldH = WORLD_SIZE;

    // 2. Fixed Minimap Size
    const MAP_W = 240;
    const MAP_H = 160;

    // 3. Scale factor (Fit World -> Map)
    const scaleX = MAP_W / worldW;
    const scaleY = MAP_H / worldH;
    const scale = Math.min(scaleX, scaleY); // Uniform scale

    // 4. Center offsets
    const offsetX = (MAP_W - worldW * scale) / 2;
    const offsetY = (MAP_H - worldH * scale) / 2;

    const toMap = (wx: number, wy: number) => ({
      x: (wx - minX) * scale + offsetX,
      y: (wy - minY) * scale + offsetY
    });

    // 5. Viewport calculation
    const containerW = canvasRef.current?.clientWidth || window.innerWidth;
    const containerH = canvasRef.current?.clientHeight || window.innerHeight;
    
    const vpWorldX = -viewState.x / viewState.scale;
    const vpWorldY = -viewState.y / viewState.scale;
    const vpWorldW = containerW / viewState.scale;
    const vpWorldH = containerH / viewState.scale;

    const vpStart = toMap(vpWorldX, vpWorldY);
    const vpMapW = vpWorldW * scale;
    const vpMapH = vpWorldH * scale;

    return {
      minX, minY, scale, offsetX, offsetY,
      mapNodes: nodes.map(n => {
        const pos = toMap(n.x, n.y);
        return {
          ...n,
          mapX: pos.x,
          mapY: pos.y,
          mapW: n.width * scale,
          mapH: n.height * scale
        };
      }),
      viewport: {
        x: vpStart.x,
        y: vpStart.y,
        w: vpMapW,
        h: vpMapH
      }
    };
  };

  const handleMinimapClick = (e: React.MouseEvent) => {
    const data = getMinimapData();
    if (!data) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const worldX = (clickX - data.offsetX) / data.scale + data.minX;
    const worldY = (clickY - data.offsetY) / data.scale + data.minY;

    const containerW = canvasRef.current?.clientWidth || window.innerWidth;
    const containerH = canvasRef.current?.clientHeight || window.innerHeight;

    setViewState({
      scale: viewState.scale,
      x: -worldX * viewState.scale + containerW / 2,
      y: -worldY * viewState.scale + containerH / 2
    });
  };

  const minimapData = getMinimapData();

  if (!minimapData) return null;

  return (
    <div 
      className="absolute bottom-6 left-6 w-[240px] h-[160px] bg-slate-200 border border-slate-300 rounded-lg shadow-xl z-30 overflow-hidden cursor-crosshair hover:border-slate-400 transition-colors"
      onClick={handleMinimapClick}
    >
      <div className="w-full h-full relative">
        {/* Center Crosshair (Optional helper) */}
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-300/50"></div>
        <div className="absolute top-1/2 left-0 right-0 h-px bg-slate-300/50"></div>

        {/* Nodes on Minimap */}
        {minimapData.mapNodes.map(node => (
          <div 
            key={node.id}
            className="absolute rounded-sm border border-slate-400/50 shadow-sm"
            style={{
              left: node.mapX,
              top: node.mapY,
              width: node.mapW,
              height: node.mapH,
              backgroundColor: node.color || '#ffffff',
            }}
          />
        ))}
        
        {/* Viewport Indicator */}
        <div 
          className="absolute border-2 border-indigo-500 bg-indigo-500/10 pointer-events-none rounded-sm transition-all duration-75"
          style={{
            left: minimapData.viewport.x,
            top: minimapData.viewport.y,
            width: minimapData.viewport.w,
            height: minimapData.viewport.h
          }}
        />
      </div>
    </div>
  );
}

