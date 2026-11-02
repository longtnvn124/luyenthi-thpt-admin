import { Component, ElementRef, inject, Input, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, debounceTime, finalize, firstValueFrom, forkJoin, switchMap } from 'rxjs';
import { TnStudentService } from '@service/luyenthithpt/tn-student.service';
import { TnQLCathi } from '@model/tn-ql-ca-thi';
import { TnStudent } from '@model/tn-student';
import moment from 'moment';
import { TooltipModule } from 'primeng/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { ThemeSettingsService } from '@service/core/theme-settings.service';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TnShiftRoom } from '@model/tn-shift-room';
import { TnQLCathiService } from '@service/luyenthithpt/tn-ql-ca-thi.service';
import { NotificationService } from '@theme/services/notification.service';

import * as XLSX from "xlsx";
import { TnShiftTest } from '@model/tn-shift-test';
import { UserService } from '@service/core/user.service';
import { TnShiftTestService } from '@service/luyenthithpt/tn-shift-test.service';
import { HelperService } from '@service/core/helper.service';
import { FileService } from '@service/core/file.service';
import saveAs from "file-saver";
import { DropdownModule } from 'primeng/dropdown';
import { TnShiftRoomService } from '@service/luyenthithpt/tn-shift-room.service';

@Component({
  selector: 'app-import-student',
  standalone: true,
  imports: [
    CommonModule,
    TooltipModule,
    PaginatorModule,
    TableModule,
    ButtonModule,
    DropdownModule
  ],
  templateUrl: './import-student.component.html',
  styleUrls: ['./import-student.component.css']
})
export class ImportStudentComponent {

  @Input({required: true}) selectedCathi: TnQLCathi;
  @Input({required: true}) set selectedCathiId(value: number){
    
    this.dmSinhVienCathi = [];
    this.recordsTotalStudent = 0;
    this.pageStudent = 1;
    this.searchStudent = "";
    this.searchStudentImport = "";
    this.loadData();
    this.loadRooms();
  }
  @ViewChild("templateImportSelectStudent", { static: true })
  dialogImportSelectStudent: TemplateRef<any>;

  @ViewChild("labelSelectedFileExcel")
  labelSelectedFileExcel: ElementRef<HTMLInputElement>;

  private inputStudentChanged: Subject<string> = new Subject<string>();
  private inputStudentImportChanged: Subject<string> = new Subject<string>();
  pageStudent: number = 1;
  pageStudentImport: number = 1;
  searchStudent: string = "";
  searchStudentImport: string = "";
  dmSinhVienCathi: TnStudent[] = [];
  recordsTotal = 0;
  recordsTotalStudent = 0;

  selectedListSinhVienImport: TnStudent[] = [];
  isLoading: boolean = false;
  ListSinhVienImport: TnStudent[] = [];
  recordsTotalStudentImport: number = 10;
  rows = this.themeSettingsService.settings.rows;

  listRooms: TnShiftRoom[] = [];
  selectedRoom: TnShiftRoom;
  selectedListSinhVien: TnStudent[] = [];
  dmShiftTest: TnShiftTest[] = [];
  duplicateStudent = [];
  countProgress: number;
  startProgress = false;
  userId: number;
  progressValue = 0;
  existRoom: TnShiftRoom;
  listStudentIds: number[] = [];
  allShiftStudentIds: number[] = [];
  filteredStudent_ids: number[] = [];

  canImport = false;
  canUpdate = false;
  canDelete = false;
  constructor(
    private tnStudentService: TnStudentService,
    private dialog: MatDialog = inject(MatDialog),
    private themeSettingsService: ThemeSettingsService,
    private tnQLCathiService: TnQLCathiService,
    private notificationService: NotificationService,
    private userService: UserService,
    private tnShiftTestService: TnShiftTestService,
    private helperService: HelperService,
    private fileService: FileService,
    private tnShiftRoomService : TnShiftRoomService
  ){

    this.inputStudentChanged
      .pipe(debounceTime(1000))
      .subscribe((item: string) => {
        this.searchContentByInputStudent(item);
      });

      this.inputStudentImportChanged
      .pipe(debounceTime(1000))
      .subscribe((item: string) => {
        this.searchContentByInputStudentImport(item);
      });
  }

  loadRooms(){
    this.listRooms = this.selectedCathi.rooms || [];
  }

