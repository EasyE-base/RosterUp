/**
 * Feature Flags
 * Manages feature availability for controlled rollout
 */

export interface FeatureFlags {
  aiGeneration: boolean;
  analytics: boolean;
}

/**
 * Get feature flag status
 */
export function isFeatureEnabled(feature: keyof FeatureFlags): boolean {
  switch (feature) {
    case 'aiGeneration':
      // AI generation is enabled if AI provider is configured
      return !!(
        import.meta.env.VITE_AI_PROVIDER &&
        import.meta.env.VITE_AI_PROVIDER !== ''
      );

    case 'analytics':
      // Analytics is enabled if endpoint is configured
      return !!(
        import.meta.env.VITE_ANALYTICS_ENDPOINT &&
        import.meta.env.VITE_ANALYTICS_ENDPOINT !== ''
      );

    default:
      return false;
  }
}

/**
 * Get all feature flag statuses
 */
export function getAllFeatureFlags(): FeatureFlags {
  return {
    aiGeneration: isFeatureEnabled('aiGeneration'),
    analytics: isFeatureEnabled('analytics'),
  };
}

/**
 * Log feature flag status (development only)
 */
export function logFeatureFlags(): void {
  if (!import.meta.env.DEV) return;

  const flags = getAllFeatureFlags();
  console.log('🚩 Feature Flags:', {
    'AI Generation': flags.aiGeneration ? '✅ Enabled' : '❌ Disabled',
    'Analytics': flags.analytics ? '✅ Enabled' : '❌ Disabled',
  });
}

/**
 * Feature flag hook for React components
 */
export function useFeatureFlags(): FeatureFlags {
  return getAllFeatureFlags();
}

/**
 * Get editor mode (V2.0 kill-switch)
 * Allows runtime toggle between Canvas, Smart, and Hybrid modes
 */
export type EditorMode = 'canvas' | 'smart' | 'hybrid';

export function getEditorMode(): EditorMode {
  const mode = import.meta.env.VITE_EDITOR_MODE as string;

  // Validate mode
  if (mode === 'canvas' || mode === 'smart' || mode === 'hybrid') {
    return mode;
  }

  // Default to canvas mode
  return 'canvas';
}
