import { computed, DestroyRef, inject, Service, signal } from '@angular/core';
import { DIFFICULTIES, TIMER_TICK_MS } from './constants';
import {
  chordCell,
  createGame,
  getCurrentElapsedSeconds,
  pauseGame,
  resumeGame,
  revealCell,
  toggleFlag,
} from './functions';
import type { GameState, RevealResult, RunStats } from './models';
import {
  formatMines,
  formatTime,
  getBestCopy,
  getBestMeterPercent,
  getMinesRemaining,
  getSafeRemaining,
  getStatusDetail,
  isTerminalStatus,
} from './presentation/functions';
import {
  getRunStatsForDifficulty,
  incrementRunStat,
  readBestTimes,
  readRunStats,
  readTheme,
  writeBestTime,
  writeTheme,
} from './storage/functions';
import type { DifficultyKey, Theme } from './types';

@Service()
export class GameSession {
  readonly #destroyRef = inject(DestroyRef);
  readonly #storage = globalThis.localStorage;

  readonly #game = signal<GameState>(createGame('beginner'));
  readonly #flagMode = signal(false);
  readonly #announcement = signal('');
  readonly #now = signal(Date.now());
  readonly #bestTimes = signal(readBestTimes(this.#storage));
  readonly #runStats = signal(readRunStats(this.#storage));
  readonly #theme = signal<Theme>(readTheme(this.#storage) ?? 'dark');

  #timerId: number | null = null;

  readonly game = this.#game.asReadonly();
  readonly flagMode = this.#flagMode.asReadonly();
  readonly announcement = this.#announcement.asReadonly();
  readonly theme = this.#theme.asReadonly();

