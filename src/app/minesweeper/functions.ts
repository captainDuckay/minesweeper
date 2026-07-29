import { DIFFICULTIES, NEIGHBOR_OFFSETS } from './constants';
import type { Cell, GameState, RevealResult } from './models';
import type { DifficultyKey, Random } from './types';

type DifficultyConfig = (typeof DIFFICULTIES)[DifficultyKey];

const getRowAndColumn = (
  index: number,
  columns: number,
): { row: number; column: number } => ({
  row: Math.floor(index / columns),
  column: index % columns,
});

export const getNeighborIndices = (
  index: number,
  rows: number,
  columns: number,
): number[] => {
  const { row, column } = getRowAndColumn(index, columns);
  return NEIGHBOR_OFFSETS.flatMap(([rowOffset, columnOffset]) => {
    const neighborRow = row + rowOffset;
    const neighborColumn = column + columnOffset;
    if (
      neighborRow < 0 ||
      neighborRow >= rows ||
      neighborColumn < 0 ||
      neighborColumn >= columns
    ) {
      return [];
    }
    return [neighborRow * columns + neighborColumn];
  });
};

const createCells = (rows: number, columns: number): Cell[] =>
  Array.from({ length: rows * columns }, (_, index) => ({
    index,
    isMine: false,
    isRevealed: false,
    isFlagged: false,
    adjacentMines: 0,
  }));

export const createGame = (difficulty: DifficultyKey): GameState => {
  const { rows, columns, mines }: DifficultyConfig = DIFFICULTIES[difficulty];
  return {
    difficulty,
    rows,
    columns,
    mineCount: mines,
    cells: createCells(rows, columns),
    flagsCount: 0,
    revealedCount: 0,
    status: 'ready',
    elapsedSeconds: 0,
    startedAt: null,
  };
};

const shuffle = (items: readonly number[], random: Random): number[] => {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [
      shuffled[swapIndex]!,
      shuffled[index]!,
    ] as [number, number];
  }
  return shuffled;
};

const seedCells = (state: GameState, safeIndex: number, random: Random): Cell[] => {
  const protectedIndices = new Set<number>([
    safeIndex,
    ...getNeighborIndices(safeIndex, state.rows, state.columns),
  ]);
  const candidates = state.cells
    .map((cell) => cell.index)
    .filter((index) => !protectedIndices.has(index));
  const mineIndices = new Set<number>(shuffle(candidates, random).slice(0, state.mineCount));
  const cells: Cell[] = state.cells.map((cell) => ({
    ...cell,
    isMine: mineIndices.has(cell.index),
  }));
  return cells.map((cell) => {
    if (cell.isMine) {
      return cell;
    }
    return {
      ...cell,
      adjacentMines: getNeighborIndices(cell.index, state.rows, state.columns).filter(
        (neighborIndex) => cells[neighborIndex]!.isMine,
      ).length,
    };
  });
};

const revealSafeArea = (
  cells: Cell[],
  startIndex: number,
  rows: number,
  columns: number,
): number[] => {
  const revealedIndices: number[] = [];
  const pending: number[] = [startIndex];
  const visited = new Set<number>();

  while (pending.length) {
    const index = pending.pop();
    if (index === undefined || visited.has(index)) {
      continue;
    }
    visited.add(index);

    const cell = cells[index];
    if (!cell || cell.isMine || cell.isFlagged || cell.isRevealed) {
      continue;
    }

    cells[index] = { ...cell, isRevealed: true };
    revealedIndices.push(index);
    if (cell.adjacentMines !== 0) {
      continue;
    }
    pending.push(...getNeighborIndices(index, rows, columns));
  }

  return revealedIndices;
};

const getElapsedSeconds = (state: GameState, now: number): number =>
  state.startedAt === null
    ? state.elapsedSeconds
    : state.elapsedSeconds + Math.max(0, Math.floor((now - state.startedAt) / 1000));

const finishIfWon = (state: GameState, now: number): GameState => {
  const safeCellCount = state.cells.length - state.mineCount;
  if (state.revealedCount !== safeCellCount) {
    return state;
  }
  return {
    ...state,
    status: 'won',
    elapsedSeconds: getElapsedSeconds(state, now),
    startedAt: null,
    flagsCount: state.mineCount,
    cells: state.cells.map((cell) => (cell.isMine ? { ...cell, isFlagged: true } : cell)),
  };
};

