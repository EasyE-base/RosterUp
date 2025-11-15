/**
 * Apple-Style Design System Tokens
 * Based on Landing.tsx aesthetic
 */

// Color System
export const appleColors = {
  // Primary Colors
  primary: 'rgb(0,113,227)',      // #0071E3 - Apple blue
  primaryHover: 'rgb(0,98,204)',   // #0062CC - Hover state

  // Text Colors
  textPrimary: 'rgb(29,29,31)',    // #1D1D1F - Main text
  textSecondary: 'rgb(86,88,105)',  // #565869 - Secondary text
  textTertiary: 'rgb(134,142,150)', // #868E96 - Tertiary text

  // Backgrounds
  background: 'rgb(255,255,255)',   // #FFFFFF - White
  backgroundAlt: 'rgb(251,251,253)', // #FBFBFD - Light gray
  backgroundHover: 'rgb(247,248,250)', // #F7F8FA - Hover state

  // Borders
  border: 'rgb(226,232,240)',       // #E2E8F0 - slate-200
  borderHover: 'rgb(203,213,225)',  // #CBD5E1 - slate-300

  // Status Colors
  success: 'rgb(34,197,94)',        // #22C55E - green-500
  warning: 'rgb(234,179,8)',        // #EAB308 - yellow-500
  error: 'rgb(239,68,68)',          // #EF4444 - red-500
  info: 'rgb(59,130,246)',          // #3B82F6 - blue-500

  // Gradient Colors
  gradientBlue: {
    from: 'rgb(59,130,246)',        // blue-500
    to: 'rgb(34,211,238)',          // cyan-400
  },
  gradientPurple: {
    from: 'rgb(168,85,247)',        // purple-500
    to: 'rgb(236,72,153)',          // pink-500
  },
  gradientGreen: {
    from: 'rgb(34,197,94)',         // green-500
    to: 'rgb(5,150,105)',           // green-600
  },
} as const;

// Typography Scale
export const appleTypography = {
  hero: {
    size: '96px',
    weight: 600,
    lineHeight: 1.05,
    letterSpacing: '-0.04em',
  },
  sectionHeadline: {
    size: '56px',
    weight: 600,
    lineHeight: 1.1,
    letterSpacing: '-0.02em',
  },
  cardTitle: {
    size: '30px',
    weight: 600,
    lineHeight: 1.2,
    letterSpacing: '-0.01em',
  },
  featureTitle: {
    size: '20px',
    weight: 600,
    lineHeight: 1.3,
    letterSpacing: '0',
  },
  bodyLarge: {
    size: '24px',
    weight: 400,
    lineHeight: 1.5,
    letterSpacing: '-0.011em',
  },
  body: {
    size: '18px',
    weight: 400,
    lineHeight: 1.6,
    letterSpacing: '0',
  },
  bodySmall: {
    size: '15px',
    weight: 400,
    lineHeight: 1.5,
    letterSpacing: '-0.01em',
  },
  label: {
    size: '14px',
    weight: 500,
    lineHeight: 1.4,
    letterSpacing: '0',
  },
} as const;

// Spacing System (in pixels)
export const appleSpacing = {
  // Section Spacing
  sectionPadding: {
    sm: '96px',   // py-24
    md: '128px',  // py-32
    lg: '160px',  // py-40
    xl: '192px',  // py-48
  },

  // Card Padding
  cardPadding: {
    sm: '24px',   // p-6
    md: '32px',   // p-8
    lg: '40px',   // p-10
    xl: '48px',   // p-12
  },

  // Grid Gaps
  gridGap: {
    sm: '24px',   // gap-6
    md: '32px',   // gap-8
    lg: '48px',   // gap-12
  },

  // Button Padding
  buttonPadding: {
    sm: { x: '20px', y: '10px' },   // px-5 py-2.5
    md: { x: '32px', y: '14px' },   // px-8 py-3.5
    lg: { x: '40px', y: '16px' },   // px-10 py-4
  },

  // Container Padding
  containerPadding: {
    mobile: '24px',   // px-6
    tablet: '32px',   // px-8
    desktop: '48px',  // px-12
  },
} as const;

