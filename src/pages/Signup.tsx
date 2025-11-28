import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, Users, User, Mail, Lock, Eye, EyeOff, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '@/lib/utils';

function Input({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      data-slot="input"
      className={cn(
        "flex h-9 w-full min-w-0 rounded-md border bg-white px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-[rgb(0,113,227)] focus-visible:ring-[rgb(0,113,227)]/20 focus-visible:ring-[3px]",
        "aria-invalid:ring-red-500/20 aria-invalid:border-red-500",
        className
      )}
      {...props}
    />
  )
}

export default function Signup() {
  const [userType, setUserType] = useState<'organization' | 'player' | 'trainer'>('organization');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [playerAge, setPlayerAge] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showParentVerificationNotice, setShowParentVerificationNotice] = useState(false);
  const navigate = useNavigate();
  const { signUp: authSignUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    if (!password) {
      setError('Password is required');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (!acceptedTerms) {
      setError('You must accept the Terms of Service and Privacy Policy');
      return;
    }

    if (userType === 'player' && !playerAge) {
      setError('Age is required for player accounts');
      return;
    }

    if (userType === 'player' && parseInt(playerAge) < 18 && !parentEmail) {
      setError('Parent/guardian email is required for players under 18');
      return;
    }

    setLoading(true);

    try {
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: email,
        password: password,
      });

      if (signUpError) throw signUpError;

      if (authData.user) {
        console.log('Creating profile for user:', authData.user.id);
        const { error: profileError } = await supabase.from('profiles').upsert({
          id: authData.user.id,
          email: email,
          full_name: name,
          user_type: userType,
        }, {
          onConflict: 'id'
        });

        if (profileError) {
          console.error('Profile creation error:', profileError);
          throw profileError;
        }
        console.log('Profile created successfully');

        if (userType === 'organization') {
          navigate('/onboarding/organization');
        } else if (userType === 'player') {
          // Create player_profile record (using the correct table)
          const { error: playerError } = await supabase.from('player_profiles').upsert({
            user_id: authData.user.id,
            sport: 'Softball', // Default sport, can be changed in profile
            parent_phone: parseInt(playerAge) < 18 ? parentEmail : null, // Store parent email in parent_phone field for now
            recruiting_status: 'open',
            is_visible_in_search: true,
            is_active: true,
          }, {
            onConflict: 'user_id'
          });

          if (playerError) {
            console.error('Player profile creation error:', playerError);
            throw playerError;
          }
          console.log('Player profile created successfully');

          // Show parent verification notice for players under 18
          if (parseInt(playerAge) < 18) {
            setShowParentVerificationNotice(true);
            setLoading(false);
          } else {
            // Profile is already created, go to complete profile page
            navigate('/player/profile/create');
          }
        } else if (userType === 'trainer') {
          // Create trainer record
          const { error: trainerError } = await supabase.from('trainers').insert({
            user_id: authData.user.id,
          });

          if (trainerError) throw trainerError;

          navigate('/onboarding/trainer');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-[rgb(247,247,249)] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-md"
        >
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl p-8">
            {/* Logo */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold" style={{ fontFamily: 'BaseballClub, sans-serif' }}>
                RosterUp
              </h1>
              <p className="text-sm text-[rgb(134,142,150)] mt-2">Create your account</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* User Type Selection */}
        <div className="space-y-3 mb-4">
          <label className="block text-sm font-medium text-[rgb(29,29,31)]">
            Account Type
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

        {/* Name Input */}
        <motion.div
          className={`relative ${focusedInput === "name" ? 'z-10' : ''}`}
          whileFocus={{ scale: 1.01 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-[rgb(29,29,31)] mb-1.5">
              {userType === 'organization' ? 'Organization Name' : 'Full Name'}
            </label>
            <div className="relative flex items-center">
              {userType === 'organization' ? (
                <Building2 className={`absolute left-3 w-4 h-4 transition-all duration-300 ${
                  focusedInput === "name" ? 'text-[rgb(0,113,227)]' : 'text-[rgb(134,142,150)]'
                }`} />
              ) : (
                <User className={`absolute left-3 w-4 h-4 transition-all duration-300 ${
                  focusedInput === "name" ? 'text-[rgb(0,113,227)]' : 'text-[rgb(134,142,150)]'
                }`} />
              )}
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onFocus={() => setFocusedInput("name")}
                onBlur={() => setFocusedInput(null)}
                placeholder={userType === 'organization' ? 'Youth Sports Academy' : 'John Doe'}
                required
                className="w-full border-slate-200 text-[rgb(29,29,31)] placeholder:text-[rgb(134,142,150)] h-10 pl-10 pr-3"
              />
            </div>
          </div>
        </motion.div>

        {/* Email Input */}
        <motion.div
          className={`relative ${focusedInput === "email" ? 'z-10' : ''}`}
          whileFocus={{ scale: 1.01 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-[rgb(29,29,31)] mb-1.5">
              Email
            </label>
            <div className="relative flex items-center">
              <Mail className={`absolute left-3 w-4 h-4 transition-all duration-300 ${
                focusedInput === "email" ? 'text-[rgb(0,113,227)]' : 'text-[rgb(134,142,150)]'
              }`} />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocusedInput("email")}
                onBlur={() => setFocusedInput(null)}
                placeholder="you@example.com"
                required
                className="w-full border-slate-200 text-[rgb(29,29,31)] placeholder:text-[rgb(134,142,150)] h-10 pl-10 pr-3"
              />
            </div>
          </div>
        </motion.div>

        {/* Password Input */}
        <motion.div
          className={`relative ${focusedInput === "password" ? 'z-10' : ''}`}
          whileFocus={{ scale: 1.01 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-[rgb(29,29,31)] mb-1.5">
              Password
            </label>
            <div className="relative flex items-center">
              <Lock className={`absolute left-3 w-4 h-4 transition-all duration-300 ${
                focusedInput === "password" ? 'text-[rgb(0,113,227)]' : 'text-[rgb(134,142,150)]'
              }`} />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocusedInput("password")}
                onBlur={() => setFocusedInput(null)}
                placeholder="Create a password"
                required
                className="w-full border-slate-200 text-[rgb(29,29,31)] placeholder:text-[rgb(134,142,150)] h-10 pl-10 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 cursor-pointer focus:outline-none"
              >
                {showPassword ? (
                  <Eye className="w-4 h-4 text-[rgb(134,142,150)] hover:text-[rgb(29,29,31)] transition-colors" />
                ) : (
                  <EyeOff className="w-4 h-4 text-[rgb(134,142,150)] hover:text-[rgb(29,29,31)] transition-colors" />
                )}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Player Information Section */}
        {userType === 'player' && (
          <div className="bg-[rgb(247,247,249)] border border-slate-200 rounded-lg p-4 mb-4">
            <h3 className="text-sm font-semibold text-[rgb(29,29,31)] mb-3">Player Information</h3>
            <div className="space-y-3">
              {/* Age Input */}
              <div>
                <label htmlFor="age" className="block text-sm font-medium text-[rgb(29,29,31)] mb-1.5">
                  Age
                </label>
                <Input
                  id="age"
                  type="number"
                  value={playerAge}
                  onChange={(e) => setPlayerAge(e.target.value)}
                  placeholder="14"
                  min="5"
                  max="100"
                  required
                  className="w-full border-slate-200"
                />
              </div>

              {/* Parent Email - shown only if under 18 */}
              {parseInt(playerAge) < 18 && playerAge !== '' && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-2"
                >
                  <div>
                    <label htmlFor="parentEmail" className="block text-sm font-medium text-[rgb(29,29,31)] mb-1.5">
                      Parent/Guardian Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgb(134,142,150)]" />
                      <Input
                        id="parentEmail"
                        type="email"
                        value={parentEmail}
                        onChange={(e) => setParentEmail(e.target.value)}
                        placeholder="parent@example.com"
                        required
                        className="w-full border-slate-200 pl-10"
                      />
                    </div>
                  </div>
                  <div className="flex items-start p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                    <span className="text-yellow-600 mr-2 text-xs">⚠</span>
                    <p className="text-xs text-yellow-700">
                      Parent/guardian consent will be required to complete registration
                    </p>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        )}

        {/* Confirm Password */}
        <motion.div
          className={`relative ${focusedInput === "confirmPassword" ? 'z-10' : ''} mb-4`}
          whileFocus={{ scale: 1.01 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-[rgb(29,29,31)] mb-1.5">
            Confirm Password
          </label>
          <div className="relative flex items-center">
            <Lock className={`absolute left-3 w-4 h-4 transition-all duration-300 ${
              focusedInput === "confirmPassword" ? 'text-[rgb(0,113,227)]' : 'text-[rgb(134,142,150)]'
            }`} />
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onFocus={() => setFocusedInput("confirmPassword")}
              onBlur={() => setFocusedInput(null)}
              placeholder="Confirm your password"
              required
              className="w-full border-slate-200 text-[rgb(29,29,31)] placeholder:text-[rgb(134,142,150)] h-10 pl-10 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 cursor-pointer focus:outline-none"
            >
              {showConfirmPassword ? (
                <Eye className="w-4 h-4 text-[rgb(134,142,150)] hover:text-[rgb(29,29,31)] transition-colors" />
              ) : (
                <EyeOff className="w-4 h-4 text-[rgb(134,142,150)] hover:text-[rgb(29,29,31)] transition-colors" />
              )}
            </button>
          </div>
        </motion.div>

        {/* Terms & Privacy */}
        <div className="flex items-start mb-4">
          <div className="relative flex items-start">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              checked={acceptedTerms}
              onChange={() => setAcceptedTerms(!acceptedTerms)}
              className="appearance-none h-4 w-4 mt-0.5 rounded border border-slate-300 bg-white checked:bg-[rgb(0,113,227)] checked:border-[rgb(0,113,227)] focus:outline-none focus:ring-2 focus:ring-[rgb(0,113,227)]/20 transition-all duration-200 cursor-pointer"
            />
            {acceptedTerms && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 flex items-center justify-center text-white pointer-events-none mt-0.5"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </motion.div>
            )}
          </div>
          <label htmlFor="terms" className="ml-2 text-xs text-[rgb(134,142,150)] cursor-pointer">
            I agree to the{' '}
            <Link to="/terms" className="text-[rgb(0,113,227)] hover:text-blue-600 font-medium">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link to="/privacy" className="text-[rgb(0,113,227)] hover:text-blue-600 font-medium">
              Privacy Policy
            </Link>
          </label>
        </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[rgb(0,113,227)] hover:bg-blue-600 text-white font-semibold rounded-lg transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed mt-6"
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </button>

              {/* Sign In Link */}
              <div className="text-center mt-4">
                <p className="text-sm text-[rgb(134,142,150)]">
                  Already have an account?{' '}
                  <Link to="/login" className="text-[rgb(0,113,227)] hover:text-blue-600 font-medium">
                    Sign in
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </motion.div>
      </div>

      {/* Parent Verification Notice Modal */}
      {showParentVerificationNotice && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border border-slate-200 rounded-2xl p-8 max-w-md w-full shadow-2xl"
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-yellow-600" />
              </div>
              <h2 className="text-2xl font-bold text-[rgb(29,29,31)] mb-2">Parent Verification Required</h2>
              <p className="text-[rgb(134,142,150)]">
                Since you're under 18, we've sent a verification email to{' '}
                <span className="text-[rgb(0,113,227)] font-semibold">{parentEmail}</span>
              </p>
            </div>

            <div className="bg-[rgb(247,247,249)] border border-slate-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-[rgb(29,29,31)] mb-3">
                Your parent or guardian needs to verify your account before you can continue. They will receive an email with instructions.
              </p>
              <p className="text-sm text-[rgb(134,142,150)]">
                Once verified, you can complete your profile and start finding teams!
              </p>
            </div>

            <button
              onClick={() => navigate('/onboarding/player')}
              className="w-full py-3 bg-[rgb(0,113,227)] hover:bg-blue-600 text-white font-semibold rounded-lg transition-all shadow-sm"
            >
              Continue to Profile Setup
            </button>

            <p className="text-xs text-[rgb(134,142,150)] text-center mt-4">
              Note: Your account will have limited access until parent verification is complete.
            </p>
          </motion.div>
        </div>
      )}
    </>
  );
}
