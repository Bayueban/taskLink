import { useState } from 'react';
import { Plus, Trash2, Check, Layout, Folder, FolderOpen, Edit2, X } from 'lucide-react';
import type { Todo, Node, ViewState, Workspace } from '../types';

interface TodoPanelProps {
  todos: Todo[];
  newTodoTitle: string;
  newTodoContent: string;
  selectedId: string | null;
  nodes: Node[];
  viewState: ViewState;
  workspaces: Workspace[];
  currentWorkspaceId: string;
  setNewTodoTitle: (value: string) => void;
  setNewTodoContent: (value: string) => void;
  addTodo: () => void;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
  setSelectedId: (id: string | null) => void;
  setViewState: (state: ViewState | ((prev: ViewState) => ViewState)) => void;
  createWorkspace: (title: string) => void;
  switchWorkspace: (id: string) => void;
  deleteWorkspace: (id: string) => void;
  updateWorkspaceTitle: (id: string, title: string) => void;
}

export default function TodoPanel({
  todos,
  newTodoTitle,
  newTodoContent,
  selectedId,
  nodes,
  viewState,
  workspaces,
  currentWorkspaceId,
  setNewTodoTitle,
  setNewTodoContent,
  addTodo,
  toggleTodo,
  deleteTodo,
  setSelectedId,
  setViewState,
  createWorkspace,
  switchWorkspace,
  deleteWorkspace,
  updateWorkspaceTitle,
}: TodoPanelProps) {
  const [editingWorkspaceId, setEditingWorkspaceId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [showNewWorkspaceInput, setShowNewWorkspaceInput] = useState(false);
  const [newWorkspaceTitle, setNewWorkspaceTitle] = useState('');

  const handleStartEdit = (workspace: Workspace) => {
    setEditingWorkspaceId(workspace.id);
    setEditingTitle(workspace.title);
  };

  const handleSaveEdit = (workspaceId: string) => {
    if (editingTitle.trim()) {
      updateWorkspaceTitle(workspaceId, editingTitle);
    }
    setEditingWorkspaceId(null);
    setEditingTitle('');
  };

  const handleCancelEdit = () => {
    setEditingWorkspaceId(null);
    setEditingTitle('');
  };

  const handleCreateWorkspace = () => {
    if (newWorkspaceTitle.trim()) {
      createWorkspace(newWorkspaceTitle);
      setNewWorkspaceTitle('');
      setShowNewWorkspaceInput(false);
    }
  };

  return (
    <div className="w-80 border-r border-slate-200 bg-white flex flex-col z-20 shadow-sm">
      <div className="p-6 border-b border-slate-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
            <Layout className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">关联空间</h1>
            <p className="text-xs text-slate-500 font-medium">自动保存中...</p>
          </div>
        </div>

        {/* 工作区选择器 */}
        <div className="space-y-2">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">工作区</div>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {workspaces.map(workspace => (
              <div
                key={workspace.id}
                className={`group flex items-center gap-2 p-2 rounded-lg transition-all ${
                  currentWorkspaceId === workspace.id
                    ? 'bg-indigo-50 border border-indigo-200'
                    : 'hover:bg-slate-50 border border-transparent'
                }`}
              >
                {editingWorkspaceId === workspace.id ? (
                  <div className="flex-1 flex items-center gap-2">
                    <input
                      type="text"
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      onBlur={() => handleSaveEdit(workspace.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSaveEdit(workspace.id);
                        } else if (e.key === 'Escape') {
                          handleCancelEdit();
                        }
                      }}
                      className="flex-1 px-2 py-1 text-sm border border-indigo-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      autoFocus
                    />
                    <button
                      onClick={() => handleSaveEdit(workspace.id)}
                      className="p-1 text-indigo-600 hover:bg-indigo-100 rounded"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="p-1 text-slate-400 hover:bg-slate-100 rounded"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => switchWorkspace(workspace.id)}
                      className="flex-1 flex items-center gap-2 text-left min-w-0"
                    >
                      {currentWorkspaceId === workspace.id ? (
                        <FolderOpen className="w-4 h-4 text-indigo-600 shrink-0" />
                      ) : (
                        <Folder className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                      <span className={`text-sm font-medium truncate ${
                        currentWorkspaceId === workspace.id ? 'text-indigo-900' : 'text-slate-700'
                      }`}>
                        {workspace.title}
                      </span>
                    </button>
                    <button
                      onClick={() => handleStartEdit(workspace)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-indigo-600 transition-all"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {workspaces.length > 1 && (
                      <button
                        onClick={() => deleteWorkspace(workspace.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-600 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>

          {/* 创建新工作区 */}
          {showNewWorkspaceInput ? (
            <div className="flex items-center gap-2 p-2 border border-indigo-200 rounded-lg bg-indigo-50">
              <input
                type="text"
                value={newWorkspaceTitle}
                onChange={(e) => setNewWorkspaceTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCreateWorkspace();
                  } else if (e.key === 'Escape') {
                    setShowNewWorkspaceInput(false);
                    setNewWorkspaceTitle('');
                  }
                }}
                placeholder="输入工作区名称..."
                className="flex-1 px-2 py-1 text-sm border border-indigo-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                autoFocus
              />
              <button
                onClick={handleCreateWorkspace}
                className="p-1 text-indigo-600 hover:bg-indigo-100 rounded"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setShowNewWorkspaceInput(false);
                  setNewWorkspaceTitle('');
                }}
                className="p-1 text-slate-400 hover:bg-slate-100 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowNewWorkspaceInput(true)}
              className="w-full flex items-center justify-center gap-2 p-2 text-sm text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all border border-dashed border-slate-300 hover:border-indigo-300"
            >
              <Plus className="w-4 h-4" />
              新建工作区
            </button>
          )}
        </div>
      </div>
      
      <div className="p-4 flex flex-col gap-3">
        <div className="space-y-2">
          <input 
            type="text" 
            value={newTodoTitle}
            onChange={(e) => setNewTodoTitle(e.target.value)}
            placeholder="添加新任务..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 font-medium"
          />
          <textarea 
            value={newTodoContent}
            onChange={(e) => setNewTodoContent(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && e.ctrlKey && addTodo()}
            placeholder="描述 (可选)"
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 resize-none h-20"
          />
        </div>
        <button 
          onClick={addTodo}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg text-sm font-semibold transition-all shadow-md shadow-indigo-200 hover:shadow-lg hover:shadow-indigo-300 flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" /> 
          添加任务
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
        {todos.map(todo => (
          <div 
            key={todo.id} 
            onClick={() => {
              const node = nodes.find(n => n.id === todo.id);
              if (node) {
                 setSelectedId(node.id);
                 const w = window.innerWidth * 0.75; 
                 const h = window.innerHeight;
                 setViewState({
                   x: -node.x * viewState.scale + w/2 - (node.width*viewState.scale)/2,
                   y: -node.y * viewState.scale + h/2 - (node.height*viewState.scale)/2,
                   scale: viewState.scale
                 });
              }
            }}
            className={`group relative p-4 rounded-xl border transition-all cursor-pointer ${
              selectedId === todo.id 
                ? 'bg-indigo-50/50 border-indigo-200 shadow-sm' 
                : 'bg-white border-slate-100 hover:border-slate-300 hover:shadow-sm'
            } ${todo.completed ? 'opacity-60 grayscale-[0.5]' : ''}`}
          >
            <div className="flex items-start gap-3">
              <button 
                onClick={(e) => { e.stopPropagation(); toggleTodo(todo.id); }}
                className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-all shrink-0 ${
                  todo.completed 
                    ? 'bg-indigo-500 border-indigo-500 text-white' 
                    : 'border-slate-300 text-transparent hover:border-indigo-400'
                }`}
              >
                <Check className="w-3.5 h-3.5" />
              </button>
              <div className="flex-1 min-w-0">
                <h3 className={`text-sm font-semibold leading-tight ${todo.completed ? 'line-through text-slate-500' : 'text-slate-800'}`}>
                  {todo.title}
                </h3>
                {todo.content && (
                  <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                    {todo.content}
                  </p>
                )}
              </div>
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); deleteTodo(todo.id); }}
              className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-all p-1 hover:bg-red-50 rounded"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

