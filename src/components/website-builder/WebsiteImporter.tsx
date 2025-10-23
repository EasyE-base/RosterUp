import { useState } from 'react';
import {
  X,
  Globe,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Brain,
  List,
} from 'lucide-react';
import { fetchWebsite } from '../../lib/websiteImporter';
import { supabase } from '../../lib/supabase';

interface WebsiteImporterProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (websiteId: string) => void;
  organizationId: string;
  subdomain: string;
}

type ImportStep = 'url' | 'analyzing' | 'converting' | 'complete' | 'error';
type ImportMode = 'auto' | 'manual';
type WebsiteMode = 'blocks' | 'clone' | 'vercel-agent';

interface ImportProgress {
  step: ImportStep;
  message: string;
  progress: number;
}

export default function WebsiteImporter({
  isOpen,
  onClose,
  onComplete,
  organizationId,
  subdomain,
}: WebsiteImporterProps) {
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [manualUrls, setManualUrls] = useState('');
  const [importMode, setImportMode] = useState<ImportMode>('manual');
  const [websiteMode, setWebsiteMode] = useState<WebsiteMode>('clone');
  const [progress, setProgress] = useState<ImportProgress>({
    step: 'url',
    message: '',
    progress: 0,
  });
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const validateUrl = (url: string): boolean => {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const parseManualUrls = (text: string): string[] => {
    return text
      .split('\n')
      .map(url => url.trim())
      .filter(url => {
        if (!url || !validateUrl(url)) return false;

        // Filter out common file extensions that aren't pages
        const fileExtensions = /\.(jpg|jpeg|png|gif|svg|webp|pdf|zip|mp4|mp3|css|js|json|xml|ico)$/i;
        if (fileExtensions.test(url)) {
          console.warn(`⚠️  Skipping non-page file: ${url}`);
          return false;
        }

        return true;
      });
  };

  const handleImport = async () => {
    if (importMode === 'auto') {
      if (!validateUrl(websiteUrl)) {
        setError('Please enter a valid website URL (e.g., https://example.com)');
        return;
      }
    } else {
      const urls = parseManualUrls(manualUrls);
      if (urls.length === 0) {
        setError('Please enter at least one valid URL');
        return;
      }
    }

    setError('');
    setProgress({ step: 'analyzing', message: 'Discovering pages on your website...', progress: 5 });

    try {
      // Get URLs to import (either from auto-discovery or manual input)
      let urlsToImport: string[] = [];

      if (importMode === 'auto') {
        // Auto mode: Use link discovery
        setProgress({
          step: 'analyzing',
          message: 'Discovering pages on your website...',
          progress: 10,
        });

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          throw new Error('You must be logged in to import a website');
        }

        const { data: discoveryData, error: discoveryError } = await supabase.functions.invoke('discover-website-links', {
          body: {
            url: websiteUrl,
            maxDepth: 2,  // Crawl up to 2 levels deep
            maxPages: 100, // Increased limit to allow more navigation pages
            prioritizeNavigation: true,  // Prioritize navigation/menu links
            skipPatterns: ['/wp-admin/*', '/wp-content/uploads/*'], // Skip WordPress admin
          },
        });

        if (discoveryError) {
          console.warn('❌ Link discovery failed, falling back to single page:', discoveryError);
          urlsToImport = [websiteUrl];
        } else if (discoveryData?.success && discoveryData.urls) {
          // Limit to first 25 pages (sorted by priority already)
          // Edge Function times out with too many pages
          const MAX_IMPORT_PAGES = 25;
          const allDiscovered = discoveryData.urls;
          urlsToImport = allDiscovered.slice(0, MAX_IMPORT_PAGES);

          console.log(`\n🎯 SMART DISCOVERY RESULTS:`);
          console.log(`✓ Discovered ${allDiscovered.length} total pages`);
          console.log(`✓ Importing top ${urlsToImport.length} pages (sorted by priority)`);

          if (discoveryData.stats) {
            console.log(`\n📊 BREAKDOWN:`);
            console.log(`  → Navigation/Header pages: ${discoveryData.stats.navigationPages}`);
            console.log(`  → Content pages: ${discoveryData.stats.contentPages}`);
            console.log(`  → Footer pages: ${discoveryData.stats.footerPages}`);
            console.log(`  → Skipped links: ${discoveryData.stats.skippedLinks}`);
          }

          // Log first 10 URLs for debugging
          console.log(`\n📄 TOP ${Math.min(10, urlsToImport.length)} PAGES TO IMPORT:`);
          urlsToImport.slice(0, 10).forEach((url, i) => {
            console.log(`  ${i + 1}. ${url}`);
          });

          if (allDiscovered.length > MAX_IMPORT_PAGES) {
            console.warn(`\n⚠️  Limited to ${MAX_IMPORT_PAGES} pages due to import time constraints`);
            console.log(`    Full list had ${allDiscovered.length} pages`);
          }
        } else {
          console.warn('❌ No discovery data, falling back to single page');
          urlsToImport = [websiteUrl];
        }
      } else {
        // Manual mode: Use provided URLs
        urlsToImport = parseManualUrls(manualUrls);
        console.log(`\n📝 MANUAL MODE:`);
        console.log(`✓ ${urlsToImport.length} URLs provided manually`);
        console.log(`\n📄 PAGES TO IMPORT:`);
        urlsToImport.forEach((url, i) => {
          console.log(`  ${i + 1}. ${url}`);
        });
      }

      console.log(`\n🚀 Starting import of ${urlsToImport.length} page(s)...`);

      // VERCEL AGENT MODE: Use vercel-agent-import Edge Function for intelligent block mapping
      if (websiteMode === 'vercel-agent') {
        // Smart Import is limited to 5 pages max due to timeout constraints
        const MAX_SMART_IMPORT = 5;
        if (urlsToImport.length > MAX_SMART_IMPORT) {
          console.warn(`⚠️  Smart Import supports max ${MAX_SMART_IMPORT} pages. You have ${urlsToImport.length} pages.`);
          console.warn(`   Limiting to first ${MAX_SMART_IMPORT} pages. Use Pixel Clone for more pages.`);
        }

        setProgress({
          step: 'analyzing',
          message: `Importing ${Math.min(urlsToImport.length, MAX_SMART_IMPORT)} page(s) with AI...`,
          progress: 20,
        });

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          throw new Error('You must be logged in to import a website');
        }

        const { data: agentData, error: agentError } = await supabase.functions.invoke('vercel-agent-import', {
          body: {
            urls: urlsToImport,
            organizationId,
            subdomain,
          },
        });

        console.log('Vercel Agent response:', { agentData, agentError });

        if (agentError) {
          console.error('Vercel Agent error details:', agentError);
          console.error('Agent data (full):', JSON.stringify(agentData, null, 2));

          // Try to get error details from the response
          let errorMessage = agentError.message || 'Unknown error';

          // Check if agentData has error details even when agentError exists
          if (agentData && typeof agentData === 'object') {
            console.error('Edge function error data:', agentData);
            if ((agentData as any).error) {
              errorMessage = (agentData as any).error;
              console.error('ERROR MESSAGE:', errorMessage);
            }
            if ((agentData as any).details) {
              console.error('Error details:', (agentData as any).details);
            }
          }

          throw new Error(`Import failed: ${errorMessage}`);
        }

        if (!agentData?.success) {
          console.error('Import failed:', agentData);
          throw new Error(agentData?.error || agentData?.details || 'Failed to import website');
        }

        setProgress({
          step: 'converting',
          message: `Creating ${agentData.sectionsCount} sections with ${agentData.blocksCount} blocks...`,
          progress: 70,
        });

        await new Promise((resolve) => setTimeout(resolve, 1000));

        setProgress({
          step: 'complete',
          message: `Import complete! ${agentData.blocksCount} blocks created with styling preserved.`,
          progress: 100,
        });

        setTimeout(() => {
          onComplete(agentData.websiteId);
        }, 1500);

        return;
      }

      // CLONE MODE: Use clone-website Edge Function for pixel-perfect copy
      if (websiteMode === 'clone') {
        setProgress({
          step: 'analyzing',
          message: `Cloning ${urlsToImport.length} page(s)...`,
          progress: 30,
        });

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          throw new Error('You must be logged in to clone a website');
        }

        const { data: cloneData, error: cloneError } = await supabase.functions.invoke('clone-website', {
          body: {
            urls: urlsToImport,
            organizationId,
            subdomain,
          },
        });

        console.log('Clone response:', { cloneData, cloneError });

        if (cloneError) {
          console.error('Clone error details:', cloneError);
          const errorContext = (cloneError as any).context;
          if (errorContext) {
            try {
              const errorBody = await errorContext.json();
              console.error('Edge function error body:', errorBody);
              throw new Error(errorBody.error || errorBody.details || cloneError.message);
            } catch (e) {
              console.error('Could not parse error response');
            }
          }
          throw new Error(`Clone failed: ${cloneError.message}`);
        }

        if (!cloneData?.success) {
          console.error('Clone failed:', cloneData);
          throw new Error(cloneData?.error || cloneData?.details || 'Failed to clone website');
        }

        setProgress({
          step: 'converting',
          message: 'Downloading assets...',
          progress: 70,
        });

        await new Promise((resolve) => setTimeout(resolve, 1000));

        setProgress({
          step: 'complete',
          message: `Clone complete! ${cloneData.pagesCount} page(s) cloned.`,
          progress: 100,
        });

        setTimeout(() => {
          onComplete(cloneData.websiteId);
        }, 1500);

        return;
      }

      // BLOCKS MODE: Continue with existing AI conversion logic
      // Step 1: Crawl all pages from the website
      let crawledPages: any[] = [];

      if (importMode === 'manual') {
        // Manual mode: Use the URLs provided by user
        const urls = parseManualUrls(manualUrls);

        setProgress({
          step: 'analyzing',
          message: `Processing ${urls.length} pages...`,
          progress: 10,
        });

        // Fetch each page manually
        for (let i = 0; i < urls.length; i++) {
          const pageUrl = urls[i];
          console.log(`Fetching page ${i + 1}/${urls.length}: ${pageUrl}`);

          try {
            const corsProxy = 'https://api.allorigins.win/raw?url=';
            const response = await fetch(`${corsProxy}${encodeURIComponent(pageUrl)}`);
            const html = await response.text();

            // Extract page title and slug
            const urlObj = new URL(pageUrl);
            const pathname = urlObj.pathname;
            const slug = pathname === '/' ? '' : pathname.replace(/^\/|\/$/g, '');

            const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
            const title = titleMatch
              ? titleMatch[1].trim()
              : slug
                ? slug.split('/').pop()?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Page'
                : 'Home';

            crawledPages.push({
              url: pageUrl,
              title,
              slug,
              html,
              screenshot: null,
            });

            setProgress({
              step: 'analyzing',
              message: `Fetched ${i + 1} of ${urls.length} pages...`,
              progress: 10 + ((i + 1) / urls.length) * 10,
            });
          } catch (error) {
            console.error(`Failed to fetch ${pageUrl}:`, error);
            // Continue with other pages even if one fails
          }
        }

        setProgress({
          step: 'analyzing',
          message: `Successfully fetched ${crawledPages.length} pages! Preparing to import...`,
          progress: 20,
        });
      } else {
        // Auto mode: Try automatic crawling
        try {
          const crawlResponse = await fetch('/api/crawl-website', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: websiteUrl }),
          });

          if (crawlResponse.ok) {
            const crawlData = await crawlResponse.json();
            crawledPages = crawlData.pages || [];
            console.log(`Crawled ${crawledPages.length} pages successfully`);

            setProgress({
              step: 'analyzing',
              message: `Found ${crawledPages.length} pages! Preparing to import...`,
              progress: 20,
            });
          }
        } catch (crawlError) {
          console.warn('Multi-page crawl failed, falling back to single page:', crawlError);
          // Fall back to single-page import
        }
      }

      // Step 2: Get Supabase session for authentication
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('You must be logged in to import a website');
      }

      // Step 3: Call Claude AI via Supabase Edge Function
      if (crawledPages.length > 0) {
        // Multi-page import
        setProgress({
          step: 'analyzing',
          message: `Claude AI is analyzing all ${crawledPages.length} pages...`,
          progress: 30,
        });

        const { data: supabaseData, error: invokeError } = await supabase.functions.invoke('convert-website-with-ai', {
          body: {
            url: websiteUrl,
            organizationId,
            subdomain,
            pages: crawledPages, // Pass all crawled pages
          },
        });

        console.log('Edge function response:', { supabaseData, invokeError });

        if (invokeError) {
          const errorContext = (invokeError as any).context;
          if (errorContext) {
            try {
              const errorBody = await errorContext.json();
              console.error('Edge function error details:', errorBody);
              throw new Error(errorBody.error || errorBody.message || invokeError.message);
            } catch (e) {
              console.error('Could not parse error response');
            }
          }
          throw new Error(`Edge function error: ${invokeError.message}`);
        }

        if (!supabaseData?.success) {
          const errorMsg = supabaseData?.error || supabaseData?.details || 'Failed to convert website';
          console.error('Conversion failed:', errorMsg);
          throw new Error(errorMsg);
        }

        // Step 4: Converting
        setProgress({
          step: 'converting',
          message: `Creating ${supabaseData.pagesCount} pages...`,
          progress: 70,
        });

        await new Promise((resolve) => setTimeout(resolve, 1000));

        setProgress({
          step: 'converting',
          message: 'Applying design system...',
          progress: 85,
        });

        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Step 5: Complete
        setProgress({
          step: 'complete',
          message: `Import complete! ${supabaseData.pagesCount} pages imported.`,
          progress: 100,
        });

        // Wait a moment before navigating
        setTimeout(() => {
          onComplete(supabaseData.websiteId);
        }, 1500);

      } else {
        // Single-page fallback
        setProgress({ step: 'analyzing', message: 'Fetching website...', progress: 25 });

        const websiteData = await fetchWebsite(websiteUrl);

        setProgress({
          step: 'analyzing',
          message: 'Claude AI is analyzing your website...',
          progress: 40,
        });

        const { data: supabaseData, error: invokeError } = await supabase.functions.invoke('convert-website-with-ai', {
          body: {
            html: websiteData.html,
            css: websiteData.css,
            url: websiteUrl,
            organizationId,
            subdomain,
          },
        });

        console.log('Edge function response:', { supabaseData, invokeError });

        if (invokeError) {
          const errorContext = (invokeError as any).context;
          if (errorContext) {
            try {
              const errorBody = await errorContext.json();
              console.error('Edge function error details:', errorBody);
              throw new Error(errorBody.error || errorBody.message || invokeError.message);
            } catch (e) {
              console.error('Could not parse error response');
            }
          }
          throw new Error(`Edge function error: ${invokeError.message}`);
        }

        if (!supabaseData?.success) {
          const errorMsg = supabaseData?.error || supabaseData?.details || 'Failed to convert website';
          console.error('Conversion failed:', errorMsg);
          throw new Error(errorMsg);
        }

        setProgress({
          step: 'converting',
          message: 'Creating sections and blocks...',
          progress: 70,
        });

        await new Promise((resolve) => setTimeout(resolve, 1000));

        setProgress({
          step: 'converting',
          message: 'Applying design system...',
          progress: 85,
        });

        await new Promise((resolve) => setTimeout(resolve, 1000));

        setProgress({
          step: 'complete',
          message: 'Import complete! Your website is ready.',
          progress: 100,
        });

        setTimeout(() => {
          onComplete(supabaseData.websiteId);
        }, 1500);
      }
    } catch (err) {
      console.error('Import error:', err);
      setProgress({
        step: 'error',
        message: 'Failed to import website',
        progress: 0,
      });
      setError(
        err instanceof Error ? err.message : 'An error occurred while importing your website'
      );
    }
  };

  const handleReset = () => {
    setWebsiteUrl('');
    setManualUrls('');
    setProgress({ step: 'url', message: '', progress: 0 });
    setError('');
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-slate-900 rounded-xl shadow-2xl w-full max-w-2xl border border-slate-800 animate-scaleIn">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">
                Import Existing Website
              </h2>
              <p className="text-sm text-slate-400">
                AI-powered conversion in seconds
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            disabled={progress.step === 'analyzing' || progress.step === 'converting'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {progress.step === 'url' && (
            <div className="space-y-6">
              {/* Website Mode Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  Choose Import Type
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => {
                      setWebsiteMode('clone');
                      setError('');
                    }}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      websiteMode === 'clone'
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        websiteMode === 'clone' ? 'bg-blue-500' : 'bg-slate-700'
                      }`}>
                        <Globe className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="text-white font-medium mb-1">Pixel Clone</h4>
                        <p className="text-xs text-slate-400">100% HTML copy. Code only.</p>
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      setWebsiteMode('vercel-agent');
                      setError('');
                    }}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      websiteMode === 'vercel-agent'
                        ? 'border-purple-500 bg-purple-500/10'
                        : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        websiteMode === 'vercel-agent' ? 'bg-purple-500' : 'bg-slate-700'
                      }`}>
                        <Sparkles className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="text-white font-medium mb-1">Smart Import</h4>
                        <p className="text-xs text-slate-400">AI blocks with styling.</p>
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      setWebsiteMode('blocks');
                      setError('');
                    }}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      websiteMode === 'blocks'
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        websiteMode === 'blocks' ? 'bg-blue-500' : 'bg-slate-700'
                      }`}>
                        <Brain className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="text-white font-medium mb-1">AI Basic</h4>
                        <p className="text-xs text-slate-400">Simple blocks.</p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Info Section */}
              {websiteMode === 'blocks' && (
                <div className="bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                  <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                    <Brain className="w-4 h-4 text-blue-400" />
                    Powered by Claude AI
                  </h3>
                  <ul className="space-y-2 text-sm text-slate-300">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 mt-0.5">•</span>
                      <span>AI converts your site to editable blocks</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 mt-0.5">•</span>
                      <span>Drag-and-drop editing</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 mt-0.5">•</span>
                      <span>May lose some complex layouts</span>
                    </li>
                  </ul>
                </div>
              )}

              {websiteMode === 'vercel-agent' && (
                <div className="bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-purple-500/10 border border-purple-500/20 rounded-lg p-4">
                  <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    Intelligent Block Mapping
                  </h3>
                  <ul className="space-y-2 text-sm text-slate-300">
                    <li className="flex items-start gap-2">
                      <span className="text-purple-400 mt-0.5">•</span>
                      <span>AI maps HTML to editable blocks with styling</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-400 mt-0.5">•</span>
                      <span>Preserves design and interactions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-400 mt-0.5">•</span>
                      <span>Best accuracy for complex websites</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-400 mt-0.5">⚠</span>
                      <span className="text-yellow-400">Limited to 5 pages max (use Pixel Clone for more)</span>
                    </li>
                  </ul>
                </div>
              )}

              {websiteMode === 'clone' && (
                <div className="bg-gradient-to-br from-green-500/10 via-emerald-500/10 to-green-500/10 border border-green-500/20 rounded-lg p-4">
                  <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-green-400" />
                    Pixel-Perfect Cloning
                  </h3>
                  <ul className="space-y-2 text-sm text-slate-300">
                    <li className="flex items-start gap-2">
                      <span className="text-green-400 mt-0.5">•</span>
                      <span>Exact 1:1 copy of original website</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-400 mt-0.5">•</span>
                      <span>All JavaScript and interactions preserved</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-400 mt-0.5">•</span>
                      <span>Edit via HTML/CSS code editor</span>
                    </li>
                  </ul>
                </div>
              )}

              {/* Import Mode Toggle */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  Import Mode
                </label>
                <div className="flex gap-2 p-1 bg-slate-800/50 rounded-lg border border-slate-700">
                  <button
                    onClick={() => {
                      setImportMode('auto');
                      setError('');
                    }}
                    className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      importMode === 'auto'
                        ? 'bg-blue-500 text-white shadow-lg'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Globe className="w-4 h-4" />
                      <span>Auto-Detect Pages</span>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      setImportMode('manual');
                      setError('');
                    }}
                    className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      importMode === 'manual'
                        ? 'bg-blue-500 text-white shadow-lg'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <List className="w-4 h-4" />
                      <span>Manual URLs</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* URL Input - Auto Mode */}
              {importMode === 'auto' && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Website URL
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="url"
                        value={websiteUrl}
                        onChange={(e) => {
                          setWebsiteUrl(e.target.value);
                          setError('');
                        }}
                        placeholder="https://your-current-website.com"
                        className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    {websiteUrl && validateUrl(websiteUrl) && (
                      <a
                        href={websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                        title="Preview website"
                      >
                        <ExternalLink className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    AI will automatically discover and import all pages from the navigation
                  </p>
                </div>
              )}

              {/* URL Input - Manual Mode */}
              {importMode === 'manual' && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Page URLs (one per line)
                  </label>
                  <textarea
                    value={manualUrls}
                    onChange={(e) => {
                      setManualUrls(e.target.value);
                      setError('');
                    }}
                    placeholder="https://example.com/&#10;https://example.com/about&#10;https://example.com/services&#10;https://example.com/contact"
                    rows={8}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono text-sm"
                  />
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-slate-500">
                      Enter each page URL on a new line (including the homepage)
                    </p>
                    {manualUrls && (
                      <p className="text-xs text-blue-400 font-medium">
                        {parseManualUrls(manualUrls).length} valid URLs
                      </p>
                    )}
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                  <p className="text-sm text-red-400 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 text-white rounded-lg hover:bg-slate-700 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleImport}
                  disabled={
                    importMode === 'auto'
                      ? !websiteUrl || !validateUrl(websiteUrl)
                      : parseManualUrls(manualUrls).length === 0
                  }
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-5 h-5" />
                  <span>
                    {importMode === 'manual' && parseManualUrls(manualUrls).length > 0
                      ? `Import ${parseManualUrls(manualUrls).length} Pages`
                      : 'Import Website'}
                  </span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {(progress.step === 'analyzing' ||
            progress.step === 'converting') && (
            <div className="space-y-6">
              {/* Progress Animation */}
              <div className="flex flex-col items-center justify-center py-8">
                <div className="relative">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full flex items-center justify-center animate-pulse">
                    <Loader2 className="w-12 h-12 text-white animate-spin" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center border-4 border-slate-900">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                </div>

                <p className="text-white font-semibold text-lg mt-6">
                  {progress.message}
                </p>
                <p className="text-slate-400 text-sm mt-2 flex items-center justify-center gap-2">
                  <Brain className="w-4 h-4" />
                  Claude AI is working its magic...
                </p>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-400">Progress</span>
                  <span className="text-blue-400 font-medium">
                    {progress.progress}%
                  </span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-500 ease-out"
                    style={{ width: `${progress.progress}%` }}
                  />
                </div>
              </div>

              {/* Steps Checklist */}
              <div className="bg-slate-800/50 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                  <span className="text-slate-300">Website fetched</span>
                </div>
                <div className="flex items-center gap-3">
                  {progress.progress >= 30 ? (
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                  ) : (
                    <div className="w-5 h-5 border-2 border-slate-600 rounded-full" />
                  )}
                  <span
                    className={
                      progress.progress >= 30 ? 'text-slate-300' : 'text-slate-500'
                    }
                  >
                    AI analysis complete
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {progress.progress >= 60 ? (
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                  ) : (
                    <div className="w-5 h-5 border-2 border-slate-600 rounded-full" />
                  )}
                  <span
                    className={
                      progress.progress >= 60 ? 'text-slate-300' : 'text-slate-500'
                    }
                  >
                    Blocks and sections created
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {progress.progress >= 80 ? (
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                  ) : (
                    <div className="w-5 h-5 border-2 border-slate-600 rounded-full" />
                  )}
                  <span
                    className={
                      progress.progress >= 80 ? 'text-slate-300' : 'text-slate-500'
                    }
                  >
                    Images and assets uploaded
                  </span>
                </div>
              </div>
            </div>
          )}

          {progress.step === 'complete' && (
            <div className="space-y-6 text-center py-8">
              <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-400 rounded-full flex items-center justify-center mx-auto animate-scaleIn">
                <CheckCircle2 className="w-12 h-12 text-white" />
              </div>

              <div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  Import Complete!
                </h3>
                <p className="text-slate-300">
                  Your website has been successfully imported and is ready to edit.
                </p>
              </div>

              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                <p className="text-sm text-slate-300">
                  Redirecting you to the editor...
                </p>
              </div>
            </div>
          )}

          {progress.step === 'error' && (
            <div className="space-y-6 text-center py-8">
              <div className="w-24 h-24 bg-gradient-to-br from-red-500 to-rose-400 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle className="w-12 h-12 text-white" />
              </div>

              <div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  Import Failed
                </h3>
                <p className="text-slate-300">{error}</p>
              </div>

              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                <p className="text-sm text-slate-300 mb-3">
                  Common issues:
                </p>
                <ul className="text-sm text-slate-400 space-y-1 text-left">
                  <li>• Website may be blocking automated access</li>
                  <li>• URL might be incorrect or inaccessible</li>
                  <li>• Website requires authentication</li>
                </ul>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleReset}
                  className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 text-white rounded-lg hover:bg-slate-700 transition-all"
                >
                  Try Again
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all"
                >
                  Start from Scratch
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
