/**
 * Shared TypeScript types for AI Visual Editor
 */

export interface MutationOp {
  id?: string;              // SHA-1 hash of operation
  op: 'delete' | 'insert' | 'update_text' | 'update_attr' | 'move' | 'meta';
  selector: string;
  target?: string;          // For 'move' operation
  position?: 'before' | 'after' | 'prepend' | 'append';
  html?: string;
  attr?: string;
  value?: string;
  meta?: {
    action: string;
    note: string;
  };
  timestamp?: number;
  source?: 'ai-visual' | 'user-manual';
  agent?: 'Claude' | 'GPT-4';
}

export interface OperationResult {
  op: MutationOp;
  id: string;
  timestamp: number;
  success: boolean;
  message: string;
  elementFound: boolean;
  duration_ms: number;
}

export interface Patch {
  type: 'add' | 'remove' | 'attr' | 'text';
  selector: string;
  parentSelector?: string;
  position?: 'before' | 'after' | 'prepend' | 'append';
  html?: string;
  attr?: string;
  value?: string;
}

export interface DiffSummary {
  added: number;
  removed: number;
  modified: number;
  patches: Patch[];
  compressed?: Uint8Array;
  size: {
    before: number;
    after: number;
    diff: number;
  };
}

export interface VerificationResult {
  fastPath: boolean;
  slowPath?: boolean;
  issues: string[];
  duration_ms: number;
}

export interface MutationResult {
  success: boolean;
  operations: OperationResult[];
  htmlBefore: string;
  htmlAfter: string;
  diff: DiffSummary;
  verification: VerificationResult;
}

export interface ApplyResult {
  success: boolean;
  error?: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
}
