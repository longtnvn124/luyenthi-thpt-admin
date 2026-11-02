import {
  Component,
  ElementRef,
  ViewChild,
  ViewEncapsulation,
} from "@angular/core";
import { CommonModule, formatDate } from "@angular/common";
import { User } from "@model/user";
import {
  KEY_ANSWER_new,
  LARGE_MODAL_OPTIONS,
  NORMAL_MODAL_OPTIONS,
  pointBank,
  READ_NUMBER,
  SKILL_TEST_RESUTL,
  SKILL_TEST_TOTAL_OBJECT,
  TITLE_LEFT,
} from "@utilities/syscats";
import { TnQLCathi } from "@model/tn-ql-ca-thi";
import { HelperService } from "@service/core/helper.service";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { TnTestFormService } from "@service/luyenthithpt/tn-test-form.service";
import { FormBuilder } from "@angular/forms";
import { AuthService } from "@service/core/auth.service";
import { TnBank } from "@model/tn-bank";
import { TnChamThi } from "@model/tn-cham-thi";
import { TnShiftTest } from "@model/tn-shift-test";
import { TnShiftTestQuestion } from "@model/tn-shift-test-question";
import { TnTestForm, TnFormDetail } from "@model/tn-test-form";
import { FileService } from "@service/core/file.service";
import { UserService } from "@service/core/user.service";
import { TnBankService } from "@service/luyenthithpt/tn-bank.service";
import { TnChamThiService } from "@service/luyenthithpt/tn-cham-thi.service";
import { TnFormDetailService } from "@service/luyenthithpt/tn-form-detail.service";
import { TnQLCathiService } from "@service/luyenthithpt/tn-ql-ca-thi.service";
import { TnShiftTestQuestionService } from "@service/luyenthithpt/tn-shift-test-question.service";
import { TnShiftTestService } from "@service/luyenthithpt/tn-shift-test.service";
import { TnStudentService } from "@service/luyenthithpt/tn-student.service";
import JSZip from "jszip";
import * as pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from "pdfmake/build/vfs_fonts";
import * as fs from "file-saver";
import * as XLSX from "xlsx";
import {
  forkJoin,
  Observable,
  mergeMap,
  of,
  switchMap,
  map,
  Subject,
  debounceTime,
} from "rxjs";
import { DocumentCreator } from "./export-word";
import { TnStudentResultService } from "@service/luyenthithpt/tn-student-result.service";
import { ExportPointWritingService } from "@service/luyenthithpt/export-point-writing.service";
import { TnShiftTestControlService } from "@service/luyenthithpt/tn-shift-test-control.service";
import { ExportExcelNewService } from "@service/luyenthithpt/export-excel-new.service";
import { IctuQueryCondition } from "@model/dto";
import { HttpParamsHeplerService } from "@service/core/http-params-hepler.service";
import { TnStudentResult } from "@model/tn-student-result";
import { NotificationService } from "@theme/services/notification.service";
import { ProgressBarModule } from "primeng/progressbar";
import { TooltipModule } from "primeng/tooltip";
import { MatMenuModule } from "@angular/material/menu";
import { TableModule } from "primeng/table";
import { ButtonModule } from "primeng/button";
import { TnShiftTestSessionService } from "@service/luyenthithpt/tn-shift-test-session.service";
import { PaginatorModule, PaginatorState } from "primeng/paginator";
import { ThemeSettingsService } from "@service/core/theme-settings.service";
import moment from "moment";
import { TnStudent } from "@model/tn-student";
import { ChiTietKetQuaThiComponent } from "./components/chi-tiet-ket-qua-thi/chi-tiet-ket-qua-thi.component";
import { TnShiftTestSession } from "@model/tn-shift-test-session";
import { TnShiftStudentTestService } from "@service/luyenthithpt/tn-shift-student-tests.service";
import { TnShiftStudentTest } from "@model/tn-shift-student-test";

@Component({
  selector: "app-ket-qua-thi",
  standalone: true,
  imports: [
    CommonModule,
    ProgressBarModule,
    TooltipModule,
    MatMenuModule,
    TableModule,
    ButtonModule,
    PaginatorModule,
    ChiTietKetQuaThiComponent,
  ],
  templateUrl: "./ket-qua-thi.component.html",
  styleUrls: ["./ket-qua-thi.component.css"],
  encapsulation: ViewEncapsulation.None,
})
export class KetQuaThiComponent {
  read_number = READ_NUMBER;
  dmCathi: TnQLCathi[] = [];
  dmCathiFull = [];
  dmShiftTest = [];
  dmShiftTest_0 = [];
  dmStudentResult = [];
  dmStudentResultFull = [];
  selectedCathi: TnQLCathi;
  isAdmin = false;
  cathiStatus = 1;
  donviId: number;
  teacherFull = [];
  teacherTable = [];
  teacherTabletop = [];
  violationObject = {};
  startProgress = false;
  progressValue = 0;
  isActionDone = false;
  isActionAdd = false;
  isLoading = false;
  keyAnswer = KEY_ANSWER_new;

  title_left = TITLE_LEFT;

  tooltipFilterCathi: "Ca thi đã thi xong" | "Tất cả" = "Ca thi đã thi xong";
  // custom
  searchStudent: string = "";
  page: number = 1;
  rowsCaThi: number = this.themeSettingsService.settings.rows;
  rowsStudent: number = this.themeSettingsService.settings.rows;
  recordsTotalCathi: number = 50;
  recordsTotalStudent: number = 50;
  pageCaThi: number = 1;
  pageStudent: number = 1;
  searchCathi: string = "";
  dmStudentSections: TnShiftStudentTest[] = [];
  selectedListStudent: TnShiftStudentTest[] = [];
  studentSelected: TnStudent;

