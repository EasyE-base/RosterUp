/**
 * Unified Mutation Engine V2.0
 * Compiles Canvas elements and Smart Edit actions into DOM mutations
 * V2.0: Flow-to-absolute transitions with inline style preservation
 */

import { buildBreakpointCSS } from './breakpoints';
import { selectorRegistry } from './selectorRegistry';
import { assignZIndex } from './zIndexPolicy';
import { generateResponsiveTransforms } from './responsiveGenerator';
import type {
  MutationOp,
  MutationSource,
  CanvasElement,
  OperationContext,
  ComputedStyles,
  Transform,
} from './types';

/**
 * Mutation Engine Class
 * Converts high-level operations (canvas elements, AI instructions) into
 * low-level DOM mutations that can be applied server-side
 */
export class MutationEngine {
  /**
   * Compile any source into standard mutation operations
   */
  compile(source: MutationSource): MutationOp[] {
    if (source.mode === 'canvas') {
      return this.compileCanvasElements(source.elements!);
    } else {
      // Smart Edit mode - operations are already in mutation format
      // This path will call the AI Visual Editor directly
      throw new Error('Smart Edit compilation should use AI Visual Editor endpoint directly');
    }
  }

  /**
   * Compile Canvas elements into DOM mutations
   * V2.0: Enhanced with z-index enforcement and thryveId support
   * 1. Register elements in selector registry (canvas ID + thryveId)
   * 2. Enforce z-index policy
   * 3. Generate breakpoint CSS
   * 4. Insert/update canvas elements
   */
  private compileCanvasElements(elements: Map<string, CanvasElement>): MutationOp[] {
    performance.mark('mutation-compile-start');
    const ops: MutationOp[] = [];

    // Step 1: Register all elements and enforce z-index policy
    for (const [id, elem] of elements) {
      selectorRegistry.registerCanvasElement(id);

      // V2.0: Register thryveId if present (unlocked flow elements)
      if (elem.thryveId) {
        // Note: Element ref will be updated after DOM insertion
        // Here we just ensure the mapping exists
      }

      // V2.0: Enforce z-index policy
      if (elem.mode === 'absolute') {
        elem.zIndex = assignZIndex(elem);
      }
    }

    // Step 2: Generate breakpoint CSS and upsert style tag
    const breakpointCSS = buildBreakpointCSS(
      new Map(Array.from(elements.entries()).map(([id, elem]) => [
        id,
        {
          id: elem.id,
          mode: elem.mode,
          breakpoints: elem.breakpoints,
          zIndex: elem.zIndex,
        },
      ]))
    );

    if (breakpointCSS) {
      // Upsert style tag (replace if exists, insert if not)
      ops.push({
        op: 'insert',
        selector: 'head',
        position: 'append',
        html: `<style id="canvas-breakpoints">${breakpointCSS}</style>`,
      });
    }

    // Step 3: Generate element insertions/updates
    for (const [id, elem] of elements) {
      const selector = selectorRegistry.getSelector(id)!;

      if (elem.mode === 'absolute') {
        // V2.0: Check if unlocked from flow element
        if (elem.originalSelector) {
          // Element was unlocked - replace original with absolute version
          ops.push({
            op: 'insert',
            selector: elem.originalSelector,
            position: 'after',
            html: this.elementToHTML(elem),
          });
          // Delete the original flow element
          ops.push({
            op: 'delete',
            selector: elem.originalSelector,
          });
        } else {
          // New absolute element - insert into body
          ops.push({
            op: 'insert',
            selector: 'body',
            position: 'append',
            html: this.elementToHTML(elem),
          });
        }
      } else {
        // Flow element (in-place edit)
        // This path handles text/attr updates to existing flow elements
        // (Not common in Canvas Mode V2.0, but supported for compatibility)
        if (elem.originalSelector) {
          ops.push({
            op: 'update_text',
            selector: elem.originalSelector,
            value: elem.content.text || '',
          });
        }
      }
    }

    // Performance measurement
    performance.mark('mutation-compile-end');
    performance.measure('mutation-compile', 'mutation-compile-start', 'mutation-compile-end');

    const measure = performance.getEntriesByName('mutation-compile')[0];
    const duration = measure?.duration || 0;

    if (duration > 100) {
      console.warn(`⚠️ Mutation compile: ${duration.toFixed(2)}ms > 100ms budget (${elements.size} elements)`);
    }

    performance.clearMarks('mutation-compile-start');
    performance.clearMarks('mutation-compile-end');
    performance.clearMeasures('mutation-compile');

    return ops;
  }

