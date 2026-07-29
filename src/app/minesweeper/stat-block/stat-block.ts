import { Component, input } from '@angular/core';

@Component({
  selector: 'mine-stat-block',
  templateUrl: './stat-block.html',
  styleUrl: './stat-block.css',
  host: {
    class: 'stat-block',
    '[class.stat-block-right]': 'align() === "right"',
  },
})
export class StatBlock {
  readonly label = input.required<string>();
  readonly value = input.required<string>();
  readonly align = input<'default' | 'right'>('default');
}
