import { Settings, Trash2, Copy, ArrowUp, ArrowDown, Sparkles, Shuffle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SectionToolbarProps {
    onSettings?: () => void;
    onDelete?: () => void;
    onDuplicate?: () => void;
    onMoveUp?: () => void;
    onMoveDown?: () => void;
    onRegenerate?: () => void;
    onRemix?: () => void;
    canMoveUp?: boolean;
    canMoveDown?: boolean;
    isRegenerating?: boolean;
    show: boolean;
}

export function SectionToolbar({
    onSettings,
    onDelete,
    onDuplicate,
    onMoveUp,
    onMoveDown,
    onRegenerate,
    onRemix,
    canMoveUp = true,
    canMoveDown = true,
    isRegenerating = false,
    show,
}: SectionToolbarProps) {
    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="absolute top-4 right-4 z-30 flex items-center gap-1 bg-white/90 backdrop-blur-xl border border-white/20 rounded-full shadow-2xl shadow-slate-200/50 p-1.5 ring-1 ring-slate-900/5"
                >
                    {/* Magic Remix */}
                    {onRemix && (
                        <button
                            onClick={onRemix}
                            className="p-2 text-indigo-500 hover:text-indigo-400 hover:bg-indigo-500/10 rounded transition-colors"
                            title="Magic Remix (Change Layout)"
                        >
                            <Shuffle className="w-4 h-4" />
                        </button>
                    )}

                    {/* Regenerate with AI */}
                    {onRegenerate && (
                        <button
                            onClick={onRegenerate}
                            disabled={isRegenerating}
                            className={`p-2 rounded transition-colors ${isRegenerating
                                ? 'text-purple-400/50 cursor-wait'
                                : 'text-purple-400 hover:text-purple-300 hover:bg-purple-500/10'}`}
                            title="Regenerate Content"
                        >
                            <Sparkles className={`w-4 h-4 ${isRegenerating ? 'animate-spin' : ''}`} />
                        </button>
                    )}

                    {/* Move Up */}
                    {onMoveUp && (
                        <button
                            onClick={onMoveUp}
                            disabled={!canMoveUp}
                            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Move Up"
                        >
                            <ArrowUp className="w-4 h-4" />
                        </button>
                    )}

                    {/* Move Down */}
                    {onMoveDown && (
                        <button
                            onClick={onMoveDown}
                            disabled={!canMoveDown}
                            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Move Down"
                        >
                            <ArrowDown className="w-4 h-4" />
                        </button>
                    )}

                    {/* Duplicate */}
                    {onDuplicate && (
                        <button
                            onClick={onDuplicate}
                            className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded transition-colors"
                            title="Duplicate Section"
                        >
                            <Copy className="w-4 h-4" />
                        </button>
                    )}

                    {/* Settings */}
                    {onSettings && (
                        <button
                            onClick={onSettings}
                            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors"
                            title="Section Settings"
                        >
                            <Settings className="w-4 h-4" />
                        </button>
                    )}

                    {/* Divider */}
                    {onDelete && (
                        <div className="w-px h-4 bg-slate-200 mx-1" />
                    )}

                    {/* Delete */}
                    {onDelete && (
                        <button
                            onClick={onDelete}
                            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors"
                            title="Delete Section"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
}
