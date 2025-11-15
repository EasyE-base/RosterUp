// Team Classification System for Competitive Balance

export type TeamClassification = 'A' | 'B' | 'C' | 'REC' | 'ALL_STARS';

export interface ClassificationLevel {
  value: TeamClassification;
  label: string;
  shortLabel: string;
  description: string;
  competitiveLevel: number; // 1-5, with 5 being highest
  color: string; // For UI badges
}

export const CLASSIFICATION_LEVELS: ClassificationLevel[] = [
  {
    value: 'A',
    label: 'A Division (Elite)',
    shortLabel: 'A',
    description: 'Top competitive level - Premier teams with high tournament performance',
    competitiveLevel: 5,
    color: 'red',
  },
  {
    value: 'B',
    label: 'B Division (Competitive)',
    shortLabel: 'B',
    description: 'Mid-level competitive teams with moderate tournament schedules',
    competitiveLevel: 4,
    color: 'blue',
  },
  {
    value: 'C',
    label: 'C Division (Developmental)',
    shortLabel: 'C',
    description: 'Developmental teams building skills and experience',
    competitiveLevel: 3,
    color: 'green',
  },
  {
    value: 'REC',
    label: 'Recreational',
    shortLabel: 'Rec',
    description: 'Recreational teams focused on fun and skill development',
    competitiveLevel: 2,
    color: 'yellow',
  },
  {
    value: 'ALL_STARS',
    label: 'All-Stars',
    shortLabel: 'AS',
    description: 'All-star teams selected from recreational leagues',
    competitiveLevel: 3,
    color: 'purple',
  },
];

// Tournament classification acceptance options
export type TournamentClassificationAcceptance =
  | 'A_ONLY'
  | 'A_B'
  | 'B_ONLY'
  | 'B_C'
  | 'C_ONLY'
  | 'REC_ONLY'
  | 'OPEN'
  | 'CUSTOM';

export interface TournamentClassificationOption {
  value: TournamentClassificationAcceptance;
  label: string;
  description: string;
  acceptedLevels: TeamClassification[];
}

export const TOURNAMENT_CLASSIFICATION_OPTIONS: TournamentClassificationOption[] = [
  {
    value: 'A_ONLY',
    label: 'A Division Only',
    description: 'Elite competition - A teams only',
    acceptedLevels: ['A'],
  },
  {
    value: 'A_B',
    label: 'A/B Divisions',
    description: 'High competitive - A and B teams',
    acceptedLevels: ['A', 'B'],
  },
  {
    value: 'B_ONLY',
    label: 'B Division Only',
    description: 'Mid-level competition - B teams only',
    acceptedLevels: ['B'],
  },
  {
    value: 'B_C',
    label: 'B/C Divisions',
    description: 'Developmental competition - B and C teams',
    acceptedLevels: ['B', 'C'],
  },
  {
    value: 'C_ONLY',
    label: 'C Division Only',
    description: 'Developmental - C teams only',
    acceptedLevels: ['C'],
  },
  {
    value: 'REC_ONLY',
    label: 'Recreational Only',
    description: 'Recreational teams and All-Stars',
    acceptedLevels: ['REC', 'ALL_STARS'],
  },
  {
    value: 'OPEN',
    label: 'Open (All Levels)',
    description: 'All classification levels welcome',
    acceptedLevels: ['A', 'B', 'C', 'REC', 'ALL_STARS'],
  },
  {
    value: 'CUSTOM',
    label: 'Custom Selection',
    description: 'Choose specific classifications to accept',
    acceptedLevels: [], // Will be customized
  },
];

// Eligibility Criteria for Classification
export interface ClassificationCriteria {
  // Prior season classification
  priorSeasonClassification?: TeamClassification;

  // Tournament participation metrics
  tournamentMetrics: {
    totalTournaments: number;
    averageDistanceMiles?: number;
    nationalTournaments?: number;
  };

  // Performance metrics
  performanceMetrics: {
    winLossRecord: {
      wins: number;
      losses: number;
      ties?: number;
    };
    averageRunDifferential?: number;
    championshipFinishes?: number;
    topThreeFinishes?: number;
  };

  // Team composition
  rosterMetrics: {
    coreReturners: number; // Number of returning players from prior season
    totalRosterSize: number;
    pitcherCount?: number;
    positionPlayerDepth?: number;
  };

  // Age-specific considerations
  ageGroup?: string;

  // Notes for review
  notes?: string;
}

