import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { WebsiteContentBlock, WebsiteSection } from '../lib/supabase';
import { DesignSystem, defaultDesignSystem } from '../components/website-builder/DesignSystemPanel';

interface EditorState {
  selectedBlockId: string | null;
  selectedSectionId: string | null;
  hoveredBlockId: string | null;
  hoveredSectionId: string | null;
  draggedBlockId: string | null;
  viewMode: 'desktop' | 'tablet' | 'mobile';
  showGrid: boolean;
  zoom: number;
}

interface EditorContextType {
  editorState: EditorState;
  blocks: WebsiteContentBlock[];
  sections: WebsiteSection[];
  setBlocks: (blocks: WebsiteContentBlock[]) => void;
  loadBlocks: (blocks: WebsiteContentBlock[]) => void;
  setSections: (sections: WebsiteSection[]) => void;
  loadSections: (sections: WebsiteSection[]) => void;
  selectedBlockId: string | null;
  selectedSectionId: string | null;
  selectBlock: (blockId: string | null) => void;
  selectSection: (sectionId: string | null) => void;
  hoverBlock: (blockId: string | null) => void;
  hoverSection: (sectionId: string | null) => void;
  addBlock: (blockType: string, sectionId?: string, position?: number) => void;
  updateBlock: (blockId: string, updates: Partial<WebsiteContentBlock>) => void;
  deleteBlock: (blockId: string) => void;
  moveBlock: (blockId: string, newPosition: number) => void;
  duplicateBlock: (blockId: string) => void;
  addSection: (sectionType?: 'header' | 'content' | 'footer', position?: number) => void;
  updateSection: (sectionId: string, updates: Partial<WebsiteSection>) => void;
  deleteSection: (sectionId: string) => void;
  moveSection: (sectionId: string, newPosition: number) => void;
  duplicateSection: (sectionId: string) => void;
  setViewMode: (mode: 'desktop' | 'tablet' | 'mobile') => void;
  toggleGrid: () => void;
  setZoom: (zoom: number) => void;
  undoStack: WebsiteContentBlock[][];
  redoStack: WebsiteContentBlock[][];
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  designSystem: DesignSystem;
  updateDesignSystem: (updates: Partial<DesignSystem>) => void;
  clipboard: WebsiteContentBlock | null;
  copyBlock: (blockId: string) => void;
  cutBlock: (blockId: string) => void;
  pasteBlock: () => void;
}

const WebsiteEditorContext = createContext<EditorContextType | undefined>(undefined);

