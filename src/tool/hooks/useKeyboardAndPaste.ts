/**
 * 键盘和粘贴事件处理 Hook
 */
import { useEffect } from 'react';
import type { ViewState } from '../../types';
import { handlePaste as handlePasteTool, handleKeyDown as handleKeyDownTool } from '../keyboard';

interface UseKeyboardAndPasteProps {
  viewState: ViewState;
  selectedId: string | null;
  connectingSourceId: string | null;
  currentWorkspaceId: string;
  onNodeCreated: (newNode: any) => void;
  onSelect: (nodeId: string) => void;
  onDelete: (id: string) => void;
  onDeselect: () => void;
  onCancelConnect: () => void;
  onViewStateChange: React.Dispatch<React.SetStateAction<ViewState>>;
}

export const useKeyboardAndPaste = ({
  viewState,
  selectedId,
  connectingSourceId,
  currentWorkspaceId,
  onNodeCreated,
  onSelect,
  onDelete,
  onDeselect,
  onCancelConnect,
  onViewStateChange
}: UseKeyboardAndPasteProps) => {
  useEffect(() => {
    const handlePasteEvent = (e: ClipboardEvent) => {
      handlePasteTool(e, viewState, currentWorkspaceId, onNodeCreated, onSelect);
    };

    const handleKeyDownEvent = (e: KeyboardEvent) => {
      handleKeyDownTool(
        e,
        selectedId,
        connectingSourceId,
        viewState,
        onDelete,
        onDeselect,
        onCancelConnect,
        onViewStateChange
      );
    };

    window.addEventListener('paste', handlePasteEvent);
    window.addEventListener('keydown', handleKeyDownEvent);

    return () => {
      window.removeEventListener('paste', handlePasteEvent);
      window.removeEventListener('keydown', handleKeyDownEvent);
    };
  }, [viewState, selectedId, connectingSourceId, currentWorkspaceId, onNodeCreated, onSelect, onDelete, onDeselect, onCancelConnect, onViewStateChange]);
};
