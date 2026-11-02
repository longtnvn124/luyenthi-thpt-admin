import { CommonModule } from "@angular/common";
import {
  Component,
  ElementRef,
  inject,
  OnInit,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
} from "@angular/core";
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";

import { IctuQueryCondition } from "@model/dto";

import {  OvicForm, OvicTableStructure } from "@model/ovic-models";
import { TnQLCathi } from "@model/tn-ql-ca-thi";
import { TnShiftRoom } from "@model/tn-shift-room";
import { TnShiftTest } from "@model/tn-shift-test";
import { TnStudent } from "@model/tn-student";
import { TnTestForm } from "@model/tn-test-form";
import { User } from "@model/user";
import { AuthService } from "@service/core/auth.service";
import { FileService } from "@service/core/file.service";
import { HelperService } from "@service/core/helper.service";
import { HttpParamsHeplerService } from "@service/core/http-params-hepler.service";
import { UserService } from "@service/core/user.service";
import { TnBankQuestionService } from "@service/luyenthithpt/tn-bank-question.service";
import { TnChamThiService } from "@service/luyenthithpt/tn-cham-thi.service";
import { TnFormDetailService } from "@service/luyenthithpt/tn-form-detail.service";
import { TnQLCathiService } from "@service/luyenthithpt/tn-ql-ca-thi.service";
import { TnShiftRoomService } from "@service/luyenthithpt/tn-shift-room.service";
import { TnShiftTestQuestionService } from "@service/luyenthithpt/tn-shift-test-question.service";
import { TnShiftTestService } from "@service/luyenthithpt/tn-shift-test.service";
import { TnStudentService } from "@service/luyenthithpt/tn-student.service";
import { TnTestFormService } from "@service/luyenthithpt/tn-test-form.service";
import { NotificationService } from "@theme/services/notification.service";
import {
  NORMAL_STATUS,
  PROCESS_SHIFT,
  TYPE_CA_THI,
} from "@utilities/syscats";
import { ButtonModule } from "primeng/button";
import { InputTextModule } from "primeng/inputtext";
import { PaginatorModule, PaginatorState } from "primeng/paginator";
import {
  catchError,
  debounceTime,
  forkJoin,
  map,
  of,
  Subject,
  Subscription,
  switchMap,
} from "rxjs";
import { OvicDropdownComponent } from "src/app/templates/ovic-dropdown/ovic-dropdown.component";
import { TableLoaderComponent } from "src/app/templates/table-loader/table-loader.component";
import { ThemeSettingsService } from "@service/core/theme-settings.service";
import { OvicDatePickerComponent } from "src/app/templates/ovic-date-picker/ovic-date-picker.component";
import { RadioButtonModule } from "primeng/radiobutton";
import { TableModule } from "primeng/table";
import { MatMenuModule } from "@angular/material/menu";
import { TooltipModule } from "primeng/tooltip";
import { ProgressBarModule } from "primeng/progressbar";
import { MatDialog } from "@angular/material/dialog";
import { CheckboxModule } from "primeng/checkbox";
import { RoomShiftComponent } from "./components/room-shift/room-shift.component";
import { ImportStudentComponent } from "./components/import-student/import-student.component";

interface FormDmQlCaThi extends OvicForm {
  object: TnQLCathi;
}

@Component({
  selector: "app-ql-ca-thi",
  templateUrl: "./ql-ca-thi.component.html",
  styleUrls: ["./ql-ca-thi.component.css"],
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [
    CommonModule,
    PaginatorModule,
    ButtonModule,
    FormsModule,
    OvicDropdownComponent,
    ReactiveFormsModule,
    TableLoaderComponent,
    InputTextModule,
    OvicDatePickerComponent,
    RadioButtonModule,
    TableModule,
    MatMenuModule,
    TooltipModule,
    ProgressBarModule,
    CheckboxModule,
    RoomShiftComponent,
    ImportStudentComponent
  ],
})
export class QlCaThiComponent implements OnInit {
  handleChangeDonviSubscription: Subscription;
  @ViewChild("formTestForm") formTestForm: ElementRef;
  @ViewChild("templateAddStudent", { static: true })
  templateAddStudent: TemplateRef<any>;
  @ViewChild("inputImport") inputImport: ElementRef;
  @ViewChild("templateAddTest") templateAddTest: ElementRef;
  @ViewChild("templateDuplicateStudent") templateDuplicateStudent: ElementRef;
  @ViewChild("templateDmRoom") templateDmRoom: ElementRef;
  @ViewChild("templateDmClass") templateDmClass: ElementRef;
  @ViewChild("templateSetRoom") templateSetRoom: ElementRef;
  @ViewChild("labelSelectedFileExcel")
  labelSelectedFileExcel: ElementRef<HTMLInputElement>;

  @ViewChild("templateCathi", { static: true }) template: TemplateRef<any>;
  @ViewChild("templateAccessControl", { static: true })
  templateAccessControl: TemplateRef<any>;
  @ViewChild("dialogAccessControl", { static: true })
  dialogAccessControl: TemplateRef<any>;

  @ViewChild("templateRoomShift", { static: true })
  templateRoomShift: TemplateRef<any>;

