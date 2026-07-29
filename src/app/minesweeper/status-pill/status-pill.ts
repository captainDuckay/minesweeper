import { Component, input } from '@angular/core';
import type { GameStatus } from '../types';

@Component({
  selector: 'mine-status-pill',
  templateUrl: './status-pill.html',
  styleUrl: './status-pill.css',
  host: {
    class: 'status-pill',
    role: 'status',
    'aria-live': 'polite',
    '[attr.data-status]': 'status()',
  },
})
export class StatusPill {
  readonly status = input.required<GameStatus>();
  readonly label = input.required<string>();
}
