import { AfterViewInit , Component , ElementRef , EventEmitter , Input , OnChanges , OnDestroy , OnInit , Output , SimpleChanges , ViewChild } from "@angular/core";
import { CommonModule } from "@angular/common";
import * as DecoupledEditor from "../../../../../templates/ovic-ckeditor-document/build_v2/ckeditor";
import { AbstractControl } from "@angular/forms";
import { catchError , forkJoin , mergeMap , Observable , of } from "rxjs";
import { Answers } from "@model/question";
import { AuthService } from "@service/core/auth.service";
import { FileService } from "@service/core/file.service";
import { NotificationService } from "@appNotification";
import { Helper } from "@utilities/helper";
import { IctuMediaLoaderDirective } from "src/app/directives/ictu-media-loader.directive";
import { HelperService } from "@service/core/helper.service";

@Component( {
	selector    : "app-input-question-direction" ,
	standalone  : true ,
	imports     : [ CommonModule , IctuMediaLoaderDirective ] ,
	templateUrl : "./input-question-direction.component.html" ,
	styleUrls   : [ "./input-question-direction.component.css" ]
} )
export class InputQuestionDirectionComponent implements OnInit , OnDestroy , AfterViewInit , OnChanges {

	countChanges : number = 0;

	@Input() abstractControl : AbstractControl;

	@Input() defaunt : string = "";

	@Input() initData : string = "";

	@Input() htmlInputModel : Answers;

	@Input() styleClass : string = '';

	@Input() toolbar = [ 'fullScreen' , '|' , 'heading' , '|' , 'bold' , 'italic' , 'underline' , 'removeFormat' , 'codeBlock' , 'insertTable' , 'alignment' , 'link' , 'bulletedList' , 'numberedList' , 'mediaEmbed' , 'fontFamily' , 'fontColor' , 'fontBackgroundColor' , '|' , 'indent' , 'outdent' , 'specialCharacters' , 'undo' , 'redo' , 'blockQuote' , 'findAndReplace' ];

	@ViewChild( 'editorContent' ) editorContent : ElementRef;

	@Output() ckEditor : EventEmitter<any> = new EventEmitter<any>();

	@Output() resultData : EventEmitter<string> = new EventEmitter<string>();

	tableOption = { contentToolbar : [ 'tableColumn' , 'tableRow' , 'mergeTableCells' , 'tableproperties' , 'tableCellProperties' , 'toggleTableCaption' ] };

	imageOption = {
		styles        : [ 'alignLeft' , 'alignCenter' , 'alignRight' ] ,
		resizeUnit    : 'px' ,
		resizeOptions : [
			{
				name  : 'resizeImage:original' ,
				label : 'Original' ,
				value : null
			} ,
			{
				name  : 'resizeImage:100' ,
				label : '100pt' ,
				value : '100'
			} ,
			{
				name  : 'resizeImage:200' ,
				label : '200pt' ,
				value : '200'
			}
		] ,
		toolbar       : [
			'imageStyle:alignLeft' , 'imageStyle:alignCenter' , 'imageStyle:alignRight' ,
			'|' ,
			'imageResize' ,
			'|' ,
			'toggleImageCaption'
		]
	};

	currentEditor : any;

	Editor = DecoupledEditor;

	heading = {
		options : [
			{ model : 'paragraph' , title : 'Paragraph' , class : 'ck-heading_paragraph' } ,
			// { model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
			// { model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
			{ model : 'heading1' , view : 'h2' , title : 'Heading 1' } ,
			{ model : 'heading2' , view : 'h3' , title : 'Heading 2' }
			// { model: 'heading3', view: 'h4', title: 'Heading 3' },
			// { model: 'heading5', view: 'h5', title: 'Heading 5', class: 'ck-heading_heading5' },
			// { model: 'heading6', view: 'h6', title: 'Heading 6', class: 'ck-heading_heading6' }
		]
	};

	uploadImage = [];

	server = "serverAws";

	changeData = false;

	constructor (
		private helperService : HelperService ,
		private auth : AuthService ,
		private fileService : FileService ,
		// private openFileManagerService: OpenFileManagerService,
		private noitifi : NotificationService
	) {
	}

	ngOnChanges ( changes : SimpleChanges ) : void {
		// if ( changes[ 'id_change' ] ) {
		//     ++this.countChanges;
		// }
	}

	ngOnInit () : void {

	}

	ngOnDestroy () : void {
		if ( this.currentEditor ) {
			this.currentEditor.destroy();
		}
	}