  // properties for dialog detail student result point
  dialogSate: boolean = null;
  student_id: number = null;
  shift_id: number = null;

  // student session
  studentSessionIds: number[] = [];

  // subject
  // Khai báo Subject với kiểu dữ liệu là object
  inputSearchChanged: Subject<{ search: string; type: string }> = new Subject();
  constructor(
    private helperService: HelperService,
    private tnTestFormService: TnTestFormService,
    public formBuilder: FormBuilder,
    private tnQLCathiService: TnQLCathiService,
    private userService: UserService,
    private authService: AuthService,
    private tnShiftTestService: TnShiftTestService,
    private tnShiftTestQuestionService: TnShiftTestQuestionService,
    private tnChamThiService: TnChamThiService,
    private tnFormDetailService: TnFormDetailService,
    private tnStudentResultService: TnStudentResultService,
    private tnStudentService: TnStudentService,
    private tnBankService: TnBankService,
    private fileService: FileService,
    private httpParamsHelper: HttpParamsHeplerService,
    private notificationService: NotificationService, //private donViService : DonViService ,
    private tnShiftTestSessionService: TnShiftTestSessionService,
    private themeSettingsService: ThemeSettingsService,
    private exportPointWritingService: ExportPointWritingService,
    private tnShiftStudentTestService : TnShiftStudentTestService
  ) {
    this.inputSearchChanged
      .pipe(debounceTime(1000))
      .subscribe(({ search, type }: { search: string; type: string }) => {
        if (type === "cathi") {
          this.searchCathiByInput(search);
        } else {
          this.searchStudenttByInput(search);
        }
      });
  }

  ngOnInit(): void {
    this.loadCathi(this.cathiStatus.toString());
  }

  loadCathi(status: string) {
    this.isLoading = true;
    forkJoin([
      this.tnQLCathiService.getTnQLCathi_fromKetQuaThiLimit(
        this.pageCaThi,
        this.searchCathi,
        status
      ),
      this.userService.getUserByCol("role_ids", "2,6,7"),
    ]).subscribe(([res, teacher]) => {
      this.teacherFull = teacher.filter(
        (m) => m.status !== -1 && m.role_ids.findIndex((i) => i == "1") === -1
      );
      this.teacherTabletop = [...this.teacherFull];
      if (res.data && res.data.length !== 0) {
        this.recordsTotalCathi = res.recordsTotal;

        this.reset();
        const tmpCathi = this.helperService.sort(res.data, "id", -1);

        tmpCathi.forEach((m, index) => {
          if (m.type_bank === "THI") {
            /* update */
            const d = new Date(m.time_start);
            const dateString = d.toLocaleString("en-GB");
            m["__index_table"] = (this.pageCaThi - 1) * 10 + index + 1;
            m["time_start_format"] = dateString;
            return m;
          }
        });
        this.dmCathi = [...tmpCathi];

        this.isLoading = false;
      } else {
        this.reset();
        this.isLoading = false;
      }
    });
  }

  loadStudentSession(): void {
    this.isLoading = true;
    this.tnShiftStudentTestService
      .getLimitedByCaThiId(this.page, this.selectedCathi.id)
      .pipe(
        switchMap((res: { recordsTotal: number; data: TnShiftStudentTest[] }) => {
          let student_ids = res.data.map((item) => item.student_id);
          if(student_ids.length <= 0){
            return of(res);
          }
          // Sử dụng forkJoin để kết hợp hai Observable
          return forkJoin([
            this.tnStudentService.getUserByIds(student_ids),
            this.tnShiftStudentTestService.getByStudentIds(student_ids,this.selectedCathi.id)
          ]).pipe(
            map(([students, shiftStudentTests ]) => {
              // Nhận kết quả từ cả hai API
              

              res.recordsTotal = students.length;
              res.data = res.data.map((d, index) => {
                let student = students.find((item) => item.id == d.student_id);
                let exams = shiftStudentTests.filter(item => item.student_id == d.student_id).sort((a,b) => a.id - b.id) || [];
                // let exam_counts = tnStudentSections.filter(
                //   (s) => s.student_id == d.student_id
                // );
                d["__index_table"] = (this.pageStudent - 1) * 10 + index + 1;
                d["student"] = { ...student };
                d["exam_count"] = exams.length;
                d.total_point = exams[exams.length-1].total_point;
                let maximumPoint: number = 0;
                shiftStudentTests.forEach((item) => {
                  if(item.total_point !== null && item.total_point > maximumPoint && item.student_id === d.student_id) maximumPoint = item.total_point;
                })
                
                // let highestPoints = shiftStudentTests.find(s => s.student_id = d.student_id);
                d["pointHighest"] =  maximumPoint == 0 ? null : maximumPoint;
                
                // d["pointPresent"] = pointPresent;

                // d["student_result"] = tnStudentResult['studentResults'];
                d["student"]["ngaysinh_converted"] = moment(
                  d["student"]["ngaysinh"]
                ).format("DD/MM/YYYY");
                // Xử lý thêm với someData nếu cần
                return d;
              });
              return res;
            })
          );
        })
      )
      .subscribe({
        next: (res) => {

          this.recordsTotalStudent = res.recordsTotal;
          this.dmStudentSections = res.data;
          this.isLoading = false;
        },
        error: (err) => {
          this.isLoading = false;
          console.error(err);
          
        },
      });
  }

