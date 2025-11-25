import { useState } from 'react';
import {
  Plus,
  Save,
  Eye,
  Trash2,
  Settings,
  Type,
  Image,
  Layout,
  Code,
  List,
  Square,
  Loader2,
  Video,
  Music,
  Share2,
  Mail,
  Star,
  Calendar,
  Trophy,
  Users,
  FileText,
  Grid,
  Columns,
  Box,
  Sparkles,
  Menu,
  ChevronDown,
  Layers as LayersIcon,
  ChevronRight,
  Copy,
  Palette,
  Maximize2,
  Sliders,
  Wand2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Globe,
} from 'lucide-react';
import { useWebsiteEditor } from '../../contexts/WebsiteEditorContext';
import { showToast } from '../../lib/toast';
import CloneViewer from './CloneViewer';

interface PageEditorProps {
  onSave: () => void;
  onPreview: () => void;
  saving?: boolean;
  viewMode?: 'desktop' | 'tablet' | 'mobile';
}

// Organized element library with categories (Wix-style)
const elementCategories = [
  {
    category: 'Text',
    icon: Type,
    elements: [
      { id: 'heading', label: 'Heading', icon: Type },
      { id: 'paragraph', label: 'Paragraph', icon: Type },
      { id: 'text', label: 'Rich Text', icon: Type },
      { id: 'quote', label: 'Quote', icon: Type },
    ],
  },
  {
    category: 'Media',
    icon: Image,
    elements: [
      { id: 'image', label: 'Image', icon: Image },
      { id: 'gallery', label: 'Gallery', icon: Grid },
      { id: 'video', label: 'Video', icon: Video },
      { id: 'music', label: 'Audio Player', icon: Music },
    ],
  },
  {
    category: 'Interactive',
    icon: Square,
    elements: [
      { id: 'button', label: 'Button', icon: Square },
      { id: 'cta', label: 'Call to Action', icon: Sparkles },
      { id: 'hero', label: 'Hero Section', icon: Layout },
    ],
  },
  {
    category: 'Layout',
    icon: Layout,
    elements: [
      { id: 'container', label: 'Container', icon: Box },
      { id: 'columns', label: 'Columns', icon: Columns },
      { id: 'divider', label: 'Divider', icon: Layout },
      { id: 'spacer', label: 'Spacer', icon: Layout },
    ],
  },
  {
    category: 'Lists',
    icon: List,
    elements: [
      { id: 'list', label: 'Bullet List', icon: List },
      { id: 'numbered-list', label: 'Numbered List', icon: List },
      { id: 'checklist', label: 'Checklist', icon: List },
    ],
  },
  {
    category: 'Forms & Contact',
    icon: Mail,
    elements: [
      { id: 'contact-form', label: 'Contact Form', icon: Mail },
      { id: 'subscribe', label: 'Subscribe Form', icon: Mail },
      { id: 'input', label: 'Text Input', icon: Type },
      { id: 'textarea', label: 'Text Area', icon: Type },
    ],
  },
  {
    category: 'Social',
    icon: Share2,
    elements: [
      { id: 'social-share', label: 'Share Buttons', icon: Share2 },
      { id: 'social-feed', label: 'Social Feed', icon: Share2 },
      { id: 'social-follow', label: 'Follow Buttons', icon: Share2 },
    ],
  },
  {
    category: 'Navigation',
    icon: Menu,
    elements: [
      { id: 'navbar', label: 'Navigation Bar', icon: Menu },
      { id: 'menu', label: 'Menu', icon: Menu },
      { id: 'breadcrumbs', label: 'Breadcrumbs', icon: Menu },
    ],
  },
  {
    category: 'Sports (RosterUp)',
    icon: Trophy,
    elements: [
      { id: 'team-roster', label: 'Team Roster', icon: Users },
      { id: 'schedule', label: 'Schedule', icon: Calendar },
      { id: 'tournament-bracket', label: 'Tournament Bracket', icon: Trophy },
      { id: 'player-stats', label: 'Player Stats', icon: Star },
      { id: 'scoreboard', label: 'Scoreboard', icon: Trophy },
    ],
  },
  {
    category: 'Developer',
    icon: Code,
    elements: [
      { id: 'code', label: 'Code Block', icon: Code },
      { id: 'embed', label: 'Embed Code', icon: Code },
      { id: 'custom-html', label: 'Custom HTML', icon: FileText },
    ],
  },
];

// Flatten for backward compatibility
const blockTypes = elementCategories.flatMap(cat => cat.elements);

