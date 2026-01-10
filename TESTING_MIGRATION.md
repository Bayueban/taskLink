# 数据迁移测试指南

## 快速验证迁移功能

### 场景 1: 模拟有数据的老用户

**目标**: 验证 localStorage 数据能正确迁移到 Dexie

1. **准备测试数据**
   ```javascript
   // 在浏览器控制台执行
   localStorage.setItem('modern_todos', JSON.stringify([
     {
       id: 'test1',
       workspaceId: 'ws1',
       title: '测试任务',
       content: '这是一个测试任务',
       completed: false,
       createdAt: '26-01-10 10:00'
     }
   ]));
   
   localStorage.setItem('modern_workspaces', JSON.stringify([
     {
       id: 'ws1',
       title: '测试工作区',
       createdAt: Date.now()
     }
   ]));
   
   localStorage.setItem('modern_nodes', JSON.stringify([]));
   localStorage.setItem('modern_edges', JSON.stringify([]));
   localStorage.setItem('modern_viewStates', JSON.stringify({}));
   localStorage.setItem('modern_currentWorkspaceId', 'ws1');
   ```

2. **刷新页面**
   - 应该看到"加载中..."提示
   - 1-2秒后应该能看到测试数据

3. **验证迁移成功**
   ```javascript
   // 在控制台检查
   localStorage.getItem('modern_migrated_to_dexie') // 应该是 "true"
   ```

4. **检查 IndexedDB**
   - 打开 DevTools → Application → IndexedDB
   - 展开 "TodoDatabase"
   - 查看 todos 表，应该能看到测试数据

### 场景 2: 模拟新用户

**目标**: 验证新用户能正常创建数据

1. **清除所有数据**
   ```javascript
   // 在浏览器控制台执行
   await indexedDB.deleteDatabase('TodoDatabase');
   localStorage.clear();
   location.reload();
   ```

2. **验证默认状态**
   - 应该看到空的应用
   - 有一个"默认工作区"
   - 可以正常添加任务

3. **添加测试数据**
   - 创建几个任务
   - 标记一些为已完成
   - 切换标签页

4. **刷新验证持久化**
   - 刷新页面
   - 所有数据应该保留

### 场景 3: 测试多工作区

**目标**: 验证多工作区数据隔离

1. **创建多个工作区**
   - 创建工作区 A
   - 添加任务 A1, A2
   - 创建工作区 B
   - 添加任务 B1, B2

2. **切换工作区**
   - 切换到 A，应该只看到 A1, A2
   - 切换到 B，应该只看到 B1, B2

3. **验证数据库**
   ```javascript
   // 在控制台执行
   (async () => {
     const { db } = await import('./src/tool/db.ts');
     const todos = await db.todos.toArray();
     console.log('所有 Todos:', todos);
     
     const workspaces = await db.workspaces.toArray();
     console.log('所有工作区:', workspaces);
   })();
   ```

## 常见问题排查

### 问题 1: 看不到迁移的数据

**排查步骤**:
1. 检查浏览器控制台是否有错误
2. 检查 `localStorage.getItem('modern_migrated_to_dexie')` 是否为 "true"
3. 检查 IndexedDB 中是否有数据
4. 查看控制台迁移日志

**可能原因**:
- localStorage 中没有数据
- 迁移过程出错
- IndexedDB 被禁用

### 问题 2: 迁移后数据不完整

**排查步骤**:
1. 检查控制台错误日志
2. 对比 localStorage 和 IndexedDB 的数据量
3. 检查是否有数据格式不兼容

### 问题 3: 页面一直显示"加载中..."

**排查步骤**:
1. 检查浏览器控制台错误
2. 检查网络连接
3. 尝试清除缓存重新加载

**解决方案**:
```javascript
// 强制重置
await indexedDB.deleteDatabase('TodoDatabase');
localStorage.removeItem('modern_migrated_to_dexie');
location.reload();
```

## 性能测试

### 测试大量数据

```javascript
// 创建 1000 个测试 Todos
(async () => {
  const { db } = await import('./src/tool/db.ts');
  const workspaceId = 'ws1';
  
  const todos = Array.from({ length: 1000 }, (_, i) => ({
    id: `test-${i}`,
    workspaceId,
    title: `测试任务 ${i}`,
    content: `内容 ${i}`,
    completed: i % 3 === 0,
    createdAt: '26-01-10 10:00',
    completedAt: i % 3 === 0 ? '26-01-10 12:00' : undefined
  }));
  
  await db.todos.bulkAdd(todos);
  console.log('✅ 创建了 1000 个测试 Todos');
  location.reload();
})();
```

### 测试查询性能

```javascript
// 测试查询速度
(async () => {
  const { db } = await import('./src/tool/db.ts');
  
  console.time('查询所有 Todos');
  const allTodos = await db.todos.toArray();
  console.timeEnd('查询所有 Todos');
  console.log(`总数: ${allTodos.length}`);
  
  console.time('按工作区查询');
  const workspaceTodos = await db.todos.where('workspaceId').equals('ws1').toArray();
  console.timeEnd('按工作区查询');
  console.log(`工作区数据: ${workspaceTodos.length}`);
  
  console.time('查询已完成');
  const completed = await db.todos.where('completed').equals(1).toArray();
  console.timeEnd('查询已完成');
  console.log(`已完成: ${completed.length}`);
})();
```

## 监控建议

### 生产环境监控

1. **迁移成功率**
   - 记录迁移成功/失败的用户数
   - 监控迁移耗时

2. **错误日志**
   - 收集迁移过程中的错误
   - 分析常见失败原因

3. **用户反馈**
   - 收集用户报告的数据问题
   - 监控加载时间

### 添加监控代码（可选）

```typescript
// 在 db.ts 的 migrateFromLocalStorage 函数中添加
export const migrateFromLocalStorage = async (): Promise<void> => {
  const startTime = performance.now();
  
  try {
    // ... 迁移逻辑 ...
    
    const duration = performance.now() - startTime;
    console.log(`✅ 迁移成功，耗时: ${duration.toFixed(2)}ms`);
    
    // 可以发送到分析服务
    // analytics.track('migration_success', { duration });
    
  } catch (error) {
    console.error('❌ 迁移失败:', error);
    
    // 可以发送错误报告
    // errorReporting.captureException(error);
    
    throw error;
  }
};
```

## 回滚计划

如果发现严重问题需要回滚：

1. **准备旧版本代码**
   ```bash
   git checkout <previous-commit>
   pnpm install
   pnpm run build
   ```

2. **用户数据安全**
   - localStorage 数据仍然存在
   - 可以继续使用旧版本

3. **通知用户**
   - 如有必要，通知用户刷新页面
   - 说明问题和解决时间

## 成功标准

✅ 迁移被认为成功，如果：
1. 所有测试场景通过
2. 无编译错误
3. 无运行时错误
4. 数据完整性验证通过
5. 性能测试达标
6. 用户体验流畅

---

**准备部署？** 请确保：
- ✅ 所有测试通过
- ✅ 文档完整
- ✅ 监控就绪
- ✅ 回滚方案准备
