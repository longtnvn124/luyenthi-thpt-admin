import {
  Component,
  inject,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  TemplateRef,
  ViewChild,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { ButtonModule } from "primeng/button";
import { DropdownModule } from "primeng/dropdown";
import { TnBankQuestion } from "@model/tn-bank-question";
import { TnBankQuestionService } from "@service/luyenthithpt/tn-bank-question.service";
import { TnBank } from "@model/tn-bank";
import { TnBankService } from "@service/luyenthithpt/tn-bank.service";
import { FormsModule } from "@angular/forms";
import { TooltipModule } from "primeng/tooltip";
import { MatDialog } from "@angular/material/dialog";
import { NotificationService } from "@theme/services/notification.service";
import { TnTestFormService } from "@service/luyenthithpt/tn-test-form.service";
import { TnFormDetailService } from "@service/luyenthithpt/tn-form-detail.service";
import { TnFormDetail } from "@model/tn-test-form";
import { forkJoin, map, of, switchMap } from "rxjs";

interface DataSave {
  id?: number;
  bank_id: number;
  form_id: number;
  param: string;
  number_questions: number;
  ordering: number;
}

@Component({
  selector: "app-detail-form",
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    DropdownModule,
    FormsModule,
    TooltipModule,
  ],
  templateUrl: "./detail-form.component.html",
  styleUrls: ["./detail-form.component.css"],
})
export class DetailFormComponent implements OnInit, OnChanges {
  @ViewChild("create_update", { static: true })
  dialogCreateAndUpdate: TemplateRef<any>;

  @Input({ alias: "form_id", required: true }) form_id: number;
  @Input({ alias: "bank_id", required: true }) bank_id: number;
  @Input({ alias: "cantAction", required: true }) cantAction: boolean;

  vandungTypes = [
    { value: 1, label: "Hiểu" },
    { value: 2, label: "Biết" },
    { value: 3, label: "Vận dụng" },
    { value: 4, label: "Phân tích " },
  ];

  listBankChild: TnBank[] = [];
  listFormdetails: TnFormDetail[] = [];
  selectedBank: TnBank;
  selectedLevel: { value: number; label: string };
  titleForm: string = "Thêm mới";
  stateDiaglog: boolean = false;
  typeForm: "add" | "update" = "add";

  dataSave: DataSave = {} as DataSave;

  questionIds: number[] = [];
  allQuestions: TnBankQuestion[] = [];
  constructor(
    private tnBankQuestionService: TnBankQuestionService,
    private tnBankService: TnBankService,
    private dialog: MatDialog = inject(MatDialog),
    private notificationService: NotificationService,
    private tnTestFormService: TnTestFormService,
    private tnFormDetailService: TnFormDetailService
  ) {}
  ngOnChanges(changes: SimpleChanges): void {
    if(changes['form_id'] || changes['bank_id'] || changes['cantAction']){
      this.ngOnInit();
    }
  }

  ngOnInit(): void {
    this.dataSave.form_id = this.form_id;
    if (this.bank_id) {
      this.loadBankChild();
    }
    
    if(this.form_id){
      this.loadData();
    }
  }

  loadBankChild() {
    this.tnBankService.getByParentId(this.bank_id).subscribe({
      next: (res: TnBank[]) => {
        this.listBankChild = res;
      },
    });
  }

  loadData(){
    this.tnFormDetailService.getAllTnFormDetailFormId(this.form_id)
    .pipe(
      switchMap((res: TnFormDetail[]) => {
        let tnFormIds: number[] = res.reduce((ids: number[],item) => {
          ids.push(item.bank_id);
        
          return ids;
        },[]);
        let questionIds: number[] = res.reduce((ids: number[],item) => {
          // example of param: "453,454,455,456,457,458,459,460,461,462,463,468,469,470,471,472,473,478,479,480"
          ids.push(...item.param.split(',').map(Number))
          return ids;
        },[]);
        return forkJoin([
          this.tnBankService.getByIds(tnFormIds),
          this.tnBankQuestionService.getByIds(questionIds)
        ]).pipe(
          map(
            ([tnBanks, tnBankQuestions]) => {
              res = res.map((item) => {
                let index_bank = tnBanks.findIndex((t => t.id == item.bank_id))
                if(index_bank > -1){
                  item['tnBank'] = tnBanks[index_bank];
                }

                let questions = tnBankQuestions.filter((t => t.bank_id == item.bank_id && t.group_id == 0))
                if(index_bank > -1){
                  item['tnBank'] = tnBanks[index_bank];
                  item['questions'] = questions;
                }
                return item;
              })
  
              return res;
            }
          )
        )
      })
    )
    .subscribe({
      next: (res: TnFormDetail[]) => {
        this.listFormdetails = res;
      }
    })
  }

