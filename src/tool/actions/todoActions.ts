/**
 * Todo 相关的 Actions
 */
import type { Todo, Node, Edge, ViewState } from '../../types';
import { createTodoAndNode, toggleTodoComplete, filterTodoById } from '../todo';
import { deleteNodeById } from '../node';

interface TodoActions {
  addTodo: (
    title: string,
    content: string,
    workspaceId: string,
    viewState: ViewState,
    nodesCount: number,
    todos: Todo[],
    nodes: Node[],
    setTodos: React.Dispatch<React.SetStateAction<Todo[]>>,
    setNodes: React.Dispatch<React.SetStateAction<Node[]>>,
    setNewTodoTitle: React.Dispatch<React.SetStateAction<string>>,
    setNewTodoContent: React.Dispatch<React.SetStateAction<string>>
  ) => void;
  toggleTodo: (id: string, todos: Todo[], setTodos: React.Dispatch<React.SetStateAction<Todo[]>>) => void;
  deleteTodo: (
    id: string,
    todos: Todo[],
    nodes: Node[],
    edges: Edge[],
    setTodos: React.Dispatch<React.SetStateAction<Todo[]>>,
    setNodes: React.Dispatch<React.SetStateAction<Node[]>>,
    setEdges: React.Dispatch<React.SetStateAction<Edge[]>>,
    setSelectedId: React.Dispatch<React.SetStateAction<string | null>>,
    setConnectingSourceId: React.Dispatch<React.SetStateAction<string | null>>
  ) => void;
}

export const todoActions: TodoActions = {
  addTodo: (title, content, workspaceId, viewState, nodesCount, todos, _nodes, setTodos, setNodes, setNewTodoTitle, setNewTodoContent) => {
    if (!title.trim()) return;
    const { todo, node } = createTodoAndNode(title, content, workspaceId, viewState, nodesCount);
    setTodos([...todos, todo]);
    setNodes(prev => [...prev, node]);
    setNewTodoTitle('');
    setNewTodoContent('');
  },

  toggleTodo: (id, todos, setTodos) => {
    setTodos(toggleTodoComplete(todos, id));
  },

  deleteTodo: (id, todos, nodes, edges, setTodos, setNodes, setEdges, setSelectedId, setConnectingSourceId) => {
    setTodos(filterTodoById(todos, id));
    const { nodes: newNodes, edges: newEdges, todos: newTodos } = deleteNodeById(nodes, edges, todos, id);
    setNodes(newNodes);
    setEdges(newEdges);
    setTodos(newTodos);
    if (id) {
      setSelectedId(null);
      setConnectingSourceId(null);
    }
  }
};
