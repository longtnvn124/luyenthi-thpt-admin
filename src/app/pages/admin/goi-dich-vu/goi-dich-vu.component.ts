import { Component, OnInit, TemplateRef, ViewChild } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ButtonModule } from "primeng/button";
import { NotificationService } from "@theme/services/notification.service";
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { TnPackService } from "@service/luyenthithpt/tn-pack.service";
import { Pack } from "@model/order";
import { HelperService } from "@service/core/helper.service";
import { IctuPaginator } from "@model/dto";
import { TableModule } from "primeng/table";
import { TooltipModule } from "primeng/tooltip";
import { PaginatorModule, PaginatorState } from "primeng/paginator";
import { debounceTime, lastValueFrom, Subject } from "rxjs";
import { TableLoaderComponent } from "src/app/templates/table-loader/table-loader.component";

class DonGiaConfig {
  menuName: string = "don-gia";
  formActive: "Thêm mới gói dịch vụ" | "Cập nhật gói dịch vụ" =
    "Thêm mới gói dịch vụ";
  btn_checkAdd: "Lưu lại" | "Cập nhật" = "Lưu lại";
  page: number = 1;
  recordsTotal: number = 10;
  search: string = "";
  row: number = 10;
  tableLoading: boolean = false;
}

@Component({
  selector: "app-goi-dich-vu",
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    PaginatorModule,
    FormsModule,
    ReactiveFormsModule,
    TableModule,
    TooltipModule,
    TableLoaderComponent
  ],
  templateUrl: "./goi-dich-vu.component.html",
  styleUrls: ["./goi-dich-vu.component.css"],
})
export class GoiDichVuComponent implements OnInit {
  @ViewChild("templateAddAndUpdate", { static: true })
  template: TemplateRef<any>;
  isLoading: boolean = false;
  configComponentENV: DonGiaConfig = new DonGiaConfig();

  formData: FormGroup;
  listData: Pack[] = [];
  selectedPack: Pack;
  private inputChanged: Subject<string> = new Subject<string>();
  constructor(
    public notificationService: NotificationService,
    private formBuilder: FormBuilder,
    private tnPackService: TnPackService,
    private helperService: HelperService
  ) {
    this.formData = this.formBuilder.group({
      name: ["", Validators.required],
      time: ["", Validators.required],
      price: ["", Validators.required],
      des: "",
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

  // load and handle data table

  async loadData(): Promise<void> {
    this.configComponentENV.tableLoading = true;
    try {
      const res = await lastValueFrom(
        this.tnPackService.getLimit(
          this.configComponentENV.page,
          this.configComponentENV.search,
          this.configComponentENV.row
        )
      );

      this.configComponentENV.recordsTotal = res.totalRecords;
      this.listData = res.data.map((item: Pack, i) => {
        item["__index_table"] = (this.configComponentENV.page - 1) * 10 + i + 1;
        item["price_converted"] = this.helperService.formatVndCurrency(
          item.price
        );
        return item;
      });
    } catch (err) {
    } finally {
      this.isLoading = false;
      this.configComponentENV.tableLoading = false;
    }
  }

  paginate({ page }: PaginatorState) {
    this.configComponentENV.page = page + 1;
    this.loadData();
  }

  // action add update delete data

  saveFormData(): void {
    if (this.formData.valid) {

      const packSave: Pack = {
        ...this.formData.value,
      };
      if (this.configComponentENV.btn_checkAdd == "Lưu lại") {
        // add new pack
        this.tnPackService.create(packSave).subscribe({
          next: (res) => {
            this.notificationService.toastSuccess("Thêm thành công");
            this.closeForm();
            this.loadData();
          },
          error: (err) => {
            this.notificationService.toastError("Lỗi trong quá trình thêm");
          },
        });
      } else {
        // update
        this.tnPackService.update(this.selectedPack.id, packSave).subscribe({
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
    this.configComponentENV.formActive = "Thêm mới gói dịch vụ";
    this.configComponentENV.btn_checkAdd = "Lưu lại";

    this.preSetupForm("");
  }

  btnUpdate(item: Pack): void {
    this.selectedPack = item;
    this.formData.reset({
      name: item.name,
      time: item.time,
      price: item.price,
      des: item.des,
    });
    this.configComponentENV.formActive = "Cập nhật gói dịch vụ";
    this.configComponentENV.btn_checkAdd = "Cập nhật";

    this.preSetupForm("");
  }

  async btnDelete(item: Pack) {
    this.selectedPack = item;
    let confirm = await this.notificationService.confirmDelete();
    if (confirm && this.selectedPack) {
      this.tnPackService.delete(this.selectedPack.id).subscribe({
        next: () => {
          this.notificationService.toastSuccess("Xóa thành công");
          this.listData = this.listData.filter(
            (f) => f.id !== this.selectedPack.id
          );
        },
        error: () => {
          this.notificationService.toastError("Lỗi trong quá trình xóa");
        },
      });
    }
  }

  async changeFeatured(item: Pack): Promise<void> {
    if (item.featured == 1) {
      this.notificationService.toastWarning("Gói này đã ở trạng thái đề xuất");
      return;
    }
    this.isLoading = true;

    this.tnPackService.updateFeatured(item.id).subscribe({
      next: () => {
        this.notificationService.toastSuccess("Cập nhật thành công");
        // this.loadData();
        this.listData = this.listData.map((d) => {
          if(d.id == item.id){
            d.featured = 1;
          }else{
            d.featured = 0;
          }

          return d;
        })
        this.isLoading = false;
      },
      error: () => {
        this.notificationService.toastError("Cập nhật thất bại");
        this.isLoading = false;
      },
    });
  }

  onInputChange(event: string) {
    this.inputChanged.next(event);
  }

  searchContentByInput(searchString: string) {
    this.configComponentENV.search = searchString;
    this.configComponentENV.page = 1;
    this.loadData();
  }
}
