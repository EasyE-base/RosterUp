import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Globe,
  Plus,
  Settings,
  Eye,
  Save,
  Loader2,
  Layout,
  Type,
  Image,
  Users,
  Calendar,
  Trophy,
  Mail,
  ExternalLink,
  Palette,
  Code,
  X,
  FileText,
  Trash2,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, OrganizationWebsite, WebsitePage } from '../lib/supabase';
import { useScreenSize } from '../hooks/useScreenSize';
import MobileBlocker from '../components/website-builder/MobileBlocker';
import TemplateSelector from '../components/website-builder/TemplateSelector';
import { Template, replaceTemplateVariables } from '../lib/templates';

export default function WebsiteBuilder() {
  const { organization } = useAuth();
  const navigate = useNavigate();
  const { isMobile } = useScreenSize();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [website, setWebsite] = useState<OrganizationWebsite | null>(null);
  const [pages, setPages] = useState<WebsitePage[]>([]);
  const [showCreateWebsite, setShowCreateWebsite] = useState(false);
  const [showCreatePage, setShowCreatePage] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [subdomain, setSubdomain] = useState('');
  const [error, setError] = useState('');
  const [newPageTitle, setNewPageTitle] = useState('');
  const [newPageSlug, setNewPageSlug] = useState('');

  useEffect(() => {
    if (organization) {
      checkAccess();
    }
  }, [organization]);

  const checkAccess = async () => {
    if (!organization) return;

    await loadWebsite();
  };

  const loadWebsite = async () => {
    if (!organization) return;

    try {
      setLoading(true);

      const { data: websiteData, error: websiteError } = await supabase
        .from('organization_websites')
        .select('*')
        .eq('organization_id', organization.id)
        .maybeSingle();

      if (websiteError) throw websiteError;

      if (websiteData) {
        setWebsite(websiteData as OrganizationWebsite);
        await loadPages(websiteData.id);
      } else {
        setShowCreateWebsite(true);
      }
    } catch (error) {
      console.error('Error loading website:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPages = async (websiteId: string) => {
    try {
      const { data, error } = await supabase
        .from('website_pages')
        .select('*')
        .eq('website_id', websiteId)
        .order('order_index', { ascending: true });

      if (error) throw error;
      setPages((data as WebsitePage[]) || []);
    } catch (error) {
      console.error('Error loading pages:', error);
    }
  };

  const createWebsite = async () => {
    if (!organization || !subdomain) return;

    try {
      setSaving(true);
      setError('');

      const cleanSubdomain = subdomain.toLowerCase().replace(/[^a-z0-9-]/g, '-');

      const { data: websiteData, error: websiteError } = await supabase
        .from('organization_websites')
        .insert({
          organization_id: organization.id,
          subdomain: cleanSubdomain,
          is_published: false,
        })
        .select()
        .single();

      if (websiteError) {
        if (websiteError.code === '23505') {
          setError('This subdomain is already taken. Please choose another.');
        } else {
          throw websiteError;
        }
        return;
      }

      const { error: pageError } = await supabase
        .from('website_pages')
        .insert({
          website_id: websiteData.id,
          title: 'Home',
          slug: '',
          is_home: true,
          is_published: false,
          order_index: 0,
        });

      if (pageError) throw pageError;

      setWebsite(websiteData as OrganizationWebsite);
      setShowCreateWebsite(false);
      await loadPages(websiteData.id);

      // Automatically show template selector for new websites
      setShowTemplateSelector(true);
    } catch (error) {
      console.error('Error creating website:', error);
      setError('Failed to create website. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const togglePublish = async () => {
    if (!website) return;

    try {
      setSaving(true);
      const { error } = await supabase
        .from('organization_websites')
        .update({ is_published: !website.is_published })
        .eq('id', website.id);

      if (error) throw error;

      setWebsite({ ...website, is_published: !website.is_published });
    } catch (error) {
      console.error('Error toggling publish:', error);
    } finally {
      setSaving(false);
    }
  };

  const createPage = async () => {
    if (!website || !newPageTitle) return;

    try {
      setSaving(true);
      setError('');

      const slug = newPageSlug || newPageTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-');

      const { data: newPage, error: pageError } = await supabase
        .from('website_pages')
        .insert({
          website_id: website.id,
          title: newPageTitle,
          slug: slug,
          is_home: false,
          is_published: false,
          order_index: pages.length,
        })
        .select()
        .single();

      if (pageError) throw pageError;

      await loadPages(website.id);
      setShowCreatePage(false);
      setNewPageTitle('');
      setNewPageSlug('');

      // Navigate to the new page editor
      if (newPage) {
        navigate(`/website-builder/page/${newPage.id}`);
      }
    } catch (error) {
      console.error('Error creating page:', error);
      setError('Failed to create page. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleTemplateSelect = async (template: Template) => {
    if (!website || !organization) return;

    try {
      setSaving(true);
      setError('');

      // Replace template variables with organization data
      const variables = {
        org_name: organization.name,
        org_domain: organization.website || `${website.subdomain}.rosterup.com`,
        org_slug: organization.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      };

      // Create a page for this template
      // Use crypto-enhanced slug for collision-proof uniqueness
      const baseSlug = template.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, ''); // trim leading/trailing dashes

      const timestamp = Date.now();

      // Generate 8-character short ID using native crypto API with fallback
      const shortId = (globalThis.crypto?.randomUUID?.() ?? `${timestamp}`)
        .replace(/-/g, '')
        .slice(0, 8);

      const slug = `${baseSlug}-${timestamp}-${shortId}`;
      const pageTitle = template.name;

      console.log(`📝 Creating page: "${pageTitle}" with slug: ${slug} (base: ${baseSlug})`);

      const { data: newPage, error: pageError } = await supabase
        .from('website_pages')
        .insert({
          website_id: website.id,
          title: pageTitle,
          slug: slug,
          base_slug: baseSlug,
          is_home: pages.length === 0, // Make it home page if it's the first one
          is_published: false,
          order_index: pages.length,
        })
        .select()
        .single();

      if (pageError) {
        console.error('❌ Page creation failed:', pageError);
        throw pageError;
      }

      console.log(`✅ Page created successfully with ID: ${newPage.id}`);

      console.log(`📝 Template import: Page created with ID ${newPage.id}, inserting ${template.sections.length} sections...`);

      // Insert sections for each template section
      for (let i = 0; i < template.sections.length; i++) {
        const section = template.sections[i];

        console.log(`  → Section ${i + 1}/${template.sections.length}: "${section.name}" (type: ${section.section_type})`);

        // Replace variables in content
        const processedContent = replaceTemplateVariables(section.content, variables);

        const { error: sectionError } = await supabase
          .from('website_sections')
          .insert({
            page_id: newPage.id,
            name: section.name,
            section_type: section.section_type as any, // Type assertion for DB enum
            full_width: true,
            order_index: i,
            styles: { ...section.styles, content: processedContent },
            background_color: section.styles?.backgroundColor,
            padding_top: section.styles?.paddingTop || section.styles?.padding,
            padding_bottom: section.styles?.paddingBottom || section.styles?.padding,
            padding_left: section.styles?.paddingLeft || section.styles?.padding,
            padding_right: section.styles?.paddingRight || section.styles?.padding,
            max_width: section.styles?.maxWidth,
          });

        if (sectionError) {
          console.error(`  ❌ Section insert FAILED:`, sectionError);
          console.error(`  Section data:`, { name: section.name, type: section.section_type, order: i });
          throw sectionError;
        } else {
          console.log(`  ✅ Section inserted successfully`);
        }

        // Create content blocks for the section's content
        // For now, we'll store the entire content as a single block
        // In the future, this could be parsed into multiple blocks
        const { error: blockError } = await supabase
          .from('website_content_blocks')
          .insert({
            page_id: newPage.id,
            block_type: section.section_type,
            content: processedContent,
            styles: section.styles || {},
            visibility: {
              desktop: true,
              tablet: true,
              mobile: true,
            },
            order_index: i,
          });

        if (blockError) {
          console.error('Error creating content block:', blockError);
          // Don't throw here, as sections are more important
        }
      }

      console.log(`✅ Template import complete: ${template.sections.length} sections created for page ${newPage.id}`);

      // Reload pages
      await loadPages(website.id);

      // Navigate to the new page
      if (newPage) {
        navigate(`/website-builder/page/${newPage.id}`);
      }
    } catch (error) {
      console.error('Error importing template:', error);
      throw new Error('Failed to import template. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteWebsite = async () => {
    if (!website || !organization) return;

    const confirmDelete = window.confirm(
      'Are you sure you want to delete your entire website? This will delete all pages, sections, and content. This action cannot be undone.'
    );

    if (!confirmDelete) return;

    try {
      setSaving(true);

      // Delete all content blocks first
      await supabase
        .from('website_content_blocks')
        .delete()
        .in('page_id', pages.map(p => p.id));

      // Delete all sections
      await supabase
        .from('website_sections')
        .delete()
        .in('page_id', pages.map(p => p.id));

      // Delete all pages
      await supabase
        .from('website_pages')
        .delete()
        .eq('website_id', website.id);

      // Delete the website itself
      await supabase
        .from('organization_websites')
        .delete()
        .eq('id', website.id);

      // Reset state
      setWebsite(null);
      setPages([]);
      setShowCreateWebsite(true);

      alert('Website deleted successfully!');
    } catch (error) {
      console.error('Error deleting website:', error);
      alert('Failed to delete website. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const blockTypes = [
    { type: 'hero', icon: Layout, label: 'Hero Section', description: 'Large banner with title and CTA' },
    { type: 'text', icon: Type, label: 'Text Block', description: 'Rich text content' },
    { type: 'image', icon: Image, label: 'Image Gallery', description: 'Photo gallery or single image' },
    { type: 'team_roster', icon: Users, label: 'Team Roster', description: 'Display team members' },
    { type: 'schedule', icon: Calendar, label: 'Schedule', description: 'Upcoming games and events' },
    { type: 'tournaments', icon: Trophy, label: 'Tournaments', description: 'Tournament listings' },
    { type: 'contact', icon: Mail, label: 'Contact Form', description: 'Get in touch form' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[rgb(247,247,249)]">
        <Loader2 className="w-8 h-8 animate-spin text-[rgb(0,113,227)]" />
      </div>
    );
  }

  // Block mobile devices
  if (isMobile) {
    return <MobileBlocker />;
  }

  if (showCreateWebsite) {
    return (
      <>
        <div className="min-h-screen bg-[rgb(247,247,249)] pt-32 pb-12">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-[rgb(0,113,227)] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Globe className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-[rgb(29,29,31)] mb-2">Create Your Website</h1>
                <p className="text-[rgb(134,142,150)]">
                  Build a professional website for your organization
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-[rgb(29,29,31)] mb-2">
                    Choose Your Subdomain
                  </label>
                  <div className="flex items-center">
                    <input
                      type="text"
                      value={subdomain}
                      onChange={(e) => setSubdomain(e.target.value)}
                      placeholder="your-organization"
                      className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-l-lg text-[rgb(29,29,31)] placeholder-[rgb(134,142,150)] focus:outline-none focus:border-[rgb(0,113,227)] focus:ring-2 focus:ring-[rgb(0,113,227)]/20"
                    />
                    <div className="px-4 py-3 bg-[rgb(247,247,249)] border border-slate-200 border-l-0 rounded-r-lg text-[rgb(134,142,150)]">
                      .rosterup.com
                    </div>
                  </div>
                  <p className="text-sm text-[rgb(134,142,150)] mt-2">
                    This will be your public website URL
                  </p>
                  {error && (
                    <p className="text-sm text-red-600 mt-2">{error}</p>
                  )}
                </div>

                <div className="bg-[rgb(0,113,227)]/5 border border-[rgb(0,113,227)]/20 rounded-lg p-4">
                  <h3 className="text-[rgb(29,29,31)] font-semibold mb-2">What's included:</h3>
                  <ul className="space-y-2 text-sm text-[rgb(29,29,31)]">
                    <li className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-[rgb(0,113,227)] rounded-full"></div>
                      <span>Drag-and-drop page builder</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-[rgb(0,113,227)] rounded-full"></div>
                      <span>Multiple page templates</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-[rgb(0,113,227)] rounded-full"></div>
                      <span>Auto-sync team rosters and schedules</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-[rgb(0,113,227)] rounded-full"></div>
                      <span>Custom branding and colors</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-[rgb(0,113,227)] rounded-full"></div>
                      <span>Mobile-responsive design</span>
                    </li>
                  </ul>
                </div>

                <button
                  onClick={createWebsite}
                  disabled={!subdomain || saving}
                  className="w-full py-3 bg-[rgb(0,113,227)] text-white font-semibold rounded-lg hover:bg-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-sm hover:shadow-md"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5" />
                      <span>Create Website</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[rgb(247,247,249)] pt-32 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold text-[rgb(29,29,31)] mb-2">Website Builder</h1>
            <p className="text-[rgb(134,142,150)]">
              Create and manage your organization's website
            </p>
            {website && (
              <div className="flex items-center space-x-4 mt-3">
                <a
                  href={`https://${website.subdomain}.rosterup.com`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[rgb(0,113,227)] hover:text-blue-600 text-sm flex items-center space-x-1"
                >
                  <span>{website.subdomain}.rosterup.com</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
                {website.is_published && (
                  <span className="px-3 py-1 bg-green-50 border border-green-200 text-green-600 text-xs font-medium rounded-full">
                    Published
                  </span>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={togglePublish}
              disabled={saving}
              className={`px-5 py-3 font-medium rounded-lg transition-all flex items-center space-x-2 shadow-sm ${
                website?.is_published
                  ? 'bg-white border border-slate-200 text-[rgb(29,29,31)] hover:bg-[rgb(247,247,249)]'
                  : 'bg-green-500 text-white hover:bg-green-600 hover:shadow-md'
              }`}
            >
              {saving ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
              <span>{website?.is_published ? 'Unpublish' : 'Publish'}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-[rgb(29,29,31)]">Pages</h2>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowTemplateSelector(true)}
                    className="px-4 py-2 bg-[rgb(0,113,227)] text-white rounded-lg hover:bg-blue-600 transition-all flex items-center space-x-2 shadow-sm hover:shadow-md"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Page</span>
                  </button>
                </div>
              </div>

              {pages.length === 0 ? (
                <div className="text-center py-12">
                  <Layout className="w-12 h-12 text-[rgb(134,142,150)] mx-auto mb-3" />
                  <p className="text-[rgb(134,142,150)]">No pages yet. Create your first page!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pages.map((page) => (
                    <button
                      key={page.id}
                      onClick={() => navigate(`/website-builder/page/${page.id}`)}
                      className="w-full bg-[rgb(247,247,249)] rounded-lg p-4 border border-slate-200 hover:border-[rgb(0,113,227)]/30 hover:shadow-sm transition-all text-left"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Layout className="w-5 h-5 text-[rgb(134,142,150)]" />
                          <div>
                            <h3 className="text-[rgb(29,29,31)] font-medium">{page.title}</h3>
                            <p className="text-sm text-[rgb(134,142,150)]">/{page.slug || ''}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {page.is_home && (
                            <span className="px-2 py-1 bg-[rgb(0,113,227)]/10 border border-[rgb(0,113,227)]/20 text-[rgb(0,113,227)] text-xs font-medium rounded">
                              Home
                            </span>
                          )}
                          {page.is_published ? (
                            <span className="px-2 py-1 bg-green-50 border border-green-200 text-green-600 text-xs font-medium rounded">
                              Published
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-slate-200 text-[rgb(134,142,150)] text-xs font-medium rounded">
                              Draft
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-[rgb(29,29,31)] mb-6">Available Content Blocks</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {blockTypes.map((block) => {
                  const Icon = block.icon;
                  return (
                    <div
                      key={block.type}
                      className="bg-[rgb(247,247,249)] rounded-lg p-4 border border-slate-200 hover:border-[rgb(0,113,227)]/30 hover:shadow-sm transition-all cursor-pointer"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-[rgb(0,113,227)] rounded-lg flex items-center justify-center flex-shrink-0">
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-[rgb(29,29,31)] font-medium mb-1">{block.label}</h3>
                          <p className="text-sm text-[rgb(134,142,150)]">{block.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center space-x-2 mb-6">
                <Settings className="w-5 h-5 text-[rgb(134,142,150)]" />
                <h2 className="text-xl font-bold text-[rgb(29,29,31)]">Website Settings</h2>
              </div>
              <div className="space-y-4">
                <button className="w-full px-4 py-3 bg-[rgb(247,247,249)] border border-slate-200 text-[rgb(29,29,31)] rounded-lg hover:border-[rgb(0,113,227)]/30 hover:shadow-sm transition-all text-left flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Palette className="w-5 h-5 text-[rgb(134,142,150)]" />
                    <span>Theme & Colors</span>
                  </div>
                  <span className="text-[rgb(134,142,150)]">→</span>
                </button>
                <button className="w-full px-4 py-3 bg-[rgb(247,247,249)] border border-slate-200 text-[rgb(29,29,31)] rounded-lg hover:border-[rgb(0,113,227)]/30 hover:shadow-sm transition-all text-left flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Code className="w-5 h-5 text-[rgb(134,142,150)]" />
                    <span>Custom CSS</span>
                  </div>
                  <span className="text-[rgb(134,142,150)]">→</span>
                </button>
                <button className="w-full px-4 py-3 bg-[rgb(247,247,249)] border border-slate-200 text-[rgb(29,29,31)] rounded-lg hover:border-[rgb(0,113,227)]/30 hover:shadow-sm transition-all text-left flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Globe className="w-5 h-5 text-[rgb(134,142,150)]" />
                    <span>Domain Settings</span>
                  </div>
                  <span className="text-[rgb(134,142,150)]">→</span>
                </button>
                <button
                  onClick={handleDeleteWebsite}
                  disabled={saving}
                  className="w-full px-4 py-3 bg-red-50 border border-red-200 text-red-600 rounded-lg hover:bg-red-100 transition-all text-left flex items-center justify-between disabled:opacity-50"
                >
                  <div className="flex items-center space-x-3">
                    <Trash2 className="w-5 h-5" />
                    <span>Delete Website</span>
                  </div>
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                </button>
              </div>
            </div>

            <div className="bg-[rgb(0,113,227)]/5 border border-[rgb(0,113,227)]/20 rounded-xl p-6">
              <h3 className="text-[rgb(29,29,31)] font-semibold mb-2">Need Help?</h3>
              <p className="text-[rgb(134,142,150)] text-sm mb-4">
                Check out our website builder guide to learn how to create stunning pages.
              </p>
              <button className="text-[rgb(0,113,227)] hover:text-blue-600 text-sm font-medium">
                View Documentation →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Create Page Modal */}
      {showCreatePage && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-xl p-6 max-w-md w-full shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[rgb(29,29,31)]">Create New Page</h2>
              <button
                onClick={() => {
                  setShowCreatePage(false);
                  setNewPageTitle('');
                  setNewPageSlug('');
                  setError('');
                }}
                className="text-[rgb(134,142,150)] hover:text-[rgb(29,29,31)] transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[rgb(29,29,31)] mb-2">
                  Page Title
                </label>
                <input
                  type="text"
                  value={newPageTitle}
                  onChange={(e) => setNewPageTitle(e.target.value)}
                  placeholder="About Us"
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-[rgb(29,29,31)] placeholder-[rgb(134,142,150)] focus:outline-none focus:border-[rgb(0,113,227)] focus:ring-2 focus:ring-[rgb(0,113,227)]/20"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[rgb(29,29,31)] mb-2">
                  URL Slug (optional)
                </label>
                <input
                  type="text"
                  value={newPageSlug}
                  onChange={(e) => setNewPageSlug(e.target.value)}
                  placeholder="about-us"
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-[rgb(29,29,31)] placeholder-[rgb(134,142,150)] focus:outline-none focus:border-[rgb(0,113,227)] focus:ring-2 focus:ring-[rgb(0,113,227)]/20"
                />
                <p className="text-xs text-[rgb(134,142,150)] mt-1">
                  Leave blank to auto-generate from title
                </p>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <div className="flex space-x-3 pt-2">
                <button
                  onClick={() => {
                    setShowCreatePage(false);
                    setNewPageTitle('');
                    setNewPageSlug('');
                    setError('');
                  }}
                  className="flex-1 px-4 py-3 bg-white border border-slate-200 text-[rgb(29,29,31)] rounded-lg hover:bg-[rgb(247,247,249)] transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={createPage}
                  disabled={!newPageTitle || saving}
                  className="flex-1 px-4 py-3 bg-[rgb(0,113,227)] text-white font-semibold rounded-lg hover:bg-blue-600 hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-sm"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <span>Create Page</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Template Selector Modal */}
      {showTemplateSelector && (
        <TemplateSelector
          onSelect={handleTemplateSelect}
          onClose={() => setShowTemplateSelector(false)}
        />
      )}
    </div>
  );
}
