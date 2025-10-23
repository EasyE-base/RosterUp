/**
 * Supabase Edge Function: OpenAI Agent Import
 * Calls OpenAI Agent Builder which orchestrates 4 Vercel APIs to intelligently import websites
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY') || '';
const OPENAI_WORKFLOW_ID = Deno.env.get('OPENAI_WORKFLOW_ID') || ''; // Your workflow ID from Agent Builder (format: wf_xxx)

interface ImportRequest {
  url?: string;  // Single URL (deprecated, use urls instead)
  urls?: string[];  // Multiple URLs for multi-page import
  organizationId: string;
  subdomain: string;
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
    console.log('Vercel Agent Import invoked');
    const body = await req.json();
    console.log('Request body:', JSON.stringify(body));
    const { url, urls, organizationId, subdomain }: ImportRequest = body;

    // Support both single URL and multiple URLs
    let urlsToImport = urls || (url ? [url] : []);

    if (urlsToImport.length === 0) throw new Error('url or urls is required');
    if (!organizationId) throw new Error('organizationId is required');
    if (!subdomain) throw new Error('subdomain is required');

    // CRITICAL: Limit Smart Import to 5 pages max to avoid timeout
    // Smart Import uses OpenAI + 4 Vercel APIs per page = ~20-30s each
    // Real-world testing shows 5 pages = ~100-125s (safely under 150s timeout)
    const MAX_SMART_IMPORT_PAGES = 5;
    if (urlsToImport.length > MAX_SMART_IMPORT_PAGES) {
      console.warn(`⚠️  Smart Import limited to ${MAX_SMART_IMPORT_PAGES} pages (requested ${urlsToImport.length})`);
      console.warn(`   For more pages, use Pixel Clone mode instead`);
      urlsToImport = urlsToImport.slice(0, MAX_SMART_IMPORT_PAGES);
    }

    console.log('Import request:', { urls: urlsToImport, organizationId, subdomain });
    console.log('Organization ID type:', typeof organizationId, 'value:', organizationId);

    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is not set');
    }

    if (!OPENAI_WORKFLOW_ID) {
      throw new Error('OPENAI_WORKFLOW_ID environment variable is not set (format: wf_xxx)');
    }

    // Setup Supabase
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Verify organization exists
    const { data: orgCheck, error: orgError } = await supabase
      .from('organizations')
      .select('id')
      .eq('id', organizationId)
      .single();

    if (orgError || !orgCheck) {
      console.error('Organization not found:', { organizationId, error: orgError });
      throw new Error(`Organization ${organizationId} not found. Please check your organization ID.`);
    }

    console.log('Organization verified:', orgCheck.id);

    // Check if organization already has a website - reuse it or create new
    let website;
    const { data: existingWebsite } = await supabase
      .from('organization_websites')
      .select('id')
      .eq('organization_id', organizationId)
      .maybeSingle();

    if (existingWebsite) {
      // Reuse existing website - just add new pages to it
      console.log('✓ Found existing website, adding pages to it:', existingWebsite.id);
      website = existingWebsite;
    } else {
      // Create new website record if one doesn't exist
      const { data: newWebsite, error: websiteError } = await supabase
        .from('organization_websites')
        .insert({
          organization_id: organizationId,
          subdomain: subdomain,
          is_published: false,
          website_mode: 'clone', // Use clone mode for imported websites
          clone_html: '',  // Will be updated with first page
          clone_css: '',   // Will be updated with global CSS
          clone_js: '',
          custom_css: '',  // Will be updated with global CSS
        })
        .select()
        .single();

      if (websiteError) throw websiteError;
      website = newWebsite;
      console.log('✓ Created new website record');
    }

    // Multi-page import: Loop through all URLs and import each as a separate page
    console.log(`Starting multi-page import for ${urlsToImport.length} URL(s)...`);

    // Get current max order_index for existing pages to append new pages after them
    const { data: existingPages } = await supabase
      .from('website_pages')
      .select('order_index')
      .eq('website_id', website.id)
      .order('order_index', { ascending: false })
      .limit(1);

    const startingOrderIndex = existingPages && existingPages.length > 0
      ? existingPages[0].order_index + 1
      : 0;

    console.log(`Starting order_index: ${startingOrderIndex} (found ${existingPages?.length || 0} existing pages)`);

    const importedPages: any[] = [];
    let totalSections = 0;
    let totalBlocks = 0;
    let globalCSS = '';

    for (let urlIndex = 0; urlIndex < urlsToImport.length; urlIndex++) {
      const currentUrl = urlsToImport[urlIndex];
      console.log(`\n🔄 Importing page ${urlIndex + 1}/${urlsToImport.length}: ${currentUrl}`);

      // Use OpenAI Function Calling to intelligently orchestrate the Vercel APIs
      console.log('Calling OpenAI with function calling to orchestrate website cloning...');

    const tools = [
      {
        type: 'function',
        function: {
          name: 'fetch_url',
          description: 'Fetches the HTML content from a given public URL',
          parameters: {
            type: 'object',
            properties: {
              url: { type: 'string', description: 'The website URL to fetch' }
            },
            required: ['url']
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'segment_dom',
          description: 'Segments HTML into sections and extracts assets',
          parameters: {
            type: 'object',
            properties: {
              html: { type: 'string', description: 'The HTML content' },
              baseUrl: { type: 'string', description: 'The base URL' }
            },
            required: ['html', 'baseUrl']
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'map_to_blocks',
          description: 'Maps HTML sections to block structure',
          parameters: {
            type: 'object',
            properties: {
              sections: {
                type: 'array',
                description: 'Array of HTML sections',
                items: { type: 'object' }
              },
              assets: {
                type: 'array',
                description: 'Array of asset URLs',
                items: { type: 'string' }
              }
            },
            required: ['sections', 'assets']
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'assemble_rosterup_site',
          description: 'Assembles final RosterUp site structure from pages',
          parameters: {
            type: 'object',
            properties: {
              pages: {
                type: 'array',
                description: 'Array of pages with their blocks',
                items: { type: 'object' }
              }
            },
            required: ['pages']
          }
        }
      }
    ];

      const messages = [
        {
          role: 'system',
          content: `You are a website cloning assistant. You MUST call all 4 tools in sequence to complete the task.

REQUIRED STEPS (call each tool in order):
1. fetch_url - Download HTML
2. segment_dom - Extract sections from HTML
3. map_to_blocks - Convert sections to blocks
4. assemble_rosterup_site - Create final structure

IMPORTANT: You must call assemble_rosterup_site as the final step with this format:
{ "pages": [{ "blocks": [...], "assets": [...] }] }

Do not stop until all 4 tools have been called.`
        },
        {
          role: 'user',
          content: `Clone ${currentUrl} - call all 4 tools in sequence.`
        }
      ];

    let assembleData;
    let continueLoop = true;
    let maxIterations = 15; // Increased from 10
    let iteration = 0;

    // Store full API responses (not truncated)
    const apiResponses: { [key: string]: any } = {};

    while (continueLoop && iteration < maxIterations) {
      iteration++;
      console.log(`AI iteration ${iteration}/${maxIterations}`);

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: messages,
          tools: tools,
          tool_choice: 'auto'
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenAI API error:', errorText);
        throw new Error(`OpenAI API failed: ${errorText}`);
      }

      const completion = await response.json();
      const assistantMessage = completion.choices[0].message;

      console.log('AI response:', {
        hasToolCalls: !!assistantMessage.tool_calls,
        toolCallCount: assistantMessage.tool_calls?.length || 0,
        finishReason: completion.choices[0].finish_reason
      });

      messages.push(assistantMessage);

      // Check if AI wants to call functions
      if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
        // Execute each tool call
        for (const toolCall of assistantMessage.tool_calls) {
          const functionName = toolCall.function.name;
          const functionArgs = JSON.parse(toolCall.function.arguments);

          console.log(`AI calling: ${functionName}`, functionArgs);

          let functionResult;

          // Call the corresponding Vercel API
          switch (functionName) {
            case 'fetch_url':
              const fetchResp = await fetch('https://rosterupagent.vercel.app/api/fetchUrl', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(functionArgs)
              });
              functionResult = await fetchResp.json();
              if (!fetchResp.ok || !functionResult.success) {
                console.error('fetch_url failed:', functionResult);
              }
              break;

            case 'segment_dom':
              // Use actual HTML from fetch_url, not AI's truncated version
              const fetchData = apiResponses['fetch_url'];
              const segmentArgs = {
                html: fetchData?.html || functionArgs.html,
                baseUrl: functionArgs.baseUrl || currentUrl
              };

              const segmentResp = await fetch('https://rosterupagent.vercel.app/api/segmentDom', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(segmentArgs)
              });
              functionResult = await segmentResp.json();
              if (!segmentResp.ok || !functionResult.success) {
                console.error('segment_dom failed:', functionResult);
              }
              break;

            case 'map_to_blocks':
              // Use actual data from segment_dom, not AI's truncated version
              const segmentData = apiResponses['segment_dom'];
              const mapArgs = {
                sections: segmentData?.sections || functionArgs.sections,
                assets: segmentData?.assets || functionArgs.assets
              };

              const mapResp = await fetch('https://rosterupagent.vercel.app/api/mapToBlocks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(mapArgs)
              });
              functionResult = await mapResp.json();
              if (!mapResp.ok || !functionResult.success) {
                console.error('map_to_blocks failed:', functionResult);
              }
              break;

            case 'assemble_rosterup_site':
              // Use actual blocks from map_to_blocks
              const mapData = apiResponses['map_to_blocks'];
              const assembleArgs = {
                pages: functionArgs.pages || [{
                  blocks: mapData?.blocks || [],
                  assets: apiResponses['segment_dom']?.assets || []
                }]
              };

              const assembleResp = await fetch('https://rosterupagent.vercel.app/api/assembleRosterUpSite', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(assembleArgs)
              });
              assembleData = await assembleResp.json();
              functionResult = assembleData;
              console.log('Assemble result:', JSON.stringify(assembleData).substring(0, 500));
              if (!assembleResp.ok || !assembleData.success) {
                console.error('assemble_rosterup_site failed:', assembleData);
              }
              break;
          }

          console.log(`Function ${functionName} result:`, JSON.stringify(functionResult).substring(0, 200));

          // Store full response for later use
          apiResponses[functionName] = functionResult;

          // Truncate large responses to avoid token limits in conversation
          let truncatedResult = functionResult;

          // For fetch_url, truncate the HTML to just metadata
          if (functionName === 'fetch_url' && functionResult.html) {
            truncatedResult = {
              success: functionResult.success,
              html: `[HTML Content - ${functionResult.html.length} characters]`,
              message: 'HTML fetched successfully. Pass this HTML to segment_dom.'
            };
          }

          // For segment_dom, keep structure but truncate large content
          if (functionName === 'segment_dom' && functionResult.sections) {
            truncatedResult = {
              success: functionResult.success,
              sections: functionResult.sections.map((s: any, i: number) => ({
                type: s.type,
                index: i,
                summary: `Section ${i + 1}: ${s.type}`
              })),
              assets: functionResult.assets || [],
              message: `Segmented into ${functionResult.sections.length} sections. Pass sections and assets to map_to_blocks.`
            };
          }

          // For map_to_blocks, summarize the blocks
          if (functionName === 'map_to_blocks' && functionResult.blocks) {
            truncatedResult = {
              success: functionResult.success,
              blocksCount: functionResult.blocks.length,
              message: `Mapped to ${functionResult.blocks.length} blocks. Pass pages array to assemble_rosterup_site.`
            };
          }

          // Add truncated result to messages
          messages.push({
            role: 'tool',
            tool_call_id: toolCall.id,
            content: JSON.stringify(truncatedResult)
          });
        }
      } else {
        // AI is done calling functions
        continueLoop = false;
      }
    }

    console.log('AI loop completed. AssembleData:', assembleData ? 'present' : 'missing');
    console.log('Functions called:', Object.keys(apiResponses));

    if (!assembleData) {
      const functionsCalled = Object.keys(apiResponses).join(', ');
      throw new Error(`AI did not complete the assemble_rosterup_site step. Functions called: ${functionsCalled}`);
    }

    if (!assembleData.success) {
      throw new Error(`Assembly failed: ${assembleData.error || 'Unknown error'}`);
    }

      console.log('✓ AI completed website cloning for this page');
      console.log('Assemble data structure:', JSON.stringify(assembleData, null, 2).substring(0, 1000));

      // Step 2: Transform to RosterUp database format and create page record
      console.log(`Step 2: Creating page record for ${currentUrl}...`);

      // Get raw HTML and extracted CSS for clone mode
      const fetchData = apiResponses['fetch_url'];
      const rawHtml = fetchData?.html || '';

      // Extract CSS from first page only (global styles)
      if (urlIndex === 0) {
        globalCSS = await extractAllCSS(rawHtml, currentUrl);
        console.log(`✓ Extracted ${globalCSS.length} characters of global CSS`);

        // Update website record with global CSS
        await supabase
          .from('organization_websites')
          .update({
            clone_css: globalCSS,
            custom_css: globalCSS,
          })
          .eq('id', website.id);
      }

      // Transform internal links to RosterUp URLs
      let transformedHtml = transformInternalLinks(rawHtml, currentUrl, urlsToImport, subdomain);
      console.log(`✓ Transformed internal links in HTML`);

      // Transform image URLs to use Supabase-hosted versions
      transformedHtml = await transformImageUrls(transformedHtml, currentUrl, supabase, website.id);
      console.log(`✓ Transformed image URLs to Supabase Storage`);

    // 🚀 REVOLUTIONARY SMART IMPORT™ APPROACH
    // Store blocks for future editability, but render with CloneViewer by default
    console.log('✓ AI orchestration complete - implementing Smart Import™ with two-layer architecture');

    const segmentData = apiResponses['segment_dom'];
    const htmlSections = segmentData?.sections || [];
    const assets = segmentData?.assets || [];

    console.log(`Found ${htmlSections.length} HTML sections with preserved styling`);
    console.log('Segment data:', JSON.stringify(segmentData, null, 2).substring(0, 2000));

    // FALLBACK: If segment_dom returns empty sections, use raw HTML from fetch_url
    if (htmlSections.length === 0) {
      console.log('⚠️ segment_dom returned no sections, falling back to raw HTML parsing');

      if (!rawHtml) {
        throw new Error('No HTML content available from fetch_url. Cannot proceed with import.');
      }

      console.log(`Using raw HTML (${rawHtml.length} characters) for parsing`);

      // Create a single section from the entire HTML
      htmlSections.push({
        html: rawHtml,
        outerHTML: rawHtml,
        type: 'main',
        className: '',
      });
    }

      // Extract title and slug from URL
      const urlObj = new URL(currentUrl);
      const pathname = urlObj.pathname;
      const slug = pathname === '/' ? '' : pathname.replace(/^\/|\/$/g, '');

      // Try to extract title from HTML
      const titleMatch = rawHtml.match(/<title[^>]*>(.*?)<\/title>/i);
      let pageTitle = 'Home';

      if (titleMatch && titleMatch[1]) {
        pageTitle = titleMatch[1].trim();
      } else if (slug) {
        // Generate title from slug
        pageTitle = slug.split('/').pop()?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Page';
      }

      // Check if page with this slug already exists
      const { data: existingPage } = await supabase
        .from('website_pages')
        .select('id')
        .eq('website_id', website.id)
        .eq('slug', slug)
        .maybeSingle();

      if (existingPage) {
        console.log(`⚠️  Page with slug "${slug}" already exists, skipping import`);
        continue;
      }

      // Create page record with order_index continuing from existing pages
      const { data: pageRecord, error: pageError } = await supabase
        .from('website_pages')
        .insert({
          website_id: website.id,
          title: pageTitle,
          slug: slug,
          is_home: startingOrderIndex === 0 && urlIndex === 0,  // Only first page of first batch is home
          is_published: false,
          order_index: startingOrderIndex + urlIndex,
          clone_html: transformedHtml,  // Store page-specific HTML
        })
        .select()
        .single();

      if (pageError) throw pageError;
      console.log(`✓ Created page record: ${pageTitle} (${slug || '/'})`);

      // Update first page's HTML in website record for backward compatibility
      if (urlIndex === 0) {
        await supabase
          .from('organization_websites')
          .update({
            clone_html: transformedHtml,
          })
          .eq('id', website.id);
      }

    // Create sections and blocks with preserved HTML
    let sectionsCreated = 0;
    let blocksCreated = 0;

    for (let i = 0; i < htmlSections.length; i++) {
      const htmlSection = htmlSections[i];

      // Determine section type from HTML content
      const sectionType = detectSectionType(htmlSection, i, htmlSections.length);
      const sectionName = generateSectionName(htmlSection, sectionType);

      console.log(`Creating section ${i + 1}: ${sectionName} (${sectionType})`);

      // Create section with minimal metadata
      const { data: section, error: sectionError } = await supabase
        .from('website_sections')
        .insert({
          page_id: pageRecord.id,
          name: sectionName,
          section_type: sectionType,
          full_width: true,
          order_index: i,
          styles: {
            // Store original HTML classes if available
            originalClasses: htmlSection.className || htmlSection.class,
          },
        })
        .select()
        .single();

      if (sectionError) {
        console.error('Section creation error:', sectionError);
        continue;
      }

      sectionsCreated++;

      // Parse HTML section into semantic blocks while preserving styling
      const blocks = await parseHtmlIntoStyledBlocks(htmlSection, supabase, website.id);

      console.log(`Parsed ${blocks.length} blocks from section "${sectionName}"`);

      // Create blocks
      for (let j = 0; j < blocks.length; j++) {
        const block = blocks[j];

        const { error: blockError } = await supabase
          .from('website_content_blocks')
          .insert({
            page_id: pageRecord.id,
            section_id: section.id,
            block_type: block.block_type,
            content: block.content,
            styles: block.styles || {},
            visibility: { desktop: true, tablet: true, mobile: true },
            order_index: j,
          });

        if (blockError) {
          console.error('Block creation error:', blockError, 'for block:', block);
          continue;
        }

        blocksCreated++;
      }
    }

      console.log(`✓ Created ${sectionsCreated} sections and ${blocksCreated} blocks for this page`);

      // Track this page's import
      importedPages.push({
        pageId: pageRecord.id,
        title: pageTitle,
        slug: slug,
        sectionsCount: sectionsCreated,
        blocksCount: blocksCreated,
      });

      totalSections += sectionsCreated;
      totalBlocks += blocksCreated;

      console.log(`✅ Page ${urlIndex + 1}/${urlsToImport.length} imported successfully\n`);
    }

    // All pages imported successfully
    console.log(`\n🎉 Multi-page import complete!`);
    console.log(`Total: ${importedPages.length} pages, ${totalSections} sections, ${totalBlocks} blocks`);

    return new Response(
      JSON.stringify({
        success: true,
        websiteId: website.id,
        pageId: importedPages[0]?.pageId,  // Return first page ID for backward compatibility
        pagesCount: importedPages.length,
        pages: importedPages,
        sectionsCount: totalSections,
        blocksCount: totalBlocks,
        message: `Website imported successfully! ${importedPages.length} pages with ${totalBlocks} blocks.`,
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (error) {
    console.error('Import error:', error);
    return new Response(
      JSON.stringify({
        error: error?.message || String(error),
        details: error?.stack || 'No stack trace available',
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
 * 🔗 Transform internal links in HTML to work within RosterUp
 * Converts absolute URLs from original site to RosterUp page URLs
 */
