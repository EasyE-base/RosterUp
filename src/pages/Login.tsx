import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { SignInCard } from '@/components/ui/sign-in-card';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (data: { email: string; password: string; rememberMe: boolean }) => {
    setError('');
    setLoading(true);

    try {
      const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (signInError) throw signInError;

      if (authData.user) {
        // TODO: Implement remember me functionality if needed
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SignInCard
      type="signin"
      onSubmit={handleSubmit}
      isLoading={loading}
      error={error}
      showRememberMe={true}
      showForgotPassword={true}
    />
  );
}
