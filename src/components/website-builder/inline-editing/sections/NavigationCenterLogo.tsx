import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import InlineEditor from '../InlineEditor';
import SectionWrapper from '../SectionWrapper';
import { Menu, X, Facebook, Twitter, Instagram, User, Link2 } from 'lucide-react';
import { typography, spacing } from '../../../../lib/designTokens';
import { applyElementOverrides } from '../../../../lib/applyElementOverrides';

interface NavItem {
  label: string;
  link: string;
}

interface SocialLink {
  platform: 'facebook' | 'twitter' | 'instagram';
  url: string;
}

interface NavigationCenterLogoProps {
  sectionId: string;
  content: {
    // Top bar
    social_links?: SocialLink[];
    top_right_text?: string;
    top_right_link?: string;

    // Main navigation
    left_nav_items: NavItem[];
    right_nav_items: NavItem[];
    logo_url?: string;
    logo_text?: string;

    // Styling
    top_bar_bg_color?: string;
    nav_bg_color?: string;
    nav_text_color?: string;
    sticky?: boolean;
  };
  styles?: Record<string, any>;
  editMode: boolean;
  onUpdate: (content: Record<string, any>) => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
  onSettings?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
}

/**
 * Professional Navigation with Center Logo
 *
 * Features:
 * - Two-tier navigation (top bar + main nav)
 * - Center logo with split menu items
 * - Social media icons
 * - Sticky header option
 * - Responsive mobile menu
 * - Smooth animations
 */
