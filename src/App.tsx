import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import DashboardLayout from './components/layout/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';
import OnboardingCheck from './components/OnboardingCheck';
import ConfigError from './components/ConfigError';
import { appConfig } from './config/app.config';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Players from './pages/Players';
import Calendar from './pages/Calendar';
import Tryouts from './pages/Tryouts';
import Messages from './pages/Messages';
import Pricing from './pages/Pricing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import TeamCreate from './pages/TeamCreate';
import TeamDetails from './pages/TeamDetails';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import TryoutApplications from './pages/TryoutApplications';
import Tournaments from './pages/Tournaments';
import TournamentCreate from './pages/TournamentCreate';
import TournamentDetails from './pages/TournamentDetails';
import TournamentApplications from './pages/TournamentApplications';
import TournamentEdit from './pages/TournamentEdit';
import OrganizationOnboarding from './pages/onboarding/OrganizationOnboarding';
import PlayerOnboarding from './pages/onboarding/PlayerOnboarding';
import WebsiteBuilder from './pages/WebsiteBuilder';
import WebsiteBuilderEditor from './pages/WebsiteBuilderEditor';

function App() {
  // Check if Supabase is configured
  const isConfigured = appConfig.supabase.url && appConfig.supabase.anonKey;

  if (!isConfigured) {
    return <ConfigError message="Supabase credentials are not configured. Please set up your environment variables." />;
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <>
              <Navbar />
              <Landing />
              <Footer />
            </>
          }
        />

        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

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
          path="/pricing"
          element={
            <>
              <Navbar />
              <Pricing />
              <Footer />
            </>
          }
        />

        <Route
          path="/players"
          element={
            <>
              <Navbar />
              <Players />
              <Footer />
            </>
          }
        />

        <Route
          path="/tryouts"
          element={
            <>
              <Navbar />
              <Tryouts />
              <Footer />
            </>
          }
        />

        <Route
          path="/tournaments"
          element={
            <>
              <Navbar />
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
                <Navbar />
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
              <Navbar />
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
                <Navbar />
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
                <Navbar />
                <TournamentApplications />
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
                <Navbar />
                <DashboardLayout>
                  <Dashboard />
                </DashboardLayout>
              </OnboardingCheck>
            </ProtectedRoute>
          }
        />

        <Route
          path="/messages"
          element={
            <ProtectedRoute>
              <OnboardingCheck>
                <Navbar />
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
                <Navbar />
                <Calendar />
                <Footer />
              </OnboardingCheck>
            </ProtectedRoute>
          }
        />

        <Route
          path="/teams/new"
          element={
            <ProtectedRoute>
              <OnboardingCheck>
                <Navbar />
                <TeamCreate />
                <Footer />
              </OnboardingCheck>
            </ProtectedRoute>
          }
        />

        <Route
          path="/teams/:id"
          element={
            <ProtectedRoute>
              <OnboardingCheck>
                <Navbar />
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
                <Navbar />
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
                <Navbar />
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
                <Navbar />
                <Settings />
                <Footer />
              </OnboardingCheck>
            </ProtectedRoute>
          }
        />

        <Route
          path="/website-builder"
          element={
            <ProtectedRoute>
              <OnboardingCheck>
                <Navbar />
                <WebsiteBuilder />
                <Footer />
              </OnboardingCheck>
            </ProtectedRoute>
          }
        />

        <Route
          path="/website-builder/page/:pageId"
          element={
            <ProtectedRoute>
              <OnboardingCheck>
                <WebsiteBuilderEditor />
              </OnboardingCheck>
            </ProtectedRoute>
          }
        />

      </Routes>
    </Router>
  );
}

export default App;
