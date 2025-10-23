/**
 * Supabase Edge Function: AI Design Analyzer
 * Uses OpenAI GPT-4o to analyze website design and suggest improvements
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY') || '';

interface AnalyzeRequest {
  htmlContent: string;
  cssContent: string;
}

interface DesignSuggestion {
  id: string;
  title: string;
  description: string;
  category: 'color' | 'typography' | 'spacing' | 'layout' | 'accessibility' | 'modern-design';
  priority: 'high' | 'medium' | 'low';
  cssChanges: { [selector: string]: { [property: string]: string } };
  before: string;
  after: string;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  try {
    console.log('AI Design Analyzer invoked');
    const body = await req.json();
    const { htmlContent, cssContent }: AnalyzeRequest = body;

    if (!htmlContent) {
      throw new Error('htmlContent is required');
    }

    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is not set');
    }

    console.log('Analyze request:', {
      htmlLength: htmlContent.length,
      cssLength: cssContent?.length || 0,
    });

    // Use OpenAI with structured output to get suggestions
    const tools = [
      {
        type: 'function',
        function: {
          name: 'provide_design_suggestions',
          description: 'Provides a list of design improvement suggestions',
          parameters: {
            type: 'object',
            properties: {
              suggestions: {
                type: 'array',
                description: 'Array of design suggestions',
                items: {
                  type: 'object',
                  properties: {
                    title: { type: 'string', description: 'Short title for the suggestion' },
                    description: { type: 'string', description: 'Detailed explanation of the improvement' },
                    category: {
                      type: 'string',
                      enum: ['color', 'typography', 'spacing', 'layout', 'accessibility', 'modern-design'],
                      description: 'Category of the suggestion',
                    },
                    priority: {
                      type: 'string',
                      enum: ['high', 'medium', 'low'],
                      description: 'Priority level',
                    },
                    cssSelector: { type: 'string', description: 'CSS selector for the element to modify' },
                    cssProperty: { type: 'string', description: 'CSS property to change' },
                    currentValue: { type: 'string', description: 'Current CSS value' },
                    suggestedValue: { type: 'string', description: 'Suggested new value' },
                  },
                  required: ['title', 'description', 'category', 'priority', 'cssSelector', 'cssProperty', 'currentValue', 'suggestedValue'],
                },
              },
            },
            required: ['suggestions'],
          },
        },
      },
    ];

    const systemPrompt = `You are an expert web designer and UX consultant. Analyze the provided HTML/CSS and suggest specific, actionable design improvements.

Focus on:
1. COLOR HARMONY - Color palette issues, contrast problems, brand consistency
2. TYPOGRAPHY - Font sizes, line heights, hierarchy, readability
3. SPACING - Margins, padding, whitespace, visual breathing room
4. LAYOUT - Alignment, grid systems, responsive design
5. ACCESSIBILITY - WCAG compliance, contrast ratios, semantic HTML
6. MODERN DESIGN - Current trends, visual appeal, polish

For each suggestion:
- Provide specific CSS selector and property to change
- Include exact current and suggested values
- Explain why the change improves the design
- Prioritize suggestions (high/medium/low)

Limit to 5-8 most impactful suggestions.`;

    const messages = [
      {
        role: 'system',
        content: systemPrompt,
      },
      {
        role: 'user',
        content: `Analyze this website and provide design improvement suggestions:

HTML (${htmlContent.length} chars):
${htmlContent.substring(0, 8000)}

${cssContent ? `CSS (${cssContent.length} chars):\n${cssContent.substring(0, 2000)}` : 'No custom CSS provided'}

Provide specific, actionable suggestions using the provide_design_suggestions function.`,
      },
    ];

    // Call OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: messages,
        tools: tools,
        tool_choice: { type: 'function', function: { name: 'provide_design_suggestions' } },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API failed: ${errorText}`);
    }

    const completion = await response.json();
    const assistantMessage = completion.choices[0].message;

    if (!assistantMessage.tool_calls || assistantMessage.tool_calls.length === 0) {
      throw new Error('AI did not provide suggestions');
    }

    const toolCall = assistantMessage.tool_calls[0];
    const functionArgs = JSON.parse(toolCall.function.arguments);
    const rawSuggestions = functionArgs.suggestions || [];

    console.log(`✓ AI provided ${rawSuggestions.length} suggestions`);

    // Transform to our format
    const suggestions: DesignSuggestion[] = rawSuggestions.map((s: any, index: number) => ({
      id: `suggestion-${index + 1}`,
      title: s.title,
      description: s.description,
      category: s.category,
      priority: s.priority,
      cssChanges: {
        [s.cssSelector]: {
          [s.cssProperty]: s.suggestedValue,
        },
      },
      before: s.currentValue,
      after: s.suggestedValue,
    }));

    return new Response(
      JSON.stringify({
        success: true,
        suggestions,
        suggestionsCount: suggestions.length,
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (error) {
    console.error('AI Design Analyzer error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error?.message || String(error),
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
});
