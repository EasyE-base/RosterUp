import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { cn } from "@/lib/utils";
import { supabase } from '@/lib/supabase';

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground flex h-9 w-full min-w-0 rounded-md border bg-white px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-[rgb(0,113,227)] focus-visible:ring-[rgb(0,113,227)]/20 focus-visible:ring-[3px]",
        "aria-invalid:ring-red-500/20 aria-invalid:border-red-500",
        className
      )}
      {...props}
    />
  )
}

interface SignInCardProps {
  type?: 'signin' | 'signup';
  onSubmit: (data: any) => Promise<void>;
  isLoading?: boolean;
  error?: string;
  showRememberMe?: boolean;
  showForgotPassword?: boolean;
  children?: React.ReactNode;
}

export function SignInCard({
  type = 'signin',
  onSubmit,
  isLoading = false,
  error,
  showRememberMe = true,
  showForgotPassword = true,
  children
}: SignInCardProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);

  // For 3D card effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useTransform(mouseY, [-300, 300], [8, -8]);
  const rotateY = useTransform(mouseX, [-300, 300], [-8, 8]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left - rect.width / 2);
    mouseY.set(e.clientY - rect.top - rect.height / 2);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await onSubmit({ email, password, rememberMe });
  };

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/select-user-type`,
        },
      });

      if (error) {
        console.error('Google sign-in error:', error);
      }
    } catch (err) {
      console.error('Error signing in with Google:', err);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-[rgb(247,247,249)] relative overflow-hidden flex items-center justify-center">
      {/* Background gradient effect - subtle light theme */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-50/60 via-white to-slate-50" />

      {/* Subtle noise texture overlay */}
      <div className="absolute inset-0 opacity-[0.02] mix-blend-soft-light"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px'
        }}
      />

      {/* Top radial glow - subtle blue */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[120vh] h-[60vh] rounded-b-[50%] bg-blue-100/30 blur-[100px]" />
      <motion.div
        className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[100vh] h-[60vh] rounded-b-full bg-blue-50/40 blur-[80px]"
        animate={{
          opacity: [0.2, 0.35, 0.2],
          scale: [0.98, 1.02, 0.98]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          repeatType: "mirror"
        }}
      />

      {/* Animated glow spots */}
      <div className="absolute left-1/4 top-1/4 w-96 h-96 bg-blue-100/20 rounded-full blur-[120px] animate-pulse opacity-30" />
      <div className="absolute right-1/4 bottom-1/4 w-96 h-96 bg-slate-100/30 rounded-full blur-[120px] animate-pulse delay-1000 opacity-30" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md relative z-10 px-4"
        style={{ perspective: 1500 }}
      >
        <motion.div
          className="relative"
          style={{ rotateX, rotateY }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          whileHover={{ z: 10 }}
        >
          <div className="relative group">
            {/* Card glow effect */}
            <motion.div
              className="absolute -inset-[1px] rounded-2xl opacity-0 group-hover:opacity-60 transition-opacity duration-700"
              animate={{
                boxShadow: [
                  "0 0 15px 3px rgba(0,113,227,0.05)",
                  "0 0 20px 6px rgba(0,113,227,0.08)",
                  "0 0 15px 3px rgba(0,113,227,0.05)"
                ],
                opacity: [0.3, 0.5, 0.3]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
                repeatType: "mirror"
              }}
            />

            {/* Traveling light beam effect */}
            <div className="absolute -inset-[1px] rounded-2xl overflow-hidden">
              {/* Top beam */}
              <motion.div
                className="absolute top-0 left-0 h-[2px] w-[40%] bg-gradient-to-r from-transparent via-[rgb(0,113,227)] to-transparent opacity-60"
                initial={{ filter: "blur(1.5px)" }}
                animate={{
                  left: ["-40%", "100%"],
                  opacity: [0.4, 0.7, 0.4]
                }}
                transition={{
                  left: { duration: 3, ease: "easeInOut", repeat: Infinity, repeatDelay: 1.5 },
                  opacity: { duration: 1.5, repeat: Infinity, repeatType: "mirror" }
                }}
              />

              {/* Right beam */}
              <motion.div
                className="absolute top-0 right-0 h-[40%] w-[2px] bg-gradient-to-b from-transparent via-[rgb(0,113,227)] to-transparent opacity-60"
                animate={{
                  top: ["-40%", "100%"],
                  opacity: [0.4, 0.7, 0.4]
                }}
                transition={{
                  top: { duration: 3, ease: "easeInOut", repeat: Infinity, repeatDelay: 1.5, delay: 0.75 },
                  opacity: { duration: 1.5, repeat: Infinity, repeatType: "mirror", delay: 0.75 }
                }}
              />

              {/* Bottom beam */}
              <motion.div
                className="absolute bottom-0 right-0 h-[2px] w-[40%] bg-gradient-to-r from-transparent via-[rgb(0,113,227)] to-transparent opacity-60"
                animate={{
                  right: ["-40%", "100%"],
                  opacity: [0.4, 0.7, 0.4]
                }}
                transition={{
                  right: { duration: 3, ease: "easeInOut", repeat: Infinity, repeatDelay: 1.5, delay: 1.5 },
                  opacity: { duration: 1.5, repeat: Infinity, repeatType: "mirror", delay: 1.5 }
                }}
              />

              {/* Left beam */}
              <motion.div
                className="absolute bottom-0 left-0 h-[40%] w-[2px] bg-gradient-to-b from-transparent via-[rgb(0,113,227)] to-transparent opacity-60"
                animate={{
                  bottom: ["-40%", "100%"],
                  opacity: [0.4, 0.7, 0.4]
                }}
                transition={{
                  bottom: { duration: 3, ease: "easeInOut", repeat: Infinity, repeatDelay: 1.5, delay: 2.25 },
                  opacity: { duration: 1.5, repeat: Infinity, repeatType: "mirror", delay: 2.25 }
                }}
              />

              {/* Corner glow spots */}
              <motion.div
                className="absolute top-0 left-0 h-[6px] w-[6px] rounded-full bg-[rgb(0,113,227)]/50 blur-[2px]"
                animate={{ opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 2, repeat: Infinity, repeatType: "mirror" }}
              />
              <motion.div
                className="absolute top-0 right-0 h-[6px] w-[6px] rounded-full bg-[rgb(0,113,227)]/50 blur-[2px]"
                animate={{ opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 2.2, repeat: Infinity, repeatType: "mirror", delay: 0.5 }}
              />
              <motion.div
                className="absolute bottom-0 right-0 h-[6px] w-[6px] rounded-full bg-[rgb(0,113,227)]/50 blur-[2px]"
                animate={{ opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 2.4, repeat: Infinity, repeatType: "mirror", delay: 1 }}
              />
              <motion.div
                className="absolute bottom-0 left-0 h-[6px] w-[6px] rounded-full bg-[rgb(0,113,227)]/50 blur-[2px]"
                animate={{ opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 2.1, repeat: Infinity, repeatType: "mirror", delay: 1.5 }}
              />
            </div>

            {/* Card border glow */}
            <div className="absolute -inset-[0.5px] rounded-2xl bg-gradient-to-r from-[rgb(0,113,227)]/10 via-[rgb(0,113,227)]/20 to-[rgb(0,113,227)]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Glass card background */}
            <div className="relative bg-white/95 backdrop-blur-xl rounded-2xl p-8 border border-slate-200/60 shadow-xl overflow-hidden">
              {/* Subtle card inner patterns */}
              <div className="absolute inset-0 opacity-[0.02]"
                style={{
                  backgroundImage: `linear-gradient(135deg, rgb(0,113,227) 0.5px, transparent 0.5px), linear-gradient(45deg, rgb(0,113,227) 0.5px, transparent 0.5px)`,
                  backgroundSize: '30px 30px'
                }}
              />

              {/* Logo and header */}
              <div className="text-center space-y-2 mb-6">
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", duration: 0.8 }}
                  className="mx-auto w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 flex items-center justify-center"
                >
                  <img
                    src="/rosterup-logo.png"
                    alt="RosterUp Logo"
                    className="w-full h-full object-contain"
                  />
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-2xl font-bold text-[rgb(29,29,31)]"
                >
                  {type === 'signin' ? 'Welcome Back' : 'Create Account'}
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-[rgb(134,142,150)] text-sm"
                >
                  {type === 'signin'
                    ? 'Sign in to continue to RosterUp'
                    : 'Join RosterUp to get started'}
                </motion.p>
              </div>

              {/* Error message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
                >
                  {error}
                </motion.div>
              )}

              {/* Login form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Additional fields from children (for signup) */}
                {children}

                <motion.div className="space-y-3">
                  {/* Email input */}
                  <motion.div
                    className={`relative ${focusedInput === "email" ? 'z-10' : ''}`}
                    whileFocus={{ scale: 1.01 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    <div className="relative flex items-center overflow-hidden rounded-lg">
                      <Mail className={`absolute left-3 w-4 h-4 transition-all duration-300 ${
                        focusedInput === "email" ? 'text-[rgb(0,113,227)]' : 'text-[rgb(134,142,150)]'
                      }`} />

                      <Input
                        type="email"
                        placeholder="Email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onFocus={() => setFocusedInput("email")}
                        onBlur={() => setFocusedInput(null)}
                        required
                        className="w-full border-slate-200 text-[rgb(29,29,31)] placeholder:text-[rgb(134,142,150)] h-10 transition-all duration-300 pl-10 pr-3 hover:border-slate-300"
                      />
                    </div>
                  </motion.div>

                  {/* Password input */}
                  <motion.div
                    className={`relative ${focusedInput === "password" ? 'z-10' : ''}`}
                    whileFocus={{ scale: 1.01 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    <div className="relative flex items-center overflow-hidden rounded-lg">
                      <Lock className={`absolute left-3 w-4 h-4 transition-all duration-300 ${
                        focusedInput === "password" ? 'text-[rgb(0,113,227)]' : 'text-[rgb(134,142,150)]'
                      }`} />

                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onFocus={() => setFocusedInput("password")}
                        onBlur={() => setFocusedInput(null)}
                        required
                        className="w-full border-slate-200 text-[rgb(29,29,31)] placeholder:text-[rgb(134,142,150)] h-10 transition-all duration-300 pl-10 pr-10 hover:border-slate-300"
                      />

                      {/* Toggle password visibility */}
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 cursor-pointer focus:outline-none"
                      >
                        {showPassword ? (
                          <Eye className="w-4 h-4 text-[rgb(134,142,150)] hover:text-[rgb(29,29,31)] transition-colors duration-300" />
                        ) : (
                          <EyeOff className="w-4 h-4 text-[rgb(134,142,150)] hover:text-[rgb(29,29,31)] transition-colors duration-300" />
                        )}
                      </button>
                    </div>
                  </motion.div>
                </motion.div>

                {/* Remember me & Forgot password - only for signin */}
                {type === 'signin' && (showRememberMe || showForgotPassword) && (
                  <div className="flex items-center justify-between pt-1">
                    {showRememberMe && (
                      <div className="flex items-center space-x-2">
                        <div className="relative">
                          <input
                            id="remember-me"
                            name="remember-me"
                            type="checkbox"
                            checked={rememberMe}
                            onChange={() => setRememberMe(!rememberMe)}
                            className="appearance-none h-4 w-4 rounded border border-slate-300 bg-white checked:bg-[rgb(0,113,227)] checked:border-[rgb(0,113,227)] focus:outline-none focus:ring-2 focus:ring-[rgb(0,113,227)]/20 transition-all duration-200 cursor-pointer"
                          />
                          {rememberMe && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.5 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="absolute inset-0 flex items-center justify-center text-white pointer-events-none"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12"></polyline>
                              </svg>
                            </motion.div>
                          )}
                        </div>
                        <label htmlFor="remember-me" className="text-xs text-[rgb(134,142,150)] hover:text-[rgb(29,29,31)] transition-colors duration-200 cursor-pointer">
                          Remember me
                        </label>
                      </div>
                    )}

                    {showForgotPassword && (
                      <div className="text-xs relative group/link">
                        <Link to="/forgot-password" className="text-[rgb(134,142,150)] hover:text-[rgb(0,113,227)] transition-colors duration-200">
                          Forgot password?
                        </Link>
                      </div>
                    )}
                  </div>
                )}

                {/* Sign in/up button */}
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  type="submit"
                  disabled={isLoading}
                  className="w-full relative group/button mt-6"
                >
                  {/* Button glow effect */}
                  <div className="absolute inset-0 bg-[rgb(0,113,227)]/20 rounded-lg blur-lg opacity-0 group-hover/button:opacity-60 transition-opacity duration-300" />

                  <div className="relative overflow-hidden bg-[rgb(0,113,227)] hover:bg-blue-600 text-white font-medium h-11 rounded-lg transition-all duration-300 flex items-center justify-center shadow-sm">
                    <AnimatePresence mode="wait">
                      {isLoading ? (
                        <motion.div
                          key="loading"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center justify-center"
                        >
                          <div className="w-4 h-4 border-2 border-white/70 border-t-transparent rounded-full animate-spin" />
                        </motion.div>
                      ) : (
                        <motion.span
                          key="button-text"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center justify-center gap-2 text-sm font-medium"
                        >
                          {type === 'signin' ? 'Sign In' : 'Create Account'}
                          <ArrowRight className="w-4 h-4 group-hover/button:translate-x-1 transition-transform duration-300" />
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.button>

                {/* Divider */}
                <div className="relative mt-6 mb-6 flex items-center">
                  <div className="flex-grow border-t border-slate-200"></div>
                  <span className="mx-3 text-xs text-[rgb(134,142,150)]">or</span>
                  <div className="flex-grow border-t border-slate-200"></div>
                </div>

                {/* Google Sign In */}
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  type="button"
                  onClick={handleGoogleSignIn}
                  className="w-full relative group/google"
                >
                  <div className="relative overflow-hidden bg-white hover:bg-slate-50 text-[rgb(29,29,31)] font-medium h-11 rounded-lg border border-slate-200 hover:border-slate-300 transition-all duration-300 flex items-center justify-center gap-2 shadow-sm">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>

                    <span className="text-sm">
                      Sign {type === 'signin' ? 'in' : 'up'} with Google
                    </span>
                  </div>
                </motion.button>

                {/* Sign up/in link */}
                <motion.p
                  className="text-center text-sm text-[rgb(134,142,150)] mt-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  {type === 'signin' ? "Don't have an account?" : "Already have an account?"}{' '}
                  <Link
                    to={type === 'signin' ? '/signup' : '/login'}
                    className="relative inline-block group/signup"
                  >
                    <span className="relative z-10 text-[rgb(0,113,227)] hover:text-blue-600 transition-colors duration-300 font-medium">
                      {type === 'signin' ? 'Sign up' : 'Sign in'}
                    </span>
                    <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-[rgb(0,113,227)] group-hover/signup:w-full transition-all duration-300" />
                  </Link>
                </motion.p>
              </form>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
