/**
 * Responsive Style Manager - Handle styles across different breakpoints
 * Enables UXMagic-style responsive editing (desktop, tablet, mobile)
 */

export type Breakpoint = 'desktop' | 'tablet' | 'mobile';

export interface BreakpointConfig {
  name: Breakpoint;
  width: number;
  height: number;
  icon: string;
  label: string;
}

export const BREAKPOINTS: Record<Breakpoint, BreakpointConfig> = {
  desktop: {
    name: 'desktop',
    width: 1440,
    height: 900,
    icon: '🖥️',
    label: 'Desktop',
  },
  tablet: {
    name: 'tablet',
    width: 768,
    height: 1024,
    icon: '📱',
    label: 'Tablet',
  },
  mobile: {
    name: 'mobile',
    width: 375,
    height: 667,
    icon: '📱',
    label: 'Mobile',
  },
};

export interface ResponsiveStyle {
  property: string;
  values: {
    desktop?: string;
    tablet?: string;
    mobile?: string;
  };
}

export class ResponsiveStyleManager {
  private iframe: HTMLIFrameElement;
  private currentBreakpoint: Breakpoint = 'desktop';
  private responsiveStyles: Map<string, ResponsiveStyle[]> = new Map();

  constructor(iframe: HTMLIFrameElement) {
    this.iframe = iframe;
  }

  /**
   * Set the current breakpoint and resize iframe
   */
  setBreakpoint(breakpoint: Breakpoint) {
    this.currentBreakpoint = breakpoint;
    const config = BREAKPOINTS[breakpoint];

    // Resize iframe container
    const iframeContainer = this.iframe.parentElement;
    if (iframeContainer) {
      // Center the iframe and apply width/height
      iframeContainer.style.display = 'flex';
      iframeContainer.style.justifyContent = 'center';
      iframeContainer.style.alignItems = 'flex-start';
      iframeContainer.style.paddingTop = '20px';
      iframeContainer.style.backgroundColor = '#f1f5f9';

      this.iframe.style.width = `${config.width}px`;
      this.iframe.style.height = `${config.height}px`;
      this.iframe.style.maxWidth = '100%';
      this.iframe.style.border = '1px solid #cbd5e1';
      this.iframe.style.borderRadius = '8px';
      this.iframe.style.boxShadow = '0 10px 40px rgba(0,0,0,0.1)';
      this.iframe.style.backgroundColor = 'white';
    }

    // Apply responsive styles for this breakpoint
    this.applyBreakpointStyles(breakpoint);

    console.log(`📐 Switched to ${breakpoint} view (${config.width}x${config.height})`);
  }

  /**
   * Reset to full-width desktop view
   */
  resetToFullWidth() {
    this.currentBreakpoint = 'desktop';

    const iframeContainer = this.iframe.parentElement;
    if (iframeContainer) {
      iframeContainer.style.display = 'block';
      iframeContainer.style.padding = '0';
      iframeContainer.style.backgroundColor = 'transparent';

      this.iframe.style.width = '100%';
      this.iframe.style.height = '100%';
      this.iframe.style.maxWidth = 'none';
      this.iframe.style.border = 'none';
      this.iframe.style.borderRadius = '0';
      this.iframe.style.boxShadow = 'none';
    }
  }

  /**
   * Get current breakpoint
   */
  getCurrentBreakpoint(): Breakpoint {
    return this.currentBreakpoint;
  }

  /**
   * Set responsive style for an element
   */
  setResponsiveStyle(
    selector: string,
    property: string,
    value: string,
    breakpoint?: Breakpoint
  ) {
    const targetBreakpoint = breakpoint || this.currentBreakpoint;

    // Get or create responsive styles for this selector
    if (!this.responsiveStyles.has(selector)) {
      this.responsiveStyles.set(selector, []);
    }

    const styles = this.responsiveStyles.get(selector)!;
    let styleEntry = styles.find((s) => s.property === property);

    if (!styleEntry) {
      styleEntry = {
        property,
        values: {},
      };
      styles.push(styleEntry);
    }

    // Set the value for this breakpoint
    styleEntry.values[targetBreakpoint] = value;

    // Apply the style immediately if we're on this breakpoint
    if (targetBreakpoint === this.currentBreakpoint) {
      this.applyStyleToElement(selector, property, value);
    }

    console.log(`✓ Set ${property}: ${value} for ${selector} at ${targetBreakpoint}`);
  }

  /**
   * Get responsive styles for a selector
   */
  getResponsiveStyles(selector: string): ResponsiveStyle[] {
    return this.responsiveStyles.get(selector) || [];
  }

  /**
   * Apply breakpoint-specific styles to all elements
   */
  private applyBreakpointStyles(breakpoint: Breakpoint) {
    this.responsiveStyles.forEach((styles, selector) => {
      styles.forEach((style) => {
        const value = style.values[breakpoint];
        if (value) {
          this.applyStyleToElement(selector, style.property, value);
        }
      });
    });
  }

  /**
   * Apply a single style to an element in the iframe
   */
  private applyStyleToElement(selector: string, property: string, value: string) {
    const doc = this.iframe.contentDocument;
    if (!doc) return;

    const element = doc.querySelector(selector) as HTMLElement;
    if (element) {
      element.style.setProperty(property, value);
    }
  }

