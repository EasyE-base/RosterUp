import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Users,
  Calendar,
  Trophy,
  Plus,
  X,
  Search,
  Loader2,
  AlertCircle,
  Mail,
  MapPin,
  Camera,
  Settings,
  Image as ImageIcon,
  LayoutDashboard,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Team, Player } from '../lib/supabase';
import TeamEditForm from '../components/team/management/TeamEditForm';
import TeamAchievementsManager from '../components/team/management/TeamAchievementsManager';
import TeamMediaManager from '../components/team/management/TeamMediaManager';
import GuestPlayerForm from '../components/team/management/GuestPlayerForm';

interface TeamMember {
  id: string;
  position: string | null;
  jersey_number: string | null;
  status: string;
  joined_at: string;
  is_guest: boolean;
  guest_first_name: string | null;
  guest_last_name: string | null;
  guest_photo_url: string | null;
  players: {
    id: string;
    user_id: string;
    age: number | null;
    primary_position: string | null;
    profiles: {
      full_name: string;
      email: string;
      avatar_url: string | null;
    };
    player_profiles: {
      photo_url: string | null;
    } | null;
  } | null;
}

export default function TeamDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { organization } = useAuth();
  const [team, setTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddPlayerModal, setShowAddPlayerModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Player[]>([]);
  const [searching, setSearching] = useState(false);
  const [adding, setAdding] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'edit' | 'roster' | 'achievements' | 'media'>('overview');
  const [activePlayerTab, setActivePlayerTab] = useState<'search' | 'guest'>('search');

  useEffect(() => {
    if (id) {
      loadTeamDetails();
      loadTeamMembers();
    }
  }, [id]);

  const loadTeamDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setTeam(data);
    } catch (error) {
      console.error('Error loading team:', error);
    }
  };

  const loadTeamMembers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('team_members')
        .select(`
          *,
          players(
            id,
            user_id,
            age,
            primary_position,
            profiles(full_name, email, avatar_url)
          )
        `)
        .eq('team_id', id)
        .order('joined_at', { ascending: false });

      // Fetch player profile photos separately for registered players only
      if (data && data.length > 0) {
        const registeredMembers = data.filter((m: any) => !m.is_guest && m.players);
        const userIds = registeredMembers.map((m: any) => m.players.user_id).filter(Boolean);

        if (userIds.length > 0) {
          const { data: playerProfiles, error: profileError } = await supabase
            .from('player_profiles')
            .select('user_id, photo_url')
            .in('user_id', userIds);

          if (profileError) console.error('Error fetching player profiles:', profileError);

          // Merge photo URLs into the data for registered players
          if (playerProfiles) {
            data.forEach((member: any) => {
              if (!member.is_guest && member.players) {
                const profile = playerProfiles.find(p => p.user_id === member.players.user_id);
                member.players.player_profiles = profile || null;
              }
            });
          }
        }
      }

      if (error) throw error;
      setMembers((data as TeamMember[]) || []);
    } catch (error) {
      console.error('Error loading team members:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchPlayers = async () => {
    if (!searchTerm.trim()) return;

    setSearching(true);
    setError('');
    try {
      // Get all players with their profiles
      const { data, error } = await supabase
        .from('players')
        .select('*, profiles!inner(full_name, email, avatar_url)')
        .or(`full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`, { foreignTable: 'profiles' })
        .limit(10);

      if (error) throw error;

      const memberPlayerIds = members
        .filter(m => !m.is_guest && m.players)
        .map(m => m.players!.id);
      const filteredResults = (data || []).filter(
        (player: any) => !memberPlayerIds.includes(player.id)
      );

      setSearchResults(filteredResults);
    } catch (err) {
      console.error('Player search error:', err);
      setError('Failed to search players');
    } finally {
      setSearching(false);
    }
  };

  const handleAddPlayer = async (playerId: string) => {
    setAdding(playerId);
    setError('');

    try {
      const { error: insertError } = await supabase.from('team_members').insert({
        team_id: id,
        player_id: playerId,
        status: 'active',
      });

      if (insertError) throw insertError;

      await loadTeamMembers();
      setShowAddPlayerModal(false);
      setSearchTerm('');
      setSearchResults([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add player');
    } finally {
      setAdding(null);
    }
  };

  const handleRemovePlayer = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this player from the team?')) return;

    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      await loadTeamMembers();
    } catch (error) {
      console.error('Error removing player:', error);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !team) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be less than 5MB');
      return;
    }

    setUploadingLogo(true);
    try {
      // Create unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${team.id}-${Date.now()}.${fileExt}`;
      const filePath = `team-logos/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('team-assets')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('team-assets')
        .getPublicUrl(filePath);

      // Update team logo_url in database
      const { error: updateError } = await supabase
        .from('teams')
        .update({ logo_url: urlData.publicUrl })
        .eq('id', team.id);

      if (updateError) throw updateError;

      // Reload team details
      await loadTeamDetails();
    } catch (error) {
      console.error('Error uploading logo:', error);
      alert('Failed to upload logo. Please try again.');
    } finally {
      setUploadingLogo(false);
    }
  };

  if (!team) {
    return (
      <div className="min-h-screen bg-[rgb(247,247,249)] pt-32 pb-12 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[rgb(0,113,227)]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[rgb(247,247,249)] pt-32 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center space-x-2 text-[rgb(134,142,150)] hover:text-[rgb(0,113,227)] mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Dashboard</span>
        </button>

        {/* Team Header */}
        <div className="bg-white border border-slate-200 rounded-xl p-8 mb-8 shadow-sm">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="relative group">
                {team.logo_url ? (
                  <img
                    src={team.logo_url}
                    alt={team.name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center text-white font-bold text-2xl">
                    {team.name.charAt(0)}
                  </div>
                )}
                {organization && (
                  <>
                    <label
                      htmlFor="logo-upload"
                      className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      {uploadingLogo ? (
                        <Loader2 className="w-6 h-6 text-white animate-spin" />
                      ) : (
                        <Camera className="w-6 h-6 text-white" />
                      )}
                    </label>
                    <input
                      id="logo-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      disabled={uploadingLogo}
                      className="hidden"
                    />
                  </>
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-[rgb(29,29,31)] mb-2">{team.name}</h1>
                <div className="flex items-center space-x-4 text-[rgb(134,142,150)]">
                  <span className="flex items-center space-x-1">
                    <Trophy className="w-4 h-4" />
                    <span>{team.sport}</span>
                  </span>
                  {team.age_group && (
                    <>
                      <span>•</span>
                      <span>{team.age_group}</span>
                    </>
                  )}
                  {team.gender && (
                    <>
                      <span>•</span>
                      <span>{team.gender}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => window.open(`/teams/${team.id}`, '_blank')}
                className="px-4 py-2 text-[rgb(0,113,227)] bg-[rgb(0,113,227)]/10 font-medium rounded-lg hover:bg-[rgb(0,113,227)]/20 transition-all"
              >
                View Public Profile
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center space-x-6 border-b border-slate-200">
            <button
              onClick={() => setActiveTab('overview')}
              className={`pb-4 text-sm font-medium transition-colors relative ${activeTab === 'overview'
                ? 'text-[rgb(0,113,227)]'
                : 'text-[rgb(134,142,150)] hover:text-[rgb(29,29,31)]'
                }`}
            >
              <div className="flex items-center gap-2">
                <LayoutDashboard className="w-4 h-4" />
                <span>Overview</span>
              </div>
              {activeTab === 'overview' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[rgb(0,113,227)] rounded-t-full" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('edit')}
              className={`pb-4 text-sm font-medium transition-colors relative ${activeTab === 'edit'
                ? 'text-[rgb(0,113,227)]'
                : 'text-[rgb(134,142,150)] hover:text-[rgb(29,29,31)]'
                }`}
            >
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                <span>Edit Profile</span>
              </div>
              {activeTab === 'edit' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[rgb(0,113,227)] rounded-t-full" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('roster')}
              className={`pb-4 text-sm font-medium transition-colors relative ${activeTab === 'roster'
                ? 'text-[rgb(0,113,227)]'
                : 'text-[rgb(134,142,150)] hover:text-[rgb(29,29,31)]'
                }`}
            >
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>Roster</span>
              </div>
              {activeTab === 'roster' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[rgb(0,113,227)] rounded-t-full" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('achievements')}
              className={`pb-4 text-sm font-medium transition-colors relative ${activeTab === 'achievements'
                ? 'text-[rgb(0,113,227)]'
                : 'text-[rgb(134,142,150)] hover:text-[rgb(29,29,31)]'
                }`}
            >
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                <span>Achievements</span>
              </div>
              {activeTab === 'achievements' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[rgb(0,113,227)] rounded-t-full" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('media')}
              className={`pb-4 text-sm font-medium transition-colors relative ${activeTab === 'media'
                ? 'text-[rgb(0,113,227)]'
                : 'text-[rgb(134,142,150)] hover:text-[rgb(29,29,31)]'
                }`}
            >
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                <span>Media</span>
              </div>
              {activeTab === 'media' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[rgb(0,113,227)] rounded-t-full" />
              )}
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
                <div className="flex items-center space-x-2 text-[rgb(134,142,150)] mb-2">
                  <Users className="w-5 h-5" />
                  <span className="text-sm font-medium">Roster Size</span>
                </div>
                <p className="text-3xl font-bold text-[rgb(29,29,31)]">
                  {members.length} <span className="text-lg text-[rgb(134,142,150)] font-normal">/ {team.roster_limit}</span>
                </p>
              </div>

              {team.season && (
                <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
                  <div className="flex items-center space-x-2 text-[rgb(134,142,150)] mb-2">
                    <Calendar className="w-5 h-5" />
                    <span className="text-sm font-medium">Current Season</span>
                  </div>
                  <p className="text-3xl font-bold text-[rgb(29,29,31)]">{team.season}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'edit' && (
            <TeamEditForm team={team} onUpdate={loadTeamDetails} />
          )}

          {activeTab === 'roster' && (
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-[rgb(29,29,31)]">Manage Roster</h2>
                {organization && (
                  <button
                    onClick={() => setShowAddPlayerModal(true)}
                    className="px-5 py-2 bg-[rgb(0,113,227)] text-white font-medium rounded-lg hover:bg-blue-600 transition-all flex items-center space-x-2"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Add Player</span>
                  </button>
                )}
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-[rgb(0,113,227)]" />
                </div>
              ) : members.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-[rgb(134,142,150)] mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-[rgb(29,29,31)] mb-2">No players yet</h3>
                  <p className="text-[rgb(134,142,150)] mb-6">Start building your roster by adding players</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {members.map((member) => {
                    // Determine display values based on guest vs registered player
                    const isGuest = member.is_guest;
                    const photoUrl = isGuest
                      ? member.guest_photo_url
                      : member.players?.player_profiles?.photo_url;
                    const fullName = isGuest
                      ? `${member.guest_first_name} ${member.guest_last_name || ''}`.trim()
                      : member.players?.profiles?.full_name || 'Unknown Player';
                    const position = member.position || member.players?.primary_position;
                    const age = !isGuest ? member.players?.age : null;

                    return (
                      <div
                        key={member.id}
                        className="bg-[rgb(247,247,249)] border border-slate-200 rounded-lg p-4 hover:border-[rgb(0,113,227)]/30 hover:shadow-sm transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            {photoUrl ? (
                              <img
                                src={photoUrl}
                                alt={fullName}
                                className="w-12 h-12 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full flex items-center justify-center text-white font-bold">
                                {fullName.charAt(0)}
                              </div>
                            )}
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="text-[rgb(29,29,31)] font-semibold">
                                  {fullName}
                                </h3>
                                {isGuest && (
                                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                                    Guest
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center space-x-3 text-sm text-[rgb(134,142,150)]">
                                {position && (
                                  <span>{position}</span>
                                )}
                                {member.jersey_number && (
                                  <>
                                    <span>•</span>
                                    <span>#{member.jersey_number}</span>
                                  </>
                                )}
                                {age && (
                                  <>
                                    <span>•</span>
                                    <span>{age} years old</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          {organization && (
                            <button
                              onClick={() => handleRemovePlayer(member.id)}
                              className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'achievements' && (
            <TeamAchievementsManager teamId={team.id} />
          )}

          {activeTab === 'media' && (
            <TeamMediaManager teamId={team.id} />
          )}
        </div>
      </div>

      {showAddPlayerModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-[rgb(29,29,31)]">Add Player to Team</h2>
              <button
                onClick={() => {
                  setShowAddPlayerModal(false);
                  setSearchTerm('');
                  setSearchResults([]);
                  setError('');
                  setActivePlayerTab('search');
                }}
                className="text-[rgb(134,142,150)] hover:text-[rgb(29,29,31)] transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Tabs */}
            <div className="px-6 pt-4 flex items-center space-x-4 border-b border-slate-200">
              <button
                onClick={() => setActivePlayerTab('search')}
                className={`pb-4 px-2 text-sm font-medium transition-colors relative ${activePlayerTab === 'search'
                  ? 'text-[rgb(0,113,227)]'
                  : 'text-[rgb(134,142,150)] hover:text-[rgb(29,29,31)]'
                  }`}
              >
                Search Existing Players
                {activePlayerTab === 'search' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[rgb(0,113,227)] rounded-t-full" />
                )}
              </button>
              <button
                onClick={() => setActivePlayerTab('guest')}
                className={`pb-4 px-2 text-sm font-medium transition-colors relative ${activePlayerTab === 'guest'
                  ? 'text-[rgb(0,113,227)]'
                  : 'text-[rgb(134,142,150)] hover:text-[rgb(29,29,31)]'
                  }`}
              >
                Add Guest Player
                {activePlayerTab === 'guest' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[rgb(0,113,227)] rounded-t-full" />
                )}
              </button>
            </div>

            <div className="p-6 space-y-6">
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              {activePlayerTab === 'search' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-[rgb(29,29,31)] mb-2">
                      Search for players
                    </label>
                    <div className="flex space-x-2">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[rgb(134,142,150)]" />
                        <input
                          type="text"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSearchPlayers()}
                          placeholder="Search by name or email..."
                          className="w-full pl-10 pr-4 py-3 bg-[rgb(247,247,249)] border border-slate-200 rounded-lg text-[rgb(29,29,31)] placeholder-[rgb(134,142,150)] focus:outline-none focus:border-[rgb(0,113,227)] focus:ring-2 focus:ring-[rgb(0,113,227)]/20"
                        />
                      </div>
                      <button
                        onClick={handleSearchPlayers}
                        disabled={searching || !searchTerm.trim()}
                        className="px-6 py-3 bg-[rgb(0,113,227)] text-white font-medium rounded-lg hover:bg-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {searching ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          'Search'
                        )}
                      </button>
                    </div>
                  </div>

                  {searchResults.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-[rgb(29,29,31)] font-semibold">Search Results</h3>
                      {searchResults.map((player: any) => (
                        <div
                          key={player.id}
                          className="bg-[rgb(247,247,249)] border border-slate-200 rounded-lg p-4 flex items-center justify-between hover:border-[rgb(0,113,227)]/30 transition-all"
                        >
                          <div className="flex items-center space-x-3">
                            {player.profiles?.avatar_url ? (
                              <img
                                src={player.profiles.avatar_url}
                                alt={player.profiles?.full_name || 'Player'}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full flex items-center justify-center text-white font-bold">
                                {player.profiles?.full_name?.charAt(0) || 'P'}
                              </div>
                            )}
                            <div>
                              <p className="text-[rgb(29,29,31)] font-semibold">
                                {player.profiles?.full_name || 'Unknown Player'}
                              </p>
                              <div className="flex items-center space-x-2 text-sm text-[rgb(134,142,150)]">
                                <Mail className="w-4 h-4" />
                                <span>{player.profiles?.email}</span>
                              </div>
                              {player.location && (
                                <div className="flex items-center space-x-2 text-sm text-[rgb(134,142,150)]">
                                  <MapPin className="w-4 h-4" />
                                  <span>{player.location}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => handleAddPlayer(player.id)}
                            disabled={adding === player.id}
                            className="px-4 py-2 bg-[rgb(0,113,227)] text-white font-medium rounded-lg hover:bg-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                          >
                            {adding === player.id ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Adding...</span>
                              </>
                            ) : (
                              <>
                                <Plus className="w-4 h-4" />
                                <span>Add</span>
                              </>
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <GuestPlayerForm
                  teamId={id!}
                  onSuccess={() => {
                    setShowAddPlayerModal(false);
                    setActivePlayerTab('search');
                    loadTeamMembers();
                  }}
                  onCancel={() => {
                    setShowAddPlayerModal(false);
                    setActivePlayerTab('search');
                  }}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
