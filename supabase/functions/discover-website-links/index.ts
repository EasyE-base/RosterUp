import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';

interface DiscoverRequest {
  url: string;
  maxDepth?: number;  // How many levels deep to crawl (default: 1)
  maxPages?: number;  // Maximum number of pages to discover (default: 100)
  prioritizeNavigation?: boolean;  // Prioritize navigation/menu links (default: true)
  skipPatterns?: string[];  // URL patterns to skip (e.g., '/wp-admin/*')
}

interface DiscoveredLink {
  url: string;
  depth: number;
  foundOn: string;  // URL where this link was found
  priority: number;  // Priority score (higher = more important)
  source: string;  // Where link was found: 'navigation', 'content', 'footer'
}

// Calculate priority score for a URL
function calculatePriority(
  url: string,
  depth: number,
  source: string,
  prioritizeNavigation: boolean
): number {
  let score = 0;

  // Source priority (highest impact)
  if (prioritizeNavigation) {
    if (source === 'navigation') score += 1000;
    else if (source === 'header') score += 900;
    else if (source === 'footer') score += 700;
    else score += 500; // content
  } else {
    score += 500; // all equal if not prioritizing
  }

  // Common navigation patterns (high priority)
  const navPatterns = [
    '/about', '/contact', '/team', '/schedule', '/tryout', '/training',
    '/service', '/product', '/pricing', '/location', '/news', '/blog',
    '/recruiting', '/commitment'
  ];

  const pathname = new URL(url).pathname.toLowerCase();
  if (navPatterns.some(pattern => pathname.includes(pattern))) {
    score += 300;
  }

  // Penalize deep profile/archive pages (lower priority)
  const lowPriorityPatterns = [
    '/college-commit', '/author/', '/tag/', '/category/',
    '/page/', '/feed/', '/trackback/', '/comment-page'
  ];

  if (lowPriorityPatterns.some(pattern => pathname.includes(pattern))) {
    score -= 400;
  }

  // Depth penalty (prefer shallower pages)
  score -= depth * 50;

  // Homepage bonus
  if (pathname === '/' || pathname === '') {
    score += 500;
  }

  return score;
}

