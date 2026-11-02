import { Component, EventEmitter, inject, Input, OnChanges, Output, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Coupon, Pack } from '@model/order';
import { MatDialog } from '@angular/material/dialog';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { GoiDichVuComponent } from '@pages/admin/goi-dich-vu/goi-dich-vu.component';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HelperService } from '@service/core/helper.service';
import { TnPackService } from '@service/luyenthithpt/tn-pack.service';
import { NotificationService } from '@theme/services/notification.service';
import { TnCouponService } from '@service/luyenthithpt/tn-coupon.service';

@Component({
  selector: 'app-apply-goi-dich-vu',
  standalone: true,
  imports: [CommonModule, ButtonModule, TableModule, FormsModule, ReactiveFormsModule],
  templateUrl: './apply-goi-dich-vu.component.html',
  styleUrls: ['./apply-goi-dich-vu.component.css']
})
export class ApplyGoiDichVuComponent extends GoiDichVuComponent implements OnChanges {

  @ViewChild("dialogApply", { static: true })
  dialogApply: TemplateRef<any>;

  @Input({required: true}) isOpenDialogApply: boolean = false;
  @Input({required: true}) Coupon: Coupon;
  @Output() savedData: EventEmitter<boolean> = new EventEmitter();

  selectedListPack: Pack[] = [];

  constructor(
    private dialog: MatDialog = inject(MatDialog),
    private tnCouponService: TnCouponService
) {
    super(
      inject(NotificationService),
      inject(FormBuilder),
      inject(TnPackService),
      inject(HelperService)
    );
  

    
  }


  ngOnChanges(changes: SimpleChanges): void {
    if (changes["isOpenDialogApply"] ) {
      if( changes["isOpenDialogApply"].currentValue == null ) return;
      
        this.showDialog();
    }
  }



  async showDialog() : Promise<void>  {
    this.configComponentENV.row = 1000;
    await super.loadData();
    
    if(this.listData.length > 0){
      this.selectedListPack = this.listData.filter((item) => {
        if(this.Coupon.pack_ids.includes(item.id)) return true;
        return false;
      })
    }
    this.dialog.open(this.dialogApply, {
      disableClose: true,
      panelClass: "ictu-app-notification",
      width: "1024px",
    });
  }

  hideDialog() : void {
    this.isOpenDialogApply = false;
    if (this.dialog) {
      this.dialog.closeAll();
    }
  }


  handleChangeSelectionPack() : void{
    
  }
  

  applySelection(): void{
    let packIds = this.selectedListPack.reduce((ids: number[], item: Pack) => {
      if(ids.includes(item.id)) return ids;
      ids.push(item.id);
      return ids;

    },[]);

    this.updatePackidsField(packIds);
  }

  applyAll(): void {
    let packIds:number[] = this.listData.reduce((ids: number[], item: Pack) => {
      if(ids.includes(item.id)) return ids;
      ids.push(item.id);
      return ids;

    },[]);
    
    this.updatePackidsField(packIds);
  }

  updatePackidsField(pack_ids: number[]){
    let data = {
      pack_ids: pack_ids
    }

    this.notificationService.isProcessing(true)

    this.tnCouponService.update(this.Coupon.id, data).subscribe(
      {
        next: () => {
          this.notificationService.toastSuccess('Áp dụng thành công')
          this.notificationService.isProcessing(false);
          this.hideDialog()
          this.savedData.emit(true);
        },
        error: () => {
          this.notificationService.toastError('Lỗi trong quá trình sửa ');
        }
      }
    )
  }

}
