import { useRef, useEffect } from 'react';
import InlineEditor from '../InlineEditor';
import DragDropImageUpload from '../DragDropImageUpload';
import SectionWrapper from '../SectionWrapper';
import ScrollReveal from '../../../animations/ScrollReveal';
import { useTheme } from '../../../../contexts/ThemeContext';
import { getHeadingClasses, getBodyClasses } from '../../../../lib/typography-presets';
import { motion, AnimatePresence } from 'framer-motion';
import { applyElementOverrides } from '../../../../lib/applyElementOverrides';
import { Plus, User, Trash2 } from 'lucide-react';

interface RosterMember {
  id: string;
  name: string;
  position: string;
  jersey_number: string;
  photo_url: string;
  bio: string;
}

interface RosterSectionProps {
  sectionId: string;
  content: {
    title?: string;
    description?: string;
    members?: RosterMember[];
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

export default function RosterSection({
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
}: RosterSectionProps) {
  const { theme, typography } = useTheme();
  const sectionRef = useRef<HTMLDivElement>(null);

  // Apply element style overrides
  useEffect(() => {
    const elementOverrides = content.element_overrides;
    if (sectionRef.current && elementOverrides) {
      applyElementOverrides(sectionRef.current, elementOverrides);
    }
  }, [content.element_overrides]);

  const members: RosterMember[] = Array.isArray(content.members) ? content.members : [];
  const safeTitle = typeof content.title === 'string' ? content.title : 'Team Roster';
  const safeDescription = typeof content.description === 'string' ? content.description : 'Meet our players and coaches';

  const updateField = (field: string, value: any) => {
    onUpdate({ ...content, [field]: value });
  };

  const updateMember = (index: number, field: keyof RosterMember, value: any) => {
    const newMembers = [...members];
    newMembers[index] = { ...newMembers[index], [field]: value };
    updateField('members', newMembers);
  };

  const addMember = () => {
    const newMember: RosterMember = {
      id: crypto.randomUUID(),
      name: 'Player Name',
      position: 'Position',
      jersey_number: '00',
      photo_url: '',
      bio: 'Player bio goes here.',
    };
    updateField('members', [...members, newMember]);
  };

  const removeMember = (index: number) => {
    const newMembers = members.filter((_, i) => i !== index);
    updateField('members', newMembers);
  };

  const headingClasses = getHeadingClasses(typography, 'h2', 'bold', 'tight');
  const subheadingClasses = getBodyClasses(typography, 'lg', 'normal');

  return (
    <SectionWrapper
      editMode={editMode}
      sectionName="Team Roster"
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
          backgroundColor: theme.colors.background,
          ...styles,
        }}
      >
        <div className={`${theme.spacing.containerMaxWidth} mx-auto`}>
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <ScrollReveal direction="up">
              {editMode ? (
                <InlineEditor
                  value={safeTitle}
                  onChange={(val) => updateField('title', val)}
                  type="heading"
                  editMode={editMode}
                  className={`${headingClasses} mb-4`}
                  style={{ color: theme.colors.text }}
                />
              ) : (
                <h2
                  className={`${headingClasses} mb-4`}
                  style={{ color: theme.colors.text }}
                >
                  {safeTitle}
                </h2>
              )}
            </ScrollReveal>

            <ScrollReveal direction="up" delay={0.1}>
              {editMode ? (
                <InlineEditor
                  value={safeDescription}
                  onChange={(val) => updateField('description', val)}
                  type="text"
                  editMode={editMode}
                  className={`${subheadingClasses}`}
                  style={{ color: theme.colors.text, opacity: 0.7 }}
                />
              ) : (
                <p
                  className={`${subheadingClasses}`}
                  style={{ color: theme.colors.text, opacity: 0.7 }}
                >
                  {safeDescription}
                </p>
              )}
            </ScrollReveal>
          </div>

          {/* Roster Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            <AnimatePresence>
              {members.map((member, index) => (
                <motion.div
                  key={member.id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="group relative bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100 dark:border-slate-700"
                >
                  {/* Photo */}
                  <div className="relative aspect-[3/4] bg-slate-100 dark:bg-slate-700 overflow-hidden">
                    {member.photo_url ? (
                      <img
                        src={member.photo_url}
                        alt={member.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-slate-600">
                        <User className="w-24 h-24" />
                      </div>
                    )}

                    {/* Jersey Number Badge */}
                    <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm text-white font-bold px-3 py-1 rounded-lg text-lg">
                      {editMode ? (
                        <div className="flex items-center gap-1">
                          <span className="text-xs opacity-70">#</span>
                          <InlineEditor
                            value={member.jersey_number || '00'}
                            onChange={(val) => updateMember(index, 'jersey_number', val)}
                            type="text"
                            editMode={editMode}
                            className="w-8 text-center bg-transparent"
                            style={{ color: 'white' }}
                          />
                        </div>
                      ) : (
                        <span>#{member.jersey_number || '00'}</span>
                      )}
                    </div>

                    {/* Image Upload Overlay */}
                    {editMode && (
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
                        <div className="w-full">
                          <DragDropImageUpload
                            value={member.photo_url}
                            onChange={(url) => updateMember(index, 'photo_url', url)}
                            editMode={editMode}
                            placeholder="Upload Photo"
                            aspectRatio="portrait"
                            showUnsplash={true}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-6">
                    <div className="mb-1">
                      {editMode ? (
                        <InlineEditor
                          value={member.name || 'Player Name'}
                          onChange={(val) => updateMember(index, 'name', val)}
                          type="text"
                          editMode={editMode}
                          className="font-bold text-xl w-full"
                          style={{ color: theme.colors.text }}
                        />
                      ) : (
                        <h3 className="font-bold text-xl" style={{ color: theme.colors.text }}>
                          {member.name || 'Player Name'}
                        </h3>
                      )}
                    </div>

                    <div className="mb-3">
                      {editMode ? (
                        <InlineEditor
                          value={member.position || 'Position'}
                          onChange={(val) => updateMember(index, 'position', val)}
                          type="text"
                          editMode={editMode}
                          className="font-medium text-sm uppercase tracking-wider w-full"
                          style={{ color: theme.colors.primary }}
                        />
                      ) : (
                        <p className="font-medium text-sm uppercase tracking-wider" style={{ color: theme.colors.primary }}>
                          {member.position || 'Position'}
                        </p>
                      )}
                    </div>

                    <div>
                      {editMode ? (
                        <InlineEditor
                          value={member.bio || 'Player bio goes here.'}
                          onChange={(val) => updateMember(index, 'bio', val)}
                          type="text"
                          editMode={editMode}
                          className="text-sm leading-relaxed w-full"
                          style={{ color: theme.colors.text, opacity: 0.7 }}
                        />
                      ) : (
                        <p className="text-sm leading-relaxed" style={{ color: theme.colors.text, opacity: 0.7 }}>
                          {member.bio || 'Player bio goes here.'}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Remove Button */}
                  {editMode && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeMember(index);
                      }}
                      className="absolute top-2 left-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-20 hover:bg-red-600"
                      title="Remove Member"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Add Member Button */}
            {editMode && (
              <motion.button
                onClick={addMember}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center min-h-[400px] bg-slate-50 dark:bg-slate-800/50 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all group"
              >
                <div className="w-16 h-16 rounded-full bg-white dark:bg-slate-700 flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform">
                  <Plus className="w-8 h-8 text-blue-500" />
                </div>
                <span className="font-medium text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  Add Team Member
                </span>
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
