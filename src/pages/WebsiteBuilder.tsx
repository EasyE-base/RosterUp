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
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, OrganizationWebsite, WebsitePage } from '../lib/supabase';

export default function WebsiteBuilder() {
  const { organization } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [website, setWebsite] = useState<OrganizationWebsite | null>(null);
  const [pages, setPages] = useState<WebsitePage[]>([]);
  const [showCreateWebsite, setShowCreateWebsite] = useState(false);
  const [subdomain, setSubdomain] = useState('');
  const [error, setError] = useState('');

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

      await supabase
        .from('organizations')
        .update({ website_enabled: true, website_subdomain: cleanSubdomain })
        .eq('id', organization.id);

      setWebsite(websiteData as OrganizationWebsite);
      setShowCreateWebsite(false);
      await loadPages(websiteData.id);
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
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (showCreateWebsite) {
    return (
      <div className="min-h-screen bg-slate-950 pt-20 pb-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">Create Your Website</h1>
              <p className="text-slate-400">
                Build a professional website for your organization
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Choose Your Subdomain
                </label>
                <div className="flex items-center">
                  <input
                    type="text"
                    value={subdomain}
                    onChange={(e) => setSubdomain(e.target.value)}
                    placeholder="your-organization"
                    className="flex-1 px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-l-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                  <div className="px-4 py-3 bg-slate-800 border border-slate-700 border-l-0 rounded-r-lg text-slate-400">
                    .rosterup.com
                  </div>
                </div>
                <p className="text-sm text-slate-500 mt-2">
                  This will be your public website URL
                </p>
                {error && (
                  <p className="text-sm text-red-400 mt-2">{error}</p>
                )}
              </div>

              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <h3 className="text-white font-semibold mb-2">What's included:</h3>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                    <span>Drag-and-drop page builder</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                    <span>Multiple page templates</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                    <span>Auto-sync team rosters and schedules</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                    <span>Custom branding and colors</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                    <span>Mobile-responsive design</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={createWebsite}
                disabled={!subdomain || saving}
                className="w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
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
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Website Builder</h1>
            <p className="text-slate-400">
              Create and manage your organization's website
            </p>
            {website && (
              <div className="flex items-center space-x-4 mt-3">
                <a
                  href={`https://${website.subdomain}.rosterup.com`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 text-sm flex items-center space-x-1"
                >
                  <span>{website.subdomain}.rosterup.com</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
                {website.is_published && (
                  <span className="px-3 py-1 bg-green-500/20 border border-green-500/50 text-green-400 text-xs font-medium rounded-full">
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
              className={`px-5 py-3 font-medium rounded-lg transition-all flex items-center space-x-2 ${
                website?.is_published
                  ? 'bg-slate-800/50 border border-slate-700 text-white hover:bg-slate-800'
                  : 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:shadow-lg hover:shadow-green-500/50'
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
            <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white">Pages</h2>
                <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all flex items-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span>Add Page</span>
                </button>
              </div>

              {pages.length === 0 ? (
                <div className="text-center py-12">
                  <Layout className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400">No pages yet. Create your first page!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pages.map((page) => (
                    <button
                      key={page.id}
                      onClick={() => navigate(`/website-builder/page/${page.id}`)}
                      className="w-full bg-slate-800/50 rounded-lg p-4 border border-slate-700/50 hover:border-blue-500/50 transition-all text-left"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Layout className="w-5 h-5 text-slate-400" />
                          <div>
                            <h3 className="text-white font-medium">{page.title}</h3>
                            <p className="text-sm text-slate-400">/{page.slug || ''}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {page.is_home && (
                            <span className="px-2 py-1 bg-blue-500/20 border border-blue-500/50 text-blue-400 text-xs font-medium rounded">
                              Home
                            </span>
                          )}
                          {page.is_published ? (
                            <span className="px-2 py-1 bg-green-500/20 border border-green-500/50 text-green-400 text-xs font-medium rounded">
                              Published
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-slate-700 text-slate-400 text-xs font-medium rounded">
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

            <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-6">Available Content Blocks</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {blockTypes.map((block) => {
                  const Icon = block.icon;
                  return (
                    <div
                      key={block.type}
                      className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50 hover:border-blue-500/50 transition-all cursor-pointer"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-white font-medium mb-1">{block.label}</h3>
                          <p className="text-sm text-slate-400">{block.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-6">
              <div className="flex items-center space-x-2 mb-6">
                <Settings className="w-5 h-5 text-slate-400" />
                <h2 className="text-xl font-bold text-white">Website Settings</h2>
              </div>
              <div className="space-y-4">
                <button className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 text-white rounded-lg hover:bg-slate-800 transition-all text-left flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Palette className="w-5 h-5 text-slate-400" />
                    <span>Theme & Colors</span>
                  </div>
                  <span className="text-slate-500">→</span>
                </button>
                <button className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 text-white rounded-lg hover:bg-slate-800 transition-all text-left flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Code className="w-5 h-5 text-slate-400" />
                    <span>Custom CSS</span>
                  </div>
                  <span className="text-slate-500">→</span>
                </button>
                <button className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 text-white rounded-lg hover:bg-slate-800 transition-all text-left flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Globe className="w-5 h-5 text-slate-400" />
                    <span>Domain Settings</span>
                  </div>
                  <span className="text-slate-500">→</span>
                </button>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-500/10 to-cyan-400/10 border border-blue-500/20 rounded-xl p-6">
              <h3 className="text-white font-semibold mb-2">Need Help?</h3>
              <p className="text-slate-300 text-sm mb-4">
                Check out our website builder guide to learn how to create stunning pages.
              </p>
              <button className="text-blue-400 hover:text-blue-300 text-sm font-medium">
                View Documentation →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
