import InlineEditor from '../InlineEditor';
import { useTheme } from '../../../../contexts/ThemeContext';
import { getHeadingClasses, getBodyClasses } from '../../../../lib/typography-presets';
import { Image as ImageIcon, Plus } from 'lucide-react';

interface GalleryImage {
  url?: string;
  caption?: string;
  alt?: string;
}

interface GallerySectionProps {
  content: {
    title?: string;
    description?: string;
    images?: GalleryImage[];
  };
  styles?: Record<string, any>;
  editMode: boolean;
  onUpdate: (content: Record<string, any>) => void;
}

export default function GallerySection({
  content,
  styles = {},
  editMode,
  onUpdate
}: GallerySectionProps) {
  const { theme, typography } = useTheme();

  // Defensive coding
  const images: GalleryImage[] = Array.isArray(content.images) ? content.images : [];
  const safeTitle = typeof content.title === 'string' ? content.title : 'Photo Gallery';
  const safeDescription = typeof content.description === 'string' ? content.description : 'View our team in action';

  const updateField = (field: string, value: any) => {
    onUpdate({ ...content, [field]: value });
  };

  return (
    <div
      className="py-16 px-4"
      style={{
        backgroundColor: styles.backgroundColor || theme.colors.background,
        ...styles
      }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <InlineEditor
            value={safeTitle}
            onChange={(value) => updateField('title', value)}
            enabled={editMode}
            className={getHeadingClasses(typography, 'h2', 'text-center mb-4')}
          />
          <InlineEditor
            value={safeDescription}
            onChange={(value) => updateField('description', value)}
            enabled={editMode}
            className={getBodyClasses(typography, 'large', 'text-center')}
            style={{ color: theme.colors.textSecondary }}
          />
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-16 border-2 border-dashed border-gray-300 rounded-lg">
              <ImageIcon className="w-16 h-16 text-gray-400 mb-4" />
              <p className="text-gray-500 text-lg mb-2">No images yet</p>
              <p className="text-gray-400 text-sm">Add images to your gallery</p>
              {editMode && (
                <button
                  onClick={() => updateField('images', [{ url: '', caption: 'New Image', alt: '' }])}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add First Image
                </button>
              )}
            </div>
          ) : (
            images.map((image, index) => (
              <div key={index} className="relative group overflow-hidden rounded-lg shadow-lg">
                {image.url ? (
                  <img
                    src={image.url}
                    alt={image.alt || image.caption || 'Gallery image'}
                    className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                {image.caption && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white p-4">
                    <p className="text-sm">{image.caption}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {editMode && images.length > 0 && (
          <div className="mt-8 text-center">
            <button
              onClick={() => updateField('images', [...images, { url: '', caption: 'New Image', alt: '' }])}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
            >
              <Plus className="w-5 h-5" />
              Add Image
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
