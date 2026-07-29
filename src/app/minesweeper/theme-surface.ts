import { InjectionToken } from '@angular/core';
import type { Theme } from './types';

export interface ThemeSurface {
  apply(theme: Theme): void;
}

export const THEME_SURFACE = new InjectionToken<ThemeSurface>('THEME_SURFACE');

export class DocumentThemeSurface implements ThemeSurface {
  apply(theme: Theme): void {
    if (theme === 'light') {
      document.documentElement.dataset['theme'] = 'light';
      return;
    }
    delete document.documentElement.dataset['theme'];
  }
}

export class NoopThemeSurface implements ThemeSurface {
  apply(_theme: Theme): void {
    // tests / non-DOM hosts
  }
}
