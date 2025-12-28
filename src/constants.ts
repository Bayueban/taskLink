// --- Constants ---
export const COLORS = [
  '#ffffff', // White (Default)
  '#fecaca', // Red 200
  '#fed7aa', // Orange 200
  '#fde68a', // Amber 200
  '#bbf7d0', // Green 200
  '#a5f3fc', // Cyan 200
  '#bfdbfe', // Blue 200
  '#ddd6fe', // Violet 200
  '#fbcfe8', // Pink 200
  '#e2e8f0', // Slate 200
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

