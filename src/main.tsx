import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import { toastConfig } from './lib/toast';
import App from './App.tsx';
import './index.css';
import 'leaflet/dist/leaflet.css';

import { appConfig } from './config/app.config';

console.log('🚀 APP ENTRY POINT - Raw URL:', window.location.href);
console.log('🔧 CONFIG CHECK:', {
  supabaseUrl: appConfig.supabase.url,
  supabaseKeyLength: appConfig.supabase.anonKey?.length || 0,
  supabaseKeyStart: appConfig.supabase.anonKey?.substring(0, 5) + '...',
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <App />
        <Toaster
          position={toastConfig.position}
          toastOptions={{
            style: toastConfig.style,
            success: toastConfig.success,
            error: toastConfig.error,
          }}
        />
      </AuthProvider>
    </ErrorBoundary>
  </StrictMode>
);
