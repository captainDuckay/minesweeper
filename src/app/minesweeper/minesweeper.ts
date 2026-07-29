import { Component, inject } from '@angular/core';
import { GameLayout } from './game-layout/game-layout';
import { GameSession } from './game-session';
import { Hero } from './hero/hero';
import { LiveRegion } from './live-region/live-region';
import { SiteFooter } from './site-footer/site-footer';
import { Topbar } from './topbar/topbar';

@Component({
  selector: 'mine-minesweeper',
  imports: [Topbar, Hero, GameLayout, SiteFooter, LiveRegion],
  templateUrl: './minesweeper.html',
  styleUrl: './minesweeper.css',
})
export class Minesweeper {
  protected readonly session = inject(GameSession);
}