function transformInternalLinks(html: string, baseUrl: string, allUrls: string[], subdomain: string): string {
  try {
    const urlObj = new URL(baseUrl);
    const baseDomain = urlObj.hostname;

    console.log(`Transforming internal links for domain: ${baseDomain}`);

    // Create a map of URL paths to slugs from all imported pages
    const urlToSlugMap = new Map<string, string>();
    for (const url of allUrls) {
      try {
        const parsedUrl = new URL(url);
        const pathname = parsedUrl.pathname;
        const slug = pathname === '/' ? '' : pathname.replace(/^\/|\/$/g, '');
        urlToSlugMap.set(pathname, slug);
        urlToSlugMap.set(url, slug); // Also map full URL
      } catch (e) {
        console.warn(`Failed to parse URL for mapping: ${url}`);
      }
    }

    console.log(`Created slug map for ${urlToSlugMap.size} URLs`);

    // Find all <a href="..."> tags (case insensitive, handles quotes and attributes)
    const linkRegex = /<a\s+([^>]*?)href=["']([^"']+)["']([^>]*?)>/gi;

    let transformedHtml = html;
    const replacements: { original: string; replacement: string }[] = [];
    let match;

    // Reset regex state
    linkRegex.lastIndex = 0;

    while ((match = linkRegex.exec(html)) !== null) {
      const fullTag = match[0];
      const beforeHref = match[1];
      const href = match[2];
      const afterHref = match[3];

      // Skip anchors, mailto, tel, javascript
      if (href.startsWith('#') || href.startsWith('mailto:') ||
          href.startsWith('tel:') || href.startsWith('javascript:')) {
        continue;
      }

      // Check if it's an internal link
      let isInternal = false;
      let linkPathname = '';
      try {
        if (href.startsWith('/') && !href.startsWith('//')) {
          // Relative URL - definitely internal
          isInternal = true;
          linkPathname = href.split('?')[0].split('#')[0]; // Remove query and hash
        } else if (href.startsWith('http')) {
          const linkUrl = new URL(href);
          isInternal = linkUrl.hostname === baseDomain;
          if (isInternal) {
            linkPathname = linkUrl.pathname;
          }
        }
      } catch (e) {
        // Invalid URL, skip
        console.log(`Skipping invalid URL: ${href}`);
        continue;
      }

      if (isInternal) {
        // Check if this page was imported
        const slug = urlToSlugMap.get(linkPathname) || urlToSlugMap.get(href);

        if (slug !== undefined) {
          // Page was imported - transform to RosterUp URL
          const rosterUpPath = slug === '' ? '/' : `/${slug}`;
          const newHref = `https://${subdomain}.rosterup.app${rosterUpPath}`;
          const newTag = `<a ${beforeHref}href="${newHref}"${afterHref}>`;

          replacements.push({
            original: fullTag,
            replacement: newTag
          });

          console.log(`Transformed link: ${href} -> ${newHref}`);
        } else {
          // Page wasn't imported - mark for future import
          const newTag = `<a ${beforeHref}href="#" data-original-href="${href}" data-needs-import="true"${afterHref}>`;

          replacements.push({
            original: fullTag,
            replacement: newTag
          });

          console.log(`Marked unimported link: ${href}`);
        }
      }
    }

    // Apply all replacements
    for (const { original, replacement } of replacements) {
      transformedHtml = transformedHtml.replace(original, replacement);
    }

    console.log(`✓ Transformed ${replacements.length} internal links`);

    return transformedHtml;
  } catch (error) {
    console.error('Error transforming links:', error);
    return html; // Return original HTML if transformation fails
  }
}

