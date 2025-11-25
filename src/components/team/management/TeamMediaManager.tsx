import { useState, useEffect } from 'react';
import { Loader2, Plus, Trash2, Image as ImageIcon, Play } from 'lucide-react';
import { supabase, TeamMedia } from '../../../lib/supabase';
import { toast } from 'react-hot-toast';
import { AppleEmptyState } from '../../apple';

interface TeamMediaManagerProps {
    teamId: string;
}

export default function TeamMediaManager({ teamId }: TeamMediaManagerProps) {
    const [media, setMedia] = useState<TeamMedia[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        loadMedia();
    }, [teamId]);

    const loadMedia = async () => {
        try {
            const { data, error } = await supabase
                .from('team_media')
                .select('*')
                .eq('team_id', teamId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setMedia(data || []);
        } catch (error) {
            console.error('Error loading media:', error);
            toast.error('Failed to load media');
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Basic validation
        const isImage = file.type.startsWith('image/');
        const isVideo = file.type.startsWith('video/');

        if (!isImage && !isVideo) {
            toast.error('Please upload an image or video file');
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            toast.error('File must be less than 10MB');
            return;
        }

        setUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `media-${teamId}-${Date.now()}.${fileExt}`;
            const filePath = `team-media/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('team-assets')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: urlData } = supabase.storage
                .from('team-assets')
                .getPublicUrl(filePath);

            const { error: insertError } = await supabase
                .from('team_media')
                .insert({
                    team_id: teamId,
                    media_type: isVideo ? 'video' : 'photo',
                    url: urlData.publicUrl,
                    title: file.name,
                });

            if (insertError) throw insertError;

            toast.success('Media uploaded successfully');
            loadMedia();
        } catch (error) {
            console.error('Error uploading media:', error);
            toast.error('Failed to upload media');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this item?')) return;

        try {
            const { error } = await supabase
                .from('team_media')
                .delete()
                .eq('id', id);

            if (error) throw error;

            toast.success('Media deleted');
            loadMedia();
        } catch (error) {
            console.error('Error deleting media:', error);
            toast.error('Failed to delete media');
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
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-[rgb(29,29,31)]">Media Gallery</h3>
                <label className="cursor-pointer px-4 py-2 bg-[rgb(0,113,227)] text-white font-medium rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2">
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    <span>Upload Media</span>
                    <input
                        type="file"
                        accept="image/*,video/*"
                        onChange={handleUpload}
                        disabled={uploading}
                        className="hidden"
                    />
                </label>
            </div>

            {media.length === 0 ? (
                <AppleEmptyState
                    icon={<ImageIcon className="w-12 h-12" />}
                    title="No Media"
                    description="Upload photos and videos to showcase your team."
                />
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {media.map((item) => (
                        <div
                            key={item.id}
                            className="group relative aspect-square bg-slate-100 rounded-xl overflow-hidden border border-slate-200"
                        >
                            {item.media_type === 'video' ? (
                                <div className="w-full h-full flex items-center justify-center bg-slate-900">
                                    <Play className="w-12 h-12 text-white opacity-50" />
                                </div>
                            ) : (
                                <img
                                    src={item.url}
                                    alt={item.title || 'Team media'}
                                    className="w-full h-full object-cover"
                                />
                            )}

                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button
                                    onClick={() => handleDelete(item.id)}
                                    className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-red-500/80 transition-colors"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
