/**
 * Component Detector - Identify semantic sections and components
 * Detects navbars, headers, footers, cards, forms, etc. (UXMagic-style)
 */

export type ComponentType =
  | 'navbar'
  | 'header'
  | 'hero'
  | 'footer'
  | 'card'
  | 'card-grid'
  | 'form'
  | 'sidebar'
  | 'gallery'
  | 'carousel'
  | 'cta'
  | 'testimonial'
  | 'pricing'
  | 'feature-list'
  | 'unknown';

export interface DetectedComponent {
  element: HTMLElement;
  type: ComponentType;
  confidence: number; // 0-1 score
  label: string; // Human-readable name
  children?: DetectedComponent[];
}

export class ComponentDetector {
  private doc: Document;
  private detectedComponents: DetectedComponent[] = [];

  constructor(doc: Document) {
    this.doc = doc;
  }

  /**
   * Analyze the entire document and detect components
   */
  analyze(): DetectedComponent[] {
    this.detectedComponents = [];

    // Get all potential component containers
    const containers = this.doc.querySelectorAll(
      'header, nav, footer, main, section, article, aside, div[class*="container"], div[class*="wrapper"]'
    );

    containers.forEach((elem) => {
      const component = this.detectComponent(elem as HTMLElement);
      if (component && component.confidence > 0.3) {
        this.detectedComponents.push(component);
      }
    });

    // Sort by confidence and remove overlapping/nested duplicates
    this.detectedComponents = this.deduplicateComponents(this.detectedComponents);

    // Label all elements with data attributes
    this.labelElements();

    return this.detectedComponents;
  }

  /**
   * Detect what type of component an element is
   */
  private detectComponent(elem: HTMLElement): DetectedComponent | null {
    // Try each detector in order of specificity
    const detectors = [
      this.detectNavbar.bind(this),
      this.detectHero.bind(this),
      this.detectFooter.bind(this),
      this.detectCardGrid.bind(this),
      this.detectCard.bind(this),
      this.detectForm.bind(this),
      this.detectSidebar.bind(this),
      this.detectGallery.bind(this),
      this.detectCarousel.bind(this),
      this.detectCTA.bind(this),
      this.detectTestimonial.bind(this),
      this.detectPricing.bind(this),
      this.detectFeatureList.bind(this),
    ];

    for (const detector of detectors) {
      const result = detector(elem);
      if (result && result.confidence > 0.3) {
        return result;
      }
    }

    return null;
  }

  /**
   * Detect navigation bars
   */
  private detectNavbar(elem: HTMLElement): DetectedComponent | null {
    let confidence = 0;
    const tagName = elem.tagName.toLowerCase();
    const className = elem.className.toLowerCase();
    const id = elem.id.toLowerCase();

    // Semantic HTML
    if (tagName === 'nav') confidence += 0.5;

    // Common class/id patterns
    if (className.includes('nav') || className.includes('menu') || className.includes('header')) {
      confidence += 0.3;
    }
    if (id.includes('nav') || id.includes('menu')) confidence += 0.2;

    // Structural patterns
    const links = elem.querySelectorAll('a');
    if (links.length >= 3 && links.length <= 15) confidence += 0.3;

    // Position (usually at top)
    const rect = elem.getBoundingClientRect();
    if (rect.top < 100) confidence += 0.2;

    // Has logo + links pattern
    const hasLogo = elem.querySelector('img[alt*="logo" i], img[class*="logo" i]');
    if (hasLogo && links.length > 0) confidence += 0.2;

    if (confidence < 0.3) return null;

    return {
      element: elem,
      type: 'navbar',
      confidence: Math.min(confidence, 1),
      label: 'Navigation Bar',
    };
  }

