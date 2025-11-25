import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

export interface SelectedElement {
  elementId: string;
  elementType: 'text' | 'heading' | 'image' | 'button' | 'card' | 'container' | 'link' | 'section';
  sectionId: string;
  parentIds: string[];
  isEditing: boolean;
}

interface SelectedElementContextType {
  selectedElement: SelectedElement | null;
  selectElement: (element: SelectedElement) => void;
  clearSelection: () => void;
  setEditingMode: (isEditing: boolean) => void;
  getElementRef: (elementId: string) => HTMLElement | null;
  setElementRef: (elementId: string, element: HTMLElement | null) => void;
}

const SelectedElementContext = createContext<SelectedElementContextType | undefined>(undefined);

export function SelectedElementProvider({ children }: { children: React.ReactNode }) {
  const [selectedElement, setSelectedElement] = useState<SelectedElement | null>(null);

  // Use WeakMap to store DOM refs without causing re-renders
  const elementRefsMap = useRef<WeakMap<HTMLElement, string>>(new WeakMap());
  const elementIdToRefMap = useRef<Map<string, WeakRef<HTMLElement>>>(new Map());

  const selectElement = useCallback((element: SelectedElement) => {
    setSelectedElement(element);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedElement(null);
  }, []);

  const setEditingMode = useCallback((isEditing: boolean) => {
    setSelectedElement(prev => {
      if (!prev) return null;
      return { ...prev, isEditing };
    });
  }, []);

  const getElementRef = useCallback((elementId: string): HTMLElement | null => {
    const weakRef = elementIdToRefMap.current.get(elementId);
    if (!weakRef) return null;
    const element = weakRef.deref();
    return element || null;
  }, []);

  const setElementRef = useCallback((elementId: string, element: HTMLElement | null) => {
    if (element) {
      elementIdToRefMap.current.set(elementId, new WeakRef(element));
      elementRefsMap.current.set(element, elementId);
    } else {
      elementIdToRefMap.current.delete(elementId);
    }
  }, []);

  return (
    <SelectedElementContext.Provider
      value={{
        selectedElement,
        selectElement,
        clearSelection,
        setEditingMode,
        getElementRef,
        setElementRef,
      }}
    >
      {children}
    </SelectedElementContext.Provider>
  );
}

export function useSelectedElement() {
  const context = useContext(SelectedElementContext);
  if (context === undefined) {
    throw new Error('useSelectedElement must be used within a SelectedElementProvider');
  }
  return context;
}
