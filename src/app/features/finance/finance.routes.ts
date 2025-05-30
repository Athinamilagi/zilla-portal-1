import { Routes } from '@angular/router';

export const FINANCE_ROUTES: Routes = [
  { path: '', redirectTo: 'invoices', pathMatch: 'full' },
  {
    path: 'invoices',
    children: [
      {
        path: '',
        loadComponent: () => import('./invoices/invoices.component').then(m => m.InvoicesComponent)
      },
      {
        path: ':id',
        loadComponent: () => import('./invoices/invoice-detail.component').then(m => m.InvoiceDetailComponent)
      }
    ]
  },
  {
    path: 'payments',
    loadComponent: () => import('./payments/payments.component').then(m => m.PaymentsComponent)
  },
  {
    path: 'credit-memos',
    loadComponent: () => import('./credit-memos/credit-memos.component').then(m => m.CreditMemosComponent)
  },
  {
    path: 'debit-memos',
    loadComponent: () => import('./debit-memos/debit-memos.component').then(m => m.DebitMemosComponent)
  }
]; 