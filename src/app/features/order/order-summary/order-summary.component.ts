import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Order } from '../../../core/services/data.service';

@Component({
  selector: 'app-order-summary',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="summary-card">
      <h3 class="card-title">🛍️ Order Summary</h3>
      <div class="summary-grid">
        <div class="field-group">
          <label>🆔 Order ID</label>
          <div class="field-value">{{order.id}}</div>
        </div>
        <div class="field-group">
          <label>📅 Order Date</label>
          <div class="field-value">{{formatDate(order.date)}}</div>
        </div>
        <div class="field-group">
          <label>📦 Product</label>
          <div class="field-value">{{capitalizeFirst(order.product)}}</div>
        </div>
        <div class="field-group">
          <label>📊 Quantity</label>
          <div class="field-value">{{order.quantity}}</div>
        </div>
        <div class="field-group">
          <label>🔄 Status</label>
          <div class="field-value" [ngClass]="{
            'status-confirmed': order.status === 'Confirmed',
            'status-in-process': order.status === 'In Process'
          }">{{order.status}}</div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .summary-card {
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

    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1rem;
    }

    .field-group {
      margin-bottom: 0.5rem;
    }

    label {
      display: block;
      font-size: 0.875rem;
      color: #64748b;
      margin-bottom: 0.25rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .field-value {
      font-size: 1rem;
      color: #1e293b;
      font-weight: 500;
      padding: 0.5rem;
      background: #f8fafc;
      border-radius: 4px;
    }

    .status-confirmed {
      background-color: #dcfce7;
      color: #059669;
    }

    .status-in-process {
      background-color: #fef3c7;
      color: #d97706;
    }
  `]
})
export class OrderSummaryComponent {
  @Input() order!: Order;

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  public capitalizeFirst(str: string): string {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }
} 