  /**
   * Detect hero sections
   */
  private detectHero(elem: HTMLElement): DetectedComponent | null {
    let confidence = 0;
    const className = elem.className.toLowerCase();
    const id = elem.id.toLowerCase();

    // Common class/id patterns
    if (className.includes('hero') || className.includes('banner') || className.includes('jumbotron')) {
      confidence += 0.4;
    }
    if (id.includes('hero') || id.includes('banner')) confidence += 0.3;

    // Structural patterns
    const hasHeading = elem.querySelector('h1, h2');
    const hasButton = elem.querySelector('button, a[class*="btn"], a[class*="cta"]');
    const hasLargeText = Array.from(elem.querySelectorAll('*')).some((el) => {
      const fontSize = window.getComputedStyle(el as Element).fontSize;
      return parseFloat(fontSize) > 32;
    });

    if (hasHeading) confidence += 0.3;
    if (hasButton) confidence += 0.2;
    if (hasLargeText) confidence += 0.2;

    // Position (usually near top)
    const rect = elem.getBoundingClientRect();
    if (rect.top < 200) confidence += 0.1;

    // Large height
    if (rect.height > 400) confidence += 0.2;

    if (confidence < 0.3) return null;

    return {
      element: elem,
      type: 'hero',
      confidence: Math.min(confidence, 1),
      label: 'Hero Section',
    };
  }

  /**
   * Detect footer
   */
  private detectFooter(elem: HTMLElement): DetectedComponent | null {
    let confidence = 0;
    const tagName = elem.tagName.toLowerCase();
    const className = elem.className.toLowerCase();
    const id = elem.id.toLowerCase();

    // Semantic HTML
    if (tagName === 'footer') confidence += 0.5;

    // Common class/id patterns
    if (className.includes('footer')) confidence += 0.4;
    if (id.includes('footer')) confidence += 0.3;

    // Position (usually at bottom)
    const rect = elem.getBoundingClientRect();
    const docHeight = this.doc.documentElement.scrollHeight;
    if (rect.bottom > docHeight - 200) confidence += 0.3;

    // Typical footer content
    const hasLinks = elem.querySelectorAll('a').length > 5;
    const hasCopyright = elem.textContent?.toLowerCase().includes('©') ||
                         elem.textContent?.toLowerCase().includes('copyright');
    const hasSocial = elem.querySelector('[class*="social" i], [class*="facebook" i], [class*="twitter" i]');

    if (hasLinks) confidence += 0.2;
    if (hasCopyright) confidence += 0.2;
    if (hasSocial) confidence += 0.1;

    if (confidence < 0.3) return null;

    return {
      element: elem,
      type: 'footer',
      confidence: Math.min(confidence, 1),
      label: 'Footer',
    };
  }

  /**
   * Detect card grids (collections of similar elements)
   */
  private detectCardGrid(elem: HTMLElement): DetectedComponent | null {
    let confidence = 0;
    const className = elem.className.toLowerCase();

    // Common class patterns
    if (className.includes('grid') || className.includes('cards') || className.includes('row')) {
      confidence += 0.3;
    }

    // Structural pattern: multiple similar children
    const children = Array.from(elem.children).filter((child) => {
      return child instanceof HTMLElement && child.offsetHeight > 100;
    });

    if (children.length >= 2 && children.length <= 12) {
      // Check if children are similar in structure
      const firstChild = children[0] as HTMLElement;
      const similarChildren = children.filter((child) => {
        return this.areElementsSimilar(firstChild, child as HTMLElement);
      });

      if (similarChildren.length >= children.length * 0.7) {
        confidence += 0.5;
      }
    }

    // CSS Grid or Flexbox layout
    const styles = window.getComputedStyle(elem);
    if (styles.display === 'grid' || styles.display === 'flex') {
      confidence += 0.2;
    }

    if (confidence < 0.4) return null;

    return {
      element: elem,
      type: 'card-grid',
      confidence: Math.min(confidence, 1),
      label: `Card Grid (${children.length} items)`,
    };
  }

