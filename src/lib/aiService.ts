/**
 * AI Service
 * Handles AI inference for Canvas Mode element generation and modification
 * Supports OpenAI, Anthropic, and custom edge functions
 */

import type { CanvasElement, Transform } from './types';
import type { Breakpoint } from './breakpoints';
import { trackAICall } from './analytics';

// AI Provider configuration
const AI_PROVIDER = (import.meta.env.VITE_AI_PROVIDER || 'custom') as 'openai' | 'anthropic' | 'custom';
const AI_ENDPOINT = import.meta.env.VITE_AI_ENDPOINT || '/api/ai';
const AI_API_KEY = import.meta.env.VITE_AI_API_KEY || '';

// Timeout for AI requests (15 seconds)
const AI_TIMEOUT = 15000;

interface AIRequest {
  prompt: string;
  context: {
    mode: 'insert' | 'modify';
    breakpoint: Breakpoint;
    currentElement?: CanvasElement;
    viewportSize?: { width: number; height: number };
    position?: { x: number; y: number };
  };
}

interface AIResponse {
  commands: Array<{
    type: string;
    payload: any;
  }>;
  error?: string;
}

/**
 * Call OpenAI API
 */
async function callOpenAI(request: AIRequest, signal: AbortSignal): Promise<AIResponse> {
  const systemPrompt = request.context.mode === 'insert'
    ? `You are a helpful assistant that generates canvas elements for a website builder.
Given a user prompt, generate appropriate canvas elements with sensible defaults.
Return a JSON array of commands in this format:
[{ type: 'insert', payload: { element: {...} } }]

Element structure:
- id: string (generate with canvas-{timestamp}-{random})
- type: 'text' | 'image' | 'button' | 'section'
- mode: 'absolute'
- content: { text?: string, src?: string, alt?: string, href?: string, html?: string }
- styles: CSS properties object
- breakpoints: { [breakpoint]: { left, top, width, height, rotate } }
- zIndex: number (use Date.now())
- createdAt: number
- updatedAt: number

Position element at: x=${request.context.position?.x}, y=${request.context.position?.y}
Viewport: ${request.context.viewportSize?.width}×${request.context.viewportSize?.height}
Current breakpoint: ${request.context.breakpoint}`
    : `You are a helpful assistant that modifies canvas elements for a website builder.
Given a user prompt and current element state, generate modification commands.
Return a JSON array of commands in this format:
[{ type: 'update_text', payload: { id: '...', text: '...' } }]
or
[{ type: 'update_attr', payload: { id: '...', attr: 'fontSize', value: '24px' } }]

Available command types:
- update_text: Update text content
- update_attr: Update style/attribute
- transform: Update position/size

Current element: ${JSON.stringify(request.context.currentElement, null, 2)}`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${AI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: request.prompt },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    }),
    signal,
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content;

  if (!content) {
    throw new Error('No response from OpenAI');
  }

  // Parse JSON from response
  const jsonMatch = content.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    throw new Error('Invalid JSON in OpenAI response');
  }

  const commands = JSON.parse(jsonMatch[0]);
  return { commands };
}

/**
 * Call Anthropic API
 */
async function callAnthropic(request: AIRequest, signal: AbortSignal): Promise<AIResponse> {
  const systemPrompt = request.context.mode === 'insert'
    ? `You are a helpful assistant that generates canvas elements for a website builder.
Given a user prompt, generate appropriate canvas elements with sensible defaults.
Return only a JSON array of commands, no other text.`
    : `You are a helpful assistant that modifies canvas elements for a website builder.
Given a user prompt and current element state, generate modification commands.
Return only a JSON array of commands, no other text.`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': AI_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        { role: 'user', content: request.prompt },
      ],
    }),
    signal,
  });

  if (!response.ok) {
    throw new Error(`Anthropic API error: ${response.statusText}`);
  }

  const data = await response.json();
  const content = data.content[0]?.text;

  if (!content) {
    throw new Error('No response from Anthropic');
  }

  // Parse JSON from response
  const jsonMatch = content.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    throw new Error('Invalid JSON in Anthropic response');
  }

  const commands = JSON.parse(jsonMatch[0]);
  return { commands };
}

