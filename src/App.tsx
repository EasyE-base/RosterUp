import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from './components/ui/header-2';
import Footer from './components/layout/Footer';
import DashboardLayout from './components/layout/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';
import OnboardingCheck from './components/OnboardingCheck';
import ConfigError from './components/ConfigError';
import { appConfig } from './config/app.config';
import { ToastProvider } from './components/ui/Toast';
import { Loader2 } from 'lucide-react';

// Critical pages (not lazy loaded)
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';

// Lazy loaded pages for better performance
const Dashboard = lazy(() => import('./pages/Dashboard'));
// const Players = lazy(() => import('./pages/Players'));
const Calendar = lazy(() => import('./pages/Calendar'));
const Tryouts = lazy(() => import('./pages/Tryouts'));
const Messages = lazy(() => import('./pages/Messages'));
const Pricing = lazy(() => import('./pages/Pricing'));
const About = lazy(() => import('./pages/About'));
const Blog = lazy(() => import('./pages/Blog'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));
const CookiePolicy = lazy(() => import('./pages/CookiePolicy'));
const TeamCreate = lazy(() => import('./pages/TeamCreate'));
const TeamDetails = lazy(() => import('./pages/TeamDetails'));
const TeamProfile = lazy(() => import('./pages/TeamProfile'));
const TeamsMarketplace = lazy(() => import('./pages/TeamsMarketplace'));
const Profile = lazy(() => import('./pages/Profile'));
const Settings = lazy(() => import('./pages/Settings'));
const TryoutApplications = lazy(() => import('./pages/TryoutApplications'));
const Tournaments = lazy(() => import('./pages/Tournaments'));
const TournamentCreate = lazy(() => import('./pages/TournamentCreate'));
const TournamentDetails = lazy(() => import('./pages/TournamentDetails'));
const TournamentApplications = lazy(() => import('./pages/TournamentApplications'));
const TournamentGuestPlayers = lazy(() => import('./pages/TournamentGuestPlayers'));
const TournamentEdit = lazy(() => import('./pages/TournamentEdit'));
const OrganizationOnboarding = lazy(() => import('./pages/onboarding/OrganizationOnboarding'));
const PlayerOnboarding = lazy(() => import('./pages/onboarding/PlayerOnboarding'));
const TrainerOnboarding = lazy(() => import('./pages/onboarding/TrainerOnboarding'));
const SelectUserType = lazy(() => import('./pages/SelectUserType'));
// Website builder removed - users can add website URL in settings
const PlayerMarketplace = lazy(() => import('./pages/marketplace/PlayerMarketplace'));
const PlayerProfileView = lazy(() => import('./pages/player/PlayerProfileView'));
const PlayerProfileCreate = lazy(() => import('./pages/player/PlayerProfileCreate'));
const PlayerProfile = lazy(() => import('./pages/player/PlayerProfile'));
const MyTeams = lazy(() => import('./pages/player/MyTeams'));
const SessionCreate = lazy(() => import('./pages/trainer/SessionCreate'));
const SessionEdit = lazy(() => import('./pages/trainer/SessionEdit'));
const TrainerSessions = lazy(() => import('./pages/trainer/TrainerSessions'));
const SessionBookings = lazy(() => import('./pages/trainer/SessionBookings'));
const TrainerAvailability = lazy(() => import('./pages/trainer/TrainerAvailability'));
const TrainerMarketplace = lazy(() => import('./pages/marketplace/TrainerMarketplace'));
const TrainerProfileView = lazy(() => import('./pages/trainer/TrainerProfileView'));
const TrainerProfileEdit = lazy(() => import('./pages/trainer/TrainerProfileEdit'));

// Loading fallback component
function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[rgb(247,247,249)]">
      <Loader2 className="w-8 h-8 animate-spin text-[rgb(0,113,227)]" />
    </div>
  );
}

