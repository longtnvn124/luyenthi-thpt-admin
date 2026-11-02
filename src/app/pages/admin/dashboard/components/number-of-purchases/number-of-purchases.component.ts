import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartOptions } from '../../dashboard.component';
import { ChartDB } from "src/app/fake-data/chartDB";
import { NgApexchartsModule } from 'ng-apexcharts';
import { TnOrderService } from '@service/luyenthithpt/tn-order.service';

@Component({
  selector: 'app-number-of-purchases',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './number-of-purchases.component.html',
  styleUrls: ['./number-of-purchases.component.css','../css-common/card-header.scss']
})
export class NumberOfPurchasesComponent implements OnInit {

  chartDB: any;
  totalTasksChart: Partial<ChartOptions>;
  data: number = null;
  constructor(
    private tnOrderService : TnOrderService
  ) {
    this.chartDB = ChartDB;
    const { totalTasksChart } = this.chartDB;

    this.totalTasksChart = totalTasksChart;
  }
  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void{
    this.tnOrderService.countOrder().subscribe({
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
