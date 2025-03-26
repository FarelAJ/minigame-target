import { useEffect, useState, useCallback } from 'react';
import { GameState, Target } from '../types/game';
import '../styles/Game.css';

const GAME_DURATION = 30; // seconds
const TARGET_SPAWN_INTERVAL = 1000; // milliseconds
const MIN_TARGET_SIZE = 20;
const MAX_TARGET_SIZE = 60;

export const Game = () => {
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    timeLeft: GAME_DURATION,
    targets: [],
    isGameRunning: false,
  });

  const generateTarget = useCallback((): Target => {
    return {
      id: Math.random(),
      x: Math.random() * (window.innerWidth - MAX_TARGET_SIZE),
      y: Math.random() * (window.innerHeight - MAX_TARGET_SIZE),
      size: Math.random() * (MAX_TARGET_SIZE - MIN_TARGET_SIZE) + MIN_TARGET_SIZE,
    };
  }, []);

  const startGame = () => {
    setGameState({
      score: 0,
      timeLeft: GAME_DURATION,
      targets: [generateTarget()],
      isGameRunning: true,
    });
  };

  const handleTargetClick = (targetId: number) => {
    if (!gameState.isGameRunning) return;

    setGameState((prev) => ({
      ...prev,
      score: prev.score + 1,
      targets: [...prev.targets.filter((t) => t.id !== targetId), generateTarget()],
    }));
  };

  useEffect(() => {
    if (!gameState.isGameRunning) return;

    const timer = setInterval(() => {
      setGameState((prev) => {
        if (prev.timeLeft <= 0) {
          clearInterval(timer);
          return { ...prev, isGameRunning: false };
        }
        return { ...prev, timeLeft: prev.timeLeft - 1 };
      });
    }, 1000);

    const targetSpawner = setInterval(() => {
      setGameState((prev) => ({
        ...prev,
        targets: [...prev.targets, generateTarget()].slice(-5), // Keep max 5 targets
      }));
    }, TARGET_SPAWN_INTERVAL);

    return () => {
      clearInterval(timer);
      clearInterval(targetSpawner);
    };
  }, [gameState.isGameRunning, generateTarget]);

  return (
    <div className="game-container">
      <div className="game-hud">
        <div className="score">Score: {gameState.score}</div>
        <div className="timer">Time: {gameState.timeLeft}s</div>
      </div>
      
      {!gameState.isGameRunning && (
        <button className="start-button" onClick={startGame}>
          {gameState.timeLeft === GAME_DURATION ? 'Start Game' : 'Play Again'}
        </button>
      )}

      {gameState.targets.map((target) => (
        <div
          key={target.id}
          className="target"
          style={{
            width: target.size,
            height: target.size,
            left: target.x,
            top: target.y,
          }}
          onClick={() => handleTargetClick(target.id)}
        />
      ))}
    </div>
  );
};

export default Game;