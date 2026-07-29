import { Component, input, output } from '@angular/core';
import { Board } from '../board/board';
import { GameControls } from '../game-controls/game-controls';
import { GameStatusBar } from '../game-status-bar/game-status-bar';
import type { GameStatus } from '../types';

@Component({
  selector: 'mine-game-card',
  imports: [GameStatusBar, Board, GameControls],
  templateUrl: './game-card.html',
  styleUrl: './game-card.css',
  host: {
    class: 'game-card',
    '[class.is-won]': 'won()',
  },
})
export class GameCard {
  readonly won = input(false);
  readonly minesLeft = input.required<string>();
  readonly elapsed = input.required<string>();
  readonly status = input.required<GameStatus>();
  readonly statusLabel = input.required<string>();
  readonly statusMessage = input.required<string>();
  readonly paused = input(false);
  readonly flagMode = input(false);
  readonly pauseEnabled = input(false);

  readonly flagModeToggle = output<void>();
  readonly pauseToggle = output<void>();
}
