/**
 * Live Iframe Manager - Persistent iframe with live updates
 * Avoids full page reloads, enabling smooth UXMagic-style editing
 */

export interface IframeMessage {
  type: 'elementClicked' | 'elementHovered' | 'ready' | 'scrollPosition';
  selector?: string;
  position?: { x: number; y: number };
  data?: any;
}

export interface IframeCommand {
  type: 'updateElement' | 'applyStyles' | 'highlight' | 'unhighlight' | 'injectCSS';
  selector?: string;
  styles?: Record<string, string>;
  css?: string;
  data?: any;
}

export class LiveIframeManager {
  private iframe: HTMLIFrameElement;
  private messageListeners: Map<string, ((data: any) => void)[]> = new Map();
  private isReady: boolean = false;
  private readyCallbacks: (() => void)[] = [];

  constructor(iframeElement: HTMLIFrameElement) {
    this.iframe = iframeElement;
    this.setupMessageListener();
  }

  /**
   * Setup postMessage listener for iframe communication
   */
  private setupMessageListener() {
    window.addEventListener('message', (event) => {
      // Security check: ensure message is from our iframe
      if (event.source !== this.iframe.contentWindow) return;

      const message = event.data as IframeMessage;

      // Handle ready event
      if (message.type === 'ready') {
        this.isReady = true;
        this.readyCallbacks.forEach(cb => cb());
        this.readyCallbacks = [];
        console.log('✓ Iframe ready for live editing');
      }

      // Notify listeners
      const listeners = this.messageListeners.get(message.type) || [];
      listeners.forEach(listener => listener(message));
    });
  }

  /**
   * Inject edit mode scripts into iframe
   */
  injectEditModeScripts() {
    const doc = this.iframe.contentDocument;
    if (!doc) {
      console.error('Iframe document not accessible');
      return;
    }

    // Inject the edit mode communication script
    const script = doc.createElement('script');
    script.textContent = `
      (function() {
        console.log('🚀 Smart Edit Mode communication initialized');

        // Notify parent that iframe is ready
        window.parent.postMessage({ type: 'ready' }, '*');

        // Track scroll position
        let scrollTimeout;
        window.addEventListener('scroll', function() {
          clearTimeout(scrollTimeout);
          scrollTimeout = setTimeout(function() {
            window.parent.postMessage({
              type: 'scrollPosition',
              position: { x: window.scrollX, y: window.scrollY }
            }, '*');
          }, 100);
        });

        // Element interaction tracking
        document.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();

          const target = e.target;
          if (!target || target.tagName === 'HTML' || target.tagName === 'BODY') return;

          // Generate selector
          const generateSelector = (elem) => {
            if (elem.id) return '#' + elem.id;

            const path = [];
            let current = elem;

            while (current && current !== document.body) {
              let selector = current.tagName.toLowerCase();

              if (current.className && typeof current.className === 'string') {
                const classes = current.className.trim().split(/\\s+/).filter(c => c && !c.startsWith('smart-edit-'));
                if (classes.length > 0) {
                  selector += '.' + classes.join('.');
                }
              }

              if (current.parentElement) {
                const siblings = Array.from(current.parentElement.children);
                const index = siblings.indexOf(current);
                if (siblings.filter(s => s.tagName === current.tagName).length > 1) {
                  selector += ':nth-child(' + (index + 1) + ')';
                }
              }

              path.unshift(selector);
              current = current.parentElement;
            }

            return path.join(' > ');
          };

          window.parent.postMessage({
            type: 'elementClicked',
            selector: generateSelector(target),
            position: { x: e.clientX, y: e.clientY }
          }, '*');
        }, true);

        // Hover tracking
        document.addEventListener('mouseover', function(e) {
          const target = e.target;
          if (!target || target.tagName === 'HTML' || target.tagName === 'BODY') return;

          const generateSelector = (elem) => {
            if (elem.id) return '#' + elem.id;
            const path = [];
            let current = elem;
            while (current && current !== document.body) {
              let selector = current.tagName.toLowerCase();
              if (current.className && typeof current.className === 'string') {
                const classes = current.className.trim().split(/\\s+/).filter(c => c && !c.startsWith('smart-edit-'));
                if (classes.length > 0) selector += '.' + classes.join('.');
              }
              path.unshift(selector);
              current = current.parentElement;
            }
            return path.join(' > ');
          };

          window.parent.postMessage({
            type: 'elementHovered',
            selector: generateSelector(target)
          }, '*');
        }, true);

        // Listen for commands from parent
        window.addEventListener('message', function(event) {
          const command = event.data;

          if (command.type === 'updateElement' && command.selector) {
            const elem = document.querySelector(command.selector);
            if (elem && command.data && command.data.textContent !== undefined) {
              elem.textContent = command.data.textContent;
            }
          }

          if (command.type === 'applyStyles' && command.selector && command.styles) {
            const elem = document.querySelector(command.selector);
            if (elem) {
              Object.entries(command.styles).forEach(([prop, value]) => {
                elem.style.setProperty(prop, value);
              });
            }
          }

          if (command.type === 'highlight' && command.selector) {
            // Remove previous highlights
            document.querySelectorAll('.smart-edit-highlight').forEach(el => {
              el.classList.remove('smart-edit-highlight');
            });

            const elem = document.querySelector(command.selector);
            if (elem) {
              elem.classList.add('smart-edit-highlight');
            }
          }

          if (command.type === 'unhighlight') {
            document.querySelectorAll('.smart-edit-highlight').forEach(el => {
              el.classList.remove('smart-edit-highlight');
            });
          }

          if (command.type === 'injectCSS' && command.css) {
            let styleTag = document.getElementById('smart-edit-live-styles');
            if (!styleTag) {
              styleTag = document.createElement('style');
              styleTag.id = 'smart-edit-live-styles';
              document.head.appendChild(styleTag);
            }
            styleTag.textContent = command.css;
          }
        });
      })();
    `;
    doc.body.appendChild(script);

    console.log('✓ Edit mode scripts injected into iframe');
  }