/**
 * Call custom edge function
 */
async function callCustom(request: AIRequest, signal: AbortSignal): Promise<AIResponse> {
  const response = await fetch(AI_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(AI_API_KEY ? { 'Authorization': `Bearer ${AI_API_KEY}` } : {}),
    },
    body: JSON.stringify({
      prompt: request.prompt,
      context: request.context,
      mode: 'canvas',
    }),
    signal,
  });

  if (!response.ok) {
    throw new Error(`Custom API error: ${response.statusText}`);
  }

  const data = await response.json();

  if (data.error) {
    throw new Error(data.error);
  }

  return { commands: data.commands || [] };
}

/**
 * Generate element using AI
 */
export async function aiGenerateElement(
  prompt: string,
  breakpoint: Breakpoint,
  position: { x: number; y: number },
  viewportSize: { width: number; height: number }
): Promise<AIResponse> {
  const start = performance.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), AI_TIMEOUT);

  try {
    const request: AIRequest = {
      prompt,
      context: {
        mode: 'insert',
        breakpoint,
        position,
        viewportSize,
      },
    };

    let response: AIResponse;

    switch (AI_PROVIDER) {
      case 'openai':
        response = await callOpenAI(request, controller.signal);
        break;
      case 'anthropic':
        response = await callAnthropic(request, controller.signal);
        break;
      case 'custom':
      default:
        response = await callCustom(request, controller.signal);
        break;
    }

    clearTimeout(timeoutId);

    // Track successful AI call
    const duration = performance.now() - start;
    trackAICall(duration, true, AI_PROVIDER);

    return response;
  } catch (error) {
    clearTimeout(timeoutId);

    // Track failed AI call
    const duration = performance.now() - start;
    trackAICall(duration, false, AI_PROVIDER);

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return {
          commands: [],
          error: 'AI request timed out after 15 seconds. Please try again.',
        };
      }
      return {
        commands: [],
        error: `AI request failed: ${error.message}`,
      };
    }

    return {
      commands: [],
      error: 'Unknown AI error occurred',
    };
  }
}

/**
 * Modify element using AI
 */
export async function aiModifyElement(
  prompt: string,
  element: CanvasElement,
  breakpoint: Breakpoint
): Promise<AIResponse> {
  const start = performance.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), AI_TIMEOUT);

  try {
    const request: AIRequest = {
      prompt,
      context: {
        mode: 'modify',
        breakpoint,
        currentElement: element,
      },
    };

    let response: AIResponse;

    switch (AI_PROVIDER) {
      case 'openai':
        response = await callOpenAI(request, controller.signal);
        break;
      case 'anthropic':
        response = await callAnthropic(request, controller.signal);
        break;
      case 'custom':
      default:
        response = await callCustom(request, controller.signal);
        break;
    }

    clearTimeout(timeoutId);

    // Track successful AI call
    const duration = performance.now() - start;
    trackAICall(duration, true, AI_PROVIDER);

    return response;
  } catch (error) {
    clearTimeout(timeoutId);

    // Track failed AI call
    const duration = performance.now() - start;
    trackAICall(duration, false, AI_PROVIDER);

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return {
          commands: [],
          error: 'AI request timed out after 15 seconds. Please try again.',
        };
      }
      return {
        commands: [],
        error: `AI request failed: ${error.message}`,
      };
    }

    return {
      commands: [],
      error: 'Unknown AI error occurred',
    };
  }
}

/**
 * Check if AI is available
 */
export function isAIAvailable(): boolean {
  if (AI_PROVIDER === 'custom') {
    return true; // Assume custom endpoint is available
  }
  return !!AI_API_KEY;
}

/**
 * Get AI provider name for display
 */
export function getAIProviderName(): string {
  switch (AI_PROVIDER) {
    case 'openai':
      return 'OpenAI GPT-4';
    case 'anthropic':
      return 'Anthropic Claude';
    case 'custom':
      return 'Custom AI';
    default:
      return 'AI';
  }
}