  loadData(): void{
    
    if(this.selectedCathi.id){
      this.isLoading = true;
      this.tnShiftRoomService.getAllTnShiftRoomByShiftId(this.selectedCathi.id)
      .subscribe({
        next: (res) => {
          this.listRooms = res;
          let studentIds: number[] = [];


          if(this.selectedRoom){
            this.selectedRoom = res.find(item => item.id === this.selectedRoom.id);
            studentIds = JSON.parse(this.selectedRoom.student_ids) || []

          }else{
            this.listRooms.map((item) => {
              if(item.student_ids){
                let studentIdRoom = JSON.parse(item.student_ids) || [];
                if(studentIdRoom.length > 0){
                  studentIds = [...studentIds, ...studentIdRoom];
                }
              }
            })
          }

          this.listRooms.map((item) => {
              if(item.student_ids){
                let studentIdRoom = JSON.parse(item.student_ids) || [];
                if(studentIdRoom.length > 0){
                  this.allShiftStudentIds = [...studentIds, ...studentIdRoom];
                }
              }
            })

          this.listStudentIds = studentIds;
          this.setUpStudentForImportShift(studentIds);


        },
        error: (err) => {
          console.error(err);
          
        }
      })
    }
  }

  setUpStudentForImportShift(studentIds: number[]): void {
    if (studentIds.length > 0) {
      // let student_ids = JSON.parse(this.selectedCathi.student_ids);
      
      if (!studentIds || studentIds.length <= 0) {
        this.dmSinhVienCathi = [];
        this.recordsTotal = 0;
        return;
      }
      this.tnStudentService
        .getStudentByIds(studentIds, this.pageStudent, this.searchStudent)
        .pipe(
          finalize(() => {
            this.isLoading = false;
          })
        )
        .subscribe({
          next: (res) => {
            this.recordsTotalStudent = res.recordsTotal;
            this.dmSinhVienCathi = res.data.map((item, index) => {
              item["__index_table"] = (this.pageStudent - 1) * 10 + index + 1;
              item["ngaysinhConvert"] = moment(item.ngaysinh).format(
                "DD/MM/YYYY"
              );

              return item;
            });
          },
          error: (err) => {
            console.error(err);
            
          },
        });
    } else {
      this.dmSinhVienCathi = [];
      this.recordsTotal = 0;
      this.isLoading = false;
    }
  }



  getFilteredStudents(
    student_id_searched: number[],
    listStudentIds: number[]
  ): number[] {
    // Lọc ra các ID thỏa mãn
    const filteredStudents = listStudentIds.filter((id) =>
      student_id_searched.includes(id)
    );

    this.recordsTotalStudent = filteredStudents.length;
  
    // Tính toán phân trang
    const startIndex = (this.pageStudent - 1) * 10;
    const endIndex = this.pageStudent * 10;
  
    // Lấy danh sách phân trang
    return filteredStudents.slice(startIndex, endIndex);
  }

  searchStudentInported(): void{
    
    if(!this.searchStudent.trim()){
      
      this.loadData();
    }else{
      this.tnStudentService.getUnLimitedStudentByNameOrCode(this.searchStudent)
      .pipe()
      .subscribe({
        next: (res) => {
          let student_id_searched: number[] = res.data.map((item) => {
            return item.id;
          })

          
          if(this.selectedRoom){
            const student_room_id = JSON.parse(this.selectedRoom.student_ids) || [];
            
            if(student_room_id.length <= 0) {
              this.dmSinhVienCathi = [];
              this.recordsTotal = 0;

              return;
            }
            const filteredStudents = student_room_id.filter((id) =>
              student_id_searched.includes(id)
            );
            this.filteredStudent_ids = filteredStudents;
            this.setUpStudentForImportShift(filteredStudents);
          }else{
            const filteredStudents = this.listStudentIds.filter((id) =>
              student_id_searched.includes(id)
            );
            this.filteredStudent_ids = filteredStudents;
            this.setUpStudentForImportShift(filteredStudents);
          }
          

          

        }
      })
    }
  }


  onInputChangeStudent(event: string) {
    this.inputStudentChanged.next(event);
  }

  searchContentByInputStudent(text: string) {
    this.pageStudent = 1;

    this.searchStudent = text.trim();

    this.searchStudentInported();

  }

  btnSelectStudentExit() {
    
    if(!this.selectedRoom) return this.notificationService.toastWarning('Vui lòng chọn phòng thi');
    this.showDialogSelectStudentExit();
  }

