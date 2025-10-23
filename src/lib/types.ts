/**
 * Core Types for Canvas Mode
 * Shared types for command bus, mutation engine, and canvas rendering
 */

import type { Transform, BreakpointTransforms, Breakpoint } from './breakpoints';

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
// Canvas Elements
// =============================================================================

export type ElementType = 'text' | 'image' | 'button' | 'video' | 'section' | 'custom';
export type ElementMode = 'flow' | 'absolute';

export interface CanvasElement {
  id: string;                    // Unique element ID
  type: ElementType;
  mode: ElementMode;             // Flow = normal DOM, Absolute = free-transform

  // Content
  content: {
    text?: string;
    src?: string;
    alt?: string;
    href?: string;
    html?: string;               // For sections/complex elements
  };

  // Styling
  styles?: {
    background?: string;
    color?: string;
    fontSize?: string;
    fontWeight?: string;
    padding?: string;
    margin?: string;
    borderRadius?: string;
    [key: string]: string | undefined;  // Allow any CSS property
  };

  // Positioning (only for mode='absolute')
  breakpoints?: BreakpointTransforms;

  // Metadata
  zIndex?: number;
  locked?: boolean;              // Prevent accidental edits
  originalSelector?: string;     // If unlocked from flow element
  createdAt?: number;
  updatedAt?: number;
}

// =============================================================================
// Commands (for Command Bus)
// =============================================================================

export interface Point {
  x: number;
  y: number;
}

export type Command =
  | InsertCommand
  | TransformCommand
  | UpdateTextCommand
  | UpdateAttrCommand
  | DeleteCommand
  | UnlockCommand
  | BatchCommand;

export interface InsertCommand {
  type: 'insert';
  payload: {
    element: CanvasElement;
    position: Point;
    parent?: string;  // Parent selector (default: body)
  };
  context: OperationContext;
}

export interface TransformCommand {
  type: 'transform';
  payload: {
    id: string;
    transform: Transform;
    breakpoint: Breakpoint;
  };
  context: OperationContext;
}

export interface UpdateTextCommand {
  type: 'update_text';
  payload: {
    id: string;
    text: string;
  };
  context: OperationContext;
}

export interface UpdateAttrCommand {
  type: 'update_attr';
  payload: {
    id: string;
    attr: string;
    value: string;
  };
  context: OperationContext;
}

export interface DeleteCommand {
  type: 'delete';
  payload: {
    id: string;
  };
  context: OperationContext;
}

export interface UnlockCommand {
  type: 'unlock';
  payload: {
    selector: string;  // Convert this flow element to absolute mode
  };
  context: OperationContext;
}

export interface BatchCommand {
  type: 'batch';
  payload: {
    commands: Command[];
  };
  context: OperationContext;
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
// Command Queue (for async operations)
// =============================================================================

export interface CommandQueue {
  add(command: Command): void;
  addBatch(commands: Command[]): void;
}

// =============================================================================
// Mutation Engine Types
// =============================================================================

export interface MutationSource {
  mode: 'smart-edit' | 'canvas';
  elements?: Map<string, CanvasElement>;  // For canvas
  selector?: string;                      // For smart-edit
  instruction?: string;                   // For smart-edit AI
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
// Snapshot (for debug tool)
// =============================================================================

export interface Snapshot {
  version: string;
  timestamp: number;
  commandBus: {
    history: Command[][];
    currentIndex: number;
    elements: Record<string, CanvasElement>;
  };
  selectorRegistry: {
    idToSelector: Record<string, string>;
    selectorToId: Record<string, string>;
  };
  iframe: {
    html: string;
    url: string;
  };
  userAgent: string;
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
