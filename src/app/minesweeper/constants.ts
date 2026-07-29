import type { Difficulty, StatusDetail } from './models';
import type { DifficultyKey, GameStatus } from './types';

export const DIFFICULTIES = {
  beginner: { label: 'Beginner', rows: 9, columns: 9, mines: 10 },
  intermediate: { label: 'Intermediate', rows: 16, columns: 16, mines: 40 },
  expert: { label: 'Expert', rows: 16, columns: 30, mines: 99 },
} as const satisfies Record<DifficultyKey, Difficulty>;

export const NEIGHBOR_OFFSETS: ReadonlyArray<readonly [number, number]> = ([-1, 0, 1] as const)
  .flatMap((rowOffset) => ([-1, 0, 1] as const).map((colOffset) => [rowOffset, colOffset] as const))
  .filter(([rowOffset, colOffset]) => rowOffset !== 0 || colOffset !== 0);

export const STATUS_DETAILS: Record<GameStatus, StatusDetail> = {
  ready: {
    label: 'Ready',
    message: 'Click any tile to begin — your first move is always safe.',
  },
  playing: {
    label: 'In play',
    message: 'Read the clues. Trust the pattern.',
  },
  paused: {
    label: 'Paused',
    message: 'Your board is waiting whenever you are.',
  },
  won: {
    label: 'Cleared',
    message: 'Beautiful work. Every safe tile is yours.',
  },
  lost: {
    label: 'Detonated',
    message: 'The field got you this time. Reset and run it back.',
  },
};

export const LONG_PRESS_MS = 450;
export const CLICK_SUPPRESSION_RESET_MS = 500;
export const TIMER_TICK_MS = 250;
export const BEST_METER_MIN_PERCENT = 12;
export const BEST_METER_TIME_SCALE = 3;