	ngAfterViewInit () : void {
		this.createEditor();

		// this.flagFromValueChanged = false;
		// if ( this.abstractControl?.value ) {
		// 	this.createEditor( this.abstractControl?.value );
		// }
		// else if ( this.initData ) {
		// 	this.createEditor( this.initData );
		// }
		// else {
		// 	this.createEditor();
		// }

	}

	createEditor () : void {
		this.Editor.create( this.editorContent.nativeElement ,
			{
				toolbar       : this.toolbar ,
				table         : this.tableOption ,
				image         : this.imageOption ,
				removePlugins : [ 'SpecialCharactersArrows' ] ,
				// heading: this.heading,
				link        : {
					decorators : {
						isExternal : {
							mode       : 'automatic' ,
							callback   : url => {
							} ,
							attributes : {
								target : '#' ,
								rel    : 'noopener noreferrer'
							}
						}
					}
				} ,
				htmlSupport : {
					allow : [
						{
							name       : /.*/ ,
							attributes : true ,
							classes    : true ,
							styles     : false
						}
					]
				} ,
				list        : {
					properties : {
						styles     : true ,
						startIndex : true ,
						reversed   : true
					}
				} ,
				indentBlock : {
					classes : [
						'custom-block-indent-a' , // First step - smallest indentation.
						'custom-block-indent-b' ,
						'custom-block-indent-c'  // Last step - biggest indentation.
					]
				} ,
				highlight   : {
					options : [
						{ model : 'yellowMarker' , class : 'marker-yellow marker-highlight' , title : 'Yellow Marker' , color : 'var(--ck-highlight-marker-yellow)' , type : 'marker' } ,
						{ model : 'greenMarker' , class : 'marker-green marker-highlight' , title : 'Green marker' , color : 'var(--ck-highlight-marker-green)' , type : 'marker' } ,
						{ model : 'pinkMarker' , class : 'marker-pink marker-highlight' , title : 'Pink marker' , color : 'var(--ck-highlight-marker-pink)' , type : 'marker' } ,
						{ model : 'blueMarker' , class : 'marker-blue marker-highlight' , title : 'Blue marker' , color : 'var(--ck-highlight-marker-blue)' , type : 'marker' } ,
						{ model : 'redPen' , class : 'pen-red marker-highlight' , title : 'Red pen' , color : 'var(--ck-highlight-pen-red)' , type : 'pen' } ,
						{ model : 'greenPen' , class : 'pen-green marker-highlight' , title : 'Green pen' , color : 'var(--ck-highlight-pen-green)' , type : 'pen' }
						// { model: 'yellowMarkerComment', class: 'marker-yellow marker-highlight', title: 'Yellow Marker', color: 'var(--ck-highlight-marker-yellow)', type: 'marker' },
					]
				}
			}
		).then( async editor => {
			const commandImage = editor.commands.get( 'customInsertImage' );
			commandImage.on( 'execute' , ( e ) => {
				this.onDisplayUpload();
			} );

			editor.plugins.get( 'ClipboardPipeline' ).on( 'inputTransformation' , ( evt , data ) => {
				const dataTransfer = data.dataTransfer;
				const textContent  = dataTransfer.getData( 'text/html' )
				if ( textContent ) {
					const textCheckImage = textContent.replace( /<img(.*?)>/gi , _res => {
						const index = _res.indexOf( this.server );
						if ( index === -1 ) {
							const index_http = _res.indexOf( 'http' );
							if ( index_http !== -1 ) {
								let url = '#';
								_res.replace( /src="(.*?)"/gi , _res_src => {
									url = _res_src.replace( /src="|"/gi , '' );
									return _res_src;
								} )

								return '<img class="image_online_https" src="assets/images/image_online_https.PNG"/><br><a target="_blank" href="' + url + '"><span class="image_in_orther_server">[Click vào đây để link đến ảnh của bạn]</span></a>';
							}
							return _res;
						}
						return _res;
					} )
					const viewFragment   = editor.data.htmlProcessor.toView( textCheckImage );
					data.content         = viewFragment;
				}
			} );

			editor.model.document.on( 'change' , () => {
				++this.countChanges;
				this.setDataChange( editor );
			} );

			if ( this.abstractControl ) {
				editor.data.set( this.abstractControl.value );
			}
			else if ( this.htmlInputModel ) {
				editor.data.set( this.htmlInputModel.value );
				++this.countChanges;
			}
			else if ( this.initData ) {
				editor.data.set( this.initData );
			}

			this.currentEditor = editor;

			this.ckEditor.emit( editor );

		} ).catch( ( err : any ) => console.error( err ) );
	}