export default function NavigationCenterLogo({
  sectionId,
  content,
  styles = {},
  editMode,
  onUpdate,
  onDuplicate,
  onDelete,
  onSettings,
  onMoveUp,
  onMoveDown,
  canMoveUp = true,
  canMoveDown = true,
}: NavigationCenterLogoProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSocialModal, setShowSocialModal] = useState(false);
  const [showNavLinkModal, setShowNavLinkModal] = useState(false);
  const [showEditLinkModal, setShowEditLinkModal] = useState(false);
  const [navLinkSide, setNavLinkSide] = useState<'left' | 'right'>('left');
  const [editingLinkIndex, setEditingLinkIndex] = useState<number>(-1);
  const [newSocial, setNewSocial] = useState<{ platform: 'facebook' | 'twitter' | 'instagram'; url: string }>({
    platform: 'facebook',
    url: ''
  });
  const [newNavLink, setNewNavLink] = useState<{ label: string; link: string }>({
    label: '',
    link: ''
  });
  const [editLinkUrl, setEditLinkUrl] = useState('');
  const navRef = useRef<HTMLElement>(null);

  // Apply element style overrides on mount and when content changes
  useEffect(() => {
    const elementOverrides = content.element_overrides;
    if (navRef.current && elementOverrides) {
      applyElementOverrides(navRef.current, elementOverrides);
    }
  }, [content.element_overrides]);

  const updateField = (field: string, value: any) => {
    onUpdate({ ...content, [field]: value });
  };

  const updateNavItem = (side: 'left' | 'right', index: number, field: keyof NavItem, value: string) => {
    const items = side === 'left' ? [...content.left_nav_items] : [...content.right_nav_items];
    items[index] = { ...items[index], [field]: value };
    updateField(side === 'left' ? 'left_nav_items' : 'right_nav_items', items);
  };

  const addNavItem = (side: 'left' | 'right') => {
    const items = side === 'left' ? [...content.left_nav_items] : [...content.right_nav_items];
    items.push({ label: 'NEW LINK', link: '#' });
    updateField(side === 'left' ? 'left_nav_items' : 'right_nav_items', items);
  };

  const removeNavItem = (side: 'left' | 'right', index: number) => {
    const items = side === 'left' ? [...content.left_nav_items] : [...content.right_nav_items];
    items.splice(index, 1);
    updateField(side === 'left' ? 'left_nav_items' : 'right_nav_items', items);
  };

  const handleAddSocial = () => {
    if (!newSocial.url.trim()) return;
    const newSocials = [...(content.social_links || []), newSocial];
    updateField('social_links', newSocials);
    setShowSocialModal(false);
    setNewSocial({ platform: 'facebook', url: '' });
  };

  const handleAddNavLink = () => {
    if (!newNavLink.label.trim()) return;
    const items = navLinkSide === 'left' ? [...content.left_nav_items] : [...content.right_nav_items];
    items.push(newNavLink);
    updateField(navLinkSide === 'left' ? 'left_nav_items' : 'right_nav_items', items);
    setShowNavLinkModal(false);
    setNewNavLink({ label: '', link: '' });
  };

  const handleEditLinkClick = (side: 'left' | 'right', index: number) => {
    const items = side === 'left' ? content.left_nav_items : content.right_nav_items;
    setNavLinkSide(side);
    setEditingLinkIndex(index);
    setEditLinkUrl(items[index].link);
    setShowEditLinkModal(true);
  };

  const handleSaveEditLink = () => {
    if (!editLinkUrl.trim()) return;
    updateNavItem(navLinkSide, editingLinkIndex, 'link', editLinkUrl);
    setShowEditLinkModal(false);
    setEditLinkUrl('');
    setEditingLinkIndex(-1);
  };

  // Default values
  const topBarBg = content.top_bar_bg_color || 'rgba(255, 255, 255, 0.95)';
  const navBg = content.nav_bg_color || 'rgba(15, 23, 42, 0.95)';
  const navTextColor = content.nav_text_color || '#ffffff';
  const sticky = true; // Always sticky

  const socialIcons = {
    facebook: Facebook,
    twitter: Twitter,
    instagram: Instagram,
  };

  return (
    <SectionWrapper
      editMode={editMode}
      sectionName="Navigation - Center Logo"
      onDuplicate={onDuplicate}
      onDelete={onDelete}
      onSettings={onSettings}
      onMoveUp={onMoveUp}
      onMoveDown={onMoveDown}
      canMoveUp={canMoveUp}
      canMoveDown={canMoveDown}
      zIndex={100}
    >
      <header
        ref={navRef}
        className={`w-full sticky top-0 z-[100]`}
        style={styles}
      >
        {/* Top Bar - Only show if there's content */}
        {((content.social_links && content.social_links.length > 0) || content.top_right_text || editMode) && (
          <div
            className="w-full py-2 px-8 border-b border-gray-200"
            style={{ backgroundColor: topBarBg }}
          >
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              {/* Social Links */}
              <div className="flex items-center gap-4">
                {content.social_links?.map((social, index) => {
                  const Icon = socialIcons[social.platform];
                  return (
                    <a
                      key={index}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      <Icon className="w-5 h-5" />
                    </a>
                  );
                })}

                {editMode && (
                  <button
                    onClick={() => setShowSocialModal(true)}
                    className="text-xs px-2 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                  >
                    + Add Social
                  </button>
                )}
              </div>

              {/* Top Right Link */}
              <div className="flex items-center gap-2">
                {content.top_right_text && <User className="w-4 h-4 text-gray-600" />}
                {editMode ? (
                  <InlineEditor
                    value={content.top_right_text || ''}
                    onChange={(val) => updateField('top_right_text', val)}
                    type="text"
                    editMode={editMode}
                    className="text-sm text-gray-700 hover:text-blue-600"
                    placeholder="Add top right text..."
                  />
                ) : content.top_right_text ? (
                  <a
                    href={content.top_right_link || '#'}
                    className="text-sm text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    {content.top_right_text}
                  </a>
                ) : null}
              </div>
            </div>
          </div>
        )}

        {/* Main Navigation */}
        <nav
          className="w-full py-4 px-8 border-b border-slate-700/30 shadow-sm"
          style={{ backgroundColor: navBg }}
        >
          <div className="max-w-7xl mx-auto">
            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center justify-between">
              {/* Left Navigation Items */}
              <div className="flex items-center gap-8">
                {content.left_nav_items.map((item, index) => (
                  <div key={index} className="relative group">
                    {editMode ? (
                      <div className="flex items-center gap-2">
                        <InlineEditor
                          value={item.label}
                          onChange={(val) => updateNavItem('left', index, 'label', val)}
                          type="text"
                          editMode={editMode}
                          className="font-bold tracking-wide"
                          style={{
                            color: navTextColor,
                            fontSize: typography.sizes.sm,
                            letterSpacing: '0.05em',
                          }}
                        />
                        <button
                          onClick={() => handleEditLinkClick('left', index)}
                          className="text-blue-400 hover:text-blue-600 text-xs"
                          title="Edit link URL"
                        >
                          <Link2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => removeNavItem('left', index)}
                          className="text-red-400 hover:text-red-600 text-xs"
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <a
                        href={item.link}
                        className="font-bold tracking-wide hover:opacity-80 transition-opacity"
                        style={{
                          color: navTextColor,
                          fontSize: typography.sizes.sm,
                          letterSpacing: '0.05em',
                        }}
                        data-selectable="true"
                        data-element-id={`${sectionId}-left-nav-${index}`}
                        data-element-type="link"
                        data-section-id={sectionId}
                        data-parent-element-id={`${sectionId}-nav-container`}
                      >
                        {item.label}
                      </a>
                    )}
                  </div>
                ))}

                {editMode && (
                  <button
                    onClick={() => {
                      setNavLinkSide('left');
                      setShowNavLinkModal(true);
                    }}
                    className="text-xs px-3 py-1 bg-white/20 rounded hover:bg-white/30 transition-colors"
                    style={{ color: navTextColor }}
                  >
                    + Add Link
                  </button>
                )}
              </div>

              {/* Center Logo */}
              <div className="absolute left-1/2 transform -translate-x-1/2">
                {editMode ? (
                  <InlineEditor
                    value={content.logo_text || ''}
                    onChange={(val) => updateField('logo_text', val)}
                    type="text"
                    editMode={editMode}
                    className="text-2xl font-black tracking-wider"
                    style={{ color: navTextColor }}
                    placeholder="Click to add logo text..."
                  />
                ) : content.logo_text ? (
                  <div
                    className="text-2xl font-black tracking-wider hover:opacity-80 transition-opacity cursor-pointer"
                    style={{ color: navTextColor }}
                    data-selectable="true"
                    data-element-id={`${sectionId}-logo-text`}
                    data-element-type="heading"
                    data-section-id={sectionId}
                  >
                    {content.logo_text}
                  </div>
                ) : null}
              </div>

              {/* Right Navigation Items */}
              <div className="flex items-center gap-8">
                {content.right_nav_items.map((item, index) => (
                  <div key={index} className="relative group">
                    {editMode ? (
                      <div className="flex items-center gap-2">
                        <InlineEditor
                          value={item.label}
                          onChange={(val) => updateNavItem('right', index, 'label', val)}
                          type="text"
                          editMode={editMode}
                          className="font-bold tracking-wide"
                          style={{
                            color: navTextColor,
                            fontSize: typography.sizes.sm,
                            letterSpacing: '0.05em',
                          }}
                        />
                        <button
                          onClick={() => handleEditLinkClick('right', index)}
                          className="text-blue-400 hover:text-blue-600 text-xs"
                          title="Edit link URL"
                        >
                          <Link2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => removeNavItem('right', index)}
                          className="text-red-400 hover:text-red-600 text-xs"
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <a
                        href={item.link}
                        className="font-bold tracking-wide hover:opacity-80 transition-opacity"
                        style={{
                          color: navTextColor,
                          fontSize: typography.sizes.sm,
                          letterSpacing: '0.05em',
                        }}
                        data-selectable="true"
                        data-element-id={`${sectionId}-right-nav-${index}`}
                        data-element-type="link"
                        data-section-id={sectionId}
                        data-parent-element-id={`${sectionId}-nav-container`}
                      >
                        {item.label}
                      </a>
                    )}
                  </div>
                ))}

                {editMode && (
                  <button
                    onClick={() => {
                      setNavLinkSide('right');
                      setShowNavLinkModal(true);
                    }}
                    className="text-xs px-3 py-1 bg-white/20 rounded hover:bg-white/30 transition-colors"
                    style={{ color: navTextColor }}
                  >
                    + Add Link
                  </button>
                )}
              </div>
            </div>

            {/* Mobile Navigation */}
            <div className="lg:hidden flex items-center justify-between">
              {/* Mobile Logo */}
              <div className="text-xl font-black" style={{ color: navTextColor }}>
                {content.logo_text || 'LOGO'}
              </div>

              {/* Mobile Menu Button */}
              <motion.button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                whileTap={{ scale: 0.95 }}
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6" style={{ color: navTextColor }} />
                ) : (
                  <Menu className="w-6 h-6" style={{ color: navTextColor }} />
                )}
              </motion.button>
            </div>

            {/* Mobile Menu Dropdown */}
            <AnimatePresence>
              {mobileMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="lg:hidden mt-4 pb-4 space-y-2"
                >
                  {[...content.left_nav_items, ...content.right_nav_items].map((item, index) => (
                    <motion.a
                      key={index}
                      href={item.link}
                      className="block py-2 px-4 rounded-lg hover:bg-white/10 transition-colors font-semibold"
                      style={{ color: navTextColor }}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      {item.label}
                    </motion.a>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </nav>
      </header>

      {/* Social Link Modal */}
      <AnimatePresence>
        {showSocialModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => setShowSocialModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md"
            >
              <h3 className="text-xl font-bold mb-4 text-gray-900">Add Social Link</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Platform
                  </label>
                  <select
                    value={newSocial.platform}
                    onChange={(e) => setNewSocial({ ...newSocial, platform: e.target.value as 'facebook' | 'twitter' | 'instagram' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="facebook">Facebook</option>
                    <option value="twitter">Twitter</option>
                    <option value="instagram">Instagram</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL
                  </label>
                  <input
                    type="url"
                    value={newSocial.url}
                    onChange={(e) => setNewSocial({ ...newSocial, url: e.target.value })}
                    placeholder="https://facebook.com/yourpage"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setShowSocialModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddSocial}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Save
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation Link Modal */}
      <AnimatePresence>
        {showNavLinkModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => setShowNavLinkModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md"
            >
              <h3 className="text-xl font-bold mb-4 text-gray-900">Add Navigation Link</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Link Label
                  </label>
                  <input
                    type="text"
                    value={newNavLink.label}
                    onChange={(e) => setNewNavLink({ ...newNavLink, label: e.target.value })}
                    placeholder="ABOUT"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Link URL or Page
                  </label>
                  <input
                    type="text"
                    value={newNavLink.link}
                    onChange={(e) => setNewNavLink({ ...newNavLink, link: e.target.value })}
                    placeholder="#about or /about"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setShowNavLinkModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddNavLink}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Save
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Link URL Modal */}
      <AnimatePresence mode="wait">
        {showEditLinkModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => {
              setShowEditLinkModal(false);
              setEditLinkUrl('');
              setEditingLinkIndex(-1);
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-auto my-auto"
            >
              <h3 className="text-xl font-bold mb-4 text-gray-900">Edit Link URL</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Link URL or Page
                  </label>
                  <input
                    type="text"
                    value={editLinkUrl}
                    onChange={(e) => setEditLinkUrl(e.target.value)}
                    placeholder="#about or /about"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    autoFocus
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => {
                      setShowEditLinkModal(false);
                      setEditLinkUrl('');
                      setEditingLinkIndex(-1);
                    }}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEditLink}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Save
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </SectionWrapper>
  );
}
