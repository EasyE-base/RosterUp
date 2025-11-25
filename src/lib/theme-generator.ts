/**
 * Theme Generator - Generative Design System
 * Creates random, cohesive themes using color harmony principles
 */

import { Theme, ThemeColors } from './theme-system';
import { getAllTypographyPresets } from './typography-presets';

// ============================================================================
// COLOR GENERATION
// ============================================================================

/**
 * Convert HSL to RGB hex color
 */
function hslToHex(h: number, s: number, l: number): string {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = (n: number) => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
}

/**
 * Calculate relative luminance for WCAG contrast
 */
function getLuminance(hex: string): number {
    const rgb = hex.match(/[A-Za-z0-9]{2}/g)?.map(v => parseInt(v, 16) / 255) || [0, 0, 0];
    const [r, g, b] = rgb.map(val => {
        return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Calculate contrast ratio between two colors
 */
function getContrastRatio(hex1: string, hex2: string): number {
    const lum1 = getLuminance(hex1);
    const lum2 = getLuminance(hex2);
    const lighter = Math.max(lum1, lum2);
    const darker = Math.min(lum1, lum2);
    return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Get appropriate text color for background (WCAG AA compliant)
 */
function getTextColor(bgHex: string): string {
    const lum = getLuminance(bgHex);
    // If background is light, use dark text; if dark, use light text
    return lum > 0.5 ? '#111827' : '#F8FAFC';
}

/**
 * Generate a complete color palette from a base hue
 */
/**
 * Convert Hex to HSL
 */
function hexToHsl(hex: string): { h: number, s: number, l: number } {
    let r = 0, g = 0, b = 0;
    if (hex.length === 4) {
        r = parseInt('0x' + hex[1] + hex[1]);
        g = parseInt('0x' + hex[2] + hex[2]);
        b = parseInt('0x' + hex[3] + hex[3]);
    } else if (hex.length === 7) {
        r = parseInt('0x' + hex[1] + hex[2]);
        g = parseInt('0x' + hex[3] + hex[4]);
        b = parseInt('0x' + hex[5] + hex[6]);
    }
    r /= 255;
    g /= 255;
    b /= 255;
    const cmin = Math.min(r, g, b),
        cmax = Math.max(r, g, b),
        delta = cmax - cmin;
    let h = 0, s = 0, l = 0;

    if (delta === 0) h = 0;
    else if (cmax === r) h = ((g - b) / delta) % 6;
    else if (cmax === g) h = (b - r) / delta + 2;
    else h = (r - g) / delta + 4;

    h = Math.round(h * 60);
    if (h < 0) h += 360;
    l = (cmax + cmin) / 2;
    s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
    s = +(s * 100).toFixed(1);
    l = +(l * 100).toFixed(1);

    return { h, s, l };
}

export interface ThemeGenerationOptions {
    baseColor?: string;
    harmony?: 'complementary' | 'analogous' | 'monochromatic' | 'triadic' | 'random';
    mode?: 'light' | 'dark' | 'random';
}

/**
 * Generate a complete color palette from a base hue or color
 */
export function generateColorPalette(baseHueOrColor: number | string, options: ThemeGenerationOptions = {}): ThemeColors {
    let h: number, s: number, l: number;

    if (typeof baseHueOrColor === 'string') {
        const hsl = hexToHsl(baseHueOrColor);
        h = hsl.h;
        s = hsl.s;
        l = hsl.l;
    } else {
        h = baseHueOrColor;
        s = 50 + Math.random() * 30;
        l = 50;
    }

    const isDark = options.mode === 'random' || !options.mode
        ? Math.random() > 0.5
        : options.mode === 'dark';

    // Adjust primary based on mode if not provided as specific color
    const primarySat = typeof baseHueOrColor === 'string' ? s : 50 + Math.random() * 30;
    const primaryLightness = typeof baseHueOrColor === 'string' ? l : (isDark ? 40 + Math.random() * 20 : 40 + Math.random() * 20);

    const primary = hslToHex(h, primarySat, primaryLightness);
    const primaryDark = hslToHex(h, primarySat, Math.max(primaryLightness - 15, 10));
    const primaryLight = hslToHex(h, primarySat, Math.min(primaryLightness + 15, 90));

    // Determine Harmony Rule
    const harmony = options.harmony === 'random' || !options.harmony
        ? (['complementary', 'analogous', 'monochromatic', 'triadic'][Math.floor(Math.random() * 4)] as any)
        : options.harmony;

    let accentHue = h;
    let accentSat = primarySat;
    let accentLightness = primaryLightness;

    switch (harmony) {
        case 'complementary':
            accentHue = (h + 180) % 360;
            break;
        case 'analogous':
            accentHue = (h + 30) % 360;
            break;
        case 'triadic':
            accentHue = (h + 120) % 360;
            break;
        case 'monochromatic':
            accentHue = h;
            accentSat = Math.max(0, primarySat - 20);
            accentLightness = isDark ? Math.min(100, primaryLightness + 30) : Math.max(0, primaryLightness - 30);
            break;
    }

    // Ensure accent visibility
    if (harmony !== 'monochromatic') {
        accentSat = 60 + Math.random() * 30;
        accentLightness = isDark ? 50 + Math.random() * 20 : 45 + Math.random() * 15;
    }

    const accent = hslToHex(accentHue, accentSat, accentLightness);
    const accentDark = hslToHex(accentHue, accentSat, Math.max(accentLightness - 10, 20));
    const accentLight = hslToHex(accentHue, accentSat, Math.min(accentLightness + 15, 85));

    // Generate backgrounds
    let background: string;
    let backgroundAlt: string;
    let text: string;
    let textMuted: string;
    let textInverse: string;

    if (isDark) {
        // Dark theme
        background = hslToHex(h, 20, 8); // Very dark with slight tint of primary
        backgroundAlt = hslToHex(h, 15, 12);
        text = '#F8FAFC';
        textMuted = '#94A3B8';
        textInverse = '#0F172A';
    } else {
        // Light theme
        background = hslToHex(h, 10, 98); // Very light with slight tint
        backgroundAlt = '#FFFFFF';
        text = '#111827';
        textMuted = '#6B7280';
        textInverse = '#FFFFFF';
    }

    const backgroundOverlay = isDark
        ? `rgba(${parseInt(primary.slice(1, 3), 16)}, ${parseInt(primary.slice(3, 5), 16)}, ${parseInt(primary.slice(5, 7), 16)}, 0.85)`
        : `rgba(${parseInt(primary.slice(1, 3), 16)}, ${parseInt(primary.slice(3, 5), 16)}, ${parseInt(primary.slice(5, 7), 16)}, 0.75)`;

    // UI colors
    const border = isDark ? '#334155' : '#E5E7EB';
    const hover = hslToHex(accentHue, accentSat, isDark ? accentLightness + 10 : accentLightness - 10);

    return {
        primary,
        primaryDark,
        primaryLight,
        accent,
        accentDark,
        accentLight,
        background,
        backgroundAlt,
        backgroundOverlay,
        text,
        textMuted,
        textInverse,
        border,
        hover,
        success: '#10B981', // Keep consistent
        error: '#EF4444',
        warning: '#F59E0B',
    };
}

/**
 * Generate a complete random theme
 */
export function generateRandomTheme(options: ThemeGenerationOptions = {}): Theme {
    // Base hue or color
    let baseHueOrColor: number | string;

    if (options.baseColor) {
        baseHueOrColor = options.baseColor;
    } else {
        baseHueOrColor = Math.floor(Math.random() * 360);
    }

    // Generate color palette
    const colors = generateColorPalette(baseHueOrColor, options);

    // Pick random typography preset
    const typographyPresets = getAllTypographyPresets();
    const typography = typographyPresets[Math.floor(Math.random() * typographyPresets.length)];

    // Random spacing variation
    const spacingVariations = [
        { sectionPadding: 'py-16 px-6', containerMaxWidth: 'max-w-6xl' },
        { sectionPadding: 'py-20 px-8', containerMaxWidth: 'max-w-7xl' },
        { sectionPadding: 'py-24 px-8', containerMaxWidth: 'max-w-6xl' },
    ];
    const spacing = spacingVariations[Math.floor(Math.random() * spacingVariations.length)];

    // Animation settings
    const durations = [500, 600, 650, 700, 800];
    const easings = [
        'cubic-bezier(0.4, 0, 0.2, 1)',
        'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'cubic-bezier(0.16, 1, 0.3, 1)',
        'ease-in-out',
    ];

    const animations = {
        enabled: true,
        duration: durations[Math.floor(Math.random() * durations.length)],
        easing: easings[Math.floor(Math.random() * easings.length)],
        stagger: 80 + Math.floor(Math.random() * 80), // 80-160ms
    };

    // Generate unique ID
    const id = `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const harmonyName = options.harmony ? options.harmony.charAt(0).toUpperCase() + options.harmony.slice(1) : 'Smart';

    return {
        id,
        name: `${harmonyName} Theme ${new Date().toLocaleTimeString()}`,
        description: `Auto-generated theme with ${getLuminance(colors.background) > 0.5 ? 'light' : 'dark'} background`,
        colors,
        typography: typography.id,
        animations,
        spacing,
    };
}

// ============================================================================
// THEME STORAGE
// ============================================================================

const STORAGE_KEY = 'website_builder_custom_themes';
const MAX_SAVED_THEMES = 10;

export interface SavedTheme {
    id: string;
    name: string;
    timestamp: number;
    theme: Theme;
}

/**
 * Save a theme to localStorage
 */
export function saveThemePreset(theme: Theme, name?: string): void {
    const savedThemes = getThemePresets();

    const newTheme: SavedTheme = {
        id: theme.id,
        name: name || theme.name,
        timestamp: Date.now(),
        theme,
    };

    // Add to beginning and limit to MAX_SAVED_THEMES
    savedThemes.unshift(newTheme);
    const trimmed = savedThemes.slice(0, MAX_SAVED_THEMES);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
}

/**
 * Get all saved theme presets
 */
export function getThemePresets(): SavedTheme[] {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return [];
        return JSON.parse(stored);
    } catch (error) {
        console.error('Failed to load saved themes:', error);
        return [];
    }
}

/**
 * Delete a saved theme
 */
export function deleteThemePreset(themeId: string): void {
    const savedThemes = getThemePresets();
    const filtered = savedThemes.filter(t => t.id !== themeId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

/**
 * Clear all saved themes
 */
export function clearThemePresets(): void {
    localStorage.removeItem(STORAGE_KEY);
}