	setDataChange ( editor ) {
		if ( editor && editor.getData() ) {

			const request : Observable<any>[] = [];
			const upload                      = [];
			let i                             = 0;
			const data                        = editor.getData().replace( /src="(.*?)"/gi , rep => {
				const blob  = rep.replace( /src="|"/g , '' );
				const index = blob.indexOf( 'base64' );
				if ( index !== -1 ) {
					const files  = Helper.base64ToFile2( blob );
					const image_ = {
						idImage : null ,
						blob    : URL.createObjectURL( files ) ,
						files   : files
					}
					request.push( this.fileService.uploadFileAwsWidthProgress( files , 'image_question' ).pipe( mergeMap( _image => {
						if ( _image.state === "DONE" ) {
							image_.idImage = _image.content[ 'data' ][ 0 ][ 'id' ];
						}

						upload.push( image_ );

						return of( _image );
					} ) ) );
					return 'src="' + image_.blob + '"';
				}
				return rep;
			} );

			const data_no_alt = data.replace( /src="(.*?)"(.*?)alt="(.*?)"/gis , _res => {
				const index = _res.indexOf( this.server );
				if ( index === -1 ) {
					const src = _res.replace( /alt="(.*?)"/gis , '' );
					return src;
				} else {
					const alt = _res.replace( /src="(.*?)"|(.*?)alt="|"/gi , '' );
					const id  = alt ? alt.split( "|" )[ 0 ] : 0;
					return 'src="' + id + '" alt="' + alt + '"';
				}
			} )

			this.noitifi.isProcessing( true );
			if ( request.length ) {
				forkJoin( request ).subscribe( {
					next  : forkRes => {
						const newData = data_no_alt.replace( /src="(.*?)"/g , rep => {
							const blob  = rep.replace( /src="|"/g , '' );
							const index = upload.findIndex( m => m.blob === blob );
							if ( index !== -1 && isNaN( blob ) ) {
								return 'data-org="' + this.server + '" src="' + upload[ index ][ 'idImage' ] + '" alt="' + upload[ index ][ 'idImage' ] + '|' + this.server + '"';
							}
							else {
								return rep;
							}
						} );

						this.noitifi.isProcessing( false );
						if ( this.abstractControl ) {
							this.abstractControl.setValue( newData );
						}
						if ( this.htmlInputModel ) {
							this.htmlInputModel.value = newData;
						}

						this.resultData.emit( newData );

					} ,
					error : () => {
						this.noitifi.toastError( "Lỗi kết nối, vui lòng thử lại" )
					}
				} );
			}
			else {
				this.noitifi.isProcessing( false );
				if ( this.abstractControl ) {
					this.abstractControl.setValue( data_no_alt );
				}
				if ( this.htmlInputModel ) {
					this.htmlInputModel.value = data_no_alt;
				}
				this.resultData.emit( data_no_alt );
			}
		}
		else {
			this.noitifi.isProcessing( false );
			if ( this.abstractControl ) {
				this.abstractControl.setValue( '' );
			}
			if ( this.htmlInputModel ) {
				this.htmlInputModel.value = '';
			}
			this.resultData.emit( '' );
		}
	}

	getImageAndUpload ( arrayIdImages : any ) : Promise<any> {
		if ( arrayIdImages && arrayIdImages.length !== 0 ) {
			return new Promise( ( resolve , reject ) => {
				const fileUploadRes : Observable<any>[] = [];
				if ( arrayIdImages.length !== 0 ) {
					arrayIdImages.forEach( ( f , index ) => {
						fileUploadRes.push( this.fileService.uploadFileAwsWidthProgress( f.file , 'image_question' ).pipe(
							catchError( () => {
								this.noitifi.isProcessing( false );
								return of( f );
							} ) ,
							mergeMap( _res => {
								if ( _res.state === 'DONE' ) {
									f.id = _res.content.data[ 0 ].id;
								}
								return of( f );
							} ) ) );
					} );
				}

				if ( fileUploadRes.length !== 0 ) {
					forkJoin( fileUploadRes ).subscribe( {
						next  : ( forkRes : any ) => {
							resolve( arrayIdImages );
						} ,
						error : () => {
							() => this.noitifi.toastError( 'Thêm câu hỏi thất bại' );
							this.noitifi.isProcessing( false );
						}
					} );
				}
			} );
		}
		else {
			return null;
		}
	}

	getImageSize ( arrayIdImages : any ) : Promise<any> {
		if ( arrayIdImages && arrayIdImages.length !== 0 ) {
			return new Promise( ( resolve , reject ) => {
				const fileUploadRes : Observable<any>[] = [];
				if ( arrayIdImages.length !== 0 ) {
					arrayIdImages.forEach( ( f , index ) => {
						fileUploadRes.push( this.loadImage( f.blob ).pipe( mergeMap( _img => {
							f.image_tag = _img;
							return of( _img );
						} ) ) );
					} );
				}

				if ( fileUploadRes.length !== 0 ) {
					forkJoin( fileUploadRes ).subscribe( {
						next  : ( forkRes : any ) => {
							resolve( arrayIdImages );
						} ,
						error : () => {
							() => this.noitifi.toastError( 'Thêm câu hỏi thất bại' );
							this.noitifi.isProcessing( false );
						}
					} );
				}
			} );
		}
		else {
			return null;
		}
	}

