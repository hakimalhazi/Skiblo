import { GameMode, ToolType } from './types';

export const ANIMAL_AVATARS = [
  '🐱', '🐶', '🦊', '🐼', '🐸', '🦁', '🐦', '🐲', '🦉', '🐹', '🐯'
];

export const DEFAULT_SETTINGS = {
  timePerRound: 60,
  rounds: 3,
  wordCount: 3,
  difficulty: 'medium' as const,
  gameMode: GameMode.CLASSIC,
  animationsEnabled: true,
  customWords: false,
  hintRevealTime: 30,
  isPublic: false,
  allowJoinViaLink: true,
};

export const WORD_LIST_NL = [
  "Fiets", "Kaas", "Molen", "Tulpen", "Klomp", "Hond", "Kat", "Huis", "Boom", "Zon",
  "Strand", "Bal", "Computer", "Telefoon", "Auto", "Vliegtuig", "Boot", "Vis",
  "Appel", "Banaan", "Olifant", "Giraffe", "Kasteel", "Ridder", "Prinses",
  "Draak", "Tovenaar", "Spook", "Pompoen", "Sneeuwpop", "Kerstman", "Cadeau",
  "Taart", "IJsje", "Pizza", "Hamburger", "Patat", "Pannenkoek", "Wafel",
  "Koffie", "Thee", "Melk", "Water", "Vuur", "Aarde", "Lucht", "Regen",
  "Sneeuw", "Wind", "Storm", "Bliksem", "Regenboog", "Ster", "Maan"
];

export const COLORS = [
  '#000000', '#FFFFFF', '#94a3b8', // Black, White, Slate
  '#ef4444', '#f97316', '#f59e0b', // Red, Orange, Amber
  '#eab308', '#84cc16', '#22c55e', // Yellow, Lime, Green
  '#10b981', '#14b8a6', '#06b6d4', // Emerald, Teal, Cyan
  '#0ea5e9', '#3b82f6', '#6366f1', // Sky, Blue, Indigo
  '#8b5cf6', '#a855f7', '#d946ef', // Violet, Purple, Fuchsia
  '#ec4899', '#f43f5e', '#78350f'  // Pink, Rose, Brown
];
