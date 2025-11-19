import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Users, Award, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

export default function SelectUserType() {
  const [userType, setUserType] = useState<'organization' | 'player' | 'trainer' | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user, profile, organization, player, trainer, loading: authLoading } = useAuth();

  // Redirect if not authenticated or already has complete setup
  useEffect(() => {
    console.log('SelectUserType: Checking auth state', { authLoading, user: user?.id, profile: profile?.id });

    if (authLoading) {
      console.log('SelectUserType: Still loading auth...');
      return;
    }

    if (!user) {
      console.log('SelectUserType: No user found, redirecting to login');
      navigate('/login', { replace: true });
      return;
    }

    if (profile && (organization || player || trainer)) {
      console.log('SelectUserType: User already has profile, redirecting to dashboard');
      navigate('/dashboard', { replace: true });
      return;
    }

    console.log('SelectUserType: User authenticated and needs to select type');
  }, [user, profile, organization, player, trainer, navigate, authLoading]);

  const handleContinue = async () => {
    if (!userType) {
      setError('Please select an account type');
      return;
    }

    if (!user) {
      setError('No user found. Please sign in again.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Update profile with user type
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
          user_type: userType,
        });

      if (profileError) throw profileError;

      // Create type-specific records and navigate to appropriate onboarding
      if (userType === 'player') {
        const { error: playerError } = await supabase.from('players').insert({
          user_id: user.id,
          country: 'United States',
          rating: 0,
          profile_visibility: 'public',
        });

        if (playerError && playerError.code !== '23505') { // Ignore duplicate key errors
          throw playerError;
        }

        navigate('/onboarding/player');
      } else if (userType === 'trainer') {
        // Create trainer record (will be fully set up in onboarding)
        const { error: trainerError } = await supabase.from('trainers').insert({
          user_id: user.id,
          sports: [],
          specializations: [],
          is_featured: false,
          featured_priority: 0,
        });

        if (trainerError && trainerError.code !== '23505') { // Ignore duplicate key errors
          throw trainerError;
        }

        navigate('/onboarding/trainer');
      } else {
        navigate('/onboarding/organization');
      }
    } catch (err) {
      console.error('Error saving user type:', err);
      setError(err instanceof Error ? err.message : 'Failed to save user type');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-[rgb(247,247,249)] flex flex-col items-center justify-center p-4">
        <Loader2 className="h-8 w-8 animate-spin text-[rgb(0,113,227)] mb-4" />
        <p className="text-[rgb(134,142,150)]">
          Loading...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-screen bg-[rgb(247,247,249)] relative overflow-hidden flex items-center justify-center">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-50/60 via-white to-slate-50" />

      <div className="relative z-10 w-full max-w-md px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/95 backdrop-blur-xl rounded-2xl p-8 border border-slate-200/60 shadow-xl"
        >
          {/* Logo */}
          <div className="text-center mb-6">
            <div className="mx-auto w-20 h-20 flex items-center justify-center mb-4">
              <img
                src="/rosterup-logo.png"
                alt="RosterUp Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="text-2xl font-bold text-[rgb(29,29,31)] mb-2">
              Welcome to RosterUp!
            </h1>
            <p className="text-[rgb(134,142,150)] text-sm">
              Let's set up your account
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* User Type Selection */}
          <div className="space-y-3 mb-6">
            <label className="block text-sm font-medium text-[rgb(29,29,31)]">
              Select Account Type
            </label>
            <div className="grid grid-cols-3 gap-3">
              <motion.button
                type="button"
                onClick={() => setUserType('organization')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "p-4 rounded-lg border-2 transition-all duration-200",
                  userType === 'organization'
                    ? 'bg-[rgb(0,113,227)]/10 border-[rgb(0,113,227)] shadow-sm'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                )}
              >
                <Building2 className={cn(
                  "w-6 h-6 mx-auto mb-1.5 transition-colors",
                  userType === 'organization' ? 'text-[rgb(0,113,227)]' : 'text-[rgb(134,142,150)]'
                )} />
                <p className={cn(
                  "font-semibold text-sm",
                  userType === 'organization' ? 'text-[rgb(0,113,227)]' : 'text-[rgb(29,29,31)]'
                )}>
                  Organization
                </p>
                <p className="text-xs text-[rgb(134,142,150)] mt-0.5">Manage teams</p>
              </motion.button>

              <motion.button
                type="button"
                onClick={() => setUserType('player')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "p-4 rounded-lg border-2 transition-all duration-200",
                  userType === 'player'
                    ? 'bg-[rgb(0,113,227)]/10 border-[rgb(0,113,227)] shadow-sm'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                )}
              >
                <Users className={cn(
                  "w-6 h-6 mx-auto mb-1.5 transition-colors",
                  userType === 'player' ? 'text-[rgb(0,113,227)]' : 'text-[rgb(134,142,150)]'
                )} />
                <p className={cn(
                  "font-semibold text-sm",
                  userType === 'player' ? 'text-[rgb(0,113,227)]' : 'text-[rgb(29,29,31)]'
                )}>
                  Player
                </p>
                <p className="text-xs text-[rgb(134,142,150)] mt-0.5">Find teams</p>
              </motion.button>

              <motion.button
                type="button"
                onClick={() => setUserType('trainer')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "p-4 rounded-lg border-2 transition-all duration-200",
                  userType === 'trainer'
                    ? 'bg-[rgb(0,113,227)]/10 border-[rgb(0,113,227)] shadow-sm'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                )}
              >
                <Award className={cn(
                  "w-6 h-6 mx-auto mb-1.5 transition-colors",
                  userType === 'trainer' ? 'text-[rgb(0,113,227)]' : 'text-[rgb(134,142,150)]'
                )} />
                <p className={cn(
                  "font-semibold text-sm",
                  userType === 'trainer' ? 'text-[rgb(0,113,227)]' : 'text-[rgb(29,29,31)]'
                )}>
                  Trainer
                </p>
                <p className="text-xs text-[rgb(134,142,150)] mt-0.5">Offer training</p>
              </motion.button>
            </div>
          </div>

          {/* Continue Button */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={handleContinue}
            disabled={!userType || loading}
            className="w-full relative group/button mt-6"
          >
            <div className="relative overflow-hidden bg-[rgb(0,113,227)] hover:bg-blue-600 disabled:bg-slate-300 text-white font-medium h-11 rounded-lg transition-all duration-300 flex items-center justify-center shadow-sm">
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/70 border-t-transparent rounded-full animate-spin" />
              ) : (
                <span className="text-sm font-medium">Continue</span>
              )}
            </div>
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