  /**
   * Send command to iframe
   */
  sendCommand(command: IframeCommand) {
    if (!this.iframe.contentWindow) {
      console.error('Iframe content window not accessible');
      return;
    }

    this.iframe.contentWindow.postMessage(command, '*');
  }

  /**
   * Listen for messages from iframe
   */
  on(eventType: string, callback: (data: any) => void) {
    if (!this.messageListeners.has(eventType)) {
      this.messageListeners.set(eventType, []);
    }
    this.messageListeners.get(eventType)!.push(callback);
  }

  /**
   * Remove event listener
   */
  off(eventType: string, callback: (data: any) => void) {
    const listeners = this.messageListeners.get(eventType);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * Wait for iframe to be ready
   */
  whenReady(callback: () => void) {
    if (this.isReady) {
      callback();
    } else {
      this.readyCallbacks.push(callback);
    }
  }

  /**
   * Highlight element in iframe
   */
  highlightElement(selector: string) {
    this.sendCommand({ type: 'highlight', selector });
  }

  /**
   * Remove all highlights
   */
  unhighlightAll() {
    this.sendCommand({ type: 'unhighlight' });
  }

  /**
   * Apply styles to element
   */
  applyStyles(selector: string, styles: Record<string, string>) {
    this.sendCommand({ type: 'applyStyles', selector, styles });
  }

  /**
   * Update element content
   */
  updateElement(selector: string, data: any) {
    this.sendCommand({ type: 'updateElement', selector, data });
  }

  /**
   * Inject CSS into iframe
   */
  injectCSS(css: string) {
    this.sendCommand({ type: 'injectCSS', css });
  }

  /**
   * Get iframe document (for direct DOM access if needed)
   */
  getDocument(): Document | null {
    return this.iframe.contentDocument || this.iframe.contentWindow?.document || null;
  }

  /**
   * Cleanup
   */
  destroy() {
    this.messageListeners.clear();
    this.readyCallbacks = [];
    this.isReady = false;
  }
}
