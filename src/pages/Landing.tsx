import { Link } from 'react-router-dom';
import {
  Calendar,
  Users,
  MessageSquare,
  Trophy,
  Shield,
  Zap,
  ArrowRight,
  CheckCircle,
  Star,
} from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-slate-950">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block mb-4">
              <span className="px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-sm font-medium">
                The modern sports management platform
              </span>
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                Streamline your season.
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                Elevate your team.
              </span>
            </h1>
            <p className="text-xl text-slate-400 mb-10 max-w-3xl mx-auto leading-relaxed">
              The modern platform for youth sports organizations. Manage multiple teams, discover talented players, and streamline your operations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/signup"
                className="group px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-semibold rounded-lg hover:shadow-2xl hover:shadow-blue-500/50 transition-all flex items-center space-x-2"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/players"
                className="px-8 py-4 bg-slate-800/50 border border-slate-700 text-white font-semibold rounded-lg hover:bg-slate-800 transition-all"
              >
                Explore Players
              </Link>
            </div>
          </div>

          <div className="relative bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8 shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-400/5 rounded-2xl"></div>
            <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-700/50 hover:border-blue-500/50 transition-all">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mb-4">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">Team Management</h3>
                <p className="text-slate-400 text-sm">
                  Organize rosters, track attendance, and manage multiple teams effortlessly.
                </p>
              </div>

              <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-700/50 hover:border-cyan-400/50 transition-all">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-cyan-500 rounded-lg flex items-center justify-center mb-4">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">Smart Scheduling</h3>
                <p className="text-slate-400 text-sm">
                  Coordinate games, practices, and tryouts with an intelligent calendar system.
                </p>
              </div>

              <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-700/50 hover:border-blue-400/50 transition-all">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-500 rounded-lg flex items-center justify-center mb-4">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">Team Communication</h3>
                <p className="text-slate-400 text-sm">
                  Keep everyone connected with instant messaging and announcements.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-slate-900/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Built for sports organizations and athletes
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Everything you need to manage youth sports organizations, all in one place
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
            <div>
              <div className="inline-block px-4 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-sm font-medium mb-4">
                For Organizations
              </div>
              <h3 className="text-3xl font-bold text-white mb-6">
                Manage all your teams from one place
              </h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-blue-400 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="text-white font-semibold mb-1">Multi-Team Management</h4>
                    <p className="text-slate-400">
                      Manage multiple teams across different age groups and sports
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-blue-400 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="text-white font-semibold mb-1">Player Discovery</h4>
                    <p className="text-slate-400">
                      Find talented athletes with advanced filtering and search
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-blue-400 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="text-white font-semibold mb-1">Organization Dashboard</h4>
                    <p className="text-slate-400">
                      Track all teams, players, and events from one central hub
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl p-8 border border-slate-700/50">
              <div className="aspect-video bg-slate-900/50 rounded-lg flex items-center justify-center">
                <Trophy className="w-24 h-24 text-slate-600" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1 bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl p-8 border border-slate-700/50">
              <div className="aspect-video bg-slate-900/50 rounded-lg flex items-center justify-center">
                <Users className="w-24 h-24 text-slate-600" />
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="inline-block px-4 py-1 bg-cyan-400/10 border border-cyan-400/20 rounded-full text-cyan-400 text-sm font-medium mb-4">
                For Players
              </div>
              <h3 className="text-3xl font-bold text-white mb-6">
                Stay connected to the game
              </h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-cyan-400 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="text-white font-semibold mb-1">Find Tryouts</h4>
                    <p className="text-slate-400">
                      Discover opportunities with teams in your area and skill level
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-cyan-400 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="text-white font-semibold mb-1">Track Your Schedule</h4>
                    <p className="text-slate-400">
                      Never miss a game or practice with real-time calendar updates
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-cyan-400 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="text-white font-semibold mb-1">Stay Informed</h4>
                    <p className="text-slate-400">
                      Get instant notifications about schedule changes and team updates
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="bg-gradient-to-br from-blue-500/10 to-cyan-400/10 rounded-2xl border border-blue-500/20 p-12 text-center">
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to transform your organization?
            </h2>
            <p className="text-xl text-slate-300 mb-8">
              Join thousands of sports organizations already using RosterUp
            </p>
            <Link
              to="/signup"
              className="inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-semibold rounded-lg hover:shadow-2xl hover:shadow-blue-500/50 transition-all"
            >
              <span>Download RosterUp</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <div className="flex justify-center space-x-8 mt-8">
              <div className="flex items-center space-x-2 text-slate-400">
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                <span className="text-sm">4.9/5 Rating</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-400">
                <Shield className="w-5 h-5 text-blue-400" />
                <span className="text-sm">Secure & Private</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-400">
                <Zap className="w-5 h-5 text-cyan-400" />
                <span className="text-sm">Fast Setup</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
