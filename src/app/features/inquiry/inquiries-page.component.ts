import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../core/services/data.service';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-inquiries-page',
  standalone: true,
  imports: [CommonModule,FormsModule],
  template: `
    <div class="inquiries-container">
      <h2 class="page-title">🧾 Your Inquiries</h2>
      <input type="text" [(ngModel)]="searchTerm" (input)="applyFilter()" placeholder="Search inquiries..." class="search-input" />
      <div *ngIf="loading" class="loading">Loading inquiries...</div>
      <div *ngIf="error" class="error">{{ error }}</div>
      <div *ngIf="!loading && !error && filteredInquiries.length === 0" class="empty">No inquiries found.</div>
      <div class="inquiries-grid" *ngIf="!loading && !error && filteredInquiries.length > 0">
        <div class="inquiry-card" *ngFor="let inquiry of filteredInquiries">
          <div class="inquiry-header">
            <span class="bill-no">Bill No: #{{ inquiry.VBELN }}</span>
            <span class="date">Date Created: {{ formatDate(inquiry.ERDAT) }}</span>
          </div>
          <div class="item-desc">Product: {{ capitalizeFirst(inquiry.ARKTX) }}</div>
          <div class="amount">
            <span class="currency">₹</span>{{ inquiry.NETWR }}
          </div>
          <div class="meta">
            <span *ngIf="inquiry.ERNAM" class="creator">Created By: {{ inquiry.ERNAM }}</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .inquiries-container {
      padding: 1.5rem;
      max-width: 900px;
      margin: 0 auto;
      background: #f8fafc;
      min-height: 100vh;
    }
    .page-title {
      font-size: 2rem;
      font-weight: 700;
      color: #1e293b;
      margin-bottom: 2rem;
    }
    .loading, .error, .empty {
      text-align: center;
      margin: 2rem 0;
      color: #64748b;
      font-size: 1.1rem;
    }
    .inquiries-grid {
      display: grid;
      gap: 1.5rem;
    }
    .inquiry-card {
      background: #fff;
      border-radius: 10px;
      padding: 1.25rem 1.5rem;
      box-shadow: 0 2px 8px rgba(30, 41, 59, 0.07);
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      position: relative;
    }
    .inquiry-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 1.1rem;
      font-weight: 600;
      color: #334155;
    }
    .bill-no {
      color: #6366f1;
      font-weight: 700;
      font-size: 1.2rem;
    }
    .date {
      color: #64748b;
      font-size: 0.95rem;
    }
    .item-desc {
      font-size: 1.1rem;
      color: #0f172a;
      margin: 0.5rem 0;
      font-weight: 500;
    }
    .amount {
      font-size: 1.15rem;
      color: #059669;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .currency {
      font-size: 1.1rem;
      margin-right: 2px;
    }
    .matnr {
      font-size: 0.9rem;
      color: #64748b;
      margin-left: auto;
      cursor: help;
    }
    .meta {
      font-size: 0.95rem;
      color: #64748b;
      margin-top: 0.2rem;
    }
    .creator {
      background: #e0e7ff;
      color: #3730a3;
      border-radius: 6px;
      padding: 2px 8px;
      font-size: 0.92rem;
    }
    .search-input { width: 100%; max-width: 350px; margin-bottom: 1.5rem; padding: 0.5rem 1rem; border-radius: 6px; border: 1px solid #cbd5e1; font-size: 1rem; }
  `]
})
export class InquiriesPageComponent implements OnInit {
  inquiries: any[] = [];
  filteredInquiries: any[] = [];
  searchTerm: string = '';
  error: string | null = null;
  loading = false;

  constructor(private dataService: DataService) {}

  ngOnInit() {
    this.loading = true;
    this.dataService.getInquiries().subscribe({
      next: (res: any) => {
        console.log('Loaded inquiries:', res);
        if (Array.isArray(res)) {
          this.inquiries = res;
        } else if (res && typeof res === 'object' && 'success' in res && Array.isArray(res.data)) {
          this.inquiries = res.data;
        } else {
          this.inquiries = [];
        }
        this.applyFilter();
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message || 'Failed to load inquiries';
        this.loading = false;
      }
    });
  }

  applyFilter() {
    this.filteredInquiries = this.dataService.filterByTerm(
      this.inquiries,
      this.searchTerm,
      ['VBELN', 'ARKTX', 'ERNAM']
    );
  }

  formatDate(dateStr: string): string | null {
    if (!dateStr) return null;
    const date = new Date(dateStr + 'T00:00:00');
    return isNaN(date.getTime()) ? dateStr : date.toLocaleDateString('en-GB');
  }

  public capitalizeFirst(str: string): string {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }
} 