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

    // Use OpenAI to generate structured content
    const systemPrompt = `You are an expert web copywriter and designer. Generate structured content for website sections based on user descriptions.
    
IMPORTANT RULES:
1. Return ONLY a valid JSON object. Do not include markdown formatting or explanations.
2. The JSON must match the specific structure required for the section type.
3. Use professional, engaging, and conversion-focused copy.
4. For images, use high-quality Unsplash placeholder URLs (e.g., https://images.unsplash.com/photo-...) that match the context.

REQUIRED JSON STRUCTURES:

For 'hero' section:
{
  "heading": "Catchy Headline",
  "subheading": "Compelling subheadline that expands on the value proposition.",
  "cta_text": "Call to Action",
  "cta_link": "#",
  "background_image": "https://images.unsplash.com/..."
}

For 'about' section:
{
  "heading": "About Us",
  "subheading": "Our Story",
  "content": "Detailed paragraph about the company...",
  "image_url": "https://images.unsplash.com/..."
}

For 'features' section:
{
  "heading": "Our Features",
  "subheading": "What makes us special",
  "features": [
    { "title": "Feature 1", "description": "Description...", "icon": "Star" },
    { "title": "Feature 2", "description": "Description...", "icon": "Zap" },
    { "title": "Feature 3", "description": "Description...", "icon": "Shield" }
  ]
}

For 'schedule' section:
{
  "heading": "Schedule",
  "subheading": "Upcoming Events",
  "events": [
    { "time": "09:00 AM", "title": "Event Title", "description": "Event details..." },
    { "time": "12:00 PM", "title": "Lunch Break", "description": "Networking..." }
  ]
}

For 'contact' section:
{
  "heading": "Contact Us",
  "subheading": "Get in Touch",
  "email": "contact@example.com",
  "phone": "+1 (555) 123-4567",
  "address": "123 Main St, City, Country",
  "button_text": "Send Message"
}

For 'gallery' section:
{
  "heading": "Gallery",
  "subheading": "Our Work",
  "images": [
    { "url": "https://images.unsplash.com/...", "caption": "Image 1" },
    { "url": "https://images.unsplash.com/...", "caption": "Image 2" },
    { "url": "https://images.unsplash.com/...", "caption": "Image 3" },
    { "url": "https://images.unsplash.com/...", "caption": "Image 4" }
  ]
}

For 'roster' or 'team' section:
{
  "heading": "Our Team",
  "subheading": "Meet the Experts",
  "members": [
    { "name": "John Doe", "role": "CEO", "bio": "Short bio...", "image_url": "https://images.unsplash.com/..." },
    { "name": "Jane Smith", "role": "CTO", "bio": "Short bio...", "image_url": "https://images.unsplash.com/..." }
  ]
}

For 'commitments' or 'values' section:
{
  "heading": "Our Commitments",
  "subheading": "What We Stand For",
  "commitments": [
    { "title": "Quality", "description": "We never compromise on quality." },
    { "title": "Integrity", "description": "We do the right thing." },
    { "title": "Innovation", "description": "We lead the way." }
  ]
}

For 'testimonials' section:
{
  "heading": "Testimonials",
  "subheading": "What People Say",
  "testimonials": [
    { "name": "Alice", "role": "Customer", "quote": "Amazing service!", "image_url": "https://images.unsplash.com/..." },
    { "name": "Bob", "role": "Client", "quote": "Highly recommended.", "image_url": "https://images.unsplash.com/..." }
  ]
}

For 'faq' section:
{
  "heading": "FAQ",
  "subheading": "Common Questions",
  "faqs": [
    { "question": "Question 1?", "answer": "Answer 1..." },
    { "question": "Question 2?", "answer": "Answer 2..." }
  ]
}

For 'cta' section:
{
  "heading": "Ready to Get Started?",
  "subheading": "Join us today.",
  "button_text": "Sign Up Now",
  "button_link": "#"
}

For 'stats' section:
{
  "stats": [
    { "value": "100+", "label": "Clients" },
    { "value": "500+", "label": "Projects" },
    { "value": "24/7", "label": "Support" }
  ]
}

For 'pricing' section:
{
  "heading": "Pricing Plans",
  "subheading": "Choose your plan",
  "plans": [
    { "name": "Basic", "price": "$19", "features": ["Feature A", "Feature B"], "button_text": "Choose Basic" },
    { "name": "Pro", "price": "$49", "features": ["Feature A", "Feature B", "Feature C"], "button_text": "Choose Pro" }
  ]
}

For 'video' section:
{
  "heading": "Watch Our Video",
  "subheading": "See it in action",
  "video_url": "https://www.youtube.com/embed/dQw4w9WgXcQ",
  "cover_image": "https://images.unsplash.com/..."
}

For 'footer' section:
{
  "company_name": "Company Name",
  "description": "Short company description.",
  "links": [
    { "text": "Home", "url": "#" },
    { "text": "About", "url": "#" },
    { "text": "Contact", "url": "#" }
  ],
  "copyright": "© 2024 Company Name. All rights reserved."
}

For 'custom' or unknown types, provide a generic structure with heading, subheading, and content.
`;

    const messages = [
      {
        role: 'system',
        content: systemPrompt,
      },
      {
        role: 'user',
        content: `Generate content for a "${sectionType}" section.
        
Description: "${description}"
Style: "${style}"

Return ONLY the JSON object.`,
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
        model: 'gpt-4o-mini',
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

    console.log('AI generated content:', generatedContent);

    return new Response(
      JSON.stringify({
        success: true,
        data: generatedContent,
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
