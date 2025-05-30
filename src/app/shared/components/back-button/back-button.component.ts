import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-back-button',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  template: `
    <button mat-icon-button class="back-button" (click)="navigateBack()">
      <mat-icon>arrow_back</mat-icon>
    </button>
  `,
  styles: [`
    .back-button {
      position: fixed;
      top: 100px;
      left: 25px;
      z-index: 1000;
      background-color: var(--surface-card);
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .back-button:hover {
      background-color: var(--surface-hover);
    }
  `]
})
export class BackButtonComponent {
  @Input() route: string | string[] = ['..'];

  constructor(private router: Router) {}

  navigateBack(): void {
    if (Array.isArray(this.route)) {
      this.router.navigate(this.route);
    } else {
      this.router.navigate([this.route]);
    }
  }
} 