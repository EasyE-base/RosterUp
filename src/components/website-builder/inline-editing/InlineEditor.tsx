import { useState, useRef, useEffect, ChangeEvent } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { useSelectedElement } from '../../../contexts/SelectedElementContext';

export type InlineEditorType = 'text' | 'heading' | 'image' | 'button' | 'email' | 'phone' | 'textarea';

interface InlineEditorProps {
  value: string;
  onChange: (value: string) => void;
  type?: InlineEditorType;
  editMode?: boolean;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function InlineEditor({
  value,
  onChange,
  type = 'text',
  editMode = true,
  placeholder = 'Click to edit',
  className = '',
  style = {},
}: InlineEditorProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [localValue, setLocalValue] = useState(value);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const contentEditableRef = useRef<HTMLDivElement>(null);
  const { selectedElement } = useSelectedElement();

  // Disable inline editing if an element is selected for styling (not in editing mode)
  const isElementSelected = selectedElement && !selectedElement.isEditing;

  // Update local value when prop value changes (but only when not focused)
  useEffect(() => {
    if (document.activeElement !== contentEditableRef.current) {
      setLocalValue(value);
    }
  }, [value]);

  // Handle image upload to Supabase Storage
  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setUploadError(null);

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `website-images/${fileName}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('public')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('public')
        .getPublicUrl(filePath);

      onChange(publicUrl);
    } catch (error) {
      console.error('Error uploading image:', error);
      setUploadError('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  // Render image type
  if (type === 'image') {
    return (
      <div className={`relative group ${className}`} style={style}>
        {value ? (
          <div className="relative">
            <img
              src={value}
              alt="Section image"
              className="w-full h-auto rounded-lg"
            />
            {editMode && (
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-white text-slate-900 rounded-lg font-medium hover:bg-slate-100 transition-colors flex items-center space-x-2"
                  disabled={uploading}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>Change Image</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div
            className={`w-full h-64 border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-all ${
              editMode
                ? 'border-blue-400 bg-blue-500/10 cursor-pointer hover:border-blue-300 hover:bg-blue-500/20'
                : 'border-slate-700 bg-slate-800/30'
            }`}
            onClick={() => editMode && fileInputRef.current?.click()}
          >
            <div className="text-center space-y-3">
              <div className="flex justify-center">
                <div className="p-4 rounded-full bg-blue-500/20">
                  <Upload className="w-8 h-8 text-blue-400" />
                </div>
              </div>
              <div>
                <p className="text-white font-semibold">
                  {placeholder || 'Upload Image'}
                </p>
                <p className="text-slate-400 text-sm mt-1">
                  Click to select an image from your computer
                </p>
              </div>
              {editMode && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  disabled={uploading}
                >
                  {uploading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Uploading...
                    </span>
                  ) : (
                    'Choose Image'
                  )}
                </button>
              )}
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
          disabled={!editMode}
        />

        {uploadError && (
          <p className="text-red-400 text-sm mt-2">{uploadError}</p>
        )}
      </div>
    );
  }

  // Render textarea type
  if (type === 'textarea') {
    return (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={!editMode}
        placeholder={placeholder}
        className={`w-full px-3 py-2 bg-transparent border ${
          editMode
            ? 'border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50'
            : 'border-transparent'
        } rounded-lg text-white placeholder-slate-500 outline-none resize-vertical min-h-[100px] ${className}`}
        style={style}
      />
    );
  }

  // Render text/heading/button/email/phone types using contentEditable
  const getInputType = () => {
    switch (type) {
      case 'email':
        return 'email';
      case 'phone':
        return 'tel';
      default:
        return 'text';
    }
  };

  const getDefaultClasses = () => {
    switch (type) {
      case 'heading':
        return 'text-3xl font-bold';
      case 'button':
        return 'px-6 py-3 bg-blue-500 hover:bg-blue-600 rounded-lg font-semibold inline-block';
      case 'email':
      case 'phone':
        return 'text-blue-400 hover:text-blue-300';
      default:
        return 'text-base';
    }
  };

  // For simple text types, use input element
  if (editMode && !isElementSelected) {
    return (
      <input
        ref={contentEditableRef as any}
        type={getInputType()}
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onBlur={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`${getDefaultClasses()} outline-none focus:ring-2 focus:ring-blue-500/50 rounded px-2 py-1 bg-transparent border-0 w-auto ${className}`}
        style={{ minWidth: '60px', maxWidth: '200px', width: `${Math.max(60, (localValue?.length || 0) * 8 + 20)}px`, ...style }}
      />
    );
  }

  // View mode - just display text
  return (
    <span className={`${getDefaultClasses()} ${className}`} style={style}>
      {value || placeholder}
    </span>
  );
}
