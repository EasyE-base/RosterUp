/**
 * Iframe Sync Manager
 * Auto-sync DOM changes with SelectorRegistry using MutationObserver
 * V2.0: Throttled batch updates with proper cleanup
 */

import { selectorRegistry } from './selectorRegistry';
import { hitTestQuadtree } from './hitTestQuadtree';

/**
 * Iframe Sync Manager Class
 * Monitors DOM mutations and updates the selector registry
 */
export class IframeSyncManager {
  private observer: MutationObserver | null = null;
  private pendingUpdates = new Set<string>();
  private syncTimer: number | null = null;
  private iframeDoc: Document | null = null;
  private readonly syncInterval = 100; // 100ms throttle

  /**
   * Start observing iframe document for changes
   *
   * @param iframeDoc - Iframe document to observe
   */
  start(iframeDoc: Document): void {
    // Store reference
    this.iframeDoc = iframeDoc;

    // Create mutation observer
    this.observer = new MutationObserver((mutations) => {
      this.handleMutations(mutations);
    });

    // Observe with comprehensive config
    this.observer.observe(iframeDoc.body, {
      childList: true,        // Watch for added/removed nodes
      subtree: true,          // Watch entire subtree
      attributes: true,       // Watch attribute changes
      characterData: true,    // Watch text content changes
      attributeOldValue: true,
      characterDataOldValue: true,
    });

    console.log('📡 IframeSyncManager started');
  }

  /**
   * Handle mutations from MutationObserver
   */
  private handleMutations(mutations: MutationRecord[]): void {
    for (const mutation of mutations) {
      const target = mutation.target as Element;

      // Ignore mutations in Canvas absolute layer
      // (elements with data-canvas-id are managed by commandBus)
      if (target.closest?.('[data-canvas-id]')) {
        continue;
      }

      // Get thryveId from target or closest parent with thryveId
      const thryveId = this.findThryveId(target);

      if (thryveId) {
        this.pendingUpdates.add(thryveId);
      }
    }

    // Schedule batch sync
    this.scheduleBatchSync();
  }

  /**
   * Find thryveId in element or ancestors
   */
  private findThryveId(element: Node): string | null {
    if (element.nodeType !== Node.ELEMENT_NODE) {
      return null;
    }

    const el = element as Element;

    // Check element itself
    const thryveId = el.getAttribute('data-thryve-id');
    if (thryveId) {
      return thryveId;
    }

    // Check parent
    const parent = el.parentElement;
    if (parent) {
      return parent.getAttribute('data-thryve-id');
    }

    return null;
  }

  /**
   * Schedule batch sync with throttling
   */
  private scheduleBatchSync(): void {
    // Already scheduled
    if (this.syncTimer) {
      return;
    }

    this.syncTimer = window.setTimeout(() => {
      this.executeBatchSync();
    }, this.syncInterval);
  }

  /**
   * Execute batch sync of pending updates
   */
  private executeBatchSync(): void {
    if (!this.iframeDoc || this.pendingUpdates.size === 0) {
      this.syncTimer = null;
      return;
    }

    // Update selector registry refs for all pending elements
    let updatedCount = 0;
    for (const thryveId of this.pendingUpdates) {
      const element = this.iframeDoc.querySelector(`[data-thryve-id="${thryveId}"]`);

      if (element) {
        selectorRegistry.updateElementRef(thryveId, element);
        updatedCount++;
      }
    }

    // Rebuild quadtree hit-testing (invalidated by mutations)
    // Note: quadtree.rebuild() is called by commandBus after operations
    // Here we just invalidate the cache
    if (updatedCount > 0) {
      console.log(`📡 Synced ${updatedCount} element refs`);
    }

    // Clear pending updates
    this.pendingUpdates.clear();
    this.syncTimer = null;
  }

  /**
   * Stop observing and clean up
   */
  stop(): void {
    // Disconnect observer
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
      console.log('📡 IframeSyncManager stopped');
    }

    // Clear pending timer
    if (this.syncTimer) {
      clearTimeout(this.syncTimer);
      this.syncTimer = null;
    }

    // Clear pending updates
    this.pendingUpdates.clear();

    // Clear document reference
    this.iframeDoc = null;
  }

  /**
   * Force immediate sync (bypass throttle)
   * Useful after major operations like undo/redo
   */
  forceSync(): void {
    if (this.syncTimer) {
      clearTimeout(this.syncTimer);
      this.syncTimer = null;
    }

    this.executeBatchSync();
  }

  /**
   * Get pending update count (for debugging)
   */
  getPendingCount(): number {
    return this.pendingUpdates.size;
  }

  /**
   * Check if observer is running
   */
  isRunning(): boolean {
    return this.observer !== null;
  }
}

/**
 * Singleton instance (optional - can create multiple instances)
 */
export const iframeSyncManager = new IframeSyncManager();
