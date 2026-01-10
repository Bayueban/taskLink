/**
 * 工作区管理工具
 * 提供工作区的创建、切换、删除等功能
 */
import type { Workspace, Todo, Node, Edge, ViewState } from '../types';
import { DEFAULT_VIEW_STATE } from '../constants';
import { getStorage, generateId, setStorage } from './storage';

/**
 * 初始化工作区列表
 */
export const initWorkspaces = (): Workspace[] => {
  const saved = getStorage<Workspace[]>('modern_workspaces', []);
  if (saved.length === 0) {
    const defaultWorkspace: Workspace = {
      id: generateId(),
      title: '默认工作区',
      createdAt: Date.now()
    };
    return [defaultWorkspace];
  }
  return saved;
};

/**
 * 获取当前日期时间（格式：YY-MM-DD HH:mm）
 */
const getCurrentDate = (): string => {
  const now = new Date();
  const year = String(now.getFullYear()).slice(-2);
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

/**
 * 加载指定工作区的数据
 */
export const loadWorkspaceData = (workspaceId: string) => {
  const allTodos = getStorage<Todo[]>('modern_todos', []);
  const allNodes = getStorage<Node[]>('modern_nodes', []);
  const allEdges = getStorage<Edge[]>('modern_edges', []);
  const allViewStates = getStorage<Record<string, ViewState>>('modern_viewStates', {});

  // 为旧数据添加默认日期字段
  const todosWithDates = allTodos.filter(t => t.workspaceId === workspaceId).map(todo => ({
    ...todo,
    createdAt: todo.createdAt || getCurrentDate(),
    completedAt: todo.completed && !todo.completedAt ? getCurrentDate() : todo.completedAt
  }));

  return {
    todos: todosWithDates,
    nodes: allNodes.filter(n => n.workspaceId === workspaceId),
    edges: allEdges.filter(e => e.workspaceId === workspaceId),
    viewState: allViewStates[workspaceId] || DEFAULT_VIEW_STATE
  };
};

/**
 * 保存工作区数据到 localStorage
 */
export const saveWorkspaceData = (
  workspaceId: string,
  todos: Todo[],
  nodes: Node[],
  edges: Edge[],
  viewState: ViewState,
  workspaces: Workspace[]
): void => {
  try {
    // 获取所有工作区的数据
    const allTodos = getStorage<Todo[]>('modern_todos', []);
    const allNodes = getStorage<Node[]>('modern_nodes', []);
    const allEdges = getStorage<Edge[]>('modern_edges', []);
    const allViewStates = getStorage<Record<string, ViewState>>('modern_viewStates', {});

    // 更新当前工作区的数据
    const otherTodos = allTodos.filter(t => t.workspaceId !== workspaceId);
    const otherNodes = allNodes.filter(n => n.workspaceId !== workspaceId);
    const otherEdges = allEdges.filter(e => e.workspaceId !== workspaceId);

    setStorage('modern_todos', [...otherTodos, ...todos]);
    setStorage('modern_nodes', [...otherNodes, ...nodes]);
    setStorage('modern_edges', [...otherEdges, ...edges]);
    setStorage('modern_viewStates', { ...allViewStates, [workspaceId]: viewState });
    setStorage('modern_workspaces', workspaces);
    setStorage('modern_currentWorkspaceId', workspaceId);
  } catch (e) {
    console.error('Failed to save workspace data:', e);
  }
};

/**
 * 创建新工作区
 */
export const createWorkspace = (title: string): Workspace => {
  return {
    id: generateId(),
    title: title.trim() || '新工作区',
    createdAt: Date.now()
  };
};

/**
 * 删除工作区及其所有数据
 */
export const deleteWorkspaceData = (workspaceId: string): void => {
  const allTodos = getStorage<Todo[]>('modern_todos', []);
  const allNodes = getStorage<Node[]>('modern_nodes', []);
  const allEdges = getStorage<Edge[]>('modern_edges', []);
  const allViewStates = getStorage<Record<string, ViewState>>('modern_viewStates', {});

  const filteredTodos = allTodos.filter(t => t.workspaceId !== workspaceId);
  const filteredNodes = allNodes.filter(n => n.workspaceId !== workspaceId);
  const filteredEdges = allEdges.filter(e => e.workspaceId !== workspaceId);
  const { [workspaceId]: _, ...filteredViewStates } = allViewStates;

  setStorage('modern_todos', filteredTodos);
  setStorage('modern_nodes', filteredNodes);
  setStorage('modern_edges', filteredEdges);
  setStorage('modern_viewStates', filteredViewStates);
};

/**
 * 获取当前工作区 ID（从 localStorage）
 */
export const getCurrentWorkspaceId = (workspaces: Workspace[]): string => {
  const saved = localStorage.getItem('modern_currentWorkspaceId');
  if (saved) return saved;
  return workspaces[0]?.id || '';
};
