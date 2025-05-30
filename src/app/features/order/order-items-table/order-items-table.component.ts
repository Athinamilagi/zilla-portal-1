import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderItem } from '../../../core/services/data.service';

@Component({
  selector: 'app-order-items-table',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="items-card">
      <h3 class="card-title">📋 Order Items</h3>
      <div class="table-container">
        <table class="items-table">
          <thead>
            <tr>
              <th>Item #</th>
              <th>Product</th>
              <th>Description</th>
              <th class="text-right">Quantity</th>
              <th class="text-right">Unit Price</th>
              <th class="text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let item of items">
              <td>{{item.itemNumber}}</td>
              <td>{{item.product}}</td>
              <td>{{item.description}}</td>
              <td class="text-center">{{item.quantity}}</td>
              <td class="text-center">{{formatCurrency(item.unitPrice)}}</td>
              <td class="text-center">{{formatCurrency(item.total)}}</td>
            </tr>
          </tbody>
          <tfoot *ngIf="items.length > 0">
            <tr>
              <td colspan="5" class="text-center font-bold">Total Amount:</td>
              <td class="text-center font-bold">{{formatCurrency(getTotalAmount())}}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .items-card {
      background: white;
      border-radius: 8px;
      padding: 1.5rem;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      margin-bottom: 1.5rem;
    }

    .card-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: #2c3e50;
      margin-bottom: 1rem;
    }

    .table-container {
      overflow-x: auto;
    }

    .items-table {
      width: 100%;
      border-collapse: collapse;
      min-width: 800px;
    }

    .items-table th {
      background-color: #f8fafc;
      padding: 0.75rem 1rem;
      text-align: left;
      font-weight: 600;
      color: #475569;
      border-bottom: 2px solid #e2e8f0;
    }

    .items-table td {
      padding: 0.75rem 1rem;
      border-bottom: 1px solid #e2e8f0;
      color: #1e293b;
    }

    .text-right {
      text-align: right;
    }

    .font-bold {
      font-weight: 600;
    }

    tbody tr:hover {
      background-color: #f8fafc;
    }

    tfoot {
      background-color: #f8fafc;
    }

    tfoot td {
      border-top: 2px solid #e2e8f0;
    }
  `]
})
export class OrderItemsTableComponent {
  @Input() items!: OrderItem[];

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  getTotalAmount(): number {
    return this.items.reduce((sum, item) => sum + item.total, 0);
  }
} 