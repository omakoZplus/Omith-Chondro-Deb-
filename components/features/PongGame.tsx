import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../../stores/useAppStore';
import { X, Wallet, RotateCcw } from 'lucide-react';

export const PongGame: React.FC = () => {
    const { setView } = useAppStore();
    
    const [showBamboozle, setShowBamboozle] = useState(true);
    const [gameStarted, setGameStarted] = useState(false);
    const [score, setScore] = useState({ player: 0, cpu: 0 });
    
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const requestRef = useRef<number>(0);
    
    // Game Constants
    const PADDLE_HEIGHT = 80;
    const PADDLE_WIDTH = 10;
    const BALL_SIZE = 8;
    const CANVAS_WIDTH = 600;
    const CANVAS_HEIGHT = 400;
    
    // Game State Refs (mutable for performance loop)
    const gameState = useRef({
        ball: { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2, dx: 4, dy: 4 },
        playerY: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
        cpuY: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
        cpuSpeed: 3.5
    });

    const resetBall = () => {
        gameState.current.ball = {
            x: CANVAS_WIDTH / 2,
            y: CANVAS_HEIGHT / 2,
            dx: (Math.random() > 0.5 ? 4 : -4),
            dy: (Math.random() * 6 - 3)
        };
    };

    const update = () => {
        if (!canvasRef.current) return;
        
        const state = gameState.current;
        
        // Move Ball
        state.ball.x += state.ball.dx;
        state.ball.y += state.ball.dy;

        // Wall Collisions (Top/Bottom)
        if (state.ball.y <= 0 || state.ball.y + BALL_SIZE >= CANVAS_HEIGHT) {
            state.ball.dy *= -1;
        }

        // Paddle Collisions
        // Player
        if (
            state.ball.x <= PADDLE_WIDTH + 10 &&
            state.ball.y + BALL_SIZE >= state.playerY &&
            state.ball.y <= state.playerY + PADDLE_HEIGHT
        ) {
            state.ball.dx *= -1.1; // Speed up slightly
            // Add spin based on where it hit the paddle
            const hitPoint = state.ball.y - (state.playerY + PADDLE_HEIGHT / 2);
            state.ball.dy = hitPoint * 0.15;
            state.ball.x = PADDLE_WIDTH + 11; // Prevent sticking
        }

        // CPU
        if (
            state.ball.x + BALL_SIZE >= CANVAS_WIDTH - PADDLE_WIDTH - 10 &&
            state.ball.y + BALL_SIZE >= state.cpuY &&
            state.ball.y <= state.cpuY + PADDLE_HEIGHT
        ) {
            state.ball.dx *= -1.1;
            const hitPoint = state.ball.y - (state.cpuY + PADDLE_HEIGHT / 2);
            state.ball.dy = hitPoint * 0.15;
            state.ball.x = CANVAS_WIDTH - PADDLE_WIDTH - 11 - BALL_SIZE;
        }

        // Scoring
        if (state.ball.x < 0) {
            setScore(s => ({ ...s, cpu: s.cpu + 1 }));
            resetBall();
        } else if (state.ball.x > CANVAS_WIDTH) {
            setScore(s => ({ ...s, player: s.player + 1 }));
            resetBall();
        }

        // AI Movement
        const targetY = state.ball.y - PADDLE_HEIGHT / 2;
        if (targetY > state.cpuY + 5) {
            state.cpuY += state.cpuSpeed;
        } else if (targetY < state.cpuY - 5) {
            state.cpuY -= state.cpuSpeed;
        }
        
        // Clamp AI
        state.cpuY = Math.max(0, Math.min(CANVAS_HEIGHT - PADDLE_HEIGHT, state.cpuY));

        draw();
        requestRef.current = requestAnimationFrame(update);
    };

    const draw = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear
        ctx.fillStyle = '#09090b';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Net
        ctx.strokeStyle = '#333';
        ctx.setLineDash([10, 10]);
        ctx.beginPath();
        ctx.moveTo(CANVAS_WIDTH / 2, 0);
        ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT);
        ctx.stroke();

        ctx.fillStyle = '#fff';

        // Player Paddle
        ctx.fillRect(10, gameState.current.playerY, PADDLE_WIDTH, PADDLE_HEIGHT);

        // CPU Paddle
        ctx.fillRect(CANVAS_WIDTH - PADDLE_WIDTH - 10, gameState.current.cpuY, PADDLE_WIDTH, PADDLE_HEIGHT);

        // Ball
        ctx.beginPath();
        ctx.arc(gameState.current.ball.x, gameState.current.ball.y, BALL_SIZE, 0, Math.PI * 2);
        ctx.fill();
    };

    useEffect(() => {
        if (gameStarted) {
            requestRef.current = requestAnimationFrame(update);
        }
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [gameStarted]);

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!gameStarted) return;
        const rect = canvasRef.current?.getBoundingClientRect();
        if (rect) {
            const mouseY = e.clientY - rect.top;
            const newY = mouseY - PADDLE_HEIGHT / 2;
            gameState.current.playerY = Math.max(0, Math.min(CANVAS_HEIGHT - PADDLE_HEIGHT, newY));
        }
    };

    const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
        if (!gameStarted) return;
        const rect = canvasRef.current?.getBoundingClientRect();
        if (rect) {
            const touchY = e.touches[0].clientY - rect.top;
            const newY = touchY - PADDLE_HEIGHT / 2;
            gameState.current.playerY = Math.max(0, Math.min(CANVAS_HEIGHT - PADDLE_HEIGHT, newY));
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-black p-4 fixed inset-0 z-50 animate-in fade-in">
            {/* Header / Exit */}
            <div className="absolute top-4 right-4 flex gap-4">
                 <button 
                    onClick={() => setView('create')} 
                    className="flex items-center gap-2 px-4 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors border border-white/10"
                >
                    <X size={18} /> Exit Upgrade
                </button>
            </div>

            {showBamboozle ? (
                <div className="text-center max-w-md mx-auto space-y-6 animate-in zoom-in-95 duration-300">
                    <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-indigo-500/50">
                        <Wallet size={40} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2">Wait, it's all free?</h1>
                        <p className="text-zinc-400 text-lg">Always has been.</p>
                        <p className="text-zinc-500 text-sm mt-2">You found a rare secret! Play some Pong instead.</p>
                    </div>
                    <button 
                        onClick={() => { setShowBamboozle(false); setGameStarted(true); }}
                        className="bg-white text-black px-8 py-3 rounded-full font-bold text-lg hover:scale-105 active:scale-95 transition-all shadow-lg shadow-white/20"
                    >
                        Play Pong
                    </button>
                </div>
            ) : (
                <div className="flex flex-col items-center gap-6">
                    <div className="flex justify-between w-full max-w-[600px] px-8">
                        <div className="text-center">
                            <p className="text-xs text-zinc-500 uppercase font-bold">Player</p>
                            <p className="text-4xl font-mono text-white">{score.player}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-xs text-zinc-500 uppercase font-bold">CPU</p>
                            <p className="text-4xl font-mono text-white">{score.cpu}</p>
                        </div>
                    </div>

                    <div className="relative rounded-xl overflow-hidden border-2 border-zinc-800 shadow-2xl">
                        <canvas
                            ref={canvasRef}
                            width={CANVAS_WIDTH}
                            height={CANVAS_HEIGHT}
                            onMouseMove={handleMouseMove}
                            onTouchMove={handleTouchMove}
                            className="bg-[#09090b] cursor-none touch-none max-w-full h-auto"
                            style={{ width: 'min(90vw, 600px)' }}
                        />
                        {!gameStarted && (
                             <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                                 <button onClick={() => setGameStarted(true)} className="bg-white text-black px-6 py-2 rounded-full font-bold">
                                     Start Game
                                 </button>
                             </div>
                        )}
                    </div>
                    
                    <p className="text-zinc-500 text-sm">Move your mouse or finger to control the paddle</p>
                </div>
            )}
        </div>
    );
};