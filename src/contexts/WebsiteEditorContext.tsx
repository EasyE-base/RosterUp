import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { WebsiteContentBlock } from '../lib/supabase';

interface EditorState {
  selectedBlockId: string | null;
  hoveredBlockId: string | null;
  draggedBlockId: string | null;
  viewMode: 'desktop' | 'tablet' | 'mobile';
  showGrid: boolean;
  zoom: number;
}

interface EditorContextType {
  editorState: EditorState;
  blocks: WebsiteContentBlock[];
  setBlocks: (blocks: WebsiteContentBlock[]) => void;
  loadBlocks: (blocks: WebsiteContentBlock[]) => void;
  selectBlock: (blockId: string | null) => void;
  hoverBlock: (blockId: string | null) => void;
  addBlock: (blockType: string, position?: number) => void;
  updateBlock: (blockId: string, updates: Partial<WebsiteContentBlock>) => void;
  deleteBlock: (blockId: string) => void;
  moveBlock: (blockId: string, newPosition: number) => void;
  duplicateBlock: (blockId: string) => void;
  setViewMode: (mode: 'desktop' | 'tablet' | 'mobile') => void;
  toggleGrid: () => void;
  setZoom: (zoom: number) => void;
  undoStack: WebsiteContentBlock[][];
  redoStack: WebsiteContentBlock[][];
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const WebsiteEditorContext = createContext<EditorContextType | undefined>(undefined);

// Helper function to get default content for block types
function getDefaultContentForBlockType(blockType: string): any {
  switch (blockType) {
    case 'heading':
      return { text: 'New Heading' };
    case 'text':
      return { text: 'Enter your text content here...' };
    case 'hero':
      return {
        title: 'Welcome to Our Site',
        subtitle: 'Your journey starts here'
      };
    case 'cta':
      return {
        title: 'Ready to Get Started?',
        buttonText: 'Get Started',
        buttonUrl: '#'
      };
    case 'image':
      return {
        url: '',
        alt: 'Image description',
        caption: ''
      };
    case 'list':
      return {
        items: ['Item 1', 'Item 2', 'Item 3']
      };
    case 'code':
      return {
        code: '// Enter your code here',
        language: 'javascript'
      };
    default:
      return {};
  }
}

export function WebsiteEditorProvider({ children }: { children: ReactNode }) {
  const [editorState, setEditorState] = useState<EditorState>({
    selectedBlockId: null,
    hoveredBlockId: null,
    draggedBlockId: null,
    viewMode: 'desktop',
    showGrid: false,
    zoom: 100,
  });

  const [blocks, setBlocksState] = useState<WebsiteContentBlock[]>([]);
  const [undoStack, setUndoStack] = useState<WebsiteContentBlock[][]>([]);
  const [redoStack, setRedoStack] = useState<WebsiteContentBlock[][]>([]);

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

  const selectBlock = useCallback((blockId: string | null) => {
    setEditorState((prev) => ({ ...prev, selectedBlockId: blockId }));
  }, []);

  const hoverBlock = useCallback((blockId: string | null) => {
    setEditorState((prev) => ({ ...prev, hoveredBlockId: blockId }));
  }, []);

  const addBlock = useCallback((blockType: string, position?: number) => {
    const newBlock: WebsiteContentBlock = {
      id: `temp-${Date.now()}`,
      page_id: '',
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

  const value = {
    editorState,
    blocks,
    setBlocks,
    loadBlocks,
    selectBlock,
    hoverBlock,
    addBlock,
    updateBlock,
    deleteBlock,
    moveBlock,
    duplicateBlock,
    setViewMode,
    toggleGrid,
    setZoom,
    undoStack,
    redoStack,
    undo,
    redo,
    canUndo: undoStack.length > 0,
    canRedo: redoStack.length > 0,
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
