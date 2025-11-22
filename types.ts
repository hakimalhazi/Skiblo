export enum GamePhase {
  LOGIN = 'LOGIN',
  LOBBY = 'LOBBY',
  WORD_SELECTION = 'WORD_SELECTION',
  DRAWING = 'DRAWING',
  ROUND_END = 'ROUND_END',
  GAME_END = 'GAME_END'
}

export enum GameMode {
  CLASSIC = 'Classic Mode',
  SPEED = 'Speed Mode',
  CHAOS = 'Chaos Mode',
  TEAM = 'Team Mode',
  ZEN = 'Zen Mode'
}

export enum ToolType {
  BRUSH = 'BRUSH',
  ERASER = 'ERASER',
  LINE = 'LINE',
  ARROW = 'ARROW',
  RECTANGLE = 'RECTANGLE',
  CIRCLE = 'CIRCLE',
  TRIANGLE = 'TRIANGLE',
  FILL = 'FILL'
}

export interface Player {
  id: string;
  name: string;
  avatar: string; // Emoji or URL
  isHost: boolean;
  score: number;
  isDrawing: boolean;
  hasGuessed: boolean;
  team?: 'red' | 'blue';
}

export interface ChatMessage {
  id: string;
  playerId: string;
  playerName: string;
  text: string;
  isSystem: boolean;
  isCorrectGuess?: boolean;
  timestamp: number;
}

export interface RoomSettings {
  timePerRound: number;
  rounds: number;
  wordCount: number; // Options to choose from
  difficulty: 'easy' | 'medium' | 'hard';
  gameMode: GameMode;
  animationsEnabled: boolean;
  customWords: boolean;
  hintRevealTime: number; // 0 for off
  isPublic: boolean;
  allowJoinViaLink: boolean;
}

export interface GameState {
  phase: GamePhase;
  roomCode: string;
  players: Player[];
  currentRound: number;
  totalRounds: number;
  currentDrawerId: string | null;
  wordToGuess: string | null; // Null for guessers, set for drawer
  wordOptions: string[];
  wordLength: number;
  timeLeft: number;
  messages: ChatMessage[];
  settings: RoomSettings;
  winnerId: string | null;
}