// Extract links from specific HTML sections
function extractLinksBySection(html: string, baseUrl: URL): Map<string, string> {
  const linksBySource = new Map<string, string>();

  // Extract navigation links
  const navRegex = /<nav[^>]*>([\s\S]*?)<\/nav>/gi;
  let match;

  while ((match = navRegex.exec(html)) !== null) {
    const navHtml = match[1];
    const hrefRegex = /<a[^>]+href=["']([^"']+)["']/gi;
    let hrefMatch;

    while ((hrefMatch = hrefRegex.exec(navHtml)) !== null) {
      const href = hrefMatch[1];
      if (!linksBySource.has(href)) {
        linksBySource.set(href, 'navigation');
      }
    }
  }

  // Extract header links
  const headerRegex = /<header[^>]*>([\s\S]*?)<\/header>/gi;
  while ((match = headerRegex.exec(html)) !== null) {
    const headerHtml = match[1];
    const hrefRegex = /<a[^>]+href=["']([^"']+)["']/gi;
    let hrefMatch;

    while ((hrefMatch = hrefRegex.exec(headerHtml)) !== null) {
      const href = hrefMatch[1];
      if (!linksBySource.has(href)) {
        linksBySource.set(href, 'header');
      }
    }
  }

  // Extract footer links
  const footerRegex = /<footer[^>]*>([\s\S]*?)<\/footer>/gi;
  while ((match = footerRegex.exec(html)) !== null) {
    const footerHtml = match[1];
    const hrefRegex = /<a[^>]+href=["']([^"']+)["']/gi;
    let hrefMatch;

    while ((hrefMatch = hrefRegex.exec(footerHtml)) !== null) {
      const href = hrefMatch[1];
      if (!linksBySource.has(href)) {
        linksBySource.set(href, 'footer');
      }
    }
  }

  // Extract all other links (content)
  const allHrefRegex = /<a[^>]+href=["']([^"']+)["']/gi;
  while ((match = allHrefRegex.exec(html)) !== null) {
    const href = match[1];
    if (!linksBySource.has(href)) {
      linksBySource.set(href, 'content');
    }
  }

  return linksBySource;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const {
      url,
      maxDepth = 1,
      maxPages = 100,
      prioritizeNavigation = true,
      skipPatterns = []
    }: DiscoverRequest = await req.json();

    if (!url) {
      throw new Error('url is required');
    }

    console.log(`🔍 Starting SMART link discovery for: ${url}`);
    console.log(`Settings: maxDepth=${maxDepth}, maxPages=${maxPages}, prioritizeNav=${prioritizeNavigation}`);

    // Parse base URL
    const baseUrl = new URL(url);
    const baseDomain = baseUrl.hostname;

    // Track discovered URLs and those to visit (priority queue)
    const discovered = new Map<string, DiscoveredLink>();
    const toVisit: DiscoveredLink[] = [{ url, depth: 0, foundOn: url, priority: 1500, source: 'homepage' }];
    const visited = new Set<string>();

    // Statistics
    let navLinksFound = 0;
    let contentLinksFound = 0;
    let skippedLinks = 0;

    // Normalize URL (remove hash, trailing slash)
    const normalizeUrl = (urlStr: string): string | null => {
      try {
        const parsed = new URL(urlStr, baseUrl);

        // Only include URLs from the same domain
        if (parsed.hostname !== baseDomain) {
          return null;
        }

        // Remove hash and trailing slash
        parsed.hash = '';
        let pathname = parsed.pathname;
        if (pathname.endsWith('/') && pathname.length > 1) {
          pathname = pathname.slice(0, -1);
        }
        parsed.pathname = pathname;

        // Skip common file extensions
        if (/\.(pdf|jpg|jpeg|png|gif|svg|webp|ico|css|js|json|xml|zip|gz|mp4|mp3)$/i.test(pathname)) {
          return null;
        }

        return parsed.toString();
      } catch {
        return null;
      }
    };

    // Check if URL should be skipped based on patterns
    const shouldSkipUrl = (url: string): boolean => {
      const pathname = new URL(url).pathname.toLowerCase();

      // Always skip WordPress admin/system pages
      const alwaysSkip = [
        '/wp-admin', '/wp-login', '/wp-content/uploads', '/wp-json',
        '/xmlrpc.php', '/feed/', '/trackback/', '/comment-page'
      ];

      if (alwaysSkip.some(pattern => pathname.includes(pattern))) {
        return true;
      }

      // Check custom skip patterns
      if (skipPatterns.some(pattern => {
        const regexPattern = pattern.replace(/\*/g, '.*');
        return new RegExp(regexPattern).test(pathname);
      })) {
        return true;
      }

      return false;
    };

    // Priority-based crawl (sort by priority score)
    while (toVisit.length > 0 && discovered.size < maxPages) {
      // Sort by priority (highest first) before getting next item
      toVisit.sort((a, b) => b.priority - a.priority);

      const current = toVisit.shift()!;
      const currentUrl = current.url;

      // Skip if already visited
      if (visited.has(currentUrl)) {
        continue;
      }

      visited.add(currentUrl);
      discovered.set(currentUrl, current);

      console.log(`📄 [P${current.priority}] [${current.source}] [D${current.depth}]: ${currentUrl} (${discovered.size}/${maxPages})`);

      // Don't crawl deeper if we've reached max depth
      if (current.depth >= maxDepth) {
        continue;
      }

      try {
        // Fetch the page
        const response = await fetch(currentUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; RosterUp/1.0; +https://rosterup.app)',
          },
          signal: AbortSignal.timeout(10000),  // 10 second timeout
        });

        if (!response.ok) {
          console.warn(`⚠️  Failed to fetch ${currentUrl}: ${response.status}`);
          continue;
        }

        const html = await response.text();

        // Extract links by section (navigation, header, footer, content)
        const linksBySource = extractLinksBySection(html, baseUrl);
        console.log(`  Found ${linksBySource.size} links total`);

        // Process each link with its source information
        for (const [href, source] of linksBySource.entries()) {
          const normalized = normalizeUrl(href);

          if (!normalized) continue;
          if (visited.has(normalized) || discovered.has(normalized)) continue;
          if (shouldSkipUrl(normalized)) {
            skippedLinks++;
            continue;
          }

          // Calculate priority for this link
          const priority = calculatePriority(
            normalized,
            current.depth + 1,
            source,
            prioritizeNavigation
          );

          // Track stats
          if (source === 'navigation' || source === 'header') {
            navLinksFound++;
          } else {
            contentLinksFound++;
          }

          toVisit.push({
            url: normalized,
            depth: current.depth + 1,
            foundOn: currentUrl,
            priority,
            source,
          });
        }

        console.log(`  → Nav: ${navLinksFound}, Content: ${contentLinksFound}, Skipped: ${skippedLinks}`);
      } catch (error) {
        console.error(`❌ Error fetching ${currentUrl}:`, error.message);
        continue;
      }
    }

    // Convert to array and sort by priority first, then depth
    const discoveredUrls = Array.from(discovered.values()).sort((a, b) => {
      // Sort by priority first (higher = better)
      if (a.priority !== b.priority) {
        return b.priority - a.priority;
      }
      // Then by depth (shallower = better)
      if (a.depth !== b.depth) {
        return a.depth - b.depth;
      }
      // Finally alphabetically
      return a.url.localeCompare(b.url);
    });

    // Calculate statistics
    const navPages = discoveredUrls.filter(d => d.source === 'navigation' || d.source === 'header').length;
    const contentPages = discoveredUrls.filter(d => d.source === 'content').length;
    const footerPages = discoveredUrls.filter(d => d.source === 'footer').length;

    console.log(`✅ Discovery complete: Found ${discoveredUrls.length} pages`);
    console.log(`   → Navigation/Header: ${navPages} pages`);
    console.log(`   → Content: ${contentPages} pages`);
    console.log(`   → Footer: ${footerPages} pages`);
    console.log(`   → Skipped: ${skippedLinks} links`);

    return new Response(
      JSON.stringify({
        success: true,
        baseUrl: url,
        pagesFound: discoveredUrls.length,
        urls: discoveredUrls.map(d => d.url),
        discoveryMap: discoveredUrls,
        stats: {
          navigationPages: navPages,
          contentPages: contentPages,
          footerPages: footerPages,
          skippedLinks: skippedLinks,
          totalLinksFound: navLinksFound + contentLinksFound,
        },
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  } catch (error) {
    console.error('Error in discover-website-links:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }
});
