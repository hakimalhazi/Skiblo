import React, { useEffect, useState, useRef } from 'react';
import { GameState, Player, ChatMessage, ToolType, GamePhase } from '../types';
import { GameCanvas } from './GameCanvas';
import { Button } from './Button';

interface GameInterfaceProps {
  gameState: GameState;
  currentPlayerId: string;
  onSendMessage: (text: string) => void;
  onWordSelect: (word: string) => void;
  onLeave: () => void;
}

export const GameInterface: React.FC<GameInterfaceProps> = ({
  gameState,
  currentPlayerId,
  onSendMessage,
  onWordSelect,
  onLeave
}) => {
  const [currentTool, setCurrentTool] = useState<ToolType>(ToolType.BRUSH);
  const [currentColor, setCurrentColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(5);
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const me = gameState.players.find(p => p.id === currentPlayerId);
  const isDrawer = gameState.currentDrawerId === currentPlayerId;
  const currentDrawer = gameState.players.find(p => p.id === gameState.currentDrawerId);

  // Scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [gameState.messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (chatInput.trim()) {
      onSendMessage(chatInput.trim());
      setChatInput('');
    }
  };

  // Calculate display word (hidden or reveal)
  const getDisplayWord = () => {
    if (isDrawer || gameState.phase === GamePhase.ROUND_END) {
      return gameState.wordToGuess || "???";
    }
    // Show underscores
    if (!gameState.wordLength) return "Wachten...";
    return Array(gameState.wordLength).fill('_').join(' ');
  };

  return (
    <div className="h-screen flex flex-col bg-slate-50 p-2 md:p-4 gap-4">
      {/* Top Bar */}
      <div className="flex justify-between items-center bg-white p-3 md:p-4 rounded-2xl shadow-sm">
        <div className="flex items-center gap-4">
          <div className="bg-indigo-100 text-primary font-bold px-4 py-2 rounded-xl flex flex-col items-center min-w-[80px]">
             <span className="text-xs uppercase tracking-wider text-indigo-400">Tijd</span>
             <span className="text-2xl">{gameState.timeLeft}</span>
          </div>
          <div className="hidden md:block">
             <div className="text-xs text-slate-400 uppercase">Ronde</div>
             <div className="font-bold text-slate-700">{gameState.currentRound} / {gameState.totalRounds}</div>
          </div>
        </div>

        {/* Word Display */}
        <div className="flex-1 text-center px-4">
          {gameState.phase === GamePhase.WORD_SELECTION ? (
             <div className="text-slate-500 animate-pulse">
               {isDrawer ? "Kies een woord..." : `${currentDrawer?.name} kiest een woord...`}
             </div>
          ) : (
             <div className="flex flex-col items-center">
               <div className="text-2xl md:text-4xl font-black tracking-[0.2em] text-slate-800 font-mono">
                 {getDisplayWord()}
               </div>
               {!isDrawer && gameState.phase === GamePhase.DRAWING && (
                 <div className="text-xs text-slate-400 mt-1">{gameState.wordLength} letters</div>
               )}
             </div>
          )}
        </div>

        <Button variant="ghost" size="sm" onClick={onLeave} className="text-red-400 hover:text-red-500">
          ❌
        </Button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4 overflow-hidden relative">
        
        {/* Left: Player List (Hidden on mobile, mostly) */}
        <div className="hidden lg:flex flex-col w-48 bg-white rounded-2xl shadow-sm p-3 gap-2 overflow-y-auto">
           {gameState.players.sort((a,b) => b.score - a.score).map(p => (
             <div key={p.id} className={`flex items-center p-2 rounded-xl border-2 transition-all ${p.hasGuessed ? 'bg-green-50 border-green-200' : p.isDrawing ? 'bg-indigo-50 border-indigo-100' : 'bg-white border-transparent'}`}>
                <div className="text-2xl mr-2 relative">
                  {p.avatar}
                  {p.isDrawing && <span className="absolute -top-1 -right-1 text-xs">✏️</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm truncate text-slate-700">{p.name}</div>
                  <div className="text-xs text-slate-400 font-mono">{p.score} pts</div>
                </div>
             </div>
           ))}
        </div>

        {/* Center: Canvas or Overlay */}
        <div className="flex-1 relative bg-white rounded-3xl shadow-md overflow-hidden flex flex-col">
           
           {/* Word Selection Overlay */}
           {gameState.phase === GamePhase.WORD_SELECTION && isDrawer && (
             <div className="absolute inset-0 z-50 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in duration-300">
                <h2 className="text-3xl font-bold text-slate-800 mb-8">Kies een woord!</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                   {gameState.wordOptions.map(word => (
                     <button
                       key={word}
                       onClick={() => onWordSelect(word)}
                       className="px-8 py-6 bg-white border-2 border-indigo-100 hover:border-primary hover:bg-indigo-50 rounded-2xl text-xl font-bold text-slate-700 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
                     >
                       {word}
                     </button>
                   ))}
                </div>
             </div>
           )}

            {/* Round End Overlay */}
            {gameState.phase === GamePhase.ROUND_END && (
             <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-white animate-in zoom-in duration-300">
                <div className="text-2xl opacity-80 mb-2">Het woord was:</div>
                <div className="text-5xl font-black text-green-400 mb-8">{gameState.wordToGuess}</div>
                <div className="bg-white/10 p-6 rounded-2xl backdrop-blur-md">
                  <h3 className="font-bold text-xl mb-4 text-center">Scorebord</h3>
                  {gameState.players.sort((a,b) => b.score - a.score).slice(0, 3).map((p, i) => (
                    <div key={p.id} className="flex justify-between gap-8 py-2 border-b border-white/10 last:border-0">
                      <span>#{i+1} {p.name}</span>
                      <span className="font-mono font-bold text-yellow-300">{p.score}</span>
                    </div>
                  ))}
                </div>
             </div>
           )}

           <GameCanvas 
              isDrawing={isDrawer && gameState.phase === GamePhase.DRAWING}
              currentTool={currentTool}
              currentColor={currentColor}
              brushSize={brushSize}
              onChangeTool={setCurrentTool}
              onChangeColor={setCurrentColor}
              onChangeSize={setBrushSize}
              onClear={() => {}} // Pass real clear handler if needed to clear history
              onUndo={() => {}}
           />
        </div>

        {/* Right: Chat (and Players on Mobile) */}
        <div className="w-full lg:w-80 flex flex-col gap-2 h-[30vh] lg:h-auto">
           <div className="flex-1 bg-white rounded-2xl shadow-sm p-4 flex flex-col overflow-hidden border border-slate-100">
              <div className="flex-1 overflow-y-auto space-y-2 pr-2 scrollbar-hide">
                 {gameState.messages.map(msg => (
                   <div key={msg.id} className={`text-sm rounded-lg p-2 ${
                     msg.isCorrectGuess ? 'bg-green-100 text-green-800 font-bold text-center' :
                     msg.isSystem ? 'bg-slate-100 text-slate-500 text-center italic text-xs' :
                     'bg-white'
                   }`}>
                      {!msg.isSystem && !msg.isCorrectGuess && (
                        <span className="font-bold mr-1" style={{color: gameState.players.find(p => p.id === msg.playerId)?.id === currentPlayerId ? '#6366f1' : '#475569'}}>
                          {msg.playerName}:
                        </span>
                      )}
                      {msg.text}
                   </div>
                 ))}
                 <div ref={chatEndRef} />
              </div>
              
              <form onSubmit={handleSendMessage} className="mt-2 relative">
                 <input 
                   type="text"
                   value={chatInput}
                   onChange={(e) => setChatInput(e.target.value)}
                   disabled={isDrawer || gameState.phase !== GamePhase.DRAWING}
                   placeholder={isDrawer ? "Jij bent aan het tekenen!" : "Typ je gok hier..."}
                   className={`w-full pl-4 pr-10 py-3 rounded-xl border-2 outline-none transition-all ${
                     isDrawer 
                       ? 'bg-slate-100 text-slate-400 cursor-not-allowed border-transparent' 
                       : 'bg-slate-50 border-slate-200 focus:border-primary focus:bg-white'
                   }`}
                 />
                 {!isDrawer && (
                   <button type="submit" className="absolute right-2 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-primary">
                     ➤
                   </button>
                 )}
              </form>
           </div>
        </div>

      </div>
    </div>
  );
};
