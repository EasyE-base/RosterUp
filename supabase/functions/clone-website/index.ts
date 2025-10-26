/**
 * Supabase Edge Function: Clone Website (Pure HTML)
 * Downloads and stores complete HTML/CSS/JS for pixel-perfect cloning
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

interface CloneRequest {
  urls: string[]; // Array of page URLs to clone
  organizationId: string;
  subdomain: string;
}

interface ClonedAsset {
  originalUrl: string;
  storageUrl: string;
  type: 'image' | 'font' | 'css' | 'js' | 'other';
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('Clone Website Edge Function invoked');
    const body = await req.json();
    console.log('Request body:', body);

    const { urls, organizationId, subdomain }: CloneRequest = body;

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      throw new Error('urls array is required and must not be empty');
    }

    if (!organizationId) {
      throw new Error('organizationId is required');
    }

    if (!subdomain) {
      throw new Error('subdomain is required');
    }

    console.log('Clone request validated:', { urlCount: urls.length, organizationId, subdomain });

    // Setup Supabase
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

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

    // Create the new website record in clone mode
    // Note: website_mode field may not exist yet if migration hasn't run
    const websiteInsert: any = {
      organization_id: organizationId,
      subdomain: subdomain,
      is_published: false,
    };

    // Try to set website_mode if the column exists
    try {
      websiteInsert.website_mode = 'clone';
    } catch (e) {
      console.log('website_mode column not found, skipping');
    }

    const { data: website, error: websiteError } = await supabase
      .from('organization_websites')
      .insert(websiteInsert)
      .select()
      .single();

    if (websiteError) {
      console.error('Website insert error:', websiteError);
      throw websiteError;
    }

    console.log('Website record created:', website.id);

    // Clone each page
    const clonedPages: any[] = [];
    const allAssets: ClonedAsset[] = [];

    for (let i = 0; i < urls.length; i++) {
      const pageUrl = urls[i];
      console.log(`Cloning page ${i + 1}/${urls.length}: ${pageUrl}`);

      try {
        // Fetch the page HTML
        const corsProxy = 'https://api.allorigins.win/raw?url=';
        const response = await fetch(`${corsProxy}${encodeURIComponent(pageUrl)}`);
        let html = await response.text();

        // Extract inline CSS and external stylesheets
        const { css, updatedHtml: htmlWithoutStyles } = await extractCSS(html, pageUrl);

        // Extract inline JS and external scripts
        const { js, updatedHtml: finalHtml } = await extractJS(htmlWithoutStyles, pageUrl);

        // Extract and clone all assets (images, fonts, etc.)
        const { assets, htmlWithReplacedAssets } = await cloneAssets(
          finalHtml,
          pageUrl,
          supabase,
          website.id
        );

        allAssets.push(...assets);

        // Determine page slug and title
        const urlObj = new URL(pageUrl);
        const pathname = urlObj.pathname;
        const slug = pathname === '/' ? '' : pathname.replace(/^\/|\/$/g, '');

        const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
        const title = titleMatch
          ? titleMatch[1].trim()
          : slug
            ? slug.split('/').pop()?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Page'
            : 'Home';

        // Create page record
        const { data: pageRecord, error: pageError } = await supabase
          .from('website_pages')
          .insert({
            website_id: website.id,
            title: title,
            slug: slug,
            is_home: slug === '',
            is_published: false,
            order_index: i,
          })
          .select()
          .single();

        if (pageError) throw pageError;

        // Store HTML/CSS/JS for this page
        const pageData = {
          html: htmlWithReplacedAssets,
          css: css,
          js: js,
        };

        // Create a single "clone" section with HTML/CSS/JS content (legacy format)
        const { error: sectionError } = await supabase
          .from('website_sections')
          .insert({
            page_id: pageRecord.id,
            name: 'Cloned Content',
            section_type: 'content',
            full_width: true,
            order_index: 0,
            styles: {
              cloneMode: true,
              html: pageData.html,
              css: pageData.css,
              js: pageData.js,
            },
          });

        if (sectionError) throw sectionError;

        // V2.0: Also populate clone_html column for Canvas Mode hybrid loading
        // Reconstruct full HTML document with embedded CSS/JS
        const fullHTML = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
      ${pageData.css}
    </style>
  </head>
  <body>
    ${pageData.html}
    <script>
      ${pageData.js}
    </script>
  </body>
</html>`;

        // Update page record with clone_html (ignore errors if column doesn't exist)
        try {
          const { error: updateError } = await supabase
            .from('website_pages')
            .update({ clone_html: fullHTML })
            .eq('id', pageRecord.id);

          if (updateError) {
            console.warn(`⚠️ Could not update clone_html for page ${pageRecord.id}:`, updateError.message);
          } else {
            console.log(`✅ Populated clone_html for Canvas Mode V2.0`);
          }
        } catch (e) {
          console.log('clone_html column not found, skipping V2.0 format');
        }

        clonedPages.push({
          id: pageRecord.id,
          title: title,
          slug: slug,
          url: pageUrl,
        });

        console.log(`✓ Page "${title}" cloned successfully`);
      } catch (error) {
        console.error(`Failed to clone ${pageUrl}:`, error);
        // Continue with other pages
      }
    }

    // Store asset mapping (if column exists)
    try {
      const { error: updateError } = await supabase
        .from('organization_websites')
        .update({
          clone_assets: allAssets,
        })
        .eq('id', website.id);

      if (updateError) console.error('Failed to store assets:', updateError);
    } catch (e) {
      console.log('clone_assets column not found, skipping asset storage');
    }

    console.log(`Clone complete: ${clonedPages.length} pages, ${allAssets.length} assets`);

    return new Response(
      JSON.stringify({
        success: true,
        websiteId: website.id,
        pagesCount: clonedPages.length,
        assetsCount: allAssets.length,
        pages: clonedPages,
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Clone error:', error);
    return new Response(
      JSON.stringify({
        error: error?.message || String(error) || 'Failed to clone website',
        details: error?.stack || 'No stack trace available'
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});

/**
 * Extract all CSS from HTML (inline styles and external stylesheets)
 */