  @ViewChild("dialogAddAndUpdateRoomShift", { static: true })
  dialogAddAndUpdateRoomShift: TemplateRef<any>;

  @ViewChild("templateImportSelectStudent", { static: true })
  dialogImportSelectStudent: TemplateRef<any>;

  testFormId: number;
  dmTestForm: TnTestForm[];
  dmTestFormBank: TnTestForm[];
  selectedCathi: TnQLCathi;
  dmCathi: TnQLCathi[];
  formData: FormGroup;
  formRoom: FormGroup;
  dmUser: User[];
  dmSinhVienCathi: TnStudent[] = [];
  dmSinhvien: User[];
  dmStudent: TnStudent[];
  dmShiftTest: TnShiftTest[] = [];
  progressValue = 0;
  normalStatus = NORMAL_STATUS;
  processShift = PROCESS_SHIFT;
  formTitle = "Thêm Ca thi mới";
  isAdmin = false;
  canAdded = false;
  canImport = false;
  canUpdate = false;
  canDelete = false;
  startProgress = false;
  isUpdated = false;
  titleIsValid = true;
  slugIsValid = true;
  donviId: number = 1;
  userId: number;
  countProgress: number;
  dmRooom: any;
  dmShiftRoom: TnShiftRoom[];
  shiftRoomId: number;
  teacherRoom: User[];
  isLoading: boolean = false;

  titleForm = "Danh sách ca thi";
  cols: OvicTableStructure[];

  duplicateStudent = [];

  // custom
  lableAttemptCount: "vd: 15..." | "không giới hạn" = "vd: 15...";
  lableTimeLate: "vd: 5..." | "không giới hạn" = "vd: 5...";
  typeCaThi = TYPE_CA_THI;
  index: number = 1;
  btn_checkAdd: "Lưu lại" | "Cập nhật" = "Cập nhật";
  menuName: string = "add_ca_thi";
  formActive: FormDmQlCaThi = {} as FormDmQlCaThi;

  recordsTotal: number = 10;
  recordsTotalStudent: number = 10;
  recordsTotalStudentImport: number = 10;
  page: number = 1;
  pageStudent: number = 1;
  pageStudentImport: number = 1;
  searchStudentImport: string = "";

  rows = this.themeSettingsService.settings.rows;
  search: string = "";
  searchStudent: string = "";
 

  //   nhap sinh vien
  selectedListSinhVien: TnStudent[] = [];
  selectedListSinhVienImport: TnStudent[] = [];
  ListSinhVienImport: TnStudent[] = [];

  //role base access control
  selectedGiangVien: User[] = [];
  selectedGiangVienShift: User[] = [];
  selectedRoom: TnShiftRoom;
  listGiangVien: User[] = [];
  listGiangVienShift: User[] = [];


  private inputChanged: Subject<string> = new Subject<string>();


  constructor(
    private dialog: MatDialog = inject(MatDialog),
    private themeSettingsService: ThemeSettingsService,
    private helperService: HelperService,
    private notificationService: NotificationService,
    private tnTestFormService: TnTestFormService,
    public formBuilder: FormBuilder,
    private auth: AuthService,
    private tnQLCathiService: TnQLCathiService,
    private userService: UserService,
    private tnShiftTestService: TnShiftTestService,
    private tnStudentService: TnStudentService,
    private tnShiftTestQuestionService: TnShiftTestQuestionService,
    private tnChamThiService: TnChamThiService,
    private fileService: FileService,
    private tnFormDetailService: TnFormDetailService,
    private tnBankQuestionService: TnBankQuestionService,
    private tnShiftRoomService: TnShiftRoomService,
    private httpParamsHelper: HttpParamsHeplerService, //** lcms */
  ) {
    this.inputChanged.pipe(debounceTime(1000)).subscribe((item: string) => {
      this.searchContentByInput(item);
    });
    
    this.formData = this.formBuilder.group({
      name: ["", Validators.required],
      donvi_id: 0,
      form_id: ["", Validators.required],
      test_num: ["", Validators.required],
      time_start: ["", Validators.required],
      time_late: "",
      status: ["", Validators.required],
      process: ["", Validators.required],
      user_id: this.userId,
      type_of_shift: [""],
      attemptCount: [0,],
      photo_before_exam: [""],
      photo_during_exam: [""],
      type_bank: [""],
      // online: [""],
      official_test: [""],
    });

    this.formRoom = this.formBuilder.group({
      room: ["", Validators.required],
      shift_id: ["", Validators.required],
      user_id: this.userId,
      teacher_ids: ["", Validators.required],
    });
    const actions = [];
    // if (this.auth.canEdit) {
    //     actions.push('edit');
    // }
    // if (this.auth.canDelete) {
    //     actions.push('delete');
    // }
  }

  preSetupForm(name: string) {
    // this.notificationService.isProcessing(false);

    this.menuName = name;
    if (name === "import_student") {
      let width = window.innerWidth;
      this.notificationService.openSideNavigationMenu({
        name,
        template: this.templateAddStudent,
        size: width,
        offsetTop: "0px",
      });
    } else if (name === "add_ca_thi") {
      this.formActive.type = "ADDITION";
      this.formActive.title = "Thêm mới ca thi";
      this.btn_checkAdd = "Lưu lại";
      this.formReset();
      this.notificationService.openSideNavigationMenu({
        name,
        template: this.template,
        size: 700,
        offsetTop: "0px",
      });
    }
  }

