import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { OvicFile } from '@model/file';
import { FileService } from '@service/core/file.service';
import { NotificationService } from '@theme/services/notification.service';

@Component({
  selector: 'app-upload-file-drag-drop',
  templateUrl: './upload-file-drag-drop.component.html',
  styleUrls: ['./upload-file-drag-drop.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class UploadFileDragDropComponent implements OnInit {
  @Input() formField: AbstractControl;
  @Input() multiple: boolean;
  @Input() height: string;//300px;
  @Input() width: string;//300px;
  @Input() buttonInput: boolean = false;
  filesList: OvicFile[] = [];

  constructor(
    private fileService: FileService,
    private noitifi: NotificationService
  ) { }

  ngOnInit() {
  }

  onFileDropped(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer?.files) {
      this.handleFileInput(event.dataTransfer.files);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    // Add any additional handling for drag over event if needed
  }

  onDragLeave(event: DragEvent): void {
    // Add any additional handling for drag leave event if needed
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.handleFileInput(input.files);
    }
  }

  handleFileInput(files: FileList): void {
    let i = 0;
    let filesUp = [].slice.call(files);
    const maxSizeMB = 10; // Maximum size allowed in megabytes

    filesUp.forEach((file, index) => {
      if (file.size > maxSizeMB * 1024 * 1024) {
        this.noitifi.toastWarning(`Tệp ${file.name} vượt quá kích thước tối đa ${maxSizeMB} MB`);
        return;
      }
      setTimeout(() => {
        this.fileService.uploadFile(file).subscribe({
          next: (_upload) => {
            i = i + 1;
            this.filesList.push(_upload);
            if (i === files.length) {
              this.formField.setValue(this.filesList);
            }
          },
          error: () => {
            if (i === files.length) {
              this.noitifi.isProcessing(false);
              this.noitifi.toastError("Lấy ảnh thất bại, vui lòng kiểm tra đường truyền");
            }
          }
        })
      }, 100 * index)
    })
  }

  removeFile(index: number): void {
    this.filesList.splice(index, 1);
  }

}