/**
 * 🖼️ Transform image URLs in HTML to use Supabase-hosted versions
 * Downloads all images and replaces their src attributes with Supabase Storage URLs
 */
async function transformImageUrls(
  html: string,
  baseUrl: string,
  supabase: any,
  websiteId: string
): Promise<string> {
  try {
    console.log('🖼️  Transforming image URLs in HTML...');

    let transformedHtml = html;
    const imageMap = new Map<string, string>(); // Track original -> uploaded URL

    // Find all <img src="..."> tags
    const imgRegex = /<img([^>]*?)src=["']([^"']+)["']([^>]*?)>/gi;
    const matches: { fullTag: string; beforeSrc: string; src: string; afterSrc: string }[] = [];

    let match;
    imgRegex.lastIndex = 0;

    while ((match = imgRegex.exec(html)) !== null) {
      matches.push({
        fullTag: match[0],
        beforeSrc: match[1],
        src: match[2],
        afterSrc: match[3]
      });
    }

    console.log(`Found ${matches.length} images to process`);

    // Process each image
    for (const { fullTag, beforeSrc, src, afterSrc } of matches) {
      // Skip if already processed
      if (imageMap.has(src)) {
        const uploadedUrl = imageMap.get(src)!;
        const newTag = `<img${beforeSrc}src="${uploadedUrl}"${afterSrc}>`;
        transformedHtml = transformedHtml.replace(fullTag, newTag);
        continue;
      }

      // Skip non-http images (data URLs, relative paths without protocol)
      if (!src.startsWith('http')) {
        // Try to make it absolute
        try {
          const absoluteUrl = new URL(src, baseUrl).href;
          const uploadedUrl = await handleImageAsset(absoluteUrl, supabase, websiteId);

          if (uploadedUrl !== absoluteUrl) {
            // Successfully uploaded
            imageMap.set(src, uploadedUrl);
            const newTag = `<img${beforeSrc}src="${uploadedUrl}"${afterSrc}>`;
            transformedHtml = transformedHtml.replace(fullTag, newTag);
            console.log(`✓ Transformed image: ${src.substring(0, 50)}... -> Supabase`);
          }
        } catch (err) {
          console.warn(`⚠️  Failed to process relative image: ${src}`, err);
        }
        continue;
      }

      // Download and upload to Supabase
      try {
        const uploadedUrl = await handleImageAsset(src, supabase, websiteId);

        // Only replace if upload was successful (different URL)
        if (uploadedUrl !== src) {
          imageMap.set(src, uploadedUrl);
          const newTag = `<img${beforeSrc}src="${uploadedUrl}"${afterSrc}>`;
          transformedHtml = transformedHtml.replace(fullTag, newTag);
          console.log(`✓ Transformed image: ${src.substring(0, 50)}... -> Supabase`);
        }
      } catch (err) {
        console.error(`Failed to upload image: ${src}`, err);
        // Keep original URL if upload fails
      }
    }

    console.log(`✓ Transformed ${imageMap.size} image URLs to Supabase Storage`);
    return transformedHtml;

  } catch (error) {
    console.error('Error transforming image URLs:', error);
    return html; // Return original HTML if transformation fails
  }
}