  showDialogSelectStudentExit() {
    this.selectedListSinhVienImport = [];
    this.loadStudentImport();
    this.dialog.open(this.dialogImportSelectStudent, {
      disableClose: true,
      width: "1024px",
      panelClass: "ictu-app-notification",
    });
  }

  loadStudentImport() {
    // this.isLoading = true;
    this.tnStudentService
      .getLimit(
        this.pageStudentImport,
        { search: this.searchStudentImport, statusStudent: 1 },
        30
      )
      .subscribe({
        next: (res: { recordsTotal: number; data: TnStudent[] }) => {


          if (res.data.length > 0) {
            this.ListSinhVienImport = res.data.map((item, index) => {
              item["__ngay_sinh_converted"] = moment(item.ngaysinh).format(
                "DD/MM/YYYY"
              );
              item["__index_table"] =
                (this.pageStudentImport - 1) * 10 + index + 1;
              if (
                this.allShiftStudentIds.length > 0 &&
                this.allShiftStudentIds.includes(item.id)
              ) {
                this.selectedListSinhVienImport.push(item);
              }
              return item;
            });

            this.recordsTotalStudentImport = res.recordsTotal;
          } else {
            this.ListSinhVienImport = [];
            this.recordsTotalStudentImport = 10;
          }
          this.isLoading = false;
        },
      });
  }

  paginateStudent({ page }: PaginatorState) {
    this.pageStudent = page + 1;
    if(this.searchStudent.trim()){
      this.setUpStudentForImportShift(this.filteredStudent_ids);
    }else{
      this.loadData();
    }
    // this.loadData(this.page);
  }

  hideDialog() {
    
    if (this.dialog) {
      this.dialog.closeAll();
    }
  }


  btnSaveImportSelectStudent() {
    let studentSelectedIds = this.selectedListSinhVienImport.map((item) => item.id) || [];
    let studentIds = studentSelectedIds.filter((item) => !this.allShiftStudentIds.includes(item));
    
    this.updateStudentToRoom(this.selectedRoom.id,studentIds, this.resultInport.bind(this));
    
    

    // studentIds = [...new Set(studentIds)];
    // this.selectedCathi.student_ids = JSON.stringify(studentIds);
    // this.updateShift(this.selectedCathi);
  }

  resultInport(success: boolean, message?: string): void{
    this.hideDialog();
    this.searchStudentInported();
    if(success){
      this.notificationService.toastSuccess('Thành công');
    }else if(!success){
      this.notificationService.toastError('Thất bại');

    }
  }



  updateShift(shift: TnQLCathi) {
    // const keysToDelete = [
    //   "created_at",
    //   "created_by",
    //   "deleted_by",
    //   "is_deleted",
    //   "updated_at",
    //   "updated_by",
    //   "user_id",
    //   "__index_table",
    //   "type_temp",
    //   "form",
    //   "user_created",
    //   "addSpeak",
    //   "process_check",
    //   "num_student_test",
    //   "typeShift",
    //   "test_num_gen",
    // ];

    // keysToDelete.forEach((key) => delete shift[key]);

    // return;
    this.tnQLCathiService
      .updateTnQLCathi(shift.id, { student_ids: shift.student_ids })
      .subscribe({
        next: (res) => {
          this.notificationService.toastSuccess("Thao tác thành công");
          this.loadData();
          this.hideDialog();
          this.selectedListSinhVienImport = [];
          this.selectedListSinhVien = [];
        },
        error: (err) => {
          this.notificationService.toastError("Thao tác thất bại");
        },
      });
  }

