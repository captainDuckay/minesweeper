import { Component, input } from '@angular/core';

@Component({
  selector: 'mine-best-card',
  templateUrl: './best-card.html',
  styleUrl: './best-card.css',
})
export class BestCard {
  readonly bestTimeLabel = input.required<string>();
  readonly bestCopy = input.required<string>();
  readonly meterPercent = input.required<number>();
}
