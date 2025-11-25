import { useState } from 'react';
import { Loader2, Save, Upload, Image as ImageIcon } from 'lucide-react';
import { supabase, Team } from '../../../lib/supabase';
import { toast } from 'react-hot-toast';

interface TeamEditFormProps {
    team: Team;
    onUpdate: () => void;
}

export default function TeamEditForm({ team, onUpdate }: TeamEditFormProps) {
    const [loading, setLoading] = useState(false);
    const [uploadingBanner, setUploadingBanner] = useState(false);
    const [formData, setFormData] = useState({
        name: team.name,
        sport: team.sport,
        age_group: team.age_group || '',
        gender: team.gender || '',
        season: team.season || '',
        bio: team.bio || '',
        home_field: team.home_field || '',
        practice_schedule: team.practice_schedule || '',
        founded_year: team.founded_year?.toString() || '',
    });

    const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Please upload an image file');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image must be less than 5MB');
            return;
        }

        setUploadingBanner(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `banner-${team.id}-${Date.now()}.${fileExt}`;
            const filePath = `team-banners/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('team-assets')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: urlData } = supabase.storage
                .from('team-assets')
                .getPublicUrl(filePath);

            const { error: updateError } = await supabase
                .from('teams')
                .update({ banner_url: urlData.publicUrl })
                .eq('id', team.id);

            if (updateError) throw updateError;

            toast.success('Banner updated successfully');
            onUpdate();
        } catch (error) {
            console.error('Error uploading banner:', error);
            toast.error('Failed to upload banner');
        } finally {
            setUploadingBanner(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await supabase
                .from('teams')
                .update({
                    name: formData.name,
                    sport: formData.sport,
                    age_group: formData.age_group || null,
                    gender: formData.gender || null,
                    season: formData.season || null,
                    bio: formData.bio || null,
                    home_field: formData.home_field || null,
                    practice_schedule: formData.practice_schedule || null,
                    founded_year: formData.founded_year ? parseInt(formData.founded_year) : null,
                })
                .eq('id', team.id);

            if (error) throw error;

            toast.success('Team details updated');
            onUpdate();
        } catch (error) {
            console.error('Error updating team:', error);
            toast.error('Failed to update team details');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            {/* Banner Image */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-[rgb(29,29,31)] mb-4">Banner Image</h3>
                <div className="relative h-48 rounded-lg bg-slate-100 overflow-hidden group">
                    {team.banner_url ? (
                        <img
                            src={team.banner_url}
                            alt="Team Banner"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                            <ImageIcon className="w-12 h-12" />
                        </div>
                    )}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <label className="cursor-pointer px-4 py-2 bg-white/20 backdrop-blur-md border border-white/30 rounded-lg text-white font-medium hover:bg-white/30 transition-colors flex items-center gap-2">
                            {uploadingBanner ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <Upload className="w-5 h-5" />
                            )}
                            <span>Change Banner</span>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleBannerUpload}
                                disabled={uploadingBanner}
                                className="hidden"
                            />
                        </label>
                    </div>
                </div>
                <p className="text-sm text-[rgb(134,142,150)] mt-2">
                    Recommended size: 1200x400px. Max 5MB.
                </p>
            </div>

            {/* Basic Info */}
            <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
                <h3 className="text-lg font-semibold text-[rgb(29,29,31)]">Basic Information</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-[rgb(29,29,31)] mb-2">Team Name</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-[rgb(0,113,227)]/20 focus:border-[rgb(0,113,227)]"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[rgb(29,29,31)] mb-2">Sport</label>
                        <select
                            value={formData.sport}
                            onChange={(e) => setFormData({ ...formData, sport: e.target.value })}
                            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-[rgb(0,113,227)]/20 focus:border-[rgb(0,113,227)]"
                        >
                            <option value="Baseball">Baseball</option>
                            <option value="Softball">Softball</option>
                            <option value="Basketball">Basketball</option>
                            <option value="Soccer">Soccer</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[rgb(29,29,31)] mb-2">Age Group</label>
                        <input
                            type="text"
                            value={formData.age_group}
                            onChange={(e) => setFormData({ ...formData, age_group: e.target.value })}
                            placeholder="e.g. 12U"
                            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-[rgb(0,113,227)]/20 focus:border-[rgb(0,113,227)]"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[rgb(29,29,31)] mb-2">Gender</label>
                        <select
                            value={formData.gender}
                            onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-[rgb(0,113,227)]/20 focus:border-[rgb(0,113,227)]"
                        >
                            <option value="">Select Gender</option>
                            <option value="Boys">Boys</option>
                            <option value="Girls">Girls</option>
                            <option value="Coed">Coed</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[rgb(29,29,31)] mb-2">Current Season</label>
                        <input
                            type="text"
                            value={formData.season}
                            onChange={(e) => setFormData({ ...formData, season: e.target.value })}
                            placeholder="e.g. Spring 2025"
                            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-[rgb(0,113,227)]/20 focus:border-[rgb(0,113,227)]"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[rgb(29,29,31)] mb-2">Founded Year</label>
                        <input
                            type="number"
                            value={formData.founded_year}
                            onChange={(e) => setFormData({ ...formData, founded_year: e.target.value })}
                            placeholder="e.g. 2020"
                            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-[rgb(0,113,227)]/20 focus:border-[rgb(0,113,227)]"
                        />
                    </div>
                </div>

                <div className="space-y-6 pt-4 border-t border-slate-100">
                    <h3 className="text-lg font-semibold text-[rgb(29,29,31)]">Team Profile</h3>

                    <div>
                        <label className="block text-sm font-medium text-[rgb(29,29,31)] mb-2">Bio / Description</label>
                        <textarea
                            value={formData.bio}
                            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                            rows={4}
                            placeholder="Tell us about your team..."
                            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-[rgb(0,113,227)]/20 focus:border-[rgb(0,113,227)]"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-[rgb(29,29,31)] mb-2">Home Field</label>
                            <input
                                type="text"
                                value={formData.home_field}
                                onChange={(e) => setFormData({ ...formData, home_field: e.target.value })}
                                placeholder="e.g. Central Park Field 1"
                                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-[rgb(0,113,227)]/20 focus:border-[rgb(0,113,227)]"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[rgb(29,29,31)] mb-2">Practice Schedule</label>
                            <input
                                type="text"
                                value={formData.practice_schedule}
                                onChange={(e) => setFormData({ ...formData, practice_schedule: e.target.value })}
                                placeholder="e.g. Mon/Wed 6-8pm"
                                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-[rgb(0,113,227)]/20 focus:border-[rgb(0,113,227)]"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2.5 bg-[rgb(0,113,227)] text-white font-medium rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                        {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <Save className="w-5 h-5" />
                        )}
                        <span>Save Changes</span>
                    </button>
                </div>
            </form>
        </div>
    );
}
