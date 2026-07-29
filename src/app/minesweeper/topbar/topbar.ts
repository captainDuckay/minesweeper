import { Component, input, output } from '@angular/core';
import type { Theme } from '../types';

@Component({
  selector: 'mine-topbar',
  templateUrl: './topbar.html',
  styleUrl: './topbar.css',
})
export class Topbar {
  readonly theme = input.required<Theme>();
  readonly themeToggle = output<void>();

  protected onToggleTheme(): void {
    this.themeToggle.emit();
  }
}
