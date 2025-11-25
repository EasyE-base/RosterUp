import { useRef, useEffect } from 'react';
import InlineEditor from '../InlineEditor';
import SectionWrapper from '../SectionWrapper';
import ScrollReveal from '../../../animations/ScrollReveal';
import { useTheme, useThemeAnimations } from '../../../../contexts/ThemeContext';
import { getHeadingClasses, getBodyClasses } from '../../../../lib/typography-presets';
import { motion } from 'framer-motion';
import { applyElementOverrides } from '../../../../lib/applyElementOverrides';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

interface ContactSectionProps {
  sectionId: string;
  content: {
    title: string;
    subtitle: string;
    email: string;
    phone: string;
    address: string;
    social_links?: {
      facebook?: string;
      instagram?: string;
      twitter?: string;
    };
    submit_text?: string;
    element_overrides?: Record<string, Record<string, string>>;
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

export default function ContactSection({
  sectionId: _sectionId,
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
}: ContactSectionProps) {
  const { theme, typography } = useTheme();
  const animations = useThemeAnimations();
  const sectionRef = useRef<HTMLDivElement>(null);

  // Apply element style overrides
  useEffect(() => {
    const elementOverrides = content.element_overrides;
    if (sectionRef.current && elementOverrides) {
      applyElementOverrides(sectionRef.current, elementOverrides);
    }
  }, [content.element_overrides]);

  // Defensive coding: provide fallback values for required fields
  const safeTitle = content?.title || 'Get In Touch';
  const safeSubtitle = content?.subtitle || 'Have questions? We\'d love to hear from you';
  const safeEmail = content?.email || 'info@example.com';
  const safePhone = content?.phone || '(555) 123-4567';
  const safeAddress = content?.address || '123 Main St, City, State 12345';
  const safeSubmitText = content?.submit_text || 'Send Message';

  const updateField = (field: string, value: any) => {
    onUpdate({ ...content, [field]: value });
  };

  const headingClasses = getHeadingClasses(typography, 'h2', 'bold', 'tight');
  const subheadingClasses = getBodyClasses(typography, 'lg', 'normal');

  return (
    <SectionWrapper
      editMode={editMode}
      sectionName="Contact Us"
      onDuplicate={onDuplicate}
      onDelete={onDelete}
      onSettings={onSettings}
      onMoveUp={onMoveUp}
      onMoveDown={onMoveDown}
      canMoveUp={canMoveUp}
      canMoveDown={canMoveDown}
    >
      <div
        ref={sectionRef}
        className={`relative py-20 ${theme.spacing.sectionPadding}`}
        style={{
          backgroundColor: theme.colors.primary,
          ...styles,
        }}
      >
        <div className={`${theme.spacing.containerMaxWidth} mx-auto`}>
          <ScrollReveal direction="up" delay={0.1} duration={animations.duration / 1000}>
            <div className="text-center mb-16 space-y-4">
              <InlineEditor
                value={safeTitle}
                onChange={(val) => updateField('title', val)}
                type="heading"
                editMode={editMode}
                className={headingClasses}
                style={{ color: theme.colors.textInverse }}
              />
              <InlineEditor
                value={safeSubtitle}
                onChange={(val) => updateField('subtitle', val)}
                type="text"
                editMode={editMode}
                className={`${subheadingClasses} max-w-2xl mx-auto`}
                style={{ color: theme.colors.textInverse, opacity: 0.9 }}
              />
            </div>
          </ScrollReveal>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Contact Information */}
            <ScrollReveal direction="left" delay={0.2} duration={animations.duration / 1000}>
              <div className="space-y-6">
                {/* Email */}
                <motion.div
                  className="flex items-start gap-6 p-6 rounded-2xl backdrop-blur-sm border border-white/10"
                  style={{ background: `${theme.colors.textInverse}08` }}
                  whileHover={{ x: editMode ? 0 : 5, backgroundColor: `${theme.colors.textInverse}12` }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="p-4 rounded-xl shrink-0" style={{ backgroundColor: theme.colors.accent }}>
                    <Mail className="w-6 h-6" style={{ color: theme.colors.textInverse }} />
                  </div>
                  <div>
                    <p className="text-sm uppercase tracking-wider font-semibold mb-1" style={{ color: theme.colors.textInverse, opacity: 0.7 }}>Email</p>
                    <InlineEditor
                      value={safeEmail}
                      onChange={(val) => updateField('email', val)}
                      type="email"
                      editMode={editMode}
                      className="text-xl font-bold break-all"
                      style={{ color: theme.colors.textInverse }}
                    />
                  </div>
                </motion.div>

                {/* Phone */}
                <motion.div
                  className="flex items-start gap-6 p-6 rounded-2xl backdrop-blur-sm border border-white/10"
                  style={{ background: `${theme.colors.textInverse}08` }}
                  whileHover={{ x: editMode ? 0 : 5, backgroundColor: `${theme.colors.textInverse}12` }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="p-4 rounded-xl shrink-0" style={{ backgroundColor: theme.colors.accent }}>
                    <Phone className="w-6 h-6" style={{ color: theme.colors.textInverse }} />
                  </div>
                  <div>
                    <p className="text-sm uppercase tracking-wider font-semibold mb-1" style={{ color: theme.colors.textInverse, opacity: 0.7 }}>Phone</p>
                    <InlineEditor
                      value={safePhone}
                      onChange={(val) => updateField('phone', val)}
                      type="phone"
                      editMode={editMode}
                      className="text-xl font-bold"
                      style={{ color: theme.colors.textInverse }}
                    />
                  </div>
                </motion.div>

                {/* Address */}
                <motion.div
                  className="flex items-start gap-6 p-6 rounded-2xl backdrop-blur-sm border border-white/10"
                  style={{ background: `${theme.colors.textInverse}08` }}
                  whileHover={{ x: editMode ? 0 : 5, backgroundColor: `${theme.colors.textInverse}12` }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="p-4 rounded-xl shrink-0" style={{ backgroundColor: theme.colors.accent }}>
                    <MapPin className="w-6 h-6" style={{ color: theme.colors.textInverse }} />
                  </div>
                  <div>
                    <p className="text-sm uppercase tracking-wider font-semibold mb-1" style={{ color: theme.colors.textInverse, opacity: 0.7 }}>Address</p>
                    <InlineEditor
                      value={safeAddress}
                      onChange={(val) => updateField('address', val)}
                      type="text"
                      editMode={editMode}
                      className="text-xl font-bold"
                      style={{ color: theme.colors.textInverse }}
                    />
                  </div>
                </motion.div>
              </div>
            </ScrollReveal>

            {/* Contact Form */}
            <ScrollReveal direction="right" delay={0.3} duration={animations.duration / 1000}>
              <motion.div
                className="rounded-3xl p-8 lg:p-10 shadow-2xl"
                style={{
                  background: theme.colors.background,
                  border: `1px solid ${theme.colors.text}10`,
                }}
              >
                <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.text }}>Name</label>
                    <input
                      type="text"
                      placeholder="Your Name"
                      className="w-full px-4 py-3 rounded-xl transition-all focus:ring-2 focus:ring-opacity-50 outline-none"
                      style={{
                        backgroundColor: `${theme.colors.text}05`,
                        border: `1px solid ${theme.colors.text}20`,
                        color: theme.colors.text,
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.text }}>Email</label>
                    <input
                      type="email"
                      placeholder="Email Address"
                      className="w-full px-4 py-3 rounded-xl transition-all focus:ring-2 focus:ring-opacity-50 outline-none"
                      style={{
                        backgroundColor: `${theme.colors.text}05`,
                        border: `1px solid ${theme.colors.text}20`,
                        color: theme.colors.text,
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.text }}>Message</label>
                    <textarea
                      placeholder="How can we help?"
                      rows={4}
                      className="w-full px-4 py-3 rounded-xl transition-all resize-none focus:ring-2 focus:ring-opacity-50 outline-none"
                      style={{
                        backgroundColor: `${theme.colors.text}05`,
                        border: `1px solid ${theme.colors.text}20`,
                        color: theme.colors.text,
                      }}
                    />
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all"
                    style={{
                      backgroundColor: theme.colors.accent,
                      color: theme.colors.textInverse,
                    }}
                  >
                    <Send className="w-5 h-5" />
                    <InlineEditor
                      value={safeSubmitText}
                      onChange={(val) => updateField('submit_text', val)}
                      type="button"
                      editMode={editMode}
                      className="inline bg-transparent"
                      style={{ color: theme.colors.textInverse }}
                    />
                  </motion.button>
                </form>
              </motion.div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
