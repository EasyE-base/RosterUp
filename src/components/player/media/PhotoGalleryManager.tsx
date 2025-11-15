import { useState, useEffect, useRef } from 'react';
import { Upload, Image as ImageIcon, Star, X, Edit2, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { PlayerMedia } from '../../../lib/supabase';
import imageCompression from 'browser-image-compression';

interface PhotoGalleryManagerProps {
  playerId: string;
  editMode: boolean;
}

export default function PhotoGalleryManager({ playerId, editMode }: PhotoGalleryManagerProps) {
  const [photos, setPhotos] = useState<PlayerMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [error, setError] = useState<string | null>(null);
  const [lightboxImage, setLightboxImage] = useState<PlayerMedia | null>(null);
  const [editingCaption, setEditingCaption] = useState<string | null>(null);
  const [captionText, setCaptionText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadPhotos();
  }, [playerId]);

  const loadPhotos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('player_media')
        .select('*')
        .eq('player_id', playerId)
        .eq('media_type', 'photo')
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPhotos(data || []);
    } catch (err) {
      console.error('Error loading photos:', err);
      setError('Failed to load photos');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      await uploadPhotos(files);
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (!editMode) return;

    const files = Array.from(e.dataTransfer.files).filter(file =>
      file.type.startsWith('image/')
    );

    if (files.length > 0) {
      await uploadPhotos(files);
    }
  };

  const uploadPhotos = async (files: File[]) => {
    setUploading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      for (const file of files) {
        const fileId = Math.random().toString(36);
        setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));

        try {
          // Compress image
          const options = {
            maxSizeMB: 2,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
            onProgress: (progress: number) => {
              setUploadProgress(prev => ({ ...prev, [fileId]: progress * 0.5 }));
            }
          };

          const compressedFile = await imageCompression(file, options);

          // Generate filename
          const fileExt = compressedFile.name.split('.').pop();
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
          const filePath = `photos/${user.id}/${fileName}`;

          // Upload to storage
          const { error: uploadError } = await supabase.storage
            .from('player-media')
            .upload(filePath, compressedFile, {
              cacheControl: '3600',
              upsert: false
            });

          if (uploadError) throw uploadError;

          setUploadProgress(prev => ({ ...prev, [fileId]: 75 }));

          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from('player-media')
            .getPublicUrl(filePath);

          // Save to database
          console.log('🔍 Attempting database insert with player_id:', playerId);
          const { data: insertData, error: dbError } = await supabase
            .from('player_media')
            .insert({
              player_id: playerId,
              media_type: 'photo',
              file_url: publicUrl,
              file_size: compressedFile.size,
              mime_type: compressedFile.type,
              is_featured: false,
              display_order: photos.length
            })
            .select();

          if (dbError) {
            console.error('❌ DATABASE INSERT FAILED:', dbError);
            console.error('   Code:', dbError.code);
            console.error('   Message:', dbError.message);
            console.error('   Details:', dbError.details);
            throw dbError;
          }

          console.log('✅ Database insert successful! Record:', insertData);

          setUploadProgress(prev => ({ ...prev, [fileId]: 100 }));

          // Remove progress after a delay
          setTimeout(() => {
            setUploadProgress(prev => {
              const newProgress = { ...prev };
              delete newProgress[fileId];
              return newProgress;
            });
          }, 1000);

        } catch (err) {
          console.error('Error uploading photo:', err);
          setError(`Failed to upload ${file.name}`);
        }
      }

      await loadPhotos();
    } finally {
      setUploading(false);
    }
  };

  const setFeaturedPhoto = async (photoId: string) => {
    try {
      // Unset all featured photos
      await supabase
        .from('player_media')
        .update({ is_featured: false })
        .eq('player_id', playerId)
        .eq('media_type', 'photo');

      // Set new featured photo
      const { error } = await supabase
        .from('player_media')
        .update({ is_featured: true })
        .eq('id', photoId);

      if (error) throw error;
      await loadPhotos();
    } catch (err) {
      console.error('Error setting featured photo:', err);
      setError('Failed to set featured photo');
    }
  };

  const updateCaption = async (photoId: string, caption: string) => {
    try {
      const { error } = await supabase
        .from('player_media')
        .update({ description: caption })
        .eq('id', photoId);

      if (error) throw error;
      await loadPhotos();
      setEditingCaption(null);
      setCaptionText('');
    } catch (err) {
      console.error('Error updating caption:', err);
      setError('Failed to update caption');
    }
  };

  const deletePhoto = async (photoId: string, fileUrl: string) => {
    if (!confirm('Are you sure you want to delete this photo?')) return;

    try {
      // Extract file path from URL
      const urlParts = fileUrl.split('/');
      const filePath = `photos/${urlParts[urlParts.length - 2]}/${urlParts[urlParts.length - 1]}`;

      // Delete from storage
      await supabase.storage
        .from('player-media')
        .remove([filePath]);

      // Delete from database
      const { error } = await supabase
        .from('player_media')
        .delete()
        .eq('id', photoId);

      if (error) throw error;
      await loadPhotos();
    } catch (err) {
      console.error('Error deleting photo:', err);
      setError('Failed to delete photo');
    }
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
          <p className="text-red-400 text-sm">{error}</p>
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
          <p className="text-slate-300 mb-2">Drag and drop photos here, or click to select</p>
          <p className="text-sm text-slate-500">Supports JPG, PNG, WEBP (max 10MB each)</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      )}

      {/* Upload Progress */}
      {Object.keys(uploadProgress).length > 0 && (
        <div className="space-y-2">
          {Object.entries(uploadProgress).map(([id, progress]) => (
            <div key={id} className="bg-slate-800/50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-300">Uploading...</span>
                <span className="text-sm text-slate-400">{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Photo Grid */}
      {photos.length === 0 ? (
        <div className="text-center py-12 bg-slate-800/30 rounded-lg border border-slate-700/50">
          <ImageIcon className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">No photos yet</p>
          {editMode && (
            <p className="text-sm text-slate-500 mt-2">Upload some action shots to showcase your skills</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="relative group aspect-square bg-slate-800/50 rounded-lg overflow-hidden border border-slate-700/50 hover:border-blue-500/50 transition-all"
            >
              {/* Featured Badge */}
              {photo.is_featured && (
                <div className="absolute top-2 left-2 z-10 px-2 py-1 bg-yellow-500/90 rounded-full flex items-center space-x-1">
                  <Star className="w-3 h-3 text-white fill-white" />
                  <span className="text-xs text-white font-medium">Featured</span>
                </div>
              )}

              {/* Photo */}
              <img
                src={photo.file_url}
                alt={photo.description || 'Player photo'}
                className="w-full h-full object-cover cursor-pointer"
                onClick={() => setLightboxImage(photo)}
                onError={(e) => {
                  console.error('Image failed to load:', photo.file_url);
                  e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23334155" width="100" height="100"/%3E%3Ctext x="50" y="50" text-anchor="middle" fill="%23cbd5e1" font-family="sans-serif" font-size="12"%3EImage Error%3C/text%3E%3C/svg%3E';
                }}
              />

              {/* Edit Overlay */}
              {editMode && (
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                  {!photo.is_featured && (
                    <button
                      onClick={() => setFeaturedPhoto(photo.id)}
                      className="p-2 bg-yellow-500 hover:bg-yellow-600 rounded-full transition-colors"
                      title="Set as featured"
                    >
                      <Star className="w-4 h-4 text-white" />
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setEditingCaption(photo.id);
                      setCaptionText(photo.description || '');
                    }}
                    className="p-2 bg-blue-500 hover:bg-blue-600 rounded-full transition-colors"
                    title="Edit caption"
                  >
                    <Edit2 className="w-4 h-4 text-white" />
                  </button>
                  <button
                    onClick={() => deletePhoto(photo.id, photo.file_url)}
                    className="p-2 bg-red-500 hover:bg-red-600 rounded-full transition-colors"
                    title="Delete photo"
                  >
                    <Trash2 className="w-4 h-4 text-white" />
                  </button>
                </div>
              )}

              {/* Caption */}
              {photo.description && !editMode && (
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                  <p className="text-xs text-white">{photo.description}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <button
            onClick={() => setLightboxImage(null)}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
          <img
            src={lightboxImage.file_url}
            alt={lightboxImage.description || 'Player photo'}
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          {lightboxImage.description && (
            <div className="absolute bottom-4 left-4 right-4 text-center">
              <p className="text-white text-lg">{lightboxImage.description}</p>
            </div>
          )}
        </div>
      )}

      {/* Caption Editor Modal */}
      {editingCaption && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => {
            setEditingCaption(null);
            setCaptionText('');
          }}
        >
          <div
            className="bg-slate-900 border border-slate-700 rounded-lg p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-white mb-4">Edit Caption</h3>
            <textarea
              value={captionText}
              onChange={(e) => setCaptionText(e.target.value)}
              placeholder="Add a caption..."
              rows={4}
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50"
            />
            <div className="flex space-x-3 mt-4">
              <button
                onClick={() => {
                  setEditingCaption(null);
                  setCaptionText('');
                }}
                className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => updateCaption(editingCaption, captionText)}
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
