/**
 * Command Bus - Event-Driven State Management
 * Handles all canvas operations with automatic undo/redo and persistence
 */

import { create } from 'zustand';
import type {
  Command,
  CanvasElement,
  CommandQueue,
  Transform,
  Breakpoint,
} from '@/lib/types';
import { registry } from '@/lib/selectorRegistry';
import { mutationEngine } from '@/lib/mutationEngine';
import { validateMutations, formatValidationWarnings } from '@/lib/validation';
import { openDB, type IDBPDatabase } from 'idb';
import { trackUndo, trackRedo } from '@/lib/analytics';

// IndexedDB database name and version
const DB_NAME = 'canvas-mode';
const DB_VERSION = 1;
const STORE_NAME = 'command-history';

// Auto-save interval (30 seconds)
const AUTO_SAVE_INTERVAL = 30000;

interface CommandBusState {
  // State
  history: Command[][];        // Array of command batches
  currentIndex: number;        // Position in history
  elements: Map<string, CanvasElement>;
  isDirty: boolean;            // Has uncommitted changes

  // Actions
  dispatch: (command: Command) => void;
  dispatchAsync: (builder: (queue: CommandQueue) => Promise<void>) => Promise<void>;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  commit: () => Promise<void>;
  reset: () => void;
  loadFromIndexedDB: () => Promise<void>;
  saveToIndexedDB: () => Promise<void>;
}

// Helper to get IndexedDB instance
let dbPromise: Promise<IDBPDatabase> | null = null;
function getDB(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      },
    });
  }
  return dbPromise;
}

/**
 * Apply a command to the current element state
 */
function applyCommand(elements: Map<string, CanvasElement>, command: Command): Map<string, CanvasElement> {
  const newElements = new Map(elements);

  switch (command.type) {
    case 'insert': {
      const { element } = command.payload;
      newElements.set(element.id, element);
      registry.addCanvas(element.id);
      break;
    }

    case 'transform': {
      const { id, transform, breakpoint } = command.payload;
      const elem = newElements.get(id);
      if (elem) {
        if (!elem.breakpoints) {
          elem.breakpoints = { desktop: transform };
        } else {
          elem.breakpoints[breakpoint] = transform;
        }
        elem.updatedAt = Date.now();
        newElements.set(id, { ...elem });
      }
      break;
    }

    case 'update_text': {
      const { id, text } = command.payload;
      const elem = newElements.get(id);
      if (elem) {
        elem.content.text = text;
        elem.updatedAt = Date.now();
        newElements.set(id, { ...elem });
      }
      break;
    }

    case 'update_attr': {
      const { id, attr, value } = command.payload;
      const elem = newElements.get(id);
      if (elem) {
        if (attr === 'src') elem.content.src = value;
        else if (attr === 'alt') elem.content.alt = value;
        else if (attr === 'href') elem.content.href = value;
        else {
          // Store in styles
          if (!elem.styles) elem.styles = {};
          elem.styles[attr] = value;
        }
        elem.updatedAt = Date.now();
        newElements.set(id, { ...elem });
      }
      break;
    }

    case 'delete': {
      const { id } = command.payload;
      newElements.delete(id);
      registry.remove(id);
      break;
    }

    case 'unlock': {
      const { selector } = command.payload;
      // Convert flow element to absolute mode
      // This will be implemented when we build the unlock feature
      break;
    }

    case 'batch': {
      let currentElements = newElements;
      for (const cmd of command.payload.commands) {
        currentElements = applyCommand(currentElements, cmd);
      }
      return currentElements;
    }
  }

  return newElements;
}

/**
 * Revert a command (for undo)
 */
function revertCommand(elements: Map<string, CanvasElement>, command: Command): Map<string, CanvasElement> {
  const newElements = new Map(elements);

  switch (command.type) {
    case 'insert': {
      const { element } = command.payload;
      newElements.delete(element.id);
      registry.remove(element.id);
      break;
    }

    case 'transform': {
      // For now, transforms can't be individually reverted
      // Full history replay will handle this
      break;
    }

    case 'update_text':
    case 'update_attr': {
      // Individual reverts not supported, full replay required
      break;
    }

    case 'delete': {
      // Can't undelete without full replay
      break;
    }

    case 'batch': {
      let currentElements = newElements;
      // Revert in reverse order
      for (let i = command.payload.commands.length - 1; i >= 0; i--) {
        currentElements = revertCommand(currentElements, command.payload.commands[i]);
      }
      return currentElements;
    }
  }

  return newElements;
}

/**
 * Replay history from beginning to reconstruct state
 */
function replayHistory(history: Command[][], upToIndex: number): Map<string, CanvasElement> {
  let elements = new Map<string, CanvasElement>();

  for (let i = 0; i <= upToIndex; i++) {
    const batch = history[i];
    for (const command of batch) {
      elements = applyCommand(elements, command);
    }
  }

  return elements;
}

/**
 * Debounced save to IndexedDB
 */
let saveTimeout: NodeJS.Timeout | null = null;
function debouncedSave(state: CommandBusState) {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    state.saveToIndexedDB();
  }, 1000); // Save after 1 second of inactivity
}

/**
 * Create the command bus store
 */
