import { useState, useEffect } from 'react';
import { AppleCard, AppleHeading, AppleBadge } from '@/components/apple';
import { MapPin, Navigation } from 'lucide-react';

interface TravelRadiusMapProps {
  city: string;
  state: string;
  travelRadius: number;
  editable?: boolean;
  onRadiusChange?: (radius: number) => void;
}

export default function TravelRadiusMap({
  city,
  state,
  travelRadius,
  editable = false,
  onRadiusChange,
}: TravelRadiusMapProps) {
  const [localRadius, setLocalRadius] = useState(travelRadius);

  useEffect(() => {
    setLocalRadius(travelRadius);
  }, [travelRadius]);

  const handleRadiusChange = (newRadius: number) => {
    setLocalRadius(newRadius);
    if (onRadiusChange) {
      onRadiusChange(newRadius);
    }
  };

  // Calculate radius percentage for visual display (max 100 miles = 100%)
  const radiusPercentage = Math.min((localRadius / 100) * 100, 100);

  return (
    <AppleCard variant="default" padding="lg">
      <AppleHeading level={3} size="subsection" className="mb-4">
        Service Area
      </AppleHeading>

      {/* Location Display */}
      <div className="flex items-center gap-2 mb-6">
        <MapPin className="w-5 h-5 text-[rgb(0,113,227)]" />
        <div>
          <p className="font-semibold text-[rgb(29,29,31)]">
            {city}, {state}
          </p>
          <p className="text-sm text-[rgb(134,142,150)]">
            Willing to travel up to {localRadius} miles
          </p>
        </div>
      </div>

      {/* Visual Map Representation */}
      <div className="relative aspect-square w-full bg-gradient-to-br from-blue-50 to-slate-100 rounded-2xl overflow-hidden border-2 border-slate-200">
        {/* Grid Pattern */}
        <svg
          className="absolute inset-0 w-full h-full opacity-10"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="grid"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* Travel Radius Circles */}
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 200 200"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer radius circle (travel area) */}
          <circle
            cx="100"
            cy="100"
            r={radiusPercentage * 0.8}
            fill="rgb(0,113,227)"
            fillOpacity="0.1"
            stroke="rgb(0,113,227)"
            strokeWidth="2"
            strokeDasharray="4 4"
            className="transition-all duration-300"
          />

          {/* Inner circle (25% of travel radius) */}
          <circle
            cx="100"
            cy="100"
            r={radiusPercentage * 0.2}
            fill="rgb(0,113,227)"
            fillOpacity="0.15"
            stroke="rgb(0,113,227)"
            strokeWidth="1"
            className="transition-all duration-300"
          />

          {/* Center marker (trainer's location) */}
          <circle
            cx="100"
            cy="100"
            r="8"
            fill="rgb(0,113,227)"
            className="drop-shadow-lg"
          />
          <circle
            cx="100"
            cy="100"
            r="4"
            fill="white"
          />

          {/* Animated pulse effect */}
          <circle cx="100" cy="100" r="8" fill="rgb(0,113,227)" opacity="0.5">
            <animate
              attributeName="r"
              from="8"
              to="20"
              dur="2s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              from="0.5"
              to="0"
              dur="2s"
              repeatCount="indefinite"
            />
          </circle>

          {/* Direction indicators */}
          <text
            x="100"
            y="15"
            textAnchor="middle"
            className="fill-[rgb(134,142,150)] text-xs font-semibold"
          >
            N
          </text>
          <text
            x="185"
            y="105"
            textAnchor="middle"
            className="fill-[rgb(134,142,150)] text-xs font-semibold"
          >
            E
          </text>
          <text
            x="100"
            y="195"
            textAnchor="middle"
            className="fill-[rgb(134,142,150)] text-xs font-semibold"
          >
            S
          </text>
          <text
            x="15"
            y="105"
            textAnchor="middle"
            className="fill-[rgb(134,142,150)] text-xs font-semibold"
          >
            W
          </text>
        </svg>

        {/* Location Label Overlay */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg border border-slate-200">
            <p className="text-xs font-bold text-[rgb(0,113,227)] whitespace-nowrap">
              {city}
            </p>
          </div>
        </div>

        {/* Radius Label */}
        <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-lg border border-slate-200">
          <p className="text-xs font-semibold text-[rgb(134,142,150)]">
            {localRadius} mi radius
          </p>
        </div>
      </div>

      {/* Radius Slider (if editable) */}
      {editable && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold text-[rgb(29,29,31)]">
              Travel Radius
            </label>
            <AppleBadge variant="primary" size="sm">
              {localRadius} miles
            </AppleBadge>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={localRadius}
            onChange={(e) => handleRadiusChange(parseInt(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[rgb(0,113,227)]"
          />
          <div className="flex justify-between text-xs text-[rgb(134,142,150)] mt-1">
            <span>0 miles</span>
            <span>50 miles</span>
            <span>100 miles</span>
          </div>
        </div>
      )}

      {/* Coverage Stats */}
      <div className="grid grid-cols-3 gap-3 mt-6">
        <div className="text-center p-3 bg-[rgb(247,247,249)] rounded-lg">
          <Navigation className="w-4 h-4 text-[rgb(0,113,227)] mx-auto mb-1" />
          <p className="text-xs font-semibold text-[rgb(29,29,31)]">
            {localRadius}mi
          </p>
          <p className="text-xs text-[rgb(134,142,150)]">Max Range</p>
        </div>
        <div className="text-center p-3 bg-[rgb(247,247,249)] rounded-lg">
          <div className="w-4 h-4 bg-[rgb(0,113,227)]/20 rounded-full mx-auto mb-1 flex items-center justify-center">
            <div className="w-2 h-2 bg-[rgb(0,113,227)] rounded-full" />
          </div>
          <p className="text-xs font-semibold text-[rgb(29,29,31)]">
            {Math.round(Math.PI * localRadius * localRadius)} sq mi
          </p>
          <p className="text-xs text-[rgb(134,142,150)]">Coverage</p>
        </div>
        <div className="text-center p-3 bg-[rgb(247,247,249)] rounded-lg">
          <MapPin className="w-4 h-4 text-[rgb(0,113,227)] mx-auto mb-1" />
          <p className="text-xs font-semibold text-[rgb(29,29,31)]">
            {city}
          </p>
          <p className="text-xs text-[rgb(134,142,150)]">Home Base</p>
        </div>
      </div>
    </AppleCard>
  );
}