  preSetupFormUpdate(name: string, cathi: TnQLCathi) {
    this.selectedCathi = cathi;
    this.setUpUpdateCaThi();
    if(this.selectedCathi.type_of_shift === 'INDEPENDENT'){
      this.onChangeTypeCaThi({value: 'INDEPENDENT'});
    }
    if (this.selectedCathi.photo_before_exam === 1) {
      this.f["photo_before_exam"].setValue(1);
    } else this.f["photo_before_exam"].setValue(0);
    if (this.selectedCathi.photo_during_exam === 1) {
      this.f["photo_during_exam"].setValue(1);
    } else this.f["photo_during_exam"].setValue(0);

    this.menuName = name;
    this.formActive.title = "Cập nhật ca thi";
    this.formActive.type = "UPDATE";

    this.notificationService.openSideNavigationMenu({
      name,
      template: this.template,
      size: 700,
      offsetTop: "0px",
    });
  }

  // preSetupFormAccessControl(name: string, cathi: TnQLCathi) {
  //   this.selectedCathi = cathi;

  //   this.menuName = name;
  //   this.formActive.title = "Phân quyền theo dõi ca thi";
  //   let width = window.innerWidth;
  //   this.notificationService.openSideNavigationMenu({
  //     name,
  //     template: this.templateAccessControl,
  //     size: 900,
  //     offsetTop: "0px",
  //   });
  // }

  preSetupFormRoom(name: string, cathi: TnQLCathi) {
    this.selectedCathi = cathi;

    this.menuName = name;
    this.formActive.title = "Phòng thi";
    let width = window.innerWidth;
    this.notificationService.openSideNavigationMenu({
      name,
      template: this.templateRoomShift,
      size: 700,
      offsetTop: "0px",
    });
  }

  setUpUpdateCaThi() {
    this.formData.reset({
      name: this.selectedCathi.name,
      donvi_id: this.selectedCathi.donvi_id,
      form_id: this.selectedCathi.form_id,
      test_num: this.selectedCathi.test_num,
      time_start: this.selectedCathi.time_start,
      time_late: this.selectedCathi.time_late !== -1? this.selectedCathi.time_late : null ,
      status: this.selectedCathi.status.toString(),
      process: this.selectedCathi.process.toString(),
      user_id: this.selectedCathi.user_id,
      type_of_shift: this.selectedCathi.type_of_shift,
      type_bank: this.selectedCathi.type_bank,
      online: this.selectedCathi.online,
      official_test: this.selectedCathi.official_test,
      attemptCount: this.selectedCathi.attemptCount !== -1 ? this.selectedCathi.attemptCount : null,
    });
  }

  closeForm() {
    this.formReset();
    this.selectedCathi = null;
    this.notificationService.closeSideNavigationMenu(this.menuName);
    // this.helperService.closeOvicFlexibleTemplate();
  }

  onSearch(event: any) {}

  ngOnInit(): void {
    console.time("Execution Time");
    this.loadCathi();
    console.timeEnd("Execution Time");
  }

  loadCathi() {
    this.isLoading = true;


    forkJoin([
      this.tnQLCathiService.getTnQLCathiLimit(this.page, this.search).pipe(
        switchMap((res: { recordsTotal: number; data: TnQLCathi[] }) => {
          const uniqueUserIds = Array.from(
            new Set(res.data.map((item) => item.user_id))
          );

          return this.userService.getUserByIds(uniqueUserIds).pipe(
            map((users) => {
              const userMap = new Map(users.map((user) => [user.id, user]));

              let datanew = res.data.map((item) => ({
                ...item,
                user_created: userMap.get(item.user_id) || null,
              }));
              return { recordsTotal: res.recordsTotal, data: datanew };
            }),
            catchError(() => of(res))
          );
        })
      ),
      this.tnTestFormService.getAll(),

      this.tnShiftTestService.countAllTnShiftTest(),
      // this.userService.getUserByItemLcms(this.auth.user.email, 'email')
    ]).subscribe((forkRes) => {
      // let data = this.helperService.sort(
      //   forkRes[0].filter((m) => m.status !== -1),
      //   "time_start",
      //   -1
      // );
      this.recordsTotal = forkRes[0].recordsTotal;
      this.dmCathi = forkRes[0].data.map((m, i) => {
        m["__index_table"] = (this.page - 1) * 10 + i + 1;
        m["type_temp"] =
          m.type_of_shift == "INDEPENDENT"
            ? "Thí sinh tự do"
            : "Tổ chức thi";
        return m;
      });

      this.dmTestForm = forkRes[1].data.filter((m) => m.status !== -1);

      this.dmCathi.forEach((item) => {
        for (let index = 0; index < this.dmTestForm.length; index++) {
          if (this.dmTestForm[index].id === item.form_id) {
            item["form"] = this.dmTestForm[index];
          }
        }
      });

      // this.dmUser = forkRes[2].filter(m => m.status !== -1);

      this.dmCathi.forEach((f, index) => {
        // const d = new Date(f.time_start);
        // const dateString = d.toLocaleString("en-GB");
        // f.time_start_format = dateString.slice(0, dateString.length - 3);
        const count = forkRes[2].filter((m) => m.shift_id === f.id).length;
        if (f.id == 40) {
        }
        const countStudentTest = forkRes[2].filter(
          (m) => m.shift_id === f.id && m.student_id
        ).length;
        f["addSpeak"] = countStudentTest ? 1 : 0;
        f["test_num_gen"] = count ? count : 0;
        f["process_check"] = f.process && count === f.test_num ? 0 : 1;
        f["process_check"] = f.status === 4 ? 2 : f["process_check"];
        f["num_student_test"] = f.test_num
          .toString()
          .concat(" - ", count.toString());

      
        const online = f.online ? "Online" : "Offline";
        const thichinhthuc = f.official_test ? "Thi chính thức" : "Thi thử";
        f["typeShift"] = online.concat("/", thichinhthuc);
        f["form"] = this.dmTestForm.filter((item) => item.id === f.form_id)[0];

       
        // f['user_created'] = this.dmUser.filter((item) => item.id === f.donvi_id)[0];
      });

      // this.userLcms = forkRes[4][0];

      this.isLoading = false;
      this.getRoomShift();
    });

 
  }

