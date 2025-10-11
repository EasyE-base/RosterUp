import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function OnboardingCheck({ children }: { children: React.ReactNode }) {
  const { user, profile, organization, player, loading } = useAuth();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!loading) {
      setChecking(false);
    }
  }, [loading]);

  if (checking || loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user || !profile) {
    return <Navigate to="/login" replace />;
  }

  if (profile.user_type === 'organization' && !organization) {
    return <Navigate to="/onboarding/organization" replace />;
  }

  if (profile.user_type === 'player' && !player) {
    return <Navigate to="/onboarding/player" replace />;
  }

  return <>{children}</>;
}
