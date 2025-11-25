import { useEffect, useCallback } from 'react';

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  description: string;
  handler: () => void;
  preventDefault?: boolean;
}

interface UseKeyboardShortcutsOptions {
  shortcuts?: KeyboardShortcut[];
  enabled?: boolean;
  onSave?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  onCopy?: () => void;
  onCut?: () => void;
  onPaste?: () => void;
  onEscape?: () => void;
  onHelp?: () => void;
}

export function useKeyboardShortcuts({
  shortcuts = [],
  enabled = true,
  onSave,
  onUndo,
  onRedo,
  onDelete,
  onDuplicate,
  onCopy,
  onCut,
  onPaste,
  onEscape,
  onHelp,
}: UseKeyboardShortcutsOptions) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Combine provided shortcuts with named handlers
      const allShortcuts: KeyboardShortcut[] = [...shortcuts];

      if (onSave) allShortcuts.push({ ...editorShortcuts.save, handler: onSave });
      if (onUndo) allShortcuts.push({ ...editorShortcuts.undo, handler: onUndo });
      if (onRedo) allShortcuts.push({ ...editorShortcuts.redo, handler: onRedo });
      if (onDelete) {
        allShortcuts.push({ ...editorShortcuts.delete, handler: onDelete });
        allShortcuts.push({ ...editorShortcuts.backspace, handler: onDelete });
      }
      if (onDuplicate) allShortcuts.push({ ...editorShortcuts.duplicate, handler: onDuplicate });
      if (onCopy) allShortcuts.push({ ...editorShortcuts.copy, handler: onCopy });
      if (onCut) allShortcuts.push({ ...editorShortcuts.cut, handler: onCut });
      if (onPaste) allShortcuts.push({ ...editorShortcuts.paste, handler: onPaste });
      if (onEscape) allShortcuts.push({ ...editorShortcuts.escape, handler: onEscape });
      if (onHelp) allShortcuts.push({ key: '/', shift: true, description: 'Show shortcuts', handler: onHelp });

      // Guard against undefined or null shortcuts
      if (allShortcuts.length === 0) {
        return;
      }

      // Don't trigger shortcuts when typing in inputs, textareas, or contenteditable elements
      const target = event.target as HTMLElement;
      const isEditingText =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      // Allow certain shortcuts even when editing text (like Cmd+S for save)
      const allowedInTextFields = ['s', 'z', 'y'];
      if (
        isEditingText &&
        !allowedInTextFields.includes(event.key.toLowerCase()) &&
        (event.ctrlKey || event.metaKey)
      ) {
        return;
      }

      for (const shortcut of allShortcuts) {
        const keyMatches =
          event.key.toLowerCase() === shortcut.key.toLowerCase();

        // Check modifiers
        const ctrlMatches = shortcut.ctrl ? (event.ctrlKey || event.metaKey) : (!event.ctrlKey && !event.metaKey);
        const shiftMatches = shortcut.shift ? event.shiftKey : !event.shiftKey;
        const altMatches = shortcut.alt ? event.altKey : !event.altKey;

        // Special case for Delete/Backspace which don't need modifiers usually
        const isSimpleKey = !shortcut.ctrl && !shortcut.shift && !shortcut.alt && !shortcut.meta;
        const simpleMatch = isSimpleKey && keyMatches;

        if ((keyMatches && ctrlMatches && shiftMatches && altMatches) || simpleMatch) {
          if (shortcut.preventDefault !== false) {
            event.preventDefault();
          }
          shortcut.handler();
          break;
        }
      }
    },
    [shortcuts, enabled, onSave, onUndo, onRedo, onDelete, onDuplicate, onCopy, onCut, onPaste, onEscape, onHelp]
  );

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown, enabled]);
}

// Helper function to format keyboard shortcut for display
export function formatShortcut(shortcut: KeyboardShortcut): string {
  const parts: string[] = [];

  // Use Cmd on Mac, Ctrl on other platforms
  const isMac = typeof navigator !== 'undefined' && /Mac/.test(navigator.platform);

  if (shortcut.ctrl) {
    parts.push(isMac ? '⌘' : 'Ctrl');
  }
  if (shortcut.shift) {
    parts.push('⇧');
  }
  if (shortcut.alt) {
    parts.push(isMac ? '⌥' : 'Alt');
  }
  if (shortcut.meta && !isMac) {
    parts.push('Meta');
  }

  // Format the key
  const key = shortcut.key.length === 1 ? shortcut.key.toUpperCase() : shortcut.key;
  parts.push(key);

  return parts.join(' + ');
}

// Predefined shortcut groups for the website builder
export const editorShortcuts = {
  save: { key: 's', ctrl: true, description: 'Save page' },
  undo: { key: 'z', ctrl: true, description: 'Undo' },
  redo: { key: 'z', ctrl: true, shift: true, description: 'Redo' },
  duplicate: { key: 'd', ctrl: true, description: 'Duplicate selected element' },
  delete: { key: 'Delete', description: 'Delete selected element' },
  backspace: { key: 'Backspace', description: 'Delete selected element' },
  copy: { key: 'c', ctrl: true, description: 'Copy selected element' },
  cut: { key: 'x', ctrl: true, description: 'Cut selected element' },
  paste: { key: 'v', ctrl: true, description: 'Paste element' },
  escape: { key: 'Escape', description: 'Deselect all' },
  tab: { key: 'Tab', description: 'Select next element' },
  shiftTab: { key: 'Tab', shift: true, description: 'Select previous element' },
  arrowUp: { key: 'ArrowUp', description: 'Move element up' },
  arrowDown: { key: 'ArrowDown', description: 'Move element down' },
};

export const viewShortcuts = {
  desktop: { key: '1', ctrl: true, description: 'Desktop view' },
  tablet: { key: '2', ctrl: true, description: 'Tablet view' },
  mobile: { key: '3', ctrl: true, description: 'Mobile view' },
  grid: { key: 'g', ctrl: true, description: 'Toggle grid' },
  rulers: { key: 'r', ctrl: true, description: 'Toggle rulers' },
  preview: { key: 'p', ctrl: true, description: 'Preview page' },
};

export const panelShortcuts = {
  elements: { key: 'e', ctrl: true, description: 'Toggle Elements panel' },
  layers: { key: 'l', ctrl: true, description: 'Toggle Layers panel' },
  inspector: { key: 'i', ctrl: true, description: 'Toggle Inspector panel' },
  designSystem: { key: 't', ctrl: true, description: 'Toggle Design System panel' },
};
