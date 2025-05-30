import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface InvoiceListResponse {
  success: boolean;
  data: {
    invoiceNumber: string;
    date: string;
    amount: number;
    currency: string;
  }[];
}

export interface InvoiceDetailResponse {
  success: boolean;
  data: {
    date: string;
    amount: number;
    currency: string;
    items: {
      MATNR: string;
      ARKTX: string;
      FKIMG: string;
      VRKME: string;
    }[];
  };
}

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  private readonly API_URL = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  getInvoices(customerId: string): Observable<InvoiceListResponse> {
    return this.http.get<InvoiceListResponse>(`${this.API_URL}/invoice`, {
      params: { customerId }
    });
  }

  getInvoiceDetails(invoiceNumber: string): Observable<InvoiceDetailResponse> {
    return this.http.get<InvoiceDetailResponse>(`${this.API_URL}/invoice/${invoiceNumber}`);
  }
} 