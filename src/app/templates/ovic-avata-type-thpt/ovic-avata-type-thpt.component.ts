import {Component, Input, NgModule, OnInit, SimpleChanges} from '@angular/core';
import {AbstractControl, FormsModule} from "@angular/forms";
import {map} from "rxjs/operators";
// import {TYPE_FILE_IMAGE} from "@shared/utils/syscat";
import { FileService } from '@service/core/file.service';
import { NotificationService } from '@theme/services/notification.service';
import { AvatarMakerSetting, MediaService } from '@service/core/media.service';
import { IctuDocument, OvicFile } from '@model/file';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TYPE_FILE_IMAGE } from '@utilities/syscats';
import { SafeUrlPipe } from "../../pipes/safe-url.pipe";
import { SafeResourceUrlPipe } from "../../pipes/safe-resource-url.pipe";
import { LoadCourseThumbnailDirective } from 'src/app/directives/load-course-thumbnail.directive';

@Component({
    selector: 'ovic-avata-type-thpt',
    templateUrl: './ovic-avata-type-thpt.component.html',
    styleUrls: ['./ovic-avata-type-thpt.component.css'],
    standalone: true,
    imports: [CommonModule, ButtonModule, FormsModule, SafeUrlPipe, SafeResourceUrlPipe,LoadCourseThumbnailDirective]
})
export class OvicAvataTypeThptComponent implements OnInit {
  @Input() site:boolean = false;
  @Input() disabled:boolean = false;
  @Input() formField: AbstractControl;
  @Input() multiple = true;
  @Input() accept = []; // only file extension eg. .jpg, .png, .jpeg, .gif, .pdf
  @Input() aspectRatio:number;// 3 / 2, 2 / 3
  @Input() textView:string='Upload file';
  @Input() height:string;//300px;
  characterAvatar: string = '';

  image: IctuDocument;

  fileList:OvicFile[]=[];
  _accept = '';
  constructor(
    private fileService: FileService,
    private notificationService: NotificationService,
    private mediaService: MediaService
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['accept']) {
      if (this.accept && this.accept.length) {
        this._accept = this.accept.join(',');
      }
    }
  }

  ngOnInit(): void {
  if (this.formField) {
      this.formField.valueChanges.pipe(map(t => (t && Array.isArray(t)) ? t : [])).subscribe((files: OvicFile[]) => {
        this.fileList = files.filter(Boolean).map(file => {
        
          file['link_img'] = file ? this.fileService.getPreviewLinkLocalFile(file): '';
          return file;
        });
        
        this.characterAvatar = this.fileList[0]? this.fileList[0]['link_img'] :'';
        
      });
      if (this.formField.value && Array.isArray(this.formField.value)) {
        this.fileList = this.formField.value.filter(Boolean).map(file => {
          file['link_img'] = file ? this.fileService.getPreviewLinkLocalFile(file): '';
          return file;
        });
        this.characterAvatar = this.fileList[0]? this.fileList[0]['link_img'] :'';
        
      }
      this.formField.valueChanges.subscribe((image: IctuDocument) => { 
        this.image = image;
      });

      this.image = this.formField.value;

    }
    if (this.accept && this.accept.length) {
      this._accept = this.accept.join(',');
    }
  }

  async makeCharacterAvatar(file: File, characterName: string): Promise<File> {
    
    try {
      const options: AvatarMakerSetting = {
        aspectRatio: this.aspectRatio ? this.aspectRatio : 2 / 3,
        resizeToWidth: 300,
        format: 'jpeg',
        cropperMinWidth: 10,
        dirRectImage: {
          enable: true,
          dataUrl: URL.createObjectURL(file)
        }
      };
      const avatar = await this.mediaService.callAvatarMaker(options);
      
      if (avatar && !avatar.error && avatar.data) {
        const none = new Date().valueOf();
        const fileName = characterName + none + '.jpg';
        
        return Promise.resolve(this.fileService.blobToFile(avatar.data.blob, fileName));
      } else {
        return Promise.resolve(null);
      }
    } catch (e) {
      this.notificationService.isProcessing(false);
      this.notificationService.toastError('Quá trình tạo avatar thất bại');
      return Promise.resolve(null);
    }
  }

  typeFileAdd = TYPE_FILE_IMAGE;
  async onInputAvatar(event, fileChooser: HTMLInputElement,index:number) {

    if (fileChooser.files && fileChooser.files.length) {
      if (this.typeFileAdd.includes(fileChooser.files[0].type)){
        const file = await this.makeCharacterAvatar(fileChooser.files[0], fileChooser.files[0].name);
        // upload file to server
        this.fileService.uploadFile(file, 1).subscribe({
          next: fileUl => {
        
            if (this.fileList[index]){
              this.fileList[index] = fileUl;
              this.formField.setValue(this.fileList)
            }else{
              this.fileList = this.fileList.concat(fileUl);
              this.formField.setValue(this.fileList)
            }
          }, error: () => {
            this.notificationService.toastError('Upload file không thành công');
          }
        })
      }else{
        this.notificationService.toastWarning("Định dạng file không phù hợp");
      }
    }
  }

}
