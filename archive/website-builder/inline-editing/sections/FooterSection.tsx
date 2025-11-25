import { useRef, useEffect } from 'react';
import InlineEditor from '../InlineEditor';
import SectionWrapper from '../SectionWrapper';
import { useTheme } from '../../../../contexts/ThemeContext';
import { getBodyClasses } from '../../../../lib/typography-presets';
import { applyElementOverrides } from '../../../../lib/applyElementOverrides';
import { Facebook, Twitter, Instagram, Linkedin, Youtube } from 'lucide-react';

interface SocialLink {
    platform: 'facebook' | 'twitter' | 'instagram' | 'linkedin' | 'youtube';
    url: string;
}

interface FooterSectionProps {
    sectionId: string;
    content: {
        business_name: string;
        copyright_text: string;
        social_links: SocialLink[];
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

export default function FooterSection({
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
}: FooterSectionProps) {
    const { theme, typography } = useTheme();
    const sectionRef = useRef<HTMLDivElement>(null);

    // Apply element style overrides
    useEffect(() => {
        const elementOverrides = content.element_overrides;
        if (sectionRef.current && elementOverrides) {
            applyElementOverrides(sectionRef.current, elementOverrides);
        }
    }, [content.element_overrides]);

    const updateField = (field: string, value: any) => {
        onUpdate({ ...content, [field]: value });
    };

    const toggleSocialLink = (platform: string) => {
        const currentLinks = content.social_links || [];
        const exists = currentLinks.find((l) => l.platform === platform);

        if (exists) {
            updateField('social_links', currentLinks.filter((l) => l.platform !== platform));
        } else {
            updateField('social_links', [...currentLinks, { platform, url: '#' }]);
        }
    };

    const socialLinks = content.social_links || [
        { platform: 'facebook', url: '#' },
        { platform: 'twitter', url: '#' },
        { platform: 'instagram', url: '#' },
    ];

    const getIcon = (platform: string) => {
        switch (platform) {
            case 'facebook': return Facebook;
            case 'twitter': return Twitter;
            case 'instagram': return Instagram;
            case 'linkedin': return Linkedin;
            case 'youtube': return Youtube;
            default: return Facebook;
        }
    };

    const textClasses = getBodyClasses(typography, 'base', 'normal');

    return (
        <SectionWrapper
            editMode={editMode}
            sectionName="Footer"
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
                className={`relative py-12 border-t`}
                style={{
                    backgroundColor: theme.colors.background,
                    borderColor: theme.colors.border,
                    ...styles,
                }}
            >
                <div className={`${theme.spacing.containerMaxWidth} mx-auto flex flex-col md:flex-row items-center justify-between gap-6`}>

                    {/* Business Name & Copyright */}
                    <div className="text-center md:text-left">
                        {editMode ? (
                            <InlineEditor
                                value={content.business_name || 'Your Business Name'}
                                onChange={(val) => updateField('business_name', val)}
                                type="text"
                                editMode={editMode}
                                className="font-bold text-xl mb-1"
                                style={{ color: theme.colors.text }}
                            />
                        ) : (
                            <h3 className="font-bold text-xl mb-1" style={{ color: theme.colors.text }}>
                                {content.business_name || 'Your Business Name'}
                            </h3>
                        )}

                        <div className="flex items-center justify-center md:justify-start gap-1">
                            <span style={{ color: theme.colors.text, opacity: 0.6 }}>© {new Date().getFullYear()}</span>
                            {editMode ? (
                                <InlineEditor
                                    value={content.copyright_text || 'All rights reserved.'}
                                    onChange={(val) => updateField('copyright_text', val)}
                                    type="text"
                                    editMode={editMode}
                                    className={`${textClasses}`}
                                    style={{ color: theme.colors.text, opacity: 0.6 }}
                                />
                            ) : (
                                <span className={`${textClasses}`} style={{ color: theme.colors.text, opacity: 0.6 }}>
                                    {content.copyright_text || 'All rights reserved.'}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Social Links */}
                    <div className="flex items-center gap-4">
                        {socialLinks.map((link) => {
                            const Icon = getIcon(link.platform);
                            return (
                                <div key={link.platform} className="relative group">
                                    <a
                                        href={editMode ? undefined : link.url}
                                        className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors block"
                                        style={{ color: theme.colors.text }}
                                        onClick={(e) => editMode && e.preventDefault()}
                                    >
                                        <Icon className="w-5 h-5" />
                                    </a>
                                    {editMode && (
                                        <button
                                            onClick={() => toggleSocialLink(link.platform)}
                                            className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs hover:bg-red-600"
                                            title={`Remove ${link.platform}`}
                                        >
                                            ×
                                        </button>
                                    )}
                                </div>
                            );
                        })}

                        {editMode && (
                            <div className="relative group ml-2">
                                <button className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-blue-500 transition-colors">
                                    <span className="text-xs font-bold">+</span>
                                </button>

                                {/* Social Link Picker */}
                                <div className="absolute bottom-full right-0 mb-2 p-2 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 hidden group-hover:flex gap-2">
                                    {['facebook', 'twitter', 'instagram', 'linkedin', 'youtube'].map((platform) => {
                                        const Icon = getIcon(platform);
                                        const isActive = socialLinks.some(l => l.platform === platform);
                                        return (
                                            <button
                                                key={platform}
                                                onClick={() => toggleSocialLink(platform)}
                                                className={`p-2 rounded-full transition-colors ${isActive
                                                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                                                    : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400'
                                                    }`}
                                                title={platform}
                                            >
                                                <Icon className="w-4 h-4" />
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </SectionWrapper>
    );
}
