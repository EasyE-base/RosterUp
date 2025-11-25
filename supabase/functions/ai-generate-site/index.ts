/**
 * Supabase Edge Function: AI Generate Site
 * Uses OpenAI GPT-4o to generate a complete website structure with multiple sections
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY') || '';

interface GenerateSiteRequest {
    prompt: string;
    businessName?: string;
    tone?: string;
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
        console.log('AI Generate Site invoked');
        const body = await req.json();
        const { prompt, businessName = 'My Business', tone = 'professional' }: GenerateSiteRequest = body;

        if (!prompt) {
            throw new Error('prompt is required');
        }

        if (!OPENAI_API_KEY) {
            throw new Error('OPENAI_API_KEY environment variable is not set');
        }

        console.log('Generate site request:', { prompt, businessName, tone });

        // Use OpenAI to generate site structure
        const systemPrompt = `You are an expert web architect. Generate a website structure.
Return ONLY a valid JSON object with a "sections" array.
Each section must have: "type" (one of: 'hero', 'about', 'schedule', 'contact', 'gallery', 'roster', 'commitments', 'footer') and "description".
Include 4-6 sections.`;

        const messages = [
            {
                role: 'system',
                content: systemPrompt,
            },
            {
                role: 'user',
                content: `Generate structure for: "${prompt}". Business: "${businessName}". Tone: "${tone}".`,
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
                model: 'gpt-4o-mini', // Use gpt-4o-mini for speed
                messages: messages,
                temperature: 0.7,
                max_tokens: 1000,
                response_format: { type: "json_object" }
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('OpenAI API error:', errorText);
            throw new Error(`OpenAI API failed: ${errorText}`);
        }

        const completion = await response.json();
        const generatedContent = JSON.parse(completion.choices[0].message.content);

        console.log('AI generated site structure:', generatedContent);

        return new Response(
            JSON.stringify({
                success: true,
                data: generatedContent,
            }),
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
            }
        );
    } catch (error) {
        console.error('AI Generate Site error:', error);
        return new Response(
            JSON.stringify({
                success: false,
                error: (error as any)?.message || String(error),
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
