import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  MapPin,
  Calendar,
  Trophy,
  Edit,
  Save,
  X,
  Loader2,
  AlertCircle,
  Building2,
  Globe,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { TRAVEL_SPORTS } from '../constants/playerConstants';

export default function Profile() {
  const { user, organization, player, profile } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [profileData, setProfileData] = useState({
    full_name: '',
    email: '',
  });

  const [orgData, setOrgData] = useState({
    name: '',
    primary_sport: '',
    description: '',
    website: '',
    city: '',
    state: '',
    location: '',
  });

  const [playerData, setPlayerData] = useState({
    bio: '',
    city: '',
    state: '',
    location: '',
    primary_sport: '',
    primary_position: '',
    height: '',
    weight: '',
  });

  useEffect(() => {
    if (profile) {
      setProfileData({
        full_name: profile.full_name || '',
        email: profile.email || '',
      });
    }

    if (organization) {
      setOrgData({
        name: organization.name || '',
        primary_sport: organization.primary_sport || '',
        description: organization.description || '',
        website: organization.website || '',
        city: organization.city || '',
        state: organization.state || '',
        location: organization.location || '',
      });
    }

    if (player) {
      setPlayerData({
        bio: player.bio || '',
        city: player.city || '',
        state: player.state || '',
        location: player.location || '',
        primary_sport: player.primary_sport || '',
        primary_position: player.primary_position || '',
        height: player.height || '',
        weight: player.weight || '',
      });
    }
  }, [profile, organization, player]);

  const handleSave = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: profileData.full_name,
        })
        .eq('id', user?.id);

      if (profileError) throw profileError;

      if (organization) {
        const { error: orgError } = await supabase
          .from('organizations')
          .update({
            name: orgData.name,
            primary_sport: orgData.primary_sport || null,
            description: orgData.description,
            website: orgData.website,
            city: orgData.city,
            state: orgData.state,
            location: `${orgData.city}, ${orgData.state}`,
          })
          .eq('id', organization.id);

        if (orgError) throw orgError;
      }

      if (player) {
        const { error: playerError } = await supabase
          .from('players')
          .update({
            bio: playerData.bio,
            city: playerData.city,
            state: playerData.state,
            location: `${playerData.city}, ${playerData.state}`,
            primary_sport: playerData.primary_sport,
            primary_position: playerData.primary_position,
            height: playerData.height,
            weight: playerData.weight,
          })
          .eq('id', player.id);

        if (playerError) throw playerError;
      }

      setSuccess('Profile updated successfully!');
      setEditing(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[rgb(247,247,249)] pt-32 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[rgb(29,29,31)] mb-2">My Profile</h1>
            <p className="text-[rgb(134,142,150)]">Manage your account information</p>
          </div>
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="px-5 py-3 bg-[rgb(0,113,227)] text-white font-medium rounded-lg hover:bg-blue-600 transition-all flex items-center space-x-2 shadow-sm hover:shadow-md"
            >
              <Edit className="w-5 h-5" />
              <span>Edit Profile</span>
            </button>
          ) : (
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setEditing(false);
                  setError('');
                }}
                className="px-5 py-3 bg-white border border-slate-200 text-[rgb(29,29,31)] font-medium rounded-lg hover:bg-[rgb(247,247,249)] transition-all flex items-center space-x-2 shadow-sm"
              >
                <X className="w-5 h-5" />
                <span>Cancel</span>
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="px-5 py-3 bg-[rgb(0,113,227)] text-white font-medium rounded-lg hover:bg-blue-600 transition-all flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start space-x-3">
            <Save className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-green-600 text-sm">{success}</p>
          </div>
        )}

        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-[rgb(29,29,31)] mb-6 flex items-center space-x-2">
              <User className="w-5 h-5 text-[rgb(0,113,227)]" />
              <span>Basic Information</span>
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[rgb(29,29,31)] mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={profileData.full_name}
                  onChange={(e) =>
                    setProfileData({ ...profileData, full_name: e.target.value })
                  }
                  disabled={!editing}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-[rgb(29,29,31)] placeholder-[rgb(134,142,150)] focus:outline-none focus:border-[rgb(0,113,227)] focus:ring-2 focus:ring-[rgb(0,113,227)]/20 disabled:bg-[rgb(247,247,249)] disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[rgb(29,29,31)] mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[rgb(134,142,150)]" />
                  <input
                    type="email"
                    value={profileData.email}
                    disabled
                    className="w-full pl-10 pr-4 py-3 bg-[rgb(247,247,249)] border border-slate-200 rounded-lg text-[rgb(134,142,150)] cursor-not-allowed"
                  />
                </div>
                <p className="text-[rgb(134,142,150)] text-sm mt-1">Email cannot be changed</p>
              </div>
            </div>
          </div>

          {organization && (
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-[rgb(29,29,31)] mb-6 flex items-center space-x-2">
                <Building2 className="w-5 h-5 text-[rgb(0,113,227)]" />
                <span>Organization Details</span>
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[rgb(29,29,31)] mb-2">
                    Organization Name
                  </label>
                  <input
                    type="text"
                    value={orgData.name}
                    onChange={(e) => setOrgData({ ...orgData, name: e.target.value })}
                    disabled={!editing}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-[rgb(29,29,31)] placeholder-[rgb(134,142,150)] focus:outline-none focus:border-[rgb(0,113,227)] focus:ring-2 focus:ring-[rgb(0,113,227)]/20 disabled:bg-[rgb(247,247,249)] disabled:cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[rgb(29,29,31)] mb-2">
                    Primary Sport
                  </label>
                  <div className="relative">
                    <Trophy className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[rgb(134,142,150)]" />
                    <select
                      value={orgData.primary_sport}
                      onChange={(e) => setOrgData({ ...orgData, primary_sport: e.target.value })}
                      disabled={!editing}
                      className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-lg text-[rgb(29,29,31)] focus:outline-none focus:border-[rgb(0,113,227)] focus:ring-2 focus:ring-[rgb(0,113,227)]/20 disabled:bg-[rgb(247,247,249)] disabled:cursor-not-allowed"
                    >
                      <option value="">Select your primary sport</option>
                      {TRAVEL_SPORTS.map((sport) => (
                        <option key={sport.value} value={sport.value}>
                          {sport.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <p className="text-[rgb(134,142,150)] text-sm mt-1">
                    Determines which players you'll see in the marketplace
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[rgb(29,29,31)] mb-2">
                    Description
                  </label>
                  <textarea
                    value={orgData.description}
                    onChange={(e) => setOrgData({ ...orgData, description: e.target.value })}
                    disabled={!editing}
                    rows={4}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-[rgb(29,29,31)] placeholder-[rgb(134,142,150)] focus:outline-none focus:border-[rgb(0,113,227)] focus:ring-2 focus:ring-[rgb(0,113,227)]/20 disabled:bg-[rgb(247,247,249)] disabled:cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[rgb(29,29,31)] mb-2">
                    Website
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[rgb(134,142,150)]" />
                    <input
                      type="url"
                      value={orgData.website}
                      onChange={(e) => setOrgData({ ...orgData, website: e.target.value })}
                      disabled={!editing}
                      placeholder="https://yourwebsite.com"
                      className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-lg text-[rgb(29,29,31)] placeholder-[rgb(134,142,150)] focus:outline-none focus:border-[rgb(0,113,227)] focus:ring-2 focus:ring-[rgb(0,113,227)]/20 disabled:bg-[rgb(247,247,249)] disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[rgb(29,29,31)] mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      value={orgData.city}
                      onChange={(e) => setOrgData({ ...orgData, city: e.target.value })}
                      disabled={!editing}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-[rgb(29,29,31)] placeholder-[rgb(134,142,150)] focus:outline-none focus:border-[rgb(0,113,227)] focus:ring-2 focus:ring-[rgb(0,113,227)]/20 disabled:bg-[rgb(247,247,249)] disabled:cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[rgb(29,29,31)] mb-2">
                      State
                    </label>
                    <input
                      type="text"
                      value={orgData.state}
                      onChange={(e) => setOrgData({ ...orgData, state: e.target.value })}
                      disabled={!editing}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-[rgb(29,29,31)] placeholder-[rgb(134,142,150)] focus:outline-none focus:border-[rgb(0,113,227)] focus:ring-2 focus:ring-[rgb(0,113,227)]/20 disabled:bg-[rgb(247,247,249)] disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {player && (
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-[rgb(29,29,31)] mb-6 flex items-center space-x-2">
                <Trophy className="w-5 h-5 text-[rgb(0,113,227)]" />
                <span>Athletic Profile</span>
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[rgb(29,29,31)] mb-2">Bio</label>
                  <textarea
                    value={playerData.bio}
                    onChange={(e) => setPlayerData({ ...playerData, bio: e.target.value })}
                    disabled={!editing}
                    rows={4}
                    placeholder="Tell teams about yourself..."
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-[rgb(29,29,31)] placeholder-[rgb(134,142,150)] focus:outline-none focus:border-[rgb(0,113,227)] focus:ring-2 focus:ring-[rgb(0,113,227)]/20 disabled:bg-[rgb(247,247,249)] disabled:cursor-not-allowed"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[rgb(29,29,31)] mb-2">
                      Primary Sport
                    </label>
                    <input
                      type="text"
                      value={playerData.primary_sport}
                      onChange={(e) =>
                        setPlayerData({ ...playerData, primary_sport: e.target.value })
                      }
                      disabled={!editing}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-[rgb(29,29,31)] placeholder-[rgb(134,142,150)] focus:outline-none focus:border-[rgb(0,113,227)] focus:ring-2 focus:ring-[rgb(0,113,227)]/20 disabled:bg-[rgb(247,247,249)] disabled:cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[rgb(29,29,31)] mb-2">
                      Primary Position
                    </label>
                    <input
                      type="text"
                      value={playerData.primary_position}
                      onChange={(e) =>
                        setPlayerData({ ...playerData, primary_position: e.target.value })
                      }
                      disabled={!editing}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-[rgb(29,29,31)] placeholder-[rgb(134,142,150)] focus:outline-none focus:border-[rgb(0,113,227)] focus:ring-2 focus:ring-[rgb(0,113,227)]/20 disabled:bg-[rgb(247,247,249)] disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[rgb(29,29,31)] mb-2">
                      Height
                    </label>
                    <input
                      type="text"
                      value={playerData.height}
                      onChange={(e) => setPlayerData({ ...playerData, height: e.target.value })}
                      disabled={!editing}
                      placeholder="e.g., 5'10&quot;"
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-[rgb(29,29,31)] placeholder-[rgb(134,142,150)] focus:outline-none focus:border-[rgb(0,113,227)] focus:ring-2 focus:ring-[rgb(0,113,227)]/20 disabled:bg-[rgb(247,247,249)] disabled:cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[rgb(29,29,31)] mb-2">
                      Weight
                    </label>
                    <input
                      type="text"
                      value={playerData.weight}
                      onChange={(e) => setPlayerData({ ...playerData, weight: e.target.value })}
                      disabled={!editing}
                      placeholder="e.g., 165 lbs"
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-[rgb(29,29,31)] placeholder-[rgb(134,142,150)] focus:outline-none focus:border-[rgb(0,113,227)] focus:ring-2 focus:ring-[rgb(0,113,227)]/20 disabled:bg-[rgb(247,247,249)] disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[rgb(29,29,31)] mb-2">City</label>
                    <input
                      type="text"
                      value={playerData.city}
                      onChange={(e) => setPlayerData({ ...playerData, city: e.target.value })}
                      disabled={!editing}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-[rgb(29,29,31)] placeholder-[rgb(134,142,150)] focus:outline-none focus:border-[rgb(0,113,227)] focus:ring-2 focus:ring-[rgb(0,113,227)]/20 disabled:bg-[rgb(247,247,249)] disabled:cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[rgb(29,29,31)] mb-2">
                      State
                    </label>
                    <input
                      type="text"
                      value={playerData.state}
                      onChange={(e) => setPlayerData({ ...playerData, state: e.target.value })}
                      disabled={!editing}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-[rgb(29,29,31)] placeholder-[rgb(134,142,150)] focus:outline-none focus:border-[rgb(0,113,227)] focus:ring-2 focus:ring-[rgb(0,113,227)]/20 disabled:bg-[rgb(247,247,249)] disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
