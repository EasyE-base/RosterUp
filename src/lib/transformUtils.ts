/**
 * Transform Utilities
 * Helper functions for resize, rotate, and drag operations
 */

import type { Transform, Point } from './types';

export type ResizeHandle =
  | 'top-left'
  | 'top'
  | 'top-right'
  | 'right'
  | 'bottom-right'
  | 'bottom'
  | 'bottom-left'
  | 'left';

export type TransformOperation =
  | { type: 'move'; delta: Point }
  | { type: 'resize'; handle: ResizeHandle; delta: Point; aspectRatio?: number }
  | { type: 'rotate'; angle: number };

/**
 * Apply a transform operation to a Transform object
 */
export function applyTransformOperation(
  transform: Transform,
  operation: TransformOperation
): Transform {
  switch (operation.type) {
    case 'move':
      return {
        ...transform,
        left: transform.left + operation.delta.x,
        top: transform.top + operation.delta.y,
      };

    case 'resize':
      return applyResize(transform, operation.handle, operation.delta, operation.aspectRatio);

    case 'rotate':
      return {
        ...transform,
        rotate: normalizeAngle(transform.rotate + operation.angle),
      };

    default:
      return transform;
  }
}

/**
 * Apply resize based on handle and delta
 */
function applyResize(
  transform: Transform,
  handle: ResizeHandle,
  delta: Point,
  aspectRatio?: number
): Transform {
  const { left, top, width, height, rotate } = transform;

  // For now, we'll implement resize without rotation
  // TODO: Handle rotated element resize
  const newTransform = { ...transform };

  switch (handle) {
    case 'top-left':
      newTransform.left = left + delta.x;
      newTransform.top = top + delta.y;
      newTransform.width = width - delta.x;
      newTransform.height = height - delta.y;
      break;

    case 'top':
      newTransform.top = top + delta.y;
      newTransform.height = height - delta.y;
      break;

    case 'top-right':
      newTransform.top = top + delta.y;
      newTransform.width = width + delta.x;
      newTransform.height = height - delta.y;
      break;

    case 'right':
      newTransform.width = width + delta.x;
      break;

    case 'bottom-right':
      newTransform.width = width + delta.x;
      newTransform.height = height + delta.y;
      break;

    case 'bottom':
      newTransform.height = height + delta.y;
      break;

    case 'bottom-left':
      newTransform.left = left + delta.x;
      newTransform.width = width - delta.x;
      newTransform.height = height + delta.y;
      break;

    case 'left':
      newTransform.left = left + delta.x;
      newTransform.width = width - delta.x;
      break;
  }

  // Maintain aspect ratio if Shift is held
  if (aspectRatio && (handle === 'top-left' || handle === 'top-right' || handle === 'bottom-left' || handle === 'bottom-right')) {
    const newAspectRatio = newTransform.width / newTransform.height;

    if (newAspectRatio > aspectRatio) {
      // Width is too large, adjust it
      newTransform.width = newTransform.height * aspectRatio;

      // Adjust position for left-side handles
      if (handle === 'top-left' || handle === 'bottom-left') {
        newTransform.left = left + width - newTransform.width;
      }
    } else {
      // Height is too large, adjust it
      newTransform.height = newTransform.width / aspectRatio;

      // Adjust position for top-side handles
      if (handle === 'top-left' || handle === 'top-right') {
        newTransform.top = top + height - newTransform.height;
      }
    }
  }

  // Enforce minimum size
  const minSize = 20;
  if (newTransform.width < minSize) {
    newTransform.width = minSize;
    if (handle.includes('left')) {
      newTransform.left = left + width - minSize;
    }
  }
  if (newTransform.height < minSize) {
    newTransform.height = minSize;
    if (handle.includes('top')) {
      newTransform.top = top + height - minSize;
    }
  }

  return newTransform;
}

/**
 * Calculate rotation angle from center point
 */
export function calculateRotationAngle(
  center: Point,
  currentPoint: Point,
  previousPoint: Point
): number {
  const angle1 = Math.atan2(previousPoint.y - center.y, previousPoint.x - center.x);
  const angle2 = Math.atan2(currentPoint.y - center.y, currentPoint.x - center.x);
  return (angle2 - angle1) * (180 / Math.PI);
}

/**
 * Normalize angle to 0-360 range
 */
export function normalizeAngle(angle: number): number {
  angle = angle % 360;
  if (angle < 0) angle += 360;
  return angle;
}

/**
 * Snap value to grid
 */
export function snapToGrid(value: number, gridSize: number = 8, threshold: number = 4): number {
  const nearestGrid = Math.round(value / gridSize) * gridSize;
  if (Math.abs(value - nearestGrid) < threshold) {
    return nearestGrid;
  }
  return value;
}

/**
 * Snap transform to grid and alignment guides
 */
export function snapTransform(
  transform: Transform,
  gridSize: number = 8,
  threshold: number = 4
): Transform {
  return {
    ...transform,
    left: snapToGrid(transform.left, gridSize, threshold),
    top: snapToGrid(transform.top, gridSize, threshold),
  };
}

/**
 * Get cursor style for resize handle
 */
export function getCursorForHandle(handle: ResizeHandle, rotation: number = 0): string {
  // Adjust cursor based on rotation
  const cursorMap: Record<ResizeHandle, string> = {
    'top-left': 'nwse-resize',
    'top': 'ns-resize',
    'top-right': 'nesw-resize',
    'right': 'ew-resize',
    'bottom-right': 'nwse-resize',
    'bottom': 'ns-resize',
    'bottom-left': 'nesw-resize',
    'left': 'ew-resize',
  };

  // TODO: Adjust cursor based on rotation
  return cursorMap[handle];
}

/**
 * Get center point of a transform
 */
export function getTransformCenter(transform: Transform): Point {
  return {
    x: transform.left + transform.width / 2,
    y: transform.top + transform.height / 2,
  };
}

/**
 * Check if point is inside transform bounds
 */
export function isPointInTransform(point: Point, transform: Transform): boolean {
  return (
    point.x >= transform.left &&
    point.x <= transform.left + transform.width &&
    point.y >= transform.top &&
    point.y <= transform.top + transform.height
  );
}

/**
 * Calculate distance between two points
 */
export function distance(p1: Point, p2: Point): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}
