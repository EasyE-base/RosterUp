/**
 * Operation Hash ID Generator
 * Generates deterministic SHA-1 hashes for operations to enable tracing
 */

import type { MutationOp } from '../lib/types.ts';

export async function generateOperationHash(op: MutationOp): Promise<string> {
  // Create deterministic string from operation
  const opString = JSON.stringify({
    op: op.op,
    selector: op.selector,
    target: op.target,
    position: op.position,
    value: op.value,
    html: op.html ? op.html.substring(0, 100) : undefined, // Limit HTML for hash
    attr: op.attr,
    timestamp: Date.now()
  });

  // Generate SHA-1 hash
  const hashBuffer = await crypto.subtle.digest(
    'SHA-1',
    new TextEncoder().encode(opString)
  );

  // Convert to hex string
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}
