/**
 * 自动保存 Hook
 * 当数据变化时，自动保存到 Dexie (IndexedDB)
 */
import { useEffect } from 'react';
import type { Todo, Node, Edge, ViewState, Workspace } from '../../types';
import { saveWorkspaceData } from '../workspace';
import { setStorage } from '../storage';

interface UseAutoSaveProps {
  currentWorkspaceId: string;
  todos: Todo[];
  nodes: Node[];
  edges: Edge[];
  viewState: ViewState;
  workspaces: Workspace[];
}

export const useAutoSave = ({
  currentWorkspaceId,
  todos,
  nodes,
  edges,
  viewState,
  workspaces
}: UseAutoSaveProps) => {
  useEffect(() => {
    if (!currentWorkspaceId) return;
    
    const timeoutId = setTimeout(async () => {
      try {
        await saveWorkspaceData(currentWorkspaceId, todos, nodes, edges, viewState, workspaces);
        await setStorage('currentWorkspaceId', currentWorkspaceId);
      } catch (error) {
        console.error('Failed to auto-save:', error);
      }
    }, 1000);
    
    return () => clearTimeout(timeoutId);
  }, [currentWorkspaceId, todos, nodes, edges, viewState, workspaces]);
};
