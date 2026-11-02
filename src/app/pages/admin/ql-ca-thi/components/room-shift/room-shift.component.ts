import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TnShiftRoomService } from '@service/luyenthithpt/tn-shift-room.service';
import { NotificationService } from '@theme/services/notification.service';
import { finalize } from 'rxjs';
import { TnShiftRoom } from '@model/tn-shift-room';

type EventName = 'ADD' | 'UPDATE' | 'DELETE';

@Component({
  selector: 'app-room-shift',
  standalone: true,
  imports: [
    CommonModule,
    InputTextModule,
    FormsModule,
    ButtonModule
  ],
  templateUrl: './room-shift.component.html',
  styleUrls: ['./room-shift.component.css']
})
export class RoomShiftComponent implements OnInit, OnChanges{
  @Input({required: true}) shift_id: number;

  roomName: string;
  isLoading: boolean = false;
  listRooms: TnShiftRoom[] = [];
  selectedRoom: TnShiftRoom;
  isUpDate: boolean = false;

  constructor(
    private tnShiftRoomService : TnShiftRoomService,
    private notificationService : NotificationService
  ){

  }
  ngOnChanges(changes: SimpleChanges): void {
    if(changes['shift_id']){
      this.loadData();
    }
  }
  ngOnInit(): void {
    
  }

  loadData(): void{
    this.isLoading = true;
    this.tnShiftRoomService.getAllTnShiftRoomByShiftId(this.shift_id)
    .pipe(
      finalize(() => {
        this.isLoading = false;
      })
    )
    .subscribe({
      next: (res) => {
        this.listRooms = res;
      },
      error: (err) => {
        
      }
    })
  }

  eventAction(eventName: EventName, item?: TnShiftRoom): void{
    if(item){
      this.selectedRoom = item;
    }
    const handleEvent: Record<EventName, () =>  void> = {
      ADD: this.saveRoom.bind(this),
      DELETE: this.deleteRoom.bind(this),
      UPDATE: this.updateRoom.bind(this)
    }

    if(handleEvent[eventName]){
      handleEvent[eventName]();
    }else{
      console.error(`Unhandled event: ${eventName}`);
    }
  }

  saveRoom(): void{
    if(this.isUpDate){
      this.updateToServer();
      return;
    }
    const data = {
      room: this.roomName,
      shift_id: this.shift_id
    }
    
    if(!this.shift_id || !this.roomName) {
      this.notificationService.toastError('Vui lòng nhập tên phòng !');
    
      return;
    }

    this.isLoading = true;
    this.tnShiftRoomService.addTnShiftRoom(data)
    .pipe(
      finalize(() => {
        this.isLoading = false;
      })
    )
    .subscribe({
      next: (res) => {
        this.roomName = '';
        this.notificationService.toastSuccess('Thêm thành công')
        this.loadData();
      },
      error: (err) => {
        
        this.notificationService.toastError(err.message);
      }
    })
  }

  async deleteRoom(): Promise<void>{
    const confirm = await this.notificationService.confirmDelete();
    if(confirm){
      this.isLoading = true;
      this.tnShiftRoomService.deleteTnShiftRoom(this.selectedRoom.id)
      .pipe(
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: () => {
          this.notificationService.toastSuccess('Xóa thành công')
          this.loadData();
        },
        error: (err) => {
          this.notificationService.toastError('Xóa thất bại');
          
        }
      })
    }
  }

  updateRoom() : void{
    this.isUpDate = true;
    this.roomName = this.selectedRoom.room;
  }

  updateToServer(): void{
    if(!this.shift_id || !this.roomName) {
      this.notificationService.toastError('Vui lòng nhập tên phòng !');
    
      return;
    }
    this.isLoading = true;
    this.tnShiftRoomService.updateTnShiftRoom(this.selectedRoom.id,{room: this.roomName})
    .pipe(
      finalize(() => {
        this.isLoading = false;
      })
    )
    .subscribe({
      next: (res) => {
        this.roomName = '';
        this.notificationService.toastSuccess('Cập nhật thành công')
        this.isUpDate = false;
        this.loadData();
      },
      error: (err) => {
        
        this.notificationService.toastError(err.message);
      }
    })
  }

  closeUpdate(){
    this.isUpDate = false;
    this.roomName = '';
  }

}
