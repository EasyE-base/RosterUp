// Sanctioning bodies for different sports

export interface SanctioningBody {
  value: string;
  label: string;
  description?: string;
}

// Softball Sanctioning Bodies
export const SOFTBALL_SANCTIONING_BODIES: SanctioningBody[] = [
  {
    value: 'USA_SOFTBALL',
    label: 'USA Softball',
    description: 'Formerly ASA - National governing body in the U.S.'
  },
  {
    value: 'USSSA',
    label: 'USSSA',
    description: 'United States Specialty Sports Association - Large national travel softball'
  },
  {
    value: 'ISA',
    label: 'ISA',
    description: 'Independent Softball Association'
  },
  {
    value: 'NSA',
    label: 'NSA',
    description: 'National Softball Association'
  },
  {
    value: 'PGF',
    label: 'PGF',
    description: 'Premier Girls Fastpitch - Major competitive travel fastpitch circuit'
  },
  {
    value: 'THE_ALLIANCE_FASTPITCH',
    label: 'The Alliance Fastpitch',
    description: 'National league and pathway system for youth fastpitch'
  },
  {
    value: 'PERFECT_GAME',
    label: 'Perfect Game Softball',
    description: 'Large event/showcase organization in youth softball'
  },
  {
    value: 'WBSC',
    label: 'WBSC',
    description: 'World Baseball Softball Confederation - International governing body'
  },
  {
    value: 'USFA',
    label: 'USFA',
    description: 'United States Fastpitch Association'
  },
  {
    value: 'AAG_FASTPITCH',
    label: 'AAG Fastpitch',
    description: 'A division of USSSA'
  },
  {
    value: 'PONY_FASTPITCH',
    label: 'PONY Fastpitch',
    description: 'PONY Baseball & Softball'
  },
  {
    value: 'OTHER',
    label: 'Other',
    description: 'Other sanctioning body'
  }
];

// Baseball Sanctioning Bodies
export const BASEBALL_SANCTIONING_BODIES: SanctioningBody[] = [
  {
    value: 'USA_BASEBALL',
    label: 'USA Baseball',
    description: 'National governing body for amateur baseball'
  },
  {
    value: 'USSSA',
    label: 'USSSA',
    description: 'United States Specialty Sports Association'
  },
  {
    value: 'PERFECT_GAME',
    label: 'Perfect Game',
    description: 'Major youth baseball organization'
  },
  {
    value: 'LITTLE_LEAGUE',
    label: 'Little League Baseball',
    description: 'Youth baseball and softball organization'
  },
  {
    value: 'PONY_BASEBALL',
    label: 'PONY Baseball',
    description: 'Protect Our Nation\'s Youth Baseball'
  },
  {
    value: 'BABE_RUTH',
    label: 'Babe Ruth League',
    description: 'Youth baseball organization'
  },
  {
    value: 'USABL',
    label: 'USABL',
    description: 'United States Amateur Baseball League'
  },
  {
    value: 'OTHER',
    label: 'Other',
    description: 'Other sanctioning body'
  }
];

// Basketball Sanctioning Bodies
export const BASKETBALL_SANCTIONING_BODIES: SanctioningBody[] = [
  {
    value: 'AAU',
    label: 'AAU',
    description: 'Amateur Athletic Union'
  },
  {
    value: 'USAB',
    label: 'USA Basketball',
    description: 'National governing body for basketball'
  },
  {
    value: 'YBOA',
    label: 'YBOA',
    description: 'Youth Basketball of America'
  },
  {
    value: 'USSSA',
    label: 'USSSA',
    description: 'United States Specialty Sports Association'
  },
  {
    value: 'NBA_YOUTH',
    label: 'Jr. NBA',
    description: 'NBA Youth Basketball'
  },
  {
    value: 'OTHER',
    label: 'Other',
    description: 'Other sanctioning body'
  }
];

