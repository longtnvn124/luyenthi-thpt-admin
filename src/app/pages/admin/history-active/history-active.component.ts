import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { DropdownModule } from "primeng/dropdown";
import { FormsModule } from "@angular/forms";
import { TableLoaderComponent } from "src/app/templates/table-loader/table-loader.component";
import { PaginatorModule } from "primeng/paginator";
import { TableModule } from "primeng/table";
import { TnOrderService } from "@service/luyenthithpt/tn-order.service";
import { Coupon, Order, Pack } from "@model/order";
import { debounceTime, firstValueFrom, forkJoin, map, of, Subject, switchMap } from "rxjs";
import { TnCouponService } from "@service/luyenthithpt/tn-coupon.service";
import moment from "moment";
import { TnStudent } from "@model/tn-student";
import { TnStudentService } from "@service/luyenthithpt/tn-student.service";
import { TnPackService } from "@service/luyenthithpt/tn-pack.service";
import { FormatVndCurrencyPipe } from "src/app/pipes/format-vnd-currency.pipe";
import { IctuMediaLoaderDirective } from "src/app/directives/ictu-media-loader.directive";
import { LoadCourseThumbnailDirective } from "src/app/directives/load-course-thumbnail.directive";
import { HelperService } from "@service/core/helper.service";

interface OrderExtend extends Order{
  __index_table: number;
  __coupon: Coupon;
  __created_converted: string;
  __pack: Pack;
  __student: TnStudent;
}

class ComponentEnv {
  isLoading: boolean = true;
  search: string = "";
  searchUserIds: number[] = [];
  listStatus: { value: number; name: string }[] = [
    { value: 0, name: "Thất bại" },
    { value: 1, name: "Thành công" },
  ];
  statusSelected: number = null;
  rows: number = 15;
  recordsTotal = 1;
  page: number = 1;
}

@Component({
  selector: "app-history-active",
  standalone: true,
  imports: [
    TableModule,
    CommonModule,
    DropdownModule,
    FormsModule,
    TableLoaderComponent,
    PaginatorModule,
    FormatVndCurrencyPipe,
    LoadCourseThumbnailDirective
  ],
  templateUrl: "./history-active.component.html",
  styleUrls: ["./history-active.component.css"],
})
export class HistoryActiveComponent extends ComponentEnv implements OnInit {
  listData: OrderExtend[];

  private inputSearch: Subject<string> = new Subject<string>();
  constructor(
    private tnOrderService : TnOrderService,
    private tnCouponService : TnCouponService,
    private tnStudentService : TnStudentService,
    private tnPackService : TnPackService,
    private helperService : HelperService
  ){
    super();

    this.inputSearch.pipe(debounceTime(1000)).subscribe((searchString: string) => {
      this.searchContentByInput(searchString);
    })
  }
  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    this.tnOrderService.getLimit(this.page, this.searchUserIds, this.statusSelected , 15)
    .pipe(
      switchMap((res: {
        recordsTotal: number;
        data: Order[];
    }) => {
      if(res.data && res.data.length <= 0){
        return of(res);
      }

      let userIds = res.data.reduce((userIds: number[],item: Order) => {
        userIds.push(item.user_id);
        return userIds;
      },[])

      userIds = [...new Set(userIds)];

      return this.tnStudentService.getByUserIds(userIds).pipe(
        map((tnStudents: TnStudent[]) => {
            let studentObj = {};
            if(tnStudents.length > 0){
              tnStudents.forEach((student: TnStudent) => {
                if(student.avata){
                  student['hasAvata'] = true;
                }else{
                  student.avata = this.helperService.fakeAvatar();
                  student['hasAvata'] = false;
                }
                studentObj[student.user_id] = student;

              })
            }

            

            res.data = res.data.map((item, index) => {
              const newOrder: OrderExtend = {
                ...item,
                
                __index_table : (this.page - 1) * 15 + index + 1,
                __coupon : null,
                __created_converted: moment(item.created_at).format('DD/MM/YYYY'),
                __pack: null,
                __student: studentObj[item.user_id]


              }
      
              
              return newOrder;
            })

            return res;
        })
      )

      
    })
    )
    .subscribe({
      next: (res) => {
        
        if(res.data.length <= 0) {
          this.listData = [];
          res.recordsTotal = 0;
        }else{
          this.listData = res.data as OrderExtend[];
          this.recordsTotal = res.recordsTotal;
          this.loadCouponAndPackData();
        }
        this.isLoading = false;
      }
    })

  }


  loadCouponAndPackData() {
    const packIds = [...new Set(this.listData.map(item => item.pack_id))];
    const couponCodes = [...new Set(this.listData
      .filter(item => item.coupon) // Lọc chỉ những item có `coupon`
      .map(item => item.coupon))]; // Trích xuất coupon
    
    
    forkJoin(
      [
        this.tnPackService.getByIds(packIds),
        this.tnCouponService.getByCodes(couponCodes)
      ]
    ).subscribe({
      next: ([packs, coupons]) => {
        let packsObj = {};
        let couponsObj = {};

        packs.forEach((item) => {
          packsObj[item.id] = item;
        })

        coupons.forEach((item) => {
          couponsObj[item.code] = item;
        })

        this.listData = this.listData.map((item) => {
          item.__coupon = couponsObj[item.coupon] ?? '_ _ _';
          item.__pack = packsObj[item.pack_id] ?? '_ _ _';
          return item;

        })

        
        
      },
      error: (err) => {
        
      }
    })
  }


  onInputChange(event: any): void{
    // if(!event.trim()) return;
    this.inputSearch.next(event);
    
  }

  async searchContentByInput(searchText: string): Promise<void>{
    try {
      this.search = searchText;

      let students = await firstValueFrom(this.tnStudentService.getUnLimitedStudentByNameOrCode(this.search))
      if(students.data.length > 0){
        this.searchUserIds = students.data.map(student => student.user_id);
        this.page = 1;
        this.loadData();
      }else{
        this.page = 1;
        this.recordsTotal = 0;
        this.listData = [];
      }
    } catch (error) {
      console.error(error);
      
    }
   
  }



  changeStatus(): void{
    this.loadData();
  }

}
