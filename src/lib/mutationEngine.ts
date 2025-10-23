/**
 * Unified Mutation Engine
 * Compiles Canvas elements and Smart Edit actions into DOM mutations
 * Shared by both modes for consistency
 */

import { buildBreakpointCSS } from './breakpoints';
import { selectorRegistry } from './selectorRegistry';
import type {
  MutationOp,
  MutationSource,
  CanvasElement,
  OperationContext,
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
   * 1. Generate breakpoint CSS
   * 2. Insert/update canvas elements
   * 3. Register in selector registry
   */
  private compileCanvasElements(elements: Map<string, CanvasElement>): MutationOp[] {
    const ops: MutationOp[] = [];

    // Step 1: Register all elements in selector registry
    for (const [id] of elements) {
      selectorRegistry.registerCanvasElement(id);
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
      // Check if style tag exists, if not create it
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
        // Absolute positioned element - insert with canvas styles
        ops.push({
          op: 'insert',
          selector: 'body',
          position: 'append',
          html: this.elementToHTML(elem),
        });
      } else {
        // Flow element - use existing selector
        // (This would be for unlocked elements that were converted from flow)
        if (elem.originalSelector) {
          // Element was unlocked from a flow element
          // We need to wrap it and make it absolute
          ops.push({
            op: 'insert',
            selector: elem.originalSelector,
            position: 'after',
            html: this.elementToHTML(elem),
          });
          // Delete the original
          ops.push({
            op: 'delete',
            selector: elem.originalSelector,
          });
        }
      }
    }

    return ops;
  }

  /**
   * Convert CanvasElement to HTML string
   */
  private elementToHTML(elem: CanvasElement): string {
    const baseStyle = elem.mode === 'absolute'
      ? 'position:absolute; left:var(--el-left); top:var(--el-top); width:var(--el-width); height:var(--el-height); transform:rotate(var(--el-rotate));'
      : '';

    // Merge custom styles
    const customStyles = elem.styles
      ? Object.entries(elem.styles)
          .map(([key, value]) => `${this.camelToKebab(key)}:${value}`)
          .join('; ')
      : '';

    const combinedStyle = [baseStyle, customStyles].filter(Boolean).join(' ');
    const styleAttr = combinedStyle ? ` style="${combinedStyle}"` : '';

    switch (elem.type) {
      case 'text':
        return `<p class="canvas-element canvas-text" data-canvas-id="${elem.id}"${styleAttr}>${this.escapeHTML(elem.content.text || '')}</p>`;

      case 'image':
        return `<img class="canvas-element canvas-image" data-canvas-id="${elem.id}" src="${elem.content.src || ''}" alt="${this.escapeHTML(elem.content.alt || '')}"${styleAttr} />`;

      case 'button':
        return `<a class="canvas-element canvas-button" data-canvas-id="${elem.id}" href="${elem.content.href || '#'}"${styleAttr}>${this.escapeHTML(elem.content.text || 'Button')}</a>`;

      case 'video':
        return `<video class="canvas-element canvas-video" data-canvas-id="${elem.id}" src="${elem.content.src || ''}" controls${styleAttr}></video>`;

      case 'section':
        return `<div class="canvas-element canvas-section" data-canvas-id="${elem.id}"${styleAttr}>${elem.content.html || ''}</div>`;

      case 'custom':
        return `<div class="canvas-element canvas-custom" data-canvas-id="${elem.id}"${styleAttr}>${elem.content.html || ''}</div>`;

      default:
        return `<div class="canvas-element" data-canvas-id="${elem.id}"${styleAttr}></div>`;
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
