/**
 * Thryve ID System
 * Deterministic stable IDs for flow elements in hybrid Canvas Mode
 * V2.0: Ensures consistent IDs across reloads for undo/redo reliability
 */

/**
 * Safely get className as string
 * Handles both regular elements (className: string) and SVG elements (className: SVGAnimatedString)
 */
function getClassNameString(element: Element): string {
  const className = element.className;

  // SVG elements have className as SVGAnimatedString
  if (typeof className === 'object' && className !== null && 'baseVal' in className) {
    return (className as SVGAnimatedString).baseVal || '';
  }

  // Regular elements have className as string
  return typeof className === 'string' ? className : '';
}

/**
 * Build a stable node path for an element
 * Format: "html > body > div.hero > section[0] > h1"
 *
 * This creates a unique path from the root to the element, including:
 * - Tag name
 * - Classes (if present)
 * - Sibling index (for disambiguation)
 */
export function buildNodePath(node: Element): string {
  const path: string[] = [];
  let current: Element | null = node;

  while (current && current !== document.documentElement) {
    const siblings = Array.from(current.parentNode?.children || []);
    const index = siblings.indexOf(current);
    const tag = current.tagName.toLowerCase();
    const classNameStr = getClassNameString(current);
    const classes = classNameStr
      ? `.${classNameStr.split(' ').filter(Boolean).join('.')}`
      : '';
    path.unshift(`${tag}${classes}[${index}]`);
    current = current.parentElement;
  }

  return path.join(' > ');
}

/**
 * Generate deterministic hash from string
 * Uses simple hash algorithm for consistent results
 */
export function hash(str: string): string {
  let hash = 0;

  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }

  return Math.abs(hash).toString(36);
}

/**
 * Generate stable Thryve ID for an element
 * Format: "thryve-{hash(pageId:nodePath)}"
 *
 * CRITICAL: No timestamp - deterministic hash only
 * This ensures the same element gets the same ID across reloads
 */
export function generateThryveId(node: Element, pageId: string): string {
  const nodePath = buildNodePath(node);
  return `thryve-${hash(`${pageId}:${nodePath}`)}`;
}

/**
 * Generate CSS selector from element
 * Uses ID, classes, and attributes to create a unique selector
 */
export function generateSelector(node: Element): string {
  // Prefer ID if available
  if (node.id) {
    return `#${node.id}`;
  }

  // Build selector from tag, classes, and attributes
  const tag = node.tagName.toLowerCase();
  const classNameStr = getClassNameString(node);
  const classes = classNameStr
    ? `.${classNameStr.split(' ').filter(Boolean).join('.')}`
    : '';

  // Use nth-of-type for disambiguation
  const siblings = Array.from(node.parentElement?.children || []).filter(
    (el) => el.tagName === node.tagName
  );
  const index = siblings.indexOf(node);

  if (siblings.length > 1) {
    return `${tag}${classes}:nth-of-type(${index + 1})`;
  }

  return `${tag}${classes}`;
}

/**
 * Check if an element is selectable (should have a Thryve ID)
 * Includes: headings, paragraphs, images, sections, buttons, divs with content
 */
export function isSelectableElement(node: Element): boolean {
  const tag = node.tagName.toLowerCase();

  // Always selectable tags
  const alwaysSelectable = [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'p', 'img', 'button', 'a', 'video', 'iframe',
    'section', 'article', 'header', 'footer', 'nav', 'aside'
  ];

  if (alwaysSelectable.includes(tag)) {
    return true;
  }

  // Divs are selectable if they have meaningful content
  if (tag === 'div') {
    // Has background image
    const style = window.getComputedStyle(node);
    if (style.backgroundImage && style.backgroundImage !== 'none') {
      return true;
    }

    // Has significant dimensions (likely a layout container)
    const rect = node.getBoundingClientRect();
    if (rect.width > 100 && rect.height > 50) {
      return true;
    }
  }

  return false;
}

/**
 * Element mapping stored in Supabase
 */
export interface ElementMapping {
  selector: string;
  nodePath: string;
  locked: boolean;
  createdAt?: number;
  lastModified?: number;
}

/**
 * Element mappings record (stored in website_pages.element_mappings)
 */
export type ElementMappings = Record<string, ElementMapping>;
