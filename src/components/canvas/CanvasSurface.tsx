/**
 * Canvas Surface - DOM Rendering Layer
 * Handles iframe rendering, drag/drop, hit testing, and element interaction
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useCommandBus } from '@/stores/commandBus';
import { registry } from '@/lib/selectorRegistry';
import { mutationEngine } from '@/lib/mutationEngine';
import { createContext } from '@/lib/types';
import type { Point, CanvasElement } from '@/lib/types';
import { getCurrentBreakpoint } from '@/lib/breakpoints';

interface CanvasSurfaceProps {
  iframeRef: React.RefObject<HTMLIFrameElement>;
  htmlContent: string;
  onEmptySpaceClick?: (position: Point) => void;
  onElementSelect?: (element: CanvasElement | null) => void;
  enabled: boolean;
}

export function CanvasSurface({
  iframeRef,
  htmlContent,
  onEmptySpaceClick,
  onElementSelect,
  enabled
}: CanvasSurfaceProps) {
  const commandBus = useCommandBus();
  const [selectedElement, setSelectedElement] = useState<CanvasElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartPos, setDragStartPos] = useState<Point | null>(null);

  /**
   * Get viewport coordinates from a mouse event
   * Accounts for iframe offset and scroll position
   */
  const getViewportCoordinates = useCallback((e: MouseEvent): Point | null => {
    if (!iframeRef.current) return null;

    const iframeRect = iframeRef.current.getBoundingClientRect();
    const iframeDoc = iframeRef.current.contentDocument;
    if (!iframeDoc) return null;

    return {
      x: e.clientX - iframeRect.left + iframeDoc.documentElement.scrollLeft,
      y: e.clientY - iframeRect.top + iframeDoc.documentElement.scrollTop
    };
  }, [iframeRef]);

  /**
   * Hit test - find canvas element at position
   */
  const hitTest = useCallback((position: Point): CanvasElement | null => {
    const elements = commandBus.elements;
    if (elements.size === 0) return null;

    // Sort by z-index (highest first)
    const sortedElements = Array.from(elements.values())
      .filter(el => el.mode === 'absolute' && el.breakpoints)
      .sort((a, b) => (b.zIndex || 0) - (a.zIndex || 0));

    // Get current breakpoint
    const viewportWidth = iframeRef.current?.contentWindow?.innerWidth || 1440;
    const breakpoint = getCurrentBreakpoint(viewportWidth);

    // Find first element containing the point
    for (const elem of sortedElements) {
      const transform = elem.breakpoints![breakpoint] || elem.breakpoints!.desktop;

      // Simple AABB collision
      if (
        position.x >= transform.left &&
        position.x <= transform.left + transform.width &&
        position.y >= transform.top &&
        position.y <= transform.top + transform.height
      ) {
        return elem;
      }
    }

    return null;
  }, [commandBus.elements, iframeRef]);

  /**
   * Handle click on canvas
   * V2.0: Check for thryveId on flow elements first, then fall back to hitTest for absolute elements
   */
  const handleClick = useCallback((e: MouseEvent) => {
    if (!enabled) return;

    e.preventDefault();
    e.stopPropagation();

    const position = getViewportCoordinates(e);
    if (!position) return;

    // V2.0: First check if clicked element has a thryveId (flow element)
    const target = e.target as HTMLElement;
    let clickedElement: Element | null = target;

    // Walk up the DOM tree to find an element with data-thryve-id
    while (clickedElement && clickedElement !== iframeRef.current?.contentDocument?.documentElement) {
      if (clickedElement.hasAttribute && clickedElement.hasAttribute('data-thryve-id')) {
        const thryveId = clickedElement.getAttribute('data-thryve-id');

        // Look up the flow element by thryveId
        const flowElement = Array.from(commandBus.elements.values()).find(
          el => el.thryveId === thryveId
        );

        if (flowElement) {
          // Found flow element - select it
          setSelectedElement(flowElement);
          onElementSelect?.(flowElement);
          console.log('✅ Selected flow element:', flowElement.id, flowElement.type, `thryveId=${thryveId}`);
          return;
        }
      }
      clickedElement = clickedElement.parentElement;
    }

    // Fallback: Check if clicking on an absolute-positioned canvas element
    const hitElement = hitTest(position);

    if (hitElement) {
      // Clicked on an absolute element - select it
      setSelectedElement(hitElement);
      onElementSelect?.(hitElement);
    } else {
      // Clicked on empty space - show QuickAdd
      setSelectedElement(null);
      onElementSelect?.(null);
      onEmptySpaceClick?.(position);
    }
  }, [enabled, getViewportCoordinates, hitTest, onElementSelect, onEmptySpaceClick, iframeRef, commandBus.elements]);

  /**
   * Handle drag start
   */
  const handleMouseDown = useCallback((e: MouseEvent) => {
    if (!enabled) return;

    const position = getViewportCoordinates(e);
    if (!position) return;

    const hitElement = hitTest(position);
    if (hitElement) {
      setIsDragging(true);
      setDragStartPos(position);
      setSelectedElement(hitElement);
    }
  }, [enabled, getViewportCoordinates, hitTest]);

  /**
   * Handle drag move
   */
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!enabled || !isDragging || !dragStartPos || !selectedElement) return;

    const position = getViewportCoordinates(e);
    if (!position) return;

    // Calculate delta
    const dx = position.x - dragStartPos.x;
    const dy = position.y - dragStartPos.y;

    // Get current breakpoint
    const viewportWidth = iframeRef.current?.contentWindow?.innerWidth || 1440;
    const breakpoint = getCurrentBreakpoint(viewportWidth);

    // Get current transform
    const currentTransform = selectedElement.breakpoints?.[breakpoint] || selectedElement.breakpoints?.desktop;
    if (!currentTransform) return;

    // Update transform
    const newTransform = {
      ...currentTransform,
      left: currentTransform.left + dx,
      top: currentTransform.top + dy
    };

    // Dispatch transform command
    commandBus.dispatch({
      type: 'transform',
      payload: {
        id: selectedElement.id,
        transform: newTransform,
        breakpoint
      },
      context: createContext('manual', `Dragged element to (${newTransform.left}, ${newTransform.top})`)
    });

    // Update drag start position for next delta
    setDragStartPos(position);
  }, [enabled, isDragging, dragStartPos, selectedElement, getViewportCoordinates, commandBus, iframeRef]);

  /**
   * Handle drag end
   */
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDragStartPos(null);
  }, []);

  /**
   * Setup event listeners on iframe
   */
  useEffect(() => {
    if (!enabled || !iframeRef.current) return;

    const iframe = iframeRef.current;
    let iframeDoc: Document | null = null;

    const setupListeners = () => {
      iframeDoc = iframe.contentDocument || iframe.contentWindow?.document || null;
      if (!iframeDoc || !iframeDoc.body) {
        console.log('Canvas surface: iframe not ready, waiting...');
        return;
      }

      console.log('✓ Canvas surface: setting up event listeners');

      // Add event listeners
      iframeDoc.addEventListener('click', handleClick, true);
      iframeDoc.addEventListener('mousedown', handleMouseDown, true);
      iframeDoc.addEventListener('mousemove', handleMouseMove, true);
      iframeDoc.addEventListener('mouseup', handleMouseUp, true);

      // Sync selector registry with DOM
      registry.sync(iframeDoc);
    };

    // Try to setup immediately
    setupListeners();

    // Also listen for iframe load event
    iframe.addEventListener('load', setupListeners);

    // Fallback: retry after a short delay
    const retryTimeout = setTimeout(setupListeners, 500);

    // Cleanup
    return () => {
      iframe.removeEventListener('load', setupListeners);
      clearTimeout(retryTimeout);

      if (iframeDoc) {
        iframeDoc.removeEventListener('click', handleClick, true);
        iframeDoc.removeEventListener('mousedown', handleMouseDown, true);
        iframeDoc.removeEventListener('mousemove', handleMouseMove, true);
        iframeDoc.removeEventListener('mouseup', handleMouseUp, true);
      }
    };
  }, [enabled, iframeRef, handleClick, handleMouseDown, handleMouseMove, handleMouseUp]);

  /**
   * Render canvas elements to iframe
   */
  useEffect(() => {
    if (!iframeRef.current) return;

    const iframeDoc = iframeRef.current.contentDocument;
    if (!iframeDoc) return;

    // Get all canvas elements from command bus
    const elements = commandBus.elements;
    if (elements.size === 0) return;

    // Compile to DOM mutations
    const mutations = mutationEngine.compile({
      mode: 'canvas',
      elements
    });

    // Apply mutations to iframe DOM
    mutationEngine.applyToDOM(iframeDoc, mutations);

    console.log(`✓ Canvas surface: rendered ${elements.size} element(s)`);
  }, [commandBus.elements, iframeRef]);

  // Canvas surface doesn't render anything visible
  // All rendering happens inside the iframe
  return null;
}
