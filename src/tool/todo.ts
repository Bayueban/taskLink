/**
 * Todo 操作工具
 * 提供 Todo 的增删改查功能
 */
import type { Todo, Node, ViewState } from '../types';
import { COLORS } from '../constants';
import { generateId } from './storage';
import { getViewCenter } from './coordinate';

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
 * 创建新的 Todo 和对应的 Node
 */
export const createTodoAndNode = (
  title: string,
  content: string,
  workspaceId: string,
  viewState: ViewState,
  existingNodesCount: number
): { todo: Todo; node: Node } => {
  const newId = generateId();
  const viewCenter = getViewCenter(viewState);
  
  const todo: Todo = {
    id: newId,
    workspaceId,
    title,
    content,
    completed: false,
    createdAt: getCurrentDate()
  };

  const node: Node = {
    id: newId,
    workspaceId,
    type: 'text',
    x: viewCenter.x - 130 + (existingNodesCount * 20),
    y: viewCenter.y - 90 + (existingNodesCount * 20),
    title,
    content,
    width: 260,
    height: 180,
    color: COLORS[0]
  };

  return { todo, node };
};

/**
 * 切换 Todo 的完成状态
 */
export const toggleTodoComplete = (todos: Todo[], id: string): Todo[] => {
  return todos.map(t => {
    if (t.id === id) {
      const newCompleted = !t.completed;
      return {
        ...t,
        completed: newCompleted,
        completedAt: newCompleted ? getCurrentDate() : undefined
      };
    }
    return t;
  });
};

/**
 * 过滤删除指定 ID 的 Todo
 */
export const filterTodoById = (todos: Todo[], id: string): Todo[] => {
  return todos.filter(t => t.id !== id);
};
