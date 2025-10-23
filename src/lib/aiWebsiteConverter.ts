/**
 * AI-Powered Website Converter
 * Uses AI to intelligently convert HTML to RosterUp blocks and sections
 */

import { WebsiteContentBlock, WebsiteSection } from './supabase';
import { WebsiteData } from './websiteImporter';
import { DesignSystem } from '../components/website-builder/DesignSystemPanel';

export interface ConversionResult {
  sections: Omit<WebsiteSection, 'id' | 'page_id' | 'created_at' | 'updated_at'>[];
  blocks: Omit<WebsiteContentBlock, 'id' | 'page_id' | 'created_at' | 'updated_at'>[];
  designSystem: Partial<DesignSystem>;
}

/**
 * Convert website data to RosterUp format using AI
 * This is a smart converter that analyzes the HTML structure
 */
export async function convertWebsiteWithAI(
  websiteData: WebsiteData
): Promise<ConversionResult> {
  // In a real implementation, this would call a backend API that uses Claude/GPT-4
  // For now, we'll use intelligent parsing rules

  const sections: ConversionResult['sections'] = [];
  const blocks: ConversionResult['blocks'] = [];

  // Parse the HTML
  const parser = new DOMParser();
  const doc = parser.parseFromString(websiteData.html, 'text/html');

  // Extract design system first
  const designSystem = extractDesignSystem(websiteData, doc);

  // Analyze structure and create sections
  let orderIndex = 0;

  // 1. Check for header/navbar
  const header = doc.querySelector('header, nav, [role="banner"], [class*="header"], [class*="navbar"]');
  if (header) {
    const headerSection = createSectionFromElement(header, 'header', orderIndex++);
    sections.push(headerSection);

    const headerBlocks = extractBlocksFromElement(header, headerSection.order_index);
    blocks.push(...headerBlocks);
  }

  // 2. Look for hero section
  const hero = doc.querySelector(
    '[class*="hero"], [class*="banner"], [class*="jumbotron"], .hero, .banner'
  );
  if (hero) {
    const heroSection = createSectionFromElement(hero, 'content', orderIndex++);
    sections.push(heroSection);

    const heroBlocks = extractBlocksFromElement(hero, heroSection.order_index);
    blocks.push(...heroBlocks);
  }

  // 3. Main content sections
  const mainContent = doc.querySelector('main, [role="main"], #content, .content');
  if (mainContent) {
    // Split main content into logical sections
    const contentSections = mainContent.querySelectorAll('section, article, [class*="section"]');

    if (contentSections.length > 0) {
      contentSections.forEach((section) => {
        const contentSection = createSectionFromElement(section, 'content', orderIndex++);
        sections.push(contentSection);

        const contentBlocks = extractBlocksFromElement(section, contentSection.order_index);
        blocks.push(...contentBlocks);
      });
    } else {
      // No sections found, treat entire main as one section
      const contentSection = createSectionFromElement(mainContent, 'content', orderIndex++);
      sections.push(contentSection);

      const contentBlocks = extractBlocksFromElement(mainContent, contentSection.order_index);
      blocks.push(...contentBlocks);
    }
  }

  // 4. Footer
  const footer = doc.querySelector('footer, [role="contentinfo"], [class*="footer"]');
  if (footer) {
    const footerSection = createSectionFromElement(footer, 'footer', orderIndex++);
    sections.push(footerSection);

    const footerBlocks = extractBlocksFromElement(footer, footerSection.order_index);
    blocks.push(...footerBlocks);
  }

  // If no sections were created, create a default content section
  if (sections.length === 0) {
    sections.push({
      name: 'Main Content',
      section_type: 'content',
      order_index: 0,
      full_width: false,
      styles: {},
    });

    // Extract all blocks from body
    blocks.push(...extractBlocksFromElement(doc.body, 0));
  }

  return {
    sections,
    blocks,
    designSystem,
  };
}

/**
 * Create a section from an HTML element
 */
function createSectionFromElement(
  element: Element,
  type: 'header' | 'content' | 'footer',
  orderIndex: number
): ConversionResult['sections'][0] {
  const computedStyles = window.getComputedStyle(element);

  return {
    name: getSectionName(element, type),
    section_type: type,
    background_color: extractBackgroundColor(computedStyles),
    order_index: orderIndex,
    full_width: isFullWidth(element),
    styles: {},
  };
}

/**
 * Extract blocks from an HTML element
 */
