import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function AddExampleTournaments() {
  const { organization } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const addTournaments = async () => {
    if (!organization) {
      setMessage('No organization found. Please log in.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const exampleTournaments = [
        {
          organization_id: organization.id,
          title: 'Summer Softball Classic 2024',
          sport: 'Softball',
          description: 'Premier summer softball tournament featuring top teams from across the region. Competitive play with college scouts attending.',
          start_date: '2024-07-15',
          end_date: '2024-07-17',
          registration_deadline: '2024-07-08',
          location_name: 'Regional Sports Complex',
          city: 'San Diego',
          state: 'CA',
          country: 'USA',
          latitude: 32.7157,
          longitude: -117.1611,
          format_type: 'single_elimination',
          max_participants: 32,
          current_participants: 28,
          entry_fee: 450,
          prize_info: '$5,000 First Place',
          status: 'open',
          rules: { age_limit: '18U', game_format: 'Standard ASA Rules' }
        },
        {
          organization_id: organization.id,
          title: 'Elite Fastpitch Showcase',
          sport: 'Softball',
          description: 'High-level showcase tournament for elite fastpitch teams. Multiple divisions available.',
          start_date: '2024-08-05',
          end_date: '2024-08-07',
          registration_deadline: '2024-07-29',
          location_name: 'Championship Fields',
          city: 'Phoenix',
          state: 'AZ',
          country: 'USA',
          latitude: 33.4484,
          longitude: -112.0740,
          format_type: 'pool_play',
          max_participants: 48,
          current_participants: 41,
          entry_fee: 500,
          prize_info: 'Trophies & Medals',
          status: 'open',
          rules: { divisions: ['16U', '18U'], pitch_limit: true }
        },
        {
          organization_id: organization.id,
          title: 'Midwest Softball Championship',
          sport: 'Softball',
          description: 'Annual championship tournament bringing together the best teams from the Midwest region.',
          start_date: '2024-09-20',
          end_date: '2024-09-22',
          registration_deadline: '2024-09-13',
          location_name: 'Midwest Sports Park',
          city: 'Kansas City',
          state: 'MO',
          country: 'USA',
          latitude: 39.0997,
          longitude: -94.5786,
          format_type: 'double_elimination',
          max_participants: 24,
          current_participants: 15,
          entry_fee: 400,
          prize_info: '$3,000 Prize Pool',
          status: 'open',
          rules: { format: 'Double Elimination', games: 'Minimum 3 games guaranteed' }
        },
        {
          organization_id: organization.id,
          title: 'Coastal Softball Invitational',
          sport: 'Softball',
          description: 'Beautiful coastal tournament with ocean views. Family-friendly event with competitive play.',
          start_date: '2024-08-15',
          end_date: '2024-08-17',
          registration_deadline: '2024-08-08',
          location_name: 'Beachside Sports Complex',
          city: 'Virginia Beach',
          state: 'VA',
          country: 'USA',
          latitude: 36.8529,
          longitude: -75.9780,
          format_type: 'pool_play',
          max_participants: 28,
          current_participants: 22,
          entry_fee: 375,
          prize_info: 'Team Awards',
          status: 'open',
          rules: { weather_policy: 'Rain or shine', bracket_play: true }
        },
        {
          organization_id: organization.id,
          title: 'All-Star Softball Series',
          sport: 'Softball',
          description: 'Multi-weekend series culminating in championship finals. Points system for series standings.',
          start_date: '2024-10-05',
          end_date: '2024-10-07',
          registration_deadline: '2024-09-28',
          location_name: 'Premier Diamond Complex',
          city: 'Atlanta',
          state: 'GA',
          country: 'USA',
          latitude: 33.7490,
          longitude: -84.3880,
          format_type: 'round_robin',
          max_participants: 20,
          current_participants: 18,
          entry_fee: 425,
          prize_info: '$4,000 Championship Prize',
          status: 'open',
          rules: { series_format: true, points_system: 'Win 3pts, Tie 1pt' }
        },
        {
          organization_id: organization.id,
          title: 'Youth Basketball Tournament',
          sport: 'Basketball',
          description: 'AAU-sanctioned youth basketball tournament featuring top teams from the region.',
          start_date: '2024-07-20',
          end_date: '2024-07-22',
          registration_deadline: '2024-07-13',
          location_name: 'Metro Sports Arena',
          city: 'Los Angeles',
          state: 'CA',
          country: 'USA',
          latitude: 34.0522,
          longitude: -118.2437,
          format_type: 'single_elimination',
          max_participants: 16,
          current_participants: 14,
          entry_fee: 350,
          prize_info: 'Championship Rings',
          status: 'open',
          rules: { age_groups: ['12U', '14U', '16U'], aau_rules: true }
        },
        {
          organization_id: organization.id,
          title: 'Premier Soccer Cup',
          sport: 'Soccer',
          description: 'Competitive soccer tournament for youth select teams. Multiple age divisions.',
          start_date: '2024-08-10',
          end_date: '2024-08-12',
          registration_deadline: '2024-08-03',
          location_name: 'Elite Soccer Complex',
          city: 'Dallas',
          state: 'TX',
          country: 'USA',
          latitude: 32.7767,
          longitude: -96.7970,
          format_type: 'pool_play',
          max_participants: 32,
          current_participants: 29,
          entry_fee: 400,
          prize_info: 'Trophies for Top 3',
          status: 'open',
          rules: { fifa_rules: true, game_length: '2x30min halves' }
        },
        {
          organization_id: organization.id,
          title: 'Fall Softball Showcase',
          sport: 'Softball',
          description: 'End of season showcase tournament. Perfect for team evaluations and recruitment.',
          start_date: '2024-11-01',
          end_date: '2024-11-03',
          registration_deadline: '2024-10-25',
          location_name: 'Tournament Fields Complex',
          city: 'Orlando',
          state: 'FL',
          country: 'USA',
          latitude: 28.5383,
          longitude: -81.3792,
          format_type: 'showcase',
          max_participants: 40,
          current_participants: 8,
          entry_fee: 475,
          prize_info: 'College Coach Attendance',
          status: 'open',
          rules: { showcase_format: true, scout_attendance: 'Confirmed' }
        },
        {
          organization_id: organization.id,
          title: 'Holiday Hoops Classic',
          sport: 'Basketball',
          description: 'Holiday basketball tournament featuring competitive play during winter break.',
          start_date: '2024-12-20',
          end_date: '2024-12-22',
          registration_deadline: '2024-12-13',
          location_name: 'Convention Center Arena',
          city: 'Chicago',
          state: 'IL',
          country: 'USA',
          latitude: 41.8781,
          longitude: -87.6298,
          format_type: 'double_elimination',
          max_participants: 20,
          current_participants: 5,
          entry_fee: 425,
          prize_info: 'Championship Banners',
          status: 'open',
          rules: { holiday_format: true, multiple_divisions: true }
        },
        {
          organization_id: organization.id,
          title: 'Spring Training Softball',
          sport: 'Softball',
          description: 'Early season tournament perfect for team building and skill development.',
          start_date: '2024-03-15',
          end_date: '2024-03-17',
          registration_deadline: '2024-03-08',
          location_name: 'Spring Training Complex',
          city: 'Scottsdale',
          state: 'AZ',
          country: 'USA',
          latitude: 33.4942,
          longitude: -111.9261,
          format_type: 'pool_play',
          max_participants: 36,
          current_participants: 32,
          entry_fee: 395,
          prize_info: 'Team Medals',
          status: 'in_progress',
          rules: { spring_format: true, skill_clinics: 'Available' }
        }
      ];

      const { data, error } = await supabase
        .from('tournaments')
        .insert(exampleTournaments)
        .select();

      if (error) throw error;

      setMessage(`✅ Successfully added ${data.length} example tournaments!`);
      setTimeout(() => {
        window.location.reload();
      }, 1500);

    } catch (error: any) {
      console.error('Error:', error);
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={addTournaments}
        disabled={loading || !organization}
        className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Adding...' : 'Add 10 Example Tournaments'}
      </button>
      {message && (
        <div className={`mt-2 px-4 py-2 rounded-lg text-sm ${
          message.includes('✅') ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
        }`}>
          {message}
        </div>
      )}
    </div>
  );
}
