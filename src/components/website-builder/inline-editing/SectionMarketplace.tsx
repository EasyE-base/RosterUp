import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Search,
  Layout,
  Image as ImageIcon,
  Calendar,
  Mail,
  Trophy,
  Users,
  Sparkles,
  Zap,
  Star,
  Menu as MenuIcon,
} from 'lucide-react';

interface SectionTemplate {
  id: string;
  name: string;
  description: string;
  category: 'hero' | 'content' | 'gallery' | 'schedule' | 'contact' | 'commitments' | 'navigation';
  icon: any;
  preview: string; // Color scheme preview
  isPremium?: boolean;
  isNew?: boolean;
}

interface SectionMarketplaceProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSection: (sectionType: string) => void;
}

const sectionTemplates: SectionTemplate[] = [
  {
    id: 'navigation-center-logo',
    name: 'Center Logo Navigation',
    description: 'Professional nav with center logo, social links, and split menu',
    category: 'navigation',
    icon: MenuIcon,
    preview: 'linear-gradient(135deg, #003087 0%, #0047BB 100%)',
    isNew: true,
  },
  {
    id: 'hero-modern',
    name: 'Modern Hero',
    description: 'Full-screen hero with gradient background and CTA',
    category: 'hero',
    icon: Layout,
    preview: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    isNew: true,
  },
  {
    id: 'hero-video',
    name: 'Video Hero',
    description: 'Hero section with background video support',
    category: 'hero',
    icon: Layout,
    preview: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    isPremium: true,
  },
  {
    id: 'hero-split',
    name: 'Split Hero',
    description: 'Hero with image on one side, content on other',
    category: 'hero',
    icon: Layout,
    preview: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  },
  {
    id: 'schedule-modern',
    name: 'Schedule & Events',
    description: 'Display games and events with filters',
    category: 'schedule',
    icon: Calendar,
    preview: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  },
  {
    id: 'commitments',
    name: 'Player Commitments',
    description: 'Showcase college commitments with filters',
    category: 'commitments',
    icon: Trophy,
    preview: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    isNew: true,
  },
  {
    id: 'contact-form',
    name: 'Contact Form',
    description: 'Get in touch section with contact info',
    category: 'contact',
    icon: Mail,
    preview: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
  },
  {
    id: 'gallery-grid',
    name: 'Photo Gallery',
    description: 'Responsive grid of images',
    category: 'gallery',
    icon: ImageIcon,
    preview: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    isPremium: true,
  },
  {
    id: 'team-roster',
    name: 'Team Roster',
    description: 'Display team members with photos and bios',
    category: 'content',
    icon: Users,
    preview: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
  },
];

const categories = [
  { id: 'all', name: 'All Sections', icon: Sparkles },
  { id: 'navigation', name: 'Navigation', icon: MenuIcon },
  { id: 'hero', name: 'Hero', icon: Layout },
  { id: 'content', name: 'Content', icon: Users },
  { id: 'schedule', name: 'Schedule', icon: Calendar },
  { id: 'contact', name: 'Contact', icon: Mail },
  { id: 'commitments', name: 'Commitments', icon: Trophy },
  { id: 'gallery', name: 'Gallery', icon: ImageIcon },
];

export default function SectionMarketplace({
  isOpen,
  onClose,
  onSelectSection,
}: SectionMarketplaceProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);

  const filteredSections = sectionTemplates.filter((section) => {
    const matchesCategory = selectedCategory === 'all' || section.category === selectedCategory;
    const matchesSearch =
      section.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      section.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleSelectSection = (sectionId: string) => {
    onSelectSection(sectionId);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-4 md:inset-8 lg:inset-16 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-2xl z-[9999] flex flex-col overflow-hidden border-2 border-slate-700"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-700 bg-gradient-to-r from-slate-900 to-slate-800">
              <div>
                <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                  <Sparkles className="w-8 h-8 text-blue-400" />
                  Section Marketplace
                </h2>
                <p className="text-slate-400 mt-1">
                  Choose a section to add to your page
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>

            {/* Search & Categories */}
            <div className="p-6 border-b border-slate-700 space-y-4 bg-slate-900/50">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search sections..."
                  className="w-full pl-12 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all"
                />
              </div>

              {/* Category Tabs */}
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {categories.map((category) => {
                  const Icon = category.icon;
                  const isActive = selectedCategory === category.id;

                  return (
                    <motion.button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Icon className="w-4 h-4" />
                      {category.name}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Section Grid */}
            <div className="flex-1 overflow-y-auto p-6">
              {filteredSections.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <Search className="w-16 h-16 text-slate-600 mb-4" />
                  <h3 className="text-xl font-semibold text-slate-400 mb-2">No sections found</h3>
                  <p className="text-slate-500">
                    Try adjusting your search or select a different category
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredSections.map((section, index) => {
                    const Icon = section.icon;
                    const isHovered = hoveredSection === section.id;

                    return (
                      <motion.button
                        key={section.id}
                        onClick={() => handleSelectSection(section.id)}
                        onMouseEnter={() => setHoveredSection(section.id)}
                        onMouseLeave={() => setHoveredSection(null)}
                        className="group relative bg-slate-800 rounded-xl overflow-hidden border-2 border-slate-700 hover:border-blue-500 transition-all text-left"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ y: -4, boxShadow: '0 20px 40px rgba(59, 130, 246, 0.3)' }}
                      >
                        {/* Preview Banner */}
                        <div
                          className="h-32 relative overflow-hidden"
                          style={{ background: section.preview }}
                        >
                          {/* Animated Gradient Overlay */}
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"
                            animate={{
                              opacity: isHovered ? 1 : 0.5,
                            }}
                            transition={{ duration: 0.3 }}
                          />

                          {/* Icon */}
                          <div className="absolute top-4 left-4 p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                            <Icon className="w-6 h-6 text-white" />
                          </div>

                          {/* Badges */}
                          <div className="absolute top-4 right-4 flex gap-2">
                            {section.isNew && (
                              <motion.div
                                className="px-2 py-1 bg-green-500 text-white text-xs font-bold rounded-full flex items-center gap-1"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2 }}
                              >
                                <Zap className="w-3 h-3" />
                                NEW
                              </motion.div>
                            )}
                            {section.isPremium && (
                              <motion.div
                                className="px-2 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold rounded-full flex items-center gap-1"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.3 }}
                              >
                                <Star className="w-3 h-3" />
                                PRO
                              </motion.div>
                            )}
                          </div>

                          {/* Hover Overlay */}
                          <AnimatePresence>
                            {isHovered && (
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end justify-center pb-4"
                              >
                                <span className="text-white font-semibold">Click to Add</span>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* Content */}
                        <div className="p-4">
                          <h3 className="text-lg font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">
                            {section.name}
                          </h3>
                          <p className="text-sm text-slate-400 line-clamp-2">
                            {section.description}
                          </p>
                        </div>

                        {/* Bottom Shine Effect */}
                        <motion.div
                          className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-600"
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: isHovered ? 1 : 0 }}
                          transition={{ duration: 0.3 }}
                        />
                      </motion.button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-700 bg-slate-900/50 flex items-center justify-between">
              <p className="text-sm text-slate-400">
                {filteredSections.length} {filteredSections.length === 1 ? 'section' : 'sections'}{' '}
                available
              </p>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
