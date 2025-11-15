import InlineEditor from '../InlineEditor';
import ScrollReveal from '../../../animations/ScrollReveal';
import { useTheme, useThemeAnimations } from '../../../../contexts/ThemeContext';
import { getHeadingClasses, getBodyClasses } from '../../../../lib/typography-presets';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

interface ContactSectionProps {
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
  };
  styles?: Record<string, any>;
  editMode: boolean;
  onUpdate: (content: Record<string, any>) => void;
}

export default function ContactSection({ content, styles = {}, editMode, onUpdate }: ContactSectionProps) {
  const { theme, typography } = useTheme();
  const animations = useThemeAnimations();

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
    <div className={theme.spacing.sectionPadding} style={{ backgroundColor: theme.colors.primary, ...styles }}>
      <div className={`${theme.spacing.containerMaxWidth} mx-auto`}>
        <ScrollReveal direction="up" delay={0.1} duration={animations.duration / 1000}>
          <div className="text-center mb-12 space-y-3">
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
              className={subheadingClasses}
              style={{ color: theme.colors.textInverse, opacity: 0.9 }}
            />
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Contact Information */}
          <ScrollReveal direction="left" delay={0.2} duration={animations.duration / 1000}>
            <div className="space-y-6">
              {/* Email */}
              <motion.div
                className="flex items-start gap-4 p-4 rounded-xl"
                style={{ background: `${theme.colors.textInverse}10` }}
                whileHover={{ x: editMode ? 0 : 5 }}
                transition={{ duration: 0.2 }}
              >
                <div className="p-3 rounded-lg" style={{ backgroundColor: theme.colors.accent }}>
                  <Mail className="w-5 h-5" style={{ color: theme.colors.textInverse }} />
                </div>
                <div>
                  <p className="text-sm uppercase tracking-wide mb-1" style={{ color: theme.colors.textInverse, opacity: 0.7 }}>Email</p>
                  <InlineEditor
                    value={safeEmail}
                    onChange={(val) => updateField('email', val)}
                    type="email"
                    editMode={editMode}
                    className="text-lg font-semibold"
                    style={{ color: theme.colors.accent }}
                  />
                </div>
              </motion.div>

              {/* Phone */}
              <motion.div
                className="flex items-start gap-4 p-4 rounded-xl"
                style={{ background: `${theme.colors.textInverse}10` }}
                whileHover={{ x: editMode ? 0 : 5 }}
                transition={{ duration: 0.2 }}
              >
                <div className="p-3 rounded-lg" style={{ backgroundColor: theme.colors.accent }}>
                  <Phone className="w-5 h-5" style={{ color: theme.colors.textInverse }} />
                </div>
                <div>
                  <p className="text-sm uppercase tracking-wide mb-1" style={{ color: theme.colors.textInverse, opacity: 0.7 }}>Phone</p>
                  <InlineEditor
                    value={safePhone}
                    onChange={(val) => updateField('phone', val)}
                    type="phone"
                    editMode={editMode}
                    className="text-lg font-semibold"
                    style={{ color: theme.colors.accent }}
                  />
                </div>
              </motion.div>

              {/* Address */}
              <motion.div
                className="flex items-start gap-4 p-4 rounded-xl"
                style={{ background: `${theme.colors.textInverse}10` }}
                whileHover={{ x: editMode ? 0 : 5 }}
                transition={{ duration: 0.2 }}
              >
                <div className="p-3 rounded-lg" style={{ backgroundColor: theme.colors.accent }}>
                  <MapPin className="w-5 h-5" style={{ color: theme.colors.textInverse }} />
                </div>
                <div>
                  <p className="text-sm uppercase tracking-wide mb-1" style={{ color: theme.colors.textInverse, opacity: 0.7 }}>Address</p>
                  <InlineEditor
                    value={safeAddress}
                    onChange={(val) => updateField('address', val)}
                    type="text"
                    editMode={editMode}
                    className="text-lg"
                    style={{ color: theme.colors.textInverse }}
                  />
                </div>
              </motion.div>
            </div>
          </ScrollReveal>

          {/* Contact Form */}
          <ScrollReveal direction="right" delay={0.3} duration={animations.duration / 1000}>
            <motion.div
              className="rounded-2xl p-8"
              style={{
                background: `linear-gradient(135deg, ${theme.colors.textInverse}15, ${theme.colors.textInverse}10)`,
                border: `2px solid ${theme.colors.textInverse}20`,
              }}
            >
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <input
                  type="text"
                  placeholder="Your Name"
                  className="w-full px-4 py-3 rounded-lg text-white placeholder-opacity-50 focus:outline-none focus:ring-2 transition-all"
                  style={{
                    backgroundColor: `${theme.colors.primaryDark}80`,
                    border: `1px solid ${theme.colors.textInverse}20`,
                    color: theme.colors.textInverse,
                  }}
                />
                <input
                  type="email"
                  placeholder="Email Address"
                  className="w-full px-4 py-3 rounded-lg text-white placeholder-opacity-50 focus:outline-none focus:ring-2 transition-all"
                  style={{
                    backgroundColor: `${theme.colors.primaryDark}80`,
                    border: `1px solid ${theme.colors.textInverse}20`,
                    color: theme.colors.textInverse,
                  }}
                />
                <textarea
                  placeholder="Message"
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg text-white placeholder-opacity-50 focus:outline-none focus:ring-2 transition-all resize-none"
                  style={{
                    backgroundColor: `${theme.colors.primaryDark}80`,
                    border: `1px solid ${theme.colors.textInverse}20`,
                    color: theme.colors.textInverse,
                  }}
                />
                <motion.div whileHover={{ scale: editMode ? 1 : 1.05 }} whileTap={{ scale: editMode ? 1 : 0.98 }}>
                  <div className="flex items-center justify-center gap-2 w-full px-6 py-3 rounded-xl font-semibold transition-all" style={{ backgroundColor: theme.colors.accent, color: theme.colors.textInverse }}>
                    <Send className="w-4 h-4" />
                    <InlineEditor
                      value={safeSubmitText}
                      onChange={(val) => updateField('submit_text', val)}
                      type="button"
                      editMode={editMode}
                      className="inline"
                    />
                  </div>
                </motion.div>
              </form>
            </motion.div>
          </ScrollReveal>
        </div>
      </div>
    </div>
  );
}