  async changeInputImport(event) {
    if (event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.readAsArrayBuffer(file);
  
      reader.onloadend = async () => {
        const localUrl = reader.result;
        const wb: XLSX.WorkBook = XLSX.read(localUrl, { type: "binary" });
  
        const rawDataExcel = [];
        const invalidRooms = [];
  
        // Kiểm tra tất cả các phòng
        for (const sheetName of wb.SheetNames) {
          const ws: XLSX.WorkSheet = wb.Sheets[sheetName];
          const sheet = XLSX.utils.sheet_to_json(ws, { header: 1 });
  
  
          const room = sheet[4][7]?.split(":")[1]?.trim(); // Lấy thông tin phòng
  
          if (!room) {
            invalidRooms.push({ sheet: sheetName, room: null });
            continue;
          }
  
          let existingRoom_id = this.listRooms.find(item => item.room === room)?.id || null;
  
          if (!existingRoom_id) {
            const newRoom = {
              shift_id: this.selectedCathi.id,
              room: room,
            };
  
            try {
              existingRoom_id = await firstValueFrom(this.tnShiftRoomService.addTnShiftRoom(newRoom));
            } catch (error) {
              invalidRooms.push({ sheet: sheetName, room });
            }
          }
  
          if (!existingRoom_id) {
            invalidRooms.push({ sheet: sheetName, room });
          }
        }
  
        // Xử lý khi có phòng không hợp lệ
        if (invalidRooms.length > 0) {
          this.notificationService.toastError(
            `Thiếu thông tin phòng thi trong các sheet:\n${invalidRooms
              .map((room) => `Sheet: ${room.sheet}, Room: ${room.room || "N/A"}`)
              .join("\n")}`
          );
          return;
        }
  
        // Khi tất cả phòng hợp lệ, thực hiện xử lý dữ liệu
        for (const sheetName of wb.SheetNames) {
          const ws: XLSX.WorkSheet = wb.Sheets[sheetName];
          const sheet = XLSX.utils.sheet_to_json(ws, { header: 1 });
  
          const room = sheet[4][7]?.split(":")[1]?.trim();
          const existingRoom_id = this.listRooms.find(item => item.room === room)?.id;
  
          sheet
            .filter((m) => m[0] && m[1] && m[2] && m[3] && m[4])
            .forEach((sh) => {
              rawDataExcel.push([
                sh[0],
                sh[1].concat(" ", sh[2]), // tên và họ
                sh[3].trim(), // ngày tháng năm sinh
                "-", // giới tính
                sh[4].trim(), // email
                sh[5].trim(), // số điện thoại
                existingRoom_id,
              ]);
            });
        }
  
  
        // Gọi hàm xử lý dữ liệu sau kiểm tra
        this.convertToSqlData(rawDataExcel);
      };
    }
  }
  