  readonly difficulty = computed(() => this.#game().difficulty);
  readonly status = computed(() => this.#game().status);
  readonly statusDetail = computed(() => getStatusDetail(this.status()));
  readonly minesRemainingLabel = computed(() => formatMines(getMinesRemaining(this.#game())));
  readonly elapsedLabel = computed(() =>
    formatTime(getCurrentElapsedSeconds(this.#game(), this.#now())),
  );
  readonly safeRemaining = computed(() => getSafeRemaining(this.#game()));
  readonly isWon = computed(() => this.status() === 'won');
  readonly isPaused = computed(() => this.status() === 'paused');
  readonly pauseEnabled = computed(
    () => this.status() === 'playing' || this.status() === 'paused',
  );
  readonly currentRunStats = computed<RunStats>(() =>
    getRunStatsForDifficulty(this.#runStats(), this.difficulty()),
  );
  readonly bestTime = computed(() => this.#bestTimes()[this.difficulty()]);
  readonly bestTimeLabel = computed(() => {
    const bestTime = this.bestTime();
    return bestTime === undefined ? '—:——' : formatTime(bestTime);
  });
  readonly bestCopy = computed(() => getBestCopy(this.difficulty(), this.bestTime()));
  readonly bestMeterPercent = computed(() => getBestMeterPercent(this.bestTime()));
  readonly difficulties = DIFFICULTIES;

  constructor() {
    this.#applyTheme(this.#theme());
    this.#destroyRef.onDestroy(() => this.#stopTimer());
  }

  reset(nextDifficulty: DifficultyKey = this.difficulty()): void {
    this.#stopTimer();
    this.#game.set(createGame(nextDifficulty));
    this.#flagMode.set(false);
    this.#now.set(Date.now());
    this.#announce(`${DIFFICULTIES[nextDifficulty].label} game ready.`);
  }

  setDifficulty(difficulty: DifficultyKey): void {
    if (difficulty === this.difficulty()) {
      this.reset(difficulty);
      return;
    }
    this.reset(difficulty);
  }

  toggleFlagMode(): void {
    this.#flagMode.update((flagMode) => !flagMode);
    this.#announce(this.#flagMode() ? 'Flag mode on.' : 'Flag mode off.');
  }

  togglePause(): void {
    const game = this.#game();
    if (game.status === 'paused') {
      this.#game.set(resumeGame(game));
      this.#startTimer();
      return;
    }
    if (game.status === 'playing') {
      this.#game.set(pauseGame(game));
      this.#stopTimer();
    }
  }

  toggleTheme(): void {
    const nextTheme: Theme = this.#theme() === 'light' ? 'dark' : 'light';
    this.#theme.set(nextTheme);
    writeTheme(this.#storage, nextTheme);
    this.#applyTheme(nextTheme);
  }

  handlePrimaryAction(index: number): void {
    const game = this.#game();
    if (isTerminalStatus(game.status) || game.status === 'paused') {
      return;
    }
    if (this.#flagMode()) {
      this.flag(index);
      return;
    }
    const cell = game.cells[index];
    if (cell?.isRevealed) {
      this.#applyRevealResult(chordCell(game, index));
      return;
    }
    this.reveal(index);
  }

  reveal(index: number): void {
    const game = this.#game();
    if (isTerminalStatus(game.status) || game.status === 'paused') {
      return;
    }
    const result = revealCell(game, index);
    if (result.state === game && result.revealedIndices.length === 0) {
      return;
    }
    this.#applyRevealResult(result, game.status === 'ready');
  }

  flag(index: number): void {
    const game = this.#game();
    const nextGame = toggleFlag(game, index);
    if (nextGame === game) {
      return;
    }
    this.#game.set(nextGame);
    this.#announce(nextGame.cells[index]?.isFlagged ? 'Tile flagged.' : 'Flag removed.');
  }

  #applyRevealResult(result: RevealResult, startedFromReady = false): void {
    const previous = this.#game();
    this.#game.set(result.state);

    if (startedFromReady && result.state.status === 'playing') {
      this.#recordStat('played');
      this.#startTimer();
    } else if (previous.status === 'ready' && result.state.status === 'playing') {
      this.#recordStat('played');
      this.#startTimer();
    }

    if (result.state.status === 'won') {
      this.#finishWon(result.state);
      return;
    }
    if (result.state.status === 'lost') {
      this.#finishLost();
      return;
    }
    if (result.revealedIndices.length > 1) {
      this.#announce(`${result.revealedIndices.length} safe tiles revealed.`);
    }
  }

  #finishWon(game: GameState): void {
    this.#stopTimer();
    this.#recordStat('wins');
    const nextBestTimes = writeBestTime(
      this.#storage,
      this.#bestTimes(),
      game.difficulty,
      game.elapsedSeconds,
    );
    const isNewBest = nextBestTimes !== this.#bestTimes();
    this.#bestTimes.set(nextBestTimes);
    this.#announce(
      isNewBest
        ? `Board cleared in ${formatTime(game.elapsedSeconds)}. New best time.`
        : `Board cleared in ${formatTime(game.elapsedSeconds)}.`,
    );
  }

  #finishLost(): void {
    this.#stopTimer();
    this.#recordStat('losses');
    this.#announce('Mine detonated. The board is revealed.');
  }

  #recordStat(stat: 'played' | 'wins' | 'losses'): void {
    this.#runStats.set(
      incrementRunStat(this.#storage, this.#runStats(), this.difficulty(), stat),
    );
  }

  #startTimer(): void {
    this.#stopTimer();
    this.#now.set(Date.now());
    this.#timerId = window.setInterval(() => {
      this.#now.set(Date.now());
    }, TIMER_TICK_MS);
  }

  #stopTimer(): void {
    if (this.#timerId === null) {
      return;
    }
    window.clearInterval(this.#timerId);
    this.#timerId = null;
  }

  #announce(message: string): void {
    this.#announcement.set(message);
  }

  #applyTheme(theme: Theme): void {
    if (theme === 'light') {
      document.documentElement.dataset['theme'] = 'light';
      return;
    }
    delete document.documentElement.dataset['theme'];
  }
}
