import { Component, input } from '@angular/core';
import { BestCard } from '../best-card/best-card';
import { FieldStatusCard } from '../field-status-card/field-status-card';
import { HowToPlayCard } from '../how-to-play-card/how-to-play-card';
import type { RunStats } from '../models';

@Component({
  selector: 'mine-info-column',
  imports: [BestCard, HowToPlayCard, FieldStatusCard],
  templateUrl: './info-column.html',
  styleUrl: './info-column.css',
})
export class InfoColumn {
  readonly bestTimeLabel = input.required<string>();
  readonly bestCopy = input.required<string>();
  readonly meterPercent = input.required<number>();
  readonly safeRemaining = input.required<number>();
  readonly runStats = input.required<RunStats>();
}
