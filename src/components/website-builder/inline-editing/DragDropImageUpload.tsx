import { useState, useRef, DragEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Image as ImageIcon, X, Check, Loader2, Search } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { showToast } from '../../ui/Toast';

interface DragDropImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  editMode: boolean;
  placeholder?: string;
  aspectRatio?: 'video' | 'square' | 'portrait' | 'auto';
  showUnsplash?: boolean;
}

export default function DragDropImageUpload({
  value,
  onChange,
  editMode,
  placeholder = 'Upload Image',
  aspectRatio = 'auto',
  showUnsplash = true,
}: DragDropImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showUnsplashSearch, setShowUnsplashSearch] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (editMode) setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (!editMode) return;

    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find((file) => file.type.startsWith('image/'));

    if (imageFile) {
      await uploadImage(imageFile);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadImage(file);
    }
  };

  const uploadImage = async (file: File) => {
    try {
      console.log('🚀 [DEBUG] Upload started');
      console.log('📁 [DEBUG] File details:', {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: new Date(file.lastModified).toISOString()
      });

      setUploading(true);
      setUploadError(null);
      setUploadProgress(0);

      // Validate file size (10MB limit)
      const maxSize = 10 * 1024 * 1024; // 10MB in bytes
      console.log(`📏 [DEBUG] Size check: ${file.size} bytes (max: ${maxSize} bytes)`);
      if (file.size > maxSize) {
        throw new Error('File size exceeds 10MB limit');
      }

      // Validate file type
      console.log(`🎨 [DEBUG] Type check: ${file.type}`);
      if (!file.type.startsWith('image/')) {
        throw new Error('Please select an image file');
      }

      console.log('✅ [DEBUG] Validation passed');

      // Check Supabase connection and bucket access
      console.log('🔌 [DEBUG] Checking Supabase connection...');
      try {
        // Try to list buckets (may fail due to permissions)
        const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
        console.log('🗂️ [DEBUG] Available buckets:', buckets?.map(b => b.name) || []);

        if (bucketsError) {
          console.warn('⚠️ [DEBUG] Cannot list buckets (permissions):', bucketsError.message);
          console.log('   Trying direct bucket access instead...');
        }

        // Direct bucket access check (more reliable)
        console.log('🪣 [DEBUG] Testing direct access to "website-assets" bucket...');
        const { data: bucketTest, error: bucketAccessError } = await supabase.storage
          .from('website-assets')
          .list('', { limit: 1 });

        if (bucketAccessError) {
          console.error('❌ [DEBUG] Bucket access error:', bucketAccessError);
          throw new Error(
            '❌ Bucket "website-assets" not found or not accessible.\n\n' +
            'Please create it in Supabase Dashboard:\n' +
            '1. Go to: https://supabase.com/dashboard\n' +
            '2. Click "Storage" in sidebar\n' +
            '3. Click "New Bucket"\n' +
            '4. Name it "website-assets"\n' +
            '5. Toggle "Public bucket" to ON\n' +
            '6. Click "Save"\n\n' +
            `Error: ${bucketAccessError.message}`
          );
        }

        console.log('✅ [DEBUG] Bucket "website-assets" exists and is accessible!');
        console.log('   Bucket contents:', bucketTest?.length || 0, 'items');
      } catch (connectionError) {
        console.error('❌ [DEBUG] Connection check failed:', connectionError);
        throw connectionError;
      }

      console.log('✅ [DEBUG] Supabase storage ready for upload');

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 100);

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `website-images/${fileName}`;

      console.log('📤 [DEBUG] Upload details:', {
        originalName: file.name,
        generatedName: fileName,
        fullPath: filePath,
        bucket: 'website-assets'
      });

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('website-assets')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      clearInterval(progressInterval);

      if (uploadError) {
        console.error('❌ [DEBUG] Storage upload error:', {
          message: uploadError.message,
          statusCode: uploadError.statusCode,
          error: uploadError
        });
        throw new Error(uploadError.message || 'Failed to upload image');
      }

      console.log('✅ [DEBUG] Upload successful:', uploadData);
      console.log('🔗 [DEBUG] Getting public URL...');

      const { data } = supabase.storage
        .from('website-assets')
        .getPublicUrl(filePath);

      console.log('✅ [DEBUG] Public URL generated:', data.publicUrl);

      setUploadProgress(100);
      onChange(data.publicUrl);

      // Show success animation and toast
      setShowSuccess(true);
      showToast.success('Image uploaded successfully!');
      console.log('🎉 [DEBUG] Upload completed successfully!');
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (error) {
      console.error('💥 [DEBUG] Upload failed with error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      console.error('📝 [DEBUG] Error message:', errorMessage);
      setUploadError(errorMessage);
      showToast.error(`Upload failed: ${errorMessage}`);
    } finally {
      setUploading(false);
      setUploadProgress(0);
      console.log('🏁 [DEBUG] Upload process finished');
    }
  };

  const aspectClasses = {
    video: 'aspect-video',
    square: 'aspect-square',
    portrait: 'aspect-[3/4]',
    auto: '',
  };

  if (!editMode && !value) return null;

  return (
    <div className="relative group">
      {/* Existing Image Display */}
      {value && (
        <div className="relative overflow-hidden rounded-xl">
          <motion.img
            src={value}
            alt="Section image"
            className="w-full h-auto object-cover"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          />

          {/* Hover Overlay (Edit Mode) */}
          {editMode && (
            <motion.div
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
              className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end justify-center p-6 transition-opacity"
            >
              <div className="flex gap-3">
                <motion.button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-3 bg-white text-slate-900 rounded-lg font-semibold hover:bg-slate-100 transition-all shadow-xl flex items-center gap-2"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Upload className="w-4 h-4" />
                  Change Image
                </motion.button>

                {showUnsplash && (
                  <motion.button
                    onClick={() => setShowUnsplashSearch(true)}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all shadow-xl flex items-center gap-2"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Search className="w-4 h-4" />
                    Unsplash
                  </motion.button>
                )}

                <motion.button
                  onClick={() => onChange('')}
                  className="px-4 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-all shadow-xl"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Success Overlay */}
          <AnimatePresence>
            {showSuccess && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-green-600/90 flex items-center justify-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={{ type: 'spring', bounce: 0.5 }}
                >
                  <Check className="w-16 h-16 text-white" />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Empty State with Drag & Drop */}
      {!value && editMode && (
        <motion.div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={`relative ${aspectClasses[aspectRatio] || 'h-96'} ${
            isDragging
              ? 'border-blue-500 bg-blue-500/20 scale-[1.02]'
              : 'border-slate-700 bg-gradient-to-br from-slate-800/50 to-slate-900/50 hover:border-blue-400 hover:bg-slate-800/70'
          } border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 overflow-hidden`}
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.2 }}
        >
          {/* Animated Background Pattern */}
          <motion.div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: 'radial-gradient(circle, #3b82f6 1px, transparent 1px)',
              backgroundSize: '20px 20px',
            }}
            animate={{
              backgroundPosition: ['0px 0px', '20px 20px'],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: 'linear',
            }}
          />

          <div className="relative z-10 text-center space-y-6 p-8">
            {uploading ? (
              <>
                {/* Upload Progress */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring' }}
                  className="relative"
                >
                  <div className="w-20 h-20 rounded-full border-4 border-slate-700 flex items-center justify-center mx-auto">
                    <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
                  </div>
                  <div
                    className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent"
                    style={{
                      transform: `rotate(${(uploadProgress / 100) * 360}deg)`,
                      transition: 'transform 0.3s ease',
                    }}
                  />
                </motion.div>
                <div>
                  <p className="text-white font-semibold text-lg">Uploading...</p>
                  <p className="text-slate-400 text-sm mt-1">{uploadProgress}%</p>
                </div>
              </>
            ) : (
              <>
                {/* Upload Icon */}
                <motion.div
                  animate={{
                    y: isDragging ? [0, -10, 0] : 0,
                  }}
                  transition={{
                    duration: 0.6,
                    repeat: isDragging ? Infinity : 0,
                  }}
                >
                  <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-xl">
                    {isDragging ? (
                      <ImageIcon className="w-10 h-10 text-white" />
                    ) : (
                      <Upload className="w-10 h-10 text-white" />
                    )}
                  </div>
                </motion.div>

                {/* Text */}
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-white">
                    {isDragging ? 'Drop it here!' : placeholder}
                  </h3>
                  <p className="text-slate-400">
                    {isDragging
                      ? 'Release to upload'
                      : 'Drag & drop an image or click to browse'}
                  </p>
                  <p className="text-slate-500 text-sm">PNG, JPG, GIF up to 10MB</p>
                </div>

                {/* Action Buttons */}
                {!isDragging && (
                  <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                    <motion.button
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                      className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-600/30"
                      whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(59, 130, 246, 0.4)' }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Choose File
                    </motion.button>

                    {showUnsplash && (
                      <motion.button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowUnsplashSearch(true);
                        }}
                        className="px-8 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-purple-800 transition-all shadow-lg shadow-purple-600/30"
                        whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(147, 51, 234, 0.4)' }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Search className="w-4 h-4 inline mr-2" />
                        Search Unsplash
                      </motion.button>
                    )}
                  </div>
                )}
              </>
            )}

            {/* Error Message */}
            {uploadError && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-3 bg-red-500/20 border border-red-500 rounded-lg"
              >
                <p className="text-red-400 text-sm">{uploadError}</p>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={!editMode}
      />

      {/* Unsplash Search Modal (Placeholder for now) */}
      <AnimatePresence>
        {showUnsplashSearch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-[10000] flex items-center justify-center p-4"
            onClick={() => setShowUnsplashSearch(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-800 rounded-2xl p-8 max-w-4xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Search Unsplash</h2>
                <button
                  onClick={() => setShowUnsplashSearch(false)}
                  className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>
              <p className="text-slate-400">Unsplash integration coming soon...</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
