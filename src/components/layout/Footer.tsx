import { Link } from 'react-router-dom';
import { Trophy, Mail, Twitter, Facebook, Instagram } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-to-br from-blue-500 to-cyan-400 p-2 rounded-lg">
                <Trophy className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                RosterUp
              </span>
            </div>
            <p className="text-slate-400 text-sm">
              Streamline your season. Always free for organizations.
            </p>
            <div className="flex space-x-3">
              <a href="#" className="text-slate-400 hover:text-blue-400 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-slate-400 hover:text-blue-400 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-slate-400 hover:text-blue-400 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-slate-400 hover:text-blue-400 transition-colors">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/dashboard" className="text-slate-400 hover:text-white text-sm transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/players" className="text-slate-400 hover:text-white text-sm transition-colors">
                  Player Discovery
                </Link>
              </li>
              <li>
                <Link to="/tryouts" className="text-slate-400 hover:text-white text-sm transition-colors">
                  Tryouts
                </Link>
              </li>
              <li>
                <Link to="/calendar" className="text-slate-400 hover:text-white text-sm transition-colors">
                  Calendar
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-slate-400 hover:text-white text-sm transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-400 hover:text-white text-sm transition-colors">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-400 hover:text-white text-sm transition-colors">
                  Careers
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-400 hover:text-white text-sm transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-slate-400 hover:text-white text-sm transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-400 hover:text-white text-sm transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-400 hover:text-white text-sm transition-colors">
                  Cookie Policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800/50 text-center text-slate-400 text-sm">
          <p>&copy; 2025 RosterUp. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
