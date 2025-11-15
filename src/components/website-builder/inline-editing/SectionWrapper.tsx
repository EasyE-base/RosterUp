import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings,
  Copy,
  Trash2,
  GripVertical,
  Plus,
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import RippleEffect from '../../ui/RippleEffect';
import { animations, effects, motionVariants } from '../../../lib/designTokens';

interface SectionWrapperProps {
  children: React.ReactNode;
  editMode: boolean;
  sectionName: string;
  onDuplicate?: () => void;
  onDelete?: () => void;
  onSettings?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onAddBelow?: () => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  isDragging?: boolean;
  dragHandleProps?: any;
  zIndex?: number;
}

export default function SectionWrapper({
  children,
  editMode,
  sectionName,
  onDuplicate,
  onDelete,
  onSettings,
  onMoveUp,
  onMoveDown,
  onAddBelow,
  canMoveUp = true,
  canMoveDown = true,
  isDragging = false,
  dragHandleProps,
  zIndex,
}: SectionWrapperProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  const ActionButton = ({
    onClick,
    icon: Icon,
    label,
    variant = 'default',
  }: {
    onClick?: () => void;
    icon: any;
    label: string;
    variant?: 'default' | 'danger';
  }) => (
    <motion.div whileHover={{ scale: 1.1, y: -2 }} whileTap={{ scale: 0.95 }}>
      <RippleEffect
        onClick={onClick}
        className={`p-2.5 rounded-lg transition-all relative ${
          variant === 'danger'
            ? 'hover:bg-red-500/20 text-red-400 hover:text-red-300'
            : 'hover:bg-white/10 text-white/80 hover:text-white'
        }`}
        color={variant === 'danger' ? 'rgba(239, 68, 68, 0.4)' : 'rgba(255, 255, 255, 0.3)'}
      >
        <Icon className="w-4 h-4" />
      </RippleEffect>
    </motion.div>
  );

  if (!editMode) {
    return <>{children}</>;
  }

  return (
    <motion.div
      ref={sectionRef}
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setShowControls(false);
      }}
      initial={false}
      animate={{
        y: isHovered ? -8 : 0,
        scale: isHovered ? 1.01 : 1,
        boxShadow: isHovered
          ? '0 0 0 2px rgba(59, 130, 246, 0.5), 0 20px 40px rgba(59, 130, 246, 0.3)'
          : '0 0 0 1px transparent',
      }}
      transition={animations.springs.smooth}
      style={{
        borderRadius: '12px',
        zIndex: zIndex,
      }}
    >
      {/* Hover Glow Effect */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl opacity-50 blur-lg -z-10"
            transition={{ duration: 0.3 }}
          />
        )}
      </AnimatePresence>

      {/* Top Bar - Section Label & Controls */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute -top-12 left-0 right-0 z-50 flex items-center justify-between px-4"
          >
            {/* Section Label */}
            <div className="flex items-center gap-2 bg-gradient-to-r from-slate-900 to-slate-800 px-4 py-2 rounded-t-xl border border-b-0 border-blue-500/50 backdrop-blur-sm">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-sm font-semibold text-white">{sectionName}</span>
            </div>

            {/* Action Buttons */}
            <motion.div
              className="flex items-center gap-1 bg-gradient-to-r from-slate-900 to-slate-800 px-2 py-1 rounded-t-xl border border-b-0 border-blue-500/50 backdrop-blur-sm"
              variants={motionVariants.stagger}
              initial="initial"
              animate="animate"
            >
              {/* Drag Handle */}
              {dragHandleProps && (
                <div
                  {...dragHandleProps}
                  className="p-2 cursor-grab active:cursor-grabbing hover:bg-white/10 rounded-lg transition-colors"
                  title="Drag to reorder"
                >
                  <GripVertical className="w-4 h-4 text-white/60" />
                </div>
              )}

              {/* Move Up/Down */}
              {canMoveUp && onMoveUp && (
                <ActionButton onClick={onMoveUp} icon={ChevronUp} label="Move Up" />
              )}
              {canMoveDown && onMoveDown && (
                <ActionButton onClick={onMoveDown} icon={ChevronDown} label="Move Down" />
              )}

              {/* Settings */}
              {onSettings && (
                <ActionButton onClick={onSettings} icon={Settings} label="Settings" />
              )}

              {/* Duplicate */}
              {onDuplicate && (
                <ActionButton onClick={onDuplicate} icon={Copy} label="Duplicate Section" />
              )}

              {/* Delete */}
              {onDelete && (
                <ActionButton
                  onClick={onDelete}
                  icon={Trash2}
                  label="Delete Section"
                  variant="danger"
                />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Section Content */}
      <div className={`relative ${isDragging ? 'opacity-50' : 'opacity-100'}`}>
        {children}
      </div>

      {/* Bottom Add Section Button */}
      <AnimatePresence>
        {isHovered && onAddBelow && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 z-50"
          >
            <motion.button
              onClick={onAddBelow}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full shadow-lg hover:shadow-xl transition-all font-medium"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm">Add Section Below</span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Left Edge Indicator */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            exit={{ scaleY: 0 }}
            className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-purple-600 rounded-l-xl origin-top"
            transition={{ duration: 0.2 }}
          />
        )}
      </AnimatePresence>

      {/* Right Edge Indicator */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            exit={{ scaleY: 0 }}
            className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-600 to-blue-500 rounded-r-xl origin-top"
            transition={{ duration: 0.2 }}
          />
        )}
      </AnimatePresence>

      {/* Corner Accents */}
      {isHovered && (
        <>
          <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-blue-500 rounded-tl-xl" />
          <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-purple-600 rounded-tr-xl" />
          <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-purple-600 rounded-bl-xl" />
          <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-blue-500 rounded-br-xl" />
        </>
      )}
    </motion.div>
  );
}
