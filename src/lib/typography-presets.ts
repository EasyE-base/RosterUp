/**
 * Typography Presets for Premium Sports Templates
 * Defines font families, sizes, weights, and tracking for different design styles
 */

import { TypographyPreset } from './theme-system';

export const typographyPresets: Record<string, TypographyPreset> = {
  bold_impact: {
    id: 'bold_impact',
    name: 'Bold Impact',
    headingFont: 'font-sans', // System sans-serif stack
    bodyFont: 'font-sans',
    headingSizes: {
      h1: 'text-6xl md:text-7xl lg:text-8xl', // Extra large for hero sections
      h2: 'text-4xl md:text-5xl lg:text-6xl',
      h3: 'text-3xl md:text-4xl',
      h4: 'text-2xl md:text-3xl',
    },
    weights: {
      light: 'font-light',
      normal: 'font-normal',
      semibold: 'font-semibold',
      bold: 'font-bold',
      extrabold: 'font-extrabold',
    },
    tracking: {
      tight: 'tracking-tight',
      normal: 'tracking-normal',
      wide: 'tracking-wide',
    },
  },

  clean_professional: {
    id: 'clean_professional',
    name: 'Clean Professional',
    headingFont: 'font-sans',
    bodyFont: 'font-sans',
    headingSizes: {
      h1: 'text-5xl md:text-6xl lg:text-7xl',
      h2: 'text-3xl md:text-4xl lg:text-5xl',
      h3: 'text-2xl md:text-3xl lg:text-4xl',
      h4: 'text-xl md:text-2xl lg:text-3xl',
    },
    weights: {
      light: 'font-light',
      normal: 'font-normal',
      semibold: 'font-semibold',
      bold: 'font-bold',
      extrabold: 'font-extrabold',
    },
    tracking: {
      tight: 'tracking-tight',
      normal: 'tracking-normal',
      wide: 'tracking-wide',
    },
  },

  dynamic_athletic: {
    id: 'dynamic_athletic',
    name: 'Dynamic Athletic',
    headingFont: 'font-sans',
    bodyFont: 'font-sans',
    headingSizes: {
      h1: 'text-5xl md:text-6xl lg:text-7xl', // Slightly smaller than Bold Impact
      h2: 'text-4xl md:text-5xl',
      h3: 'text-3xl md:text-4xl',
      h4: 'text-2xl md:text-3xl',
    },
    weights: {
      light: 'font-light',
      normal: 'font-medium', // Slightly heavier base weight
      semibold: 'font-semibold',
      bold: 'font-bold',
      extrabold: 'font-black',
    },
    tracking: {
      tight: 'tracking-tight',
      normal: 'tracking-normal',
      wide: 'tracking-wider', // Wider tracking for emphasis
    },
  },
};

// Get typography preset by ID with fallback
export function getTypographyPreset(presetId: string): TypographyPreset {
  return typographyPresets[presetId] || typographyPresets.clean_professional;
}

// Get all available typography presets
export function getAllTypographyPresets(): TypographyPreset[] {
  return Object.values(typographyPresets);
}

// Generate heading class string from preset and level
export function getHeadingClasses(
  preset: TypographyPreset,
  level: 'h1' | 'h2' | 'h3' | 'h4',
  weight: keyof TypographyPreset['weights'] = 'bold',
  tracking: keyof TypographyPreset['tracking'] = 'tight'
): string {
  return `${preset.headingFont} ${preset.headingSizes[level]} ${preset.weights[weight]} ${preset.tracking[tracking]}`;
}

// Generate body text class string from preset
export function getBodyClasses(
  preset: TypographyPreset,
  size: 'sm' | 'base' | 'lg' | 'xl' = 'base',
  weight: keyof TypographyPreset['weights'] = 'normal'
): string {
  const sizeClasses = {
    sm: 'text-sm md:text-base',
    base: 'text-base md:text-lg',
    lg: 'text-lg md:text-xl',
    xl: 'text-xl md:text-2xl',
  };

  return `${preset.bodyFont} ${sizeClasses[size]} ${preset.weights[weight]}`;
}
