/**
 * 交互处理工具
 * 提供鼠标、拖拽等交互事件的处理功能
 */
import type { Node, Edge, ViewState } from '../types';
import { generateId } from './storage';
import { screenToWorld, getNodeCenter } from './coordinate';

/**
 * 处理节点鼠标按下事件
 */
export const handleNodeMouseDown = (
  e: React.MouseEvent,
  node: Node,
  connectingSourceId: string | null,
  edges: Edge[],
  workspaceId: string,
  onConnect: (edge: Edge) => void,
  onSelect: (nodeId: string) => void,
  onStartDrag: (nodeId: string, offset: { x: number; y: number }) => void,
  viewState: ViewState,
  canvasRect: DOMRect | null
) => {
  e.stopPropagation();
  const target = e.target as HTMLElement;
  const isInput = ['INPUT', 'TEXTAREA'].includes(target.tagName);

  // 如果正在连接，创建新的边
  if (connectingSourceId) {
    if (connectingSourceId !== node.id) {
      // 检查是否已经存在相同方向的edge
      const existingSameDirectionEdge = edges.find(ed => 
        ed.from === connectingSourceId && ed.to === node.id
      );
      // 如果不存在相同方向的edge，创建新edge
      if (!existingSameDirectionEdge) {
        onConnect({
          id: generateId(),
          workspaceId,
          from: connectingSourceId,
          to: node.id,
          direction: 'forward'
        });
      }
    }
    return;
  }

  onSelect(node.id);

  // 如果不是输入框，开始拖拽
  if (!isInput && canvasRect) {
    const mouseX = e.clientX - canvasRect.left;
    const mouseY = e.clientY - canvasRect.top;
    const worldMouse = screenToWorld(mouseX, mouseY, viewState);
    const offset = {
      x: worldMouse.x - node.x,
      y: worldMouse.y - node.y
    };
    onStartDrag(node.id, offset);
  }
};

/**
 * 计算拖拽后的节点位置
 */
export const calculateDragPosition = (
  clientX: number,
  clientY: number,
  canvasRect: DOMRect,
  dragOffset: { x: number; y: number },
  viewState: ViewState
): { x: number; y: number } => {
  const mouseX = clientX - canvasRect.left;
  const mouseY = clientY - canvasRect.top;
  const worldMouse = screenToWorld(mouseX, mouseY, viewState);
  
  return {
    x: worldMouse.x - dragOffset.x,
    y: worldMouse.y - dragOffset.y
  };
};

/**
 * 获取节点的中心点（用于连接）
 */
export const getNodeCenterById = (nodes: Node[], nodeId: string) => {
  const node = nodes.find(n => n.id === nodeId);
  if (!node) return { x: 0, y: 0 };
  return getNodeCenter(node);
};

/**
 * 检查是否点击在画布背景上
 */
export const isCanvasBackground = (target: EventTarget | null): boolean => {
  const element = target as HTMLElement;
  return element?.id === 'canvas-bg';
};
