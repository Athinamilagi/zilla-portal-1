import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Delivery } from '../../../core/services/data.service';

@Component({
  selector: 'app-delivery-summary',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="summary-card">
      <h3 class="section-title">📦 Delivery Summary</h3>
      <div class="summary-grid">
        <div class="summary-field">
          <span class="label">🚚 Delivery Number</span>
          <span class="value">{{ delivery.deliveryNumber || 'N/A' }}</span>
        </div>
        <div class="summary-field">
          <span class="label">📅 Delivery Date</span>
          <span class="value">{{ formatDate(delivery.deliveryDate || '') }}</span>
        </div>
        <div class="summary-field">
          <span class="label">🆔 Order Number</span>
          <span class="value">{{ delivery.salesOrder || 'N/A' }}</span>
        </div>
        <div class="summary-field">
          <span class="label">🛳️ Shipping Point</span>
          <span class="value">{{ delivery.shippingPoint || 'N/A' }}</span>
        </div>
        <div class="summary-field">
          <span class="label">📦 Delivery Type</span>
          <span class="value">{{ delivery.deliveryType || 'N/A' }}</span>
        </div>
        <div class="summary-field">
          <span class="label">🧑‍🤝‍🧑 Ship-To Party</span>
          <span class="value">{{ delivery.shipToParty || 'N/A' }}</span>
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

    .section-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: #2c3e50;
      margin-bottom: 1rem;
    }

    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1rem;
    }

    .summary-field {
      margin-bottom: 0.5rem;
    }

    .label {
      display: block;
      font-size: 0.875rem;
      color: #64748b;
      margin-bottom: 0.25rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .value {
      font-size: 1rem;
      color: #1e293b;
      font-weight: 500;
      padding: 0.5rem;
      background: #f8fafc;
      border-radius: 4px;
    }
  `]
})
export class DeliverySummaryComponent {
  @Input() delivery!: Delivery;

  formatDate(dateStr: string): string {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr + 'T00:00:00');
    return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString('en-GB');
  }
} 