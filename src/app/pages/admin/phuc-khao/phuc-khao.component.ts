import {
  Component,
  ElementRef,
  OnInit,
  QueryList,
  SecurityContext,
  ViewChild,
  ViewChildren,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { OvicDropdownComponent } from "src/app/templates/ovic-dropdown/ovic-dropdown.component";
import { MatMenuModule } from "@angular/material/menu";
import { MatListModule } from "@angular/material/list";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatIconModule } from "@angular/material/icon";
import { NgWaveformComponent } from "@billen/ng-waveform";
import { ButtonModule } from "primeng/button";
import { ProgressBarModule } from "primeng/progressbar";
import { TableModule } from "primeng/table";
import { debounceTime, firstValueFrom, forkJoin, map, of, Subject, switchMap } from "rxjs";
import { OvicGroupsRadioComponent } from "src/app/templates/ovic-groups-radio/ovic-groups-radio.component";
import { TnQLCathi } from "@model/tn-ql-ca-thi";
import { TnShiftTestSession } from "@model/tn-shift-test-session";
import { TnShiftTestQuestion } from "@model/tn-shift-test-question";
import { DomSanitizer } from "@angular/platform-browser";
import { TnStudent } from "@model/tn-student";
import { TnQLCathiService } from "@service/luyenthithpt/tn-ql-ca-thi.service";
import { ThemeSettingsService } from "@service/core/theme-settings.service";
import moment from "moment";
import { TnShiftTestSessionService } from "@service/luyenthithpt/tn-shift-test-session.service";
import { TnStudentService } from "@service/luyenthithpt/tn-student.service";
import { TnShiftTestService } from "@service/luyenthithpt/tn-shift-test.service";
import { TnShiftTest } from "@model/tn-shift-test";
import { PaginatorModule, PaginatorState } from "primeng/paginator";
import { TnShiftTestSessionAnwserService } from "@service/luyenthithpt/tn-shift-test-session-anwser.service";
import { TnShiftTestQuestionService } from "@service/luyenthithpt/tn-shift-test-question.service";
import { TnStudentResult } from "@model/tn-student-result";
import { TnStudentResultService } from "@service/luyenthithpt/tn-student-result.service";
import { NotificationService } from "@theme/services/notification.service";
import { OvicGroupsRadioCustomComponent } from "./components/ovic-groups-radio-custom/ovic-groups-radio-custom.component";
import { DragDropQuestionViewComponent } from "./components/drag-drop-question-view/drag-drop-question-view.component";
import { GroupingQuestionViewComponent } from "./components/grouping-question-view/grouping-question-view.component";
import { TnShiftStudentTestService } from "@service/luyenthithpt/tn-shift-student-tests.service";
import { TnShiftStudentTestsAnswerService } from "@service/luyenthithpt/tn-shift-student-tests-answer.service";
import { TnShiftStudentTest } from "@model/tn-shift-student-test";
import { TnBankQuestionService } from "@service/luyenthithpt/tn-bank-question.service";
import { TnBankQuestion } from "@model/tn-bank-question";
import { IctuMediaLoaderDirective } from "src/app/directives/ictu-media-loader.directive";
import { SafeHtmlPipe } from "src/app/pipes/safe-html.pipe";
import { IncrementNodeNumberPipe } from "./pipes/increment-node-number.pipe";
// ... existing imports ...

interface ResultData {
  studentName: string;
  studentCode: string;
  testCode: string;
  score: number;
  shiftName: string;
  questions: any[]; // Consider defining a more specific type for questions
}

