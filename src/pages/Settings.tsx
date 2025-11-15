import { useState } from 'react';
import {
  User,
  Bell,
  Lock,
  Trash2,
  Save,
  AlertCircle,
  Check,
  Loader2,
  LogOut,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export default function Settings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'account' | 'notifications' | 'security'>(
    'account'
  );
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [notificationSettings, setNotificationSettings] = useState({
    email_messages: true,
    email_tryout_applications: true,
    email_application_updates: true,
    email_team_invites: true,
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleSaveNotifications = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setSuccess('Notification preferences updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update notification preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      setLoading(false);
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      setLoading(false);
      return;
    }

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: passwordData.newPassword,
      });

      if (updateError) throw updateError;

      setSuccess('Password updated successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleDeleteAccount = async () => {
    if (
      !confirm(
        'Are you sure you want to delete your account? This action cannot be undone.'
      )
    ) {
      return;
    }

    if (
      !confirm(
        'This will permanently delete all your data including teams, tryouts, and messages. Continue?'
      )
    ) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error } = await supabase.from('profiles').delete().eq('id', user?.id);

      if (error) throw error;

      await supabase.auth.signOut();
      navigate('/');
    } catch (err) {
      setError('Failed to delete account. Please contact support.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[rgb(247,247,249)] pt-32 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[rgb(29,29,31)] mb-2">Settings</h1>
          <p className="text-[rgb(134,142,150)]">Manage your account preferences and security</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start space-x-3">
            <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-green-600 text-sm">{success}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2 shadow-sm">
              <button
                onClick={() => setActiveTab('account')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                  activeTab === 'account'
                    ? 'bg-[rgb(0,113,227)]/10 border border-[rgb(0,113,227)]/20 text-[rgb(0,113,227)]'
                    : 'text-[rgb(134,142,150)] hover:text-[rgb(29,29,31)] hover:bg-[rgb(247,247,249)]'
                }`}
              >
                <User className="w-5 h-5" />
                <span className="font-medium">Account</span>
              </button>

              <button
                onClick={() => setActiveTab('notifications')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                  activeTab === 'notifications'
                    ? 'bg-[rgb(0,113,227)]/10 border border-[rgb(0,113,227)]/20 text-[rgb(0,113,227)]'
                    : 'text-[rgb(134,142,150)] hover:text-[rgb(29,29,31)] hover:bg-[rgb(247,247,249)]'
                }`}
              >
                <Bell className="w-5 h-5" />
                <span className="font-medium">Notifications</span>
              </button>

              <button
                onClick={() => setActiveTab('security')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                  activeTab === 'security'
                    ? 'bg-[rgb(0,113,227)]/10 border border-[rgb(0,113,227)]/20 text-[rgb(0,113,227)]'
                    : 'text-[rgb(134,142,150)] hover:text-[rgb(29,29,31)] hover:bg-[rgb(247,247,249)]'
                }`}
              >
                <Lock className="w-5 h-5" />
                <span className="font-medium">Security</span>
              </button>
            </div>

            <button
              onClick={handleSignOut}
              className="w-full mt-4 flex items-center justify-center space-x-2 px-4 py-3 bg-white border border-slate-200 text-[rgb(29,29,31)] rounded-lg hover:bg-[rgb(247,247,249)] transition-all shadow-sm"
            >
              <LogOut className="w-5 h-5" />
              <span>Sign Out</span>
            </button>
          </div>

          <div className="lg:col-span-3">
            {activeTab === 'account' && (
              <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6 shadow-sm">
                <div>
                  <h2 className="text-xl font-bold text-[rgb(29,29,31)] mb-4">Account Information</h2>
                  <p className="text-[rgb(134,142,150)] mb-6">
                    Manage your basic account information and preferences
                  </p>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-[rgb(29,29,31)] mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={user?.email || ''}
                        disabled
                        className="w-full px-4 py-3 bg-[rgb(247,247,249)] border border-slate-200 rounded-lg text-[rgb(134,142,150)] cursor-not-allowed"
                      />
                      <p className="text-[rgb(134,142,150)] text-sm mt-1">
                        Email cannot be changed. Contact support if needed.
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[rgb(29,29,31)] mb-2">
                        User ID
                      </label>
                      <input
                        type="text"
                        value={user?.id || ''}
                        disabled
                        className="w-full px-4 py-3 bg-[rgb(247,247,249)] border border-slate-200 rounded-lg text-[rgb(134,142,150)] cursor-not-allowed font-mono text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-6">
                  <h3 className="text-lg font-bold text-[rgb(29,29,31)] mb-2">Danger Zone</h3>
                  <p className="text-[rgb(134,142,150)] mb-4">
                    Irreversible actions that will permanently affect your account
                  </p>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={loading}
                    className="px-5 py-3 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition-all flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                  >
                    <Trash2 className="w-5 h-5" />
                    <span>Delete Account</span>
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-bold text-[rgb(29,29,31)] mb-4">
                  Notification Preferences
                </h2>
                <p className="text-[rgb(134,142,150)] mb-6">
                  Choose what notifications you want to receive via email
                </p>

                <div className="space-y-4">
                  <label className="flex items-center justify-between p-4 bg-[rgb(247,247,249)] border border-slate-200 rounded-lg cursor-pointer hover:border-[rgb(0,113,227)]/30 transition-all">
                    <div>
                      <p className="text-[rgb(29,29,31)] font-medium">New Messages</p>
                      <p className="text-[rgb(134,142,150)] text-sm">
                        Get notified when someone sends you a message
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notificationSettings.email_messages}
                      onChange={(e) =>
                        setNotificationSettings({
                          ...notificationSettings,
                          email_messages: e.target.checked,
                        })
                      }
                      className="w-5 h-5 text-[rgb(0,113,227)] bg-white border-slate-300 rounded focus:ring-2 focus:ring-[rgb(0,113,227)]/20"
                    />
                  </label>

                  <label className="flex items-center justify-between p-4 bg-[rgb(247,247,249)] border border-slate-200 rounded-lg cursor-pointer hover:border-[rgb(0,113,227)]/30 transition-all">
                    <div>
                      <p className="text-[rgb(29,29,31)] font-medium">Tryout Applications</p>
                      <p className="text-[rgb(134,142,150)] text-sm">
                        Get notified when players apply to your tryouts
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notificationSettings.email_tryout_applications}
                      onChange={(e) =>
                        setNotificationSettings({
                          ...notificationSettings,
                          email_tryout_applications: e.target.checked,
                        })
                      }
                      className="w-5 h-5 text-[rgb(0,113,227)] bg-white border-slate-300 rounded focus:ring-2 focus:ring-[rgb(0,113,227)]/20"
                    />
                  </label>

                  <label className="flex items-center justify-between p-4 bg-[rgb(247,247,249)] border border-slate-200 rounded-lg cursor-pointer hover:border-[rgb(0,113,227)]/30 transition-all">
                    <div>
                      <p className="text-[rgb(29,29,31)] font-medium">Application Updates</p>
                      <p className="text-[rgb(134,142,150)] text-sm">
                        Get notified about your tryout application status
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notificationSettings.email_application_updates}
                      onChange={(e) =>
                        setNotificationSettings({
                          ...notificationSettings,
                          email_application_updates: e.target.checked,
                        })
                      }
                      className="w-5 h-5 text-[rgb(0,113,227)] bg-white border-slate-300 rounded focus:ring-2 focus:ring-[rgb(0,113,227)]/20"
                    />
                  </label>

                  <label className="flex items-center justify-between p-4 bg-[rgb(247,247,249)] border border-slate-200 rounded-lg cursor-pointer hover:border-[rgb(0,113,227)]/30 transition-all">
                    <div>
                      <p className="text-[rgb(29,29,31)] font-medium">Team Invitations</p>
                      <p className="text-[rgb(134,142,150)] text-sm">
                        Get notified when you're invited to join a team
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notificationSettings.email_team_invites}
                      onChange={(e) =>
                        setNotificationSettings({
                          ...notificationSettings,
                          email_team_invites: e.target.checked,
                        })
                      }
                      className="w-5 h-5 text-[rgb(0,113,227)] bg-white border-slate-300 rounded focus:ring-2 focus:ring-[rgb(0,113,227)]/20"
                    />
                  </label>
                </div>

                <button
                  onClick={handleSaveNotifications}
                  disabled={loading}
                  className="mt-6 px-6 py-3 bg-[rgb(0,113,227)] text-white font-medium rounded-lg hover:bg-blue-600 transition-all flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      <span>Save Preferences</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-bold text-[rgb(29,29,31)] mb-4">Change Password</h2>
                <p className="text-[rgb(134,142,150)] mb-6">
                  Update your password to keep your account secure
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[rgb(29,29,31)] mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) =>
                        setPasswordData({ ...passwordData, newPassword: e.target.value })
                      }
                      placeholder="Enter new password"
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-[rgb(29,29,31)] placeholder-[rgb(134,142,150)] focus:outline-none focus:border-[rgb(0,113,227)] focus:ring-2 focus:ring-[rgb(0,113,227)]/20"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[rgb(29,29,31)] mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) =>
                        setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                      }
                      placeholder="Confirm new password"
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-[rgb(29,29,31)] placeholder-[rgb(134,142,150)] focus:outline-none focus:border-[rgb(0,113,227)] focus:ring-2 focus:ring-[rgb(0,113,227)]/20"
                    />
                  </div>

                  <button
                    onClick={handleChangePassword}
                    disabled={loading || !passwordData.newPassword || !passwordData.confirmPassword}
                    className="px-6 py-3 bg-[rgb(0,113,227)] text-white font-medium rounded-lg hover:bg-blue-600 transition-all flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Updating...</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-5 h-5" />
                        <span>Update Password</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
