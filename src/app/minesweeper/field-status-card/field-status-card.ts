import { Component, input } from '@angular/core';
import type { RunStats } from '../models';

@Component({
  selector: 'mine-field-status-card',
  templateUrl: './field-status-card.html',
  styleUrl: './field-status-card.css',
})
export class FieldStatusCard {
  readonly safeRemaining = input.required<number>();
  readonly runStats = input.required<RunStats>();
}
