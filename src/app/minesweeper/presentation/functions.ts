import {
  BEST_METER_MIN_PERCENT,
  BEST_METER_TIME_SCALE,
  DIFFICULTIES,
  STATUS_DETAILS,
} from '../constants';
import type { Cell, GameState, StatusDetail } from '../models';
import type { DifficultyKey, GameStatus } from '../types';

export const formatTime = (seconds: number): string =>
  `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;

export const formatMines = (count: number): string =>
  String(Math.max(0, count)).padStart(3, '0');

export const getStatusDetail = (status: GameStatus): StatusDetail => STATUS_DETAILS[status];

export const getSafeRemaining = (game: GameState): number =>
  Math.max(0, game.cells.length - game.mineCount - game.revealedCount);

export const getMinesRemaining = (game: GameState): number => game.mineCount - game.flagsCount;

export const getBestMeterPercent = (bestTime: number | undefined): number => {
  if (bestTime === undefined) {
    return 0;
  }
  return Math.max(
    BEST_METER_MIN_PERCENT,
    Math.min(100, 100 - bestTime / BEST_METER_TIME_SCALE),
  );
};

export const getBestCopy = (
  difficulty: DifficultyKey,
  bestTime: number | undefined,
): string =>
  bestTime === undefined
    ? 'Clear a board to set your first record.'
    : `${DIFFICULTIES[difficulty].label} pace. Can you shave off a second?`;

export const getCellLabel = (
  cell: Cell,
  explodedIndex: number | undefined,
): string => {
  if (cell.isRevealed && cell.isMine) {
    return cell.index === explodedIndex ? 'Exploded mine' : 'Mine';
  }
  if (cell.isRevealed) {
    return cell.adjacentMines === 0
      ? 'Empty safe tile'
      : `Safe tile with ${cell.adjacentMines} nearby mine${cell.adjacentMines === 1 ? '' : 's'}`;
  }
  if (cell.isFlagged) {
    return 'Flagged tile';
  }
  return 'Hidden tile';
};

export const getCellClasses = (
  cell: Cell,
  explodedIndex: number | undefined,
  status: GameStatus,
): readonly string[] => {
  const classes = ['cell'];
  if (cell.isRevealed) {
    classes.push('is-revealed');
  }
  if (cell.isFlagged) {
    classes.push('is-flagged');
  }
  if (cell.isMine && cell.isRevealed) {
    classes.push('is-mine');
  }
  if (cell.index === explodedIndex) {
    classes.push('is-exploded');
  }
  if (status === 'lost' && cell.isFlagged && !cell.isMine) {
    classes.push('is-wrong-flag');
  }
  return classes;
};

export const getCellDisplay = (
  cell: Cell,
  explodedIndex: number | undefined,
): string => {
  if (cell.isRevealed && !cell.isMine && cell.adjacentMines > 0) {
    return String(cell.adjacentMines);
  }
  if (cell.isRevealed && cell.isMine && cell.index !== explodedIndex) {
    return '✹';
  }
  return '';
};

export const isTerminalStatus = (status: GameStatus): boolean =>
  status === 'lost' || status === 'won';
