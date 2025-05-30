import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FINANCE_ROUTES } from './finance.routes';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(FINANCE_ROUTES)
  ]
})
export class FinanceModule { } 