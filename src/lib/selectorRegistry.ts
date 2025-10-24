/**
 * Selector Registry V2.0
 * Unified addressing system for Hybrid Canvas Mode
 * Maps between thryveIds, canvas IDs, CSS selectors, and DOM references
 * V2.0: Prioritizes data-thryve-id for flow elements
 */

/**
 * Singleton registry that maintains bidirectional mappings between:
 * - ThryveIds (data-thryve-id) - V2.0: Primary for flow elements
 * - Canvas element IDs (data-canvas-id) - For absolute elements
 * - CSS selectors - Fallback for legacy
 * - DOM element references
 */
export class SelectorRegistry {
  private idToSelector = new Map<string, string>();
  private selectorToId = new Map<string, string>();
  private elementRefs = new Map<string, Element>();

  // V2.0: ThryveId-first mappings
  private thryveIdToElement = new Map<string, Element>();
  private elementToThryveId = new WeakMap<Element, string>();

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
   * V2.0: Register flow element with thryveId
   * ThryveIds are deterministic and persist across reloads
   */
  registerThryveElement(thryveId: string, element: Element): void {
    this.thryveIdToElement.set(thryveId, element);
    this.elementToThryveId.set(element, thryveId);
  }

  /**
   * V2.0: Get element by thryveId (primary resolution path)
   */
  getElementByThryveId(thryveId: string): Element | undefined {
    return this.thryveIdToElement.get(thryveId);
  }

  /**
   * V2.0: Get thryveId from element reference
   */
  getThryveId(element: Element): string | undefined {
    return this.elementToThryveId.get(element);
  }

  /**
   * V2.0: Update element ref by thryveId (for sync after DOM mutations)
   */
  updateElementRefByThryveId(thryveId: string, element: Element): void {
    this.thryveIdToElement.set(thryveId, element);
    this.elementToThryveId.set(element, thryveId);
  }

  /**
   * V2.0: Resolve element by ID (thryveId OR canvasId)
   * ThryveId is checked first
   */
  resolveElement(id: string): Element | undefined {
    // Try thryveId first (V2.0 primary path)
    const thryveElement = this.thryveIdToElement.get(id);
    if (thryveElement) {
      return thryveElement;
    }

    // Fallback to canvas ID via selector
    const selector = this.idToSelector.get(id);
    if (selector) {
      return this.elementRefs.get(selector);
    }

    return undefined;
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
   * V2.0: Also clears thryveId mappings
   */
  clear(): void {
    this.idToSelector.clear();
    this.selectorToId.clear();
    this.elementRefs.clear();
    this.thryveIdToElement.clear();
    // WeakMap clears itself when references are gone
  }

  /**
   * V2.0: Sync with iframe DOM - scan for thryveId and canvas elements
   * Call this after iframe loads or HTML updates
   * Includes performance instrumentation
   */
  syncWithDOM(iframeDoc: Document): void {
    performance.mark('registry-sync-start');

    // V2.0: Scan for thryveId elements first (flow elements)
    const thryveElements = iframeDoc.querySelectorAll('[data-thryve-id]');
    thryveElements.forEach(el => {
      const thryveId = el.getAttribute('data-thryve-id');
      if (!thryveId) return;

      this.registerThryveElement(thryveId, el);
    });

    // Scan for canvas elements (absolute positioned elements)
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

    // Performance measurement
    performance.mark('registry-sync-end');
    performance.measure('registry-sync', 'registry-sync-start', 'registry-sync-end');

    const measure = performance.getEntriesByName('registry-sync')[0];
    const duration = measure?.duration || 0;
    const totalElements = thryveElements.length + canvasElements.length;

    if (duration > 50) {
      console.warn(`⚠️ Registry sync: ${duration.toFixed(2)}ms > 50ms budget (${totalElements} elements)`);
    }

    // Clean up performance entries
    performance.clearMarks('registry-sync-start');
    performance.clearMarks('registry-sync-end');
    performance.clearMeasures('registry-sync');
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
   * V2.0: Includes thryveId stats
   */
  getDebugInfo(): {
    totalIds: number;
    totalSelectors: number;
    totalRefs: number;
    canvasElements: number;
    flowElements: number;
    thryveElements: number;  // V2.0
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
      flowElements,
      thryveElements: this.thryveIdToElement.size,  // V2.0
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
   * V2.0: Register thryveId element
   */
  addThryve(thryveId: string, element: Element): void {
    selectorRegistry.registerThryveElement(thryveId, element);
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
   * V2.0: Get element by thryveId or canvasId (thryveId first)
   */
  resolve(id: string): Element | undefined {
    return selectorRegistry.resolveElement(id);
  },

  /**
   * V2.0: Get element by thryveId
   */
  getByThryveId(thryveId: string): Element | undefined {
    return selectorRegistry.getElementByThryveId(thryveId);
  },

  /**
   * V2.0: Update element ref by thryveId
   */
  updateElementRef(thryveId: string, element: Element): void {
    selectorRegistry.updateElementRefByThryveId(thryveId, element);
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
    console.log('📋 Selector Registry V2.0:', info);
  }
};
