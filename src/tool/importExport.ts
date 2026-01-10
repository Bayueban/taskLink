/**
 * 数据导入导出工具
 */
import { db } from './db';
import type { Todo, Node, Edge, Workspace, ViewState } from '../types';

/**
 * 导出数据格式
 */
export interface ExportData {
  version: string;
  exportDate: string;
  data: {
    workspaces: Workspace[];
    todos: Todo[];
    nodes: Node[];
    edges: Edge[];
    viewStates: Array<{ key: string; value: ViewState }>;
    settings: Array<{ key: string; value: any }>;
  };
}

/**
 * 导出所有数据到 JSON 文件
 */
export const exportData = async (): Promise<void> => {
  try {
    // 从数据库读取所有数据
    const [workspaces, todos, nodes, edges, viewStates, settings] = await Promise.all([
      db.workspaces.toArray(),
      db.todos.toArray(),
      db.nodes.toArray(),
      db.edges.toArray(),
      db.viewStates.toArray(),
      db.settings.toArray()
    ]);

    // 构建导出数据
    const exportData: ExportData = {
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      data: {
        workspaces,
        todos,
        nodes,
        edges,
        viewStates,
        settings
      }
    };

    // 转换为 JSON
    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });

    // 创建下载链接
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `todolist-backup-${new Date().toISOString().split('T')[0]}.json`;
    
    // 触发下载
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // 清理
    URL.revokeObjectURL(url);
    
    console.log('✅ 数据导出成功');
  } catch (error) {
    console.error('导出数据失败:', error);
    throw new Error('导出数据失败，请重试');
  }
};

/**
 * 从 JSON 文件导入数据
 */
export const importData = async (file: File): Promise<void> => {
  try {
    // 读取文件内容
    const text = await file.text();
    const importedData: ExportData = JSON.parse(text);

    // 验证数据格式
    if (!importedData.version || !importedData.data) {
      throw new Error('无效的备份文件格式');
    }

    const { workspaces, todos, nodes, edges, viewStates, settings } = importedData.data;

    // 确认导入操作
    const confirmMessage = `
即将导入数据：
- 工作区: ${workspaces?.length || 0} 个
- 任务: ${todos?.length || 0} 个
- 节点: ${nodes?.length || 0} 个
- 连线: ${edges?.length || 0} 个

⚠️ 这将覆盖当前所有数据！是否继续？
    `.trim();

    if (!confirm(confirmMessage)) {
      return;
    }

    // 使用事务导入所有数据
    await db.transaction('rw', [
      db.workspaces,
      db.todos,
      db.nodes,
      db.edges,
      db.viewStates,
      db.settings
    ], async () => {
      // 清空现有数据
      await Promise.all([
        db.workspaces.clear(),
        db.todos.clear(),
        db.nodes.clear(),
        db.edges.clear(),
        db.viewStates.clear(),
        db.settings.clear()
      ]);

      // 导入新数据
      if (workspaces?.length) await db.workspaces.bulkAdd(workspaces);
      if (todos?.length) await db.todos.bulkAdd(todos);
      if (nodes?.length) await db.nodes.bulkAdd(nodes);
      if (edges?.length) await db.edges.bulkAdd(edges);
      if (viewStates?.length) await db.viewStates.bulkAdd(viewStates);
      if (settings?.length) await db.settings.bulkAdd(settings);
    });

    console.log('✅ 数据导入成功');
    alert('数据导入成功！页面将刷新以加载新数据。');
    
    // 刷新页面以加载新数据
    window.location.reload();
  } catch (error) {
    console.error('导入数据失败:', error);
    throw new Error('导入数据失败：' + (error instanceof Error ? error.message : '未知错误'));
  }
};

/**
 * 合并导入数据（不覆盖现有数据）
 */
export const mergeImportData = async (file: File): Promise<void> => {
  try {
    // 读取文件内容
    const text = await file.text();
    const importedData: ExportData = JSON.parse(text);

    // 验证数据格式
    if (!importedData.version || !importedData.data) {
      throw new Error('无效的备份文件格式');
    }

    const { workspaces, todos, nodes, edges, viewStates, settings } = importedData.data;

    // 确认合并操作
    const confirmMessage = `
即将合并导入数据：
- 工作区: ${workspaces?.length || 0} 个
- 任务: ${todos?.length || 0} 个
- 节点: ${nodes?.length || 0} 个
- 连线: ${edges?.length || 0} 个

⚠️ ID 冲突的数据将被跳过。是否继续？
    `.trim();

    if (!confirm(confirmMessage)) {
      return;
    }

    // 使用事务合并数据
    await db.transaction('rw', [
      db.workspaces,
      db.todos,
      db.nodes,
      db.edges,
      db.viewStates,
      db.settings
    ], async () => {
      // 合并数据（跳过已存在的 ID）
      let addedCount = 0;
      
      if (workspaces?.length) {
        for (const workspace of workspaces) {
          const exists = await db.workspaces.get(workspace.id);
          if (!exists) {
            await db.workspaces.add(workspace);
            addedCount++;
          }
        }
      }

      if (todos?.length) {
        for (const todo of todos) {
          const exists = await db.todos.get(todo.id);
          if (!exists) {
            await db.todos.add(todo);
          }
        }
      }

      if (nodes?.length) {
        for (const node of nodes) {
          const exists = await db.nodes.get(node.id);
          if (!exists) {
            await db.nodes.add(node);
          }
        }
      }

      if (edges?.length) {
        for (const edge of edges) {
          const exists = await db.edges.get(edge.id);
          if (!exists) {
            await db.edges.add(edge);
          }
        }
      }

      if (viewStates?.length) {
        for (const viewState of viewStates) {
          await db.viewStates.put(viewState);
        }
      }

      if (settings?.length) {
        for (const setting of settings) {
          await db.settings.put(setting);
        }
      }

      console.log(`✅ 合并导入完成，新增 ${addedCount} 个工作区`);
    });

    alert('数据合并成功！页面将刷新以加载新数据。');
    window.location.reload();
  } catch (error) {
    console.error('合并导入数据失败:', error);
    throw new Error('合并导入失败：' + (error instanceof Error ? error.message : '未知错误'));
  }
};

/**
 * 导出单个工作区的数据
 */
export const exportWorkspace = async (workspaceId: string): Promise<void> => {
  try {
    // 读取指定工作区的数据
    const [workspace, todos, nodes, edges, viewState] = await Promise.all([
      db.workspaces.get(workspaceId),
      db.todos.where('workspaceId').equals(workspaceId).toArray(),
      db.nodes.where('workspaceId').equals(workspaceId).toArray(),
      db.edges.where('workspaceId').equals(workspaceId).toArray(),
      db.viewStates.get(`viewState_${workspaceId}`)
    ]);

    if (!workspace) {
      throw new Error('工作区不存在');
    }

    // 构建导出数据
    const exportData: ExportData = {
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      data: {
        workspaces: [workspace],
        todos,
        nodes,
        edges,
        viewStates: viewState ? [viewState] : [],
        settings: []
      }
    };

    // 转换为 JSON
    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });

    // 创建下载链接
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `workspace-${workspace.title}-${new Date().toISOString().split('T')[0]}.json`;
    
    // 触发下载
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // 清理
    URL.revokeObjectURL(url);
    
    console.log('✅ 工作区导出成功');
  } catch (error) {
    console.error('导出工作区失败:', error);
    throw new Error('导出工作区失败，请重试');
  }
};
