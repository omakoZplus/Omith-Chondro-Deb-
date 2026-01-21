import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAppStore } from '../../stores/useAppStore';
import { X, Trophy, Play, RotateCcw, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Wallet } from 'lucide-react';

const GRID_SIZE = 20;
const INITIAL_SPEED = 150;
const SPEED_INCREMENT = 5;

type Point = { x: number; y: number };

export const SnakeGame: React.FC = () => {
    const { setView } = useAppStore();
    
    // Game State
    const [snake, setSnake] = useState<Point[]>([{ x: 10, y: 10 }]);
    const [food, setFood] = useState<Point>({ x: 15, y: 15 });
    const [direction, setDirection] = useState<Point>({ x: 1, y: 0 }); // Moving right
    const [nextDirection, setNextDirection] = useState<Point>({ x: 1, y: 0 }); // Buffer for rapid inputs
    const [gameOver, setGameOver] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(0);
    const [speed, setSpeed] = useState(INITIAL_SPEED);
    const [showBamboozle, setShowBamboozle] = useState(true);

    const boardRef = useRef<HTMLDivElement>(null);

    // Initialize High Score
    useEffect(() => {
        const saved = localStorage.getItem('suno_architect_snake_highscore');
        if (saved) setHighScore(parseInt(saved, 10));
    }, []);

    const generateFood = useCallback((currentSnake: Point[]) => {
        let newFood: Point;
        let isColliding;
        do {
            newFood = {
                x: Math.floor(Math.random() * GRID_SIZE),
                y: Math.floor(Math.random() * GRID_SIZE)
            };
            // eslint-disable-next-line no-loop-func
            isColliding = currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y);
        } while (isColliding);
        return newFood;
    }, []);

    const resetGame = () => {
        setSnake([{ x: 10, y: 10 }]);
        setFood(generateFood([{ x: 10, y: 10 }]));
        setDirection({ x: 1, y: 0 });
        setNextDirection({ x: 1, y: 0 });
        setGameOver(false);
        setScore(0);
        setSpeed(INITIAL_SPEED);
        setIsPlaying(true);
    };

    const handleGameOver = useCallback(() => {
        setGameOver(true);
        setIsPlaying(false);
        if (score > highScore) {
            setHighScore(score);
            localStorage.setItem('suno_architect_snake_highscore', score.toString());
        }
    }, [score, highScore]);

    // Game Loop
    useEffect(() => {
        if (!isPlaying || gameOver) return;

        const moveSnake = () => {
            setDirection(nextDirection);
            
            setSnake(prevSnake => {
                const head = prevSnake[0];
                const newHead = {
                    x: head.x + nextDirection.x,
                    y: head.y + nextDirection.y
                };

                // Wall Collision
                if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
                    handleGameOver();
                    return prevSnake;
                }

                // Self Collision
                if (prevSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
                    handleGameOver();
                    return prevSnake;
                }

                const newSnake = [newHead, ...prevSnake];

                // Food Collision
                if (newHead.x === food.x && newHead.y === food.y) {
                    setScore(s => s + 1);
                    setFood(generateFood(newSnake));
                    setSpeed(s => Math.max(50, s - SPEED_INCREMENT));
                } else {
                    newSnake.pop(); // Remove tail
                }

                return newSnake;
            });
        };

        const gameInterval = setInterval(moveSnake, speed);
        return () => clearInterval(gameInterval);
    }, [isPlaying, gameOver, nextDirection, food, generateFood, handleGameOver, speed]);

    // Input Handling
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (showBamboozle) return;
            
            // Prevent default scrolling for arrows
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
                e.preventDefault();
            }

            if (gameOver && e.key === 'Enter') {
                resetGame();
                return;
            }

            if (!isPlaying && !gameOver && (e.key === 'Enter' || e.key === ' ')) {
                setIsPlaying(true);
                return;
            }

            switch (e.key) {
                case 'ArrowUp':
                case 'w':
                case 'W':
                    if (direction.y === 0) setNextDirection({ x: 0, y: -1 });
                    break;
                case 'ArrowDown':
                case 's':
                case 'S':
                    if (direction.y === 0) setNextDirection({ x: 0, y: 1 });
                    break;
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    if (direction.x === 0) setNextDirection({ x: -1, y: 0 });
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    if (direction.x === 0) setNextDirection({ x: 1, y: 0 });
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [direction, isPlaying, gameOver, showBamboozle]);

    // Touch Controls
    const handleTouchControl = (dir: 'up' | 'down' | 'left' | 'right') => {
        if (!isPlaying && !gameOver) setIsPlaying(true);
        if (gameOver) return;

        switch (dir) {
            case 'up': if (direction.y === 0) setNextDirection({ x: 0, y: -1 }); break;
            case 'down': if (direction.y === 0) setNextDirection({ x: 0, y: 1 }); break;
            case 'left': if (direction.x === 0) setNextDirection({ x: -1, y: 0 }); break;
            case 'right': if (direction.x === 0) setNextDirection({ x: 1, y: 0 }); break;
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
                        <p className="text-zinc-500 text-sm mt-2">You got bamboozled. Enjoy this snake game instead.</p>
                    </div>
                    <button 
                        onClick={() => setShowBamboozle(false)}
                        className="bg-white text-black px-8 py-3 rounded-full font-bold text-lg hover:scale-105 active:scale-95 transition-all shadow-lg shadow-white/20"
                    >
                        Play Snake
                    </button>
                </div>
            ) : (
                <div className="flex flex-col items-center gap-6 w-full max-w-lg">
                    {/* Score Board */}
                    <div className="flex justify-between w-full bg-zinc-900 border border-white/10 rounded-xl p-4">
                         <div className="flex flex-col">
                             <span className="text-xs text-zinc-500 uppercase font-bold">Score</span>
                             <span className="text-2xl font-mono text-white">{score}</span>
                         </div>
                         <div className="flex flex-col items-end">
                             <span className="text-xs text-zinc-500 uppercase font-bold flex items-center gap-1">
                                 High Score <Trophy size={10} className="text-yellow-500" />
                             </span>
                             <span className="text-2xl font-mono text-yellow-500">{highScore}</span>
                         </div>
                    </div>

                    {/* Game Board */}
                    <div 
                        ref={boardRef}
                        className="relative bg-[#09090b] border-2 border-zinc-800 rounded-xl overflow-hidden shadow-2xl"
                        style={{
                            width: 'min(90vw, 400px)',
                            height: 'min(90vw, 400px)',
                            display: 'grid',
                            gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
                            gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`
                        }}
                    >
                        {/* Overlay Screens */}
                        {!isPlaying && !gameOver && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-10 backdrop-blur-sm">
                                <div className="text-center animate-pulse">
                                    <p className="text-white font-bold text-xl mb-2">Ready?</p>
                                    <p className="text-zinc-400 text-sm">Press Space or Arrow Keys</p>
                                    <button 
                                        onClick={() => setIsPlaying(true)}
                                        className="mt-4 md:hidden bg-indigo-600 text-white px-6 py-2 rounded-full font-bold"
                                    >
                                        Tap to Start
                                    </button>
                                </div>
                            </div>
                        )}

                        {gameOver && (
                            <div className="absolute inset-0 flex items-center justify-center bg-red-900/80 z-10 backdrop-blur-sm animate-in fade-in">
                                <div className="text-center">
                                    <h2 className="text-3xl font-bold text-white mb-2">Game Over!</h2>
                                    <p className="text-white/80 mb-6">Final Score: {score}</p>
                                    <button 
                                        onClick={resetGame}
                                        className="flex items-center gap-2 bg-white text-red-600 px-6 py-3 rounded-full font-bold hover:scale-105 transition-transform mx-auto"
                                    >
                                        <RotateCcw size={18} /> Play Again
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Render Snake & Food */}
                        {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
                            const x = i % GRID_SIZE;
                            const y = Math.floor(i / GRID_SIZE);
                            
                            const isSnakeHead = snake[0].x === x && snake[0].y === y;
                            const isSnakeBody = snake.some((s, idx) => idx !== 0 && s.x === x && s.y === y);
                            const isFood = food.x === x && food.y === y;

                            return (
                                <div 
                                    key={i} 
                                    className={`
                                        w-full h-full border-[0.5px] border-white/[0.02]
                                        ${isSnakeHead ? 'bg-indigo-500 rounded-sm z-10 scale-110' : ''}
                                        ${isSnakeBody ? 'bg-indigo-500/50 rounded-sm' : ''}
                                        ${isFood ? 'bg-green-500 rounded-full scale-75 shadow-[0_0_10px_rgba(34,197,94,0.6)] animate-pulse' : ''}
                                    `}
                                />
                            );
                        })}
                    </div>

                    {/* Mobile Controls */}
                    <div className="grid grid-cols-3 gap-2 w-full max-w-[200px] md:hidden">
                        <div></div>
                        <button className="bg-zinc-800 p-4 rounded-lg active:bg-zinc-700 flex justify-center" onClick={() => handleTouchControl('up')}><ArrowUp /></button>
                        <div></div>
                        <button className="bg-zinc-800 p-4 rounded-lg active:bg-zinc-700 flex justify-center" onClick={() => handleTouchControl('left')}><ArrowLeft /></button>
                        <button className="bg-zinc-800 p-4 rounded-lg active:bg-zinc-700 flex justify-center" onClick={() => handleTouchControl('down')}><ArrowDown /></button>
                        <button className="bg-zinc-800 p-4 rounded-lg active:bg-zinc-700 flex justify-center" onClick={() => handleTouchControl('right')}><ArrowRight /></button>
                    </div>

                    <div className="text-center text-xs text-zinc-600 hidden md:block">
                        Use <kbd className="bg-zinc-800 px-1 rounded">W</kbd> <kbd className="bg-zinc-800 px-1 rounded">A</kbd> <kbd className="bg-zinc-800 px-1 rounded">S</kbd> <kbd className="bg-zinc-800 px-1 rounded">D</kbd> or Arrows to move
                    </div>
                </div>
            )}
        </div>
    );
};