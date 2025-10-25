/**
 * Canvas Mode - Main Component
 * V2.0: Hybrid Canvas with cloned HTML support
 * Combines CanvasSurface, CanvasOverlay, and HybridCanvasLoader
 * Provides full canvas editing experience with flow-to-absolute unlock
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { CanvasSurface } from './CanvasSurface';
import { CanvasOverlay, type SnapGuide } from './CanvasOverlay';
import { BreakpointSelector } from './BreakpointSelector';
import { QuickAddToolbar } from './QuickAddToolbar';
import { ElementContextBar } from './ElementContextBar';
import { SnapshotDebugTool } from '../debug/SnapshotDebugTool';
import { CanvasE2ETest } from '../debug/CanvasE2ETest';
import { MediaOrganizer } from '../media/MediaOrganizer';
import { HybridCanvasLoader } from './HybridCanvasLoader';
import { useCommandBus } from '@/stores/commandBus';
import { iframeSyncManager } from '@/lib/iframeSyncManager';
import { registry } from '@/lib/selectorRegistry';
import { getCurrentBreakpoint, TYPICAL_WIDTHS, normalizeTransformBetweenBreakpoints, type Breakpoint } from '@/lib/breakpoints';
import { getEditorMode } from '@/lib/featureFlags';
import type { Point, CanvasElement, Transform } from '@/lib/types';

interface CanvasModeProps {
  iframeRef?: React.RefObject<HTMLIFrameElement>;
  htmlContent?: string;
  enabled?: boolean;
  pageId?: string;  // V2.0: Required for hybrid mode
}

export function CanvasMode({ iframeRef: externalIframeRef, htmlContent = '', enabled = true, pageId }: CanvasModeProps = {}) {
  const commandBus = useCommandBus();
  const internalIframeRef = useRef<HTMLIFrameElement>(null);
  const iframeRef = externalIframeRef || internalIframeRef;

  // V2.0: Hybrid mode state
  const editorMode = getEditorMode();
  const [hybridHTML, setHybridHTML] = useState<string>('');
  const [isHybridLoading, setIsHybridLoading] = useState(false);
  const [hybridLoadError, setHybridLoadError] = useState<string | null>(null);

  const [selectedElement, setSelectedElement] = useState<CanvasElement | null>(null);
  const [hoveredElement, setHoveredElement] = useState<CanvasElement | null>(null);
  const [quickAddPosition, setQuickAddPosition] = useState<Point | null>(null);
  const [isMediaOrganizerOpen, setIsMediaOrganizerOpen] = useState(false);
  const [snapGuides, setSnapGuides] = useState<SnapGuide[]>([]);
  const [currentBreakpoint, setCurrentBreakpoint] = useState<Breakpoint>('desktop');
  const [viewportSize, setViewportSize] = useState({ width: 1440, height: 900 });
  const [showE2EPanel, setShowE2EPanel] = useState(false);

  /**
   * V2.0: Hybrid loading - fetch clone_html and hydrate state
   */
  const handleHybridLoad = useCallback((html: string, elements: Map<string, CanvasElement>) => {
    performance.mark('canvas-hydrate-start');

    setHybridHTML(html);
    setIsHybridLoading(false);

    // Hydrate commandBus with flow elements
    const elementArray = Array.from(elements.values());
    console.log(`🔄 Hydrating commandBus with ${elementArray.length} flow elements`);

    // Dispatch insert commands for each flow element
    // This populates commandBus.elements Map for selection/unlock
    elementArray.forEach((element) => {
      commandBus.dispatch({
        type: 'insert',
        payload: { element },
        context: {
          timestamp: element.createdAt || Date.now(),
          source: 'hydration',
          description: `Hydrated flow element from clone_html`,
        },
      });
    });

    console.log(`✅ Dispatched ${elementArray.length} insert commands to commandBus`);

    performance.mark('canvas-hydrate-end');
    performance.measure('canvas-hydrate', 'canvas-hydrate-start', 'canvas-hydrate-end');

    const measure = performance.getEntriesByName('canvas-hydrate')[0];
    const duration = measure?.duration || 0;

    console.log(`✅ Canvas hydrated in ${duration.toFixed(2)}ms`);

    performance.clearMarks('canvas-hydrate-start');
    performance.clearMarks('canvas-hydrate-end');
    performance.clearMeasures('canvas-hydrate');
  }, [commandBus]);

  const handleHybridError = useCallback((error: string) => {
    setHybridLoadError(error);
    setIsHybridLoading(false);
    console.error('❌ Hybrid load failed:', error);
  }, []);

  /**
   * Load command history from IndexedDB on mount
   * V2.0: Skip if in hybrid mode (will load from clone_html instead)
   */
  useEffect(() => {
    if (editorMode !== 'canvas' || !pageId) {
      commandBus.loadFromIndexedDB();
    }
  }, [editorMode, pageId]);

  /**
   * V2.0: Initialize IframeSyncManager after iframe loads
   * Syncs DOM mutations with selectorRegistry
   */
  useEffect(() => {
    if (!iframeRef.current || !editorMode || editorMode === 'smart') return;

    const iframe = iframeRef.current;

    const initSync = () => {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc) return;

      // Start sync manager
      iframeSyncManager.start(iframeDoc);

      // Sync selector registry with current DOM
      registry.sync(iframeDoc);

      console.log('📡 IframeSyncManager initialized');
    };

    // Wait for iframe to load
    if (iframe.contentDocument?.readyState === 'complete') {
      initSync();
    } else {
      iframe.addEventListener('load', initSync);
    }

    return () => {
      iframeSyncManager.stop();
      iframe.removeEventListener('load', initSync);
    };
  }, [iframeRef, editorMode, hybridHTML]);

  /**
   * Update viewport size and breakpoint when iframe resizes
   */
  useEffect(() => {
    if (!iframeRef.current) return;

    const updateViewport = () => {
      const iframe = iframeRef.current;
      if (!iframe || !iframe.contentWindow) return;

      const width = iframe.contentWindow.innerWidth;
      const height = iframe.contentWindow.innerHeight;

      setViewportSize({ width, height });
      setCurrentBreakpoint(getCurrentBreakpoint(width));
    };

    updateViewport();

    // Listen for iframe resize
    const iframe = iframeRef.current;
    const resizeObserver = new ResizeObserver(updateViewport);
    resizeObserver.observe(iframe);

    return () => {
      resizeObserver.disconnect();
    };
  }, [iframeRef]);

  /**
   * Handle empty space click - show QuickAdd toolbar
   */
  const handleEmptySpaceClick = useCallback((position: Point) => {
    setQuickAddPosition(position);
    console.log('💡 QuickAdd at', position);
    // TODO: Show QuickAdd toolbar
  }, []);

  /**
   * Handle element selection
   */
  const handleElementSelect = useCallback((element: CanvasElement | null) => {
    setSelectedElement(element);
    if (element) {
      console.log('✅ Selected element:', element.id, element.type);
    }
  }, []);

  /**
   * Generate snap guides when dragging element
   * Shows 8px grid snap, edge alignment, center alignment
   */
  const updateSnapGuides = useCallback((draggedElement: CanvasElement, previewTransform?: Transform) => {
    const guides: SnapGuide[] = [];
    const transform = previewTransform || draggedElement.breakpoints?.[currentBreakpoint] || draggedElement.breakpoints?.desktop;
    if (!transform) return;

    // 8px grid snap
    const gridSize = 8;
    const snapThreshold = 4;

    // Check horizontal grid snap
    const nearestGridY = Math.round(transform.top / gridSize) * gridSize;
    if (Math.abs(transform.top - nearestGridY) < snapThreshold) {
      guides.push({
        type: 'horizontal',
        position: nearestGridY
      });
    }

    // Check vertical grid snap
    const nearestGridX = Math.round(transform.left / gridSize) * gridSize;
    if (Math.abs(transform.left - nearestGridX) < snapThreshold) {
      guides.push({
        type: 'vertical',
        position: nearestGridX
      });
    }

    // Edge and center alignment with other elements
    const otherElements = Array.from(commandBus.elements.values()).filter(
      el => el.id !== draggedElement.id && el.mode === 'absolute'
    );

    for (const other of otherElements) {
      const otherTransform = other.breakpoints?.[currentBreakpoint] || other.breakpoints?.desktop;
      if (!otherTransform) continue;

      const threshold = 8;

      // Left edge alignment
      if (Math.abs(transform.left - otherTransform.left) < threshold) {
        guides.push({
          type: 'vertical',
          position: otherTransform.left,
          label: 'Left'
        });
      }

      // Right edge alignment
      const draggedRight = transform.left + transform.width;
      const otherRight = otherTransform.left + otherTransform.width;
      if (Math.abs(draggedRight - otherRight) < threshold) {
        guides.push({
          type: 'vertical',
          position: otherRight,
          label: 'Right'
        });
      }

      // Center alignment (horizontal)
      const draggedCenterX = transform.left + transform.width / 2;
      const otherCenterX = otherTransform.left + otherTransform.width / 2;
      if (Math.abs(draggedCenterX - otherCenterX) < threshold) {
        guides.push({
          type: 'vertical',
          position: otherCenterX,
          label: 'Center'
        });
      }

      // Top edge alignment
      if (Math.abs(transform.top - otherTransform.top) < threshold) {
        guides.push({
          type: 'horizontal',
          position: otherTransform.top,
          label: 'Top'
        });
      }

      // Bottom edge alignment
      const draggedBottom = transform.top + transform.height;
      const otherBottom = otherTransform.top + otherTransform.height;
      if (Math.abs(draggedBottom - otherBottom) < threshold) {
        guides.push({
          type: 'horizontal',
          position: otherBottom,
          label: 'Bottom'
        });
      }

      // Center alignment (vertical)
      const draggedCenterY = transform.top + transform.height / 2;
      const otherCenterY = otherTransform.top + otherTransform.height / 2;
      if (Math.abs(draggedCenterY - otherCenterY) < threshold) {
        guides.push({
          type: 'horizontal',
          position: otherCenterY,
          label: 'Middle'
        });
      }
    }

    setSnapGuides(guides);
  }, [commandBus.elements, currentBreakpoint]);

  /**
   * Handle transform preview from overlay
   * Updates snap guides in real-time
   */
  const handleTransformPreview = useCallback((element: CanvasElement, transform: Transform) => {
    updateSnapGuides(element, transform);
  }, [updateSnapGuides]);

  /**
   * Handle breakpoint change
   * Resizes viewport and auto-scales transforms
   */
  const handleBreakpointChange = useCallback((newBreakpoint: Breakpoint) => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    // Store old breakpoint for scaling
    const oldBreakpoint = currentBreakpoint;

    // Update breakpoint state
    setCurrentBreakpoint(newBreakpoint);

    // Resize viewport with smooth animation
    const targetWidth = TYPICAL_WIDTHS[newBreakpoint];
    iframe.style.transition = 'width 0.3s ease, height 0.3s ease';
    iframe.style.width = `${targetWidth}px`;

    // Update viewport size state
    setTimeout(() => {
      if (iframe.contentWindow) {
        setViewportSize({
          width: iframe.contentWindow.innerWidth,
          height: iframe.contentWindow.innerHeight,
        });
      }
      // Remove transition after animation
      iframe.style.transition = '';
    }, 300);

    // Auto-scale transforms for all elements
    const elements = commandBus.elements;
    for (const [id, element] of elements.entries()) {
      if (element.mode === 'absolute' && element.breakpoints) {
        const currentTransform = element.breakpoints[oldBreakpoint] || element.breakpoints.desktop;

        // Check if target breakpoint already has a transform
        if (!element.breakpoints[newBreakpoint] && currentTransform) {
          // Auto-scale from current breakpoint to new breakpoint
          const scaledTransform = normalizeTransformBetweenBreakpoints(
            currentTransform,
            oldBreakpoint,
            newBreakpoint
          );

          // Dispatch transform command
          commandBus.dispatch({
            type: 'transform',
            payload: {
              id,
              transform: scaledTransform,
              breakpoint: newBreakpoint,
            },
            context: {
              timestamp: Date.now(),
              source: 'auto',
              description: `Auto-scaled transform from ${oldBreakpoint} to ${newBreakpoint}`,
            },
          });

          console.log(`🔄 Auto-scaled ${id} from ${oldBreakpoint} to ${newBreakpoint}`, scaledTransform);
        }
      }
    }

    console.log(`📱 Switched to ${newBreakpoint} (${targetWidth}px)`);
  }, [iframeRef, currentBreakpoint, commandBus]);

  /**
   * Keyboard shortcuts
   */
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input/textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      // Breakpoint switching: 1 = Desktop, 2 = Tablet, 3 = Mobile
      if (e.key === '1' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        handleBreakpointChange('desktop');
      }
      if (e.key === '2' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        handleBreakpointChange('tablet');
      }
      if (e.key === '3' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        handleBreakpointChange('mobile');
      }

      // Element creation shortcuts: A = Add menu, T = Text, I = Image, B = Button
      if (e.key.toLowerCase() === 'a' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        // Show QuickAdd at center of viewport
        setQuickAddPosition({
          x: viewportSize.width / 2,
          y: viewportSize.height / 2
        });
        console.log('💡 QuickAdd opened via keyboard (A)');
      }

      if (e.key.toLowerCase() === 't' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        // Create text element at center
        const id = `canvas-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const transform: Transform = {
          left: viewportSize.width / 2 - 150,
          top: viewportSize.height / 2 - 40,
          width: 300,
          height: 80,
          rotate: 0,
        };

        const element: CanvasElement = {
          id,
          type: 'text',
          mode: 'absolute',
          content: { text: 'Double click to edit' },
          styles: {
            fontSize: '24px',
            fontWeight: '600',
            color: '#1f2937',
            fontFamily: 'Inter, sans-serif',
          },
          breakpoints: { [currentBreakpoint]: transform },
          zIndex: Date.now(),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        commandBus.dispatch({
          type: 'insert',
          payload: { element },
          context: {
            timestamp: Date.now(),
            source: 'manual',
            description: 'Added text via keyboard (T)',
          },
        });

        console.log('📝 Created text element via keyboard (T)');
      }

      if (e.key.toLowerCase() === 'i' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        // Open Media Organizer
        setIsMediaOrganizerOpen(true);
        console.log('🖼️ Opened Media Organizer via keyboard (I)');
      }

      if (e.key.toLowerCase() === 'b' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        // Create button element at center
        const id = `canvas-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const transform: Transform = {
          left: viewportSize.width / 2 - 80,
          top: viewportSize.height / 2 - 24,
          width: 160,
          height: 48,
          rotate: 0,
        };

        const element: CanvasElement = {
          id,
          type: 'button',
          mode: 'absolute',
          content: { text: 'Click me', href: '#' },
          styles: {
            backgroundColor: '#3b82f6',
            color: 'white',
            fontSize: '16px',
            fontWeight: '500',
            borderRadius: '8px',
            padding: '12px 24px',
            border: 'none',
            cursor: 'pointer',
          },
          breakpoints: { [currentBreakpoint]: transform },
          zIndex: Date.now(),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        commandBus.dispatch({
          type: 'insert',
          payload: { element },
          context: {
            timestamp: Date.now(),
            source: 'manual',
            description: 'Added button via keyboard (B)',
          },
        });

        console.log('🔘 Created button element via keyboard (B)');
      }

      // Cmd/Ctrl+Z - Undo
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (commandBus.canUndo()) {
          commandBus.undo();
          console.log('↶ Undo');
        }
      }

      // Cmd/Ctrl+Shift+Z - Redo
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        if (commandBus.canRedo()) {
          commandBus.redo();
          console.log('↷ Redo');
        }
      }

      // Delete/Backspace - Delete selected element
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedElement) {
        e.preventDefault();
        commandBus.dispatch({
          type: 'delete',
          payload: { id: selectedElement.id },
          context: {
            timestamp: Date.now(),
            source: 'manual',
            description: `Deleted ${selectedElement.type} element`
          }
        });
        setSelectedElement(null);
        console.log('🗑️ Deleted element:', selectedElement.id);
      }

      // Escape - Deselect
      if (e.key === 'Escape') {
        setSelectedElement(null);
        setQuickAddPosition(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled, selectedElement, commandBus, handleBreakpointChange, currentBreakpoint, viewportSize]);

  /**
   * CSS Inspection - Debug why iframe isn't visible
   */
  useEffect(() => {
    if (!iframeRef.current || !hybridHTML) return;

    // Wait for iframe to fully load
    const timer = setTimeout(() => {
      const iframe = iframeRef.current;
      if (!iframe) return;

      const computed = window.getComputedStyle(iframe);
      const container = iframe.parentElement;

      console.log('🔍 Iframe computed styles:', {
        display: computed.display,
        visibility: computed.visibility,
        width: computed.width,
        height: computed.height,
        position: computed.position,
        top: computed.top,
        left: computed.left,
        zIndex: computed.zIndex,
        opacity: computed.opacity,
        transform: computed.transform,
      });

      if (container) {
        const containerComputed = window.getComputedStyle(container);
        console.log('🔍 Container computed styles:', {
          display: containerComputed.display,
          width: containerComputed.width,
          height: containerComputed.height,
          overflow: containerComputed.overflow,
          position: containerComputed.position,
        });
      }

      // Check iframe content
      const iframeDoc = iframe.contentDocument;
      if (iframeDoc) {
        console.log('🔍 Iframe document:', {
          readyState: iframeDoc.readyState,
          bodyChildCount: iframeDoc.body?.children.length || 0,
          bodyScrollHeight: iframeDoc.body?.scrollHeight || 0,
          bodyClientHeight: iframeDoc.body?.clientHeight || 0,
        });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [hybridHTML, iframeRef]);

  if (!enabled) return null;

  // V2.0: Determine HTML source (hybrid vs legacy)
  const effectiveHTML = editorMode === 'canvas' && hybridHTML ? hybridHTML : htmlContent;

  // Debug logging
  console.log('🎨 CanvasMode render:', {
    editorMode,
    hasHybridHTML: !!hybridHTML,
    hybridHTMLLength: hybridHTML?.length || 0,
    htmlContentLength: htmlContent?.length || 0,
    effectiveHTMLLength: effectiveHTML?.length || 0,
    usingHybrid: editorMode === 'canvas' && !!hybridHTML,
  });

  return (
    <div className="canvas-mode-container">
      {/* V2.0: Hybrid Canvas Loader - Non-rendering component */}
      {editorMode === 'canvas' && pageId && (
        <HybridCanvasLoader
          pageId={pageId}
          onLoad={handleHybridLoad}
          onError={handleHybridError}
        />
      )}

      {/* V2.0: Loading state */}
      {isHybridLoading && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(0,0,0,0.8)',
          color: 'white',
          padding: '20px 40px',
          borderRadius: 8,
          fontSize: 16,
          fontWeight: 500,
          zIndex: 10001,
        }}>
          Loading cloned HTML...
        </div>
      )}

      {/* V2.0: Error state */}
      {hybridLoadError && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: '#ef4444',
          color: 'white',
          padding: '20px 40px',
          borderRadius: 8,
          fontSize: 16,
          fontWeight: 500,
          zIndex: 10001,
        }}>
          Error: {hybridLoadError}
        </div>
      )}

      {/* V2.0: Iframe rendering with sandbox security */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'auto',
      }}>
        <iframe
          ref={iframeRef}
          srcDoc={effectiveHTML}
          sandbox="allow-same-origin allow-scripts" // V2.0 RC1: Enable functionality, defer strict security to v2.1.0
          title="Canvas Mode Preview"
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            display: 'block',
          }}
          onLoad={() => {
            console.log('🔓 Iframe loaded with relaxed sandbox (allow-same-origin allow-scripts) for RC1 functionality');
          }}
        />
      </div>

      {/* Breakpoint Selector */}
      <BreakpointSelector
        currentBreakpoint={currentBreakpoint}
        onBreakpointChange={handleBreakpointChange}
      />

      {/* Surface layer - handles DOM rendering and interaction */}
      <CanvasSurface
        iframeRef={iframeRef}
        htmlContent={effectiveHTML}
        onEmptySpaceClick={handleEmptySpaceClick}
        onElementSelect={handleElementSelect}
        enabled={enabled}
      />

      {/* Overlay layer - visual feedback (selection, guides) */}
      <CanvasOverlay
        selectedElement={selectedElement}
        hoveredElement={hoveredElement}
        snapGuides={snapGuides}
        viewportWidth={viewportSize.width}
        viewportHeight={viewportSize.height}
        currentBreakpoint={currentBreakpoint}
        onTransformPreview={handleTransformPreview}
      />

      {/* Element Context Bar */}
      {/* V2.0: Pass iframeRef for unlock functionality */}
      {selectedElement && (
        <ElementContextBar
          element={selectedElement}
          currentBreakpoint={currentBreakpoint}
          iframeRef={iframeRef}
          onClose={() => setSelectedElement(null)}
          onOpenMediaOrganizer={() => setIsMediaOrganizerOpen(true)}
        />
      )}

      {/* QuickAdd Toolbar */}
      {quickAddPosition && (
        <QuickAddToolbar
          position={quickAddPosition}
          currentBreakpoint={currentBreakpoint}
          onClose={() => setQuickAddPosition(null)}
          onOpenMediaOrganizer={() => setIsMediaOrganizerOpen(true)}
        />
      )}

      {/* Media Organizer */}
      <MediaOrganizer
        isOpen={isMediaOrganizerOpen}
        onClose={() => setIsMediaOrganizerOpen(false)}
        onSelectMedia={(item) => {
          // Insert image at center of viewport
          const id = `canvas-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          const transform: Transform = {
            left: viewportSize.width / 2 - 200,
            top: viewportSize.height / 2 - 150,
            width: 400,
            height: 300,
            rotate: 0,
          };

          const element: CanvasElement = {
            id,
            type: 'image',
            mode: 'absolute',
            content: {
              src: item.src,
              alt: item.name,
            },
            breakpoints: { [currentBreakpoint]: transform },
            zIndex: Date.now(),
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };

          commandBus.dispatch({
            type: 'insert',
            payload: { element },
            context: {
              timestamp: Date.now(),
              source: 'manual',
              description: `Added image ${item.name} via Media Organizer`,
            },
          });

          console.log('🖼️ Inserted image:', item.name);
        }}
      />

      {/* Snapshot Debug Tool (Cmd+Shift+D) */}
      {process.env.NODE_ENV === 'development' && <SnapshotDebugTool />}

      {/* E2E Test Suite (Cmd+Shift+T) */}
      {process.env.NODE_ENV === 'development' && (
        <CanvasE2ETest
          isOpen={showE2EPanel}
          onClose={() => setShowE2EPanel(false)}
        />
      )}

      {/* Floating Test Button */}
      {process.env.NODE_ENV === 'development' && (
        <button
          onClick={() => setShowE2EPanel(true)}
          style={{
            position: 'fixed',
            top: 120,
            right: 20,
            padding: '12px 20px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
            zIndex: 9999,
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
          }}
        >
          🧪 Run E2E Tests
        </button>
      )}

      {/* Debug info */}
      {process.env.NODE_ENV === 'development' && (
        <div
          style={{
            position: 'fixed',
            bottom: 10,
            right: 10,
            background: 'rgba(0,0,0,0.8)',
            color: 'white',
            padding: '8px 12px',
            borderRadius: 4,
            fontSize: 11,
            fontFamily: 'monospace',
            zIndex: 10000,
            pointerEvents: 'none'
          }}
        >
          <div>Breakpoint: {currentBreakpoint}</div>
          <div>Viewport: {viewportSize.width}×{viewportSize.height}</div>
          <div>Elements: {commandBus.elements.size}</div>
          <div>History: {commandBus.currentIndex + 1}/{commandBus.history.length}</div>
          <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.2)' }}>
            <div style={{ fontSize: 9, opacity: 0.7, marginBottom: 4 }}>SHORTCUTS</div>
            <div>1/2/3: Breakpoints | A: Add | T: Text | I: Image | B: Button</div>
            <div>Cmd+Z: Undo | Cmd+Shift+Z: Redo | Esc: Deselect</div>
            <div>Cmd+Shift+D: Snapshot | Cmd+Shift+T: E2E Tests</div>
          </div>
        </div>
      )}
    </div>
  );
}
