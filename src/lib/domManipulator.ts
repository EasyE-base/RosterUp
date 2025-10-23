/**
 * DOM Manipulator - Live DOM editing engine for Smart Edit Mode
 * Enables instant visual feedback without page reloads (UXMagic-style)
 */

export interface DOMChange {
  type: 'text' | 'style' | 'attribute' | 'insert' | 'delete' | 'replace';
  selector: string;
  property?: string;
  value?: string;
  oldValue?: string;
  element?: string; // For insert operations
  position?: 'before' | 'after' | 'prepend' | 'append';
  timestamp: number;
}

export class DOMManipulator {
  private iframe: HTMLIFrameElement | null = null;
  private changeLog: DOMChange[] = [];

  constructor(iframeRef: HTMLIFrameElement | null) {
    this.iframe = iframeRef;
  }

  /**
   * Get the iframe's document
   */
  private getIframeDoc(): Document | null {
    if (!this.iframe) return null;
    return this.iframe.contentDocument || this.iframe.contentWindow?.document || null;
  }

  /**
   * Find element(s) in iframe using selector
   */
  private findElement(selector: string): Element | null {
    const doc = this.getIframeDoc();
    if (!doc) return null;
    return doc.querySelector(selector);
  }

  /**
   * Update text content of an element
   */
  updateText(selector: string, newText: string): boolean {
    const element = this.findElement(selector);
    if (!element) {
      console.error(`Element not found: ${selector}`);
      return false;
    }

    const oldText = element.textContent || '';

    // Log the change
    this.changeLog.push({
      type: 'text',
      selector,
      value: newText,
      oldValue: oldText,
      timestamp: Date.now(),
    });

    // Apply the change
    element.textContent = newText;

    console.log(`✓ Text updated:`, { selector, oldText, newText });
    return true;
  }

  /**
   * Update inline style of an element
   */
  updateStyle(selector: string, property: string, value: string): boolean {
    const element = this.findElement(selector) as HTMLElement;
    if (!element) {
      console.error(`Element not found: ${selector}`);
      return false;
    }

    const oldValue = element.style.getPropertyValue(property);

    // Log the change
    this.changeLog.push({
      type: 'style',
      selector,
      property,
      value,
      oldValue,
      timestamp: Date.now(),
    });

    // Apply the change
    element.style.setProperty(property, value);

    console.log(`✓ Style updated:`, { selector, property, oldValue, value });
    return true;
  }

  /**
   * Update multiple styles at once
   */
  updateStyles(selector: string, styles: Record<string, string>): boolean {
    const element = this.findElement(selector) as HTMLElement;
    if (!element) {
      console.error(`Element not found: ${selector}`);
      return false;
    }

    Object.entries(styles).forEach(([property, value]) => {
      const oldValue = element.style.getPropertyValue(property);

      this.changeLog.push({
        type: 'style',
        selector,
        property,
        value,
        oldValue,
        timestamp: Date.now(),
      });

      element.style.setProperty(property, value);
    });

    console.log(`✓ Styles updated:`, { selector, styles });
    return true;
  }

  /**
   * Update attribute of an element
   */
  updateAttribute(selector: string, attribute: string, value: string): boolean {
    const element = this.findElement(selector);
    if (!element) {
      console.error(`Element not found: ${selector}`);
      return false;
    }

    const oldValue = element.getAttribute(attribute) || '';

    // Log the change
    this.changeLog.push({
      type: 'attribute',
      selector,
      property: attribute,
      value,
      oldValue,
      timestamp: Date.now(),
    });

    // Apply the change
    element.setAttribute(attribute, value);

    console.log(`✓ Attribute updated:`, { selector, attribute, oldValue, value });
    return true;
  }

  /**
   * Replace an element's outer HTML (for image src changes, etc.)
   */
  replaceElement(selector: string, newOuterHTML: string): boolean {
    const element = this.findElement(selector);
    if (!element) {
      console.error(`Element not found: ${selector}`);
      return false;
    }

    const oldOuterHTML = element.outerHTML;

    // Log the change
    this.changeLog.push({
      type: 'replace',
      selector,
      value: newOuterHTML,
      oldValue: oldOuterHTML,
      timestamp: Date.now(),
    });

    // Apply the change
    element.outerHTML = newOuterHTML;

    console.log(`✓ Element replaced:`, { selector });
    return true;
  }

