// Design tokens for Google-level polish
// Based on Material Design and Apple HIG principles

export const animations = {
  durations: {
    instant: 100,    // Immediate feedback
    fast: 200,       // Button interactions
    normal: 400,     // Modal open/close
    slow: 600,       // Page transitions
    verySlow: 1000,  // Complex animations
  },

  easings: {
    // Material Design standard easing
    standard: [0.4, 0.0, 0.2, 1] as [number, number, number, number],
    // Smooth deceleration
    decelerate: [0.0, 0.0, 0.2, 1] as [number, number, number, number],
    // Smooth acceleration
    accelerate: [0.4, 0.0, 1, 1] as [number, number, number, number],
    // Bounce effect
    bounce: [0.68, -0.55, 0.265, 1.55] as [number, number, number, number],
  },

  springs: {
    // Snappy, responsive spring
    snappy: { type: 'spring' as const, stiffness: 500, damping: 30 },
    // Smooth, gentle spring
    smooth: { type: 'spring' as const, stiffness: 300, damping: 25 },
    // Bouncy, playful spring
    bouncy: { type: 'spring' as const, stiffness: 400, damping: 15 },
    // Gentle, slow spring
    gentle: { type: 'spring' as const, stiffness: 200, damping: 20 },
  },
};

export const effects = {
  // Glass morphism effects
  glass: {
    light: {
      background: 'rgba(255, 255, 255, 0.1)',
      border: 'rgba(255, 255, 255, 0.18)',
      blur: 'blur(16px)',
    },
    dark: {
      background: 'rgba(15, 23, 42, 0.8)',
      border: 'rgba(255, 255, 255, 0.1)',
      blur: 'blur(16px)',
    },
    strong: {
      background: 'rgba(15, 23, 42, 0.95)',
      border: 'rgba(255, 255, 255, 0.15)',
      blur: 'blur(24px)',
    },
  },

  // Shadow system
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    glow: '0 0 20px rgba(59, 130, 246, 0.5)',
    glowGreen: '0 0 20px rgba(16, 185, 129, 0.5)',
    glowPurple: '0 0 20px rgba(139, 92, 246, 0.5)',
    lift: '0 20px 40px rgba(0, 0, 0, 0.2)',
    liftHover: '0 30px 60px rgba(0, 0, 0, 0.3)',
  },

  // Gradient presets
  gradients: {
    aurora: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    sunset: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    ocean: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    forest: 'linear-gradient(135deg, #0ba360 0%, #3cba92 100%)',
    fire: 'linear-gradient(135deg, #f2994a 0%, #f2c94c 100%)',
    purple: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
    blue: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
  },
};

export const colors = {
  // Brand colors - Webflow-inspired bold palette
  brand: {
    primary: '#FF3B30',      // Vibrant red (Ballin-inspired)
    primaryDark: '#E5352A',
    primaryLight: '#FF5E54',
    secondary: '#000000',    // Pure black
    secondaryLight: '#1a1a1a',
    accent: '#FFFFFF',       // Pure white
    accentGray: '#F5F5F5',   // Subtle off-white
    accentDark: '#E5E5E5',
  },

  // Base slate colors
  slate: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
    950: '#020617',
  },

  // Primary blue
  blue: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },

  // Purple scale
  purple: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#a855f7',
    600: '#9333ea',
    700: '#7e22ce',
    800: '#6b21a8',
    900: '#581c87',
  },

  // Status colors
  success: '#10b981',
  successDark: '#059669',
  successLight: '#34d399',

  warning: '#f59e0b',
  warningDark: '#d97706',
  warningLight: '#fbbf24',

  error: '#ef4444',
  errorDark: '#dc2626',
  errorLight: '#f87171',

  info: '#3b82f6',
  infoDark: '#2563eb',
  infoLight: '#60a5fa',
};

export const spacing = {
  // Base spacing scale (4px base unit)
  xs: '0.25rem',  // 4px
  sm: '0.5rem',   // 8px
  md: '1rem',     // 16px
  lg: '1.5rem',   // 24px
  xl: '2rem',     // 32px
  '2xl': '3rem',  // 48px
  '3xl': '4rem',  // 64px
  '4xl': '6rem',  // 96px
  '5xl': '8rem',  // 128px
  '6xl': '10rem', // 160px
  '7xl': '12rem', // 192px

  // Webflow-inspired professional spacing
  section: {
    sm: '3.75rem',   // 60px - Compact sections
    md: '5rem',      // 80px - Standard sections
    lg: '7.5rem',    // 120px - Large sections
    xl: '10rem',     // 160px - Extra large sections
  },

  container: {
    padding: '3rem',      // 48px - Container side padding
    paddingMobile: '1.5rem', // 24px - Mobile container padding
  },

  element: {
    gap: '2rem',        // 32px - Gap between elements
    gapLarge: '3rem',   // 48px - Large gap
    gapSmall: '1rem',   // 16px - Small gap
  },
};

export const borderRadius = {
  none: '0',
  sm: '0.25rem',   // 4px
  md: '0.375rem',  // 6px
  lg: '0.5rem',    // 8px
  xl: '0.75rem',   // 12px
  '2xl': '1rem',   // 16px
  '3xl': '1.5rem', // 24px
  full: '9999px',
};

