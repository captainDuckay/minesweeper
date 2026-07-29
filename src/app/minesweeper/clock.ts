import { InjectionToken } from '@angular/core';
import { TIMER_TICK_MS } from './constants';

export interface Clock {
  now(): number;
  startTick(onTick: () => void): void;
  stopTick(): void;
}

export const CLOCK = new InjectionToken<Clock>('CLOCK');

export class BrowserClock implements Clock {
  #timerId: number | null = null;

  now(): number {
    return Date.now();
  }

  startTick(onTick: () => void): void {
    this.stopTick();
    onTick();
    this.#timerId = window.setInterval(onTick, TIMER_TICK_MS);
  }

  stopTick(): void {
    if (this.#timerId === null) {
      return;
    }
    window.clearInterval(this.#timerId);
    this.#timerId = null;
  }
}
