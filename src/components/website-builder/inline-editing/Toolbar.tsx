import { Eye, Edit3, Undo, Redo, Plus, Loader2, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import RippleEffect from '../../ui/RippleEffect';
import { animations, effects } from '../../../lib/designTokens';

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
  const [isScrolled, setIsScrolled] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  // Track scroll for elevated shadow effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Show save success animation
  useEffect(() => {
    if (!saving && showSaveSuccess === false) {
      setShowSaveSuccess(true);
      const timer = setTimeout(() => setShowSaveSuccess(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [saving]);

  return (
    <motion.div
      className="sticky top-0 z-50 backdrop-blur-xl bg-slate-900/80 border-b border-white/10"
      style={{
        boxShadow: isScrolled ? effects.shadows.lift : effects.shadows.md,
      }}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={animations.springs.smooth}
    >
      <div className="flex items-center justify-between max-w-screen-2xl mx-auto px-6 py-3">
        {/* Left: Edit/Preview Toggle */}
        <div className="flex items-center space-x-4">
          <RippleEffect
            onClick={onToggleEditMode}
            className={`
              relative flex items-center space-x-2 px-5 py-2.5 rounded-xl font-semibold
              transition-all duration-300
              ${
                editMode
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30'
                  : 'bg-slate-800/50 text-slate-300 border border-slate-700/50 hover:border-slate-600'
              }
            `}
          >
            <AnimatePresence mode="wait">
              {editMode ? (
                <motion.div
                  key="edit"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center space-x-2"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Edit Mode</span>
                </motion.div>
              ) : (
                <motion.div
                  key="preview"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center space-x-2"
                >
                  <Eye className="w-4 h-4" />
                  <span>Preview Mode</span>
                </motion.div>
              )}
            </AnimatePresence>
          </RippleEffect>

          <div className="h-6 w-px bg-slate-700/50" />

          {/* Undo/Redo with Ripple */}
          <div className="flex items-center space-x-2">
            <motion.div whileHover={{ scale: canUndo ? 1.1 : 1 }} whileTap={{ scale: canUndo ? 0.9 : 1 }}>
              <RippleEffect
                onClick={onUndo}
                disabled={!canUndo}
                className={`
                  p-2.5 rounded-lg transition-all duration-200
                  ${
                    canUndo
                      ? 'hover:bg-slate-800/80 text-slate-300 hover:text-white'
                      : 'opacity-30 cursor-not-allowed text-slate-500'
                  }
                `}
                color="rgba(59, 130, 246, 0.4)"
              >
                <Undo className="w-5 h-5" />
              </RippleEffect>
            </motion.div>
            <motion.div whileHover={{ scale: canRedo ? 1.1 : 1 }} whileTap={{ scale: canRedo ? 0.9 : 1 }}>
              <RippleEffect
                onClick={onRedo}
                disabled={!canRedo}
                className={`
                  p-2.5 rounded-lg transition-all duration-200
                  ${
                    canRedo
                      ? 'hover:bg-slate-800/80 text-slate-300 hover:text-white'
                      : 'opacity-30 cursor-not-allowed text-slate-500'
                  }
                `}
                color="rgba(59, 130, 246, 0.4)"
              >
                <Redo className="w-5 h-5" />
              </RippleEffect>
            </motion.div>
          </div>
        </div>

        {/* Center: Animated Save Status */}
        <div className="flex items-center">
          <AnimatePresence mode="wait">
            {saving ? (
              <motion.div
                key="saving"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={animations.springs.bouncy}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-blue-500/10 border border-blue-500/20"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  <Loader2 className="w-4 h-4 text-blue-400" />
                </motion.div>
                <span className="text-sm font-semibold text-blue-400">Saving...</span>
              </motion.div>
            ) : (
              <motion.div
                key="saved"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={animations.springs.bouncy}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-green-500/10 border border-green-500/20"
              >
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                >
                  <Check className="w-4 h-4 text-green-400" />
                </motion.div>
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-sm font-semibold text-green-400"
                >
                  Saved
                </motion.span>
                {showSaveSuccess && (
                  <motion.div
                    className="absolute inset-0 bg-green-400/20 rounded-lg"
                    initial={{ scale: 1, opacity: 1 }}
                    animate={{ scale: 1.5, opacity: 0 }}
                    transition={{ duration: 0.6 }}
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right: Add Section Button with Gradient */}
        <div className="flex items-center space-x-3">
          {onAddSection && editMode && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={animations.springs.bouncy}
            >
              <RippleEffect
                onClick={onAddSection}
                className="
                  relative flex items-center space-x-2 px-5 py-2.5
                  bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600
                  text-white rounded-xl font-semibold
                  shadow-lg shadow-purple-500/30
                  hover:shadow-xl hover:shadow-purple-500/40
                  transition-all duration-300
                  overflow-hidden
                "
                color="rgba(255, 255, 255, 0.3)"
              >
                {/* Shimmer effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  initial={{ x: '-100%' }}
                  animate={{ x: '200%' }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                />
                <Plus className="w-4 h-4 relative z-10" />
                <span className="relative z-10">Add Section</span>
              </RippleEffect>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
