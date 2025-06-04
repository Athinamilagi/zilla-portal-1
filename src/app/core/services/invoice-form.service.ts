import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InvoiceFormService {
  private apiUrl = 'http://localhost:3000/api/invoice-form';

  constructor(private http: HttpClient) { }

  getInvoiceForm(customerId: string, salesDocNumber: string): Observable<any> {
    return this.http.get(`${this.apiUrl}`, {
      params: {
        customerId,
        salesDocNumber
      }
    });
  }

  downloadPdf(base64String: string, fileName: string): void {
    // Convert base64 to blob
    const byteCharacters = atob(base64String);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'application/pdf' });

    // Create download link
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
    window.URL.revokeObjectURL(link.href);
  }
} 