  getRoomShift(): void{
    if(this.dmCathi.length <= 0) return;
    let listShiftIds = this.dmCathi.map((item: TnQLCathi) => item.id);
    if(listShiftIds.length <= 0) return;
    this.tnShiftRoomService.getAllByShiftIds(listShiftIds).subscribe(
      {
        next: (res) => {
          const roomObj = new Map<number,TnShiftRoom[]>();
          if(res.length > 0){
            res.map((item) => {
              const existingRooms = roomObj.get(item.shift_id) || []; // Lấy danh sách hiện tại hoặc khởi tạo mảng trống
              roomObj.set(item.shift_id, [...existingRooms, item]); // Gộp thêm phần tử mới vào danh sách
            })
          }

          if (roomObj.size > 0) {
            this.dmCathi.map((item) => {
              item['rooms'] = roomObj.get(item.id) || [];
            })

            
          } else {
          }
        }
      }
    )
  }

  get f(): { [key: string]: AbstractControl<any> } {
    return this.formData.controls;
  }

  get fR() {
    return this.formRoom.controls;
  }

  formReset() {
    this.isUpdated = false;
    this.formData.reset();
    this.f["donvi_id"].setValue(this.donviId);
    this.f["time_late"].setValue('');
    // this.f["type"].setValue("normal");
    this.f["type_of_shift"].setValue(this.typeCaThi[1].value);
    this.f["type_bank"].setValue("THI");
    // this.f["online"].setValue("1");
    this.f["attemptCount"].setValue('');
    this.f["official_test"].setValue("1");
    this.f["status"].setValue("1");
    this.f["process"].setValue("1");
    this.f["photo_before_exam"].setValue(0);
    this.f["photo_during_exam"].setValue(0);
  }

