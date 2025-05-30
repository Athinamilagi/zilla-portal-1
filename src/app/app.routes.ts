import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { LoginComponent } from './features/login/login.component';

export const routes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'inquiries',
        loadComponent: () => import('./features/inquiry/inquiries-page.component').then(m => m.InquiriesPageComponent)
      },
      {
        path: 'orders',
        loadComponent: () => import('./features/order/orders-page.component').then(m => m.OrdersPageComponent)
      },
      {
        path: 'deliveries',
        loadComponent: () => import('./features/delivery/deliveries-page.component').then(m => m.DeliveriesPageComponent)
      },
      {
        path: 'finance',
        loadChildren: () => import('./features/finance/finance.module').then(m => m.FinanceModule)
      }
    ]
  },
  {
    path: 'login',
    component: LoginComponent
  },
  { path: '**', redirectTo: 'dashboard' }
];