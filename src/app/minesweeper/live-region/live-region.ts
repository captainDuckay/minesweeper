import { Component, input } from '@angular/core';

@Component({
  selector: 'mine-live-region',
  templateUrl: './live-region.html',
  styleUrl: './live-region.css',
})
export class LiveRegion {
  readonly message = input.required<string>();
}
