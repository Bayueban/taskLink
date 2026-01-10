import React, { useState, useRef, useEffect } from 'react';
import type { Todo, Node, Edge, ViewState, Workspace } from './types';
import TodoPanel from './components/TodoPanel';
import Canvas from './components/Canvas';
import { initWorkspaces, loadWorkspaceData, getCurrentWorkspaceId } from './tool/workspace';
import { getNodeCenterById } from './tool/interaction';
import { useGlobalMouseEvents } from './tool/hooks/useGlobalMouseEvents';
import { useWorkspaceSync } from './tool/hooks/useWorkspaceSync';
import { useAutoSave } from './tool/hooks/useAutoSave';
import { useKeyboardAndPaste } from './tool/hooks/useKeyboardAndPaste';
import { todoActions } from './tool/actions/todoActions';
import { nodeActions } from './tool/actions/nodeActions';
import { workspaceActions } from './tool/actions/workspaceActions';
import { mouseHandlers } from './tool/handlers/mouseHandlers';
import { canvasHandlers } from './tool/handlers/canvasHandlers';
import { initDatabase } from './tool/db';
import { DEFAULT_VIEW_STATE } from './constants';

export default function DetectiveBoard() {
  const [isLoading, setIsLoading] = useState(true);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspaceId, setCurrentWorkspaceId] = useState<string>('');
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [newTodoContent, setNewTodoContent] = useState('');
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [viewState, setViewState] = useState<ViewState>(DEFAULT_VIEW_STATE);

  // 初始化数据库和加载数据
  useEffect(() => {
    const initApp = async () => {
      try {
        // 初始化数据库并执行迁移
        await initDatabase();

        // 初始化工作区
        const initialWorkspaces = await initWorkspaces();
        setWorkspaces(initialWorkspaces);

        // 获取当前工作区 ID
        const workspaceId = await getCurrentWorkspaceId(initialWorkspaces);
        setCurrentWorkspaceId(workspaceId);

        // 加载工作区数据
        const workspaceData = await loadWorkspaceData(workspaceId);
        setTodos(workspaceData.todos);
        setNodes(workspaceData.nodes);
        setEdges(workspaceData.edges);
        setViewState(workspaceData.viewState);

        setIsLoading(false);
      } catch (error) {
        console.error('Failed to initialize app:', error);
        setIsLoading(false);
      }
    };

    initApp();
  }, []);
  
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [connectingSourceId, setConnectingSourceId] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isDraggingNodeState, setIsDraggingNodeState] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);
  const isDraggingCanvas = useRef(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  
  const isDraggingNode = useRef<string | null>(null);
  const dragNodeOffset = useRef({ x: 0, y: 0 });
  const currentDragNodePos = useRef({ x: 0, y: 0 });
  
  const isResizingNode = useRef<{ id: string, startX: number, startY: number, startWidth: number, startHeight: number } | null>(null);

  const stateRef = useRef({ nodes, edges, viewState });
  useEffect(() => {
    stateRef.current = { nodes, edges, viewState };
  }, [nodes, edges, viewState]);

  // --- Hooks ---
  useGlobalMouseEvents({
    canvasRef,
    connectingSourceId,
    viewState,
    isDraggingCanvas,
    dragStartPos,
    isDraggingNode,
    isDraggingNodeState,
    dragNodeOffset,
    currentDragNodePos,
    isResizingNode,
    stateRef,
    setMousePos,
    setViewState,
    setNodes,
    setIsDraggingNodeState
  });

  useWorkspaceSync({
    currentWorkspaceId,
    setTodos,
    setNodes,
    setEdges,
    setViewState,
    setSelectedId,
    setConnectingSourceId
  });

  useAutoSave({
    currentWorkspaceId,
    todos,
    nodes,
    edges,
    viewState,
    workspaces
  });

  useKeyboardAndPaste({
    viewState,
    selectedId,
    connectingSourceId,
    currentWorkspaceId,
    onNodeCreated: (newNode) => setNodes(prev => [...prev, newNode]),
    onSelect: setSelectedId,
    onDelete: (id) => nodeActions.deleteNode(id, nodes, edges, todos, setNodes, setEdges, setTodos, setSelectedId, setConnectingSourceId),
    onDeselect: () => setSelectedId(null),
    onCancelConnect: () => setConnectingSourceId(null),
    onViewStateChange: setViewState
  });

  // --- Helpers ---
  const getNodeCenter = (nodeId: string) => getNodeCenterById(nodes, nodeId);

  // --- 工作区管理 Actions ---
  const createWorkspace = (title: string) => {
    workspaceActions.createWorkspace(title, workspaces, setWorkspaces, setCurrentWorkspaceId);
  };

  const switchWorkspace = (workspaceId: string) => {
    workspaceActions.switchWorkspace(workspaceId, setCurrentWorkspaceId);
  };

  const deleteWorkspace = (workspaceId: string) => {
    workspaceActions.deleteWorkspace(workspaceId, currentWorkspaceId, workspaces, setWorkspaces, setCurrentWorkspaceId);
  };

  const updateWorkspaceTitle = (workspaceId: string, newTitle: string) => {
    workspaceActions.updateWorkspaceTitle(workspaceId, newTitle, workspaces, setWorkspaces);
  };

  // --- Todo Actions ---
  const addTodo = () => {
    todoActions.addTodo(
      newTodoTitle,
      newTodoContent,
      currentWorkspaceId,
      viewState,
      nodes.length,
      todos,
      nodes,
      setTodos,
      setNodes,
      setNewTodoTitle,
      setNewTodoContent
    );
  };

  const toggleTodo = (id: string) => {
    todoActions.toggleTodo(id, todos, setTodos);
  };

  const deleteTodo = (id: string) => {
    todoActions.deleteTodo(id, todos, nodes, edges, setTodos, setNodes, setEdges, setSelectedId, setConnectingSourceId);
  };

  // --- Node Actions ---
  const deleteNode = (id: string) => {
    nodeActions.deleteNode(id, nodes, edges, todos, setNodes, setEdges, setTodos, setSelectedId, setConnectingSourceId);
  };

  const updateNodeTitle = (id: string, newTitle: string) => {
    nodeActions.updateNodeTitle(id, newTitle, nodes, todos, setNodes, setTodos);
  };

  const updateNodeContent = (id: string, newContent: string) => {
    nodeActions.updateNodeContent(id, newContent, nodes, todos, setNodes, setTodos);
  };

  const updateNodeColor = (id: string, newColor: string) => {
    nodeActions.updateNodeColor(id, newColor, nodes, setNodes);
  };

  // --- Interaction Handlers ---
  const handleMouseDown = (e: React.MouseEvent) => {
    mouseHandlers.handleMouseDown(e, canvasRef, isDraggingCanvas, dragStartPos, setSelectedId, setConnectingSourceId);
  };

  const handleNodeMouseDown = (e: React.MouseEvent, node: Node) => {
    mouseHandlers.handleNodeMouseDown(
      e,
      node,
      connectingSourceId,
      edges,
      currentWorkspaceId,
      viewState,
      canvasRef,
      isDraggingNode,
      dragNodeOffset,
      currentDragNodePos,
      setEdges,
      setConnectingSourceId,
      setSelectedId
    );
  };

  const handleResizeMouseDown = (e: React.MouseEvent, node: Node) => {
    mouseHandlers.handleResizeMouseDown(e, node, isResizingNode);
  };

  const startConnecting = (e: React.MouseEvent, nodeId: string) => {
    canvasHandlers.startConnecting(e, nodeId, nodes, setConnectingSourceId, setMousePos);
  };

  const resetNodeSize = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    nodeActions.resetNodeSize(nodeId, nodes, setNodes);
  };

  const handleDoubleClickCanvas = (e: React.MouseEvent) => {
    canvasHandlers.handleDoubleClickCanvas(
      e,
      canvasRef,
      viewState,
      currentWorkspaceId,
      nodes,
      todos,
      setNodes,
      setTodos,
      setSelectedId
    );
  };

  // 显示加载状态
  if (isLoading) {
    return (
      <div className="flex h-screen w-full bg-[#f8fafc] items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-solid border-indigo-600 border-r-transparent"></div>
          <p className="mt-4 text-slate-600 font-medium">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-[#f8fafc] text-slate-800 font-sans overflow-hidden">
      {/* Global Minimalist Styles */}
      <style>{`
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        ::selection {
          background: #e0e7ff; 
          color: #3730a3;
        }
      `}</style>
      
      {/* Left Panel: Clean Todo List */}
      <TodoPanel
        todos={todos}
        newTodoTitle={newTodoTitle}
        newTodoContent={newTodoContent}
        selectedId={selectedId}
        nodes={nodes}
        viewState={viewState}
        workspaces={workspaces}
        currentWorkspaceId={currentWorkspaceId}
        setNewTodoTitle={setNewTodoTitle}
        setNewTodoContent={setNewTodoContent}
        addTodo={addTodo}
        toggleTodo={toggleTodo}
        deleteTodo={deleteTodo}
        setSelectedId={setSelectedId}
        setViewState={setViewState}
        createWorkspace={createWorkspace}
        switchWorkspace={switchWorkspace}
        deleteWorkspace={deleteWorkspace}
        updateWorkspaceTitle={updateWorkspaceTitle}
      />

      {/* Right Panel: Canvas */}
      <Canvas
        canvasRef={canvasRef}
        nodes={nodes}
        edges={edges}
        todos={todos}
        viewState={viewState}
        selectedId={selectedId}
        connectingSourceId={connectingSourceId}
        mousePos={mousePos}
        isDraggingNode={isDraggingNodeState}
        setViewState={setViewState}
        handleMouseDown={handleMouseDown}
        handleDoubleClickCanvas={handleDoubleClickCanvas}
        handleNodeMouseDown={handleNodeMouseDown}
        handleResizeMouseDown={handleResizeMouseDown}
        startConnecting={startConnecting}
        resetNodeSize={resetNodeSize}
        deleteNode={deleteNode}
        updateNodeTitle={updateNodeTitle}
        updateNodeContent={updateNodeContent}
        updateNodeColor={updateNodeColor}
        getNodeCenter={getNodeCenter}
        setEdges={setEdges}
      />
    </div>
  );
}
