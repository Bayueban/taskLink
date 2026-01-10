/**
 * 鼠标事件处理器
 */
import { RefObject } from 'react';
import type { Node, Edge, ViewState } from '../../types';
import { screenToWorld } from '../coordinate';
import { generateId } from '../storage';
import type { Edge } from '../../types';

interface MouseHandlers {
  handleMouseDown: (
    e: React.MouseEvent,
    canvasRef: RefObject<HTMLDivElement>,
    isDraggingCanvas: React.MutableRefObject<boolean>,
    dragStartPos: React.MutableRefObject<{ x: number; y: number }>,
    setSelectedId: React.Dispatch<React.SetStateAction<string | null>>,
    setConnectingSourceId: React.Dispatch<React.SetStateAction<string | null>>
  ) => void;
  handleNodeMouseDown: (
    e: React.MouseEvent,
    node: Node,
    connectingSourceId: string | null,
    edges: Edge[],
    currentWorkspaceId: string,
    viewState: ViewState,
    canvasRef: RefObject<HTMLDivElement>,
    isDraggingNode: React.MutableRefObject<string | null>,
    dragNodeOffset: React.MutableRefObject<{ x: number; y: number }>,
    currentDragNodePos: React.MutableRefObject<{ x: number; y: number }>,
    setEdges: React.Dispatch<React.SetStateAction<Edge[]>>,
    setConnectingSourceId: React.Dispatch<React.SetStateAction<string | null>>,
    setSelectedId: React.Dispatch<React.SetStateAction<string | null>>
  ) => void;
  handleResizeMouseDown: (
    e: React.MouseEvent,
    node: Node,
    isResizingNode: React.MutableRefObject<{ id: string; startX: number; startY: number; startWidth: number; startHeight: number } | null>
  ) => void;
}

export const mouseHandlers: MouseHandlers = {
  handleMouseDown: (e, canvasRef, isDraggingCanvas, dragStartPos, setSelectedId, setConnectingSourceId) => {
    if (e.target === canvasRef.current || (e.target as HTMLElement).id === 'canvas-bg') {
      isDraggingCanvas.current = true;
      dragStartPos.current = { x: e.clientX, y: e.clientY };
      setSelectedId(null);
      setConnectingSourceId(null);
    }
  },

  handleNodeMouseDown: (
    e,
    node,
    connectingSourceId,
    edges,
    currentWorkspaceId,
    viewState,
    canvasRef,
    isDraggingNode,
    dragNodeOffset,
    currentDragNodePos,
    setEdges,
    setConnectingSourceId,
    setSelectedId
  ) => {
    e.stopPropagation();
    const target = e.target as HTMLElement;
    const isInput = ['INPUT', 'TEXTAREA'].includes(target.tagName);

    if (connectingSourceId) {
      if (connectingSourceId !== node.id) {
        // 检查是否已经存在相同方向的edge
        const existingSameDirectionEdge = edges.find(ed => 
          ed.from === connectingSourceId && ed.to === node.id
        );
        // 如果不存在相同方向的edge，创建新edge
        if (!existingSameDirectionEdge) {
          setEdges([...edges, { 
            id: generateId(), 
            workspaceId: currentWorkspaceId,
            from: connectingSourceId, 
            to: node.id,
            direction: 'forward'
          }]);
        }
      }
      setConnectingSourceId(null);
      return;
    }

    setSelectedId(node.id);

    if (!isInput) {
      isDraggingNode.current = node.id;
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        const worldMouse = screenToWorld(e.clientX - rect.left, e.clientY - rect.top, viewState);
        dragNodeOffset.current = {
          x: worldMouse.x - node.x,
          y: worldMouse.y - node.y
        };
        currentDragNodePos.current = { x: node.x, y: node.y };
      }
    }
  },

  handleResizeMouseDown: (e, node, isResizingNode) => {
    e.stopPropagation();
    e.preventDefault();
    isResizingNode.current = {
      id: node.id,
      startX: e.clientX,
      startY: e.clientY,
      startWidth: node.width,
      startHeight: node.height
    };
  }
};
