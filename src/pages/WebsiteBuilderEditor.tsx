import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, WebsitePage, WebsiteContentBlock } from '../lib/supabase';
import { WebsiteEditorProvider, useWebsiteEditor } from '../contexts/WebsiteEditorContext';
import PageEditor from '../components/website-builder/PageEditor';

function WebsiteBuilderEditorContent() {
  const { pageId } = useParams();
  const navigate = useNavigate();
  const { organization } = useAuth();
  const { loadBlocks } = useWebsiteEditor();

  const [page, setPage] = useState<WebsitePage | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (pageId) {
      loadPageAndBlocks();
    }
  }, [pageId]);

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

  const { blocks: editorBlocks } = useWebsiteEditor();

  const handleSave = async () => {
    if (!pageId || !page) return;

    try {
      setSaving(true);

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
    console.log('Preview functionality coming soon');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-slate-950">
      <div className="bg-slate-900 border-b border-slate-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/website-builder')}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-white">{page?.title}</h1>
              <p className="text-sm text-slate-400">/{page?.slug || ''}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <PageEditor onSave={handleSave} onPreview={handlePreview} saving={saving} />
      </div>
    </div>
  );
}

export default function WebsiteBuilderEditor() {
  return (
    <WebsiteEditorProvider>
      <WebsiteBuilderEditorContent />
    </WebsiteEditorProvider>
  );
}
