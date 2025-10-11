import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import { toastConfig } from './lib/toast';
import App from './App.tsx';
import './index.css';
import 'leaflet/dist/leaflet.css';

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