// Soccer Sanctioning Bodies
export const SOCCER_SANCTIONING_BODIES: SanctioningBody[] = [
  {
    value: 'USYS',
    label: 'USYS',
    description: 'US Youth Soccer'
  },
  {
    value: 'USSF',
    label: 'US Soccer',
    description: 'United States Soccer Federation'
  },
  {
    value: 'AYSO',
    label: 'AYSO',
    description: 'American Youth Soccer Organization'
  },
  {
    value: 'US_CLUB_SOCCER',
    label: 'US Club Soccer',
    description: 'National youth soccer association'
  },
  {
    value: 'SAY',
    label: 'SAY Soccer',
    description: 'Soccer Association for Youth'
  },
  {
    value: 'USSSA',
    label: 'USSSA',
    description: 'United States Specialty Sports Association'
  },
  {
    value: 'OTHER',
    label: 'Other',
    description: 'Other sanctioning body'
  }
];

// Football Sanctioning Bodies
export const FOOTBALL_SANCTIONING_BODIES: SanctioningBody[] = [
  {
    value: 'USA_FOOTBALL',
    label: 'USA Football',
    description: 'National governing body for amateur football'
  },
  {
    value: 'AYF',
    label: 'AYF',
    description: 'American Youth Football'
  },
  {
    value: 'POP_WARNER',
    label: 'Pop Warner',
    description: 'Pop Warner Little Scholars'
  },
  {
    value: 'US_YOUTH_FOOTBALL',
    label: 'US Youth Football',
    description: 'National youth football organization'
  },
  {
    value: 'OTHER',
    label: 'Other',
    description: 'Other sanctioning body'
  }
];

// Volleyball Sanctioning Bodies
export const VOLLEYBALL_SANCTIONING_BODIES: SanctioningBody[] = [
  {
    value: 'USAV',
    label: 'USAV',
    description: 'USA Volleyball'
  },
  {
    value: 'AAU',
    label: 'AAU',
    description: 'Amateur Athletic Union'
  },
  {
    value: 'JVA',
    label: 'JVA',
    description: 'Junior Volleyball Association'
  },
  {
    value: 'USSSA',
    label: 'USSSA',
    description: 'United States Specialty Sports Association'
  },
  {
    value: 'OTHER',
    label: 'Other',
    description: 'Other sanctioning body'
  }
];

// Hockey Sanctioning Bodies
export const HOCKEY_SANCTIONING_BODIES: SanctioningBody[] = [
  {
    value: 'USA_HOCKEY',
    label: 'USA Hockey',
    description: 'National governing body for ice hockey'
  },
  {
    value: 'AAU',
    label: 'AAU',
    description: 'Amateur Athletic Union'
  },
  {
    value: 'USAH',
    label: 'USAH',
    description: 'USA Hockey'
  },
  {
    value: 'OTHER',
    label: 'Other',
    description: 'Other sanctioning body'
  }
];

// Lacrosse Sanctioning Bodies
export const LACROSSE_SANCTIONING_BODIES: SanctioningBody[] = [
  {
    value: 'US_LACROSSE',
    label: 'US Lacrosse',
    description: 'National governing body for lacrosse'
  },
  {
    value: 'USYLA',
    label: 'USYLA',
    description: 'US Youth Lacrosse Association'
  },
  {
    value: 'OTHER',
    label: 'Other',
    description: 'Other sanctioning body'
  }
];

// Get sanctioning bodies by sport
export function getSanctioningBodiesBySport(sport: string): SanctioningBody[] {
  switch (sport.toLowerCase()) {
    case 'softball':
      return SOFTBALL_SANCTIONING_BODIES;
    case 'baseball':
      return BASEBALL_SANCTIONING_BODIES;
    case 'basketball':
      return BASKETBALL_SANCTIONING_BODIES;
    case 'soccer':
      return SOCCER_SANCTIONING_BODIES;
    case 'football':
      return FOOTBALL_SANCTIONING_BODIES;
    case 'volleyball':
      return VOLLEYBALL_SANCTIONING_BODIES;
    case 'hockey':
      return HOCKEY_SANCTIONING_BODIES;
    case 'lacrosse':
      return LACROSSE_SANCTIONING_BODIES;
    default:
      return [
        {
          value: 'OTHER',
          label: 'Other',
          description: 'Other sanctioning body'
        }
      ];
  }
}
