/**
 * 存储工具类
 * 提供 localStorage 操作和 ID 生成功能
 */

/**
 * 从 localStorage 获取数据，如果不存在则返回默认值
 */
export const getStorage = <T,>(key: string, fallback: T): T => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
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
 * 保存数据到 localStorage
 */
export const setStorage = <T,>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
};
