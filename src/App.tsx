import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Header } from './components/ui/header-2';
import Footer from './components/layout/Footer';
import DashboardLayout from './components/layout/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';
import OnboardingCheck from './components/OnboardingCheck';
import ConfigError from './components/ConfigError';
import { appConfig } from './config/app.config';
import { ToastProvider } from './components/ui/Toast';
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
import TournamentGuestPlayers from './pages/TournamentGuestPlayers';
import TournamentEdit from './pages/TournamentEdit';
import OrganizationOnboarding from './pages/onboarding/OrganizationOnboarding';
import PlayerOnboarding from './pages/onboarding/PlayerOnboarding';
import SelectUserType from './pages/SelectUserType';
import WebsiteBuilder from './pages/WebsiteBuilder';
import WebsiteBuilderEditor from './pages/WebsiteBuilderEditor';
import PlayerMarketplace from './pages/marketplace/PlayerMarketplace';
import PlayerProfileView from './pages/player/PlayerProfileView';
import PlayerProfileCreate from './pages/player/PlayerProfileCreate';
import PlayerProfile from './pages/player/PlayerProfile';
import MyTeams from './pages/player/MyTeams';

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
          element={<Navigate to="/dashboard" replace />}
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
          path="/teams/:id"
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

        <Route
          path="/website-builder"
          element={
            <ProtectedRoute>
              <OnboardingCheck>
                <Header />
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
    </>
  );
}

export default App;