/**
 * 💎 Extract ALL CSS from website - inline styles, style tags, and external stylesheets
 * This is the SECRET to preserving visual fidelity!
 */
async function extractAllCSS(html: string, baseUrl: string): Promise<string> {
  let allCSS = '';

  // 1. Extract inline <style> tags
  const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
  let match;
  while ((match = styleRegex.exec(html)) !== null) {
    allCSS += match[1] + '\n\n';
  }

  console.log(`Found ${allCSS.length} chars from inline styles`);

  // 2. Extract external stylesheets
  const linkRegex = /<link[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']+)["'][^>]*>/gi;
  const stylesheetUrls: string[] = [];

  while ((match = linkRegex.exec(html)) !== null) {
    stylesheetUrls.push(match[1]);
  }

  console.log(`Found ${stylesheetUrls.length} external stylesheets`);

  // 3. Fetch and concatenate external stylesheets (limit to first 10 to avoid timeout)
  const maxStylesheets = 10;
  for (let i = 0; i < Math.min(stylesheetUrls.length, maxStylesheets); i++) {
    const cssUrl = stylesheetUrls[i];
    try {
      // Make URL absolute
      let fullUrl = cssUrl;
      if (!cssUrl.startsWith('http')) {
        if (cssUrl.startsWith('//')) {
          fullUrl = 'https:' + cssUrl;
        } else if (cssUrl.startsWith('/')) {
          const baseUrlObj = new URL(baseUrl);
          fullUrl = `${baseUrlObj.protocol}//${baseUrlObj.host}${cssUrl}`;
        } else {
          fullUrl = new URL(cssUrl, baseUrl).href;
        }
      }

      console.log(`Fetching CSS ${i + 1}/${Math.min(stylesheetUrls.length, maxStylesheets)}: ${fullUrl}`);

      const response = await fetch(fullUrl);
      if (response.ok) {
        const cssContent = await response.text();
        allCSS += `\n/* From: ${fullUrl} */\n${cssContent}\n\n`;
        console.log(`✓ Loaded ${cssContent.length} chars from ${fullUrl}`);
      } else {
        console.error(`Failed to fetch ${fullUrl}: ${response.status}`);
      }
    } catch (error) {
      console.error(`Error fetching CSS from ${cssUrl}:`, error);
      // Continue with other stylesheets
    }
  }

  console.log(`Total CSS extracted: ${allCSS.length} characters`);

  return allCSS;
}

