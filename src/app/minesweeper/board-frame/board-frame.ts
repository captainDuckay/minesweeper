import { Component, input } from '@angular/core';
import { Board } from '../board/board';
import { PauseOverlay } from '../pause-overlay/pause-overlay';

@Component({
  selector: 'mine-board-frame',
  imports: [Board, PauseOverlay],
  templateUrl: './board-frame.html',
  styleUrl: './board-frame.css',
})
export class BoardFrame {
  readonly paused = input(false);
}
