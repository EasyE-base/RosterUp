import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { Icon, LatLngExpression } from 'leaflet';
import { Trophy, MapPin, Calendar, Building2 } from 'lucide-react';
import { Tournament, Organization } from '../lib/supabase';

interface TournamentMapProps {
  tournaments: Tournament[];
  organizations?: Organization[];
  center?: LatLngExpression;
  zoom?: number;
  onTournamentClick?: (tournament: Tournament) => void;
}

const tournamentIcon = new Icon({
  iconUrl: 'https://cdn.jsdelivr.net/gh/pointhi/leaflet-color-markers@master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const organizationIcon = new Icon({
  iconUrl: 'https://cdn.jsdelivr.net/gh/pointhi/leaflet-color-markers@master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export default function TournamentMap({
  tournaments,
  organizations = [],
  center = [39.8283, -98.5795],
  zoom = 4,
  onTournamentClick,
}: TournamentMapProps) {
  const validTournaments = tournaments.filter(
    (t) => t.latitude !== null && t.longitude !== null
  );

  const validOrganizations = organizations.filter(
    (o) => o.latitude !== null && o.longitude !== null
  );

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height: '100%', width: '100%', borderRadius: '0.75rem' }}
      className="z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MarkerClusterGroup chunkedLoading>
        {validTournaments.map((tournament) => (
          <Marker
            key={`tournament-${tournament.id}`}
            position={[tournament.latitude!, tournament.longitude!]}
            icon={tournamentIcon}
          >
            <Popup className="tournament-popup">
              <div className="p-2 min-w-[250px]">
                <div className="flex items-start space-x-2 mb-2">
                  <Trophy className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <h3 className="font-bold text-slate-900 leading-tight">
                    {tournament.title}
                  </h3>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2 text-slate-600">
                    <span className="font-medium">{tournament.sport}</span>
                    <span>•</span>
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                      {tournament.format_type.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="flex items-start space-x-2 text-slate-600">
                    <Calendar className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">{formatDate(tournament.start_date)}</p>
                      {tournament.start_date !== tournament.end_date && (
                        <p className="text-xs">to {formatDate(tournament.end_date)}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start space-x-2 text-slate-600">
                    <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">{tournament.location_name}</p>
                      <p className="text-xs">
                        {tournament.city}
                        {tournament.state && `, ${tournament.state}`}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200">
                    <p className="text-xs text-slate-500">
                      {tournament.current_participants} / {tournament.max_participants} participants
                    </p>
                  </div>
                </div>

                {onTournamentClick && (
                  <button
                    onClick={() => onTournamentClick(tournament)}
                    className="mt-3 w-full py-2 px-3 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded transition-colors"
                  >
                    View Details
                  </button>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        {validOrganizations.map((org) => (
          <Marker
            key={`org-${org.id}`}
            position={[org.latitude!, org.longitude!]}
            icon={organizationIcon}
          >
            <Popup>
              <div className="p-2 min-w-[200px]">
                <div className="flex items-start space-x-2 mb-2">
                  <Building2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <h3 className="font-bold text-slate-900 leading-tight">{org.name}</h3>
                </div>

                <div className="space-y-1 text-sm">
                  <div className="flex items-start space-x-2 text-slate-600">
                    <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs">
                        {org.city}
                        {org.state && `, ${org.state}`}
                      </p>
                    </div>
                  </div>

                  {org.description && (
                    <p className="text-xs text-slate-600 mt-2">{org.description}</p>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MarkerClusterGroup>
    </MapContainer>
  );
}
