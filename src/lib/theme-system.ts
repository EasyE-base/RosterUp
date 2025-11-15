/**
 * Premium Sports Template Theme System
 * Provides color palettes, typography, spacing, and animation presets
 */

export interface ThemeColors {
  // Primary brand colors
  primary: string;
  primaryDark: string;
  primaryLight: string;

  // Accent colors
  accent: string;
  accentDark: string;
  accentLight: string;

  // Background colors
  background: string;
  backgroundAlt: string;
  backgroundOverlay: string;

  // Text colors
  text: string;
  textMuted: string;
  textInverse: string;

  // UI colors
  border: string;
  hover: string;
  success: string;
  error: string;
  warning: string;
}

export interface TypographyPreset {
  id: string;
  name: string;
  headingFont: string; // Tailwind font class
  bodyFont: string;
  headingSizes: {
    h1: string; // Tailwind text size class
    h2: string;
    h3: string;
    h4: string;
  };
  weights: {
    light: string;
    normal: string;
    semibold: string;
    bold: string;
    extrabold: string;
  };
  tracking: {
    tight: string;
    normal: string;
    wide: string;
  };
}

export interface AnimationPreset {
  enabled: boolean;
  duration: number; // milliseconds
  easing: string; // CSS easing function
  stagger: number; // delay between sequential animations (ms)
}

export interface Theme {
  id: string;
  name: string;
  description: string;
  colors: ThemeColors;
  typography: string; // ID of TypographyPreset
  animations: AnimationPreset;
  spacing: {
    sectionPadding: string; // Tailwind padding class
    containerMaxWidth: string; // Tailwind max-width class
  };
}

// ============================================================================
// THEME PRESETS
// ============================================================================

