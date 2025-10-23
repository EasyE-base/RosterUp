/**
 * Breakpoint System for Canvas Mode
 * Handles responsive positioning with per-breakpoint transforms
 */

export type Breakpoint = 'desktop' | 'tablet' | 'mobile';

export interface Transform {
  left: number;      // px
  top: number;       // px
  width: number;     // px
  height: number;    // px
  rotate: number;    // degrees
}

export interface BreakpointTransforms {
  desktop: Transform;
  tablet?: Transform;
  mobile?: Transform;
}

export interface BreakpointConfig {
  desktop: { minWidth: number; maxWidth: number };
  tablet: { minWidth: number; maxWidth: number };
  mobile: { minWidth: number; maxWidth: number };
}

export const BREAKPOINTS: BreakpointConfig = {
  desktop: { minWidth: 1025, maxWidth: Infinity },
  tablet: { minWidth: 769, maxWidth: 1024 },
  mobile: { minWidth: 0, maxWidth: 768 }
};

// Typical viewport widths for each breakpoint (for scaling calculations)
export const TYPICAL_WIDTHS: Record<Breakpoint, number> = {
  desktop: 1440,
  tablet: 768,
  mobile: 375
};

/**
 * Generate CSS custom properties for all breakpoints
 * Outputs CSS that can be injected into a <style> tag
 */
export function buildBreakpointCSS(
  elements: Map<string, {
    id: string;
    mode: 'flow' | 'absolute';
    breakpoints?: BreakpointTransforms;
    zIndex?: number;
  }>
): string {
  let css = '';

  for (const [id, elem] of elements) {
    if (!elem.breakpoints || elem.mode !== 'absolute') continue;

    // Desktop (base)
    css += buildElementCSS(id, elem.breakpoints.desktop, elem.zIndex);

    // Tablet
    if (elem.breakpoints.tablet) {
      css += `@media (max-width: ${BREAKPOINTS.tablet.maxWidth}px) {\n`;
      css += buildElementCSS(id, elem.breakpoints.tablet);
      css += `}\n\n`;
    }

    // Mobile
    if (elem.breakpoints.mobile) {
      css += `@media (max-width: ${BREAKPOINTS.mobile.maxWidth}px) {\n`;
      css += buildElementCSS(id, elem.breakpoints.mobile);
      css += `}\n\n`;
    }
  }

  return css;
}

/**
 * Generate CSS for a single element at a specific breakpoint
 */
function buildElementCSS(id: string, transform: Transform, zIndex?: number): string {
  return `[data-canvas-id="${id}"] {
  --el-left: ${transform.left}px;
  --el-top: ${transform.top}px;
  --el-width: ${transform.width}px;
  --el-height: ${transform.height}px;
  --el-rotate: ${transform.rotate}deg;${zIndex ? `\n  z-index: ${zIndex};` : ''}
}\n\n`;
}

/**
 * Auto-scale transform when switching breakpoints
 * Proportionally scales position and size based on typical viewport widths
 */
export function normalizeTransformBetweenBreakpoints(
  sourceTransform: Transform,
  sourceBreakpoint: Breakpoint,
  targetBreakpoint: Breakpoint
): Transform {
  // No scaling needed if same breakpoint
  if (sourceBreakpoint === targetBreakpoint) {
    return { ...sourceTransform };
  }

  // Calculate scale ratio based on typical viewport widths
  const sourceWidth = TYPICAL_WIDTHS[sourceBreakpoint];
  const targetWidth = TYPICAL_WIDTHS[targetBreakpoint];
  const scale = targetWidth / sourceWidth;

  return {
    left: Math.round(sourceTransform.left * scale),
    top: Math.round(sourceTransform.top * scale),
    width: Math.round(sourceTransform.width * scale),
    height: Math.round(sourceTransform.height * scale),
    rotate: sourceTransform.rotate  // Keep rotation unchanged
  };
}

/**
 * Create initial transforms for all breakpoints from a desktop transform
 * Auto-generates tablet and mobile transforms using proportional scaling
 */
export function createResponsiveTransforms(desktopTransform: Transform): BreakpointTransforms {
  return {
    desktop: desktopTransform,
    tablet: normalizeTransformBetweenBreakpoints(desktopTransform, 'desktop', 'tablet'),
    mobile: normalizeTransformBetweenBreakpoints(desktopTransform, 'desktop', 'mobile')
  };
}

/**
 * Get the current active breakpoint based on viewport width
 */
export function getCurrentBreakpoint(viewportWidth: number): Breakpoint {
  if (viewportWidth >= BREAKPOINTS.desktop.minWidth) return 'desktop';
  if (viewportWidth >= BREAKPOINTS.tablet.minWidth) return 'tablet';
  return 'mobile';
}

/**
 * Validate that a transform is within bounds
 */
export function validateTransform(transform: Transform, viewportWidth: number, viewportHeight: number): boolean {
  // Check if element is within viewport bounds
  const rightEdge = transform.left + transform.width;
  const bottomEdge = transform.top + transform.height;

  // Allow slight overflow (10% tolerance)
  const tolerance = 0.1;
  const maxWidth = viewportWidth * (1 + tolerance);
  const maxHeight = viewportHeight * (1 + tolerance);

  return transform.left >= -transform.width * tolerance &&
         transform.top >= -transform.height * tolerance &&
         rightEdge <= maxWidth &&
         bottomEdge <= maxHeight;
}

/**
 * Clamp transform to viewport bounds
 */
export function clampTransformToViewport(
  transform: Transform,
  viewportWidth: number,
  viewportHeight: number
): Transform {
  const minLeft = 0;
  const minTop = 0;
  const maxLeft = viewportWidth - transform.width;
  const maxTop = viewportHeight - transform.height;

  return {
    ...transform,
    left: Math.max(minLeft, Math.min(maxLeft, transform.left)),
    top: Math.max(minTop, Math.min(maxTop, transform.top))
  };
}
