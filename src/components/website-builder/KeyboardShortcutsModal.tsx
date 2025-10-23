import { X, Command, Keyboard } from 'lucide-react';
import { formatShortcut, KeyboardShortcut } from '../../hooks/useKeyboardShortcuts';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function KeyboardShortcutsModal({
  isOpen,
  onClose,
}: KeyboardShortcutsModalProps) {
  if (!isOpen) return null;

  const shortcutGroups = [
    {
      title: 'Editor Actions',
      shortcuts: [
        { key: 's', ctrl: true, description: 'Save page' },
        { key: 'z', ctrl: true, description: 'Undo' },
        { key: 'z', ctrl: true, shift: true, description: 'Redo' },
        { key: 'y', ctrl: true, description: 'Redo (alternative)' },
        { key: 'd', ctrl: true, description: 'Duplicate selected element' },
        { key: 'Delete', description: 'Delete selected element' },
        { key: 'Backspace', description: 'Delete selected element' },
        { key: 'c', ctrl: true, description: 'Copy selected element' },
        { key: 'x', ctrl: true, description: 'Cut selected element' },
        { key: 'v', ctrl: true, description: 'Paste element' },
        { key: 'Escape', description: 'Deselect all' },
      ],
    },
    {
      title: 'Navigation',
      shortcuts: [
        { key: 'Tab', description: 'Select next element' },
        { key: 'Tab', shift: true, description: 'Select previous element' },
        { key: 'ArrowUp', description: 'Move element up' },
        { key: 'ArrowDown', description: 'Move element down' },
        { key: '[', ctrl: true, description: 'Collapse all sections' },
        { key: ']', ctrl: true, description: 'Expand all sections' },
      ],
    },
    {
      title: 'View Controls',
      shortcuts: [
        { key: '1', ctrl: true, description: 'Desktop view' },
        { key: '2', ctrl: true, description: 'Tablet view' },
        { key: '3', ctrl: true, description: 'Mobile view' },
        { key: 'g', ctrl: true, description: 'Toggle grid' },
        { key: 'r', ctrl: true, description: 'Toggle rulers' },
        { key: 'p', ctrl: true, description: 'Preview page' },
      ],
    },
    {
      title: 'Panel Toggles',
      shortcuts: [
        { key: 'e', ctrl: true, description: 'Toggle Elements panel' },
        { key: 'l', ctrl: true, description: 'Toggle Layers panel' },
        { key: 'i', ctrl: true, description: 'Toggle Inspector panel' },
        { key: 't', ctrl: true, description: 'Toggle Design System panel' },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] animate-fadeIn">
      <div className="bg-slate-900 rounded-xl shadow-2xl w-full max-w-4xl max-h-[80vh] overflow-hidden border border-slate-800 animate-scaleIn">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Keyboard className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">
                Keyboard Shortcuts
              </h2>
              <p className="text-sm text-slate-400 mt-0.5">
                Work faster with these keyboard shortcuts
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {shortcutGroups.map((group, index) => (
              <div key={index}>
                <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                  <span className="w-1 h-4 bg-blue-500 rounded" />
                  {group.title}
                </h3>
                <div className="space-y-2">
                  {group.shortcuts.map((shortcut, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-slate-800/50 transition-colors"
                    >
                      <span className="text-sm text-slate-300">
                        {shortcut.description}
                      </span>
                      <div className="flex items-center gap-1">
                        <ShortcutBadge shortcut={shortcut} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Pro Tip */}
          <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="p-1.5 bg-blue-500/20 rounded">
                <Command className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-blue-400 mb-1">
                  Pro Tip
                </h4>
                <p className="text-sm text-slate-300">
                  Press <kbd className="px-2 py-1 bg-slate-800 rounded text-xs">?</kbd> anytime to open this modal again.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-800 bg-slate-900/50">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm font-medium"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
}

// Helper component to display keyboard shortcut badges
function ShortcutBadge({ shortcut }: { shortcut: KeyboardShortcut }) {
  const isMac = typeof navigator !== 'undefined' && /Mac/.test(navigator.platform);
  const parts: string[] = [];

  if (shortcut.ctrl) {
    parts.push(isMac ? '⌘' : 'Ctrl');
  }
  if (shortcut.shift) {
    parts.push('⇧');
  }
  if (shortcut.alt) {
    parts.push(isMac ? '⌥' : 'Alt');
  }

  const key = shortcut.key.length === 1 ? shortcut.key.toUpperCase() : shortcut.key;
  parts.push(key);

  return (
    <div className="flex items-center gap-1">
      {parts.map((part, index) => (
        <span key={index}>
          <kbd className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-xs font-mono text-slate-300">
            {part}
          </kbd>
          {index < parts.length - 1 && (
            <span className="text-slate-600 mx-1">+</span>
          )}
        </span>
      ))}
    </div>
  );
}