// Helper function to get default content for block types
function getDefaultContentForBlockType(blockType: string): any {
  switch (blockType) {
    // Text Elements
    case 'heading':
      return { text: 'New Heading' };
    case 'paragraph':
      return { text: 'Paragraph text goes here...' };
    case 'text':
      return { text: 'Enter your text content here...' };
    case 'quote':
      return { text: 'Quote text goes here...', author: '' };

    // Media Elements
    case 'image':
      return { url: '', alt: 'Image description', caption: '' };
    case 'gallery':
      return { images: [], columns: 3, spacing: 'md' };
    case 'video':
      return { url: '', provider: 'youtube', autoplay: false };
    case 'music':
      return { url: '', title: 'Audio Title', artist: '' };

    // Interactive Elements
    case 'button':
      return { text: 'Click Here', url: '#', style: 'primary' };
    case 'cta':
      return { title: 'Ready to Get Started?', buttonText: 'Get Started', buttonUrl: '#' };
    case 'hero':
      return { title: 'Welcome to Our Site', subtitle: 'Your journey starts here', backgroundImage: '' };

    // Layout Elements
    case 'container':
      return { maxWidth: '1200px', padding: 'md' };
    case 'columns':
      return { count: 2, gap: 'md' };
    case 'divider':
      return { style: 'solid', color: '#e5e7eb', thickness: 1 };
    case 'spacer':
      return { height: '3rem' };

    // List Elements
    case 'list':
      return { items: ['Item 1', 'Item 2', 'Item 3'], style: 'disc' };
    case 'numbered-list':
      return { items: ['First item', 'Second item', 'Third item'] };
    case 'checklist':
      return { items: ['Task 1', 'Task 2', 'Task 3'] };

    // Forms & Contact
    case 'contact-form':
      return { fields: ['name', 'email', 'message'], submitText: 'Send Message' };
    case 'subscribe':
      return { title: 'Subscribe to Newsletter', placeholder: 'Enter your email', buttonText: 'Subscribe' };
    case 'input':
      return { placeholder: 'Enter text...', type: 'text' };
    case 'textarea':
      return { placeholder: 'Enter text...', rows: 4 };

    // Social Elements
    case 'social-share':
      return { platforms: ['facebook', 'twitter', 'linkedin'] };
    case 'social-feed':
      return { platform: 'twitter', handle: '', count: 5 };
    case 'social-follow':
      return { platforms: ['facebook', 'twitter', 'instagram'] };

    // Navigation Elements
    case 'navbar':
      return { logoText: 'Logo', links: [{ text: 'Home', url: '#' }, { text: 'About', url: '#' }] };
    case 'menu':
      return { items: ['Home', 'About', 'Services', 'Contact'] };
    case 'breadcrumbs':
      return { items: ['Home', 'Category', 'Current Page'] };

    // Sports (RosterUp) Elements
    case 'team-roster':
      return { teamId: null, layout: 'grid', showPhotos: true };
    case 'schedule':
      return { teamId: null, view: 'list', showPastEvents: false };
    case 'tournament-bracket':
      return { tournamentId: null, showScores: true };
    case 'player-stats':
      return { playerId: null, stats: ['goals', 'assists', 'games'] };
    case 'scoreboard':
      return { homeTeam: 'Home Team', awayTeam: 'Away Team', homeScore: 0, awayScore: 0 };

    // Developer Elements
    case 'code':
      return { code: '// Enter your code here', language: 'javascript' };
    case 'embed':
      return { code: '<div>Embed code here</div>' };
    case 'custom-html':
      return { html: '<div>Custom HTML content</div>' };

    default:
      return {};
  }
}

