/**
 * Dexie.js 数据库配置
 * 提供 IndexedDB 存储功能
 */
import Dexie, { type Table } from 'dexie';
import type { Todo, Node, Edge, ViewState, Workspace } from '../types';

// 数据库表类型定义
export interface StorageItem<T> {
  key: string;
  value: T;
}

// 数据库类定义
export class TodoDatabase extends Dexie {
  // 声明表
  todos!: Table<Todo, string>;
  nodes!: Table<Node, string>;
  edges!: Table<Edge, string>;
  workspaces!: Table<Workspace, string>;
  viewStates!: Table<StorageItem<ViewState>, string>;
  settings!: Table<StorageItem<any>, string>;

  constructor() {
    super('TodoDatabase');
    
    // 定义数据库版本和表结构
    this.version(1).stores({
      todos: 'id, workspaceId, completed, createdAt',
      nodes: 'id, workspaceId',
      edges: 'id, workspaceId, from, to',
      workspaces: 'id, createdAt',
      viewStates: 'key',
      settings: 'key'
    });
  }
}

// 创建数据库实例
export const db = new TodoDatabase();

/**
 * 从 localStorage 迁移数据到 Dexie
 * 这个函数只在第一次运行时执行
 */
export const migrateFromLocalStorage = async (): Promise<void> => {
  try {
    // 检查是否已经迁移过
    const migrated = localStorage.getItem('modern_migrated_to_dexie');
    if (migrated === 'true') {
      console.log('数据已迁移，跳过迁移过程');
      return;
    }

    console.log('开始从 localStorage 迁移数据到 Dexie...');

    // 迁移 Todos
    const todosJson = localStorage.getItem('modern_todos');
    if (todosJson) {
      const todos: Todo[] = JSON.parse(todosJson);
      if (todos.length > 0) {
        await db.todos.bulkPut(todos);
        console.log(`迁移了 ${todos.length} 个 todos`);
      }
    }

    // 迁移 Nodes
    const nodesJson = localStorage.getItem('modern_nodes');
    if (nodesJson) {
      const nodes: Node[] = JSON.parse(nodesJson);
      if (nodes.length > 0) {
        await db.nodes.bulkPut(nodes);
        console.log(`迁移了 ${nodes.length} 个 nodes`);
      }
    }

    // 迁移 Edges
    const edgesJson = localStorage.getItem('modern_edges');
    if (edgesJson) {
      const edges: Edge[] = JSON.parse(edgesJson);
      if (edges.length > 0) {
        await db.edges.bulkPut(edges);
        console.log(`迁移了 ${edges.length} 个 edges`);
      }
    }

    // 迁移 Workspaces
    const workspacesJson = localStorage.getItem('modern_workspaces');
    if (workspacesJson) {
      const workspaces: Workspace[] = JSON.parse(workspacesJson);
      if (workspaces.length > 0) {
        await db.workspaces.bulkPut(workspaces);
        console.log(`迁移了 ${workspaces.length} 个 workspaces`);
      }
    }

    // 迁移 ViewStates
    const viewStatesJson = localStorage.getItem('modern_viewStates');
    if (viewStatesJson) {
      const viewStates: Record<string, ViewState> = JSON.parse(viewStatesJson);
      const viewStateItems = Object.entries(viewStates).map(([key, value]) => ({
        key: `viewState_${key}`,
        value
      }));
      if (viewStateItems.length > 0) {
        await db.viewStates.bulkPut(viewStateItems);
        console.log(`迁移了 ${viewStateItems.length} 个 viewStates`);
      }
    }

    // 迁移当前工作区 ID
    const currentWorkspaceId = localStorage.getItem('modern_currentWorkspaceId');
    if (currentWorkspaceId) {
      await db.settings.put({ key: 'currentWorkspaceId', value: currentWorkspaceId });
      console.log('迁移了当前工作区 ID');
    }

    // 标记迁移完成
    localStorage.setItem('modern_migrated_to_dexie', 'true');
    console.log('✅ 数据迁移完成！');

    // 可选：清理旧数据（保留一段时间以防万一）
    // localStorage.removeItem('modern_todos');
    // localStorage.removeItem('modern_nodes');
    // localStorage.removeItem('modern_edges');
    // localStorage.removeItem('modern_workspaces');
    // localStorage.removeItem('modern_viewStates');
    // localStorage.removeItem('modern_currentWorkspaceId');

  } catch (error) {
    console.error('数据迁移失败:', error);
    // 迁移失败时，不设置迁移标记，下次还会尝试
    throw error;
  }
};

/**
 * 请求持久化存储权限
 */
export const requestPersistentStorage = async (): Promise<boolean> => {
  try {
    if (navigator.storage && navigator.storage.persist) {
      const isPersisted = await navigator.storage.persisted();
      
      if (isPersisted) {
        console.log('✅ 存储已持久化');
        return true;
      }
      
      // 请求持久化
      const granted = await navigator.storage.persist();
      
      if (granted) {
        console.log('✅ 持久化存储权限已授予');
        return true;
      } else {
        console.warn('⚠️ 持久化存储权限被拒绝');
        return false;
      }
    } else {
      console.warn('⚠️ 浏览器不支持 StorageManager API');
      return false;
    }
  } catch (error) {
    console.error('请求持久化存储失败:', error);
    return false;
  }
};

/**
 * 获取存储使用情况
 */
export const getStorageEstimate = async (): Promise<{
  usage: number;
  quota: number;
  usageInMB: number;
  quotaInMB: number;
  percentage: number;
} | null> => {
  try {
    if (navigator.storage && navigator.storage.estimate) {
      const estimate = await navigator.storage.estimate();
      const usage = estimate.usage || 0;
      const quota = estimate.quota || 0;
      
      return {
        usage,
        quota,
        usageInMB: Number((usage / (1024 * 1024)).toFixed(2)),
        quotaInMB: Number((quota / (1024 * 1024)).toFixed(2)),
        percentage: quota > 0 ? Number(((usage / quota) * 100).toFixed(2)) : 0
      };
    }
    return null;
  } catch (error) {
    console.error('获取存储信息失败:', error);
    return null;
  }
};

/**
 * 初始化数据库（在应用启动时调用）
 */
export const initDatabase = async (): Promise<void> => {
  try {
    // 执行数据迁移
    await migrateFromLocalStorage();
    
    // 请求持久化存储
    await requestPersistentStorage();
    
    // 打印存储使用情况
    const storageInfo = await getStorageEstimate();
    if (storageInfo) {
      console.log(`📊 存储使用: ${storageInfo.usageInMB}MB / ${storageInfo.quotaInMB}MB (${storageInfo.percentage}%)`);
    }
  } catch (error) {
    console.error('数据库初始化失败:', error);
  }
};
