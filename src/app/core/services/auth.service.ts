import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError, of, map } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

export interface LoginRequest {
  userId: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  kunnr?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());
  private customerData = new BehaviorSubject<any>(null);
  
  // Node.js middleware endpoint
  private readonly API_URL = 'http://localhost:3000/api';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.loadCustomerData();
  }

  login(username: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/login`, { userId: username, password }).pipe(
      tap(response => {
        console.log('Raw response from server:', response);
        if (response.success) {
          const customerData = {
            userId: username,
            kunnr: response.kunnr,
            message: response.message
          };
          localStorage.setItem('customer_data', JSON.stringify(customerData));
          this.isAuthenticatedSubject.next(true);
        }
      }),
      map(response => response),
      catchError(error => {
        console.error('Login error:', error);
        this.isAuthenticatedSubject.next(false);
        return of({ 
          success: false, 
          message: error.message || 'Login failed' 
        });
      })
    );
  }

  logout(): void {
    localStorage.removeItem('customer_data');
    this.isAuthenticatedSubject.next(false);
    this.customerData.next(null);
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    const customerData = localStorage.getItem('customer_data');
    const isLoggedIn = !!customerData;
    this.isAuthenticatedSubject.next(isLoggedIn);
    return isLoggedIn;
  }

  isAuthenticated(): Observable<boolean> {
    this.isLoggedIn();
    return this.isAuthenticatedSubject.asObservable();
  }

  getCustomerData(): Observable<any> {
    const customerData = localStorage.getItem('customer_data');
    return of(customerData ? JSON.parse(customerData) : null);
  }

  private hasToken(): boolean {
    return !!localStorage.getItem('customer_data');
  }

  private loadCustomerData(): void {
    const data = localStorage.getItem('customer_data');
    if (data) {
      this.customerData.next(JSON.parse(data));
    }
  }
}