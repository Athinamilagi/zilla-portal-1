import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DeliveryItem } from '../../../core/services/data.service';

@Component({
  selector: 'app-delivery-items',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="items-card">
      <h3 class="card-title">📋 Delivery Items</h3>
      <div class="table-container">
        <table class="items-table">
          <thead>
            <tr>
              <th>Item #</th>
              <th>Material No</th>
              <th>Description</th>
              <th class="text-center">Qty</th>
              <th>UoM</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let item of items">
              <td>{{item.itemNumber}}</td>
              <td>{{item.materialNumber}}</td>
              <td>{{item.description}}</td>
              <td class="text-center">{{item.quantity}} {{item.unit}}</td>
              <td>{{item.unit}}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .items-card {
      background: white;
      border-radius: 8px;
      padding: 1.5rem;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      margin-bottom: 1.5rem;
    }

    .card-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: #2c3e50;
      margin-bottom: 1rem;
    }

    .table-container {
      overflow-x: auto;
    }

    .items-table {
      width: 100%;
      border-collapse: collapse;
      min-width: 800px;
    }

    .items-table th {
      background-color: #f8fafc;
      padding: 0.75rem 1rem;
      text-align: left;
      font-weight: 600;
      color: #475569;
      border-bottom: 2px solid #e2e8f0;
    }

    .items-table td {
      padding: 0.75rem 1rem;
      border-bottom: 1px solid #e2e8f0;
      color: #1e293b;
    }

    .text-right {
      text-align: right;
    }

    tbody tr:hover {
      background-color: #f8fafc;
    }
  `]
})
export class DeliveryItemsComponent {
  @Input() items!: DeliveryItem[];
} 