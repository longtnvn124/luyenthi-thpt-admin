import { AfterViewInit , Component , ElementRef , Inject , OnInit , ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { state , style , trigger } from '@angular/animations';
import { OutputFormat } from 'ngx-image-cropper/lib/interfaces/cropper-options.interface';
import { ImageCroppedEvent , ImageCropperModule } from 'ngx-image-cropper';
import { MAT_DIALOG_DATA , MatDialogRef } from '@angular/material/dialog';
import { NotificationService } from '@appNotification';
import { Button , BUTTON_NO , BUTTON_YES } from '@model/button';
import { ConfirmDialogData } from '@theme/components/confirm/confirm.component';
import { firstValueFrom } from 'rxjs';
import { SafeResourceUrlPipe } from '../../pipes/safe-resource-url.pipe';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';

export interface ImageResizerConfig {
	panelWidth : number;
	panelHeight : number;
	maintainAspectRatio : boolean;
	aspectRatio : number;
	resizeToWidth : number;
	imageQuality : number;
	format : OutputFormat;
	resizeToHeight : number;
	cropperMinWidth : number;
	cropperMinHeight : number;
	cropperMaxHeight : number;
	cropperMaxWidth : number;
	cropperStaticWidth : number;
	cropperStaticHeight : number;
	dataUrl : string;
}

export interface ImageResizerDto {
	error : boolean;
	errorCode : number;
	data : ImageCroppedEvent;
	message : string;
	uploaded_id? : number;
}

@Component( {
	selector    : 'app-image-resizer' ,
	standalone  : true ,
	imports : [ CommonModule , ImageCropperModule , SafeResourceUrlPipe , ButtonModule , RippleModule ] ,
	templateUrl : './image-resizer.component.html' ,
	styleUrls   : [ './image-resizer.component.css' ] ,
	animations  : [
		trigger( 'effect' , [
			state( 'open' , style( {
				'opacity'    : '1' ,
				'z-index'    : '10' ,
				'visibility' : 'visible'
			} ) ) ,
			state( 'close' , style( {
				'opacity'    : '0' ,
				'z-index'    : '-1' ,
				'visibility' : 'hidden'
			} ) )
		] )
	]
} )
export class ImageResizerComponent implements OnInit , AfterViewInit {

	@ViewChild( 'video' ) video : ElementRef;

	@ViewChild( 'canvas' ) canvas : ElementRef;

	config : ImageResizerConfig;

	imgRaw : string;

	croppedImage : ImageCroppedEvent;

	errorMessage : string;

	cameraAvailable : boolean;

	cameraMode : string = 'close';

	croppedPanelMode : string = 'close';

	dismissAct : ImageResizerDto = {
		error     : true ,
		errorCode : -2 ,
		data      : null ,
		message   : 'User does block camera'
	};

	rejectByUser : ImageResizerDto = {
		error     : true ,
		errorCode : -1 ,
		data      : null ,
		message   : 'The progress was canceled by user'
	};

	cameraNotAvailable : ImageResizerDto = {
		error     : true ,
		errorCode : -3 ,
		data      : null ,
		message   : 'Requested device not found'
	};

	result : ImageResizerDto = {
		error     : false ,
		errorCode : 1 ,
		data      : null ,
		message   : 'Successful'
	};

	stream : MediaStream;

	constructor(
		private notificationService : NotificationService ,
		public dialogRef : MatDialogRef<ImageResizerComponent> ,
		@Inject( MAT_DIALOG_DATA ) public data : Partial<ImageResizerConfig>
	) {
		this.config = Object.assign<ImageResizerConfig , Partial<ImageResizerConfig>>( {
			panelWidth          : 640 ,
			panelHeight         : 480 ,
			maintainAspectRatio : true ,
			aspectRatio         : 4 / 6 ,
			resizeToWidth       : 151 ,
			imageQuality        : 100 ,
			format              : 'png' ,
			resizeToHeight      : undefined ,
			cropperMinWidth     : undefined ,
			cropperMinHeight    : undefined ,
			cropperMaxHeight    : undefined ,
			cropperMaxWidth     : undefined ,
			cropperStaticWidth  : undefined ,
			cropperStaticHeight : undefined ,
			dataUrl             : undefined
		} , data );
	}

	ngOnInit() : void {
		if ( this.config.dataUrl ) {
			this.enableDirRectImageMode( this.config.dataUrl );
		}
	}

	ngAfterViewInit() {
		if ( !this.config.dataUrl && navigator.mediaDevices && navigator.mediaDevices.getUserMedia ) {
			navigator.mediaDevices.getUserMedia( { video : true } ).then(
				stream => {
					this.stream                        = stream;
					this.video.nativeElement.srcObject = stream;
					this.video.nativeElement.play();
					this.cameraAvailable  = true;
					this.cameraMode       = 'open';
					this.croppedPanelMode = 'close';
				} ,
				error => {
					if ( error.code === 0 ) {
						this.errorMessage     = 'Vùi lòng cho phép camera hoạt động trên thiết bị này';
						this.croppedPanelMode = 'close';
					} else {
						this.cameraAvailable  = false;
						this.cameraMode       = 'close';
						this.croppedPanelMode = 'close';
						this.closeProcess( this.cameraNotAvailable );
					}
				}
			);
		}
	}


	enableDirRectImageMode( dataUrl : string ) : void {
		this.imgRaw           = dataUrl;
		this.cameraMode       = 'close';
		this.croppedPanelMode = 'open';
	}

	capture() {
		this.canvas.nativeElement.getContext( '2d' ).drawImage( this.video.nativeElement , 0 , 0 , this.config.panelWidth , this.config.panelHeight );
		this.imgRaw           = this.canvas.nativeElement.toDataURL( 'image/png' );
		this.cameraMode       = 'close';
		this.croppedPanelMode = 'open';
	}

	imageCropped( event : ImageCroppedEvent ) {
		this.croppedImage = event;
		this.result.data  = event;
	}

	imageLoaded() {
		// show cropper
		// this.hideError();
	}

	cropperReady() {
		// cropper ready
	}

	loadImageFailed() {
		// show message
		// this.showError( 'controls.fileType' );
	}

	turnOffCamera() {
		this.video.nativeElement.srcObject = null;
		this.video.nativeElement.pause();
		this.stream?.getTracks()[ 0 ].stop();
	}

	closeProcess( data : ImageResizerDto ) {
		this.turnOffCamera();
		this.dialogRef.close( data );
		// this.activeModal.close( data );
	}

	async cancelAct() : Promise<void> {
		try {
			const _config : ConfirmDialogData = {
				heading : 'Xác nhận hủy' ,
				message : '<p>Bạn có chăc chắn muốn hủy hành động không</p>' ,
				buttons : [ BUTTON_YES , BUTTON_NO ]
			};
			const btn : Button                = await firstValueFrom( this.notificationService.confirm( _config ) );
			if ( btn && btn.name === BUTTON_YES.name ) {
				this.turnOffCamera();
				this.closeProcess( this.rejectByUser );
			}
		} catch ( e ) {
		}
	}

	takeNewPicture() {
		this.cameraMode       = 'open';
		this.croppedPanelMode = 'close';
	}
}
