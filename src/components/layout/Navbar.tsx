import { Link } from 'react-router-dom';
import { Menu, X, Search } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import NotificationsDropdown from '../NotificationsDropdown';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const { user, organization, player, profile } = useAuth();

  useEffect(() => {
    const controlNavbar = () => {
      const currentScrollY = window.scrollY;
      const scrollDifference = Math.abs(currentScrollY - lastScrollY);

      if (currentScrollY < 100) {
        // Always show navbar at top of page
        setIsVisible(true);
      } else if (scrollDifference > 10) {
        // Only hide/show if scrolled more than 10px
        if (currentScrollY > lastScrollY) {
          // Scrolling down - hide navbar
          setIsVisible(false);
        } else {
          // Scrolling up - show navbar
          setIsVisible(true);
        }
        setLastScrollY(currentScrollY);
      }
    };

    window.addEventListener('scroll', controlNavbar);
    return () => window.removeEventListener('scroll', controlNavbar);
  }, [lastScrollY]);

  return (
    <nav
      className={`sticky w-full top-0 z-50 bg-transparent transition-transform duration-300 ${isVisible ? 'translate-y-0' : '-translate-y-full'
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-32">
          <Link to="/" className="group">
            <span className="text-4xl font-bold text-[rgb(29,29,31)] group-hover:text-[rgb(0,113,227)] transition-colors" style={{ fontFamily: 'BaseballClub, sans-serif' }}>
              RosterUp
            </span>
          </Link>

          {user && (
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search players, teams, events..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-900/50 border border-slate-800 rounded-lg text-slate-300 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>
          )}

          <div className="hidden md:flex items-center space-x-8">
            {user && (
              <>
                <Link to="/dashboard" className="text-slate-950 hover:text-slate-700 transition-colors font-medium">
                  Dashboard
                </Link>
                {/* Hide Tournaments and Tryouts for Trainers */}
                {profile && profile.user_type !== 'trainer' && (
                  <>
                    <Link to="/tournaments" className="text-slate-950 hover:text-slate-700 transition-colors font-medium">
                      Tournaments
                    </Link>
                    {organization && (
                      <Link to="/players" className="text-slate-950 hover:text-slate-700 transition-colors font-medium">
                        Players
                      </Link>
                    )}
                    <Link to="/tryouts" className="text-slate-950 hover:text-slate-700 transition-colors font-medium">
                      Tryouts
                    </Link>
                  </>
                )}
                <Link to="/calendar" className="text-slate-950 hover:text-slate-700 transition-colors font-medium">
                  Calendar
                </Link>
                <NotificationsDropdown />
              </>
            )}
            {!user ? (
              <>
                <Link
                  to="/login"
                  className="text-slate-950 hover:text-slate-700 transition-colors font-medium"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="px-5 py-2 rounded-lg bg-slate-950 text-white font-medium hover:bg-slate-800 transition-all"
                >
                  Get Started
                </Link>
              </>
            ) : null}
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-slate-950 hover:text-slate-700"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-white">
          <div className="px-4 py-4 space-y-3">
            {user && (
              <>
                <Link
                  to="/dashboard"
                  className="block px-4 py-2 text-slate-950 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-colors font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                {profile && profile.user_type !== 'trainer' && (
                  <>
                    <Link
                      to="/tournaments"
                      className="block px-4 py-2 text-slate-950 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-colors font-medium"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Tournaments
                    </Link>
                    {organization && (
                      <Link
                        to="/players"
                        className="block px-4 py-2 text-slate-950 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-colors font-medium"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Players
                      </Link>
                    )}
                    <Link
                      to="/tryouts"
                      className="block px-4 py-2 text-slate-950 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-colors font-medium"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Tryouts
                    </Link>
                  </>
                )}
                <Link
                  to="/calendar"
                  className="block px-4 py-2 text-slate-950 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-colors font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Calendar
                </Link>
                <Link
                  to="/profile"
                  className="block px-4 py-2 text-slate-950 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-colors font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Profile
                </Link>
                <Link
                  to="/settings"
                  className="block px-4 py-2 text-slate-950 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-colors font-medium"
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
                  className="block px-4 py-2 text-slate-950 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-colors font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="block px-4 py-2 text-center bg-slate-950 text-white font-medium rounded-lg hover:bg-slate-800 transition-all"
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