/**
 * 🎯 Detect section type from HTML content
 */
function detectSectionType(htmlSection: any, index: number, totalSections: number): 'header' | 'content' | 'footer' {
  const html = htmlSection.html || htmlSection.outerHTML || '';
  const htmlLower = html.toLowerCase();

  // First section with nav elements = header
  if (index === 0 && (htmlLower.includes('<nav') || htmlLower.includes('navbar') || htmlLower.includes('header'))) {
    return 'header';
  }

  // Last section with footer elements = footer
  if (index === totalSections - 1 && (htmlLower.includes('<footer') || htmlLower.includes('copyright') || htmlLower.includes('©'))) {
    return 'footer';
  }

  // Everything else is content
  return 'content';
}

/**
 * 🏷️ Generate semantic section name from HTML
 */
function generateSectionName(htmlSection: any, sectionType: string): string {
  const html = htmlSection.html || htmlSection.outerHTML || '';
  const htmlLower = html.toLowerCase();

  // Check for common semantic patterns
  if (htmlLower.includes('hero') || htmlLower.includes('banner')) return 'Hero';
  if (htmlLower.includes('about')) return 'About';
  if (htmlLower.includes('feature')) return 'Features';
  if (htmlLower.includes('service')) return 'Services';
  if (htmlLower.includes('testimonial') || htmlLower.includes('review')) return 'Testimonials';
  if (htmlLower.includes('contact')) return 'Contact';
  if (htmlLower.includes('pricing') || htmlLower.includes('plan')) return 'Pricing';
  if (htmlLower.includes('gallery') || htmlLower.includes('portfolio')) return 'Gallery';
  if (htmlLower.includes('team') || htmlLower.includes('staff')) return 'Team';
  if (htmlLower.includes('faq')) return 'FAQ';

  // Default names based on type
  if (sectionType === 'header') return 'Header';
  if (sectionType === 'footer') return 'Footer';
  return 'Content';
}

