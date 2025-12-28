import React from 'react';
import type { Node, Edge, Todo, ViewState } from '../types';
import ZoomToolbar from './ZoomToolbar';
import Minimap from './Minimap';
import EdgeLayer from './EdgeLayer';
import NodeCard from './NodeCard';

interface CanvasProps {
  canvasRef: React.RefObject<HTMLDivElement>;
  nodes: Node[];
  edges: Edge[];
  todos: Todo[];
  viewState: ViewState;
  selectedId: string | null;
  connectingSourceId: string | null;
  mousePos: { x: number; y: number };
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
          Select target card to connect
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
            nodes={nodes}
            connectingSourceId={connectingSourceId}
            mousePos={mousePos}
            getNodeCenter={getNodeCenter}
            setEdges={setEdges}
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
    </div>
  );
}

