import { useState } from 'react';
import {
  Plus,
  Save,
  Eye,
  Trash2,
  MoveUp,
  MoveDown,
  Settings,
  Type,
  Image,
  Layout,
  Code,
  List,
  Square,
  Loader2,
} from 'lucide-react';
import { useWebsiteEditor } from '../../contexts/WebsiteEditorContext';
import { showToast } from '../../lib/toast';

interface PageEditorProps {
  onSave: () => void;
  onPreview: () => void;
  saving?: boolean;
}

const blockTypes = [
  { id: 'heading', label: 'Heading', icon: Type },
  { id: 'text', label: 'Text', icon: Type },
  { id: 'image', label: 'Image', icon: Image },
  { id: 'hero', label: 'Hero', icon: Layout },
  { id: 'cta', label: 'Call to Action', icon: Square },
  { id: 'list', label: 'List', icon: List },
  { id: 'code', label: 'Code', icon: Code },
];

export default function PageEditor({ onSave, onPreview, saving }: PageEditorProps) {
  const {
    blocks,
    selectedBlockId,
    selectBlock,
    addBlock,
    updateBlock,
    deleteBlock,
    moveBlock,
    duplicateBlock,
  } = useWebsiteEditor();

  const [showBlockPicker, setShowBlockPicker] = useState(false);

  const handleAddBlock = (type: string) => {
    addBlock(type);
    setShowBlockPicker(false);
    showToast.success('Block added');
  };

  const handleDeleteBlock = (blockId: string) => {
    deleteBlock(blockId);
    showToast.success('Block deleted');
  };

  const handleMoveBlock = (blockId: string, direction: 'up' | 'down') => {
    const currentIndex = blocks.findIndex(b => b.id === blockId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= blocks.length) return;

    moveBlock(blockId, newIndex);
  };

  const selectedBlock = blocks.find(b => b.id === selectedBlockId);

  return (
    <div className="flex h-full">
      {/* Left Sidebar - Block List */}
      <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col">
        <div className="p-4 border-b border-slate-800">
          <h2 className="text-sm font-semibold text-white mb-4">Page Blocks</h2>
          <button
            onClick={() => setShowBlockPicker(!showBlockPicker)}
            className="w-full px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Block
          </button>
        </div>

        {showBlockPicker && (
          <div className="p-4 border-b border-slate-800 bg-slate-800/50">
            <p className="text-xs text-slate-400 mb-2">Choose a block type:</p>
            <div className="grid gap-2">
              {blockTypes.map(type => (
                <button
                  key={type.id}
                  onClick={() => handleAddBlock(type.id)}
                  className="flex items-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded transition-colors text-sm"
                >
                  <type.icon className="w-4 h-4" />
                  {type.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            {blocks.map((block, index) => (
              <div
                key={block.id}
                onClick={() => selectBlock(block.id)}
                className={`p-3 rounded-lg cursor-pointer transition-all ${
                  selectedBlockId === block.id
                    ? 'bg-blue-500/20 border border-blue-500'
                    : 'bg-slate-800 hover:bg-slate-700 border border-transparent'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-white capitalize">
                    {block.block_type}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMoveBlock(block.id, 'up');
                      }}
                      disabled={index === 0}
                      className="p-1 text-slate-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <MoveUp className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMoveBlock(block.id, 'down');
                      }}
                      disabled={index === blocks.length - 1}
                      className="p-1 text-slate-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <MoveDown className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteBlock(block.id);
                      }}
                      className="p-1 text-slate-400 hover:text-red-500"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-slate-400 truncate">
                  {block.content?.text || block.content?.title || 'Empty block'}
                </p>
              </div>
            ))}
          </div>

          {blocks.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              <Square className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No blocks yet</p>
              <p className="text-xs mt-1">Click "Add Block" to get started</p>
            </div>
          )}
        </div>
      </div>

      {/* Center - Preview */}
      <div className="flex-1 bg-slate-950 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-8">
          <div className="bg-white rounded-lg shadow-xl min-h-[600px] p-8">
            {blocks.map(block => (
              <BlockPreview
                key={block.id}
                block={block}
                isSelected={selectedBlockId === block.id}
                onSelect={() => selectBlock(block.id)}
              />
            ))}

            {blocks.length === 0 && (
              <div className="flex items-center justify-center h-[400px] text-gray-400">
                <div className="text-center">
                  <Layout className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">Your page is empty</p>
                  <p className="text-sm mt-1">Add blocks to start building</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Sidebar - Block Settings */}
      {selectedBlock && (
        <div className="w-80 bg-slate-900 border-l border-slate-800 p-4">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-white mb-2">Block Settings</h3>
            <p className="text-xs text-slate-400">Type: {selectedBlock.block_type}</p>
          </div>

          <BlockSettings
            block={selectedBlock}
            onUpdate={(updates) => updateBlock(selectedBlock.id, updates)}
          />
        </div>
      )}

      {/* Floating Action Bar */}
      <div className="fixed bottom-8 right-8 flex items-center gap-3">
        <button
          onClick={onPreview}
          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors flex items-center gap-2"
        >
          <Eye className="w-4 h-4" />
          Preview
        </button>
        <button
          onClick={onSave}
          disabled={saving}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 text-white rounded-lg transition-colors flex items-center gap-2"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  );
}

// Block Preview Component
function BlockPreview({ block, isSelected, onSelect }: any) {
  const renderContent = () => {
    switch (block.block_type) {
      case 'heading':
        return (
          <h2 className="text-3xl font-bold text-gray-900">
            {block.content?.text || 'Heading'}
          </h2>
        );
      case 'text':
        return (
          <p className="text-gray-600">
            {block.content?.text || 'Enter your text here...'}
          </p>
        );
      case 'image':
        return (
          <div className="bg-gray-100 rounded-lg h-48 flex items-center justify-center">
            <Image className="w-12 h-12 text-gray-400" />
          </div>
        );
      case 'hero':
        return (
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-12 rounded-lg">
            <h1 className="text-4xl font-bold mb-4">
              {block.content?.title || 'Hero Title'}
            </h1>
            <p className="text-lg opacity-90">
              {block.content?.subtitle || 'Hero subtitle goes here'}
            </p>
          </div>
        );
      case 'cta':
        return (
          <div className="bg-gray-50 p-8 rounded-lg text-center">
            <h3 className="text-2xl font-bold mb-4">
              {block.content?.title || 'Call to Action'}
            </h3>
            <button className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
              {block.content?.buttonText || 'Click Here'}
            </button>
          </div>
        );
      case 'list':
        return (
          <ul className="list-disc list-inside space-y-2 text-gray-600">
            <li>List item 1</li>
            <li>List item 2</li>
            <li>List item 3</li>
          </ul>
        );
      case 'code':
        return (
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto">
            <code>{block.content?.code || '// Your code here'}</code>
          </pre>
        );
      default:
        return <div className="p-4 bg-gray-100 rounded">Unknown block type</div>;
    }
  };

  return (
    <div
      onClick={onSelect}
      className={`mb-4 p-4 rounded-lg cursor-pointer transition-all ${
        isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''
      }`}
    >
      {renderContent()}
    </div>
  );
}

// Block Settings Component
function BlockSettings({ block, onUpdate }: any) {
  const handleContentChange = (key: string, value: string) => {
    onUpdate({
      content: {
        ...block.content,
        [key]: value,
      },
    });
  };

  return (
    <div className="space-y-4">
      {block.block_type === 'heading' && (
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">
            Heading Text
          </label>
          <input
            type="text"
            value={block.content?.text || ''}
            onChange={(e) => handleContentChange('text', e.target.value)}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
          />
        </div>
      )}

      {block.block_type === 'text' && (
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">
            Text Content
          </label>
          <textarea
            value={block.content?.text || ''}
            onChange={(e) => handleContentChange('text', e.target.value)}
            rows={4}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
          />
        </div>
      )}

      {block.block_type === 'hero' && (
        <>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Title
            </label>
            <input
              type="text"
              value={block.content?.title || ''}
              onChange={(e) => handleContentChange('title', e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Subtitle
            </label>
            <input
              type="text"
              value={block.content?.subtitle || ''}
              onChange={(e) => handleContentChange('subtitle', e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
            />
          </div>
        </>
      )}

      {block.block_type === 'cta' && (
        <>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Title
            </label>
            <input
              type="text"
              value={block.content?.title || ''}
              onChange={(e) => handleContentChange('title', e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Button Text
            </label>
            <input
              type="text"
              value={block.content?.buttonText || ''}
              onChange={(e) => handleContentChange('buttonText', e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
            />
          </div>
        </>
      )}

      {block.block_type === 'code' && (
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">
            Code
          </label>
          <textarea
            value={block.content?.code || ''}
            onChange={(e) => handleContentChange('code', e.target.value)}
            rows={6}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono text-sm"
          />
        </div>
      )}

      <div className="pt-4 border-t border-slate-700">
        <label className="flex items-center text-sm text-slate-300">
          <input
            type="checkbox"
            checked={block.visibility?.desktop !== false}
            onChange={(e) =>
              onUpdate({
                visibility: {
                  ...block.visibility,
                  desktop: e.target.checked,
                },
              })
            }
            className="mr-2"
          />
          Show on Desktop
        </label>
        <label className="flex items-center text-sm text-slate-300 mt-2">
          <input
            type="checkbox"
            checked={block.visibility?.mobile !== false}
            onChange={(e) =>
              onUpdate({
                visibility: {
                  ...block.visibility,
                  mobile: e.target.checked,
                },
              })
            }
            className="mr-2"
          />
          Show on Mobile
        </label>
      </div>
    </div>
  );
}