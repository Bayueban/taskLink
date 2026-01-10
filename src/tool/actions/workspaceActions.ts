/**
 * 工作区相关的 Actions
 */
import type { Workspace } from '../../types';
import { createWorkspace as createWorkspaceTool, deleteWorkspaceData } from '../workspace';

interface WorkspaceActions {
  createWorkspace: (
    title: string,
    workspaces: Workspace[],
    setWorkspaces: React.Dispatch<React.SetStateAction<Workspace[]>>,
    setCurrentWorkspaceId: React.Dispatch<React.SetStateAction<string>>
  ) => void;
  switchWorkspace: (
    workspaceId: string,
    setCurrentWorkspaceId: React.Dispatch<React.SetStateAction<string>>
  ) => void;
  deleteWorkspace: (
    workspaceId: string,
    currentWorkspaceId: string,
    workspaces: Workspace[],
    setWorkspaces: React.Dispatch<React.SetStateAction<Workspace[]>>,
    setCurrentWorkspaceId: React.Dispatch<React.SetStateAction<string>>
  ) => void;
  updateWorkspaceTitle: (
    workspaceId: string,
    newTitle: string,
    workspaces: Workspace[],
    setWorkspaces: React.Dispatch<React.SetStateAction<Workspace[]>>
  ) => void;
}

export const workspaceActions: WorkspaceActions = {
  createWorkspace: (title, workspaces, setWorkspaces, setCurrentWorkspaceId) => {
    const newWorkspace = createWorkspaceTool(title);
    setWorkspaces([...workspaces, newWorkspace]);
    setCurrentWorkspaceId(newWorkspace.id);
  },

  switchWorkspace: (workspaceId, setCurrentWorkspaceId) => {
    setCurrentWorkspaceId(workspaceId);
  },

  deleteWorkspace: (workspaceId, currentWorkspaceId, workspaces, setWorkspaces, setCurrentWorkspaceId) => {
    if (workspaces.length <= 1) {
      alert('至少需要保留一个工作区');
      return;
    }
    
    deleteWorkspaceData(workspaceId);
    const newWorkspaces = workspaces.filter(w => w.id !== workspaceId);
    setWorkspaces(newWorkspaces);
    
    // 如果删除的是当前工作区，切换到第一个工作区
    if (workspaceId === currentWorkspaceId) {
      setCurrentWorkspaceId(newWorkspaces[0]?.id || '');
    }
  },

  updateWorkspaceTitle: (workspaceId, newTitle, workspaces, setWorkspaces) => {
    setWorkspaces(prev => prev.map(w => 
      w.id === workspaceId ? { ...w, title: newTitle.trim() || w.title } : w
    ));
  }
};
