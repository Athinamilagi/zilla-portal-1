import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../core/services/data.service';

export interface DeliveryItem {
  itemNumber: string;
  materialNumber: string;
  description: string;
  quantity: string;
  unit: string;
  netValue: string;
  currency: string;
}

export interface Delivery {
  id: string;
  deliveryNumber: string;
  deliveryDate: string;
  orderNumber: string;
  deliveryStatus: string;
  billingStatus: string;
  items: DeliveryItem[];
}

@Component({
  selector: 'app-deliveries-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="deliveries-container">
      <div class="header-section">
        <button class="back-btn" (click)="goBack()">
          <span class="material-icons">arrow_back</span>
          Back
        </button>
        <h2 class="page-title">🚚 Deliveries</h2>
      </div>
      <div *ngIf="loading" class="loading">Loading deliveries...</div>
      <input *ngIf="!loading" type="text" [(ngModel)]="searchTerm" (input)="applyFilter()" placeholder="Search deliveries..." class="search-input" />
      <div class="deliveries-grid" *ngIf="!loading">
        <div class="delivery-card" *ngFor="let delivery of filteredDeliveries">
          <h3>Delivery #: {{ delivery.deliveryNumber }}</h3>
          <p>Date: {{ delivery.deliveryDate || '-' }}</p>
          <p>Order #: {{ delivery.orderNumber || '-' }}</p>
          <p>Status: {{ delivery.deliveryStatus || '-' }}</p>
          <p>Billing Status: {{ delivery.billingStatus || '-' }}</p>
          <table class="items-table">
            <thead>
              <tr>
                <th>Item #</th>
                <th>Material #</th>
                <th>Description</th>
                <th>Qty</th>
                <th>Unit</th>
                <th>Net Value</th>
                <th>Currency</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let item of delivery.items">
                <td>{{ item?.itemNumber || '-' }}</td>
                <td>{{ item?.materialNumber || '-' }}</td>
                <td>{{ item?.description || '-' }}</td>
                <td>{{ item?.quantity || '-' }}</td>
                <td>{{ item?.unit || '-' }}</td>
                <td>{{ item?.netValue || '-' }}</td>
                <td>{{ item?.currency || '-' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [
    `.deliveries-container { padding: 1.5rem; max-width: 1400px; margin: 0 auto; background-color: #f8fafc; min-height: 100vh; }`,
    `.header-section { display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem; }`,
    `.back-btn { display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; background: white; border: 1px solid #cbd5e1; border-radius: 6px; cursor: pointer; color: #1e293b; font-size: 0.9rem; }`,
    `.back-btn:hover { background: #f1f5f9; }`,
    `.page-title { font-size: 1.5rem; font-weight: 600; color: #1e293b; margin: 0; }`,
    `.deliveries-grid { display: grid; gap: 2rem; }`,
    `.delivery-card { background: white; border-radius: 12px; padding: 1.5rem; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); }`,
    `.search-input { width: 100%; max-width: 350px; margin-bottom: 1.5rem; padding: 0.5rem 1rem; border-radius: 6px; border: 1px solid #cbd5e1; font-size: 1rem; }`,
    `.loading { text-align: center; color: #64748b; font-size: 1.1rem; margin: 2rem 0; }`,
    `.items-table { width: 100%; border-collapse: collapse; margin-top: 1rem; }`,
    `.items-table th, .items-table td { border: 1px solid #e2e8f0; padding: 0.5rem; text-align: left; font-size: 0.95rem; }`,
    `.items-table th { background: #f1f5f9; }`
  ]
})
export class DeliveriesPageComponent implements OnInit {
  deliveries: Delivery[] = [];
  filteredDeliveries: Delivery[] = [];
  searchTerm: string = '';
  loading: boolean = true;
  error: string | null = null;

  constructor(private dataService: DataService, private router: Router) {}

  ngOnInit() {
    this.loading = true;
    this.dataService.getDeliveries().subscribe({
      next: (res: any) => {
        let deliveries: any[] = [];
        if (Array.isArray(res)) {
          deliveries = res;
        } else if (res && typeof res === 'object' && 'success' in res && Array.isArray(res.data)) {
          deliveries = res.data;
        } else if (res && typeof res === 'object' && 'success' in res && res.data) {
          deliveries = [res.data];
        } else if (res && typeof res === 'object') {
          deliveries = [res];
        }
        this.deliveries = this.groupDeliveriesByVBELN(deliveries);
        this.applyFilter();
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message || 'Failed to load deliveries';
        this.loading = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  groupDeliveriesByVBELN(deliveries: any[]): Delivery[] {
    const grouped: { [key: string]: Delivery } = {};
    for (const item of deliveries) {
      const key = item.VBELN_DELIVERY;
      if (!grouped[key]) {
        grouped[key] = {
          id: key,
          deliveryNumber: key,
          deliveryDate: item.LFDAT,
          orderNumber: item.VBELN_SO,
          deliveryStatus: item.STATUS,
          billingStatus: item.FKSTK,
          items: []
        };
      }
      grouped[key].items.push({
        itemNumber: item.POSNR,
        materialNumber: item.MATNR,
        description: item.ARKTX,
        quantity: item.LFIMG,
        unit: item.MEINS,
        netValue: item.NETWR,
        currency: item.WAERK
      });
    }
    return Object.values(grouped);
  }

  applyFilter() {
    this.filteredDeliveries = this.deliveries.filter(delivery =>
      delivery.deliveryNumber.includes(this.searchTerm) ||
      delivery.orderNumber.includes(this.searchTerm)
    );
  }
} 