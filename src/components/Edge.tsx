import React from 'react';
import { ArrowRight } from 'lucide-react';
import type { Edge, EdgeStyle } from '../types';

interface EdgeProps {
  edge: Edge;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  isDraggingNode: boolean;
  onClick?: (e: React.MouseEvent) => void;
  isForward?: boolean; // 是否是正向线段
}

export default function EdgeComponent({
  edge,
  startX,
  startY,
  endX,
  endY,
  isDraggingNode,
  onClick,
  isForward = true,
}: EdgeProps) {
  // 如果正在拖拽节点，不渲染线段
  if (isDraggingNode) {
    return null;
  }

  const color = edge.color || '#64748b';
  const style = edge.style || 'solid';
  
  // 计算路径
  const dx = endX - startX;
  const dy = endY - startY;
  const length = Math.sqrt(dx * dx + dy * dy);
  
  if (length === 0) return null;
  
  // 使用传入的坐标（已经在EdgeLayer中应用了y轴偏移）
  const adjustedStartX = startX;
  const adjustedStartY = startY;
  const adjustedEndX = endX;
  const adjustedEndY = endY;
  
  // 根据样式生成strokeDasharray
  const getStrokeDasharray = (style: EdgeStyle): string => {
    switch (style) {
      case 'dashed':
        return '8,4';
      case 'dotted':
        return '2,3';
      default:
        return 'none';
    }
  };
  
  // 计算箭头标记的ID（确保唯一）
  const markerId = `arrowhead-${edge.id}`;
  
  // 计算中点位置（用于显示方向icon）
  const midX = (adjustedStartX + adjustedEndX) / 2;
  const midY = (adjustedStartY + adjustedEndY) / 2;
  
  // 计算角度（用于旋转方向icon）
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);

  return (
    <g className="group pointer-events-auto cursor-pointer">
      {/* 箭头标记定义 */}
      <defs>
        <marker
          id={markerId}
          markerWidth="8"
          markerHeight="6"
          refX="20"
          refY="3"
          orient="auto"
        >
          <path d="M0,0 L8,3 L0,6 L0,0" fill={color} />
        </marker>
      </defs>
      
      {/* 不可见的点击区域 */}
      <path
        id={`edge-hit-${edge.id}`}
        d={`M ${adjustedStartX} ${adjustedStartY} L ${adjustedEndX} ${adjustedEndY}`}
        stroke="transparent"
        strokeWidth="20"
        fill="none"
        onClick={onClick}
      />
      
      {/* 可见的线段 */}
      <path
        id={`edge-${edge.id}`}
        d={`M ${adjustedStartX} ${adjustedStartY} L ${adjustedEndX} ${adjustedEndY}`}
        stroke={color}
        strokeWidth="2"
        fill="none"
        strokeDasharray={getStrokeDasharray(style)}
        markerEnd={`url(#${markerId})`}
        className="group-hover:opacity-80 transition-opacity"
      />
      
      {/* 文本标记（小型卡片样式） */}
      {edge.label && (() => {
        // 计算文字位置：正线+32，负线-32
        const labelOffsetX = isForward ? 32 : -32;
        const labelOffsetY = isForward ? 32 : -32;
        const labelX = midX + labelOffsetX - 50;
        const labelY = midY + labelOffsetY - 20;
        
        // 将hex颜色转换为rgba，透明度0.3
        const hexToRgba = (hex: string, alpha: number) => {
          const r = parseInt(hex.slice(1, 3), 16);
          const g = parseInt(hex.slice(3, 5), 16);
          const b = parseInt(hex.slice(5, 7), 16);
          return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        };
        
        return (
          <foreignObject
            x={labelX}
            y={labelY}
            width="100"
            height="40"
            className="pointer-events-none"
          >
            <div
              className="px-2 py-1 rounded-lg shadow-md text-xs text-slate-700 text-center"
              style={{
                backgroundColor: hexToRgba(color, 0.3),
                lineHeight: '1.4',
                wordBreak: 'break-word',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {edge.label}
            </div>
          </foreignObject>
        );
      })()}
      
      {/* 方向icon（始终显示，仅在没有标签时显示） */}
      {!edge.label && (
        <foreignObject
          x={midX - 12}
          y={midY - 12}
          width="24"
          height="24"
          className="pointer-events-none"
        >
          <div
            className="transition-all group-hover:scale-110"
            style={{
              transform: `rotate(${angle}deg)`,
            }}
          >
            <ArrowRight 
              className="w-6 h-6" 
              style={{ 
                color: color,
                strokeWidth: 3,
                filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))'
              }} 
            />
          </div>
        </foreignObject>
      )}
    </g>
  );
}
