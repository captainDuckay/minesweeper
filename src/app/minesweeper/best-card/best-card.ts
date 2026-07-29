import { Component, input } from '@angular/core';
import { InfoCardHeading } from '../info-card-heading/info-card-heading';

@Component({
  selector: 'mine-best-card',
  imports: [InfoCardHeading],
  templateUrl: './best-card.html',
  styleUrl: './best-card.css',
})
export class BestCard {
  readonly bestTimeLabel = input.required<string>();
  readonly bestCopy = input.required<string>();
  readonly meterPercent = input.required<number>();
}
