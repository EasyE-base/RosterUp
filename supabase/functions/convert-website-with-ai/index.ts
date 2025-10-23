/**
 * Supabase Edge Function: Convert Website with Claude AI
 * Uses Anthropic's Claude to intelligently convert HTML to RosterUp blocks
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY') || '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

interface PageInput {
  url: string;
  title: string;
  slug: string;
  html: string;
  screenshot?: string;
}

interface ConversionRequest {
  html?: string; // For backward compatibility (single page)
  css?: string; // For backward compatibility
  url: string;
  organizationId: string;
  subdomain: string;
  screenshot?: string; // For backward compatibility
  pages?: PageInput[]; // For multi-page imports
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
    console.log('Edge Function invoked');
    const { html, css, url, organizationId, subdomain, screenshot, pages }: ConversionRequest = await req.json();

    const isMultiPage = !!pages && pages.length > 0;

    console.log('Request data:', {
      url,
      organizationId,
      subdomain,
      mode: isMultiPage ? 'multi-page' : 'single-page',
      pagesCount: isMultiPage ? pages.length : 1,
      htmlLength: html?.length,
      cssLength: css?.length,
      hasScreenshot: !!screenshot
    });

    // Setup Supabase
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Ensure storage bucket exists
    try {
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketExists = buckets?.some((b: any) => b.name === 'website-imports');

      if (!bucketExists) {
        console.log('Creating website-imports bucket');
        await supabase.storage.createBucket('website-imports', {
          public: true,
          fileSizeLimit: 10485760,
          allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
        });
      }
    } catch (bucketError) {
      console.error('Error checking/creating bucket:', bucketError);
    }

    // Check if organization already has a website
    const { data: existingWebsite } = await supabase
      .from('organization_websites')
      .select('id')
      .eq('organization_id', organizationId)
      .maybeSingle();

    if (existingWebsite) {
      const { error: deleteError } = await supabase
        .from('organization_websites')
        .delete()
        .eq('id', existingWebsite.id);

      if (deleteError) throw deleteError;
    }

    // Create the new website record
    const { data: website, error: websiteError } = await supabase
      .from('organization_websites')
      .insert({
        organization_id: organizationId,
        subdomain: subdomain,
        is_published: false,
      })
      .select()
      .single();

    if (websiteError) throw websiteError;

    // Multi-page or single-page import
    if (isMultiPage) {
      console.log(`Processing ${pages.length} pages...`);
      let designSystem: any = null;
      const processedPages: any[] = [];

      for (let i = 0; i < pages.length; i++) {
        const pageInput = pages[i];
        console.log(`Processing page ${i + 1}/${pages.length}: ${pageInput.title}`);

        // Extract CSS from HTML (simple approach)
        const cssMatch = pageInput.html.match(/<style[^>]*>([\s\S]*?)<\/style>/gi);
        const pageCss = cssMatch ? cssMatch.join('\n') : '';

        // Convert page with Claude
        const conversionResult = await convertWithClaude(
          pageInput.html,
          pageCss,
          pageInput.url,
          pageInput.screenshot
        );

        // Use design system from first page (homepage)
        if (i === 0 && conversionResult.designSystem) {
          designSystem = conversionResult.designSystem;
        }

        // Process images
        await processPageImages(
          conversionResult.blocks,
          conversionResult.sections,
          supabase,
          website.id
        );

        // Create page record
        const { data: pageRecord, error: pageError } = await supabase
          .from('website_pages')
          .insert({
            website_id: website.id,
            title: pageInput.title,
            slug: pageInput.slug,
            is_home: pageInput.slug === '',
            is_published: false,
            order_index: i,
          })
          .select()
          .single();

        if (pageError) throw pageError;

        // Insert sections
        const sectionsWithPageId = conversionResult.sections.map((section: any) => ({
          ...section,
          page_id: pageRecord.id,
        }));

        const { data: sections, error: sectionsError } = await supabase
          .from('website_sections')
          .insert(sectionsWithPageId)
          .select();

        if (sectionsError) throw sectionsError;

        // Insert blocks
        const sectionMap = new Map(sections.map((s: any) => [s.order_index, s.id]));
        const blocksWithIds = conversionResult.blocks.map((block: any) => {
          const { section_order_index, ...blockWithoutSectionIndex } = block;
          return {
            ...blockWithoutSectionIndex,
            page_id: pageRecord.id,
            section_id: sectionMap.get(section_order_index) || sections[0].id,
          };
        });

        const { error: blocksError } = await supabase
          .from('website_content_blocks')
          .insert(blocksWithIds);

        if (blocksError) throw blocksError;

        processedPages.push({
          id: pageRecord.id,
          title: pageInput.title,
          slug: pageInput.slug,
          sectionsCount: sections.length,
          blocksCount: blocksWithIds.length,
        });

        console.log(`✓ Page "${pageInput.title}" processed`);
      }

      // Insert design system
      if (designSystem) {
        const { error: designSystemError } = await supabase
          .from('website_design_systems')
          .insert({
            website_id: website.id,
            colors: designSystem.colors || {},
            typography: designSystem.typography || {},
            spacing: designSystem.spacing || {},
            buttons: designSystem.buttons || {},
            effects: designSystem.effects || {},
          });

        if (designSystemError) throw designSystemError;
      }

      return new Response(
        JSON.stringify({
          success: true,
          websiteId: website.id,
          pagesCount: processedPages.length,
          pages: processedPages,
        }),
        {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );

    } else {
      // Single-page import (backward compatible)
      console.log('Converting single page with AI...');
      const conversionResult = await convertWithClaude(html!, css!, url, screenshot);

      // Process images
      await processPageImages(
        conversionResult.blocks,
        conversionResult.sections,
        supabase,
        website.id
      );

      // Create page record
      const { data: page, error: pageError } = await supabase
        .from('website_pages')
        .insert({
          website_id: website.id,
          title: 'Home',
          slug: '',
          is_home: true,
          is_published: false,
          order_index: 0,
        })
        .select()
        .single();

      if (pageError) throw pageError;

      // Insert sections
      const sectionsWithPageId = conversionResult.sections.map((section: any) => ({
        ...section,
        page_id: page.id,
      }));

      const { data: sections, error: sectionsError } = await supabase
        .from('website_sections')
        .insert(sectionsWithPageId)
        .select();

      if (sectionsError) throw sectionsError;

      // Insert blocks
      const sectionMap = new Map(sections.map((s: any) => [s.order_index, s.id]));
      const blocksWithIds = conversionResult.blocks.map((block: any) => {
        const { section_order_index, ...blockWithoutSectionIndex } = block;
        return {
          ...blockWithoutSectionIndex,
          page_id: page.id,
          section_id: sectionMap.get(section_order_index) || sections[0].id,
        };
      });

      const { error: blocksError } = await supabase
        .from('website_content_blocks')
        .insert(blocksWithIds);

      if (blocksError) throw blocksError;

      // Insert design system
      const { error: designSystemError } = await supabase
        .from('website_design_systems')
        .insert({
          website_id: website.id,
          colors: conversionResult.designSystem.colors || {},
          typography: conversionResult.designSystem.typography || {},
          spacing: conversionResult.designSystem.spacing || {},
          buttons: conversionResult.designSystem.buttons || {},
          effects: conversionResult.designSystem.effects || {},
        });

      if (designSystemError) throw designSystemError;

      return new Response(
        JSON.stringify({
          success: true,
          websiteId: website.id,
          pageId: page.id,
          sectionsCount: sections.length,
          blocksCount: blocksWithIds.length,
        }),
        {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }
  } catch (error) {
    console.error('Conversion error:', error);
    console.error('Error stack:', error?.stack);
    return new Response(
      JSON.stringify({
        error: error?.message || String(error) || 'Failed to convert website',
        details: error?.stack || 'No stack trace available'
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

/**
 * Process images for a page's blocks and sections
 * Downloads and re-hosts images to Supabase Storage
 */
