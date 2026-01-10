import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Trash2, Check, Layout, Folder, FolderOpen, Edit2, X, Calendar, CheckCircle2, Download, Upload, Settings, Database } from 'lucide-react';
import type { Todo, Node, ViewState, Workspace } from '../types';
import { exportData, importData, mergeImportData, exportWorkspace } from '../tool/importExport';
import { getStorageEstimate } from '../tool/db';

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
  const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [storageInfo, setStorageInfo] = useState<{ usageInMB: number; quotaInMB: number; percentage: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // 导出所有数据
  const handleExportAll = async () => {
    try {
      await exportData();
    } catch (error) {
      alert(error instanceof Error ? error.message : '导出失败');
    }
  };

  // 导出当前工作区
  const handleExportWorkspace = async () => {
    try {
      await exportWorkspace(currentWorkspaceId);
    } catch (error) {
      alert(error instanceof Error ? error.message : '导出失败');
    }
  };

  // 导入数据（覆盖）
  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await importData(file);
    } catch (error) {
      alert(error instanceof Error ? error.message : '导入失败');
    }

    // 清空文件输入
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 合并导入数据
  const handleMergeImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await mergeImportData(file);
    } catch (error) {
      alert(error instanceof Error ? error.message : '导入失败');
    }

    // 清空文件输入
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 加载存储信息
  const loadStorageInfo = async () => {
    const info = await getStorageEstimate();
    if (info) {
      setStorageInfo({
        usageInMB: info.usageInMB,
        quotaInMB: info.quotaInMB,
        percentage: info.percentage
      });
    }
  };

  // 打开设置弹窗
  const openSettingsModal = () => {
    loadStorageInfo();
    setShowSettingsModal(true);
  };

  // 关闭设置弹窗
  const closeSettingsModal = () => {
    setShowSettingsModal(false);
  };

  return (
    <div className="w-80 border-r border-slate-200 bg-white flex flex-col z-20 shadow-sm">
      <div className="p-6 border-b border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
              <Layout className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">关联空间</h1>
              <p className="text-xs text-slate-500 font-medium">自动保存中...</p>
            </div>
          </div>
          <button
            onClick={openSettingsModal}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600 hover:text-indigo-600"
            title="设置"
          >
            <Settings className="w-5 h-5" />
          </button>
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
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value.length <= 18) {
                          setEditingTitle(value);
                        }
                      }}
                      onBlur={() => handleSaveEdit(workspace.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSaveEdit(workspace.id);
                        } else if (e.key === 'Escape') {
                          handleCancelEdit();
                        }
                      }}
                      maxLength={18}
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
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.length <= 18) {
                    setNewWorkspaceTitle(value);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCreateWorkspace();
                  } else if (e.key === 'Escape') {
                    setShowNewWorkspaceInput(false);
                    setNewWorkspaceTitle('');
                  }
                }}
                placeholder="输入工作区名称（最多18字符）..."
                maxLength={18}
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
          <textarea 
            value={newTodoTitle}
            onChange={(e) => {
              const value = e.target.value;
              if (value.length <= 50) {
                setNewTodoTitle(value);
              }
            }}
            placeholder="添加新任务（最多50字符）..."
            maxLength={50}
            rows={1}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 font-medium resize-none overflow-hidden break-words"
            style={{ 
              wordWrap: 'break-word', 
              whiteSpace: 'pre-wrap',
              minHeight: '2.5rem',
              lineHeight: '1.5rem'
            }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = target.scrollHeight + 'px';
            }}
          />
          <textarea 
            value={newTodoContent}
            onChange={(e) => {
              const value = e.target.value;
              if (value.length <= 500) {
                setNewTodoContent(value);
              }
            }}
            onKeyDown={(e) => e.key === 'Enter' && e.ctrlKey && addTodo()}
            placeholder="描述（可选，最多500字符）"
            maxLength={500}
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

      {/* Tab 切换栏 */}
      <div className="border-b border-slate-200 bg-white px-4">
        <div className="flex gap-1">
          <button
            onClick={() => setActiveTab('pending')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-all relative ${
              activeTab === 'pending'
                ? 'text-indigo-600'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>待完成</span>
            <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-indigo-100 text-indigo-700">
              {todos.filter(t => !t.completed).length}
            </span>
            {activeTab === 'pending' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-all relative ${
              activeTab === 'completed'
                ? 'text-green-600'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>已完成</span>
            <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700">
              {todos.filter(t => t.completed).length}
            </span>
            {activeTab === 'completed' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600"></div>
            )}
          </button>
        </div>
      </div>

      {/* 任务列表区域 */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'pending' ? (
          /* 待完成任务列表 */
          <div className="space-y-2.5">
            {todos.filter(todo => !todo.completed).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <Calendar className="w-12 h-12 mb-3 opacity-30" />
                <p className="text-sm">暂无待完成任务</p>
              </div>
            ) : (
              todos.filter(todo => !todo.completed).map(todo => (
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
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <button 
                      onClick={(e) => { e.stopPropagation(); toggleTodo(todo.id); }}
                      className="mt-0.5 w-5 h-5 rounded-md border border-slate-300 text-transparent hover:border-indigo-400 flex items-center justify-center transition-all shrink-0"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold leading-tight break-words text-slate-800">
                        {todo.title}
                      </h3>
                      {todo.content && (
                        <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                          {todo.content}
                        </p>
                      )}
                      <div className="flex items-center gap-1 mt-2 text-[10px] text-slate-400">
                        <Calendar className="w-3 h-3" />
                        <span>{todo.createdAt}</span>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); deleteTodo(todo.id); }}
                    className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-all p-1 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        ) : (
          /* 已完成任务列表 */
          <div className="space-y-2.5">
            {todos.filter(todo => todo.completed).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <CheckCircle2 className="w-12 h-12 mb-3 opacity-30" />
                <p className="text-sm">暂无已完成任务</p>
              </div>
            ) : (
              todos.filter(todo => todo.completed).map(todo => (
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
                  className={`group relative p-4 rounded-xl border transition-all cursor-pointer opacity-60 ${
                    selectedId === todo.id 
                      ? 'bg-green-50/50 border-green-200 shadow-sm' 
                      : 'bg-white border-slate-100 hover:border-slate-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <button 
                      onClick={(e) => { e.stopPropagation(); toggleTodo(todo.id); }}
                      className="mt-0.5 w-5 h-5 rounded-md border bg-green-500 border-green-500 text-white flex items-center justify-center transition-all shrink-0"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold leading-tight break-words line-through text-slate-500">
                        {todo.title}
                      </h3>
                      {todo.content && (
                        <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                          {todo.content}
                        </p>
                      )}
                      <div className="flex flex-col gap-1 mt-2 text-[10px] text-slate-400">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>创建: {todo.createdAt}</span>
                        </div>
                        {todo.completedAt && (
                          <div className="flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-green-600" />
                            <span>完成: {todo.completedAt}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); deleteTodo(todo.id); }}
                    className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-all p-1 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* 设置弹窗 - 使用 Portal 渲染到 body */}
      {showSettingsModal && createPortal(
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]"
          onClick={closeSettingsModal}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 弹窗头部 */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-indigo-50 to-purple-50">
              <div className="flex items-center gap-3">
                <div className="bg-indigo-600 p-2 rounded-lg text-white">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">数据管理</h2>
                  <p className="text-xs text-slate-600">导入导出与存储信息</p>
                </div>
              </div>
              <button
                onClick={closeSettingsModal}
                className="p-2 hover:bg-white/50 rounded-lg transition-colors text-slate-600 hover:text-slate-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 弹窗内容 */}
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* 存储信息 */}
              {storageInfo && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-slate-700">存储使用情况</h3>
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-slate-600">已使用</span>
                      <span className="text-sm font-bold text-slate-900">
                        {storageInfo.usageInMB} MB / {storageInfo.quotaInMB} MB
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(storageInfo.percentage, 100)}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                      使用率: {storageInfo.percentage.toFixed(2)}%
                    </p>
                  </div>
                </div>
              )}

              {/* 导出功能 */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-700">导出数据</h3>
                <div className="space-y-2">
                  <button
                    onClick={handleExportAll}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-all hover:shadow-md"
                  >
                    <Download className="w-4 h-4" />
                    导出所有数据
                  </button>
                  <button
                    onClick={handleExportWorkspace}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all hover:shadow-md"
                  >
                    <Download className="w-4 h-4" />
                    导出当前工作区
                  </button>
                </div>
              </div>

              {/* 导入功能 */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-700">导入数据</h3>
                <div className="space-y-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleImport}
                    className="hidden"
                    id="import-file"
                  />
                  <label
                    htmlFor="import-file"
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-all hover:shadow-md cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    导入数据（覆盖模式）
                  </label>
                  
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleMergeImport}
                    className="hidden"
                    id="merge-import-file"
                  />
                  <label
                    htmlFor="merge-import-file"
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg transition-all hover:shadow-md cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    导入数据（合并模式）
                  </label>
                </div>
              </div>

              {/* 提示信息 */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex gap-2">
                  <span className="text-lg">💡</span>
                  <div className="text-xs text-blue-900 space-y-1">
                    <p><strong>覆盖模式：</strong>清空现有数据，导入新数据</p>
                    <p><strong>合并模式：</strong>保留现有数据，新增导入的数据</p>
                    <p className="mt-2 text-blue-700">建议定期导出数据作为备份</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

