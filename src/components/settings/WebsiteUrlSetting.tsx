import { useState } from 'react';
import { ExternalLink, Globe, Save } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { AppleButton, AppleCard, AppleHeading } from '../apple';

export default function WebsiteUrlSetting() {
    const { organization } = useAuth();
    const [websiteUrl, setWebsiteUrl] = useState(organization?.website || '');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const validateUrl = (url: string) => {
        if (!url) return true; // Empty is valid (optional field)
        try {
            const urlObj = new URL(url);
            return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
        } catch {
            return false;
        }
    };

    const handleSave = async () => {
        setError('');
        setSuccess(false);

        // Validate URL
        if (websiteUrl && !validateUrl(websiteUrl)) {
            setError('Please enter a valid URL (e.g., https://example.com)');
            return;
        }

        setSaving(true);

        try {
            const { error: updateError } = await supabase
                .from('organizations')
                .update({ website: websiteUrl || null })
                .eq('id', organization?.id);

            if (updateError) throw updateError;

            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err: any) {
            console.error('Error updating website URL:', err);
            setError(err.message || 'Failed to update website URL');
        } finally {
            setSaving(false);
        }
    };

    return (
        <AppleCard variant="default" padding="lg">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Globe className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                        <AppleHeading level={3} size="card">
                            Website URL
                        </AppleHeading>
                        <p className="text-sm text-[rgb(134,142,150)] mt-1">
                            Add a link to your existing website (optional)
                        </p>
                    </div>
                </div>

                {/* Input Field */}
                <div>
                    <label htmlFor="website-url" className="block text-sm font-medium text-[rgb(29,29,31)] mb-2">
                        Website URL
                    </label>
                    <input
                        type="url"
                        id="website-url"
                        value={websiteUrl}
                        onChange={(e) => setWebsiteUrl(e.target.value)}
                        placeholder="https://yourwebsite.com"
                        className="w-full px-4 py-3 border-[1.5px] border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgb(0,113,227)] focus:border-transparent transition-all text-[rgb(29,29,31)]"
                    />
                    {error && (
                        <p className="text-sm text-red-500 mt-2">{error}</p>
                    )}
                    {success && (
                        <p className="text-sm text-green-600 mt-2">✓ Website URL updated successfully</p>
                    )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                    <AppleButton
                        variant="primary"
                        leftIcon={<Save className="w-4 h-4" />}
                        onClick={handleSave}
                        disabled={saving}
                    >
                        {saving ? 'Saving...' : 'Save Changes'}
                    </AppleButton>

                    {websiteUrl && validateUrl(websiteUrl) && (
                        <a
                            href={websiteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex"
                        >
                            <AppleButton
                                variant="outline"
                                rightIcon={<ExternalLink className="w-4 h-4" />}
                            >
                                Visit Website
                            </AppleButton>
                        </a>
                    )}
                </div>
            </div>
        </AppleCard>
    );
}