  updateSelectedPoint(id: number) {
    this.tnChamThiService.updateTnChamThi(id, { selected_point: 1 }).subscribe(
      () => null,
      (er) => {
      }
    );
  }

  checkStudent(
    shiftTest: TnShiftTest[],
    form: TnTestForm,
    formDetail: TnFormDetail[],
    chamThi: TnChamThi[]
  ): Observable<TnStudentResult[]> {
    const shiftTestIds = [];
    shiftTest.forEach((f) => {
      if (f.student_id && f.code) {
        shiftTestIds.push(f["id"]);
      }
    });
    if (shiftTestIds.length) {
      return this.tnStudentResultService
        .getTTnStudentResultByShiftTest_ids(shiftTestIds)
        .pipe(
          mergeMap((student) =>
            this.xuLyBaiThi(student, shiftTest, form, formDetail, chamThi)
          )
        );
    } else {
      return of(null);
    }
  }

  xuLyBaiThi(
    student: TnStudentResult[],
    shiftTest: TnShiftTest[],
    form: TnTestForm,
    formDetail: TnFormDetail[],
    chamThi: TnChamThi[]
  ): Observable<TnStudentResult[]> {

    const shiftTestIds = [];
    shiftTest.forEach((f) => {
      const index = student.findIndex((m) => m.shift_test_id === f.id);
      if (index === -1 && f.student_id && f.code) {
        shiftTestIds.push(f.id);
      }
    });
    const condition = this.httpParamsHelper
      .paramsConditionBuilder([
        {
          conditionName: "grading_teacher",
          condition: IctuQueryCondition.equal,
          value: "0",
          orWhere: "and",
        },
      ])
      .set("select", "id,result,skill,shift_test_id,part,ordering,group_id")
      .set("include_by", "shift_test_id")
      .set("include", shiftTestIds.toString());

    return this.tnShiftTestQuestionService
      .getTnShiftTestQuestionByCols(condition)
      .pipe(
        mergeMap((questions) =>
          this.chamThi(questions, shiftTest, form, formDetail, chamThi)
        )
      );
  }

  chamThi(
    questions: TnShiftTestQuestion[],
    shiftTest: TnShiftTest[],
    form: TnTestForm,
    formDetail: TnFormDetail[],
    chamThi: TnChamThi[]
  ): Observable<TnStudentResult[]> {
    const results: TnStudentResult[] = [];
    const objectChamthi = {};
    chamThi.forEach((f, key) => {
      if (!objectChamthi[f.shift_test_id.toString().concat(f.skill)]) {
        objectChamthi[f.shift_test_id.toString().concat(f.skill)] = f;
      }
    });
    if (shiftTest.length) {
      shiftTest.forEach((f) => {
        const item = {
          student_id: f["student_id"],
          shift_test_id: f["id"],
          reading_point: null,
          listening_point: null,
          writing_point: null,
          speaking_point: null,
          total_point: null,
        };
        if (f["status"] !== 0) {
          let computerPoint = 0;
          if (form && f["status"] !== 0) {
            formDetail.forEach((fdt, fdtKey) => {
              const eachPartTrue = questions.filter(
                (m) =>
                  m.shift_test_id === f.id &&
                  m.group_id !== 0 &&
                  m["ordering"] === fdt.ordering &&
                  m.result === 1
              );
              const questionNum = questions.filter(
                (m) =>
                  m.shift_test_id === f.id &&
                  m.group_id !== 0 &&
                  m["ordering"] === fdt.ordering
              );
              if (questionNum.length) {
                computerPoint +=
                  (fdt.last_point / questionNum.length) * eachPartTrue.length;
              }
            });
          }

          item.total_point = this.financial(computerPoint);
          results.push(item);
        } else {
        }
      });
    }
    return of(results);
  }

  loadFull(object) {
    const condition = this.httpParamsHelper.paramsConditionBuilder([
      {
        conditionName: "form_id",
        condition: IctuQueryCondition.equal,
        value: object.form_id.toString(),
      },
    ]);
    const condition_0 = this.httpParamsHelper.paramsConditionBuilder([
      {
        conditionName: "shift_id",
        condition: IctuQueryCondition.equal,
        value: object.id.toString(),
      },
    ]);

    const condition_1 = this.httpParamsHelper.paramsConditionBuilder([
      {
        conditionName: "shift_id",
        condition: IctuQueryCondition.equal,
        value: object.id.toString(),
      },
      {
        conditionName: "student_id",
        condition: IctuQueryCondition.notEqual,
        value: "0",
        orWhere: "and",
      },
      // { conditionName: 'code', condition: IctuQueryCondition.notEqual, value: null, orWhere: 'and' },
      // { conditionName: 'status', condition: IctuQueryCondition.notEqual, value: '0', orWhere: 'and' },
    ]);

    forkJoin([
      this.tnShiftTestService.getTnShiftTestByCols(condition_1),
      this.tnTestFormService.getTnTestFormByCol("id", object.form_id),
      this.tnFormDetailService.getTnFormDetailByCols(condition),
      this.tnChamThiService.getTnChamThiByCols(condition_0),
    ])
      .pipe(
        mergeMap(([shiftTest, form, formDetail, chamThi]) =>
          this.checkStudent(shiftTest, form[0], formDetail, chamThi)
        )
      )
      .subscribe((result) => {
        if (result) {
          let i = 0;
          this.startProgress = true;
          this.progressValue = 0;

          result.forEach((f, key) => {
            setTimeout(() => {
              const currentDate = formatDate(
                new Date(),
                "yyyy-MM-ddTHH:mm:ss",
                "en-US"
              );
              const formData = {
                ...f,
                created_at: currentDate,
              };

              this.tnStudentResultService
                .addTnStudentResult(formData)
                .subscribe(() => {
                  i = i + 1;
                  this.progressValue = (i / result.length) * 100;
                  if (i === result.length) {
                    this.startProgress = false;
                    this.progressValue = 0;
                    this.notificationService.toastSuccess(
                      "Đã cập nhât ca thi thành công"
                    );
                    this.tnQLCathiService
                      .updateTnQLCathi(object.id, {
                        status: 3,
                        user_id: this.authService.user.id,
                      })
                      .subscribe(() => {
                        this.loadCathi("2");
                      });
                    this.isActionDone = false;
                  }
                });
            }, 50 * key);
          });
        } else {
          this.notificationService.toastError("Thao tác thất bại");
          // this.tnQLCathiService.updateTnQLCathi(object.id, { status: 3 }).subscribe(() => {
          //     this.loadCathi('2');
          // });
          this.isActionDone = false;
        }
      });
  }

