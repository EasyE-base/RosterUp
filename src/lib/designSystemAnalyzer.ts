/**
 * Design System Analyzer - Extract design tokens from cloned websites
 * Identifies colors, typography, spacing, and component patterns (UXMagic-style)
 */

import * as csstree from 'css-tree';

export interface ColorToken {
  value: string; // hex, rgb, hsl
  usage: 'primary' | 'secondary' | 'accent' | 'neutral' | 'text' | 'background';
  count: number; // how many times it appears
}

export interface TypographyToken {
  family: string;
  sizes: number[]; // unique font sizes in px
  weights: number[]; // font weights used
  lineHeights: string[];
}

export interface SpacingToken {
  type: 'margin' | 'padding' | 'gap';
  value: string; // e.g., "16px", "1rem"
  count: number;
}

export interface DesignTokens {
  colors: ColorToken[];
  typography: TypographyToken[];
  spacing: SpacingToken[];
  borderRadius: string[]; // common border-radius values
  shadows: string[]; // box-shadow values
}

export class DesignSystemAnalyzer {
  private html: string;
  private css: string;

  constructor(html: string, css: string) {
    this.html = html;
    this.css = css;
  }

  /**
   * Extract all design tokens
   */
  analyze(): DesignTokens {
    return {
      colors: this.extractColors(),
      typography: this.extractTypography(),
      spacing: this.extractSpacing(),
      borderRadius: this.extractBorderRadius(),
      shadows: this.extractShadows(),
    };
  }

