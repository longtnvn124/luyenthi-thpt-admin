import { Component , Input , OnChanges , OnDestroy , SimpleChanges } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ImageModule } from "primeng/image";
import { TnShiftStudentTest } from "@model/tn-shift-student-test";
import { DomSanitizer } from "@angular/platform-browser";
import { AwsResponseInfo , IctuMediaSourceType , OvicFile } from "@model/file";
import { AuthService } from "@service/core/auth.service";
import { Subject , takeUntil } from "rxjs";
import { AppSocketEventControlName } from "@service/socket/app-socket.service";
import { FileService } from "@service/core/file.service";

@Component( {
	selector    : "app-view-shift-test" ,
	standalone  : true ,
	imports     : [ CommonModule , ImageModule ] ,
	templateUrl : "./view-shift-test.component.html" ,
	styleUrls   : [ "./view-shift-test.component.css" ]
} )
export class ViewShiftTestComponent implements OnChanges , OnDestroy {
	@Input( { required : true } ) selectedStudent : TnShiftStudentTest;

	photo_before_exam : any   = null;
	photo_during_exam : any[] = [];
	socket_event_shift_test_id : number;

	private destroyedViewShiftTest$ = new Subject<void>();

	private loader : Partial<Record<IctuMediaSourceType , ( file : OvicFile , store : 'photo_during_exam' | 'photo_before_exam' ) => void>> = {
		serverFile : this.serverFile.bind( this ) ,
		serverAws  : this.serverAws.bind( this )
	}

	constructor (
		protected sanitizer : DomSanitizer ,
		private auth : AuthService ,
		private fileService : FileService
	) {
		this.onSocketEvent()
	}

	ngOnChanges ( changes : SimpleChanges ) : void {
		if ( changes[ "selectedStudent" ] ) {
			const photo_during_exam = this.selectedStudent.photo_during_exam ? this.selectedStudent.photo_during_exam : [];
			const photo_before_exam = this.selectedStudent.photo_before_exam ? this.selectedStudent.photo_before_exam : null;

			if ( photo_before_exam && photo_before_exam.source && this.loader[ photo_before_exam.source ] ) {
				this.loader[ photo_before_exam.source ]( photo_before_exam , 'photo_before_exam' );
			}

			if ( photo_during_exam.length > 0 ) {
				photo_during_exam.forEach( ( item ) => {
					if ( item.source && this.loader[ item.source ] ) {
						this.loader[ item.source ]( item , 'photo_during_exam' );
					}
				} );
			}


		}
	}

	onSocketEvent () : void {
		// this.auth.onSocketResponse().pipe( takeUntil( this.destroyedViewShiftTest$ ) ).subscribe( ( { name , data } ) => {
		// 	// this.eventHandle[name](data);
		//
		// 	const handleEvent : Partial<Record<AppSocketEventControlName , () => void>> = {
		// 		photo_before_exam : () => {
		// 			if ( data ) {
		// 				try {
		// 					let dataPare = JSON.parse( data );
		//
		// 				}
		// 				catch ( error ) {
		// 					console.error( error );
		//
		// 				}
		// 			}
		// 		} ,
		// 		photo_during_exam : () => {
		// 			if ( data ) {
		// 				this.socket_event_shift_test_id = data.data.shift_student_test_id || null;
		// 				try {
		// 					let dataPare : OvicFile = JSON.parse( JSON.stringify( data.data.image ) );
		//
		// 					if ( dataPare.source && this.loader[ dataPare.source ] ) {
		// 						this.loader[ dataPare.source ]( dataPare , 'photo_during_exam' );
		// 					}
		// 				}
		// 				catch ( error ) {
		// 					console.error( error );
		//
		// 				}
		// 			}
		// 		}
		// 	};
		//
		// 	if ( handleEvent[ name ] ) {
		// 		handleEvent[ name ]();
		// 	}
		// } );
	}

	ngOnDestroy () : void {
		this.destroyedViewShiftTest$.next();
		this.destroyedViewShiftTest$.complete(); // Hoàn tất Subject nếu không tái sử dụng
	}

	trustHtml ( value ) {
		if ( value ) {
			return this.sanitizer.bypassSecurityTrustResourceUrl( value );
		}
		else {
			return "";
		}
	}

	private handleFileResponse ( blobOrUrl : any , store : 'photo_during_exam' | 'photo_before_exam' ) : void {


		if ( store === 'photo_before_exam' ) {
			if ( ! this.socket_event_shift_test_id ) {

				this.photo_before_exam = blobOrUrl;
			}
			else {
				if ( this.selectedStudent.id === this.socket_event_shift_test_id ) {
					this.photo_before_exam = blobOrUrl;
				}
			}
		}
		else {

			if ( ! this.socket_event_shift_test_id ) {

				this.photo_during_exam.push( blobOrUrl );
			}
			else {
				if ( this.selectedStudent.id === this.socket_event_shift_test_id ) {
					this.photo_during_exam.push( blobOrUrl );
				}
			}
		}
	}

	serverFile ( file : OvicFile , store : 'photo_during_exam' | 'photo_before_exam' ) : void {
		this.fileService.getFile( file.path.toString() ).subscribe( {
			next  : ( blob : Blob ) => this.handleFileResponse( URL.createObjectURL( blob ) , store ) ,
			error : () => console.error( 'Error loading file from server' )
		} );
	}

	serverAws ( file : OvicFile , store : 'photo_during_exam' | 'photo_before_exam' ) : void {
		this.fileService.getLinkDownloadAws( file.id ).subscribe( {
			next  : ( res : AwsResponseInfo ) => this.handleFileResponse( res.data , store ) ,
			error : () => console.error( 'Error loading file from AWS' )
		} );
	}


}