  trudiem(id: number, skill: string, point: number) {
    const res =
      this.violationObject[id] && this.violationObject[id][skill]
        ? point - (this.violationObject[id][skill]["value"] * point) / 100
        : point;
    return res;
  }

  reset() {
    this.dmShiftTest_0 = [];
    this.dmShiftTest = [];
    this.dmCathi = [];
    this.dmCathiFull = [];

    this.selectedCathi = null;
  }

  onSelectedCathi(cathi: TnQLCathi) {
    this.selectedListStudent = [];
    this.searchStudent = "";
    if (!this.selectedCathi || this.selectedCathi.id !== cathi.id) {
      this.selectedCathi = cathi;
      this.loadStudentSession();
    }
  }

  financial(x) {
    return Number.parseFloat(x).toFixed(1);
  }

  financialTotal(x) {
    return Number.parseFloat(x).toFixed(1);
  }

  findCathi(event) {
    if (event) {
      const value = event.target.value;
      this.searchCathi = value;
      this.loadCathi(this.cathiStatus.toString());
    }
  }

  actionDone(cathi: TnQLCathi) {
    this.notificationService
      .confirmDelete("Bạn có chắc chắn lưu kết quả ca thi này?", "Thông báo")
      .then(
        (a) => {
          if (a) {
            this.isActionDone = true;
            this.loadFull(cathi);
          }
        },
        () => null
      );
  }

  changeCathi() {
    this.cathiStatus = this.cathiStatus === 2 ? 1 : 2;
    if(this.tooltipFilterCathi == "Tất cả"){
      this.tooltipFilterCathi = "Ca thi đã thi xong";
    }else this.tooltipFilterCathi = "Tất cả";

    
    this.loadCathi(this.cathiStatus.toString());
  }

  convertDataToExportPdf(data: TnBank, tenDonvi: string) {
    const countbothi = this.dmStudentResult.filter((m) => m.bothi).length;
    const countDat = this.dmStudentResult.filter(
      (m) => !m.bothi && m.dat
    ).length;
    const countKhongdat = this.dmStudentResult.filter(
      (m) => !m.bothi && !m.dat
    ).length;
    const tong = this.dmStudentResult.length;
    const dataExport = [
      [
        { text: "STT", style: "headerCol" },
        { text: "MÃ SINH VIÊN", style: "headerCol" },
        { text: "HỌ TÊN", style: "headerCol" },
        { text: "GIỚI TÍNH", style: "headerCol" },
        { text: "NGÀY SINH", style: "headerCol" },
        { text: "PHÒNG THI", style: "headerCol" },
        { text: "MÃ PHÁCH", style: "headerCol" },
        { text: "NGHE", style: "headerCol" },
        { text: "ĐỌC", style: "headerCol" },
        { text: "NÓI", style: "headerCol" },
        { text: "VIẾT", style: "headerCol" },
        { text: "TỔNG ĐIỂM", style: "headerCol" },
        { text: "KẾT QUẢ", style: "headerCol" },
      ],
    ];
    this.dmStudentResult.forEach((f, key) => {
      dataExport.push([
        { text: (key + 1).toString(), style: "itemCol" },
        { text: f["student_code"], style: "itemCol" },
        { text: f["Hoten"], style: "itemColLeft" },
        { text: f["Gioitinh"], style: "itemCol" },
        { text: f["ngaysinh"], style: "itemCol" },
        { text: f["phongthi"], style: "itemCol" },
        {
          text: "L".concat(
            f["shift_test_id"].toString(),
            " - R",
            f["shift_test_id"].toString(),
            " - W",
            f["shift_test_id"].toString(),
            " - S",
            f["shift_test_id"].toString()
          ),
          style: "itemCol",
        },
        {
          text: this.financial(
            this.trudiem(
              f["shift_test_id"],
              "listening",
              Number(f["listening"])
            )
          ),
          style: "itemCol",
        },
        {
          text: this.financial(
            this.trudiem(f["shift_test_id"], "reading", Number(f["reading"]))
          ),
          style: "itemCol",
        },
        {
          text: this.financial(
            this.trudiem(f["shift_test_id"], "speaking", Number(f["speaking"]))
          ),
          style: "itemCol",
        },
        {
          text: this.financial(
            this.trudiem(f["shift_test_id"], "writing", Number(f["writing"]))
          ),
          style: "itemCol",
        },
        { text: this.financialTotal(f["total"]), style: "itemCol" },
        { text: "", style: "itemCol" },
      ]);
    });
    const docDefinition = {
      pageOrientation: "landscape",
      pageSize: "A2",
      content: [
        {
          text: "đại học thái nguyên".toUpperCase(),
          alignment: "left",
          fontSize: 11,
          margin: [77, 0, 0, 0],
          normal: true,
        },
        {
          text: "Trung tâm Khảo thí và Quản lý CLGD".toUpperCase(),
          alignment: "left",
          fontSize: 11,
          margin: [20, 0, 0, 0],
          normal: true,
          bold: true,
        },
        {
          text: "KẾT QUẢ THI "
            .concat(
              data.name,
              " ",
              this.selectedCathi["name"],
              " ngày ",
              this.selectedCathi["time_start_format"]
            )
            .toUpperCase(),
          alignment: "center",
          fontSize: 18,
          normal: true,
          margin: [0, 5],
          bold: true,
        },
        {
          layout: ["lightHorizontalLines", "lightVerticalLines"], // optional
          table: {
            headerRows: 1,
            widths: [
              31.68, 120.84, 219.12, 84.18, 114.3, 136.68, 210.84, 84.18, 84.18,
              84.18, 84.18, 106.68, 106.68,
            ],
            alignment: "center",
            body: dataExport,
          },
        },
      ],
      defaultStyle: {
        font: "TimesNewRoman",
        fontSize: 11,
      },
      styles: {
        headerCol: {
          bold: true,
          fontsize: 11,
          alignment: "center",
          fillColor: "#f2f2f2",
          margin: [0, 5],
        },
        itemCol: {
          alignment: "center",
          margin: [0, 5],
        },
        itemColLeft: {
          alignment: "left",
          margin: [0, 5],
        },
      },
    };

    const tableLayouts = {
      exampleLayout: {
        hLineWidth: function (i, node) {
          return i === 0 || i === node.table.body.length ? 2 : 1;
        },
        vLineWidth: function (i, node) {
          return i === 0 || i === node.table.widths.length ? 2 : 1;
        },
        hLineColor: function (i, node) {
          return i === 0 || i === node.table.body.length ? "black" : "gray";
        },
        vLineColor: function (i, node) {
          return i === 0 || i === node.table.widths.length ? "black" : "gray";
        },
      },
    };
    pdfMake
      .createPdf(docDefinition, tableLayouts)
      .download(this.selectedCathi.name);
  }

