import React, { useRef, useEffect } from 'react';
import { Rocket } from 'lucide-react';

interface CrashChartProps {
  gameState: 'idle' | 'starting' | 'running' | 'crashed';
  multiplier: number;
  timeMs: number;
}

export const CrashChart: React.FC<CrashChartProps> = ({ gameState, multiplier, timeMs }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const offsetRef = useRef(0);
  const requestRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle Resize with ResizeObserver for perfect fit
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        if (entry.target === canvas.parentElement) {
          canvas.width = entry.contentRect.width;
          canvas.height = entry.contentRect.height;
        }
      }
    });

    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
      // Initial size
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight;
    }

    const drawGrid = (offset: number) => {
      if (!ctx || !canvas) return;
      const w = canvas.width;
      const h = canvas.height;
      
      // Clear
      ctx.fillStyle = '#050505'; // Deep background
      ctx.fillRect(0, 0, w, h);

      // Create Gradient for floor fade
      const gradient = ctx.createLinearGradient(0, h / 2, 0, h);
      gradient.addColorStop(0, 'rgba(173, 255, 2, 0)');
      gradient.addColorStop(0.2, 'rgba(173, 255, 2, 0.05)');
      gradient.addColorStop(1, 'rgba(173, 255, 2, 0.2)');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, h/2, w, h/2);

      // Perspective Grid Settings
      const horizonY = h * 0.4;
      const gridSize = 40;
      const speed = gameState === 'running' ? 2 * (1 + (multiplier - 1) * 0.5) : 0.5;
      
      ctx.strokeStyle = gameState === 'crashed' ? 'rgba(255, 42, 42, 0.3)' : 'rgba(173, 255, 2, 0.3)';
      ctx.lineWidth = 1;

      ctx.beginPath();

      // Vertical perspective lines
      const centerX = w / 2;
      for (let i = -20; i <= 20; i++) {
        const x = centerX + (i * gridSize * 2); 
        ctx.moveTo(centerX, horizonY);
        // Fan out
        ctx.lineTo(x + (i * 100), h);
      }

      // Horizontal moving lines
      const timeOffset = (offset * speed) % gridSize;
      
      // Draw simulated horizontal lines
      let currentY = horizonY;
      let gap = 10;
      while(currentY < h) {
         const yPos = currentY + (timeOffset * (currentY/h)); 
         if (yPos > horizonY && yPos < h) {
            ctx.moveTo(0, yPos);
            ctx.lineTo(w, yPos);
         }
         gap *= 1.1; // Increase gap as we get closer
         currentY += gap;
      }

      ctx.stroke();

      // Draw Stars/Particles in background
      if (gameState === 'running') {
        ctx.fillStyle = '#fff';
        for(let i=0; i<20; i++) {
            const x = Math.random() * w;
            const y = Math.random() * horizonY;
            ctx.globalAlpha = Math.random() * 0.8;
            ctx.fillRect(x, y, 1, 1);
        }
        ctx.globalAlpha = 1;
      }
    };

    const animate = () => {
      if (gameState === 'running') {
        offsetRef.current += 1;
      } else if (gameState === 'idle' || gameState === 'starting') {
        offsetRef.current += 0.2;
      }
      
      drawGrid(offsetRef.current);
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      if (canvas.parentElement) {
        resizeObserver.unobserve(canvas.parentElement);
      }
      resizeObserver.disconnect();
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [gameState, multiplier]);

  const isCrashed = gameState === 'crashed';
  const isRunning = gameState === 'running';

  return (
    <div className="relative w-full h-full bg-[#050505] terminal-border overflow-hidden rounded-xl font-mono flex flex-col">
      <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full" />
      
      {/* Rocket Container */}
      <div className={`absolute left-1/2 top-[60%] -translate-x-1/2 -translate-y-1/2 transition-transform duration-100 ${
        isRunning ? 'animate-pulse' : ''
      }`}>
        <div className={`relative ${isRunning ? 'animate-bounce' : ''}`}>
           {/* Trail Effect */}
           {isRunning && (
             <div className="absolute right-full top-1/2 -translate-y-1/2 w-32 h-8 bg-gradient-to-r from-transparent to-[#adff02] opacity-50 blur-md transform -translate-x-2" />
           )}
           
           {/* Rocket Icon */}
           <div className={`transform rotate-45 transition-all duration-300 ${isCrashed ? 'scale-0 opacity-0' : 'scale-100'}`}>
              <Rocket 
                size={64} 
                className={`text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.8)] fill-[#adff02]`} 
              />
           </div>

           {/* Engine Glow */}
           {!isCrashed && (
             <div className="absolute top-1/2 left-0 -translate-x-2 -translate-y-1/2 w-4 h-4 bg-white rounded-full blur-sm animate-ping" />
           )}
        </div>
      </div>

      {/* Explosion Effect */}
      {isCrashed && (
        <div className="absolute left-1/2 top-[60%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center">
            <div className="w-32 h-32 bg-[#ff2a2a] rounded-full blur-2xl animate-ping opacity-60 absolute"></div>
            <div className="text-[#ff2a2a] font-black text-4xl sm:text-5xl md:text-7xl drop-shadow-[0_0_20px_rgba(255,42,42,0.8)] animate-bounce uppercase tracking-tighter z-10 font-orbitron">
                CRASHED
            </div>
        </div>
      )}

      {/* Center Text Overlay */}
      <div className="absolute top-[15%] left-1/2 -translate-x-1/2 flex flex-col items-center justify-center pointer-events-none w-full px-4">
        {gameState === 'idle' && (
          <div className="text-[#666] text-lg sm:text-xl md:text-3xl font-bold tracking-widest uppercase bg-[#050505]/80 px-4 sm:px-6 py-2 rounded-full border border-[#333] text-center">
            Waiting for next round
          </div>
        )}
        {gameState === 'starting' && (
          <div className="flex flex-col items-center bg-[#050505]/80 px-6 sm:px-8 py-3 sm:py-4 rounded-2xl border border-[#333]">
            <div className="text-[#adff02] text-4xl sm:text-5xl md:text-7xl font-bold animate-pulse font-orbitron">
              {(5 - timeMs / 1000).toFixed(1)}s
            </div>
            <div className="text-[#adff02] text-sm sm:text-xl mt-1 sm:mt-2 tracking-widest uppercase opacity-80">
              Starting
            </div>
          </div>
        )}
        {gameState === 'running' && (
          <div className="flex flex-col items-center">
            <div className="text-gray-400 text-xs sm:text-sm font-bold tracking-widest uppercase mb-1 sm:mb-2 text-center">Current Payout</div>
            <div className="text-white text-5xl sm:text-7xl md:text-9xl font-black tracking-tighter drop-shadow-[0_0_20px_rgba(173,255,2,0.3)] font-orbitron">
              {multiplier.toFixed(2)}x
            </div>
          </div>
        )}
        {gameState === 'crashed' && (
          <div className="flex flex-col items-center">
            <div className="text-gray-500 text-xs sm:text-sm font-bold tracking-widest uppercase mb-1 sm:mb-2 text-center">Crashed At</div>
            <div className="text-[#ff2a2a] text-5xl sm:text-7xl md:text-9xl font-black tracking-tighter drop-shadow-[0_0_20px_rgba(255,42,42,0.5)] font-orbitron">
              {multiplier.toFixed(2)}x
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
