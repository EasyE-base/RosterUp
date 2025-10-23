/**
 * Website Importer Library
 * Fetches and parses external websites for import
 */

export interface WebsiteData {
  html: string;
  css: string;
  title: string;
  favicon: string | null;
  meta: {
    description: string | null;
    keywords: string | null;
    ogImage: string | null;
  };
  images: string[];
  links: Array<{ href: string; text: string }>;
}

/**
 * Fetch website HTML using a CORS proxy
 */
export async function fetchWebsite(url: string): Promise<WebsiteData> {
  try {
    // Use AllOrigins as a CORS proxy (free service)
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;

    const response = await fetch(proxyUrl);

    if (!response.ok) {
      throw new Error(`Failed to fetch website: ${response.statusText}`);
    }

    const html = await response.text();

    // Parse the HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    return parseWebsiteData(doc, url);
  } catch (error) {
    console.error('Error fetching website:', error);
    throw new Error('Failed to fetch website. Please check the URL and try again.');
  }
}

/**
 * Parse HTML document and extract useful data
 */
function parseWebsiteData(doc: Document, baseUrl: string): WebsiteData {
  // Extract title
  const title = doc.querySelector('title')?.textContent || 'Imported Website';

  // Extract favicon
  const faviconLink = doc.querySelector('link[rel="icon"], link[rel="shortcut icon"]') as HTMLLinkElement;
  const favicon = faviconLink ? resolveUrl(faviconLink.href, baseUrl) : null;

  // Extract meta tags
  const description = doc.querySelector('meta[name="description"]')?.getAttribute('content') || null;
  const keywords = doc.querySelector('meta[name="keywords"]')?.getAttribute('content') || null;
  const ogImage = doc.querySelector('meta[property="og:image"]')?.getAttribute('content') || null;

  // Extract all images
  const images: string[] = [];
  doc.querySelectorAll('img').forEach((img) => {
    const src = img.getAttribute('src');
    if (src) {
      images.push(resolveUrl(src, baseUrl));
    }
  });

  // Extract navigation links
  const links: Array<{ href: string; text: string }> = [];
  doc.querySelectorAll('nav a, header a').forEach((link) => {
    const href = (link as HTMLAnchorElement).getAttribute('href');
    const text = link.textContent?.trim() || '';
    if (href && text) {
      links.push({ href: resolveUrl(href, baseUrl), text });
    }
  });

  // Extract inline and linked CSS
  let css = '';

  // Inline styles
  doc.querySelectorAll('style').forEach((style) => {
    css += style.textContent + '\n';
  });

  // Get computed styles from the body (for reference)
  const bodyStyles = doc.body?.getAttribute('style') || '';
  if (bodyStyles) {
    css += `body { ${bodyStyles} }\n`;
  }

  // Clean up the HTML (remove scripts, tracking, etc.)
  const cleanedHtml = sanitizeHtml(doc);

  return {
    html: cleanedHtml,
    css,
    title,
    favicon,
    meta: {
      description,
      keywords,
      ogImage,
    },
    images: Array.from(new Set(images)), // Remove duplicates
    links,
  };
}

/**
 * Sanitize HTML by removing unwanted elements
 */
function sanitizeHtml(doc: Document): string {
  // Clone the document to avoid modifying the original
  const clone = doc.cloneNode(true) as Document;

  // Remove unwanted elements
  const unwantedSelectors = [
    'script',
    'noscript',
    'iframe',
    'object',
    'embed',
    'style[id*="google"]',
    'link[rel="stylesheet"][href*="analytics"]',
    'meta[name="google-site-verification"]',
    'meta[name="facebook-domain-verification"]',
    '[id*="cookie"]',
    '[class*="cookie"]',
    '[id*="gdpr"]',
    '[class*="gdpr"]',
  ];

  unwantedSelectors.forEach((selector) => {
    clone.querySelectorAll(selector).forEach((el) => el.remove());
  });

  return clone.body?.innerHTML || '';
}

/**
 * Resolve relative URLs to absolute URLs
 */
function resolveUrl(url: string, baseUrl: string): string {
  try {
    return new URL(url, baseUrl).href;
  } catch {
    return url;
  }
}

/**
 * Extract colors from CSS and inline styles
 */
export function extractColors(css: string, html: string): string[] {
  const colors: string[] = [];

  // Regex to find hex colors, rgb, rgba, hsl, hsla
  const colorRegex = /(#[0-9A-Fa-f]{3,6}|rgba?\([^)]+\)|hsla?\([^)]+\))/g;

  const cssColors = css.match(colorRegex) || [];
  const htmlColors = html.match(colorRegex) || [];

  colors.push(...cssColors, ...htmlColors);

  // Remove duplicates and common defaults
  const uniqueColors = Array.from(new Set(colors))
    .filter((color) => {
      const lower = color.toLowerCase();
      return (
        lower !== '#ffffff' &&
        lower !== '#fff' &&
        lower !== '#000000' &&
        lower !== '#000' &&
        lower !== 'rgba(0,0,0,0)' &&
        lower !== 'transparent'
      );
    });

  return uniqueColors.slice(0, 10); // Return top 10 colors
}

/**
 * Extract font families from CSS
 */
export function extractFonts(css: string): string[] {
  const fonts: string[] = [];

  const fontFamilyRegex = /font-family:\s*([^;]+);/g;
  let match;

  while ((match = fontFamilyRegex.exec(css)) !== null) {
    fonts.push(match[1].trim());
  }

  // Remove duplicates
  const uniqueFonts = Array.from(new Set(fonts));

  return uniqueFonts.slice(0, 5); // Return top 5 fonts
}

/**
 * Detect if a URL is accessible
 */
export async function isUrlAccessible(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD', mode: 'no-cors' });
    return true;
  } catch {
    return false;
  }
}
