import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DeliverySummaryComponent } from './delivery-summary/delivery-summary.component';
import { DeliveryItemsComponent } from './delivery-items/delivery-items.component';
import { DataService, Delivery } from '../../core/services/data.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-deliveries-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DeliverySummaryComponent,
    DeliveryItemsComponent
  ],
  template: `
    <div class="delivery-page">
      <h2 class="page-title">📦 Deliveries</h2>
      <div *ngIf="loading" class="loading">Loading deliveries...</div>
      <input *ngIf="!loading" type="text" [(ngModel)]="searchTerm" (input)="applyFilter()" placeholder="Search deliveries..." class="search-input" />
      <div class="deliveries-container" *ngIf="!loading && filteredDeliveries.length > 0">
        <div class="delivery-card" *ngFor="let delivery of filteredDeliveries">
          <app-delivery-summary [delivery]="delivery"></app-delivery-summary>
          <app-delivery-items [items]="delivery.items"></app-delivery-items>
        </div>
      </div>
      <div class="no-deliveries" *ngIf="!loading && filteredDeliveries.length === 0">
        <p>No deliveries found.</p>
      </div>
    </div>
  `,
  styles: [
    `.delivery-page { padding: 1.5rem; max-width: 1400px; margin: 0 auto; background-color: #f8fafc; min-height: 100vh; }`,
    `.page-title { font-size: 1.875rem; font-weight: 700; color: #1e293b; margin-bottom: 2rem; }`,
    `.deliveries-container { display: grid; gap: 2rem; }`,
    `.delivery-card { background: white; border-radius: 12px; padding: 1.5rem; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); }`,
    `.no-deliveries { text-align: center; padding: 2rem; background: white; border-radius: 8px; color: #64748b; font-size: 1.125rem; }`,
    `.search-input { width: 100%; max-width: 350px; margin-bottom: 1.5rem; padding: 0.5rem 1rem; border-radius: 6px; border: 1px solid #cbd5e1; font-size: 1rem; }`,
    `.loading { text-align: center; color: #64748b; font-size: 1.1rem; margin: 2rem 0; }`
  ]
})
export class DeliveriesPageComponent implements OnInit {
  deliveries: Delivery[] = [];
  filteredDeliveries: Delivery[] = [];
  searchTerm: string = '';
  loading: boolean = true;

  constructor(private dataService: DataService) {}

  ngOnInit() {
    this.dataService.getDeliveries().subscribe((res: any) => {
      // If the response is { data: [...] }, extract the array
      const data = Array.isArray(res) ? res : (Array.isArray(res.data) ? res.data : []);
      console.log('Raw delivery data:', data);
      // Group by VBELN_DELIVERY
      const grouped = data.reduce((acc: any, item: any) => {
        const key = item.VBELN_DELIVERY;
        if (!acc[key]) {
          acc[key] = {
            deliveryNumber: key,
            deliveryDate: item.LFDAT,
            salesOrder: item.VBELN_SO,
            items: []
          };
        }
        acc[key].items.push({
          itemNumber: key,
          materialNumber: item.MATNR,
          description: item.ARKTX,
          quantity: item.LFIMG,
          unit: item.MEINS,
          netValue: item.NETWR,
          currency: item.WAERK
        });
        return acc;
      }, {} as any);
      this.deliveries = Object.values(grouped);
      console.log('Grouped deliveries:', this.deliveries);
      if (this.deliveries.length) {
        console.log('First delivery object:', this.deliveries[0]);
      }
      this.applyFilter();
      this.loading = false;
    });
  }

  applyFilter() {
    // Check the actual keys in the first delivery object
    if (this.deliveries.length) {
      console.log('Keys in first delivery:', Object.keys(this.deliveries[0]));
    }
    this.filteredDeliveries = this.dataService.filterByTerm(
      this.deliveries,
      this.searchTerm,
      ['deliveryNumber', 'salesOrder'] // update these if needed after checking the logs
    );
  }
} 