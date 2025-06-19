import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DataService, Order } from '../../core/services/data.service';
import { OrderSummaryComponent } from './order-summary/order-summary.component';
import { OrderItemsTableComponent } from './order-items-table/order-items-table.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-orders-page',
  standalone: true,
  imports: [CommonModule, FormsModule, OrderSummaryComponent, OrderItemsTableComponent],
  template: `
    <div class="orders-container">
      <div class="header-section">
        <button class="back-btn" (click)="goBack()">
          <span class="material-icons">arrow_back</span>
          Back
        </button>
        <h2 class="page-title">📦 Orders</h2>
      </div>
      <div *ngIf="loading" class="loading">Loading orders...</div>
      <div *ngIf="!loading" class="controls-container">
        <input type="text" [(ngModel)]="searchTerm" (input)="applyFilter()" placeholder="Search orders..." class="search-input" />
        <div class="pagination-info">
          Showing {{startIndex + 1}} to {{endIndex}} of {{filteredOrders.length}} orders
        </div>
      </div>
      <div class="orders-grid" *ngIf="!loading">
        <div class="order-card" *ngFor="let order of paginatedOrders">
          <app-order-summary [order]="order"></app-order-summary>
          <app-order-items-table [items]="order.items"></app-order-items-table>
        </div>
      </div>
      <div class="pagination-controls" *ngIf="!loading && filteredOrders.length > pageSize">
        <button 
          class="pagination-btn" 
          [disabled]="currentPage === 1"
          (click)="changePage(currentPage - 1)">
          Previous
        </button>
        <span class="page-info">Page {{currentPage}} of {{totalPages}}</span>
        <button 
          class="pagination-btn" 
          [disabled]="currentPage === totalPages"
          (click)="changePage(currentPage + 1)">
          Next
        </button>
      </div>
    </div>
  `,
  styles: [
    `.orders-container { padding: 1.5rem; max-width: 1400px; margin: 0 auto; background-color: #f8fafc; min-height: 100vh; }`,
    `.header-section { display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem; }`,
    `.back-btn { display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; background: white; border: 1px solid #cbd5e1; border-radius: 6px; cursor: pointer; color: #1e293b; font-size: 0.9rem; }`,
    `.back-btn:hover { background: #f1f5f9; }`,
    `.page-title { font-size: 1.5rem; font-weight: 600; color: #1e293b; margin: 0; }`,
    `.orders-grid { display: grid; gap: 2rem; }`,
    `.order-card { background: white; border-radius: 12px; padding: 1.5rem; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); }`,
    `.na-text { color: #64748b; font-style: italic; text-align: right; display: inline-block; width: 100%; }`,
    `.items-table td, .items-table th { font-family: 'Segoe UI', 'Roboto', 'monospace', Arial, sans-serif; }`,
    `.search-input { width: 100%; max-width: 350px; padding: 0.5rem 1rem; border-radius: 6px; border: 1px solid #cbd5e1; font-size: 1rem; }`,
    `.loading { text-align: center; color: #64748b; font-size: 1.1rem; margin: 2rem 0; }`,
    `.controls-container { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }`,
    `.pagination-info { color: #64748b; font-size: 0.9rem; }`,
    `.pagination-controls { display: flex; justify-content: center; align-items: center; gap: 1rem; margin-top: 2rem; }`,
    `.pagination-btn { padding: 0.5rem 1rem; border: 1px solid #cbd5e1; background: white; border-radius: 6px; cursor: pointer; color: #1e293b; }`,
    `.pagination-btn:disabled { opacity: 0.5; cursor: not-allowed; }`,
    `.pagination-btn:hover:not(:disabled) { background: #f1f5f9; }`,
    `.page-info { color: #64748b; font-size: 0.9rem; }`
  ]
})
export class OrdersPageComponent implements OnInit {
  orders: any[] = [];
  filteredOrders: any[] = [];
  paginatedOrders: any[] = [];
  searchTerm: string = '';
  loading: boolean = true;
  error: string | null = null;

  // Pagination properties
  currentPage: number = 1;
  pageSize: number = 5;
  totalPages: number = 1;

  get startIndex(): number {
    return (this.currentPage - 1) * this.pageSize;
  }

  get endIndex(): number {
    return Math.min(this.startIndex + this.pageSize, this.filteredOrders.length);
  }

  constructor(private dataService: DataService, private router: Router) {}

  ngOnInit() {
    this.loading = true;
    this.dataService.getOrders().subscribe({
      next: (res: any) => {
        let orders: any[] = [];
        if (Array.isArray(res)) {
          orders = res;
        } else if (res && typeof res === 'object' && 'success' in res && Array.isArray(res.data)) {
          orders = res.data;
        } else if (res && typeof res === 'object' && 'success' in res && res.data) {
          orders = [res.data];
        } else if (res && typeof res === 'object') {
          orders = [res];
        }
        this.orders = this.groupOrdersByVBELN(orders);
        this.applyFilter();
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message || 'Failed to load orders';
        this.loading = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  private removeLeadingZeros(value: string): string {
    if (!value) return '';
    return String(parseInt(value, 10));
  }

  groupOrdersByVBELN(orders: any[]): any[] {
    const grouped: { [key: string]: any } = {};
    for (const item of orders) {
      if (!grouped[item.VBELN]) {
        grouped[item.VBELN] = {
          id: item.VBELN,
          date: item.ERDAT,
          product: item.ARKTX,
          quantity: 'N/A',
          status: 'N/A',
          items: []
        };
      }
      grouped[item.VBELN].items.push({
        itemNumber: this.removeLeadingZeros(item.MATNR),
        product: item.ARKTX,
        description: 'N/A',
        quantity: 'N/A',
        unitPrice: Number(item.NETWR) || 0,
        total: Number(item.NETWR) || 0
      });
    }
    Object.values(grouped).forEach((order: any) => {
      order.product = order.items.map((i: any) => i.product).join(', ');
    });
    return Object.values(grouped);
  }

  changePage(page: number): void {
    this.currentPage = page;
    this.updatePaginatedOrders();
  }

  private updatePaginatedOrders(): void {
    const start = this.startIndex;
    const end = this.endIndex;
    this.paginatedOrders = this.filteredOrders.slice(start, end);
  }

  applyFilter() {
    this.filteredOrders = this.dataService.filterByTerm(
      this.orders,
      this.searchTerm,
      ['id', 'product']
    );
    this.totalPages = Math.ceil(this.filteredOrders.length / this.pageSize);
    this.currentPage = 1; // Reset to first page when filtering
    this.updatePaginatedOrders();
  }

  private transformOrderData(data: any[]): Order[] {
    return data.map(order => ({
      ...order,
      items: order.items.map((item: { MATNR: string }) => ({
        ...item,
        itemNumber: item.MATNR,
        materialNumber: this.removeLeadingZeros(item.MATNR),
        // ... rest of the item mapping
      }))
    }));
  }
} 