  showDialog(): void {
    this.dialog.open(this.dialogCreateAndUpdate, {
      disableClose: true,
      panelClass: "ictu-app-notification",
      width: "540px",
    });
  }

  hideDialog() {
    this.stateDiaglog = false;
    if (this.dialog) {
      this.dialog.closeAll();
    }
  }

  isValid(): boolean {
    if (this.dataSave.number_questions > this.questionIds.length) {
      this.notificationService.toastError(
        "Số lượng câu hỏi lấy phải nhỏ hơn hoặc bằng tổng câu hỏi hiện có"
      );
      return false;
    }
    if (
      !this.dataSave.form_id ||
      !this.dataSave.bank_id ||
      !this.dataSave.number_questions ||
      !this.dataSave.ordering ||
      !this.dataSave.param
    ) {
      this.notificationService.toastError("Vui lòng điền đây đủ thông tin");
      return false;
    }

    return true;
  }

  submitData() {
    this.dataSave.param = this.questionIds.join(",");




    if (!this.isValid()) {
      return;
    }

    // return;
    if (this.typeForm == "add") {

      this.saveData();
    } else {

      this.updateData();
    }
  }

  changesBankChild() {
    this.dataSave.bank_id = this.selectedBank.id;
    this.handleGetAllQuestion();
  }

  changesLevel() {
    this.dataSave.ordering = this.selectedLevel.value;
    this.handleGetAllQuestion();
  }

  handleGetAllQuestion(callback?: () => void) {
    if (this.selectedBank && this.selectedLevel) {
      this.notificationService.isProcessing(true);
      this.tnBankQuestionService
        .getAllByBankIdAndLevel(this.selectedBank.id, this.selectedLevel.value)
        .subscribe({
          next: (res: TnBankQuestion[]) => {
            this.notificationService.isProcessing(false);
            this.allQuestions = res;
  
            if (res.length > 0) {
              res.map((item) => {
                if (item.group_id == 0) {
                  this.questionIds.push(item.id);
                }
              });
            } else {
              this.questionIds = [];
            }
  
            // Check if callback exists and call it if available
            // Check if callback exists and call it if available
          if (callback) {
            callback(); // Call the callback if provided
          }
          },
          error: (err: any) => {
            this.notificationService.isProcessing(false);
          },
        });
    }
  }
  

  saveData() {
    this.notificationService.isProcessing(true);
    this.tnFormDetailService.addTnFormDetail(this.dataSave).subscribe({
      next: (res) => {
        this.hideDialog();
        this.dataSave.number_questions = null;
        this.dataSave.param = null;
        this.notificationService.toastSuccess('Thêm thành công')
        this.notificationService.isProcessing(false);
        this.loadData();
      },
    });
  }

  updateData() {
    this.notificationService.isProcessing(true);
    this.tnFormDetailService
      .updateTnFormDetail(this.dataSave.id, this.dataSave)
      .subscribe({
        next: (res) => {
          this.hideDialog();
          this.dataSave.number_questions = null;
          this.dataSave.param = null;
          this.notificationService.toastSuccess('Cập nhật thành công')
          this.notificationService.isProcessing(false);
          this.loadData();
        },
      });
  }

  setupFormAdd(){
    this.typeForm = 'add';
    this.showDialog()
  }

  setupFormUpdate(item: TnFormDetail): void{
      this.typeForm = 'update';
      this.dataSave.bank_id = item.bank_id;
      this.dataSave.form_id = item.form_id;
      this.dataSave.number_questions = item.number_questions;
      this.dataSave.id = item.id;
      this.dataSave.param = item.param;
      this.dataSave.ordering = item.ordering;

      // set selected bank
      this.selectedBank = this.listBankChild.find(i => i.id  == item.bank_id);
      this.selectedLevel = this.vandungTypes.find(i => i.value == item.ordering);
      this.handleGetAllQuestion(() => this.showDialog());
      
  }

  async deleteFormDetail(id: number) {
    let confirm = await this.notificationService.confirmDelete();

    if(confirm){
      this.notificationService.isProcessing(true);
      this.tnFormDetailService.deleteTnFormDetail(id).subscribe({
        next: () => {
          this.notificationService.toastSuccess('Xóa thành công');
          this.notificationService.isProcessing(false);
          this.loadData();
        },
        error: () => {
          this.notificationService.toastError('Xóa thất bại');
        }
      });
    }
    
  }
}