// Border Radius
export const appleBorderRadius = {
  sm: '8px',      // rounded-lg
  md: '12px',     // rounded-xl
  lg: '16px',     // rounded-2xl
  full: '9999px', // rounded-full
} as const;

// Shadows
export const appleShadows = {
  card: '0 4px 24px rgba(0,0,0,0.06)',
  cardHover: '0 12px 48px rgba(0,113,227,0.12)',
  button: '0 2px 4px rgba(0,0,0,0.1)',
  buttonHover: '0 8px 16px rgba(0,0,0,0.15)',
  cta: '0 20px 60px rgba(0,113,227,0.20)',
  dropdown: '0 8px 32px rgba(0,0,0,0.12)',
  modal: '0 24px 64px rgba(0,0,0,0.15)',
} as const;

// Animation Tokens
export const appleAnimations = {
  // Easing Functions
  easing: {
    easeOutExpo: [0.16, 1, 0.3, 1] as [number, number, number, number],
    easeInOut: [0.4, 0, 0.2, 1] as [number, number, number, number],
    easeOut: [0, 0, 0.2, 1] as [number, number, number, number],
  },

  // Durations (in seconds)
  duration: {
    fast: 0.2,
    normal: 0.3,
    slow: 0.6,
    verySlow: 0.7,
  },

  // Standard Delays (in seconds)
  delay: {
    none: 0,
    short: 0.1,
    medium: 0.2,
    long: 0.3,
    veryLong: 0.4,
  },

  // Standard Animations
  fadeIn: {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
  },

  scaleIn: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
  },

  slideInUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
  },

  hoverLift: {
    whileHover: { y: -4 },
  },

  hoverScale: {
    whileHover: { scale: 1.05 },
  },

  activePress: {
    whileTap: { scale: 0.98 },
  },
} as const;

// Breakpoints (matches Tailwind defaults)
export const appleBreakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// Icon Sizes
export const appleIconSizes = {
  xs: '16px',
  sm: '20px',
  md: '24px',
  lg: '32px',
  xl: '48px',
  '2xl': '64px',
} as const;

// Z-Index Scale
export const appleZIndex = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  fixed: 30,
  modalBackdrop: 40,
  modal: 50,
  popover: 60,
  tooltip: 70,
} as const;

// Export utility function to get Tailwind classes
export const getAppleTailwindClasses = () => ({
  // Common color classes
  primaryBg: 'bg-[rgb(0,113,227)]',
  primaryHoverBg: 'hover:bg-[rgb(0,98,204)]',
  textPrimary: 'text-[rgb(29,29,31)]',
  textSecondary: 'text-[rgb(86,88,105)]',

  // Common button classes
  primaryButton: 'bg-[rgb(0,113,227)] text-white rounded-full px-8 py-3.5 font-semibold hover:shadow-lg transition-all duration-300 active:scale-[0.98]',
  secondaryButton: 'bg-[rgb(29,29,31)] text-white rounded-full px-8 py-3.5 font-semibold hover:shadow-lg transition-all duration-300 active:scale-[0.98]',
  textButton: 'text-[rgb(0,113,227)] font-semibold hover:text-[rgb(0,98,204)] transition-colors duration-200',

  // Common card classes
  card: 'bg-white border-[1.5px] border-slate-200/60 rounded-2xl p-10 hover:border-slate-300/80 transition-all duration-500',
  cardShadow: 'shadow-[0_4px_24px_rgba(0,0,0,0.06)]',
  cardHoverShadow: 'hover:shadow-[0_12px_48px_rgba(0,113,227,0.12)]',

  // Common typography classes
  heroHeading: 'text-[96px] font-semibold leading-[1.05] tracking-[-0.04em]',
  sectionHeading: 'text-[56px] font-semibold leading-[1.1] tracking-[-0.02em]',
  cardHeading: 'text-3xl font-semibold tracking-[-0.01em]',

  // Common layout classes
  section: 'py-24 lg:py-32',
  container: 'max-w-7xl mx-auto px-6 md:px-8 lg:px-12',
});
