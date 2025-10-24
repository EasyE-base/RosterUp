/**
 * Responsive Transform Generator
 * Auto-generates tablet and mobile transforms from desktop transforms
 * V2.0: Includes decimal clamping for pixel snapping and overflow guards
 */

import type { Transform, BreakpointTransforms } from './breakpoints';

/**
 * Clamp number to N decimal places for pixel snapping
 * Prevents sub-pixel rendering issues
 */
export function clamp(value: number, decimals: number = 2): number {
  const multiplier = Math.pow(10, decimals);
  return Math.round(value * multiplier) / multiplier;
}

/**
 * Generate responsive transforms for tablet and mobile from desktop transform
 * Uses proportional scaling based on viewport width
 *
 * @param desktopTransform - The base desktop transform
 * @param viewportWidth - Current desktop viewport width (default: 1440)
 * @returns Complete breakpoint transforms (desktop, tablet, mobile)
 */
export function generateResponsiveTransforms(
  desktopTransform: Transform,
  viewportWidth: number = 1440
): BreakpointTransforms {
  // Calculate scaling factors
  const scale = {
    tablet: 768 / viewportWidth,
    mobile: 375 / viewportWidth,
  };

  // Generate tablet transform (proportional scaling)
  const tabletTransform: Transform = {
    x: clamp(desktopTransform.x * scale.tablet),
    y: clamp(desktopTransform.y * scale.tablet),
    width: clamp(desktopTransform.width * scale.tablet),
    height: clamp(desktopTransform.height * scale.tablet),
    rotation: desktopTransform.rotation, // Preserve rotation
  };

  // Generate mobile transform with overflow guards
  const mobileWidth = clamp(desktopTransform.width * scale.mobile);
  const MOBILE_MAX_WIDTH = 343; // 375px viewport - 32px padding

  // Warn if element would overflow mobile viewport
  if (mobileWidth > MOBILE_MAX_WIDTH) {
    console.warn(
      `⚠️ Element width ${mobileWidth}px exceeds mobile viewport maximum ${MOBILE_MAX_WIDTH}px`
    );
  }

  const mobileTransform: Transform = {
    x: clamp(desktopTransform.x * scale.mobile),
    y: clamp(desktopTransform.y * scale.mobile),
    width: Math.min(mobileWidth, MOBILE_MAX_WIDTH), // Guard overflow
    height: clamp(desktopTransform.height * scale.mobile),
    rotation: desktopTransform.rotation,
  };

  return {
    desktop: desktopTransform,
    tablet: tabletTransform,
    mobile: mobileTransform,
  };
}

/**
 * Validate transform values
 * Ensures transforms are within reasonable bounds
 */
export function validateTransform(transform: Transform, breakpoint: 'desktop' | 'tablet' | 'mobile'): boolean {
  const limits = {
    desktop: { maxWidth: 1920, maxHeight: 1080 },
    tablet: { maxWidth: 768, maxHeight: 1024 },
    mobile: { maxWidth: 375, maxHeight: 812 },
  };

  const limit = limits[breakpoint];

  // Check for negative values
  if (transform.width < 0 || transform.height < 0) {
    console.error(`❌ Invalid transform: negative dimensions`);
    return false;
  }

  // Check for excessive size
  if (transform.width > limit.maxWidth * 2 || transform.height > limit.maxHeight * 2) {
    console.warn(
      `⚠️ Transform exceeds reasonable bounds for ${breakpoint}: ${transform.width}x${transform.height}`
    );
  }

  return true;
}

/**
 * Scale transform by a factor
 * Useful for zoom operations
 */
export function scaleTransform(transform: Transform, factor: number): Transform {
  return {
    x: clamp(transform.x * factor),
    y: clamp(transform.y * factor),
    width: clamp(transform.width * factor),
    height: clamp(transform.height * factor),
    rotation: transform.rotation,
  };
}

/**
 * Constrain transform to viewport bounds
 * Prevents elements from going offscreen
 */
export function constrainToViewport(
  transform: Transform,
  viewportWidth: number,
  viewportHeight: number
): Transform {
  return {
    x: clamp(Math.max(0, Math.min(transform.x, viewportWidth - transform.width))),
    y: clamp(Math.max(0, Math.min(transform.y, viewportHeight - transform.height))),
    width: clamp(Math.min(transform.width, viewportWidth)),
    height: clamp(Math.min(transform.height, viewportHeight)),
    rotation: transform.rotation,
  };
}