  async actionsEvent(event) {
    if (event) {
      this.selectedCathi = this.dmCathi.find((m) => m.id === event.object);

      const index = this.dmTestForm.findIndex(
        (m) => m.id === this.selectedCathi.form_id
      );
      if (index !== -1) {
        this.dmTestFormBank = [...this.dmTestForm].filter(
          (m) => m.bank_id === this.dmTestForm[index].bank_id
        );
      }
      const tmpData = { ...this.selectedCathi };
      // delete tmpData.time_start_format;
      delete tmpData.process_check;
      delete tmpData["addSpeak"];
      delete tmpData["num_student_test"];
      delete tmpData["typeShift"];
      // tmpData.time_start = this.helperService.convertToSqlServerTime(
      //   tmpData.time_start
      // );
      tmpData.status = 4;
      switch (event.action) {
        case "callEditingForm":
          if (this.selectedCathi.status === 2) {
            this.notificationService.toastWarning("Ca thi này đã xong");
          } else {
            if (this.canUpdate) {
              if (this.isAdmin) this.formTitle = "Sửa form";
              this.formReset();
              this.editorForm(this.selectedCathi);
            } else {
              this.notificationService.toastWarning("Bạn không có quyền");
            }
          }
          break;
        case "requireDelete":
          if (this.selectedCathi.status === 2) {
            this.notificationService.toastWarning("Ca thi này đã xong");
          } else {
            if (this.canDelete) {
              this.deleteTestForm(event.object);
            } else {
              this.notificationService.toastWarning("Bạn không có quyền");
            }
          }
          break;
        case "addTest":
          // if (this.canUpdate) {
          this.tnFormDetailService
            .getTnFormDetailByCol("form_id", tmpData.form_id)
            .subscribe((res) => {
              // return;

              if (res && res.length) {
                let flag = true;
                let limit = res[0].limit;
                res.forEach((f, k) => {
                  if (limit !== f.limit) {
                    flag = false;
                  }
                  if (limit === 4 && !f.param) {
                    flag = false;
                  }
                });
                flag =
                  this.dmTestForm[index].scoring_method === "ket" ? flag : true;
                if (flag) {

                  this.checkShiftTestNumber(
                    tmpData,
                    limit ? limit.toString() : null,
                    this.dmTestForm[index].scoring_method
                  );
                } else {
                  this.notificationService.toastWarning(
                    "Giới hạn câu hỏi không thống nhất, hoặc không đầy đủ câu hỏi"
                  );
                }
              } else {
                this.notificationService.toastWarning(
                  "Xin vui lòng kiểm tra lại thông tin form đề"
                );
              }
            });
          // } else {
          //     this.notificationService.toastWarning('Bạn không có quyền');
          // }
          break;
        case "addStudent":

      
          const studentIds = JSON.parse(this.selectedCathi.student_ids || '[]');
          if(studentIds.length <= 0){
            if (!this.selectedCathi?.rooms || this.selectedCathi.rooms.length <= 0) {
              const confirm = await this.notificationService.confirmV2('Ca thi này chưa được tạo phòng, bạn có muốn tiếp tục nhập thí sinh?')
              if(!confirm) return;
            }
          }
          this.dmSinhVienCathi = [];
          if (this.selectedCathi.status === 2) {
            this.notificationService.toastWarning("Ca thi này đã xong");
          } else {
            // new
            this.canUpdate = true;
            // end new

            if (this.canUpdate) {
              this.canImport = false;
              this.formTitle =
                "Danh sách học viên được thêm vào ca thi: " +
                this.selectedCathi.name;
              // this.editStundent(this.selectedCathi);
     
              this.preSetupForm("import_student");
              // this.modalService.open(this.templateAddStudent, MAXIMIZE_MODAL_OPTIONS);
            } else {
              this.notificationService.toastWarning("Bạn không có quyền");
            }
          }
          break;
        case "addStudentSpeak":
          this.dmSinhVienCathi = [];
          if (this.selectedCathi.status === 2) {
            this.notificationService.toastWarning("Ca thi này đã xong");
          } else {
            if (this.canUpdate) {
              this.canImport = false;
              this.formTitle =
                "Danh sách học viên được thêm vào ca thi : " +
                this.selectedCathi.name;
              
              // this.modalService.open(this.templateAddStudent, MAXIMIZE_MODAL_OPTIONS);
            } else {
              this.notificationService.toastWarning("Bạn không có quyền");
            }
          }
          break;
        case "deleteAllShiftTest":
          this.canDelete = true;
          if (this.canDelete) {
            if (this.selectedCathi.status === 2) {
              this.notificationService.toastWarning("Ca thi này đã xong");
            } else if (this.selectedCathi.status === 3) {
              this.notificationService.toastWarning("Ca thi này đã chấm xong");
            } else {
              this.deleteShiftTestALl(this.selectedCathi);
            }
          }
          break;
        case "deleteShift":
          this.canUpdate = true;
          if (this.canUpdate) {
            this.notificationService
              .confirmDelete(
                "- Bạn có chắc chắc chắn ca thi này đã xong?",
                "Cảnh báo"
              )
              .then(
                (a) => {
                  if (a) {
                    this.tnQLCathiService
                      .deleteTnQLCathi(this.selectedCathi.id)
                      .subscribe(
                        (res) => {
                          this.notificationService.toastSuccess(
                            "Xóa ca thi thành công"
                          );
                          this.loadCathi();
                        },
                        () =>
                          this.notificationService.toastError(
                            "Xóa ca thi thất bại"
                          )
                      );
                  }
                },
                () => null
              );
          } else {
            this.notificationService.toastWarning("Bạn không có quyền");
          }
          break;
        // case "roomShift":
        //   this.canUpdate = true;
        //   if (this.canUpdate) {
        //     this.formTitle =
        //       "Phân quyền theo dõi ca thi: " + this.selectedCathi.name;
        //     // this.modalService.open(this.templateDmRoom, MAXIMIZE_MODAL_OPTIONS);
        //     this.preSetupFormAccessControl("accessControl", this.selectedCathi);
        //     // this.loadRoom(this.selectedCathi);
        //     this.loadGiangVien();
        //   } else {
        //     this.notificationService.toastWarning("Bạn không có quyền");
        //   }
        //   break;
        case "roomShift":
          this.canUpdate = true;
          if (this.canUpdate) {
            this.formTitle =
              "Danh sách phòng thi: " + this.selectedCathi.name;
            // this.modalService.open(this.templateDmRoom, MAXIMIZE_MODAL_OPTIONS);
            this.preSetupFormRoom("room", this.selectedCathi);
            // this.loadRoom(this.selectedCathi);
            this.loadGiangVien();
          } else {
            this.notificationService.toastWarning("Bạn không có quyền");
          }
          break;
        case "doneShift":
          this.canUpdate = true;
          if (this.canUpdate) {
            this.updateShiftStatus(2);
          } else {
            this.notificationService.toastError(
              "Bạn không có quyền?",
              "Cảnh báo"
            );
          }
          break;
        default:
          break;
      }
    }
  }

  async updateShiftStatus(status: number) {
    const confirm = await this.notificationService.confirmDelete(
      "- Bạn có chắc chắc chắn ca thi này đã thi xong?",
      "Cảnh báo"
    );
    if (confirm) {
      let data = {
        status: status,
      };

      this.tnQLCathiService
        .updateTnQLCathi(this.selectedCathi.id, data)
        .subscribe({
          next: (res) => {
            this.loadCathi();
          },
          error: (err) => {
            console.error(err);
            
          },
        });
    }
  }



