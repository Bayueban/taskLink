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
  createdAt: string; // 格式：YY-MM-DD HH:mm
  completedAt?: string; // 格式：YY-MM-DD HH:mm，可选
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

export type EdgeStyle = 'solid' | 'dashed' | 'dotted';

export type Edge = {
  id: string;
  workspaceId: string;
  from: string;
  to: string;
  color?: string;
  style?: EdgeStyle;
  label?: string;
  direction?: 'forward' | 'backward'; // 用于区分双向线段
};

export type ViewState = {
  x: number;
  y: number;
  scale: number;
};