  async convertToSqlData(data: any) {
    
    if (data.length) {
      const newData = data;
      const email = {};
      const emailAlready = [];
      const lengthShiftTest = this.dmShiftTest;
      const hasUserAlready = [];
      const objectDuplicate = {};
      const student_ids = []; // ids of students to update table 'shift' => column : student_ids
      const roomsAndStudentObj = new Map<number, number[]>();
      const promises = [];
      this.duplicateStudent = [];

      // if (newData.length > this.selectedCathi.test_num) {
      //   this.notificationService.toastWarning(
      //     "Số thí sinh vượt quá số đề khả dụng: ".concat(
      //       (newData.length - lengthShiftTest.length).toString(),
      //       "thí sinh"
      //     )
      //   );
      //   this.startProgress = false;
      // } else {
      this.countProgress = 0;
      this.startProgress = true;
      newData.forEach((f, key) => {

        if (f[1] && f[2] && f[4]) {
          if (!objectDuplicate[f[5]]) {
            objectDuplicate[f[5]] = { ...f };
          } else {
            this.duplicateStudent.push(objectDuplicate[f[5]]);
            objectDuplicate[f[5]]["duplicate"] = true;
            this.duplicateStudent.push(f);
          }
          if (!objectDuplicate[f[5]]["duplicate"]) {
            const arDay = f[2] ? f[2].trim().split(/\D/) : null;
            let newDay = "";
            let passwordStudent = "";
            if (arDay && arDay.length === 3) {
              newDay += arDay[2];
              passwordStudent = arDay[2];
              if (Number(arDay[1]) < 10) {
                newDay += "-0".concat(Number(arDay[1]).toString());
                passwordStudent = "0".concat(
                  Number(arDay[1]).toString(),
                  passwordStudent
                );
              } else {
                newDay += "-".concat(arDay[1]);
                passwordStudent = "".concat(
                  arDay[1].toString(),
                  passwordStudent
                );
              }
              if (Number(arDay[0]) < 10) {
                newDay += "-0".concat(Number(arDay[0]).toString());
                passwordStudent = "0".concat(
                  Number(arDay[0]).toString(),
                  passwordStudent
                );
              } else {
                newDay += "-".concat(arDay[0]);
                passwordStudent = "".concat(
                  arDay[0].toString(),
                  passwordStudent
                );
              }
            }
            if (!email[f[4]]) {
              email[f[4]] = 1;
              const newUser = {
                username: f[4] ? f[4].trim().toLowerCase() : null,
                display_name: f[1] ? f[1].trim() : null,
                phone: f[5].trim().toLowerCase(),
                donvi_id: null,
                password: f[2] ? passwordStudent.concat("@Aa") : null,
                email: f[4] ? f[4] : null,
                // role_ids: [8],
                status: 1,
                donvi_ids: null,
              };
              const arrNameStudent = f[1] ? f[1].trim().split(" ") : null;
              const firstName = arrNameStudent
                ? arrNameStudent[arrNameStudent.length - 1]
                : null;

              const newStudent = {
                gioitinh: null,
                email: f[4] ? f[4].trim().toLowerCase() : null,
                phone: f[5].trim().toLowerCase(),
                ten: firstName ? firstName.trim() : null,
                hoten: f[1] ? f[1].trim() : null,
                status: 1,
                ngaysinh: newDay,
                student_code: null,
                creator_id: this.userId,
              };

              // return;
              const promise = new Promise<void>((resolve) => {
                setTimeout(() => {
                  forkJoin([
                    this.tnStudentService.getTnStudentByItem(
                      f[4].trim().toLowerCase(),
                      "email"
                    ),
                    this.userService.getUserByItem(
                      f[4].trim().toLowerCase(),
                      "email"
                    ),
                  ]).subscribe(
                    (student) => {
                      if (student[0] && student[1]) {
                        student_ids.push(student[0].id);
                        if(f[6]){
                          const existingRooms = roomsAndStudentObj.get(f[6]) || []; 
                          roomsAndStudentObj.set(f[6], [...existingRooms, student[0].id])

                        }

                        resolve();
                        // );
                      } else if (!student[0] || student[0].length === 0) {
                        if (student[1] && student[1].length) {
                        } else {
                          this.userService
                            .create(newUser)
                            .pipe(
                              switchMap((user_id: number) => {
                                const student_save = {
                                  ...newStudent,
                                  user_id: user_id,
                                };
                                return this.tnStudentService.addTnStudent(
                                  student_save
                                );
                              })
                            )
                            .subscribe(
                              (student_id: number) => {
                                student_ids.push(student_id);
                                if(f[6]){
                                  const existingRooms = roomsAndStudentObj.get(f[6]) || []; 
                                  roomsAndStudentObj.set(f[6], [...existingRooms,student_id])
        
                                }
                                resolve();
                              },
                              () => {
                                this.notificationService.toastError(
                                  "Thêm thất bại, xin vui lòng ấn (f5) và import lại"
                                );
                              }
                            );
                        }
                      }
                    },
                    () =>
                      this.notificationService.toastError(
                        "Thêm thất bại, xin vui lòng ấn (f5) và import lại"
                      )
                  );
                }, 100 * key);
              });

              promises.push(promise);
            } else {
              emailAlready.push(f);
              this.mathProgress(newData.length, hasUserAlready);
            }
          } else {
            this.mathProgress(newData.length, hasUserAlready);
          }
        }
      });

      this.checkAndUpdateWithProgress(promises, student_ids, roomsAndStudentObj);

      // }
    } else {
      this.notificationService.toastWarning(
        "Vui lòng kiểm tra lại file import"
      );
    }
  }


  mathProgress(length, hasUserAlready) {
    this.countProgress = this.countProgress + 1;
    this.progressValue = (this.countProgress / length) * 100;
    if (this.progressValue === 100 || this.countProgress === length) {
      if (hasUserAlready.length) {
        const arrEmail = [];
        hasUserAlready.forEach((f, key) => {
          arrEmail.push(f["email"]);
        });
        this.notificationService
          .confirmDelete(
            "Những email đã có quyền từ cấp giáo viên, xin vui lòng kiểm tra lại: \n" +
              arrEmail.join(" \n")
          )
          .then(
            (a) => {},
            () => null
          );
      }
      if (this.duplicateStudent && this.duplicateStudent.length !== 0) {
        // this.modalService.open(this.templateDuplicateStudent, LARGE_MODAL_OPTIONS);
      }
      this.notificationService.toastSuccess("Thêm thành công");
      this.startProgress = false;
      this.editStundent(this.selectedCathi);
    }
  }

