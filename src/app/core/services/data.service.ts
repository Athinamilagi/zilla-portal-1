import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from './auth.service';

export interface DeliveryItem {
  itemNumber: string;
  materialNumber: string;
  description: string;
  quantity: number;
  unit: string;
}

export interface Delivery {
  id: string;
  deliveryNumber: string;
  deliveryDate: string;
  orderNumber: string;
  shippingPoint: string;
  deliveryType: string;
  shipToParty: string;
  plannedGoodsIssueDate: string;
  actualGoodsIssueDate: string;
  deliveryStatus: string;
  billingStatus: string;
  items: DeliveryItem[];
  salesOrder?: string;
}

export interface OrderItem {
  itemNumber: string;
  product: string;
  description: string;
  quantity: string;
  unitPrice: number;
  total: number;
}

export interface Order {
  id: string;
  date: string;
  product: string;
  quantity: string;
  status: string;
  items: OrderItem[];
}

export interface InquiryDetail {
  specificationId: string;
  specification: string;
  requirement: string;
  preferredBrand?: string;
}

export interface Inquiry {
  id: string;
  date: string;
  material: string;
  quantity: string;
  status: string;
  customerName: string;
  expectedDeliveryDate: string;
  details: InquiryDetail[];
  notes?: string;
}

export interface CustomerDashboardData {
  CITY: string;
  COUNTRY: string;
  LAND1: string;
  NAME1: string;
  POSTPIN: string;
  STREET: string;
}

export interface DebitMemo {
  id?: string;
  date?: string;
  amount?: number;
  reference?: string;
  description?: string;
  status?: string;
}

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient, private authService: AuthService) { }

  /**
   * Generic filter function for arrays of objects.
   * @param items Array of objects to filter
   * @param term Search term
   * @param fields Array of field names to search in
   */
  public filterByTerm<T>(items: T[], term: string, fields: (keyof T)[]): T[] {
    if (!term) return items;
    const lowerTerm = term.toLowerCase();
    return items.filter(item =>
      fields.some(field =>
        item[field] && String(item[field]).toLowerCase().includes(lowerTerm)
      )
    );
  }

  getInquiries(): Observable<any[]> {
    const customerData = JSON.parse(localStorage.getItem('customer_data') || '{}');
    const kunnr = customerData.kunnr;
    if (kunnr) {
      return this.http.post<any>('http://localhost:3000/api/inquiry/list', { kunnr }).pipe(
        catchError(() => of([]))
      );
    } else {
      return of([]);
    }
  }

  getOrders(): Observable<any[]> {
    const customerData = JSON.parse(localStorage.getItem('customer_data') || '{}');
    let kunnr = customerData.kunnr;
    if (typeof kunnr === 'number') {
      kunnr = kunnr.toString().padStart(10, '0');
    }
    if (Array.isArray(kunnr)) {
      kunnr = kunnr.join('');
    }
    if (typeof kunnr !== 'string') {
      kunnr = String(kunnr);
    }
    if (kunnr) {
      return this.http.post<any>('http://localhost:3000/api/order/list', { kunnr }).pipe(
        catchError(() => of([]))
      );
    } else {
      return of([]);
    }
  }

  getDeliveries(): Observable<any[]> {
    const customerData = JSON.parse(localStorage.getItem('customer_data') || '{}');
    let kunnr = customerData.kunnr;
    if (typeof kunnr === 'number') {
      kunnr = kunnr.toString().padStart(10, '0');
    }
    if (Array.isArray(kunnr)) {
      kunnr = kunnr.join('');
    }
    if (typeof kunnr !== 'string') {
      kunnr = String(kunnr);
    }
    if (kunnr) {
      return this.http.post<any>('http://localhost:3000/api/delivery/list', { kunnr }).pipe(
        catchError(() => of([]))
      );
    } else {
      return of([]);
    }
  }

  getInvoices(): Observable<any[]> {
    return of([]);
  }

  getPayments(customerId: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/payments/list`, { customerId }).pipe(
      catchError(error => {
        console.error('Error fetching payments:', error);
        return of({ success: false, data: [] });
      })
    );
  }

  getCreditMemos(customerId: string): Observable<any> {
    return this.http.post<any>(`http://localhost:3000/api/credit-memos/list`, { customerId }).pipe(
      catchError(error => {
        console.error('Error fetching credit memos:', error);
        return of({ success: false, data: [] });
      })
    );
  }

  getDebitMemos(customerId: string): Observable<any> {
    return this.http.post<any>(`http://localhost:3000/api/debit-memos/list`, { customerId }).pipe(
      catchError(error => {
        console.error('Error fetching debit memos:', error);
        return of({ success: false, data: [] });
      })
    );
  }

  // Utility method to get a specific item by ID
  getItemById(collection: string, id: string): Observable<any> {
    return of(null);
  }

  getDashboardData(customerId: string): Observable<CustomerDashboardData> {
    console.log('Fetching dashboard data for customer ID:', customerId);
    return this.http.get<CustomerDashboardData>(`http://localhost:3000/api/dashboard-data/${customerId}`).pipe(
      catchError(error => {
        console.error('Error fetching dashboard data:', error);
        return of({
          CITY: '',
          COUNTRY: '',
          LAND1: '',
          NAME1: '',
          POSTPIN: '',
          STREET: ''
        });
      })
    );
  }
}