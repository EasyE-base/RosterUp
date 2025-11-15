import { X } from 'lucide-react';

interface Position {
  value: string;
  label: string;
}

interface PositionTagSelectorProps {
  sport: string;
  selectedPositions: string[];
  availablePositions: Position[];
  onChange: (positions: string[]) => void;
  disabled?: boolean;
}

export default function PositionTagSelector({
  sport,
  selectedPositions,
  availablePositions,
  onChange,
  disabled = false,
}: PositionTagSelectorProps) {
  const togglePosition = (positionValue: string) => {
    if (disabled) return;

    if (selectedPositions.includes(positionValue)) {
      // Remove position
      onChange(selectedPositions.filter((p) => p !== positionValue));
    } else {
      // Add position
      onChange([...selectedPositions, positionValue]);
    }
  };

  const removePosition = (positionValue: string) => {
    if (disabled) return;
    onChange(selectedPositions.filter((p) => p !== positionValue));
  };

  if (!sport) {
    return (
      <div className="p-4 bg-slate-800/30 border border-slate-700/50 rounded-lg text-center text-slate-400 text-sm">
        Please select a sport first to choose positions
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Selected Positions as Tags */}
      {selectedPositions.length > 0 && (
        <div className="flex flex-wrap gap-2 p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
          {selectedPositions.map((posValue) => {
            const position = availablePositions.find((p) => p.value === posValue);
            return (
              <div
                key={posValue}
                className="flex items-center space-x-2 px-3 py-1.5 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 text-blue-300 rounded-full text-sm font-medium"
              >
                <span>{position?.label || posValue}</span>
                {!disabled && (
                  <button
                    type="button"
                    onClick={() => removePosition(posValue)}
                    className="hover:bg-blue-500/30 rounded-full p-0.5 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Available Positions Grid */}
      <div>
        <p className="text-sm text-slate-400 mb-3">
          {selectedPositions.length > 0
            ? 'Click to add more positions:'
            : 'Click to select positions you can play:'}
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {availablePositions.map((position) => {
            const isSelected = selectedPositions.includes(position.value);
            return (
              <button
                key={position.value}
                type="button"
                onClick={() => togglePosition(position.value)}
                disabled={disabled}
                className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all border ${
                  isSelected
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-400 text-white border-blue-400 shadow-lg shadow-blue-500/30'
                    : 'bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                {position.label}
              </button>
            );
          })}
        </div>
      </div>

      {selectedPositions.length === 0 && (
        <p className="text-xs text-slate-500 italic">
          Select at least one position to improve your profile visibility
        </p>
      )}
    </div>
  );
}
