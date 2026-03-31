import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CrashChart } from './CrashChart';
import { BetPanel } from './BetPanel';
import { PlayerList } from './PlayerList';
import { History } from './History';
import { useFakePlayers } from '../hooks/useFakePlayers';

type GameState = 'idle' | 'starting' | 'running' | 'crashed';
type PlayerStatus = 'idle' | 'betting' | 'playing' | 'cashed_out' | 'crashed';

export const CrashGame: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>('idle');
  const [multiplier, setMultiplier] = useState(1.00);
  const [timeMs, setTimeMs] = useState(0);
  const [history, setHistory] = useState<number[]>([1.24, 2.5, 1.00, 10.4, 1.1, 3.2]);
  
  const [balance, setBalance] = useState(1000);
  const [betAmount, setBetAmount] = useState(10);
  const [autoCashout, setAutoCashout] = useState(2.00);
  const [playerStatus, setPlayerStatus] = useState<PlayerStatus>('idle');
  const [winAmount, setWinAmount] = useState(0);

  const fakePlayers = useFakePlayers(gameState, multiplier);

  const allPlayers = [
    ...(playerStatus !== 'idle' ? [{
      id: 'you',
      name: 'You',
      bet: betAmount,
      multiplier: playerStatus === 'cashed_out' ? (winAmount / betAmount) : undefined,
      status: playerStatus,
      cashOutPoint: autoCashout
    }] : []),
    ...fakePlayers
  ] as any[];

  const requestRef = useRef<number>();
  const startTimeRef = useRef<number>();
  const crashPointRef = useRef<number>(0);
  
  // Refs for state accessed in loop
  const gameStateRef = useRef(gameState);
  const playerStatusRef = useRef(playerStatus);
  const autoCashoutRef = useRef(autoCashout);
  const betAmountRef = useRef(betAmount);
  const multiplierRef = useRef(multiplier);

  // Update refs when state changes
  useEffect(() => { gameStateRef.current = gameState; }, [gameState]);
  useEffect(() => { playerStatusRef.current = playerStatus; }, [playerStatus]);
  useEffect(() => { autoCashoutRef.current = autoCashout; }, [autoCashout]);
  useEffect(() => { betAmountRef.current = betAmount; }, [betAmount]);
  useEffect(() => { multiplierRef.current = multiplier; }, [multiplier]);

  // Generate a provably fair crash point (simplified for demo)
  const generateCrashPoint = () => {
    const e = Math.pow(2, 32);
    const h = crypto.getRandomValues(new Uint32Array(1))[0];
    if (h % 100 === 0) return 1.00; // 1% instant crash
    return Math.max(1.00, Math.floor((100 * e - h) / (e - h)) / 100);
  };

  const handleCashOut = useCallback((currentMult: number = multiplierRef.current) => {
    if (playerStatusRef.current === 'playing') {
      const won = betAmountRef.current * currentMult;
      setWinAmount(won);
      setBalance(prev => prev + won);
      setPlayerStatus('cashed_out');
    }
  }, []);

  const gameLoop = useCallback((time: number) => {
    if (gameStateRef.current === 'starting') {
      if (!startTimeRef.current) startTimeRef.current = time;
      const elapsed = time - startTimeRef.current;
      
      if (elapsed >= 5000) {
        setGameState('running');
        startTimeRef.current = time; // Reset for running phase
        
        // Lock in bets
        if (playerStatusRef.current === 'betting') {
          setPlayerStatus('playing');
          setBalance(prev => prev - betAmountRef.current);
        } else if (playerStatusRef.current !== 'idle') {
          setPlayerStatus('idle');
        }
      } else {
        setTimeMs(elapsed);
      }
    } else if (gameStateRef.current === 'running') {
      if (!startTimeRef.current) startTimeRef.current = time;
      const elapsed = time - startTimeRef.current;
      
      // Calculate current multiplier
      const currentMult = Math.pow(Math.E, 0.00006 * elapsed);
      
      if (currentMult >= crashPointRef.current) {
        // Crash!
        setGameState('crashed');
        setMultiplier(crashPointRef.current);
        setHistory(prev => [crashPointRef.current, ...prev].slice(0, 20));
        
        if (playerStatusRef.current === 'playing') {
          setPlayerStatus('crashed');
        }
        
        // Wait 3 seconds then restart
        setTimeout(() => {
          setGameState('idle');
        }, 3000);
        
        return; // Stop loop
      }

      setMultiplier(currentMult);
      setTimeMs(elapsed);

      // Auto cashout logic
      if (playerStatusRef.current === 'playing' && currentMult >= autoCashoutRef.current) {
        handleCashOut(currentMult);
      }
    }

    requestRef.current = requestAnimationFrame(gameLoop);
  }, [handleCashOut]);

  // Start/Stop loop based on gameState
  useEffect(() => {
    if (gameState === 'idle') {
      // Initialize new round
      crashPointRef.current = generateCrashPoint();
      setMultiplier(1.00);
      setTimeMs(0);
      
      // Keep betting status if they placed a bet for next round
      if (playerStatus !== 'betting') {
        setPlayerStatus('idle');
      }
      
      // Start countdown
      setGameState('starting');
      startTimeRef.current = undefined;
      requestRef.current = requestAnimationFrame(gameLoop);
    }
    
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [gameState, betAmount, playerStatus, gameLoop]);

  const handlePlaceBet = () => {
    if (gameState === 'idle' || gameState === 'starting') {
      setPlayerStatus('betting');
    }
  };

  const handleCancelBet = () => {
    if (gameState === 'idle' || gameState === 'starting') {
      setPlayerStatus('idle');
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-2 sm:p-4 md:p-8 font-sans selection:bg-[#adff02] selection:text-black">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        
        {/* Header */}
        <header className="flex justify-between items-center pb-4 sm:pb-6 border-b border-[#333]">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#adff02] rounded-lg flex items-center justify-center text-black font-black text-xl sm:text-2xl shrink-0">
              G
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tighter uppercase">GorDump</h1>
              <p className="text-[#adff02] text-[10px] sm:text-sm font-mono tracking-widest uppercase opacity-80">Trashmarket.fun</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-4 text-sm font-mono text-gray-400">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#adff02] animate-pulse"></div>
              <span>Gorbagana Network</span>
            </div>
          </div>
        </header>

        {/* History Bar */}
        <History history={history} />

        {/* Main Game Area */}
        <div className="flex flex-col lg:grid lg:grid-cols-4 gap-4 sm:gap-6 lg:h-[600px]">
          
          {/* Center Panel: Chart (Moved to top on mobile) */}
          <div className="order-1 lg:order-2 lg:col-span-2 h-[350px] md:h-[450px] lg:h-full">
            <CrashChart 
              gameState={gameState}
              multiplier={multiplier}
              timeMs={timeMs}
            />
          </div>

          {/* Left Panel: Betting Controls */}
          <div className="order-2 lg:order-1 lg:col-span-1 h-full">
            <BetPanel 
              balance={balance}
              betAmount={betAmount}
              setBetAmount={setBetAmount}
              autoCashout={autoCashout}
              setAutoCashout={setAutoCashout}
              playerStatus={playerStatus}
              gameState={gameState}
              onPlaceBet={handlePlaceBet}
              onCancelBet={handleCancelBet}
              onCashOut={() => handleCashOut(multiplier)}
              winAmount={winAmount}
            />
          </div>

          {/* Right Panel: Players */}
          <div className="order-3 lg:order-3 lg:col-span-1 h-[400px] lg:h-full">
            <PlayerList players={allPlayers} />
          </div>
        </div>
      </div>
    </div>
  );
};