/**
 * 🧠 Parse HTML into semantic blocks with preserved styling
 * This is the CORE of Smart Import™ - turns raw HTML into editable blocks
 */
async function parseHtmlIntoStyledBlocks(
  htmlSection: any,
  supabase: any,
  websiteId: string
): Promise<{ block_type: string; content: any; styles: any }[]> {
  const blocks: { block_type: string; content: any; styles: any }[] = [];
  const html = htmlSection.html || htmlSection.outerHTML || '';

  // Extract inline styles and classes from the section
  const sectionClasses = htmlSection.className || htmlSection.class || '';
  const sectionStyles = htmlSection.style || {};

  console.log('Parsing HTML section:', html.substring(0, 300));

  // Strategy: Parse major HTML elements and preserve their styling
  // Use regex to find major content elements (h1-h6, p, img, a/button)

  // Find all headings (h1-h6) - handle with or without class attribute
  const headingRegex = /<(h[1-6])([^>]*)>([^<]+)<\/h[1-6]>/gi;
  let match;
  while ((match = headingRegex.exec(html)) !== null) {
    const [fullMatch, tag, attributes, text] = match;
    const level = parseInt(tag.charAt(1));

    // Extract class if present
    const classMatch = attributes.match(/class="([^"]*)"/);
    const className = classMatch ? classMatch[1] : '';

    blocks.push({
      block_type: 'heading',
      content: {
        text: text.trim(),
        level: level,
      },
      styles: {
        className: className,
        preserveOriginalHtml: true,
        originalElement: fullMatch,
      },
    });
  }

  // Find all paragraphs - handle with or without class attribute
  const paragraphRegex = /<p([^>]*)>([^<]+)<\/p>/gi;
  while ((match = paragraphRegex.exec(html)) !== null) {
    const [fullMatch, attributes, text] = match;

    // Extract class if present
    const classMatch = attributes.match(/class="([^"]*)"/);
    const className = classMatch ? classMatch[1] : '';

    blocks.push({
      block_type: 'paragraph',
      content: {
        text: text.trim(),
      },
      styles: {
        className: className,
        preserveOriginalHtml: true,
        originalElement: fullMatch,
      },
    });
  }

  // Find all images - more flexible regex
  const imageRegex = /<img([^>]+)>/gi;
  while ((match = imageRegex.exec(html)) !== null) {
    const [fullMatch, attributes] = match;

    // Extract src, class, and alt
    const srcMatch = attributes.match(/src="([^"]*)"/);
    const classMatch = attributes.match(/class="([^"]*)"/);
    const altMatch = attributes.match(/alt="([^"]*)"/);

    const src = srcMatch ? srcMatch[1] : '';
    const className = classMatch ? classMatch[1] : '';
    const alt = altMatch ? altMatch[1] : '';

    if (!src) continue; // Skip images without src

    // Download and store image
    let imageUrl = src;
    if (src && src.startsWith('http')) {
      try {
        imageUrl = await handleImageAsset(src, supabase, websiteId);
      } catch (err) {
        console.error('Failed to download image:', src, err);
        // Use original URL if download fails
      }
    }

    blocks.push({
      block_type: 'image',
      content: {
        url: imageUrl,
        alt: alt || 'Image',
      },
      styles: {
        className: className,
        preserveOriginalHtml: true,
        originalElement: fullMatch,
      },
    });
  }

  // Find all buttons/links - more flexible
  const buttonRegex = /<(button|a)([^>]*)>([^<]+)<\/(button|a)>/gi;
  while ((match = buttonRegex.exec(html)) !== null) {
    const [fullMatch, tag, attributes, text] = match;

    // Extract class and href
    const classMatch = attributes.match(/class="([^"]*)"/);
    const hrefMatch = attributes.match(/href="([^"]*)"/);

    const className = classMatch ? classMatch[1] : '';
    const href = hrefMatch ? hrefMatch[1] : '#';

    blocks.push({
      block_type: 'button',
      content: {
        text: text.trim(),
        url: href,
        style: 'custom', // Use custom style to preserve original
      },
      styles: {
        className: className,
        preserveOriginalHtml: true,
        originalElement: fullMatch,
      },
    });
  }

  // If no blocks were parsed, store entire section as HTML block
  if (blocks.length === 0) {
    console.log('No parseable elements found, storing as raw HTML block');
    blocks.push({
      block_type: 'html',
      content: {
        html: html,
      },
      styles: {
        className: sectionClasses,
        preserveOriginalHtml: true,
        fullSectionHtml: true,
      },
    });
  }

  return blocks;
}

