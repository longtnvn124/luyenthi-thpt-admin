import { Component, OnInit } from '@angular/core';
import { CommonModule, formatCurrency } from '@angular/common';
import { NgApexchartsModule } from 'ng-apexcharts';
import { ChartDB } from "src/app/fake-data/chartDB";
import { ChartOptions } from '../../dashboard.component';
import { TnOrderService } from '@service/luyenthithpt/tn-order.service';
import { NumberFormatPipe } from 'src/app/pipes/number-format.pipe';
@Component({
  selector: 'app-revenue',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule, NumberFormatPipe],
  templateUrl: './revenue.component.html',
  styleUrls: ['./revenue.component.css','../css-common/card-header.scss']
})
export class RevenueComponent implements OnInit {
  chartDB: any;
  totalTasksChart: Partial<ChartOptions>;
  data: number = null;

  constructor(
    private tnOrderService: TnOrderService
  ) {
    this.chartDB = ChartDB;
    const { totalTasksChart } = this.chartDB;
    this.totalTasksChart = totalTasksChart;
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void{
    this.tnOrderService.statRevenue().subscribe({
      next: (res) => {
        if(res == 0){
          this.data = 0;
        }else if(res){
          this.data = res;
        }
      },
      error: (err) => {
        console.error(err);
        
      }
    }
      
    )
  }
}
