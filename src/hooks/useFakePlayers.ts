import { useState, useEffect, useRef } from 'react';

interface Player {
  id: string;
  name: string;
  bet: number;
  multiplier?: number;
  status: 'betting' | 'playing' | 'cashed_out' | 'crashed';
  cashOutPoint: number;
}

const FAKE_NAMES = ['DogeKing', 'GorFan', 'TrashPanda', 'MoonBoy', 'SolSurfer', 'Ape99', 'CryptoWhale', 'DegenX'];

export function useFakePlayers(gameState: string, currentMultiplier: number) {
  const [players, setPlayers] = useState<Player[]>([]);
  const playersRef = useRef<Player[]>([]);

  useEffect(() => {
    if (gameState === 'starting') {
      // Generate new players
      const numPlayers = Math.floor(Math.random() * 5) + 3; // 3 to 7 players
      const newPlayers: Player[] = Array.from({ length: numPlayers }).map((_, i) => {
        const isDegen = Math.random() > 0.8;
        return {
          id: `player-${i}`,
          name: FAKE_NAMES[Math.floor(Math.random() * FAKE_NAMES.length)] + Math.floor(Math.random() * 100),
          bet: Math.floor(Math.random() * 100) + 10,
          status: 'betting',
          cashOutPoint: isDegen ? (Math.random() * 10 + 2) : (Math.random() * 1.5 + 1.1)
        };
      });
      playersRef.current = newPlayers;
      setPlayers(newPlayers);
    } else if (gameState === 'running') {
      // Transition betting to playing, and check for cashouts
      let changed = false;
      const updated = playersRef.current.map(p => {
        if (p.status === 'betting') {
          changed = true;
          return { ...p, status: 'playing' as const };
        }
        if (p.status === 'playing' && currentMultiplier >= p.cashOutPoint) {
          changed = true;
          return { ...p, status: 'cashed_out' as const, multiplier: p.cashOutPoint };
        }
        return p;
      });
      
      if (changed) {
        playersRef.current = updated;
        setPlayers(updated);
      }
    } else if (gameState === 'crashed') {
      // Everyone still playing crashes
      const updated = playersRef.current.map(p => {
        if (p.status === 'playing') {
          return { ...p, status: 'crashed' as const };
        }
        return p;
      });
      playersRef.current = updated;
      setPlayers(updated);
    }
  }, [gameState, currentMultiplier]);

  return players;
}
