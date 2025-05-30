import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { DataService } from '../../core/services/data.service';
import { InvoiceService } from '../../core/services/invoice.service';
import { CommonModule } from '@angular/common';
import { TileComponent } from '../../shared/components/tile/tile.component';
import { CardComponent } from '../../shared/components/card/card.component';

interface CustomerDashboardData {
  CITY: string;
  COUNTRY: string;
  LAND1: string;
  NAME1: string;
  POSTPIN: string;
  STREET: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  standalone: true,
  imports: [CommonModule, TileComponent, CardComponent]
})
export class DashboardComponent implements OnInit {
  customerName: string = '';
  inquiryCount: number = 0;
  orderCount: number = 0;
  deliveryCount: number = 0;
  invoiceCount: number = 0;
  customerData: CustomerDashboardData | null = null;
  
  constructor(
    private authService: AuthService,
    private dataService: DataService,
    private invoiceService: InvoiceService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    console.log('Dashboard initialization started');
    const customerData = localStorage.getItem('customer_data');
    console.log('Customer data from localStorage:', customerData);
    
    this.authService.getCustomerData().subscribe(data => {
      console.log('Customer data from auth service:', data);
      if (data) {
        this.loadSapDashboardData(data.kunnr);
        this.cdr.detectChanges();
      }
    });
    
    this.loadDashboardData();
  }

  loadSapDashboardData(customerId: string): void {
    console.log('Loading SAP dashboard data for customer ID:', customerId);
    this.dataService.getDashboardData(customerId).subscribe(
      (response: any) => {
        console.log('SAP Dashboard response:', response);
        if (response) {
          this.customerData = response;
          this.customerName = response.NAME1;
          this.cdr.detectChanges();
        }
      },
      error => {
        console.error('Error fetching SAP dashboard data:', error);
      }
    );
  }

  loadDashboardData(): void {
    const customerData = JSON.parse(localStorage.getItem('customer_data') || '{}');
    const customerId = customerData.kunnr;

    this.dataService.getInquiries().subscribe((res: any) => {
      if (Array.isArray(res)) {
        this.inquiryCount = res.length;
      } else if (res && typeof res === 'object' && 'success' in res && Array.isArray(res.data)) {
        this.inquiryCount = res.data.length;
      } else {
        this.inquiryCount = 0;
      }
      this.cdr.detectChanges();
    });
    
    this.dataService.getOrders().subscribe(
      (response: any) => {
        if (response && response.success && Array.isArray(response.data)) {
          this.orderCount = response.data.length;
        } else {
          this.orderCount = 0;
        }
        this.cdr.detectChanges();
      },
      error => {
        console.error('Error fetching orders:', error);
        this.orderCount = 0;
        this.cdr.detectChanges();
      }
    );
    
    this.dataService.getDeliveries().subscribe(
      (response: any) => {
        if (response && response.success && Array.isArray(response.data)) {
          this.deliveryCount = response.data.length;
        } else {
          this.deliveryCount = 0;
        }
        this.cdr.detectChanges();
      },
      error => {
        console.error('Error fetching deliveries:', error);
        this.deliveryCount = 0;
        this.cdr.detectChanges();
      }
    );
    
    if (customerId) {
      this.invoiceService.getInvoices(customerId).subscribe(
        (response: any) => {
          if (response && response.success && Array.isArray(response.data)) {
            this.invoiceCount = response.data.length;
          } else {
            this.invoiceCount = 0;
          }
          this.cdr.detectChanges();
        },
        error => {
          console.error('Error fetching invoices:', error);
          this.invoiceCount = 0;
          this.cdr.detectChanges();
        }
      );
    }
  }
  
  navigateTo(route: string): void {
    this.router.navigate([route]);
  }
}