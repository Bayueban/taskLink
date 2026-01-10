/**
 * 键盘和粘贴处理工具
 * 提供键盘事件和粘贴事件的处理功能
 */
import type { ViewState } from '../types';
import { MIN_SCALE, MAX_SCALE } from '../constants';
import { createNodeFromPastedImage } from './node';

/**
 * 处理粘贴事件（主要处理图片粘贴）
 */
export const handlePaste = (
  e: ClipboardEvent,
  viewState: ViewState,
  workspaceId: string,
  onNodeCreated: (node: ReturnType<typeof createNodeFromPastedImage>) => void,
  onSelect: (nodeId: string) => void
) => {
  const items = e.clipboardData?.items;
  if (!items) return;
  
  for (let i = 0; i < items.length; i++) {
    if (items[i].type.indexOf('image') !== -1) {
      const blob = items[i].getAsFile();
      if (!blob) continue;
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        const newNode = createNodeFromPastedImage(base64, viewState, workspaceId);
        onNodeCreated(newNode);
        onSelect(newNode.id);
      };
      reader.readAsDataURL(blob);
      break;
    }
  }
};

/**
 * 处理键盘事件
 */
export const handleKeyDown = (
  e: KeyboardEvent,
  selectedId: string | null,
  _connectingSourceId: string | null,
  viewState: ViewState,
  onDelete: (id: string) => void,
  onDeselect: () => void,
  onCancelConnect: () => void,
  onViewStateChange: (newState: ViewState) => void
) => {
  // Delete 或 Backspace 删除选中的节点
  if (e.key === 'Delete' || e.key === 'Backspace') {
    if (selectedId && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
      onDelete(selectedId);
    }
    return;
  }

  // Escape 取消选择和连接
  if (e.key === 'Escape') {
    onDeselect();
    onCancelConnect();
    return;
  }

  // Alt + + 或 Alt + - 进行缩放
  if (e.altKey) {
    if (e.key === '=' || e.key === '+') {
      e.preventDefault();
      onViewStateChange({ ...viewState, scale: Math.min(viewState.scale + 0.1, MAX_SCALE) });
    } else if (e.key === '-') {
      e.preventDefault();
      onViewStateChange({ ...viewState, scale: Math.max(viewState.scale - 0.1, MIN_SCALE) });
    } else if (e.key === '0') {
      e.preventDefault();
      onViewStateChange({ ...viewState, scale: 1 });
    }
  }
};
