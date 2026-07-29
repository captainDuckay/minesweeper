import { Component, ElementRef, inject, signal } from '@angular/core';
import {
  CLICK_SUPPRESSION_RESET_MS,
  LONG_PRESS_MS,
} from '../constants';
import { Cell } from '../cell/cell';
import { GameSession } from '../game-session';
import { isTerminalStatus } from '../presentation/functions';

@Component({
  selector: 'mine-board',
  imports: [Cell],
  templateUrl: './board.html',
  styleUrl: './board.css',
  host: {
    role: 'grid',
    '[attr.aria-label]': '"Minesweeper board"',
    '[attr.aria-describedby]': '"board-hint"',
    '[attr.aria-rowcount]': 'session.game().rows',
    '[attr.aria-colcount]': 'session.game().columns',
    '[style.grid-template-columns]': '"repeat(" + session.game().columns + ", 30px)"',
  },
})
export class Board {
  protected readonly session = inject(GameSession);
  readonly #host = inject(ElementRef<HTMLElement>);

  readonly #focusedIndex = signal(0);
  #longPressTimerId: number | null = null;
  #suppressedClickIndex: number | null = null;

  protected onPrimaryAction(index: number): void {
    if (this.#suppressedClickIndex === index) {
      this.#suppressedClickIndex = null;
      return;
    }
    this.session.handlePrimaryAction(index);
  }

  protected onFlag(index: number): void {
    this.session.flag(index);
  }

  protected onPointerDown(event: PointerEvent, index: number): void {
    if (event.pointerType !== 'touch') {
      return;
    }
    this.#clearLongPressTimer();
    this.#longPressTimerId = window.setTimeout(() => {
      this.#longPressTimerId = null;
      this.#suppressedClickIndex = index;
      this.session.flag(index);
    }, LONG_PRESS_MS);
  }

  protected onPointerEnd(event: PointerEvent, index: number): void {
    if (event.pointerType !== 'touch') {
      return;
    }
    this.#clearLongPressTimer();
    if (this.#suppressedClickIndex !== index) {
      return;
    }
    window.setTimeout(() => {
      if (this.#suppressedClickIndex === index) {
        this.#suppressedClickIndex = null;
      }
    }, CLICK_SUPPRESSION_RESET_MS);
  }

  protected onKeydown(event: KeyboardEvent, index: number): void {
    const game = this.session.game();
    if (isTerminalStatus(game.status) || game.status === 'paused') {
      return;
    }

    if (event.key.toLowerCase() === 'f') {
      event.preventDefault();
      this.session.flag(index);
      return;
    }

    const movement: Record<string, readonly [number, number]> = {
      ArrowLeft: [0, -1],
      ArrowRight: [0, 1],
      ArrowUp: [-1, 0],
      ArrowDown: [1, 0],
    };
    const delta = movement[event.key];
    if (delta) {
      event.preventDefault();
      const row = Math.floor(index / game.columns);
      const column = index % game.columns;
      const nextRow = row + delta[0];
      const nextColumn = column + delta[1];
      if (
        nextRow < 0 ||
        nextRow >= game.rows ||
        nextColumn < 0 ||
        nextColumn >= game.columns
      ) {
        return;
      }
      this.#focusCell(nextRow * game.columns + nextColumn);
      return;
    }

    if (event.key === 'Enter' && game.cells[index]?.isRevealed) {
      event.preventDefault();
      this.session.handlePrimaryAction(index);
    }
  }

  protected tabIndexFor(index: number): number {
    const maxIndex = this.session.game().cells.length - 1;
    const focusedIndex = Math.min(this.#focusedIndex(), maxIndex);
    return index === focusedIndex ? 0 : -1;
  }

  #focusCell(index: number): void {
    this.#focusedIndex.set(index);
    const target = this.#host.nativeElement.querySelector(
      `[data-index="${index}"]`,
    ) as HTMLElement | null;
    target?.focus({ preventScroll: true });
  }

  #clearLongPressTimer(): void {
    if (this.#longPressTimerId === null) {
      return;
    }
    window.clearTimeout(this.#longPressTimerId);
    this.#longPressTimerId = null;
  }
}
