import { Component, OnInit } from '@angular/core';
import { DataService } from '../../core/services/data.service';
import { Chart } from 'chart.js/auto';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-finance',
  templateUrl: './finance.component.html',
  styleUrls: ['./finance.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class FinanceComponent implements OnInit {
  salesData: any[] = []; // Full, unfiltered data

  monthlySalesChart: any;
  productSalesChart: any;

  // Summary Tile properties
  totalSalesINR: number = 0;
  totalSalesEUR: number = 0;
  totalSalesUSD: number = 0;
  totalOrders: number = 0;

  constructor(private dataService: DataService) {}

  ngOnInit() {
    this.loadSalesData();
  }

  loadSalesData() {
    this.dataService.getOrders().subscribe((response: any) => {
      // Store the full dataset
      this.salesData = Array.isArray(response) ? response : response.data || [];
      console.log('API Response:', response);
      console.log('Full salesData:', this.salesData);

      // Use full data directly for charts and tiles
      this.calculateSummaryTiles(this.salesData); // Pass full data

      if (this.salesData.length > 0) {
        this.createMonthlySalesChart(this.salesData); // Pass full data
        this.createProductSalesChart(this.salesData); // Pass full data
      } else {
        console.log('salesData is empty, not creating charts.');
         // Also clear charts if no data
        if (this.monthlySalesChart) { this.monthlySalesChart.destroy(); this.monthlySalesChart = null; }
        if (this.productSalesChart) { this.productSalesChart.destroy(); this.productSalesChart = null; }
      }
    });
  }

  // Method to calculate summary values for tiles (modified to accept data)
  calculateSummaryTiles(data: any[]) {
    this.totalSalesINR = 0;
    this.totalSalesEUR = 0;
    this.totalSalesUSD = 0;
    this.totalOrders = 0;

    const uniqueOrderNumbers = new Set<string>();

    data.forEach(item => {
      const orderNetValue = parseFloat(item.NETWR);
      const currency = item.WAERK;
      const orderNumber = item.VBELN;

      // Sum sales by currency (only for valid numbers > 0)
      if (!isNaN(orderNetValue) && orderNetValue > 0) {
        switch (currency) {
          case 'INR':
            this.totalSalesINR += orderNetValue;
            break;
          case 'EUR':
            this.totalSalesEUR += orderNetValue;
            break;
          case 'USD':
            this.totalSalesUSD += orderNetValue;
            break;
           // Add other currencies if needed
        }
      }

      // Count unique order numbers
      if (orderNumber) {
        uniqueOrderNumbers.add(orderNumber);
      }
    });

    this.totalOrders = uniqueOrderNumbers.size;

    console.log('Summary Tiles - Total Sales INR:', this.totalSalesINR);
    console.log('Summary Tiles - Total Sales EUR:', this.totalSalesEUR);
    console.log('Summary Tiles - Total Sales USD:', this.totalSalesUSD);
    console.log('Summary Tiles - Total Orders:', this.totalOrders);
  }

  // Modified to accept data array as parameter
  createMonthlySalesChart(data: any[]) {
    const monthlyData = this.processMonthlyData(data); // Use provided data
    const ctx = document.getElementById('monthlySalesChart') as HTMLCanvasElement;
    
    if (!ctx) {
      console.error('Monthly sales chart canvas element not found!');
      return;
    }

    if (this.monthlySalesChart) {
      this.monthlySalesChart.destroy();
    }

    this.monthlySalesChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: monthlyData.labels,
        datasets: [{
          label: 'Daily Sales', 
          data: monthlyData.values,
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Daily Sales Overview'
          }
        },
         scales: { 
          y: {
            beginAtZero: true,
            title: {
               display: true,
               text: 'Total Sales'
            }
          },
          x: {
             title: {
               display: true,
               text: 'Date'
             }
          }
        }
      }
    });
  }

   // Modified to accept data array as parameter
  createProductSalesChart(data: any[]) {
    const productData = this.processProductData(data); // Use provided data
    const ctx = document.getElementById('productSalesChart') as HTMLCanvasElement;
    
    if (!ctx) {
       console.error('Product sales chart canvas element not found!');
       return;
    }

    if (this.productSalesChart) {
      this.productSalesChart.destroy();
    }

    this.productSalesChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: productData.labels,
        datasets: [{
          label: 'Sales Count by Product', 
          data: productData.values,
          backgroundColor: 'rgba(54, 162, 235, 0.5)'
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Sales Count by Product' 
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Number of Sales'
            }
          }
        }
      }
    });
  }

  private processMonthlyData(data: any[]) {
    const dailyTotals = new Map<string, number>();
    
    console.log('Processing daily sales data...');
    data.forEach(order => {
      const orderDateString = order.ERDAT;
      const orderTotal = parseFloat(order.NETWR);
      
      console.log(`Order: Date=${order.ERDAT}, NetValue=${order.NETWR}, OrderTotal=${orderTotal}`);

      if (orderDateString && !isNaN(orderTotal) && orderTotal > 0) {
         dailyTotals.set(orderDateString, 
           (dailyTotals.get(orderDateString) || 0) + orderTotal);
      }
    });

    console.log('Daily Totals:', dailyTotals);

    const sortedLabels = Array.from(dailyTotals.keys()).sort();
    const sortedValues = sortedLabels.map(label => dailyTotals.get(label)!);

    return {
      labels: sortedLabels,
      values: sortedValues
    };
  }

   private processProductData(data: any[]) {
    const productCounts = new Map<string, number>();
    
    console.log('Processing product data (count)...');
    data.forEach(item => {
      const productText = item.ARKTX;

      if (productText) {
         productCounts.set(productText, 
           (productCounts.get(productText) || 0) + 1);
      }
    });

    console.log('Product Counts:', productCounts);

    const sortedLabels = Array.from(productCounts.keys()).sort();
    const sortedValues = sortedLabels.map(label => productCounts.get(label)!);

    return {
      labels: sortedLabels,
      values: sortedValues
    };
  }
} 