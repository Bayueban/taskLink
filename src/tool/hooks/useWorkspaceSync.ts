/**
 * 工作区同步 Hook
 * 当工作区切换时，加载对应工作区的数据
 */
import { useEffect } from 'react';
import type { Todo, Node, Edge, ViewState } from '../../types';
import { loadWorkspaceData } from '../workspace';

interface UseWorkspaceSyncProps {
  currentWorkspaceId: string;
  setTodos: React.Dispatch<React.SetStateAction<Todo[]>>;
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
  setViewState: React.Dispatch<React.SetStateAction<ViewState>>;
  setSelectedId: React.Dispatch<React.SetStateAction<string | null>>;
  setConnectingSourceId: React.Dispatch<React.SetStateAction<string | null>>;
}

export const useWorkspaceSync = ({
  currentWorkspaceId,
  setTodos,
  setNodes,
  setEdges,
  setViewState,
  setSelectedId,
  setConnectingSourceId
}: UseWorkspaceSyncProps) => {
  useEffect(() => {
    if (!currentWorkspaceId) return;
    
    const loadData = async () => {
      const data = await loadWorkspaceData(currentWorkspaceId);
      setTodos(data.todos);
      setNodes(data.nodes);
      setEdges(data.edges);
      setViewState(data.viewState);
      setSelectedId(null);
      setConnectingSourceId(null);
    };

    loadData();
  }, [currentWorkspaceId, setTodos, setNodes, setEdges, setViewState, setSelectedId, setConnectingSourceId]);
};
