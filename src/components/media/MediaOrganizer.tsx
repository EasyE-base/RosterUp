/**
 * Media Organizer
 * Drawer with Upload / Paste / Recent tabs
 * IndexedDB-backed media cache
 * Drag sources for canvas insertion
 */

import React, { useState, useEffect, useRef } from 'react';
import { openDB, type IDBPDatabase } from 'idb';

// IndexedDB configuration
const DB_NAME = 'canvas-media';
const DB_VERSION = 1;
const STORE_NAME = 'media-items';

interface MediaItem {
  id: string;
  src: string; // Data URL or external URL
  thumbnail?: string;
  type: 'image' | 'video';
  name: string;
  size: number;
  uploadedAt: number;
}

interface MediaOrganizerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMedia?: (item: MediaItem) => void;
}

export function MediaOrganizer({ isOpen, onClose, onSelectMedia }: MediaOrganizerProps) {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste' | 'recent'>('recent');
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [draggedItem, setDraggedItem] = useState<MediaItem | null>(null);

  /**
   * Get IndexedDB instance
   */
  const getDB = async (): Promise<IDBPDatabase> => {
    return openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('uploadedAt', 'uploadedAt');
        }
      },
    });
  };

  /**
   * Load media items from IndexedDB
   */
  const loadMediaItems = async () => {
    try {
      const db = await getDB();
      const items = await db.getAllFromIndex(STORE_NAME, 'uploadedAt');
      setMediaItems(items.reverse()); // Most recent first
    } catch (error) {
      console.error('Failed to load media:', error);
    }
  };

  /**
   * Save media item to IndexedDB
   */
  const saveMediaItem = async (item: MediaItem) => {
    try {
      const db = await getDB();
      await db.put(STORE_NAME, item);
      await loadMediaItems();
    } catch (error) {
      console.error('Failed to save media:', error);
    }
  };

  /**
   * Load media on mount and tab change
   */
  useEffect(() => {
    if (isOpen && activeTab === 'recent') {
      loadMediaItems();
    }
  }, [isOpen, activeTab]);

  /**
   * Handle file upload
   */
  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsLoading(true);

    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/')) {
          console.warn('Skipping non-image file:', file.name);
          continue;
        }

        // Read file as data URL
        const reader = new FileReader();
        reader.onload = async (e) => {
          const src = e.target?.result as string;

          const mediaItem: MediaItem = {
            id: `media-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            src,
            thumbnail: src, // For images, thumbnail is same as src
            type: 'image',
            name: file.name,
            size: file.size,
            uploadedAt: Date.now(),
          };

          await saveMediaItem(mediaItem);
          console.log('✅ Uploaded media:', mediaItem.name);
        };

        reader.readAsDataURL(file);
      }
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle paste from clipboard
   */
  const handlePaste = async () => {
    try {
      const clipboardItems = await navigator.clipboard.read();

      for (const item of clipboardItems) {
        for (const type of item.types) {
          if (type.startsWith('image/')) {
            const blob = await item.getType(type);
            const reader = new FileReader();

            reader.onload = async (e) => {
              const src = e.target?.result as string;

              const mediaItem: MediaItem = {
                id: `media-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                src,
                thumbnail: src,
                type: 'image',
                name: 'Pasted image',
                size: blob.size,
                uploadedAt: Date.now(),
              };

              await saveMediaItem(mediaItem);
              console.log('✅ Pasted media from clipboard');
            };

            reader.readAsDataURL(blob);
          }
        }
      }
    } catch (error) {
      console.error('Paste failed:', error);
      alert('Failed to paste from clipboard. Make sure you have an image copied.');
    }
  };

  /**
   * Handle drag start
   */
  const handleDragStart = (item: MediaItem, e: React.DragEvent) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('media-item', JSON.stringify(item));
    console.log('🎯 Started dragging:', item.name);
  };

  /**
   * Handle drag end
   */
  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  /**
   * Handle media item click
   */
  const handleMediaClick = (item: MediaItem) => {
    if (onSelectMedia) {
      onSelectMedia(item);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="media-organizer-backdrop"
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          zIndex: 9999,
        }}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className="media-organizer-drawer"
        style={{
          position: 'fixed',
          right: 0,
          top: 0,
          bottom: 0,
          width: 400,
          backgroundColor: 'white',
          boxShadow: '-4px 0 24px rgba(0,0,0,0.15)',
          zIndex: 10000,
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: 16,
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>
            Media Library
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: 24,
              cursor: 'pointer',
              color: '#6b7280',
            }}
          >
            ×
          </button>
        </div>

        {/* Tabs */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid #e5e7eb',
            padding: '0 16px',
          }}
        >
          {(['upload', 'paste', 'recent'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '12px 16px',
                background: 'none',
                border: 'none',
                borderBottom: activeTab === tab ? '2px solid #3b82f6' : '2px solid transparent',
                color: activeTab === tab ? '#3b82f6' : '#6b7280',
                fontWeight: activeTab === tab ? 600 : 400,
                cursor: 'pointer',
                fontSize: 14,
                textTransform: 'capitalize',
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div
          style={{
            flex: 1,
            padding: 16,
            overflowY: 'auto',
          }}
        >
          {activeTab === 'upload' && (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                style={{ display: 'none' }}
                onChange={(e) => handleFileUpload(e.target.files)}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '48px 24px',
                  backgroundColor: '#f9fafb',
                  border: '2px dashed #d1d5db',
                  borderRadius: 8,
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  fontSize: 14,
                  color: '#6b7280',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <span style={{ fontSize: 48 }}>📤</span>
                <span style={{ fontWeight: 500 }}>
                  {isLoading ? 'Uploading...' : 'Click to upload'}
                </span>
                <span style={{ fontSize: 12 }}>
                  or drag and drop
                </span>
              </button>
            </div>
          )}

          {activeTab === 'paste' && (
            <div>
              <button
                onClick={handlePaste}
                style={{
                  width: '100%',
                  padding: '48px 24px',
                  backgroundColor: '#f9fafb',
                  border: '2px dashed #d1d5db',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontSize: 14,
                  color: '#6b7280',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <span style={{ fontSize: 48 }}>📋</span>
                <span style={{ fontWeight: 500 }}>
                  Paste from clipboard
                </span>
                <span style={{ fontSize: 12 }}>
                  Cmd+V to paste image
                </span>
              </button>
            </div>
          )}

          {activeTab === 'recent' && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 12,
              }}
            >
              {mediaItems.length === 0 ? (
                <div
                  style={{
                    gridColumn: '1 / -1',
                    padding: 48,
                    textAlign: 'center',
                    color: '#9ca3af',
                    fontSize: 14,
                  }}
                >
                  No media yet. Upload or paste to get started.
                </div>
              ) : (
                mediaItems.map((item) => (
                  <div
                    key={item.id}
                    draggable
                    onDragStart={(e) => handleDragStart(item, e)}
                    onDragEnd={handleDragEnd}
                    onClick={() => handleMediaClick(item)}
                    style={{
                      position: 'relative',
                      aspectRatio: '1',
                      borderRadius: 8,
                      overflow: 'hidden',
                      cursor: 'grab',
                      border: draggedItem?.id === item.id ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                      transition: 'transform 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (draggedItem?.id !== item.id) {
                        e.currentTarget.style.transform = 'scale(1.05)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    <img
                      src={item.thumbnail || item.src}
                      alt={item.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                      draggable={false}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
                        padding: 8,
                        color: 'white',
                        fontSize: 11,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {item.name}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer hint */}
        <div
          style={{
            padding: 12,
            borderTop: '1px solid #e5e7eb',
            fontSize: 11,
            color: '#9ca3af',
            textAlign: 'center',
          }}
        >
          💡 Drag images onto the canvas to add them
        </div>
      </div>
    </>
  );
}
