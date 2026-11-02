import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartOptions } from '../../dashboard.component';
import { ChartDB } from "src/app/fake-data/chartDB";
import { NgApexchartsModule } from 'ng-apexcharts';
import { TnShiftStudentTestService } from '@service/luyenthithpt/tn-shift-student-tests.service';

@Component({
  selector: 'app-complete-the-test',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './complete-the-test.component.html',
  styleUrls: ['./complete-the-test.component.css','../css-common/card-header.scss']
})
export class CompleteTheTestComponent implements OnInit {
  chartDB: any;
  totalTasksChart: Partial<ChartOptions>;
  data: number = null;

  constructor(
    private tnShiftStudentTestService : TnShiftStudentTestService
  ) {
    this.chartDB = ChartDB;
    const { totalTasksChart } = this.chartDB;

    this.totalTasksChart = totalTasksChart;
  }
  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.tnShiftStudentTestService.countPercentStudentTest().subscribe({
      next: (res) => {
        
        if (res) {
          // Lấy số bài hoàn thành và số bài còn lại từ response
          const completed = res.completed;
          const remaining = res.remaining;
  
          // Kiểm tra nếu tổng số bài thi > 0 để tránh chia cho 0
          if (completed + remaining > 0) {
            // Tính tỷ lệ phần trăm hoàn thành
            const completionRate = (completed / (completed + remaining)) * 100;
  
            // In ra kết quả (hoặc sử dụng completionRate trong giao diện)
            this.data = this.data = parseFloat(completionRate.toFixed(2));

          } else {
          }
        }
      },
      error: (err) => {
      }
    });
  }
  
}
