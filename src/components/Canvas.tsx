import React, { useState, useEffect } from 'react';
import type { Node, Edge, Todo, ViewState } from '../types';
import ZoomToolbar from './ZoomToolbar';
import Minimap from './Minimap';
import EdgeLayer from './EdgeLayer';
import NodeCard from './NodeCard';
import EdgeToolbar from './EdgeToolbar';

interface CanvasProps {
  canvasRef: React.RefObject<HTMLDivElement>;
  nodes: Node[];
  edges: Edge[];
  todos: Todo[];
  viewState: ViewState;
  selectedId: string | null;
  connectingSourceId: string | null;
  mousePos: { x: number; y: number };
  isDraggingNode: boolean;
  setViewState: (state: ViewState | ((prev: ViewState) => ViewState)) => void;
  handleWheel: (e: React.WheelEvent) => void;
  handleMouseDown: (e: React.MouseEvent) => void;
  handleDoubleClickCanvas: (e: React.MouseEvent) => void;
  handleNodeMouseDown: (e: React.MouseEvent, node: Node) => void;
  handleResizeMouseDown: (e: React.MouseEvent, node: Node) => void;
  startConnecting: (e: React.MouseEvent, nodeId: string) => void;
  resetNodeSize: (e: React.MouseEvent, nodeId: string) => void;
  deleteNode: (id: string) => void;
  updateNodeTitle: (id: string, newTitle: string) => void;
  updateNodeContent: (id: string, newContent: string) => void;
  updateNodeColor: (id: string, newColor: string) => void;
  getNodeCenter: (nodeId: string) => { x: number; y: number };
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
}

export default function Canvas({
  canvasRef,
  nodes,
  edges,
  todos,
  viewState,
  selectedId,
  connectingSourceId,
  mousePos,
  isDraggingNode,
  setViewState,
  handleWheel,
  handleMouseDown,
  handleDoubleClickCanvas,
  handleNodeMouseDown,
  handleResizeMouseDown,
  startConnecting,
  resetNodeSize,
  deleteNode,
  updateNodeTitle,
  updateNodeContent,
  updateNodeColor,
  getNodeCenter,
  setEdges,
}: CanvasProps) {
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);
  const [toolbarPosition, setToolbarPosition] = useState<{ x: number; y: number } | null>(null);

  // 关闭工具栏
  const handleCloseToolbar = () => {
    setSelectedEdge(null);
    setToolbarPosition(null);
  };

  // 处理线段选择（如果点击的是同一个线段，则关闭工具栏；否则切换）
  const handleEdgeSelect = (edge: Edge, position: { x: number; y: number }) => {
    if (selectedEdge?.id === edge.id) {
      // 点击同一个线段，关闭工具栏
      handleCloseToolbar();
    } else {
      // 点击不同线段，切换工具栏
      setSelectedEdge(edge);
      setToolbarPosition(position);
    }
  };

  // 处理线段更新
  const handleEdgeUpdate = (updates: Partial<Edge>) => {
    if (!selectedEdge) return;
    setEdges(prev => prev.map(edge => 
      edge.id === selectedEdge.id ? { ...edge, ...updates } : edge
    ));
    // 更新选中的edge状态
    setSelectedEdge({ ...selectedEdge, ...updates });
  };

  // 处理线段删除
  const handleEdgeDelete = () => {
    if (!selectedEdge) return;
    setEdges(prev => prev.filter(edge => edge.id !== selectedEdge.id));
    handleCloseToolbar();
  };

  // 点击外部关闭工具栏（更智能的逻辑）
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!selectedEdge) return;
      
      const target = e.target as HTMLElement;
      
      // 如果点击的是工具栏本身，不关闭
      if (target.closest('.edge-toolbar')) {
        return;
      }
      
      // 如果点击的是线段，不关闭（会通过handleEdgeSelect切换）
      if (target.closest('svg') && target.closest('path[id^="edge-hit"]')) {
        return;
      }
      
      // 其他情况关闭工具栏
      handleCloseToolbar();
    };

    if (selectedEdge) {
      // 使用mousedown而不是click，以便更早响应
      document.addEventListener('mousedown', handleClickOutside, true);
      return () => document.removeEventListener('mousedown', handleClickOutside, true);
    }
  }, [selectedEdge]);

  return (
    <div className="flex-1 relative bg-[#e2e8f0] overflow-hidden select-none">
      {/* Subtle Grid Pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.3]" 
           style={{
             backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)',
             backgroundSize: '24px 24px'
           }}>
      </div>
      
      {/* Floating Toolbar (Top Center) */}
      <ZoomToolbar viewState={viewState} setViewState={setViewState} />

      {/* Linking Mode Indicator */}
      {connectingSourceId && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-5 py-2 rounded-full shadow-lg shadow-indigo-500/30 z-30 text-sm font-medium animate-in fade-in slide-in-from-top-4">
          选择目标卡片连接
        </div>
      )}

      {/* Minimap */}
      <Minimap 
        nodes={nodes}
        viewState={viewState}
        canvasRef={canvasRef}
        setViewState={setViewState}
      />

      {/* Canvas Area */}
      <div 
        ref={canvasRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onDoubleClick={handleDoubleClickCanvas}
      >
        <div 
          id="canvas-bg"
          className="w-full h-full origin-top-left"
          style={{
            transform: `translate(${viewState.x}px, ${viewState.y}px) scale(${viewState.scale})`,
          }}
        >
          {/* Edges Layer */}
          <EdgeLayer
            edges={edges}
            connectingSourceId={connectingSourceId}
            mousePos={mousePos}
            isDraggingNode={isDraggingNode}
            viewState={viewState}
            getNodeCenter={getNodeCenter}
            setEdges={setEdges}
            canvasRef={canvasRef}
            onEdgeSelect={handleEdgeSelect}
          />

          {/* Nodes Layer */}
          {nodes.map(node => {
            const todo = todos.find(t => t.id === node.id);
            return (
              <NodeCard
                key={node.id}
                node={node}
                todo={todo}
                isSelected={selectedId === node.id}
                connectingSourceId={connectingSourceId}
                onMouseDown={handleNodeMouseDown}
                onResizeMouseDown={handleResizeMouseDown}
                startConnecting={startConnecting}
                resetNodeSize={resetNodeSize}
                deleteNode={deleteNode}
                updateNodeTitle={updateNodeTitle}
                updateNodeContent={updateNodeContent}
                updateNodeColor={updateNodeColor}
              />
            );
          })}
        </div>
      </div>

      {/* Edge Toolbar */}
      {selectedEdge && toolbarPosition && (
        <EdgeToolbar
          edge={selectedEdge}
          position={toolbarPosition}
          onClose={handleCloseToolbar}
          onUpdate={handleEdgeUpdate}
          onDelete={handleEdgeDelete}
        />
      )}
    </div>
  );
}