  export(string) {

    // if (this.dmStudentResult && this.selectedCathi) {
    if (this.dmStudentResult && this.selectedCathi) {
      // forkJoin([
      // ])
      let name = "Trường Chính trị tỉnh Thái Nguyên";
      // const index = this.auth.dsDonVi.findIndex((m) => m.id === this.donviId);
      // if (index !== -1) {
      //   name = this.auth.dsDonVi[index]["ten"];
      // }
      this.tnTestFormService
        .getTnTestFormByCol("id", this.selectedCathi.form_id)
        .subscribe((res) => {
          if (res.length) {
            this.tnBankService
              .getTnBankByCol("id", res[0].bank_id)
              .subscribe((bank) => {
                if (bank.length) {
                  if (string === "excel") {
                    this.convertDataToExportExcel(bank[0], name);
                  } else {
                    this.convertDataToExportPdf(bank[0], name);
                  }
                }
              });
          }
        });
    } else {
      this.notificationService.toastWarning("Xin mời chọn ca thi");
    }
  }

  chooseRowTableBottom(index: number) {
    this.teacherTable.splice(index, 1);
  }

  resetTeacherTable() {
    this.teacherTable = [];
  }

  resetProgress(value: boolean) {
    this.startProgress = value;
    this.progressValue = 0;
    this.isActionAdd = value;
  }

  actionBack(shift) {
    if (shift && this.selectedCathi && this.selectedCathi.id === shift.id) {
      this.notificationService
        .confirmDelete("Bạn có chắc chắn rằng ca thi này chưa chấm xong?")
        .then((a) => {
          if (a) {
            let i = 0;
            this.startProgress = true;
            this.isActionDone = true;
            this.dmStudentResultFull.forEach((f, index) => {
              setTimeout(() => {
                this.tnStudentResultService
                  .deleteTnStudentResult(Number(f["id"]))
                  .subscribe(() => {
                    i = i + 1;
                    this.progressValue =
                      (i / this.dmStudentResultFull.length) * 100;
                    if (i === this.dmStudentResultFull.length) {
                      this.tnQLCathiService
                        .updateTnQLCathi(this.selectedCathi.id, {
                          status: 2,
                          user_id: this.authService.user.id,
                        })
                        .subscribe((res) => {
                          this.loadCathi("3");
                          this.isActionDone = false;
                          this.startProgress = false;
                          this.progressValue = 0;
                          this.notificationService.toastSuccess(
                            "Thao tác thành công"
                          );
                        });
                    }
                  });
              }, 50 * index);
            });
          } else {
            this.notificationService.toastInfo("Thao tác đã bị hủy");
            this.isActionDone = false;
          }
        });
    } else {
      this.notificationService.toastWarning(
        "Xin vui lòng click thêm 1 lần nữa để thực hiện thao tác này"
      );
    }
  }

