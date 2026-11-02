import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ChartOptions } from "../../dashboard.component";
import { ChartDB } from "src/app/fake-data/chartDB";
import { NgApexchartsModule } from "ng-apexcharts";
import { TnStudentService } from "@service/luyenthithpt/tn-student.service";
@Component({
  selector: "app-users-system",
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: "./users-system.component.html",
  styleUrls: ["./users-system.component.css",'../css-common/card-header.scss'],
})
export class UsersSystemComponent implements OnInit {
  chartDB: any;
  totalTasksChart: Partial<ChartOptions>;
  data: number = null;

  constructor(
    private tnstudentService: TnStudentService
  ) {
    this.chartDB = ChartDB;
    const { totalTasksChart } = this.chartDB;

    this.totalTasksChart = totalTasksChart;

    // setTimeout(() => {
    //   this.data = 10000;
    // },2000)
  }
  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void{
    this.tnstudentService.countStudent().subscribe({
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