async function processPageImages(
  blocks: any[],
  sections: any[],
  supabase: any,
  websiteId: string
): Promise<void> {
  const imageProcessingPromises: Promise<void>[] = [];

  // Process blocks
  for (const block of blocks) {
    // Handle image blocks
    if (block.block_type === 'image' && block.content?.url) {
      imageProcessingPromises.push(
        downloadAndUploadImage(block.content.url, supabase, websiteId).then((newUrl) => {
          block.content.url = newUrl;
        })
      );
    }

    // Handle hero block background images
    if (block.block_type === 'hero' && block.content?.backgroundImage) {
      imageProcessingPromises.push(
        downloadAndUploadImage(block.content.backgroundImage, supabase, websiteId).then((newUrl) => {
          block.content.backgroundImage = newUrl;
        })
      );
    }

    // Handle gallery blocks
    if (block.block_type === 'gallery' && block.content?.images) {
      for (let i = 0; i < block.content.images.length; i++) {
        const imgUrl = typeof block.content.images[i] === 'string'
          ? block.content.images[i]
          : block.content.images[i].url;

        if (imgUrl) {
          const idx = i;
          imageProcessingPromises.push(
            downloadAndUploadImage(imgUrl, supabase, websiteId).then((newUrl) => {
              if (typeof block.content.images[idx] === 'string') {
                block.content.images[idx] = newUrl;
              } else {
                block.content.images[idx].url = newUrl;
              }
            })
          );
        }
      }
    }

    // Handle background images in styles
    if (block.styles?.backgroundImage) {
      const urlMatch = block.styles.backgroundImage.match(/url\(['"]?([^'"]+)['"]?\)/);
      if (urlMatch) {
        imageProcessingPromises.push(
          downloadAndUploadImage(urlMatch[1], supabase, websiteId).then((newUrl) => {
            block.styles.backgroundImage = `url('${newUrl}')`;
          })
        );
      }
    }
  }

  // Process sections
  for (const section of sections) {
    if (section.background_image) {
      imageProcessingPromises.push(
        downloadAndUploadImage(section.background_image, supabase, websiteId).then((newUrl) => {
          section.background_image = newUrl;
        })
      );
    }
  }

  console.log(`Processing ${imageProcessingPromises.length} images`);
  await Promise.allSettled(imageProcessingPromises);
  console.log('Image processing complete');
}