  convertDataToExportExcel(dataBank: TnBank, tenDonvi: string) {
    this.fileService
      .getImageAsBlob(
        "..\\assets\\files\\Danh_sach_thi_sinh_du_thi_mau_qp_ketqua.xlsx"
      )
      .subscribe((res) => {
        const file = res;
        const reader = new FileReader();
        reader.readAsBinaryString(file);
        reader.onloadend = (event) => {
          const localUrl = reader.result;
          const wb: XLSX.WorkBook = XLSX.read(localUrl, { type: "binary" });
          const wsname: string = wb.SheetNames[0];
          const ws: XLSX.WorkSheet = wb.Sheets[wsname];
          const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
          const mergesData = [];
          const mergesDataFooter = [];
          const objectRoom = {};
          let i = 0;
          const footerData = data.splice(37, 6);
          const headerData = data.splice(0, 8);
          const newHeaderData = [];
          const tableHeader = [];
          headerData.forEach((f, key) => {
            if (Array.isArray(f)) {
              if (!f[0]) {
                f[0] = "";
              }
            }
            if (key < 6) {
              newHeaderData.push(f);
            } else {
              tableHeader.push(f);
            }
          });
          const newFooterData = [];
          footerData.forEach((f, key) => {
            if (Array.isArray(f)) {
              if (!f[0]) {
                f[0] = "";
              }
            }
            newFooterData.push(f);
          });
          const today = new Date();
          let _date =
            today.getDate() < 10
              ? "0".concat(today.getDate().toString())
              : today.getDate().toString();
          let _month =
            today.getMonth() + 1 < 10
              ? "0".concat((today.getMonth() + 1).toString())
              : (today.getMonth() + 1).toString();
          let _yeah = today.getFullYear().toString();
          this.dmStudentResult.forEach((f, key) => {
            if (!objectRoom[f["phongthi"]]) {
              objectRoom[f["phongthi"]] = {};
              objectRoom[f["phongthi"]]["dataTable"] = [];
              i = 0;
              i = i + 1;
              objectRoom[f["phongthi"]]["dataTable"].push(
                this.dataByRoom(f, i)
              );
            } else {
              if (Array.isArray(objectRoom[f["phongthi"]]["dataTable"])) {
                i = i + 1;
                objectRoom[f["phongthi"]]["dataTable"].push(
                  this.dataByRoom(f, i)
                );
              }
            }
          });
          Object.keys(objectRoom).forEach((f, key) => {
            objectRoom[f]["header"] = [];
            newHeaderData.forEach((he, heKey) => {
              objectRoom[f]["header"].push([...he]);
            });
            objectRoom[f]["header"][3][0] =
              this.selectedCathi.name.toUpperCase();
            objectRoom[f]["header"][4][0] = "Tên học phần: ".concat(
              dataBank.name
            );
            objectRoom[f]["header"][5][0] = "Ngày thi: ".concat(
              this.selectedCathi.time_start_format.split(",")[0]
            );
            objectRoom[f]["header"][5][5] = "Giờ thi: ".concat(
              this.selectedCathi.time_start_format.split(",")[1]
            );
            objectRoom[f]["header"][5][8] = "- Phòng thi: ".concat(f);
            objectRoom[f]["tableHeader"] = tableHeader;
            objectRoom[f]["footer"] = [];
            newFooterData.forEach((ft, ftKey) => {
              objectRoom[f]["footer"].push([...ft]);
            });
            objectRoom[f]["footer"][1][1] =
              "Số sinh viên: " + objectRoom[f]["dataTable"].length;
            objectRoom[f]["footer"][1][4] =
              "Số bỏ thi: " +
              objectRoom[f]["dataTable"].filter((i) => i[7] === "Bỏ thi")
                .length;
            objectRoom[f]["footer"][2][6] = "Thái Nguyên, ngày ".concat(
              _date,
              " tháng ",
              _month,
              " năm ",
              _yeah
            );
            objectRoom[f]["mergesData"] = [];
            ws["!merges"].map((m) => {
              if (m.s.r < 36) {
                objectRoom[f]["mergesData"].push(
                  this.keyAnswer[m.s.c].concat(
                    (m.s.r + 1).toString(),
                    ":",
                    this.keyAnswer[m.e.c],
                    (m.e.r + 1).toString()
                  )
                );
              } else {
                objectRoom[f]["mergesData"].push(
                  this.keyAnswer[m.s.c].concat(
                    (
                      m.s.r -
                      36 +
                      headerData.length +
                      objectRoom[f]["dataTable"].length
                    ).toString(),
                    ":",
                    this.keyAnswer[m.e.c],
                    (
                      m.e.r -
                      36 +
                      headerData.length +
                      objectRoom[f]["dataTable"].length
                    ).toString()
                  )
                );
              }
            });
          });
          const cols = {
            donvitructhuoc: {
              name: "A1:D1",
              font: { name: "Arial", family: 1, size: 10, bold: true },
              alignment: { vertical: "middle", horizontal: "center" },
            },
            donvo: {
              name: "A2:D2",
              font: { name: "Arial", family: 1, size: 10, bold: true },
              alignment: {
                vertical: "middle",
                horizontal: "center",
                wrapText: true,
              },
            },
            chxhcn: {
              name: "G1:L1",
              font: { name: "Arial", family: 1, size: 10 },
              alignment: {
                vertical: "middle",
                horizontal: "center",
                wrapText: true,
              },
            },
            dltdhp: {
              name: "G2:L2",
              font: { name: "Arial", family: 1, size: 10, underline: true },
              alignment: {
                vertical: "middle",
                horizontal: "center",
                wrapText: true,
              },
            },
            title: {
              name: "A3:L3",
              font: { name: "Arial", family: 1, size: 12, bold: true },
              alignment: {
                vertical: "middle",
                horizontal: "center",
                wrapText: true,
              },
            },
            col_1: {
              name: "L4:L4",
              font: { name: "Arial", family: 1, size: 10 },
              alignment: { vertical: "middle", horizontal: "right" },
            },
            col_2: {
              name: "L5:L5",
              font: { name: "Arial", family: 1, size: 10 },
              alignment: { vertical: "middle", horizontal: "right" },
            },
            col_3: {
              name: "A4:L4",
              font: { name: "Arial", family: 1, size: 12, bold: true },
              alignment: { vertical: "middle", horizontal: "center" },
            },
          };
          const widthPoint = 10;
          const objectColWidth = {
            1: 4,
            2: 4.5,
            3: 25,
            4: 20,
            5: 5,
            6: widthPoint,
            7: widthPoint,
            8: widthPoint,
            9: 15,
            10: widthPoint,
            11: 7,
          };
          // this.exportExcelNewService.exportExcel(
          //   objectRoom,
          //   cols,
          //   objectColWidth,
          //   { name: "Arial", family: 1, size: 10 },
          //   this.selectedCathi.name
          // );
        };
      });
  }

