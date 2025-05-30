import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-finance',
  template: `
    <div class="finance-container">
      <h2>Finance</h2>
      <router-outlet></router-outlet>
    </div>
  `,
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class FinanceComponent {}