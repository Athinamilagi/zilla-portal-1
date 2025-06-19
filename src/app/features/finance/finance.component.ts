import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TileComponent } from '../../shared/components/tile/tile.component';
import { CardComponent } from '../../shared/components/card/card.component';

@Component({
  selector: 'app-finance',
  standalone: true,
  imports: [CommonModule, TileComponent, CardComponent],
  template: `
    <div class="finance-container">
      <div class="header-section">
        <button class="back-btn" (click)="goBack()">
          <span class="material-icons">arrow_back</span>
          Back
        </button>
        <h2 class="page-title">💰 Finance</h2>
      </div>
      
      <div class="finance-tiles">
        <div class="tile-wrapper">
          <app-tile 
            title="Invoices" 
            icon="receipt" 
            color="var(--primary-500)" 
            route="/finance/invoices"
            [count]="invoiceCount">
          </app-tile>
        </div>
        
        <div class="tile-wrapper">
          <app-tile 
            title="Payments" 
            icon="payment" 
            color="var(--secondary-500)" 
            route="/finance/payments"
            [count]="paymentCount">
          </app-tile>
        </div>
        
        <div class="tile-wrapper">
          <app-tile 
            title="Credit Memos" 
            icon="credit_card" 
            color="var(--accent-500)" 
            route="/finance/credit-memos"
            [count]="creditMemoCount">
          </app-tile>
        </div>
        
        <div class="tile-wrapper">
          <app-tile 
            title="Debit Memos" 
            icon="account_balance_wallet" 
            color="var(--finance-500)" 
            route="/finance/debit-memos"
            [count]="debitMemoCount">
          </app-tile>
        </div>
      </div>
    </div>
  `,
  styles: [
    `.finance-container { padding: 1.5rem; max-width: 1400px; margin: 0 auto; background-color: #f8fafc; min-height: 100vh; }`,
    `.header-section { display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem; }`,
    `.back-btn { display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; background: white; border: 1px solid #cbd5e1; border-radius: 6px; cursor: pointer; color: #1e293b; font-size: 0.9rem; }`,
    `.back-btn:hover { background: #f1f5f9; }`,
    `.page-title { font-size: 1.5rem; font-weight: 600; color: #1e293b; margin: 0; }`,
    `.finance-tiles { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; }`,
    `.tile-wrapper { min-height: 120px; }`
  ]
})
export class FinanceComponent {
  invoiceCount: number = 0;
  paymentCount: number = 0;
  creditMemoCount: number = 0;
  debitMemoCount: number = 0;

  constructor(private router: Router) {}

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}