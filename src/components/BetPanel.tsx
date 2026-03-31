import React from 'react';
import { Coins, Rocket, ShieldAlert } from 'lucide-react';

interface BetPanelProps {
  balance: number;
  betAmount: number;
  setBetAmount: (val: number) => void;
  autoCashout: number;
  setAutoCashout: (val: number) => void;
  playerStatus: 'idle' | 'betting' | 'playing' | 'cashed_out' | 'crashed';
  gameState: 'idle' | 'starting' | 'running' | 'crashed';
  onPlaceBet: () => void;
  onCancelBet: () => void;
  onCashOut: () => void;
  winAmount: number;
}

export const BetPanel: React.FC<BetPanelProps> = ({
  balance,
  betAmount,
  setBetAmount,
  autoCashout,
  setAutoCashout,
  playerStatus,
  gameState,
  onPlaceBet,
  onCancelBet,
  onCashOut,
  winAmount
}) => {
  const isBettingDisabled = playerStatus !== 'idle' || (gameState !== 'idle' && gameState !== 'starting');

  return (
    <div className="bg-[#111] terminal-border rounded-xl p-4 sm:p-6 flex flex-col h-full font-mono">
      <div className="flex justify-between items-center mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-[#333]">
        <div className="text-gray-400 uppercase text-sm tracking-widest">Wallet Balance</div>
        <div className="text-[#adff02] font-bold text-xl flex items-center gap-2">
          <Coins size={20} />
          {balance.toFixed(2)} <span className="text-sm">gGOR</span>
        </div>
      </div>

      <div className="space-y-6 flex-1">
        {/* Bet Amount */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <label className="text-gray-400 text-sm uppercase tracking-wider">Bet Amount</label>
            <span className="text-gray-500 text-sm">gGOR</span>
          </div>
          <div className="flex gap-1 sm:gap-2">
            <div className="relative flex-1">
              <input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(Math.max(0, Number(e.target.value)))}
                disabled={isBettingDisabled}
                className="w-full bg-black terminal-border rounded p-2 sm:p-3 text-white focus:outline-none focus:border-[#adff02] transition-colors disabled:opacity-50 text-sm sm:text-base"
              />
            </div>
            <button 
              onClick={() => setBetAmount(betAmount / 2)}
              disabled={isBettingDisabled}
              className="bg-[#222] hover:bg-[#333] text-white px-2 sm:px-4 rounded terminal-border transition-colors disabled:opacity-50 text-xs sm:text-sm font-bold"
            >
              1/2
            </button>
            <button 
              onClick={() => setBetAmount(betAmount * 2)}
              disabled={isBettingDisabled}
              className="bg-[#222] hover:bg-[#333] text-white px-2 sm:px-4 rounded terminal-border transition-colors disabled:opacity-50 text-xs sm:text-sm font-bold"
            >
              2x
            </button>
            <button 
              onClick={() => setBetAmount(balance)}
              disabled={isBettingDisabled}
              className="bg-[#222] hover:bg-[#333] text-white px-2 sm:px-4 rounded terminal-border transition-colors disabled:opacity-50 text-xs sm:text-sm font-bold"
            >
              Max
            </button>
          </div>
        </div>

        {/* Auto Cashout */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <label className="text-gray-400 text-sm uppercase tracking-wider">Auto Cashout</label>
            <span className="text-gray-500 text-sm">Multiplier</span>
          </div>
          <div className="relative">
            <input
              type="number"
              value={autoCashout}
              onChange={(e) => setAutoCashout(Math.max(1.01, Number(e.target.value)))}
              step="0.01"
              disabled={isBettingDisabled}
              className="w-full bg-black terminal-border rounded p-2 sm:p-3 text-white focus:outline-none focus:border-[#adff02] transition-colors disabled:opacity-50 text-sm sm:text-base"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">x</div>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-[#333]">
        {playerStatus === 'idle' && (
          <button
            onClick={onPlaceBet}
            disabled={gameState === 'running' || gameState === 'crashed' || betAmount <= 0 || betAmount > balance}
            className="w-full py-4 rounded font-bold text-lg uppercase tracking-widest transition-all bg-[#adff02] text-black hover:bg-[#c4ff4d] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Rocket size={24} />
            Place Bet
          </button>
        )}

        {playerStatus === 'betting' && (
          <button
            onClick={onCancelBet}
            className="w-full py-4 rounded font-bold text-lg uppercase tracking-widest transition-all bg-[#ff2a2a] text-white hover:bg-[#ff4d4d] flex items-center justify-center gap-2"
          >
            <ShieldAlert size={24} />
            Cancel Bet
          </button>
        )}

        {playerStatus === 'playing' && (
          <button
            onClick={onCashOut}
            className="w-full py-4 rounded font-bold text-lg uppercase tracking-widest transition-all bg-[#adff02] text-black hover:bg-[#c4ff4d] flex items-center justify-center gap-2 animate-pulse neon-border"
          >
            Cash Out
          </button>
        )}

        {playerStatus === 'cashed_out' && (
          <div className="w-full py-4 rounded font-bold text-lg uppercase tracking-widest bg-[#222] text-[#adff02] flex flex-col items-center justify-center terminal-border">
            <span>Cashed Out!</span>
            <span className="text-sm text-white mt-1">+{winAmount.toFixed(2)} gGOR</span>
          </div>
        )}

        {playerStatus === 'crashed' && (
          <div className="w-full py-4 rounded font-bold text-lg uppercase tracking-widest bg-[#222] text-[#ff2a2a] flex items-center justify-center terminal-border">
            Busted
          </div>
        )}
      </div>
    </div>
  );
};
