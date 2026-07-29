import { Component, input } from '@angular/core';
import { StatBlock } from '../stat-block/stat-block';
import { StatusPill } from '../status-pill/status-pill';
import type { GameStatus } from '../types';

@Component({
  selector: 'mine-game-status-bar',
  imports: [StatBlock, StatusPill],
  templateUrl: './game-status-bar.html',
  styleUrl: './game-status-bar.css',
})
export class GameStatusBar {
  readonly minesLeft = input.required<string>();
  readonly elapsed = input.required<string>();
  readonly status = input.required<GameStatus>();
  readonly statusLabel = input.required<string>();
}