export const useCommandBus = create<CommandBusState>((set, get) => {
  // Auto-save interval
  setInterval(() => {
    const state = get();
    if (state.isDirty) {
      state.saveToIndexedDB();
    }
  }, AUTO_SAVE_INTERVAL);

  // Save on window unload
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
      const state = get();
      if (state.isDirty) {
        // Synchronous save on unload
        const data = {
          history: state.history,
          currentIndex: state.currentIndex,
          elements: Array.from(state.elements.entries()),
          timestamp: Date.now(),
        };
        localStorage.setItem('canvas-mode-backup', JSON.stringify(data));
      }
    });
  }

  return {
    history: [],
    currentIndex: -1,
    elements: new Map(),
    isDirty: false,

    // Synchronous dispatch (single command)
    dispatch: (command) => {
      const { history, currentIndex, elements } = get();

      // Apply command to current state
      const newElements = applyCommand(elements, command);

      // Truncate future history if we're not at the end
      const newHistory = history.slice(0, currentIndex + 1);

      // Add command as new batch
      newHistory.push([command]);

      set({
        elements: newElements,
        history: newHistory,
        currentIndex: newHistory.length - 1,
        isDirty: true,
      });

      // Auto-save to IndexedDB
      debouncedSave(get());
    },

    // Async dispatch (atomic batch of commands)
    dispatchAsync: async (builder) => {
      const commandBatch: Command[] = [];

      // Build queue
      const queue: CommandQueue = {
        add: (cmd) => commandBatch.push(cmd),
        addBatch: (cmds) => commandBatch.push(...cmds),
      };

      // Execute async builder (may call AI, fetch data, etc.)
      await builder(queue);

      // Apply entire batch as ONE atomic operation
      const { history, currentIndex, elements } = get();
      let newElements = new Map(elements);

      // Apply all commands in sequence
      for (const cmd of commandBatch) {
        newElements = applyCommand(newElements, cmd);
      }

      // Add batch to history (entire sequence is one undo unit)
      const newHistory = history.slice(0, currentIndex + 1);
      newHistory.push(commandBatch);

      set({
        elements: newElements,
        history: newHistory,
        currentIndex: newHistory.length - 1,
        isDirty: true,
      });

      // Auto-save to IndexedDB
      debouncedSave(get());
    },

    // Undo: replay history up to previous index
    undo: () => {
      const start = performance.now();
      const { history, currentIndex } = get();
      if (currentIndex < 0) return;

      // Replay history from beginning up to previous index
      const newElements = replayHistory(history, currentIndex - 1);

      set({
        elements: newElements,
        currentIndex: currentIndex - 1,
        isDirty: true,
      });

      debouncedSave(get());

      // Track undo latency
      const duration = performance.now() - start;
      trackUndo(duration);
    },

    // Redo: replay history up to next index
    redo: () => {
      const start = performance.now();
      const { history, currentIndex } = get();
      if (currentIndex >= history.length - 1) return;

      // Replay history from beginning up to next index
      const newElements = replayHistory(history, currentIndex + 1);

      set({
        elements: newElements,
        currentIndex: currentIndex + 1,
        isDirty: true,
      });

      debouncedSave(get());

      // Track redo latency
      const duration = performance.now() - start;
      trackRedo(duration);
    },

    canUndo: () => {
      const { currentIndex } = get();
      return currentIndex >= 0;
    },

    canRedo: () => {
      const { history, currentIndex } = get();
      return currentIndex < history.length - 1;
    },

    // Commit changes to server
    commit: async () => {
      const { elements } = get();

      // Compile to DOM mutations
      const mutations = mutationEngine.compile({
        mode: 'canvas',
        elements
      });

      // Validate before committing
      const validation = validateMutations(mutations, elements);

      if (!validation.valid) {
        const errorMessage = formatValidationWarnings(validation.warnings);
        console.error('❌ Validation failed:', errorMessage);
        throw new Error(`Validation failed:\n${errorMessage}`);
      }

      // Show warnings (non-blocking)
      const warnings = validation.warnings.filter(w => w.severity === 'warning');
      if (warnings.length > 0) {
        console.warn('⚠️  Validation warnings:', formatValidationWarnings(warnings));
      }

      // Send to server (would call Edge Function in real implementation)
      console.log('📤 Committing mutations to server:', mutations);
      // TODO: Implement actual server call
      // const result = await mutationEngine.applyToServer(getCurrentHTML(), mutations);

      set({ isDirty: false });
    },

    // Reset state
    reset: () => {
      set({
        history: [],
        currentIndex: -1,
        elements: new Map(),
        isDirty: false,
      });
      registry.reset();
    },

    // Load from IndexedDB
    loadFromIndexedDB: async () => {
      try {
        const db = await getDB();
        const data = await db.get(STORE_NAME, 'latest');

        if (data) {
          set({
            history: data.history || [],
            currentIndex: data.currentIndex ?? -1,
            elements: new Map(data.elements || []),
            isDirty: false,
          });

          console.log('✅ Loaded canvas state from IndexedDB');
        }
      } catch (error) {
        console.error('❌ Failed to load from IndexedDB:', error);

        // Try localStorage backup
        const backup = localStorage.getItem('canvas-mode-backup');
        if (backup) {
          try {
            const data = JSON.parse(backup);
            set({
              history: data.history || [],
              currentIndex: data.currentIndex ?? -1,
              elements: new Map(data.elements || []),
              isDirty: false,
            });
            console.log('✅ Loaded canvas state from localStorage backup');
          } catch (e) {
            console.error('❌ Failed to load from localStorage:', e);
          }
        }
      }
    },

    // Save to IndexedDB
    saveToIndexedDB: async () => {
      const { history, currentIndex, elements } = get();

      try {
        const db = await getDB();
        await db.put(STORE_NAME, {
          history,
          currentIndex,
          elements: Array.from(elements.entries()),
          timestamp: Date.now(),
        }, 'latest');

        set({ isDirty: false });
        console.log('✅ Saved canvas state to IndexedDB');
      } catch (error) {
        console.error('❌ Failed to save to IndexedDB:', error);
      }
    },
  };
});
