import { useState, useRef } from 'react';
import { Send, Loader2, X, Sparkles, Undo, Check, Layout, Upload, Image as ImageIcon } from 'lucide-react';

interface SelectedElement {
  selector: string;
  tagName: string;
  textContent: string;
  outerHTML: string;
  attributes: { [key: string]: string };
  position: { x: number; y: number; width: number; height: number };
}

interface AIEditPanelProps {
  selectedElement: SelectedElement | null;
  onClearSelection: () => void;
  onApplyEdit: (instruction: string, uploadedImageUrl?: string) => Promise<void>;
  isProcessing: boolean;
  componentType?: string | null;
  componentLabel?: string;
  onImageUpload?: (file: File) => Promise<string>; // Returns uploaded image URL
}

export default function AIEditPanel({
  selectedElement,
  onClearSelection,
  onApplyEdit,
  isProcessing,
  componentType,
  componentLabel,
  onImageUpload,
}: AIEditPanelProps) {
  const [instruction, setInstruction] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!instruction.trim() || isProcessing) return;

    // Expand short commands to full instructions
    let expandedInstruction = instruction.trim();
    const lowerInstruction = expandedInstruction.toLowerCase();

    // Handle short delete commands
    if (lowerInstruction === 'delete' || lowerInstruction === 'remove') {
      expandedInstruction = 'Delete this element';
    }
    // Handle short hide commands
    else if (lowerInstruction === 'hide') {
      expandedInstruction = 'Hide this element';
    }
    // Handle short show commands
    else if (lowerInstruction === 'show') {
      expandedInstruction = 'Show this element';
    }

    await onApplyEdit(expandedInstruction, uploadedImageUrl || undefined);
    setInstruction('');
    setUploadedImageUrl(null); // Clear uploaded image after use
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInstruction(suggestion);
    setShowSuggestions(false);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onImageUpload) return;

    // Validate file type
    if (!file.type.startsWith('image/') && !file.name.match(/\.(jpg|jpeg|png|gif|webp|svg|heic|heif)$/i)) {
      alert('Please select an image file (JPG, PNG, GIF, WebP, SVG, or HEIC)');
      return;
    }

    try {
      setIsUploading(true);
      const url = await onImageUpload(file);
      setUploadedImageUrl(url);

      // Auto-suggest replacement if image is selected
      if (selectedElement?.tagName === 'img') {
        setInstruction('Replace this image with the uploaded image');
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error('Image upload failed:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const suggestions = selectedElement
    ? [
        selectedElement.tagName === 'img'
          ? 'Replace this image with a new one'
          : selectedElement.tagName.match(/h[1-6]/)
          ? 'Change this heading text'
          : selectedElement.tagName === 'a' || selectedElement.tagName === 'button'
          ? 'Change the button text'
          : 'Change this text',
        'Delete',
        selectedElement.tagName === 'img'
          ? 'Make this image larger'
          : 'Change the color to blue',
        'Hide this on mobile',
      ]
    : [];

  if (!selectedElement) {
    return (
      <div className="fixed bottom-8 right-8 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-4 rounded-2xl shadow-2xl max-w-md animate-bounce">
        <div className="flex items-center space-x-3">
          <Sparkles className="w-6 h-6" />
          <div>
            <div className="font-semibold">Smart Edit Mode Active</div>
            <div className="text-sm text-purple-100">Click any element to start editing</div>
            <div className="text-xs text-purple-200 mt-1">Tip: Cmd/Ctrl+Click to select multiple</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-8 right-8 bg-white rounded-2xl shadow-2xl border border-slate-200 w-96 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-5 h-5" />
          <span className="font-semibold">AI Editor</span>
        </div>
        <button
          onClick={onClearSelection}
          className="p-1 hover:bg-white/20 rounded transition-colors"
          title="Clear selection"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Selected Element Info */}
      <div className="p-4 bg-slate-50 border-b border-slate-200">
        <div className="text-xs text-slate-500 uppercase font-semibold mb-2">Selected Element</div>
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <span className="text-purple-600 font-mono text-sm font-bold">
              {selectedElement.tagName.toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-slate-900 truncate">
              {selectedElement.tagName === 'img'
                ? selectedElement.attributes.alt || 'Image'
                : selectedElement.textContent.substring(0, 50) || 'Element'}
            </div>
            <div className="text-xs text-slate-500 font-mono truncate mt-1">
              {selectedElement.selector}
            </div>
            {componentType && componentLabel && (
              <div className="flex items-center space-x-1 mt-2">
                <Layout className="w-3 h-3 text-blue-500" />
                <span className="text-xs text-blue-600 font-medium">{componentLabel}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Suggestions */}
      {showSuggestions && (
        <div className="p-4 border-b border-slate-200">
          <div className="text-xs text-slate-500 uppercase font-semibold mb-2">Quick Actions</div>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="px-3 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* AI Instruction Input */}
      <form onSubmit={handleSubmit} className="p-4">
        <div className="text-xs text-slate-500 uppercase font-semibold mb-2">Tell AI what to do</div>

        {/* Image Upload Section */}
        {onImageUpload && (
          <div className="mb-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            {uploadedImageUrl ? (
              <div className="flex items-center space-x-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                <ImageIcon className="w-4 h-4 text-green-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-green-700">Image uploaded</div>
                  <div className="text-xs text-green-600 truncate">{uploadedImageUrl}</div>
                </div>
                <button
                  type="button"
                  onClick={() => setUploadedImageUrl(null)}
                  className="flex-shrink-0 p-1 hover:bg-green-100 rounded transition-colors"
                  title="Remove image"
                >
                  <X className="w-4 h-4 text-green-600" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 border-2 border-dashed border-slate-300 hover:border-purple-400 rounded-lg text-sm text-slate-600 hover:text-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>Upload Image</span>
                  </>
                )}
              </button>
            )}
          </div>
        )}

        <div className="flex items-end space-x-2">
          <div className="flex-1">
            <textarea
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              onFocus={() => setShowSuggestions(false)}
              placeholder="e.g., Change this text to 'Welcome to RosterUp'"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              rows={3}
              disabled={isProcessing}
            />
          </div>
          <button
            type="submit"
            disabled={!instruction.trim() || isProcessing}
            className="flex-shrink-0 p-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Processing State */}
        {isProcessing && (
          <div className="mt-3 flex items-center space-x-2 text-sm text-purple-600">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>AI is making your changes...</span>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-3 text-xs text-slate-500">
          <div className="font-medium mb-1">Examples:</div>
          <ul className="space-y-1 list-disc list-inside">
            <li>Change this to "Welcome to Our Team"</li>
            <li>Delete this image</li>
            <li>Replace with https://example.com/image.jpg</li>
            <li>Make this button say "Sign Up Now"</li>
          </ul>
        </div>
      </form>
    </div>
  );
}
