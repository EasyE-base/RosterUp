/**
 * HTML Sanitization for Cloned Websites
 * Extracts and cleans WordPress/Beaver Builder HTML for safe iframe rendering
 * V2.0: Enhanced with DOMPurify for additional security
 */

import DOMPurify from 'dompurify';

// Allowed scripts for layout preservation
const ALLOWED_SCRIPTS = [
  'jquery',
  'bb-plugin',
  'bb-theme',
  'bootstrap',
  'theme.min.js',
  'layout.js',
];

export interface SanitizeResult {
  headHTML: string;
  bodyHTML: string;
}

/**
 * Sanitize cloned HTML by removing external scripts, trackers, and malicious code
 * while preserving layout scripts and stylesheets
 */
export function sanitizeClonedHTML(html: string): SanitizeResult {
  let headHTML = '';
  let bodyHTML = '';

  // Extract head and body content separately
  const headMatch = html.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);

  if (headMatch) {
    console.log(`📦 Extracting head content (${headMatch[1].length} chars)`);
    headHTML = headMatch[1];
  }

  if (bodyMatch) {
    console.log(`📦 Extracting body content (${bodyMatch[1].length} chars)`);
    bodyHTML = bodyMatch[1];
  } else {
    // No body tag found, use entire HTML as body
    bodyHTML = html;
  }

  // ===== HEAD SANITIZATION =====

  // Remove all scripts from head
  headHTML = headHTML.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');

  // Remove meta tags that might interfere
  headHTML = headHTML.replace(/<meta[^>]*>/gi, '');

  // ===== BODY SANITIZATION =====

  // Step 1: Remove inline event handlers (XSS prevention)
  bodyHTML = bodyHTML.replace(/\son\w+\s*=\s*["'][^"']*["']/gi, '');

  // Step 2: Remove external script tags (keep layout scripts only)
  bodyHTML = bodyHTML.replace(
    /<script[^>]*\ssrc=["']([^"']+)["'][^>]*>[\s\S]*?<\/script>/gi,
    (match, src) => {
      // Keep essential layout scripts
      if (src && ALLOWED_SCRIPTS.some((allowed) => src.includes(allowed))) {
        console.log(`✅ Keeping layout script: ${src.substring(0, 80)}...`);
        return match;
      }

      // Remove external and WordPress scripts
      if (
        src &&
        (src.includes('wp-admin') ||
          src.includes('wp-includes') ||
          src.includes('cloudflare') ||
          src.includes('googleapis.com') ||
          src.includes('gstatic.com') ||
          src.includes('youtube.com') ||
          src.startsWith('http://') ||
          src.startsWith('https://') ||
          src.startsWith('//'))
      ) {
        console.log(`🧹 Removing external script: ${src.substring(0, 80)}...`);
        return '';
      }

      return match;
    }
  );

  // Step 3: Remove 3rd-party trackers and analytics
  bodyHTML = bodyHTML.replace(
    /<script[^>]*google-analytics[^>]*>[\s\S]*?<\/script>/gi,
    ''
  );
  bodyHTML = bodyHTML.replace(/<script[^>]*gtag[^>]*>[\s\S]*?<\/script>/gi, '');
  bodyHTML = bodyHTML.replace(
    /<script[^>]*facebook[^>]*>[\s\S]*?<\/script>/gi,
    ''
  );
  bodyHTML = bodyHTML.replace(/<script[^>]*fbevents[^>]*>[\s\S]*?<\/script>/gi, '');

  // Step 4: Remove noscript tags
  bodyHTML = bodyHTML.replace(/<noscript[\s\S]*?<\/noscript>/gi, '');

  // Step 5: Fix lazy-loaded images
  console.log('🔍 Starting image sanitization...');
  let imageCount = 0;
  let placeholderCount = 0;
  let smushStylesRemoved = 0;

  bodyHTML = bodyHTML.replace(/<img([^>]*?)\/?>/gi, (match, attrs) => {
    imageCount++;

    // CRITICAL: Fix Supabase lazyload images FIRST
    let srcMatch = attrs.match(/src="([^"]*)"/i);
    let dataSrcMatch = attrs.match(/data-src="([^"]*)"/i);

    const srcVal = srcMatch ? srcMatch[1] : '';
    const dataSrcVal = dataSrcMatch ? dataSrcMatch[1] : '';

    const hasSupabase =
      srcVal.toLowerCase().includes('supabase.co') ||
      dataSrcVal.toLowerCase().includes('supabase.co');

    if (hasSupabase) {
      const trueSrc = dataSrcVal || srcVal;
      const fixedAttrs = attrs
        .replace(/\sclass="[^"]*\blazyload\b[^"]*"/i, '')
        .replace(/\sdata-src="[^"]*"/i, '')
        .replace(/src="[^"]*"/i, `src="${trueSrc}"`);

      console.log('🛡️ Normalizing Supabase lazyload image → direct src');
      return `<img${fixedAttrs}>`;
    }

    // Remove WP Smush inline styles
    let cleanedAttrs = attrs;
    if (attrs.includes('--smush-placeholder')) {
      cleanedAttrs = attrs.replace(/style=["']([^"']*)["']/gi, (styleMatch, styleContent) => {
        if (styleContent.includes('--smush-placeholder')) {
          smushStylesRemoved++;
          return '';
        }
        return styleMatch;
      });
    }

    // Re-check after cleaning
    dataSrcMatch = cleanedAttrs.match(/data-src=["']([^"']+)["']/i);
    const dataSrcsetMatch = cleanedAttrs.match(/data-srcset=["']([^"']+)["']/i);
    srcMatch = cleanedAttrs.match(/src="([^"]*)"/i);

    const isPlaceholder = srcMatch && srcMatch[1].startsWith('data:image/svg+xml');

    if (isPlaceholder) {
      placeholderCount++;
    }

    if (dataSrcMatch) {
      const dataSrcIsPlaceholder = dataSrcMatch[1].startsWith('data:image/svg+xml');

      if (dataSrcIsPlaceholder) {
        console.log(`⚠️ Skipping image #${imageCount} - data-src contains placeholder SVG`);
        return `<img${cleanedAttrs}>`;
      }

      let newAttrs = cleanedAttrs;

      // Replace src with data-src value
      if (srcMatch) {
        newAttrs = newAttrs.replace(/(?:^|\s)src=["'][^"']*["']/i, ` src="${dataSrcMatch[1]}"`);
      } else {
        newAttrs = `src="${dataSrcMatch[1]}" ${newAttrs}`;
      }

      // Replace srcset if exists
      if (dataSrcsetMatch) {
        const srcsetMatch = cleanedAttrs.match(/(?:^|\s)srcset=["']([^"']+)["']/i);
        if (srcsetMatch) {
          newAttrs = newAttrs.replace(/(?:^|\s)srcset=["'][^"']*["']/i, ` srcset="${dataSrcsetMatch[1]}"`);
        } else {
          newAttrs = `${newAttrs} srcset="${dataSrcsetMatch[1]}"`;
        }
      }

      // Remove lazyload class
      newAttrs = newAttrs.replace(/class=["']([^"']*)lazyload([^"']*)["']/gi, (m, before, after) => {
        const cleaned = `${before}${after}`.trim();
        return cleaned ? `class="${cleaned}"` : '';
      });

      // Remove data attributes
      newAttrs = newAttrs.replace(/data-src=["'][^"']*["']/gi, '');
      newAttrs = newAttrs.replace(/data-srcset=["'][^"']*["']/gi, '');

      return `<img${newAttrs}>`;
    }

    return `<img${cleanedAttrs}>`;
  });

  console.log(
    `✅ Image sanitization complete: ${imageCount} images, ${placeholderCount} placeholders, ${smushStylesRemoved} WP Smush styles removed`
  );

  // ===== FINAL PASS: DOMPurify =====

  // Sanitize head with DOMPurify
  headHTML = DOMPurify.sanitize(headHTML, {
    ALLOWED_TAGS: ['style', 'link'],
    ALLOWED_ATTR: ['href', 'rel', 'type', 'media'],
  });

  // Sanitize body with DOMPurify
  bodyHTML = DOMPurify.sanitize(bodyHTML, {
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur'],
    ADD_TAGS: ['iframe'], // Allow iframes (for embedded content)
    ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling'],
  });

  console.log('✅ DOMPurify final sanitization complete');

  return { headHTML, bodyHTML };
}
