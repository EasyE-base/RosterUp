import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Loader2, AlertCircle, TrendingUp, Award, Calendar, X } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { PlayerStatistics } from '../../../lib/supabase';

interface StatsManagerProps {
  playerId: string;
  sport: string;
  editMode: boolean;
}

// Sport-specific stat schemas
const STAT_SCHEMAS = {
  baseball: {
    batting: [
      { key: 'avg', label: 'Batting Avg', type: 'decimal', min: 0, max: 1 },
      { key: 'obp', label: 'On-Base %', type: 'decimal', min: 0, max: 1 },
      { key: 'slg', label: 'Slugging %', type: 'decimal', min: 0, max: 2 },
      { key: 'ops', label: 'OPS', type: 'decimal', min: 0, max: 2 },
      { key: 'ab', label: 'At Bats', type: 'number', min: 0 },
      { key: 'hits', label: 'Hits', type: 'number', min: 0 },
      { key: 'doubles', label: '2B', type: 'number', min: 0 },
      { key: 'triples', label: '3B', type: 'number', min: 0 },
      { key: 'hr', label: 'Home Runs', type: 'number', min: 0 },
      { key: 'rbi', label: 'RBI', type: 'number', min: 0 },
      { key: 'runs', label: 'Runs', type: 'number', min: 0 },
      { key: 'bb', label: 'Walks', type: 'number', min: 0 },
      { key: 'so', label: 'Strikeouts', type: 'number', min: 0 },
      { key: 'sb', label: 'Stolen Bases', type: 'number', min: 0 },
    ],
    pitching: [
      { key: 'era', label: 'ERA', type: 'decimal', min: 0 },
      { key: 'whip', label: 'WHIP', type: 'decimal', min: 0 },
      { key: 'wins', label: 'Wins', type: 'number', min: 0 },
      { key: 'losses', label: 'Losses', type: 'number', min: 0 },
      { key: 'saves', label: 'Saves', type: 'number', min: 0 },
      { key: 'ip', label: 'Innings Pitched', type: 'decimal', min: 0 },
      { key: 'strikeouts', label: 'Strikeouts', type: 'number', min: 0 },
      { key: 'walks', label: 'Walks', type: 'number', min: 0 },
      { key: 'hits_allowed', label: 'Hits Allowed', type: 'number', min: 0 },
      { key: 'er', label: 'Earned Runs', type: 'number', min: 0 },
    ],
    fielding: [
      { key: 'fpct', label: 'Fielding %', type: 'decimal', min: 0, max: 1 },
      { key: 'putouts', label: 'Putouts', type: 'number', min: 0 },
      { key: 'assists', label: 'Assists', type: 'number', min: 0 },
      { key: 'errors', label: 'Errors', type: 'number', min: 0 },
    ]
  },
  softball: {
    batting: [
      { key: 'avg', label: 'Batting Avg', type: 'decimal', min: 0, max: 1 },
      { key: 'obp', label: 'On-Base %', type: 'decimal', min: 0, max: 1 },
      { key: 'slg', label: 'Slugging %', type: 'decimal', min: 0, max: 2 },
      { key: 'ops', label: 'OPS', type: 'decimal', min: 0, max: 2 },
      { key: 'ab', label: 'At Bats', type: 'number', min: 0 },
      { key: 'hits', label: 'Hits', type: 'number', min: 0 },
      { key: 'doubles', label: '2B', type: 'number', min: 0 },
      { key: 'triples', label: '3B', type: 'number', min: 0 },
      { key: 'hr', label: 'Home Runs', type: 'number', min: 0 },
      { key: 'rbi', label: 'RBI', type: 'number', min: 0 },
      { key: 'runs', label: 'Runs', type: 'number', min: 0 },
      { key: 'bb', label: 'Walks', type: 'number', min: 0 },
      { key: 'so', label: 'Strikeouts', type: 'number', min: 0 },
      { key: 'sb', label: 'Stolen Bases', type: 'number', min: 0 },
    ],
    pitching: [
      { key: 'era', label: 'ERA', type: 'decimal', min: 0 },
      { key: 'whip', label: 'WHIP', type: 'decimal', min: 0 },
      { key: 'wins', label: 'Wins', type: 'number', min: 0 },
      { key: 'losses', label: 'Losses', type: 'number', min: 0 },
      { key: 'saves', label: 'Saves', type: 'number', min: 0 },
      { key: 'ip', label: 'Innings Pitched', type: 'decimal', min: 0 },
      { key: 'strikeouts', label: 'Strikeouts', type: 'number', min: 0 },
      { key: 'walks', label: 'Walks', type: 'number', min: 0 },
      { key: 'hits_allowed', label: 'Hits Allowed', type: 'number', min: 0 },
      { key: 'er', label: 'Earned Runs', type: 'number', min: 0 },
    ],
    fielding: [
      { key: 'fpct', label: 'Fielding %', type: 'decimal', min: 0, max: 1 },
      { key: 'putouts', label: 'Putouts', type: 'number', min: 0 },
      { key: 'assists', label: 'Assists', type: 'number', min: 0 },
      { key: 'errors', label: 'Errors', type: 'number', min: 0 },
    ]
  },
  basketball: {
    offense: [
      { key: 'ppg', label: 'Points Per Game', type: 'decimal', min: 0 },
      { key: 'fg_pct', label: 'FG %', type: 'decimal', min: 0, max: 1 },
      { key: 'three_pt_pct', label: '3PT %', type: 'decimal', min: 0, max: 1 },
      { key: 'ft_pct', label: 'FT %', type: 'decimal', min: 0, max: 1 },
      { key: 'total_points', label: 'Total Points', type: 'number', min: 0 },
      { key: 'fgm', label: 'FG Made', type: 'number', min: 0 },
      { key: 'fga', label: 'FG Attempted', type: 'number', min: 0 },
      { key: 'three_pm', label: '3PT Made', type: 'number', min: 0 },
      { key: 'three_pa', label: '3PT Attempted', type: 'number', min: 0 },
      { key: 'ftm', label: 'FT Made', type: 'number', min: 0 },
      { key: 'fta', label: 'FT Attempted', type: 'number', min: 0 },
    ],
    other: [
      { key: 'rpg', label: 'Rebounds Per Game', type: 'decimal', min: 0 },
      { key: 'apg', label: 'Assists Per Game', type: 'decimal', min: 0 },
      { key: 'spg', label: 'Steals Per Game', type: 'decimal', min: 0 },
      { key: 'bpg', label: 'Blocks Per Game', type: 'decimal', min: 0 },
      { key: 'total_rebounds', label: 'Total Rebounds', type: 'number', min: 0 },
      { key: 'total_assists', label: 'Total Assists', type: 'number', min: 0 },
      { key: 'total_steals', label: 'Total Steals', type: 'number', min: 0 },
      { key: 'total_blocks', label: 'Total Blocks', type: 'number', min: 0 },
      { key: 'turnovers', label: 'Turnovers', type: 'number', min: 0 },
    ]
  },
  soccer: {
    offense: [
      { key: 'goals', label: 'Goals', type: 'number', min: 0 },
      { key: 'assists', label: 'Assists', type: 'number', min: 0 },
      { key: 'shots', label: 'Shots', type: 'number', min: 0 },
      { key: 'shots_on_goal', label: 'Shots on Goal', type: 'number', min: 0 },
      { key: 'shot_accuracy', label: 'Shot Accuracy %', type: 'decimal', min: 0, max: 1 },
    ],
    defense: [
      { key: 'tackles', label: 'Tackles', type: 'number', min: 0 },
      { key: 'interceptions', label: 'Interceptions', type: 'number', min: 0 },
      { key: 'clearances', label: 'Clearances', type: 'number', min: 0 },
      { key: 'blocks', label: 'Blocks', type: 'number', min: 0 },
    ],
    goalkeeping: [
      { key: 'saves', label: 'Saves', type: 'number', min: 0 },
      { key: 'goals_against', label: 'Goals Against', type: 'number', min: 0 },
      { key: 'clean_sheets', label: 'Clean Sheets', type: 'number', min: 0 },
      { key: 'save_pct', label: 'Save %', type: 'decimal', min: 0, max: 1 },
    ],
    other: [
      { key: 'yellow_cards', label: 'Yellow Cards', type: 'number', min: 0 },
      { key: 'red_cards', label: 'Red Cards', type: 'number', min: 0 },
      { key: 'fouls', label: 'Fouls', type: 'number', min: 0 },
    ]
  }
};

