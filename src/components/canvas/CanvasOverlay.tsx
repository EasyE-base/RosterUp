/**
 * Canvas Overlay - Selection & Guides Layer
 * Renders selection boxes, snap guides, and UI chrome
 * pointer-events: none except on interactive handles
 */

import React, { useState, useCallback, useEffect } from 'react';
import type { CanvasElement, Transform, Point } from '@/lib/types';
import { getCurrentBreakpoint, type Breakpoint } from '@/lib/breakpoints';
import { useCommandBus } from '@/stores/commandBus';
import {
  applyTransformOperation,
  calculateRotationAngle,
  getCursorForHandle,
  getTransformCenter,
  snapTransform,
  type ResizeHandle,
} from '@/lib/transformUtils';

interface CanvasOverlayProps {
  selectedElement: CanvasElement | null;
  hoveredElement: CanvasElement | null;
  snapGuides: SnapGuide[];
  viewportWidth: number;
  viewportHeight: number;
  currentBreakpoint: Breakpoint;
  onTransformPreview?: (element: CanvasElement, transform: Transform) => void;
}

export interface SnapGuide {
  type: 'vertical' | 'horizontal' | 'grid';
  position: number;  // x for vertical, y for horizontal
  label?: string;
}

type TransformMode = 'resize' | 'rotate' | null;

interface TransformState {
  mode: TransformMode;
  handle?: string;
  startPoint: Point;
  startTransform: Transform;
  currentTransform: Transform;
  aspectRatio?: number;
}

