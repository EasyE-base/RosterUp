/**
 * Section Command Bus - Lightweight undo/redo system for template sections
 * Separate from Canvas CommandBus to avoid complexity with Canvas-specific types
 */

export interface SectionCommand {
  type: 'updateSection' | 'addSection' | 'deleteSection' | 'reorderSections';
  payload: any;
  previousState?: any;
  apply: () => Promise<void>;
  revert: () => Promise<void>;
}

export class SectionCommandBus {
  private history: SectionCommand[] = [];
  private currentIndex = -1;
  private maxHistory = 50;
  private isExecuting = false;

  /**
   * Execute a command and add it to history
   */
  async execute(command: SectionCommand): Promise<void> {
    if (this.isExecuting) {
      console.warn('Command already executing, skipping');
      return;
    }

    try {
      this.isExecuting = true;

      // Execute the command
      await command.apply();

      // Truncate history after current index (removes redo history)
      this.history = this.history.slice(0, this.currentIndex + 1);

      // Add to history
      this.history.push(command);
      this.currentIndex++;

      // Limit history size
      if (this.history.length > this.maxHistory) {
        this.history.shift();
        this.currentIndex--;
      }
    } catch (error) {
      console.error('Error executing command:', error);
      throw error;
    } finally {
      this.isExecuting = false;
    }
  }

  /**
   * Undo the last command
   */
  async undo(): Promise<void> {
    if (!this.canUndo() || this.isExecuting) {
      return;
    }

    try {
      this.isExecuting = true;
      const command = this.history[this.currentIndex];

      await command.revert();
      this.currentIndex--;
    } catch (error) {
      console.error('Error undoing command:', error);
      throw error;
    } finally {
      this.isExecuting = false;
    }
  }

  /**
   * Redo the next command
   */
  async redo(): Promise<void> {
    if (!this.canRedo() || this.isExecuting) {
      return;
    }

    try {
      this.isExecuting = true;
      this.currentIndex++;
      const command = this.history[this.currentIndex];

      await command.apply();
    } catch (error) {
      console.error('Error redoing command:', error);
      this.currentIndex--;
      throw error;
    } finally {
      this.isExecuting = false;
    }
  }

  /**
   * Check if undo is available
   */
  canUndo(): boolean {
    return this.currentIndex >= 0;
  }

  /**
   * Check if redo is available
   */
  canRedo(): boolean {
    return this.currentIndex < this.history.length - 1;
  }

  /**
   * Clear all history
   */
  clear(): void {
    this.history = [];
    this.currentIndex = -1;
  }

  /**
   * Get history info for debugging
   */
  getHistoryInfo() {
    return {
      total: this.history.length,
      currentIndex: this.currentIndex,
      canUndo: this.canUndo(),
      canRedo: this.canRedo(),
    };
  }
}