/**
 * Download image from URL and upload to Supabase Storage
 */
async function downloadAndUploadImage(
  imageUrl: string,
  supabase: any,
  websiteId: string
): Promise<string> {
  try {
    console.log('Downloading image:', imageUrl);

    // Download the image
    const response = await fetch(imageUrl);
    if (!response.ok) {
      console.error('Failed to download image:', response.status, imageUrl);
      return imageUrl; // Return original URL if download fails
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Generate a unique filename
    const urlObj = new URL(imageUrl);
    const pathname = urlObj.pathname;
    const extension = pathname.split('.').pop() || 'jpg';
    const filename = `${websiteId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${extension}`;

    console.log('Uploading to storage:', filename);

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('website-imports')
      .upload(filename, uint8Array, {
        contentType,
        upsert: false,
      });

    if (error) {
      console.error('Upload error:', error);
      return imageUrl; // Return original URL if upload fails
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('website-imports')
      .getPublicUrl(filename);

    console.log('Image uploaded successfully:', publicUrlData.publicUrl);
    return publicUrlData.publicUrl;
  } catch (error) {
    console.error('Error downloading/uploading image:', error);
    return imageUrl; // Return original URL on error
  }
}

/**
 * Convert relative URLs to absolute URLs
 */
function makeAbsoluteUrl(relativeUrl: string, baseUrl: string): string {
  try {
    // If already absolute, return as-is
    if (relativeUrl.startsWith('http://') || relativeUrl.startsWith('https://')) {
      return relativeUrl;
    }

    // Handle protocol-relative URLs (//example.com/image.jpg)
    if (relativeUrl.startsWith('//')) {
      const baseProtocol = new URL(baseUrl).protocol;
      return `${baseProtocol}${relativeUrl}`;
    }

    // Handle absolute paths (/images/photo.jpg)
    if (relativeUrl.startsWith('/')) {
      const baseUrlObj = new URL(baseUrl);
      return `${baseUrlObj.protocol}//${baseUrlObj.host}${relativeUrl}`;
    }

    // Handle relative paths (../images/photo.jpg or images/photo.jpg)
    return new URL(relativeUrl, baseUrl).href;
  } catch (error) {
    console.error('Error making absolute URL:', error, { relativeUrl, baseUrl });
    return relativeUrl;
  }
}

/**
 * Use Claude AI to convert HTML/CSS to RosterUp format
 * Optionally uses vision API if screenshot is provided
 */
async function convertWithClaude(html: string, css: string, url: string, screenshot?: string) {
  console.log('Starting Claude conversion');
  console.log('API Key present:', !!ANTHROPIC_API_KEY);
  console.log('Using vision API:', !!screenshot);

  const textPrompt = `You are an expert web developer and designer. Your task is to analyze the provided ${screenshot ? 'SCREENSHOT, HTML, and CSS' : 'HTML and CSS'} from a website and convert it into a structured format for a website builder called RosterUp.

${screenshot ? '**🔍 VISUAL ANALYSIS MODE: You have been provided with a SCREENSHOT of the website. Use this visual reference as your PRIMARY source of truth for colors, spacing, fonts, and layout. The HTML/CSS below is supplementary data.**' : ''}

**CRITICAL: Your goal is to recreate this website PIXEL-PERFECT to the original. This is EXTREMELY IMPORTANT - treat this as a 1:1 clone:**

**🎯 ULTRA-SPECIFIC EXTRACTION REQUIREMENTS:**
When you see a heading with "font-size: 48px; font-weight: 700; color: #1a1a1a; margin-bottom: 24px", you MUST include:
{
  "styles": {
    "fontSize": "48px",  // EXACT value from CSS
    "fontWeight": "700",  // EXACT value
    "color": "#1a1a1a",   // EXACT hex color
    "marginBottom": "24px" // EXACT spacing
  }
}

DO NOT approximate! DO NOT use "large" or "bold" - use EXACT pixel values and hex codes!
DO NOT skip any spacing values - every margin, padding, line-height, letter-spacing MUST be included!
DO NOT simplify colors - #0066cc is NOT the same as #0066ff!

**MANDATORY: Include these styles for EVERY block:**
- fontSize (e.g. "16px", "24px", "48px") - NEVER omit
- fontWeight (e.g. "400", "600", "700") - NEVER omit
- color (e.g. "#333333", "#ffffff") - NEVER omit
- lineHeight (e.g. "1.5", "1.2") - extract from CSS
- marginBottom, marginTop - extract actual pixel values
- paddingTop, paddingBottom, paddingLeft, paddingRight - if present in CSS
- textAlign (e.g. "left", "center", "right") - extract from CSS or infer from layout
- backgroundColor - if the element has a background
- border, borderRadius, boxShadow - if present

**VISUAL FIDELITY (HIGHEST PRIORITY):**
${screenshot ? '- **USE THE SCREENSHOT**: Look at the actual visual appearance. Measure spacing by eye. Match colors you SEE, not just what CSS says.' : ''}
- Copy EVERY SINGLE visual element you see
- Extract EXACT hex colors ${screenshot ? 'from the SCREENSHOT' : 'from CSS'} (don't approximate or guess)
- Preserve EXACT font sizes, weights, and line heights ${screenshot ? 'as they APPEAR visually' : 'from computed styles'}
- Maintain EXACT spacing (margins, padding) between all elements ${screenshot ? '- look at the SCREENSHOT to see actual spacing' : ''}
- Copy ALL background colors, gradients, and images
- Preserve ALL text formatting (bold, italic, underline, uppercase)
- Keep EXACT image dimensions and aspect ratios
- Copy ALL border styles, border-radius, and shadows${screenshot ? '\n- **SCREENSHOT COLOR ACCURACY**: Use color picker on the screenshot to get exact hex values for primary brand color, header background, button colors, etc.' : ''}

**CONTENT FIDELITY (MUST BE EXACT):**
- Copy ALL text content WORD-FOR-WORD (zero changes, zero summarization)
- Include ALL headings, paragraphs, and text blocks exactly as written
- Preserve ALL capitalization and text formatting
- Extract ALL image URLs and descriptions
- Copy ALL button text and link URLs exactly
- Include ALL navigation menu items in exact order
- Preserve ALL lists (ordered and unordered) with exact wording

**LAYOUT FIDELITY (MUST BE PRECISE):**
- Analyze the visual structure: identify headers, hero sections, content areas, footers
- For multi-column layouts, use the "columns" block type
- Preserve the exact width and alignment of all sections
- Maintain the exact stacking order of all elements
- Copy section backgrounds (colors, images, gradients)
- Preserve full-width vs contained layouts
- Extract exact max-width values for content containers

**COLOR & BRANDING (MUST BE EXACT):**
- Find the primary brand color (usually in headers, buttons, links)
- Find the secondary/accent colors
- Extract background colors (white, gray, colored sections)
- Get text colors (heading color, body text color, muted text)
- Copy button colors and hover states
- Extract all colors used in gradients
- Include social media brand colors if present

**RosterUp's Block Types (ONLY use these - no other types are supported):**

TEXT BLOCKS:
- heading: h1-h6 headings with text content
- paragraph: regular text paragraphs
- text: rich text content
- quote: blockquotes with text and optional author

MEDIA BLOCKS:
- image: single images with url, alt text
- gallery: multiple images in a grid layout
- video: embedded YouTube/Vimeo videos
- music: audio players

INTERACTIVE BLOCKS:
- button: call-to-action buttons with text and url
- cta: full call-to-action section with title and button
- hero: large hero banner with title, subtitle, and optional backgroundImage URL in content

LAYOUT BLOCKS:
- container: wrapper for other content
- columns: multi-column layouts
- divider: horizontal separator lines
- spacer: vertical spacing

LIST BLOCKS:
- list: bullet point lists
- numbered-list: numbered lists
- checklist: checkbox lists

FORM BLOCKS:
- contact-form: full contact forms
- subscribe: email newsletter signup
- input: single text input fields
- textarea: multi-line text input

SOCIAL BLOCKS:
- social-share: social sharing buttons (Facebook, Twitter, LinkedIn)
- social-feed: embedded social media feeds
- social-follow: social media follow buttons

NAVIGATION BLOCKS:
- navbar: top navigation bars
- menu: dropdown menus
- breadcrumbs: navigation breadcrumbs

SPORTS BLOCKS (RosterUp-specific):
- team-roster: team member listings
- schedule: game schedules
- tournament-bracket: tournament brackets
- player-stats: player statistics
- scoreboard: live scoreboards

DEVELOPER BLOCKS:
- code: code snippets with syntax highlighting
- embed: embed third-party content
- custom-html: custom HTML blocks

**Section Types:**
- header: top navigation and branding
- content: main page content
- footer: bottom page information

**Your Task:**
1. Analyze the HTML structure and identify semantic sections (header, hero, content sections, footer)
2. Convert each HTML element to the most appropriate RosterUp block type
3. Preserve the visual hierarchy and layout
4. Extract the design system (colors, fonts, spacing)
5. Return a JSON object with this structure:

\`\`\`json
{
  "title": "Page title",
  "description": "Meta description",
  "favicon": "Favicon URL or null",
  "sections": [
    {
      "name": "Section name",
      "section_type": "header|content|footer",
      "background_color": "#hex or null",
      "order_index": 0,
      "full_width": true|false,
      "styles": {}
    }
  ],
  "blocks": [
    {
      "block_type": "heading|paragraph|image|etc",
      "content": {
        // Block-specific content
      },
      "styles": {
        "textAlign": "left|center|right",
        "color": "#hex",
        "fontSize": "16px",
        "fontWeight": "400",
        "marginBottom": "16px"
      },
      "visibility": {
        "desktop": true,
        "tablet": true,
        "mobile": true
      },
      "order_index": 0,
      "section_order_index": 0
    }
  ],
  "designSystem": {
    "colors": {
      "primary": "#hex",
      "secondary": "#hex",
      "accent": "#hex",
      "text": {
        "heading": "#hex",
        "body": "#hex",
        "muted": "#hex"
      },
      "background": {
        "light": "#hex",
        "dark": "#hex",
        "gray": "#hex"
      },
      "customPalette": [
        {"name": "Brand Blue", "color": "#hex"}
      ]
    },
    "typography": {
      "headingFont": "Font name, sans-serif",
      "bodyFont": "Font name, sans-serif",
      "baseFontSize": "16px",
      "scaleRatio": 1.25,
      "lineHeight": {
        "tight": "1.25",
        "normal": "1.5",
        "relaxed": "1.75"
      },
      "letterSpacing": {
        "tight": "-0.025em",
        "normal": "0",
        "wide": "0.025em"
      },
      "fontWeights": {
        "light": "300",
        "normal": "400",
        "medium": "500",
        "semibold": "600",
        "bold": "700"
      }
    },
    "spacing": {
      "xs": "4px",
      "sm": "8px",
      "md": "16px",
      "lg": "24px",
      "xl": "32px",
      "xxl": "48px"
    }
  }
}
\`\`\`

**Important Guidelines:**
- Preserve the original content EXACTLY as it appears in the HTML (text, images, links, etc.)
- Extract actual image URLs from img src attributes
- Extract actual link URLs from anchor href attributes
- Map semantic HTML elements to the most appropriate block types from the list above
- ONLY use block types from the supported list - do not invent new types
- Extract the actual colors used in the design (backgrounds, text, borders)
- Identify the actual fonts being used (from CSS font-family declarations)
- Group related content into logical sections (header, hero, features, testimonials, footer, etc.)
- Maintain the exact order of elements as they appear on the page
- For each block, include "section_order_index" to indicate which section it belongs to (starting from 0)
- Extract meaningful content - don't use placeholder text unless the original has placeholders
- For images, include the full URL (not relative paths)
- For buttons, extract both the button text AND the URL it links to
- For headings and paragraphs, extract the actual text content from the HTML

**HERO BLOCK SPECIAL INSTRUCTIONS:**
When you see a large hero/banner section at the top of the page:
- Use block_type: "hero"
- Put the main heading text in content.title (EXACT TEXT, preserve capitalization)
- Put the subtitle/description in content.subtitle (EXACT TEXT)
- ALWAYS include content.backgroundImage with the hero background image URL
- Extract the EXACT text color from the CSS (usually white text on hero images)
- Extract the EXACT font size, weight, and text alignment
- Include letter-spacing and text-shadow if present
- Example hero block with ALL required details:
  {
    "block_type": "hero",
    "content": {
      "title": "NATIONALLY RANKED PROGRAM",
      "subtitle": "#5 RANKED PROGRAM IN THE NORTHEAST REGION AND #53 NATIONALLY",
      "backgroundImage": "https://newjerseygators.com/images/hero-bg.jpg"
    },
    "styles": {
      "textAlign": "center",
      "color": "#ffffff",
      "fontSize": "60px",
      "fontWeight": "900",
      "lineHeight": "1.2",
      "letterSpacing": "0.02em",
      "textShadow": "2px 2px 4px rgba(0,0,0,0.5)",
      "paddingTop": "120px",
      "paddingBottom": "120px",
      "marginBottom": "0px"
    },
    "order_index": 0,
    "section_order_index": 1
  }

**NAVBAR SPECIAL INSTRUCTIONS:**
- Always extract the COMPLETE navigation menu
- Create a navbar block in the header section
- Include ALL menu items with their EXACT text and URLs
- Preserve the exact navigation order (e.g., HOME, ABOUT, TEAMS, COMMITMENTS, TRYOUTS, etc.)
- Extract the navbar background color
- Extract menu link colors (default and hover states)
- Include logo if present
- Include social media icons if in header

**SECTIONS - CRITICAL STRUCTURE:**
Create distinct sections for different areas of the page:
1. HEADER section (section_type: "header"):
   - Navigation bar
   - Logo
   - Social icons
   - Background color from header

2. HERO section (section_type: "content", name: "Hero"):
   - Hero block with title, subtitle, background image
   - Extract section padding values
   - Full-width: true if hero spans full width

3. CONTENT sections (section_type: "content"):
   - One section per distinct visual area
   - Name them descriptively: "Features", "About Us", "Stats", etc.
   - Include section background_color if different from white
   - Set full_width: true for sections that span full width

4. FOOTER section (section_type: "footer"):
   - Footer content, links, copyright
   - Extract footer background color

**STYLING - EXTRACT EVERY DETAIL:**
For EVERY block, include comprehensive styles:
{
  "styles": {
    // Text Styling
    "fontFamily": "Extract from font-family CSS",
    "fontSize": "Exact pixel or rem value",
    "fontWeight": "300|400|500|600|700|800|900",
    "lineHeight": "1.2|1.5|1.75 etc",
    "letterSpacing": "-0.025em|0|0.025em etc",
    "textAlign": "left|center|right",
    "textTransform": "uppercase|lowercase|capitalize",
    "color": "#hex color",

    // Spacing
    "marginTop": "0px|16px|32px etc",
    "marginRight": "0px|auto etc",
    "marginBottom": "0px|16px|32px etc",
    "marginLeft": "0px|auto etc",
    "paddingTop": "0px|16px|32px etc",
    "paddingRight": "0px|16px|32px etc",
    "paddingBottom": "0px|16px|32px etc",
    "paddingLeft": "0px|16px|32px etc",

    // Background
    "backgroundColor": "#hex or transparent",
    "backgroundImage": "url('...')",
    "backgroundSize": "cover|contain",
    "backgroundPosition": "center|top|bottom",

    // Borders & Effects
    "border": "1px solid #hex",
    "borderRadius": "0px|4px|8px|50%",
    "boxShadow": "0 2px 4px rgba(0,0,0,0.1)",

    // Layout
    "width": "100%|auto|500px",
    "maxWidth": "1200px|100%",
    "display": "block|flex|inline-block"
  }
}

**COLOR EXTRACTION - BE EXTREMELY PRECISE:**
Analyze the HTML/CSS and extract:
1. PRIMARY BRAND COLOR: The main color used throughout (buttons, links, accents)
   - Search for: background-color, color properties on buttons/links
   - Example: #0047AB (deep blue for sports sites)

2. SECONDARY/ACCENT COLORS: Supporting colors
   - Often found in: hover states, secondary buttons, icons

3. TEXT COLORS:
   - heading color (often darker, like #1a1a1a or #000000)
   - body text color (often #333333 or #4a4a4a)
   - muted text (often #666666 or #999999)

4. BACKGROUND COLORS:
   - Main background (usually #ffffff)
   - Section backgrounds (#f5f5f5, #f9f9f9, or colored)
   - Header/Footer backgrounds (often darker or brand colored)

5. BUILD THE DESIGN SYSTEM WITH EXACT VALUES:

**Website URL:** ${url}

**HTML:**
${html.substring(0, 100000)}

**CSS:**
${css.substring(0, 50000)}

**FINAL REMINDER - ACCURACY CHECKLIST:**
Before returning the JSON, verify:
✓ ALL text is copied exactly (no changes, no summarization)
✓ ALL images have full URLs
✓ ALL colors are extracted from CSS (not guessed)
✓ ALL font sizes and weights match the original
✓ ALL navigation menu items are included
✓ Hero section has background image URL in content.backgroundImage
✓ Sections are properly structured (header, hero, content, footer)
✓ Design system colors match the actual website
✓ ALL spacing values are extracted from CSS
✓ Block order matches visual order on page

Analyze this website and return ONLY the JSON object (no markdown formatting, no explanation).`;

  console.log('Calling Claude API');

  // Build message content based on whether screenshot is provided
  const messageContent = screenshot ? [
    {
      type: 'image',
      source: {
        type: 'base64',
        media_type: 'image/png',
        data: screenshot,
      },
    },
    {
      type: 'text',
      text: textPrompt,
    },
  ] : textPrompt;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 32000,
      temperature: 0,
      messages: [
        {
          role: 'user',
          content: messageContent,
        },
      ],
    }),
  });

  console.log('Claude API response status:', response.status);

  if (!response.ok) {
    const error = await response.text();
    console.error('Claude API error:', error);
    throw new Error(`Claude API error: ${error}`);
  }

  const result = await response.json();
  console.log('Claude API response received');
  const content = result.content[0].text;

  // Parse the JSON response
  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in Claude response');
    }
    const parsed = JSON.parse(jsonMatch[0]);

    // Convert all relative URLs to absolute URLs
    console.log('Converting relative URLs to absolute');
    if (parsed.blocks) {
      for (const block of parsed.blocks) {
        // Handle image blocks
        if (block.block_type === 'image' && block.content?.url) {
          block.content.url = makeAbsoluteUrl(block.content.url, url);
        }

        // Handle gallery blocks
        if (block.block_type === 'gallery' && block.content?.images) {
          block.content.images = block.content.images.map((img: any) => ({
            ...img,
            url: makeAbsoluteUrl(img.url || img, url),
          }));
        }

        // Handle button/link URLs
        if ((block.block_type === 'button' || block.block_type === 'cta') && block.content?.url) {
          block.content.url = makeAbsoluteUrl(block.content.url, url);
        }

        // Handle background images in styles
        if (block.styles?.backgroundImage) {
          const urlMatch = block.styles.backgroundImage.match(/url\(['"]?([^'"]+)['"]?\)/);
          if (urlMatch) {
            const absoluteUrl = makeAbsoluteUrl(urlMatch[1], url);
            block.styles.backgroundImage = `url('${absoluteUrl}')`;
          }
        }
      }
    }

    // Convert section background images
    if (parsed.sections) {
      for (const section of parsed.sections) {
        if (section.background_image) {
          section.background_image = makeAbsoluteUrl(section.background_image, url);
        }
      }
    }

    // Convert favicon
    if (parsed.favicon) {
      parsed.favicon = makeAbsoluteUrl(parsed.favicon, url);
    }

    console.log('URL conversion complete');
    return parsed;
  } catch (parseError) {
    console.error('Failed to parse Claude response:', content);
    throw new Error('Failed to parse AI response');
  }
}
