import {
  Component,
  inject,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  TemplateRef,
  ViewChild,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatDialog, MatDialogModule } from "@angular/material/dialog";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { TableModule } from "primeng/table";
import { ButtonModule } from "primeng/button";
import { InputTextModule } from "primeng/inputtext";
import { PaginatorModule } from "primeng/paginator";
import { RadioButtonModule } from "primeng/radiobutton";
import { ProgressBarModule } from "primeng/progressbar";
import { CheckboxModule } from "primeng/checkbox";
import { TooltipModule } from "primeng/tooltip";
import { MatMenuModule } from "@angular/material/menu";
import { TnShiftTestSessionService } from "@service/luyenthithpt/tn-shift-test-session.service";
import { TnShiftTestSession } from "@model/tn-shift-test-session";
import { forkJoin, of, switchMap } from "rxjs";
import { TnStudent } from "@model/tn-student";
import { TnStudentResultService } from "@service/luyenthithpt/tn-student-result.service";
import { TnShiftTestService } from "@service/luyenthithpt/tn-shift-test.service";
import moment from "moment";
import { TnShiftStudentTestService } from "@service/luyenthithpt/tn-shift-student-tests.service";

@Component({
  selector: "app-chi-tiet-ket-qua-thi",
  standalone: true,
  imports: [
    CommonModule,
    PaginatorModule,
    ButtonModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextModule,
    RadioButtonModule,
    TableModule,
    MatMenuModule,
    TooltipModule,
    ProgressBarModule,
    CheckboxModule,
    MatDialogModule,
    // Remove or properly import these if needed:
    // OvicDropdownComponent,
    // TableLoaderComponent,
    // OvicDatePickerComponent,
  ],
  templateUrl: "./chi-tiet-ket-qua-thi.component.html",
  styleUrls: ["./chi-tiet-ket-qua-thi.component.css"],
})
export class ChiTietKetQuaThiComponent implements OnInit, OnChanges {
  @ViewChild("dialogDetailResult", { static: true })
  dialogDetailResult: TemplateRef<any>;

  @Input() propsData: {
    student_id: number;
    shift_id: number;
    student: TnStudent;
  };
  @Input() stateDiaglog: boolean = false;
  listDetailResultPoint: TnShiftTestSession[] = [];

  constructor(
    private dialog: MatDialog = inject(MatDialog),
    private tnShiftTestSessionService: TnShiftTestSessionService,
    private tnStudentResultService: TnStudentResultService,
    private tnShiftTestService: TnShiftTestService,
    private tnShiftStudentTestService : TnShiftStudentTestService
  ) {}

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["propsData"]) {
      this.propsData = changes["propsData"].currentValue;
    }
    if (changes["stateDiaglog"]) {
      if (changes["stateDiaglog"].currentValue == null) return;
      this.stateDiaglog = changes["stateDiaglog"].currentValue;

      this.showDialog();
    }
  }

  loadData() {

    this.tnShiftStudentTestService
      .getUnLimitedByIdAndShift(
        this.propsData.shift_id,
        this.propsData.student_id
      )
      .pipe(
        switchMap(
          (res: { recordsTotal: number; data: TnShiftTestSession[] }) => {
            // const sessionIds = res.data.map((item) => item.id);
            const shiftTestIds = res.data.map((item) => item.shift_test_id);

            return forkJoin({
              sessions: of(res.data),
              // studentResults:
              //   this.tnStudentResultService.getUnlimitedBySesstionIds(
              //     sessionIds,
              //     this.propsData.student_id
              //   ),
              shiftTests:
                this.tnShiftTestService.getUnlimitedByIds(shiftTestIds),
            });
          }
        )
      )
      .subscribe(({ sessions, 
        // studentResults, 
        shiftTests }) => {
        this.listDetailResultPoint = sessions.map((session) => {
          // const studentResult = studentResults.data.find(
          //   (sr) => sr.shift_test_session_id === session.id
          // );
          const shiftTest = shiftTests.data.find(
            (st) => st.id === session.shift_test_id
          );
          session["time_start_converted"] = moment(session.time_start).format("DD/MM/YYYY HH:mm:ss");
          session["time_end_converted"] = moment(session.time_end).format("DD/MM/YYYY HH:mm:ss");

          return {
            ...session,
            // studentResult,
            shiftTest,
          };
        });

        
      });
  }

  // dialog add role
  showDialog() {
    this.loadData();
    this.dialog.open(this.dialogDetailResult, {
      disableClose: true,
      panelClass: "ictu-app-notification",
      width: "1024px",
    });
  }

  hideDialog() {
    this.stateDiaglog = false;
    if (this.dialog) {
      this.dialog.closeAll();
    }
  }
}
