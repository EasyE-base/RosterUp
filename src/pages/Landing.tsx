import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, Easing } from 'framer-motion';
import { useRef } from 'react';
import {
  ArrowRight,
  Trophy,
  Calendar,
  MessageSquare,
  Star,
  Shield,
  Zap,
} from 'lucide-react';
import { UserTypeCard } from '@/components/UserTypeCard';

export default function Landing() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();

  // Apple-style custom easing
  const easeOutExpo: Easing = [0.16, 1, 0.3, 1];

  // Subtle parallax for background image only
  const imageY = useTransform(scrollY, [0, 500], [0, -50]);

  // Check for reduced motion preference
  const prefersReducedMotion = typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

  return (
    <div ref={containerRef} className="relative bg-white font-['-apple-system','BlinkMacSystemFont','SF_Pro_Display','Segoe_UI','Roboto','sans-serif']">
      {/* Hero Section - Static positioning with background image */}
      <section className="relative bg-white py-40 lg:py-48 px-6 md:px-8 lg:px-12 overflow-hidden">
        {/* Background image with subtle parallax */}
        <motion.div
          style={{ y: imageY }}
          className="absolute inset-0 z-0"
        >
          <img
            src="/hero-softball-player.png"
            alt="Softball player"
            className="w-full h-full object-cover object-right"
          />
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/20 to-transparent" />
        </motion.div>

        <div className="relative z-10 max-w-7xl mx-auto">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.6, ease: easeOutExpo, delay: 0.1 }}
            className="mb-6"
          >
            <span className="inline-block text-sm font-medium text-[rgb(86,88,105)] tracking-tight">
              Sports management, simplified
            </span>
          </motion.div>

          {/* Hero Heading - Apple-style typography */}
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.6, ease: easeOutExpo, delay: 0.2 }}
            className="text-6xl sm:text-7xl md:text-8xl lg:text-[96px] font-semibold mb-8 leading-[1.05] text-[rgb(29,29,31)] max-w-4xl"
            style={{ letterSpacing: '-0.04em', fontWeight: 600 }}
          >
            Unite your team
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.6, ease: easeOutExpo, delay: 0.3 }}
            className="text-xl md:text-2xl text-[rgb(86,88,105)] mb-12 max-w-2xl leading-relaxed"
            style={{ letterSpacing: '-0.011em' }}
          >
            Manage rosters, discover talent, and elevate your sports organization — all in one platform.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.6, ease: easeOutExpo, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-start sm:items-center gap-4"
          >
            <Link
              to="/signup"
              className="inline-flex items-center justify-center px-8 py-3.5 bg-[rgb(0,113,227)] text-white rounded-full font-semibold text-[15px] hover:bg-[rgb(0,98,204)] transition-all duration-300 shadow-sm hover:shadow-md active:scale-[0.98]"
              style={{ letterSpacing: '-0.01em' }}
            >
              Get started
            </Link>
            <Link
              to="/pricing"
              className="group inline-flex items-center text-[rgb(0,113,227)] hover:text-[rgb(0,98,204)] font-medium gap-1.5 transition-colors"
            >
              <span>Learn more</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Signup Cards Section */}
      <section className="relative py-28 px-6 md:px-8 lg:px-12 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.5 }}
            className="text-center mb-20"
          >
            <h2
              className="text-4xl sm:text-5xl lg:text-[56px] font-semibold text-[rgb(29,29,31)] mb-4 leading-[1.1]"
              style={{ letterSpacing: '-0.02em', fontWeight: 600 }}
            >
              Join RosterUp today
            </h2>
            <p className="text-lg text-[rgb(86,88,105)] max-w-2xl mx-auto">
              Choose your path
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {/* Player Card */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.5, ease: easeOutExpo, delay: 0.1 }}
            >
              <Link to="/player/profile/create" className="block h-full">
                <UserTypeCard
                  title="Player"
                  roleLabel="Role"
                  description="Showcase your skills, find tryouts, and connect with teams looking for talent."
                  image="https://images.unsplash.com/photo-1519058082700-08a0b56da9b4?auto=format&fit=crop&w=800&q=80"
                  color="bg-yellow-400"
                  onClick={() => { }} // Link handles navigation
                />
              </Link>
            </motion.div>

            {/* Organization Card - Featured */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.5, ease: easeOutExpo, delay: 0.2 }}
            >
              <Link to="/onboarding/organization" className="block h-full">
                <UserTypeCard
                  title="Organization"
                  roleLabel="Role"
                  description="Manage teams, discover players, organize tournaments, and streamline operations."
                  image="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=800&q=80"
                  color="bg-green-500"
                  onClick={() => { }} // Link handles navigation
                />
              </Link>
            </motion.div>

            {/* Trainer Card */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.5, ease: easeOutExpo, delay: 0.3 }}
            >
              <Link to="/signup" className="block h-full">
                <UserTypeCard
                  title="Trainer"
                  roleLabel="Role"
                  description="Offer your expertise, connect with athletes, and grow your training business."
                  image="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80"
                  color="bg-red-500"
                  onClick={() => { }} // Link handles navigation
                />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-24 px-6 md:px-8 lg:px-12 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.5 }}
            className="text-center mb-20"
          >
            <h2
              className="text-4xl sm:text-5xl lg:text-[56px] font-semibold text-[rgb(29,29,31)] mb-4 leading-[1.1]"
              style={{ letterSpacing: '-0.02em', fontWeight: 600 }}
            >
              Everything you need
            </h2>
            <p className="text-lg text-[rgb(86,88,105)] max-w-2xl mx-auto">
              Powerful features for modern sports management
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-12">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.5, delay: 0.1 }}
              className="p-8 rounded-2xl border border-slate-200/60 hover:border-slate-300/80 transition-all duration-300 bg-white"
            >
              <motion.div
                whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
                transition={{ duration: 0.2 }}
                className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-6"
              >
                <Trophy className="w-6 h-6 text-white" />
              </motion.div>
              <h3
                className="text-xl font-semibold text-[rgb(29,29,31)] mb-3"
                style={{ fontWeight: 600 }}
              >
                Team Management
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Organize rosters, track performance, and manage multiple teams with ease.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.5, delay: 0.2 }}
              className="p-8 rounded-2xl border border-slate-200/60 hover:border-slate-300/80 transition-all duration-300 bg-white"
            >
              <motion.div
                whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
                transition={{ duration: 0.2 }}
                className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl flex items-center justify-center mb-6"
              >
                <Calendar className="w-6 h-6 text-white" />
              </motion.div>
              <h3
                className="text-xl font-semibold text-[rgb(29,29,31)] mb-3"
                style={{ fontWeight: 600 }}
              >
                Smart Scheduling
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Coordinate games, practices, and tournaments with intelligent calendar tools.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.5, delay: 0.3 }}
              className="p-8 rounded-2xl border border-slate-200/60 hover:border-slate-300/80 transition-all duration-300 bg-white"
            >
              <motion.div
                whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
                transition={{ duration: 0.2 }}
                className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-6"
              >
                <MessageSquare className="w-6 h-6 text-white" />
              </motion.div>
              <h3
                className="text-xl font-semibold text-[rgb(29,29,31)] mb-3"
                style={{ fontWeight: 600 }}
              >
                Team Communication
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Stay connected with instant messaging and real-time updates for everyone.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="relative py-20 px-6 md:px-8 lg:px-12 bg-[rgb(251,251,253)]">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.5 }}
            >
              <div
                className="text-6xl font-semibold text-[rgb(0,113,227)] mb-2"
                style={{ fontWeight: 600 }}
              >
                10K+
              </div>
              <p className="text-slate-600 font-medium">Active Users</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.5, delay: 0.1 }}
            >
              <div
                className="text-6xl font-semibold text-[rgb(0,113,227)] mb-2"
                style={{ fontWeight: 600 }}
              >
                500+
              </div>
              <p className="text-slate-600 font-medium">Organizations</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.5, delay: 0.2 }}
            >
              <div
                className="text-6xl font-semibold text-[rgb(0,113,227)] mb-2"
                style={{ fontWeight: 600 }}
              >
                98%
              </div>
              <p className="text-slate-600 font-medium">Satisfaction Rate</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative py-32 px-6 md:px-8 lg:px-12 bg-white">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.6, ease: easeOutExpo }}
            className="bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500 rounded-3xl p-12 lg:p-16 text-center"
            style={{ boxShadow: '0 20px 60px rgba(0,113,227,0.20)' }}
          >
            <h2
              className="text-4xl sm:text-5xl lg:text-[56px] font-semibold text-white mb-6 leading-[1.1]"
              style={{ letterSpacing: '-0.02em', fontWeight: 600 }}
            >
              Ready to get started?
            </h2>
            <p className="text-lg text-blue-100 mb-10 max-w-2xl mx-auto leading-relaxed">
              Join thousands of teams using RosterUp
            </p>
            <Link
              to="/signup"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-[rgb(29,29,31)] font-semibold rounded-full hover:bg-slate-50 transition-all duration-300 shadow-lg hover:shadow-xl active:scale-[0.98]"
              style={{ letterSpacing: '-0.01em' }}
            >
              <span>Get started</span>
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>

            <div className="flex flex-wrap justify-center gap-8 mt-12">
              <div className="flex items-center space-x-2 text-white/95">
                <Star className="w-5 h-5 text-yellow-300 fill-yellow-300" />
                <span className="text-sm font-medium">4.9/5 Rating</span>
              </div>
              <div className="flex items-center space-x-2 text-white/95">
                <Shield className="w-5 h-5" />
                <span className="text-sm font-medium">Secure & Private</span>
              </div>
              <div className="flex items-center space-x-2 text-white/95">
                <Zap className="w-5 h-5" />
                <span className="text-sm font-medium">5-Min Setup</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
