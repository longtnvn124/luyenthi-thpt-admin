import { inject , Injectable } from '@angular/core';
import { IctuDocument , IctuDocumentDownloadResult , IctuDriveFile , IctuFile , IctuMedia , IctuPreviewFileContent, OvicFile } from '@model/file';
import { OutputFormat } from 'ngx-image-cropper/lib/interfaces/cropper-options.interface';
import { MatDialog , MatDialogRef } from '@angular/material/dialog';
import { firstValueFrom , lastValueFrom , Observable } from 'rxjs';
import { ACCESS_TOKEN_KEY, getLinkDownload } from '@env';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { OvicAvatarMakerComponent } from 'src/app/templates/ovic-avatar-maker/ovic-avatar-maker.component';

export interface ImageCroppedEvent {
    base64?: string | null;
    width: number;
    height: number;
    cropperPosition: CropperPosition;
    imagePosition: CropperPosition;
    offsetImagePosition?: CropperPosition;
}

export interface CropperPosition {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
}

export interface AvatarMaker {
	error : boolean;
	errorCode : number;
	data : ImageCroppedEvent | any;
	message : string;
}

interface FileExploreSettings extends Object {
	newPreviewer? : boolean;
	gridMode? : boolean;
	multipleMode? : boolean;
	canDelete? : boolean;
	storeLabel? : string[];
	acceptFileType? : string[]; // filter file by file's extension. Eg: ['pdf','doc','docx','ppt','pptx']
	driveFolder? : string;
}

export interface AvatarMakerSetting {
	maintainAspectRatio? : boolean;
	aspectRatio : number;
	resizeToWidth : number;
	imageQuality? : number;
	format? : OutputFormat;
	resizeToHeight? : number;
	cropperMinWidth? : number;
	cropperMinHeight? : number;
	cropperMaxHeight? : number;
	cropperMaxWidth? : number;
	cropperStaticWidth? : number;
	cropperStaticHeight? : number;
	dirRectImage? : {
		enable : boolean;
		dataUrl : string
	};
}

@Injectable( {
	providedIn : 'any'
} )
export class MediaService {

	private dialog : MatDialog = inject( MatDialog );

	constructor(
		private modalService : NgbModal
	){

	}

	// tplDownloadFile( file : IctuFile | IctuDriveFile | IctuDocument ) : Promise<DownloadProcess> {
	// 	const dialogRef : MatDialogRef<DownloadProgressComponent> = this.dialog.open( DownloadProgressComponent , { data : { file } , disableClose : true , panelClass : 'ictu-modal-class ictu-modal-style-02' } );
	// 	return firstValueFrom( dialogRef.afterClosed() );
	// }

	// tplDownloadFileDocument( file : IctuDocument ) : Promise<DownloadProcess> {
	// 	const popup : NgbModalRef            = this.modalService.open( DownloadProgressComponent , { size : 'sm' , backdrop : 'static' , centered : true , windowClass : 'ictu-modal-class ictu-modal-style-02' } );
	// 	popup.componentInstance.fileDocument = file;
	// 	return popup.result;
	// }

	// mediaPlayer( data : IctuMedia ) : Promise<any> {
	// 	const dialogRef : MatDialogRef<MediaPlayerComponent> = this.dialog.open( MediaPlayerComponent , { data , disableClose : true , panelClass : 'ictu-modal-class ictu-modal-no-background --modal-show-full--true' } );
	// 	return firstValueFrom( dialogRef.afterClosed() );
	// }

	callAvatarMaker( options : AvatarMakerSetting ) : Promise<AvatarMaker> {
		const option : NgbModalOptions = {
			size        : 'lg' ,
			backdrop    : 'static' ,
			centered    : true ,
			windowClass : ' ictu-modal-class ovic-modal-no-background'
		};
		
		const panel                    = this.modalService.open( OvicAvatarMakerComponent , option );
		Object.keys( options ).forEach( key => panel.componentInstance[ key ] = options[ key ] );
		
		return panel.result;
	}

}