export const themes: Record<string, Theme> = {
  dark_athletic: {
    id: 'dark_athletic',
    name: 'Dark Athletic',
    description: 'Deep navy and black with neon cyan accents for a modern, energetic feel',
    colors: {
      primary: '#001F3F', // Deep navy
      primaryDark: '#000814',
      primaryLight: '#003459',
      accent: '#00F5FF', // Neon cyan
      accentDark: '#00D9E6',
      accentLight: '#66F8FF',
      background: '#0A0E27',
      backgroundAlt: '#151937',
      backgroundOverlay: 'rgba(0, 31, 63, 0.85)',
      text: '#FFFFFF',
      textMuted: '#A0AEC0',
      textInverse: '#0A0E27',
      border: '#2D3748',
      hover: '#00E5F5',
      success: '#48BB78',
      error: '#F56565',
      warning: '#ED8936',
    },
    typography: 'bold_impact',
    animations: {
      enabled: true,
      duration: 600,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      stagger: 100,
    },
    spacing: {
      sectionPadding: 'py-20 px-8',
      containerMaxWidth: 'max-w-7xl',
    },
  },

  vibrant_energy: {
    id: 'vibrant_energy',
    name: 'Vibrant Energy',
    description: 'Bold reds and oranges with high contrast for maximum impact',
    colors: {
      primary: '#DC2626', // Bold red
      primaryDark: '#991B1B',
      primaryLight: '#EF4444',
      accent: '#F59E0B', // Bright orange
      accentDark: '#D97706',
      accentLight: '#FBBF24',
      background: '#FFFFFF',
      backgroundAlt: '#F9FAFB',
      backgroundOverlay: 'rgba(220, 38, 38, 0.9)',
      text: '#111827',
      textMuted: '#6B7280',
      textInverse: '#FFFFFF',
      border: '#E5E7EB',
      hover: '#B91C1C',
      success: '#10B981',
      error: '#DC2626',
      warning: '#F59E0B',
    },
    typography: 'dynamic_athletic',
    animations: {
      enabled: true,
      duration: 500,
      easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      stagger: 80,
    },
    spacing: {
      sectionPadding: 'py-24 px-6',
      containerMaxWidth: 'max-w-6xl',
    },
  },

  classic_sports: {
    id: 'classic_sports',
    name: 'Classic Sports',
    description: 'Traditional greens and whites for a clean, professional look',
    colors: {
      primary: '#047857', // Forest green
      primaryDark: '#065F46',
      primaryLight: '#059669',
      accent: '#10B981', // Emerald
      accentDark: '#059669',
      accentLight: '#34D399',
      background: '#FFFFFF',
      backgroundAlt: '#F0FDF4',
      backgroundOverlay: 'rgba(4, 120, 87, 0.8)',
      text: '#1F2937',
      textMuted: '#6B7280',
      textInverse: '#FFFFFF',
      border: '#D1D5DB',
      hover: '#065F46',
      success: '#10B981',
      error: '#EF4444',
      warning: '#F59E0B',
    },
    typography: 'clean_professional',
    animations: {
      enabled: true,
      duration: 700,
      easing: 'ease-in-out',
      stagger: 120,
    },
    spacing: {
      sectionPadding: 'py-16 px-8',
      containerMaxWidth: 'max-w-7xl',
    },
  },

  modern_minimal: {
    id: 'modern_minimal',
    name: 'Modern Minimal',
    description: 'Sleek grays with cyan accents for a contemporary aesthetic',
    colors: {
      primary: '#1F2937', // Charcoal gray
      primaryDark: '#111827',
      primaryLight: '#374151',
      accent: '#06B6D4', // Cyan
      accentDark: '#0891B2',
      accentLight: '#22D3EE',
      background: '#F9FAFB',
      backgroundAlt: '#FFFFFF',
      backgroundOverlay: 'rgba(31, 41, 55, 0.75)',
      text: '#111827',
      textMuted: '#6B7280',
      textInverse: '#FFFFFF',
      border: '#E5E7EB',
      hover: '#0891B2',
      success: '#10B981',
      error: '#EF4444',
      warning: '#F59E0B',
    },
    typography: 'clean_professional',
    animations: {
      enabled: true,
      duration: 650,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      stagger: 90,
    },
    spacing: {
      sectionPadding: 'py-20 px-8',
      containerMaxWidth: 'max-w-6xl',
    },
  },

  championship_gold: {
    id: 'championship_gold',
    name: 'Championship Gold',
    description: 'Luxurious black and gold for a premium, championship feel',
    colors: {
      primary: '#0F172A', // Rich black
      primaryDark: '#020617',
      primaryLight: '#1E293B',
      accent: '#F59E0B', // Championship gold
      accentDark: '#D97706',
      accentLight: '#FBBF24',
      background: '#0F172A',
      backgroundAlt: '#1E293B',
      backgroundOverlay: 'rgba(15, 23, 42, 0.9)',
      text: '#F8FAFC',
      textMuted: '#94A3B8',
      textInverse: '#0F172A',
      border: '#334155',
      hover: '#FBBF24',
      success: '#10B981',
      error: '#EF4444',
      warning: '#F59E0B',
    },
    typography: 'bold_impact',
    animations: {
      enabled: true,
      duration: 800,
      easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
      stagger: 150,
    },
    spacing: {
      sectionPadding: 'py-24 px-8',
      containerMaxWidth: 'max-w-7xl',
    },
  },
};

// Get theme by ID with fallback
export function getTheme(themeId: string): Theme {
  return themes[themeId] || themes.modern_minimal;
}

// Get all available themes
export function getAllThemes(): Theme[] {
  return Object.values(themes);
}

// Generate CSS variables from theme
export function generateThemeCSSVariables(theme: Theme): Record<string, string> {
  return {
    '--theme-primary': theme.colors.primary,
    '--theme-primary-dark': theme.colors.primaryDark,
    '--theme-primary-light': theme.colors.primaryLight,
    '--theme-accent': theme.colors.accent,
    '--theme-accent-dark': theme.colors.accentDark,
    '--theme-accent-light': theme.colors.accentLight,
    '--theme-bg': theme.colors.background,
    '--theme-bg-alt': theme.colors.backgroundAlt,
    '--theme-bg-overlay': theme.colors.backgroundOverlay,
    '--theme-text': theme.colors.text,
    '--theme-text-muted': theme.colors.textMuted,
    '--theme-text-inverse': theme.colors.textInverse,
    '--theme-border': theme.colors.border,
    '--theme-hover': theme.colors.hover,
    '--theme-success': theme.colors.success,
    '--theme-error': theme.colors.error,
    '--theme-warning': theme.colors.warning,
  };
}
