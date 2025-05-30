import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { InvoiceService, InvoiceDetailResponse } from '../../../core/services/invoice.service';

interface InvoiceItem {
  MATNR: string;
  ARKTX: string;
  FKIMG: string;
  VRKME: string;
}

@Component({
  selector: 'app-invoice-detail',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  template: `
    <mat-card class="invoice-detail-card">
      <mat-card-header>
        <button mat-icon-button (click)="goBack()" class="back-button">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <mat-card-title>Invoice Details</mat-card-title>
      </mat-card-header>

      <mat-card-content>
        <div *ngIf="!isLoading; else loading">
          <div class="invoice-summary">
            <div class="summary-item">
              <span class="label">Date:</span>
              <span class="value">{{ invoiceData?.date | date:'mediumDate' }}</span>
            </div>
            <div class="summary-item">
              <span class="label">Total Amount:</span>
              <span class="value">{{ invoiceData?.amount | currency:invoiceData?.currency:'symbol':'1.2-2' }}</span>
            </div>
          </div>

          <h3>Items</h3>
          <table mat-table [dataSource]="invoiceData?.items || []" class="items-table">
            <!-- Material Number Column -->
            <ng-container matColumnDef="materialNumber">
              <th mat-header-cell *matHeaderCellDef>Material Number</th>
              <td mat-cell *matCellDef="let item">{{ item.MATNR }}</td>
            </ng-container>

            <!-- Description Column -->
            <ng-container matColumnDef="description">
              <th mat-header-cell *matHeaderCellDef>Description</th>
              <td mat-cell *matCellDef="let item">{{ item.ARKTX }}</td>
            </ng-container>

            <!-- Quantity Column -->
            <ng-container matColumnDef="quantity">
              <th mat-header-cell *matHeaderCellDef>Quantity</th>
              <td mat-cell *matCellDef="let item">{{ item.FKIMG }} {{ item.VRKME }}</td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
          </table>
        </div>

        <ng-template #loading>
          <div class="loading-spinner">
            <mat-spinner diameter="50"></mat-spinner>
          </div>
        </ng-template>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .invoice-detail-card {
      margin: 20px;
    }

    .back-button {
      margin-right: 16px;
    }

    .invoice-summary {
      margin: 20px 0;
      padding: 20px;
      background-color: var(--surface-card);
      border-radius: 4px;
    }

    .summary-item {
      margin-bottom: 10px;
      display: flex;
      gap: 10px;
    }

    .label {
      font-weight: bold;
      color: var(--text-color-secondary);
      min-width: 120px;
    }

    .items-table {
      width: 100%;
      margin-top: 20px;
    }

    .loading-spinner {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 200px;
    }

    th.mat-header-cell {
      font-weight: bold;
      color: var(--text-color-secondary);
    }

    td.mat-cell {
      padding: 16px 8px;
    }
  `]
})
export class InvoiceDetailComponent implements OnInit {
  invoiceData: {
    date: string;
    amount: number;
    currency: string;
    items: InvoiceItem[];
  } | null = null;
  
  displayedColumns: string[] = ['materialNumber', 'description', 'quantity'];
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private invoiceService: InvoiceService
  ) {}

  ngOnInit(): void {
    const invoiceNumber = this.route.snapshot.paramMap.get('id');
    if (invoiceNumber) {
      this.loadInvoiceDetails(invoiceNumber);
    } else {
      this.goBack();
    }
  }

  loadInvoiceDetails(invoiceNumber: string): void {
    this.invoiceService.getInvoiceDetails(invoiceNumber).subscribe({
      next: (response: InvoiceDetailResponse) => {
        if (response.success) {
          this.invoiceData = response.data;
        }
        this.isLoading = false;
      },
      error: (error: Error) => {
        console.error('Error loading invoice details:', error);
        this.isLoading = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/finance/invoices']);
  }
} 