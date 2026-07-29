import type { DifficultyKey, GameStatus, RunStatKey } from './types';

export interface Difficulty {
  readonly label: string;
  readonly rows: number;
  readonly columns: number;
  readonly mines: number;
}

export interface Cell {
  readonly index: number;
  readonly isMine: boolean;
  readonly isRevealed: boolean;
  readonly isFlagged: boolean;
  readonly adjacentMines: number;
}

export interface Minefield {
  readonly difficulty: DifficultyKey;
  readonly rows: number;
  readonly columns: number;
  readonly mineCount: number;
  readonly cells: readonly Cell[];
  readonly flagsCount: number;
  readonly revealedCount: number;
  readonly status: GameStatus;
  readonly elapsedSeconds: number;
  readonly startedAt: number | null;
  readonly explodedIndex?: number;
}

export interface RevealResult {
  readonly minefield: Minefield;
  readonly revealedIndices: readonly number[];
  readonly explodedIndex?: number;
}

export interface StatusDetail {
  readonly label: string;
  readonly message: string;
}

export type RunStats = Record<RunStatKey, number>;

export type BestTimes = Partial<Record<DifficultyKey, number>>;

export type RunStatsByDifficulty = Partial<Record<DifficultyKey, Partial<RunStats>>>;