	loadImage ( imagePath ) {
		return new Observable( ( observer ) => {
			let img     = new Image();
			img.src     = imagePath;
			img.onload  = function () {
				observer.next( img );
				observer.complete();
			}
			img.onerror = function ( err ) {
				observer.error( err );
			}
		} )
	}


	getImageFile ( arrayIdImages : any ) : Promise<any> {
		if ( arrayIdImages && arrayIdImages.length !== 0 ) {
			return new Promise( ( resolve , reject ) => {
				const fileUploadRes : Observable<any>[] = [];
				if ( arrayIdImages.length !== 0 ) {
					arrayIdImages.forEach( ( f , index ) => {
						fileUploadRes.push( this.loadBase64( f.blob ).pipe( mergeMap( _img => {
							f.file = _img;
							return of( _img );
						} ) ) );
					} );
				}

				if ( fileUploadRes.length !== 0 ) {
					forkJoin( fileUploadRes ).subscribe( {
						next  : ( forkRes : any ) => {
							resolve( arrayIdImages );
						} ,
						error : () => {
							() => this.noitifi.toastError( 'Thêm câu hỏi thất bại' );
							this.noitifi.isProcessing( false );
						}
					} );
				}
			} );
		}
		else {
			return null;
		}
	}

	loadBase64 ( blob ) {
		const currentThis = this;
		return new Observable( ( observer ) => {
			let reader = new FileReader();
			reader.readAsDataURL( blob );
			reader.onloadend = function () {
				let base64data = reader.result;
				const file     = Helper.base64ToFile2( base64data.toString() );
				observer.next( file );
				observer.complete();
			}
		} )
	}

	loadChangeData ( editor ) : Promise<any> {
		return new Promise( ( resolve , reject ) => {
			editor.model.document.on( 'change:data' , ( evt , data ) => {
				resolve( editor.getData );
			} );
		} );
	}


	async onDisplayUpload () {
		try {
			// const res = await this.openFileManagerService.openFileManagerNew( { isMultipleMode: true, ext: 'mp4,avi,png,jpg,mov', tag: 'question' } );
			// if ( res && res.length ) {
			// 	res.forEach( f => {
			// 		this.afterChooseFile( f );
			// 	} );
			// }
		}
		catch ( e ) {
			console.log( e );
		}
	}

	afterChooseFile ( file ) : void {
		if ( file ) {
			// if ( this.currentEditor ) {
			// 	let src = null;
			// 	switch ( this.server ) {
			// 		case OvicVideoSourceObject.serverAws:
			// 			src = getLinkDownload_aws( file.path.toString().concat( '?token=', this.auth.accessToken ) );
			// 			break;
			// 		case OvicVideoSourceObject.serverFile:
			// 			src = getLinkDownload( file.path.toString().concat( '?token=', this.auth.accessToken ) );
			// 			break;
			// 		default:
			// 			break;
			// 	}
			// 	this.convertData( src, file );
			// }
		}
	}

	convertData ( blob : string , file ) {
		this.currentEditor.model.change( writer => {
			const htmlDP = this.currentEditor.data.processor;
			const index  = this.uploadImage.findIndex( m => m.id === file[ 'id' ] );
			if ( index === -1 ) {
				this.uploadImage.push( {
					id   : file.id ,
					blob : blob
				} );
			}

			const image = writer.createElement( 'image' , {
				src : blob ,
				alt : file.id
			} );

			const content : string = '<figure class="image ck-widget ck-widget_with-resizer image_resized ck-widget_selected" contenteditable="false"><img data-org="' + this.server + '" src="' + file.id + '" alt="' + file.id + '|' + this.server + '" size="100px"/>< /figure>';
			const viewFragment     = htmlDP.toView( content );
			const modelFragment    = this.currentEditor.data.toModel( viewFragment );
			this.currentEditor.model.insertContent( modelFragment , this.currentEditor.model.document.selection.focus , 'before' );
		} );
	}

	blobToBase64 ( blob : Blob ) : Promise<string> {
		return new Promise( ( resolve , reject ) => {
			const reader : FileReader = new FileReader;
			reader.onerror            = () => resolve( null );
			reader.onload             = () => resolve( reader.result.toString() );
			reader.readAsDataURL( blob );
		} );
	}
}