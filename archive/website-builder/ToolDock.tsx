import { Plus, Layers, Sparkles, MousePointer2, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import RippleEffect from '../ui/RippleEffect';

interface ToolDockProps {
    onAddSection: () => void;
    editMode: boolean;
    onToggleEditMode: () => void;
}

export default function ToolDock({
    onAddSection,
    editMode,
    onToggleEditMode,
}: ToolDockProps) {
    return (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50">
            <div className="glass-panel rounded-full p-2 flex items-center space-x-2">
                {/* Edit / Preview Toggle */}
                <RippleEffect
                    onClick={onToggleEditMode}
                    className={`
            p-3 rounded-full transition-all duration-300
            ${editMode
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                            : 'hover:bg-white/10 text-slate-400 hover:text-white'
                        }
          `}
                    title={editMode ? "Editing Mode" : "Preview Mode"}
                >
                    {editMode ? <MousePointer2 className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </RippleEffect>

                <div className="w-px h-8 bg-white/10 mx-2" />

                {/* Add Section (Primary) */}
                <RippleEffect
                    onClick={onAddSection}
                    className="
            flex items-center space-x-2 px-6 py-3
            bg-slate-100 text-slate-900 hover:bg-white
            rounded-full font-semibold transition-all duration-300
            shadow-lg hover:shadow-xl hover:scale-105
          "
                >
                    <Plus className="w-5 h-5" />
                    <span>Add Section</span>
                </RippleEffect>

                <div className="w-px h-8 bg-white/10 mx-2" />

                {/* AI Assistant (Future) */}
                <RippleEffect
                    className="p-3 rounded-full hover:bg-white/10 text-slate-400 hover:text-purple-400 transition-colors"
                    title="AI Assistant"
                >
                    <Sparkles className="w-5 h-5" />
                </RippleEffect>

                {/* Layers (Future) */}
                <RippleEffect
                    className="p-3 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                    title="Layers"
                >
                    <Layers className="w-5 h-5" />
                </RippleEffect>
            </div>
        </div>
    );
}
