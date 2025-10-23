/**
 * Pre-Commit Validation Layer
 * Validates mutations before sending to server to prevent errors and data integrity issues
 */

import type {
  MutationOp,
  MutationValidationResult,
  ValidationWarning,
  CanvasElement
} from './types';
import { selectorRegistry } from './selectorRegistry';

const MAX_BULK_DELETE = 10;
const BLOCKED_SELECTORS = /^(html|body)$/i;

/**
 * Validate all mutations before commit
 * Returns warnings and blocks on errors
 */
export function validateMutations(
  ops: MutationOp[],
  elements: Map<string, CanvasElement>
): MutationValidationResult {
  const warnings: ValidationWarning[] = [];

  // Track used selectors and z-indexes
  const usedSelectors = new Set<string>();
  const usedZIndexes = new Map<number, string[]>(); // zIndex -> element IDs

  for (const op of ops) {
    // 1. Validate operation type
    if (!isValidOperationType(op.op)) {
      warnings.push({
        severity: 'error',
        code: 'INVALID_OPERATION',
        message: `Invalid operation type: ${op.op}`,
        selector: op.selector,
        suggestion: 'Use one of: delete, insert, update_text, update_attr, move'
      });
    }

    // 2. Validate selector
    if (!op.selector || typeof op.selector !== 'string' || op.selector.trim().length === 0) {
      warnings.push({
        severity: 'error',
        code: 'MISSING_SELECTOR',
        message: 'Selector is required',
        selector: op.selector,
        suggestion: 'Provide a valid CSS selector'
      });
      continue;
    }

    // 3. Block html/body modifications
    if (BLOCKED_SELECTORS.test(op.selector)) {
      warnings.push({
        severity: 'error',
        code: 'BLOCKED_SELECTOR',
        message: `Cannot target html/body elements: ${op.selector}`,
        selector: op.selector,
        suggestion: 'Target a specific element within the body'
      });
    }

    // 4. Validate CSS selector syntax
    try {
      document.querySelector(op.selector);
    } catch (e: any) {
      warnings.push({
        severity: 'error',
        code: 'INVALID_SELECTOR',
        message: `Invalid CSS selector: ${op.selector}`,
        selector: op.selector,
        suggestion: 'Use valid CSS selector syntax'
      });
      continue;
    }

    // 5. Check for missing data-canvas-id on absolute elements
    if (op.op === 'insert' && op.html) {
      if (op.html.includes('position:absolute') || op.html.includes('canvas-element')) {
        if (!op.html.includes('data-canvas-id')) {
          warnings.push({
            severity: 'error',
            code: 'MISSING_CANVAS_ID',
            message: 'Canvas element missing data-canvas-id attribute',
            selector: op.selector,
            suggestion: 'Add data-canvas-id="..." to enable transform controls'
          });
        }
      }
    }

    // 6. Check for orphaned selectors (selector doesn't exist in elements or registry)
    if (op.op !== 'insert') {
      const elementExists = selectorRegistry.hasSelector(op.selector);
      const isCanvasElement = Array.from(elements.values()).some(
        el => selectorRegistry.getSelector(el.id) === op.selector
      );

      if (!elementExists && !isCanvasElement) {
        warnings.push({
          severity: 'warning',
          code: 'ORPHANED_SELECTOR',
          message: `Selector "${op.selector}" may not exist in DOM`,
          selector: op.selector,
          suggestion: 'Verify element exists before applying mutation'
        });
      }
    }

    usedSelectors.add(op.selector);

    // 7. Track z-index usage for duplicate detection
    if (op.op === 'insert' || op.op === 'update_attr') {
      const zIndexMatch = op.html?.match(/z-index:\s*(\d+)/) ||
                         (op.attr === 'style' && op.value?.match(/z-index:\s*(\d+)/));
      if (zIndexMatch) {
        const zIndex = parseInt(zIndexMatch[1]);
        if (!usedZIndexes.has(zIndex)) {
          usedZIndexes.set(zIndex, []);
        }
        usedZIndexes.get(zIndex)!.push(op.selector);
      }
    }

    // 8. Operation-specific validation
    const opValidation = validateOperationSpecific(op);
    if (opValidation) {
      warnings.push(opValidation);
    }
  }

  // 9. Report duplicate z-indexes
  for (const [zIndex, selectors] of usedZIndexes) {
    if (selectors.length > 1) {
      warnings.push({
        severity: 'warning',
        code: 'DUPLICATE_Z_INDEX',
        message: `Multiple elements share z-index ${zIndex}: ${selectors.join(', ')}`,
        suggestion: 'Assign unique z-index values to avoid stacking ambiguity'
      });
    }
  }

  // 10. Check for overlapping absolute elements (performance concern if too many)
  const overlaps = detectOverlappingElements(elements);
  for (const overlap of overlaps) {
    warnings.push({
      severity: 'warning',
      code: 'OVERLAPPING_ELEMENTS',
      message: `Element "${overlap.id1}" overlaps with "${overlap.id2}"`,
      selector: `[data-canvas-id="${overlap.id1}"]`,
      suggestion: 'Adjust position or z-index to prevent visual conflicts'
    });
  }

  const hasErrors = warnings.some(w => w.severity === 'error');

  return {
    valid: !hasErrors,
    warnings
  };
}