export function CanvasOverlay({
  selectedElement,
  hoveredElement,
  snapGuides,
  viewportWidth,
  viewportHeight,
  currentBreakpoint,
  onTransformPreview
}: CanvasOverlayProps) {
  const commandBus = useCommandBus();
  const [transformState, setTransformState] = useState<TransformState | null>(null);
  const [shiftHeld, setShiftHeld] = useState(false);

  /**
   * Track Shift key for aspect ratio lock
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Shift') setShiftHeld(true);
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Shift') setShiftHeld(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  /**
   * Get transform for an element at current breakpoint
   */
  const getElementTransform = (elem: CanvasElement): Transform | null => {
    if (!elem.breakpoints) return null;
    return elem.breakpoints[currentBreakpoint] || elem.breakpoints.desktop;
  };

  /**
   * Map handle type to ResizeHandle
   */
  const mapHandleToResizeHandle = (handleType: string): ResizeHandle | null => {
    const map: Record<string, ResizeHandle> = {
      'nw': 'top-left',
      'n': 'top',
      'ne': 'top-right',
      'e': 'right',
      'se': 'bottom-right',
      's': 'bottom',
      'sw': 'bottom-left',
      'w': 'left',
    };
    return map[handleType] || null;
  };

  /**
   * Handle mouse down on resize/rotate handle
   */
  const handleHandleMouseDown = useCallback((e: React.MouseEvent, handleType: string) => {
    if (!selectedElement) return;

    e.preventDefault();
    e.stopPropagation();

    const transform = getElementTransform(selectedElement);
    if (!transform) return;

    const startPoint = { x: e.clientX, y: e.clientY };

    if (handleType === 'rotate') {
      setTransformState({
        mode: 'rotate',
        handle: handleType,
        startPoint,
        startTransform: transform,
        currentTransform: transform,
      });
    } else {
      const aspectRatio = shiftHeld ? transform.width / transform.height : undefined;
      setTransformState({
        mode: 'resize',
        handle: handleType,
        startPoint,
        startTransform: transform,
        currentTransform: transform,
        aspectRatio,
      });
    }
  }, [selectedElement, currentBreakpoint, shiftHeld]);

  /**
   * Handle mouse move during transform
   */
  useEffect(() => {
    if (!transformState || !selectedElement) return;

    const handleMouseMove = (e: MouseEvent) => {
      const currentPoint = { x: e.clientX, y: e.clientY };
      const delta = {
        x: currentPoint.x - transformState.startPoint.x,
        y: currentPoint.y - transformState.startPoint.y,
      };

      let newTransform = { ...transformState.startTransform };

      if (transformState.mode === 'resize' && transformState.handle) {
        const resizeHandle = mapHandleToResizeHandle(transformState.handle);
        if (resizeHandle) {
          newTransform = applyTransformOperation(newTransform, {
            type: 'resize',
            handle: resizeHandle,
            delta,
            aspectRatio: shiftHeld ? transformState.startTransform.width / transformState.startTransform.height : undefined,
          });
        }
      } else if (transformState.mode === 'rotate') {
        const center = getTransformCenter(transformState.startTransform);
        const angle = calculateRotationAngle(center, currentPoint, transformState.startPoint);
        newTransform = applyTransformOperation(newTransform, {
          type: 'rotate',
          angle,
        });
      }

      // Apply snap
      newTransform = snapTransform(newTransform);

      setTransformState({
        ...transformState,
        currentTransform: newTransform,
      });

      // Notify parent for snap guide updates
      if (onTransformPreview) {
        onTransformPreview(selectedElement, newTransform);
      }
    };

    const handleMouseUp = () => {
      if (!transformState) return;

      // Commit transform to command bus
      commandBus.dispatch({
        type: 'transform',
        payload: {
          id: selectedElement.id,
          transform: transformState.currentTransform,
          breakpoint: currentBreakpoint,
        },
        context: {
          timestamp: Date.now(),
          source: 'manual',
          description: `Transform ${selectedElement.type} via ${transformState.mode}`,
        },
      });

      setTransformState(null);
      console.log('✅ Transform committed:', transformState.mode, selectedElement.id);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [transformState, selectedElement, currentBreakpoint, commandBus, onTransformPreview, shiftHeld]);

  /**
   * Render selection box around element
   */
  const renderSelectionBox = (elem: CanvasElement, type: 'selected' | 'hovered') => {
    let transform = getElementTransform(elem);
    if (!transform) return null;

    // Use preview transform if currently transforming
    if (type === 'selected' && transformState && elem.id === selectedElement?.id) {
      transform = transformState.currentTransform;
    }

    const strokeColor = type === 'selected' ? '#10b981' : '#3b82f6';
    const strokeWidth = type === 'selected' ? 2 : 1;
    const strokeDasharray = type === 'selected' ? 'none' : '4 4';

    return (
      <g key={`${type}-${elem.id}`}>
        {/* Selection box */}
        <rect
          x={transform.left}
          y={transform.top}
          width={transform.width}
          height={transform.height}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
          style={{ pointerEvents: 'none' }}
        />

        {/* Info badge */}
        {type === 'selected' && (
          <g transform={`translate(${transform.left}, ${transform.top - 24})`}>
            <rect
              x={0}
              y={0}
              width={140}
              height={20}
              fill={strokeColor}
              rx={4}
              style={{ pointerEvents: 'none' }}
            />
            <text
              x={6}
              y={14}
              fill="white"
              fontSize={11}
              fontWeight={500}
              style={{ pointerEvents: 'none', userSelect: 'none' }}
            >
              {elem.type} · {Math.round(transform.width)}×{Math.round(transform.height)} · {Math.round(transform.rotate)}°
            </text>
          </g>
        )}

        {/* Corner handles for selected element */}
        {type === 'selected' && renderHandles(transform)}
      </g>
    );
  };

  /**
   * Render resize handles (8 corners/edges + rotate knob)
   */
  const renderHandles = (transform: Transform) => {
    const handleSize = 8;
    const handles: { x: number; y: number; cursor: string; type: string }[] = [
      // Corners
      { x: transform.left - handleSize / 2, y: transform.top - handleSize / 2, cursor: 'nwse-resize', type: 'nw' },
      { x: transform.left + transform.width - handleSize / 2, y: transform.top - handleSize / 2, cursor: 'nesw-resize', type: 'ne' },
      { x: transform.left - handleSize / 2, y: transform.top + transform.height - handleSize / 2, cursor: 'nesw-resize', type: 'sw' },
      { x: transform.left + transform.width - handleSize / 2, y: transform.top + transform.height - handleSize / 2, cursor: 'nwse-resize', type: 'se' },

      // Edges
      { x: transform.left + transform.width / 2 - handleSize / 2, y: transform.top - handleSize / 2, cursor: 'ns-resize', type: 'n' },
      { x: transform.left + transform.width - handleSize / 2, y: transform.top + transform.height / 2 - handleSize / 2, cursor: 'ew-resize', type: 'e' },
      { x: transform.left + transform.width / 2 - handleSize / 2, y: transform.top + transform.height - handleSize / 2, cursor: 'ns-resize', type: 's' },
      { x: transform.left - handleSize / 2, y: transform.top + transform.height / 2 - handleSize / 2, cursor: 'ew-resize', type: 'w' },
    ];

    return (
      <g>
        {handles.map((handle) => (
          <rect
            key={handle.type}
            x={handle.x}
            y={handle.y}
            width={handleSize}
            height={handleSize}
            fill="white"
            stroke="#10b981"
            strokeWidth={2}
            rx={2}
            style={{
              pointerEvents: 'auto',  // Handles are interactive!
              cursor: handle.cursor
            }}
            data-handle-type={handle.type}
            className="canvas-resize-handle"
            onMouseDown={(e) => handleHandleMouseDown(e, handle.type)}
          />
        ))}

        {/* Rotate knob */}
        <g transform={`translate(${transform.left + transform.width / 2}, ${transform.top - 30})`}>
          <line
            x1={0}
            y1={0}
            x2={0}
            y2={30}
            stroke="#10b981"
            strokeWidth={1}
            strokeDasharray="2 2"
            style={{ pointerEvents: 'none' }}
          />
          <circle
            cx={0}
            cy={0}
            r={6}
            fill="white"
            stroke="#10b981"
            strokeWidth={2}
            style={{
              pointerEvents: 'auto',
              cursor: transformState?.mode === 'rotate' ? 'grabbing' : 'grab'
            }}
            data-handle-type="rotate"
            className="canvas-rotate-handle"
            onMouseDown={(e) => handleHandleMouseDown(e, 'rotate')}
          />
        </g>
      </g>
    );
  };

  /**
   * Render snap guides
   */
  const renderSnapGuides = () => {
    return snapGuides.map((guide, index) => {
      if (guide.type === 'vertical') {
        return (
          <g key={`guide-v-${index}`}>
            <line
              x1={guide.position}
              y1={0}
              x2={guide.position}
              y2={viewportHeight}
              stroke="#ec4899"
              strokeWidth={1}
              strokeDasharray="4 4"
              style={{ pointerEvents: 'none' }}
            />
            {guide.label && (
              <text
                x={guide.position + 4}
                y={20}
                fill="#ec4899"
                fontSize={10}
                fontWeight={500}
                style={{ pointerEvents: 'none', userSelect: 'none' }}
              >
                {guide.label}
              </text>
            )}
          </g>
        );
      } else if (guide.type === 'horizontal') {
        return (
          <g key={`guide-h-${index}`}>
            <line
              x1={0}
              y1={guide.position}
              x2={viewportWidth}
              y2={guide.position}
              stroke="#ec4899"
              strokeWidth={1}
              strokeDasharray="4 4"
              style={{ pointerEvents: 'none' }}
            />
            {guide.label && (
              <text
                x={20}
                y={guide.position - 4}
                fill="#ec4899"
                fontSize={10}
                fontWeight={500}
                style={{ pointerEvents: 'none', userSelect: 'none' }}
              >
                {guide.label}
              </text>
            )}
          </g>
        );
      }
      return null;
    });
  };

  /**
   * Render 8px grid (faint background grid)
   */
  const renderGrid = () => {
    const gridSize = 8;
    const lines: JSX.Element[] = [];

    // Vertical lines
    for (let x = 0; x <= viewportWidth; x += gridSize) {
      lines.push(
        <line
          key={`grid-v-${x}`}
          x1={x}
          y1={0}
          x2={x}
          y2={viewportHeight}
          stroke="#e5e7eb"
          strokeWidth={0.5}
          style={{ pointerEvents: 'none' }}
        />
      );
    }

    // Horizontal lines
    for (let y = 0; y <= viewportHeight; y += gridSize) {
      lines.push(
        <line
          key={`grid-h-${y}`}
          x1={0}
          y1={y}
          x2={viewportWidth}
          y2={y}
          stroke="#e5e7eb"
          strokeWidth={0.5}
          style={{ pointerEvents: 'none' }}
        />
      );
    }

    return <g opacity={0.5}>{lines}</g>;
  };

  return (
    <div
      className="canvas-overlay"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',  // Entire overlay has no pointer events by default
        zIndex: 1000
      }}
    >
      <svg
        width={viewportWidth}
        height={viewportHeight}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          overflow: 'visible'
        }}
      >
        {/* Background grid (optional, can be toggled) */}
        {/* {renderGrid()} */}

        {/* Snap guides */}
        {renderSnapGuides()}

        {/* Hovered element */}
        {hoveredElement && renderSelectionBox(hoveredElement, 'hovered')}

        {/* Selected element */}
        {selectedElement && renderSelectionBox(selectedElement, 'selected')}
      </svg>
    </div>
  );
}