/**
 * Transform Vercel API block to RosterUp block format with preserved HTML/styling
 * Returns an array of blocks (flattens nested children)
 */
function transformVercelBlockToRosterUp(block: any): { block_type: string; content: any; styles?: any }[] {
  const blockType = block.type?.toLowerCase() || '';
  const results: { block_type: string; content: any; styles?: any }[] = [];

  // Extract all props and styles from the block
  const allStyles = {
    ...block.props?.styles,
    ...block.styles,
    // Store original HTML if available for hybrid rendering
    originalHtml: block.html || block.props?.html,
    className: block.props?.className || block.className,
  };

  // Handle special block types with children
  if (blockType === 'navbar' || blockType === 'header') {
    // For navbar, extract child elements (logo, buttons, etc.)
    if (block.children && Array.isArray(block.children)) {
      for (const child of block.children) {
        const childBlocks = transformVercelBlockToRosterUp(child);
        results.push(...childBlocks);
      }
    }
    return results;
  }

  // Handle regular blocks
  let rosterUpBlock: { block_type: string; content: any; styles?: any } | null = null;

  switch (blockType) {
    case 'heading':
    case 'h1':
    case 'h2':
    case 'h3':
      rosterUpBlock = {
        block_type: 'heading',
        content: {
          text: block.props?.text || block.props?.content || 'Heading',
          level: blockType === 'h1' ? 1 : blockType === 'h2' ? 2 : blockType === 'h3' ? 3 : 2,
        },
        styles: allStyles,
      };
      break;

    case 'text':
    case 'paragraph':
    case 'p':
      rosterUpBlock = {
        block_type: 'paragraph',
        content: { text: block.props?.text || block.props?.content || 'Text' },
        styles: allStyles,
      };
      break;

    case 'image':
    case 'img':
      rosterUpBlock = {
        block_type: 'image',
        content: {
          url: block.props?.src || block.props?.url || '',
          alt: block.props?.alt || 'Image',
          width: block.props?.width,
          height: block.props?.height,
        },
        styles: allStyles,
      };
      break;

    case 'button':
    case 'link':
      rosterUpBlock = {
        block_type: 'button',
        content: {
          text: block.props?.text || block.props?.content || 'Click here',
          url: block.props?.href || block.props?.url || '#',
          style: 'primary',
        },
        styles: allStyles,
      };
      break;

    default:
      // For unknown types, store as HTML block to preserve structure
      if (block.html || block.props?.html || block.props?.text || block.props?.content) {
        rosterUpBlock = {
          block_type: 'html',
          content: {
            html: block.html || block.props?.html || `<p>${block.props?.text || block.props?.content || ''}</p>`,
          },
          styles: allStyles,
        };
      }
  }

  if (rosterUpBlock) {
    results.push(rosterUpBlock);
  }

  // Process children if they exist
  if (block.children && Array.isArray(block.children)) {
    for (const child of block.children) {
      const childBlocks = transformVercelBlockToRosterUp(child);
      results.push(...childBlocks);
    }
  }

  return results;
}

/**
 * Transform nested block structure to RosterUp's flat database format
 */