  loadGiangVien() {
    let teacher_ids = this.selectedCathi.teacher_ids
      ? JSON.parse(this.selectedCathi.teacher_ids)
      : [];
    if (!teacher_ids || teacher_ids.length <= 0) {
      this.listGiangVienShift = [];
      return;
    }
    this.userService.getUserByIds(teacher_ids).subscribe({
      next: (res: User[]) => {
        if (res) {
          this.listGiangVienShift = res;
        } else {
          this.listGiangVienShift = [];
        }
      },
      error: (err) => {
        console.error(err);
        
      },
    });
  }

  updateStatusCathi(value) {
    this.tnQLCathiService
      .updateTnQLCathi(this.selectedCathi.id, {
        status: value,
        user_id: this.userId,
      })
      .subscribe(
        (res) => {
          this.notificationService.toastSuccess(
            "Thay đổi trạng thái ca thi thành công"
          );
          this.loadCathi();
        },
        () =>
          this.notificationService.toastError("Thay đổi trạng thái thất bại")
      );
  }

  deleteShiftTestALl(object: TnQLCathi) {
    this.notificationService.confirmDelete().then(
      () =>
        forkJoin([
          this.tnShiftTestService.getTnShiftTestByCol("shift_id", object.id),
          this.tnChamThiService.deleteTnChamThiByShiftId(object.id),
          this.tnQLCathiService.updateTnQLCathi(object.id, {
            status: 1,
            user_id: this.userId,
          }),
        ]).subscribe(
          (res) => {
            const shift_test = res[0];
            const shift_test_ids = [];
            shift_test.forEach((f, index) => {
              shift_test_ids.push(f.id);
            });
            forkJoin([
              this.tnShiftTestService.deleteTnShiftTestByShiftId(object.id),
              this.tnShiftTestQuestionService.deleteTnShiftTestQuestionByShiftTestId(
                shift_test_ids.toString()
              ),
            ]).subscribe(
              (ress) => {
                this.notificationService.toastSuccess(
                  "Xóa toàn bộ đề thành công"
                );
                this.loadCathi();
              },
              () =>
                this.notificationService.toastError(
                  "Xóa toàn bộ đề thi thất bại"
                )
            );
          },
          () =>
            this.notificationService.toastError("Xóa toàn bộ đề thi thất bại")
        ),
      () => null
    );
  }

  checkShiftTestNumber(tmpData: any, limit: string, method: string) {
    const condition_1 = this.httpParamsHelper
      .paramsConditionBuilder([
        {
          conditionName: "shift_id",
          condition: IctuQueryCondition.equal,
          value: tmpData.id.toString(),
        },
      ])
      .set("pluck", "id");
    forkJoin([
      this.tnShiftTestService.getTnShiftTestByCols(condition_1),
      this.tnQLCathiService.getTnQLCathiByCol("id", this.selectedCathi.id),
    ]).subscribe(
      ([res, cathi]) => {
        if (cathi[0].status !== 4) {
          if (res && res.length !== 0 && res.length < tmpData.test_num) {
            const t = this.helperService.sort(res, "id");
            if (t[t.length - 1]["status"] === 0) {
              const delete_shift_test_id = t[t.length - 1].id;
              forkJoin([
                this.tnShiftTestService.deleteTnShiftTest(delete_shift_test_id),
                this.tnShiftTestQuestionService.deleteTnShiftTestQuestionByShiftTestId(
                  delete_shift_test_id
                ),
              ]).subscribe((res) => {
                this.selectedCathi.status = 4;
                this.selectedCathi["process_check"] = 2;
                const num = tmpData.test_num - (t.length - 1);
                this.notificationService.toastSuccess("Đã bắt đầu tạo đề thi");
                this.createShiftTest(tmpData, num, limit, method);
              });
            } else {
              this.selectedCathi.status = 4;
              this.selectedCathi["process_check"] = 2;
              const num = tmpData.test_num - t.length;
              this.notificationService.toastSuccess("Đã bắt đầu tạo đề thi");
              this.createShiftTest(tmpData, num, limit, method);
            }
          } else if (res && res.length === 0) {
            this.selectedCathi.status = 4;
            this.selectedCathi["process_check"] = 2;
            this.notificationService.toastSuccess("Đã bắt đầu tạo đề thi");
            this.createShiftTest(tmpData, tmpData.test_num, limit, method);
          }
        } else {
          this.notificationService.toastWarning("Đề đang được tạo");
          this.loadCathi();
        }
      },
      () => {
        this.notificationService.toastError("Tạo đề thi thất bại");
        return -2;
      }
    );
  }

