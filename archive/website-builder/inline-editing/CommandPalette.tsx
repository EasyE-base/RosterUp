import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Plus,
  Trash2,
  Copy,
  Eye,
  Save,
  Undo,
  Redo,
  Palette,
  Settings,
  Zap,
  Command,
  ArrowRight,
} from 'lucide-react';

interface CommandAction {
  id: string;
  label: string;
  description: string;
  icon: any;
  shortcut?: string;
  category: 'sections' | 'edit' | 'view' | 'settings';
  action: () => void;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onExecuteCommand: (commandId: string) => void;
}

export default function CommandPalette({
  isOpen,
  onClose,
  onExecuteCommand,
}: CommandPaletteProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const commandRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Command definitions
  const commands: CommandAction[] = [
    {
      id: 'add-hero',
      label: 'Add Hero Section',
      description: 'Add a new hero section to your page',
      icon: Plus,
      category: 'sections',
      action: () => onExecuteCommand('add-hero'),
    },
    {
      id: 'add-schedule',
      label: 'Add Schedule Section',
      description: 'Add a schedule with events',
      icon: Plus,
      category: 'sections',
      action: () => onExecuteCommand('add-schedule'),
    },
    {
      id: 'add-contact',
      label: 'Add Contact Section',
      description: 'Add contact form and information',
      icon: Plus,
      category: 'sections',
      action: () => onExecuteCommand('add-contact'),
    },
    {
      id: 'add-commitments',
      label: 'Add Commitments Section',
      description: 'Add player commitments showcase',
      icon: Plus,
      category: 'sections',
      action: () => onExecuteCommand('add-commitments'),
    },
    {
      id: 'delete-section',
      label: 'Delete Current Section',
      description: 'Remove the selected section',
      icon: Trash2,
      shortcut: '⌫',
      category: 'edit',
      action: () => onExecuteCommand('delete-section'),
    },
    {
      id: 'duplicate-section',
      label: 'Duplicate Section',
      description: 'Create a copy of the current section',
      icon: Copy,
      shortcut: '⌘D',
      category: 'edit',
      action: () => onExecuteCommand('duplicate-section'),
    },
    {
      id: 'undo',
      label: 'Undo',
      description: 'Undo last change',
      icon: Undo,
      shortcut: '⌘Z',
      category: 'edit',
      action: () => onExecuteCommand('undo'),
    },
    {
      id: 'redo',
      label: 'Redo',
      description: 'Redo last undone change',
      icon: Redo,
      shortcut: '⌘Y',
      category: 'edit',
      action: () => onExecuteCommand('redo'),
    },
    {
      id: 'save',
      label: 'Save Page',
      description: 'Save all changes',
      icon: Save,
      shortcut: '⌘S',
      category: 'edit',
      action: () => onExecuteCommand('save'),
    },
    {
      id: 'preview',
      label: 'Preview Mode',
      description: 'Toggle preview mode',
      icon: Eye,
      shortcut: '⌘P',
      category: 'view',
      action: () => onExecuteCommand('preview'),
    },
    {
      id: 'theme',
      label: 'Change Theme',
      description: 'Switch between color themes',
      icon: Palette,
      category: 'settings',
      action: () => onExecuteCommand('theme'),
    },
    {
      id: 'settings',
      label: 'Page Settings',
      description: 'Open page settings',
      icon: Settings,
      category: 'settings',
      action: () => onExecuteCommand('settings'),
    },
  ];

  // Filter commands based on search
  const filteredCommands = commands.filter(
    (cmd) =>
      cmd.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cmd.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % filteredCommands.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev === 0 ? filteredCommands.length - 1 : prev - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredCommands[selectedIndex]) {
            filteredCommands[selectedIndex].action();
            onClose();
          }
          break;
        case 'Escape':
          onClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredCommands, onClose]);

  // Scroll selected item into view
  useEffect(() => {
    commandRefs.current[selectedIndex]?.scrollIntoView({
      block: 'nearest',
      behavior: 'smooth',
    });
  }, [selectedIndex]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Group commands by category
  const groupedCommands = filteredCommands.reduce((acc, cmd) => {
    if (!acc[cmd.category]) {
      acc[cmd.category] = [];
    }
    acc[cmd.category].push(cmd);
    return acc;
  }, {} as Record<string, CommandAction[]>);

  const categoryNames = {
    sections: 'Add Sections',
    edit: 'Edit',
    view: 'View',
    settings: 'Settings',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Spotlight Backdrop with Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-[10000]"
            onClick={onClose}
          >
            {/* Radial gradient spotlight effect */}
            <div className="absolute inset-0 bg-gradient-radial from-transparent via-black/20 to-black/60" />
          </motion.div>

          {/* Command Palette with Glass Effect */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -40 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-[15%] left-1/2 -translate-x-1/2 w-full max-w-2xl backdrop-blur-2xl bg-slate-900/95 rounded-2xl shadow-2xl z-[10001] overflow-hidden border border-slate-700/50"
            style={{
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Bar */}
            <div className="relative border-b border-slate-700">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Command className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                placeholder="Type a command or search..."
                className="w-full pl-12 pr-12 py-4 bg-transparent text-white placeholder-slate-500 outline-none text-lg"
              />
            </div>

            {/* Commands List */}
            <div className="max-h-[400px] overflow-y-auto">
              {Object.keys(groupedCommands).length === 0 ? (
                <div className="p-8 text-center">
                  <Search className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400">No commands found</p>
                  <p className="text-slate-500 text-sm mt-1">
                    Try a different search term
                  </p>
                </div>
              ) : (
                Object.entries(groupedCommands).map(([category, cmds]) => (
                  <div key={category} className="py-2">
                    {/* Category Header */}
                    <div className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      {categoryNames[category as keyof typeof categoryNames]}
                    </div>

                    {/* Commands in Category */}
                    {cmds.map((cmd, idx) => {
                      const globalIndex = filteredCommands.indexOf(cmd);
                      const isSelected = globalIndex === selectedIndex;
                      const Icon = cmd.icon;

                      return (
                        <motion.button
                          key={cmd.id}
                          ref={(el) => (commandRefs.current[globalIndex] = el)}
                          onClick={() => {
                            cmd.action();
                            onClose();
                          }}
                          className={`relative w-full px-4 py-3 flex items-center gap-3 transition-all ${
                            isSelected
                              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                              : 'text-slate-300 hover:bg-slate-800/50'
                          }`}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          whileHover={{ x: 4 }}
                        >
                          {/* Selection highlight beam */}
                          {isSelected && (
                            <motion.div
                              layoutId="highlight-beam"
                              className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-400 to-purple-400 rounded-r"
                              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                            />
                          )}
                          {/* Icon */}
                          <div
                            className={`p-2 rounded-lg ${
                              isSelected
                                ? 'bg-white/20'
                                : 'bg-slate-800'
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>

                          {/* Label & Description */}
                          <div className="flex-1 text-left">
                            <div className="font-semibold">{cmd.label}</div>
                            <div
                              className={`text-sm ${
                                isSelected ? 'text-blue-100' : 'text-slate-500'
                              }`}
                            >
                              {cmd.description}
                            </div>
                          </div>

                          {/* Shortcut or Arrow */}
                          {cmd.shortcut ? (
                            <div
                              className={`px-2 py-1 rounded text-xs font-mono ${
                                isSelected
                                  ? 'bg-white/20 text-white'
                                  : 'bg-slate-800 text-slate-400'
                              }`}
                            >
                              {cmd.shortcut}
                            </div>
                          ) : (
                            isSelected && (
                              <ArrowRight className="w-4 h-4 text-white/60" />
                            )
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-slate-700 bg-slate-950 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <kbd className="px-2 py-1 bg-slate-800 rounded">↑↓</kbd>
                  Navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-2 py-1 bg-slate-800 rounded">↵</kbd>
                  Select
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-2 py-1 bg-slate-800 rounded">Esc</kbd>
                  Close
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Zap className="w-3 h-3 text-yellow-500" />
                <span>Power User Mode</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
