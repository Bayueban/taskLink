import React from 'react';
import { X } from 'lucide-react';
import type { Edge, EdgeStyle } from '../types';
import { EDGE_COLORS } from '../constants';

interface EdgeToolbarProps {
  edge: Edge;
  position: { x: number; y: number };
  onClose: () => void;
  onUpdate: (updates: Partial<Edge>) => void;
  onDelete: () => void;
}

const EDGE_STYLES: { value: EdgeStyle; label: string }[] = [
  { value: 'solid', label: '直线' },
  { value: 'dashed', label: '虚线' },
  { value: 'dotted', label: '点线' },
];

export default function EdgeToolbar({
  edge,
  position,
  onClose,
  onUpdate,
  onDelete,
}: EdgeToolbarProps) {
  return (
    <div
      className="edge-toolbar absolute bg-white/95 backdrop-blur border border-slate-200 rounded-xl shadow-xl p-3 z-50 w-[200px]"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translate(-50%, -100%) translateY(-8px)',
      }}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      {/* 关闭按钮 */}
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-xs font-semibold text-slate-700">线段设置</h3>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 transition-colors p-0.5"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 文本标记 */}
      <div className="mb-2.5">
        <label className="block text-xs font-medium text-slate-600 mb-1">
          文本标记 <span className="text-slate-400 font-normal">(最多18字符)</span>
        </label>
        <input
          type="text"
          value={edge.label || ''}
          onChange={(e) => {
            const value = e.target.value;
            if (value.length <= 18) {
              onUpdate({ label: value });
            }
          }}
          placeholder="输入标记..."
          maxLength={18}
          className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      {/* 线段颜色 */}
      <div className="mb-2.5">
        <label className="block text-xs font-medium text-slate-600 mb-1">
          颜色
        </label>
        <div className="grid grid-cols-5 gap-1.5">
          {EDGE_COLORS.map((color) => {
            const isSelected = (edge.color || '#64748b') === color;
            return (
              <button
                key={color}
                onClick={() => onUpdate({ color })}
                className={`w-6 h-6 rounded transition-all hover:scale-110 border-2 ${
                  isSelected
                    ? 'ring-2 ring-indigo-500 ring-offset-1 scale-110 border-slate-400'
                    : 'border-slate-300 hover:border-slate-400'
                }`}
                style={{ backgroundColor: color }}
              />
            );
          })}
        </div>
        <input
          type="color"
          value={edge.color || '#64748b'}
          onChange={(e) => onUpdate({ color: e.target.value })}
          className="mt-1.5 w-full h-6 rounded cursor-pointer"
        />
      </div>

      {/* 线段样式 */}
      <div className="mb-2.5">
        <label className="block text-xs font-medium text-slate-600 mb-1">
          样式
        </label>
        <div className="flex gap-1.5">
          {EDGE_STYLES.map((styleOption) => {
            const isSelected = (edge.style || 'solid') === styleOption.value;
            return (
              <button
                key={styleOption.value}
                onClick={() => onUpdate({ style: styleOption.value })}
                className={`flex-1 px-2 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  isSelected
                    ? 'bg-indigo-500 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {styleOption.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 删除按钮 */}
      <button
        onClick={() => {
          onDelete();
          onClose();
        }}
        className="w-full px-2 py-1.5 text-xs text-red-500 bg-red-50 hover:bg-red-100 rounded-lg transition-colors font-medium"
      >
        删除
      </button>
    </div>
  );
}