/**
 * Validate operation-specific requirements
 */
function validateOperationSpecific(op: MutationOp): ValidationWarning | null {
  switch (op.op) {
    case 'insert':
      if (!op.html || typeof op.html !== 'string') {
        return {
          severity: 'error',
          code: 'MISSING_HTML',
          message: 'Insert operation requires html parameter',
          selector: op.selector,
          suggestion: 'Provide html content to insert'
        };
      }
      if (op.position && !['before', 'after', 'prepend', 'append'].includes(op.position)) {
        return {
          severity: 'error',
          code: 'INVALID_POSITION',
          message: `Invalid position: ${op.position}`,
          selector: op.selector,
          suggestion: 'Use: before, after, prepend, or append'
        };
      }
      break;

    case 'move':
      if (!op.target || typeof op.target !== 'string') {
        return {
          severity: 'error',
          code: 'MISSING_TARGET',
          message: 'Move operation requires target parameter',
          selector: op.selector,
          suggestion: 'Provide target selector for move operation'
        };
      }
      break;

    case 'update_text':
      if (op.value === undefined || typeof op.value !== 'string') {
        return {
          severity: 'error',
          code: 'MISSING_VALUE',
          message: 'update_text operation requires value parameter',
          selector: op.selector,
          suggestion: 'Provide text content as value'
        };
      }
      break;

    case 'update_attr':
      if (!op.attr || typeof op.attr !== 'string') {
        return {
          severity: 'error',
          code: 'MISSING_ATTR',
          message: 'update_attr operation requires attr parameter',
          selector: op.selector,
          suggestion: 'Specify attribute name to update'
        };
      }
      if (op.value === undefined || typeof op.value !== 'string') {
        return {
          severity: 'error',
          code: 'MISSING_VALUE',
          message: 'update_attr operation requires value parameter',
          selector: op.selector,
          suggestion: 'Provide attribute value'
        };
      }
      break;

    case 'delete':
      // This would require DOM access to count matches
      // For client-side, we can add a warning
      break;
  }

  return null;
}

/**
 * Check if operation type is valid
 */
function isValidOperationType(op: string): boolean {
  return ['delete', 'insert', 'update_text', 'update_attr', 'move', 'meta'].includes(op);
}

/**
 * Detect overlapping elements (AABB collision detection)
 */
function detectOverlappingElements(
  elements: Map<string, CanvasElement>
): Array<{ id1: string; id2: string }> {
  const overlaps: Array<{ id1: string; id2: string }> = [];
  const absoluteElements = Array.from(elements.values()).filter(
    el => el.mode === 'absolute' && el.breakpoints
  );

  // Only check if we have a reasonable number of elements (performance)
  if (absoluteElements.length > 50) {
    return overlaps; // Skip overlap detection for large sets
  }

  for (let i = 0; i < absoluteElements.length; i++) {
    for (let j = i + 1; j < absoluteElements.length; j++) {
      const elem1 = absoluteElements[i];
      const elem2 = absoluteElements[j];

      const transform1 = elem1.breakpoints!.desktop;
      const transform2 = elem2.breakpoints!.desktop;

      // AABB collision detection
      const xOverlap =
        transform1.left < transform2.left + transform2.width &&
        transform1.left + transform1.width > transform2.left;
      const yOverlap =
        transform1.top < transform2.top + transform2.height &&
        transform1.top + transform1.height > transform2.top;

      if (xOverlap && yOverlap) {
        overlaps.push({ id1: elem1.id, id2: elem2.id });
      }
    }
  }

  return overlaps;
}

/**
 * Validate a single mutation operation
 * Used for real-time validation during editing
 */
export function validateSingleMutation(
  op: MutationOp,
  elements: Map<string, CanvasElement>
): MutationValidationResult {
  return validateMutations([op], elements);
}

/**
 * Format validation warnings for display
 */
export function formatValidationWarnings(warnings: ValidationWarning[]): string {
  if (warnings.length === 0) return '';

  const errors = warnings.filter(w => w.severity === 'error');
  const warningList = warnings.filter(w => w.severity === 'warning');

  let message = '';

  if (errors.length > 0) {
    message += `❌ ${errors.length} Error(s):\n`;
    errors.forEach(e => {
      message += `  • ${e.message}\n`;
      if (e.suggestion) {
        message += `    💡 ${e.suggestion}\n`;
      }
    });
  }

  if (warningList.length > 0) {
    message += `\n⚠️  ${warningList.length} Warning(s):\n`;
    warningList.forEach(w => {
      message += `  • ${w.message}\n`;
      if (w.suggestion) {
        message += `    💡 ${w.suggestion}\n`;
      }
    });
  }

  return message;
}
