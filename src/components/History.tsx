import React from 'react';

interface HistoryProps {
  history: number[];
}

export const History: React.FC<HistoryProps> = ({ history }) => {
  return (
    <div className="flex gap-2 overflow-x-auto py-2 scrollbar-hide font-mono">
      {history.map((multiplier, index) => {
        const isHigh = multiplier >= 2.0;
        const isCrash = multiplier < 1.1;
        
        return (
          <div 
            key={index}
            className={`px-3 py-1 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap terminal-border ${
              isHigh ? 'bg-[rgba(173,255,2,0.1)] text-[#adff02] border-[#adff02]' : 
              isCrash ? 'bg-[rgba(255,42,42,0.1)] text-[#ff2a2a] border-[#ff2a2a]' : 
              'bg-[#222] text-gray-300'
            }`}
          >
            {multiplier.toFixed(2)}x
          </div>
        );
      })}
    </div>
  );
};