export default function PageEditor({
  onSave,
  onPreview,
  saving,
  viewMode: viewModeProp,
}: PageEditorProps) {
  const {
    blocks,
    sections,
    selectedBlockId,
    selectedSectionId,
    selectBlock,
    selectSection,
    addBlock,
    updateBlock,
    deleteBlock,
    moveBlock,
    duplicateBlock,
    addSection,
    updateSection,
    deleteSection,
  } = useWebsiteEditor();

  const [showBlockPicker, setShowBlockPicker] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['Text', 'Media', 'Interactive']);
  const [leftPanelTab, setLeftPanelTab] = useState<'elements' | 'layers'>('layers');
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  // Use props if provided, otherwise use default state
  const viewMode = viewModeProp ?? 'desktop';

  // Device widths for responsive preview
  const deviceWidths = {
    desktop: '100%',
    tablet: '768px',
    mobile: '375px',
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const toggleSectionExpand = (sectionId: string) => {
    setExpandedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const handleAddBlock = (type: string) => {
    // If no section exists, create a default one first
    if (sections.length === 0) {
      addSection('content');
      // Wait for the section to be created, then add the block
      setTimeout(() => {
        addBlock(type, sections[0]?.id);
      }, 100);
    } else {
      // Add to the active section or the first section
      const targetSectionId = activeSection || sections[0]?.id;
      addBlock(type, targetSectionId);
    }
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
      {/* Left Sidebar - Tabs for Elements & Layers */}
      <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col">
        {/* Tab Headers */}
        <div className="flex border-b border-slate-800">
          <button
            onClick={() => setLeftPanelTab('elements')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${leftPanelTab === 'elements'
              ? 'bg-slate-800 text-white border-b-2 border-blue-500'
              : 'text-slate-400 hover:text-white'
              }`}
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
          <button
            onClick={() => setLeftPanelTab('layers')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${leftPanelTab === 'layers'
              ? 'bg-slate-800 text-white border-b-2 border-blue-500'
              : 'text-slate-400 hover:text-white'
              }`}
          >
            <LayersIcon className="w-4 h-4" />
            Layers
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto">
          {leftPanelTab === 'elements' ? (
            /* Elements Panel */
            <div className="p-3">
              <p className="text-xs text-slate-400 mb-3 font-medium">Add Elements</p>
              <div className="space-y-1">
                {elementCategories.map(category => {
                  const isExpanded = expandedCategories.includes(category.category);
                  const CategoryIcon = category.icon;

                  return (
                    <div key={category.category}>
                      <button
                        onClick={() => toggleCategory(category.category)}
                        className="w-full flex items-center justify-between px-3 py-2 text-white hover:bg-slate-700/50 rounded transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <CategoryIcon className="w-4 h-4 text-slate-400" />
                          <span className="text-sm font-medium">{category.category}</span>
                          <span className="text-xs text-slate-500">({category.elements.length})</span>
                        </div>
                        <ChevronDown
                          className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''
                            }`}
                        />
                      </button>

                      {isExpanded && (
                        <div className="ml-6 mt-1 space-y-1">
                          {category.elements.map(element => {
                            const ElementIcon = element.icon;
                            return (
                              <button
                                key={element.id}
                                onClick={() => handleAddBlock(element.id)}
                                className="w-full flex items-center gap-2 px-3 py-2 bg-slate-800/50 hover:bg-slate-700 text-white rounded transition-colors text-sm group"
                              >
                                <ElementIcon className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-400" />
                                <span className="text-xs">{element.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Layers Panel */
            <div className="p-3">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs text-slate-400 font-medium">Page Structure</p>
                <button
                  onClick={() => addSection('content')}
                  className="p-1 text-slate-400 hover:text-white transition-colors"
                  title="Add Section"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {sections.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <LayersIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">No sections yet</p>
                  <p className="text-xs mt-1">Add a section to get started</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {sections.map((section) => {
                    const sectionBlocks = blocks.filter((b) => b.section_id === section.id);
                    const isExpanded = expandedSections.includes(section.id);
                    const isSelected = selectedSectionId === section.id;

                    return (
                      <div key={section.id}>
                        {/* Section Row */}
                        <div
                          className={`flex items-center gap-1 px-2 py-1.5 rounded cursor-pointer transition-colors ${isSelected
                            ? 'bg-blue-500/20 border border-blue-500'
                            : 'hover:bg-slate-800'
                            }`}
                          onClick={() => selectSection(section.id)}
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSectionExpand(section.id);
                            }}
                            className="p-0.5 text-slate-400 hover:text-white"
                          >
                            <ChevronRight
                              className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-90' : ''
                                }`}
                            />
                          </button>
                          <Layout className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-xs text-white flex-1 truncate">
                            {section.name}
                          </span>
                          <span className="text-xs text-slate-500">
                            ({sectionBlocks.length})
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm(`Delete section "${section.name}"?`)) {
                                deleteSection(section.id);
                              }
                            }}
                            className="p-0.5 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Nested Blocks */}
                        {isExpanded && sectionBlocks.length > 0 && (
                          <div className="ml-6 mt-1 space-y-1">
                            {sectionBlocks.map((block) => {
                              const isBlockSelected = selectedBlockId === block.id;
                              return (
                                <div
                                  key={block.id}
                                  className={`flex items-center gap-1 px-2 py-1.5 rounded cursor-pointer transition-colors group ${isBlockSelected
                                    ? 'bg-blue-500/20 border border-blue-500'
                                    : 'hover:bg-slate-800'
                                    }`}
                                  onClick={() => selectBlock(block.id)}
                                >
                                  <Square className="w-3 h-3 text-slate-400" />
                                  <span className="text-xs text-white flex-1 truncate capitalize">
                                    {block.block_type}
                                  </span>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      duplicateBlock(block.id);
                                    }}
                                    className="p-0.5 text-slate-400 hover:text-white opacity-0 group-hover:opacity-100"
                                    title="Duplicate"
                                  >
                                    <Copy className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteBlock(block.id);
                                    }}
                                    className="p-0.5 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Center - Canvas with Tools */}
      <div className="flex-1 bg-slate-950 overflow-y-auto relative">



        {/* Canvas Content */}
        <div
          className={`mx-auto transition-all duration-300 ${viewMode !== 'desktop' ? 'shadow-2xl border-4 border-slate-700' : ''
            }`}
          style={{
            maxWidth: deviceWidths[viewMode],
            width: viewMode === 'desktop' ? '100%' : deviceWidths[viewMode],
          }}
        >
          {/* Device Info Badge */}
          {viewMode !== 'desktop' && (
            <div className="bg-slate-800 text-white px-4 py-2 text-center text-sm border-b border-slate-700">
              <span className="font-medium">{viewMode.charAt(0).toUpperCase() + viewMode.slice(1)} Preview</span>
              <span className="ml-2 text-slate-400">({deviceWidths[viewMode]})</span>
            </div>
          )}

          {sections.length === 0 ? (
            <div className="flex items-center justify-center h-screen text-gray-400">
              <div className="text-center">
                <Layout className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium text-white">Your page has no sections</p>
                <p className="text-sm mt-1 text-slate-400">Add a section to start building</p>
                <button
                  onClick={() => addSection('content')}
                  className="mt-4 px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4 inline mr-2" />
                  Add Section
                </button>
              </div>
            </div>
          ) : (
            sections.map((section) => {
              const sectionBlocks = blocks.filter((b) => b.section_id === section.id);
              const isSelectedSection = selectedSectionId === section.id;

              // Check if this is a cloned section
              const isCloneMode = section.styles?.cloneMode === true;

              // If clone mode, render CloneViewer
              if (isCloneMode) {
                const html = section.styles?.html || '';
                const css = section.styles?.css || '';
                const js = section.styles?.js || '';

                return (
                  <div
                    key={section.id}
                    className="relative w-full h-screen border-b-2 border-slate-800"
                  >
                    {/* Clone Mode Badge */}
                    <div className="absolute top-4 left-4 z-10 bg-green-500 text-white px-3 py-1 rounded-lg text-sm font-medium flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      Cloned Website (Read-Only)
                    </div>

                    <CloneViewer html={html} css={css} js={js} />
                  </div>
                );
              }

              // Normal block-based section
              return (
                <div
                  key={section.id}
                  className={`relative border-b-2 border-slate-800 transition-all ${isSelectedSection ? 'ring-2 ring-blue-500' : ''
                    }`}
                  style={{
                    backgroundColor: section.background_color || 'white',
                    backgroundImage: section.background_image ? `url(${section.background_image})` : undefined,
                    backgroundSize: section.background_size || 'cover',
                    backgroundPosition: section.background_position || 'center',
                    paddingTop: section.padding_top || '3rem',
                    paddingBottom: section.padding_bottom || '3rem',
                  }}
                  onClick={(e) => {
                    if (e.target === e.currentTarget) {
                      selectSection(section.id);
                    }
                  }}
                >
                  {/* Section Controls Overlay */}
                  <div className="absolute top-2 right-2 flex items-center gap-2 opacity-0 hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => selectSection(section.id)}
                      className="p-2 bg-slate-800/90 text-white rounded hover:bg-slate-700 text-xs"
                      title="Section Settings"
                    >
                      <Settings className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete section "${section.name}"?`)) {
                          deleteSection(section.id);
                        }
                      }}
                      className="p-2 bg-red-600/90 text-white rounded hover:bg-red-500 text-xs"
                      title="Delete Section"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Section Content Container */}
                  <div
                    className="mx-auto"
                    style={{
                      maxWidth: section.full_width ? '100%' : section.max_width || '1200px',
                      paddingLeft: section.padding_left || '1rem',
                      paddingRight: section.padding_right || '1rem',
                    }}
                  >
                    {/* Section Name Badge */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-medium text-slate-500 bg-white/80 px-2 py-1 rounded">
                        {section.name}
                      </span>
                      <button
                        onClick={() => {
                          setActiveSection(section.id);
                          setShowBlockPicker(true);
                        }}
                        className="text-xs px-3 py-1 bg-blue-500/90 hover:bg-blue-600 text-white rounded transition-colors flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        Add Element
                      </button>
                    </div>

                    {/* Blocks in Section */}
                    {sectionBlocks.length > 0 ? (
                      sectionBlocks.map((block) => (
                        <BlockPreview
                          key={block.id}
                          block={block}
                          isSelected={selectedBlockId === block.id}
                          onSelect={() => selectBlock(block.id)}
                        />
                      ))
                    ) : (
                      <div className="text-center py-12 text-gray-400 bg-white/5 rounded-lg border-2 border-dashed border-gray-400">
                        <Square className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No elements in this section</p>
                        <p className="text-xs mt-1">Click "Add Element" to add content</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Add Section Button (Floating) */}
        {sections.length > 0 && (
          <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2">
            <button
              onClick={() => addSection('content')}
              className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-full shadow-xl transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Section
            </button>
          </div>
        )}
      </div>

      {/* Right Sidebar - Settings */}
      {(selectedBlock || selectedSectionId) && (
        <div className="w-80 bg-slate-900 border-l border-slate-800 p-4">
          {selectedBlock ? (
            <>
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-white mb-2">Block Settings</h3>
                <p className="text-xs text-slate-400">Type: {selectedBlock.block_type}</p>
              </div>
              <BlockSettings
                block={selectedBlock}
                onUpdate={(updates) => updateBlock(selectedBlock.id, updates)}
              />
            </>
          ) : selectedSectionId ? (
            <>
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-white mb-2">Section Settings</h3>
              </div>
              <SectionSettings
                section={sections.find(s => s.id === selectedSectionId)!}
                onUpdate={(updates) => updateSection(selectedSectionId, updates)}
              />
            </>
          ) : null}
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
      // Text Elements
      case 'heading':
        // 🚀 Smart Import™ - Use preserved HTML if available
        if (block.styles?.preserveOriginalHtml && block.styles?.originalElement) {
          return <div dangerouslySetInnerHTML={{ __html: block.styles.originalElement }} />;
        }
        return <h2 className="text-3xl font-bold text-gray-900">{block.content?.text || 'Heading'}</h2>;

      case 'paragraph':
        // 🚀 Smart Import™ - Use preserved HTML if available
        if (block.styles?.preserveOriginalHtml && block.styles?.originalElement) {
          return <div dangerouslySetInnerHTML={{ __html: block.styles.originalElement }} />;
        }
        return <p className="text-gray-700 leading-relaxed">{block.content?.text || 'Paragraph text goes here...'}</p>;

      case 'text':
        return <p className="text-gray-600">{block.content?.text || 'Enter your text here...'}</p>;
      case 'quote':
        return (
          <blockquote className="border-l-4 border-blue-500 pl-4 py-2 italic text-gray-700">
            {block.content?.text || 'Quote text goes here...'}
          </blockquote>
        );

      // Media Elements
      case 'image':
        // 🚀 Smart Import™ - Use preserved HTML if available
        if (block.styles?.preserveOriginalHtml && block.styles?.originalElement) {
          return <div dangerouslySetInnerHTML={{ __html: block.styles.originalElement }} />;
        }
        return block.content?.url ? (
          <img
            src={block.content.url}
            alt={block.content.alt || 'Image'}
            className="w-full h-auto rounded-lg"
            onError={(e) => {
              // Fallback to placeholder if image fails to load
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling?.classList.remove('hidden');
            }}
          />
        ) : (
          <div className="bg-gray-100 rounded-lg h-48 flex items-center justify-center">
            <Image className="w-12 h-12 text-gray-400" />
            <span className="ml-2 text-sm text-gray-500">No image URL</span>
          </div>
        );
      case 'gallery':
        return (
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-gray-100 rounded-lg h-32 flex items-center justify-center">
                <Image className="w-8 h-8 text-gray-400" />
              </div>
            ))}
          </div>
        );
      case 'video':
        return (
          <div className="bg-gray-900 rounded-lg h-64 flex items-center justify-center">
            <Video className="w-16 h-16 text-white" />
          </div>
        );
      case 'music':
        return (
          <div className="bg-gray-100 rounded-lg p-4 flex items-center gap-3">
            <Music className="w-10 h-10 text-blue-500" />
            <div className="flex-1">
              <div className="h-2 bg-blue-500 rounded-full w-3/4"></div>
              <p className="text-xs text-gray-500 mt-2">Audio Player</p>
            </div>
          </div>
        );

      // Interactive Elements
      case 'button':
        // 🚀 Smart Import™ - Use preserved HTML if available
        if (block.styles?.preserveOriginalHtml && block.styles?.originalElement) {
          return <div dangerouslySetInnerHTML={{ __html: block.styles.originalElement }} />;
        }
        return (
          <button className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
            {block.content?.text || 'Button'}
          </button>
        );
      case 'cta':
        return (
          <div className="bg-gray-50 p-8 rounded-lg text-center">
            <h3 className="text-2xl font-bold mb-4">{block.content?.title || 'Call to Action'}</h3>
            <button className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
              {block.content?.buttonText || 'Click Here'}
            </button>
          </div>
        );
      case 'hero':
        return (
          <div
            className="text-white p-12 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600"
            style={block.content?.backgroundImage ? {
              backgroundImage: `url(${block.content.backgroundImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundBlendMode: 'overlay'
            } : {}}
          >
            <h1 className="text-4xl font-bold mb-4">{block.content?.title || 'Hero Title'}</h1>
            <p className="text-lg opacity-90">{block.content?.subtitle || 'Hero subtitle goes here'}</p>
          </div>
        );

      // Layout Elements
      case 'container':
        return (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <Box className="w-8 h-8 mx-auto text-gray-400 mb-2" />
            <p className="text-sm text-gray-500">Container</p>
          </div>
        );
      case 'columns':
        return (
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-100 rounded-lg p-6 text-center">Column 1</div>
            <div className="bg-gray-100 rounded-lg p-6 text-center">Column 2</div>
          </div>
        );
      case 'divider':
        return <hr className="border-t-2 border-gray-300 my-4" />;
      case 'spacer':
        return <div className="h-12 bg-gray-50 rounded flex items-center justify-center text-xs text-gray-400">Spacer</div>;

      // List Elements
      case 'list':
        return (
          <ul className="list-disc list-inside space-y-2 text-gray-600">
            {(block.content?.items || ['Item 1', 'Item 2', 'Item 3']).map((item: string, i: number) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        );
      case 'numbered-list':
        return (
          <ol className="list-decimal list-inside space-y-2 text-gray-600">
            <li>First item</li>
            <li>Second item</li>
            <li>Third item</li>
          </ol>
        );
      case 'checklist':
        return (
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <label key={i} className="flex items-center gap-2 text-gray-700">
                <input type="checkbox" className="w-4 h-4" />
                <span>Checklist item {i}</span>
              </label>
            ))}
          </div>
        );

      // Forms & Contact
      case 'contact-form':
        return (
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <div className="space-y-3">
              <input type="text" placeholder="Name" className="w-full px-3 py-2 border rounded" />
              <input type="email" placeholder="Email" className="w-full px-3 py-2 border rounded" />
              <textarea placeholder="Message" rows={3} className="w-full px-3 py-2 border rounded"></textarea>
              <button className="px-6 py-2 bg-blue-500 text-white rounded">Send</button>
            </div>
          </div>
        );
      case 'subscribe':
        return (
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Subscribe to Newsletter</h3>
            <div className="flex gap-2">
              <input type="email" placeholder="Enter your email" className="flex-1 px-3 py-2 border rounded" />
              <button className="px-6 py-2 bg-blue-500 text-white rounded">Subscribe</button>
            </div>
          </div>
        );
      case 'input':
        return <input type="text" placeholder="Text input" className="w-full px-3 py-2 border rounded" />;
      case 'textarea':
        return <textarea placeholder="Text area" rows={4} className="w-full px-3 py-2 border rounded"></textarea>;

      // Social Elements
      case 'social-share':
        return (
          <div className="flex gap-2">
            {['Facebook', 'Twitter', 'LinkedIn'].map(platform => (
              <button key={platform} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
                <Share2 className="w-4 h-4" />
              </button>
            ))}
          </div>
        );
      case 'social-feed':
        return (
          <div className="bg-gray-50 p-4 rounded-lg">
            <Share2 className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <p className="text-center text-sm text-gray-500">Social Media Feed</p>
          </div>
        );
      case 'social-follow':
        return (
          <div className="flex gap-3">
            {['FB', 'TW', 'IG'].map(platform => (
              <button key={platform} className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center">
                {platform}
              </button>
            ))}
          </div>
        );

      // Navigation Elements
      case 'navbar':
        return (
          <nav className="bg-gray-900 text-white p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="font-bold">Logo</span>
              <div className="flex gap-4">
                <a href="#" className="hover:text-blue-400">Home</a>
                <a href="#" className="hover:text-blue-400">About</a>
                <a href="#" className="hover:text-blue-400">Contact</a>
              </div>
            </div>
          </nav>
        );
      case 'menu':
        return (
          <div className="bg-gray-50 p-4 rounded-lg">
            <Menu className="w-6 h-6 text-gray-700" />
          </div>
        );
      case 'breadcrumbs':
        return (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Home</span>
            <span>/</span>
            <span>Category</span>
            <span>/</span>
            <span className="text-blue-500">Current Page</span>
          </div>
        );

      // Sports (RosterUp) Elements
      case 'team-roster':
        return (
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Team Roster
            </h3>
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white p-3 rounded text-center">
                  <div className="w-12 h-12 bg-gray-300 rounded-full mx-auto mb-2"></div>
                  <p className="text-sm font-medium">Player {i}</p>
                </div>
              ))}
            </div>
          </div>
        );
      case 'schedule':
        return (
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Schedule
            </h3>
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white p-3 rounded flex justify-between">
                  <span className="text-sm">Game {i}</span>
                  <span className="text-sm text-gray-500">Date TBD</span>
                </div>
              ))}
            </div>
          </div>
        );
      case 'tournament-bracket':
        return (
          <div className="bg-gray-50 p-6 rounded-lg">
            <Trophy className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
            <p className="text-center text-sm text-gray-600">Tournament Bracket</p>
          </div>
        );
      case 'player-stats':
        return (
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Star className="w-5 h-5" />
              Player Statistics
            </h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold">12</p>
                <p className="text-xs text-gray-500">Goals</p>
              </div>
              <div>
                <p className="text-2xl font-bold">8</p>
                <p className="text-xs text-gray-500">Assists</p>
              </div>
              <div>
                <p className="text-2xl font-bold">20</p>
                <p className="text-xs text-gray-500">Games</p>
              </div>
            </div>
          </div>
        );
      case 'scoreboard':
        return (
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-lg">
            <div className="flex justify-between items-center">
              <div className="text-center flex-1">
                <p className="text-sm mb-1">Home Team</p>
                <p className="text-4xl font-bold">3</p>
              </div>
              <div className="text-2xl font-bold">VS</div>
              <div className="text-center flex-1">
                <p className="text-sm mb-1">Away Team</p>
                <p className="text-4xl font-bold">2</p>
              </div>
            </div>
          </div>
        );

      // Developer Elements
      case 'code':
        return (
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto">
            <code>{block.content?.code || '// Your code here'}</code>
          </pre>
        );
      case 'embed':
        return (
          <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <Code className="w-12 h-12 mx-auto text-gray-400 mb-2" />
            <p className="text-sm text-gray-600">Embedded Content</p>
          </div>
        );
      case 'custom-html':
        return (
          <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4 text-center">
            <FileText className="w-8 h-8 mx-auto text-yellow-600 mb-2" />
            <p className="text-sm text-yellow-800">Custom HTML Block</p>
          </div>
        );

      // 🚀 Smart Import™ - Preserved HTML with original styling
      case 'html':
        if (block.styles?.preserveOriginalHtml && block.styles?.originalElement) {
          // Render original HTML element with preserved classes
          return (
            <div
              className={block.styles.className || ''}
              dangerouslySetInnerHTML={{ __html: block.styles.originalElement }}
            />
          );
        } else if (block.styles?.fullSectionHtml && block.content?.html) {
          // Render full section HTML (fallback for unparseable sections)
          return (
            <div
              className={block.styles.className || ''}
              dangerouslySetInnerHTML={{ __html: block.content.html }}
            />
          );
        }
        // Fallback to editable HTML
        return (
          <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
            <div dangerouslySetInnerHTML={{ __html: block.content?.html || '<p>HTML content</p>' }} />
          </div>
        );

      default:
        return <div className="p-4 bg-gray-100 rounded">Unknown block type: {block.block_type}</div>;
    }
  };

  // Apply block styles dynamically
  const blockStyles = {
    ...block.styles,
    // Remove custom properties that shouldn't be applied directly
    customCSS: undefined,
    elementId: undefined,
    className: undefined,
  };

  return (
    <div
      onClick={onSelect}
      className={`mb-4 p-4 rounded-lg cursor-pointer transition-all ${isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''
        } ${block.styles?.className || ''}`}
      id={block.styles?.elementId}
      style={blockStyles}
    >
      {renderContent()}
    </div>
  );
}

