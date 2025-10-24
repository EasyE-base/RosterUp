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
  thryveId?: string;             // V2.0: Stable deterministic ID (for flow elements)
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
    lineHeight?: string;          // V2.0: Preserved on unlock
    fontFamily?: string;          // V2.0: Preserved on unlock
    [key: string]: string | undefined;  // Allow any CSS property
  };

  // Positioning (only for mode='absolute')
  breakpoints?: BreakpointTransforms;

  // Metadata
  zIndex?: number | 'auto';      // V2.0: Support 'auto' for flow elements
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

// V2.0: Base command interface with versioning
export interface BaseCommand {
  version: 2;  // Schema version for migration
  context: OperationContext;
}

export interface InsertCommand extends BaseCommand {
  type: 'insert';
  payload: {
    element: CanvasElement;
    position: Point;
    parent?: string;  // Parent selector (default: body)
  };
}

export interface TransformCommand extends BaseCommand {
  type: 'transform';
  payload: {
    id: string;
    transform: Transform;
    breakpoint: Breakpoint;
  };
}

export interface UpdateTextCommand extends BaseCommand {
  type: 'update_text';
  payload: {
    id?: string;          // Legacy: canvas element ID
    thryveId?: string;    // V2.0: Flow element stable ID
    text: string;
  };
}

export interface UpdateAttrCommand extends BaseCommand {
  type: 'update_attr';
  payload: {
    id?: string;          // Legacy: canvas element ID
    thryveId?: string;    // V2.0: Flow element stable ID
    attr: string;
    value: string;
  };
}

export interface DeleteCommand extends BaseCommand {
  type: 'delete';
  payload: {
    id?: string;          // Legacy: canvas element ID
    thryveId?: string;    // V2.0: Flow element stable ID
    selector?: string;    // Fallback CSS selector
  };
}

export interface UnlockCommand extends BaseCommand {
  type: 'unlock';
  payload: {
    thryveId: string;                         // V2.0: Stable element ID
    transformsByBreakpoint: BreakpointTransforms; // Auto-generated responsive transforms
    snapshotStyles: ComputedStyles;           // Inlined computed styles for fidelity
    originalSelector?: string;                // Fallback CSS selector
  };
}

export interface BatchCommand extends BaseCommand {
  type: 'batch';
  payload: {
    commands: Command[];
  };
}

// V2.0: Computed styles snapshot for unlock fidelity
export interface ComputedStyles {
  fontSize?: string;
  fontWeight?: string;
  lineHeight?: string;
  color?: string;
  backgroundColor?: string;
  fontFamily?: string;
  [key: string]: string | undefined;
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
