import { Component } from '@angular/core';
import { Minesweeper } from './minesweeper/minesweeper';

@Component({
  selector: 'mine-root',
  imports: [Minesweeper],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {}
