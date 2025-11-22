import React, { useState, useEffect, useCallback } from 'react';
import { 
  GameState, GamePhase, Player, RoomSettings, ChatMessage, GameMode 
} from './types';
import { 
  createInitialState, createPlayer, generateRoomCode, generateId, getRandomWords 
} from './services/gameService';
import { ANIMAL_AVATARS, DEFAULT_SETTINGS } from './constants';
import { Lobby } from './components/Lobby';
import { GameInterface } from './components/GameInterface';
import { Button } from './components/Button';

// --- Helpers ---
// Simple hook for interval
function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = React.useRef(callback);
  useEffect(() => { savedCallback.current = callback; }, [callback]);
  useEffect(() => {
    if (delay !== null) {
      const id = setInterval(() => savedCallback.current(), delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

const App: React.FC = () => {
  // --- State ---
  const [gameState, setGameState] = useState<GameState>(createInitialState());
  const [myPlayerId, setMyPlayerId] = useState<string | null>(null);
  
  // Login State
  const [inputName, setInputName] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(ANIMAL_AVATARS[0]);
  const [joinMode, setJoinMode] = useState<'create' | 'join'>('create');
  const [uploadedAvatar, setUploadedAvatar] = useState<string | null>(null);

  // --- Game Logic Simulation ---

  const currentPlayer = gameState.players.find(p => p.id === myPlayerId);
  const isHost = currentPlayer?.isHost ?? false;

  // Timer Tick
  useInterval(() => {
    if (gameState.timeLeft > 0 && (gameState.phase === GamePhase.DRAWING || gameState.phase === GamePhase.WORD_SELECTION)) {
      setGameState(prev => {
        const newTime = prev.timeLeft - 1;
        
        // Time ran out handling
        if (newTime === 0) {
          if (prev.phase === GamePhase.WORD_SELECTION) {
             // Auto select random word if time out
             const randomWord = prev.wordOptions[0];
             return startDrawingPhase(prev, randomWord);
          } else if (prev.phase === GamePhase.DRAWING) {
             // Round over
             return endRound(prev);
          }
        }
        return { ...prev, timeLeft: newTime };
      });
    } else if (gameState.phase === GamePhase.ROUND_END) {
      // Auto proceed after delay? Handled manually for now or via separate timer
      // For simplicity, let's use timeLeft for post-round delay too (e.g. 5s)
       setGameState(prev => {
          if (prev.timeLeft > 0) return { ...prev, timeLeft: prev.timeLeft - 1 };
          if (prev.timeLeft === 0) {
             // Next round
             return nextTurn(prev);
          }
          return prev;
       });
    }
  }, 1000);

  const nextTurn = (state: GameState): GameState => {
    // Find next drawer
    const currentDrawerIndex = state.players.findIndex(p => p.id === state.currentDrawerId);
    let nextDrawerIndex = (currentDrawerIndex + 1) % state.players.length;
    let nextRound = state.currentRound;

    // If looped back to start, increment round
    if (nextDrawerIndex === 0) {
      nextRound++;
    }

    if (nextRound > state.totalRounds) {
       return { ...state, phase: GamePhase.GAME_END };
    }

    const nextDrawer = state.players[nextDrawerIndex];
    const words = getRandomWords(state.settings.wordCount);

    return {
      ...state,
      phase: GamePhase.WORD_SELECTION,
      currentRound: nextRound,
      currentDrawerId: nextDrawer.id,
      wordOptions: words,
      wordToGuess: null,
      timeLeft: 15, // 15s to choose
      players: state.players.map(p => ({ ...p, isDrawing: p.id === nextDrawer.id, hasGuessed: false })),
      messages: [...state.messages, {
        id: generateId(),
        playerId: 'system',
        playerName: 'System',
        text: `Ronde ${nextRound}! ${nextDrawer.name} is aan de beurt om te tekenen.`,
        isSystem: true,
        timestamp: Date.now()
      }]
    };
  };

  const startDrawingPhase = (state: GameState, word: string): GameState => {
    return {
      ...state,
      phase: GamePhase.DRAWING,
      wordToGuess: word,
      wordLength: word.length,
      timeLeft: state.settings.timePerRound,
      messages: [...state.messages, {
        id: generateId(),
        playerId: 'system',
        playerName: 'System',
        text: `Het woord is gekozen! Het heeft ${word.length} letters.`,
        isSystem: true,
        timestamp: Date.now()
      }]
    };
  };

  const endRound = (state: GameState): GameState => {
     return {
       ...state,
       phase: GamePhase.ROUND_END,
       timeLeft: 5, // 5 seconds cooling time
       messages: [...state.messages, {
         id: generateId(),
         playerId: 'system',
         playerName: 'System',
         text: `Tijd is om! Het woord was: ${state.wordToGuess}`,
         isSystem: true,
         timestamp: Date.now()
       }]
     };
  };

  // --- Actions ---

  const handleJoin = () => {
    if (!inputName) return alert("Vul een naam in!");
    
    const newPlayer = createPlayer(
      inputName, 
      uploadedAvatar || selectedAvatar, 
      joinMode === 'create'
    );
    
    setMyPlayerId(newPlayer.id);
    
    const code = joinMode === 'create' ? generateRoomCode() : inputCode.toUpperCase();

    // Initialize State for Lobby
    setGameState(prev => ({
      ...prev,
      roomCode: code,
      players: [newPlayer],
      phase: GamePhase.LOBBY,
      messages: [],
      settings: DEFAULT_SETTINGS
    }));
  };

  const handleStartGame = () => {
     if (gameState.players.length < 2) return;
     setGameState(prev => nextTurn(prev)); // Start first turn
  };

  const handleWordSelect = (word: string) => {
     setGameState(prev => startDrawingPhase(prev, word));
  };

  const handleSendMessage = (text: string) => {
    if (!myPlayerId) return;
    
    setGameState(prev => {
      const isCorrect = prev.phase === GamePhase.DRAWING && 
                        prev.wordToGuess && 
                        text.toLowerCase().trim() === prev.wordToGuess.toLowerCase();
      
      let updatedPlayers = [...prev.players];
      let updatedMessages = [...prev.messages];
      let nextPhase = prev.phase;
      let newTime = prev.timeLeft;

      if (isCorrect && !currentPlayer?.hasGuessed && !currentPlayer?.isDrawing) {
         // Calculate Score
         const score = Math.ceil((prev.timeLeft / prev.settings.timePerRound) * 100) + 50;
         
         updatedPlayers = updatedPlayers.map(p => {
           if (p.id === myPlayerId) return { ...p, score: p.score + score, hasGuessed: true };
           // Drawer gets points too
           if (p.id === prev.currentDrawerId) return { ...p, score: p.score + 20 }; // Flat bonus for now
           return p;
         });

         updatedMessages.push({
           id: generateId(),
           playerId: myPlayerId,
           playerName: currentPlayer!.name,
           text: `${currentPlayer!.name} heeft het woord geraden!`,
           isSystem: false,
           isCorrectGuess: true,
           timestamp: Date.now()
         });

         // Check if everyone guessed
         const guessers = updatedPlayers.filter(p => !p.isDrawing);
         if (guessers.every(p => p.hasGuessed)) {
            // Everyone guessed, end round immediately
            setTimeout(() => {
              setGameState(current => endRound(current));
            }, 1000); 
            // Note: We can't return the endRound state immediately because of render cycle, but for simulation:
            // We actually will just let the message show and next tick or effect will catch it? 
            // Better: Just trigger endRound logic immediately but preserve the message.
            return endRound({ ...prev, players: updatedPlayers, messages: updatedMessages });
         }

      } else {
        updatedMessages.push({
          id: generateId(),
          playerId: myPlayerId,
          playerName: currentPlayer!.name,
          text: text,
          isSystem: false,
          timestamp: Date.now()
        });
      }

      return {
        ...prev,
        players: updatedPlayers,
        messages: updatedMessages
      };
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setUploadedAvatar(ev.target?.result as string);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  // --- Debug / Bot Simulation ---
  const addBot = () => {
    const botNames = ["Klaas", "Sophie", "Daan", "Emma", "Tim"];
    const botName = botNames[Math.floor(Math.random() * botNames.length)] + " (Bot)";
    const bot = createPlayer(botName, ANIMAL_AVATARS[Math.floor(Math.random() * ANIMAL_AVATARS.length)], false);
    setGameState(prev => ({
      ...prev,
      players: [...prev.players, bot]
    }));
  };

  // --- Render ---

  if (gameState.phase === GamePhase.LOGIN) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="bg-primary p-8 text-center">
            <h1 className="text-4xl font-black text-white tracking-wider mb-2">SKIBLO</h1>
            <p className="text-indigo-100">Teken, raad en win!</p>
          </div>
          
          <div className="p-8 space-y-6">
            {/* Avatar Selector */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700">Kies je look</label>
              <div className="flex justify-center mb-4">
                <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center text-5xl overflow-hidden shadow-inner border-4 border-white">
                  {uploadedAvatar ? <img src={uploadedAvatar} className="w-full h-full object-cover" /> : selectedAvatar}
                </div>
              </div>
              
              <div className="grid grid-cols-6 gap-2">
                {ANIMAL_AVATARS.map(a => (
                  <button 
                    key={a} 
                    onClick={() => { setSelectedAvatar(a); setUploadedAvatar(null); }}
                    className={`text-2xl p-2 rounded-xl hover:bg-slate-100 transition ${selectedAvatar === a && !uploadedAvatar ? 'bg-indigo-100 ring-2 ring-primary' : ''}`}
                  >
                    {a}
                  </button>
                ))}
                <label className="cursor-pointer flex items-center justify-center text-xl p-2 rounded-xl hover:bg-slate-100 border border-dashed border-slate-300 text-slate-400">
                   +
                   <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                </label>
              </div>
            </div>

            {/* Name Input */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Je Naam</label>
              <input 
                type="text" 
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-primary focus:ring-2 focus:ring-indigo-100 outline-none font-bold text-slate-700"
                placeholder="Bijv. TekenKoning"
              />
            </div>

            {/* Toggle Create/Join */}
            <div className="flex p-1 bg-slate-100 rounded-xl">
              <button 
                onClick={() => setJoinMode('create')}
                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${joinMode === 'create' ? 'bg-white shadow-sm text-primary' : 'text-slate-500'}`}
              >
                Nieuwe Lobby
              </button>
              <button 
                onClick={() => setJoinMode('join')}
                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${joinMode === 'join' ? 'bg-white shadow-sm text-primary' : 'text-slate-500'}`}
              >
                Via Code
              </button>
            </div>

            {joinMode === 'join' && (
              <div className="animate-in slide-in-from-top-2 duration-200">
                <label className="block text-sm font-bold text-slate-700 mb-1">Lobby Code</label>
                <input 
                  type="text" 
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-secondary focus:ring-2 focus:ring-pink-100 outline-none font-mono text-center text-lg uppercase"
                  placeholder="CODE"
                  maxLength={6}
                />
              </div>
            )}

            <Button onClick={handleJoin} className="w-full py-4 text-lg shadow-xl shadow-indigo-200">
              {joinMode === 'create' ? 'LOBBY MAKEN' : 'DEELNEMEN'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (gameState.phase === GamePhase.LOBBY) {
    return (
      <div className="min-h-screen bg-slate-50 p-4">
        <Lobby 
          roomCode={gameState.roomCode}
          players={gameState.players}
          currentPlayerId={myPlayerId!}
          settings={gameState.settings}
          onUpdateSettings={(newSettings) => setGameState(prev => ({ ...prev, settings: newSettings }))}
          onStartGame={handleStartGame}
          onLeave={() => window.location.reload()}
          onKick={(id) => setGameState(prev => ({ ...prev, players: prev.players.filter(p => p.id !== id)}))}
          onAddBot={addBot}
        />
      </div>
    );
  }

  if (gameState.phase === GamePhase.GAME_END) {
     // Simple Game Over Screen
     const winner = gameState.players.sort((a, b) => b.score - a.score)[0];
     return (
       <div className="min-h-screen bg-indigo-900 flex items-center justify-center p-4 text-white text-center">
          <div className="max-w-lg w-full animate-in zoom-in duration-500">
             <h1 className="text-6xl mb-8">🏆</h1>
             <h2 className="text-4xl font-black mb-4">WINNAAR!</h2>
             <div className="bg-white/10 rounded-3xl p-8 backdrop-blur-lg mb-8">
                <div className="text-6xl mb-4">{winner.avatar}</div>
                <div className="text-3xl font-bold mb-2">{winner.name}</div>
                <div className="text-xl font-mono opacity-75">{winner.score} punten</div>
             </div>
             <Button onClick={() => window.location.reload()} variant="secondary">Terug naar Home</Button>
          </div>
       </div>
     );
  }

  // Main Game Phases
  return (
    <GameInterface 
      gameState={gameState}
      currentPlayerId={myPlayerId!}
      onSendMessage={handleSendMessage}
      onWordSelect={handleWordSelect}
      onLeave={() => window.location.reload()}
    />
  );
};

export default App;