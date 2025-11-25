/**
 * Core Types for Canvas Mode
 * Shared types for command bus, mutation engine, and canvas rendering
 */



// =============================================================================
// Operation Context (for audit trails and collaboration)
// =============================================================================

export interface OperationContext {
  userId?: string;           // For collaboration/audit
  timestamp: number;          // When operation occurred
  source: 'manual' | 'ai' | 'auto';  // Origin of change
  description?: string;       // Human-readable summary
  sessionId?: string;         // For grouping related ops
  parentOpId?: string;        // For operation chains
}

/**
 * Helper to create operation context
 */
export function createContext(
  source: OperationContext['source'],
  description?: string
): OperationContext {
  return {
    timestamp: Date.now(),
    source,
    description,
    sessionId: getSessionId(),
  };
}

// Generate or retrieve session ID
let _sessionId: string | null = null;
function getSessionId(): string {
  if (!_sessionId) {
    _sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  return _sessionId;
}

// =============================================================================
// Commands (for Command Bus)
// =============================================================================

export interface Point {
  x: number;
  y: number;
}

// =============================================================================
// Mutation Operations (for server-side DOM mutations)
// =============================================================================

export type MutationOpType = 'delete' | 'insert' | 'update_text' | 'update_attr' | 'move' | 'meta';

export interface MutationOp {
  id?: string;                   // SHA-1 hash of operation
  op: MutationOpType;
  selector: string;
  target?: string;               // For 'move' operation
  position?: 'before' | 'after' | 'prepend' | 'append';
  html?: string;
  attr?: string;
  value?: string;
  meta?: { action: string; note: string };

  // Operation context
  context?: OperationContext;

  // Legacy fields (kept for backward compatibility)
  timestamp?: number;
  source?: 'ai-visual' | 'user-manual';
  agent?: 'Claude' | 'GPT-4';
}

// =============================================================================
// Mutation Results
// =============================================================================

export interface MutationResult {
  success: boolean;
  operations: OperationResult[];
  htmlBefore: string;
  htmlAfter: string;
  diff: DiffSummary;
  verification: VerificationResult;
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

export interface DiffSummary {
  added: number;
  removed: number;
  modified: number;
  patches: any[];
  size: {
    before: number;
    after: number;
    diff: number;
  };
}

export interface VerificationResult {
  fastPath: boolean;
  issues: string[];
  duration_ms: number;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export interface ApplyResult {
  success: boolean;
  error?: string;
  message: string;
}

// =============================================================================
// Validation Types
// =============================================================================

export interface ValidationWarning {
  severity: 'error' | 'warning';
  code: string;
  message: string;
  selector?: string;
  suggestion?: string;
}

export interface MutationValidationResult {
  valid: boolean;
  warnings: ValidationWarning[];
}

// =============================================================================
// Media Organizer Types
// =============================================================================

export interface MediaItem {
  id: string;
  type: 'image' | 'video';
  src: string;
  thumbnail?: string;
  width?: number;
  height?: number;
  size?: number;           // File size in bytes
  mime?: string;
  uploadedAt: number;
}

// =============================================================================
// Export all types
// =============================================================================

export type {
  Transform,
  BreakpointTransforms,
  Breakpoint
} from './breakpoints';