async function extractCSS(html: string, baseUrl: string): Promise<{ css: string; updatedHtml: string }> {
  let allCss = '';
  let updatedHtml = html;

  // Extract inline <style> tags
  const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
  let match;
  while ((match = styleRegex.exec(html)) !== null) {
    allCss += match[1] + '\n\n';
  }

  // Remove <style> tags from HTML
  updatedHtml = updatedHtml.replace(styleRegex, '');

  // Extract external stylesheets
  const linkRegex = /<link[^>]*rel=["']stylesheet["'][^>]*>/gi;
  const links: string[] = [];
  while ((match = linkRegex.exec(html)) !== null) {
    links.push(match[0]);
  }

  // Fetch external stylesheets
  for (const linkTag of links) {
    const hrefMatch = linkTag.match(/href=["']([^"']+)["']/);
    if (hrefMatch) {
      try {
        const cssUrl = makeAbsoluteUrl(hrefMatch[1], baseUrl);
        const corsProxy = 'https://api.allorigins.win/raw?url=';
        const response = await fetch(`${corsProxy}${encodeURIComponent(cssUrl)}`);
        const cssContent = await response.text();
        allCss += `\n/* From: ${cssUrl} */\n${cssContent}\n\n`;
      } catch (error) {
        console.error('Failed to fetch CSS:', hrefMatch[1], error);
      }
    }
  }

  // Remove <link rel="stylesheet"> tags
  updatedHtml = updatedHtml.replace(linkRegex, '');

  return { css: allCss, updatedHtml };
}

/**
 * Extract all JavaScript from HTML
 */
async function extractJS(html: string, baseUrl: string): Promise<{ js: string; updatedHtml: string }> {
  let allJs = '';
  let updatedHtml = html;

  // Extract inline <script> tags
  const scriptRegex = /<script(?![^>]*src=)[^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = scriptRegex.exec(html)) !== null) {
    allJs += match[1] + '\n\n';
  }

  // Remove inline <script> tags
  updatedHtml = updatedHtml.replace(scriptRegex, '');

  // Extract external scripts
  const scriptSrcRegex = /<script[^>]*src=["']([^"']+)["'][^>]*><\/script>/gi;
  const scripts: string[] = [];
  while ((match = scriptSrcRegex.exec(html)) !== null) {
    scripts.push(match[1]);
  }

  // Fetch external scripts
  for (const scriptSrc of scripts) {
    try {
      const jsUrl = makeAbsoluteUrl(scriptSrc, baseUrl);
      const corsProxy = 'https://api.allorigins.win/raw?url=';
      const response = await fetch(`${corsProxy}${encodeURIComponent(jsUrl)}`);
      const jsContent = await response.text();
      allJs += `\n// From: ${jsUrl}\n${jsContent}\n\n`;
    } catch (error) {
      console.error('Failed to fetch JS:', scriptSrc, error);
    }
  }

  // Remove external <script> tags
  updatedHtml = updatedHtml.replace(scriptSrcRegex, '');

  return { js: allJs, updatedHtml };
}

