/**
 * Node 相关的 Actions
 */
import type { Todo, Node, Edge } from '../../types';
import { deleteNodeById, updateNodeTitleById, updateNodeContentById, updateNodeColorById, resetNodeSize as resetNodeSizeTool } from '../node';

interface NodeActions {
  deleteNode: (
    id: string,
    nodes: Node[],
    edges: Edge[],
    todos: Todo[],
    setNodes: React.Dispatch<React.SetStateAction<Node[]>>,
    setEdges: React.Dispatch<React.SetStateAction<Edge[]>>,
    setTodos: React.Dispatch<React.SetStateAction<Todo[]>>,
    setSelectedId: React.Dispatch<React.SetStateAction<string | null>>,
    setConnectingSourceId: React.Dispatch<React.SetStateAction<string | null>>
  ) => void;
  updateNodeTitle: (
    id: string,
    newTitle: string,
    nodes: Node[],
    todos: Todo[],
    setNodes: React.Dispatch<React.SetStateAction<Node[]>>,
    setTodos: React.Dispatch<React.SetStateAction<Todo[]>>
  ) => void;
  updateNodeContent: (
    id: string,
    newContent: string,
    nodes: Node[],
    todos: Todo[],
    setNodes: React.Dispatch<React.SetStateAction<Node[]>>,
    setTodos: React.Dispatch<React.SetStateAction<Todo[]>>
  ) => void;
  updateNodeColor: (
    id: string,
    newColor: string,
    nodes: Node[],
    setNodes: React.Dispatch<React.SetStateAction<Node[]>>
  ) => void;
  resetNodeSize: (
    nodeId: string,
    nodes: Node[],
    setNodes: React.Dispatch<React.SetStateAction<Node[]>>
  ) => void;
}

export const nodeActions: NodeActions = {
  deleteNode: (id, nodes, edges, todos, setNodes, setEdges, setTodos, setSelectedId, setConnectingSourceId) => {
    const { nodes: newNodes, edges: newEdges, todos: newTodos } = deleteNodeById(nodes, edges, todos, id);
    setNodes(newNodes);
    setEdges(newEdges);
    setTodos(newTodos);
    if (id) {
      setSelectedId(null);
      setConnectingSourceId(null);
    }
  },

  updateNodeTitle: (id, newTitle, nodes, todos, setNodes, setTodos) => {
    const { nodes: newNodes, todos: newTodos } = updateNodeTitleById(nodes, todos, id, newTitle);
    setNodes(newNodes);
    setTodos(newTodos);
  },

  updateNodeContent: (id, newContent, nodes, todos, setNodes, setTodos) => {
    const { nodes: newNodes, todos: newTodos } = updateNodeContentById(nodes, todos, id, newContent);
    setNodes(newNodes);
    setTodos(newTodos);
  },

  updateNodeColor: (id, newColor, nodes, setNodes) => {
    setNodes(updateNodeColorById(nodes, id, newColor));
  },

  resetNodeSize: (nodeId, nodes, setNodes) => {
    setNodes(resetNodeSizeTool(nodes, nodeId));
  }
};
