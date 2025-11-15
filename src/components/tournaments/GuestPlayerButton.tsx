import { useEffect, useState } from 'react';
import { UserPlus, CheckCircle, Clock, XCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface GuestPlayerButtonProps {
  tournamentId: string;
  onStatusChange?: () => void;
}

export default function GuestPlayerButton({ tournamentId, onStatusChange }: GuestPlayerButtonProps) {
  const { player } = useAuth();
  const [status, setStatus] = useState<'not_applied' | 'available' | 'invited' | 'accepted' | 'declined' | 'removed'>('not_applied');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (player?.id) {
      checkGuestPlayerStatus();
    }
  }, [player?.id, tournamentId]);

  const checkGuestPlayerStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('guest_players')
        .select('status')
        .eq('tournament_id', tournamentId)
        .eq('player_id', player?.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setStatus(data.status);
      } else {
        setStatus('not_applied');
      }
    } catch (err) {
      console.error('Error checking guest player status:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyAsGuest = async () => {
    try {
      setActionLoading(true);

      console.log('🔍 Checking for existing application...', {
        tournament_id: tournamentId,
        player_id: player?.id
      });

      // Check if application already exists
      const { data: existing, error: checkError } = await supabase
        .from('guest_players')
        .select('id, status')
        .eq('tournament_id', tournamentId)
        .eq('player_id', player?.id)
        .maybeSingle();

      if (checkError) {
        console.error('❌ Error checking for existing application:', checkError);
      }

      console.log('📋 Existing application:', existing);

      if (existing) {
        console.log('♻️ Updating existing application...');
        // Update existing application
        const { error } = await supabase
          .from('guest_players')
          .update({ status: 'available' })
          .eq('id', existing.id);

        if (error) {
          console.error('❌ Update error:', error);
          throw error;
        }
        console.log('✅ Updated successfully');
      } else {
        console.log('➕ Creating new application...');
        // Create new application
        const { error } = await supabase
          .from('guest_players')
          .insert({
            tournament_id: tournamentId,
            player_id: player?.id,
            status: 'available',
          });

        if (error) {
          console.error('❌ Insert error:', error);

          // If it's a conflict error (409), try to update instead
          if (error.code === '23505') {
            console.log('⚠️ Record exists but was not visible. Attempting DELETE and re-INSERT...');

            // Delete the conflicting record first
            await supabase
              .from('guest_players')
              .delete()
              .eq('tournament_id', tournamentId)
              .eq('player_id', player?.id);

            // Try insert again
            const { error: retryError } = await supabase
              .from('guest_players')
              .insert({
                tournament_id: tournamentId,
                player_id: player?.id,
                status: 'available',
              });

            if (retryError) throw retryError;
          } else {
            throw error;
          }
        }
        console.log('✅ Inserted successfully');
      }

      setStatus('available');
      onStatusChange?.();
    } catch (err) {
      console.error('Error applying as guest player:', err);
      alert('Failed to apply as guest player. Please check console for details.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleWithdrawApplication = async () => {
    try {
      setActionLoading(true);

      const { error } = await supabase
        .from('guest_players')
        .delete()
        .eq('tournament_id', tournamentId)
        .eq('player_id', player?.id);

      if (error) throw error;

      setStatus('not_applied');
      onStatusChange?.();
    } catch (err) {
      console.error('Error withdrawing application:', err);
      alert('Failed to withdraw application');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAcceptInvite = async () => {
    try {
      setActionLoading(true);

      const { error } = await supabase
        .from('guest_players')
        .update({ status: 'accepted' })
        .eq('tournament_id', tournamentId)
        .eq('player_id', player?.id);

      if (error) throw error;

      setStatus('accepted');
      onStatusChange?.();
    } catch (err) {
      console.error('Error accepting invite:', err);
      alert('Failed to accept invite');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeclineInvite = async () => {
    try {
      setActionLoading(true);

      const { error } = await supabase
        .from('guest_players')
        .update({ status: 'declined' })
        .eq('tournament_id', tournamentId)
        .eq('player_id', player?.id);

      if (error) throw error;

      setStatus('declined');
      onStatusChange?.();
    } catch (err) {
      console.error('Error declining invite:', err);
      alert('Failed to decline invite');
    } finally {
      setActionLoading(false);
    }
  };

  if (!player) return null;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-2">
        <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
      </div>
    );
  }

  // Not applied yet
  if (status === 'not_applied') {
    return (
      <button
        onClick={handleApplyAsGuest}
        disabled={actionLoading}
        className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-cyan-400/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {actionLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Applying...</span>
          </>
        ) : (
          <>
            <UserPlus className="w-4 h-4" />
            <span>Apply as Guest Player</span>
          </>
        )}
      </button>
    );
  }

  // Available (waiting for team invites)
  if (status === 'available') {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 rounded-lg">
          <Clock className="w-4 h-4" />
          <span className="font-medium">Waiting for Team Invites</span>
        </div>
        <button
          onClick={handleWithdrawApplication}
          disabled={actionLoading}
          className="w-full text-sm text-slate-400 hover:text-white transition-colors disabled:opacity-50"
        >
          {actionLoading ? 'Withdrawing...' : 'Withdraw Application'}
        </button>
      </div>
    );
  }

  // Invited by a team
  if (status === 'invited') {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-purple-500/20 border border-purple-500/30 text-purple-400 rounded-lg mb-2">
          <UserPlus className="w-4 h-4" />
          <span className="font-medium">Team Invitation Received!</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleAcceptInvite}
            disabled={actionLoading}
            className="flex items-center justify-center space-x-1 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-400 rounded-lg transition-all disabled:opacity-50"
          >
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Accept</span>
          </button>
          <button
            onClick={handleDeclineInvite}
            disabled={actionLoading}
            className="flex items-center justify-center space-x-1 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 rounded-lg transition-all disabled:opacity-50"
          >
            <XCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Decline</span>
          </button>
        </div>
      </div>
    );
  }

  // Accepted invitation
  if (status === 'accepted') {
    return (
      <div className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-green-500/20 border border-green-500/30 text-green-400 rounded-lg">
        <CheckCircle className="w-4 h-4" />
        <span className="font-medium">Joined as Guest Player</span>
      </div>
    );
  }

  // Declined invitation
  if (status === 'declined') {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-slate-500/20 border border-slate-500/30 text-slate-400 rounded-lg">
          <XCircle className="w-4 h-4" />
          <span className="font-medium">Invitation Declined</span>
        </div>
        <button
          onClick={handleApplyAsGuest}
          disabled={actionLoading}
          className="w-full text-sm text-cyan-400 hover:text-cyan-300 transition-colors disabled:opacity-50"
        >
          {actionLoading ? 'Reapplying...' : 'Apply Again'}
        </button>
      </div>
    );
  }

  return null;
}