async function transformAndCreateBlocks(
  supabase: any,
  pageId: string,
  websiteId: string,
  blocks: any[],
  assets: string[]
): Promise<{ sectionsCreated: number; blocksCreated: number }> {
  let sectionsCreated = 0;
  let blocksCreated = 0;

  // Group blocks by section type
  const sections: { [key: string]: any[] } = {
    header: [],
    content: [],
    footer: [],
  };

  for (const block of blocks) {
    const sectionType = mapBlockTypeToSection(block.type);
    sections[sectionType].push(block);
  }

  // Create sections and blocks
  for (const [sectionType, sectionBlocks] of Object.entries(sections)) {
    if (sectionBlocks.length === 0) continue;

    // Create section
    const { data: section, error: sectionError } = await supabase
      .from('website_sections')
      .insert({
        page_id: pageId,
        name: `${sectionType.charAt(0).toUpperCase() + sectionType.slice(1)} Section`,
        section_type: sectionType,
        full_width: true,
        order_index: sectionsCreated,
      })
      .select()
      .single();

    if (sectionError) {
      console.error('Section creation error:', sectionError);
      continue;
    }

    sectionsCreated++;

    // Create blocks within section
    for (let i = 0; i < sectionBlocks.length; i++) {
      const block = sectionBlocks[i];
      const rosterUpBlock = await transformBlockToRosterUp(block, supabase, websiteId, assets);

      if (!rosterUpBlock) continue;

      const { error: blockError } = await supabase
        .from('website_content_blocks')
        .insert({
          page_id: pageId,
          section_id: section.id,
          block_type: rosterUpBlock.block_type,
          content: rosterUpBlock.content,
          styles: rosterUpBlock.styles || {},
          visibility: { desktop: true, tablet: true, mobile: true },
          order_index: i,
        });

      if (blockError) {
        console.error('Block creation error:', blockError);
        continue;
      }

      blocksCreated++;
    }
  }

  return { sectionsCreated, blocksCreated };
}

/**
 * Map Vercel API block types to RosterUp section types
 */
function mapBlockTypeToSection(blockType: string): 'header' | 'content' | 'footer' {
  const type = blockType.toLowerCase();
  if (type === 'navbar') return 'header';
  if (type === 'footer') return 'footer';
  return 'content';
}

/**
 * Transform individual block from Vercel format to RosterUp format
 */
async function transformBlockToRosterUp(
  block: any,
  supabase: any,
  websiteId: string,
  assets: string[]
): Promise<{ block_type: string; content: any; styles?: any } | null> {
  const blockType = block.type?.toLowerCase();

  // Map block types
  switch (blockType) {
    case 'hero':
    case 'section':
      // Extract hero content from children
      return await transformHeroSection(block, supabase, websiteId, assets);

    case 'heading':
      return {
        block_type: 'heading',
        content: { text: block.props?.text || block.props?.content || 'Heading' },
        styles: block.props?.styles || {},
      };

    case 'text':
      return {
        block_type: 'paragraph',
        content: { text: block.props?.text || block.props?.content || 'Text content' },
        styles: block.props?.styles || {},
      };

    case 'image':
      // Download and upload image to Supabase Storage
      const imageUrl = await handleImageAsset(
        block.props?.src || block.props?.url || '',
        supabase,
        websiteId
      );

      return {
        block_type: 'image',
        content: {
          url: imageUrl,
          alt: block.props?.alt || 'Image',
          caption: block.props?.caption || '',
        },
        styles: block.props?.styles || {},
      };

    case 'button':
      return {
        block_type: 'button',
        content: {
          text: block.props?.text || 'Click Here',
          url: block.props?.href || block.props?.url || '#',
          style: 'primary',
        },
        styles: block.props?.styles || {},
      };

    case 'navbar':
    case 'footer':
      // These become sections, not blocks
      return null;

    default:
      // Generic content block
      if (block.props?.text || block.props?.content) {
        return {
          block_type: 'text',
          content: { text: block.props.text || block.props.content },
          styles: block.props?.styles || {},
        };
      }
      return null;
  }
}

/**
 * Transform hero section with nested children
 */
async function transformHeroSection(
  heroBlock: any,
  supabase: any,
  websiteId: string,
  assets: string[]
): Promise<{ block_type: string; content: any; styles?: any } | null> {
  // Extract title and subtitle from children
  let title = 'Welcome';
  let subtitle = '';
  let backgroundImage = '';

  if (heroBlock.children && Array.isArray(heroBlock.children)) {
    for (const child of heroBlock.children) {
      if (child.type?.toLowerCase() === 'heading') {
        title = child.props?.text || child.props?.content || title;
      } else if (child.type?.toLowerCase() === 'text') {
        subtitle = child.props?.text || child.props?.content || subtitle;
      } else if (child.type?.toLowerCase() === 'image') {
        backgroundImage = child.props?.src || child.props?.url || '';
      }
    }
  }

  // Download background image if present
  if (backgroundImage) {
    backgroundImage = await handleImageAsset(backgroundImage, supabase, websiteId);
  }

  return {
    block_type: 'hero',
    content: {
      title,
      subtitle,
      backgroundImage,
    },
    styles: heroBlock.props?.styles || {},
  };
}

/**
 * Download image and upload to Supabase Storage
 */
async function handleImageAsset(
  imageUrl: string,
  supabase: any,
  websiteId: string
): Promise<string> {
  if (!imageUrl || imageUrl === '') return '';

  try {
    // Download image
    const response = await fetch(imageUrl);
    if (!response.ok) {
      console.error('Failed to download image:', imageUrl);
      return imageUrl; // Return original URL if download fails
    }

    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Generate filename
    const urlObj = new URL(imageUrl);
    const pathname = urlObj.pathname;
    const extension = pathname.split('.').pop() || 'jpg';
    const filename = `${websiteId}/vercel-import-${Date.now()}-${Math.random().toString(36).substring(7)}.${extension}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('website-imports')
      .upload(filename, uint8Array, {
        contentType: response.headers.get('content-type') || 'image/jpeg',
        upsert: false,
      });

    if (error) {
      console.error('Failed to upload image:', error);
      return imageUrl; // Return original URL if upload fails
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('website-imports')
      .getPublicUrl(filename);

    return publicUrlData.publicUrl;
  } catch (error) {
    console.error('Error handling image asset:', error);
    return imageUrl; // Return original URL if any error occurs
  }
}
