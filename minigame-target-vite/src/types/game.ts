export interface Target {
  id: number;
  x: number;
  y: number;
  size: number;
}

export interface GameState {
  score: number;
  timeLeft: number;
  targets: Target[];
  isGameRunning: boolean;
}