import InlineEditor from '../InlineEditor';
import { useTheme } from '../../../../contexts/ThemeContext';
import { getHeadingClasses, getBodyClasses } from '../../../../lib/typography-presets';
import { Users, Plus, User } from 'lucide-react';

interface RosterMember {
  name?: string;
  position?: string;
  jersey_number?: string;
  photo_url?: string;
  bio?: string;
}

interface RosterSectionProps {
  content: {
    title?: string;
    description?: string;
    members?: RosterMember[];
  };
  styles?: Record<string, any>;
  editMode: boolean;
  onUpdate: (content: Record<string, any>) => void;
}

export default function RosterSection({
  content,
  styles = {},
  editMode,
  onUpdate
}: RosterSectionProps) {
  const { theme, typography } = useTheme();

  // Defensive coding
  const members: RosterMember[] = Array.isArray(content.members) ? content.members : [];
  const safeTitle = typeof content.title === 'string' ? content.title : 'Team Roster';
  const safeDescription = typeof content.description === 'string' ? content.description : 'Meet our players and coaches';

  const updateField = (field: string, value: any) => {
    onUpdate({ ...content, [field]: value });
  };

  return (
    <div
      className="py-16 px-4"
      style={{
        backgroundColor: styles.backgroundColor || theme.colors.background,
        ...styles
      }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <InlineEditor
            value={safeTitle}
            onChange={(value) => updateField('title', value)}
            enabled={editMode}
            className={getHeadingClasses(typography, 'h2', 'text-center mb-4')}
          />
          <InlineEditor
            value={safeDescription}
            onChange={(value) => updateField('description', value)}
            enabled={editMode}
            className={getBodyClasses(typography, 'large', 'text-center')}
            style={{ color: theme.colors.textSecondary }}
          />
        </div>

        {/* Roster Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {members.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-16 border-2 border-dashed border-gray-300 rounded-lg">
              <Users className="w-16 h-16 text-gray-400 mb-4" />
              <p className="text-gray-500 text-lg mb-2">No team members yet</p>
              <p className="text-gray-400 text-sm">Add players and coaches to your roster</p>
              {editMode && (
                <button
                  onClick={() => updateField('members', [{ name: 'Player Name', position: 'Position', jersey_number: '00' }])}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add First Member
                </button>
              )}
            </div>
          ) : (
            members.map((member, index) => (
              <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                {/* Photo */}
                <div className="relative">
                  {member.photo_url ? (
                    <img
                      src={member.photo_url}
                      alt={member.name || 'Team member'}
                      className="w-full h-64 object-cover"
                    />
                  ) : (
                    <div className="w-full h-64 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                      <User className="w-24 h-24 text-white opacity-50" />
                    </div>
                  )}
                  {member.jersey_number && (
                    <div className="absolute top-4 right-4 bg-black bg-opacity-70 text-white text-2xl font-bold px-4 py-2 rounded-lg">
                      #{member.jersey_number}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="text-xl font-bold mb-1" style={{ color: theme.colors.text }}>
                    {member.name || 'Player Name'}
                  </h3>
                  <p className="text-sm font-medium mb-2" style={{ color: theme.colors.primary }}>
                    {member.position || 'Position'}
                  </p>
                  {member.bio && (
                    <p className="text-sm" style={{ color: theme.colors.textSecondary }}>
                      {member.bio}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {editMode && members.length > 0 && (
          <div className="mt-8 text-center">
            <button
              onClick={() => updateField('members', [...members, { name: 'Player Name', position: 'Position', jersey_number: '00' }])}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
            >
              <Plus className="w-5 h-5" />
              Add Team Member
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