// Block Settings Component with Tabs
function BlockSettings({ block, onUpdate }: any) {
  const [activeTab, setActiveTab] = useState<'content' | 'design' | 'layout' | 'advanced'>('content');

  const handleContentChange = (key: string, value: string) => {
    onUpdate({
      content: {
        ...block.content,
        [key]: value,
      },
    });
  };

  const handleStyleChange = (key: string, value: any) => {
    onUpdate({
      styles: {
        ...block.styles,
        [key]: value,
      },
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Tabs Header */}
      <div className="flex border-b border-slate-800 mb-4">
        <button
          onClick={() => setActiveTab('content')}
          className={`flex-1 px-3 py-2 text-xs font-medium transition-colors flex items-center justify-center gap-1 ${activeTab === 'content'
            ? 'bg-slate-800 text-white border-b-2 border-blue-500'
            : 'text-slate-400 hover:text-white'
            }`}
        >
          <Type className="w-3 h-3" />
          Content
        </button>
        <button
          onClick={() => setActiveTab('design')}
          className={`flex-1 px-3 py-2 text-xs font-medium transition-colors flex items-center justify-center gap-1 ${activeTab === 'design'
            ? 'bg-slate-800 text-white border-b-2 border-blue-500'
            : 'text-slate-400 hover:text-white'
            }`}
        >
          <Palette className="w-3 h-3" />
          Design
        </button>
        <button
          onClick={() => setActiveTab('layout')}
          className={`flex-1 px-3 py-2 text-xs font-medium transition-colors flex items-center justify-center gap-1 ${activeTab === 'layout'
            ? 'bg-slate-800 text-white border-b-2 border-blue-500'
            : 'text-slate-400 hover:text-white'
            }`}
        >
          <Maximize2 className="w-3 h-3" />
          Layout
        </button>
        <button
          onClick={() => setActiveTab('advanced')}
          className={`flex-1 px-3 py-2 text-xs font-medium transition-colors flex items-center justify-center gap-1 ${activeTab === 'advanced'
            ? 'bg-slate-800 text-white border-b-2 border-blue-500'
            : 'text-slate-400 hover:text-white'
            }`}
        >
          <Sliders className="w-3 h-3" />
          Advanced
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto space-y-4">
        {activeTab === 'content' && (
          <ContentTab block={block} onContentChange={handleContentChange} onUpdate={onUpdate} />
        )}
        {activeTab === 'design' && (
          <DesignTab block={block} onStyleChange={handleStyleChange} />
        )}
        {activeTab === 'layout' && (
          <LayoutTab block={block} onStyleChange={handleStyleChange} />
        )}
        {activeTab === 'advanced' && (
          <AdvancedTab block={block} onUpdate={onUpdate} />
        )}
      </div>
    </div>
  );
}

// Content Tab Component
function ContentTab({ block, onContentChange, onUpdate }: any) {
  return (
    <div className="space-y-4">
      {block.block_type === 'heading' && (
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-2">
            Heading Text
          </label>
          <input
            type="text"
            value={block.content?.text || ''}
            onChange={(e) => onContentChange('text', e.target.value)}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white text-sm"
          />
        </div>
      )}

      {block.block_type === 'paragraph' && (
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-2">
            Paragraph Text
          </label>
          <textarea
            value={block.content?.text || ''}
            onChange={(e) => onContentChange('text', e.target.value)}
            rows={4}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white text-sm"
          />
        </div>
      )}

      {block.block_type === 'text' && (
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-2">
            Text Content
          </label>
          <textarea
            value={block.content?.text || ''}
            onChange={(e) => onContentChange('text', e.target.value)}
            rows={6}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white text-sm"
          />
        </div>
      )}

      {block.block_type === 'button' && (
        <>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">
              Button Text
            </label>
            <input
              type="text"
              value={block.content?.text || ''}
              onChange={(e) => onContentChange('text', e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">
              Link URL
            </label>
            <input
              type="text"
              value={block.content?.url || ''}
              onChange={(e) => onContentChange('url', e.target.value)}
              placeholder="https://example.com"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white text-sm"
            />
          </div>
        </>
      )}

      {block.block_type === 'hero' && (
        <>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">
              Title
            </label>
            <input
              type="text"
              value={block.content?.title || ''}
              onChange={(e) => onContentChange('title', e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">
              Subtitle
            </label>
            <input
              type="text"
              value={block.content?.subtitle || ''}
              onChange={(e) => onContentChange('subtitle', e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">
              Background Image URL
            </label>
            <input
              type="text"
              value={block.content?.backgroundImage || ''}
              onChange={(e) => onContentChange('backgroundImage', e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white text-sm"
            />
            <p className="text-xs text-slate-500 mt-1">Optional: Add a background image to your hero section</p>
          </div>
        </>
      )}

      {block.block_type === 'cta' && (
        <>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">
              Title
            </label>
            <input
              type="text"
              value={block.content?.title || ''}
              onChange={(e) => onContentChange('title', e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">
              Button Text
            </label>
            <input
              type="text"
              value={block.content?.buttonText || ''}
              onChange={(e) => onContentChange('buttonText', e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white text-sm"
            />
          </div>
        </>
      )}

      {block.block_type === 'code' && (
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-2">
            Code
          </label>
          <textarea
            value={block.content?.code || ''}
            onChange={(e) => onContentChange('code', e.target.value)}
            rows={8}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white font-mono text-xs"
          />
        </div>
      )}

      {block.block_type === 'image' && (
        <>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">
              Image URL
            </label>
            <input
              type="text"
              value={block.content?.url || ''}
              onChange={(e) => onContentChange('url', e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">
              Alt Text
            </label>
            <input
              type="text"
              value={block.content?.alt || ''}
              onChange={(e) => onContentChange('alt', e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white text-sm"
            />
          </div>
        </>
      )}

      <div className="pt-4 border-t border-slate-700">
        <p className="text-xs font-medium text-slate-300 mb-3">Visibility</p>
        <label className="flex items-center text-xs text-slate-300 mb-2">
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
        <label className="flex items-center text-xs text-slate-300">
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

// Design Tab Component
function DesignTab({ block, onStyleChange }: any) {
  return (
    <div className="space-y-4">
      {/* Typography Section */}
      <div>
        <p className="text-xs font-semibold text-white mb-3 flex items-center gap-2">
          <Type className="w-3.5 h-3.5" />
          Typography
        </p>
        <div className="space-y-3 pl-1">
          <div>
            <label className="block text-xs text-slate-300 mb-1.5">Font Family</label>
            <select
              value={block.styles?.fontFamily || 'inherit'}
              onChange={(e) => onStyleChange('fontFamily', e.target.value)}
              className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-white text-xs"
            >
              <option value="inherit">Inherit</option>
              <option value="Inter, sans-serif">Inter</option>
              <option value="Arial, sans-serif">Arial</option>
              <option value="'Times New Roman', serif">Times New Roman</option>
              <option value="'Courier New', monospace">Courier New</option>
              <option value="Georgia, serif">Georgia</option>
              <option value="'Helvetica Neue', sans-serif">Helvetica</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-slate-300 mb-1.5">Size</label>
              <input
                type="text"
                value={block.styles?.fontSize || ''}
                onChange={(e) => onStyleChange('fontSize', e.target.value)}
                placeholder="16px"
                className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-white text-xs"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-300 mb-1.5">Weight</label>
              <select
                value={block.styles?.fontWeight || 'normal'}
                onChange={(e) => onStyleChange('fontWeight', e.target.value)}
                className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-white text-xs"
              >
                <option value="300">Light</option>
                <option value="normal">Normal</option>
                <option value="500">Medium</option>
                <option value="600">Semibold</option>
                <option value="bold">Bold</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-slate-300 mb-1.5">Line Height</label>
              <input
                type="text"
                value={block.styles?.lineHeight || ''}
                onChange={(e) => onStyleChange('lineHeight', e.target.value)}
                placeholder="1.5"
                className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-white text-xs"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-300 mb-1.5">Letter Spacing</label>
              <input
                type="text"
                value={block.styles?.letterSpacing || ''}
                onChange={(e) => onStyleChange('letterSpacing', e.target.value)}
                placeholder="0px"
                className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-white text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-300 mb-1.5">Text Align</label>
            <div className="flex gap-1">
              <button
                onClick={() => onStyleChange('textAlign', 'left')}
                className={`flex-1 p-1.5 rounded border transition-colors ${block.styles?.textAlign === 'left'
                  ? 'bg-blue-500 border-blue-500'
                  : 'bg-slate-800 border-slate-700 hover:border-slate-600'
                  }`}
              >
                <AlignLeft className="w-3.5 h-3.5 mx-auto text-white" />
              </button>
              <button
                onClick={() => onStyleChange('textAlign', 'center')}
                className={`flex-1 p-1.5 rounded border transition-colors ${block.styles?.textAlign === 'center'
                  ? 'bg-blue-500 border-blue-500'
                  : 'bg-slate-800 border-slate-700 hover:border-slate-600'
                  }`}
              >
                <AlignCenter className="w-3.5 h-3.5 mx-auto text-white" />
              </button>
              <button
                onClick={() => onStyleChange('textAlign', 'right')}
                className={`flex-1 p-1.5 rounded border transition-colors ${block.styles?.textAlign === 'right'
                  ? 'bg-blue-500 border-blue-500'
                  : 'bg-slate-800 border-slate-700 hover:border-slate-600'
                  }`}
              >
                <AlignRight className="w-3.5 h-3.5 mx-auto text-white" />
              </button>
              <button
                onClick={() => onStyleChange('textAlign', 'justify')}
                className={`flex-1 p-1.5 rounded border transition-colors ${block.styles?.textAlign === 'justify'
                  ? 'bg-blue-500 border-blue-500'
                  : 'bg-slate-800 border-slate-700 hover:border-slate-600'
                  }`}
              >
                <AlignJustify className="w-3.5 h-3.5 mx-auto text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Colors Section */}
      <div className="border-t border-slate-800 pt-4">
        <p className="text-xs font-semibold text-white mb-3 flex items-center gap-2">
          <Palette className="w-3.5 h-3.5" />
          Colors
        </p>
        <div className="space-y-3 pl-1">
          <div>
            <label className="block text-xs text-slate-300 mb-1.5">Text Color</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={block.styles?.color || '#000000'}
                onChange={(e) => onStyleChange('color', e.target.value)}
                className="w-12 h-8 rounded border border-slate-700 bg-slate-800 cursor-pointer"
              />
              <input
                type="text"
                value={block.styles?.color || ''}
                onChange={(e) => onStyleChange('color', e.target.value)}
                placeholder="#000000"
                className="flex-1 px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-white text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-300 mb-1.5">Background Color</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={block.styles?.backgroundColor || '#ffffff'}
                onChange={(e) => onStyleChange('backgroundColor', e.target.value)}
                className="w-12 h-8 rounded border border-slate-700 bg-slate-800 cursor-pointer"
              />
              <input
                type="text"
                value={block.styles?.backgroundColor || ''}
                onChange={(e) => onStyleChange('backgroundColor', e.target.value)}
                placeholder="#ffffff"
                className="flex-1 px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-white text-xs"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Spacing Section */}
      <div className="border-t border-slate-800 pt-4">
        <p className="text-xs font-semibold text-white mb-3 flex items-center gap-2">
          <Box className="w-3.5 h-3.5" />
          Spacing
        </p>
        <div className="space-y-3 pl-1">
          <div>
            <label className="block text-xs text-slate-300 mb-2">Padding</label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={block.styles?.paddingTop || ''}
                onChange={(e) => onStyleChange('paddingTop', e.target.value)}
                placeholder="Top"
                className="px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-white text-xs"
              />
              <input
                type="text"
                value={block.styles?.paddingRight || ''}
                onChange={(e) => onStyleChange('paddingRight', e.target.value)}
                placeholder="Right"
                className="px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-white text-xs"
              />
              <input
                type="text"
                value={block.styles?.paddingBottom || ''}
                onChange={(e) => onStyleChange('paddingBottom', e.target.value)}
                placeholder="Bottom"
                className="px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-white text-xs"
              />
              <input
                type="text"
                value={block.styles?.paddingLeft || ''}
                onChange={(e) => onStyleChange('paddingLeft', e.target.value)}
                placeholder="Left"
                className="px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-white text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-300 mb-2">Margin</label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={block.styles?.marginTop || ''}
                onChange={(e) => onStyleChange('marginTop', e.target.value)}
                placeholder="Top"
                className="px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-white text-xs"
              />
              <input
                type="text"
                value={block.styles?.marginRight || ''}
                onChange={(e) => onStyleChange('marginRight', e.target.value)}
                placeholder="Right"
                className="px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-white text-xs"
              />
              <input
                type="text"
                value={block.styles?.marginBottom || ''}
                onChange={(e) => onStyleChange('marginBottom', e.target.value)}
                placeholder="Bottom"
                className="px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-white text-xs"
              />
              <input
                type="text"
                value={block.styles?.marginLeft || ''}
                onChange={(e) => onStyleChange('marginLeft', e.target.value)}
                placeholder="Left"
                className="px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-white text-xs"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Border Section */}
      <div className="border-t border-slate-800 pt-4">
        <p className="text-xs font-semibold text-white mb-3 flex items-center gap-2">
          <Square className="w-3.5 h-3.5" />
          Border
        </p>
        <div className="space-y-3 pl-1">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-slate-300 mb-1.5">Width</label>
              <input
                type="text"
                value={block.styles?.borderWidth || ''}
                onChange={(e) => onStyleChange('borderWidth', e.target.value)}
                placeholder="1px"
                className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-white text-xs"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-300 mb-1.5">Style</label>
              <select
                value={block.styles?.borderStyle || 'solid'}
                onChange={(e) => onStyleChange('borderStyle', e.target.value)}
                className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-white text-xs"
              >
                <option value="none">None</option>
                <option value="solid">Solid</option>
                <option value="dashed">Dashed</option>
                <option value="dotted">Dotted</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-300 mb-1.5">Border Color</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={block.styles?.borderColor || '#000000'}
                onChange={(e) => onStyleChange('borderColor', e.target.value)}
                className="w-12 h-8 rounded border border-slate-700 bg-slate-800 cursor-pointer"
              />
              <input
                type="text"
                value={block.styles?.borderColor || ''}
                onChange={(e) => onStyleChange('borderColor', e.target.value)}
                placeholder="#000000"
                className="flex-1 px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-white text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-300 mb-1.5">Border Radius</label>
            <input
              type="text"
              value={block.styles?.borderRadius || ''}
              onChange={(e) => onStyleChange('borderRadius', e.target.value)}
              placeholder="0px"
              className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-white text-xs"
            />
          </div>
        </div>
      </div>

      {/* Shadow Section */}
      <div className="border-t border-slate-800 pt-4">
        <p className="text-xs font-semibold text-white mb-3 flex items-center gap-2">
          <Wand2 className="w-3.5 h-3.5" />
          Shadow
        </p>
        <div className="space-y-3 pl-1">
          <div>
            <label className="block text-xs text-slate-300 mb-1.5">Box Shadow</label>
            <input
              type="text"
              value={block.styles?.boxShadow || ''}
              onChange={(e) => onStyleChange('boxShadow', e.target.value)}
              placeholder="0 4px 6px rgba(0,0,0,0.1)"
              className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-white text-xs"
            />
          </div>
          <div className="grid grid-cols-3 gap-1">
            <button
              onClick={() => onStyleChange('boxShadow', 'none')}
              className="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-xs text-white"
            >
              None
            </button>
            <button
              onClick={() => onStyleChange('boxShadow', '0 1px 3px rgba(0,0,0,0.1)')}
              className="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-xs text-white"
            >
              Small
            </button>
            <button
              onClick={() => onStyleChange('boxShadow', '0 4px 6px rgba(0,0,0,0.1)')}
              className="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-xs text-white"
            >
              Medium
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Layout Tab Component
function LayoutTab({ block, onStyleChange }: any) {
  return (
    <div className="space-y-4">
      {/* Size Section */}
      <div>
        <p className="text-xs font-semibold text-white mb-3 flex items-center gap-2">
          <Maximize2 className="w-3.5 h-3.5" />
          Size
        </p>
        <div className="space-y-3 pl-1">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-slate-300 mb-1.5">Width</label>
              <input
                type="text"
                value={block.styles?.width || ''}
                onChange={(e) => onStyleChange('width', e.target.value)}
                placeholder="auto"
                className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-white text-xs"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-300 mb-1.5">Height</label>
              <input
                type="text"
                value={block.styles?.height || ''}
                onChange={(e) => onStyleChange('height', e.target.value)}
                placeholder="auto"
                className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-white text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-slate-300 mb-1.5">Min Width</label>
              <input
                type="text"
                value={block.styles?.minWidth || ''}
                onChange={(e) => onStyleChange('minWidth', e.target.value)}
                placeholder="0"
                className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-white text-xs"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-300 mb-1.5">Max Width</label>
              <input
                type="text"
                value={block.styles?.maxWidth || ''}
                onChange={(e) => onStyleChange('maxWidth', e.target.value)}
                placeholder="none"
                className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-white text-xs"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Display & Position */}
      <div className="border-t border-slate-800 pt-4">
        <p className="text-xs font-semibold text-white mb-3">Display & Position</p>
        <div className="space-y-3 pl-1">
          <div>
            <label className="block text-xs text-slate-300 mb-1.5">Display</label>
            <select
              value={block.styles?.display || 'block'}
              onChange={(e) => onStyleChange('display', e.target.value)}
              className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-white text-xs"
            >
              <option value="block">Block</option>
              <option value="inline">Inline</option>
              <option value="inline-block">Inline Block</option>
              <option value="flex">Flex</option>
              <option value="grid">Grid</option>
              <option value="none">None</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-slate-300 mb-1.5">Position</label>
            <select
              value={block.styles?.position || 'static'}
              onChange={(e) => onStyleChange('position', e.target.value)}
              className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-white text-xs"
            >
              <option value="static">Static</option>
              <option value="relative">Relative</option>
              <option value="absolute">Absolute</option>
              <option value="fixed">Fixed</option>
              <option value="sticky">Sticky</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-slate-300 mb-1.5">Z-Index</label>
            <input
              type="text"
              value={block.styles?.zIndex || ''}
              onChange={(e) => onStyleChange('zIndex', e.target.value)}
              placeholder="auto"
              className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-white text-xs"
            />
          </div>
        </div>
      </div>

      {/* Flexbox Settings */}
      {block.styles?.display === 'flex' && (
        <div className="border-t border-slate-800 pt-4">
          <p className="text-xs font-semibold text-white mb-3">Flexbox</p>
          <div className="space-y-3 pl-1">
            <div>
              <label className="block text-xs text-slate-300 mb-1.5">Flex Direction</label>
              <select
                value={block.styles?.flexDirection || 'row'}
                onChange={(e) => onStyleChange('flexDirection', e.target.value)}
                className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-white text-xs"
              >
                <option value="row">Row</option>
                <option value="column">Column</option>
                <option value="row-reverse">Row Reverse</option>
                <option value="column-reverse">Column Reverse</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1.5">Justify Content</label>
              <select
                value={block.styles?.justifyContent || 'flex-start'}
                onChange={(e) => onStyleChange('justifyContent', e.target.value)}
                className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-white text-xs"
              >
                <option value="flex-start">Start</option>
                <option value="center">Center</option>
                <option value="flex-end">End</option>
                <option value="space-between">Space Between</option>
                <option value="space-around">Space Around</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1.5">Align Items</label>
              <select
                value={block.styles?.alignItems || 'stretch'}
                onChange={(e) => onStyleChange('alignItems', e.target.value)}
                className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-white text-xs"
              >
                <option value="stretch">Stretch</option>
                <option value="flex-start">Start</option>
                <option value="center">Center</option>
                <option value="flex-end">End</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1.5">Gap</label>
              <input
                type="text"
                value={block.styles?.gap || ''}
                onChange={(e) => onStyleChange('gap', e.target.value)}
                placeholder="0"
                className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-white text-xs"
              />
            </div>
          </div>
        </div>
      )}

      {/* Overflow */}
      <div className="border-t border-slate-800 pt-4">
        <p className="text-xs font-semibold text-white mb-3">Overflow</p>
        <div className="space-y-3 pl-1">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-slate-300 mb-1.5">Overflow X</label>
              <select
                value={block.styles?.overflowX || 'visible'}
                onChange={(e) => onStyleChange('overflowX', e.target.value)}
                className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-white text-xs"
              >
                <option value="visible">Visible</option>
                <option value="hidden">Hidden</option>
                <option value="scroll">Scroll</option>
                <option value="auto">Auto</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-300 mb-1.5">Overflow Y</label>
              <select
                value={block.styles?.overflowY || 'visible'}
                onChange={(e) => onStyleChange('overflowY', e.target.value)}
                className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-white text-xs"
              >
                <option value="visible">Visible</option>
                <option value="hidden">Hidden</option>
                <option value="scroll">Scroll</option>
                <option value="auto">Auto</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Advanced Tab Component
function AdvancedTab({ block, onUpdate }: any) {
  const [customCSS, setCustomCSS] = useState(block.styles?.customCSS || '');

  return (
    <div className="space-y-4">
      {/* Effects */}
      <div>
        <p className="text-xs font-semibold text-white mb-3 flex items-center gap-2">
          <Wand2 className="w-3.5 h-3.5" />
          Effects
        </p>
        <div className="space-y-3 pl-1">
          <div>
            <label className="block text-xs text-slate-300 mb-1.5">Opacity</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={block.styles?.opacity || 1}
              onChange={(e) =>
                onUpdate({
                  styles: {
                    ...block.styles,
                    opacity: e.target.value,
                  },
                })
              }
              className="w-full"
            />
            <div className="text-xs text-slate-400 mt-1">{block.styles?.opacity || 1}</div>
          </div>

          <div>
            <label className="block text-xs text-slate-300 mb-1.5">Transform</label>
            <input
              type="text"
              value={block.styles?.transform || ''}
              onChange={(e) =>
                onUpdate({
                  styles: {
                    ...block.styles,
                    transform: e.target.value,
                  },
                })
              }
              placeholder="rotate(45deg)"
              className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-white text-xs"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-300 mb-1.5">Filter</label>
            <input
              type="text"
              value={block.styles?.filter || ''}
              onChange={(e) =>
                onUpdate({
                  styles: {
                    ...block.styles,
                    filter: e.target.value,
                  },
                })
              }
              placeholder="blur(5px)"
              className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-white text-xs"
            />
          </div>
        </div>
      </div>

      {/* Transitions */}
      <div className="border-t border-slate-800 pt-4">
        <p className="text-xs font-semibold text-white mb-3">Transitions</p>
        <div className="space-y-3 pl-1">
          <div>
            <label className="block text-xs text-slate-300 mb-1.5">Transition</label>
            <input
              type="text"
              value={block.styles?.transition || ''}
              onChange={(e) =>
                onUpdate({
                  styles: {
                    ...block.styles,
                    transition: e.target.value,
                  },
                })
              }
              placeholder="all 0.3s ease"
              className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-white text-xs"
            />
          </div>
        </div>
      </div>

      {/* Custom CSS */}
      <div className="border-t border-slate-800 pt-4">
        <p className="text-xs font-semibold text-white mb-3 flex items-center gap-2">
          <Code className="w-3.5 h-3.5" />
          Custom CSS
        </p>
        <div className="pl-1">
          <textarea
            value={customCSS}
            onChange={(e) => {
              setCustomCSS(e.target.value);
              onUpdate({
                styles: {
                  ...block.styles,
                  customCSS: e.target.value,
                },
              });
            }}
            rows={6}
            placeholder="/* Custom CSS properties */&#10;color: #000;&#10;font-size: 16px;"
            className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-white text-xs font-mono"
          />
          <p className="text-xs text-slate-500 mt-1.5">
            Add custom CSS properties (without selectors)
          </p>
        </div>
      </div>

      {/* Element ID & Classes */}
      <div className="border-t border-slate-800 pt-4">
        <p className="text-xs font-semibold text-white mb-3">Attributes</p>
        <div className="space-y-3 pl-1">
          <div>
            <label className="block text-xs text-slate-300 mb-1.5">Element ID</label>
            <input
              type="text"
              value={block.styles?.elementId || ''}
              onChange={(e) =>
                onUpdate({
                  styles: {
                    ...block.styles,
                    elementId: e.target.value,
                  },
                })
              }
              placeholder="my-element-id"
              className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-white text-xs"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-300 mb-1.5">CSS Classes</label>
            <input
              type="text"
              value={block.styles?.className || ''}
              onChange={(e) =>
                onUpdate({
                  styles: {
                    ...block.styles,
                    className: e.target.value,
                  },
                })
              }
              placeholder="class1 class2"
              className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-white text-xs"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
// Section Settings Component
function SectionSettings({ section, onUpdate }: any) {
  const handleChange = (key: string, value: any) => {
    onUpdate({ [key]: value });
  };

  return (
    <div className="space-y-4 overflow-y-auto">
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">
          Section Name
        </label>
        <input
          type="text"
          value={section.name || ''}
          onChange={(e) => handleChange('name', e.target.value)}
          className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">
          Section Type
        </label>
        <select
          value={section.section_type || 'content'}
          onChange={(e) => handleChange('section_type', e.target.value)}
          className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
        >
          <option value="header">Header</option>
          <option value="content">Content</option>
          <option value="footer">Footer</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">
          Background Color
        </label>
        <input
          type="color"
          value={section.background_color || '#ffffff'}
          onChange={(e) => handleChange('background_color', e.target.value)}
          className="w-full h-10 bg-slate-800 border border-slate-700 rounded-lg"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">
          Max Width
        </label>
        <input
          type="text"
          value={section.max_width || '1200px'}
          onChange={(e) => handleChange('max_width', e.target.value)}
          className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
          placeholder="e.g., 1200px, 100%"
        />
      </div>

      <div>
        <label className="flex items-center text-sm text-slate-300">
          <input
            type="checkbox"
            checked={section.full_width || false}
            onChange={(e) => handleChange('full_width', e.target.checked)}
            className="mr-2"
          />
          Full Width
        </label>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">
            Padding Top
          </label>
          <input
            type="text"
            value={section.padding_top || '3rem'}
            onChange={(e) => handleChange('padding_top', e.target.value)}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">
            Padding Bottom
          </label>
          <input
            type="text"
            value={section.padding_bottom || '3rem'}
            onChange={(e) => handleChange('padding_bottom', e.target.value)}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">
            Padding Left
          </label>
          <input
            type="text"
            value={section.padding_left || '1rem'}
            onChange={(e) => handleChange('padding_left', e.target.value)}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">
            Padding Right
          </label>
          <input
            type="text"
            value={section.padding_right || '1rem'}
            onChange={(e) => handleChange('padding_right', e.target.value)}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm"
          />
        </div>
      </div>
    </div>
  );
}