  dataByRoom(f, i) {
    const ho = f["Hoten"]
      .split(" ")
      .splice(0, f["Hoten"].split(" ").length - 1)
      .join(" ");
    const ten = f["Hoten"]
      .split(" ")
      .splice(f["Hoten"].split(" ").length - 1, 1)
      .join(" ");
    let number_string = "";
    if (!f.bothi) {
      const readnumber = f["total"].toString().replace(/\D/gi, "|").split("|");
      number_string =
        readnumber.length < 2
          ? this.read_number.nguyen[readnumber[0].toString()]
          : this.read_number.nguyen[readnumber[0].toString()].concat(
              Number(readnumber[1]) !== 5 ? " phẩy " : " ",
              this.read_number.nguyen[readnumber[1].toString()]
            );
    }
    return [
      i,
      f["code"],
      f["student_code"],
      ho,
      ten,
      f["ngaysinh"],
      "",
      !f["bothi"] ? f["total"].toString().replace(/\D/gi, ",") : f["total"],
      number_string ? number_string : "",
      "",
    ];
  }

  paginateCathi({ page }: PaginatorState) {
    this.pageCaThi = page + 1;
    this.loadCathi(this.cathiStatus.toString());
  }
  paginateStudent({ page }: PaginatorState) {
    this.pageStudent = page + 1;

    if (this.studentSessionIds.length > 0) {
      this.loadStudentSessionByIds(this.studentSessionIds, this.pageStudent);
      return;
    }
    this.loadStudentSession();
  }

  // handle search
  handleChangeSearch(contentSearch: string, type: string): void {
    this.searchStudent = contentSearch;
    this.inputSearchChanged.next({ search: contentSearch.trim(), type });
  }

  searchCathiByInput(searchString: string): void {
    this.searchCathi = searchString;
    this.page = 1;
    this.loadCathi(this.cathiStatus.toString());
  }

  //  search students
  //  search student = search tableStudent -> get (student.id) -> search shift test session by student.id;
  searchStudenttByInput(searchString: string): void {
    if(!searchString){
      this.loadStudentSession(); 
    }
    this.pageStudent = 1;
    this.tnStudentService.getUnlimitedStudentByName(searchString).subscribe({
      next: (res: { recordsTotal: number; data: TnStudent[] }) => {
        let studentIds = res.data.map((item: TnStudent) => item.id);
        this.studentSessionIds = studentIds;
        if(studentIds.length <= 0){
          this.dmStudentSections = [];
          return;
        }
        this.loadStudentSessionByIds(studentIds, this.pageStudent);
      },
      error: (err) => {
        this.notificationService.toastError(
          "Lỗi trong quá trình lấy dữ liệu thí sinh"
        );
      },
    });
  }

  loadStudentSessionByIds(student_ids: number[], page: number): void {

    
    this.isLoading = true;
    this.tnShiftStudentTestService
      .getLimitedByIdsAndShift(student_ids, this.selectedCathi.id, this.pageStudent)
      .pipe(
        switchMap((res: { recordsTotal: number; data: any[] }) => {
          let student_ids = res.data.map((item) => item.student_id);

          // Sử dụng forkJoin để kết hợp hai Observable
          return forkJoin([
            this.tnStudentService.getUserByIds(student_ids),
            this.tnShiftStudentTestService.getByStudentIds(student_ids,this.selectedCathi.id)
          ]).pipe(
            map(([students, shiftStudentTests ]) => {
              // Nhận kết quả từ cả hai API
              

              res.recordsTotal = students.length;
              res.data = res.data.map((d, index) => {
                let student = students.find((item) => item.id == d.student_id);
                // let exam_counts = tnStudentSections.filter(
                //   (s) => s.student_id == d.student_id
                // );
                d["__index_table"] = (this.pageStudent - 1) * 10 + index + 1;
                d["student"] = { ...student };
                d["exam_count"] = shiftStudentTests.filter(item => item.student_id == d.student_id).length;
                let maximumPoint: number = 0;
                shiftStudentTests.forEach((item) => {
                  if(item.total_point !== null && item.total_point > maximumPoint && item.student_id === d.student_id) maximumPoint = item.total_point;
                })
                
                // let highestPoints = shiftStudentTests.find(s => s.student_id = d.student_id);
                d["pointHighest"] =  maximumPoint == 0 ? null : maximumPoint;
                
                // d["pointPresent"] = pointPresent;

                // d["student_result"] = tnStudentResult['studentResults'];
                d["student"]["ngaysinh_converted"] = moment(
                  d["student"]["ngaysinh"]
                ).format("DD/MM/YYYY");
                // Xử lý thêm với someData nếu cần
                return d;
              });
              return res;
            })
          );
        })
      )
      .subscribe({
        next: (res) => {
          this.recordsTotalStudent = res.recordsTotal;
          this.dmStudentSections = res.data;
          this.isLoading = false;
        },
        error: (err) => {
        },
      });
  }