export default function StatsManager({ playerId, sport, editMode }: StatsManagerProps) {
  const [statistics, setStatistics] = useState<PlayerStatistics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStat, setEditingStat] = useState<PlayerStatistics | null>(null);

  // Form state
  const [season, setSeason] = useState('');
  const [gamesPlayed, setGamesPlayed] = useState('');
  const [highlights, setHighlights] = useState('');
  const [statsData, setStatsData] = useState<any>({});

  useEffect(() => {
    loadStatistics();
  }, [playerId, sport]);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('player_statistics')
        .select('*')
        .eq('player_id', playerId)
        .eq('sport', sport.toLowerCase())
        .order('season', { ascending: false });

      if (error) throw error;
      setStatistics(data || []);
    } catch (err) {
      console.error('Error loading statistics:', err);
      setError('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingStat(null);
    setSeason('');
    setGamesPlayed('');
    setHighlights('');
    setStatsData({});
    setShowAddModal(true);
  };

  const openEditModal = (stat: PlayerStatistics) => {
    setEditingStat(stat);
    setSeason(stat.season);
    setGamesPlayed(stat.games_played.toString());
    setHighlights(stat.highlights || '');
    setStatsData(stat.stats_data);
    setShowAddModal(true);
  };

  const handleStatChange = (key: string, value: string) => {
    setStatsData((prev: any) => ({
      ...prev,
      [key]: value === '' ? null : parseFloat(value) || 0
    }));
  };

  const saveStat = async () => {
    if (!season || !gamesPlayed) {
      setError('Season and games played are required');
      return;
    }

    try {
      const statRecord = {
        player_id: playerId,
        season,
        sport: sport.toLowerCase(),
        stats_data: statsData,
        games_played: parseInt(gamesPlayed),
        highlights: highlights || null,
        source: 'manual',
        verified: false
      };

      if (editingStat) {
        // Update existing
        const { error: updateError } = await supabase
          .from('player_statistics')
          .update(statRecord)
          .eq('id', editingStat.id);

        if (updateError) throw updateError;
      } else {
        // Insert new
        const { error: insertError } = await supabase
          .from('player_statistics')
          .insert(statRecord);

        if (insertError) throw insertError;
      }

      setShowAddModal(false);
      await loadStatistics();
    } catch (err: any) {
      console.error('Error saving statistics:', err);
      if (err.code === '23505') {
        setError(`Statistics for ${season} season already exist. Please edit the existing record.`);
      } else {
        setError('Failed to save statistics');
      }
    }
  };

  const deleteStat = async (statId: string) => {
    if (!confirm('Are you sure you want to delete these statistics?')) return;

    try {
      const { error } = await supabase
        .from('player_statistics')
        .delete()
        .eq('id', statId);

      if (error) throw error;
      await loadStatistics();
    } catch (err) {
      console.error('Error deleting statistics:', err);
      setError('Failed to delete statistics');
    }
  };

  const calculateCareerStats = () => {
    if (statistics.length === 0) return null;

    const sportLower = sport.toLowerCase();
    const schema = STAT_SCHEMAS[sportLower as keyof typeof STAT_SCHEMAS];
    if (!schema) return null;

    const totals: any = {};
    const counts: any = {};
    let totalGames = 0;

    statistics.forEach(stat => {
      totalGames += stat.games_played;

      Object.values(schema).flat().forEach((field: any) => {
        const value = stat.stats_data[field.key];
        if (value !== null && value !== undefined) {
          // For averages/percentages, we'll recalculate at the end
          if (field.type === 'number') {
            totals[field.key] = (totals[field.key] || 0) + value;
          } else if (field.type === 'decimal') {
            totals[field.key] = (totals[field.key] || 0) + value;
            counts[field.key] = (counts[field.key] || 0) + 1;
          }
        }
      });
    });

    // Calculate averages for decimal fields
    Object.keys(counts).forEach(key => {
      if (counts[key] > 0) {
        totals[key] = (totals[key] / counts[key]).toFixed(3);
      }
    });

    return { totals, totalGames, totalSeasons: statistics.length };
  };

  const renderStatFields = (category: string, fields: any[]) => {
    return (
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-blue-400 uppercase tracking-wider">
          {category}
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {fields.map((field) => (
            <div key={field.key}>
              <label className="block text-sm text-slate-400 mb-1">
                {field.label}
              </label>
              <input
                type="number"
                step={field.type === 'decimal' ? '0.001' : '1'}
                min={field.min}
                max={field.max}
                value={statsData[field.key] ?? ''}
                onChange={(e) => handleStatChange(field.key, e.target.value)}
                className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded text-white focus:outline-none focus:border-blue-500"
                placeholder={field.type === 'decimal' ? '0.000' : '0'}
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const sportLower = sport.toLowerCase();
  const schema = STAT_SCHEMAS[sportLower as keyof typeof STAT_SCHEMAS];
  const careerStats = calculateCareerStats();

  if (!schema) {
    return (
      <div className="text-center py-12 bg-slate-800/30 rounded-lg border border-slate-700/50">
        <TrendingUp className="w-16 h-16 text-slate-600 mx-auto mb-4" />
        <p className="text-slate-400">Statistics tracking not available for {sport}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Career Stats Summary */}
      {careerStats && statistics.length > 0 && (
        <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-lg p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Award className="w-6 h-6 text-blue-400" />
            <h3 className="text-xl font-bold text-white">Career Stats</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-slate-400">Seasons</p>
              <p className="text-2xl font-bold text-white">{careerStats.totalSeasons}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400">Games Played</p>
              <p className="text-2xl font-bold text-white">{careerStats.totalGames}</p>
            </div>
            {Object.entries(schema).map(([category, fields]: [string, any]) => {
              const mainStat = fields[0];
              const value = careerStats.totals[mainStat.key];
              if (value !== undefined && value !== null) {
                return (
                  <div key={mainStat.key}>
                    <p className="text-sm text-slate-400">{mainStat.label}</p>
                    <p className="text-2xl font-bold text-white">
                      {mainStat.type === 'decimal' ? parseFloat(value).toFixed(3) : value}
                    </p>
                  </div>
                );
              }
              return null;
            })}
          </div>
        </div>
      )}

      {/* Add Stats Button */}
      {editMode && (
        <button
          onClick={openAddModal}
          className="w-full py-4 border-2 border-dashed border-slate-700 rounded-lg text-slate-300 hover:border-blue-500 hover:text-blue-400 transition-colors flex items-center justify-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Add Season Statistics</span>
        </button>
      )}

      {/* Season Stats List */}
      {statistics.length === 0 ? (
        <div className="text-center py-12 bg-slate-800/30 rounded-lg border border-slate-700/50">
          <TrendingUp className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">No statistics recorded yet</p>
          {editMode && (
            <p className="text-sm text-slate-500 mt-2">Add your season statistics to showcase your performance</p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {statistics.map((stat) => (
            <div
              key={stat.id}
              className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6 hover:border-blue-500/50 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-500/20 rounded">
                    <Calendar className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white">{stat.season} Season</h4>
                    <p className="text-sm text-slate-400">{stat.games_played} Games Played</p>
                  </div>
                </div>
                {editMode && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openEditModal(stat)}
                      className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteStat(stat.id)}
                      className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Display stats by category */}
              {Object.entries(schema).map(([category, fields]: [string, any]) => {
                const categoryStats = fields
                  .map((field: any) => ({
                    ...field,
                    value: stat.stats_data[field.key]
                  }))
                  .filter((field: any) => field.value !== null && field.value !== undefined);

                if (categoryStats.length === 0) return null;

                return (
                  <div key={category} className="mb-4">
                    <h5 className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-3">
                      {category}
                    </h5>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                      {categoryStats.map((field: any) => (
                        <div key={field.key} className="bg-slate-900/50 rounded p-2">
                          <p className="text-xs text-slate-500">{field.label}</p>
                          <p className="text-lg font-bold text-white">
                            {field.type === 'decimal'
                              ? parseFloat(field.value).toFixed(3)
                              : field.value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              {/* Highlights */}
              {stat.highlights && (
                <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded">
                  <p className="text-xs text-yellow-400 font-semibold mb-1">Season Highlights</p>
                  <p className="text-sm text-slate-300">{stat.highlights}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="bg-slate-900 border border-slate-700 rounded-lg p-6 max-w-4xl w-full my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">
                {editingStat ? 'Edit Statistics' : 'Add Season Statistics'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-slate-800 rounded transition-colors"
              >
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>

            <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-2">
                    Season <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={season}
                    onChange={(e) => setSeason(e.target.value)}
                    placeholder="e.g., 2024, Fall 2023, 2023-2024"
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">
                    Games Played <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    value={gamesPlayed}
                    onChange={(e) => setGamesPlayed(e.target.value)}
                    min="0"
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Sport-specific stats */}
              {Object.entries(schema).map(([category, fields]) => (
                <div key={category}>
                  {renderStatFields(category, fields as any[])}
                </div>
              ))}

              {/* Highlights */}
              <div>
                <label className="block text-sm text-slate-400 mb-2">
                  Season Highlights
                </label>
                <textarea
                  value={highlights}
                  onChange={(e) => setHighlights(e.target.value)}
                  rows={3}
                  placeholder="Notable achievements, records, awards..."
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-3 mt-6 pt-6 border-t border-slate-700">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveStat}
                className="flex-1 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-semibold"
              >
                {editingStat ? 'Update Statistics' : 'Save Statistics'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
