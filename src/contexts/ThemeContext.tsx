/**
 * ThemeContext - Manages website theme with performance optimizations
 *
 * Performance Safeguards:
 * - Mobile detection for animation degradation
 * - Reduced motion support for accessibility
 * - Lazy CSS variable injection
 *
 * Inline Editing Compatibility:
 * - Theme changes don't affect user content modifications
 * - Theme applies to all sections dynamically without breaking edit state
 */

import { createContext, useContext, useEffect, useState, ReactNode, useMemo } from 'react';
import { Theme, getTheme, generateThemeCSSVariables } from '../lib/theme-system';
import { TypographyPreset, getTypographyPreset } from '../lib/typography-presets';

interface ThemeContextValue {
  theme: Theme;
  typography: TypographyPreset;
  setThemeId: (themeId: string) => void;
  isMobile: boolean;
  prefersReducedMotion: boolean;
  shouldDisableAnimations: boolean;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}

interface ThemeProviderProps {
  children: ReactNode;
  initialThemeId?: string;
  websiteId?: string; // For persisting theme to database
}

export function ThemeProvider({
  children,
  initialThemeId = 'modern_minimal',
  websiteId,
}: ThemeProviderProps) {
  const [themeId, setThemeId] = useState(initialThemeId);
  const [isMobile, setIsMobile] = useState(false);
  const [prefersReducedMotion, setprefersReducedMotion] = useState(false);

  // Get theme and typography objects
  const theme = useMemo(() => getTheme(themeId), [themeId]);
  const typography = useMemo(
    () => getTypographyPreset(theme.typography),
    [theme.typography]
  );

  // Detect mobile devices for performance optimization
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Detect reduced motion preference (accessibility)
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setprefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setprefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Apply theme CSS variables to document root
  useEffect(() => {
    const root = document.documentElement;
    const cssVars = generateThemeCSSVariables(theme);

    Object.entries(cssVars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    // Store theme ID in data attribute for potential CSS targeting
    root.setAttribute('data-theme', theme.id);
  }, [theme]);

  // Persist theme to database when it changes (optional)
  useEffect(() => {
    if (!websiteId) return;

    // TODO: Implement database persistence
    // await supabase
    //   .from('organization_websites')
    //   .update({ theme_id: themeId })
    //   .eq('id', websiteId);
  }, [themeId, websiteId]);

  // Determine if animations should be disabled
  // Disable on mobile OR if user prefers reduced motion
  const shouldDisableAnimations = isMobile || prefersReducedMotion;

  const value: ThemeContextValue = {
    theme,
    typography,
    setThemeId,
    isMobile,
    prefersReducedMotion,
    shouldDisableAnimations,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/**
 * Hook to get theme-aware animation settings
 * Automatically disables/reduces animations based on device and user preferences
 */
export function useThemeAnimations() {
  const { theme, shouldDisableAnimations } = useTheme();

  return {
    enabled: theme.animations.enabled && !shouldDisableAnimations,
    duration: shouldDisableAnimations ? 0 : theme.animations.duration,
    easing: theme.animations.easing,
    stagger: shouldDisableAnimations ? 0 : theme.animations.stagger,
  };
}

/**
 * Hook to get theme-aware spacing classes
 */
export function useThemeSpacing() {
  const { theme } = useTheme();
  return theme.spacing;
}

/**
 * Hook to get theme colors as CSS variables or direct values
 */
export function useThemeColors() {
  const { theme } = useTheme();
  return {
    colors: theme.colors,
    cssVars: {
      primary: 'var(--theme-primary)',
      accent: 'var(--theme-accent)',
      background: 'var(--theme-bg)',
      text: 'var(--theme-text)',
      // ... etc
    },
  };
}
