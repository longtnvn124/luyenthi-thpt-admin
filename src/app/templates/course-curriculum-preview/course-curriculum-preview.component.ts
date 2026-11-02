import { Component , ElementRef , HostListener , Inject , ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA , MatDialogRef } from '@angular/material/dialog';
import { CourseCurriculumPreview , Lesson } from '@model/lesson';
import { LoadingProgressBarComponent } from '../loading-progress-bar/loading-progress-bar.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { EncryptedSource , IctuDocument } from '@model/file';
import { Options , Source } from 'plyr';
import { getLinkDownload , getLinkDriverStream } from '@env';
import { tokenGetter } from '../../app.module';
import { IctuDocumentLoader } from '@learning/board/learning-board/learning-board-video/learning-board-video.component';
import { FileService } from '@service/file.service';
import { LessonsService } from '@service/lessons.service';
import { PlyrModule } from '@module/ngx-plyr/lib/plyr.module';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';

@Component( {
	selector    : 'app-course-curriculum-preview' ,
	standalone  : true ,
	imports     : [ CommonModule , LoadingProgressBarComponent , MatProgressBarModule , PlyrModule , ButtonModule , RippleModule ] ,
	templateUrl : './course-curriculum-preview.component.html' ,
	styleUrls   : [ './course-curriculum-preview.component.css' ]
} )
export class CourseCurriculumPreviewComponent {

	state : 'loading' | 'completed' | 'error' = 'loading';

	options : Options;

	errorMessage : string;

	canReload : boolean = true;

	videoSources : Source[] = [];

	private _videoWrap : ElementRef<HTMLDivElement>;

	get videoWrap() : ElementRef<HTMLDivElement> {
		return this._videoWrap;
	}

	@ViewChild( 'videoWrap' ) set setVideoWrap( videoWrap : ElementRef<HTMLDivElement> ) {
		if ( videoWrap ) {
			this._videoWrap = videoWrap;
			this.resize();
		}
	}

	private loadVideoContent : IctuDocumentLoader = {
		googleDrive : async ( video : IctuDocument ) : Promise<Source[]> => Promise.resolve( [ { provider : 'html5' , src : 'https://drive.google.com/uc?export=download&id=' + ( typeof video.path === 'number' ? video.path.toString( 10 ) : video.path ) } ] ) ,
		serverFile  : async ( video : IctuDocument ) : Promise<Source[]> => {
			try {
				const urlObject : URL = new URL( typeof video.path === 'string' ? getLinkDriverStream( video.path ) : getLinkDownload( video.path.toString( 10 ) ) );
				urlObject.searchParams.append( 'token' , tokenGetter() );
				const src : string = urlObject.toString();
				return Promise.resolve( [ { provider : 'html5' , src } ] );
			} catch ( e ) {
				return Promise.resolve( [] );
			}
		} ,
		local       : async ( video : IctuDocument ) : Promise<Source[]> => {
			return Promise.resolve( [ { provider : 'html5' , src : video.path as string } ] );
		} ,
		vimeo       : async ( video : IctuDocument ) : Promise<Source[]> => {
			return Promise.resolve( [ { provider : 'vimeo' , src : video.path as string } ] );
		} ,
		youtube     : async ( video : IctuDocument ) : Promise<Source[]> => {
			return Promise.resolve( [ { provider : 'youtube' , src : video.path as string } ] );
		} ,
		encrypted   : async ( video : IctuDocument ) : Promise<Source[]> => {
			return Promise.resolve( [] );
		} ,
		serverAws   : async ( video : IctuDocument ) : Promise<Source[]> => {
			try {
				const videoId : number = typeof video.path === 'number' ? video.path : parseInt( video.path , 10 );
				const src : string     = await this.fileService.getPathFileAws( videoId );
				return [ { provider : 'html5' , src } ];
			} catch ( e ) {
				return null;
			}
		}
	};

	@HostListener( 'window:resize' ) onResize() {
		this.resize();
	}

	private video : IctuDocument;

	constructor(
		@Inject( MAT_DIALOG_DATA ) private data : CourseCurriculumPreview ,
		private fileService : FileService ,
		private lessonsService : LessonsService ,
		private dialogRef : MatDialogRef<void>
	) {
		this.options = {
			disableContextMenu : true ,
			invertTime         : false ,
			youtube            : {
				start          : 0 ,
				fs             : 1 ,
				playsinline    : 1 ,
				modestbranding : 1 ,
				disablekb      : 0 ,
				controls       : 0 ,
				rel            : 0 ,
				showinfo       : 0
			} ,
			settings           : [ 'quality' ] ,
			blankVideo         : 'assets/videos/blank.mp4' ,
			controls           : [ 'play-large' , 'play' , 'progress' , 'current-time' , 'mute' , 'volume' , 'captions' , 'settings' , 'fullscreen' ]
		};
		this.preload();
	}

	preload() {
		this.state = 'loading';
		this.lessonsService.getLessonById( this.data.lessonId , 'video' ).subscribe( {
			next  : ( lesson : Lesson ) => {
				if ( lesson.video ) {
					this.video = lesson.video;
					void this.loadFileContent( this.video );
				} else {
					this.state        = 'error';
					this.errorMessage = 'Video bài giảng không tồn tại.';
					this.canReload    = false;
				}
			} ,
			error : () => {
				this.state        = 'error';
				this.errorMessage = 'Mất kết nối với máy chủ.';
			}
		} );
	}

	reload() {
		if ( this.video ) {
			void this.loadFileContent( this.video );
		} else {
			this.preload();
		}
	}

	async loadFileContent( video : IctuDocument ) : Promise<void> {
		if ( video && video.type === 'video' && video.source && video.path ) {
			this.state = 'loading';
			try {
				this.videoSources = await this.loadVideoContent[ video.source ]( video );
				this.state        = !!( this.videoSources ) && this.videoSources.length ? 'completed' : 'error';
				if ( !!( this.videoSources ) && this.videoSources.length ) {
					this.state = 'completed';
				} else {
					this.state        = 'error';
					this.errorMessage = 'Nguồn video chưa đươc hỗ trợ';
				}
			} catch ( e ) {
				this.state        = 'error';
				this.errorMessage = 'Mất kết nối với máy chủ.';
			}
		} else {
			this.state        = 'error';
			this.errorMessage = 'Định dạng video không chính xác.';
			this.canReload    = false;
		}
	}

	resize() {
		//default 1200x675
		if ( this.videoWrap ) {
			if ( ( window.innerWidth - 30 ) <= 1200 || ( window.innerHeight - 30 ) <= 675 ) {
				if ( ( window.innerHeight - 30 ) >= ( window.innerWidth * 9 / 16 ) ) {
					this.videoWrap.nativeElement.style.width = ( window.innerWidth - 30 ) + 'px';
				} else {
					this.videoWrap.nativeElement.style.width = ( ( window.innerHeight - 30 ) * 16 / 9 ) + 'px';
				}
			} else {
				this.videoWrap.nativeElement.style.width = '1200px';
			}
		}
	}

	closeLayout() {
		this.dialogRef.close( null );
	}
}