export function WebsiteEditorProvider({ children }: { children: ReactNode }) {
  const [editorState, setEditorState] = useState<EditorState>({
    selectedBlockId: null,
    selectedSectionId: null,
    hoveredBlockId: null,
    hoveredSectionId: null,
    draggedBlockId: null,
    viewMode: 'desktop',
    showGrid: false,
    zoom: 100,
  });

  const [blocks, setBlocksState] = useState<WebsiteContentBlock[]>([]);
  const [sections, setSectionsState] = useState<WebsiteSection[]>([]);
  const [undoStack, setUndoStack] = useState<WebsiteContentBlock[][]>([]);
  const [redoStack, setRedoStack] = useState<WebsiteContentBlock[][]>([]);
  const [designSystem, setDesignSystem] = useState<DesignSystem>(defaultDesignSystem);
  const [clipboard, setClipboard] = useState<WebsiteContentBlock | null>(null);

  const loadBlocks = useCallback((newBlocks: WebsiteContentBlock[]) => {
    setBlocksState(newBlocks);
    setUndoStack([]);
    setRedoStack([]);
  }, []);

  const setBlocks = useCallback((newBlocks: WebsiteContentBlock[]) => {
    setUndoStack((prev) => [...prev, blocks]);
    setRedoStack([]);
    setBlocksState(newBlocks);
  }, [blocks]);

  const loadSections = useCallback((newSections: WebsiteSection[]) => {
    setSectionsState(newSections);
  }, []);

  const setSections = useCallback((newSections: WebsiteSection[]) => {
    setSectionsState(newSections);
  }, []);

  const selectBlock = useCallback((blockId: string | null) => {
    setEditorState((prev) => ({ ...prev, selectedBlockId: blockId, selectedSectionId: null }));
  }, []);

  const selectSection = useCallback((sectionId: string | null) => {
    setEditorState((prev) => ({ ...prev, selectedSectionId: sectionId, selectedBlockId: null }));
  }, []);

  const hoverBlock = useCallback((blockId: string | null) => {
    setEditorState((prev) => ({ ...prev, hoveredBlockId: blockId }));
  }, []);

  const hoverSection = useCallback((sectionId: string | null) => {
    setEditorState((prev) => ({ ...prev, hoveredSectionId: sectionId }));
  }, []);

  const addBlock = useCallback((blockType: string, sectionId?: string, position?: number) => {
    const newBlock: WebsiteContentBlock = {
      id: `temp-${Date.now()}`,
      page_id: '',
      section_id: sectionId,
      block_type: blockType,
      content: getDefaultContentForBlockType(blockType),
      styles: {},
      visibility: { desktop: true, tablet: true, mobile: true },
      order_index: position ?? blocks.length,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const newBlocks = [...blocks];
    if (position !== undefined) {
      newBlocks.splice(position, 0, newBlock);
      newBlocks.forEach((block, index) => {
        block.order_index = index;
      });
    } else {
      newBlocks.push(newBlock);
    }

    setBlocks(newBlocks);
    selectBlock(newBlock.id);
  }, [blocks, setBlocks, selectBlock]);

  const updateBlock = useCallback((blockId: string, updates: Partial<WebsiteContentBlock>) => {
    const newBlocks = blocks.map((block) =>
      block.id === blockId ? { ...block, ...updates, updated_at: new Date().toISOString() } : block
    );
    setBlocks(newBlocks);
  }, [blocks, setBlocks]);

  const deleteBlock = useCallback((blockId: string) => {
    const newBlocks = blocks.filter((block) => block.id !== blockId);
    newBlocks.forEach((block, index) => {
      block.order_index = index;
    });
    setBlocks(newBlocks);
    if (editorState.selectedBlockId === blockId) {
      selectBlock(null);
    }
  }, [blocks, setBlocks, editorState.selectedBlockId, selectBlock]);

  const moveBlock = useCallback((blockId: string, newPosition: number) => {
    const blockIndex = blocks.findIndex((b) => b.id === blockId);
    if (blockIndex === -1) return;

    const newBlocks = [...blocks];
    const [movedBlock] = newBlocks.splice(blockIndex, 1);
    newBlocks.splice(newPosition, 0, movedBlock);

    newBlocks.forEach((block, index) => {
      block.order_index = index;
    });

    setBlocks(newBlocks);
  }, [blocks, setBlocks]);

  const duplicateBlock = useCallback((blockId: string) => {
    const blockToDuplicate = blocks.find((b) => b.id === blockId);
    if (!blockToDuplicate) return;

    const newBlock: WebsiteContentBlock = {
      ...blockToDuplicate,
      id: `temp-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const blockIndex = blocks.findIndex((b) => b.id === blockId);
    const newBlocks = [...blocks];
    newBlocks.splice(blockIndex + 1, 0, newBlock);

    newBlocks.forEach((block, index) => {
      block.order_index = index;
    });

    setBlocks(newBlocks);
    selectBlock(newBlock.id);
  }, [blocks, setBlocks, selectBlock]);

  // Section management functions
  const addSection = useCallback((sectionType: 'header' | 'content' | 'footer' = 'content', position?: number) => {
    const newSection: WebsiteSection = {
      id: `temp-section-${Date.now()}`,
      page_id: '',
      name: `${sectionType.charAt(0).toUpperCase() + sectionType.slice(1)} Section`,
      section_type: sectionType,
      background_color: undefined,
      background_image: undefined,
      padding_top: '3rem',
      padding_bottom: '3rem',
      padding_left: '1rem',
      padding_right: '1rem',
      max_width: '1200px',
      full_width: false,
      order_index: position ?? sections.length,
      styles: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const newSections = [...sections];
    if (position !== undefined) {
      newSections.splice(position, 0, newSection);
      newSections.forEach((section, index) => {
        section.order_index = index;
      });
    } else {
      newSections.push(newSection);
    }

    setSections(newSections);
    selectSection(newSection.id);
  }, [sections, setSections, selectSection]);

  const updateSection = useCallback((sectionId: string, updates: Partial<WebsiteSection>) => {
    const newSections = sections.map((section) =>
      section.id === sectionId ? { ...section, ...updates, updated_at: new Date().toISOString() } : section
    );
    setSections(newSections);
  }, [sections, setSections]);

  const deleteSection = useCallback((sectionId: string) => {
    // Delete all blocks in this section first
    const blocksToDelete = blocks.filter((block) => block.section_id === sectionId);
    blocksToDelete.forEach((block) => deleteBlock(block.id));

    // Delete the section
    const newSections = sections.filter((section) => section.id !== sectionId);
    newSections.forEach((section, index) => {
      section.order_index = index;
    });
    setSections(newSections);
    if (editorState.selectedSectionId === sectionId) {
      selectSection(null);
    }
  }, [sections, blocks, setSections, deleteBlock, editorState.selectedSectionId, selectSection]);

  const moveSection = useCallback((sectionId: string, newPosition: number) => {
    const sectionIndex = sections.findIndex((s) => s.id === sectionId);
    if (sectionIndex === -1) return;

    const newSections = [...sections];
    const [movedSection] = newSections.splice(sectionIndex, 1);
    newSections.splice(newPosition, 0, movedSection);

    newSections.forEach((section, index) => {
      section.order_index = index;
    });

    setSections(newSections);
  }, [sections, setSections]);

  const duplicateSection = useCallback((sectionId: string) => {
    const sectionToDuplicate = sections.find((s) => s.id === sectionId);
    if (!sectionToDuplicate) return;

    const newSection: WebsiteSection = {
      ...sectionToDuplicate,
      id: `temp-section-${Date.now()}`,
      name: `${sectionToDuplicate.name} (Copy)`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const sectionIndex = sections.findIndex((s) => s.id === sectionId);
    const newSections = [...sections];
    newSections.splice(sectionIndex + 1, 0, newSection);

    newSections.forEach((section, index) => {
      section.order_index = index;
    });

    // Also duplicate all blocks in this section
    const blocksInSection = blocks.filter((b) => b.section_id === sectionId);
    const newBlocks = [...blocks];
    blocksInSection.forEach((block) => {
      const duplicatedBlock: WebsiteContentBlock = {
        ...block,
        id: `temp-${Date.now()}-${Math.random()}`,
        section_id: newSection.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      newBlocks.push(duplicatedBlock);
    });

    setSections(newSections);
    setBlocks(newBlocks);
    selectSection(newSection.id);
  }, [sections, blocks, setSections, setBlocks, selectSection]);

  const setViewMode = useCallback((mode: 'desktop' | 'tablet' | 'mobile') => {
    setEditorState((prev) => ({ ...prev, viewMode: mode }));
  }, []);

  const toggleGrid = useCallback(() => {
    setEditorState((prev) => ({ ...prev, showGrid: !prev.showGrid }));
  }, []);

  const setZoom = useCallback((zoom: number) => {
    setEditorState((prev) => ({ ...prev, zoom }));
  }, []);

  const undo = useCallback(() => {
    if (undoStack.length === 0) return;

    const previousBlocks = undoStack[undoStack.length - 1];
    setRedoStack((prev) => [...prev, blocks]);
    setUndoStack((prev) => prev.slice(0, -1));
    setBlocksState(previousBlocks);
  }, [undoStack, blocks]);

  const redo = useCallback(() => {
    if (redoStack.length === 0) return;

    const nextBlocks = redoStack[redoStack.length - 1];
    setUndoStack((prev) => [...prev, blocks]);
    setRedoStack((prev) => prev.slice(0, -1));
    setBlocksState(nextBlocks);
  }, [redoStack, blocks]);

  const updateDesignSystem = useCallback((updates: Partial<DesignSystem>) => {
    setDesignSystem((prev) => ({ ...prev, ...updates }));
  }, []);

  const copyBlock = useCallback((blockId: string) => {
    const blockToCopy = blocks.find((b) => b.id === blockId);
    if (blockToCopy) {
      setClipboard({ ...blockToCopy });
    }
  }, [blocks]);

  const cutBlock = useCallback((blockId: string) => {
    const blockToCut = blocks.find((b) => b.id === blockId);
    if (blockToCut) {
      setClipboard({ ...blockToCut });
      deleteBlock(blockId);
    }
  }, [blocks, deleteBlock]);

  const pasteBlock = useCallback(() => {
    if (!clipboard) return;

    const newBlock: WebsiteContentBlock = {
      ...clipboard,
      id: `temp-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Paste after the currently selected block, or at the end
    let position = blocks.length;
    if (editorState.selectedBlockId) {
      const selectedIndex = blocks.findIndex((b) => b.id === editorState.selectedBlockId);
      if (selectedIndex !== -1) {
        position = selectedIndex + 1;
      }
    }

    addBlock(newBlock.block_type, newBlock.section_id, position);
    // Update the new block with the copied content and styles
    setTimeout(() => {
      const insertedBlock = blocks[position];
      if (insertedBlock) {
        updateBlock(insertedBlock.id, {
          content: newBlock.content,
          styles: newBlock.styles,
          visibility: newBlock.visibility,
        });
      }
    }, 10);
  }, [clipboard, blocks, editorState.selectedBlockId, addBlock, updateBlock]);

  const value = {
    editorState,
    blocks,
    sections,
    setBlocks,
    loadBlocks,
    setSections,
    loadSections,
    selectedBlockId: editorState.selectedBlockId,
    selectedSectionId: editorState.selectedSectionId,
    selectBlock,
    selectSection,
    hoverBlock,
    hoverSection,
    addBlock,
    updateBlock,
    deleteBlock,
    moveBlock,
    duplicateBlock,
    addSection,
    updateSection,
    deleteSection,
    moveSection,
    duplicateSection,
    setViewMode,
    toggleGrid,
    setZoom,
    undoStack,
    redoStack,
    undo,
    redo,
    canUndo: undoStack.length > 0,
    canRedo: redoStack.length > 0,
    designSystem,
    updateDesignSystem,
    clipboard,
    copyBlock,
    cutBlock,
    pasteBlock,
  };

  return (
    <WebsiteEditorContext.Provider value={value}>
      {children}
    </WebsiteEditorContext.Provider>
  );
}

export function useWebsiteEditor() {
  const context = useContext(WebsiteEditorContext);
  if (context === undefined) {
    throw new Error('useWebsiteEditor must be used within a WebsiteEditorProvider');
  }
  return context;
}

function getDefaultContent(blockType: string): any {
  switch (blockType) {
    case 'hero':
      return {
        title: 'Welcome to Our Organization',
        subtitle: 'Building champions on and off the field',
        backgroundImage: '',
        overlayOpacity: 0.5,
        ctaText: 'Learn More',
        ctaLink: '#',
      };
    case 'text':
      return {
        html: '<p>Enter your text here...</p>',
      };
    case 'image':
      return {
        src: '',
        alt: '',
        caption: '',
        layout: 'single',
      };
    case 'team_roster':
      return {
        teamId: null,
        layout: 'grid',
        showPhotos: true,
        showStats: true,
      };
    case 'schedule':
      return {
        teamId: null,
        view: 'list',
        showPastEvents: false,
        maxEvents: 10,
      };
    case 'tournaments':
      return {
        filter: 'all',
        layout: 'cards',
        showFilter: true,
      };
    case 'contact':
      return {
        formId: null,
        showMap: true,
        address: '',
        email: '',
        phone: '',
      };
    case 'gallery':
      return {
        images: [],
        columns: 3,
        spacing: 'md',
        lightbox: true,
      };
    case 'stats':
      return {
        stats: [
          { label: 'Teams', value: '0', icon: 'users' },
          { label: 'Players', value: '0', icon: 'user' },
          { label: 'Championships', value: '0', icon: 'trophy' },
        ],
        layout: 'horizontal',
      };
    case 'video':
      return {
        url: '',
        provider: 'youtube',
        autoplay: false,
      };
    case 'testimonials':
      return {
        testimonials: [],
        layout: 'carousel',
        autoplay: true,
      };
    case 'sponsors':
      return {
        logos: [],
        columns: 4,
        grayscale: false,
      };
    case 'map':
      return {
        address: '',
        lat: null,
        lng: null,
        zoom: 15,
      };
    default:
      return {};
  }
}