  createShiftTest(
    tmpData: any,
    test_num: number,
    limit: string,
    method: string
  ) {
    delete tmpData["form"];
    delete tmpData["user_created"];

    delete tmpData["created_at"];
    delete tmpData["created_by"];
    delete tmpData["updated_at"];
    delete tmpData["is_deleted"];
    delete tmpData["deleted_by"];

    // return;

    if (method === "ket") {
      forkJoin([
        this.tnQLCathiService.importTest(tmpData, test_num, limit),
      ]).subscribe(
        () => {
          // this.helperService.toastSuccess('Tạo đề thì hoàn thành');
          this.loadCathi();
        },
        () => this.notificationService.toastError("Tạo đề thi thất bại")
      );
    } else if (method === "normal") {
      forkJoin([
        this.tnQLCathiService.importTestNormal(tmpData, test_num),
      ]).subscribe(
        () => {
          // this.notificationService.toastSuccess('Tạo đề thì hoàn thành');
          this.loadCathi();
        },
        () => this.notificationService.toastError("Tạo đề thi thất bại")
      );
    }
  }

  deleteTestForm(id: number) {
    this.notificationService.confirmDelete().then(
      () => {
        this.tnQLCathiService
          .updateTnQLCathi(id, { status: -1, user_id: this.userId })
          .subscribe(
            () => {
              this.notificationService.toastSuccess("Xóa thành công");
              this.loadCathi();
            },
            () => {
              this.notificationService.toastError("Xóa thất bại");
            }
          );
      },
      () => null
    );
  }

  editorForm(object: TnQLCathi) {
    this.isUpdated = true;
    if (object) {
      this.f["form_id"].setValue(object.form_id);
      // this.f["time_start"].setValue(
      //   this.helperService.convertToSqlServerTime(object.time_start)
      // );
      // this.f["time_late"].setValue(object.time_late);
      this.f["process"].setValue(object.process.toString());
      this.f["status"].setValue(object.status.toString());
      this.f["test_num"].setValue(object.test_num);
      this.f["online"].setValue(object.online.toString());
      this.f["official_test"].setValue(object.official_test.toString());
      // this.helperService.openOvicFlexibleTemplate('templateCathi');
    }
  }

  topBarRightEvent(event) {
    if (event) {
      switch (event) {
        case "addForm":
          this.formTitle = "Tạo mới ca thi";
          // this.helperService.openOvicFlexibleTemplate('templateCathi');
          this.formReset();
          break;
        case "resetData":
          this.loadCathi();
          break;
        default:
          break;
      }
    }
  }

  onChangeCheckBoxAddShift(event: any, property: string) {
    if (this.f[property].value == 0) {
      this.f[property].setValue(1);
    } else this.f[property].setValue(0);
  }

  saveFormData() {
    this.f["user_id"].setValue(this.auth.user.id);

    // return;
    
    
    // return;
    const dataSave = this.formData.value;
    dataSave['time_start'] = this.helperService.convertToSqlServerTime(dataSave['time_start'])
    
    if (this.formData.valid) {

      
      if(!dataSave['time_late']) dataSave['time_late'] = -1; 
    
      if(!dataSave['attemptCount']) dataSave['attemptCount'] = -1;
    
      
      
      if (this.formActive.type === "UPDATE") {
    

        // let date = this.formData.controls['time_start'].value;
        // let dateToSql = this.helperService.convertToSqlServerTime(date);
        // this.formData.controls['time_start'].setValue(dateToSql)
        this.tnQLCathiService
          .updateTnQLCathi(this.selectedCathi.id, dataSave)
          .subscribe(
            () => {
              this.notificationService.toastSuccess("Sửa ca thi thành công");
              this.closeForm();
              this.loadCathi();
            },
            () => {
              this.notificationService.toastError("Sửa ca thi thất bại");
            }
          );
      } else {
      
        this.tnQLCathiService.addTnQLCathi(dataSave).subscribe(
          (res) => {
            this.notificationService.toastSuccess("Thêm ca thi mới thành công");
            this.formReset();
            this.loadCathi();
          },
          () => this.notificationService.toastError("Thêm ca thi mới thất bại")
        );
      }

      this.closeForm();
    } else {
      this.notificationService.toastWarning("Lỗi nhập liệu");
    }

  
  }



 

  // custom
  // add ca thi
  paginate({ page }: PaginatorState) {
    this.page = page + 1;
    this.loadCathi();
  }

  onChangeTypeCaThi(event: any) {
    if (event.value == TYPE_CA_THI[0].value) {
      // neu la thi sinh tu do thi se disable so lan lam bai
      // this.f["attemptCount"].disable();
      this.f["attemptCount"].setValue(null);
      this.f["time_late"].setValue(null);
      // this.f["time_late"].disable();
      this.lableAttemptCount = "không giới hạn";
      this.lableTimeLate = "không giới hạn";
    } else {
      this.f["attemptCount"].enable(); // Nếu không phải thí sinh tự do, enable lại trường 'attemptCount'
      this.f["time_late"].enable(); // Nếu không phải thí sinh tự do, enable lại trường 'attemptCount'
      this.lableAttemptCount = "vd: 15...";
      this.lableTimeLate = "vd: 5...";
    }
  }

  searchContentByInput(text: string) {
    this.page = 1;

    this.search = text.trim();

    this.loadCathi();
  }

  onInputChange(event: string) {
    this.inputChanged.next(event);
  }

