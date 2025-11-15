import { useState, useEffect, useRef } from 'react';
import { Upload, Video, Star, X, Edit2, Trash2, Loader2, AlertCircle, Play, Film } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { PlayerMedia } from '../../../lib/supabase';

interface VideoHighlightsManagerProps {
  playerId: string;
  editMode: boolean;
}

export default function VideoHighlightsManager({ playerId, editMode }: VideoHighlightsManagerProps) {
  const [videos, setVideos] = useState<PlayerMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [playingVideo, setPlayingVideo] = useState<PlayerMedia | null>(null);
  const [editingVideo, setEditingVideo] = useState<string | null>(null);
  const [videoTitle, setVideoTitle] = useState('');
  const [videoDescription, setVideoDescription] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

  useEffect(() => {
    loadVideos();
  }, [playerId]);

  const loadVideos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('player_media')
        .select('*')
        .eq('player_id', playerId)
        .eq('media_type', 'video')
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVideos(data || []);
    } catch (err) {
      console.error('Error loading videos:', err);
      setError('Failed to load videos');
    } finally {
      setLoading(false);
    }
  };

  const generateThumbnail = (video: HTMLVideoElement): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      } else {
        resolve('');
      }
    });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadVideo(file);
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (!editMode) return;

    const file = Array.from(e.dataTransfer.files).find(f =>
      f.type.startsWith('video/')
    );

    if (file) {
      await uploadVideo(file);
    }
  };

  const uploadVideo = async (file: File) => {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      setError(`Video file is too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum size is 50MB. Please compress your video using a tool like HandBrake or an online compressor.`);
      return;
    }

    setUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Generate filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `videos/${user.id}/${fileName}`;

      // Create a video element to extract metadata
      const videoElement = document.createElement('video');
      const videoURL = URL.createObjectURL(file);
      videoElement.src = videoURL;

      await new Promise((resolve) => {
        videoElement.onloadedmetadata = resolve;
      });

      const duration = Math.round(videoElement.duration);

      // Generate thumbnail
      videoElement.currentTime = Math.min(duration / 4, 2); // Seek to 25% or 2 seconds
      await new Promise((resolve) => setTimeout(resolve, 100));

      const thumbnailDataUrl = await generateThumbnail(videoElement);

      setUploadProgress(10);

      // Upload thumbnail if generated
      let thumbnailUrl = null;
      if (thumbnailDataUrl) {
        const thumbnailBlob = await (await fetch(thumbnailDataUrl)).blob();
        const thumbnailPath = `videos/${user.id}/thumb-${fileName}.jpg`;

        const { error: thumbError } = await supabase.storage
          .from('player-media')
          .upload(thumbnailPath, thumbnailBlob, {
            cacheControl: '3600',
            upsert: false
          });

        if (!thumbError) {
          const { data: { publicUrl } } = supabase.storage
            .from('player-media')
            .getPublicUrl(thumbnailPath);
          thumbnailUrl = publicUrl;
        }
      }

      setUploadProgress(20);

      // Upload video with progress
      const { error: uploadError } = await supabase.storage
        .from('player-media')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          onUploadProgress: (progress) => {
            const percent = (progress.loaded / progress.total) * 70 + 20; // 20-90%
            setUploadProgress(percent);
          }
        });

      if (uploadError) throw uploadError;

      setUploadProgress(90);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('player-media')
        .getPublicUrl(filePath);

      // Save to database
      console.log('🔍 Attempting video database insert with player_id:', playerId);
      const { data: insertData, error: dbError } = await supabase
        .from('player_media')
        .insert({
          player_id: playerId,
          media_type: 'video',
          file_url: publicUrl,
          thumbnail_url: thumbnailUrl,
          file_size: file.size,
          mime_type: file.type,
          duration: duration,
          is_featured: videos.length === 0, // First video is featured by default
          display_order: videos.length
        })
        .select();

      if (dbError) {
        console.error('❌ VIDEO DATABASE INSERT FAILED:', dbError);
        console.error('   Code:', dbError.code);
        console.error('   Message:', dbError.message);
        console.error('   Details:', dbError.details);
        throw dbError;
      }

      console.log('✅ Video database insert successful! Record:', insertData);

      setUploadProgress(100);
      URL.revokeObjectURL(videoURL);

      await loadVideos();
    } catch (err) {
      console.error('Error uploading video:', err);
      setError('Failed to upload video');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const setFeaturedVideo = async (videoId: string) => {
    try {
      // Unset all featured videos
      await supabase
        .from('player_media')
        .update({ is_featured: false })
        .eq('player_id', playerId)
        .eq('media_type', 'video');

      // Set new featured video
      const { error } = await supabase
        .from('player_media')
        .update({ is_featured: true })
        .eq('id', videoId);

      if (error) throw error;
      await loadVideos();
    } catch (err) {
      console.error('Error setting featured video:', err);
      setError('Failed to set featured video');
    }
  };

  const updateVideoInfo = async (videoId: string) => {
    try {
      const { error } = await supabase
        .from('player_media')
        .update({
          title: videoTitle,
          description: videoDescription
        })
        .eq('id', videoId);

      if (error) throw error;
      await loadVideos();
      setEditingVideo(null);
      setVideoTitle('');
      setVideoDescription('');
    } catch (err) {
      console.error('Error updating video info:', err);
      setError('Failed to update video info');
    }
  };

  const deleteVideo = async (videoId: string, fileUrl: string, thumbnailUrl: string | null) => {
    if (!confirm('Are you sure you want to delete this video?')) return;

    try {
      // Extract file paths from URLs
      const videoUrlParts = fileUrl.split('/');
      const videoPath = `videos/${videoUrlParts[videoUrlParts.length - 2]}/${videoUrlParts[videoUrlParts.length - 1]}`;

      // Delete video from storage
      await supabase.storage
        .from('player-media')
        .remove([videoPath]);

      // Delete thumbnail if exists
      if (thumbnailUrl) {
        const thumbUrlParts = thumbnailUrl.split('/');
        const thumbPath = `videos/${thumbUrlParts[thumbUrlParts.length - 2]}/${thumbUrlParts[thumbUrlParts.length - 1]}`;
        await supabase.storage
          .from('player-media')
          .remove([thumbPath]);
      }

      // Delete from database
      const { error } = await supabase
        .from('player_media')
        .delete()
        .eq('id', videoId);

      if (error) throw error;
      await loadVideos();
    } catch (err) {
      console.error('Error deleting video:', err);
      setError('Failed to delete video');
    }
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-400 text-sm">{error}</p>
            {error.includes('too large') && (
              <p className="text-red-300 text-xs mt-2">
                Tip: Use <a href="https://handbrake.fr/" target="_blank" rel="noopener" className="underline">HandBrake</a> (free) or an online video compressor to reduce file size while maintaining quality.
              </p>
            )}
          </div>
        </div>
      )}

      {editMode && (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed border-slate-700 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-300 mb-2">Drag and drop a video here, or click to select</p>
          <p className="text-sm text-slate-500">Supports MP4, MOV, AVI (max 50MB, ~2-5 minutes)</p>
          <p className="text-xs text-slate-600 mt-2">For best results: 720p resolution, H.264 codec</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      )}

      {/* Upload Progress */}
      {uploading && (
        <div className="bg-slate-800/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-300">Uploading video...</span>
            <span className="text-sm text-slate-400">{Math.round(uploadProgress)}%</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <p className="text-xs text-slate-500 mt-2">This may take a minute...</p>
        </div>
      )}

      {/* Video Grid */}
      {videos.length === 0 ? (
        <div className="text-center py-12 bg-slate-800/30 rounded-lg border border-slate-700/50">
          <Film className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">No videos yet</p>
          {editMode && (
            <p className="text-sm text-slate-500 mt-2">Upload highlight reels to showcase your best plays</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <div
              key={video.id}
              className="relative group bg-slate-800/50 rounded-lg overflow-hidden border border-slate-700/50 hover:border-blue-500/50 transition-all"
            >
              {/* Featured Badge */}
              {video.is_featured && (
                <div className="absolute top-2 left-2 z-10 px-2 py-1 bg-yellow-500/90 rounded-full flex items-center space-x-1">
                  <Star className="w-3 h-3 text-white fill-white" />
                  <span className="text-xs text-white font-medium">Featured</span>
                </div>
              )}

              {/* Thumbnail/Preview */}
              <div className="relative aspect-video bg-slate-900">
                {video.thumbnail_url ? (
                  <img
                    src={video.thumbnail_url}
                    alt={video.title || 'Video thumbnail'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Video className="w-16 h-16 text-slate-600" />
                  </div>
                )}
                <button
                  onClick={() => setPlayingVideo(video)}
                  className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
                    <Play className="w-8 h-8 text-white ml-1" fill="white" />
                  </div>
                </button>
                <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/80 rounded text-xs text-white">
                  {formatDuration(video.duration)}
                </div>
              </div>

              {/* Video Info */}
              <div className="p-4">
                <h4 className="text-white font-medium mb-1 truncate">
                  {video.title || 'Untitled Video'}
                </h4>
                {video.description && (
                  <p className="text-sm text-slate-400 line-clamp-2">{video.description}</p>
                )}

                {/* Edit Controls */}
                {editMode && (
                  <div className="flex space-x-2 mt-3">
                    {!video.is_featured && (
                      <button
                        onClick={() => setFeaturedVideo(video.id)}
                        className="flex-1 px-3 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 text-sm rounded transition-colors flex items-center justify-center space-x-1"
                        title="Set as featured"
                      >
                        <Star className="w-3 h-3" />
                        <span>Feature</span>
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setEditingVideo(video.id);
                        setVideoTitle(video.title || '');
                        setVideoDescription(video.description || '');
                      }}
                      className="flex-1 px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 text-sm rounded transition-colors flex items-center justify-center space-x-1"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => deleteVideo(video.id, video.file_url, video.thumbnail_url)}
                      className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-sm rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Video Player Modal */}
      {playingVideo && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={() => setPlayingVideo(null)}
        >
          <button
            onClick={() => setPlayingVideo(null)}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
          <div className="max-w-6xl w-full" onClick={(e) => e.stopPropagation()}>
            <video
              ref={videoRef}
              src={playingVideo.file_url}
              controls
              autoPlay
              className="w-full rounded-lg"
            />
            {(playingVideo.title || playingVideo.description) && (
              <div className="mt-4 text-white">
                {playingVideo.title && (
                  <h3 className="text-xl font-bold mb-2">{playingVideo.title}</h3>
                )}
                {playingVideo.description && (
                  <p className="text-slate-300">{playingVideo.description}</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Video Info Modal */}
      {editingVideo && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => {
            setEditingVideo(null);
            setVideoTitle('');
            setVideoDescription('');
          }}
        >
          <div
            className="bg-slate-900 border border-slate-700 rounded-lg p-6 max-w-lg w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-white mb-4">Edit Video Info</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Title</label>
                <input
                  type="text"
                  value={videoTitle}
                  onChange={(e) => setVideoTitle(e.target.value)}
                  placeholder="e.g., Championship Game Highlights"
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                <textarea
                  value={videoDescription}
                  onChange={(e) => setVideoDescription(e.target.value)}
                  placeholder="Describe the video..."
                  rows={4}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50"
                />
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  setEditingVideo(null);
                  setVideoTitle('');
                  setVideoDescription('');
                }}
                className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => updateVideoInfo(editingVideo)}
                className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
