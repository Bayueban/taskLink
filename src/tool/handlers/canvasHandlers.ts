/**
 * 画布交互处理器
 */
import { RefObject } from 'react';
import type { Node, Todo, ViewState } from '../../types';
import { handleWheel as handleWheelTool } from '../view';
import { createNodeFromDoubleClick } from '../node';
import { getNodeCenterById } from '../interaction';

interface CanvasHandlers {
  handleWheel: (
    e: React.WheelEvent,
    viewState: ViewState,
    setViewState: React.Dispatch<React.SetStateAction<ViewState>>
  ) => void;
  handleDoubleClickCanvas: (
    e: React.MouseEvent,
    canvasRef: RefObject<HTMLDivElement>,
    viewState: ViewState,
    currentWorkspaceId: string,
    nodes: Node[],
    todos: Todo[],
    setNodes: React.Dispatch<React.SetStateAction<Node[]>>,
    setTodos: React.Dispatch<React.SetStateAction<Todo[]>>,
    setSelectedId: React.Dispatch<React.SetStateAction<string | null>>
  ) => void;
  startConnecting: (
    e: React.MouseEvent,
    nodeId: string,
    nodes: Node[],
    setConnectingSourceId: React.Dispatch<React.SetStateAction<string | null>>,
    setMousePos: (pos: { x: number; y: number }) => void
  ) => void;
}

export const canvasHandlers: CanvasHandlers = {
  handleWheel: (e, viewState, setViewState) => {
    handleWheelTool(e, viewState, setViewState);
  },

  handleDoubleClickCanvas: (e, canvasRef, viewState, currentWorkspaceId, nodes, todos, setNodes, setTodos, setSelectedId) => {
    if (e.target === canvasRef.current || (e.target as HTMLElement).id === 'canvas-bg') {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      const { node, todo } = createNodeFromDoubleClick(e.clientX - rect.left, e.clientY - rect.top, viewState, currentWorkspaceId);
      setNodes([...nodes, node]);
      setTodos([...todos, todo]);
      setSelectedId(node.id);
    }
  },

  startConnecting: (e, nodeId, nodes, setConnectingSourceId, setMousePos) => {
    e.stopPropagation();
    setConnectingSourceId(nodeId);
    setMousePos(getNodeCenterById(nodes, nodeId));
  }
};
