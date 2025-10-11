import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import NotificationsDropdown from '../NotificationsDropdown';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useAuth();

  return (
    <nav className="fixed w-full top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-32">
          <Link to="/" className="flex items-center group">
            <img
              src="/rosterup-logo.PNG"
              alt="RosterUp Logo"
              className="h-28 w-auto group-hover:scale-105 transition-transform drop-shadow-[0_0_25px_rgba(59,130,246,0.7)]"
            />
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            {user && (
              <>
                <Link to="/dashboard" className="text-slate-300 hover:text-white transition-colors">
                  Dashboard
                </Link>
                <Link to="/tournaments" className="text-slate-300 hover:text-white transition-colors">
                  Tournaments
                </Link>
                <Link to="/players" className="text-slate-300 hover:text-white transition-colors">
                  Players
                </Link>
                <Link to="/tryouts" className="text-slate-300 hover:text-white transition-colors">
                  Tryouts
                </Link>
                <Link to="/calendar" className="text-slate-300 hover:text-white transition-colors">
                  Calendar
                </Link>
                <NotificationsDropdown />
              </>
            )}
            {!user ? (
              <>
                <Link
                  to="/login"
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="px-5 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-medium hover:shadow-lg hover:shadow-blue-500/50 transition-all"
                >
                  Get Started
                </Link>
              </>
            ) : null}
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-slate-300 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900/95 backdrop-blur-xl border-t border-slate-800">
          <div className="px-4 py-4 space-y-3">
            {user && (
              <>
                <Link
                  to="/dashboard"
                  className="block px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  to="/tournaments"
                  className="block px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Tournaments
                </Link>
                <Link
                  to="/players"
                  className="block px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Players
                </Link>
                <Link
                  to="/tryouts"
                  className="block px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Tryouts
                </Link>
                <Link
                  to="/calendar"
                  className="block px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Calendar
                </Link>
                <Link
                  to="/profile"
                  className="block px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Profile
                </Link>
                <Link
                  to="/settings"
                  className="block px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Settings
                </Link>
              </>
            )}
            {!user && (
              <>
                <Link
                  to="/login"
                  className="block px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="block px-4 py-2 text-center bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-medium rounded-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
