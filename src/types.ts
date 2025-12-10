

export enum BoardStyle {
  CEBRASPE = "Cebraspe",
  FGV = "FGV",
  INEP = "INEP",
  FUVEST = "FUVEST/USP",
}

export interface GeneratedQuestion {
  question_text: string;
  options?: { [key: string]: string };
  correct_answer: string;
  justification_anchor: string;
  userAnswer?: string;
  flashcard?: {
    front: string;
    back: string;
  };
  isGeneratingFlashcard?: boolean;
}

// --- GAMIFICATION TYPES ---

export interface Level {
    name: string;
    minXp: number;
    icon: string; // Emoji
}

export enum BadgeRarity {
    Common = "Comum",
    Rare = "Raro",
    Epic = "Épico",
    Legendary = "Lendário" // For non-implementable ones
}

export interface Badge {
    id: string;
    name: string;
    description: string;
    icon: string; // Emoji
    rarity: BadgeRarity;
}

export interface GamificationState {
    levelIndex: number;
    xp: number;
    tokens: number;
    activeTheme: string;
    unlockedThemes: string[];
    lastSessionDate: string | null;
    studyStreak: number;
    unlockedBadges: string[];
    pagesReadPerPdf: Record<string, { readPages: number[], totalPages: number }>;
    completedPagesPerPdf: Record<string, number[]>;
    totalCorrectAnswers: number;
    totalQuestionsAnswered: number;
    
    // New fields for expanded gamification
    correctStreak: number;
    incorrectStreak: number;
    badgesUnlockedThisSession: { id: string; timestamp: number }[];
    sessionStartTimestamp: number;
    maxCorrectAnswersInADay: number;
    pdfsWithQuestionsGenerated: string[];
    nightOwlStreak: number;
    earlyBirdStreak: number;
    lastStreakBrokenDate: string | null;
    correctAnswersToday: number;
    questionsAnsweredThisSession: number;
    sessionDurationToday: number; // in seconds
}


export interface Toast {
    id: number;
    message: string;
    icon?: string;
}

// New types for the shop
export interface ShopItem {
  id: string; // e.g. "theme-steampunk"
  name: string;
  description: string;
  cost: number;
  icon: string; // Emoji
  requiredLevel: number;
}

export interface ProgressData {
    fileName: string;
    totalPages: number;
    currentPage: number;
    scale: number;
    questionsByPage: Record<string, GeneratedQuestion[]>;
    sessionErrors: GeneratedQuestion[];
    sessionDate: string;
    studyTimeInSeconds: number;
    questionsAnswered: number;
    flashcardsCreated: number;
    pagesCompleted: number;
}

export interface StudyGoal {
  type: 'pages' | 'questions' | 'time';
  target: number;
  initialValue: number; // e.g., currentPage at the time of setting, or questionsAnsweredThisSession
  isActive: boolean;
}

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  thumbnailLink?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: {
      name: string;
      email: string;
      photoUrl?: string;
  } | null;
}

export interface Folder {
    id: string;
    name: string;
    files: string[]; // List of PDF identifiers
}