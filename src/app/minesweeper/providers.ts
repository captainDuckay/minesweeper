import { type EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { BrowserClock, CLOCK } from './clock';
import { GameSession } from './game-session';
import { PlayerRecord } from './player-record';
import { LocalStoragePlayerStore, PLAYER_STORE } from './player-store';
import { DocumentThemeSurface, THEME_SURFACE } from './theme-surface';

export const provideMinesweeper = (): EnvironmentProviders =>
  makeEnvironmentProviders([
    { provide: CLOCK, useClass: BrowserClock },
    { provide: PLAYER_STORE, useClass: LocalStoragePlayerStore },
    { provide: THEME_SURFACE, useClass: DocumentThemeSurface },
    PlayerRecord,
    GameSession,
  ]);
