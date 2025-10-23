import { NextRequest, NextResponse } from 'next/server';

interface PageData {
  url: string;
  title: string;
  slug: string;
  html: string;
  screenshot: string;
}

export async function POST(req: NextRequest) {
  try {
    const { url: baseUrl } = await req.json();

    if (!baseUrl) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    console.log('Starting website crawl for:', baseUrl);

    // Step 1: Extract navigation links from homepage
    const navigationLinks = await extractNavigationLinks(baseUrl);

    // Always include homepage
    const allUrls = [baseUrl, ...navigationLinks.filter(link => link !== baseUrl)];

    console.log(`Found ${allUrls.length} pages to crawl`);

    // Step 2: Crawl each page
    const pages: PageData[] = [];

    for (let i = 0; i < allUrls.length; i++) {
      const pageUrl = allUrls[i];
      console.log(`Crawling page ${i + 1}/${allUrls.length}: ${pageUrl}`);

      try {
        const pageData = await crawlPage(pageUrl, pageUrl === baseUrl);
        pages.push(pageData);
      } catch (error) {
        console.error(`Failed to crawl ${pageUrl}:`, error);
        // Continue with other pages even if one fails
      }
    }

    console.log(`Successfully crawled ${pages.length} pages`);

    return NextResponse.json({
      success: true,
      pages,
      totalPages: pages.length,
    });

  } catch (error) {
    console.error('Crawl error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to crawl website' },
      { status: 500 }
    );
  }
}

async function extractNavigationLinks(url: string): Promise<string[]> {
  try {
    // Use CORS proxy to fetch the page
    const corsProxy = 'https://api.allorigins.win/raw?url=';
    const response = await fetch(`${corsProxy}${encodeURIComponent(url)}`);
    const html = await response.text();

    // Parse HTML to extract navigation links
    // This is a simple regex-based extraction - not perfect but works for most sites
    const navLinkRegex = /<nav[^>]*>[\s\S]*?<\/nav>/gi;
    const hrefRegex = /href=["']([^"']+)["']/gi;

    const links: string[] = [];
    const navSections = html.match(navLinkRegex) || [];

    for (const nav of navSections) {
      let match;
      while ((match = hrefRegex.exec(nav)) !== null) {
        const href = match[1];

        // Skip anchors, javascript, mailto, tel, etc.
        if (href.startsWith('#') || href.startsWith('javascript:') ||
            href.startsWith('mailto:') || href.startsWith('tel:')) {
          continue;
        }

        // Convert relative URLs to absolute
        const absoluteUrl = new URL(href, url).href;

        // Only include same-domain links
        if (new URL(absoluteUrl).hostname === new URL(url).hostname) {
          links.push(absoluteUrl);
        }
      }
    }

    // Remove duplicates and limit to 10 pages
    const uniqueLinks = [...new Set(links)].slice(0, 10);

    console.log(`Extracted ${uniqueLinks.length} navigation links`);
    return uniqueLinks;

  } catch (error) {
    console.error('Failed to extract navigation links:', error);
    return [];
  }
}

async function crawlPage(url: string, isHome: boolean): Promise<PageData> {
  // Fetch HTML
  const corsProxy = 'https://api.allorigins.win/raw?url=';
  const response = await fetch(`${corsProxy}${encodeURIComponent(url)}`);
  const html = await response.text();

  // Capture screenshot (simplified - would use Playwright in production)
  let screenshot = '';
  try {
    // Try to capture screenshot via local API
    const screenshotResponse = await fetch('/api/screenshot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });

    if (screenshotResponse.ok) {
      const data = await screenshotResponse.json();
      screenshot = data.screenshot;
    }
  } catch (error) {
    console.warn('Screenshot capture failed, continuing without screenshot');
  }

  // Extract page title and slug
  const urlObj = new URL(url);
  const pathname = urlObj.pathname;
  const slug = pathname === '/' ? '' : pathname.replace(/^\/|\/$/g, '');

  // Extract title from HTML
  const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
  const title = titleMatch
    ? titleMatch[1].trim()
    : slug
      ? slug.split('/').pop()?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Page'
      : 'Home';

  return {
    url,
    title,
    slug,
    html,
    screenshot,
  };
}
