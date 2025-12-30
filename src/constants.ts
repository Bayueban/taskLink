// --- Constants ---
export const COLORS = [
  '#ffffff', // White (Default) - 纯白，最佳对比度
  '#fee2e2', // Red 100 - 柔和的红色，饱和度适中
  '#fef3c7', // Amber 100 - 温暖的黄色
  '#d1fae5', // Green 100 - 清新的绿色
  '#dbeafe', // Blue 100 - 清爽的蓝色
  '#e9d5ff', // Violet 200 - 优雅的紫色
  '#fce7f3', // Pink 100 - 柔和的粉色
  '#e0f2fe', // Sky 100 - 天空蓝
  '#fef9c3', // Yellow 100 - 明亮的黄色
  '#f1f5f9', // Slate 100 - 淡灰色，微妙对比
];

export const MIN_WIDTH = 200;
export const MIN_HEIGHT = 140;
export const MAX_WIDTH = 800;
export const MAX_HEIGHT = 800;

// --- New Limits ---
export const MIN_SCALE = 0.2;
export const MAX_SCALE = 1.0;
// Defining a "Soft World Boundary" for the Minimap. 
// Coordinate range: -4000 to +4000 on both axes.
export const WORLD_LIMIT = 4000; 
export const WORLD_SIZE = WORLD_LIMIT * 2; 

// Default Data
import type { ViewState } from './types';

// export const DEFAULT_TODOS: Todo[] = [
//   { id: '1', title: '收集需求', content: '与客户确认最终的UI风格偏好。', completed: true },
//   { id: '2', title: '原型设计', content: '绘制高保真线框图。', completed: false },
// ];

// export const DEFAULT_NODES: Node[] = [
//   { id: '1', type: 'text', x: 100, y: 100, title: '项目目标', content: '打造一个既美观又实用的思考辅助工具。', width: 260, height: 180, color: '#ffffff' },
//   { id: '2', type: 'text', x: 450, y: 200, title: '关键特性', content: '无限画布、双向链接、本地存储。', width: 260, height: 180, color: '#bfdbfe' },
// ];

// export const DEFAULT_EDGES: Edge[] = [
//   { id: 'e1', from: '1', to: '2' }
// ];

export const DEFAULT_VIEW_STATE: ViewState = { x: 0, y: 0, scale: 0.5 };

