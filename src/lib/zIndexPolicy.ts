/**
 * Z-Index Policy
 * Namespace enforcement for layering in hybrid Canvas Mode
 * V2.0: Prevents conflicts between flow DOM, absolute elements, and UI overlays
 */

import type { CanvasElement } from './types';

/**
 * Z-Index namespace layers
 * Reserved ranges to prevent conflicts
 */
export const Z_INDEX_LAYERS = {
  FLOW_DOM: 'auto', // Keep original flow DOM z-index
  ABSOLUTE_MIN: 10000, // Unlocked elements start here
  ABSOLUTE_MAX: 10999, // Maximum for unlocked elements
  HANDLES: 11000, // Selection handles and transform controls
  OVERLAY: 11001, // Context menus and floating panels
  MODAL: 11002, // E2E test panel, debug tools, modals
  TOOLTIP: 11003, // Tooltips and notifications
} as const;

/**
 * Assign z-index to an element based on its mode and policy
 *
 * @param element - Canvas element
 * @returns z-index value or 'auto' for flow elements
 */
export function assignZIndex(element: CanvasElement): number | 'auto' {
  // Flow elements keep their original z-index
  if (element.mode === 'flow') {
    return 'auto';
  }

  // Absolute elements use reserved namespace
  const requestedZIndex = element.zIndex ?? Z_INDEX_LAYERS.ABSOLUTE_MIN;

  // Enforce maximum bound
  if (requestedZIndex > Z_INDEX_LAYERS.ABSOLUTE_MAX) {
    console.warn(
      `⚠️ Element ${element.id} z-index ${requestedZIndex} exceeds namespace max ${Z_INDEX_LAYERS.ABSOLUTE_MAX}. Clamping.`
    );
    return Z_INDEX_LAYERS.ABSOLUTE_MAX;
  }

  // Enforce minimum bound
  if (requestedZIndex < Z_INDEX_LAYERS.ABSOLUTE_MIN) {
    console.warn(
      `⚠️ Element ${element.id} z-index ${requestedZIndex} below namespace min ${Z_INDEX_LAYERS.ABSOLUTE_MIN}. Clamping.`
    );
    return Z_INDEX_LAYERS.ABSOLUTE_MIN;
  }

  return requestedZIndex;
}

/**
 * Get z-index for UI layer
 *
 * @param layer - UI layer type
 * @returns z-index value for the layer
 */
export function getUILayerZIndex(
  layer: 'handles' | 'overlay' | 'modal' | 'tooltip'
): number {
  switch (layer) {
    case 'handles':
      return Z_INDEX_LAYERS.HANDLES;
    case 'overlay':
      return Z_INDEX_LAYERS.OVERLAY;
    case 'modal':
      return Z_INDEX_LAYERS.MODAL;
    case 'tooltip':
      return Z_INDEX_LAYERS.TOOLTIP;
    default:
      return Z_INDEX_LAYERS.OVERLAY;
  }
}

/**
 * Validate z-index is within allowed range
 *
 * @param zIndex - Z-index value to validate
 * @param mode - Element mode (flow or absolute)
 * @returns true if valid, false otherwise
 */
export function validateZIndex(
  zIndex: number | 'auto',
  mode: 'flow' | 'absolute'
): boolean {
  // Flow elements should use 'auto'
  if (mode === 'flow') {
    return zIndex === 'auto';
  }

  // Absolute elements must be numbers within range
  if (typeof zIndex !== 'number') {
    return false;
  }

  return (
    zIndex >= Z_INDEX_LAYERS.ABSOLUTE_MIN && zIndex <= Z_INDEX_LAYERS.ABSOLUTE_MAX
  );
}

/**
 * Get next available z-index for a new absolute element
 * Finds the highest current z-index and adds 1
 *
 * @param elements - Map of current canvas elements
 * @returns Next available z-index
 */
export function getNextZIndex(elements: Map<string, CanvasElement>): number {
  let maxZIndex = Z_INDEX_LAYERS.ABSOLUTE_MIN;

  for (const element of elements.values()) {
    if (element.mode === 'absolute' && typeof element.zIndex === 'number') {
      maxZIndex = Math.max(maxZIndex, element.zIndex);
    }
  }

  const nextZIndex = maxZIndex + 1;

  // Check if we've exceeded the namespace
  if (nextZIndex > Z_INDEX_LAYERS.ABSOLUTE_MAX) {
    console.warn(
      `⚠️ Reached maximum z-index ${Z_INDEX_LAYERS.ABSOLUTE_MAX}. Recycling from minimum.`
    );
    return Z_INDEX_LAYERS.ABSOLUTE_MIN;
  }

  return nextZIndex;
}

/**
 * Bring element to front
 * Sets z-index to highest + 1
 *
 * @param element - Element to bring to front
 * @param elements - Map of all canvas elements
 * @returns Updated element with new z-index
 */
export function bringToFront(
  element: CanvasElement,
  elements: Map<string, CanvasElement>
): CanvasElement {
  if (element.mode === 'flow') {
    console.warn(`⚠️ Cannot bring flow element ${element.id} to front`);
    return element;
  }

  const newZIndex = getNextZIndex(elements);

  return {
    ...element,
    zIndex: newZIndex,
  };
}

/**
 * Send element to back
 * Sets z-index to minimum
 *
 * @param element - Element to send to back
 * @returns Updated element with new z-index
 */
export function sendToBack(element: CanvasElement): CanvasElement {
  if (element.mode === 'flow') {
    console.warn(`⚠️ Cannot send flow element ${element.id} to back`);
    return element;
  }

  return {
    ...element,
    zIndex: Z_INDEX_LAYERS.ABSOLUTE_MIN,
  };
}

/**
 * Move element forward one layer
 *
 * @param element - Element to move forward
 * @returns Updated element with new z-index
 */
export function moveForward(element: CanvasElement): CanvasElement {
  if (element.mode === 'flow') {
    console.warn(`⚠️ Cannot move flow element ${element.id} forward`);
    return element;
  }

  const currentZIndex = element.zIndex ?? Z_INDEX_LAYERS.ABSOLUTE_MIN;
  const newZIndex = Math.min(currentZIndex + 1, Z_INDEX_LAYERS.ABSOLUTE_MAX);

  return {
    ...element,
    zIndex: newZIndex,
  };
}

/**
 * Move element backward one layer
 *
 * @param element - Element to move backward
 * @returns Updated element with new z-index
 */
export function moveBackward(element: CanvasElement): CanvasElement {
  if (element.mode === 'flow') {
    console.warn(`⚠️ Cannot move flow element ${element.id} backward`);
    return element;
  }

  const currentZIndex = element.zIndex ?? Z_INDEX_LAYERS.ABSOLUTE_MIN;
  const newZIndex = Math.max(currentZIndex - 1, Z_INDEX_LAYERS.ABSOLUTE_MIN);

  return {
    ...element,
    zIndex: newZIndex,
  };
}
