import { useEffect, useState } from 'react';
import { Image, Play, Loader2 } from 'lucide-react';
import { supabase, TeamMedia } from '../../lib/supabase';
import { AppleEmptyState, AppleHeading } from '../apple';

interface TeamMediaGalleryProps {
    teamId: string;
}

export default function TeamMediaGallery({ teamId }: TeamMediaGalleryProps) {
    const [media, setMedia] = useState<TeamMedia[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'photo' | 'video'>('all');

    useEffect(() => {
        loadMedia();
    }, [teamId]);

    const loadMedia = async () => {
        try {
            const { data } = await supabase
                .from('team_media')
                .select('*')
                .eq('team_id', teamId)
                .order('created_at', { ascending: false });

            setMedia(data || []);
        } catch (error) {
            console.error('Error loading team media:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredMedia = media.filter(item => filter === 'all' || item.media_type === filter);

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-[rgb(0,113,227)]" />
            </div>
        );
    }

    if (media.length === 0) {
        return (
            <AppleEmptyState
                icon={<Image className="w-16 h-16" />}
                title="No Media Yet"
                description="This team hasn't uploaded any photos or videos yet."
                iconColor="gray"
            />
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <AppleHeading level={3} size="card">Media Gallery</AppleHeading>
                <div className="flex bg-slate-100 p-1 rounded-lg">
                    {(['all', 'photo', 'video'] as const).map((type) => (
                        <button
                            key={type}
                            onClick={() => setFilter(type)}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all capitalize ${filter === type
                                    ? 'bg-white text-[rgb(29,29,31)] shadow-sm'
                                    : 'text-[rgb(134,142,150)] hover:text-[rgb(29,29,31)]'
                                }`}
                        >
                            {type === 'all' ? 'All' : type + 's'}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {filteredMedia.map((item) => (
                    <div
                        key={item.id}
                        className="group relative aspect-square bg-slate-100 rounded-xl overflow-hidden cursor-pointer hover:shadow-md transition-all"
                    >
                        <img
                            src={item.thumbnail_url || item.url}
                            alt={item.title || 'Team media'}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />

                        {item.media_type === 'video' && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-lg">
                                    <Play className="w-5 h-5 text-[rgb(29,29,31)] ml-0.5" />
                                </div>
                            </div>
                        )}

                        {item.title && (
                            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                <p className="text-white text-sm font-medium truncate">{item.title}</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
