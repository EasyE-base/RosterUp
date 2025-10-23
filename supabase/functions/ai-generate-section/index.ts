/**
 * Supabase Edge Function: AI Generate Section
 * Uses OpenAI GPT-4o to generate complete HTML/CSS sections from natural language descriptions
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY') || '';

interface GenerateRequest {
  description: string;
  sectionType?: 'hero' | 'features' | 'pricing' | 'testimonials' | 'contact' | 'team' | 'faq' | 'footer' | 'custom';
  style?: 'modern' | 'minimal' | 'bold' | 'elegant';
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
    console.log('AI Generate Section invoked');
    const body = await req.json();
    const { description, sectionType = 'custom', style = 'modern' }: GenerateRequest = body;

    if (!description) {
      throw new Error('description is required');
    }

    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is not set');
    }

    console.log('Generate request:', { description, sectionType, style });

    // Use OpenAI to generate HTML/CSS
    const systemPrompt = `You are an expert web designer and HTML/CSS developer. Generate beautiful, modern, responsive HTML sections based on user descriptions.

IMPORTANT RULES:
1. Generate ONLY the HTML for the section - no <html>, <head>, or <body> tags
2. Use Tailwind CSS classes for styling (the website has Tailwind loaded)
3. Make it responsive with mobile-first design
4. Use semantic HTML5 elements
5. Include proper accessibility attributes (alt, aria-label, etc.)
6. For images, use placeholder URLs from https://images.unsplash.com/ with relevant keywords
7. Make it visually stunning and ${style} in design aesthetic
8. Include hover effects and transitions where appropriate
9. Ensure text contrast ratios meet WCAG standards
10. Return ONLY the HTML - no explanations, no markdown code blocks

Section Type: ${sectionType}
Style: ${style}`;

    const messages = [
      {
        role: 'system',
        content: systemPrompt,
      },
      {
        role: 'user',
        content: `Generate a ${sectionType} section with this description: "${description}"

Return only the HTML code, starting with a <section> tag.`,
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
        temperature: 0.7, // Slightly creative but consistent
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API failed: ${errorText}`);
    }

    const completion = await response.json();
    let generatedHtml = completion.choices[0].message.content.trim();

    console.log('AI generated section:', generatedHtml.substring(0, 200) + '...');

    // Clean up the HTML (remove markdown code blocks if any)
    generatedHtml = generatedHtml
      .replace(/```html\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    // Validate it's HTML
    if (!generatedHtml.startsWith('<')) {
      throw new Error('AI did not generate valid HTML');
    }

    return new Response(
      JSON.stringify({
        success: true,
        html: generatedHtml,
        sectionType,
        style,
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (error) {
    console.error('AI Generate Section error:', error);
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
