import { Component, TemplateRef, ViewChild } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { ButtonModule } from "primeng/button";
import { PaginatorModule, PaginatorState } from "primeng/paginator";
import { TableModule } from "primeng/table";
import { TooltipModule } from "primeng/tooltip";
import { Coupon, Pack } from "@model/order";
import { debounceTime, map, of, Subject, switchMap } from "rxjs";
import { HelperService } from "@service/core/helper.service";
import { NotificationService } from "@theme/services/notification.service";
import { IctuPaginator } from "@model/dto";
import { TnCouponService } from "@service/luyenthithpt/tn-coupon.service";
import { CalendarModule } from "primeng/calendar";
import moment from "moment";
import { MatMenuModule } from "@angular/material/menu";
import { ApplyGoiDichVuComponent } from "./apply-goi-dich-vu/apply-goi-dich-vu.component";
import { TnPackService } from "@service/luyenthithpt/tn-pack.service";
import { TableLoaderComponent } from "src/app/templates/table-loader/table-loader.component";

class KhuyenMaiConfig {
  menuName: string = "don-gia";
  formActive: "Thêm mới phiếu khuyến mại" | "Cập nhật phiếu khuyến mại" =
    "Thêm mới phiếu khuyến mại";
  btn_checkAdd: "Lưu lại" | "Cập nhật" = "Lưu lại";
  page: number = 1;
  recordsTotal: number = 10;
  search: string = "";
  row: number = 10;
}

@Component({
  selector: "app-khuyen-mai",
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    MatMenuModule,
    CalendarModule,
    PaginatorModule,
    FormsModule,
    ReactiveFormsModule,
    TableModule,
    TooltipModule,
    ApplyGoiDichVuComponent,
    TableLoaderComponent
  ],
  templateUrl: "./khuyen-mai.component.html",
  styleUrls: ["./khuyen-mai.component.css"],
})
export class KhuyenMaiComponent {
  @ViewChild("templateAddAndUpdate", { static: true })
  template: TemplateRef<any>;
  isLoading: boolean = false;
  configComponentENV: KhuyenMaiConfig = new KhuyenMaiConfig();

  formData: FormGroup;
  listData: Coupon[] = [];
  selectedCoupon: Coupon;
  isOpenDialogApply: boolean = null;
  private inputChanged: Subject<string> = new Subject<string>();

  constructor(
    private notificationService: NotificationService,
    private formBuilder: FormBuilder,
    private helperService: HelperService,
    private tnCouponService: TnCouponService,
    private tnPackService: TnPackService,
  ) {
    this.formData = this.formBuilder.group({
      code: ["", Validators.required],
      desc: ["", Validators.required],
      amount: ["", Validators.required],
      applied_date: ["", Validators.required],
      expiry_date: ["", Validators.required],
      usage_limits: ["", Validators.required],
      pack_ids: [""],
    });

    this.inputChanged
      .pipe(debounceTime(1000))
      .subscribe((searchString: string) => {
        this.searchContentByInput(searchString);
      });
  }
  ngOnInit(): void {
    this.loadData();
  }

  preSetupForm(name: string): void {
    // this.notificationService.isProcessing(false);

    this.configComponentENV.menuName = "don-gia";
    // this.configComponentENV.formActive = "Thêm mới gói dịch vụ";
    // this.configComponentENV.btn_checkAdd = "Lưu lại";
    this.notificationService.openSideNavigationMenu({
      name,
      template: this.template,
      size: 700,
      offsetTop: "0px",
    });
  }

  formReset(): void {
    this.formData.reset();
  }

  closeForm() {
    this.formReset();
    // this.selectedCathi = null;
    this.notificationService.closeSideNavigationMenu(
      this.configComponentENV.menuName
    );
    // this.helperService.closeOvicFlexibleTemplate();
  }