export const startGame = (
  state: GameState,
  firstIndex: number,
  random: Random = Math.random,
  now: number = Date.now(),
): RevealResult => {
  if (state.status !== 'ready' || !state.cells[firstIndex] || state.cells[firstIndex]!.isFlagged) {
    return { state, revealedIndices: [] };
  }

  const cells = seedCells(state, firstIndex, random);
  const revealedIndices = revealSafeArea(cells, firstIndex, state.rows, state.columns);
  const nextState: GameState = {
    ...state,
    cells,
    status: 'playing',
    startedAt: now,
    revealedCount: revealedIndices.length,
  };
  return { state: finishIfWon(nextState, now), revealedIndices };
};

const revealMines = (state: GameState, explodedIndex: number, now: number): GameState => ({
  ...state,
  status: 'lost',
  elapsedSeconds: getElapsedSeconds(state, now),
  startedAt: null,
  explodedIndex,
  cells: state.cells.map((cell) => ({
    ...cell,
    isRevealed: cell.isMine || cell.index === explodedIndex,
    isFlagged: cell.index === explodedIndex ? false : cell.isFlagged,
  })),
});

const revealPlayingCell = (state: GameState, index: number, now: number): RevealResult => {
  const cell = state.cells[index];
  if (!cell || cell.isRevealed || cell.isFlagged || state.status !== 'playing') {
    return { state, revealedIndices: [] };
  }
  if (cell.isMine) {
    return {
      state: revealMines(state, index, now),
      revealedIndices: [index],
      explodedIndex: index,
    };
  }

  const cells = state.cells.map((currentCell) => ({ ...currentCell }));
  const revealedIndices = revealSafeArea(cells, index, state.rows, state.columns);
  const nextState: GameState = {
    ...state,
    cells,
    revealedCount: state.revealedCount + revealedIndices.length,
  };
  return { state: finishIfWon(nextState, now), revealedIndices };
};

export const revealCell = (
  state: GameState,
  index: number,
  random: Random = Math.random,
  now: number = Date.now(),
): RevealResult => {
  if (state.status === 'ready') {
    return startGame(state, index, random, now);
  }
  return revealPlayingCell(state, index, now);
};

export const toggleFlag = (state: GameState, index: number): GameState => {
  const cell = state.cells[index];
  if (
    !cell ||
    cell.isRevealed ||
    state.status === 'lost' ||
    state.status === 'won' ||
    state.status === 'paused'
  ) {
    return state;
  }
  if (!cell.isFlagged && state.flagsCount >= state.mineCount) {
    return state;
  }

  const isFlagged = !cell.isFlagged;
  return {
    ...state,
    status: state.status === 'ready' ? 'ready' : 'playing',
    flagsCount: state.flagsCount + (isFlagged ? 1 : -1),
    cells: state.cells.map((currentCell) =>
      currentCell.index === index ? { ...currentCell, isFlagged } : currentCell,
    ),
  };
};

export const chordCell = (
  state: GameState,
  index: number,
  now: number = Date.now(),
): RevealResult => {
  const cell = state.cells[index];
  if (!cell || !cell.isRevealed || state.status !== 'playing') {
    return { state, revealedIndices: [] };
  }

  const neighbors = getNeighborIndices(index, state.rows, state.columns);
  const flaggedCount = neighbors.filter(
    (neighborIndex) => state.cells[neighborIndex]!.isFlagged,
  ).length;
  if (flaggedCount !== cell.adjacentMines) {
    return { state, revealedIndices: [] };
  }

  const cellsToReveal = neighbors.filter(
    (neighborIndex) =>
      !state.cells[neighborIndex]!.isRevealed && !state.cells[neighborIndex]!.isFlagged,
  );
  const explodedIndex = cellsToReveal.find(
    (neighborIndex) => state.cells[neighborIndex]!.isMine,
  );
  if (explodedIndex !== undefined) {
    return {
      state: revealMines(state, explodedIndex, now),
      revealedIndices: [explodedIndex],
      explodedIndex,
    };
  }

  const cells = state.cells.map((currentCell) => ({ ...currentCell }));
  const revealedIndices = cellsToReveal.flatMap((neighborIndex) =>
    revealSafeArea(cells, neighborIndex, state.rows, state.columns),
  );
  const nextState: GameState = {
    ...state,
    cells,
    revealedCount: state.revealedCount + revealedIndices.length,
  };
  return { state: finishIfWon(nextState, now), revealedIndices };
};

export const pauseGame = (state: GameState, now: number = Date.now()): GameState =>
  state.status !== 'playing'
    ? state
    : {
        ...state,
        status: 'paused',
        elapsedSeconds: getElapsedSeconds(state, now),
        startedAt: null,
      };

export const resumeGame = (state: GameState, now: number = Date.now()): GameState =>
  state.status !== 'paused' ? state : { ...state, status: 'playing', startedAt: now };

export const getCurrentElapsedSeconds = (state: GameState, now: number = Date.now()): number =>
  getElapsedSeconds(state, now);