  async checkAndUpdateWithProgress(promises, student_ids: number[], roomsAndStudentObj: Map<number, number[]>){
    
    
    let completedPromises = 0;
      const totalPromises = promises.length;
      let percent = 0;
      let show = true;
    
      // Mở ProgressBar
      const modalRef = this.notificationService.ProgressBarWithPercent(percent, show);
    
      // Theo dõi từng Promise
      const wrappedPromises = promises.map((promise) =>
        promise.finally(() => {
          completedPromises++;
          percent = Math.floor((completedPromises / totalPromises) * 100);
          modalRef.componentInstance.percent = percent; // Cập nhật giá trị phần trăm
        })
      );
    
      // Đợi tất cả Promise hoàn thành
      try {
        await Promise.all(wrappedPromises).then(() => {
          roomsAndStudentObj.forEach((value, key) => {
            this.updateStudentToRoom(key,value); // Gọi hàm với value
          });
        });
        setTimeout(() => {
          percent = 101;
          modalRef.componentInstance.percent = percent; // Đảm bảo thanh hoàn tất khi xong
          modalRef.componentInstance.show = false; // Đóng modal
        }, 1000);
      } catch (error) {
        console.error('Lỗi trong Promise:', error);
        modalRef.componentInstance.show = false; // Đóng modal nếu có lỗi
      }
    

      try {
        const result = await modalRef.result;
        if (result) {
          // Thực hiện hành động tiếp theo tại đây
          this.updateStudentShift(student_ids);
        } else {
        }
      } catch (error) {
        console.log(error);
        
      }
  }

  updateStudentToRoom(
    room_id: number,
    studentIds: number[],
    callback?: (success: boolean, message?: string) => void
  ): void {
  
    this.tnShiftRoomService.getbyId(room_id).subscribe({
      next: (res) => {
  
        // Xử lý student_ids hiện tại
        let studentRoomIds: number[] = [];
        if (res.student_ids) {
          try {
            studentRoomIds = JSON.parse(res.student_ids); // Chuyển đổi từ JSON sang mảng
          } catch (error) {
            console.error("Invalid JSON format for student_ids:", error);
            callback(false, "Invalid student_ids format");
            return;
          }
        }
  
        // Hợp nhất và loại bỏ trùng lặp
        studentRoomIds = Array.from(new Set([...studentRoomIds, ...studentIds]));
  
        // Chuẩn bị dữ liệu để cập nhật
        const dataUpdate = {
          student_ids: JSON.stringify(studentRoomIds),
        };
  
  
        // Gửi yêu cầu cập nhật
        this.tnShiftRoomService.updateTnShiftRoom(room_id, dataUpdate).subscribe({
          next: (updateRes) => {
            callback(true, "Update successful");
          },
          error: (err) => {
            console.error("Error Updating Room:", err);
            callback(false, "Error updating room");
          },
        });
      },
      error: (err) => {
        console.error("Error Fetching Room Data:", err);
        callback(false, "Error fetching room data");
      },
    });
  }
  
  


  editStundent(object: TnQLCathi) {
    // this.isLoading = true;
    this.tnShiftTestService.getTnShiftTestById(object.id).subscribe((res) => {
      if (res && res.length !== 0) {
        const idStundent = [];
        this.dmSinhVienCathi = [];

        this.dmShiftTest = res;

        res.forEach((f, key) => {
          if (f.student_id) {
            idStundent.push(f.student_id);
          }
        });

        if (idStundent.length) {
          this.tnStudentService
            .getUserByIds(idStundent)
            .subscribe((student) => {
              this.canImport = true;
              if (student.length < this.dmShiftTest.length) {
                this.canImport = true;
              }
              if (student && student.length !== 0) {
                const dSSinhvien = [];
                this.dmShiftTest.forEach((f, key) => {
                  if (f.student_id) {
                    const a = student.find((m) => m.id === f.student_id);
                    const date = new Date(a.ngaysinh);
                    const dateString = date.toLocaleString("en-GB");
                    a["code"] = f.code;
                    a["room"] = f.room;
                    a["ngaysinhConvert"] = dateString.slice(
                      0,
                      dateString.length - 10
                    );
                    a["shift_test_id"] = f.id;
                    dSSinhvien.push({ ...a });
                  }
                });
                this.dmSinhVienCathi = this.helperService.sort(
                  dSSinhvien.filter((m) => m["code"]),
                  "ten"
                );
              }
            });
        } else {
          this.canImport = true;
        }
      }

      this.isLoading = false;
    });
  }


