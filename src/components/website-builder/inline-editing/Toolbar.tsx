import { Eye, Edit3, Undo, Redo, Plus, Loader2, Check } from 'lucide-react';

interface ToolbarProps {
  editMode: boolean;
  onToggleEditMode: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  saving: boolean;
  onAddSection?: () => void;
}

export default function Toolbar({
  editMode,
  onToggleEditMode,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  saving,
  onAddSection,
}: ToolbarProps) {
  return (
    <div className="bg-slate-900/95 backdrop-blur-sm border-b border-slate-800 px-6 py-3">
      <div className="flex items-center justify-between max-w-screen-2xl mx-auto">
        {/* Left: Edit/Preview Toggle */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onToggleEditMode}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
              editMode
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {editMode ? (
              <>
                <Edit3 className="w-4 h-4" />
                <span>Edit Mode</span>
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" />
                <span>Preview Mode</span>
              </>
            )}
          </button>

          <div className="h-6 w-px bg-slate-700" />

          {/* Undo/Redo */}
          <div className="flex items-center space-x-2">
            <button
              onClick={onUndo}
              disabled={!canUndo}
              className="p-2 rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Undo (Ctrl+Z)"
            >
              <Undo className="w-5 h-5 text-slate-400" />
            </button>
            <button
              onClick={onRedo}
              disabled={!canRedo}
              className="p-2 rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Redo (Ctrl+Y)"
            >
              <Redo className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Center: Save Status */}
        <div className="flex items-center">
          {saving ? (
            <div className="flex items-center space-x-2 text-blue-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm font-medium">Saving...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2 text-green-400">
              <Check className="w-4 h-4" />
              <span className="text-sm font-medium">Saved</span>
            </div>
          )}
        </div>

        {/* Right: Add Section Button */}
        <div className="flex items-center space-x-3">
          {onAddSection && editMode && (
            <button
              onClick={onAddSection}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-purple-500/50 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Section</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
