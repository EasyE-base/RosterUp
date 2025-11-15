// Player Marketplace Constants

export const TRAVEL_SPORTS = [
  { value: 'Softball', label: 'Softball' },
  { value: 'Baseball', label: 'Baseball' },
  { value: 'Basketball', label: 'Basketball' },
  { value: 'Soccer', label: 'Soccer' },
  { value: 'Football', label: 'Football' },
  { value: 'Volleyball', label: 'Volleyball' },
  { value: 'Hockey', label: 'Hockey' },
  { value: 'Lacrosse', label: 'Lacrosse' },
];

export const AGE_GROUPS = [
  { value: '8U', label: '8U (Under 8)' },
  { value: '10U', label: '10U (Under 10)' },
  { value: '12U', label: '12U (Under 12)' },
  { value: '14U', label: '14U (Under 14)' },
  { value: '16U', label: '16U (Under 16)' },
  { value: '18U', label: '18U (Under 18)' },
  { value: 'College', label: 'College' },
];

// Sport-specific positions
export const SOFTBALL_POSITIONS = [
  { value: 'Pitcher', label: 'Pitcher' },
  { value: 'Catcher', label: 'Catcher' },
  { value: 'First Base', label: 'First Base' },
  { value: 'Second Base', label: 'Second Base' },
  { value: 'Third Base', label: 'Third Base' },
  { value: 'Shortstop', label: 'Shortstop' },
  { value: 'Left Field', label: 'Left Field' },
  { value: 'Center Field', label: 'Center Field' },
  { value: 'Right Field', label: 'Right Field' },
  { value: 'Utility', label: 'Utility' },
];

export const BASEBALL_POSITIONS = [
  { value: 'Pitcher', label: 'Pitcher' },
  { value: 'Catcher', label: 'Catcher' },
  { value: 'First Base', label: 'First Base' },
  { value: 'Second Base', label: 'Second Base' },
  { value: 'Third Base', label: 'Third Base' },
  { value: 'Shortstop', label: 'Shortstop' },
  { value: 'Left Field', label: 'Left Field' },
  { value: 'Center Field', label: 'Center Field' },
  { value: 'Right Field', label: 'Right Field' },
  { value: 'Designated Hitter', label: 'Designated Hitter' },
  { value: 'Utility', label: 'Utility' },
];

export const BASKETBALL_POSITIONS = [
  { value: 'Point Guard', label: 'Point Guard (PG)' },
  { value: 'Shooting Guard', label: 'Shooting Guard (SG)' },
  { value: 'Small Forward', label: 'Small Forward (SF)' },
  { value: 'Power Forward', label: 'Power Forward (PF)' },
  { value: 'Center', label: 'Center (C)' },
  { value: 'Guard', label: 'Guard' },
  { value: 'Forward', label: 'Forward' },
];

export const SOCCER_POSITIONS = [
  { value: 'Goalkeeper', label: 'Goalkeeper (GK)' },
  { value: 'Defender', label: 'Defender' },
  { value: 'Center Back', label: 'Center Back (CB)' },
  { value: 'Full Back', label: 'Full Back (FB)' },
  { value: 'Wing Back', label: 'Wing Back (WB)' },
  { value: 'Midfielder', label: 'Midfielder' },
  { value: 'Defensive Midfielder', label: 'Defensive Midfielder (CDM)' },
  { value: 'Central Midfielder', label: 'Central Midfielder (CM)' },
  { value: 'Attacking Midfielder', label: 'Attacking Midfielder (CAM)' },
  { value: 'Winger', label: 'Winger' },
  { value: 'Forward', label: 'Forward' },
  { value: 'Striker', label: 'Striker (ST)' },
];

export const FOOTBALL_POSITIONS = [
  { value: 'Quarterback', label: 'Quarterback (QB)' },
  { value: 'Running Back', label: 'Running Back (RB)' },
  { value: 'Wide Receiver', label: 'Wide Receiver (WR)' },
  { value: 'Tight End', label: 'Tight End (TE)' },
  { value: 'Offensive Line', label: 'Offensive Line' },
  { value: 'Defensive Line', label: 'Defensive Line' },
  { value: 'Linebacker', label: 'Linebacker (LB)' },
  { value: 'Cornerback', label: 'Cornerback (CB)' },
  { value: 'Safety', label: 'Safety (S)' },
  { value: 'Kicker', label: 'Kicker (K)' },
  { value: 'Punter', label: 'Punter (P)' },
];

export const VOLLEYBALL_POSITIONS = [
  { value: 'Setter', label: 'Setter' },
  { value: 'Outside Hitter', label: 'Outside Hitter' },
  { value: 'Middle Blocker', label: 'Middle Blocker' },
  { value: 'Opposite', label: 'Opposite Hitter' },
  { value: 'Libero', label: 'Libero' },
  { value: 'Defensive Specialist', label: 'Defensive Specialist' },
];

export const HOCKEY_POSITIONS = [
  { value: 'Goalie', label: 'Goalie (G)' },
  { value: 'Defenseman', label: 'Defenseman (D)' },
  { value: 'Left Wing', label: 'Left Wing (LW)' },
  { value: 'Right Wing', label: 'Right Wing (RW)' },
  { value: 'Center', label: 'Center (C)' },
  { value: 'Forward', label: 'Forward' },
];

export const LACROSSE_POSITIONS = [
  { value: 'Goalie', label: 'Goalie' },
  { value: 'Defender', label: 'Defender' },
  { value: 'Midfielder', label: 'Midfielder' },
  { value: 'Attacker', label: 'Attacker' },
  { value: 'Face-Off Specialist', label: 'Face-Off Specialist (FOGO)' },
];

// Function to get positions by sport
export function getPositionsBySport(sport: string): { value: string; label: string }[] {
  switch (sport) {
    case 'Softball':
      return SOFTBALL_POSITIONS;
    case 'Baseball':
      return BASEBALL_POSITIONS;
    case 'Basketball':
      return BASKETBALL_POSITIONS;
    case 'Soccer':
      return SOCCER_POSITIONS;
    case 'Football':
      return FOOTBALL_POSITIONS;
    case 'Volleyball':
      return VOLLEYBALL_POSITIONS;
    case 'Hockey':
      return HOCKEY_POSITIONS;
    case 'Lacrosse':
      return LACROSSE_POSITIONS;
    default:
      return [];
  }
}

// US States for location filtering
export const US_STATES = [
  { value: 'AL', label: 'Alabama' },
  { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' },
  { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' },
  { value: 'DE', label: 'Delaware' },
  { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' },
  { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' },
  { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' },
  { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' },
  { value: 'MD', label: 'Maryland' },
  { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' },
  { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' },
  { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' },
  { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' },
  { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' },
  { value: 'OH', label: 'Ohio' },
  { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' },
  { value: 'PA', label: 'Pennsylvania' },
  { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' },
  { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' },
  { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' },
  { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' },
  { value: 'WY', label: 'Wyoming' },
];