  loadData(): void {
    this.isLoading = true;
    this.tnCouponService
      .getLimit(
        this.configComponentENV.page,
        this.configComponentENV.search,
        null
      )
      .pipe(
        switchMap((res: IctuPaginator<Coupon>) => {
          let packIds = res.data.reduce((ids: number[], item: Coupon) => {
            return ids.concat(item.pack_ids);
          }, []);
          packIds = [...new Set(packIds)]
          
          if(packIds.length > 0) {
            return this.tnPackService.getByIds(packIds).pipe(
              map((packs: Pack[]) => {
                let packs_temp = {};
                packs.forEach((pack) =>{
                  packs_temp[pack.id] = pack;
                })
                res.data = res.data.map((item: Coupon) => {
                  item['packs'] = item.pack_ids.map((packId: number) =>{
                     return packs_temp[packId];
                  })

                  return item;
                })

                return res;
              })
            )
          }else return of(res);
        })
      )
      .subscribe({
        next: (res: IctuPaginator<Coupon>) => {
          this.configComponentENV.recordsTotal = res.totalRecords;
          this.listData = res.data.map((item: Coupon, i) => {
            item["__index_table"] =
              (this.configComponentENV.page - 1) * 10 + i + 1;
            item["amount_converted"] = this.helperService.formatVndCurrency(
              item.amount
            );
            item["applied_date_converted"] = moment(item.applied_date).format(
              "DD-MM-YYYY"
            );
            item["expiry_date_converted"] = moment(item.expiry_date).format(
              "DD-MM-YYYY"
            );
            return item;
          });
          this.isLoading = false;
        },

        error: (err: any) => {
          console.error(err);
          
        },
      });
  }

  paginate({ page }: PaginatorState) {
    this.configComponentENV.page = page + 1;
    this.loadData();
  }

  // action add update delete data

  saveFormData(): void {
    // return;
    if (this.formData.valid) {

      const coupon: Coupon = {
        ...this.formData.value,
        applied_date: this.helperService.strToSQLDate(
          this.formData.controls["applied_date"].value.toString()
        ),
        expiry_date: this.helperService.strToSQLDate(
          this.formData.controls["expiry_date"].value.toString()
        ),
      };

      // return;
      if (this.configComponentENV.btn_checkAdd == "Lưu lại") {
        coupon.pack_ids = [];
        // add new pack
        this.tnCouponService.create(coupon).subscribe({
          next: (res) => {
            this.notificationService.toastSuccess("Thêm thành công");
            this.closeForm();
            this.loadData();
          },
          error: (err) => {
            console.error(err);
            
            this.notificationService.toastError("Lỗi trong quá trình thêm");
          },
        });
      } else {
        // update
        this.tnCouponService.update(this.selectedCoupon.id, coupon).subscribe({
          next: (res) => {
            this.notificationService.toastSuccess("Sửa thành công");
            this.closeForm();
            this.loadData();
          },
          error: (err) => {
            this.notificationService.toastError("Lỗi trong quá trình sửa");
          },
        });
      }
    } else {
      this.notificationService.toastError("Vui lòng nhập đủ thông tin");
    }
  }

  btnAdd() {
    this.configComponentENV.formActive = "Thêm mới phiếu khuyến mại";
    this.configComponentENV.btn_checkAdd = "Lưu lại";

    this.preSetupForm("");
  }

  btnUpdate(item: Coupon): void {
    this.selectedCoupon = item;
    this.formData.reset({
      code: item.code,
      desc: item.desc,
      amount: item.amount,
      applied_date: moment(item.applied_date).format("DD-MM-YYYY"),
      expiry_date: moment(item.expiry_date).format("DD-MM-YYYY"),
      usage_limits: item.usage_limits,
      pack_ids: item.pack_ids,
    });
    this.configComponentENV.formActive = "Cập nhật phiếu khuyến mại";
    this.configComponentENV.btn_checkAdd = "Cập nhật";

    this.preSetupForm("");
  }

  async btnDelete(item: Coupon) {
    this.selectedCoupon = item;
    let confirm = await this.notificationService.confirmDelete();
    if (confirm && this.selectedCoupon) {
      this.tnCouponService.delete(this.selectedCoupon.id).subscribe({
        next: () => {
          this.notificationService.toastSuccess("Xóa thành công");
          this.listData = this.listData.filter(
            (f) => f.id !== this.selectedCoupon.id
          );
        },
        error: () => {
          this.notificationService.toastError("Lỗi trong quá trình xóa");
        },
      });
    }
  }

  onInputChange(event: string) {
    this.inputChanged.next(event);
  }

  searchContentByInput(searchString: string) {
    this.configComponentENV.search = searchString;
    this.configComponentENV.page = 1;
    this.loadData();
  }

  // dialog apply

  openDialogApply(item: Coupon) {
    this.selectedCoupon = item;
    this.isOpenDialogApply = !this.isOpenDialogApply;
  }

  updatedApply(event: any) {
    this.loadData();
    this.isOpenDialogApply = null;
  }
}
