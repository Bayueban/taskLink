/**
 * 自动保存 Hook
 * 当数据变化时，自动保存到 localStorage
 */
import { useEffect } from 'react';
import type { Todo, Node, Edge, ViewState, Workspace } from '../../types';
import { saveWorkspaceData } from '../workspace';

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
    const timeoutId = setTimeout(() => {
      saveWorkspaceData(currentWorkspaceId, todos, nodes, edges, viewState, workspaces);
      localStorage.setItem('modern_currentWorkspaceId', currentWorkspaceId);
    }, 1000);
    return () => clearTimeout(timeoutId);
  }, [currentWorkspaceId, todos, nodes, edges, viewState, workspaces]);
};
