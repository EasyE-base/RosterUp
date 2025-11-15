import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { AppleCard } from '@/components/apple/AppleCard';
import { AppleButton } from '@/components/apple/AppleButton';
import { AppleInput } from '@/components/apple/AppleInput';
import { AppleHeading } from '@/components/apple/AppleHeading';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      if (data.user) {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[rgb(251,251,253)] flex items-center justify-center px-4 py-24">
      <div className="relative w-full max-w-md">
        <AppleCard variant="elevated" padding="xl" animateOnView>
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <Link to="/" className="flex items-center">
              <img
                src="/rosterup-logo.PNG"
                alt="RosterUp Logo"
                className="h-48 w-auto hover:scale-105 transition-transform duration-300"
              />
            </Link>
          </div>

          {/* Title */}
          <div className="text-center mb-10">
            <AppleHeading level={1} size="card" className="mb-2">
              Welcome Back
            </AppleHeading>
            <p className="text-lg text-[rgb(86,88,105)]">Sign in to your account</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Alert */}
            {error && (
              <div className="p-4 bg-red-50 border-[1.5px] border-red-200 rounded-lg flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-red-600 text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Email Input */}
            <AppleInput
              id="email"
              type="email"
              label="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="coach@example.com"
              leftIcon={<Mail className="w-5 h-5" />}
              fullWidth
              required
            />

            {/* Password Input */}
            <div className="relative">
              <AppleInput
                id="password"
                type={showPassword ? 'text' : 'password'}
                label="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                leftIcon={<Lock className="w-5 h-5" />}
                fullWidth
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-[46px] -translate-y-1/2 text-[rgb(134,142,150)] hover:text-[rgb(86,88,105)] transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 border-[1.5px] border-slate-300 rounded text-[rgb(0,113,227)] focus:ring-2 focus:ring-[rgb(0,113,227)] focus:ring-offset-2"
                />
                <span className="ml-2 text-sm text-[rgb(86,88,105)]">Remember me</span>
              </label>
              <Link
                to="/forgot-password"
                className="text-sm text-[rgb(0,113,227)] hover:text-[rgb(0,98,204)] font-medium transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <AppleButton
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
              disabled={loading}
            >
              Sign In
            </AppleButton>
          </form>

          {/* Divider */}
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white text-[rgb(134,142,150)]">Or continue with</span>
              </div>
            </div>

            {/* OAuth Buttons */}
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button className="px-4 py-3 bg-white border-[1.5px] border-slate-200 text-[rgb(29,29,31)] rounded-lg hover:border-slate-300 hover:shadow-md transition-all duration-300 flex items-center justify-center space-x-2 font-medium">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <span>Google</span>
              </button>
              <button className="px-4 py-3 bg-white border-[1.5px] border-slate-200 text-[rgb(29,29,31)] rounded-lg hover:border-slate-300 hover:shadow-md transition-all duration-300 flex items-center justify-center space-x-2 font-medium">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                </svg>
                <span>GitHub</span>
              </button>
            </div>
          </div>

          {/* Sign Up Link */}
          <p className="mt-8 text-center text-sm text-[rgb(86,88,105)]">
            Don't have an account?{' '}
            <Link to="/signup" className="text-[rgb(0,113,227)] hover:text-[rgb(0,98,204)] font-semibold">
              Sign up for free
            </Link>
          </p>
        </AppleCard>
      </div>
    </div>
  );
}