  updateStudentShift(student_ids: number[]) {
    this.tnQLCathiService.getTnQLCathiById(this.selectedCathi.id).subscribe({
      next: (shift: TnQLCathi) => {
        if (shift) {
          let student_ids_string;
          let student_ids_arr = [];
          if (!shift.student_ids) {
            student_ids_arr = student_ids;
            student_ids_string = student_ids.join(",");
          } else {
            let arrstudentOld = JSON.parse(shift.student_ids);
            let newArrStudentIds = [...arrstudentOld, ...student_ids];
            student_ids_arr = [...new Set(newArrStudentIds)];

            if (newArrStudentIds.length > student_ids_arr.length) {
              this.notificationService.toastError("Thí sinh bị trùng lặp");
              return;
            }
          }

          // if (student_ids_arr.length > shift.test_num) {
          //   this.notificationService.toastError(
          //     "Số lượng thí sinh vượt quá số lượng đề"
          //   );
          //   return;
          // }

          shift.student_ids = `[${student_ids_arr}]`;
          this.selectedCathi.student_ids = shift.student_ids;
          delete shift["created_at"];
          delete shift["created_by"];
          delete shift["deleted_by"];
          delete shift["is_deleted"];
          delete shift["updated_at"];
          delete shift["updated_by"];
          delete shift["user_id"];
          delete shift["time_start"];
          this.tnQLCathiService.updateTnQLCathi(shift.id, shift).subscribe({
            next: (res) => {
              this.notificationService.toastSuccess("Thao tác thành công");
              this.loadData();
            },
            error: (err) => {
              this.notificationService.toastError("Thao tác thất bại");
            },
          });
        }
      },
      error: (err) => {
        console.error(err);
        
      },
    });
  }

  downloadEvent() {
    // this.fileService
    //   .getImageAsBlob(
    //     "..\\assets\\files\\Danh_sach_thi_sinh_du_thi_mau_qp.xlsx"
    //   )
    //   .subscribe((res) => {
    //     saveAs(res, "Danh_sach_thi_sinh_du_thi_mau.xlsx");
    //   });

    this.fileService
      .getImageAsBlob(
        "..\\assets\\files\\Danh_sach_thi_sinh_du_thi_mau_luyen_thi.xlsx"
      )
      .subscribe((res) => {
        saveAs(res, "Danh_sach_thi_sinh_du_thi_mau_luyen_thi.xlsx");
      });
  }

  handleClickSlelectFileExcel() {
    this.labelSelectedFileExcel.nativeElement.click();
  }

  async handleDeleteStudent() {
    let confirm = await this.notificationService.confirmDelete(
      "Bạn chắc chắn muốn xóa những thí sinh đã chọn"
    );
    if (!confirm) return;

    // Danh sách các ID đã chọn để xóa
    const student_ids_selected = this.selectedListSinhVien.map(
      (item) => item.id
    );

    if (student_ids_selected.length <= 0) {
      this.notificationService.toastWarning(
        "Không có thí sinh nào được chọn 😊!"
      );
      return;
    }

    // Danh sách các ID hiện tại
    const student_ids_old = JSON.parse(this.selectedCathi.student_ids);

    // Lọc ra các ID không nằm trong danh sách cần xóa
    let student_ids_new = student_ids_old.filter(
      (id) => !student_ids_selected.includes(id)
    );

    // return;
    student_ids_new = [...new Set(student_ids_new)];
    if (student_ids_new.length > 0) {
      this.selectedCathi.student_ids = JSON.stringify(student_ids_new);
    } else {
      this.selectedCathi.student_ids = null;
    }

    let shift = { ...this.selectedCathi };
    this.updateShift(shift);
  }


  onSelectionChangeStudentImport(event: any) {
  }

  onSelectionChange(event: TnStudent[]): void {
    this.selectedListSinhVien = event;
  }

  onSearchStudentImport(event) {
    this.inputStudentImportChanged.next(event);
  }

  searchContentByInputStudentImport(search: string) {
    this.pageStudentImport = 1;
    this.searchStudentImport = search;
    this.loadStudentImport();
  }

  paginateStudentImport({ page }: PaginatorState) {
    this.pageStudentImport = page + 1;
    this.loadStudentImport();
  }

  onChangeRoom(): void{

    this.pageStudent = 1;
    if(this.searchStudent.trim()){
      
      this.searchStudentInported();
    }else{
      
      this.loadData();
    }
  }
}
