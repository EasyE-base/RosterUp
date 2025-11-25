import { useState, useEffect } from 'react';
import { MapPin, Shield, Mail, Heart } from 'lucide-react';
import { AppleButton, AppleAvatar, AppleBadge } from '../apple';
import { Team, supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';

interface TeamHeroProps {
    team: Team & {
        organizations: {
            name: string;
            city: string | null;
            state: string | null;
        };
    };
    onContactClick: () => void;
}

export default function TeamHero({ team, onContactClick }: TeamHeroProps) {
    const { user } = useAuth();
    const [isFollowing, setIsFollowing] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            checkFollowStatus();
        }
    }, [user, team.id]);

    const checkFollowStatus = async () => {
        try {
            const { data } = await supabase
                .from('team_followers')
                .select('*')
                .eq('team_id', team.id)
                .eq('user_id', user?.id)
                .single();
            setIsFollowing(!!data);
        } catch (error) {
            // Ignore error if not found
        }
    };

    const handleFollowToggle = async () => {
        if (!user) {
            toast.error('Please sign in to follow teams');
            return;
        }

        setLoading(true);
        try {
            if (isFollowing) {
                await supabase
                    .from('team_followers')
                    .delete()
                    .eq('team_id', team.id)
                    .eq('user_id', user.id);
                setIsFollowing(false);
                toast.success('Unfollowed team');
            } else {
                await supabase
                    .from('team_followers')
                    .insert({
                        team_id: team.id,
                        user_id: user.id
                    });
                setIsFollowing(true);
                toast.success('Following team');
            }
        } catch (error) {
            console.error('Error toggling follow:', error);
            toast.error('Failed to update follow status');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative mb-8">
            {/* Banner Image */}
            <div className="h-64 md:h-80 w-full rounded-2xl overflow-hidden relative">
                {team.banner_url ? (
                    <img
                        src={team.banner_url}
                        alt={`${team.name} banner`}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-r from-[rgb(0,113,227)] to-[rgb(94,92,230)]" />
                )}
                <div className="absolute inset-0 bg-black/20" />
            </div>

            {/* Team Info Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 bg-gradient-to-t from-black/80 via-black/40 to-transparent rounded-b-2xl">
                <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
                    {/* Logo */}
                    <div className="relative">
                        <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-white p-1 shadow-lg">
                            <AppleAvatar
                                src={team.logo_url || undefined}
                                name={team.name}
                                alt={team.name}
                                size="2xl"
                                shape="square"
                                className="w-full h-full rounded-xl"
                            />
                        </div>
                    </div>

                    {/* Text Info */}
                    <div className="flex-1 text-white">
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{team.name}</h1>
                            {team.age_group && (
                                <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-sm font-medium border border-white/10">
                                    {team.age_group}
                                </span>
                            )}
                            {team.gender && (
                                <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-sm font-medium border border-white/10 capitalize">
                                    {team.gender}
                                </span>
                            )}
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-white/90 text-sm md:text-base">
                            <div className="flex items-center gap-1.5">
                                <Shield className="w-4 h-4" />
                                <span>{team.organizations.name}</span>
                            </div>
                            {(team.organizations.city || team.organizations.state) && (
                                <div className="flex items-center gap-1.5">
                                    <MapPin className="w-4 h-4" />
                                    <span>
                                        {[team.organizations.city, team.organizations.state]
                                            .filter(Boolean)
                                            .join(', ')}
                                    </span>
                                </div>
                            )}
                            <div className="flex items-center gap-1.5">
                                <AppleBadge variant="primary" className="bg-white/20 text-white border-white/10">
                                    {team.sport}
                                </AppleBadge>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="w-full md:w-auto flex gap-3">
                        <AppleButton
                            variant="secondary"
                            size="lg"
                            onClick={handleFollowToggle}
                            className={`w-full md:w-auto shadow-lg backdrop-blur-md bg-white/10 border-white/20 text-white hover:bg-white/20 ${isFollowing ? 'bg-red-500/20 border-red-500/30 text-red-100' : ''}`}
                            disabled={loading}
                        >
                            <Heart className={`w-5 h-5 mr-2 ${isFollowing ? 'fill-current text-red-500' : ''}`} />
                            {isFollowing ? 'Following' : 'Follow'}
                        </AppleButton>
                        <AppleButton
                            variant="primary"
                            size="lg"
                            onClick={onContactClick}
                            leftIcon={<Mail className="w-5 h-5" />}
                            className="w-full md:w-auto shadow-lg"
                        >
                            Contact Team
                        </AppleButton>
                    </div>
                </div>
            </div>
        </div>
    );
}
