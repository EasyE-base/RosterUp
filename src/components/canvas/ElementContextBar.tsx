/**
 * Element Context Bar
 * Appears when element is selected
 * Provides actions: Edit, Replace, Style, Delete, AI Modify, Unlock for Transform
 * V2.0: Integrated with mutationEngine for flow-to-absolute unlock
 */

import React, { useState, useRef } from 'react';
import type { CanvasElement, Transform } from '@/lib/types';
import { useCommandBus } from '@/stores/commandBus';
import type { Breakpoint } from '@/lib/breakpoints';
import { aiModifyElement, isAIAvailable } from '@/lib/aiService';
import { mutationEngine } from '@/lib/mutationEngine';
import { registry } from '@/lib/selectorRegistry';

interface ElementContextBarProps {
  element: CanvasElement;
  currentBreakpoint: Breakpoint;
  iframeRef?: React.RefObject<HTMLIFrameElement>; // V2.0: Required for unlock
  onClose?: () => void;
  onOpenMediaOrganizer?: () => void;
}

export function ElementContextBar({
  element,
  currentBreakpoint,
  iframeRef, // V2.0: Needed for unlock
  onClose,
  onOpenMediaOrganizer,
}: ElementContextBarProps) {
  const commandBus = useCommandBus();
  const [isEditingText, setIsEditingText] = useState(false);
  const [editedText, setEditedText] = useState(element.content.text || '');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [showStylePanel, setShowStylePanel] = useState(false);
  const textInputRef = useRef<HTMLInputElement>(null);

  /**
   * Get transform for current breakpoint
   */
  const getTransform = (): Transform | null => {
    if (!element.breakpoints) return null;
    return element.breakpoints[currentBreakpoint] || element.breakpoints.desktop;
  };

  const transform = getTransform();

  /**
   * Handle text edit
   */
  const handleTextEdit = () => {
    setIsEditingText(true);
    setTimeout(() => textInputRef.current?.focus(), 0);
  };

  const handleTextSave = () => {
    if (editedText !== element.content.text) {
      commandBus.dispatch({
        type: 'update_text',
        payload: {
          id: element.id,
          text: editedText,
        },
        context: {
          timestamp: Date.now(),
          source: 'manual',
          description: `Updated text content`,
        },
      });
      console.log('✏️ Updated text:', editedText);
    }
    setIsEditingText(false);
  };

  /**
   * Handle replace (for images)
   */
  const handleReplace = () => {
    if (element.type === 'image' && onOpenMediaOrganizer) {
      onOpenMediaOrganizer();
    }
  };

  /**
   * Handle style changes
   */
  const handleStyleChange = (key: string, value: string) => {
    commandBus.dispatch({
      type: 'update_attr',
      payload: {
        id: element.id,
        attr: key,
        value,
      },
      context: {
        timestamp: Date.now(),
        source: 'manual',
        description: `Updated ${key} style`,
      },
    });
    console.log(`🎨 Updated style: ${key} = ${value}`);
  };

  /**
   * Handle delete
   */
  const handleDelete = () => {
    commandBus.dispatch({
      type: 'delete',
      payload: { id: element.id },
      context: {
        timestamp: Date.now(),
        source: 'manual',
        description: `Deleted ${element.type} element`,
      },
    });
    console.log('🗑️ Deleted element:', element.id);
    onClose?.();
  };

  /**
   * Handle AI modify
   */
  const handleAiModify = async () => {
    if (!aiPrompt.trim() || isAiLoading) return;

    setIsAiLoading(true);
    setAiError(null);

    try {
      // Call AI service to modify element
      const response = await aiModifyElement(
        aiPrompt,
        element,
        currentBreakpoint
      );

      if (response.error) {
        setAiError(response.error);
        setIsAiLoading(false);
        return;
      }

      if (!response.commands || response.commands.length === 0) {
        setAiError('AI returned no commands. Try a more specific prompt.');
        setIsAiLoading(false);
        return;
      }

      // Dispatch AI-generated modification commands using async queue
      await commandBus.dispatchAsync(async (queue) => {
        for (const command of response.commands) {
          // Add AI context to each command
          queue.add({
            ...command,
            context: {
              timestamp: Date.now(),
              source: 'ai',
              description: `AI modified: "${aiPrompt}"`,
            },
          });
        }
      });

      console.log('🤖 AI modified element:', aiPrompt);
      setAiPrompt('');
    } catch (error) {
      console.error('AI modify failed:', error);
      setAiError(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setIsAiLoading(false);
    }
  };

  /**
   * V2.0: Handle unlock for transform (convert flow to absolute)
   * Captures computed styles and position, then converts to absolute mode
   */
  const handleUnlock = () => {
    if (element.mode !== 'flow' || !element.thryveId || !iframeRef?.current) {
      console.warn('⚠️ Cannot unlock: missing requirements', {
        mode: element.mode,
        thryveId: element.thryveId,
        hasIframe: !!iframeRef?.current,
      });
      return;
    }

    try {
      // Get iframe document
      const iframeDoc = iframeRef.current.contentDocument || iframeRef.current.contentWindow?.document;
      if (!iframeDoc) {
        console.error('❌ Cannot access iframe document');
        return;
      }

      // Get DOM element using thryveId
      const domElement = registry.getByThryveId(element.thryveId);
      if (!domElement) {
        console.error('❌ Element not found in registry:', element.thryveId);
        return;
      }

      // Get viewport width for responsive transform generation
      const viewportWidth = iframeDoc.defaultView?.innerWidth || 1440;

      // Use mutationEngine to convert flow → absolute with preserved styles
      const absoluteElement = mutationEngine.unlockFlowElement(
        element.thryveId,
        domElement,
        viewportWidth
      );

      // Dispatch insert command for new absolute element
      commandBus.dispatch({
        type: 'insert',
        payload: {
          element: absoluteElement,
        },
        context: {
          timestamp: Date.now(),
          source: 'manual',
          description: `Unlocked flow element to absolute: ${element.thryveId}`,
        },
      });

      console.log('🔓 Unlocked element for transform:', {
        thryveId: element.thryveId,
        position: absoluteElement.breakpoints?.desktop,
        preservedStyles: Object.keys(absoluteElement.styles || {}).length,
      });

      // Close context bar after unlock
      onClose?.();
    } catch (error) {
      console.error('❌ Unlock failed:', error);
    }
  };

  if (!transform) {
    return null;
  }

  // Position context bar above element
  const barTop = transform.top - 48;
  const barLeft = transform.left;

  return (
    <>
      {/* Main context bar */}
      <div
        className="element-context-bar"
        style={{
          position: 'fixed',
          left: barLeft,
          top: Math.max(barTop, 60), // Don't overlap with breakpoint selector
          zIndex: 10001,
          backgroundColor: 'white',
          borderRadius: 8,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          padding: 4,
          display: 'flex',
          gap: 4,
          alignItems: 'center',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Edit button (for text) */}
        {element.type === 'text' && (
          <button
            onClick={handleTextEdit}
            title="Edit text"
            style={{
              padding: '8px 12px',
              backgroundColor: 'transparent',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              fontSize: 14,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              transition: 'background-color 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f3f4f6';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            ✏️ Edit
          </button>
        )}

        {/* Replace button (for images) */}
        {element.type === 'image' && (
          <button
            onClick={handleReplace}
            title="Replace image"
            style={{
              padding: '8px 12px',
              backgroundColor: 'transparent',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              fontSize: 14,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              transition: 'background-color 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f3f4f6';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            🔄 Replace
          </button>
        )}

        {/* Style button */}
        <button
          onClick={() => setShowStylePanel(!showStylePanel)}
          title="Style options"
          style={{
            padding: '8px 12px',
            backgroundColor: showStylePanel ? '#f3f4f6' : 'transparent',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
            fontSize: 14,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            transition: 'background-color 0.2s ease',
          }}
          onMouseEnter={(e) => {
            if (!showStylePanel) {
              e.currentTarget.style.backgroundColor = '#f3f4f6';
            }
          }}
          onMouseLeave={(e) => {
            if (!showStylePanel) {
              e.currentTarget.style.backgroundColor = 'transparent';
            }
          }}
        >
          🎨 Style
        </button>

        {/* Divider */}
        <div style={{ width: 1, height: 24, backgroundColor: '#e5e7eb' }} />

        {/* Delete button */}
        <button
          onClick={handleDelete}
          title="Delete element"
          style={{
            padding: '8px 12px',
            backgroundColor: 'transparent',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
            fontSize: 14,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            color: '#ef4444',
            transition: 'background-color 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#fef2f2';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          🗑️ Delete
        </button>

        {/* Unlock button (for flow elements) */}
        {element.mode === 'flow' && (
          <>
            <div style={{ width: 1, height: 24, backgroundColor: '#e5e7eb' }} />
            <button
              onClick={handleUnlock}
              title="Unlock for transform"
              style={{
                padding: '8px 12px',
                backgroundColor: 'transparent',
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer',
                fontSize: 14,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                transition: 'background-color 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f3f4f6';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              🔓 Unlock
            </button>
          </>
        )}
      </div>

      {/* Text editing panel */}
      {isEditingText && (
        <div
          style={{
            position: 'fixed',
            left: barLeft,
            top: Math.max(barTop, 60) + 48,
            zIndex: 10002,
            backgroundColor: 'white',
            borderRadius: 8,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            padding: 12,
            minWidth: 300,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <input
            ref={textInputRef}
            type="text"
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleTextSave();
              if (e.key === 'Escape') setIsEditingText(false);
            }}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '2px solid #e5e7eb',
              borderRadius: 6,
              fontSize: 14,
              outline: 'none',
              marginBottom: 8,
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#3b82f6';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = '#e5e7eb';
            }}
          />
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button
              onClick={() => setIsEditingText(false)}
              style={{
                padding: '6px 12px',
                backgroundColor: 'transparent',
                border: '1px solid #e5e7eb',
                borderRadius: 6,
                cursor: 'pointer',
                fontSize: 13,
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleTextSave}
              style={{
                padding: '6px 12px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              Save
            </button>
          </div>
        </div>
      )}

      {/* Style panel */}
      {showStylePanel && (
        <div
          style={{
            position: 'fixed',
            left: barLeft,
            top: Math.max(barTop, 60) + 48,
            zIndex: 10002,
            backgroundColor: 'white',
            borderRadius: 8,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            padding: 12,
            minWidth: 280,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ marginBottom: 12, fontWeight: 600, fontSize: 14 }}>
            Quick Styles
          </div>

          {/* Common style options based on element type */}
          {element.type === 'text' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div>
                <label style={{ fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 4 }}>
                  Font Size
                </label>
                <select
                  value={element.styles?.fontSize || '16px'}
                  onChange={(e) => handleStyleChange('fontSize', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '6px 8px',
                    border: '1px solid #e5e7eb',
                    borderRadius: 6,
                    fontSize: 14,
                  }}
                >
                  <option value="12px">12px</option>
                  <option value="14px">14px</option>
                  <option value="16px">16px</option>
                  <option value="20px">20px</option>
                  <option value="24px">24px</option>
                  <option value="32px">32px</option>
                  <option value="48px">48px</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 4 }}>
                  Color
                </label>
                <input
                  type="color"
                  value={element.styles?.color || '#000000'}
                  onChange={(e) => handleStyleChange('color', e.target.value)}
                  style={{
                    width: '100%',
                    height: 36,
                    border: '1px solid #e5e7eb',
                    borderRadius: 6,
                    cursor: 'pointer',
                  }}
                />
              </div>
            </div>
          )}

          {element.type === 'button' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div>
                <label style={{ fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 4 }}>
                  Background Color
                </label>
                <input
                  type="color"
                  value={element.styles?.backgroundColor || '#3b82f6'}
                  onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                  style={{
                    width: '100%',
                    height: 36,
                    border: '1px solid #e5e7eb',
                    borderRadius: 6,
                    cursor: 'pointer',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 4 }}>
                  Border Radius
                </label>
                <select
                  value={element.styles?.borderRadius || '8px'}
                  onChange={(e) => handleStyleChange('borderRadius', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '6px 8px',
                    border: '1px solid #e5e7eb',
                    borderRadius: 6,
                    fontSize: 14,
                  }}
                >
                  <option value="0px">0px (Square)</option>
                  <option value="4px">4px</option>
                  <option value="8px">8px</option>
                  <option value="12px">12px</option>
                  <option value="999px">999px (Pill)</option>
                </select>
              </div>
            </div>
          )}

          {/* AI Style Modifier */}
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #e5e7eb' }}>
            <label style={{ fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 4 }}>
              AI Modify
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="text"
                  value={aiPrompt}
                  onChange={(e) => {
                    setAiPrompt(e.target.value);
                    setAiError(null); // Clear error on input change
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAiModify();
                  }}
                  placeholder={isAIAvailable() ? 'Make it blue...' : 'AI not configured'}
                  disabled={isAiLoading || !isAIAvailable()}
                  style={{
                    flex: 1,
                    padding: '6px 8px',
                    border: `1px solid ${aiError ? '#ef4444' : '#e5e7eb'}`,
                    borderRadius: 6,
                    fontSize: 13,
                    outline: 'none',
                  }}
                />
                <button
                  onClick={handleAiModify}
                  disabled={isAiLoading || !aiPrompt.trim() || !isAIAvailable()}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: isAiLoading || !aiPrompt.trim() || !isAIAvailable() ? '#d1d5db' : '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: 6,
                    cursor: isAiLoading || !aiPrompt.trim() || !isAIAvailable() ? 'not-allowed' : 'pointer',
                    fontSize: 13,
                  }}
                >
                  {isAiLoading ? '⏳' : '🤖'}
                </button>
              </div>

              {/* Error message */}
              {aiError && (
                <div
                  style={{
                    padding: '6px 8px',
                    backgroundColor: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: 6,
                    fontSize: 11,
                    color: '#dc2626',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <span>⚠️</span>
                  <span>{aiError}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
