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
import { InvoiceFormService } from '../../../core/services/invoice-form.service';
import { MatSnackBar } from '@angular/material/snack-bar';

interface InvoiceItem {
  POSNR: string;
  MATNR: string;
  ARKTX: string;
  KWMENG: number;
  VRKME: string;
  NETWR: number;
  WAERK: string;
}

interface InvoiceData {
  date: string;
  amount: number;
  currency: string;
  items: InvoiceItem[];
  KUNNR: string;
  VBELN: string;
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
      <mat-card-content>
        <div class="actions-row">
          <button mat-icon-button (click)="goBack()" class="back-button">
            <mat-icon>arrow_back</mat-icon>
          </button>
          <button mat-raised-button color="primary" class="download-button" (click)="downloadInvoiceForm()" [disabled]="isLoading">
            <mat-icon>download</mat-icon>
            Download Invoice Form
          </button>
        </div>

        <h2>Invoice Details</h2>

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
             <div class="summary-item">
              <span class="label">Customer ID:</span>
              <span class="value">{{ invoiceData?.KUNNR }}</span>
            </div>
             <div class="summary-item">
              <span class="label">Invoice Number:</span>
              <span class="value">{{ invoiceData?.VBELN }}</span>
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
              <td mat-cell *matCellDef="let item">{{ item.KWMENG }} {{ item.VRKME }}</td>
            </ng-container>

             <!-- Amount Column -->
            <ng-container matColumnDef="amount">
              <th mat-header-cell *matHeaderCellDef>Amount</th>
              <td mat-cell *matCellDef="let item">{{ item.NETWR | currency:item.WAERK:'symbol':'1.2-2' }}</td>
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
  styles: [
    `
      .invoice-detail-card {
        margin: 20px;
      }

      .actions-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px; /* Space between buttons/title and the summary */
      }

      .mat-card-content h2 {
        margin-top: 0;
        margin-bottom: 20px;
        text-align: left;
      }

      .back-button {
         margin-right: 16px;
      }

      .download-button {
        background-color: #4CAF50 !important; /* Green color with !important */
        color: white !important;
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

       .mat-column-materialNumber {
        width: 150px;
      }

      .mat-column-quantity {
        width: 120px;
        text-align: right;
      }

      .mat-column-amount {
        width: 120px;
        text-align: right;
      }

      .mat-column-description {
        min-width: 300px;
      }
    `,
  ],
})
export class InvoiceDetailComponent implements OnInit {
  invoiceData: InvoiceData | null = null;
  displayedColumns: string[] = ['materialNumber', 'description', 'quantity', 'amount'];
  isLoading = false;
  invoiceNumberFromRoute: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private invoiceService: InvoiceService,
    private invoiceFormService: InvoiceFormService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const invoiceNumber = this.route.snapshot.paramMap.get('id');
    if (invoiceNumber) {
      this.invoiceNumberFromRoute = invoiceNumber; // Store invoice number
      this.loadInvoiceDetails(invoiceNumber);
    }
  }

  loadInvoiceDetails(invoiceNumber: string): void {
    this.isLoading = true;
    this.invoiceService.getInvoiceDetails(invoiceNumber).subscribe({
      next: (response: InvoiceDetailResponse) => {
        if (response.success && response.data) {
          this.invoiceData = response.data;
        }
      },
      error: (error) => {
        console.error('Error loading invoice details:', error);
        this.snackBar.open('Error loading invoice details', 'Close', {
          duration: 3000
        });
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/finance/invoices']);
  }

  downloadInvoiceForm(): void {
    // Retrieve KUNNR from local storage
    const customerDataString = localStorage.getItem('customer_data');
    const salesDocNumber = this.invoiceNumberFromRoute;

    if (!customerDataString || !salesDocNumber) {
      this.snackBar.open('Customer data or Invoice Number is missing.', 'Close', {
        duration: 3000
      });
      return;
    }

    let customerId: string | null = null;
    try {
      const customerData = JSON.parse(customerDataString);
      if (customerData && customerData.kunnr) {
        customerId = customerData.kunnr;
      } else {
         this.snackBar.open('Invalid customer data in local storage.', 'Close', {
            duration: 3000
          });
          return;
      }
    } catch (e) {
       console.error('Error parsing customer data from local storage:', e);
       this.snackBar.open('Error reading customer data.', 'Close', {
          duration: 3000
        });
        return;
    }

    this.isLoading = true;
    this.invoiceFormService.getInvoiceForm(
      customerId!,
      salesDocNumber
    ).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const fileName = `Invoice_${salesDocNumber}.pdf`;
          this.invoiceFormService.downloadPdf(response.data, fileName);
        }
      },
      error: (error) => {
        console.error('Error downloading invoice form:', error);
        this.snackBar.open('Error downloading invoice form', 'Close', {
          duration: 3000
        });
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }
}