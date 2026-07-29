import { InjectionToken } from '@angular/core';
import type { BestTimes, RunStatsByDifficulty } from './models';
import type { DifficultyKey, RunStatKey, Theme } from './types';
import {
  readBestTimes as readBestTimesFromStorage,
  readRunStats as readRunStatsFromStorage,
  readTheme as readThemeFromStorage,
  writeBestTime as writeBestTimeToStorage,
  writeTheme as writeThemeToStorage,
  incrementRunStat as incrementRunStatInStorage,
} from './storage/functions';

export interface PlayerStore {
  readBestTimes(): BestTimes;
  writeBestTime(bestTimes: BestTimes, difficulty: DifficultyKey, time: number): BestTimes;
  readRunStats(): RunStatsByDifficulty;
  incrementRunStat(
    allStats: RunStatsByDifficulty,
    difficulty: DifficultyKey,
    stat: RunStatKey,
  ): RunStatsByDifficulty;
  readTheme(): Theme | null;
  writeTheme(theme: Theme): void;
}

export const PLAYER_STORE = new InjectionToken<PlayerStore>('PLAYER_STORE');

export class LocalStoragePlayerStore implements PlayerStore {
  readonly #storage: Storage;

  constructor(storage: Storage = globalThis.localStorage) {
    this.#storage = storage;
  }

  readBestTimes(): BestTimes {
    return readBestTimesFromStorage(this.#storage);
  }

  writeBestTime(bestTimes: BestTimes, difficulty: DifficultyKey, time: number): BestTimes {
    return writeBestTimeToStorage(this.#storage, bestTimes, difficulty, time);
  }

  readRunStats(): RunStatsByDifficulty {
    return readRunStatsFromStorage(this.#storage);
  }

  incrementRunStat(
    allStats: RunStatsByDifficulty,
    difficulty: DifficultyKey,
    stat: RunStatKey,
  ): RunStatsByDifficulty {
    return incrementRunStatInStorage(this.#storage, allStats, difficulty, stat);
  }

  readTheme(): Theme | null {
    return readThemeFromStorage(this.#storage);
  }

  writeTheme(theme: Theme): void {
    writeThemeToStorage(this.#storage, theme);
  }
}

/** In-memory store for tests; mirrors local persistence rules without I/O. */
export class MemoryPlayerStore implements PlayerStore {
  #bestTimes: BestTimes = {};
  #runStats: RunStatsByDifficulty = {};
  #theme: Theme | null = null;

  readBestTimes(): BestTimes {
    return { ...this.#bestTimes };
  }

  writeBestTime(bestTimes: BestTimes, difficulty: DifficultyKey, time: number): BestTimes {
    const previousBestTime = bestTimes[difficulty];
    if (previousBestTime !== undefined && previousBestTime <= time) {
      return bestTimes;
    }
    this.#bestTimes = { ...bestTimes, [difficulty]: time };
    return this.#bestTimes;
  }

  readRunStats(): RunStatsByDifficulty {
    return structuredClone(this.#runStats);
  }

  incrementRunStat(
    allStats: RunStatsByDifficulty,
    difficulty: DifficultyKey,
    stat: RunStatKey,
  ): RunStatsByDifficulty {
    const current = allStats[difficulty] ?? {};
    const played = current.played ?? 0;
    const wins = current.wins ?? 0;
    const losses = current.losses ?? 0;
    const base = { played, wins, losses };
    const next: RunStatsByDifficulty = {
      ...allStats,
      [difficulty]: {
        ...base,
        [stat]: base[stat] + 1,
      },
    };
    this.#runStats = next;
    return next;
  }

  readTheme(): Theme | null {
    return this.#theme;
  }

  writeTheme(theme: Theme): void {
    this.#theme = theme;
  }
}
