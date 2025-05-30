import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../../core/services/data.service';
import { FormsModule } from '@angular/forms';

interface CreditMemo {
  id: string;
  date: string;
  amount: number;
  reference: string;
  description: string;
  status: string;
  currency: string;
}

@Component({
  selector: 'app-credit-memos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="credit-memos-container">
      <div class="header">
        <h2>💰 Credit Memos</h2>
        <div class="search-container">
          <input 
            type="text" 
            [(ngModel)]="searchTerm" 
            (input)="applyFilter()" 
            placeholder="Search by ID, reference or description..." 
            class="search-input"
          />
        </div>
      </div>

      <div class="loading-container" *ngIf="loading">
        <div class="loading-spinner"></div>
        <p>Loading credit memos...</p>
      </div>

      <div class="error-container" *ngIf="error">
        <p class="error-message">{{ error }}</p>
        <button (click)="loadCreditMemos()" class="retry-button">Retry</button>
      </div>

      <div class="credit-memos-grid" *ngIf="!loading && !error">
        <div class="credit-memo-card" *ngFor="let memo of filteredMemos">
          <div class="memo-header">
            <span class="memo-id">Document No: {{ memo.id }}</span>
            <span class="memo-date">{{ formatDate(memo.date) }}</span>
          </div>
          <div class="memo-body">
            <div class="memo-detail">
              <label>Amount:</label>
              <span class="amount credit">{{ formatAmount(memo.amount, memo.currency) }}</span>
            </div>
            <div class="memo-detail">
              <label>Reference:</label>
              <span>{{ memo.reference }}</span>
            </div>
            <div class="memo-detail">
              <label>Description:</label>
              <p class="description">{{ memo.description || 'No description available' }}</p>
            </div>
          </div>
          <div class="memo-footer">
            <span class="status-badge" [class]="'status-' + (memo.status || 'pending').toLowerCase()">
              {{ memo.status || 'Pending' }}
            </span>
          </div>
        </div>
      </div>

      <div class="no-data" *ngIf="!loading && !error && filteredMemos.length === 0">
        <p>No credit memos found</p>
      </div>
    </div>
  `,
  styles: [`
    .credit-memos-container {
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

    .credit-memos-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 1.5rem;
    }

    .credit-memo-card {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
      padding: 1.5rem;
      transition: transform 0.2s, box-shadow 0.2s;
      border-left: 4px solid var(--success-500);
    }

    .credit-memo-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }

    .memo-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 1rem;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid var(--surface-border, #dee2e6);
    }

    .memo-id {
      font-weight: 600;
      color: var(--primary-700);
    }

    .memo-date {
      color: var(--text-secondary);
      font-size: 0.9rem;
    }

    .memo-body {
      margin-bottom: 1rem;
    }

    .memo-detail {
      margin-bottom: 1rem;
    }

    .memo-detail label {
      display: block;
      font-size: 0.8rem;
      color: var(--text-secondary);
      margin-bottom: 0.25rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .amount {
      font-size: 1.2rem;
      font-weight: 600;
    }

    .amount.credit {
      color: var(--success-600);
    }

    .description {
      font-size: 0.9rem;
      color: var(--text-secondary);
      margin: 0;
      line-height: 1.4;
    }

    .memo-footer {
      display: flex;
      justify-content: flex-end;
    }

    .status-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: 500;
      text-transform: capitalize;
    }

    .status-pending {
      background-color: var(--warning-50);
      color: var(--warning-700);
    }

    .status-approved {
      background-color: var(--success-50);
      color: var(--success-700);
    }

    .status-rejected {
      background-color: var(--error-50);
      color: var(--error-700);
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
      border-top: 3px solid var(--success-500);
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
      background-color: var(--success-500);
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 500;
      transition: background-color 0.2s;
    }

    .retry-button:hover {
      background-color: var(--success-600);
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
      .credit-memos-container {
        padding: 1rem;
      }

      .header {
        flex-direction: column;
        gap: 1rem;
      }

      .search-container {
        width: 100%;
      }

      .credit-memos-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class CreditMemosComponent implements OnInit {
  creditMemos: CreditMemo[] = [];
  filteredMemos: CreditMemo[] = [];
  searchTerm: string = '';
  loading: boolean = true;
  error: string | null = null;

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.loadCreditMemos();
  }

  loadCreditMemos(): void {
    this.loading = true;
    this.error = null;

    const customerData = JSON.parse(localStorage.getItem('customer_data') || '{}');
    const customerId = customerData.kunnr;

    if (!customerId) {
      this.error = 'Customer ID not found';
      this.loading = false;
      return;
    }

    this.dataService.getCreditMemos(customerId).subscribe({
      next: (response: any) => {
        if (response && response.success && response.data) {
          this.creditMemos = response.data;
          this.applyFilter();
        } else {
          this.error = 'Invalid response format';
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching credit memos:', err);
        this.error = 'Failed to load credit memos';
        this.loading = false;
      }
    });
  }

  applyFilter(): void {
    if (!this.searchTerm.trim()) {
      this.filteredMemos = [...this.creditMemos];
      return;
    }

    const searchTerm = this.searchTerm.toLowerCase();
    this.filteredMemos = this.creditMemos.filter(memo =>
      memo.id.toLowerCase().includes(searchTerm) ||
      memo.reference.toLowerCase().includes(searchTerm) ||
      memo.description.toLowerCase().includes(searchTerm)
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
      currency: currency || 'INR'
    }).format(amount);
  }
}