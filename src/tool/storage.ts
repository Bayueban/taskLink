/**
 * 存储工具类
 * 提供 Dexie (IndexedDB) 操作和 ID 生成功能
 */
import { db } from './db';

/**
 * 从 Dexie 获取设置数据，如果不存在则返回默认值
 * 用于非集合类数据（如单个设置项）
 */
export const getStorage = async <T,>(key: string, fallback: T): Promise<T> => {
  try {
    const item = await db.settings.get(key);
    return item ? item.value : fallback;
  } catch (e) {
    console.error('Failed to get from Dexie:', e);
    return fallback;
  }
};

/**
 * 同步版本（用于向后兼容，但应该逐步替换为异步版本）
 * 仅用于非关键数据的读取
 */
export const getStorageSync = <T,>(key: string, fallback: T): T => {
  try {
    // 如果数据还在迁移中，从 localStorage 读取
    const migrated = localStorage.getItem('modern_migrated_to_dexie');
    if (migrated !== 'true') {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : fallback;
    }
    
    // 迁移完成后，不能同步读取，返回默认值
    // 调用者应该使用异步版本
    console.warn(`getStorageSync called for "${key}", consider using async version`);
    return fallback;
  } catch (e) {
    return fallback;
  }
};

/**
 * 生成随机 ID
 */
export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

/**
 * 保存设置数据到 Dexie
 */
export const setStorage = async <T,>(key: string, value: T): Promise<void> => {
  try {
    await db.settings.put({ key, value });
  } catch (e) {
    console.error('Failed to save to Dexie:', e);
  }
};
