import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { DataService } from '../../../core/services/data.service';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, MatMenuModule, MatIconModule, MatButtonModule],
  template: `
    <header class="header">
      <div class="brand">
        <span class="portal-name">Customer Portal</span>
      </div>

      <nav class="nav">
        <a routerLink="/dashboard" routerLinkActive="active">Dashboard</a>
        <a routerLink="/inquiries" routerLinkActive="active">Inquiries</a>
        <a routerLink="/orders" routerLinkActive="active">Orders</a>
        <a routerLink="/deliveries" routerLinkActive="active">Deliveries</a>
        
        <div class="finance-menu">
          <a routerLinkActive="active">Finance</a>
          <div class="finance-dropdown">
            <a routerLink="/finance/credit-memos" routerLinkActive="active">Credit Memos</a>
            <a routerLink="/finance/debit-memos" routerLinkActive="active">Debit Memos</a>
            <a routerLink="/finance/payments" routerLinkActive="active">Payments</a>
            <a routerLink="/finance/invoices" routerLinkActive="active">Invoices</a>
          </div>
        </div>
      </nav>

      <div class="user-info">
        <div class="logo">
          <mat-icon>account_circle</mat-icon>
        </div>
        <span class="portal-name">{{customerName}}</span>
        <button mat-icon-button [matMenuTriggerFor]="userMenu" class="user-menu-trigger">
          <mat-icon>arrow_drop_down</mat-icon>
        </button>
        <mat-menu #userMenu="matMenu">
          <button mat-menu-item (click)="logout()">
            <mat-icon>logout</mat-icon>
            <span>Logout</span>
          </button>
        </mat-menu>
      </div>
    </header>
  `,
  styles: [`
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 2rem;
      background-color: var(--surface-card);
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .logo {
      display: flex;
      align-items: center;
      color: var(--primary-color);
    }

    .portal-name {
      font-size: 1.5rem;
      font-weight: bold;
      color: var(--primary-color);
    }

    .nav {
      display: flex;
      gap: 1.5rem;
      align-items: center;
    }

    .nav a {
      color: var(--text-color);
      text-decoration: none;
      padding: 0.5rem 0;
      position: relative;
    }

    .nav a:hover {
      color: var(--primary-color);
    }

    .nav a.active {
      color: var(--primary-color);
    }

    .nav a.active::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 2px;
      background-color: var(--primary-color);
    }

    .finance-menu {
      position: relative;
      padding: 0.5rem 0;
    }

    .finance-dropdown {
      display: none;
      position: absolute;
      top: 100%;
      left: 0;
      background: white;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
      border-radius: 4px;
      padding: 0.5rem 0;
      min-width: 150px;
      z-index: 1000;
    }

    .finance-menu:hover .finance-dropdown {
      display: flex;
      flex-direction: column;
    }

    .finance-dropdown a {
      padding: 0.5rem 1rem;
      white-space: nowrap;
    }

    .finance-dropdown a:hover {
      background-color: var(--surface-hover);
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .customer-name {
      font-weight: 500;
      color: var(--text-color-secondary);
    }

    .user-menu-trigger {
      padding: 0;
    }

    @media (max-width: 768px) {
      .header {
        flex-direction: column;
        padding: 1rem;
      }

      .nav {
        margin: 1rem 0;
        flex-wrap: wrap;
        justify-content: center;
      }

      .user-info {
        flex-direction: column;
        gap: 0.5rem;
      }

      .finance-dropdown {
        position: static;
        box-shadow: none;
      }
    }
  `]
})
export class HeaderComponent implements OnInit {
  customerName: string = '';

  constructor(
    private authService: AuthService,
    private dataService: DataService
  ) {}

  ngOnInit(): void {
    const customerData = JSON.parse(localStorage.getItem('customer_data') || '{}');
    const customerId = customerData.kunnr;

    if (customerId) {
      this.dataService.getDashboardData(customerId).subscribe(data => {
        if (data && data.NAME1) {
          this.customerName = data.NAME1;
        }
      });
    }
  }

  logout(): void {
    this.authService.logout();
  }
}