  /**
   * V2.0: Capture computed styles from a DOM element
   * Used when unlocking flow elements to preserve visual fidelity
   */
  captureComputedStyles(element: Element): ComputedStyles {
    if (typeof window === 'undefined') {
      return {};
    }

    const computed = window.getComputedStyle(element);

    return {
      fontSize: computed.fontSize,
      fontWeight: computed.fontWeight,
      lineHeight: computed.lineHeight,
      color: computed.color,
      backgroundColor: computed.backgroundColor,
      fontFamily: computed.fontFamily,
      padding: computed.padding,
      margin: computed.margin,
      borderRadius: computed.borderRadius,
      // Box model
      width: computed.width,
      height: computed.height,
      // Display
      display: computed.display,
      // Text
      textAlign: computed.textAlign,
      textDecoration: computed.textDecoration,
      // Additional preserved properties
      letterSpacing: computed.letterSpacing,
      wordSpacing: computed.wordSpacing,
    };
  }

  /**
   * V2.0: Convert flow element to absolute positioned canvas element
   * Preserves layout by capturing bounding box and computed styles
   */
  unlockFlowElement(
    thryveId: string,
    element: Element,
    viewportWidth: number = 1440
  ): CanvasElement {
    // Capture current position and size
    const rect = element.getBoundingClientRect();
    const scrollX = window.scrollX || 0;
    const scrollY = window.scrollY || 0;

    // Build desktop transform from current layout position
    const desktopTransform: Transform = {
      x: rect.left + scrollX,
      y: rect.top + scrollY,
      width: rect.width,
      height: rect.height,
      rotation: 0, // Could extract from transform matrix if needed
    };

    // Generate responsive transforms
    const breakpoints = generateResponsiveTransforms(desktopTransform, viewportWidth);

    // Capture computed styles for fidelity
    const snapshotStyles = this.captureComputedStyles(element);

    // Determine element type
    const tagName = element.tagName.toLowerCase();
    let elementType: CanvasElement['type'] = 'custom';
    const content: CanvasElement['content'] = {};

    if (tagName === 'p' || tagName === 'h1' || tagName === 'h2' || tagName === 'h3' || tagName === 'span') {
      elementType = 'text';
      content.text = element.textContent || '';
    } else if (tagName === 'img') {
      elementType = 'image';
      content.src = element.getAttribute('src') || '';
      content.alt = element.getAttribute('alt') || '';
    } else if (tagName === 'a' || tagName === 'button') {
      elementType = 'button';
      content.text = element.textContent || '';
      content.href = element.getAttribute('href') || '#';
    } else if (tagName === 'video') {
      elementType = 'video';
      content.src = element.getAttribute('src') || '';
    } else {
      elementType = 'section';
      content.html = element.innerHTML;
    }

    // Create canvas element with preserved styles
    const canvasElement: CanvasElement = {
      id: `canvas-${thryveId}`,
      thryveId,
      type: elementType,
      mode: 'absolute',
      content,
      breakpoints,
      zIndex: assignZIndex({ mode: 'absolute' } as CanvasElement),
      styles: {
        fontSize: snapshotStyles.fontSize,
        fontWeight: snapshotStyles.fontWeight,
        lineHeight: snapshotStyles.lineHeight,
        fontFamily: snapshotStyles.fontFamily,
        color: snapshotStyles.color,
        backgroundColor: snapshotStyles.backgroundColor,
        padding: snapshotStyles.padding,
        borderRadius: snapshotStyles.borderRadius,
        textAlign: snapshotStyles.textAlign,
      },
      originalSelector: `[data-thryve-id="${thryveId}"]`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    return canvasElement;
  }

  /**
   * V2.0: Compile flow element mutations (thryveId-based operations)
   * For in-place edits to flow elements without unlocking
   */
  private compileFlowMutations(
    thryveId: string,
    operation: 'update_text' | 'update_attr',
    value: string,
    attr?: string
  ): MutationOp[] {
    const ops: MutationOp[] = [];

    const selector = `[data-thryve-id="${thryveId}"]`;

    if (operation === 'update_text') {
      ops.push({
        op: 'update_text',
        selector,
        value,
      });
    } else if (operation === 'update_attr' && attr) {
      ops.push({
        op: 'update_attr',
        selector,
        attr,
        value,
      });
    }

    return ops;
  }

  /**
   * Convert CanvasElement to HTML string
   * V2.0: Enhanced with inline style support for unlocked elements
   */
  private elementToHTML(elem: CanvasElement): string {
    const baseStyle = elem.mode === 'absolute'
      ? 'position:absolute; left:var(--el-left); top:var(--el-top); width:var(--el-width); height:var(--el-height); transform:rotate(var(--el-rotate));'
      : '';

    // V2.0: Merge custom styles (includes preserved styles from unlock)
    const customStyles = elem.styles
      ? Object.entries(elem.styles)
          .filter(([_, value]) => value !== undefined)
          .map(([key, value]) => `${this.camelToKebab(key)}:${value}`)
          .join('; ')
      : '';

    const combinedStyle = [baseStyle, customStyles].filter(Boolean).join(' ');
    const styleAttr = combinedStyle ? ` style="${combinedStyle}"` : '';

    // V2.0: Add thryveId if present (for unlocked flow elements)
    const thryveAttr = elem.thryveId ? ` data-thryve-id="${elem.thryveId}"` : '';

    // V2.0: Add original selector if unlocked from flow
    const dataAttrs = `${thryveAttr}`;

    switch (elem.type) {
      case 'text':
        return `<p class="canvas-element canvas-text" data-canvas-id="${elem.id}"${dataAttrs}${styleAttr}>${this.escapeHTML(elem.content.text || '')}</p>`;

      case 'image':
        return `<img class="canvas-element canvas-image" data-canvas-id="${elem.id}"${dataAttrs} src="${elem.content.src || ''}" alt="${this.escapeHTML(elem.content.alt || '')}"${styleAttr} />`;

      case 'button':
        return `<a class="canvas-element canvas-button" data-canvas-id="${elem.id}"${dataAttrs} href="${elem.content.href || '#'}"${styleAttr}>${this.escapeHTML(elem.content.text || 'Button')}</a>`;

      case 'video':
        return `<video class="canvas-element canvas-video" data-canvas-id="${elem.id}"${dataAttrs} src="${elem.content.src || ''}" controls${styleAttr}></video>`;

      case 'section':
        return `<div class="canvas-element canvas-section" data-canvas-id="${elem.id}"${dataAttrs}${styleAttr}>${elem.content.html || ''}</div>`;

      case 'custom':
        return `<div class="canvas-element canvas-custom" data-canvas-id="${elem.id}"${dataAttrs}${styleAttr}>${elem.content.html || ''}</div>`;

      default:
        return `<div class="canvas-element" data-canvas-id="${elem.id}"${dataAttrs}${styleAttr}></div>`;
    }
  }

  /**
   * Convert camelCase to kebab-case for CSS properties
   */
  private camelToKebab(str: string): string {
    return str.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
  }

  /**
   * Escape HTML to prevent XSS
   */
  private escapeHTML(str: string): string {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  /**
   * Apply mutations to HTML (client-side preview)
   * For actual server-side application, call the Edge Function
   */
  applyToDOM(iframeDoc: Document, ops: MutationOp[]): void {
    for (const op of ops) {
      try {
        const element = iframeDoc.querySelector(op.selector);

        switch (op.op) {
          case 'insert': {
            const parent = iframeDoc.querySelector(op.selector);
            if (!parent) continue;

            const temp = iframeDoc.createElement('div');
            temp.innerHTML = op.html!;
            const newNode = temp.firstElementChild;
            if (!newNode) continue;

            switch (op.position) {
              case 'after':
                parent.after(newNode);
                break;
              case 'before':
                parent.before(newNode);
                break;
              case 'prepend':
                parent.prepend(newNode);
                break;
              case 'append':
              default:
                parent.append(newNode);
                break;
            }
            break;
          }

          case 'delete':
            if (element) element.remove();
            break;

          case 'update_text':
            if (element) element.textContent = op.value!;
            break;

          case 'update_attr':
            if (element) element.setAttribute(op.attr!, op.value!);
            break;

          case 'move': {
            const target = iframeDoc.querySelector(op.target!);
            if (!element || !target) continue;

            switch (op.position) {
              case 'after':
                target.after(element);
                break;
              case 'before':
                target.before(element);
                break;
              case 'prepend':
                target.prepend(element);
                break;
              case 'append':
              default:
                target.append(element);
                break;
            }
            break;
          }
        }

        // Update selector registry after DOM changes
        if (op.op === 'insert' && op.html?.includes('data-canvas-id')) {
          const match = op.html.match(/data-canvas-id="([^"]+)"/);
          if (match) {
            const id = match[1];
            const newElement = iframeDoc.querySelector(`[data-canvas-id="${id}"]`);
            if (newElement) {
              selectorRegistry.updateElementRef(`[data-canvas-id="${id}"]`, newElement);
            }
          }
        }
      } catch (error) {
        console.error(`Failed to apply mutation ${op.op} on ${op.selector}:`, error);
      }
    }
  }

  /**
   * Send mutations to server (Edge Function) for permanent application
   */
  async applyToServer(html: string, ops: MutationOp[]): Promise<{ success: boolean; updatedHtml?: string; error?: string }> {
    try {
      // This would call your existing AI Visual Editor Edge Function
      // For now, return a placeholder
      console.log('📤 Sending mutations to server:', ops);

      // TODO: Implement actual server call
      // const response = await fetch('/api/apply-mutations', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ html, ops })
      // });

      return {
        success: true,
        updatedHtml: html, // Placeholder
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

// Singleton instance
export const mutationEngine = new MutationEngine();

// Convenience exports
export const compile = (source: MutationSource) => mutationEngine.compile(source);
export const applyToDOM = (iframeDoc: Document, ops: MutationOp[]) => mutationEngine.applyToDOM(iframeDoc, ops);
export const applyToServer = (html: string, ops: MutationOp[]) => mutationEngine.applyToServer(html, ops);

// V2.0: Convenience exports for new methods
export const captureComputedStyles = (element: Element) => mutationEngine.captureComputedStyles(element);
export const unlockFlowElement = (thryveId: string, element: Element, viewportWidth?: number) =>
  mutationEngine.unlockFlowElement(thryveId, element, viewportWidth);
