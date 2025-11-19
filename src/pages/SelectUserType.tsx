import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { UserTypeCard } from '@/components/UserTypeCard';

export default function SelectUserType() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user, profile, organization, player, trainer, loading: authLoading } = useAuth();

  // Redirect if not authenticated or already has complete setup
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      navigate('/login', { replace: true });
      return;
    }

    if (profile && (organization || player || trainer)) {
      navigate('/dashboard', { replace: true });
      return;
    }
  }, [user, profile, organization, player, trainer, navigate, authLoading]);

  const handleSelectType = async (type: 'organization' | 'player' | 'trainer') => {
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
          user_type: type,
        });

      if (profileError) throw profileError;

      // Create type-specific records and navigate to appropriate onboarding
      if (type === 'player') {
        const { error: playerError } = await supabase.from('players').insert({
          user_id: user.id,
          country: 'United States',
          rating: 0,
          profile_visibility: 'public',
        });

        if (playerError && playerError.code !== '23505') throw playerError;
        navigate('/onboarding/player');
      } else if (type === 'trainer') {
        const { error: trainerError } = await supabase.from('trainers').insert({
          user_id: user.id,
          sports: [],
          specializations: [],
          is_featured: false,
          featured_priority: 0,
        });

        if (trainerError && trainerError.code !== '23505') throw trainerError;
        navigate('/onboarding/trainer');
      } else {
        navigate('/onboarding/organization');
      }
    } catch (err) {
      console.error('Error saving user type:', err);
      setError(err instanceof Error ? err.message : 'Failed to save user type');
      setLoading(false);
    }
  };

  if (authLoading || !user || loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <Loader2 className="h-8 w-8 animate-spin text-[rgb(0,113,227)] mb-4" />
        <p className="text-[rgb(134,142,150)]">
          {loading ? 'Setting up your account...' : 'Loading...'}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-white relative overflow-x-hidden">
      {/* Header */}
      <div className="pt-20 pb-12 text-center px-4">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-bold text-[rgb(29,29,31)] mb-4 tracking-tight"
        >
          Join RosterUp today
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-xl text-[rgb(134,142,150)]"
        >
          Choose your path
        </motion.p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="max-w-md mx-auto mb-8 px-4">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm text-center">
            {error}
          </div>
        </div>
      )}

      {/* Cards Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">

          {/* Player Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="h-full"
          >
            <UserTypeCard
              title="Player"
              roleLabel="Role"
              description="Showcase your skills, find tryouts, and connect with teams looking for talent."
              image="https://images.unsplash.com/photo-1519058082700-08a0b56da9b4?auto=format&fit=crop&w=800&q=80"
              color="bg-yellow-400"
              onClick={() => handleSelectType('player')}
            />
          </motion.div>

          {/* Organization Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="h-full"
          >
            <UserTypeCard
              title="Organization"
              roleLabel="Role"
              description="Manage teams, discover players, organize tournaments, and streamline operations."
              image="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=800&q=80"
              color="bg-green-500"
              onClick={() => handleSelectType('organization')}
            />
          </motion.div>

          {/* Trainer Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="h-full"
          >
            <UserTypeCard
              title="Trainer"
              roleLabel="Role"
              description="Offer your expertise, connect with athletes, and grow your training business."
              image="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80"
              color="bg-red-500"
              onClick={() => handleSelectType('trainer')}
            />
          </motion.div>

        </div>
      </div>
    </div>
  );
}