  /**
   * Detect individual cards
   */
  private detectCard(elem: HTMLElement): DetectedComponent | null {
    let confidence = 0;
    const className = elem.className.toLowerCase();

    // Common class patterns
    if (className.includes('card') || className.includes('item') || className.includes('box')) {
      confidence += 0.4;
    }

    // Structural pattern: image + heading + text
    const hasImage = elem.querySelector('img');
    const hasHeading = elem.querySelector('h1, h2, h3, h4, h5, h6');
    const hasText = elem.querySelector('p');
    const hasButton = elem.querySelector('button, a[class*="btn"]');

    if (hasImage) confidence += 0.2;
    if (hasHeading) confidence += 0.2;
    if (hasText) confidence += 0.1;
    if (hasButton) confidence += 0.1;

    // Visual styling (border, shadow, background)
    const styles = window.getComputedStyle(elem);
    if (styles.border !== 'none' ||
        styles.boxShadow !== 'none' ||
        styles.backgroundColor !== 'rgba(0, 0, 0, 0)') {
      confidence += 0.2;
    }

    if (confidence < 0.3) return null;

    return {
      element: elem,
      type: 'card',
      confidence: Math.min(confidence, 1),
      label: 'Card',
    };
  }

  /**
   * Detect forms
   */
  private detectForm(elem: HTMLElement): DetectedComponent | null {
    let confidence = 0;
    const tagName = elem.tagName.toLowerCase();

    // Semantic HTML
    if (tagName === 'form') confidence += 0.6;

    // Has form inputs
    const inputs = elem.querySelectorAll('input, textarea, select');
    if (inputs.length > 0) confidence += 0.3;
    if (inputs.length >= 3) confidence += 0.2;

    // Has submit button
    const hasSubmit = elem.querySelector('button[type="submit"], input[type="submit"]');
    if (hasSubmit) confidence += 0.2;

    if (confidence < 0.3) return null;

    return {
      element: elem,
      type: 'form',
      confidence: Math.min(confidence, 1),
      label: 'Form',
    };
  }

  /**
   * Detect sidebar
   */
  private detectSidebar(elem: HTMLElement): DetectedComponent | null {
    let confidence = 0;
    const className = elem.className.toLowerCase();
    const tagName = elem.tagName.toLowerCase();

    // Semantic HTML
    if (tagName === 'aside') confidence += 0.4;

    // Common class patterns
    if (className.includes('sidebar') || className.includes('aside')) {
      confidence += 0.4;
    }

    // Position (usually on left/right edge)
    const rect = elem.getBoundingClientRect();
    if (rect.left < 50 || rect.right > window.innerWidth - 50) {
      confidence += 0.2;
    }

    // Narrow width
    if (rect.width < 400 && rect.height > 500) {
      confidence += 0.2;
    }

    if (confidence < 0.3) return null;

    return {
      element: elem,
      type: 'sidebar',
      confidence: Math.min(confidence, 1),
      label: 'Sidebar',
    };
  }

  /**
   * Detect image gallery
   */
  private detectGallery(elem: HTMLElement): DetectedComponent | null {
    let confidence = 0;
    const className = elem.className.toLowerCase();

    // Common class patterns
    if (className.includes('gallery') || className.includes('images')) {
      confidence += 0.4;
    }

    // Multiple images
    const images = elem.querySelectorAll('img');
    if (images.length >= 4) confidence += 0.4;
    if (images.length >= 8) confidence += 0.2;

    if (confidence < 0.4) return null;

    return {
      element: elem,
      type: 'gallery',
      confidence: Math.min(confidence, 1),
      label: `Image Gallery (${images.length} images)`,
    };
  }

