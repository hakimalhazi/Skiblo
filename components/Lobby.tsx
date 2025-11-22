import React, { useState } from 'react';
import { Player, RoomSettings, GameMode } from '../types';
import { Button } from './Button';
import { DEFAULT_SETTINGS } from '../constants';

interface LobbyProps {
  roomCode: string;
  players: Player[];
  currentPlayerId: string;
  settings: RoomSettings;
  onUpdateSettings: (settings: RoomSettings) => void;
  onStartGame: () => void;
  onLeave: () => void;
  onKick: (playerId: string) => void;
  onAddBot: () => void; // Simulation for demo
}

export const Lobby: React.FC<LobbyProps> = ({
  roomCode,
  players,
  currentPlayerId,
  settings,
  onUpdateSettings,
  onStartGame,
  onLeave,
  onKick,
  onAddBot
}) => {
  const me = players.find(p => p.id === currentPlayerId);
  const isHost = me?.isHost;
  const [showSettings, setShowSettings] = useState(false);

  const copyLink = () => {
    const url = `${window.location.origin}/join/${roomCode}`;
    navigator.clipboard.writeText(url);
    alert(`Link gekopieerd: ${url}`);
  };

  return (
    <div className="max-w-4xl mx-auto w-full p-4 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 shadow-xl flex flex-col md:flex-row justify-between items-center gap-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-secondary"></div>
        <div>
          <h2 className="text-slate-500 text-sm uppercase font-bold tracking-wider mb-1">Lobby Code</h2>
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-black text-slate-800 tracking-widest">{roomCode}</h1>
            <Button variant="secondary" size="sm" onClick={copyLink} icon="🔗">
              Deel
            </Button>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="danger" onClick={onLeave}>Verlaten</Button>
          {isHost && (
            <Button 
                variant="success" 
                onClick={onStartGame} 
                disabled={players.length < 2}
                className={players.length < 2 ? "opacity-50 cursor-not-allowed" : ""}
            >
              START SPEL
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Player List */}
        <div className="lg:col-span-2 bg-white rounded-3xl shadow-lg p-6 min-h-[400px]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-slate-800">Spelers ({players.length})</h3>
            {/* Debug Helper */}
            <Button variant="ghost" size="sm" onClick={onAddBot} className="text-xs text-slate-400">
              + Simuleer Speler
            </Button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {players.map((player) => (
              <div key={player.id} className="flex items-center p-3 rounded-xl bg-slate-50 border border-slate-100 hover:shadow-md transition-all">
                <div className="w-12 h-12 flex items-center justify-center text-3xl bg-white rounded-full shadow-sm mr-4">
                  {player.avatar}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-700">{player.name}</span>
                    {player.isHost && <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">HOST</span>}
                    {player.id === currentPlayerId && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">JIJ</span>}
                  </div>
                  <div className="text-xs text-slate-400">Klaar om te spelen</div>
                </div>
                {isHost && player.id !== currentPlayerId && (
                  <button 
                    onClick={() => onKick(player.id)}
                    className="text-red-400 hover:text-red-600 p-2"
                    title="Kick speler"
                  >
                    🚫
                  </button>
                )}
              </div>
            ))}
          </div>
          {players.length < 2 && (
            <div className="mt-8 text-center p-6 bg-amber-50 rounded-2xl border border-amber-100 text-amber-700">
              <p>Wachten op minimaal 2 spelers om te starten...</p>
            </div>
          )}
        </div>

        {/* Settings Panel (Host Only or View Only) */}
        <div className="bg-white rounded-3xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-slate-800">Spelinstellingen</h3>
            {isHost && (
               <button onClick={() => setShowSettings(!showSettings)} className="text-primary text-sm hover:underline">
                 {showSettings ? 'Sluiten' : 'Wijzigen'}
               </button>
            )}
          </div>

          <div className={`space-y-4 ${!isHost && "opacity-75 pointer-events-none"}`}>
             {/* Mode */}
             <div>
               <label className="block text-sm font-semibold text-slate-600 mb-1">Gamemode</label>
               {isHost && showSettings ? (
                 <select 
                    value={settings.gameMode}
                    onChange={(e) => onUpdateSettings({...settings, gameMode: e.target.value as GameMode})}
                    className="w-full p-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary outline-none"
                 >
                   {Object.values(GameMode).map(mode => (
                     <option key={mode} value={mode}>{mode}</option>
                   ))}
                 </select>
               ) : (
                 <div className="font-bold text-primary bg-indigo-50 p-2 rounded-lg">{settings.gameMode}</div>
               )}
             </div>

             {/* Rounds */}
             <div>
               <label className="block text-sm font-semibold text-slate-600 mb-1">Aantal Rondes</label>
               {isHost && showSettings ? (
                 <input 
                    type="number" 
                    min="1" 
                    max="10"
                    value={settings.rounds}
                    onChange={(e) => onUpdateSettings({...settings, rounds: parseInt(e.target.value)})}
                    className="w-full p-2 rounded-lg border border-slate-200"
                 />
               ) : (
                 <div className="font-medium text-slate-800">{settings.rounds} Rondes</div>
               )}
             </div>

             {/* Time */}
             <div>
               <label className="block text-sm font-semibold text-slate-600 mb-1">Tijd per Ronde</label>
               {isHost && showSettings ? (
                 <select 
                    value={settings.timePerRound}
                    onChange={(e) => onUpdateSettings({...settings, timePerRound: parseInt(e.target.value)})}
                    className="w-full p-2 rounded-lg border border-slate-200"
                 >
                   <option value="30">30 seconden</option>
                   <option value="45">45 seconden</option>
                   <option value="60">60 seconden</option>
                   <option value="90">90 seconden</option>
                   <option value="120">120 seconden</option>
                 </select>
               ) : (
                 <div className="font-medium text-slate-800">{settings.timePerRound}s</div>
               )}
             </div>

              {/* Hint Reveal */}
             <div>
               <label className="block text-sm font-semibold text-slate-600 mb-1">Automatische Hints</label>
                {isHost && showSettings ? (
                 <select 
                    value={settings.hintRevealTime}
                    onChange={(e) => onUpdateSettings({...settings, hintRevealTime: parseInt(e.target.value)})}
                    className="w-full p-2 rounded-lg border border-slate-200"
                 >
                   <option value="0">Uit</option>
                   <option value="10">Na 10s</option>
                   <option value="20">Na 20s</option>
                   <option value="30">Na 30s</option>
                 </select>
               ) : (
                 <div className="font-medium text-slate-800">{settings.hintRevealTime === 0 ? 'Uit' : `Na ${settings.hintRevealTime}s`}</div>
               )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
