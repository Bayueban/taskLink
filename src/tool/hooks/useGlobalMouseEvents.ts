/**
 * 全局鼠标事件处理 Hook
 */
import { useEffect, RefObject } from 'react';
import type { ViewState, Node, Edge } from '../../types';
import { screenToWorld } from '../coordinate';
import { resizeNode } from '../node';

interface UseGlobalMouseEventsProps {
  canvasRef: RefObject<HTMLDivElement>;
  connectingSourceId: string | null;
  viewState: ViewState;
  isDraggingCanvas: React.MutableRefObject<boolean>;
  dragStartPos: React.MutableRefObject<{ x: number; y: number }>;
  isDraggingNode: React.MutableRefObject<string | null>;
  isDraggingNodeState: boolean;
  dragNodeOffset: React.MutableRefObject<{ x: number; y: number }>;
  currentDragNodePos: React.MutableRefObject<{ x: number; y: number }>;
  isResizingNode: React.MutableRefObject<{ id: string; startX: number; startY: number; startWidth: number; startHeight: number } | null>;
  stateRef: React.MutableRefObject<{ nodes: Node[]; edges: Edge[]; viewState: ViewState }>;
  setMousePos: (pos: { x: number; y: number }) => void;
  setViewState: React.Dispatch<React.SetStateAction<ViewState>>;
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  setIsDraggingNodeState: (value: boolean) => void;
}

export const useGlobalMouseEvents = ({
  canvasRef,
  connectingSourceId,
  isDraggingCanvas,
  dragStartPos,
  isDraggingNode,
  isDraggingNodeState,
  dragNodeOffset,
  currentDragNodePos,
  isResizingNode,
  stateRef,
  setMousePos,
  setViewState,
  setNodes,
  setIsDraggingNodeState
}: UseGlobalMouseEventsProps) => {
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      const { viewState } = stateRef.current;

      // 连接模式下的鼠标位置更新
      if (connectingSourceId) {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (rect) {
          const { x, y } = screenToWorld(e.clientX - rect.left, e.clientY - rect.top, viewState);
          setMousePos({ x, y });
        }
      }

      // 画布拖拽
      if (isDraggingCanvas.current) {
        const dx = e.clientX - dragStartPos.current.x;
        const dy = e.clientY - dragStartPos.current.y;
        setViewState(prev => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
        dragStartPos.current = { x: e.clientX, y: e.clientY };
      }

      // 节点大小调整
      if (isResizingNode.current) {
        const { id, startX, startY, startWidth, startHeight } = isResizingNode.current;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        setNodes(prev => resizeNode(prev, id, dx, dy, startWidth, startHeight, viewState.scale));
        return;
      }

      // 节点拖拽
      if (isDraggingNode.current) {
        if (!isDraggingNodeState) setIsDraggingNodeState(true);
        
        const nodeId = isDraggingNode.current;
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;

        const newPos = screenToWorld(e.clientX - rect.left, e.clientY - rect.top, viewState);
        const newX = newPos.x - dragNodeOffset.current.x;
        const newY = newPos.y - dragNodeOffset.current.y;
        
        currentDragNodePos.current = { x: newX, y: newY };

        const nodeEl = document.getElementById(`node-${nodeId}`);
        if (nodeEl) {
          nodeEl.style.transform = `translate(${newX}px, ${newY}px)`;
        }
      }

    };

    const handleGlobalMouseUp = () => {
      isDraggingCanvas.current = false;
      
      if (isDraggingNode.current) {
        const nodeId = isDraggingNode.current;
        const finalPos = currentDragNodePos.current;
        
        setNodes(prev => prev.map(n => {
          if (n.id === nodeId) {
            return { ...n, x: finalPos.x, y: finalPos.y };
          }
          return n;
        }));
        
        isDraggingNode.current = null;
        setIsDraggingNodeState(false);
      }
      
      isResizingNode.current = null;
    };

    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('mouseup', handleGlobalMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [connectingSourceId, isDraggingNodeState, canvasRef, stateRef, isDraggingCanvas, dragStartPos, isDraggingNode, dragNodeOffset, currentDragNodePos, isResizingNode, setMousePos, setViewState, setNodes, setIsDraggingNodeState]);
};
