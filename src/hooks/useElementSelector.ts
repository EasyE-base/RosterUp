import { useState, useCallback, useEffect } from 'react';

interface SelectedElement {
  selector: string;
  tagName: string;
  textContent: string;
  outerHTML: string;
  attributes: { [key: string]: string };
  position: { x: number; y: number; width: number; height: number };
}

export function useElementSelector(iframeRef: React.RefObject<HTMLIFrameElement>, enabled: boolean) {
  const [selectedElements, setSelectedElements] = useState<SelectedElement[]>([]);
  const [hoveredElement, setHoveredElement] = useState<Element | null>(null);

  // Keep backward compatibility with single selection
  const selectedElement = selectedElements.length > 0 ? selectedElements[0] : null;

  // Generate a unique CSS selector for an element
  const generateSelector = useCallback((element: Element): string => {
    if (element.id) {
      return `#${element.id}`;
    }

    const path: string[] = [];
    let current: Element | null = element;

    while (current && current !== document.body && current.tagName.toLowerCase() !== 'html') {
      let selector = current.tagName.toLowerCase();

      // Add class if available, but exclude UI-added classes
      if (current.className && typeof current.className === 'string') {
        const classes = current.className.trim().split(/\s+/)
          .filter(c => c)
          .filter(c => !c.startsWith('smart-edit-')); // Exclude UI-added classes!

        // If this element has a UNIQUE Beaver Builder node class (with hash), use it
        // Only use fl-node-HASH classes (e.g., fl-node-02j5c9gnsdrx), NOT generic ones like fl-node-content
        const uniqueNodeClass = classes.find(c =>
          c.startsWith('fl-node-') &&
          c.length > 15 && // Hashed node IDs are long (e.g., fl-node-02j5c9gnsdrx = 24 chars)
          !c.endsWith('-content') && // Exclude fl-node-content
          /fl-node-[a-z0-9]{12,}/.test(c) // Must have 12+ alphanumeric chars after fl-node-
        );
        if (uniqueNodeClass && path.length > 0) {
          // Found a unique BB node - use just this class for simplicity
          return '.' + uniqueNodeClass;
        }

        if (classes.length > 0) {
          selector += '.' + classes.join('.');
        }
      }

      // Add nth-child for specificity
      if (current.parentElement) {
        const siblings = Array.from(current.parentElement.children);
        const index = siblings.indexOf(current);
        if (siblings.filter(s => s.tagName === current!.tagName).length > 1) {
          selector += `:nth-child(${index + 1})`;
        }
      }

      path.unshift(selector);
      current = current.parentElement;
    }

    return path.join(' > ');
  }, []);

  // Get element attributes as object
  const getAttributes = useCallback((element: Element): { [key: string]: string } => {
    const attrs: { [key: string]: string } = {};
    Array.from(element.attributes).forEach(attr => {
      attrs[attr.name] = attr.value;
    });
    return attrs;
  }, []);

  // Handle click on element
  const handleElementClick = useCallback((event: MouseEvent) => {
    // Prevent all default behaviors (links, buttons, forms, etc.)
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    const target = event.target as Element;
    if (!target || target.tagName === 'HTML' || target.tagName === 'BODY') {
      return;
    }

    // If clicking on a link or inside a link, select the link itself
    let elementToSelect = target;
    if (target.closest('a')) {
      elementToSelect = target.closest('a') as Element;

      // Check if this is an internal link that needs importing
      const needsImport = elementToSelect.getAttribute('data-needs-import');
      const originalHref = elementToSelect.getAttribute('data-original-href');

      if (needsImport === 'true' && originalHref) {
        // Show helpful message about importing this page
        alert(`📄 This link points to: ${originalHref}\n\nThis page hasn't been imported yet. You can:\n• Edit the link URL using AI (select it and give an instruction)\n• Import the page in the future when multi-page import is supported`);
      }
    }

    const rect = elementToSelect.getBoundingClientRect();
    const selector = generateSelector(elementToSelect);

    const newElement: SelectedElement = {
      selector,
      tagName: elementToSelect.tagName.toLowerCase(),
      textContent: elementToSelect.textContent?.trim() || '',
      outerHTML: elementToSelect.outerHTML,
      attributes: getAttributes(elementToSelect),
      position: {
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height,
      },
    };

    // Multi-select with Cmd/Ctrl+Click
    if (event.metaKey || event.ctrlKey) {
      setSelectedElements(prev => {
        // Check if element is already selected
        const existingIndex = prev.findIndex(el => el.selector === selector);
        if (existingIndex >= 0) {
          // Deselect if already selected
          return prev.filter((_, idx) => idx !== existingIndex);
        } else {
          // Add to selection
          return [...prev, newElement];
        }
      });
    } else {
      // Single select (replace selection)
      setSelectedElements([newElement]);
    }
  }, [generateSelector, getAttributes]);

  // Handle hover on element
  const handleElementHover = useCallback((event: MouseEvent) => {
    const target = event.target as Element;
    if (!target || target.tagName === 'HTML' || target.tagName === 'BODY') {
      setHoveredElement(null);
      return;
    }

    setHoveredElement(target);
  }, []);

  // Clear hover when mouse leaves
  const handleMouseLeave = useCallback(() => {
    setHoveredElement(null);
  }, []);

  // Setup event listeners on iframe
  useEffect(() => {
    if (!enabled || !iframeRef.current) {
      return;
    }

    const iframe = iframeRef.current;

    // Wait for iframe to load
    const setupListeners = () => {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;

      if (!iframeDoc || !iframeDoc.body) {
        console.log('Iframe document not ready yet, waiting...');
        return;
      }

      console.log('Setting up Smart Edit Mode event listeners...');

      // Add hover/click listeners
      iframeDoc.addEventListener('click', handleElementClick, true);
      iframeDoc.addEventListener('mouseover', handleElementHover, true);
      iframeDoc.addEventListener('mouseleave', handleMouseLeave, true);

      // Add visual feedback styles
      const existingStyle = iframeDoc.getElementById('smart-edit-styles');
      if (!existingStyle) {
        const style = iframeDoc.createElement('style');
        style.id = 'smart-edit-styles';
        style.textContent = `
          .smart-edit-hover {
            outline: 2px dashed #3b82f6 !important;
            outline-offset: 2px !important;
            cursor: pointer !important;
          }
          .smart-edit-selected {
            outline: 3px solid #10b981 !important;
            outline-offset: 2px !important;
            position: relative !important;
          }
          .smart-edit-selected::after {
            content: '✓ Selected';
            position: absolute;
            top: -28px;
            left: 0;
            background: #10b981;
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 500;
            z-index: 10000;
            pointer-events: none;
          }
          .smart-edit-selected[data-selection-number]::after {
            content: attr(data-selection-number) ' of ' var(--selection-total, '?');
          }
        `;
        iframeDoc.head.appendChild(style);
      }

      console.log('✓ Smart Edit Mode listeners attached');
    };

    // Try to setup immediately
    setupListeners();

    // Also listen for iframe load event
    iframe.addEventListener('load', setupListeners);

    // Fallback: retry after a short delay
    const retryTimeout = setTimeout(setupListeners, 500);

    // Cleanup
    return () => {
      iframe.removeEventListener('load', setupListeners);
      clearTimeout(retryTimeout);

      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (iframeDoc) {
        iframeDoc.removeEventListener('click', handleElementClick, true);
        iframeDoc.removeEventListener('mouseover', handleElementHover, true);
        iframeDoc.removeEventListener('mouseleave', handleMouseLeave, true);
        iframeDoc.getElementById('smart-edit-styles')?.remove();
      }
    };
  }, [enabled, iframeRef, handleElementClick, handleElementHover, handleMouseLeave]);

  // Apply hover highlighting
  useEffect(() => {
    if (!iframeRef.current) return;

    const iframeDoc = iframeRef.current.contentDocument;
    if (!iframeDoc) return;

    // Remove previous hover class
    const prevHovered = iframeDoc.querySelector('.smart-edit-hover');
    if (prevHovered) {
      prevHovered.classList.remove('smart-edit-hover');
    }

    // Add hover class to current element
    if (hoveredElement && enabled) {
      hoveredElement.classList.add('smart-edit-hover');
    }
  }, [hoveredElement, enabled, iframeRef]);

  // Apply selected highlighting
  useEffect(() => {
    if (!iframeRef.current) return;

    const iframeDoc = iframeRef.current.contentDocument;
    if (!iframeDoc) return;

    // Remove all previous selected classes
    const prevSelected = iframeDoc.querySelectorAll('.smart-edit-selected');
    prevSelected.forEach(el => el.classList.remove('smart-edit-selected'));

    // Add selected class to all currently selected elements
    if (selectedElements.length > 0 && enabled) {
      // Set CSS variable for total count
      if (selectedElements.length > 1) {
        iframeDoc.documentElement.style.setProperty('--selection-total', String(selectedElements.length));
      }

      selectedElements.forEach((sel, index) => {
        const element = iframeDoc.querySelector(sel.selector);
        if (element) {
          element.classList.add('smart-edit-selected');
          // Add number badge for multi-select
          if (selectedElements.length > 1) {
            element.setAttribute('data-selection-number', String(index + 1));
          } else {
            element.removeAttribute('data-selection-number');
          }
        }
      });
    }
  }, [selectedElements, enabled, iframeRef]);

  const clearSelection = useCallback(() => {
    setSelectedElements([]);
    setHoveredElement(null);
  }, []);

  return {
    selectedElement, // For backward compatibility (first selected element)
    selectedElements, // Array of all selected elements
    hoveredElement,
    clearSelection,
  };
}
