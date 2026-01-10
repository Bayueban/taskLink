/**
 * Node 操作工具
 * 提供 Node 的增删改查功能
 */
import type { Node, Todo, Edge } from '../types';
import { COLORS, MIN_WIDTH, MAX_WIDTH, MIN_HEIGHT, MAX_HEIGHT } from '../constants';
import { generateId } from './storage';
import { screenToWorld, getViewCenter } from './coordinate';
import type { ViewState } from '../types';

/**
 * 删除指定 ID 的 Node 及其相关数据
 */
export const deleteNodeById = (
  nodes: Node[],
  edges: Edge[],
  todos: Todo[],
  nodeId: string
): {
  nodes: Node[];
  edges: Edge[];
  todos: Todo[];
} => {
  return {
    nodes: nodes.filter(n => n.id !== nodeId),
    edges: edges.filter(e => e.from !== nodeId && e.to !== nodeId),
    todos: todos.filter(t => t.id !== nodeId)
  };
};

/**
 * 更新 Node 的标题
 */
export const updateNodeTitleById = (nodes: Node[], todos: Todo[], id: string, newTitle: string) => {
  return {
    nodes: nodes.map(n => n.id === id ? { ...n, title: newTitle } : n),
    todos: todos.map(t => t.id === id ? { ...t, title: newTitle } : t)
  };
};

/**
 * 更新 Node 的内容
 */
export const updateNodeContentById = (nodes: Node[], todos: Todo[], id: string, newContent: string) => {
  return {
    nodes: nodes.map(n => n.id === id ? { ...n, content: newContent } : n),
    todos: todos.map(t => t.id === id ? { ...t, content: newContent } : t)
  };
};

/**
 * 更新 Node 的颜色
 */
export const updateNodeColorById = (nodes: Node[], id: string, newColor: string): Node[] => {
  return nodes.map(n => n.id === id ? { ...n, color: newColor } : n);
};

/**
 * 重置 Node 的尺寸
 */
export const resetNodeSize = (nodes: Node[], id: string): Node[] => {
  return nodes.map(n => n.id === id ? { ...n, width: 260, height: 180 } : n);
};

/**
 * 通过双击画布创建新 Node
 */
export const createNodeFromDoubleClick = (
  screenX: number,
  screenY: number,
  viewState: ViewState,
  workspaceId: string
): { node: Node; todo: Todo } => {
  const { x, y } = screenToWorld(screenX, screenY, viewState);
  const newId = generateId();
  
  const node: Node = {
    id: newId,
    workspaceId,
    type: 'text',
    x: x - 130,
    y: y - 90,
    title: '新想法',
    content: '',
    width: 260,
    height: 180,
    color: COLORS[0]
  };

  const todo: Todo = {
    id: newId,
    workspaceId,
    title: node.title!,
    content: node.content,
    completed: false
  };

  return { node, todo };
};

/**
 * 从粘贴的图片创建 Node
 */
export const createNodeFromPastedImage = (
  base64: string,
  viewState: ViewState,
  workspaceId: string
): Node => {
  const viewCenter = getViewCenter(viewState);
  
  return {
    id: generateId(),
    workspaceId,
    type: 'image',
    x: viewCenter.x - 100,
    y: viewCenter.y - 100,
    content: base64,
    width: 200,
    height: 200
  };
};

/**
 * 调整 Node 的尺寸（用于拖拽调整大小）
 */
export const resizeNode = (
  nodes: Node[],
  nodeId: string,
  deltaX: number,
  deltaY: number,
  startWidth: number,
  startHeight: number,
  scale: number
): Node[] => {
  const dx = deltaX / scale;
  const dy = deltaY / scale;
  const newWidth = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, startWidth + dx));
  const newHeight = Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, startHeight + dy));
  
  return nodes.map(n => 
    n.id === nodeId 
      ? { ...n, width: newWidth, height: newHeight } 
      : n
  );
};
