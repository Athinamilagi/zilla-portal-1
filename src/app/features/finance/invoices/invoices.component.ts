import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { InvoiceService, InvoiceListResponse } from '../../../core/services/invoice.service';

interface Invoice {
  invoiceNumber: string;
  date: string;
  amount: number;
  currency: string;
}

@Component({
  selector: 'app-invoices',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    MatTableModule,
    MatSortModule,
    MatProgressSpinnerModule,
    MatCardModule
  ],
  template: `
    <div class="invoices-container">
      <div class="header-section">
        <button class="back-btn" (click)="goBack()">
          <span class="material-icons">arrow_back</span>
          Back
        </button>
        <h2 class="page-title">🧾 Invoices</h2>
      </div>
      <mat-card class="invoice-card">
        <mat-card-header>
          <mat-card-title>Invoices</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="table-container" *ngIf="!isLoading; else loading">
            <table mat-table [dataSource]="invoices" matSort (matSortChange)="sortData($event)" class="invoice-table">
              <!-- Invoice Number Column -->
              <ng-container matColumnDef="invoiceNumber">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Invoice Number</th>
                <td mat-cell *matCellDef="let invoice">{{ invoice.invoiceNumber }}</td>
              </ng-container>

              <!-- Date Column -->
              <ng-container matColumnDef="date">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Date</th>
                <td mat-cell *matCellDef="let invoice">{{ invoice.date | date:'mediumDate' }}</td>
              </ng-container>

              <!-- Amount Column -->
              <ng-container matColumnDef="amount">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Amount</th>
                <td mat-cell *matCellDef="let invoice">
                  {{ invoice.amount | currency:invoice.currency:'symbol':'1.2-2' }}
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns"
                  (click)="viewInvoiceDetails(row.invoiceNumber)"
                  class="invoice-row"></tr>
            </table>
          </div>

          <ng-template #loading>
            <div class="loading-spinner">
              <mat-spinner diameter="50"></mat-spinner>
            </div>
          </ng-template>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .invoice-card {
      margin: 20px;
    }

    .table-container {
      margin-top: 20px;
      overflow-x: auto;
    }

    .invoice-table {
      width: 100%;
    }

    .invoice-row {
      cursor: pointer;
      transition: all 0.2s ease-in-out;
    }

    .invoice-row:hover {
      background-color: var(--surface-hover);
      transform: scale(1.01);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }

    .loading-spinner {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 200px;
    }

    th.mat-sort-header {
      font-weight: bold;
      color: var(--text-color-secondary);
    }

    td.mat-cell {
      padding: 16px 8px;
    }

    .header-section { display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem; }
    .back-btn { display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; background: white; border: 1px solid #cbd5e1; border-radius: 6px; cursor: pointer; color: #1e293b; font-size: 0.9rem; }
    .back-btn:hover { background: #f1f5f9; }
    .page-title { font-size: 1.5rem; font-weight: 600; color: #1e293b; margin: 0; }
  `]
})
export class InvoicesComponent implements OnInit {
  invoices: Invoice[] = [];
  displayedColumns: string[] = ['invoiceNumber', 'date', 'amount'];
  isLoading = true;

  constructor(
    private invoiceService: InvoiceService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadInvoices();
  }

  loadInvoices(): void {
    const customerData = JSON.parse(localStorage.getItem('customer_data') || '{}');
    if (customerData.kunnr) {
      this.invoiceService.getInvoices(customerData.kunnr).subscribe({
        next: (response: InvoiceListResponse) => {
          if (response.success) {
            this.invoices = response.data;
          }
          this.isLoading = false;
        },
        error: (error: Error) => {
          console.error('Error loading invoices:', error);
          this.isLoading = false;
        }
      });
    }
  }

  sortData(sort: Sort): void {
    this.invoices = [...this.invoices].sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'invoiceNumber':
          return this.compare(a.invoiceNumber, b.invoiceNumber, isAsc);
        case 'date':
          return this.compare(a.date, b.date, isAsc);
        case 'amount':
          return this.compare(a.amount, b.amount, isAsc);
        default:
          return 0;
      }
    });
  }

  private compare(a: number | string, b: number | string, isAsc: boolean): number {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  viewInvoiceDetails(invoiceNumber: string): void {
    this.router.navigate(['/finance/invoices', invoiceNumber]);
  }

  goBack(): void {
    this.router.navigate(['/finance']);
  }
}