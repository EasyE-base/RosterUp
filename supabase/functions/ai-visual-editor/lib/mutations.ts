/**
 * Core Mutation Engine with Explicit State Stack
 * Deterministic rollback without exception-based control flow
 */

import { parseHTML } from 'https://esm.sh/linkedom@0.14.26';
import type { MutationOp, MutationResult, OperationResult, ApplyResult } from './types.ts';
import { validateOperation } from './validation.ts';
import { generateOperationHash } from '../utils/hash.ts';

export async function applyMutations(html: string, ops: MutationOp[]): Promise<MutationResult> {
  const { document } = parseHTML(html);

  // State stack for deterministic rollback
  const stateStack: string[] = [document.toString()];
  const results: OperationResult[] = [];

  console.log(`🔧 Applying ${ops.length} mutation(s)...`);

  for (const op of ops) {
    const startTime = Date.now();

    // Generate unique operation hash for tracing
    op.id = await generateOperationHash(op);
    console.log(`  → Operation ${op.id.substring(0, 8)}: ${op.op} on ${op.selector}`);

    // Validate operation
    const validation = validateOperation(op, { document });
    if (!validation.valid) {
      console.error(`  ❌ Validation failed: ${validation.error}`);
      return createRollbackResult(stateStack[0], results, validation.error!);
    }

    // Try to apply (non-throwing)
    const applyResult = await tryApplyOperation(op, document);

    if (!applyResult.success) {
      console.error(`  ❌ Application failed: ${applyResult.error}`);
      return createRollbackResult(stateStack[0], results, applyResult.error!);
    }

    // Success! Push new state to stack
    stateStack.push(document.toString());

    results.push({
      op,
      id: op.id,
      timestamp: Date.now(),
      success: true,
      message: applyResult.message,
      elementFound: true,
      duration_ms: Date.now() - startTime
    });

    console.log(`  ✅ ${applyResult.message} (${Date.now() - startTime}ms)`);
  }

  const htmlAfter = stateStack[stateStack.length - 1];

  console.log(`✓ All ${ops.length} operations succeeded`);

  return {
    success: true,
    operations: results,
    htmlBefore: html,
    htmlAfter,
    diff: {
      added: 0,     // Will be computed by diff module
      removed: 0,
      modified: 0,
      patches: [],
      size: {
        before: html.length,
        after: htmlAfter.length,
        diff: htmlAfter.length - html.length
      }
    },
    verification: {
      fastPath: true,
      issues: [],
      duration_ms: 0
    }
  };
}

async function tryApplyOperation(op: MutationOp, document: any): Promise<ApplyResult> {
  try {
    const element = document.querySelector(op.selector);

    if (!element) {
      return {
        success: false,
        error: `Element not found: ${op.selector}`,
        message: ''
      };
    }

    switch (op.op) {
      case 'delete':
        element.remove();
        return {
          success: true,
          message: `Deleted ${element.tagName.toLowerCase()}`
        };

      case 'insert': {
        const temp = document.createElement('div');
        temp.innerHTML = op.html!;
        const newNode = temp.firstElementChild;

        if (!newNode) {
          return {
            success: false,
            error: 'Invalid HTML: no element created',
            message: ''
          };
        }

        // Insert based on position
        switch (op.position) {
          case 'after':
            element.after(newNode);
            break;
          case 'before':
            element.before(newNode);
            break;
          case 'prepend':
            element.prepend(newNode);
            break;
          case 'append':
          default:
            element.append(newNode);
            break;
        }

        return {
          success: true,
          message: `Inserted ${newNode.tagName.toLowerCase()} ${op.position || 'after'} ${element.tagName.toLowerCase()}`
        };
      }

      case 'move': {
        const target = document.querySelector(op.target!);

        if (!target) {
          return {
            success: false,
            error: `Move target not found: ${op.target}`,
            message: ''
          };
        }

        // Move element to new location
        switch (op.position) {
          case 'after':
            target.after(element);
            break;
          case 'before':
            target.before(element);
            break;
          case 'prepend':
            target.prepend(element);
            break;
          case 'append':
          default:
            target.append(element);
            break;
        }

        return {
          success: true,
          message: `Moved ${element.tagName.toLowerCase()} ${op.position || 'to'} ${target.tagName.toLowerCase()}`
        };
      }

      case 'update_text':
        element.textContent = op.value!;
        return {
          success: true,
          message: `Updated text in ${element.tagName.toLowerCase()}`
        };

      case 'update_attr':
        element.setAttribute(op.attr!, op.value!);
        return {
          success: true,
          message: `Updated ${op.attr} attribute on ${element.tagName.toLowerCase()}`
        };

      case 'meta':
        // Meta operations don't modify DOM
        return {
          success: true,
          message: `Meta: ${op.meta?.action || 'unknown'}`
        };

      default:
        return {
          success: false,
          error: `Unknown operation: ${op.op}`,
          message: ''
        };
    }
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: ''
    };
  }
}

function createRollbackResult(htmlOriginal: string, results: OperationResult[], errorMessage: string): MutationResult {
  console.log(`⏪ Rolling back to initial state due to: ${errorMessage}`);

  return {
    success: false,
    operations: results,
    htmlBefore: htmlOriginal,
    htmlAfter: htmlOriginal, // Unchanged (rollback)
    diff: {
      added: 0,
      removed: 0,
      modified: 0,
      patches: [],
      size: {
        before: htmlOriginal.length,
        after: htmlOriginal.length,
        diff: 0
      }
    },
    verification: {
      fastPath: true,
      issues: [errorMessage],
      duration_ms: 0
    }
  };
}
