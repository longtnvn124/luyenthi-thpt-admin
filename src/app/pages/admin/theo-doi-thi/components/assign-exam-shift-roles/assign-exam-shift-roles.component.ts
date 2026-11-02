import { Component, Input, TemplateRef, ViewChild } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ButtonModule } from "primeng/button";
import { NotificationService } from "@theme/services/notification.service";
import { TableModule } from "primeng/table";
import { User } from "@model/user";
import { UserService } from "@service/core/user.service";
import { TnQLCathi } from "@model/tn-ql-ca-thi";
import { PaginatorModule, PaginatorState } from "primeng/paginator";
import { IctuPaginator } from "@model/dto";
import { BehaviorSubject, debounceTime, delay, finalize, Subject } from "rxjs";
import { TnShiftRoom } from "@model/tn-shift-room";
import { TnShiftRoomService } from "@service/luyenthithpt/tn-shift-room.service";
import { DropdownModule } from "primeng/dropdown";
import { SelectedTeacherComponent } from "../selected-teacher/selected-teacher.component";

interface UserExtend extends User {
  __index_table: number;
  room?: TnShiftRoom;
}

@Component({
  selector: "app-assign-exam-shift-roles",
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    TableModule,
    PaginatorModule,
    DropdownModule,
    SelectedTeacherComponent
  ],
  templateUrl: "./assign-exam-shift-roles.component.html",
  styleUrls: ["./assign-exam-shift-roles.component.css"],
})
export class AssignExamShiftRolesComponent {
  @Input({ required: true }) shift: TnQLCathi;
  @Input({ required: true }) set shift_id(value: number) {
    this.roomSelected = null;
    this.loadAllShiftRoom();
    
  }
  triggerForChilden: boolean = false;

  @ViewChild("templateAddTeacher") templateAddTeacher: TemplateRef<any>;

  listTeachers: UserExtend[] = [];
  listTeachersSelected: UserExtend[] = [];
  listRooms: TnShiftRoom[] = [];
  roomSelected: TnShiftRoom;

  isLoading: boolean = false;
  recordsTotal: number = 0;
  recordsTotalTeacher: number = 0;
  page = 1;
  pageTeacher: number = 1;
  rows = 15;
  search: string = "";

  private inputChanged$: Subject<string> = new Subject();

  constructor(
    private notificationService: NotificationService,
    private userService: UserService,
    private tnShiftRoomService: TnShiftRoomService
  ) {
    this.inputChanged$.pipe(debounceTime(1000)).subscribe((search) => {
 
        this.searchTeacherImported(search);
 
    });
  }

  loadAllShiftRoom(): void {
    this.tnShiftRoomService
      .getAllTnShiftRoomByShiftId(this.shift.id)
      .subscribe({
        next: (res) => {

          this.listRooms = res || [];
          this.loadTeacher();

        },
      });
  }

  loadTeacher(): void {
    let all_teacher_ids: number[] = [];
    if(!this.roomSelected){
      all_teacher_ids = this.listRooms.reduce(
        (teacher_ids: number[], item) => {
          try {
            const ids: number[] = JSON.parse(item.teacher_ids) || []; // Parse teacher_ids thành mảng
            if (Array.isArray(ids) && ids.length > 0) {
              return teacher_ids.concat(ids); // Kết hợp teacher_ids hiện tại với ids
            }
          } catch (error) {
            console.error("Error parsing teacher_ids for item:", item, error);
          }
          return teacher_ids; // Giữ nguyên teacher_ids nếu không có gì để thêm
        },
        []
      );
    }else{
      all_teacher_ids =  JSON.parse(this.roomSelected.teacher_ids) || [];
    }

    if(all_teacher_ids.length <= 0){
      this.listTeachers = [];
      return;
    }
  
    this.isLoading = true;
    this.userService
      .getUserLimitByIds(this.page, this.rows,all_teacher_ids)
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: (res: IctuPaginator<User>) => {
  
          this.recordsTotal = res.totalRecords;

          this.listTeachers = res.data.map((teacher, i) => {
            // Tìm phòng của giáo viên
            const room = this.listRooms.find((room) => {
              try {
                const ids: number[] = JSON.parse(room.teacher_ids) || [];
                return ids.includes(teacher.id);
              } catch (error) {
                console.error("Error parsing teacher_ids for room:", room, error);
                return false;
              }
            });
  
            // Tạo đối tượng giáo viên mới có thông tin phòng
            let newTeacher: UserExtend = {
              __index_table: (this.page - 1) * 15 + i + 1,
              room: room || null, // Gắn phòng hoặc null nếu không tìm thấy
              ...teacher,
            };
  
            return newTeacher;
          });

          
        },
        error: (err: any) => {
          console.error("Error loading teachers:", err);
        },
      });
  }
  

  

  btnAssignExamShiftRoles(): void {
    this.triggerForChilden = !this.triggerForChilden;
    this.listTeachers = [];
    this.listTeachersSelected =[];
    this.roomSelected = null;
    this.notificationService.createDialog.open(this.templateAddTeacher, {
      width: "1024px",
      id: "addTeacher",
    });
  }

  closeDialogByName(dialogName: string) {
    this.search = "";
    this.listTeachers = [];
    this.listTeachersSelected =[];
    this.roomSelected = null;
    const dialogRef =
      this.notificationService.createDialog.getDialogById(dialogName);
    if (dialogRef) {
      dialogRef.close();
    } else {
    }

    this.loadAllShiftRoom();
  }

  changeSearchInput(
    event: string
  ): void {
    this.inputChanged$.next(event);
  }

  

  searchTeacherImported(search: string): void {
    this.search = search;
  }

  changeRoomSelected(): void{
    this.loadTeacher();
    
  }

  paginate({ page }: PaginatorState) {
    this.page = page + 1;
    this.loadTeacher();
  }
  
}
