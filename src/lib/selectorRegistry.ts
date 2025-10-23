/**
 * Selector Registry
 * Unified addressing system for Canvas and Smart Edit modes
 * Maps between element IDs, CSS selectors, and DOM references
 */

/**
 * Singleton registry that maintains bidirectional mappings between:
 * - Canvas element IDs (data-canvas-id)
 * - CSS selectors
 * - DOM element references
 */
export class SelectorRegistry {
  private idToSelector = new Map<string, string>();
  private selectorToId = new Map<string, string>();
  private elementRefs = new Map<string, Element>();

  /**
   * Register a canvas element (newly created with data-canvas-id)
   */
  registerCanvasElement(id: string): void {
    const selector = `[data-canvas-id="${id}"]`;
    this.idToSelector.set(id, selector);
    this.selectorToId.set(selector, id);
  }

  /**
   * Register an existing flow element (from Smart Edit mode)
   * Flow elements don't have canvas IDs, so we generate a pseudo-ID
   */
  registerFlowElement(selector: string, element: Element): void {
    // Generate stable ID from selector hash
    const id = `flow-${this.hashString(selector)}`;
    this.idToSelector.set(id, selector);
    this.selectorToId.set(selector, id);
    this.elementRefs.set(selector, element);
  }

  /**
   * Resolve: ID → CSS selector
   */
  getSelector(id: string): string | undefined {
    return this.idToSelector.get(id);
  }

  /**
   * Resolve: CSS selector → ID
   */
  getId(selector: string): string | undefined {
    return this.selectorToId.get(selector);
  }

  /**
   * Resolve: CSS selector → DOM element reference
   */
  getElement(selector: string): Element | undefined {
    return this.elementRefs.get(selector);
  }

  /**
   * Update element reference (after iframe DOM updates)
   */
  updateElementRef(selector: string, element: Element): void {
    this.elementRefs.set(selector, element);
  }

  /**
   * Check if an ID is registered
   */
  hasId(id: string): boolean {
    return this.idToSelector.has(id);
  }

  /**
   * Check if a selector is registered
   */
  hasSelector(selector: string): boolean {
    return this.selectorToId.has(selector);
  }

  /**
   * Get all registered IDs
   */
  getAllIds(): string[] {
    return Array.from(this.idToSelector.keys());
  }

  /**
   * Get all registered selectors
   */
  getAllSelectors(): string[] {
    return Array.from(this.selectorToId.keys());
  }

  /**
   * Clear all registrations (on page reload or reset)
   */
  clear(): void {
    this.idToSelector.clear();
    this.selectorToId.clear();
    this.elementRefs.clear();
  }

  /**
   * Sync with iframe DOM - scan for canvas elements and update registry
   * Call this after iframe loads or HTML updates
   */
  syncWithDOM(iframeDoc: Document): void {
    // Find all canvas elements in DOM
    const canvasElements = iframeDoc.querySelectorAll('[data-canvas-id]');

    canvasElements.forEach(el => {
      const id = el.getAttribute('data-canvas-id');
      if (!id) return;

      const selector = `[data-canvas-id="${id}"]`;

      // Register or update
      this.idToSelector.set(id, selector);
      this.selectorToId.set(selector, id);
      this.elementRefs.set(selector, el);
    });
  }

  /**
   * Remove an element from registry (when deleted)
   */
  unregister(id: string): void {
    const selector = this.idToSelector.get(id);
    if (selector) {
      this.selectorToId.delete(selector);
      this.elementRefs.delete(selector);
    }
    this.idToSelector.delete(id);
  }

  /**
   * Get debug info about registry state
   */
  getDebugInfo(): {
    totalIds: number;
    totalSelectors: number;
    totalRefs: number;
    canvasElements: number;
    flowElements: number;
  } {
    const canvasElements = Array.from(this.idToSelector.keys()).filter(
      id => !id.startsWith('flow-')
    ).length;
    const flowElements = Array.from(this.idToSelector.keys()).filter(
      id => id.startsWith('flow-')
    ).length;

    return {
      totalIds: this.idToSelector.size,
      totalSelectors: this.selectorToId.size,
      totalRefs: this.elementRefs.size,
      canvasElements,
      flowElements
    };
  }

  /**
   * Simple string hashing function for generating stable IDs
   * @private
   */
  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
  }
}

// Singleton instance - import this in components
export const selectorRegistry = new SelectorRegistry();

// Type-safe helpers for common operations
export const registry = {
  /**
   * Register a new canvas element
   */
  addCanvas(id: string): void {
    selectorRegistry.registerCanvasElement(id);
  },

  /**
   * Register an existing flow element
   */
  addFlow(selector: string, element: Element): void {
    selectorRegistry.registerFlowElement(selector, element);
  },

  /**
   * Resolve ID to selector
   */
  toSelector(id: string): string | undefined {
    return selectorRegistry.getSelector(id);
  },

  /**
   * Resolve selector to ID
   */
  toId(selector: string): string | undefined {
    return selectorRegistry.getId(selector);
  },

  /**
   * Get DOM element by selector
   */
  getElement(selector: string): Element | undefined {
    return selectorRegistry.getElement(selector);
  },

  /**
   * Sync with iframe DOM
   */
  sync(iframeDoc: Document): void {
    selectorRegistry.syncWithDOM(iframeDoc);
  },

  /**
   * Remove element
   */
  remove(id: string): void {
    selectorRegistry.unregister(id);
  },

  /**
   * Clear all
   */
  reset(): void {
    selectorRegistry.clear();
  },

  /**
   * Debug info
   */
  debug(): void {
    const info = selectorRegistry.getDebugInfo();
    console.log('📋 Selector Registry:', info);
  }
};
