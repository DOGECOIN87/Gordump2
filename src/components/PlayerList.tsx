import React from 'react';
import { User } from 'lucide-react';

interface Player {
  id: string;
  name: string;
  bet: number;
  multiplier?: number;
  status: 'betting' | 'playing' | 'cashed_out' | 'crashed';
}

interface PlayerListProps {
  players: Player[];
}

export const PlayerList: React.FC<PlayerListProps> = ({ players }) => {
  return (
    <div className="bg-[#111] terminal-border rounded-xl p-4 sm:p-6 flex flex-col h-full font-mono">
      <div className="flex justify-between items-center mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-[#333]">
        <h3 className="text-gray-400 uppercase text-sm tracking-widest">Live Bets</h3>
        <div className="flex items-center gap-2 text-[#adff02]">
          <User size={16} />
          <span className="text-sm">{players.length}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-2">
        {players.map((player) => (
          <div 
            key={player.id} 
            className={`flex justify-between items-center p-3 rounded terminal-border ${
              player.status === 'cashed_out' ? 'bg-[rgba(173,255,2,0.1)] border-[#adff02]' : 
              player.status === 'crashed' ? 'bg-[rgba(255,42,42,0.1)] border-[#ff2a2a]' : 
              'bg-[#222]'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                player.id === 'you' ? 'bg-[#adff02] text-black' : 'bg-black text-gray-500'
              }`}>
                {player.name.substring(0, 2).toUpperCase()}
              </div>
              <span className={`font-bold truncate ${player.id === 'you' ? 'text-[#adff02]' : 'text-gray-300'}`}>
                {player.name}
              </span>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-4 shrink-0 pl-2">
              <span className="text-gray-400">{player.bet.toFixed(2)}</span>
              
              <div className="w-20 text-right">
                {player.status === 'cashed_out' && player.multiplier ? (
                  <span className="text-[#adff02] font-bold">{player.multiplier.toFixed(2)}x</span>
                ) : player.status === 'crashed' ? (
                  <span className="text-[#ff2a2a]">-</span>
                ) : player.status === 'betting' ? (
                  <span className="text-gray-500">Ready</span>
                ) : (
                  <span className="text-gray-500 animate-pulse">Running</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
