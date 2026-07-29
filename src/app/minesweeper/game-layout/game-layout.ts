import { Component, inject } from '@angular/core';
import { BoardHint } from '../board-hint/board-hint';
import { DIFFICULTIES } from '../constants';
import { GameCard } from '../game-card/game-card';
import { GameSession } from '../game-session';
import { GameToolbar } from '../game-toolbar/game-toolbar';
import { InfoColumn } from '../info-column/info-column';
import type { DifficultyKey } from '../types';

@Component({
  selector: 'mine-game-layout',
  imports: [GameToolbar, GameCard, BoardHint, InfoColumn],
  templateUrl: './game-layout.html',
  styleUrl: './game-layout.css',
})
export class GameLayout {
  protected readonly session = inject(GameSession);
  protected readonly difficultyEntries = Object.entries(DIFFICULTIES) as [
    DifficultyKey,
    (typeof DIFFICULTIES)[DifficultyKey],
  ][];

  protected setDifficulty(difficulty: DifficultyKey): void {
    this.session.setDifficulty(difficulty);
  }
}
