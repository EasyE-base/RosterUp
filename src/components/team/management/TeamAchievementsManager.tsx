import { useState, useEffect } from 'react';
import { Loader2, Plus, Trash2, Trophy } from 'lucide-react';
import { supabase, TeamAchievement } from '../../../lib/supabase';
import { toast } from 'react-hot-toast';
import { AppleEmptyState } from '../../apple';

interface TeamAchievementsManagerProps {
    teamId: string;
}

export default function TeamAchievementsManager({ teamId }: TeamAchievementsManagerProps) {
    const [achievements, setAchievements] = useState<TeamAchievement[]>([]);
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);
    const [newAchievement, setNewAchievement] = useState({
        title: '',
        description: '',
        date_achieved: '',
        achievement_type: 'tournament_win' as const,
    });

    useEffect(() => {
        loadAchievements();
    }, [teamId]);

    const loadAchievements = async () => {
        try {
            const { data, error } = await supabase
                .from('team_achievements')
                .select('*')
                .eq('team_id', teamId)
                .order('date_achieved', { ascending: false });

            if (error) throw error;
            setAchievements(data || []);
        } catch (error) {
            console.error('Error loading achievements:', error);
            toast.error('Failed to load achievements');
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        setAdding(true);

        try {
            const { error } = await supabase
                .from('team_achievements')
                .insert({
                    team_id: teamId,
                    ...newAchievement,
                });

            if (error) throw error;

            toast.success('Achievement added');
            setNewAchievement({
                title: '',
                description: '',
                date_achieved: '',
                achievement_type: 'tournament_win',
            });
            loadAchievements();
        } catch (error) {
            console.error('Error adding achievement:', error);
            toast.error('Failed to add achievement');
        } finally {
            setAdding(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this achievement?')) return;

        try {
            const { error } = await supabase
                .from('team_achievements')
                .delete()
                .eq('id', id);

            if (error) throw error;

            toast.success('Achievement deleted');
            loadAchievements();
        } catch (error) {
            console.error('Error deleting achievement:', error);
            toast.error('Failed to delete achievement');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-[rgb(0,113,227)]" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Add New Form */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-[rgb(29,29,31)] mb-4">Add Achievement</h3>
                <form onSubmit={handleAdd} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-[rgb(29,29,31)] mb-1">Title</label>
                            <input
                                type="text"
                                value={newAchievement.title}
                                onChange={(e) => setNewAchievement({ ...newAchievement, title: e.target.value })}
                                placeholder="e.g. State Champions"
                                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-[rgb(0,113,227)]/20 focus:border-[rgb(0,113,227)]"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[rgb(29,29,31)] mb-1">Type</label>
                            <select
                                value={newAchievement.achievement_type}
                                onChange={(e) => setNewAchievement({ ...newAchievement, achievement_type: e.target.value as any })}
                                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-[rgb(0,113,227)]/20 focus:border-[rgb(0,113,227)]"
                            >
                                <option value="tournament_win">Tournament Win</option>
                                <option value="league_title">League Title</option>
                                <option value="award">Award</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[rgb(29,29,31)] mb-1">Date</label>
                            <input
                                type="date"
                                value={newAchievement.date_achieved}
                                onChange={(e) => setNewAchievement({ ...newAchievement, date_achieved: e.target.value })}
                                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-[rgb(0,113,227)]/20 focus:border-[rgb(0,113,227)]"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[rgb(29,29,31)] mb-1">Description</label>
                            <input
                                type="text"
                                value={newAchievement.description}
                                onChange={(e) => setNewAchievement({ ...newAchievement, description: e.target.value })}
                                placeholder="Optional details..."
                                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-[rgb(0,113,227)]/20 focus:border-[rgb(0,113,227)]"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={adding}
                            className="px-4 py-2 bg-[rgb(0,113,227)] text-white font-medium rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                            {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                            <span>Add Achievement</span>
                        </button>
                    </div>
                </form>
            </div>

            {/* List */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-[rgb(29,29,31)]">Current Achievements</h3>
                {achievements.length === 0 ? (
                    <AppleEmptyState
                        icon={<Trophy className="w-12 h-12" />}
                        title="No Achievements"
                        description="Add your team's trophies and awards here."
                    />
                ) : (
                    <div className="grid gap-4">
                        {achievements.map((achievement) => (
                            <div
                                key={achievement.id}
                                className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-sm"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600">
                                        <Trophy className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-[rgb(29,29,31)]">{achievement.title}</h4>
                                        <p className="text-sm text-[rgb(134,142,150)]">
                                            {new Date(achievement.date_achieved || '').toLocaleDateString()} • {achievement.achievement_type.replace('_', ' ')}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleDelete(achievement.id)}
                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
