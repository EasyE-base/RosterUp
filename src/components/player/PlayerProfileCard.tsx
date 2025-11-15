import { Link } from 'react-router-dom';
import {  MapPin, Trophy, User, Eye } from 'lucide-react';
import { PlayerProfile } from '../../lib/supabase';
import { CLASSIFICATION_LEVELS } from '../../constants/classifications';

interface PlayerProfileCardProps {
  player: PlayerProfile;
}

export default function PlayerProfileCard({ player }: PlayerProfileCardProps) {
  const classificationLevel = CLASSIFICATION_LEVELS.find(
    (level) => level.value === player.classification
  );

  return (
    <Link
      to={`/players/${player.id}`}
      className="block bg-slate-900/50 border border-slate-800/50 rounded-xl overflow-hidden hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 transition-all group"
    >
      {/* Player Photo */}
      <div className="relative h-48 bg-gradient-to-br from-slate-800 to-slate-900 overflow-hidden">
        {player.photo_url ? (
          <img
            src={player.photo_url}
            alt={`${player.sport} player`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <User className="w-20 h-20 text-slate-700" />
          </div>
        )}

        {/* Classification Badge */}
        {classificationLevel && (
          <div className="absolute top-3 left-3">
            <span
              className={`px-3 py-1 text-xs font-bold rounded-full bg-${classificationLevel.color}-500/20 text-${classificationLevel.color}-400 border border-${classificationLevel.color}-500/30 backdrop-blur-sm`}
            >
              {classificationLevel.shortLabel}
            </span>
          </div>
        )}

        {/* Profile Views */}
        <div className="absolute top-3 right-3 flex items-center space-x-1 px-2 py-1 bg-slate-900/80 backdrop-blur-sm rounded-full text-xs text-slate-300">
          <Eye className="w-3 h-3" />
          <span>{player.profile_views}</span>
        </div>
      </div>

      {/* Player Info */}
      <div className="p-5">
        {/* Player Name */}
        {player.profiles?.full_name && (
          <h3 className="text-xl font-bold text-white mb-2">{player.profiles.full_name}</h3>
        )}

        {/* Sport & Age Group */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Trophy className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-semibold text-blue-400">{player.sport}</span>
          </div>
          {player.age_group && (
            <span className="text-xs text-slate-400 bg-slate-800/50 px-2 py-1 rounded">
              {player.age_group}
            </span>
          )}
        </div>

        {/* Position */}
        {player.position && (
          <p className="text-sm font-medium text-slate-300 mb-2">{player.position}</p>
        )}

        {/* Bio Preview */}
        {player.bio && (
          <p className="text-sm text-slate-400 line-clamp-2 mb-3">{player.bio}</p>
        )}

        {/* Location */}
        {(player.location_city || player.location_state) && (
          <div className="flex items-center space-x-2 text-xs text-slate-500">
            <MapPin className="w-3 h-3" />
            <span>
              {player.location_city}
              {player.location_city && player.location_state && ', '}
              {player.location_state}
            </span>
          </div>
        )}

        {/* Profile Completeness Indicator */}
        <div className="mt-4 pt-4 border-t border-slate-800">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">Profile Completeness</span>
            <span
              className={`font-semibold ${
                player.profile_completeness >= 80
                  ? 'text-green-400'
                  : player.profile_completeness >= 50
                  ? 'text-yellow-400'
                  : 'text-red-400'
              }`}
            >
              {player.profile_completeness}%
            </span>
          </div>
          <div className="mt-2 h-1 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${
                player.profile_completeness >= 80
                  ? 'bg-green-500'
                  : player.profile_completeness >= 50
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
              }`}
              style={{ width: `${player.profile_completeness}%` }}
            />
          </div>
        </div>
      </div>
    </Link>
  );
}
