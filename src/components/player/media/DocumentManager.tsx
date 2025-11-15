import { useState, useEffect, useRef } from 'react';
import { Upload, FileText, Download, Trash2, Loader2, AlertCircle, File, FileCheck } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { PlayerMedia } from '../../../lib/supabase';

interface DocumentManagerProps {
  playerId: string;
  editMode: boolean;
}

const DOCUMENT_TYPES = {
  'application/pdf': { icon: FileText, label: 'PDF' },
  'application/msword': { icon: FileText, label: 'DOC' },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { icon: FileText, label: 'DOCX' },
};

export default function DocumentManager({ playerId, editMode }: DocumentManagerProps) {
  const [documents, setDocuments] = useState<PlayerMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB for documents

  useEffect(() => {
    loadDocuments();
  }, [playerId]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('player_media')
        .select('*')
        .eq('player_id', playerId)
        .eq('media_type', 'document')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (err) {
      console.error('Error loading documents:', err);
      setError('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadDocument(file);
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (!editMode) return;

    const file = Array.from(e.dataTransfer.files).find(f =>
      Object.keys(DOCUMENT_TYPES).includes(f.type)
    );

    if (file) {
      await uploadDocument(file);
    }
  };

  const uploadDocument = async (file: File) => {
    // Validate file type
    if (!Object.keys(DOCUMENT_TYPES).includes(file.type)) {
      setError('Invalid file type. Please upload PDF or DOC/DOCX files.');
      return;
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      setError(`File is too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum size is 10MB.`);
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
      const filePath = `documents/${user.id}/${fileName}`;

      // Upload with progress
      const { error: uploadError } = await supabase.storage
        .from('player-media')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          onUploadProgress: (progress) => {
            const percent = (progress.loaded / progress.total) * 90;
            setUploadProgress(percent);
          }
        });

      if (uploadError) throw uploadError;

      setUploadProgress(95);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('player-media')
        .getPublicUrl(filePath);

      // Save to database
      const { error: dbError } = await supabase
        .from('player_media')
        .insert({
          player_id: playerId,
          media_type: 'document',
          file_url: publicUrl,
          title: file.name,
          file_size: file.size,
          mime_type: file.type,
          display_order: documents.length
        });

      if (dbError) throw dbError;

      setUploadProgress(100);
      await loadDocuments();
    } catch (err) {
      console.error('Error uploading document:', err);
      setError('Failed to upload document');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const downloadDocument = async (fileUrl: string, fileName: string) => {
    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error downloading document:', err);
      setError('Failed to download document');
    }
  };

  const deleteDocument = async (documentId: string, fileUrl: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      // Extract file path from URL
      const urlParts = fileUrl.split('/');
      const filePath = `documents/${urlParts[urlParts.length - 2]}/${urlParts[urlParts.length - 1]}`;

      // Delete from storage
      await supabase.storage
        .from('player-media')
        .remove([filePath]);

      // Delete from database
      const { error } = await supabase
        .from('player_media')
        .delete()
        .eq('id', documentId);

      if (error) throw error;
      await loadDocuments();
    } catch (err) {
      console.error('Error deleting document:', err);
      setError('Failed to delete document');
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return '0 KB';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  const getDocumentIcon = (mimeType: string | null) => {
    if (!mimeType) return FileText;
    return DOCUMENT_TYPES[mimeType as keyof typeof DOCUMENT_TYPES]?.icon || FileText;
  };

  const getDocumentLabel = (mimeType: string | null) => {
    if (!mimeType) return 'Document';
    return DOCUMENT_TYPES[mimeType as keyof typeof DOCUMENT_TYPES]?.label || 'Document';
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
          <p className="text-slate-300 mb-2">Drag and drop documents here, or click to select</p>
          <p className="text-sm text-slate-500">Supports PDF, DOC, DOCX (max 10MB)</p>
          <p className="text-xs text-slate-600 mt-2">Transcripts, resumes, recommendation letters, etc.</p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      )}

      {/* Upload Progress */}
      {uploading && (
        <div className="bg-slate-800/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-300">Uploading document...</span>
            <span className="text-sm text-slate-400">{Math.round(uploadProgress)}%</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Documents List */}
      {documents.length === 0 ? (
        <div className="text-center py-12 bg-slate-800/30 rounded-lg border border-slate-700/50">
          <File className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">No documents yet</p>
          {editMode && (
            <p className="text-sm text-slate-500 mt-2">Upload transcripts, resumes, or other documents</p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {documents.map((document) => {
            const Icon = getDocumentIcon(document.mime_type);
            return (
              <div
                key={document.id}
                className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4 hover:border-blue-500/50 transition-all"
              >
                <div className="flex items-start space-x-4">
                  {/* Icon */}
                  <div className="p-3 bg-blue-500/20 rounded-lg flex-shrink-0">
                    <Icon className="w-6 h-6 text-blue-400" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-medium truncate mb-1">
                      {document.title || 'Untitled Document'}
                    </h4>
                    <div className="flex items-center space-x-4 text-sm text-slate-400">
                      <span className="flex items-center space-x-1">
                        <FileCheck className="w-4 h-4" />
                        <span>{getDocumentLabel(document.mime_type)}</span>
                      </span>
                      <span>{formatFileSize(document.file_size)}</span>
                      <span>{new Date(document.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <button
                      onClick={() => downloadDocument(document.file_url, document.title || 'document')}
                      className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded transition-colors"
                      title="Download"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                    {editMode && (
                      <button
                        onClick={() => deleteDocument(document.id, document.file_url)}
                        className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!editMode && documents.length > 0 && (
        <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <p className="text-sm text-blue-400 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4" />
            <span>Documents are available for download by coaches and recruiters</span>
          </p>
        </div>
      )}
    </div>
  );
}