  /**
   * Detect carousel/slider
   */
  private detectCarousel(elem: HTMLElement): DetectedComponent | null {
    let confidence = 0;
    const className = elem.className.toLowerCase();

    // Common class patterns
    if (className.includes('carousel') ||
        className.includes('slider') ||
        className.includes('swiper')) {
      confidence += 0.5;
    }

    // Has navigation arrows/dots
    const hasNav = elem.querySelector('[class*="arrow"], [class*="dot"], [class*="indicator"]');
    if (hasNav) confidence += 0.3;

    // Has multiple slides
    const slides = elem.querySelectorAll('[class*="slide"]');
    if (slides.length >= 2) confidence += 0.2;

    if (confidence < 0.4) return null;

    return {
      element: elem,
      type: 'carousel',
      confidence: Math.min(confidence, 1),
      label: 'Carousel',
    };
  }

  /**
   * Detect CTA (Call-to-Action) sections
   */
  private detectCTA(elem: HTMLElement): DetectedComponent | null {
    let confidence = 0;
    const className = elem.className.toLowerCase();

    // Common class patterns
    if (className.includes('cta') || className.includes('call-to-action')) {
      confidence += 0.5;
    }

    // Structural pattern: heading + button
    const hasHeading = elem.querySelector('h1, h2, h3');
    const hasButton = elem.querySelector('button, a[class*="btn"]');

    if (hasHeading && hasButton) confidence += 0.4;

    // Limited content (focused message)
    const textLength = elem.textContent?.length || 0;
    if (textLength < 200) confidence += 0.1;

    if (confidence < 0.3) return null;

    return {
      element: elem,
      type: 'cta',
      confidence: Math.min(confidence, 1),
      label: 'Call-to-Action',
    };
  }

  /**
   * Detect testimonial sections
   */
  private detectTestimonial(elem: HTMLElement): DetectedComponent | null {
    let confidence = 0;
    const className = elem.className.toLowerCase();
    const text = elem.textContent?.toLowerCase() || '';

    // Common class patterns
    if (className.includes('testimonial') || className.includes('review')) {
      confidence += 0.5;
    }

    // Has quote marks or quote element
    const hasQuote = elem.querySelector('blockquote, q') ||
                     text.includes('"') ||
                     text.includes('"') ||
                     text.includes('"');
    if (hasQuote) confidence += 0.3;

    // Has author info (name, title, company)
    const hasAuthor = elem.querySelector('[class*="author"], [class*="name"]');
    if (hasAuthor) confidence += 0.2;

    // Has avatar/photo
    const hasAvatar = elem.querySelector('img[class*="avatar"], img[class*="photo"]');
    if (hasAvatar) confidence += 0.1;

    if (confidence < 0.3) return null;

    return {
      element: elem,
      type: 'testimonial',
      confidence: Math.min(confidence, 1),
      label: 'Testimonial',
    };
  }

  /**
   * Detect pricing sections
   */
  private detectPricing(elem: HTMLElement): DetectedComponent | null {
    let confidence = 0;
    const className = elem.className.toLowerCase();
    const text = elem.textContent?.toLowerCase() || '';

    // Common class patterns
    if (className.includes('pricing') || className.includes('plan')) {
      confidence += 0.5;
    }

    // Has currency symbols
    const hasCurrency = text.includes('$') || text.includes('€') || text.includes('£');
    if (hasCurrency) confidence += 0.3;

    // Has price-related keywords
    const hasPriceKeywords = text.includes('month') ||
                             text.includes('year') ||
                             text.includes('free') ||
                             text.includes('price');
    if (hasPriceKeywords) confidence += 0.2;

    // Multiple pricing cards
    const cards = elem.querySelectorAll('[class*="card"], [class*="plan"]');
    if (cards.length >= 2) confidence += 0.2;

    if (confidence < 0.3) return null;

    return {
      element: elem,
      type: 'pricing',
      confidence: Math.min(confidence, 1),
      label: 'Pricing Section',
    };
  }

