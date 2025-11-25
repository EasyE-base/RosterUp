import { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { AppleModal, AppleButton, AppleTextarea } from '../apple';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface ContactTeamModalProps {
    isOpen: boolean;
    onClose: () => void;
    teamId: string;
    teamName: string;
    organizationId: string;
}

export default function ContactTeamModal({
    isOpen,
    onClose,
    teamName,
    organizationId,
}: ContactTeamModalProps) {
    const { player, user } = useAuth();
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!player) return;

        setSending(true);
        try {
            const { error } = await supabase.from('player_contact_requests').insert({
                player_id: player.id,
                organization_id: organizationId,
                message: `Regarding ${teamName}: ${message}`,
                contact_email: user?.email, // Use user email as player might not have it directly on record
                status: 'pending',
                expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
            });

            if (error) throw error;

            onClose();
            setMessage('');
            // Ideally show a success toast here
        } catch (error) {
            console.error('Error sending message:', error);
            alert('Failed to send message. Please try again.');
        } finally {
            setSending(false);
        }
    };

    return (
        <AppleModal
            isOpen={isOpen}
            onClose={onClose}
            title={`Contact ${teamName}`}
            description="Send a message to the team coach or manager."
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <AppleTextarea
                    label="Message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Hi, I'm interested in joining your team..."
                    rows={4}
                    required
                    fullWidth
                />

                <div className="flex justify-end space-x-3 pt-4">
                    <AppleButton variant="secondary" onClick={onClose} type="button">
                        Cancel
                    </AppleButton>
                    <AppleButton
                        variant="primary"
                        type="submit"
                        disabled={sending || !message.trim()}
                        leftIcon={sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    >
                        {sending ? 'Sending...' : 'Send Message'}
                    </AppleButton>
                </div>
            </form>
        </AppleModal>
    );
}
