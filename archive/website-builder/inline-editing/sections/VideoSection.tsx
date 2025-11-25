import { useRef, useEffect, useState } from 'react';
import InlineEditor from '../InlineEditor';
import SectionWrapper from '../SectionWrapper';
import ScrollReveal from '../../../animations/ScrollReveal';
import { useTheme } from '../../../../contexts/ThemeContext';
import { getHeadingClasses, getBodyClasses } from '../../../../lib/typography-presets';
import { applyElementOverrides } from '../../../../lib/applyElementOverrides';
import { Video, Play } from 'lucide-react';

interface VideoSectionProps {
    sectionId: string;
    content: {
        heading: string;
        subheading: string;
        videoUrl: string;
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

export default function VideoSection({
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
}: VideoSectionProps) {
    const { theme, typography } = useTheme();
    const sectionRef = useRef<HTMLDivElement>(null);
    const [inputValue, setInputValue] = useState(content.videoUrl || '');

    // Apply element style overrides
    useEffect(() => {
        const elementOverrides = content.element_overrides;
        if (sectionRef.current && elementOverrides) {
            applyElementOverrides(sectionRef.current, elementOverrides);
        }
    }, [content.element_overrides]);

    useEffect(() => {
        setInputValue(content.videoUrl || '');
    }, [content.videoUrl]);

    const updateField = (field: string, value: any) => {
        onUpdate({ ...content, [field]: value });
    };

    const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
    };

    const handleUrlBlur = () => {
        updateField('videoUrl', inputValue);
    };

    const getEmbedUrl = (url: string) => {
        if (!url) return '';

        // YouTube
        const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
        const youtubeMatch = url.match(youtubeRegex);
        if (youtubeMatch) {
            return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
        }

        // Vimeo
        const vimeoRegex = /(?:vimeo\.com\/)(\d+)/;
        const vimeoMatch = url.match(vimeoRegex);
        if (vimeoMatch) {
            return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
        }

        return url; // Return as is if no match (might be already an embed link)
    };

    const embedUrl = getEmbedUrl(content.videoUrl);

    const headingClasses = getHeadingClasses(typography, 'h2', 'bold', 'tight');
    const subheadingClasses = getBodyClasses(typography, 'lg', 'normal');

    return (
        <SectionWrapper
            editMode={editMode}
            sectionName="Video"
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
                    <div className="text-center max-w-3xl mx-auto mb-12">
                        <ScrollReveal direction="up">
                            {editMode ? (
                                <InlineEditor
                                    value={content.heading || 'Watch Our Story'}
                                    onChange={(val) => updateField('heading', val)}
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
                                    {content.heading || 'Watch Our Story'}
                                </h2>
                            )}
                        </ScrollReveal>

                        <ScrollReveal direction="up" delay={0.1}>
                            {editMode ? (
                                <InlineEditor
                                    value={content.subheading || 'See how we can help you achieve your goals.'}
                                    onChange={(val) => updateField('subheading', val)}
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
                                    {content.subheading || 'See how we can help you achieve your goals.'}
                                </p>
                            )}
                        </ScrollReveal>
                    </div>

                    {/* Video Container */}
                    <ScrollReveal direction="up" delay={0.2}>
                        <div className="max-w-4xl mx-auto">
                            <div className="relative pb-[56.25%] h-0 rounded-2xl overflow-hidden shadow-2xl bg-slate-900">
                                {embedUrl ? (
                                    <iframe
                                        src={embedUrl}
                                        title="Video player"
                                        className="absolute top-0 left-0 w-full h-full border-0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    />
                                ) : (
                                    <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center text-slate-500">
                                        <Video className="w-16 h-16 mb-4 opacity-50" />
                                        <p className="text-lg font-medium">No video URL provided</p>
                                    </div>
                                )}

                                {/* Overlay for Edit Mode to prevent interaction with iframe */}
                                {editMode && (
                                    <div className="absolute top-0 left-0 w-full h-full bg-transparent z-10" />
                                )}
                            </div>

                            {/* URL Input in Edit Mode */}
                            {editMode && (
                                <div className="mt-6 flex items-center gap-4 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600">
                                        <Play className="w-5 h-5" />
                                    </div>
                                    <div className="flex-grow">
                                        <label className="block text-xs font-medium text-slate-500 mb-1">Video URL (YouTube or Vimeo)</label>
                                        <input
                                            type="text"
                                            value={inputValue}
                                            onChange={handleUrlChange}
                                            onBlur={handleUrlBlur}
                                            placeholder="https://www.youtube.com/watch?v=..."
                                            className="w-full bg-transparent border-none p-0 text-sm focus:ring-0 text-slate-900 dark:text-white placeholder-slate-400"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </ScrollReveal>
                </div>
            </div>
        </SectionWrapper>
    );
}
