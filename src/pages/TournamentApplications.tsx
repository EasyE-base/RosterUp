import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Trophy,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowLeft,
  Loader2,
  Building2,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, TournamentApplication } from '../lib/supabase';
import {
  AppleButton,
  AppleCard,
  AppleCardContent,
  AppleHeading,
  AppleAvatar,
  AppleBadge,
  AppleStatCard,
  AppleEmptyState,
} from '../components/apple';

interface ApplicationWithOrg extends TournamentApplication {
  organizations: {
    name: string;
    city: string | null;
    state: string | null;
    logo_url: string | null;
  };
}

export default function TournamentApplications() {
  const { id } = useParams<{ id: string }>();
  const [applications, setApplications] = useState<ApplicationWithOrg[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [tournamentTitle, setTournamentTitle] = useState('');
  const { organization } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      loadApplications();
      loadTournamentInfo();
    }
  }, [id]);

  const loadTournamentInfo = async () => {
    try {
      const { data, error } = await supabase
        .from('tournaments')
        .select('title, organization_id')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;

      if (!data || (organization && data.organization_id !== organization.id)) {
        navigate('/tournaments');
        return;
      }

      setTournamentTitle(data.title);
    } catch (error) {
      console.error('Error loading tournament:', error);
      navigate('/tournaments');
    }
  };

  const loadApplications = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tournament_applications')
        .select('*, organizations(name, city, state, logo_url)')
        .eq('tournament_id', id)
        .order('applied_at', { ascending: false });

      if (error) throw error;

      setApplications((data as ApplicationWithOrg[]) || []);
    } catch (error) {
      console.error('Error loading applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (applicationId: string, newStatus: string) => {
    setProcessing(applicationId);

    try {
      const { error } = await supabase
        .from('tournament_applications')
        .update({
          status: newStatus,
          reviewed_at: new Date().toISOString(),
          reviewed_by: organization?.user_id,
        })
        .eq('id', applicationId);

      if (error) throw error;

      if (newStatus === 'accepted') {
        const application = applications.find((app) => app.id === applicationId);
        if (application) {
          await supabase.from('tournament_participants').insert({
            tournament_id: id,
            organization_id: application.organization_id,
            team_id: application.team_id,
          });
        }
      }

      loadApplications();
    } catch (error) {
      console.error('Error updating application:', error);
    } finally {
      setProcessing(null);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getStatusVariant = (status: string): "default" | "success" | "warning" | "danger" | "info" | "primary" | "purple" | "outline" => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'accepted':
        return 'success';
      case 'rejected':
        return 'danger';
      case 'waitlist':
        return 'info';
      case 'withdrawn':
        return 'default';
      default:
        return 'default';
    }
  };

  const pendingApplications = applications.filter((app) => app.status === 'pending');
  const reviewedApplications = applications.filter((app) => app.status !== 'pending');

  if (loading) {
    return (
      <div className="min-h-screen bg-[rgb(251,251,253)] pt-32 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[rgb(0,113,227)]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[rgb(251,251,253)] pt-32 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate(`/tournaments/${id}`)}
          className="flex items-center space-x-2 text-[rgb(134,142,150)] hover:text-[rgb(29,29,31)] mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to tournament</span>
        </button>

        <div className="mb-8">
          <AppleHeading level={1} size="card" className="mb-2">Tournament Applications</AppleHeading>
          <p className="text-[rgb(134,142,150)] text-lg">{tournamentTitle}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <AppleStatCard
            label="Pending Review"
            value={pendingApplications.length}
            icon={<Clock className="w-6 h-6" />}
            iconColor="yellow"
          />
          <AppleStatCard
            label="Accepted"
            value={applications.filter((app) => app.status === 'accepted').length}
            icon={<CheckCircle2 className="w-6 h-6" />}
            iconColor="green"
          />
          <AppleStatCard
            label="Total Applications"
            value={applications.length}
            icon={<Users className="w-6 h-6" />}
            iconColor="blue"
          />
        </div>

        {pendingApplications.length > 0 && (
          <div className="mb-8">
            <AppleHeading level={2} size="feature" className="mb-4">Pending Applications</AppleHeading>
            <div className="space-y-4">
              {pendingApplications.map((application) => (
                <AppleCard key={application.id}>
                  <AppleCardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                      <div className="flex-1">
                        <div className="flex items-start space-x-4 mb-4">
                          <AppleAvatar
                            src={application.organizations.logo_url || undefined}
                            name={application.organizations.name}
                            alt={application.organizations.name}
                            size="lg"
                          />
                          <div className="flex-1">
                            <AppleHeading level={3} size="body" className="mb-1">
                              {application.organizations.name}
                            </AppleHeading>
                            <div className="flex items-center space-x-2 text-[rgb(134,142,150)] text-sm">
                              <Building2 className="w-4 h-4" />
                              <span>
                                {application.organizations.city}
                                {application.organizations.state &&
                                  `, ${application.organizations.state}`}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-[rgb(134,142,150)] mb-1">Applied</p>
                            <p className="text-[rgb(29,29,31)] font-medium">{formatDate(application.applied_at)}</p>
                          </div>

                          {application.roster_size && (
                            <div>
                              <p className="text-sm text-[rgb(134,142,150)] mb-1">Roster Size</p>
                              <p className="text-[rgb(29,29,31)] font-medium">{application.roster_size} players</p>
                            </div>
                          )}

                          {application.experience_level && (
                            <div>
                              <p className="text-sm text-[rgb(134,142,150)] mb-1">Experience Level</p>
                              <p className="text-[rgb(29,29,31)] font-medium capitalize">{application.experience_level}</p>
                            </div>
                          )}
                        </div>

                        {application.application_notes && (
                          <div className="bg-[rgb(245,245,247)] rounded-lg p-4">
                            <p className="text-sm text-[rgb(134,142,150)] mb-2">Notes from organization</p>
                            <p className="text-[rgb(29,29,31)]">{application.application_notes}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col space-y-2 lg:w-48">
                        <AppleButton
                          variant="primary"
                          onClick={() => handleUpdateStatus(application.id, 'accepted')}
                          disabled={processing === application.id}
                          loading={processing === application.id}
                          className="bg-green-500 hover:bg-green-600"
                          leftIcon={!processing && <CheckCircle2 className="w-4 h-4" />}
                        >
                          Accept
                        </AppleButton>
                        <AppleButton
                          variant="primary"
                          onClick={() => handleUpdateStatus(application.id, 'rejected')}
                          disabled={processing === application.id}
                          loading={processing === application.id}
                          className="bg-red-500 hover:bg-red-600"
                          leftIcon={!processing && <XCircle className="w-4 h-4" />}
                        >
                          Reject
                        </AppleButton>
                        <AppleButton
                          variant="secondary"
                          onClick={() => handleUpdateStatus(application.id, 'waitlist')}
                          disabled={processing === application.id}
                          loading={processing === application.id}
                        >
                          Waitlist
                        </AppleButton>
                      </div>
                    </div>
                  </AppleCardContent>
                </AppleCard>
              ))}
            </div>
          </div>
        )}

        {reviewedApplications.length > 0 && (
          <div>
            <AppleHeading level={2} size="feature" className="mb-4">Reviewed Applications</AppleHeading>
            <div className="space-y-4">
              {reviewedApplications.map((application) => (
                <AppleCard key={application.id}>
                  <AppleCardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <AppleAvatar
                          src={application.organizations.logo_url || undefined}
                          name={application.organizations.name}
                          alt={application.organizations.name}
                        />
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-[rgb(29,29,31)] mb-1">
                            {application.organizations.name}
                          </h3>
                          <div className="flex items-center space-x-4 text-sm">
                            <span className="text-[rgb(134,142,150)]">
                              Applied {formatDate(application.applied_at)}
                            </span>
                            {application.reviewed_at && (
                              <>
                                <span className="text-[rgb(210,210,215)]">•</span>
                                <span className="text-[rgb(134,142,150)]">
                                  Reviewed {formatDate(application.reviewed_at)}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <AppleBadge variant={getStatusVariant(application.status)} dot>
                        {application.status.toUpperCase()}
                      </AppleBadge>
                    </div>
                  </AppleCardContent>
                </AppleCard>
              ))}
            </div>
          </div>
        )}

        {applications.length === 0 && (
          <div className="py-12">
            <AppleEmptyState
              icon={<Trophy className="w-12 h-12" />}
              title="No applications yet"
              description="Applications will appear here as organizations sign up for your tournament."
            />
          </div>
        )}
      </div>
    </div>
  );
}
