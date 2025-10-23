/**
 * QuickAdd Toolbar
 * Appears on empty space click
 * Provides fast element insertion: Text, Image, Button, Section
 * Includes AI Add input for natural language element creation
 */

import React, { useState, useRef, useEffect } from 'react';
import type { Point, CanvasElement, Transform } from '@/lib/types';
import { useCommandBus } from '@/stores/commandBus';
import type { Breakpoint } from '@/lib/breakpoints';
import { aiGenerateElement, isAIAvailable } from '@/lib/aiService';

interface QuickAddToolbarProps {
  position: Point;
  currentBreakpoint: Breakpoint;
  onClose: () => void;
  onOpenMediaOrganizer?: () => void;
}

type ElementType = 'text' | 'image' | 'button' | 'section';

export function QuickAddToolbar({
  position,
  currentBreakpoint,
  onClose,
  onOpenMediaOrganizer,
}: QuickAddToolbarProps) {
  const commandBus = useCommandBus();
  const [aiInput, setAiInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /**
   * Focus AI input on mount
   */
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  /**
   * Generate unique element ID
   */
  const generateId = () => `canvas-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  /**
   * Create default transform at position
   */
  const createTransform = (width: number, height: number): Transform => ({
    left: position.x - width / 2, // Center at cursor
    top: position.y - height / 2,
    width,
    height,
    rotate: 0,
  });

  /**
   * Handle quick add button click
   */
  const handleQuickAdd = (type: ElementType) => {
    const id = generateId();

    let element: CanvasElement;
    let transform: Transform;

    switch (type) {
      case 'text':
        transform = createTransform(300, 80);
        element = {
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
        break;

      case 'image':
        // Open media organizer instead of creating empty image
        if (onOpenMediaOrganizer) {
          onOpenMediaOrganizer();
          onClose();
          return;
        }
        // Fallback: create placeholder
        transform = createTransform(400, 300);
        element = {
          id,
          type: 'image',
          mode: 'absolute',
          content: {
            src: 'https://via.placeholder.com/400x300',
            alt: 'Placeholder image',
          },
          breakpoints: { [currentBreakpoint]: transform },
          zIndex: Date.now(),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        break;

      case 'button':
        transform = createTransform(160, 48);
        element = {
          id,
          type: 'button',
          mode: 'absolute',
          content: {
            text: 'Click me',
            href: '#',
          },
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
        break;

      case 'section':
        transform = createTransform(800, 400);
        element = {
          id,
          type: 'section',
          mode: 'absolute',
          content: { html: '' },
          styles: {
            backgroundColor: '#f9fafb',
            borderRadius: '12px',
            border: '2px dashed #d1d5db',
          },
          breakpoints: { [currentBreakpoint]: transform },
          zIndex: Date.now(),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        break;
    }

    // Dispatch insert command
    commandBus.dispatch({
      type: 'insert',
      payload: { element },
      context: {
        timestamp: Date.now(),
        source: 'manual',
        description: `Added ${type} via QuickAdd toolbar`,
      },
    });

    console.log(`✨ Added ${type} element:`, element.id);
    onClose();
  };

  /**
   * Handle AI add
   */
  const handleAiAdd = async () => {
    if (!aiInput.trim() || isAiLoading) return;

    setIsAiLoading(true);
    setAiError(null);

    try {
      // Get viewport size for AI context
      const viewportSize = {
        width: window.innerWidth,
        height: window.innerHeight,
      };

      // Call AI service to generate element
      const response = await aiGenerateElement(
        aiInput,
        currentBreakpoint,
        position,
        viewportSize
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

      // Dispatch AI-generated commands using async queue
      await commandBus.dispatchAsync(async (queue) => {
        for (const command of response.commands) {
          // Add AI context to each command
          queue.add({
            ...command,
            context: {
              timestamp: Date.now(),
              source: 'ai',
              description: `AI generated: "${aiInput}"`,
            },
          });
        }
      });

      console.log('🤖 AI added element:', aiInput);
      onClose();
    } catch (error) {
      console.error('AI add failed:', error);
      setAiError(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setIsAiLoading(false);
    }
  };

  const buttons: Array<{
    type: ElementType;
    label: string;
    icon: string;
    color: string;
  }> = [
    { type: 'text', label: 'Text', icon: '📝', color: '#3b82f6' },
    { type: 'image', label: 'Image', icon: '🖼️', color: '#10b981' },
    { type: 'button', label: 'Button', icon: '🔘', color: '#8b5cf6' },
    { type: 'section', label: 'Section', icon: '📦', color: '#f59e0b' },
  ];

  return (
    <div
      className="quick-add-toolbar"
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        zIndex: 10000,
        backgroundColor: 'white',
        borderRadius: 12,
        boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
        padding: 12,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        minWidth: 240,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Quick add buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {buttons.map((btn) => (
          <button
            key={btn.type}
            onClick={() => handleQuickAdd(btn.type)}
            style={{
              padding: '12px',
              backgroundColor: 'transparent',
              border: `2px solid ${btn.color}`,
              borderRadius: 8,
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = `${btn.color}10`;
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <span style={{ fontSize: 24 }}>{btn.icon}</span>
            <span style={{ fontSize: 12, fontWeight: 500, color: btn.color }}>
              {btn.label}
            </span>
          </button>
        ))}
      </div>

      {/* Divider */}
      <div style={{ height: 1, backgroundColor: '#e5e7eb', margin: '4px 0' }} />

      {/* AI Add input */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            ref={inputRef}
            type="text"
            value={aiInput}
            onChange={(e) => {
              setAiInput(e.target.value);
              setAiError(null); // Clear error on input change
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAiAdd();
              if (e.key === 'Escape') onClose();
            }}
            placeholder={isAIAvailable() ? 'AI Add...' : 'AI not configured'}
            disabled={isAiLoading || !isAIAvailable()}
            style={{
              flex: 1,
              padding: '8px 12px',
              border: `2px solid ${aiError ? '#ef4444' : '#e5e7eb'}`,
              borderRadius: 6,
              fontSize: 14,
              outline: 'none',
              transition: 'border-color 0.2s ease',
            }}
            onFocus={(e) => {
              if (!aiError) {
                e.currentTarget.style.borderColor = '#3b82f6';
              }
            }}
            onBlur={(e) => {
              if (!aiError) {
                e.currentTarget.style.borderColor = '#e5e7eb';
              }
            }}
          />
          <button
            onClick={handleAiAdd}
            disabled={isAiLoading || !aiInput.trim() || !isAIAvailable()}
            style={{
              padding: '8px 16px',
              backgroundColor: isAiLoading || !aiInput.trim() || !isAIAvailable() ? '#d1d5db' : '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              cursor: isAiLoading || !aiInput.trim() || !isAIAvailable() ? 'not-allowed' : 'pointer',
              fontSize: 14,
              fontWeight: 500,
              transition: 'background-color 0.2s ease',
            }}
          >
            {isAiLoading ? '⏳' : '🤖'}
          </button>
        </div>

        {/* Error message */}
        {aiError && (
          <div
            style={{
              padding: '8px 12px',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: 6,
              fontSize: 12,
              color: '#dc2626',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span>⚠️</span>
            <span>{aiError}</span>
          </div>
        )}
      </div>

      {/* Hint */}
      <div
        style={{
          fontSize: 11,
          color: '#9ca3af',
          textAlign: 'center',
          marginTop: 4,
        }}
      >
        Press <kbd style={{ padding: '2px 6px', background: '#f3f4f6', borderRadius: 3 }}>Esc</kbd> to close
      </div>
    </div>
  );
}