/**
 * Clone all assets (images, fonts, etc.) and replace URLs in HTML
 */
async function cloneAssets(
  html: string,
  baseUrl: string,
  supabase: any,
  websiteId: string
): Promise<{ assets: ClonedAsset[]; htmlWithReplacedAssets: string }> {
  const assets: ClonedAsset[] = [];
  let updatedHtml = html;

  // Find all image tags
  const imgRegex = /<img[^>]*src=["']([^"']+)["'][^>]*>/gi;
  let match;
  const imageUrls = new Set<string>();

  while ((match = imgRegex.exec(html)) !== null) {
    const imgSrc = match[1];
    const absoluteUrl = makeAbsoluteUrl(imgSrc, baseUrl);
    imageUrls.add(absoluteUrl);
  }

  // Clone each unique image
  for (const imageUrl of imageUrls) {
    try {
      const storageUrl = await downloadAndUploadAsset(imageUrl, supabase, websiteId, 'image');
      assets.push({
        originalUrl: imageUrl,
        storageUrl: storageUrl,
        type: 'image',
      });

      // Replace all occurrences in HTML
      updatedHtml = updatedHtml.replace(new RegExp(escapeRegex(imageUrl), 'g'), storageUrl);
    } catch (error) {
      console.error('Failed to clone asset:', imageUrl, error);
    }
  }

  return { assets, htmlWithReplacedAssets: updatedHtml };
}

/**
 * Download asset and upload to Supabase Storage
 */
async function downloadAndUploadAsset(
  assetUrl: string,
  supabase: any,
  websiteId: string,
  type: string
): Promise<string> {
  console.log('Downloading asset:', assetUrl);

  const response = await fetch(assetUrl);
  if (!response.ok) {
    throw new Error(`Failed to download: ${response.status}`);
  }

  const contentType = response.headers.get('content-type') || 'application/octet-stream';
  const blob = await response.blob();
  const arrayBuffer = await blob.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);

  // Generate filename
  const urlObj = new URL(assetUrl);
  const pathname = urlObj.pathname;
  const extension = pathname.split('.').pop() || 'bin';
  const filename = `${websiteId}/cloned-${Date.now()}-${Math.random().toString(36).substring(7)}.${extension}`;

  // Upload to storage
  const { data, error } = await supabase.storage
    .from('website-imports')
    .upload(filename, uint8Array, {
      contentType,
      upsert: false,
    });

  if (error) throw error;

  // Get public URL
  const { data: publicUrlData } = supabase.storage
    .from('website-imports')
    .getPublicUrl(filename);

  return publicUrlData.publicUrl;
}

/**
 * Convert relative URL to absolute
 */
function makeAbsoluteUrl(relativeUrl: string, baseUrl: string): string {
  try {
    if (relativeUrl.startsWith('http://') || relativeUrl.startsWith('https://')) {
      return relativeUrl;
    }
    if (relativeUrl.startsWith('//')) {
      return `https:${relativeUrl}`;
    }
    if (relativeUrl.startsWith('/')) {
      const baseUrlObj = new URL(baseUrl);
      return `${baseUrlObj.protocol}//${baseUrlObj.host}${relativeUrl}`;
    }
    return new URL(relativeUrl, baseUrl).href;
  } catch (error) {
    console.error('Error making absolute URL:', error, { relativeUrl, baseUrl });
    return relativeUrl;
  }
}

/**
 * Escape string for use in regex
 */
function escapeRegex(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