// Re-classification request
export interface ReClassificationRequest {
  teamId: string;
  currentClassification: TeamClassification;
  requestedClassification: TeamClassification;
  reason: string;
  supportingData: Partial<ClassificationCriteria>;
  submittedDate: string;
  reviewedDate?: string;
  status: 'pending' | 'approved' | 'denied';
  reviewerNotes?: string;
}

// Age-specific rule exceptions
export interface ClassificationRuleException {
  ageGroup: string;
  classification: TeamClassification;
  exceptionDescription: string;
  modifiedCriteria?: string[];
}

export const CLASSIFICATION_RULE_EXCEPTIONS: ClassificationRuleException[] = [
  {
    ageGroup: '10U',
    classification: 'C',
    exceptionDescription: 'Developmental focus - Relaxed tournament count and performance requirements',
    modifiedCriteria: [
      'Minimum 5 tournaments (instead of 8)',
      'No run differential tracking',
      'Focus on skill development over wins',
    ],
  },
  {
    ageGroup: '8U',
    classification: 'C',
    exceptionDescription: 'Introductory level - No performance metrics required',
    modifiedCriteria: [
      'No tournament count minimum',
      'No win-loss record requirement',
      'Automatic C classification for development',
    ],
  },
];

// Helper functions
export function getClassificationLevel(classification: TeamClassification): ClassificationLevel | undefined {
  return CLASSIFICATION_LEVELS.find(level => level.value === classification);
}

export function getTournamentClassificationOption(
  acceptance: TournamentClassificationAcceptance
): TournamentClassificationOption | undefined {
  return TOURNAMENT_CLASSIFICATION_OPTIONS.find(option => option.value === acceptance);
}

export function canTeamEnterTournament(
  teamClassification: TeamClassification,
  tournamentAcceptance: TournamentClassificationAcceptance,
  customAcceptedLevels?: TeamClassification[]
): boolean {
  if (tournamentAcceptance === 'CUSTOM' && customAcceptedLevels) {
    return customAcceptedLevels.includes(teamClassification);
  }

  const option = getTournamentClassificationOption(tournamentAcceptance);
  return option ? option.acceptedLevels.includes(teamClassification) : false;
}

export function calculateSuggestedClassification(
  criteria: ClassificationCriteria
): TeamClassification {
  let score = 0;

  // Tournament metrics (0-30 points)
  const tournamentCount = criteria.tournamentMetrics.totalTournaments;
  if (tournamentCount >= 15) score += 30;
  else if (tournamentCount >= 10) score += 20;
  else if (tournamentCount >= 6) score += 10;

  if (criteria.tournamentMetrics.nationalTournaments && criteria.tournamentMetrics.nationalTournaments > 0) {
    score += 10;
  }

  // Performance metrics (0-40 points)
  const { wins, losses } = criteria.performanceMetrics.winLossRecord;
  const winPercentage = wins / (wins + losses);

  if (winPercentage >= 0.7) score += 30;
  else if (winPercentage >= 0.6) score += 20;
  else if (winPercentage >= 0.5) score += 10;

  if (criteria.performanceMetrics.championshipFinishes && criteria.performanceMetrics.championshipFinishes >= 2) {
    score += 10;
  } else if (criteria.performanceMetrics.topThreeFinishes && criteria.performanceMetrics.topThreeFinishes >= 3) {
    score += 5;
  }

  // Roster metrics (0-30 points)
  const returnerPercentage = criteria.rosterMetrics.coreReturners / criteria.rosterMetrics.totalRosterSize;
  if (returnerPercentage >= 0.75) score += 15;
  else if (returnerPercentage >= 0.6) score += 10;
  else if (returnerPercentage >= 0.5) score += 5;

  if (criteria.rosterMetrics.pitcherCount && criteria.rosterMetrics.pitcherCount >= 4) {
    score += 15;
  } else if (criteria.rosterMetrics.pitcherCount && criteria.rosterMetrics.pitcherCount >= 3) {
    score += 10;
  } else if (criteria.rosterMetrics.pitcherCount && criteria.rosterMetrics.pitcherCount >= 2) {
    score += 5;
  }

  // Classify based on score
  if (score >= 70) return 'A';
  if (score >= 50) return 'B';
  return 'C';
}

export function getAgeGroupRuleExceptions(ageGroup: string): ClassificationRuleException[] {
  return CLASSIFICATION_RULE_EXCEPTIONS.filter(exception => exception.ageGroup === ageGroup);
}
