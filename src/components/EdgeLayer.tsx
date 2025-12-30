import React, { useRef } from 'react';
import type { Edge, ViewState } from '../types';
import EdgeComponent from './Edge';

interface EdgeLayerProps {
  edges: Edge[];
  connectingSourceId: string | null;
  mousePos: { x: number; y: number };
  isDraggingNode: boolean;
  viewState: ViewState;
  getNodeCenter: (nodeId: string) => { x: number; y: number };
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
  canvasRef?: React.RefObject<HTMLDivElement>;
  onEdgeSelect?: (edge: Edge, position: { x: number; y: number }) => void;
}

export default function EdgeLayer({
  edges,
  connectingSourceId,
  mousePos,
  isDraggingNode,
  viewState,
  getNodeCenter,
  canvasRef,
  onEdgeSelect,
}: EdgeLayerProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  // 处理线段点击
  const handleEdgeClick = (e: React.MouseEvent, edge: Edge) => {
    e.stopPropagation();
    const start = getNodeCenter(edge.from);
    const end = getNodeCenter(edge.to);
    
    if (!start.x || !end.x) return;
    
    // 计算中点位置（世界坐标）
    const midX = (start.x + end.x) / 2;
    const midY = (start.y + end.y) / 2;
    
    // 转换为相对于canvas容器的位置
    if (canvasRef?.current) {
      const screenX = midX * viewState.scale + viewState.x;
      const screenY = midY * viewState.scale + viewState.y;
      
      onEdgeSelect?.(edge, { x: screenX, y: screenY });
    }
  };



  return (
    <>
      <svg 
        ref={svgRef}
        className="absolute top-0 left-0 overflow-visible w-1 h-1 pointer-events-none"
      >
        {/* 渲染所有线段，支持双向 */}
        {edges.map(edge => {
          const start = getNodeCenter(edge.from);
          const end = getNodeCenter(edge.to);
          if (!start.x || !end.x) return null;
          
          // 检查是否存在反向edge
          const reverseEdge = edges.find(e => 
            e.from === edge.to && e.to === edge.from && e.id !== edge.id
          );
          
          // 如果存在反向edge，需要x轴和y轴偏移
          // 正向线段（from < to）：x轴+8, y轴+8
          // 反向线段（from > to）：x轴-8, y轴-8
          let xOffset = 0;
          let yOffset = 0;
          const isForward = edge.from < edge.to;
          if (reverseEdge) {
            if (isForward) {
              xOffset = 8; // 正向线段，x轴+8
              yOffset = 8; // 正向线段，y轴+8
            } else {
              xOffset = -8; // 反向线段，x轴-8
              yOffset = -8; // 反向线段，y轴-8
            }
          }
          
          return (
            <EdgeComponent
              key={edge.id}
              edge={edge}
              startX={start.x + xOffset}
              startY={start.y + yOffset}
              endX={end.x + xOffset}
              endY={end.y + yOffset}
              isDraggingNode={isDraggingNode}
              onClick={(e) => handleEdgeClick(e, edge)}
              isForward={isForward}
            />
          );
        })}
        
        {/* 连接中的临时线段 */}
        {connectingSourceId && (() => {
          const start = getNodeCenter(connectingSourceId);
          if (!start.x) return null;
          
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
    </>
  );
}