  /**
   * Generate media query CSS from responsive styles
   */
  generateMediaQueryCSS(): string {
    let css = '';

    // Desktop styles (default)
    this.responsiveStyles.forEach((styles, selector) => {
      const desktopStyles = styles
        .filter((s) => s.values.desktop)
        .map((s) => `  ${s.property}: ${s.values.desktop};`)
        .join('\n');

      if (desktopStyles) {
        css += `${selector} {\n${desktopStyles}\n}\n\n`;
      }
    });

    // Tablet styles
    css += '@media (max-width: 1024px) {\n';
    this.responsiveStyles.forEach((styles, selector) => {
      const tabletStyles = styles
        .filter((s) => s.values.tablet)
        .map((s) => `    ${s.property}: ${s.values.tablet};`)
        .join('\n');

      if (tabletStyles) {
        css += `  ${selector} {\n${tabletStyles}\n  }\n\n`;
      }
    });
    css += '}\n\n';

    // Mobile styles
    css += '@media (max-width: 768px) {\n';
    this.responsiveStyles.forEach((styles, selector) => {
      const mobileStyles = styles
        .filter((s) => s.values.mobile)
        .map((s) => `    ${s.property}: ${s.values.mobile};`)
        .join('\n');

      if (mobileStyles) {
        css += `  ${selector} {\n${mobileStyles}\n  }\n\n`;
      }
    });
    css += '}\n';

    return css;
  }

  /**
   * Inject responsive CSS into iframe
   */
  injectResponsiveCSS() {
    const doc = this.iframe.contentDocument;
    if (!doc) return;

    // Remove existing responsive styles
    const existingStyle = doc.getElementById('responsive-styles');
    if (existingStyle) {
      existingStyle.remove();
    }

    // Create new style tag
    const style = doc.createElement('style');
    style.id = 'responsive-styles';
    style.textContent = this.generateMediaQueryCSS();
    doc.head.appendChild(style);

    console.log('✓ Responsive CSS injected into iframe');
  }

  /**
   * Clear all responsive styles
   */
  clearResponsiveStyles() {
    this.responsiveStyles.clear();

    const doc = this.iframe.contentDocument;
    if (doc) {
      const existingStyle = doc.getElementById('responsive-styles');
      if (existingStyle) {
        existingStyle.remove();
      }
    }

    console.log('🗑️  Responsive styles cleared');
  }

  /**
   * Get all responsive styles for export
   */
  exportResponsiveStyles(): { [selector: string]: ResponsiveStyle[] } {
    const exported: { [selector: string]: ResponsiveStyle[] } = {};
    this.responsiveStyles.forEach((styles, selector) => {
      exported[selector] = styles;
    });
    return exported;
  }

  /**
   * Import responsive styles
   */
  importResponsiveStyles(styles: { [selector: string]: ResponsiveStyle[] }) {
    this.responsiveStyles.clear();
    Object.entries(styles).forEach(([selector, styleList]) => {
      this.responsiveStyles.set(selector, styleList);
    });
    this.applyBreakpointStyles(this.currentBreakpoint);
    console.log('✓ Responsive styles imported');
  }

  /**
   * Clone responsive styles from one element to another
   */
  cloneResponsiveStyles(fromSelector: string, toSelector: string) {
    const fromStyles = this.responsiveStyles.get(fromSelector);
    if (!fromStyles) return;

    // Deep clone the styles
    const clonedStyles = fromStyles.map((style) => ({
      property: style.property,
      values: { ...style.values },
    }));

    this.responsiveStyles.set(toSelector, clonedStyles);
    console.log(`✓ Cloned responsive styles from ${fromSelector} to ${toSelector}`);
  }

  /**
   * Get visual indicator for which breakpoints have custom styles
   */
  getBreakpointIndicators(selector: string): {
    desktop: boolean;
    tablet: boolean;
    mobile: boolean;
  } {
    const styles = this.responsiveStyles.get(selector) || [];
    return {
      desktop: styles.some((s) => s.values.desktop !== undefined),
      tablet: styles.some((s) => s.values.tablet !== undefined),
      mobile: styles.some((s) => s.values.mobile !== undefined),
    };
  }

  /**
   * Remove responsive style for a specific breakpoint
   */
  removeResponsiveStyle(
    selector: string,
    property: string,
    breakpoint: Breakpoint
  ) {
    const styles = this.responsiveStyles.get(selector);
    if (!styles) return;

    const styleEntry = styles.find((s) => s.property === property);
    if (styleEntry) {
      delete styleEntry.values[breakpoint];

      // Remove the style entry if no values left
      if (
        !styleEntry.values.desktop &&
        !styleEntry.values.tablet &&
        !styleEntry.values.mobile
      ) {
        const index = styles.indexOf(styleEntry);
        styles.splice(index, 1);
      }

      // Remove the selector entry if no styles left
      if (styles.length === 0) {
        this.responsiveStyles.delete(selector);
      }
    }

    console.log(`🗑️  Removed ${property} for ${selector} at ${breakpoint}`);
  }
}