export const typography = {
  // Font families
  fonts: {
    sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    mono: '"JetBrains Mono", "Fira Code", Menlo, Monaco, "Courier New", monospace',
    display: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif', // For headlines
  },

  // Font sizes - Webflow-inspired scale
  sizes: {
    xs: '0.75rem',     // 12px
    sm: '0.875rem',    // 14px
    base: '1rem',      // 16px
    lg: '1.125rem',    // 18px
    xl: '1.25rem',     // 20px
    '2xl': '1.5rem',   // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
    '5xl': '3rem',     // 48px
    '6xl': '3.75rem',  // 60px
    '7xl': '4.5rem',   // 72px
    '8xl': '6rem',     // 96px
    '9xl': '8rem',     // 128px

    // Display sizes for Webflow-style headlines
    'display-sm': '3rem',    // 48px - Small display
    'display-md': '4rem',    // 64px - Medium display
    'display-lg': '5rem',    // 80px - Large display
    'display-xl': '6rem',    // 96px - Extra large display
    'display-2xl': '7rem',   // 112px - Hero headlines

    // Heading sizes
    'heading-xs': '1.5rem',  // 24px
    'heading-sm': '2rem',    // 32px
    'heading-md': '2.5rem',  // 40px
    'heading-lg': '3rem',    // 48px
    'heading-xl': '3.5rem',  // 56px
  },

  // Line heights
  lineHeights: {
    none: '1',
    tight: '1.1',      // For large headlines
    snug: '1.25',      // For subheadlines
    normal: '1.5',     // For body text
    relaxed: '1.625',  // For comfortable reading
    loose: '2',        // For spacious layouts
  },

  // Letter spacing
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',   // For uppercase headings
  },

  // Font weights - Complete scale for hierarchy
  weights: {
    thin: 100,
    extralight: 200,
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900,
  },
};

// Motion variants for common patterns
export const motionVariants = {
  // Fade in/out
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },

  // Slide from bottom
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
  },

  // Slide from top
  slideDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  },

  // Scale from center
  scale: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
  },

  // 3D lift effect
  lift3D: {
    rest: {
      y: 0,
      scale: 1,
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    },
    hover: {
      y: -8,
      scale: 1.02,
      boxShadow: '0 20px 25px rgba(0,0,0,0.15)',
      transition: { type: 'spring', stiffness: 400, damping: 17 },
    },
  },

  // Stagger children
  stagger: {
    animate: {
      transition: {
        staggerChildren: 0.05,
      },
    },
  },

  // Webflow-style card hover
  cardHover: {
    rest: {
      y: 0,
      scale: 1,
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    },
    hover: {
      y: -8,
      scale: 1.02,
      boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
      transition: { duration: 0.3, ease: [0.4, 0.0, 0.2, 1] },
    },
  },

  // Image zoom on hover (for cards)
  imageZoom: {
    rest: {
      scale: 1,
    },
    hover: {
      scale: 1.05,
      transition: { duration: 0.4, ease: [0.4, 0.0, 0.2, 1] },
    },
  },

  // Button hover with scale
  buttonHover: {
    rest: {
      scale: 1,
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    hover: {
      scale: 1.05,
      boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
      transition: { duration: 0.2, ease: [0.4, 0.0, 0.2, 1] },
    },
    tap: {
      scale: 0.95,
    },
  },
};

// Helper function to get glass morphism styles
export const getGlassStyles = (variant: 'light' | 'dark' | 'strong' = 'dark') => {
  const glass = effects.glass[variant];
  return {
    background: glass.background,
    backdropFilter: glass.blur,
    border: `1px solid ${glass.border}`,
  };
};

// Helper function for creating spring transitions
export const createSpring = (
  stiffness: number = 400,
  damping: number = 30
) => ({
  type: 'spring' as const,
  stiffness,
  damping,
});

// Helper function for creating cubic bezier transitions
export const createEasing = (
  duration: number,
  easing: keyof typeof animations.easings = 'standard'
) => ({
  duration: duration / 1000, // Convert to seconds
  ease: animations.easings[easing],
});

// Webflow-inspired image overlay helpers
export const imageOverlays = {
  // Dark gradient overlays for text readability
  dark: {
    top: 'linear-gradient(180deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 100%)',
    bottom: 'linear-gradient(0deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 100%)',
    full: 'linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.4) 100%)',
    radial: 'radial-gradient(circle, rgba(0,0,0,0) 0%, rgba(0,0,0,0.6) 100%)',
  },

  // Brand color overlays
  brand: {
    primary: `linear-gradient(135deg, ${colors.brand.primary}CC 0%, ${colors.brand.primaryDark}CC 100%)`,
    secondary: `linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.9) 100%)`,
  },

  // Colored overlays
  colored: {
    blue: 'linear-gradient(135deg, rgba(59,130,246,0.8) 0%, rgba(37,99,235,0.8) 100%)',
    purple: 'linear-gradient(135deg, rgba(168,85,247,0.8) 0%, rgba(147,51,234,0.8) 100%)',
    red: 'linear-gradient(135deg, rgba(239,68,68,0.8) 0%, rgba(220,38,38,0.8) 100%)',
  },
};

// Helper to create image overlay style
export const createImageOverlay = (
  type: 'dark' | 'brand' | 'colored' = 'dark',
  variant: string = 'bottom',
  opacity: number = 1
) => {
  let gradient;

  if (type === 'dark') {
    gradient = imageOverlays.dark[variant as keyof typeof imageOverlays.dark] || imageOverlays.dark.bottom;
  } else if (type === 'brand') {
    gradient = imageOverlays.brand[variant as keyof typeof imageOverlays.brand] || imageOverlays.brand.primary;
  } else {
    gradient = imageOverlays.colored[variant as keyof typeof imageOverlays.colored] || imageOverlays.colored.blue;
  }

  return {
    background: gradient,
    opacity,
  };
};
