
export interface GameState {
  score: number;
  balls: number;
  multiplier: number;
  isGameOver: boolean;
  isPlaying: boolean;
  highScore: number;
}

export enum SoundType {
  FLIPPER = 'flipper',
  BUMPER = 'bumper',
  WALL = 'wall',
  LAUNCH = 'launch',
  SCORE = 'score',
  GAMEOVER = 'gameover'
}
