# 数据存储迁移说明

## 概述

本次更新将数据存储从 `localStorage` 迁移到 `Dexie.js` (IndexedDB)，以提供更好的性能和存储能力。

## 迁移特性

### ✅ 自动迁移
- 应用首次启动时会自动检测 localStorage 中的数据
- 自动将所有数据迁移到 IndexedDB
- 迁移完成后设置标记，避免重复迁移
- **向后兼容**：现有用户的数据会完全保留

### 📦 迁移的数据
1. **Todos** - 所有待办事项
2. **Nodes** - 画布上的所有节点
3. **Edges** - 节点之间的连线
4. **Workspaces** - 工作区信息
5. **ViewStates** - 每个工作区的视图状态（缩放、位置）
6. **Settings** - 当前工作区 ID 等设置

## 技术细节

### 数据库结构

```typescript
// IndexedDB 表结构
- todos: { id, workspaceId, completed, createdAt, ... }
- nodes: { id, workspaceId, ... }
- edges: { id, workspaceId, from, to, ... }
- workspaces: { id, createdAt, ... }
- viewStates: { key, value }
- settings: { key, value }
```

### 迁移流程

```
1. 应用启动 → 调用 initDatabase()
2. 检查迁移标记 (modern_migrated_to_dexie)
3. 如果未迁移：
   - 读取 localStorage 数据
   - 批量写入 Dexie
   - 设置迁移标记
4. 完成初始化
```

### 安全性

- ✅ 迁移失败不会删除原数据
- ✅ 原 localStorage 数据保留（可在后续版本中清理）
- ✅ 事务保证数据一致性
- ✅ 错误处理和日志记录

## 用户体验

### 首次启动
- 显示"加载中..."提示
- 迁移过程通常在 1-2 秒内完成
- 迁移成功后正常使用

### 后续启动
- 直接从 IndexedDB 加载数据
- 加载速度更快
- 支持更大的数据量

## 开发注意事项

### 新的 API 特性

1. **异步操作**
   ```typescript
   // 旧方式（同步）
   const data = loadWorkspaceData(id);
   
   // 新方式（异步）
   const data = await loadWorkspaceData(id);
   ```

2. **初始化**
   ```typescript
   // 应用启动时调用
   await initDatabase();
   ```

3. **数据操作**
   ```typescript
   // 所有数据操作都是异步的
   await saveWorkspaceData(...);
   await deleteWorkspaceData(...);
   ```

## 调试

### 查看迁移状态
```javascript
// 在浏览器控制台检查
localStorage.getItem('modern_migrated_to_dexie') // 应该是 "true"
```

### 查看 IndexedDB 数据
1. 打开 Chrome DevTools
2. 进入 Application → IndexedDB
3. 展开 "TodoDatabase"
4. 查看各个表的数据

### 重新迁移（测试用）
```javascript
// 在浏览器控制台执行
localStorage.removeItem('modern_migrated_to_dexie');
// 然后刷新页面
```

## 性能对比

| 指标 | localStorage | Dexie (IndexedDB) |
|------|-------------|-------------------|
| 存储限制 | ~5-10MB | ~50MB-数GB |
| 查询性能 | O(1) 简单读取 | O(log n) 索引查询 |
| 并发 | 阻塞主线程 | 异步，不阻塞 |
| 复杂查询 | 不支持 | 支持索引和过滤 |

## 回滚方案

如果需要回滚到 localStorage：

1. 恢复旧版本代码
2. localStorage 中的数据仍然存在
3. 用户数据不会丢失

## 常见问题

**Q: 迁移会不会丢失数据？**
A: 不会。原 localStorage 数据会保留，只是新数据会存储在 IndexedDB 中。

**Q: 迁移需要多长时间？**
A: 通常在 1-2 秒内完成，取决于数据量。

**Q: 如果迁移失败怎么办？**
A: 应用会记录错误，下次启动时会重新尝试迁移。

**Q: 可以清理 localStorage 了吗？**
A: 建议等待几个版本后再清理，以确保所有用户都成功迁移。

## 版本信息

- **实施版本**: v1.1.1+
- **Dexie 版本**: 4.2.1
- **迁移日期**: 2026-01-10
