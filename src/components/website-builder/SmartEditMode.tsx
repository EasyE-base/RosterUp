import { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { Sparkles, Eye, Upload, Loader2, Wand2, Lightbulb, Undo2, Redo2, Layers, Palette } from 'lucide-react';
import { useElementSelector } from '../../hooks/useElementSelector';
import AIEditPanel from './AIEditPanel';
import AIContentGenerator from './AIContentGenerator';
import DesignSuggestionsPanel from './DesignSuggestionsPanel';
import LayersPanel from './LayersPanel';
import BreakpointControls from './BreakpointControls';
import DesignTokensPanel from './DesignTokensPanel';
import { supabase } from '../../lib/supabase';
import { DOMManipulator } from '../../lib/domManipulator';
import { LiveIframeManager } from '../../lib/liveIframeManager';
import { HistoryManager, createDOMCommand } from '../../lib/historyManager';
import { ComponentDetector, DetectedComponent } from '../../lib/componentDetector';
import { ResponsiveStyleManager, Breakpoint } from '../../lib/responsiveStyleManager';
import { DesignSystemAnalyzer, DesignTokens } from '../../lib/designSystemAnalyzer';
import hotkeys from 'hotkeys-js';

// Utility function to sanitize HTML by removing remote scripts and problematic elements
// Preserves head stylesheets but removes scripts
function sanitizeClonedHTML(html: string): { headHTML: string; bodyHTML: string } {
  // Count ALL Gattuso images in input
  const allInputGattusMatches = html.match(/img[^>]*alt=["']Gattuso Web["'][^>]*>/gi);
  if (allInputGattusMatches) {
    console.log(`🔍 Found ${allInputGattusMatches.length} Gattuso images in INPUT HTML`);
    allInputGattusMatches.forEach((match, index) => {
      const srcMatch = match.match(/src=["']([^"']{0,150})/i);
      const dataSrcMatch = match.match(/data-src=["']([^"']{0,150})/i);

      // Check if data-src is a placeholder
      const dataSrcIsPlaceholder = dataSrcMatch && dataSrcMatch[1].startsWith('data:image/svg+xml');

      console.log(`  Input Gattuso #${index + 1}:`);
      console.log(`    src: ${srcMatch ? srcMatch[1] : 'none'}`);
      console.log(`    data-src: ${dataSrcMatch ? (dataSrcIsPlaceholder ? '[PLACEHOLDER SVG!]' : dataSrcMatch[1]) : 'none'}`);
    });
  }

  let headHTML = '';
  let bodyHTML = '';

  // Extract head and body content separately
  const headMatch = html.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);

  if (headMatch) {
    console.log(`📦 Extracting head content (${headMatch[1].length} chars)`);
    headHTML = headMatch[1];
  }

  if (bodyMatch) {
    console.log(`📦 Extracting body content (${bodyMatch[1].length} chars)`);
    bodyHTML = bodyMatch[1];
  } else {
    // No body tag found, use entire HTML as body
    bodyHTML = html;
  }

  // Sanitize HEAD: Remove all scripts but keep stylesheets
  headHTML = headHTML.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, () => {
    return ''; // Remove all scripts from head
  });

  // Remove meta tags that might interfere
  headHTML = headHTML.replace(/<meta[^>]*>/gi, '');

  // Sanitize BODY: Remove external script tags
  bodyHTML = bodyHTML.replace(/<script[^>]*\ssrc=["']([^"']+)["'][^>]*>[\s\S]*?<\/script>/gi, (match, src) => {
    // Allow jQuery, bb-plugin, bb-theme, and bootstrap scripts - these are essential for layout
    if (src && (src.includes('jquery') || src.includes('bb-plugin') || src.includes('bb-theme') || src.includes('bootstrap'))) {
      console.log(`✅ Keeping layout script: ${src.substring(0, 80)}...`);
      return match;
    }

    if (src && (
      src.includes('wp-admin') ||
      src.includes('wp-includes') ||
      src.includes('cloudflare') ||
      src.includes('googleapis.com') ||
      src.includes('gstatic.com') ||
      src.includes('youtube.com') ||
      src.includes('newjerseygators.com') ||
      src.startsWith('http://') ||
      src.startsWith('https://') ||
      src.startsWith('//')
    )) {
      console.log(`🧹 Removing external script: ${src.substring(0, 80)}...`);
      return ''; // Remove the entire script tag
    }
    return match; // Keep the script tag
  });

  // Remove noscript tags from body
  bodyHTML = bodyHTML.replace(/<noscript[\s\S]*?<\/noscript>/gi, () => {
    return '';
  });

  // Fix lazy-loaded images: convert data-src to src OR reconstruct from alt/title
  // Many WordPress sites use lazy loading plugins that put the real image URL in data-src
  // and a placeholder in src. We need to swap these for immediate loading.
  console.log('🔍 Starting image sanitization...');
  let imageCount = 0;
  let placeholderCount = 0;
  let smushStylesRemoved = 0;
  bodyHTML = bodyHTML.replace(/<img([^>]*?)\/?>/gi, (match, attrs) => {
    imageCount++;

    // CRITICAL: Fix lazyload Supabase images FIRST, before ANY processing
    // This ensures AI-replaced images (which may be in data-src) are normalized and displayed
    let srcMatch = attrs.match(/src="([^"]*)"/i);
    let dataSrcMatch = attrs.match(/data-src="([^"]*)"/i);

    const srcVal = srcMatch ? srcMatch[1] : "";
    const dataSrcVal = dataSrcMatch ? dataSrcMatch[1] : "";

    const hasSupabase =
      srcVal.toLowerCase().includes("supabase.co") ||
      dataSrcVal.toLowerCase().includes("supabase.co");

    if (hasSupabase) {
      const trueSrc = dataSrcVal || srcVal;
      const fixedAttrs = attrs
        .replace(/\sclass="[^"]*\blazyload\b[^"]*"/i, "")
        .replace(/\sdata-src="[^"]*"/i, "")
        .replace(/src="[^"]*"/i, `src="${trueSrc}"`);

      console.log("🛡️ Normalizing Supabase lazyload image → direct src");
      return `<img${fixedAttrs}>`;
    }

    // Remove WP Smush inline styles that contain --smush-placeholder variables
    let cleanedAttrs = attrs;
    if (attrs.includes('--smush-placeholder')) {
      cleanedAttrs = attrs.replace(/style=["']([^"']*)["']/gi, (styleMatch, styleContent) => {
        if (styleContent.includes('--smush-placeholder')) {
          smushStylesRemoved++;
          console.log(`🧹 Removing WP Smush inline style from image #${imageCount}`);
          return ''; // Remove the entire style attribute
        }
        return styleMatch;
      });
    }

    // Re-check attributes after cleaning for placeholder detection and reconstruction
    dataSrcMatch = cleanedAttrs.match(/data-src=["']([^"']+)["']/i);
    const dataSrcsetMatch = cleanedAttrs.match(/data-srcset=["']([^"']+)["']/i);
    srcMatch = cleanedAttrs.match(/src="([^"]*)"/i);

    // Check if src is a placeholder SVG
    const isPlaceholder = srcMatch && srcMatch[1].startsWith('data:image/svg+xml');

    if (isPlaceholder) {
      placeholderCount++;
      const altMatch = cleanedAttrs.match(/alt=["']([^"']+)["']/i);
      console.log(`🖼️ Found placeholder image #${placeholderCount}: ${altMatch ? altMatch[1] : 'no alt'}, hasDataSrc: ${!!dataSrcMatch}`);
    }

    if (dataSrcMatch) {
      // Check if data-src is a placeholder SVG
      const dataSrcIsPlaceholder = dataSrcMatch[1].startsWith('data:image/svg+xml');

      // IMPORTANT: Skip replacement if data-src contains a placeholder!
      // WP Smush lazy loading sometimes puts placeholders in data-src, not src
      if (dataSrcIsPlaceholder) {
        console.log(`⚠️ Skipping image #${imageCount} - data-src contains placeholder SVG`);
        // Just remove the WP Smush styles and keep the original src
        return `<img${cleanedAttrs}>`;
      }

      let newAttrs = cleanedAttrs;

      // Replace src with data-src value (both are real URLs)
      if (srcMatch) {
        // Replace existing src attribute
        newAttrs = newAttrs.replace(/(?:^|\s)src=["'][^"']*["']/i, ` src="${dataSrcMatch[1]}"`);
      } else {
        // Add src attribute if it doesn't exist
        newAttrs = `src="${dataSrcMatch[1]}" ${newAttrs}`;
      }

      // Replace srcset with data-srcset value if it exists
      if (dataSrcsetMatch) {
        const srcsetMatch = cleanedAttrs.match(/(?:^|\s)srcset=["']([^"']+)["']/i);
        if (srcsetMatch) {
          newAttrs = newAttrs.replace(/(?:^|\s)srcset=["'][^"']*["']/i, ` srcset="${dataSrcsetMatch[1]}"`);
        } else {
          newAttrs = `${newAttrs} srcset="${dataSrcsetMatch[1]}"`;
        }
      }

      // Remove lazyload class to prevent lazy loading script from interfering
      newAttrs = newAttrs.replace(/class=["']([^"']*)lazyload([^"']*)["']/gi, (m, before, after) => {
        const cleaned = `${before}${after}`.trim();
        return cleaned ? `class="${cleaned}"` : '';
      });

      // Remove data-src and data-srcset attributes
      newAttrs = newAttrs.replace(/data-src=["'][^"']*["']/gi, '');
      newAttrs = newAttrs.replace(/data-srcset=["'][^"']*["']/gi, '');

      return `<img${newAttrs}>`;
    } else if (isPlaceholder) {
      // No data-src but has placeholder - try to reconstruct URL from alt/title
      const altMatch = cleanedAttrs.match(/alt=["']([^"']+)["']/i);
      const titleMatch = cleanedAttrs.match(/title=["']([^"']+)["']/i);

      if (altMatch || titleMatch) {
        const imageName = (titleMatch && titleMatch[1]) || (altMatch && altMatch[1]);
        // Convert image name to URL-friendly format
        // E.g., "Brown Website" -> "Brown-Website"
        const urlName = imageName.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '');

        // Try common WordPress upload patterns
        const possibleUrls = [
          `https://newjerseygators.com/wp-content/uploads/2025/04/${urlName}-scaled.jpg`,
          `https://newjerseygators.com/wp-content/uploads/2025/04/${urlName}.jpg`,
          `https://newjerseygators.com/wp-content/uploads/2019/10/${urlName}.jpg`
        ];

        // Use the first possibility (most likely for recent uploads)
        let newAttrs = cleanedAttrs.replace(/src=["'][^"']*["']/i, `src="${possibleUrls[0]}"`);

        console.log(`🖼️ Reconstructed image URL for "${imageName}": ${possibleUrls[0]}`);

        return `<img${newAttrs}>`;
      }
    }

    // Return with cleaned attributes (WP Smush styles removed)
    return `<img${cleanedAttrs}>`;
  });

  console.log(`✅ Image sanitization complete: ${imageCount} images found, ${placeholderCount} placeholders detected, ${smushStylesRemoved} WP Smush styles removed`);

  // Count ALL Gattuso images in output
  const allGattusMatches = bodyHTML.match(/img[^>]*alt=["']Gattuso Web["'][^>]*>/gi);
  if (allGattusMatches) {
    console.log(`🔍 Found ${allGattusMatches.length} Gattuso images in OUTPUT`);
    allGattusMatches.forEach((match, index) => {
      const srcMatch = match.match(/src=["']([^"']{0,100})/i);
      console.log(`  Gattuso #${index + 1} src: ${srcMatch ? srcMatch[1].substring(0, 80) : 'none'}`);
    });
  }

  return { headHTML, bodyHTML };
}

interface SmartEditModeProps {
  html: string;
  css: string;
  js: string;
  websiteId: string;
  onHtmlUpdate: (newHtml: string) => void;
  onExitEditMode: () => void;
}

export default function SmartEditMode({
  html,
  css,
  js,
  websiteId,
  onHtmlUpdate,
  onExitEditMode,
}: SmartEditModeProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const domManipulatorRef = useRef<DOMManipulator | null>(null);
  const iframeManagerRef = useRef<LiveIframeManager | null>(null);
  const historyManagerRef = useRef<HistoryManager>(new HistoryManager());
  const componentDetectorRef = useRef<ComponentDetector | null>(null);
  const responsiveManagerRef = useRef<ResponsiveStyleManager | null>(null);
  const skipNextIframeReloadRef = useRef<boolean>(false);
  const isInternalEditRef = useRef<boolean>(false);
  const htmlLengthRef = useRef<string>(html);
  const [iframeKey, setIframeKey] = useState<number>(0);

  // Memoize sanitized HTML to prevent repeated sanitization on every render
  const sanitizedHtml = useMemo(() => {
    console.log('🔄 Sanitizing HTML (memoized)');
    const { headHTML, bodyHTML } = sanitizeClonedHTML(html);
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <base href="https://newjerseygators.com/">
          <meta http-equiv="Content-Security-Policy" content="img-src * data: blob:;">

          <!-- Load jQuery from CDN FIRST to ensure it's available for all scripts -->
          <script src="https://code.jquery.com/jquery-3.6.0.min.js" integrity="sha256-/xUj+3OJU5yExlq6GSYGSHk7tPXikynS7ogEvDej/m4=" crossorigin="anonymous"></script>

          <!-- Preserved stylesheets from original WordPress site -->
          ${headHTML}

          <style>
            /* Injected CSS from cloned website */
            ${css}

            /* Prevent text selection during editing */
            * {
              user-select: none;
              -webkit-user-select: none;
            }
          </style>
        </head>
        <body>
          ${bodyHTML}
          <script>
            // Disable WP Smush lazy loading - we've already loaded the real images
            window.WP_Smush = null;
            window.smush_lazy_load = null;

            // Injected JavaScript from cloned website (WP Smush scripts will fail gracefully)
            ${js}
          </script>
        </body>
      </html>
    `;
  }, [html, css, js]); // Only recalculate when these change

  // DIAGNOSTIC: Verify Supabase images exist in sanitized HTML
  useEffect(() => {
    if (sanitizedHtml.includes('supabase.co')) {
      console.log('✅ Sanitized HTML contains Supabase URL');
      const imgMatches = sanitizedHtml.match(/<img[^>]*supabase\.co[^>]*>/g);
      if (imgMatches) {
        console.log(`   Found ${imgMatches.length} Supabase image tag(s) in sanitized HTML:`);
        imgMatches.forEach((tag, idx) => {
          console.log(`     ${idx + 1}. ${tag.substring(0, 150)}...`);
        });
      }
    } else if (html.includes('supabase.co')) {
      console.warn('⚠️ WARNING: Input HTML contains Supabase URL but sanitized HTML does NOT');
      console.warn('   This means the sanitizer guard failed to protect the Supabase image!');
    }
  }, [sanitizedHtml, html]);

  // Track HTML prop changes and force iframe reload (but NOT for internal edits)
  useEffect(() => {
    if (html !== htmlLengthRef.current) {
      // Skip iframe reload if this change came from our own AI edit
      if (isInternalEditRef.current) {
        console.log(`⏩ Skipping iframe reload - internal edit detected`);
        htmlLengthRef.current = html;
        isInternalEditRef.current = false; // Reset flag
        return;
      }

      console.log(`🔄 SmartEditMode received new HTML prop (changed from external source)`);
      console.log(`🔄 Forcing iframe reload by changing key: ${iframeKey} → ${iframeKey + 1}`);
      htmlLengthRef.current = html;
      setIframeKey(prev => prev + 1); // Force iframe remount
    }
  }, [html, iframeKey]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [dragTargetElement, setDragTargetElement] = useState<HTMLElement | null>(null);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [showContentGenerator, setShowContentGenerator] = useState(false);
  const [showDesignSuggestions, setShowDesignSuggestions] = useState(false);
  const [showLayersPanel, setShowLayersPanel] = useState(false);
  const [showDesignTokens, setShowDesignTokens] = useState(false);
  const [iframeReady, setIframeReady] = useState(false);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [currentBreakpoint, setCurrentBreakpoint] = useState<Breakpoint>('desktop');
  const [detectedComponents, setDetectedComponents] = useState<DetectedComponent[]>([]);
  const [designTokens, setDesignTokens] = useState<DesignTokens | null>(null);
  const { selectedElement, selectedElements, clearSelection } = useElementSelector(iframeRef, true);

  const handleApplyEdit = async (instruction: string, uploadedImageUrl?: string) => {
    if (!selectedElement) return;

    try {
      setIsProcessing(true);

      console.log('🤖 Calling AI visual editor (Framework-Grade):', {
        instruction,
        uploadedImageUrl,
        selector: selectedElement.selector,
        elementTag: selectedElement.tagName,
      });

      // No cleaning needed! Selector-based approach handles everything
      console.log('🎯 Using selector:', selectedElement.selector);

      // Call AI visual editor Edge Function (Framework-Grade)
      const { data, error } = await supabase.functions.invoke('ai-visual-editor', {
        body: {
          htmlContent: html,
          selector: selectedElement.selector,
          instruction: instruction,
          uploadedImageUrl: uploadedImageUrl,
          elementContext: {
            tagName: selectedElement.tagName,
            textContent: selectedElement.textContent,
            outerHTML: selectedElement.outerHTML, // Send as-is, selector-based ops don't need it
            attributes: selectedElement.attributes,
          },
        },
      });

      console.log('🤖 AI visual editor response:', { data, error });

      if (error) {
        console.error('❌ AI Edge Function error:', error);
        throw error;
      }

      if (data.success && data.updatedHtml) {
        console.log('✅ AI Edit successful (Framework-Grade)!');
        console.log('   Changes:', data.changes);
        console.log('   HTML diff:', html.length - data.updatedHtml.length, 'characters');

        // Log metadata if available
        if (data.meta) {
          console.log('   Operations:', data.meta.operations);
          console.log('   Confidence:', (data.meta.confidence * 100).toFixed(0) + '%');
          console.log('   Duration:', data.meta.duration_ms + 'ms');
        }

        // CRITICAL: Verify AI HTML contains Supabase URL
        console.log('🔍 Verifying AI HTML contains Supabase URL...');
        const hasSupabaseInHtml = data.updatedHtml.includes('supabase.co');
        console.log(`   AI HTML contains supabase.co: ${hasSupabaseInHtml}`);
        if (hasSupabaseInHtml) {
          const supabaseMatches = data.updatedHtml.match(/https:\/\/[^"'>\s]*supabase\.co[^"'>\s]*/g);
          console.log(`   Found ${supabaseMatches?.length || 0} Supabase URL(s) in AI response:`);
          supabaseMatches?.forEach((url, idx) => {
            console.log(`     ${idx + 1}. ${url.substring(0, 100)}...`);
          });
        }

        // Mark this as an internal edit to prevent iframe reload
        isInternalEditRef.current = true;

        // Call onHtmlUpdate to persist changes - sanitizer will protect Supabase URLs
        console.log('✓ Calling onHtmlUpdate to persist changes');
        onHtmlUpdate(data.updatedHtml);
        console.log('✓ Parent state updated with new HTML');

        // Clear selection after successful edit
        clearSelection();

        console.log('✓ AI Edit applied:', data.changes);
      } else {
        console.error('❌ AI Edit failed:', data.error || 'Unknown error');
        console.log('   Full response data:', data);
        alert('Failed to apply changes: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('❌ Error applying AI edit:', error);
      alert('Error applying changes. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle image file upload for AI Edit Panel (returns URL)
  const handleImageUploadForAI = useCallback(async (file: File): Promise<string> => {
    try {
      setUploadProgress('Preparing upload...');

      console.log('📸 Uploading image to Supabase Storage (AI Edit):', {
        fileName: file.name,
        fileType: file.type,
        fileSize: `${Math.round(file.size / 1024)} KB`,
        websiteId,
      });

      // Convert HEIC to JPEG before upload (browsers don't support HEIC)
      let processedFile = file;
      if (file.type === 'image/heic' || file.type === 'image/heif' || file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif')) {
        try {
          setUploadProgress('Converting HEIC to JPEG...');
          console.log('🔄 Converting HEIC to JPEG...');

          const heic2any = (await import('heic2any')).default;
          const convertedBlob = await heic2any({
            blob: file,
            toType: 'image/jpeg',
            quality: 0.9
          }) as Blob;

          // Create new File object with .jpg extension
          const newFileName = file.name.replace(/\.heic$/i, '.jpg').replace(/\.heif$/i, '.jpg');
          processedFile = new File([convertedBlob], newFileName, {
            type: 'image/jpeg'
          });

          console.log('✓ HEIC converted to JPEG:', {
            originalSize: `${Math.round(file.size / 1024)} KB`,
            convertedSize: `${Math.round(processedFile.size / 1024)} KB`,
          });
        } catch (conversionError) {
          console.error('❌ HEIC conversion failed:', conversionError);
          setUploadProgress(null);
          throw new Error('Failed to convert HEIC image to JPEG. Please convert the image to JPG or PNG before uploading.');
        }
      }

      // Generate unique filename
      setUploadProgress('Uploading image...');
      const extension = processedFile.name.split('.').pop() || 'jpg';
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(7);
      const filename = `${websiteId}/smart-edit-${timestamp}-${randomString}.${extension}`;

      console.log('📤 Uploading to:', filename);

      // Upload directly to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('website-imports')
        .upload(filename, processedFile, {
          contentType: processedFile.type,
          upsert: false,
          cacheControl: '3600',
        });

      if (uploadError) {
        console.error('❌ Storage upload error:', uploadError);

        // Provide helpful error messages
        if (uploadError.message.includes('row-level security')) {
          throw new Error('Permission denied. Please ensure you are logged in and the storage bucket is properly configured.');
        } else if (uploadError.message.includes('duplicate')) {
          throw new Error('A file with this name already exists. Please try again.');
        } else {
          throw new Error(`Upload failed: ${uploadError.message}`);
        }
      }

      console.log('✓ Upload successful:', uploadData.path);

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('website-imports')
        .getPublicUrl(filename);

      const publicUrl = urlData.publicUrl;
      console.log('✓ Public URL generated:', publicUrl);

      setUploadProgress(null);
      return publicUrl;
    } catch (error) {
      console.error('❌ Error uploading image:', error);
      setUploadProgress(null);
      throw error;
    }
  }, [websiteId]);

  // Handle image file upload - Direct upload to Supabase Storage (for drag-and-drop)
  const handleImageUpload = useCallback(async (file: File, targetImgElement: HTMLElement) => {
    try {
      setUploadProgress('Preparing upload...');

      console.log('📸 Uploading image to Supabase Storage:', {
        fileName: file.name,
        fileType: file.type,
        fileSize: `${Math.round(file.size / 1024)} KB`,
        websiteId,
      });

      // Convert HEIC to JPEG before upload (browsers don't support HEIC)
      let processedFile = file;
      if (file.type === 'image/heic' || file.type === 'image/heif' || file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif')) {
        try {
          setUploadProgress('Converting HEIC to JPEG...');
          console.log('🔄 Converting HEIC to JPEG...');

          const heic2any = (await import('heic2any')).default;
          const convertedBlob = await heic2any({
            blob: file,
            toType: 'image/jpeg',
            quality: 0.9
          }) as Blob;

          // Create new File object with .jpg extension
          const newFileName = file.name.replace(/\.heic$/i, '.jpg').replace(/\.heif$/i, '.jpg');
          processedFile = new File([convertedBlob], newFileName, {
            type: 'image/jpeg'
          });

          console.log('✓ HEIC converted to JPEG:', {
            originalSize: `${Math.round(file.size / 1024)} KB`,
            convertedSize: `${Math.round(processedFile.size / 1024)} KB`,
          });
        } catch (conversionError) {
          console.error('❌ HEIC conversion failed:', conversionError);
          alert('Failed to convert HEIC image to JPEG.\n\nPlease convert the image to JPG or PNG before uploading, or try a different image.');
          setUploadProgress(null);
          return;
        }
      }

      // Generate unique filename
      setUploadProgress('Uploading image...');
      const extension = processedFile.name.split('.').pop() || 'jpg';
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(7);
      const filename = `${websiteId}/smart-edit-${timestamp}-${randomString}.${extension}`;

      console.log('📤 Uploading to:', filename);

      // Upload directly to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('website-imports')
        .upload(filename, processedFile, {
          contentType: processedFile.type,
          upsert: false,
          cacheControl: '3600',
        });

      if (uploadError) {
        console.error('❌ Storage upload error:', uploadError);

        // Provide helpful error messages
        if (uploadError.message.includes('row-level security')) {
          throw new Error('Permission denied. Please ensure you are logged in and the storage bucket is properly configured.');
        } else if (uploadError.message.includes('duplicate')) {
          throw new Error('A file with this name already exists. Please try again.');
        } else {
          throw new Error(`Upload failed: ${uploadError.message}`);
        }
      }

      console.log('✓ Upload successful:', uploadData.path);

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('website-imports')
        .getPublicUrl(filename);

      const publicUrl = urlData.publicUrl;
      console.log('✓ Public URL generated:', publicUrl);

      setUploadProgress('Updating website...');

      // Update image instantly using DOM Manipulator
      if (domManipulatorRef.current) {
        // Generate selector for the target image
        const generateSelector = (elem: HTMLElement): string => {
          if (elem.id) return `#${elem.id}`;
          const path: string[] = [];
          let current: HTMLElement | null = elem;
          while (current && current !== current.ownerDocument.body) {
            let selector = current.tagName.toLowerCase();
            if (current.className && typeof current.className === 'string') {
              const classes = current.className.trim().split(/\s+/).filter(c => c && !c.startsWith('smart-edit-'));
              if (classes.length > 0) selector += '.' + classes.join('.');
            }
            if (current.parentElement) {
              const siblings = Array.from(current.parentElement.children);
              const index = siblings.indexOf(current);
              const sameTagSiblings = siblings.filter(s => s.tagName === current!.tagName);
              if (sameTagSiblings.length > 1) {
                selector += `:nth-child(${index + 1})`;
              }
            }
            path.unshift(selector);
            current = current.parentElement;
          }
          return path.join(' > ');
        };

        const selector = generateSelector(targetImgElement);

        // Update the src attribute instantly (no page reload!)
        domManipulatorRef.current.updateAttribute(selector, 'src', publicUrl);

        // Also update the underlying HTML for save
        const currentSrc = targetImgElement.getAttribute('src') || '';
        let newHtml = html;
        if (html.includes(`src="${currentSrc}"`)) {
          newHtml = html.replace(`src="${currentSrc}"`, `src="${publicUrl}"`);
        } else if (html.includes(`src='${currentSrc}'`)) {
          newHtml = html.replace(`src='${currentSrc}'`, `src='${publicUrl}'`);
        }
        onHtmlUpdate(newHtml);

        console.log('✅ Image updated instantly via DOM Manipulator!');
        console.log('   Selector:', selector);
        console.log('   New URL:', publicUrl);
      }

      setUploadProgress(null);
    } catch (error) {
      console.error('❌ Error uploading image:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`Failed to upload image:\n\n${errorMessage}\n\nPlease try again or contact support if the problem persists.`);
      setUploadProgress(null);
    }
  }, [html, websiteId, onHtmlUpdate]);

  // Handle generated section insertion
  const handleGenerateSection = (generatedHtml: string) => {
    // Insert at the end of the body
    const bodyCloseTag = '</body>';
    if (html.includes(bodyCloseTag)) {
      const newHtml = html.replace(bodyCloseTag, `\n${generatedHtml}\n${bodyCloseTag}`);
      onHtmlUpdate(newHtml);
    } else {
      // Fallback: append to end
      onHtmlUpdate(html + '\n' + generatedHtml);
    }
  };

  // Handle component selection from layers panel
  const handleSelectComponentFromLayers = (component: DetectedComponent) => {
    // Scroll the component into view in the iframe
    component.element.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Highlight it briefly
    if (iframeManagerRef.current) {
      const selector = generateSelectorForElement(component.element);
      iframeManagerRef.current.highlightElement(selector);

      // Remove highlight after 2 seconds
      setTimeout(() => {
        iframeManagerRef.current?.unhighlightAll();
      }, 2000);
    }
  };

  // Helper to generate CSS selector for an element
  const generateSelectorForElement = (elem: HTMLElement): string => {
    if (elem.id) return `#${elem.id}`;
    const path: string[] = [];
    let current: HTMLElement | null = elem;
    while (current && current !== current.ownerDocument.body) {
      let selector = current.tagName.toLowerCase();
      if (current.className && typeof current.className === 'string') {
        const classes = current.className.trim().split(/\s+/).filter(c => c && !c.startsWith('smart-edit-'));
        if (classes.length > 0) selector += '.' + classes.join('.');
      }
      if (current.parentElement) {
        const siblings = Array.from(current.parentElement.children);
        const index = siblings.indexOf(current);
        const sameTagSiblings = siblings.filter(s => s.tagName === current!.tagName);
        if (sameTagSiblings.length > 1) {
          selector += `:nth-child(${index + 1})`;
        }
      }
      path.unshift(selector);
      current = current.parentElement;
    }
    return path.join(' > ');
  };

  // Handle breakpoint change
  const handleBreakpointChange = (breakpoint: Breakpoint) => {
    setCurrentBreakpoint(breakpoint);
    if (responsiveManagerRef.current) {
      if (breakpoint === 'desktop') {
        responsiveManagerRef.current.resetToFullWidth();
      } else {
        responsiveManagerRef.current.setBreakpoint(breakpoint);
      }
    }
  };

  // Handle design suggestion application
  const handleApplyDesignSuggestion = (suggestion: any) => {
    // Apply CSS changes to the HTML
    let updatedHtml = html;

    // For each CSS selector and its changes
    Object.entries(suggestion.cssChanges).forEach(([selector, changes]: [string, any]) => {
      Object.entries(changes).forEach(([property, value]: [string, any]) => {
        // Try to find inline styles on matching elements
        // This is a simplified approach - in production you'd want more robust CSS injection
        console.log(`Applying: ${selector} { ${property}: ${value} }`);

        // Add to a style tag if it exists, or create one
        const styleTagRegex = /<style[^>]*>([\s\S]*?)<\/style>/i;
        const styleMatch = updatedHtml.match(styleTagRegex);

        if (styleMatch) {
          // Add to existing style tag
          const existingStyles = styleMatch[1];
          const newStyles = existingStyles + `\n${selector} { ${property}: ${value} !important; }`;
          updatedHtml = updatedHtml.replace(styleTagRegex, `<style>${newStyles}</style>`);
        } else {
          // Create new style tag in head
          const headCloseTag = '</head>';
          if (updatedHtml.includes(headCloseTag)) {
            const newStyleTag = `<style>\n${selector} { ${property}: ${value} !important; }\n</style>\n`;
            updatedHtml = updatedHtml.replace(headCloseTag, newStyleTag + headCloseTag);
          }
        }
      });
    });

    onHtmlUpdate(updatedHtml);
  };

  // Initialize DOM Manipulator and Live Iframe Manager
  useEffect(() => {
    if (!iframeRef.current) return;

    const iframe = iframeRef.current;

    const initializeManagers = () => {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc || !iframeDoc.body) return;

      console.log('🚀 Initializing live editing managers...');

      // Initialize DOM Manipulator
      domManipulatorRef.current = new DOMManipulator(iframe);

      // Initialize Live Iframe Manager
      iframeManagerRef.current = new LiveIframeManager(iframe);

      // Initialize Responsive Style Manager
      responsiveManagerRef.current = new ResponsiveStyleManager(iframe);

      // Inject edit mode scripts
      iframeManagerRef.current.injectEditModeScripts();

      // Wait for iframe to be ready
      iframeManagerRef.current.whenReady(() => {
        setIframeReady(true);
        console.log('✅ Live editing ready!');

        // Initialize Component Detector after iframe is ready
        if (iframeDoc) {
          componentDetectorRef.current = new ComponentDetector(iframeDoc);
          const components = componentDetectorRef.current.analyze();
          setDetectedComponents(components);
          console.log('🔍 Component detection complete:', components.length, 'components found');
          console.log('Components:', components.map(c => ({ type: c.type, label: c.label, confidence: c.confidence })));

          // Extract design tokens
          const analyzer = new DesignSystemAnalyzer(html, css);
          const tokens = analyzer.analyze();
          setDesignTokens(tokens);
          console.log('🎨 Design tokens extracted:', tokens);
        }
      });

      // Listen for element events from iframe
      iframeManagerRef.current.on('elementClicked', (data) => {
        console.log('Element clicked in iframe:', data.selector);
      });

      iframeManagerRef.current.on('elementHovered', (data) => {
        console.log('Element hovered in iframe:', data.selector);
      });
    };

    // Initialize on iframe load
    iframe.addEventListener('load', initializeManagers);
    setTimeout(initializeManagers, 100); // Also try immediately

    return () => {
      iframe.removeEventListener('load', initializeManagers);
      if (iframeManagerRef.current) {
        iframeManagerRef.current.destroy();
      }
    };
  }, []);

  // Setup keyboard shortcuts and history manager subscription
  useEffect(() => {
    const historyManager = historyManagerRef.current;

    // Subscribe to history changes to update undo/redo button states
    const unsubscribe = historyManager.subscribe((state) => {
      setCanUndo(historyManager.canUndo());
      setCanRedo(historyManager.canRedo());
    });

    // Setup keyboard shortcuts
    hotkeys('cmd+z, ctrl+z', (event) => {
      event.preventDefault();
      historyManager.undo();
    });

    hotkeys('cmd+shift+z, ctrl+shift+z, cmd+y, ctrl+y', (event) => {
      event.preventDefault();
      historyManager.redo();
    });

    hotkeys('cmd+s, ctrl+s', (event) => {
      event.preventDefault();
      // Trigger save
      console.log('💾 Save triggered (Cmd/Ctrl+S)');
      const currentHTML = domManipulatorRef.current?.getCurrentHTML();
      if (currentHTML) {
        onHtmlUpdate(currentHTML);
        alert('Changes saved!');
      }
    });

    console.log('⌨️  Keyboard shortcuts enabled: Cmd+Z (undo), Cmd+Shift+Z (redo), Cmd+S (save)');

    return () => {
      unsubscribe();
      hotkeys.unbind('cmd+z, ctrl+z');
      hotkeys.unbind('cmd+shift+z, ctrl+shift+z, cmd+y, ctrl+y');
      hotkeys.unbind('cmd+s, ctrl+s');
    };
  }, [onHtmlUpdate]);

  // Setup drag & drop event listeners
  useEffect(() => {
    if (!iframeRef.current || !iframeReady) return;

    const iframe = iframeRef.current;

    const setupDragDrop = () => {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc || !iframeDoc.body) {
        console.warn('⚠️  Iframe document not ready for drag-drop setup');
        return;
      }

      console.log('🎯 Setting up drag & drop listeners...');

      // Handle drag over - show drop zone
      const handleDragOver = (e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation();

        // Check if dragging an image file
        if (e.dataTransfer?.types.includes('Files')) {
          setIsDraggingImage(true);

          // Find if hovering over an image element (check all elements at this point)
          const target = e.target as HTMLElement;

          // Also check if target is a parent of an IMG
          let imgElement: HTMLElement | null = null;
          if (target.tagName === 'IMG') {
            imgElement = target;
          } else {
            // Check children for IMG tags
            const imgs = target.querySelectorAll('img');
            if (imgs.length > 0) {
              imgElement = imgs[0] as HTMLElement;
            }
          }

          if (imgElement) {
            console.log('🎯 Hovering over image:', imgElement.getAttribute('src'));
            setDragTargetElement(imgElement);
            imgElement.style.outline = '3px dashed #3b82f6';
            imgElement.style.outlineOffset = '4px';
            imgElement.style.opacity = '0.7';
          } else {
            // Clear previous target
            if (dragTargetElement) {
              dragTargetElement.style.outline = '';
              dragTargetElement.style.outlineOffset = '';
              dragTargetElement.style.opacity = '';
            }
            setDragTargetElement(null);
          }
        }
      };

      // Handle drag leave
      const handleDragLeave = (e: DragEvent) => {
        e.preventDefault();
        const target = e.target as HTMLElement;
        if (target && target.tagName === 'IMG') {
          target.style.outline = '';
          target.style.outlineOffset = '';
          target.style.opacity = '';
        }
      };

      // Handle drop
      const handleDrop = async (e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation();

        setIsDraggingImage(false);

        console.log('📥 Drop detected on:', e.target);

        const target = e.target as HTMLElement;

        // Find the actual IMG element (could be dropped on a parent)
        let imgElement: HTMLElement | null = null;
        if (target.tagName === 'IMG') {
          imgElement = target;
        } else {
          const imgs = target.querySelectorAll('img');
          if (imgs.length > 0) {
            imgElement = imgs[0] as HTMLElement;
          }
        }

        // Use dragTargetElement if we tracked it
        if (!imgElement && dragTargetElement) {
          imgElement = dragTargetElement;
        }

        if (imgElement) {
          console.log('✅ Found image element:', imgElement.getAttribute('src'));
          imgElement.style.outline = '';
          imgElement.style.outlineOffset = '';
          imgElement.style.opacity = '';

          // Get dropped file
          const files = e.dataTransfer?.files;
          if (files && files.length > 0) {
            const file = files[0];
            console.log('📦 Dropped file:', file.name, file.type);

            // Validate it's an image
            if (file.type.startsWith('image/') || file.name.match(/\.(jpg|jpeg|png|gif|webp|svg|heic|heif)$/i)) {
              await handleImageUpload(file, imgElement);
            } else {
              alert('Please drop an image file (JPG, PNG, GIF, WebP, SVG, or HEIC)');
            }
          }
        } else {
          console.warn('⚠️  No image element found at drop location');
        }

        setDragTargetElement(null);
      };

      // Attach listeners
      iframeDoc.addEventListener('dragover', handleDragOver as EventListener);
      iframeDoc.addEventListener('dragleave', handleDragLeave as EventListener);
      iframeDoc.addEventListener('drop', handleDrop as EventListener);

      console.log('✓ Drag & drop listeners attached');

      // Cleanup
      return () => {
        iframeDoc.removeEventListener('dragover', handleDragOver as EventListener);
        iframeDoc.removeEventListener('dragleave', handleDragLeave as EventListener);
        iframeDoc.removeEventListener('drop', handleDrop as EventListener);
      };
    };

    // Setup immediately since iframe is ready
    const cleanup = setupDragDrop();

    return () => {
      if (cleanup) cleanup();
    };
  }, [iframeReady, handleImageUpload]); // Re-run when iframe becomes ready

  return (
    <div className="h-full flex flex-col">
      {/* Smart Edit Mode Banner */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 border-b border-purple-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Sparkles className="w-5 h-5 text-white" />
          <div className="text-white">
            <div className="font-semibold">Smart Edit Mode™</div>
            <div className="text-xs text-purple-100">Click any element to edit with AI • Drag images to replace • Add content anywhere!</div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Breakpoint Controls */}
          <BreakpointControls
            currentBreakpoint={currentBreakpoint}
            onBreakpointChange={handleBreakpointChange}
          />

          {/* Separator */}
          <div className="w-px h-6 bg-white/30"></div>

          {/* Undo Button */}
          <button
            onClick={() => historyManagerRef.current.undo()}
            disabled={!canUndo}
            className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
              canUndo
                ? 'bg-white/20 hover:bg-white/30 text-white cursor-pointer'
                : 'bg-white/10 text-white/40 cursor-not-allowed'
            }`}
            title="Undo (Cmd/Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </button>

          {/* Redo Button */}
          <button
            onClick={() => historyManagerRef.current.redo()}
            disabled={!canRedo}
            className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
              canRedo
                ? 'bg-white/20 hover:bg-white/30 text-white cursor-pointer'
                : 'bg-white/10 text-white/40 cursor-not-allowed'
            }`}
            title="Redo (Cmd/Ctrl+Shift+Z)"
          >
            <Redo2 className="w-4 h-4" />
          </button>

          {/* Separator */}
          <div className="w-px h-6 bg-white/30"></div>

          {/* AI Generate Button */}
          <button
            onClick={() => setShowContentGenerator(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors"
            title="Generate new sections with AI"
          >
            <Wand2 className="w-4 h-4" />
            <span className="text-sm font-medium">AI Generate</span>
          </button>

          {/* Design Tokens Button */}
          <button
            onClick={() => setShowDesignTokens(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors"
            title="View design tokens"
          >
            <Palette className="w-4 h-4" />
            <span className="text-sm font-medium">Design Tokens</span>
          </button>

          {/* Layers Panel Toggle */}
          <button
            onClick={() => setShowLayersPanel(!showLayersPanel)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              showLayersPanel
                ? 'bg-white/30 text-white'
                : 'bg-white/20 hover:bg-white/30 text-white'
            }`}
            title="Toggle layers panel"
          >
            <Layers className="w-4 h-4" />
            <span className="text-sm font-medium">Layers</span>
            {detectedComponents.length > 0 && (
              <span className="bg-white/30 px-1.5 py-0.5 rounded text-xs">
                {detectedComponents.length}
              </span>
            )}
          </button>

          {/* Exit Button */}
          <button
            onClick={onExitEditMode}
            className="flex items-center space-x-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors"
          >
            <Eye className="w-4 h-4" />
            <span className="text-sm font-medium">Exit</span>
          </button>
        </div>
      </div>

      {/* iframe with cloned website + Layers Panel */}
      <div className="flex-1 flex relative overflow-hidden">
        {/* Main iframe container */}
        <div className="flex-1 relative">
          {/* Cursor hint overlay */}
          {!selectedElement && !isDraggingImage && !uploadProgress && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-purple-600 text-white px-6 py-3 rounded-full shadow-lg z-10 pointer-events-none animate-pulse">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-medium">Click any element to start editing</span>
              </div>
            </div>
          )}

          {/* Drag & drop hint */}
          {isDraggingImage && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-6 py-3 rounded-full shadow-lg z-10 pointer-events-none">
              <div className="flex items-center space-x-2">
                <Upload className="w-5 h-5 animate-bounce" />
                <span className="text-sm font-medium">
                  {dragTargetElement ? 'Drop to replace image!' : 'Drag over an image to replace it'}
                </span>
              </div>
            </div>
          )}

          {/* Upload progress */}
          {uploadProgress && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-full shadow-lg z-10 pointer-events-none">
              <div className="flex items-center space-x-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm font-medium">{uploadProgress}</span>
              </div>
            </div>
          )}

          <iframe
            key={iframeKey}
            ref={iframeRef}
            srcDoc={sanitizedHtml}
            className="w-full h-full border-0"
            title="Smart Edit Mode Preview"
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
          />
        </div>

        {/* Layers Panel (right sidebar) */}
        {showLayersPanel && (
          <div className="w-80 flex-shrink-0">
            <LayersPanel
              components={detectedComponents}
              onSelectComponent={handleSelectComponentFromLayers}
              selectedComponent={null}
            />
          </div>
        )}
      </div>

      {/* AI Edit Panel */}
      <AIEditPanel
        selectedElement={selectedElement}
        onClearSelection={clearSelection}
        onApplyEdit={handleApplyEdit}
        isProcessing={isProcessing}
        onImageUpload={handleImageUploadForAI}
        componentType={
          selectedElement && iframeRef.current?.contentDocument
            ? (iframeRef.current.contentDocument.querySelector(selectedElement.selector)?.getAttribute('data-component-type') as any)
            : null
        }
        componentLabel={
          selectedElement && iframeRef.current?.contentDocument
            ? iframeRef.current.contentDocument.querySelector(selectedElement.selector)?.getAttribute('data-component-label') || undefined
            : undefined
        }
      />

      {/* AI Content Generator Modal */}
      {showContentGenerator && (
        <AIContentGenerator
          onGenerate={handleGenerateSection}
          onClose={() => setShowContentGenerator(false)}
        />
      )}

      {/* Design Suggestions Panel */}
      {showDesignSuggestions && (
        <DesignSuggestionsPanel
          html={html}
          css={css}
          onApplySuggestion={handleApplyDesignSuggestion}
          onClose={() => setShowDesignSuggestions(false)}
        />
      )}

      {/* Design Tokens Panel */}
      {showDesignTokens && designTokens && (
        <DesignTokensPanel
          tokens={designTokens}
          onClose={() => setShowDesignTokens(false)}
          onApplyColor={(oldColor, newColor) => {
            // Replace color in HTML and CSS
            let newHtml = html.replace(new RegExp(oldColor, 'g'), newColor);
            onHtmlUpdate(newHtml);
            console.log(`🎨 Color swapped: ${oldColor} → ${newColor}`);
          }}
        />
      )}
    </div>
  );
}
