import { GamePhase, GameState, Player, RoomSettings, GameMode, ChatMessage } from '../types';
import { DEFAULT_SETTINGS, WORD_LIST_NL, ANIMAL_AVATARS } from '../constants';

// Helper to generate random ID
export const generateId = () => Math.random().toString(36).substr(2, 9);
export const generateRoomCode = () => Math.random().toString(36).substr(2, 6).toUpperCase();

// Mock "Backend" Logic stored in a closure-like structure if we were using a real server.
// Since we are client-side React, we will put most logic in the Context/Reducer in App.tsx
// This file provides utility functions.

export const getRandomWords = (count: number): string[] => {
  const shuffled = [...WORD_LIST_NL].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

export const createPlayer = (name: string, avatar: string, isHost: boolean): Player => ({
  id: generateId(),
  name: name || `Speler ${Math.floor(Math.random() * 100)}`,
  avatar,
  isHost,
  score: 0,
  isDrawing: false,
  hasGuessed: false,
});

export const createInitialState = (): GameState => ({
  phase: GamePhase.LOGIN,
  roomCode: '',
  players: [],
  currentRound: 1,
  totalRounds: DEFAULT_SETTINGS.rounds,
  currentDrawerId: null,
  wordToGuess: null,
  wordOptions: [],
  wordLength: 0,
  timeLeft: 0,
  messages: [],
  settings: { ...DEFAULT_SETTINGS },
  winnerId: null,
});
