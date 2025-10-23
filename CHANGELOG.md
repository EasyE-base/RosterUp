# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0-canvas] - 2025-10-23

### Added - Canvas Mode V1.0

#### Core Infrastructure
- **Command Bus System** - Event-driven state management with deterministic undo/redo
  - Async command queue for atomic AI operations
  - History replay for reliable state reconstruction
  - Operation context for full audit trail (userId, timestamp, source, sessionId)
- **Breakpoint System** - Responsive editing across Desktop/Tablet/Mobile viewports
  - CSS custom property injection for per-breakpoint transforms
  - Auto-scaling via `normalizeTransformBetweenBreakpoints()`
  - Typical widths: Desktop 1440px, Tablet 768px, Mobile 375px
- **Selector Registry** - Bidirectional mapping between element IDs, CSS selectors, and DOM references
- **Mutation Engine** - Transactional DOM operations with rollback capability
- **Validation System** - Pre-commit validation for element integrity

#### Canvas Rendering
- **Dual-Layer Architecture**
  - `CanvasSurface` - Main rendering layer (pointer-events: auto)
  - `CanvasOverlay` - Selection handles and visual guides (pointer-events: none)
- **Transform System**
  - 8 resize handles (N, NE, E, SE, S, SW, W, NW)
  - Rotation handle with visual feedback
  - Live snap guides for alignment
  - Keyboard shortcuts for precision (Arrow keys, Cmd+Z/Y, Delete)
- **Selection Management**
  - Click to select
  - Drag to move
  - Resize with handles
  - Real-time position/size display

#### Responsive Editing
- **Breakpoint Selector** - 3-tab toggle for Desktop/Tablet/Mobile
  - Keyboard shortcuts: 1 = Desktop, 2 = Tablet, 3 = Mobile
  - Smooth viewport resize animations (0.3s transitions)
  - Auto-scale transforms when switching breakpoints
  - Preserves manually set breakpoint-specific positions
- **Per-Breakpoint Positioning** - Independent transforms for each viewport
  - CSS custom properties: `--desktop-left`, `--tablet-width`, `--mobile-top`, etc.
  - Responsive preview without rebuild

#### Content Creation
- **QuickAdd Toolbar** - Fast element insertion on empty space click
  - Text - Double-click to edit, default styling
  - Image - Opens Media Organizer for selection
  - Button - Customizable link and styles
  - Section - Container for grouped content
  - AI Add - Natural language element generation
- **Media Organizer** - Comprehensive media library
  - Upload tab - Drag & drop image upload
  - Paste tab - Paste images from clipboard
  - Recent tab - Browse previously uploaded media
  - IndexedDB persistence - Media cached locally
  - Click to insert at cursor position
  - Draggable thumbnails with metadata

#### Element Controls
- **Element Context Bar** - Fine-grained element editing
  - Edit - Inline text editing for text elements
  - Replace - Swap image via Media Organizer
  - Style - Quick style panel (font size/color, background, border radius)
  - Delete - Remove element with undo support
  - AI Modify - Natural language style/content modifications
  - Unlock - Convert flow elements to absolute positioning

#### AI Integration
- **Multi-Provider Support**
  - OpenAI GPT-4 integration
  - Anthropic Claude integration
  - Custom endpoint support
- **AI Features**
  - Element generation from natural language prompts
  - Element modification via text commands
  - 15-second timeout with AbortController
  - Comprehensive error handling
  - Graceful degradation when AI unavailable
- **Configuration**
  - Environment variables for API keys
  - Provider selection (openai/anthropic/custom)
  - Custom endpoint URL support

#### Persistence & Storage
- **IndexedDB Integration**
  - Automatic command history persistence
  - Media library storage
  - Save/load durability
  - LocalStorage backup fallback
- **Auto-Save** - Background saves every 30 seconds

#### Testing & Validation
- **E2E Test Suite** (Cmd+Shift+T to run)
  - Command History Performance - 1000 element stress test, undo/redo latency
  - IndexedDB Persistence - Save/load durability validation
  - Breakpoint CSS Injection - < 16ms target for 60fps
  - Memory Leak Detection - < 5MB growth threshold
- **Performance Monitoring**
  - Real-time metrics display
  - Pass/fail criteria validation
  - Console output with detailed stats

#### Developer Tools
- **Snapshot Debug Tool** (Cmd+Shift+D)
  - Element tree visualization
  - Command history inspection
  - State snapshot export
  - Performance profiling
- **Keyboard Shortcuts**
  - Cmd/Ctrl+Z - Undo
  - Cmd/Ctrl+Y - Redo
  - Delete - Remove selected element
  - Arrow keys - Nudge element (1px)
  - Shift+Arrow - Nudge element (10px)
  - T - Insert text element
  - I - Insert image element
  - B - Insert button element
  - 1/2/3 - Switch breakpoints
  - Cmd+Shift+D - Toggle debug panel
  - Cmd+Shift+T - Run E2E tests

### Technical Details

#### New Files
- `/src/components/canvas/CanvasMode.tsx` - Main orchestrator
- `/src/components/canvas/CanvasSurface.tsx` - Rendering layer
- `/src/components/canvas/CanvasOverlay.tsx` - Selection/guides layer
- `/src/components/canvas/BreakpointSelector.tsx` - Responsive switcher
- `/src/components/canvas/QuickAddToolbar.tsx` - Content creation
- `/src/components/canvas/ElementContextBar.tsx` - Element controls
- `/src/components/media/MediaOrganizer.tsx` - Media library
- `/src/components/debug/CanvasE2ETest.tsx` - Testing suite
- `/src/lib/breakpoints.ts` - Breakpoint utilities
- `/src/lib/selectorRegistry.ts` - Selector mapping
- `/src/lib/mutationEngine.ts` - DOM operations
- `/src/lib/transformUtils.ts` - Transform calculations
- `/src/lib/aiService.ts` - AI provider integration
- `/src/lib/types.ts` - TypeScript definitions
- `/src/lib/validation.ts` - Element validation
- `/src/stores/commandBus.ts` - Command state management

#### Dependencies
- `idb` - IndexedDB wrapper for persistence

#### Configuration
- `.env.example` - Updated with AI configuration variables
  - `VITE_AI_PROVIDER` - AI provider selection
  - `VITE_AI_ENDPOINT` - Custom endpoint URL
  - `VITE_AI_API_KEY` - API key for providers

### Performance
- **60fps Target** - All transforms and breakpoint switches
- **< 16ms CSS Injection** - Responsive layout updates
- **< 5MB Memory Growth** - No memory leaks in 1000+ operations
- **IndexedDB Persistence** - Fast save/load times

### Documentation
- Inline code documentation for all components
- TypeScript definitions for type safety
- Console logging for debugging

---

## [Unreleased]

### To Be Added
- Analytics hooks for telemetry
- Performance monitoring dashboards
- User session tracking
