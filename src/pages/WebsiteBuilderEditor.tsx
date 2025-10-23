import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Loader2,
  Save,
  Eye,
  Undo,
  Redo,
  Monitor,
  Smartphone,
  Tablet,
  Settings as SettingsIcon,
  Wrench,
  Search as SearchIcon,
  ZoomIn,
  ChevronDown,
  Palette,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, WebsitePage, WebsiteContentBlock } from '../lib/supabase';
import { WebsiteEditorProvider, useWebsiteEditor } from '../contexts/WebsiteEditorContext';
import PageEditor from '../components/website-builder/PageEditor';
import CloneViewer from '../components/website-builder/CloneViewer';
import HtmlEditor from '../components/website-builder/HtmlEditor';
import SmartEditMode from '../components/website-builder/SmartEditMode';
import DesignSystemPanel from '../components/website-builder/DesignSystemPanel';
import KeyboardShortcutsModal from '../components/website-builder/KeyboardShortcutsModal';
import MobileBlocker from '../components/website-builder/MobileBlocker';
import { CanvasMode } from '../components/canvas/CanvasMode';
import { isFeatureEnabled } from '../lib/featureFlags';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { useScreenSize } from '../hooks/useScreenSize';

function WebsiteBuilderEditorContent() {
  const { pageId } = useParams();
  const navigate = useNavigate();
  const { organization } = useAuth();
  const { isMobile } = useScreenSize();
  const {
    loadBlocks,
    loadSections,
    designSystem,
    updateDesignSystem,
    selectedBlockId,
    selectBlock,
    deleteBlock,
    duplicateBlock,
    copyBlock,
    cutBlock,
    pasteBlock,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useWebsiteEditor();

  const [page, setPage] = useState<WebsitePage | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [websiteSubdomain, setWebsiteSubdomain] = useState<string>('');
  const [websiteCustomCss, setWebsiteCustomCss] = useState<string>('');

  // Clone mode state
  const [websiteMode, setWebsiteMode] = useState<'blocks' | 'clone' | 'smart-edit'>('blocks');
  const [cloneHtml, setCloneHtml] = useState<string>('');
  const [cloneCss, setCloneCss] = useState<string>('');
  const [cloneJs, setCloneJs] = useState<string>('');

  // Multi-page navigation for Clone Mode
  const [allPages, setAllPages] = useState<WebsitePage[]>([]);
  const [selectedClonePage, setSelectedClonePage] = useState<WebsitePage | null>(null);

  // UI state - must be declared before any conditional returns
  const [viewMode, setViewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [showToolsMenu, setShowToolsMenu] = useState(false);
  const [showDesignSystem, setShowDesignSystem] = useState(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [zoom, setZoom] = useState(100);

  // Canvas tools state
  const [showRulers, setShowRulers] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [snapToGrid, setSnapToGrid] = useState(true);

  useEffect(() => {
    if (pageId) {
      loadPageAndBlocks();
    }
  }, [pageId]);

  // Inject imported website CSS into the document head
  useEffect(() => {
    if (websiteCustomCss) {
      const styleEl = document.createElement('style');
      styleEl.id = 'imported-website-css';
      styleEl.textContent = websiteCustomCss;
      document.head.appendChild(styleEl);

      return () => {
        // Clean up when component unmounts or CSS changes
        document.getElementById('imported-website-css')?.remove();
      };
    }
  }, [websiteCustomCss]);

  const loadPageAndBlocks = async () => {
    try {
      setLoading(true);

      const { data: pageData, error: pageError } = await supabase
        .from('website_pages')
        .select('*')
        .eq('id', pageId)
        .single();

      if (pageError) throw pageError;
      setPage(pageData as WebsitePage);

      // Load website data including clone mode fields
      const { data: websiteData } = await supabase
        .from('organization_websites')
        .select('subdomain, custom_css, website_mode, clone_html, clone_css, clone_js')
        .eq('id', pageData.website_id)
        .single();

      if (websiteData) {
        setWebsiteSubdomain(websiteData.subdomain);
        setWebsiteCustomCss(websiteData.custom_css || '');

        // Set clone mode data if available
        setWebsiteMode(websiteData.website_mode || 'blocks');
        setCloneCss(websiteData.clone_css || '');
        setCloneJs(websiteData.clone_js || '');

        // For Clone Mode, load all pages for navigation
        if (websiteData.website_mode === 'clone') {
          const { data: pagesData } = await supabase
            .from('website_pages')
            .select('*')
            .eq('website_id', pageData.website_id)
            .order('order_index', { ascending: true });

          if (pagesData && pagesData.length > 0) {
            setAllPages(pagesData as WebsitePage[]);
            // Set first page as selected (or find current page)
            const currentPage = pagesData.find(p => p.id === pageId) || pagesData[0];
            setSelectedClonePage(currentPage as WebsitePage);
            setCloneHtml(currentPage.clone_html || websiteData.clone_html || '');
          } else {
            // Fallback to website-level clone_html
            setCloneHtml(websiteData.clone_html || '');
          }
        } else {
          setCloneHtml(websiteData.clone_html || '');
        }

        console.log('Website mode:', websiteData.website_mode);
        console.log('Clone data loaded:', {
          hasHtml: !!websiteData.clone_html,
          htmlLength: websiteData.clone_html?.length || 0,
          hasCss: !!websiteData.clone_css,
          cssLength: websiteData.clone_css?.length || 0,
          pagesCount: allPages.length,
        });
      }

      // Load sections
      const { data: sectionsData, error: sectionsError } = await supabase
        .from('website_sections')
        .select('*')
        .eq('page_id', pageId)
        .order('order_index', { ascending: true });

      if (sectionsError && sectionsError.code !== 'PGRST116') { // Ignore not found errors
        console.error('Error loading sections:', sectionsError);
      }
      loadSections((sectionsData as any[]) || []);

      const { data: blocksData, error: blocksError } = await supabase
        .from('website_content_blocks')
        .select('*')
        .eq('page_id', pageId)
        .order('order_index', { ascending: true });

      if (blocksError) throw blocksError;
      loadBlocks((blocksData as WebsiteContentBlock[]) || []);
    } catch (error) {
      console.error('Error loading page:', error);
    } finally {
      setLoading(false);
    }
  };

  const { blocks: editorBlocks, sections: editorSections } = useWebsiteEditor();

  const handleSave = async () => {
    if (!pageId || !page) return;

    try {
      setSaving(true);

      // Save sections first
      const existingSectionsRes = await supabase
        .from('website_sections')
        .select('id')
        .eq('page_id', pageId);

      const existingSectionIds = existingSectionsRes.data?.map((s) => s.id) || [];
      const currentSectionIds = editorSections.map((s) => s.id).filter((id) => !id.startsWith('temp-'));

      const sectionIdsToDelete = existingSectionIds.filter((id) => !currentSectionIds.includes(id));
      if (sectionIdsToDelete.length > 0) {
        await supabase
          .from('website_sections')
          .delete()
          .in('id', sectionIdsToDelete);
      }

      for (const section of editorSections) {
        if (section.id.startsWith('temp-')) {
          const { id, ...sectionData } = section;
          await supabase
            .from('website_sections')
            .insert({
              ...sectionData,
              page_id: pageId,
            });
        } else {
          const { id, ...sectionData } = section;
          await supabase
            .from('website_sections')
            .update(sectionData)
            .eq('id', id);
        }
      }

      // Save blocks
      const existingBlocksRes = await supabase
        .from('website_content_blocks')
        .select('id')
        .eq('page_id', pageId);

      const existingIds = existingBlocksRes.data?.map((b) => b.id) || [];
      const currentIds = editorBlocks.map((b) => b.id).filter((id) => !id.startsWith('temp-'));

      const idsToDelete = existingIds.filter((id) => !currentIds.includes(id));
      if (idsToDelete.length > 0) {
        await supabase
          .from('website_content_blocks')
          .delete()
          .in('id', idsToDelete);
      }

      for (const block of editorBlocks) {
        if (block.id.startsWith('temp-')) {
          const { id, ...blockData } = block;
          await supabase
            .from('website_content_blocks')
            .insert({
              ...blockData,
              page_id: pageId,
            });
        } else {
          const { id, ...blockData } = block;
          await supabase
            .from('website_content_blocks')
            .update(blockData)
            .eq('id', id);
        }
      }

      await supabase
        .from('website_pages')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', pageId);

      await loadPageAndBlocks();
    } catch (error) {
      console.error('Error saving page:', error);
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = () => {
    setShowPreview(true);
  };

  const handleSaveCloneHtml = async (html: string, css: string) => {
    if (!page) return;

    try {
      setSaving(true);

      // Update the clone_html and clone_css in the database
      const { error } = await supabase
        .from('organization_websites')
        .update({
          clone_html: html,
          clone_css: css,
        })
        .eq('id', page.website_id);

      if (error) throw error;

      // Update local state
      setCloneHtml(html);
      setCloneCss(css);

      console.log('Clone HTML/CSS saved successfully');
    } catch (error) {
      console.error('Error saving clone HTML/CSS:', error);
    } finally {
      setSaving(false);
    }
  };

  // Keyboard shortcuts - defined after all handler functions
  useKeyboardShortcuts({
    onSave: handleSave,
    onUndo: undo,
    onRedo: redo,
    onDelete: () => {
      if (selectedBlockId) {
        deleteBlock(selectedBlockId);
      }
    },
    onDuplicate: () => {
      if (selectedBlockId) {
        duplicateBlock(selectedBlockId);
      }
    },
    onCopy: () => {
      if (selectedBlockId) {
        copyBlock(selectedBlockId);
      }
    },
    onCut: () => {
      if (selectedBlockId) {
        cutBlock(selectedBlockId);
      }
    },
    onPaste: pasteBlock,
    onEscape: () => {
      selectBlock(null);
    },
    onHelp: () => {
      setShowShortcutsModal(true);
    },
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  // Block mobile devices
  if (isMobile) {
    return <MobileBlocker />;
  }

  // Check if Canvas Mode is enabled via feature flag
  const canvasModeEnabled = isFeatureEnabled('canvasMode');

  // If Canvas Mode is enabled, render it instead of the legacy editor
  if (canvasModeEnabled) {
    return <CanvasMode />;
  }

  return (
    <div className="h-screen flex flex-col bg-slate-950">
      {/* Wix-Style Top Navigation Bar */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-2">
        <div className="flex items-center justify-between">
          {/* Left Section */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/website-builder')}
              className="text-slate-400 hover:text-white transition-colors p-2"
              title="Back to Pages"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="h-8 w-px bg-slate-700" />
            <div className="flex items-center space-x-2">
              <span className="text-sm text-slate-400">Page:</span>
              <button className="flex items-center space-x-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded text-white text-sm transition-colors">
                <span>{page?.title}</span>
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
            {/* Device Switcher */}
            <div className="flex items-center space-x-1 bg-slate-800 rounded p-1">
              <button
                onClick={() => setViewMode('desktop')}
                className={`p-1.5 rounded transition-colors ${
                  viewMode === 'desktop'
                    ? 'bg-blue-500 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Desktop View"
              >
                <Monitor className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('tablet')}
                className={`p-1.5 rounded transition-colors ${
                  viewMode === 'tablet'
                    ? 'bg-blue-500 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Tablet View"
              >
                <Tablet className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('mobile')}
                className={`p-1.5 rounded transition-colors ${
                  viewMode === 'mobile'
                    ? 'bg-blue-500 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Mobile View"
              >
                <Smartphone className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Center Section - Domain */}
          <div className="flex items-center space-x-2 text-sm">
            <span className="text-slate-500">/{page?.slug || 'home'}</span>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-3">
            {/* Undo/Redo */}
            <div className="flex items-center space-x-1">
              <button
                onClick={undo}
                disabled={!canUndo}
                className="p-2 text-slate-400 hover:text-white transition-colors disabled:opacity-50"
                title="Undo (Ctrl+Z)"
              >
                <Undo className="w-4 h-4" />
              </button>
              <button
                onClick={redo}
                disabled={!canRedo}
                className="p-2 text-slate-400 hover:text-white transition-colors disabled:opacity-50"
                title="Redo (Ctrl+Y)"
              >
                <Redo className="w-4 h-4" />
              </button>
            </div>

            <div className="h-6 w-px bg-slate-700" />

            {/* Zoom */}
            <button
              className="flex items-center space-x-1 px-2 py-1.5 text-sm text-slate-300 hover:text-white transition-colors"
              title="Zoom"
            >
              <ZoomIn className="w-4 h-4" />
              <span>{zoom}%</span>
            </button>

            {/* Tools Menu */}
            <div className="relative">
              <button
                onClick={() => setShowToolsMenu(!showToolsMenu)}
                className="flex items-center space-x-1 px-3 py-1.5 text-sm text-slate-300 hover:text-white transition-colors"
                title="Tools"
              >
                <Wrench className="w-4 h-4" />
                <span>Tools</span>
              </button>
              {showToolsMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-xl py-2 z-50">
                  <label className="flex items-center px-4 py-2 hover:bg-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showRulers}
                      onChange={(e) => setShowRulers(e.target.checked)}
                      className="mr-3"
                    />
                    <span className="text-sm text-white">Rulers</span>
                  </label>
                  <label className="flex items-center px-4 py-2 hover:bg-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showGrid}
                      onChange={(e) => setShowGrid(e.target.checked)}
                      className="mr-3"
                    />
                    <span className="text-sm text-white">Gridlines</span>
                  </label>
                  <label className="flex items-center px-4 py-2 hover:bg-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={snapToGrid}
                      onChange={(e) => setSnapToGrid(e.target.checked)}
                      className="mr-3"
                    />
                    <span className="text-sm text-white">Snap to Grid</span>
                  </label>
                </div>
              )}
            </div>

            {/* Design System */}
            <button
              onClick={() => setShowDesignSystem(!showDesignSystem)}
              className={`flex items-center space-x-1 px-3 py-1.5 text-sm transition-colors ${
                showDesignSystem
                  ? 'text-blue-500'
                  : 'text-slate-300 hover:text-white'
              }`}
              title="Design System"
            >
              <Palette className="w-4 h-4" />
              <span>Design</span>
            </button>

            {/* Search */}
            <button
              className="flex items-center space-x-1 px-3 py-1.5 text-sm text-slate-300 hover:text-white transition-colors"
              title="Search"
            >
              <SearchIcon className="w-4 h-4" />
              <span>Search</span>
            </button>

            <div className="h-6 w-px bg-slate-700" />

            {/* Action Buttons */}
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-white bg-slate-700 hover:bg-slate-600 rounded transition-colors flex items-center space-x-2 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save</span>
                </>
              )}
            </button>

            <button
              onClick={handlePreview}
              className="px-4 py-2 text-sm font-medium text-white bg-slate-700 hover:bg-slate-600 rounded transition-colors flex items-center space-x-2"
            >
              <Eye className="w-4 h-4" />
              <span>Preview</span>
            </button>

            <button
              className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded transition-colors"
            >
              Publish
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {websiteMode === 'clone' && cloneHtml ? (
          <div className="h-full flex flex-col bg-white">
            {/* Clone Mode Notice */}
            <div className="bg-blue-50 border-b border-blue-200 px-4 py-2 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Eye className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-blue-800 font-medium">Clone Mode - Pixel-Perfect Rendering</span>
                  <span className="text-xs text-blue-600">Imported website</span>
                </div>
                {/* Page Selector for Multi-page Clone */}
                {allPages.length > 1 && (
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-blue-700 font-medium">Page:</span>
                    <select
                      value={selectedClonePage?.id || ''}
                      onChange={(e) => {
                        const newPage = allPages.find(p => p.id === e.target.value);
                        if (newPage) {
                          setSelectedClonePage(newPage);
                          setCloneHtml(newPage.clone_html || '');
                        }
                      }}
                      className="px-2 py-1 text-xs bg-white border border-blue-300 rounded text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {allPages.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.title} {p.slug && `(/${p.slug})`}
                        </option>
                      ))}
                    </select>
                    <span className="text-xs text-blue-600">
                      {allPages.length} pages imported
                    </span>
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setWebsiteMode('smart-edit')}
                  className="px-3 py-1 text-xs bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded hover:from-purple-700 hover:to-blue-700 transition-colors font-medium"
                >
                  ✨ Smart Edit
                </button>
                <button
                  onClick={() => setWebsiteMode('blocks')}
                  className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  HTML Editor
                </button>
              </div>
            </div>
            {/* CloneViewer renders the original HTML/CSS in iframe */}
            <div className="flex-1">
              <CloneViewer
                html={cloneHtml}
                css={cloneCss}
                js={cloneJs}
              />
            </div>
          </div>
        ) : websiteMode === 'smart-edit' && cloneHtml ? (
          // Smart Edit Mode - AI-powered visual editing
          <SmartEditMode
            html={cloneHtml}
            css={cloneCss}
            js={cloneJs}
            websiteId={page?.website_id || ''}
            onHtmlUpdate={(newHtml) => {
              const updateId = Date.now();
              console.log(`📥 [PARENT] onHtmlUpdate received #${updateId}`);
              console.log(`   Old HTML length: ${cloneHtml.length}`);
              console.log(`   New HTML length: ${newHtml.length}`);
              console.log(`   Calling setCloneHtml to update state...`);
              setCloneHtml(newHtml);
              console.log(`   ✓ setCloneHtml called #${updateId}`);
              console.log(`   Calling handleSaveCloneHtml to persist...`);
              handleSaveCloneHtml(newHtml, cloneCss);
            }}
            onExitEditMode={() => setWebsiteMode('clone')}
          />
        ) : cloneHtml ? (
          // Edit Mode for cloned websites - show HTML editor
          <div className="h-full flex flex-col">
            {/* Edit Mode Notice */}
            <div className="bg-purple-50 border-b border-purple-200 px-4 py-2 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Eye className="w-4 h-4 text-purple-600" />
                <span className="text-sm text-purple-800 font-medium">Edit Mode - Direct HTML/CSS Editing</span>
              </div>
              <button
                onClick={() => setWebsiteMode('clone')}
                className="px-3 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
              >
                Back to View Mode
              </button>
            </div>
            <div className="flex-1">
              <HtmlEditor
                html={cloneHtml}
                css={cloneCss}
                onSave={handleSaveCloneHtml}
              />
            </div>
          </div>
        ) : (
          // Regular block-based editor for non-cloned websites
          <PageEditor
            onSave={handleSave}
            onPreview={handlePreview}
            saving={saving}
            showRulers={showRulers}
            showGrid={showGrid}
            snapToGrid={snapToGrid}
            viewMode={viewMode}
            onToggleRulers={setShowRulers}
            onToggleGrid={setShowGrid}
            onToggleSnap={setSnapToGrid}
          />
        )}
      </div>

      {/* Design System Panel */}
      <DesignSystemPanel
        isOpen={showDesignSystem}
        onClose={() => setShowDesignSystem(false)}
        designSystem={designSystem}
        onUpdate={updateDesignSystem}
      />

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal
        isOpen={showShortcutsModal}
        onClose={() => setShowShortcutsModal(false)}
      />

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 rounded-xl shadow-2xl w-full h-full max-w-7xl max-h-[90vh] border border-slate-800 flex flex-col">
            {/* Preview Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-800">
              <div className="flex items-center space-x-3">
                <Eye className="w-5 h-5 text-blue-500" />
                <div>
                  <h3 className="text-lg font-semibold text-white">Preview</h3>
                  <p className="text-xs text-slate-400">
                    {websiteSubdomain ? `${websiteSubdomain}.rosterup.com/${page?.slug || ''}` : 'Preview your website'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPreview(false)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            </div>

            {/* Preview Content */}
            <div className="flex-1 overflow-hidden bg-white">
              {websiteMode === 'clone' && cloneHtml ? (
                // Use CloneViewer for pixel-perfect preview of imported websites
                <CloneViewer
                  html={cloneHtml}
                  css={cloneCss}
                  js={cloneJs}
                />
              ) : (
                // Use block-based preview for manually created websites
                <div className="h-full overflow-auto">
                  {/* Inject imported website CSS for preview */}
                  {websiteCustomCss && <style>{websiteCustomCss}</style>}
                  <div className="min-h-full">
                    {editorSections.map((section) => {
                  const sectionBlocks = editorBlocks.filter((b) => b.section_id === section.id);

                  return (
                    <div
                      key={section.id}
                      style={{
                        backgroundColor: section.background_color || 'white',
                        backgroundImage: section.background_image ? `url(${section.background_image})` : undefined,
                        backgroundSize: section.background_size || 'cover',
                        backgroundPosition: section.background_position || 'center',
                        paddingTop: section.padding_top || '3rem',
                        paddingBottom: section.padding_bottom || '3rem',
                      }}
                    >
                      <div
                        style={{
                          maxWidth: section.full_width ? '100%' : section.max_width || '1200px',
                          marginLeft: 'auto',
                          marginRight: 'auto',
                          paddingLeft: section.padding_left || '1rem',
                          paddingRight: section.padding_right || '1rem',
                        }}
                      >
                        {sectionBlocks.map((block) => (
                          <div
                            key={block.id}
                            style={{
                              ...block.styles,
                              marginBottom: block.styles?.marginBottom || '1rem',
                            }}
                          >
                            {renderPreviewBlock(block)}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )}
</div>
);
}

// Helper function to render preview blocks
function renderPreviewBlock(block: any) {
  switch (block.block_type) {
    case 'heading':
      return <h2 className="text-3xl font-bold text-gray-900">{block.content?.text || 'Heading'}</h2>;
    case 'paragraph':
      return <p className="text-gray-700 leading-relaxed">{block.content?.text || ''}</p>;
    case 'image':
      return block.content?.url ? (
        <img src={block.content.url} alt={block.content.alt || ''} className="w-full h-auto rounded-lg" />
      ) : null;
    case 'button':
      return (
        <a
          href={block.content?.url || '#'}
          className="inline-block px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          {block.content?.text || 'Button'}
        </a>
      );
    case 'html':
      // Render Smart Import™ preserved HTML
      if (block.styles?.preserveOriginalHtml && block.styles?.originalElement) {
        return (
          <div
            className={block.styles.className || ''}
            dangerouslySetInnerHTML={{ __html: block.styles.originalElement }}
          />
        );
      } else if (block.styles?.fullSectionHtml && block.content?.html) {
        return (
          <div
            className={block.styles.className || ''}
            dangerouslySetInnerHTML={{ __html: block.content.html }}
          />
        );
      }
      // Fallback to regular HTML
      return <div dangerouslySetInnerHTML={{ __html: block.content?.html || '<p>HTML content</p>' }} />;
    default:
      return <div className="p-4 bg-gray-100 rounded">{block.block_type}</div>;
  }
}

export default function WebsiteBuilderEditor() {
  return (
    <WebsiteEditorProvider>
      <WebsiteBuilderEditorContent />
    </WebsiteEditorProvider>
  );
}
