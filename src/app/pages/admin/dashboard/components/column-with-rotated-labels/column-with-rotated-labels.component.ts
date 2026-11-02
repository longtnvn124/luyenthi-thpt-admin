import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgApexchartsModule } from 'ng-apexcharts';
import { ChartOptions } from '../../dashboard.component';
import { CardComponent } from '@theme/components/card/card.component';
import { ChartLoadingComponent } from 'src/app/components/chart-loading/chart-loading.component';
import { TnQLCathiService } from '@service/luyenthithpt/tn-ql-ca-thi.service';
import { TnShiftStudentTestService } from '@service/luyenthithpt/tn-shift-student-tests.service';
import { TnQLCathi } from '@model/tn-ql-ca-thi';

@Component({
  selector: 'app-column-with-rotated-labels',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule, CardComponent, ChartLoadingComponent],
  templateUrl: './column-with-rotated-labels.component.html',
  styleUrls: ['./column-with-rotated-labels.component.css']
})
export class ColumnWithRotatedLabelsComponent implements OnInit, OnChanges{
    
    @Input({required: true}) shift_id: number;
    @Input({required: true}) shift: TnQLCathi;
    scoreSpectrumChart: Partial<ChartOptions>;
    isLoading: boolean = true;
    data: number[] = [];

    constructor(
      private tnQLCathiService : TnQLCathiService,
      private tnShiftStudentTestService : TnShiftStudentTestService
    ){

    }
  ngOnChanges(changes: SimpleChanges): void {
     if(changes['shift_id']){
      this.loadData();
     }
  }

    ngOnInit(): void {
      
  
      // setTimeout(() => {
      //   this.isLoading = false;
      // }, 1000);
    }

    // Hàm tạo các categories từ 1 đến 150 theo nhóm
  generateCategories(max: number): string[] {
    const categories = [];
    for (let i = 1; i <= max; i += 5) {
      categories.push(`${i}-${i + 4}`);
    }
    return categories;
  }

  // Hàm tạo fake data, tập trung vào các nhóm 56-60 và 101-105
  generateFakeDataWithFocus(groups: number): number[] {
    const data = [];

    // Tạo dữ liệu ngẫu nhiên nhưng với sự tập trung vào khoảng 56-60 và 101-105
    for (let i = 0; i < groups; i++) {
      let value = this.generateDataForSpecificRange(i);
      data.push(value);
    }

    

    return data;
  }

  // Hàm tạo giá trị ngẫu nhiên, ưu tiên cho các khoảng giá trị 56-60 và 101-105
  generateDataForSpecificRange(groupIndex: number): number {
    // Xác định tỷ lệ dữ liệu sẽ rơi vào các khoảng 56-60 và 101-105
    if (groupIndex >= 11 && groupIndex <= 12) {
      // Khoảng 56-60
      return this.getRandomValueInRange(56, 60);
    } else if (groupIndex >= 20 && groupIndex <= 21) {
      // Khoảng 101-105
      return this.getRandomValueInRange(101, 105);
    } else {
      // Phần còn lại của các nhóm phân bố ngẫu nhiên
      return Math.floor(Math.random() * 100) + 1;
    }
  }

  // Hàm lấy giá trị ngẫu nhiên trong một khoảng
  getRandomValueInRange(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }


  loadData(): void {
    this.tnShiftStudentTestService.countTestPoint(this.shift_id).subscribe({
      next: (res) => {
        if(res.data && res.data.length > 0){
          let dataTemp = res.data[0];
          delete dataTemp['shift_id'];
         
          for (const key in dataTemp) {
            this.data.push(dataTemp[key]);
          }


          
          
        }

        this.initalizeChart();
        
        setTimeout(() => {
          this.isLoading = false;
        }, 1000);
      },
      error: (err) => {
        console.error(err);
        
      }
    })
  }

  initalizeChart(){
    this.scoreSpectrumChart = {
        series: [
            {
                name: "Số lượng",
                data: this.data, // Giả sử có 30 nhóm dữ liệu
            },
        ],
        annotations: {
            points: [
                {
                    x: "Bananas",
                    seriesIndex: 0,
                    label: {
                        borderColor: "#775DD0",
                        offsetY: 0,
                        style: {
                            color: "#fff",
                            background: "#775DD0",
                        },
                        text: "Bananas are good",
                    },
                },
            ],
        },
        chart: {
            height: 350,
            type: "bar",
        },
        plotOptions: {
            bar: {
                columnWidth: "50%",
                borderRadius: 5,
            },
        },
        dataLabels: {
            enabled: false,
        },
        stroke: {
            width: 2,
        },
        grid: {
            row: {
                colors: ["#fff", "#f2f2f2"],
            },
        },
        xaxis: {
            labels: {
                rotate: -45,
            },
            categories: this.generateCategories(150), // Tạo các nhóm từ 1 đến 150
            tickPlacement: "on",
        },
        yaxis: {
            title: {
                text: "Số lượng",
            },
            labels: {
                formatter: (value: number) => {
                    return Math.round(value).toString();; // Hiển thị số nguyên
                },
            },
        },
        fill: {
            type: "gradient",
            gradient: {
                shade: "light",
                type: "horizontal",
                shadeIntensity: 0.25,
                gradientToColors: undefined,
                inverseColors: true,
                opacityFrom: 0.85,
                opacityTo: 0.85,
                stops: [50, 0, 100],
            },
        },
    };
}

}


