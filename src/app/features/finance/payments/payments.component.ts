import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../../core/services/data.service';
import { FormsModule } from '@angular/forms';

interface Payment {
  id: string;
  documentDate: string;
  dueDate: string;
  amount: number;
  currency: string;
  aging: string;
  status: string;
}

@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="payments-container">
      <div class="header">
        <h2>💳 Payments & Aging</h2>
        <div class="search-container">
          <input 
            type="text" 
            [(ngModel)]="searchTerm" 
            (input)="applyFilter()" 
            placeholder="Search by ID or status..." 
            class="search-input"
          />
        </div>
      </div>

      <div class="summary-cards" *ngIf="!loading && !error">
        <div class="summary-card total">
          <span class="label">Total Outstanding</span>
          <span class="value">{{ getTotalAmount() | currency:'EUR' }}</span>
        </div>
        <div class="summary-card upcoming">
          <span class="label">Upcoming</span>
          <span class="value">{{ getCountByStatus('Upcoming') }}</span>
        </div>
        <div class="summary-card due-soon">
          <span class="label">Due Soon</span>
          <span class="value">{{ getCountByStatus('Due Soon') }}</span>
        </div>
        <div class="summary-card overdue">
          <span class="label">Overdue</span>
          <span class="value">{{ getCountByStatus('Overdue') }}</span>
        </div>
      </div>

      <div class="loading-container" *ngIf="loading">
        <div class="loading-spinner"></div>
        <p>Loading payments...</p>
      </div>

      <div class="error-container" *ngIf="error">
        <p class="error-message">{{ error }}</p>
        <button (click)="loadPayments()" class="retry-button">Retry</button>
      </div>

      <div class="payments-grid" *ngIf="!loading && !error">
        <div class="payment-card" *ngFor="let payment of filteredPayments" [class]="'status-' + payment.status.toLowerCase().replace(' ', '-')">
          <div class="payment-header">
            <span class="payment-id">Document No: {{ payment.id }}</span>
            <span class="status-badge" [class]="'status-' + payment.status.toLowerCase().replace(' ', '-')">
              {{ payment.status }}
            </span>
          </div>
          <div class="payment-body">
            <div class="payment-detail">
              <label>Amount:</label>
              <span class="amount">{{ formatAmount(payment.amount, payment.currency) }}</span>
            </div>
            <div class="payment-detail">
              <label>Document Date:</label>
              <span>{{ formatDate(payment.documentDate) }}</span>
            </div>
            <div class="payment-detail">
              <label>Due Date:</label>
              <span>{{ formatDate(payment.dueDate) }}</span>
            </div>
            <div class="payment-detail">
              <label>Aging:</label>
              <span [class]="'aging ' + payment.status.toLowerCase().replace(' ', '-')">{{ payment.aging }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="no-data" *ngIf="!loading && !error && filteredPayments.length === 0">
        <p>No payments found</p>
      </div>
    </div>
  `,
  styles: [`
    .payments-container {
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
      background-color: var(--surface-ground, #f8f9fa);
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      background-color: white;
      padding: 1rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }

    .summary-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .summary-card {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .summary-card .label {
      font-size: 0.9rem;
      color: var(--text-secondary);
      margin-bottom: 0.5rem;
    }

    .summary-card .value {
      font-size: 1.5rem;
      font-weight: 600;
    }

    .summary-card.total .value {
      color: var(--primary-700);
    }

    .summary-card.upcoming .value {
      color: var(--success-600);
    }

    .summary-card.due-soon .value {
      color: var(--warning-600);
    }

    .summary-card.overdue .value {
      color: var(--error-600);
    }

    h2 {
      font-size: 1.5rem;
      color: var(--text-primary);
      margin: 0;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .search-container {
      flex: 0 0 400px;
    }

    .search-input {
      width: 100%;
      padding: 0.75rem 1rem;
      border: 1px solid var(--surface-border, #dee2e6);
      border-radius: 6px;
      font-size: 0.9rem;
      transition: border-color 0.2s;
    }

    .search-input:focus {
      outline: none;
      border-color: var(--primary-400);
      box-shadow: 0 0 0 2px var(--primary-100);
    }

    .payments-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 1.5rem;
    }

    .payment-card {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
      padding: 1.5rem;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .payment-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }

    .payment-card.status-upcoming {
      border-left: 4px solid var(--success-500);
    }

    .payment-card.status-due-soon {
      border-left: 4px solid var(--warning-500);
    }

    .payment-card.status-overdue {
      border-left: 4px solid var(--error-500);
    }

    .payment-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid var(--surface-border, #dee2e6);
    }

    .payment-id {
      font-weight: 600;
      color: var(--primary-700);
    }

    .status-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: 500;
      text-transform: capitalize;
    }

    .status-badge.status-upcoming {
      background-color: var(--success-50);
      color: var(--success-700);
    }

    .status-badge.status-due-soon {
      background-color: var(--warning-50);
      color: var(--warning-700);
    }

    .status-badge.status-overdue {
      background-color: var(--error-50);
      color: var(--error-700);
    }

    .payment-body {
      display: grid;
      gap: 1rem;
    }

    .payment-detail {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .payment-detail label {
      font-size: 0.8rem;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .amount {
      font-size: 1.2rem;
      font-weight: 600;
      color: var(--primary-700);
    }

    .aging {
      font-weight: 500;
    }

    .aging.upcoming {
      color: var(--success-600);
    }

    .aging.due-soon {
      color: var(--warning-600);
    }

    .aging.overdue {
      color: var(--error-600);
    }

    .loading-container {
      text-align: center;
      padding: 3rem;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }

    .loading-spinner {
      border: 3px solid var(--surface-200);
      border-top: 3px solid var(--primary-500);
      border-radius: 50%;
      width: 32px;
      height: 32px;
      animation: spin 1s linear infinite;
      margin: 0 auto 1rem;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .error-container {
      text-align: center;
      padding: 2rem;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }

    .error-message {
      color: var(--error-600);
      margin-bottom: 1rem;
    }

    .retry-button {
      padding: 0.75rem 1.5rem;
      background-color: var(--primary-500);
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 500;
      transition: background-color 0.2s;
    }

    .retry-button:hover {
      background-color: var(--primary-600);
    }

    .no-data {
      text-align: center;
      padding: 3rem;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
      color: var(--text-secondary);
    }

    @media (max-width: 768px) {
      .payments-container {
        padding: 1rem;
      }

      .header {
        flex-direction: column;
        gap: 1rem;
      }

      .search-container {
        width: 100%;
      }

      .payments-grid {
        grid-template-columns: 1fr;
      }

      .summary-cards {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class PaymentsComponent implements OnInit {
  payments: Payment[] = [];
  filteredPayments: Payment[] = [];
  searchTerm: string = '';
  loading: boolean = true;
  error: string | null = null;

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.loadPayments();
  }

  loadPayments(): void {
    this.loading = true;
    this.error = null;

    const customerData = JSON.parse(localStorage.getItem('customer_data') || '{}');
    const customerId = customerData.kunnr;

    if (!customerId) {
      this.error = 'Customer ID not found';
      this.loading = false;
      return;
    }

    this.dataService.getPayments(customerId).subscribe({
      next: (response: any) => {
        if (response && response.success && response.data) {
          this.payments = response.data;
          this.applyFilter();
        } else {
          this.error = 'Invalid response format';
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching payments:', err);
        this.error = 'Failed to load payments';
        this.loading = false;
      }
    });
  }

  applyFilter(): void {
    if (!this.searchTerm.trim()) {
      this.filteredPayments = [...this.payments];
      return;
    }

    const searchTerm = this.searchTerm.toLowerCase();
    this.filteredPayments = this.payments.filter(payment =>
      payment.id.toLowerCase().includes(searchTerm) ||
      payment.status.toLowerCase().includes(searchTerm)
    );
  }

  formatDate(date: string): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  formatAmount(amount: number, currency: string): string {
    if (amount === undefined) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'EUR'
    }).format(amount);
  }

  getTotalAmount(): number {
    return this.payments.reduce((total, payment) => total + payment.amount, 0);
  }

  getCountByStatus(status: string): number {
    return this.payments.filter(payment => payment.status === status).length;
  }
}