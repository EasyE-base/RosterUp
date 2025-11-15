export interface ElementStyles {
  // Typography
  fontFamily?: string;
  fontSize?: string;
  fontWeight?: string;
  lineHeight?: string;
  letterSpacing?: string;
  textAlign?: string;
  color?: string;

  // Colors
  backgroundColor?: string;
  borderColor?: string;

  // Layout
  width?: string;
  height?: string;
  minWidth?: string;
  minHeight?: string;
  maxWidth?: string;
  maxHeight?: string;
  display?: string;
  padding?: string;
  paddingTop?: string;
  paddingRight?: string;
  paddingBottom?: string;
  paddingLeft?: string;
  margin?: string;
  marginTop?: string;
  marginRight?: string;
  marginBottom?: string;
  marginLeft?: string;

  // Effects
  boxShadow?: string;
  borderRadius?: string;
  opacity?: string;
  transform?: string;
  borderWidth?: string;
  borderStyle?: string;
}

/**
 * Extract computed styles from a DOM element
 */
export function extractElementStyles(element: HTMLElement): ElementStyles {
  const computed = window.getComputedStyle(element);

  const styles: ElementStyles = {
    // Typography
    fontFamily: computed.fontFamily,
    fontSize: computed.fontSize,
    fontWeight: computed.fontWeight,
    lineHeight: computed.lineHeight,
    letterSpacing: computed.letterSpacing,
    textAlign: computed.textAlign,
    color: computed.color,

    // Colors
    backgroundColor: computed.backgroundColor,
    borderColor: computed.borderColor,

    // Layout
    width: computed.width !== 'auto' ? computed.width : undefined,
    height: computed.height !== 'auto' ? computed.height : undefined,
    minWidth: computed.minWidth !== '0px' ? computed.minWidth : undefined,
    minHeight: computed.minHeight !== '0px' ? computed.minHeight : undefined,
    maxWidth: computed.maxWidth !== 'none' ? computed.maxWidth : undefined,
    maxHeight: computed.maxHeight !== 'none' ? computed.maxHeight : undefined,
    display: computed.display,
    padding: computed.padding,
    paddingTop: computed.paddingTop,
    paddingRight: computed.paddingRight,
    paddingBottom: computed.paddingBottom,
    paddingLeft: computed.paddingLeft,
    margin: computed.margin,
    marginTop: computed.marginTop,
    marginRight: computed.marginRight,
    marginBottom: computed.marginBottom,
    marginLeft: computed.marginLeft,

    // Effects
    boxShadow: computed.boxShadow !== 'none' ? computed.boxShadow : undefined,
    borderRadius: computed.borderRadius,
    opacity: computed.opacity !== '1' ? computed.opacity : undefined,
    transform: computed.transform !== 'none' ? computed.transform : undefined,
    borderWidth: computed.borderWidth,
    borderStyle: computed.borderStyle,
  };

  // Filter out undefined values
  return Object.fromEntries(
    Object.entries(styles).filter(([_, value]) => value !== undefined)
  ) as ElementStyles;
}

/**
 * Apply styles to a DOM element
 */
export function applyStylesToElement(element: HTMLElement, styles: ElementStyles): void {
  Object.entries(styles).forEach(([property, value]) => {
    if (value !== undefined) {
      // Convert camelCase to kebab-case for CSS properties
      const cssProperty = property.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
      element.style.setProperty(cssProperty, value);
    }
  });
}

/**
 * Remove specific styles from an element (reset to default)
 */
export function removeElementStyles(element: HTMLElement, properties: (keyof ElementStyles)[]): void {
  properties.forEach((property) => {
    const cssProperty = property.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
    element.style.removeProperty(cssProperty);
  });
}

/**
 * Get inline styles from an element (not computed, just what's set inline)
 */
export function getInlineStyles(element: HTMLElement): ElementStyles {
  const styles: ElementStyles = {};

  const inlineStyle = element.style;

  // Typography
  if (inlineStyle.fontFamily) styles.fontFamily = inlineStyle.fontFamily;
  if (inlineStyle.fontSize) styles.fontSize = inlineStyle.fontSize;
  if (inlineStyle.fontWeight) styles.fontWeight = inlineStyle.fontWeight;
  if (inlineStyle.lineHeight) styles.lineHeight = inlineStyle.lineHeight;
  if (inlineStyle.letterSpacing) styles.letterSpacing = inlineStyle.letterSpacing;
  if (inlineStyle.textAlign) styles.textAlign = inlineStyle.textAlign;
  if (inlineStyle.color) styles.color = inlineStyle.color;

  // Colors
  if (inlineStyle.backgroundColor) styles.backgroundColor = inlineStyle.backgroundColor;
  if (inlineStyle.borderColor) styles.borderColor = inlineStyle.borderColor;

  // Layout
  if (inlineStyle.width) styles.width = inlineStyle.width;
  if (inlineStyle.height) styles.height = inlineStyle.height;
  if (inlineStyle.minWidth) styles.minWidth = inlineStyle.minWidth;
  if (inlineStyle.minHeight) styles.minHeight = inlineStyle.minHeight;
  if (inlineStyle.maxWidth) styles.maxWidth = inlineStyle.maxWidth;
  if (inlineStyle.maxHeight) styles.maxHeight = inlineStyle.maxHeight;
  if (inlineStyle.display) styles.display = inlineStyle.display;
  if (inlineStyle.padding) styles.padding = inlineStyle.padding;
  if (inlineStyle.paddingTop) styles.paddingTop = inlineStyle.paddingTop;
  if (inlineStyle.paddingRight) styles.paddingRight = inlineStyle.paddingRight;
  if (inlineStyle.paddingBottom) styles.paddingBottom = inlineStyle.paddingBottom;
  if (inlineStyle.paddingLeft) styles.paddingLeft = inlineStyle.paddingLeft;
  if (inlineStyle.margin) styles.margin = inlineStyle.margin;
  if (inlineStyle.marginTop) styles.marginTop = inlineStyle.marginTop;
  if (inlineStyle.marginRight) styles.marginRight = inlineStyle.marginRight;
  if (inlineStyle.marginBottom) styles.marginBottom = inlineStyle.marginBottom;
  if (inlineStyle.marginLeft) styles.marginLeft = inlineStyle.marginLeft;

  // Effects
  if (inlineStyle.boxShadow) styles.boxShadow = inlineStyle.boxShadow;
  if (inlineStyle.borderRadius) styles.borderRadius = inlineStyle.borderRadius;
  if (inlineStyle.opacity) styles.opacity = inlineStyle.opacity;
  if (inlineStyle.transform) styles.transform = inlineStyle.transform;
  if (inlineStyle.borderWidth) styles.borderWidth = inlineStyle.borderWidth;
  if (inlineStyle.borderStyle) styles.borderStyle = inlineStyle.borderStyle;

  return styles;
}

/**
 * Convert RGB/RGBA color to hex
 */
export function rgbToHex(rgb: string): string {
  const match = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)$/);
  if (!match) return rgb;

  const r = parseInt(match[1]).toString(16).padStart(2, '0');
  const g = parseInt(match[2]).toString(16).padStart(2, '0');
  const b = parseInt(match[3]).toString(16).padStart(2, '0');

  return `#${r}${g}${b}`;
}

/**
 * Parse pixel value to number
 */
export function pxToNumber(px: string | undefined): number | undefined {
  if (!px || px === 'auto') return undefined;
  const match = px.match(/^([\d.]+)px$/);
  return match ? parseFloat(match[1]) : undefined;
}

/**
 * Convert number to pixel value
 */
export function numberToPx(value: number): string {
  return `${value}px`;
}