  /**
   * Extract color palette with usage hints
   */
  private extractColors(): ColorToken[] {
    const colorMap = new Map<string, number>();
    const colorUsage = new Map<string, string[]>();

    // Regex for color formats
    const hexRegex = /#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})\b/g;
    const rgbRegex = /rgba?\([^)]+\)/g;
    const hslRegex = /hsla?\([^)]+\)/g;

    // Extract from CSS
    const extractFromText = (text: string, context: string = '') => {
      // Find hex colors
      let match;
      while ((match = hexRegex.exec(text)) !== null) {
        const color = this.normalizeColor(match[0]);
        colorMap.set(color, (colorMap.get(color) || 0) + 1);
        if (context) {
          if (!colorUsage.has(color)) colorUsage.set(color, []);
          colorUsage.get(color)!.push(context);
        }
      }

      // Find rgb/rgba
      while ((match = rgbRegex.exec(text)) !== null) {
        const color = this.normalizeColor(match[0]);
        colorMap.set(color, (colorMap.get(color) || 0) + 1);
        if (context) {
          if (!colorUsage.has(color)) colorUsage.set(color, []);
          colorUsage.get(color)!.push(context);
        }
      }

      // Find hsl/hsla
      while ((match = hslRegex.exec(text)) !== null) {
        const color = this.normalizeColor(match[0]);
        colorMap.set(color, (colorMap.get(color) || 0) + 1);
        if (context) {
          if (!colorUsage.has(color)) colorUsage.set(color, []);
          colorUsage.get(color)!.push(context);
        }
      }
    };

    extractFromText(this.css);
    extractFromText(this.html);

    // Convert to array and sort by usage
    const colors = Array.from(colorMap.entries())
      .map(([value, count]) => ({
        value,
        count,
        usage: this.guessColorUsage(value, colorUsage.get(value) || []),
      }))
      .filter(c => !this.isCommonColor(c.value)) // Remove white, black, transparent
      .sort((a, b) => b.count - a.count)
      .slice(0, 12); // Top 12 colors

    return colors;
  }

  /**
   * Normalize color to consistent format
   */
  private normalizeColor(color: string): string {
    color = color.toLowerCase().trim();

    // Expand 3-char hex to 6-char
    if (color.match(/^#[0-9a-f]{3}$/)) {
      color = `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`;
    }

    // Normalize rgb/rgba spacing
    color = color.replace(/\s+/g, '');

    return color;
  }

  /**
   * Guess if color is primary, secondary, etc. based on usage
   */
  private guessColorUsage(color: string, contexts: string[]): ColorToken['usage'] {
    const contextStr = contexts.join(' ').toLowerCase();

    if (contextStr.includes('background') || contextStr.includes('bg-')) return 'background';
    if (contextStr.includes('text') || contextStr.includes('color:')) return 'text';
    if (contextStr.includes('button') || contextStr.includes('btn')) return 'primary';
    if (contextStr.includes('border')) return 'neutral';
    if (contextStr.includes('accent') || contextStr.includes('highlight')) return 'accent';

    // Guess based on saturation/lightness if it's a bright color
    if (color.startsWith('hsl')) {
      const satMatch = color.match(/(\d+)%/);
      if (satMatch && parseInt(satMatch[1]) > 70) return 'accent';
    }

    return 'neutral';
  }

  /**
   * Check if color is a common default (white, black, transparent)
   */
  private isCommonColor(color: string): boolean {
    const common = [
      '#ffffff', '#fff',
      '#000000', '#000',
      'rgb(0,0,0)', 'rgba(0,0,0,1)',
      'rgb(255,255,255)', 'rgba(255,255,255,1)',
      'transparent', 'rgba(0,0,0,0)',
    ];
    return common.includes(color);
  }

  /**
   * Extract typography patterns
   */
  private extractTypography(): TypographyToken[] {
    const fontFamilies = new Map<string, { sizes: Set<number>, weights: Set<number>, lineHeights: Set<string> }>();

    // Parse CSS with css-tree
    try {
      const ast = csstree.parse(this.css);

      csstree.walk(ast, (node) => {
        if (node.type === 'Declaration') {
          const property = (node as any).property;
          const value = csstree.generate(node.value);

          if (property === 'font-family') {
            const family = value.replace(/['"]/g, '').split(',')[0].trim();
            if (!fontFamilies.has(family)) {
              fontFamilies.set(family, { sizes: new Set(), weights: new Set(), lineHeights: new Set() });
            }
          }

          if (property === 'font-size') {
            const pxValue = this.convertToPixels(value);
            if (pxValue) {
              // Add to all families (we'll refine this later)
              fontFamilies.forEach(data => data.sizes.add(pxValue));
            }
          }

          if (property === 'font-weight') {
            const weight = parseInt(value) || (value === 'bold' ? 700 : 400);
            fontFamilies.forEach(data => data.weights.add(weight));
          }

          if (property === 'line-height') {
            fontFamilies.forEach(data => data.lineHeights.add(value));
          }
        }
      });
    } catch (e) {
      console.warn('CSS parsing failed:', e);
    }

    // Convert to array
    return Array.from(fontFamilies.entries()).map(([family, data]) => ({
      family,
      sizes: Array.from(data.sizes).sort((a, b) => a - b),
      weights: Array.from(data.weights).sort((a, b) => a - b),
      lineHeights: Array.from(data.lineHeights),
    }));
  }

  /**
   * Extract spacing patterns (margins, paddings, gaps)
   */
  private extractSpacing(): SpacingToken[] {
    const spacingMap = new Map<string, { type: SpacingToken['type'], count: number }>();

    try {
      const ast = csstree.parse(this.css);

      csstree.walk(ast, (node) => {
        if (node.type === 'Declaration') {
          const property = (node as any).property;
          const value = csstree.generate(node.value);

          let type: SpacingToken['type'] | null = null;
          if (property.startsWith('margin')) type = 'margin';
          else if (property.startsWith('padding')) type = 'padding';
          else if (property === 'gap') type = 'gap';

          if (type) {
            const spacings = value.split(/\s+/);
            spacings.forEach(spacing => {
              if (spacing && spacing !== '0' && spacing !== 'auto') {
                const key = `${type}:${spacing}`;
                const existing = spacingMap.get(spacing);
                if (existing) {
                  existing.count++;
                } else {
                  spacingMap.set(spacing, { type, count: 1 });
                }
              }
            });
          }
        }
      });
    } catch (e) {
      console.warn('CSS parsing failed:', e);
    }

    return Array.from(spacingMap.entries())
      .map(([value, data]) => ({ value, type: data.type, count: data.count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20); // Top 20 spacing values
  }

  /**
   * Extract border-radius patterns
   */
  private extractBorderRadius(): string[] {
    const radiusSet = new Set<string>();

    try {
      const ast = csstree.parse(this.css);

      csstree.walk(ast, (node) => {
        if (node.type === 'Declaration') {
          const property = (node as any).property;
          const value = csstree.generate(node.value);

          if (property.includes('border-radius')) {
            value.split(/\s+/).forEach(v => {
              if (v && v !== '0') radiusSet.add(v);
            });
          }
        }
      });
    } catch (e) {
      console.warn('CSS parsing failed:', e);
    }

    return Array.from(radiusSet).slice(0, 10);
  }

  /**
   * Extract box-shadow patterns
   */
  private extractShadows(): string[] {
    const shadowSet = new Set<string>();

    try {
      const ast = csstree.parse(this.css);

      csstree.walk(ast, (node) => {
        if (node.type === 'Declaration') {
          const property = (node as any).property;
          const value = csstree.generate(node.value);

          if (property === 'box-shadow' || property === 'filter') {
            if (value !== 'none') shadowSet.add(value);
          }
        }
      });
    } catch (e) {
      console.warn('CSS parsing failed:', e);
    }

    return Array.from(shadowSet).slice(0, 8);
  }

  /**
   * Convert font-size to pixels (approximate)
   */
  private convertToPixels(value: string): number | null {
    if (value.endsWith('px')) {
      return parseFloat(value);
    } else if (value.endsWith('rem')) {
      return parseFloat(value) * 16; // Assume 16px base
    } else if (value.endsWith('em')) {
      return parseFloat(value) * 16; // Simplified
    } else if (value.endsWith('pt')) {
      return parseFloat(value) * 1.333; // Convert pt to px
    }
    return null;
  }

  /**
   * Generate theme suggestion (for rebranding)
   */
  generateThemeSuggestion(primaryColor: string, secondaryColor: string): { [key: string]: string } {
    const tokens = this.analyze();
    const colorMap: { [key: string]: string } = {};

    // Map old primary to new primary
    if (tokens.colors.length > 0) {
      colorMap[tokens.colors[0].value] = primaryColor;
    }

    if (tokens.colors.length > 1) {
      colorMap[tokens.colors[1].value] = secondaryColor;
    }

    return colorMap;
  }
}
