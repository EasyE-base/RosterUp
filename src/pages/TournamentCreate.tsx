import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Trophy,
  MapPin,
  Calendar,
  Users,
  DollarSign,
  AlertCircle,
  Navigation,
  Image,
  ArrowLeft,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { geocodeAddress } from '../lib/geocoding';
import { getSanctioningBodiesBySport } from '../constants/sanctioningBodies';
import {
  TOURNAMENT_CLASSIFICATION_OPTIONS,
  CLASSIFICATION_LEVELS,
  type TournamentClassificationAcceptance,
  type TeamClassification,
} from '../constants/classifications';
import {
  AppleButton,
  AppleCard,
  AppleCardContent,
  AppleHeading,
  AppleInput,
  AppleSelect,
  AppleTextarea,
} from '../components/apple';

export default function TournamentCreate() {
  const [loading, setLoading] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [error, setError] = useState('');
  const { organization } = useAuth();
  const navigate = useNavigate();

  const [flyerFile, setFlyerFile] = useState<File | null>(null);
  const [flyerPreview, setFlyerPreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    sport: '',
    sanctioning_body: '',
    age_group: '',
    event_website: '',
    classification_acceptance: 'OPEN' as TournamentClassificationAcceptance,
    accepted_classifications: [] as TeamClassification[],
    start_date: '',
    end_date: '',
    registration_deadline: '',
    location_name: '',
    address: '',
    city: '',
    state: '',
    country: 'USA',
    latitude: null as number | null,
    longitude: null as number | null,
    max_participants: 16,
    format_type: 'single_elimination',
    entry_fee: '',
    prize_info: '',
    requirements: '',
    status: 'draft',
  });

  const handleFlyerSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFlyerFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFlyerPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGeocode = async () => {
    if (!formData.city) {
      setError('Please enter at least a city to find coordinates');
      return;
    }

    setGeocoding(true);
    setError('');

    try {
      console.log('Geocoding address:', {
        address: formData.address,
        city: formData.city,
        state: formData.state,
        country: formData.country
      });

      const result = await geocodeAddress(
        formData.address,
        formData.city,
        formData.state,
        formData.country
      );

      console.log('Geocoding result:', result);

      if (result) {
        setFormData({
          ...formData,
          latitude: result.latitude,
          longitude: result.longitude,
        });
        setError('');
      } else {
        setError('Could not find coordinates for this location. Please check the address and try again.');
      }
    } catch (err) {
      console.error('Geocoding error:', err);
      setError(`Failed to geocode address: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setGeocoding(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!organization) {
        throw new Error('You must be an organization to create tournaments');
      }

      // Try to geocode if coordinates are missing
      let lat = formData.latitude;
      let lng = formData.longitude;

      if (!lat || !lng) {
        setGeocoding(true);
        try {
          const result = await geocodeAddress(
            formData.address,
            formData.city,
            formData.state,
            formData.country
          );
          if (result) {
            lat = result.latitude;
            lng = result.longitude;
          } else {
            // Use default coordinates if geocoding fails
            lat = 0;
            lng = 0;
          }
        } catch (geocodeError) {
          console.warn('Geocoding failed, using default coordinates:', geocodeError);
          lat = 0;
          lng = 0;
        } finally {
          setGeocoding(false);
        }
      }

      // Upload flyer if provided
      let imageUrl: string | null = null;
      if (flyerFile) {
        const fileExt = flyerFile.name.split('.').pop();
        const fileName = `${organization.id}-${Date.now()}.${fileExt}`;
        const filePath = fileName;

        const { error: uploadError } = await supabase.storage
          .from('tournament-flyers')
          .upload(filePath, flyerFile, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from('tournament-flyers')
          .getPublicUrl(filePath);

        imageUrl = publicUrlData.publicUrl;
      }

      const { error: insertError } = await supabase.from('tournaments').insert({
        organization_id: organization.id,
        title: formData.title,
        description: formData.description,
        sport: formData.sport,
        sanctioning_body: formData.sanctioning_body || null,
        image_url: imageUrl,
        event_website: formData.event_website || null,
        start_date: formData.start_date,
        end_date: formData.end_date,
        registration_deadline: formData.registration_deadline,
        location_name: formData.location_name,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        latitude: lat,
        longitude: lng,
        max_participants: formData.max_participants,
        format_type: formData.format_type,
        entry_fee: formData.entry_fee ? parseFloat(formData.entry_fee) : null,
        prize_info: formData.prize_info || null,
        status: formData.status,
        classification_acceptance: formData.classification_acceptance,
        accepted_classifications: formData.accepted_classifications.length > 0 ? formData.accepted_classifications : null,
        age_group: formData.age_group || null,
      });

      if (insertError) throw insertError;

      navigate('/tournaments');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create tournament');
    } finally {
      setLoading(false);
    }
  };

  const sportOptions = [
    { value: '', label: 'Select a sport' },
    { value: 'Basketball', label: 'Basketball' },
    { value: 'Soccer', label: 'Soccer' },
    { value: 'Baseball', label: 'Baseball' },
    { value: 'Football', label: 'Football' },
    { value: 'Volleyball', label: 'Volleyball' },
    { value: 'Softball', label: 'Softball' },
    { value: 'Hockey', label: 'Hockey' },
    { value: 'Lacrosse', label: 'Lacrosse' },
  ];

  const formatOptions = [
    { value: 'single_elimination', label: 'Single Elimination' },
    { value: 'double_elimination', label: 'Double Elimination' },
    { value: 'round_robin', label: 'Round Robin' },
    { value: 'pool_play', label: 'Pool Play' },
    { value: 'swiss', label: 'Swiss System' },
  ];

  const countryOptions = [
    { value: 'USA', label: 'United States' },
    { value: 'Canada', label: 'Canada' },
    { value: 'Mexico', label: 'Mexico' },
    { value: 'UK', label: 'United Kingdom' },
  ];

  const statusOptions = [
    { value: 'draft', label: 'Draft (Not visible to public)' },
    { value: 'open', label: 'Open (Accept applications)' },
  ];

  const classificationOptions = TOURNAMENT_CLASSIFICATION_OPTIONS.map(option => ({
    value: option.value,
    label: `${option.label} - ${option.description}`
  }));

  const sanctioningOptions = [
    { value: '', label: 'No sanctioning body' },
    ...getSanctioningBodiesBySport(formData.sport).map(body => ({
      value: body.value,
      label: `${body.label}${body.description ? ` - ${body.description}` : ''}`
    }))
  ];

  return (
    <div className="min-h-screen bg-[rgb(251,251,253)] pt-32 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate('/tournaments')}
          className="flex items-center space-x-2 text-[rgb(134,142,150)] hover:text-[rgb(29,29,31)] mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to tournaments</span>
        </button>

        <div className="mb-8">
          <AppleHeading level={1} size="card" className="mb-2">Create Tournament</AppleHeading>
          <p className="text-[rgb(134,142,150)] text-lg">
            Host a tournament and invite organizations to compete
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-[rgb(255,59,48)]/10 border border-[rgb(255,59,48)]/20 rounded-lg flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-[rgb(255,59,48)] flex-shrink-0 mt-0.5" />
            <p className="text-[rgb(255,59,48)] text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <AppleCard>
            <AppleCardContent className="p-6 space-y-6">
              <AppleHeading level={3} size="feature" className="mb-6">Basic Information</AppleHeading>

              <AppleInput
                label="Tournament Title *"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Summer Showdown 2025"
                required
                fullWidth
              />

              <AppleTextarea
                label="Description *"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your tournament, format, and what makes it special..."
                rows={4}
                required
                fullWidth
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AppleSelect
                  label="Sport *"
                  value={formData.sport}
                  onChange={(e) => setFormData({ ...formData, sport: e.target.value, sanctioning_body: '' })}
                  options={sportOptions}
                  required
                  fullWidth
                />

                <AppleSelect
                  label="Format Type *"
                  value={formData.format_type}
                  onChange={(e) => setFormData({ ...formData, format_type: e.target.value })}
                  options={formatOptions}
                  required
                  fullWidth
                />
              </div>

              {formData.sport && (
                <AppleSelect
                  label="Sanctioning Body (Optional)"
                  value={formData.sanctioning_body}
                  onChange={(e) => setFormData({ ...formData, sanctioning_body: e.target.value })}
                  options={sanctioningOptions}
                  helperText="Select the governing body that will sanction this tournament. This helps teams understand which rules and regulations will apply."
                  fullWidth
                />
              )}

              <div>
                <label className="block text-sm font-medium text-[rgb(29,29,31)] mb-2">
                  Tournament Flyer (Optional)
                </label>
                <div className="mt-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFlyerSelect}
                    className="block w-full text-sm text-[rgb(134,142,150)]
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-lg file:border-0
                      file:text-sm file:font-semibold
                      file:bg-[rgb(0,113,227)] file:text-white
                      hover:file:bg-[rgb(0,113,227)]/90
                      file:cursor-pointer cursor-pointer"
                  />
                  <p className="mt-2 text-xs text-[rgb(134,142,150)]">
                    Upload a promotional flyer for your tournament (PNG, JPG, or JPEG)
                  </p>
                </div>
                {flyerPreview && (
                  <div className="mt-4">
                    <img
                      src={flyerPreview}
                      alt="Flyer preview"
                      className="w-full max-w-md h-auto rounded-lg border-[1.5px] border-slate-200 shadow-sm"
                    />
                  </div>
                )}
              </div>

              <AppleInput
                label="Age Group (Optional)"
                value={formData.age_group}
                onChange={(e) => setFormData({ ...formData, age_group: e.target.value })}
                placeholder="e.g., 10U, 12U, 14U, 16U, 18U"
                helperText="Specify the age group for age-specific classification rules (e.g., relaxed requirements for younger age groups)."
                fullWidth
              />

              <AppleInput
                label="Event Website (Optional)"
                type="url"
                value={formData.event_website}
                onChange={(e) => setFormData({ ...formData, event_website: e.target.value })}
                placeholder="https://www.yourtournament.com"
                helperText="Add a link to your tournament's official website for more information."
                fullWidth
              />
            </AppleCardContent>
          </AppleCard>

          <AppleCard>
            <AppleCardContent className="p-6 space-y-6">
              <div className="flex items-center mb-6">
                <Trophy className="w-5 h-5 mr-2 text-[rgb(255,149,0)]" />
                <AppleHeading level={3} size="feature">Team Classification & Eligibility</AppleHeading>
              </div>

              <AppleSelect
                label="Classification Acceptance Policy *"
                value={formData.classification_acceptance}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    classification_acceptance: e.target.value as TournamentClassificationAcceptance,
                    accepted_classifications: [],
                  })
                }
                options={classificationOptions}
                helperText="Determines which team classification levels can enter this tournament. This ensures competitive balance."
                required
                fullWidth
              />

              {formData.classification_acceptance === 'CUSTOM' && (
                <div>
                  <label className="block text-sm font-medium text-[rgb(29,29,31)] mb-3">
                    Select Accepted Classifications *
                  </label>
                  <div className="space-y-2">
                    {CLASSIFICATION_LEVELS.map((level) => (
                      <label
                        key={level.value}
                        className="flex items-center space-x-3 p-3 bg-[rgb(245,245,247)] rounded-lg hover:bg-[rgb(240,240,242)] cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={formData.accepted_classifications.includes(level.value)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                accepted_classifications: [
                                  ...formData.accepted_classifications,
                                  level.value,
                                ],
                              });
                            } else {
                              setFormData({
                                ...formData,
                                accepted_classifications: formData.accepted_classifications.filter(
                                  (c) => c !== level.value
                                ),
                              });
                            }
                          }}
                          className="w-4 h-4 text-[rgb(0,113,227)] border-[rgb(210,210,215)] rounded focus:ring-[rgb(0,113,227)] focus:ring-2"
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span
                              className={`px-2 py-1 text-xs font-bold rounded bg-${level.color}-100 text-${level.color}-700`}
                            >
                              {level.shortLabel}
                            </span>
                            <span className="text-[rgb(29,29,31)] font-medium">{level.label}</span>
                          </div>
                          <p className="text-xs text-[rgb(134,142,150)] mt-1">{level.description}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                  <p className="mt-3 text-xs text-[rgb(134,142,150)]">
                    Select which team classifications are eligible to enter this tournament.
                  </p>
                </div>
              )}

              {formData.classification_acceptance !== 'CUSTOM' && (
                <div className="p-4 bg-[rgb(0,113,227)]/5 border border-[rgb(0,113,227)]/20 rounded-lg">
                  <p className="text-sm text-[rgb(0,113,227)] font-medium mb-2">
                    Accepted Team Classifications:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {TOURNAMENT_CLASSIFICATION_OPTIONS.find(
                      (opt) => opt.value === formData.classification_acceptance
                    )?.acceptedLevels.map((levelValue) => {
                      const level = CLASSIFICATION_LEVELS.find((l) => l.value === levelValue);
                      return level ? (
                        <span
                          key={levelValue}
                          className={`px-3 py-1 text-sm font-bold rounded-full bg-${level.color}-100 text-${level.color}-700 border border-${level.color}-200`}
                        >
                          {level.shortLabel} - {level.label}
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
            </AppleCardContent>
          </AppleCard>

          <AppleCard>
            <AppleCardContent className="p-6 space-y-6">
              <div className="flex items-center mb-6">
                <Calendar className="w-5 h-5 mr-2 text-[rgb(0,113,227)]" />
                <AppleHeading level={3} size="feature">Dates & Registration</AppleHeading>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <AppleInput
                  label="Start Date *"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  required
                  fullWidth
                />

                <AppleInput
                  label="End Date *"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  min={formData.start_date || new Date().toISOString().split('T')[0]}
                  required
                  fullWidth
                />

                <AppleInput
                  label="Registration Deadline *"
                  type="date"
                  value={formData.registration_deadline}
                  onChange={(e) =>
                    setFormData({ ...formData, registration_deadline: e.target.value })
                  }
                  max={formData.start_date}
                  min={new Date().toISOString().split('T')[0]}
                  required
                  fullWidth
                />
              </div>
            </AppleCardContent>
          </AppleCard>

          <AppleCard>
            <AppleCardContent className="p-6 space-y-6">
              <div className="flex items-center mb-6">
                <MapPin className="w-5 h-5 mr-2 text-[rgb(52,199,89)]" />
                <AppleHeading level={3} size="feature">Location</AppleHeading>
              </div>

              <AppleInput
                label="Venue Name *"
                value={formData.location_name}
                onChange={(e) =>
                  setFormData({ ...formData, location_name: e.target.value })
                }
                placeholder="e.g., Riverside Sports Complex"
                required
                fullWidth
              />

              <AppleInput
                label="Street Address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="123 Main Street"
                fullWidth
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <AppleInput
                  label="City *"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="San Diego"
                  required
                  fullWidth
                />

                <AppleInput
                  label="State"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  placeholder="CA"
                  fullWidth
                />

                <AppleSelect
                  label="Country *"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  options={countryOptions}
                  required
                  fullWidth
                />
              </div>

              <div className="flex items-center space-x-4">
                <AppleButton
                  type="button"
                  variant="outline"
                  onClick={handleGeocode}
                  disabled={geocoding || !formData.city}
                  loading={geocoding}
                  leftIcon={!geocoding && <Navigation className="w-4 h-4" />}
                >
                  Find Coordinates
                </AppleButton>
                {formData.latitude && formData.longitude && (
                  <span className="text-sm text-[rgb(52,199,89)] font-medium">
                    ✓ Location found ({formData.latitude.toFixed(4)}, {formData.longitude.toFixed(4)})
                  </span>
                )}
              </div>
            </AppleCardContent>
          </AppleCard>

          <AppleCard>
            <AppleCardContent className="p-6 space-y-6">
              <div className="flex items-center mb-6">
                <Users className="w-5 h-5 mr-2 text-[rgb(0,199,190)]" />
                <AppleHeading level={3} size="feature">Participants & Details</AppleHeading>
              </div>

              <AppleInput
                label="Max Participants *"
                type="number"
                value={formData.max_participants}
                onChange={(e) =>
                  setFormData({ ...formData, max_participants: parseInt(e.target.value) })
                }
                min={4}
                max={128}
                required
                fullWidth
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AppleInput
                  label="Entry Fee (Optional)"
                  type="number"
                  value={formData.entry_fee}
                  onChange={(e) => setFormData({ ...formData, entry_fee: e.target.value })}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  leftIcon={<DollarSign className="w-4 h-4 text-[rgb(134,142,150)]" />}
                  fullWidth
                />

                <AppleInput
                  label="Prize Information (Optional)"
                  value={formData.prize_info}
                  onChange={(e) => setFormData({ ...formData, prize_info: e.target.value })}
                  placeholder="e.g., $1000 grand prize"
                  fullWidth
                />
              </div>

              <AppleTextarea
                label="Requirements (Optional)"
                value={formData.requirements}
                onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                placeholder="List any requirements for participating teams..."
                rows={3}
                fullWidth
              />

              <AppleSelect
                label="Status *"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                options={statusOptions}
                required
                fullWidth
              />
            </AppleCardContent>
          </AppleCard>

          <div className="flex gap-4">
            <AppleButton
              type="button"
              variant="secondary"
              onClick={() => navigate('/tournaments')}
              fullWidth
            >
              Cancel
            </AppleButton>
            <AppleButton
              type="submit"
              variant="primary"
              disabled={loading}
              loading={loading}
              leftIcon={!loading && <Trophy className="w-5 h-5" />}
              fullWidth
            >
              Create Tournament
            </AppleButton>
          </div>
        </form>
      </div>
    </div>
  );
}
