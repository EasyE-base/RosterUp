import { useState } from 'react';
import { Star, Mail, Users, Send, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';

interface RecruitingContactProps {
  playerId: string;
  playerName: string;
}

type InterestType = 'mark_prospect' | 'request_info' | 'invite_camp';

export default function RecruitingContact({ playerId, playerName }: RecruitingContactProps) {
  const { user, organization } = useAuth();
  const [showContactForm, setShowContactForm] = useState(false);
  const [selectedInterestType, setSelectedInterestType] = useState<InterestType>('request_info');
  const [message, setMessage] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const interestOptions = [
    {
      type: 'mark_prospect' as InterestType,
      icon: Star,
      label: 'Mark as Prospect',
      description: 'Add this player to your recruiting list',
      color: 'yellow'
    },
    {
      type: 'request_info' as InterestType,
      icon: Mail,
      label: 'Request Information',
      description: 'Request additional player information',
      color: 'blue'
    },
    {
      type: 'invite_camp' as InterestType,
      icon: Users,
      label: 'Camp Invitation',
      description: 'Invite player to a camp or tryout',
      color: 'green'
    }
  ];

  const handleQuickInterest = async (type: InterestType) => {
    if (!user || !organization) {
      setError('You must be logged in as an organization to express interest');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Record profile view
      await supabase.from('player_profile_views').insert({
        player_id: playerId,
        viewer_user_id: user.id,
        viewer_organization_id: organization.id,
        viewer_type: 'coach',
        pages_viewed: 1,
      });

      // Record interest
      const { error: interestError } = await supabase
        .from('coach_interests')
        .insert({
          player_id: playerId,
          coach_user_id: user.id,
          organization_id: organization.id,
          interest_type: type,
          status: 'pending',
        });

      if (interestError) throw interestError;

      setSuccess('Interest recorded successfully! The player will be notified.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('Error recording interest:', err);
      setError(err.message || 'Failed to record interest');
    } finally {
      setLoading(false);
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !organization) {
      setError('You must be logged in as an organization to contact players');
      return;
    }

    if (!message.trim()) {
      setError('Please enter a message');
      return;
    }

    if (!contactEmail.trim()) {
      setError('Please enter your contact email');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Record profile view
      await supabase.from('player_profile_views').insert({
        player_id: playerId,
        viewer_user_id: user.id,
        viewer_organization_id: organization.id,
        viewer_type: 'coach',
        pages_viewed: 1,
      });

      // Create coach interest with message
      const { error: interestError } = await supabase
        .from('coach_interests')
        .insert({
          player_id: playerId,
          coach_user_id: user.id,
          organization_id: organization.id,
          interest_type: selectedInterestType,
          message: message,
          contact_info: JSON.stringify({ email: contactEmail, phone: contactPhone }),
          status: 'pending',
        });

      if (interestError) throw interestError;

      // Create contact request
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30); // Expires in 30 days

      const { error: contactError } = await supabase
        .from('player_contact_requests')
        .insert({
          player_id: playerId,
          organization_id: organization.id,
          message: message,
          contact_email: contactEmail,
          contact_phone: contactPhone || null,
          status: 'pending',
          expires_at: expiresAt.toISOString(),
        });

      if (contactError) throw contactError;

      setSuccess('Message sent successfully! The player will be notified and can respond to your contact information.');
      setMessage('');
      setContactEmail('');
      setContactPhone('');
      setShowContactForm(false);

      setTimeout(() => setSuccess(''), 5000);
    } catch (err: any) {
      console.error('Error sending contact:', err);
      setError(err.message || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const getInterestColor = (color: string) => {
    switch (color) {
      case 'yellow':
        return 'from-yellow-500 to-orange-400 hover:shadow-yellow-500/50';
      case 'blue':
        return 'from-blue-500 to-cyan-400 hover:shadow-blue-500/50';
      case 'green':
        return 'from-green-500 to-emerald-400 hover:shadow-green-500/50';
      default:
        return 'from-slate-500 to-slate-400 hover:shadow-slate-500/50';
    }
  };

  // Don't show recruiting tools to players viewing their own profile
  if (!organization) {
    return null;
  }

  return (
    <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-6">
      <h3 className="text-2xl font-bold text-white mb-6">Recruiting Actions</h3>

      {/* Success/Error Messages */}
      {success && (
        <div className="mb-6 p-4 bg-green-500/10 border border-green-500/50 rounded-lg flex items-start space-x-3">
          <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
          <p className="text-green-400 text-sm">{success}</p>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Quick Interest Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {interestOptions.map((option) => {
          const Icon = option.icon;
          return (
            <button
              key={option.type}
              onClick={() => handleQuickInterest(option.type)}
              disabled={loading}
              className={`bg-gradient-to-r ${getInterestColor(option.color)} text-white p-4 rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <div className="flex items-center space-x-3 mb-2">
                <Icon className="w-6 h-6" />
                <span className="font-bold">{option.label}</span>
              </div>
              <p className="text-xs text-white/80">{option.description}</p>
            </button>
          );
        })}
      </div>

      {/* Contact Form Toggle */}
      <div className="border-t border-slate-700 pt-6">
        {!showContactForm ? (
          <button
            onClick={() => setShowContactForm(true)}
            className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-400 text-white font-bold rounded-lg hover:shadow-lg hover:shadow-purple-500/50 transition-all flex items-center justify-center space-x-2"
          >
            <Send className="w-5 h-5" />
            <span>Send Detailed Message</span>
          </button>
        ) : (
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-bold text-white">Contact {playerName}</h4>
              <button
                onClick={() => setShowContactForm(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleContactSubmit} className="space-y-4">
              {/* Interest Type */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Type of Interest *
                </label>
                <select
                  value={selectedInterestType}
                  onChange={(e) => setSelectedInterestType(e.target.value as InterestType)}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50"
                  required
                >
                  {interestOptions.map((option) => (
                    <option key={option.type} value={option.type}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Message *
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={`Tell ${playerName} about your interest, organization, and next steps...`}
                  rows={6}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50"
                  required
                />
                <p className="mt-2 text-xs text-slate-400">{message.length} characters</p>
              </div>

              {/* Contact Email */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Your Contact Email *
                </label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="coach@example.com"
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50"
                  required
                />
              </div>

              {/* Contact Phone (Optional) */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Your Contact Phone (Optional)
                </label>
                <input
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="(555) 123-4567"
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50"
                />
              </div>

              {/* Organization Info Display */}
              {organization && (
                <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <p className="text-xs text-blue-400 mb-1">Sending from:</p>
                  <p className="text-white font-semibold">{organization.name}</p>
                  {organization.location && (
                    <p className="text-sm text-slate-400">{organization.location}</p>
                  )}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !message.trim() || !contactEmail.trim()}
                className="w-full py-4 bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-bold rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Send Message</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-4 p-3 bg-slate-900/50 rounded border border-slate-700">
              <p className="text-xs text-slate-400">
                <strong className="text-slate-300">Privacy Notice:</strong> Your message and contact information will be shared with the player and their parent/guardian. The player can respond directly to your provided contact information.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