  handleChangeSelectionStudent(): void {
  }

  showDetailStudent(item: any): void {
    this.studentSelected = item.student;
    this.student_id = item.student_id;
    this.shift_id = item.shift_id;

    this.dialogSate = this.dialogSate == null ? true : !this.dialogSate;
  }

  // export point to excel
  // load unlimit student
  loadUnlimitedStudentSession(callback: Function): void {
    this.tnShiftStudentTestService
      .getUnLimitedByCaThiId(this.page, this.selectedCathi.id)
      .pipe(
        switchMap((res: { recordsTotal: number; data: TnShiftStudentTest[] }) => {
          
          let student_ids = res.data.map((item) => item.student_id);

          // Sử dụng forkJoin để kết hợp hai Observable
          return forkJoin([
            this.tnStudentService.getUserByIds(student_ids),
            this.tnShiftStudentTestService.getByStudentIds(student_ids,this.selectedCathi.id)
          ]).pipe(
            map(([students, shiftStudentTests ]) => {
              // Nhận kết quả từ cả hai API
              

              res.recordsTotal = students.length;
              res.data = res.data.map((d, index) => {
                let exams = shiftStudentTests.filter(item => item.student_id == d.student_id).sort((a,b) => a.id - b.id) || [];
                let student = students.find((item) => item.id == d.student_id);
                // let exam_counts = tnStudentSections.filter(
                //   (s) => s.student_id == d.student_id
                // );
                d["__index_table"] = (this.pageStudent - 1) * 10 + index + 1;
                d["student"] = { ...student };
                d["exam_count"] = exams.length;
                d.total_point = exams[exams.length-1].total_point;
                let maximumPoint: number = 0;
                shiftStudentTests.forEach((item) => {
                  if(item.total_point !== null && item.total_point > maximumPoint && d.student_id === item.student_id) maximumPoint = item.total_point;
                })
                
                // let highestPoints = shiftStudentTests.find(s => s.student_id = d.student_id);
                d["pointHighest"] =  maximumPoint == 0 ? null : maximumPoint;
                
                // d["pointPresent"] = pointPresent;

                // d["student_result"] = tnStudentResult['studentResults'];
                d["student"]["ngaysinh_converted"] = moment(
                  d["student"]["ngaysinh"]
                ).format("DD/MM/YYYY");
                // Xử lý thêm với someData nếu cần
                return d;
              });
              return res;
            })
          );
        })
      )
      .subscribe({
        next: (res) => {
          callback(res);
          this.recordsTotalStudent = res.recordsTotal;
          this.dmStudentSections = res.data;
        },
        error: (err) => {
          console.error(err);
          
        },
      });
  }

  // callback(res);
  handleExportPointToExcel(type: string): void {
    if (type === "all") {
      let data: TnShiftTestSession[] = [];
      this.notificationService.isProcessing(true);
      this.loadUnlimitedStudentSession((res) => {
        data = res.data;
        this.exportPointToExcel(data);
      });
    } else {
      if(this.selectedListStudent.length > 0){
        this.notificationService.isProcessing(true);
        this.exportPointToExcel(this.selectedListStudent);
      }else{
        this.notificationService.toastError("Vui lòng chọn thí sinh để xuất file");
      }
    }
  }
  exportPointToExcel(data): void {

    const dataExport = [];
    const header = [
      "Stt",
      "Số báo danh",
      "Họ tên",
      "Ngày sinh",
      "Số lần thi",
      "Điểm",
      "Ghi chú",
    ];
    
    data.forEach((f, key) => {
      let totalPoint = '';
      let pointPresent = f.total_point;
      
      let pointHighest = f["pointHighest"];
      if(f["exam_count"] > 1){
        totalPoint = (pointHighest ?? 'Bỏ thi')  + " | " + (pointPresent ?? 'Bỏ thi');
        // if(pointHighest){
        //   totalPoint += pointHighest
        // }
        // if(pointPresent){
        //   totalPoint += ' | ' + pointPresent
        // }
      }else{
        totalPoint = pointPresent;
      }
      dataExport.push([
        key + 1,
        f["student"]["id"],
        f["student"]["hoten"],
        f["student"]["ngaysinh_converted"],
        f["exam_count"],
        totalPoint ? totalPoint : "bỏ thi",
        "",
      ]);
    });
    


    const countbothi = 0;
    const countDat = 0;
    const countKhongdat = 0;
    const tong = 0;
    const titleFont = {
      name: "Times New Roman",
      family: 1,
      size: 12,
      bold: true,
    };
    const rowFont = { name: "Times New Roman", family: 1, size: 11 };
    const donviFont = {
      name: "Times New Roman",
      family: 1,
      size: 10,
      bold: true,
      underline: true,
    };
    this.exportPointWritingService.exportExcel(
      dataExport,
      header,
      'KẾT Quả PHẦN THI '.toUpperCase(),
      titleFont,
      'A4:G4',
      rowFont,
      rowFont,
      null,
      donviFont,
      countbothi,
      countDat,
      countKhongdat,
      tong,
      this.selectedCathi.name + ' -Kết quả phần thi',
      null,
      null,
      null,
      1,
      this.selectedCathi.name
  );
  this.notificationService.isProcessing(false);
  }
}
