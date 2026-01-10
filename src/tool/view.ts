/**
 * 视图操作工具
 * 提供视图状态的处理功能，包括缩放、平移等
 */
import type { ViewState } from '../types';
import { MIN_SCALE, MAX_SCALE } from '../constants';

/**
 * 处理鼠标滚轮事件，支持缩放和平移
 */
export const handleWheel = (
  e: React.WheelEvent,
  viewState: ViewState,
  onViewStateChange: (newState: ViewState) => void
) => {
  if (e.altKey) {
    // Alt + 滚轮进行缩放
    e.preventDefault();
    const zoomSensitivity = 0.001;
    const delta = -e.deltaY * zoomSensitivity;
    const newScale = Math.min(Math.max(MIN_SCALE, viewState.scale + delta), MAX_SCALE);
    onViewStateChange({ ...viewState, scale: newScale });
  } else {
    // 普通滚轮进行平移
    onViewStateChange({
      ...viewState,
      x: viewState.x - e.deltaX,
      y: viewState.y - e.deltaY
    });
  }
};

/**
 * 缩放视图
 */
export const zoomView = (viewState: ViewState, delta: number): ViewState => {
  const newScale = Math.min(Math.max(MIN_SCALE, viewState.scale + delta), MAX_SCALE);
  return { ...viewState, scale: newScale };
};

/**
 * 重置视图缩放
 */
export const resetViewScale = (viewState: ViewState): ViewState => {
  return { ...viewState, scale: 1 };
};

/**
 * 处理键盘缩放
 */
export const handleKeyboardZoom = (
  key: string,
  viewState: ViewState
): ViewState | null => {
  if (key === '=' || key === '+') {
    return { ...viewState, scale: Math.min(viewState.scale + 0.1, MAX_SCALE) };
  } else if (key === '-') {
    return { ...viewState, scale: Math.max(viewState.scale - 0.1, MIN_SCALE) };
  } else if (key === '0') {
    return { ...viewState, scale: 1 };
  }
  return null;
};
