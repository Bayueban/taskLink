// --- Types ---
export type Workspace = {
  id: string;
  title: string;
  createdAt: number;
};

export type Todo = {
  id: string;
  workspaceId: string;
  title: string;
  content: string;
  completed: boolean;
};

export type NodeType = 'text' | 'image';

export type Node = {
  id: string;
  workspaceId: string;
  type: NodeType;
  x: number;
  y: number;
  title?: string;
  content: string;
  width: number;
  height: number;
  color?: string;
};

export type Edge = {
  id: string;
  workspaceId: string;
  from: string;
  to: string;
};

export type ViewState = {
  x: number;
  y: number;
  scale: number;
};

