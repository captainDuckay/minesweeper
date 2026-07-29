import { Component, input } from '@angular/core';

@Component({
  selector: 'mine-info-card-heading',
  templateUrl: './info-card-heading.html',
  styleUrl: './info-card-heading.css',
})
export class InfoCardHeading {
  readonly icon = input.required<string>();
  readonly label = input.required<string>();
  readonly iconVariant = input<'default' | 'numbered'>('default');
  readonly showSparkle = input(false);
}
