import { useState } from 'react';
import { Loader2, Upload, X } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface GuestPlayerFormProps {
    teamId: string;
    onSuccess: () => void;
    onCancel: () => void;
}

export default function GuestPlayerForm({ teamId, onSuccess, onCancel }: GuestPlayerFormProps) {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        dateOfBirth: '',
        position: '',
        jerseyNumber: '',
        notes: '',
    });
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError('Please upload an image file');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError('Image must be less than 5MB');
            return;
        }

        setPhotoFile(file);
        setPhotoPreview(URL.createObjectURL(file));
        setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.firstName.trim() || !formData.lastName.trim()) {
            setError('First name and last name are required');
            return;
        }

        setUploading(true);
        setError('');

        try {
            let photoUrl = null;

            // Upload photo if provided
            if (photoFile) {
                const fileExt = photoFile.name.split('.').pop();
                const fileName = `${teamId}-${Date.now()}.${fileExt}`;
                const filePath = `roster-photos/${teamId}/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('team-assets')
                    .upload(filePath, photoFile, {
                        cacheControl: '3600',
                        upsert: false,
                    });

                if (uploadError) throw uploadError;

                const { data: urlData } = supabase.storage
                    .from('team-assets')
                    .getPublicUrl(filePath);

                photoUrl = urlData.publicUrl;
            }

            // Insert guest player
            const { error: insertError } = await supabase.from('team_members').insert({
                team_id: teamId,
                player_id: null,
                is_guest: true,
                guest_first_name: formData.firstName.trim(),
                guest_last_name: formData.lastName.trim(),
                guest_email: formData.email.trim() || null,
                guest_date_of_birth: formData.dateOfBirth || null,
                guest_photo_url: photoUrl,
                guest_notes: formData.notes.trim() || null,
                position: formData.position.trim() || null,
                jersey_number: formData.jerseyNumber ? parseInt(formData.jerseyNumber) : null,
                status: 'active',
            });

            if (insertError) throw insertError;

            onSuccess();
        } catch (err) {
            console.error('Error adding guest player:', err);
            setError(err instanceof Error ? err.message : 'Failed to add player');
        } finally {
            setUploading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                    {error}
                </div>
            )}

            {/* Photo Upload */}
            <div>
                <label className="block text-sm font-medium text-[rgb(29,29,31)] mb-2">
                    Player Photo
                </label>
                <div className="flex items-center gap-4">
                    {photoPreview ? (
                        <div className="relative">
                            <img
                                src={photoPreview}
                                alt="Preview"
                                className="w-24 h-24 rounded-lg object-cover"
                            />
                            <button
                                type="button"
                                onClick={() => {
                                    setPhotoFile(null);
                                    setPhotoPreview(null);
                                }}
                                className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <label className="w-24 h-24 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-[rgb(0,113,227)] transition-colors">
                            <Upload className="w-6 h-6 text-slate-400" />
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handlePhotoChange}
                                className="hidden"
                            />
                        </label>
                    )}
                    <p className="text-sm text-[rgb(134,142,150)]">
                        Upload a photo for the player card (optional)
                    </p>
                </div>
            </div>

            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-[rgb(29,29,31)] mb-2">
                        First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        className="w-full px-4 py-3 bg-[rgb(247,247,249)] border border-slate-200 rounded-lg text-[rgb(29,29,31)] placeholder-[rgb(134,142,150)] focus:outline-none focus:border-[rgb(0,113,227)] focus:ring-2 focus:ring-[rgb(0,113,227)]/20"
                        placeholder="John"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-[rgb(29,29,31)] mb-2">
                        Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        className="w-full px-4 py-3 bg-[rgb(247,247,249)] border border-slate-200 rounded-lg text-[rgb(29,29,31)] placeholder-[rgb(134,142,150)] focus:outline-none focus:border-[rgb(0,113,227)] focus:ring-2 focus:ring-[rgb(0,113,227)]/20"
                        placeholder="Doe"
                        required
                    />
                </div>
            </div>

            {/* Email */}
            <div>
                <label className="block text-sm font-medium text-[rgb(29,29,31)] mb-2">
                    Email (Optional)
                </label>
                <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-[rgb(247,247,249)] border border-slate-200 rounded-lg text-[rgb(29,29,31)] placeholder-[rgb(134,142,150)] focus:outline-none focus:border-[rgb(0,113,227)] focus:ring-2 focus:ring-[rgb(0,113,227)]/20"
                    placeholder="player@example.com"
                />
                <p className="mt-1 text-xs text-[rgb(134,142,150)]">
                    If they sign up for RosterUp later, we'll link their account automatically
                </p>
            </div>

            {/* Date of Birth */}
            <div>
                <label className="block text-sm font-medium text-[rgb(29,29,31)] mb-2">
                    Date of Birth (Optional)
                </label>
                <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="w-full px-4 py-3 bg-[rgb(247,247,249)] border border-slate-200 rounded-lg text-[rgb(29,29,31)] focus:outline-none focus:border-[rgb(0,113,227)] focus:ring-2 focus:ring-[rgb(0,113,227)]/20"
                />
            </div>

            {/* Position and Jersey Number */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-[rgb(29,29,31)] mb-2">
                        Position
                    </label>
                    <input
                        type="text"
                        value={formData.position}
                        onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                        className="w-full px-4 py-3 bg-[rgb(247,247,249)] border border-slate-200 rounded-lg text-[rgb(29,29,31)] placeholder-[rgb(134,142,150)] focus:outline-none focus:border-[rgb(0,113,227)] focus:ring-2 focus:ring-[rgb(0,113,227)]/20"
                        placeholder="Forward"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-[rgb(29,29,31)] mb-2">
                        Jersey Number
                    </label>
                    <input
                        type="number"
                        value={formData.jerseyNumber}
                        onChange={(e) => setFormData({ ...formData, jerseyNumber: e.target.value })}
                        className="w-full px-4 py-3 bg-[rgb(247,247,249)] border border-slate-200 rounded-lg text-[rgb(29,29,31)] placeholder-[rgb(134,142,150)] focus:outline-none focus:border-[rgb(0,113,227)] focus:ring-2 focus:ring-[rgb(0,113,227)]/20"
                        placeholder="10"
                        min="0"
                        max="999"
                    />
                </div>
            </div>

            {/* Notes */}
            <div>
                <label className="block text-sm font-medium text-[rgb(29,29,31)] mb-2">
                    Notes (Optional)
                </label>
                <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 bg-[rgb(247,247,249)] border border-slate-200 rounded-lg text-[rgb(29,29,31)] placeholder-[rgb(134,142,150)] focus:outline-none focus:border-[rgb(0,113,227)] focus:ring-2 focus:ring-[rgb(0,113,227)]/20 resize-none"
                    placeholder="Any additional information about the player..."
                />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={uploading}
                    className="px-4 py-2 text-[rgb(134,142,150)] hover:text-[rgb(29,29,31)] font-medium transition-colors disabled:opacity-50"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={uploading}
                    className="px-6 py-2 bg-[rgb(0,113,227)] text-white font-medium rounded-lg hover:bg-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                    {uploading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>Adding...</span>
                        </>
                    ) : (
                        <span>Add Player</span>
                    )}
                </button>
            </div>
        </form>
    );
}
