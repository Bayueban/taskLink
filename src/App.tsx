import React, { useState, useRef, useEffect } from 'react';
import type { Todo, Node, Edge, ViewState, Workspace } from './types';
import { DEFAULT_VIEW_STATE, MIN_SCALE, MAX_SCALE, MIN_WIDTH, MAX_WIDTH, MIN_HEIGHT, MAX_HEIGHT, COLORS } from './constants';
import TodoPanel from './components/TodoPanel';
import Canvas from './components/Canvas';

export default function DetectiveBoard() {
  const getStorage = <T,>(key: string, fallback: T): T => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : fallback;
    } catch (e) {
      return fallback;
    }
  };

  const generateId = () => Math.random().toString(36).substr(2, 9);

  // 初始化工作区：如果没有工作区，创建一个默认的
  const initWorkspaces = (): Workspace[] => {
    const saved = getStorage<Workspace[]>('modern_workspaces', []);
    if (saved.length === 0) {
      const defaultWorkspace: Workspace = {
        id: generateId(),
        title: '默认工作区',
        createdAt: Date.now()
      };
      return [defaultWorkspace];
    }
    return saved;
  };

  const [workspaces, setWorkspaces] = useState<Workspace[]>(initWorkspaces);
  const [currentWorkspaceId, setCurrentWorkspaceId] = useState<string>(() => {
    const saved = localStorage.getItem('modern_currentWorkspaceId');
    if (saved) return saved;
    const workspaces = initWorkspaces();
    return workspaces[0]?.id || '';
  });

  // 加载当前工作区的数据
  const loadWorkspaceData = (workspaceId: string) => {
    const allTodos = getStorage<Todo[]>('modern_todos', []);
    const allNodes = getStorage<Node[]>('modern_nodes', []);
    const allEdges = getStorage<Edge[]>('modern_edges', []);
    const allViewStates = getStorage<Record<string, ViewState>>('modern_viewStates', {});

    return {
      todos: allTodos.filter(t => t.workspaceId === workspaceId),
      nodes: allNodes.filter(n => n.workspaceId === workspaceId),
      edges: allEdges.filter(e => e.workspaceId === workspaceId),
      viewState: allViewStates[workspaceId] || DEFAULT_VIEW_STATE
    };
  };

  const workspaceData = loadWorkspaceData(currentWorkspaceId);
  const [todos, setTodos] = useState<Todo[]>(workspaceData.todos);
  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [newTodoContent, setNewTodoContent] = useState('');
  const [nodes, setNodes] = useState<Node[]>(workspaceData.nodes);
  const [edges, setEdges] = useState<Edge[]>(workspaceData.edges);
  const [viewState, setViewState] = useState<ViewState>(workspaceData.viewState);
  
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [connectingSourceId, setConnectingSourceId] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

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

  // --- Global Event Listeners ---
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      const { nodes, edges, viewState } = stateRef.current;

      const internalScreenToWorld = (sx: number, sy: number) => {
        return {
          x: (sx - viewState.x) / viewState.scale,
          y: (sy - viewState.y) / viewState.scale
        };
      };

      if (connectingSourceId) {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (rect) {
          const x = (e.clientX - rect.left - viewState.x) / viewState.scale;
          const y = (e.clientY - rect.top - viewState.y) / viewState.scale;
          setMousePos({ x, y });
        }
      }

      if (isDraggingCanvas.current) {
        const dx = e.clientX - dragStartPos.current.x;
        const dy = e.clientY - dragStartPos.current.y;
        setViewState(prev => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
        dragStartPos.current = { x: e.clientX, y: e.clientY };
      }

      if (isResizingNode.current) {
        const { id, startX, startY, startWidth, startHeight } = isResizingNode.current;
        const dx = (e.clientX - startX) / viewState.scale;
        const dy = (e.clientY - startY) / viewState.scale;
        const newWidth = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, startWidth + dx));
        const newHeight = Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, startHeight + dy));
        setNodes(prev => prev.map(n => n.id === id ? { ...n, width: newWidth, height: newHeight } : n));
        return;
      }

      if (isDraggingNode.current) {
        const nodeId = isDraggingNode.current;
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;

        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const worldMouse = internalScreenToWorld(mouseX, mouseY);

        const newX = worldMouse.x - dragNodeOffset.current.x;
        const newY = worldMouse.y - dragNodeOffset.current.y;
        
        currentDragNodePos.current = { x: newX, y: newY };

        const nodeEl = document.getElementById(`node-${nodeId}`);
        if (nodeEl) {
          nodeEl.style.transform = `translate(${newX}px, ${newY}px)`;
        }

        const connectedEdges = edges.filter(ed => ed.from === nodeId || ed.to === nodeId);
        const currentNode = nodes.find(n => n.id === nodeId);
        
        if (currentNode) {
          connectedEdges.forEach(edge => {
            const edgeEl = document.getElementById(`edge-${edge.id}`);
            const edgeHitEl = document.getElementById(`edge-hit-${edge.id}`);
            
            if (edgeEl) {
               let startX, startY, endX, endY;

               if (edge.from === nodeId) {
                 startX = newX + currentNode.width / 2;
                 startY = newY + currentNode.height / 2;
                 const targetNode = nodes.find(n => n.id === edge.to);
                 if (targetNode) {
                   endX = targetNode.x + targetNode.width / 2;
                   endY = targetNode.y + targetNode.height / 2;
                 } else { return; }
               } else {
                 endX = newX + currentNode.width / 2;
                 endY = newY + currentNode.height / 2;
                 const sourceNode = nodes.find(n => n.id === edge.from);
                 if (sourceNode) {
                   startX = sourceNode.x + sourceNode.width / 2;
                   startY = sourceNode.y + sourceNode.height / 2;
                 } else { return; }
               }

               const newPath = `M ${startX} ${startY} L ${endX} ${endY}`;
               edgeEl.setAttribute('d', newPath);
               if (edgeHitEl) edgeHitEl.setAttribute('d', newPath);
            }
          });
        }
      }
    };

    const handleGlobalMouseUp = () => {
      isDraggingCanvas.current = false;
      
      if (isDraggingNode.current) {
        const nodeId = isDraggingNode.current;
        const finalPos = currentDragNodePos.current;
        
        setNodes(prev => prev.map(n => {
          if (n.id === nodeId) {
            return { ...n, x: finalPos.x, y: finalPos.y };
          }
          return n;
        }));
        
        isDraggingNode.current = null;
      }
      
      isResizingNode.current = null;
    };

    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('mouseup', handleGlobalMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [connectingSourceId]); 

  // --- 工作区切换时同步数据 ---
  useEffect(() => {
    if (!currentWorkspaceId) return;
    const data = loadWorkspaceData(currentWorkspaceId);
    setTodos(data.todos);
    setNodes(data.nodes);
    setEdges(data.edges);
    setViewState(data.viewState);
    setSelectedId(null);
    setConnectingSourceId(null);
  }, [currentWorkspaceId]);

  // --- Auto-Save ---
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      try {
        // 保存所有工作区的数据
        const allTodos = getStorage<Todo[]>('modern_todos', []);
        const allNodes = getStorage<Node[]>('modern_nodes', []);
        const allEdges = getStorage<Edge[]>('modern_edges', []);
        const allViewStates = getStorage<Record<string, ViewState>>('modern_viewStates', {});

        // 更新当前工作区的数据
        const otherTodos = allTodos.filter(t => t.workspaceId !== currentWorkspaceId);
        const otherNodes = allNodes.filter(n => n.workspaceId !== currentWorkspaceId);
        const otherEdges = allEdges.filter(e => e.workspaceId !== currentWorkspaceId);

        localStorage.setItem('modern_todos', JSON.stringify([...otherTodos, ...todos]));
        localStorage.setItem('modern_nodes', JSON.stringify([...otherNodes, ...nodes]));
        localStorage.setItem('modern_edges', JSON.stringify([...otherEdges, ...edges]));
        localStorage.setItem('modern_viewStates', JSON.stringify({ ...allViewStates, [currentWorkspaceId]: viewState }));
        localStorage.setItem('modern_workspaces', JSON.stringify(workspaces));
        localStorage.setItem('modern_currentWorkspaceId', currentWorkspaceId);
      } catch (e) {}
    }, 1000);
    return () => clearTimeout(timeoutId);
  }, [todos, nodes, edges, viewState, currentWorkspaceId, workspaces]);

  // --- Helpers ---

  const screenToWorld = (sx: number, sy: number) => {
    return {
      x: (sx - viewState.x) / viewState.scale,
      y: (sy - viewState.y) / viewState.scale
    };
  };

  const getNodeCenter = (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return { x: 0, y: 0 };
    return {
      x: node.x + node.width / 2,
      y: node.y + node.height / 2
    };
  };

  // --- 工作区管理 ---
  const createWorkspace = (title: string) => {
    const newWorkspace: Workspace = {
      id: generateId(),
      title: title.trim() || '新工作区',
      createdAt: Date.now()
    };
    setWorkspaces([...workspaces, newWorkspace]);
    setCurrentWorkspaceId(newWorkspace.id);
  };

  const switchWorkspace = (workspaceId: string) => {
    setCurrentWorkspaceId(workspaceId);
  };

  const deleteWorkspace = (workspaceId: string) => {
    if (workspaces.length <= 1) {
      alert('至少需要保留一个工作区');
      return;
    }
    
    // 删除工作区的所有数据
    const allTodos = getStorage<Todo[]>('modern_todos', []);
    const allNodes = getStorage<Node[]>('modern_nodes', []);
    const allEdges = getStorage<Edge[]>('modern_edges', []);
    const allViewStates = getStorage<Record<string, ViewState>>('modern_viewStates', {});

    const filteredTodos = allTodos.filter(t => t.workspaceId !== workspaceId);
    const filteredNodes = allNodes.filter(n => n.workspaceId !== workspaceId);
    const filteredEdges = allEdges.filter(e => e.workspaceId !== workspaceId);
    const { [workspaceId]: _, ...filteredViewStates } = allViewStates;

    localStorage.setItem('modern_todos', JSON.stringify(filteredTodos));
    localStorage.setItem('modern_nodes', JSON.stringify(filteredNodes));
    localStorage.setItem('modern_edges', JSON.stringify(filteredEdges));
    localStorage.setItem('modern_viewStates', JSON.stringify(filteredViewStates));

    const newWorkspaces = workspaces.filter(w => w.id !== workspaceId);
    setWorkspaces(newWorkspaces);
    
    // 如果删除的是当前工作区，切换到第一个工作区
    if (workspaceId === currentWorkspaceId) {
      setCurrentWorkspaceId(newWorkspaces[0]?.id || '');
    }
  };

  const updateWorkspaceTitle = (workspaceId: string, newTitle: string) => {
    setWorkspaces(prev => prev.map(w => 
      w.id === workspaceId ? { ...w, title: newTitle.trim() || w.title } : w
    ));
  };

  // --- Actions ---
  const addTodo = () => {
    if (!newTodoTitle.trim()) return;
    const newId = generateId();
    const newTodoItem: Todo = { 
      id: newId,
      workspaceId: currentWorkspaceId,
      title: newTodoTitle, 
      content: newTodoContent, 
      completed: false 
    };
    setTodos([...todos, newTodoItem]);
    setNewTodoTitle('');
    setNewTodoContent('');

    // Place new nodes visible in the center of current view
    const centerX = -viewState.x / viewState.scale + (window.innerWidth * 0.75) / 2 / viewState.scale;
    const centerY = -viewState.y / viewState.scale + (window.innerHeight) / 2 / viewState.scale;
    
    const newNode: Node = {
      id: newId,
      workspaceId: currentWorkspaceId,
      type: 'text',
      x: centerX - 130 + (nodes.length * 20),
      y: centerY - 90 + (nodes.length * 20),
      title: newTodoTitle,
      content: newTodoContent,
      width: 260,
      height: 180,
      color: COLORS[0]
    };
    setNodes(prev => [...prev, newNode]);
  };

  const toggleTodo = (id: string) => {
    setTodos(todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(t => t.id !== id));
    deleteNode(id);
  };

  const deleteNode = (id: string) => {
    setNodes(prev => prev.filter(n => n.id !== id));
    setEdges(prev => prev.filter(e => e.from !== id && e.to !== id));
    setTodos(prev => prev.filter(t => t.id !== id));
    if (selectedId === id) setSelectedId(null);
    if (connectingSourceId === id) setConnectingSourceId(null);
  };

  const updateNodeTitle = (id: string, newTitle: string) => {
    setNodes(prev => prev.map(n => n.id === id ? { ...n, title: newTitle } : n));
    setTodos(prev => prev.map(t => t.id === id ? { ...t, title: newTitle } : t));
  };

  const updateNodeContent = (id: string, newContent: string) => {
    setNodes(prev => prev.map(n => n.id === id ? { ...n, content: newContent } : n));
    setTodos(prev => prev.map(t => t.id === id ? { ...t, content: newContent } : t));
  };

  const updateNodeColor = (id: string, newColor: string) => {
    setNodes(prev => prev.map(n => n.id === id ? { ...n, color: newColor } : n));
  };

  // --- Interaction Handlers (Local) ---
  const handleWheel = (e: React.WheelEvent) => {
    // 修改为 alt + 滚轮进行缩放
    if (e.altKey) {
      e.preventDefault();
      const zoomSensitivity = 0.001;
      const delta = -e.deltaY * zoomSensitivity;
      const newScale = Math.min(Math.max(MIN_SCALE, viewState.scale + delta), MAX_SCALE);
      setViewState(prev => ({ ...prev, scale: newScale }));
    } else {
      setViewState(prev => ({
        ...prev,
        x: prev.x - e.deltaX,
        y: prev.y - e.deltaY
      }));
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current || (e.target as HTMLElement).id === 'canvas-bg') {
      isDraggingCanvas.current = true;
      dragStartPos.current = { x: e.clientX, y: e.clientY };
      setSelectedId(null);
      setConnectingSourceId(null);
    }
  };

  const handleNodeMouseDown = (e: React.MouseEvent, node: Node) => {
    e.stopPropagation();
    const target = e.target as HTMLElement;
    const isInput = ['INPUT', 'TEXTAREA'].includes(target.tagName);

    if (connectingSourceId) {
      if (connectingSourceId !== node.id) {
        const existingEdge = edges.find(ed => 
          (ed.from === connectingSourceId && ed.to === node.id) ||
          (ed.from === node.id && ed.to === connectingSourceId)
        );
        if (!existingEdge) {
          setEdges([...edges, { 
            id: generateId(), 
            workspaceId: currentWorkspaceId,
            from: connectingSourceId, 
            to: node.id 
          }]);
        }
      }
      setConnectingSourceId(null);
      return;
    }

    setSelectedId(node.id);

    if (!isInput) {
      isDraggingNode.current = node.id;
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const worldMouse = screenToWorld(mouseX, mouseY);
        dragNodeOffset.current = {
          x: worldMouse.x - node.x,
          y: worldMouse.y - node.y
        };
        currentDragNodePos.current = { x: node.x, y: node.y };
      }
    }
  };

  const handleResizeMouseDown = (e: React.MouseEvent, node: Node) => {
    e.stopPropagation();
    e.preventDefault();
    isResizingNode.current = {
      id: node.id,
      startX: e.clientX,
      startY: e.clientY,
      startWidth: node.width,
      startHeight: node.height
    };
  };

  const startConnecting = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    setConnectingSourceId(nodeId);
    setMousePos(getNodeCenter(nodeId));
  };

  const resetNodeSize = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    setNodes(prev => prev.map(n => n.id === nodeId ? { ...n, width: 260, height: 180 } : n));
  };

  const handleDoubleClickCanvas = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current || (e.target as HTMLElement).id === 'canvas-bg') {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const { x, y } = screenToWorld(mouseX, mouseY);
      
      const newId = generateId();
      const newNode: Node = {
        id: newId,
        workspaceId: currentWorkspaceId,
        type: 'text',
        x: x - 130,
        y: y - 90,
        title: '新想法',
        content: '',
        width: 260,
        height: 180,
        color: COLORS[0]
      };
      
      setNodes([...nodes, newNode]);
      setTodos([...todos, { 
        id: newId, 
        workspaceId: currentWorkspaceId,
        title: newNode.title!, 
        content: newNode.content, 
        completed: false 
      }]);
      setSelectedId(newId);
    }
  };

  // --- Paste & Keys ---
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          if (!blob) continue;
          const reader = new FileReader();
          reader.onload = (event) => {
            const base64 = event.target?.result as string;
            const centerX = -viewState.x / viewState.scale + (window.innerWidth * 0.75) / 2 / viewState.scale;
            const centerY = -viewState.y / viewState.scale + (window.innerHeight) / 2 / viewState.scale;
            const newNode: Node = {
              id: generateId(),
              workspaceId: currentWorkspaceId,
              type: 'image',
              x: centerX - 100,
              y: centerY - 100,
              content: base64,
              width: 200,
              height: 200
            };
            setNodes(prev => [...prev, newNode]);
            setSelectedId(newNode.id);
          };
          reader.readAsDataURL(blob);
        }
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedId && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
          deleteNode(selectedId);
        }
      }
      if (e.key === 'Escape') {
        setSelectedId(null);
        setConnectingSourceId(null);
      }
      // 修改为 alt + + 或 alt + - 进行缩放
      if (e.altKey) {
        if (e.key === '=' || e.key === '+') {
          e.preventDefault();
          setViewState(prev => ({ ...prev, scale: Math.min(prev.scale + 0.1, MAX_SCALE) }));
        } else if (e.key === '-') {
          e.preventDefault();
          setViewState(prev => ({ ...prev, scale: Math.max(prev.scale - 0.1, MIN_SCALE) }));
        } else if (e.key === '0') {
           e.preventDefault();
           setViewState(prev => ({ ...prev, scale: 1 }));
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('paste', handlePaste);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [viewState, selectedId, connectingSourceId]);

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
        setViewState={setViewState}
        handleWheel={handleWheel}
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
