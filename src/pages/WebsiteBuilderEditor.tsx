import { useEffect, useState, useRef, useCallback } from 'react';
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
import { ThemeProvider } from '../contexts/ThemeContext';
import { SelectedElementProvider, useSelectedElement } from '../contexts/SelectedElementContext';
import PageEditor from '../components/website-builder/PageEditor';
import CloneViewer from '../components/website-builder/CloneViewer';
import HtmlEditor from '../components/website-builder/HtmlEditor';
import SmartEditMode from '../components/website-builder/SmartEditMode';
import DesignSystemPanel from '../components/website-builder/DesignSystemPanel';
import ElementPropertiesPanel from '../components/website-builder/ElementPropertiesPanel';
import KeyboardShortcutsModal from '../components/website-builder/KeyboardShortcutsModal';
import MobileBlocker from '../components/website-builder/MobileBlocker';
import { CanvasMode } from '../components/canvas/CanvasMode';
import { isFeatureEnabled } from '../lib/featureFlags';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { useScreenSize } from '../hooks/useScreenSize';
import { SectionCommandBus } from '../lib/sectionCommandBus';
import { useDebouncedCallback } from '../lib/debounce';
import SectionRenderer from '../components/website-builder/inline-editing/SectionRenderer';
import SectionMenu from '../components/website-builder/inline-editing/SectionMenu';
import Toolbar from '../components/website-builder/inline-editing/Toolbar';
import SectionMarketplace from '../components/website-builder/inline-editing/SectionMarketplace';
import CommandPalette from '../components/website-builder/inline-editing/CommandPalette';
import PropertyPanel from '../components/website-builder/inline-editing/PropertyPanel';
import { DndContext, closestCenter, DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { SortableSectionWrapper } from '../components/website-builder/inline-editing/SortableSectionWrapper';
import { showToast } from '../components/ui/Toast';

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

  const { selectedElement, selectElement, clearSelection, setEditingMode } = useSelectedElement();

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

  // Template mode state
  const [templateSections, setTemplateSections] = useState<any[]>([]);
  const [isTemplatePage, setIsTemplatePage] = useState(false);
  const [templateEditMode, setTemplateEditMode] = useState(false);
  const [showSectionMenu, setShowSectionMenu] = useState(false);
  const [showSectionMarketplace, setShowSectionMarketplace] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showPropertyPanel, setShowPropertyPanel] = useState(false);
  const [selectedSectionForProps, setSelectedSectionForProps] = useState<any | null>(null);
  const commandBusRef = useRef<SectionCommandBus>(new SectionCommandBus());

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

      const sections = (sectionsData as any[]) || [];
      loadSections(sections);

      // Detect template mode immediately after loading sections
      const hasTemplateSections = sections.some((s: any) => s.section_type);
      console.log('🔍 Direct template detection:', {
        sectionsCount: sections.length,
        hasTemplateSections,
        sectionTypes: sections.map((s: any) => s.section_type)
      });

      if (hasTemplateSections) {
        console.log('✅ Template mode activated with', sections.length, 'sections');
        setIsTemplatePage(true);
        setTemplateSections(sections);
        setTemplateEditMode(true);
      }

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

  // Detect template mode based on section_type field
  useEffect(() => {
    console.log('🔍 Template detection:', {
      editorSections,
      count: editorSections?.length,
      hasSectionType: editorSections?.some((s: any) => s.section_type),
      sectionTypes: editorSections?.map((s: any) => s.section_type)
    });
    const hasTemplateSections = editorSections?.some((s: any) => s.section_type);
    setIsTemplatePage(Boolean(hasTemplateSections));
    if (hasTemplateSections) {
      console.log('✅ Template mode activated with', editorSections.length, 'sections');
      setTemplateSections(editorSections);
      setTemplateEditMode(true);
    }
  }, [editorSections]);

  // Load template sections
  const loadTemplateSections = useCallback(async (pageId: string) => {
    try {
      const { data, error } = await supabase
        .from('website_sections')
        .select('*')
        .eq('page_id', pageId)
        .order('order_index', { ascending: true });
      if (!error && data) {
        setTemplateSections(data);
        loadSections(data);
      }
    } catch (error) {
      console.error('Error loading template sections:', error);
    }
  }, [loadSections]);

  useEffect(() => {
    if (page?.id && isTemplatePage) {
      loadTemplateSections(page.id);
    }
  }, [page?.id, isTemplatePage, loadTemplateSections]);

  // Keyboard listener for Command Palette (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandPalette(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Debounced section content update
  const updateSectionContent = useDebouncedCallback(async (id: string, content: Record<string, any>) => {
    setSaving(true);
    try {
      const current = templateSections.find((s: any) => s.id === id);
      await supabase.from('website_sections').update({
        styles: { ...(current?.styles ?? {}), content },
        updated_at: new Date().toISOString(),
      }).eq('id', id);
      setTemplateSections((prev: any[]) =>
        prev.map((s: any) => s.id === id ? { ...s, styles: { ...(s.styles ?? {}), content } } : s)
      );
    } catch (error) {
      console.error('Error updating section content:', error);
    } finally {
      setSaving(false);
    }
  }, 300);

  // Template section handlers with CommandBus integration
  const handleSectionUpdate = (id: string, newContent: Record<string, any>) => {
    const oldContent = templateSections.find((s: any) => s.id === id)?.styles?.content ?? {};
    commandBusRef.current.execute({
      type: 'updateSection',
      payload: { sectionId: id, content: newContent },
      previousState: oldContent,
      apply: async () => { await updateSectionContent(id, newContent); },
      revert: async () => { await updateSectionContent(id, oldContent); },
    });
  };

  const handleAddSection = async (tpl: any) => {
    if (!page?.id) return;
    const newSection = {
      page_id: page.id,
      name: tpl.name,
      section_type: tpl.id.replace(/-sports-\d+$/, ''),
      order_index: templateSections.length,
      styles: tpl.sections?.[0]?.styles ?? {},
    };

    await commandBusRef.current.execute({
      type: 'addSection',
      payload: newSection,
      apply: async () => {
        const { data, error } = await supabase.from('website_sections').insert(newSection).select().single();
        if (error) throw error;
        setTemplateSections((prev: any[]) => [...prev, data]);
        setShowSectionMenu(false);
      },
      revert: async () => {
        const last = templateSections[templateSections.length - 1];
        if (last?.id) {
          await supabase.from('website_sections').delete().eq('id', last.id);
          setTemplateSections((prev: any[]) => prev.slice(0, -1));
        }
      },
    });
  };

  // Handle section selection from SectionMarketplace
  const handleSelectSectionFromMarketplace = async (sectionId: string) => {
    if (!page?.id) return;

    // Map marketplace section IDs to section types
    const sectionTypeMap: Record<string, string> = {
      'navigation-center-logo': 'navigation-center-logo',
      'hero-modern': 'hero',
      'hero-video': 'hero',
      'hero-split': 'hero',
      'schedule-modern': 'schedule',
      'commitments': 'commitments',
      'contact-form': 'contact',
      'gallery-grid': 'gallery',
      'team-roster': 'roster',
    };

    const sectionType = sectionTypeMap[sectionId] || 'hero';

    // Navigation sections should always be at the top
    const isNavigation = sectionType === 'navigation-center-logo';
    const orderIndex = isNavigation ? 0 : templateSections.length;

    const newSection = {
      page_id: page.id,
      name: sectionId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      section_type: sectionType,
      order_index: orderIndex,
      styles: {
        content: getDefaultContentForSectionType(sectionType)
      },
    };

    await commandBusRef.current.execute({
      type: 'addSection',
      payload: newSection,
      apply: async () => {
        // If it's a navigation section, update order_index of existing sections
        if (isNavigation && templateSections.length > 0) {
          // Increment order_index of all existing sections
          await Promise.all(
            templateSections.map(section =>
              supabase
                .from('website_sections')
                .update({ order_index: section.order_index + 1 })
                .eq('id', section.id)
            )
          );
        }

        const { data, error } = await supabase.from('website_sections').insert(newSection).select().single();
        if (error) throw error;

        // Add to the beginning if navigation, end if not
        if (isNavigation) {
          setTemplateSections((prev: any[]) => [data, ...prev.map(s => ({ ...s, order_index: s.order_index + 1 }))]);
        } else {
          setTemplateSections((prev: any[]) => [...prev, data]);
        }
      },
      revert: async () => {
        if (isNavigation && templateSections.length > 0) {
          // Decrement order_index of all other sections
          await Promise.all(
            templateSections.map(section =>
              supabase
                .from('website_sections')
                .update({ order_index: Math.max(0, section.order_index - 1) })
                .eq('id', section.id)
            )
          );
          setTemplateSections((prev: any[]) => prev.slice(1).map(s => ({ ...s, order_index: Math.max(0, s.order_index - 1) })));
        } else {
          const last = templateSections[templateSections.length - 1];
          if (last?.id) {
            await supabase.from('website_sections').delete().eq('id', last.id);
            setTemplateSections((prev: any[]) => prev.slice(0, -1));
          }
        }
      },
    });
  };

  // Get default content for each section type
  const getDefaultContentForSectionType = (sectionType: string): Record<string, any> => {
    switch (sectionType) {
      case 'navigation-center-logo':
        return {
          social_links: [],
          top_right_text: '',
          top_right_link: '#',
          left_nav_items: [
            { label: 'HOME', link: '#' },
            { label: 'ABOUT', link: '#' },
            { label: 'TEAMS', link: '#' },
            { label: 'COMMITMENTS', link: '#' },
          ],
          right_nav_items: [
            { label: 'TRYOUTS', link: '#' },
            { label: 'TRAINING', link: '#' },
            { label: 'RECRUITING', link: '#' },
            { label: 'GEAR', link: '#' },
          ],
          logo_text: '',
          top_bar_bg_color: 'rgba(255, 255, 255, 0.95)',
          nav_bg_color: 'rgba(15, 23, 42, 0.95)',
          nav_text_color: '#ffffff',
          sticky: true,
        };
      case 'hero':
        return {
          heading: 'Welcome to Our Team',
          subheading: 'Excellence in Sports',
          cta_text: 'Get Started',
          cta_link: '#',
        };
      case 'schedule':
        return {
          title: 'Schedule & Events',
          description: 'View our upcoming games and events',
        };
      case 'commitments':
        return {
          title: 'Player Commitments',
          description: 'Celebrating our athletes\' college commitments',
        };
      case 'contact':
        return {
          title: 'Get In Touch',
          description: 'Contact us for more information',
        };
      case 'gallery':
        return {
          title: 'Photo Gallery',
          description: 'View our team in action',
        };
      case 'roster':
        return {
          title: 'Team Roster',
          description: 'Meet our players and coaches',
        };
      default:
        return {};
    }
  };

  // Command palette execution handler
  const handleExecuteCommand = async (commandId: string) => {
    console.log('Executing command:', commandId);

    switch (commandId) {
      case 'add-hero':
        await handleSelectSectionFromMarketplace('hero-modern');
        break;
      case 'add-schedule':
        await handleSelectSectionFromMarketplace('schedule-modern');
        break;
      case 'add-contact':
        await handleSelectSectionFromMarketplace('contact-form');
        break;
      case 'add-commitments':
        await handleSelectSectionFromMarketplace('commitments');
        break;
      case 'delete-section':
        // Delete currently selected section (if any)
        // For now, just log - we'd need to track selected section
        console.log('Delete section command');
        break;
      case 'duplicate-section':
        // Duplicate currently selected section
        console.log('Duplicate section command');
        break;
      case 'undo':
        commandBusRef.current.undo();
        break;
      case 'redo':
        commandBusRef.current.redo();
        break;
      case 'save':
        await handleSave();
        break;
      case 'preview':
        handlePreview();
        break;
      case 'theme':
        setShowDesignSystem(true);
        break;
      case 'settings':
        // Open page settings
        console.log('Settings command');
        break;
      default:
        console.log('Unknown command:', commandId);
    }
  };

  // Property panel handlers
  const handleOpenSectionSettings = (sectionId: string) => {
    const section = templateSections.find((s: any) => s.id === sectionId);
    if (section) {
      setSelectedSectionForProps(section);
      setShowPropertyPanel(true);
    }
  };

  const handleUpdateSectionProperties = async (updates: Record<string, any>) => {
    if (!selectedSectionForProps) return;

    const sectionId = selectedSectionForProps.id;
    const updatedSection = { ...selectedSectionForProps, ...updates };

    // Update local state immediately for responsive UI
    setSelectedSectionForProps(updatedSection);
    setTemplateSections((prev: any[]) =>
      prev.map((s: any) => (s.id === sectionId ? updatedSection : s))
    );

    // Persist to database
    try {
      await supabase
        .from('website_sections')
        .update({
          styles: { ...(updatedSection.styles || {}), ...updates },
          updated_at: new Date().toISOString(),
        })
        .eq('id', sectionId);
    } catch (error) {
      console.error('Error updating section properties:', error);
    }
  };

  const handleDeleteSection = async (id: string) => {
    const section = templateSections.find((s: any) => s.id === id);
    if (!section) return;

    await commandBusRef.current.execute({
      type: 'deleteSection',
      payload: { sectionId: id },
      previousState: section,
      apply: async () => {
        await supabase.from('website_sections').delete().eq('id', id);
        setTemplateSections((prev: any[]) => prev.filter((s: any) => s.id !== id));

        // Show success toast with undo action
        showToast.success('Section deleted', {
          action: {
            label: 'Undo',
            onClick: () => {
              commandBusRef.current.undo();
            },
          },
        });
      },
      revert: async () => {
        await supabase.from('website_sections').insert(section);
        if (page?.id) await loadTemplateSections(page.id);
      },
    });
  };

  const handleReorder = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = templateSections.findIndex((s: any) => s.id === active.id);
    const newIndex = templateSections.findIndex((s: any) => s.id === over.id);
    const next = arrayMove(templateSections, oldIndex, newIndex);

    await commandBusRef.current.execute({
      type: 'reorderSections',
      payload: { fromIndex: oldIndex, toIndex: newIndex },
      previousState: templateSections,
      apply: async () => {
        setTemplateSections(next);
        await Promise.all(next.map((s: any, i: number) =>
          supabase.from('website_sections').update({ order_index: i }).eq('id', s.id)
        ));
      },
      revert: async () => {
        setTemplateSections(templateSections);
        await Promise.all(templateSections.map((s: any, i: number) =>
          supabase.from('website_sections').update({ order_index: i }).eq('id', s.id)
        ));
      },
    });
  };

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

      // Show success toast
      showToast.success('Changes saved successfully!');
    } catch (error) {
      console.error('Error saving page:', error);
      // Show error toast with retry option
      showToast.error('Failed to save changes. Please try again.');
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

  // Handle element style changes (with debouncing to avoid excessive DB writes)
  const handleElementStyleChangeDebounced = useDebouncedCallback(async (elementId: string, styles: Record<string, any>) => {
    if (!selectedElement || !pageId) return;

    try {
      // Find the section that contains this element
      const section = templateSections.find(s => s.id === selectedElement.sectionId);
      if (!section) {
        console.error('Section not found for element:', elementId);
        return;
      }

      // Get current element_overrides or initialize empty object
      const currentContent = section.styles?.content || section.styles || {};
      const elementOverrides = currentContent.element_overrides || {};

      // Update the overrides for this specific element
      const updatedOverrides = {
        ...elementOverrides,
        [elementId]: styles,
      };

      // Update the section content with new overrides
      const updatedContent = {
        ...currentContent,
        element_overrides: updatedOverrides,
      };

      // Save to database
      const { error } = await supabase
        .from('website_sections')
        .update({
          styles: {
            ...section.styles,
            content: updatedContent,
          },
        })
        .eq('id', section.id);

      if (error) {
        console.error('Error saving element styles:', error);
        return;
      }

      // Update local state
      setTemplateSections(sections =>
        sections.map(s =>
          s.id === section.id
            ? {
                ...s,
                styles: {
                  ...s.styles,
                  content: updatedContent,
                },
              }
            : s
        )
      );

      console.log('Element styles saved:', elementId, styles);
    } catch (error) {
      console.error('Error in handleElementStyleChange:', error);
    }
  }, 500); // 500ms debounce delay

  // Visual selection indicator - apply outline to selected element
  useEffect(() => {
    // Remove previous selection indicators
    const previouslySelected = document.querySelectorAll('[data-element-selected="true"]');
    previouslySelected.forEach((el) => {
      el.removeAttribute('data-element-selected');
      (el as HTMLElement).style.outline = '';
      (el as HTMLElement).style.outlineOffset = '';
    });

    // Add selection indicator to current element
    if (selectedElement) {
      const element = document.querySelector(`[data-element-id="${selectedElement.elementId}"]`);
      if (element) {
        (element as HTMLElement).setAttribute('data-element-selected', 'true');
        (element as HTMLElement).style.outline = '2px solid #3B82F6';
        (element as HTMLElement).style.outlineOffset = '2px';
      }
    }
  }, [selectedElement]);

  // Global click handler for element selection
  useEffect(() => {
    const handleGlobalClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      // Find the closest selectable element
      const selectableElement = target.closest('[data-selectable="true"]');

      if (selectableElement && isTemplatePage && !templateEditMode) {
        // Prevent default behavior for selectable elements in view mode (when edit mode is OFF)
        event.stopPropagation();

        const elementId = selectableElement.getAttribute('data-element-id');
        const elementType = selectableElement.getAttribute('data-element-type');
        const sectionId = selectableElement.getAttribute('data-section-id');
        const parentId = selectableElement.getAttribute('data-parent-element-id');

        if (elementId && elementType && sectionId) {
          // Build parent chain for breadcrumb
          const parentIds: string[] = [];
          if (parentId) {
            parentIds.push(parentId);
          }

          // Check if element is already in editing mode
          if (selectedElement?.elementId === elementId && selectedElement.isEditing) {
            // Already editing, don't change state
            return;
          }

          // Select the element (not editing yet)
          selectElement({
            elementId,
            elementType: elementType as any,
            sectionId,
            parentIds,
            isEditing: false,
          });
        }
      }
    };

    document.addEventListener('click', handleGlobalClick, true);
    return () => {
      document.removeEventListener('click', handleGlobalClick, true);
    };
  }, [selectElement, selectedElement, isTemplatePage, templateEditMode]);

  // Keyboard shortcuts - defined after all handler functions
  useKeyboardShortcuts({
    onSave: handleSave,
    onUndo: () => {
      if (isTemplatePage) {
        commandBusRef.current.undo();
      } else {
        undo();
      }
    },
    onRedo: () => {
      if (isTemplatePage) {
        commandBusRef.current.redo();
      } else {
        redo();
      }
    },
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
      // Clear element selection first, then block selection
      if (selectedElement) {
        clearSelection();
      } else {
        selectBlock(null);
      }
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

  // V2.0: Template Mode takes priority - if page has template sections, use inline editor
  if (isTemplatePage && templateSections.length > 0) {
    console.log('🎨 Rendering Template Mode for', templateSections.length, 'sections');
    // Template Mode will be rendered below in the main return statement
    // Don't return CanvasMode for template pages
  } else if (canvasModeEnabled) {
    // V2.0: If Canvas Mode is enabled and NOT a template page, render it
    console.log('🎨 Rendering Canvas Mode');
    return <CanvasMode pageId={pageId} />;
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
              onClick={() => {
                // Auto-disable Edit Mode when opening Design System to enable element selection
                if (!showDesignSystem && templateEditMode && isTemplatePage) {
                  setTemplateEditMode(false);
                }
                setShowDesignSystem(!showDesignSystem);
              }}
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
        {isTemplatePage ? (
          // Template Mode - Inline editing with sections
          <div className="flex flex-col h-full">
            <Toolbar
              editMode={templateEditMode}
              onToggleEditMode={() => setTemplateEditMode(!templateEditMode)}
              canUndo={commandBusRef.current.canUndo()}
              canRedo={commandBusRef.current.canRedo()}
              onUndo={() => commandBusRef.current.undo()}
              onRedo={() => commandBusRef.current.redo()}
              saving={saving}
              onAddSection={() => setShowSectionMarketplace(true)}
            />
            <div className="flex-1 overflow-y-auto bg-slate-950">
              {templateSections.length === 0 ? (
                // Empty state for new pages
                <div className="flex items-center justify-center h-full">
                  <div className="text-center max-w-md px-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3">Start Building Your Page</h3>
                    <p className="text-slate-400 mb-8">
                      Add your first section to begin creating your page. Choose from hero sections, content blocks, galleries, and more.
                    </p>
                    <button
                      onClick={() => setShowSectionMarketplace(true)}
                      className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all"
                    >
                      Add Your First Section
                    </button>
                  </div>
                </div>
              ) : (
                <DndContext
                  collisionDetection={closestCenter}
                  onDragEnd={handleReorder}
                >
                  <SortableContext
                    items={templateSections.map((s: any) => s.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {templateSections.map((section: any) => (
                      <SortableSectionWrapper key={section.id} id={section.id}>
                        {({ dragHandleProps }) => (
                          <div>
                            <SectionRenderer
                              sections={[section]}
                              editMode={templateEditMode}
                              onUpdateSection={handleSectionUpdate}
                              onDeleteSection={handleDeleteSection}
                              onSettingsClick={handleOpenSectionSettings}
                              dragHandleProps={dragHandleProps}
                            />
                          </div>
                        )}
                      </SortableSectionWrapper>
                    ))}
                  </SortableContext>
                </DndContext>
              )}
            </div>
            {showSectionMenu && page && (
              <SectionMenu
                onClose={() => setShowSectionMenu(false)}
                onSelect={handleAddSection}
                pageId={page.id}
              />
            )}

            {/* Section Marketplace - Visual section selector */}
            <SectionMarketplace
              isOpen={showSectionMarketplace}
              onClose={() => setShowSectionMarketplace(false)}
              onSelectSection={handleSelectSectionFromMarketplace}
            />

            {/* Command Palette - Cmd+K power user tool */}
            <CommandPalette
              isOpen={showCommandPalette}
              onClose={() => setShowCommandPalette(false)}
              onExecuteCommand={handleExecuteCommand}
            />

            {/* Property Panel - Right sidebar for section properties */}
            <PropertyPanel
              isOpen={showPropertyPanel}
              onClose={() => {
                setShowPropertyPanel(false);
                setSelectedSectionForProps(null);
              }}
              selectedSection={selectedSectionForProps}
              onUpdateSection={handleUpdateSectionProperties}
            />
          </div>
        ) : websiteMode === 'clone' && cloneHtml ? (
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

      {/* Design System Panel - only show when no element is selected */}
      {!selectedElement && (
        <DesignSystemPanel
          isOpen={showDesignSystem}
          onClose={() => setShowDesignSystem(false)}
          designSystem={designSystem}
          onUpdate={updateDesignSystem}
        />
      )}

      {/* Element Properties Panel - shows when an element is selected */}
      {selectedElement && (
        <ElementPropertiesPanel
          onClose={() => clearSelection()}
          onStyleChange={handleElementStyleChangeDebounced}
        />
      )}

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
              {isTemplatePage && templateSections.length > 0 ? (
                // Template sections preview
                <div className="h-full overflow-auto">
                  <SectionRenderer
                    sections={templateSections}
                    editMode={false}
                    onUpdateSection={() => {}}
                  />
                </div>
              ) : websiteMode === 'clone' && cloneHtml ? (
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
    <ThemeProvider initialThemeId="dark_athletic">
      <WebsiteEditorProvider>
        <SelectedElementProvider>
          <WebsiteBuilderEditorContent />
        </SelectedElementProvider>
      </WebsiteEditorProvider>
    </ThemeProvider>
  );
}
