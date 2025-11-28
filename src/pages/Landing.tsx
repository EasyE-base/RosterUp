import { Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, Easing } from 'framer-motion';
import { useRef } from 'react';
import {
  ArrowRight,
} from 'lucide-react';
import { UserTypeCard } from '@/components/UserTypeCard';
import BentoFeatureGrid from '@/components/landing/BentoFeatureGrid';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function Landing() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const navigate = useNavigate();
  const { user, organization, player, trainer } = useAuth();

  // Apple-style custom easing
  const easeOutExpo: Easing = [0.16, 1, 0.3, 1];

  // Subtle parallax for background image only
  const imageY = useTransform(scrollY, [0, 500], [0, -50]);

  // Check for reduced motion preference
  const prefersReducedMotion = typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

  // Handle role selection with existing role check
  const handleRoleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!user) return; // Not logged in, allow normal navigation

    // Check if user already has a role
    if (organization) {
      e.preventDefault();
      toast.error("You're already signed in as an Organization");
      navigate('/dashboard');
    } else if (player) {
      e.preventDefault();
      toast.error("You're already signed in as a Player");
      navigate('/dashboard');
    } else if (trainer) {
      e.preventDefault();
      toast.error("You're already signed in as a Trainer");
      navigate('/dashboard');
    }
    // If no role exists, allow normal navigation to continue
  };

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
          {/* Stronger gradient overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 to-transparent" />
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
              For Organizations, Athletes, & Trainers
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
            The complete sports ecosystem
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.6, ease: easeOutExpo, delay: 0.3 }}
            className="text-xl md:text-2xl text-[rgb(86,88,105)] mb-12 max-w-3xl leading-relaxed"
            style={{ letterSpacing: '-0.011em' }}
          >
            The all-in-one platform where organizations manage, athletes get recruited, and trainers build their business.
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
              <Link to="/player/profile/create" className="block h-full" onClick={handleRoleClick}>
                <UserTypeCard
                  title="Player"
                  roleLabel="Role"
                  description="Showcase your skills, find tryouts, and connect with teams looking for talent."
                  image="/card-player-color.png"
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
              <Link to="/onboarding/organization" className="block h-full" onClick={handleRoleClick}>
                <UserTypeCard
                  title="Organization"
                  roleLabel="Role"
                  description="Manage teams, discover players, organize tournaments, and streamline operations."
                  image="/card-org-logos.png"
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
              <Link to="/signup" className="block h-full" onClick={handleRoleClick}>
                <UserTypeCard
                  title="Trainer"
                  roleLabel="Role"
                  description="Offer your expertise, connect with athletes, and grow your training business."
                  image="/card-trainer-color.png"
                  onClick={() => { }} // Link handles navigation
                />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section - Bento Grid */}
      <BentoFeatureGrid />

    </div>
  );
}
