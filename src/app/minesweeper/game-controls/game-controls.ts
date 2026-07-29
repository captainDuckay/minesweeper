import { Component, input, output } from '@angular/core';

@Component({
  selector: 'mine-game-controls',
  templateUrl: './game-controls.html',
  styleUrl: './game-controls.css',
})
export class GameControls {
  readonly message = input.required<string>();
  readonly flagMode = input(false);
  readonly paused = input(false);
  readonly pauseEnabled = input(false);

  readonly flagModeToggle = output<void>();
  readonly pauseToggle = output<void>();

  protected onFlagMode(): void {
    this.flagModeToggle.emit();
  }

  protected onPause(): void {
    this.pauseToggle.emit();
  }
}