function extractBlocksFromElement(
  element: Element,
  sectionIndex: number
): Omit<WebsiteContentBlock, 'id' | 'page_id' | 'created_at' | 'updated_at'>[] {
  const blocks: ConversionResult['blocks'] = [];
  let blockOrder = 0;

  // Process child elements
  const processNode = (node: Element) => {
    const tagName = node.tagName.toLowerCase();
    const className = node.className.toString().toLowerCase();

    // Headings
    if (/^h[1-6]$/.test(tagName)) {
      blocks.push({
        block_type: 'heading',
        content: {
          text: node.textContent?.trim() || '',
          level: tagName,
        },
        styles: extractStyles(node),
        visibility: { desktop: true, tablet: true, mobile: true },
        order_index: blockOrder++,
        section_id: undefined,
      });
    }
    // Paragraphs
    else if (tagName === 'p') {
      const text = node.textContent?.trim();
      if (text && text.length > 0) {
        blocks.push({
          block_type: 'paragraph',
          content: { text },
          styles: extractStyles(node),
          visibility: { desktop: true, tablet: true, mobile: true },
          order_index: blockOrder++,
          section_id: undefined,
        });
      }
    }
    // Images
    else if (tagName === 'img') {
      const img = node as HTMLImageElement;
      blocks.push({
        block_type: 'image',
        content: {
          url: img.src,
          alt: img.alt || '',
          caption: img.title || '',
        },
        styles: extractStyles(node),
        visibility: { desktop: true, tablet: true, mobile: true },
        order_index: blockOrder++,
        section_id: undefined,
      });
    }
    // Buttons/CTAs
    else if (tagName === 'button' || (tagName === 'a' && className.includes('btn'))) {
      const link = node as HTMLAnchorElement;
      blocks.push({
        block_type: 'button',
        content: {
          text: node.textContent?.trim() || 'Button',
          url: link.href || '#',
          style: 'primary',
        },
        styles: extractStyles(node),
        visibility: { desktop: true, tablet: true, mobile: true },
        order_index: blockOrder++,
        section_id: undefined,
      });
    }
    // Lists
    else if (tagName === 'ul' || tagName === 'ol') {
      const items: string[] = [];
      node.querySelectorAll('li').forEach((li) => {
        const text = li.textContent?.trim();
        if (text) items.push(text);
      });

      if (items.length > 0) {
        blocks.push({
          block_type: tagName === 'ul' ? 'list' : 'numbered-list',
          content: { items, style: tagName === 'ul' ? 'disc' : 'decimal' },
          styles: extractStyles(node),
          visibility: { desktop: true, tablet: true, mobile: true },
          order_index: blockOrder++,
          section_id: undefined,
        });
      }
    }
    // Blockquote
    else if (tagName === 'blockquote') {
      blocks.push({
        block_type: 'quote',
        content: {
          text: node.textContent?.trim() || '',
          author: '',
        },
        styles: extractStyles(node),
        visibility: { desktop: true, tablet: true, mobile: true },
        order_index: blockOrder++,
        section_id: undefined,
      });
    }
    // Forms
    else if (tagName === 'form') {
      blocks.push({
        block_type: 'contact-form',
        content: {
          fields: ['name', 'email', 'message'],
          submitText: 'Send Message',
        },
        styles: extractStyles(node),
        visibility: { desktop: true, tablet: true, mobile: true },
        order_index: blockOrder++,
        section_id: undefined,
      });
    }
    // Container elements - recursively process children
    else if (['div', 'section', 'article', 'aside', 'nav'].includes(tagName)) {
      Array.from(node.children).forEach((child) => {
        if (child instanceof Element) {
          processNode(child);
        }
      });
    }
  };

  // Process all children
  Array.from(element.children).forEach((child) => {
    if (child instanceof Element) {
      processNode(child);
    }
  });

  return blocks;
}

/**
 * Extract design system from website
 */
function extractDesignSystem(websiteData: WebsiteData, doc: Document): Partial<DesignSystem> {
  const bodyStyles = window.getComputedStyle(doc.body);

  // Extract colors (simplified - in real app, use AI to find brand colors)
  const colors = extractColorsFromCSS(websiteData.css);

  // Extract fonts
  const fonts = extractFontsFromCSS(websiteData.css, bodyStyles);

  return {
    colors: {
      primary: colors[0] || '#3b82f6',
      secondary: colors[1] || '#8b5cf6',
      accent: colors[2] || '#10b981',
      text: {
        heading: '#111827',
        body: '#374151',
        muted: '#6b7280',
      },
      background: {
        light: '#ffffff',
        dark: '#1f2937',
        gray: '#f3f4f6',
      },
      customPalette: colors.slice(3).map((color, i) => ({ name: `Color ${i + 1}`, color })),
    },
    typography: {
      headingFont: fonts.heading || 'Inter, sans-serif',
      bodyFont: fonts.body || 'Inter, sans-serif',
      baseFontSize: '16px',
      scaleRatio: 1.25,
      lineHeight: { tight: '1.25', normal: '1.5', relaxed: '1.75' },
      letterSpacing: { tight: '-0.025em', normal: '0', wide: '0.025em' },
      fontWeights: { light: '300', normal: '400', medium: '500', semibold: '600', bold: '700' },
    },
  };
}

// Helper functions
function getSectionName(element: Element, type: string): string {
  const id = element.id;
  const className = element.className.toString();

  if (id) return id.charAt(0).toUpperCase() + id.slice(1);
  if (className) {
    const firstClass = className.split(' ')[0];
    return firstClass.charAt(0).toUpperCase() + firstClass.slice(1);
  }

  return type.charAt(0).toUpperCase() + type.slice(1);
}

function extractBackgroundColor(styles: CSSStyleDeclaration): string | undefined {
  const bg = styles.backgroundColor;
  if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
    return bg;
  }
  return undefined;
}

function isFullWidth(element: Element): boolean {
  const styles = window.getComputedStyle(element);
  return styles.width === '100%' || styles.maxWidth === 'none';
}

function extractStyles(element: Element): any {
  const styles = window.getComputedStyle(element);
  return {
    textAlign: styles.textAlign !== 'start' ? styles.textAlign : undefined,
    color: styles.color,
    fontSize: styles.fontSize,
    fontWeight: styles.fontWeight,
    marginBottom: styles.marginBottom,
  };
}

function extractColorsFromCSS(css: string): string[] {
  const colorRegex = /#([0-9A-Fa-f]{3}){1,2}\b/g;
  const matches = css.match(colorRegex) || [];
  return Array.from(new Set(matches)).slice(0, 6);
}

function extractFontsFromCSS(
  css: string,
  bodyStyles: CSSStyleDeclaration
): { heading: string; body: string } {
  const bodyFont = bodyStyles.fontFamily || 'Inter, sans-serif';

  // Try to find heading font
  const headingFontMatch = css.match(/h[1-6][^}]*font-family:\s*([^;]+)/);
  const headingFont = headingFontMatch ? headingFontMatch[1].trim() : bodyFont;

  return {
    heading: headingFont,
    body: bodyFont,
  };
}
