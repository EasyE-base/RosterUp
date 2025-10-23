/**
 * Cached Schema Validation
 * Lightweight runtime validation with safety checks
 */

import type { MutationOp, ValidationResult } from './types.ts';

const VALID_OPS = ['delete', 'insert', 'update_text', 'update_attr', 'move', 'meta'] as const;
const VALID_POSITIONS = ['before', 'after', 'prepend', 'append'] as const;
const BLOCKED_SELECTORS = /^(html|body)$/i;
const MAX_BULK_DELETE = 10;

export function validateOperation(op: MutationOp, dom: any): ValidationResult {
  // Type validation
  if (!VALID_OPS.includes(op.op as any)) {
    return { valid: false, error: `Invalid operation type: ${op.op}` };
  }

  // Selector required
  if (!op.selector || typeof op.selector !== 'string' || op.selector.trim().length === 0) {
    return { valid: false, error: 'Selector is required and must be a non-empty string' };
  }

  // Safety: Block html/body modifications
  if (BLOCKED_SELECTORS.test(op.selector)) {
    return { valid: false, error: `Blocked: Cannot target html/body elements` };
  }

  // Operation-specific validation
  switch (op.op) {
    case 'insert':
      if (!op.html || typeof op.html !== 'string') {
        return { valid: false, error: 'Insert operation requires html parameter' };
      }
      if (op.position && !VALID_POSITIONS.includes(op.position as any)) {
        return { valid: false, error: `Invalid position: ${op.position}` };
      }
      break;

    case 'move':
      if (!op.target || typeof op.target !== 'string') {
        return { valid: false, error: 'Move operation requires target parameter' };
      }
      if (op.position && !VALID_POSITIONS.includes(op.position as any)) {
        return { valid: false, error: `Invalid position: ${op.position}` };
      }
      break;

    case 'update_text':
      if (op.value === undefined || typeof op.value !== 'string') {
        return { valid: false, error: 'update_text operation requires value parameter' };
      }
      break;

    case 'update_attr':
      if (!op.attr || typeof op.attr !== 'string') {
        return { valid: false, error: 'update_attr operation requires attr parameter' };
      }
      if (op.value === undefined || typeof op.value !== 'string') {
        return { valid: false, error: 'update_attr operation requires value parameter' };
      }
      break;

    case 'delete':
      // Safety: Check if selector matches too many elements
      try {
        const matchCount = dom.document.querySelectorAll(op.selector).length;
        if (matchCount > MAX_BULK_DELETE) {
          return {
            valid: false,
            error: `Mass deletion blocked: selector matches ${matchCount} elements (max ${MAX_BULK_DELETE})`
          };
        }
        if (matchCount === 0) {
          console.warn(`Warning: Selector "${op.selector}" matches 0 elements`);
        }
      } catch (e) {
        return { valid: false, error: `Invalid selector: ${e.message}` };
      }
      break;
  }

  // Verify selector is valid CSS
  try {
    dom.document.querySelector(op.selector);
  } catch (e) {
    return { valid: false, error: `Invalid CSS selector: ${e.message}` };
  }

  return { valid: true };
}

export function validateOperations(ops: MutationOp[], dom: any): ValidationResult {
  for (const op of ops) {
    const result = validateOperation(op, dom);
    if (!result.valid) {
      return result;
    }
  }
  return { valid: true };
}
