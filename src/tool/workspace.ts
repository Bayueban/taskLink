/**
 * 工作区管理工具
 * 提供工作区的创建、切换、删除等功能
 */
import type { Workspace, Todo, Node, Edge, ViewState } from '../types';
import { DEFAULT_VIEW_STATE } from '../constants';
import { generateId, getStorage } from './storage';
import { db } from './db';

/**
 * 初始化工作区列表
 */
export const initWorkspaces = async (): Promise<Workspace[]> => {
  try {
    const saved = await db.workspaces.toArray();
    if (saved.length === 0) {
      const defaultWorkspace: Workspace = {
        id: generateId(),
        title: '默认工作区',
        createdAt: Date.now()
      };
      await db.workspaces.add(defaultWorkspace);
      return [defaultWorkspace];
    }
    return saved;
  } catch (error) {
    console.error('Failed to init workspaces:', error);
    const defaultWorkspace: Workspace = {
      id: generateId(),
      title: '默认工作区',
      createdAt: Date.now()
    };
    return [defaultWorkspace];
  }
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
export const loadWorkspaceData = async (workspaceId: string) => {
  try {
    const [allTodos, allNodes, allEdges, viewStateItem] = await Promise.all([
      db.todos.where('workspaceId').equals(workspaceId).toArray(),
      db.nodes.where('workspaceId').equals(workspaceId).toArray(),
      db.edges.where('workspaceId').equals(workspaceId).toArray(),
      db.viewStates.get(`viewState_${workspaceId}`)
    ]);

    // 为旧数据添加默认日期字段
    const todosWithDates = allTodos.map(todo => ({
      ...todo,
      createdAt: todo.createdAt || getCurrentDate(),
      completedAt: todo.completed && !todo.completedAt ? getCurrentDate() : todo.completedAt
    }));

    return {
      todos: todosWithDates,
      nodes: allNodes,
      edges: allEdges,
      viewState: viewStateItem?.value || DEFAULT_VIEW_STATE
    };
  } catch (error) {
    console.error('Failed to load workspace data:', error);
    return {
      todos: [],
      nodes: [],
      edges: [],
      viewState: DEFAULT_VIEW_STATE
    };
  }
};

/**
 * 保存工作区数据到 Dexie
 */
export const saveWorkspaceData = async (
  workspaceId: string,
  todos: Todo[],
  nodes: Node[],
  edges: Edge[],
  viewState: ViewState,
  workspaces: Workspace[]
): Promise<void> => {
  try {
    // 使用事务来确保数据一致性
    await db.transaction('rw', [db.todos, db.nodes, db.edges, db.viewStates, db.workspaces, db.settings], async () => {
      // 删除当前工作区的旧数据
      await db.todos.where('workspaceId').equals(workspaceId).delete();
      await db.nodes.where('workspaceId').equals(workspaceId).delete();
      await db.edges.where('workspaceId').equals(workspaceId).delete();

      // 添加新数据
      if (todos.length > 0) await db.todos.bulkAdd(todos);
      if (nodes.length > 0) await db.nodes.bulkAdd(nodes);
      if (edges.length > 0) await db.edges.bulkAdd(edges);

      // 保存视图状态
      await db.viewStates.put({ key: `viewState_${workspaceId}`, value: viewState });

      // 保存工作区列表
      await db.workspaces.clear();
      await db.workspaces.bulkAdd(workspaces);

      // 保存当前工作区 ID
      await db.settings.put({ key: 'currentWorkspaceId', value: workspaceId });
    });
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
export const deleteWorkspaceData = async (workspaceId: string): Promise<void> => {
  try {
    await db.transaction('rw', [db.todos, db.nodes, db.edges, db.viewStates, db.workspaces], async () => {
      await db.todos.where('workspaceId').equals(workspaceId).delete();
      await db.nodes.where('workspaceId').equals(workspaceId).delete();
      await db.edges.where('workspaceId').equals(workspaceId).delete();
      await db.viewStates.delete(`viewState_${workspaceId}`);
      await db.workspaces.delete(workspaceId);
    });
  } catch (error) {
    console.error('Failed to delete workspace data:', error);
  }
};

/**
 * 获取当前工作区 ID
 */
export const getCurrentWorkspaceId = async (workspaces: Workspace[]): Promise<string> => {
  try {
    const saved = await getStorage<string>('currentWorkspaceId', '');
    if (saved) return saved;
    return workspaces[0]?.id || '';
  } catch (error) {
    console.error('Failed to get current workspace ID:', error);
    return workspaces[0]?.id || '';
  }
};