@Component({
  selector: "app-phuc-khao",
  standalone: true,
  imports: [
    CommonModule,
    OvicDropdownComponent,
    MatMenuModule,
    MatListModule,
    MatCheckboxModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    ProgressBarModule,
    OvicGroupsRadioComponent,
    ButtonModule,
    TableModule,
    PaginatorModule,
    OvicGroupsRadioCustomComponent,
    DragDropQuestionViewComponent,
    GroupingQuestionViewComponent,
    IctuMediaLoaderDirective,
    SafeHtmlPipe,
    IncrementNodeNumberPipe
  ],
  templateUrl: "./phuc-khao.component.html",
  styleUrls: ["./phuc-khao.component.css"],
})
export class PhucKhaoComponent implements OnInit {
  @ViewChildren("waveform") waveform: QueryList<NgWaveformComponent>;
  @ViewChild("docx") docx: ElementRef;
  @ViewChild("templateDownload") templateDownload: ElementRef;
  @ViewChild("templateWaiting") templateWaiting: ElementRef;
  dmShift: TnQLCathi[];
  isAdmin = false;
  selectedSession: TnShiftStudentTest;
  selectedCathi: TnQLCathi;
  selectedSessionDetail: TnShiftStudentTest;
  isCloseButton = false;
  dmShiftTestSession: TnShiftStudentTest[];
  dmShiftTestSessionDetail: TnShiftStudentTest[] = [];
  dmShiftTestQuestion: TnShiftTestQuestion[] = [];
  selectedShiftTestSessions: TnShiftStudentTest[];
  selectedShift: TnQLCathi;
  shiftTestQuestion: TnShiftTestQuestion[];
  selectedListStudent: TnShiftStudentTest[];
  test_result: TnStudentResult;
  search: {
    student: string;
    shift: string;
  } = {
    student: "",
    shift: "",
  };
  pageTotalSessionDetail: number = 1;
  pageStudent: number = 1;
  recordsTotalStudent: number = 1;
  recordsTotal = 1;
  recordsTotalSessionDetail = 1;
  rowsTotalSessionDetail = this.themeSettingsService.settings.rows;
  rows = this.themeSettingsService.settings.rows;
  isLoading: boolean = false;

  inputSearchChanged: Subject<string> = new Subject();


  constructor(
    private sanitizer: DomSanitizer,
    private tnQLCathiService: TnQLCathiService,
    private themeSettingsService: ThemeSettingsService,
    private tnShiftTestSessionService: TnShiftTestSessionService,
    private tnStudentService: TnStudentService,
    private tnShiftTestService: TnShiftTestService,
    private tnShiftTestSessionAnwserService: TnShiftTestSessionAnwserService,
    private tnShiftTestQuestionService: TnShiftTestQuestionService,
    private tnStudentResultService: TnStudentResultService,
    private notificationService: NotificationService,
    private tnShiftStudentTestService: TnShiftStudentTestService,
    private tnShiftStudentTestsAnswerService : TnShiftStudentTestsAnswerService,
    private tnBankQuestionService : TnBankQuestionService
  ) {
    this.inputSearchChanged
      .pipe(debounceTime(1000))
      .subscribe((search: string) => {
        this.searchStudentByInput(search);
        
      });
  }

  ngOnInit(): void {
    this.loadInit();
  }

  loadInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading = true;
    this.tnQLCathiService
      .getTnQLCathi_fromKetQuaThiUnLimit(this.search.shift, "1")
      .subscribe({
        next: (res) => {
          this.recordsTotal = res.recordsTotal;
          this.dmShift = res.data;
          this.onSelectedCathi(this.dmShift[0]);
          // this.isLoading = false;
        },
        error: (err) => {
          console.error(err);
          
          this.isLoading = false;
        },
      });
  }

  onSelectedCathi(cathi: TnQLCathi) {

    this.selectedListStudent = [];
    this.search.student = "";
    if (!this.selectedCathi || this.selectedCathi.id !== cathi.id) {
      this.selectedCathi = cathi;
      this.loadStudentSession();
    }
  }

  loadStudentSession(): void {
    this.isLoading = true;
    this.tnShiftStudentTestService
      .getLimitedByCaThiId(this.pageTotalSessionDetail, this.selectedCathi.id)
      .pipe(
        switchMap((res: { recordsTotal: number; data: any[] }) => {
          
          let student_ids = res.data.map((item) => item.student_id);
          if(!student_ids || student_ids.length <= 0){
            return of(res)
          }
          // Sử dụng forkJoin để kết hợp hai Observable
          return forkJoin([
            this.tnStudentService.getUserByIds(student_ids), // API đầu tiên
            this.tnShiftStudentTestService.getAllByStudentIdsAndShiftId(
              student_ids,
              this.selectedCathi.id,
              2
            ),
          ]).pipe(
            map(([students, tnStudentSections]) => {
              // Nhận kết quả từ cả hai API
              
              
              res.recordsTotal = students.length;
              res.data = res.data.map((d, index) => {
                let student = students.find((item) => item.id == d.student_id);
                let exam_counts = tnStudentSections.filter(
                  (s) => {
                    if(s.student_id == d.student_id){
                      s['time_start_converted'] = moment(s.time_start).format('DD/MM/YYYY');
                      return true;
                    }
                    return false;
                  }
                );
                d["__index_table"] = (this.pageStudent - 1) * 10 + index + 1;
                d["student"] = { ...student };
                d["exam_count"] = exam_counts.length;
                d["sessions"] = exam_counts;
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
          if(!res.data || res.data.length <= 0) {
            this.isLoading = false;
            return;
          }
          
          this.recordsTotalStudent = res.recordsTotal;
          this.dmShiftTestSession = res.data.map((item, index) => {
            item["__index_table"] = (this.pageStudent - 1) * 10 + index + 1;
            return item;
          });

          this.isLoading = false;
        },
        error: (err) => {
          this.isLoading = false;
        },
      });
  }

  onSeletedCathi(event: any) {
    this.search.student = "";
    this.selectedCathi = event;
    if (this.selectedSession?.shift_id !== event.id) {
      this.dmShiftTestSessionDetail = [];
      this.dmShiftTestQuestion = [];
    }
    this.loadStudentSession();
  }

  closeLeftBottom() {
    this.isCloseButton = !this.isCloseButton;
  }

  trustHtml(value) {
    return this.sanitizer.bypassSecurityTrustHtml(value);
  }

  showListSesstion(item: TnShiftStudentTest) {
    this.selectedSession = item;
    this.dmShiftTestQuestion = [];
    this.loadListSesstionDetail();
  }

  loadListSesstionDetail() {
    this.dmShiftTestSessionDetail = this.selectedSession["sessions"].sort((a: TnShiftStudentTest, b: TnShiftStudentTest) => b.id - a.id );

    // let listShiftTestIds = this.selectedSession["sessions"].map(
    //   (item: TnShiftStudentTest) => item.shift_test_id
    // );

    // let listShiftestSessionIds = this.selectedSession["sessions"].map(
    //   (item: TnShiftStudentTest) => item.id
    // );

    // forkJoin([
    //   this.tnShiftTestService.getLimitedByIds(listShiftTestIds),
    //   this.tnStudentResultService.getUnlimitedBySesstionIds(
    //     listShiftestSessionIds,
    //     this.selectedSession.student_id
    //   ),
    // ]).subscribe(([res, res2]) => {
    //   // handle shiftest

    //   this.recordsTotalSessionDetail = res.recordsTotal;
      
    //   res.data.map((item: TnShiftTest) => {
    //     let index = this.dmShiftTestSessionDetail.findIndex(
    //       (i) => i.shift_test_id == item.id
    //     );
    //     this.dmShiftTestSessionDetail[index]["shift_test"] = item;

    //     this.dmShiftTestSessionDetail[index]["time_start_converted"] = moment(
    //       this.dmShiftTestSessionDetail[index]["time_start"]
    //     ).format("DD/MM/YYYY");
    //     this.dmShiftTestSessionDetail[index]["time_end_converted"] = moment(
    //       this.dmShiftTestSessionDetail[index]["time_end"]
    //     ).format("DD/MM/YYYY");
    //   });

    //   // handle student result
    //   res2.data.map((item: TnStudentResult) => {
    //     let index = this.dmShiftTestSessionDetail.findIndex(
    //       (i) => i.id == item.shift_test_session_id
    //     );
    //     this.dmShiftTestSessionDetail[index]["student_result"] = item;
    //   });

    // });
  }

  paginateSessionDetail({ page }: PaginatorState) {
    this.pageTotalSessionDetail = page + 1;
    // this.loadData(this.page);
  }

  paginateStudent({ page }: PaginatorState) {
    this.pageStudent = page + 1;
    // this.loadData(this.page);
  }

  //   load deltail shift test session anwser
  loadDetailShiftTestSessionAnwser(item: TnShiftStudentTest) {
    this.notificationService.isProcessing(true);
    this.selectedSessionDetail = item;
    forkJoin([
      this.tnShiftStudentTestsAnswerService.geUlitimited(item.id),
      this.tnShiftStudentTestService.getSesstionAndShiftTest(
        this.selectedSessionDetail.id
      ),
    ]).subscribe(([res1, res2]) => {
      this.notificationService.isProcessing(false);

      let answeds = res1.data;
      let bankQuestions = res2.data[0]['test'].map((item) => {
        item['answer_option'] = JSON.parse(item['answer_option']);
        item['config'] = JSON.parse(item['config']);

        return item;


      });

      bankQuestions = bankQuestions.map((item: TnBankQuestion) => {
        let index = answeds.findIndex(
          (i: any) => i.question_id == item.id
        );

        if (index > -1) {
          item["answer"] = answeds[index].student_answer;
          item["is_correct"] = answeds[index].is_correct;
          item["shift_test_sesstion_anwser_id"] = answeds[index].id;
        }
        return item;
      });


      // Group questions by group_id
      const groupedQuestions = bankQuestions.reduce((acc, question) => {
        if (question.group_id === 0) {
          // Parent question or standalone question
          acc[question.id] = {
            ...question,
            subQuestions: [],
          };
        } else {
          // Child question
          if (!acc[question.group_id]) {
            acc[question.group_id] = {
              ...bankQuestions.find((q) => q.id === question.group_id),
              subQuestions: [],
            };
          }
          acc[question.group_id].subQuestions.push(question);
        }
        return acc;
      }, {});

      // Convert the grouped questions object to an array
      const structuredQuestions = Object.values(groupedQuestions);

      const questionParent = structuredQuestions.filter(
        (item: TnShiftTestQuestion) => item.group_id == 0
      );
      const childQuestion = structuredQuestions.filter(
        (item: any) => item["subQuestions"].length > 0
      );


      let questions = questionParent.map((item: TnShiftTestQuestion) => {
        const child = childQuestion.filter(
          (i: any) => i.subQuestions[0].group_id == item.bank_question_id
        );

        if (child.length > 0) {

          item["subQuestions"] = child[0]["subQuestions"];
          return item;
        }
        return item;
      });

      questions = questions.sort(
        (a, b) => a.ordering - b.ordering
      );

      let __indexQuestion = 1;
      this.dmShiftTestQuestion = questions.map((item, index) => {
        if(item.question_type == 'group'){
          item['__index'] = (__indexQuestion) + '-' + (__indexQuestion + item['subQuestions'].length - 1);
          __indexQuestion += item['subQuestions'].length ;
          return item;
        }
        item['__index'] = (__indexQuestion).toString();
        __indexQuestion++;
        return item;
      })

      


      // You can now use questionsWithAnswers in your component
      //   this.questionsWithAnswers = questionsWithAnswers;
    });
  }

  checkLengthAnswers(ar, value) {
    const regexSrcG = /src="(.*?)"/g;
    if (Boolean((value.match(regexSrcG) || []).length)) {
      if (ar.length % 3 === 0) {
        return "eleaning-group-radio__type-one-base eleaning-group-radio__type-one-three-cols";
      } else {
        return "eleaning-group-radio__type-one-base eleaning-group-radio__type-one-two-cols";
      }
    } else {
      return null;
    }
  }


  // handle search student
  handleSearchStudent(event: any) {
    this.inputSearchChanged.next(event);

  }

  async searchStudentByInput(search: string) {
    if(!search.trim()) {
      this.loadStudentSession();
      return;
    }
    let studentids = await this.searchStudent(search);


    this.loadStudentSessionByStudentIds(studentids);
  }

  async searchStudent(search: string): Promise<number[]> {
    try {
      const res = await firstValueFrom(this.tnStudentService.getUnLimitedStudentByNameOrCode(search));
      return res.data.map(student => student.id);
    } catch (error) {
      console.error('Error searching students:', error);
      return [];
    }
  }

  loadStudentSessionByStudentIds(student_ids: number[]): void {
    this.pageStudent = 1;
    this.tnShiftStudentTestService
      .getLimitedByCaThiIdAndStudentIds(this.pageStudent, this.selectedCathi.id, student_ids)
      .pipe(
        switchMap((res: { recordsTotal: number; data: any[] }) => {
          let student_ids = res.data.map((item) => item.student_id);

          // Sử dụng forkJoin để kết hợp hai Observable
          return forkJoin([
            this.tnStudentService.getUserByIds(student_ids), // API đầu tiên
            this.tnShiftStudentTestService.getAllByStudentIdsAndShiftId(
              student_ids,
              this.selectedCathi.id
            ),
          ]).pipe(
            map(([students, tnStudentSections]) => {
              // Nhận kết quả từ cả hai API

              res.recordsTotal = students.length;
              res.data = res.data.map((d, index) => {
                let student = students.find((item) => item.id == d.student_id);
                let exam_counts = tnStudentSections.filter(
                  (s) => s.student_id == d.student_id
                );
                d["__index_table"] = (this.pageStudent - 1) * 10 + index + 1;
                d["student"] = { ...student };
                d["exam_count"] = exam_counts.length;
                d["sessions"] = exam_counts;
                d["student"]["ngaysinh_converted"] = moment(
                  d["student"]["ngaysinh"]
                ).format("DD/MM/YYYY");
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
          this.dmShiftTestSession = res.data.map((item, index) => {
            item["__index_table"] = (this.pageStudent - 1) * 10 + index + 1;
            return item;
          });

        },
        error: (err) => {
        },
      });
  }



  // handle download

  private generateResultHtml(data: ResultData): string {
    const questionHtml = data.questions
      .map(
        (quest, i) => `
      <div class="import-questTion-option">
        <div class="import-question-direction-child">
          <div class="number_question_question-1">
            <strong style="float: left;margin-right: 4px;">Câu ${
              i + 1
            }.</strong>
            <strong
              ${
                quest.question_type === "complete_word" ||
                quest.question_type === "inputbox"
                  ? 'class="lesson-file-preview-content_text-input-box"'
                  : ""
              }
              >${this.sanitizer.sanitize(
                SecurityContext.HTML,
                quest.question_direction
              )}</strong>
          </div>
          <div>
            ${this.generateAnswerHtml(quest)}
          </div>
        </div>
      </div>
    `
      )
      .join("");

    return `
      <html>
        <head>
          <style>
            ${this.getStyles()}
          </style>
        </head>
        <body style="background-color: #dee2e6;">
          <div class="tn-chamthi-result" style="width: 21cm;
    margin: 0 auto;
    background-color: white;
    padding: 3cm 1cm;">
            <div class="student-info">
              <p class="header_1 header-of-word" style="text-align: center; font-weight: bold;">BÀI THI</p>
              <p class="header_1" style="text-align: center; font-weight: bold; margin-bottom: 1cm;">
                (Ca thi ${data.shiftName})
              </p>
              <p class="header_2">
                <span>Họ và tên: ${data.studentName}</span>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <span>SBD: _${data.studentCode}</span>
              </p>
              <p class="header_2" style="margin-bottom: 1cm">
                <span>Mã đề: ${data.testCode}</span>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <span>Điểm: ${data.score}</span>
              </p>
            </div>
            <div class="tn-chamthi-result-content">
              <div class="question-student-asnwer">
                <strong>Đáp án của sinh viên:</strong>
              </div>
              <div class="student-answer">
                ${questionHtml}
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private getStyles(): string {
    let styles = "";
    const styleSheets = Array.from(document.styleSheets);

    styleSheets.forEach((sheet) => {
      try {
        const cssRules =
          (sheet as CSSStyleSheet).cssRules || (sheet as CSSStyleSheet).rules;
        Array.from(cssRules).forEach((rule) => {
          if (rule instanceof CSSStyleRule) {
            styles += rule.cssText + "\n";
          }
        });
      } catch (e) {
        console.warn("Cannot access stylesheet rules", e);
      }
    });

    // Only add computed styles if this.docx is defined
    if (this.docx && this.docx.nativeElement) {
      const elements = this.docx.nativeElement.querySelectorAll("*");
      elements.forEach((el: HTMLElement) => {
        const computedStyle = window.getComputedStyle(el);
        const elementStyles = Array.from(computedStyle).reduce(
          (str, property) => {
            return `${str}${property}: ${computedStyle.getPropertyValue(
              property
            )};`;
          },
          ""
        );
        styles += `\n/* Computed styles for ${el.tagName.toLowerCase()} */\n${el.tagName.toLowerCase()} { ${elementStyles} }\n`;
      });
    }

    return styles;
  }

  private generateAnswerHtml(quest: any): string {
    switch (quest.question_type) {
      case "radio":
        return this.generateRadioAnswerHtml(quest);
      case "group-radio":
        return this.generateGroupRadioAnswerHtml(quest);
      case "group-input":
        return this.generateGroupInputAnswerHtml(quest);
      default:
        return "";
    }
  }

  private generateRadioAnswerHtml(quest: any): string {
    return `
      <ovic-groups-radio
        [disabled]="true"
        [verticalMode]="true"
        [rawHtml]="true"
        [options]="${JSON.stringify(quest.answer_option)}"
        optionLabel="value"
        optionId="id"
        [classOrther]="${!quest.is_correct ? "has-other-answer" : ""}"
        [ortherDefault]="${quest.answer}"
        [default]="${quest.answer_correct.split("|")[1]}"
      >
      </ovic-groups-radio>
    `;
  }

  private generateGroupRadioAnswerHtml(quest: any): string {
    return quest.subQuestions
      .map(
        (subQuest, subIndex) => `
      <div class="number_question_question">
        <strong style="font-family: 'Times New Roman, Times, serif'">${this.getalphabetletter(
          subIndex
        )}.</strong>&nbsp;
        <div
          ${
            subQuest.question_type === "complete_word" ||
            subQuest.question_type === "inputbox"
              ? 'class="lesson-file-preview-content_text-input-box"'
              : ""
          }
          >${this.sanitizer.sanitize(
            SecurityContext.HTML,
            subQuest.question_direction
          )}</div>
        &nbsp;
      </div>
      <ovic-groups-radio
        [disabled]="true"
        [verticalMode]="true"
        [rawHtml]="true"
        [options]="${JSON.stringify(subQuest.answer_option)}"
        optionLabel="value"
        optionId="id"
        [ortherDefault]="${subQuest.answer}"
        [default]="${subQuest.answer_correct.split("|")[1]}"
        [classOrther]="${!subQuest.is_correct ? "has-other-answer" : ""}"
      >
      </ovic-groups-radio>
    `
      )
      .join("");
  }

  private generateGroupInputAnswerHtml(quest: any): string {
    return quest.subQuestions
      .map(
        (subQuest, subIndex) => `
      <div class="question-title">
        <span style="font-family: 'Times New Roman, Times, serif'">${subIndex}. Câu trả lời</span>&nbsp;
      </div>
      <div class="w-100 d-flex align-items-center">
        <div class="w-50">
          <div class="custom-input ${
            !subQuest.is_correct ? "has-other-answer-input" : ""
          } ${subQuest.is_correct ? "checkmark" : "crossmark"}">
            ${this.sanitizer.sanitize(
              SecurityContext.HTML,
              subQuest.answer ?? ""
            )}
          </div>
        </div>
        <div class="w-50 checkmark" ${
          subQuest.is_correct ? 'style="display:none;"' : ""
        }>
          ${this.sanitizer.sanitize(
            SecurityContext.HTML,
            subQuest.answer_correct.split("|")[1]
          )}
        </div>
      </div>
    `
      )
      .join("");
  }

  getalphabetletter(index: number): string {
    return String.fromCharCode(97 + index);
  }

  downloadCurrentResult() {
    const resultData: ResultData = {
      studentName: this.selectedSession.student.hoten,
      studentCode: this.selectedSession.student.student_code,
      testCode: this.selectedSessionDetail.shift_test.code,
      score: this.selectedSessionDetail["student_result"].total_point,
      shiftName: this.selectedCathi.name,
      questions: this.dmShiftTestQuestion,
    };

    this.downloadResultFromData(resultData);
  }

  private downloadResultFromData(resultData: ResultData) {
    setTimeout(() => {
      const htmlContent = this.generateResultHtml(resultData);
      const blob = new Blob([htmlContent], { type: "text/html" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "result.html";
      a.click();
      window.URL.revokeObjectURL(url);
    }, 0);
  }

  handleDownload(item: TnShiftStudentTest) {
    this.selectedSessionDetail = item;
    this.downloadCurrentResult();
  }
}
