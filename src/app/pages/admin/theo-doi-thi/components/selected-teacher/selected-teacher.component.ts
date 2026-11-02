import { Component, EventEmitter, Input, Output } from "@angular/core";
import { CommonModule } from "@angular/common";
import { debounceTime, finalize, Subject } from "rxjs";
import { ButtonModule } from "primeng/button";
import { DropdownModule } from "primeng/dropdown";
import { PaginatorModule, PaginatorState } from "primeng/paginator";
import { TableModule } from "primeng/table";
import { User } from "@model/user";
import { IctuPaginator } from "@model/dto";
import { TnShiftRoom } from "@model/tn-shift-room";
import { TnShiftRoomService } from "@service/luyenthithpt/tn-shift-room.service";
import { HttpClientModule } from "@angular/common/http";
import { UserService } from "@service/core/user.service";

interface UserExtend extends User {
  __index_table: number;
}

@Component({
  selector: "app-selected-teacher",
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    TableModule,
    PaginatorModule,
    DropdownModule,
  ],
  templateUrl: "./selected-teacher.component.html",
  styleUrls: ["./selected-teacher.component.css"]
})
export class SelectedTeacherComponent {
  @Input({ required: true }) listRooms: TnShiftRoom[];
  @Output() closeDialogByName: EventEmitter<string> = new EventEmitter();
  @Input() set triggerChange(value){

    this.loadAllGiangVien();
  }
  search: string = "";
  isLoading: boolean = true;
  page: number = 1;
  rows: number = 15;
  recordsTotal: number = 0;
  listTeachers: UserExtend[] = [];
  listTeachersSelected: UserExtend[] = [];
  roomSelected: TnShiftRoom;
  private inputChanged$: Subject<string> = new Subject();

  constructor(
    private tnShiftRoomService: TnShiftRoomService,
    private userService: UserService,
  ) {
    this.inputChanged$.pipe(debounceTime(1000)).subscribe((search) => {
      this.searchAllTeacher(search);
    });
  }

  changeSearchInput(event: string): void {
    this.inputChanged$.next(event);
  }

  searchAllTeacher(search: string): void {
    this.search = search;
    this.loadAllGiangVien();
  }

  loadAllGiangVien() {

    const all_teacher_ids: number[] = this.listRooms.reduce(
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


    this.isLoading = true;
    this.userService
      .getTeacherListLimitAssignExam(this.page, this.search, this.rows, "115", all_teacher_ids)
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: (res: IctuPaginator<User>) => {
          this.recordsTotal = res.totalRecords;
          this.listTeachers = res.data.map((teacher, i) => {
            let newTeacher: UserExtend;
            newTeacher = {
              __index_table: (this.page - 1) * 15 + i + 1,
              ...teacher,
            };
            return newTeacher;
          });

          // this.checkTeacherExited();

          // let teacher_ids = this.selectedCathi.teacher_ids
          //   ? JSON.parse(this.selectedCathi.teacher_ids)
          //   : [];
          // let teachers = res.filter((item: User) => {
          //   if (teacher_ids.includes(item.id)) {
          //     return true;
          //   }
          //   return false;
          // });
          // this.selectedGiangVien = teachers;
          // this.listGiangVien = res;
        },
        error: (err: any) => {},
      });
  }

  checkTeacherExited(): void {
    const all_teacher_ids: number[] = this.listRooms.reduce(
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


    if (all_teacher_ids.length > 0) {
      this.listTeachersSelected = this.listTeachers.filter((item) =>
        all_teacher_ids.includes(item.id)
      );
    }
  }

  paginateTeacher({ page }: PaginatorState) {
    this.page = page + 1;
    this.loadAllGiangVien();
  }

  checkAddTeacherNotValid(): boolean {
    if (this.roomSelected && this.listTeachersSelected.length > 0) {
      return false;
    }
    return true;
  }

  saveSelection(): void {
    if (this.listTeachersSelected.length > 0) {
      let teacher_ids: number[] = this.listTeachersSelected.map(
        (item) => item.id
      );
      this.addTeacherToRoom(teacher_ids);
    }
  }

  addTeacherToRoom(teacher_ids: number[]): void {
    let data: Partial<TnShiftRoom> = {
      teacher_ids: JSON.stringify(teacher_ids),
    };

    this.isLoading = true;
    this.tnShiftRoomService
      .updateTnShiftRoom(this.roomSelected.id, data)
      .pipe(
        finalize(() => {
          this.isLoading = false;

        })
      )
      .subscribe({
        next: (res) => {
          this.closeDialog();
        },
        error: (err) => {
          console.error(err);
          
        },
      });
  }

  closeDialog(): void{
    this.closeDialogByName.emit('addTeacher')
  }
}
