
export interface ActivityLog {
  id: string;
  timestamp: number;
  prompt: string;
  response: string;
  score: number;
  feedback: string;
  category: 'parasocial' | 'learning' | 'collaborative' | 'shortcut' | 'lazy';
  isQuiz?: boolean;
}

export interface Outfit {
  id: string;
  name: string;
  price: number;
  type: 'hat' | 'glasses' | 'accessory';
}

export const AVAILABLE_OUTFITS: Outfit[] = [
  { id: 'sunglasses', name: 'Cool Shades', price: 5, type: 'glasses' },
  { id: 'partyhat', name: 'Party Hat', price: 10, type: 'hat' },
  { id: 'bowtie', name: 'Dapper Bowtie', price: 8, type: 'accessory' },
  { id: 'crown', name: 'Golden Crown', price: 25, type: 'hat' },
  { id: 'monocle', name: 'Sophisticated Monocle', price: 12, type: 'glasses' },
];

export interface UserStats {
  parasocialCount: number;
  learningCount: number;
  collaborativeCount: number;
  quizCount: number;
}

export interface AppState {
  health: number;
  coins: number;
  ownedOutfits: string[];
  activeOutfitId: string | null;
  history: ActivityLog[];
  stats: UserStats;
}

export interface AnalysisResult {
  score: number;
  feedback: string;
  category: ActivityLog['category'];
  isQuiz: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  bronze: number;
  silver: number;
  gold: number;
  currentValue: number;
}
