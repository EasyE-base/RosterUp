/**
 * History Manager - Undo/Redo with Command Pattern
 * Tracks all edits and allows reverting changes (Figma/Photoshop-style)
 */

import { produce } from 'immer';
import { DOMChange } from './domManipulator';

export interface Command {
  id: string;
  type: 'dom' | 'batch';
  name: string; // User-friendly description
  timestamp: number;
  execute: () => void;
  undo: () => void;
  changes?: DOMChange[]; // For tracking
}

export interface HistoryState {
  past: Command[];
  future: Command[];
  currentIndex: number;
}

export class HistoryManager {
  private state: HistoryState;
  private maxHistorySize: number = 50;
  private listeners: Set<(state: HistoryState) => void> = new Set();

  constructor() {
    this.state = {
      past: [],
      future: [],
      currentIndex: -1,
    };
  }

  /**
   * Execute a command and add it to history
   */
  execute(command: Command) {
    // Execute the command
    command.execute();

    // Update state using immer for immutability
    this.state = produce(this.state, (draft) => {
      // Clear future when executing a new command
      draft.future = [];

      // Add command to past
      draft.past.push(command);

      // Limit history size
      if (draft.past.length > this.maxHistorySize) {
        draft.past.shift();
      }

      draft.currentIndex = draft.past.length - 1;
    });

    this.notifyListeners();
    console.log(`✓ Executed: ${command.name}`);
  }

  /**
   * Undo the last command
   */
  undo(): boolean {
    if (!this.canUndo()) {
      console.log('Nothing to undo');
      return false;
    }

    this.state = produce(this.state, (draft) => {
      const command = draft.past.pop();
      if (command) {
        draft.future.unshift(command);
        draft.currentIndex--;
      }
    });

    // Execute undo
    const command = this.state.future[0];
    if (command) {
      command.undo();
      console.log(`↩️  Undid: ${command.name}`);
    }

    this.notifyListeners();
    return true;
  }

  /**
   * Redo the last undone command
   */
  redo(): boolean {
    if (!this.canRedo()) {
      console.log('Nothing to redo');
      return false;
    }

    this.state = produce(this.state, (draft) => {
      const command = draft.future.shift();
      if (command) {
        draft.past.push(command);
        draft.currentIndex++;
      }
    });

    // Execute redo
    const command = this.state.past[this.state.past.length - 1];
    if (command) {
      command.execute();
      console.log(`↪️  Redid: ${command.name}`);
    }

    this.notifyListeners();
    return true;
  }

  /**
   * Check if undo is available
   */
  canUndo(): boolean {
    return this.state.past.length > 0;
  }

  /**
   * Check if redo is available
   */
  canRedo(): boolean {
    return this.state.future.length > 0;
  }

  /**
   * Get current history state
   */
  getState(): HistoryState {
    return this.state;
  }

  /**
   * Get last N commands for display
   */
  getRecentCommands(count: number = 10): Command[] {
    return this.state.past.slice(-count).reverse();
  }

  /**
   * Clear all history
   */
  clear() {
    this.state = {
      past: [],
      future: [],
      currentIndex: -1,
    };
    this.notifyListeners();
    console.log('🗑️  History cleared');
  }

  /**
   * Subscribe to history changes
   */
  subscribe(listener: (state: HistoryState) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Notify all listeners of state changes
   */
  private notifyListeners() {
    this.listeners.forEach((listener) => listener(this.state));
  }

  /**
   * Create a batch command (multiple operations as one undo step)
   */
  createBatchCommand(
    name: string,
    commands: Array<{ execute: () => void; undo: () => void }>
  ): Command {
    return {
      id: `batch-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'batch',
      name,
      timestamp: Date.now(),
      execute: () => {
        commands.forEach((cmd) => cmd.execute());
      },
      undo: () => {
        // Undo in reverse order
        [...commands].reverse().forEach((cmd) => cmd.undo());
      },
    };
  }

  /**
   * Jump to a specific point in history
   */
  jumpTo(index: number): boolean {
    if (index < 0 || index >= this.state.past.length) {
      return false;
    }

    const currentIndex = this.state.currentIndex;

    if (index < currentIndex) {
      // Undo to get to the target
      const steps = currentIndex - index;
      for (let i = 0; i < steps; i++) {
        this.undo();
      }
    } else if (index > currentIndex) {
      // Redo to get to the target
      const steps = index - currentIndex;
      for (let i = 0; i < steps; i++) {
        this.redo();
      }
    }

    return true;
  }

  /**
   * Get snapshot of current state (for debugging)
   */
  getSnapshot() {
    return {
      pastCount: this.state.past.length,
      futureCount: this.state.future.length,
      currentIndex: this.state.currentIndex,
      canUndo: this.canUndo(),
      canRedo: this.canRedo(),
      recentCommands: this.getRecentCommands(5).map((c) => ({
        name: c.name,
        timestamp: new Date(c.timestamp).toLocaleTimeString(),
      })),
    };
  }
}

/**
 * Helper to create a DOM command from DOMManipulator changes
 */
export function createDOMCommand(
  name: string,
  change: DOMChange,
  execute: () => void,
  undo: () => void
): Command {
  return {
    id: `dom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: 'dom',
    name,
    timestamp: Date.now(),
    changes: [change],
    execute,
    undo,
  };
}
