import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideMinesweeper } from './minesweeper/providers';

export const appConfig: ApplicationConfig = {
  providers: [provideBrowserGlobalErrorListeners(), provideMinesweeper()],
};