  /**
   * Detect feature lists
   */
  private detectFeatureList(elem: HTMLElement): DetectedComponent | null {
    let confidence = 0;
    const className = elem.className.toLowerCase();

    // Common class patterns
    if (className.includes('feature') || className.includes('benefit')) {
      confidence += 0.4;
    }

    // Has list structure
    const hasList = elem.querySelector('ul, ol');
    if (hasList) confidence += 0.2;

    // Has icons + text pattern
    const hasIcons = elem.querySelectorAll('svg, i[class*="icon"], img[class*="icon"]');
    if (hasIcons.length >= 3) confidence += 0.3;

    // Multiple similar sections
    const sections = elem.querySelectorAll('[class*="feature"]');
    if (sections.length >= 3) confidence += 0.2;

    if (confidence < 0.3) return null;

    return {
      element: elem,
      type: 'feature-list',
      confidence: Math.min(confidence, 1),
      label: 'Feature List',
    };
  }

  /**
   * Check if two elements have similar structure
   */
  private areElementsSimilar(elem1: HTMLElement, elem2: HTMLElement): boolean {
    // Same tag name
    if (elem1.tagName !== elem2.tagName) return false;

    // Similar number of children
    const childCount1 = elem1.children.length;
    const childCount2 = elem2.children.length;
    if (Math.abs(childCount1 - childCount2) > 2) return false;

    // Similar class names
    const classes1 = elem1.className.split(' ').filter(c => c);
    const classes2 = elem2.className.split(' ').filter(c => c);
    const commonClasses = classes1.filter(c => classes2.includes(c));
    if (commonClasses.length < classes1.length * 0.5) return false;

    return true;
  }

  /**
   * Remove overlapping/nested duplicate components
   */
  private deduplicateComponents(components: DetectedComponent[]): DetectedComponent[] {
    const sorted = components.sort((a, b) => b.confidence - a.confidence);
    const result: DetectedComponent[] = [];

    for (const component of sorted) {
      // Check if this component is nested inside any already-added component
      const isNested = result.some((existing) => {
        return existing.element.contains(component.element);
      });

      // Don't add nested components unless they're significantly different
      if (!isNested) {
        result.push(component);
      }
    }

    return result;
  }

  /**
   * Label all detected components with data attributes
   */
  private labelElements() {
    this.detectedComponents.forEach((component) => {
      component.element.setAttribute('data-component-type', component.type);
      component.element.setAttribute('data-component-label', component.label);
      component.element.setAttribute('data-component-confidence', component.confidence.toFixed(2));
    });
  }

  /**
   * Get component type for a specific element
   */
  getComponentType(elem: HTMLElement): ComponentType | null {
    const type = elem.getAttribute('data-component-type');
    return type as ComponentType || null;
  }

  /**
   * Get all detected components
   */
  getComponents(): DetectedComponent[] {
    return this.detectedComponents;
  }

  /**
   * Get components by type
   */
  getComponentsByType(type: ComponentType): DetectedComponent[] {
    return this.detectedComponents.filter((c) => c.type === type);
  }

  /**
   * Find parent component of an element
   */
  findParentComponent(elem: HTMLElement): DetectedComponent | null {
    let current = elem.parentElement;
    while (current) {
      const component = this.detectedComponents.find((c) => c.element === current);
      if (component) return component;
      current = current.parentElement;
    }
    return null;
  }

  /**
   * Get debug visualization (for development)
   */
  visualizeComponents() {
    this.detectedComponents.forEach((component) => {
      const label = document.createElement('div');
      label.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        background: rgba(59, 130, 246, 0.9);
        color: white;
        padding: 4px 8px;
        font-size: 12px;
        font-family: monospace;
        z-index: 10000;
        pointer-events: none;
      `;
      label.textContent = `${component.label} (${(component.confidence * 100).toFixed(0)}%)`;

      component.element.style.outline = '2px solid rgba(59, 130, 246, 0.5)';
      component.element.style.position = 'relative';
      component.element.appendChild(label);
    });

    console.log('📊 Component Detection Results:', this.detectedComponents);
  }
}
