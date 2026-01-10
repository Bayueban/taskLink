/**
 * 坐标转换工具
 * 提供屏幕坐标与世界坐标的转换功能
 */
import type { ViewState, Node } from '../types';

/**
 * 将屏幕坐标转换为世界坐标
 */
export const screenToWorld = (sx: number, sy: number, viewState: ViewState) => {
  return {
    x: (sx - viewState.x) / viewState.scale,
    y: (sy - viewState.y) / viewState.scale
  };
};

/**
 * 获取节点的中心点坐标
 */
export const getNodeCenter = (node: Node) => {
  return {
    x: node.x + node.width / 2,
    y: node.y + node.height / 2
  };
};

/**
 * 获取当前视图中心的坐标
 */
export const getViewCenter = (viewState: ViewState, canvasWidth?: number, canvasHeight?: number) => {
  const width = canvasWidth ?? window.innerWidth * 0.75;
  const height = canvasHeight ?? window.innerHeight;
  return {
    x: -viewState.x / viewState.scale + width / 2 / viewState.scale,
    y: -viewState.y / viewState.scale + height / 2 / viewState.scale
  };
};
