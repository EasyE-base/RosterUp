import { useState } from 'react';
import { X, Mail, Phone, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase, PlayerProfile } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface ContactPlayerModalProps {
  player: PlayerProfile;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ContactPlayerModal({
  player,
  onClose,
  onSuccess,
}: ContactPlayerModalProps) {
  const { organization, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    message: '',
    contact_email: user?.email || '',
    contact_phone: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!organization) {
        throw new Error('You must be an organization to contact players');
      }

      if (!formData.message.trim()) {
        throw new Error('Please enter a message');
      }

      if (!formData.contact_email.trim()) {
        throw new Error('Please enter your contact email');
      }

      // Create contact request
      const { error: insertError } = await supabase.from('player_contact_requests').insert({
        player_id: player.id,
        organization_id: organization.id,
        message: formData.message,
        contact_email: formData.contact_email,
        contact_phone: formData.contact_phone || null,
        status: 'pending',
      });

      if (insertError) throw insertError;

      // Track analytics
      await supabase.from('search_analytics').insert({
        organization_id: organization.id,
        search_filters: {},
        result_count: 1,
        clicked_player_id: player.id,
        contact_initiated: true,
      });

      setSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send contact request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <h2 className="text-2xl font-bold text-white">Contact Player</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Success Message */}
          {success && (
            <div className="p-4 bg-green-500/10 border border-green-500/50 rounded-lg flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-green-400 font-semibold">Request Sent Successfully!</p>
                <p className="text-green-400/80 text-sm mt-1">
                  The player will receive your contact request and can respond directly.
                </p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Player Info Summary */}
          <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
            <p className="text-sm text-slate-400 mb-2">Contacting:</p>
            <div className="flex items-center space-x-3">
              {player.photo_url ? (
                <img
                  src={player.photo_url}
                  alt="Player"
                  className="w-12 h-12 rounded-lg object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-slate-700 flex items-center justify-center">
                  <Mail className="w-6 h-6 text-slate-500" />
                </div>
              )}
              <div>
                <p className="font-semibold text-white">
                  {player.sport} • {player.position || 'Player'}
                </p>
                <p className="text-sm text-slate-400">
                  {player.age_group} • {player.location_city}, {player.location_state}
                </p>
              </div>
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Message to Player *
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Introduce your organization and explain why you're interested in this player..."
              rows={6}
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50"
              required
            />
            <p className="mt-2 text-xs text-slate-400">
              {formData.message.length} characters (minimum 20 recommended)
            </p>
          </div>

          {/* Contact Email */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center">
              <Mail className="w-4 h-4 mr-2 text-blue-400" />
              Your Contact Email *
            </label>
            <input
              type="email"
              value={formData.contact_email}
              onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
              placeholder="your@organization.com"
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50"
              required
            />
          </div>

          {/* Contact Phone (Optional) */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center">
              <Phone className="w-4 h-4 mr-2 text-green-400" />
              Your Contact Phone (Optional)
            </label>
            <input
              type="tel"
              value={formData.contact_phone}
              onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
              placeholder="(555) 123-4567"
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50"
            />
          </div>

          {/* Privacy Notice */}
          <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <p className="text-sm text-blue-300">
              Your contact information will be shared with the player so they can respond to your
              inquiry. By submitting this form, you agree to our Terms of Service and Privacy
              Policy.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-3 px-4 bg-slate-800/50 border border-slate-700 text-white font-semibold rounded-lg hover:bg-slate-800 transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || success}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Sending...</span>
                </>
              ) : success ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  <span>Sent!</span>
                </>
              ) : (
                <>
                  <Mail className="w-5 h-5" />
                  <span>Send Contact Request</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
