/**
 * Application configuration
 * Centralizes all environment variables and configuration settings
 */

interface AppConfig {
  app: {
    name: string;
    version: string;
    url: string;
    environment: 'development' | 'staging' | 'production';
  };
  supabase: {
    url: string;
    anonKey: string;
  };
  features: {
    enableAnalytics: boolean;
    enableWebsiteBuilder: boolean;
    enableNotifications: boolean;
  };
}

// Validate required environment variables
const requiredEnvVars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
] as const;

// Check for missing environment variables
const missingEnvVars = requiredEnvVars.filter(
  (varName) => !import.meta.env[varName]
);

if (missingEnvVars.length > 0) {
  // In production, log the error but don't crash the entire app
  const errorMessage = `Missing required environment variables: ${missingEnvVars.join(', ')}. ` +
    'Please configure these in your deployment settings.';

  console.error(errorMessage);

  // Only throw in development to help developers catch the issue
  if (import.meta.env.DEV) {
    throw new Error(errorMessage);
  }
}

// Application configuration object
export const appConfig: AppConfig = {
  app: {
    name: import.meta.env.VITE_APP_NAME || 'RosterUp',
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
    url: import.meta.env.VITE_APP_URL || 'http://localhost:5173',
    environment: (import.meta.env.MODE as 'development' | 'staging' | 'production') || 'development',
  },
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL || '',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  },
  features: {
    enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
    enableWebsiteBuilder: import.meta.env.VITE_ENABLE_WEBSITE_BUILDER !== 'false', // Default true
    enableNotifications: import.meta.env.VITE_ENABLE_NOTIFICATIONS !== 'false', // Default true
  },
};

// Export individual config sections for convenience
export const { app, supabase, features } = appConfig;

// Helper function to check if in development
export const isDevelopment = () => app.environment === 'development';

// Helper function to check if in production
export const isProduction = () => app.environment === 'production';

// Helper function to check if in staging
export const isStaging = () => app.environment === 'staging';