  loadAllGiangVien() {
    this.userService.getUserByCol("role_ids", "115").subscribe({
      next: (res: User[]) => {
        let teacher_ids = this.selectedCathi.teacher_ids
          ? JSON.parse(this.selectedCathi.teacher_ids)
          : [];
        let teachers = res.filter((item: User) => {
          if (teacher_ids.includes(item.id)) {
            return true;
          }
          return false;
        });
        this.selectedGiangVien = teachers;
        this.listGiangVien = res;
      },
      error: (err: any) => {
        console.error(err);
        
      },
    });
  }

  // dialog add role
  showDialog() {
    this.loadAllGiangVien();
    this.dialog.open(this.dialogAccessControl, {
      disableClose: true,
      panelClass: "ictu-app-notification",
    });
  }



  hideDialog() {
    this.selectedGiangVien = [];
    this.selectedRoom = null;
    if (this.dialog) {
      this.dialog.closeAll();
    }
  }

  onSelectionChangeGiangVien(event: any) {}

  onSelectionChangeGiangVienShift(event: any) {}

  btnSaveListGiangVien() {
    if (this.selectedGiangVien.length > 0) {
      let data = this.selectedGiangVien.map((item, index) => {
        return item.id;
      });

      this.selectedCathi.teacher_ids = `[${data}]`;

      // return;

      let shift = { ...this.selectedCathi };
      const keysToDelete = [
        "created_at",
        "created_by",
        "deleted_by",
        "is_deleted",
        "updated_at",
        "updated_by",
        "user_id",
        "__index_table",
        "type_temp",
        "form",
        "user_created",
        "addSpeak",
        "process_check",
        "num_student_test",
        "typeShift",
        "test_num_gen",
      ];

      keysToDelete.forEach((key) => delete shift[key]);

      this.tnQLCathiService.updateTnQLCathi(shift.id, shift).subscribe({
        next: (res) => {
          this.listGiangVienShift = [...this.selectedGiangVien];
          this.hideDialog();
        },
        error: (err) => {
          console.error(err);
          
        },
      });
    } else
      return this.notificationService.toastError(
        "Vui lòng chọn ít nhất 1 giảng viên"
      );
  }

  btnSaveShiftRoom() {
    // check length of teacher
    if (this.selectedGiangVien.length <= 0) {
      this.notificationService.toastError("Vui lòng chọn giảng viên coi thi");
      return;
    }
    if (!this.selectedRoom) {
      this.notificationService.toastError("Vui lòng chọn phòng thi");
      return;
    }

    let teacherIds = this.selectedGiangVien.map((item) => {
      return item.id;
    });

    let tnShiftRoomSave: TnShiftRoom = {} as TnShiftRoom;
    tnShiftRoomSave.teacher_ids = "[" + teacherIds.toString() + "]";
    tnShiftRoomSave.shift_id = this.selectedRoom["shiftId"];
    tnShiftRoomSave.room = this.selectedRoom["name"];

    this.tnShiftRoomService.addTnShiftRoom(tnShiftRoomSave).subscribe({
      next: (res) => {
        this.notificationService.toastSuccess("Thao tác thành công");
        this.hideDialog();
      },
      error: (err) => {
        this.notificationService.toastError("Thao tác thất bại");
      },
    });
  }





  // ======================================== phan quyen theo doi ca thi ======================
  async handleDeleteTeacher(teacher: User) {
    const confirm = await this.notificationService.confirmDelete(
      "Bạn chắc chắn muốn xóa giảng viên này khỏi ca thi?"
    );
    if (confirm) {
      let teacher_ids = JSON.parse(this.selectedCathi.teacher_ids);
      teacher_ids = teacher_ids.filter((item, index) => item !== teacher.id);

      this.selectedCathi.teacher_ids = `[${teacher_ids}]`;
      let shift = { ...this.selectedCathi };
      // this.updateShift(shift);

      // delete array listgiangvienshift
      let index = this.listGiangVienShift.findIndex(
        (item, index) => item.id === teacher.id
      );
      if (index !== -1) {
        this.listGiangVienShift.splice(index, 1);
      }
    }
  }

  async deleteMultipleTeacher() {
    const confirm = await this.notificationService.confirmDelete(
      "Bạn chắc chắn muốn xóa các mục đã chọn?"
    );
    if (confirm) {
      let teacher_ids_old = JSON.parse(this.selectedCathi.teacher_ids);
      let teacher_ids_delete = this.selectedGiangVienShift.map(
        (item) => item.id
      );

      // Lọc và xóa các ID có trong teacher_ids_delete khỏi teacher_ids_old
      let updated_teacher_ids = teacher_ids_old.filter(
        (id) => !teacher_ids_delete.includes(id)
      );

      this.selectedCathi.teacher_ids = `[${updated_teacher_ids}]`;
      let shift = { ...this.selectedCathi };
      // this.updateShift(shift);

      this.listGiangVienShift = this.listGiangVienShift.filter((item) => {
        if (updated_teacher_ids.includes(item.id)) {
          return true;
        }
        return false;
      });

      this.selectedGiangVienShift = [];
    }
  }

  // =============================================== student modal ======================================================

  importSinhvien() {
    this.inputImport.nativeElement.click();
  }

  onChangeDateStart(event: any): void{
    this.f['time_start'].setValue(event);
  }
}