  /**
   * Insert HTML at a position relative to an element
   */
  insertHTML(selector: string, html: string, position: 'before' | 'after' | 'prepend' | 'append' = 'append'): boolean {
    const element = this.findElement(selector);
    if (!element) {
      console.error(`Element not found: ${selector}`);
      return false;
    }

    // Log the change
    this.changeLog.push({
      type: 'insert',
      selector,
      element: html,
      position,
      timestamp: Date.now(),
    });

    // Apply the change
    switch (position) {
      case 'before':
        element.insertAdjacentHTML('beforebegin', html);
        break;
      case 'after':
        element.insertAdjacentHTML('afterend', html);
        break;
      case 'prepend':
        element.insertAdjacentHTML('afterbegin', html);
        break;
      case 'append':
        element.insertAdjacentHTML('beforeend', html);
        break;
    }

    console.log(`✓ HTML inserted:`, { selector, position });
    return true;
  }

  /**
   * Delete an element
   */
  deleteElement(selector: string): boolean {
    const element = this.findElement(selector);
    if (!element) {
      console.error(`Element not found: ${selector}`);
      return false;
    }

    const oldOuterHTML = element.outerHTML;

    // Log the change
    this.changeLog.push({
      type: 'delete',
      selector,
      oldValue: oldOuterHTML,
      timestamp: Date.now(),
    });

    // Apply the change
    element.remove();

    console.log(`✓ Element deleted:`, { selector });
    return true;
  }

  /**
   * Apply CSS rule to iframe's style tag
   */
  injectCSS(css: string): boolean {
    const doc = this.getIframeDoc();
    if (!doc) return false;

    // Find or create a style tag for injected styles
    let styleTag = doc.getElementById('smart-edit-injected-styles') as HTMLStyleElement;

    if (!styleTag) {
      styleTag = doc.createElement('style');
      styleTag.id = 'smart-edit-injected-styles';
      doc.head.appendChild(styleTag);
    }

    // Append the new CSS
    styleTag.textContent += '\n' + css;

    console.log(`✓ CSS injected`);
    return true;
  }

  /**
   * Replace entire CSS in the injected style tag
   */
  replaceInjectedCSS(css: string): boolean {
    const doc = this.getIframeDoc();
    if (!doc) return false;

    let styleTag = doc.getElementById('smart-edit-injected-styles') as HTMLStyleElement;

    if (!styleTag) {
      styleTag = doc.createElement('style');
      styleTag.id = 'smart-edit-injected-styles';
      doc.head.appendChild(styleTag);
    }

    styleTag.textContent = css;

    console.log(`✓ CSS replaced`);
    return true;
  }

  /**
   * Get current HTML of the entire body (for saving)
   */
  getCurrentHTML(): string {
    const doc = this.getIframeDoc();
    if (!doc || !doc.body) return '';

    // Remove smart-edit specific elements before serializing
    const clone = doc.body.cloneNode(true) as HTMLElement;
    clone.querySelectorAll('[id^="smart-edit-"]').forEach(el => el.remove());
    clone.querySelectorAll('.smart-edit-hover, .smart-edit-selected').forEach(el => {
      el.classList.remove('smart-edit-hover', 'smart-edit-selected');
    });

    return clone.innerHTML;
  }

  /**
   * Get current CSS (including injected styles)
   */
  getCurrentCSS(): string {
    const doc = this.getIframeDoc();
    if (!doc) return '';

    let css = '';

    // Get all style tags
    doc.querySelectorAll('style').forEach(style => {
      if (style.id !== 'smart-edit-styles') { // Exclude our internal styles
        css += style.textContent + '\n';
      }
    });

    return css;
  }

  /**
   * Get change log (for undo/redo)
   */
  getChangeLog(): DOMChange[] {
    return [...this.changeLog];
  }

  /**
   * Clear change log
   */
  clearChangeLog(): void {
    this.changeLog = [];
  }

  /**
   * Batch execute multiple changes (for efficiency)
   */
  batchUpdate(changes: Array<() => boolean>): boolean {
    const doc = this.getIframeDoc();
    if (!doc) return false;

    // Disable rendering during batch
    const body = doc.body as HTMLElement;
    const originalDisplay = body.style.display;
    body.style.display = 'none';

    let allSucceeded = true;
    changes.forEach(changeFn => {
      if (!changeFn()) {
        allSucceeded = false;
      }
    });

    // Re-enable rendering
    body.style.display = originalDisplay;

    console.log(`✓ Batch update ${allSucceeded ? 'succeeded' : 'completed with errors'}`);
    return allSucceeded;
  }
}
