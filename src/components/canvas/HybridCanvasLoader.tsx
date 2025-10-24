/**
 * Hybrid Canvas Loader
 * Bridges Supabase data layer with iframe rendering system
 * V2.0: Loads cloned HTML, sanitizes, injects thryveIds, and hydrates state
 */

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { sanitizeClonedHTML } from '@/lib/sanitizeClonedHTML';
import { generateThryveId } from '@/lib/thryveId';
import { registry } from '@/lib/selectorRegistry';
import type { CanvasElement } from '@/lib/types';

interface HybridCanvasLoaderProps {
  pageId: string;
  onLoad: (html: string, elements: Map<string, CanvasElement>) => void;
  onError: (error: string) => void;
}

interface LoadResult {
  html: string;
  headHTML: string;
  bodyHTML: string;
  elements: Map<string, CanvasElement>;
  duration: number;
}

/**
 * HybridCanvasLoader Component
 * Fetches clone_html from Supabase, sanitizes, injects stable IDs, and hydrates state
 */
export function HybridCanvasLoader({ pageId, onLoad, onError }: HybridCanvasLoaderProps) {
  const [isLoading, setIsLoading] = useState(true);
  const blobUrlRef = useRef<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // Create abort controller for cleanup
    abortControllerRef.current = new AbortController();

    loadClonedHTML(pageId, abortControllerRef.current.signal)
      .then((result) => {
        if (abortControllerRef.current?.signal.aborted) return;

        onLoad(result.html, result.elements);
        setIsLoading(false);

        // Log telemetry
        console.log(`📊 HybridCanvasLoader: ${result.duration.toFixed(2)}ms`, {
          elementCount: result.elements.size,
          exceeded: result.duration > 100,
        });

        if (result.duration > 100) {
          console.warn(`⚠️ HybridCanvasLoader: ${result.duration.toFixed(2)}ms > 100ms budget`);
        }
      })
      .catch((error) => {
        if (abortControllerRef.current?.signal.aborted) return;

        console.error('❌ HybridCanvasLoader failed:', error);
        onError(error.message);
        setIsLoading(false);
      });

    // Cleanup on unmount
    return () => {
      abortControllerRef.current?.abort();

      // Revoke blob URL to avoid memory leaks
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    };
  }, [pageId, onLoad, onError]);

  // This is a non-rendering loader component
  return null;
}

/**
 * Load cloned HTML from Supabase and process it
 */
async function loadClonedHTML(pageId: string, signal: AbortSignal): Promise<LoadResult> {
  performance.mark('hybrid-load-start');

  // Step 1: Fetch clone_html from Supabase
  const { data, error } = await supabase
    .from('website_pages')
    .select('clone_html')
    .eq('id', pageId)
    .single();

  if (signal.aborted) throw new Error('Aborted');

  if (error || !data?.clone_html) {
    throw new Error(`Failed to fetch clone_html: ${error?.message || 'No HTML found'}`);
  }

  const rawHTML = data.clone_html;

  // Step 2: Sanitize HTML
  const { headHTML, bodyHTML } = sanitizeClonedHTML(rawHTML);

  // Step 3: Inject stable thryveIds
  const { processedHTML, elements } = injectThryveIds(headHTML, bodyHTML, pageId);

  // Step 4: Save element mappings to Supabase (background, non-blocking)
  saveElementMappings(pageId, elements).catch((err) => {
    console.warn('⚠️ Failed to save element mappings:', err);
  });

  // Performance measurement
  performance.mark('hybrid-load-end');
  performance.measure('hybrid-load', 'hybrid-load-start', 'hybrid-load-end');

  const measure = performance.getEntriesByName('hybrid-load')[0];
  const duration = measure?.duration || 0;

  performance.clearMarks('hybrid-load-start');
  performance.clearMarks('hybrid-load-end');
  performance.clearMeasures('hybrid-load');

  return {
    html: processedHTML,
    headHTML,
    bodyHTML,
    elements,
    duration,
  };
}