function App() {
  // Check if Supabase is configured
  const isConfigured = appConfig.supabase.url && appConfig.supabase.anonKey;

  if (!isConfigured) {
    return <ConfigError message="Supabase credentials are not configured. Please set up your environment variables." />;
  }

  return (
    <>
      <ToastProvider />
      <Router>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route
              path="/"
              element={
                <>
                  <Header />
                  <Landing />
                  <Footer />
                </>
              }
            />

            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            <Route
              path="/select-user-type"
              element={<SelectUserType />}
            />

            <Route
              path="/onboarding/organization"
              element={
                <ProtectedRoute>
                  <OrganizationOnboarding />
                </ProtectedRoute>
              }
            />

            <Route
              path="/onboarding/player"
              element={
                <ProtectedRoute>
                  <PlayerOnboarding />
                </ProtectedRoute>
              }
            />

            <Route
              path="/onboarding/trainer"
              element={
                <ProtectedRoute>
                  <TrainerOnboarding />
                </ProtectedRoute>
              }
            />

            <Route
              path="/pricing"
              element={
                <>
                  <Header />
                  <Pricing />
                  <Footer />
                </>
              }
            />

            <Route
              path="/about"
              element={
                <>
                  <Header />
                  <About />
                  <Footer />
                </>
              }
            />

            <Route
              path="/blog"
              element={
                <>
                  <Header />
                  <Blog />
                  <Footer />
                </>
              }
            />

            <Route
              path="/privacy"
              element={
                <>
                  <Header />
                  <PrivacyPolicy />
                  <Footer />
                </>
              }
            />

            <Route
              path="/terms"
              element={
                <>
                  <Header />
                  <TermsOfService />
                  <Footer />
                </>
              }
            />

            <Route
              path="/cookies"
              element={
                <>
                  <Header />
                  <CookiePolicy />
                  <Footer />
                </>
              }
            />

            <Route
              path="/players"
              element={
                <>
                  <Header />
                  <PlayerMarketplace />
                  <Footer />
                </>
              }
            />

            <Route
              path="/players/:id"
              element={
                <>
                  <Header />
                  <PlayerProfileView />
                  <Footer />
                </>
              }
            />

            <Route
              path="/trainers"
              element={
                <>
                  <Header />
                  <TrainerMarketplace />
                  <Footer />
                </>
              }
            />

            <Route
              path="/trainers/:id"
              element={
                <>
                  <Header />
                  <TrainerProfileView />
                  <Footer />
                </>
              }
            />

            <Route
              path="/player/profile/create"
              element={
                <ProtectedRoute>
                  <Header />
                  <PlayerProfileCreate />
                  <Footer />
                </ProtectedRoute>
              }
            />

            <Route
              path="/player/profile"
              element={
                <ProtectedRoute>
                  <OnboardingCheck>
                    <Header />
                    <PlayerProfile />
                    <Footer />
                  </OnboardingCheck>
                </ProtectedRoute>
              }
            />

            <Route
              path="/player/teams"
              element={
                <ProtectedRoute>
                  <OnboardingCheck>
                    <Header />
                    <DashboardLayout>
                      <MyTeams />
                    </DashboardLayout>
                  </OnboardingCheck>
                </ProtectedRoute>
              }
            />

            <Route
              path="/tryouts"
              element={
                <>
                  <Header />
                  <Tryouts />
                  <Footer />
                </>
              }
            />

            <Route
              path="/tournaments"
              element={
                <>
                  <Header />
                  <Tournaments />
                  <Footer />
                </>
              }
            />

            <Route
              path="/tournaments/create"
              element={
                <ProtectedRoute>
                  <OnboardingCheck>
                    <Header />
                    <TournamentCreate />
                    <Footer />
                  </OnboardingCheck>
                </ProtectedRoute>
              }
            />

            <Route
              path="/tournaments/:id"
              element={
                <>
                  <Header />
                  <TournamentDetails />
                  <Footer />
                </>
              }
            />

            <Route
              path="/tournaments/:id/edit"
              element={
                <ProtectedRoute>
                  <OnboardingCheck>
                    <Header />
                    <TournamentEdit />
                    <Footer />
                  </OnboardingCheck>
                </ProtectedRoute>
              }
            />

            <Route
              path="/tournaments/:id/applications"
              element={
                <ProtectedRoute>
                  <OnboardingCheck>
                    <Header />
                    <TournamentApplications />
                    <Footer />
                  </OnboardingCheck>
                </ProtectedRoute>
              }
            />

            <Route
              path="/tournaments/:id/guest-players"
              element={
                <ProtectedRoute>
                  <OnboardingCheck>
                    <Header />
                    <TournamentGuestPlayers />
                    <Footer />
                  </OnboardingCheck>
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <OnboardingCheck>
                    <Header />
                    <DashboardLayout>
                      <Dashboard />
                    </DashboardLayout>
                  </OnboardingCheck>
                </ProtectedRoute>
              }
            />

            <Route
              path="/sessions/create"
              element={
                <ProtectedRoute>
                  <OnboardingCheck>
                    <Header />
                    <SessionCreate />
                    <Footer />
                  </OnboardingCheck>
                </ProtectedRoute>
              }
            />

            <Route
              path="/sessions"
              element={
                <ProtectedRoute>
                  <OnboardingCheck>
                    <Header />
                    <TrainerSessions />
                    <Footer />
                  </OnboardingCheck>
                </ProtectedRoute>
              }
            />

            <Route
              path="/sessions/:id/edit"
              element={
                <ProtectedRoute>
                  <OnboardingCheck>
                    <Header />
                    <SessionEdit />
                    <Footer />
                  </OnboardingCheck>
                </ProtectedRoute>
              }
            />

            <Route
              path="/trainer/profile"
              element={
                <ProtectedRoute>
                  <OnboardingCheck>
                    <Header />
                    <TrainerProfileEdit />
                    <Footer />
                  </OnboardingCheck>
                </ProtectedRoute>
              }
            />

            <Route
              path="/bookings"
              element={
                <ProtectedRoute>
                  <OnboardingCheck>
                    <Header />
                    <SessionBookings />
                    <Footer />
                  </OnboardingCheck>
                </ProtectedRoute>
              }
            />

            <Route
              path="/trainer/availability"
              element={
                <ProtectedRoute>
                  <OnboardingCheck>
                    <Header />
                    <TrainerAvailability />
                    <Footer />
                  </OnboardingCheck>
                </ProtectedRoute>
              }
            />

            <Route
              path="/messages"
              element={
                <ProtectedRoute>
                  <OnboardingCheck>
                    <Header />
                    <Messages />
                    <Footer />
                  </OnboardingCheck>
                </ProtectedRoute>
              }
            />

            <Route
              path="/calendar"
              element={
                <ProtectedRoute>
                  <OnboardingCheck>
                    <Header />
                    <Calendar />
                    <Footer />
                  </OnboardingCheck>
                </ProtectedRoute>
              }
            />

            <Route
              path="/teams"
              element={
                <>
                  <Header />
                  <TeamsMarketplace />
                  <Footer />
                </>
              }
            />

            <Route
              path="/teams/new"
              element={
                <ProtectedRoute>
                  <OnboardingCheck>
                    <Header />
                    <TeamCreate />
                    <Footer />
                  </OnboardingCheck>
                </ProtectedRoute>
              }
            />

            <Route
              path="/teams/:teamId"
              element={
                <>
                  <Header />
                  <TeamProfile />
                  <Footer />
                </>
              }
            />

            <Route
              path="/teams/:id/manage"
              element={
                <ProtectedRoute>
                  <OnboardingCheck>
                    <Header />
                    <TeamDetails />
                    <Footer />
                  </OnboardingCheck>
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <OnboardingCheck>
                    <Header />
                    <Profile />
                    <Footer />
                  </OnboardingCheck>
                </ProtectedRoute>
              }
            />

            <Route
              path="/tryouts/:id/applications"
              element={
                <ProtectedRoute>
                  <OnboardingCheck>
                    <Header />
                    <TryoutApplications />
                    <Footer />
                  </OnboardingCheck>
                </ProtectedRoute>
              }
            />

            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <OnboardingCheck>
                    <Header />
                    <Settings />
                    <Footer />
                  </OnboardingCheck>
                </ProtectedRoute>
              }
            />

            {/* Website builder routes removed - see Settings for website URL */}

          </Routes>
        </Suspense>
      </Router>
    </>
  );
}

export default App;