/**
 * Inject stable thryveIds into HTML elements
 * Returns processed HTML and element map for state hydration
 */
function injectThryveIds(
  headHTML: string,
  bodyHTML: string,
  pageId: string
): { processedHTML: string; elements: Map<string, CanvasElement> } {
  // Parse body HTML into DOM
  const parser = new DOMParser();
  const doc = parser.parseFromString(bodyHTML, 'text/html');

  const elements = new Map<string, CanvasElement>();

  // Traverse all elements and inject thryveIds
  const allElements = doc.body.querySelectorAll('*');

  allElements.forEach((element) => {
    // Skip script tags and already-processed elements
    if (element.tagName === 'SCRIPT' || element.hasAttribute('data-thryve-id')) {
      return;
    }

    // Generate stable thryveId
    const thryveId = generateThryveId(element, pageId);
    element.setAttribute('data-thryve-id', thryveId);

    // Register in selector registry (element ref will be updated after iframe load)
    registry.addThryve(thryveId, element);

    // Create lightweight CanvasElement for state hydration
    // (Full unlock will happen via mutationEngine.unlockFlowElement)
    const canvasElement: CanvasElement = {
      id: `flow-${thryveId}`,
      thryveId,
      type: getElementType(element),
      mode: 'flow', // Flow elements stay in layout until unlocked
      content: getElementContent(element),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    elements.set(thryveId, canvasElement);
  });

  // Reconstruct HTML
  const processedBodyHTML = doc.body.innerHTML;
  const processedHTML = `
<!DOCTYPE html>
<html>
  <head>
    ${headHTML}
  </head>
  <body>
    ${processedBodyHTML}
  </body>
</html>
  `.trim();

  console.log(`✅ Injected ${elements.size} thryveIds`);

  return { processedHTML, elements };
}

/**
 * Determine element type from DOM element
 */
function getElementType(element: Element): CanvasElement['type'] {
  const tagName = element.tagName.toLowerCase();

  if (tagName === 'img') return 'image';
  if (tagName === 'video') return 'video';
  if (tagName === 'a' || tagName === 'button') return 'button';
  if (tagName === 'p' || tagName === 'h1' || tagName === 'h2' || tagName === 'h3' || tagName === 'h4' || tagName === 'h5' || tagName === 'h6' || tagName === 'span') return 'text';
  if (tagName === 'section' || tagName === 'div') return 'section';

  return 'custom';
}

/**
 * Extract content from DOM element
 */
function getElementContent(element: Element): CanvasElement['content'] {
  const tagName = element.tagName.toLowerCase();
  const content: CanvasElement['content'] = {};

  if (tagName === 'img') {
    content.src = element.getAttribute('src') || '';
    content.alt = element.getAttribute('alt') || '';
  } else if (tagName === 'video') {
    content.src = element.getAttribute('src') || '';
  } else if (tagName === 'a' || tagName === 'button') {
    content.text = element.textContent || '';
    content.href = element.getAttribute('href') || '#';
  } else if (tagName === 'p' || tagName.startsWith('h') || tagName === 'span') {
    content.text = element.textContent || '';
  } else {
    content.html = element.innerHTML;
  }

  return content;
}

/**
 * Save element mappings to Supabase (for persistence and collaboration)
 * Non-blocking operation
 */
async function saveElementMappings(pageId: string, elements: Map<string, CanvasElement>): Promise<void> {
  // Convert elements Map to array of mappings
  const mappings = Array.from(elements.values()).map((elem) => ({
    page_id: pageId,
    thryve_id: elem.thryveId!,
    element_type: elem.type,
    selector: `[data-thryve-id="${elem.thryveId}"]`,
    content: elem.content,
    created_at: new Date().toISOString(),
  }));

  // Upsert to element_mappings table
  const { error } = await supabase
    .from('element_mappings')
    .upsert(mappings, {
      onConflict: 'page_id,thryve_id',
    });

  if (error) {
    throw new Error(`Failed to save element mappings: ${error.message}`);
  }

  console.log(`✅ Saved ${mappings.length} element mappings to Supabase`);
}
