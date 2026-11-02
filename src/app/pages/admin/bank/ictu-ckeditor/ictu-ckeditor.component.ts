import { AfterViewInit , ChangeDetectorRef , Component , computed , ElementRef , EventEmitter , inject , Input , Output , signal , Signal , ViewChild , WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import {
	Alignment , Autoformat , AutoImage , Autosave , BlockQuote , Bold , Bookmark , ClassicEditor , Code , CodeBlock , EditorConfig , Emoji , Essentials , EventInfo , FindAndReplace , FontBackgroundColor , FontColor , FontFamily , FontSize , FullPage , GeneralHtmlSupport , Heading , Highlight , HorizontalLine , HtmlComment , HtmlEmbed , ImageBlock , ImageCaption , ImageInline , ImageInsertViaUrl , ImageResize , ImageStyle , ImageTextAlternative , ImageToolbar , ImageUpload , Indent , IndentBlock , Italic , Item , Link , LinkImage , List , ListProperties , Markdown , MediaEmbed , Mention , PageBreak , Paragraph , PasteFromMarkdownExperimental , PasteFromOffice , RemoveFormat , ShowBlocks , SourceEditing , SpecialCharacters , SpecialCharactersArrows , SpecialCharactersCurrency , SpecialCharactersEssentials , SpecialCharactersLatin , SpecialCharactersMathematical , SpecialCharactersText , Strikethrough , Subscript , Superscript , Table , TableCaption , TableCellProperties , TableColumnResize , TableProperties , TableToolbar , TextTransformation , TodoList , Underline , UploadResponse , WordCount , Writer
} from 'ckeditor5';

// import { Plugin } from '@ckeditor/ckeditor5-core';
// @ts-ignore
import translations from 'ckeditor5/translations/vi.js';
import { Helper } from "@utilities/helper";
import { FileService } from "@service/core/file.service";
import { AuthService } from "@service/core/auth.service";
import { OvicFile } from "@model/file";
import { firstValueFrom , map } from "rxjs";


/**
 * Create a free account with a trial: https://portal.ckeditor.com/checkout?plan=free
 */
const LICENSE_KEY = 'GPL'; // or <YOUR_LICENSE_KEY>.

interface IctuUploadResponse extends UploadResponse {
	'alt' : string
	'aspectRatio' : string,
	'default' : string
	'fileId' : number,
	'storage' : string
	'title' : string
}

interface ImageUploadEditingResponse {
	data : IctuUploadResponse,
	imageElement : Item
}

@Component( {
	selector    : 'app-ictu-ckeditor' ,
	standalone  : true ,
	imports     : [ CommonModule , CKEditorModule ] ,
	templateUrl : './ictu-ckeditor.component.html' ,
	styleUrls   : [ './ictu-ckeditor.component.css' ]
} )
export class IctuCkeditorComponent implements AfterViewInit {

	@Input() initialData : string = '';

	@Output() changes : EventEmitter<string> = new EventEmitter<string>();

	public isLayoutReady : boolean = false;

	public Editor : typeof ClassicEditor = ClassicEditor;

	public config : EditorConfig = {}; // CKEditor needs the DOM tree before calculating the configuration.

	private editor : ClassicEditor;

	private fileService : FileService = inject( FileService );

	private auth : AuthService = inject( AuthService );

	@ViewChild( 'editorWordCountElement' ) private editorWordCount! : ElementRef<HTMLDivElement>;

	private readonly uploadQueue : WritableSignal<[]> = signal<[]>( [] );

	readonly isUploading : Signal<boolean> = computed( () : boolean => this.uploadQueue().length > 0 ) // Biến kiểm soát trạng thái loading

	constructor ( private changeDetector : ChangeDetectorRef ) {
	}

	public ngAfterViewInit () : void {
		this.config        = {
			toolbar : {
				items                  : [
					'sourceEditing' ,
					'showBlocks' ,
					'findAndReplace' ,
					'|' ,
					'heading' ,
					'|' ,
					'fontSize' ,
					'fontFamily' ,
					'fontColor' ,
					'fontBackgroundColor' ,
					'|' ,
					'bold' ,
					'italic' ,
					'underline' ,
					'strikethrough' ,
					'subscript' ,
					'superscript' ,
					'code' ,
					'removeFormat' ,
					'|' ,
					'emoji' ,
					'specialCharacters' ,
					'horizontalLine' ,
					'pageBreak' ,
					'link' ,
					'bookmark' ,
					'mediaEmbed' ,
					'insertTable' ,
					'highlight' ,
					'blockQuote' ,
					'codeBlock' ,
					'htmlEmbed' ,
					'|' ,
					'alignment' ,
					'|' ,
					'bulletedList' ,
					'numberedList' ,
					'todoList' ,
					'outdent' ,
					'indent'
				] ,
				shouldNotGroupWhenFull : false
			} ,
			plugins : [
				Alignment ,
				Autoformat ,
				AutoImage ,
				Autosave ,
				BlockQuote ,
				Bold ,
				Bookmark ,
				Code ,
				CodeBlock ,
				Emoji ,
				Essentials ,
				FindAndReplace ,
				FontBackgroundColor ,
				FontColor ,
				FontFamily ,
				FontSize ,
				FullPage ,
				GeneralHtmlSupport ,
				Heading ,
				Highlight ,
				HorizontalLine ,
				HtmlComment ,
				HtmlEmbed ,
				ImageBlock ,
				ImageCaption ,
				ImageInline ,
				ImageInsertViaUrl ,
				ImageResize ,
				ImageStyle ,
				ImageTextAlternative ,
				ImageToolbar ,
				ImageUpload ,
				Indent ,
				IndentBlock ,
				Italic ,
				Link ,
				LinkImage ,
				List ,
				ListProperties ,
				Markdown ,
				MediaEmbed ,
				Mention ,
				PageBreak ,
				Paragraph ,
				PasteFromMarkdownExperimental ,
				PasteFromOffice ,
				RemoveFormat ,
				ShowBlocks ,
				SourceEditing ,
				SpecialCharacters ,
				SpecialCharactersArrows ,
				SpecialCharactersCurrency ,
				SpecialCharactersEssentials ,
				SpecialCharactersLatin ,
				SpecialCharactersMathematical ,
				SpecialCharactersText ,
				Strikethrough ,
				Subscript ,
				Superscript ,
				Table ,
				TableCaption ,
				TableCellProperties ,
				TableColumnResize ,
				TableProperties ,
				TableToolbar ,
				TextTransformation ,
				TodoList ,
				Underline ,
				WordCount
			] ,
			// extraPlugins : [ this.base64UploadPlugin.bind( this ) ] ,
			fontFamily   : {
				supportAllValues : true
			} ,
			fontSize     : {
				options          : [ 10 , 12 , 14 , 'default' , 18 , 20 , 22 ] ,
				supportAllValues : true
			} ,
			heading      : {
				options : [
					{
						model : 'paragraph' ,
						title : 'Paragraph' ,
						class : 'ck-heading_paragraph'
					} ,
					{
						model : 'heading1' ,
						view  : 'h1' ,
						title : 'Heading 1' ,
						class : 'ck-heading_heading1'
					} ,
					{
						model : 'heading2' ,
						view  : 'h2' ,
						title : 'Heading 2' ,
						class : 'ck-heading_heading2'
					} ,
					{
						model : 'heading3' ,
						view  : 'h3' ,
						title : 'Heading 3' ,
						class : 'ck-heading_heading3'
					} ,
					{
						model : 'heading4' ,
						view  : 'h4' ,
						title : 'Heading 4' ,
						class : 'ck-heading_heading4'
					} ,
					{
						model : 'heading5' ,
						view  : 'h5' ,
						title : 'Heading 5' ,
						class : 'ck-heading_heading5'
					} ,
					{
						model : 'heading6' ,
						view  : 'h6' ,
						title : 'Heading 6' ,
						class : 'ck-heading_heading6'
					}
				]
			} ,
			htmlSupport  : {
				allow : [
					{
						name       : /^.*$/ ,
						styles     : true ,
						attributes : true ,
						classes    : true
					}
				]
			} ,
			image        : {
				toolbar : [
					'toggleImageCaption' ,
					// 'imageTextAlternative' ,
					'|' ,
					'imageStyle:inline' ,
					'imageStyle:wrapText' ,
					'imageStyle:breakText' ,
					'|' ,
					'resizeImage'
				]
			} ,
			initialData  : this.initialData ,
			language     : 'vi' ,
			licenseKey   : LICENSE_KEY ,
			link         : {
				addTargetToExternalLinks : true ,
				defaultProtocol          : 'https://' ,
				decorators               : {
					toggleDownloadable : {
						mode       : 'manual' ,
						label      : 'Downloadable' ,
						attributes : {
							download : 'file'
						}
					}
				}
			} ,
			list         : {
				properties : {
					styles     : true ,
					startIndex : true ,
					reversed   : true
				}
			} ,
			mention      : {
				feeds : [
					{
						marker : '@' ,
						feed   : [
							/* See: https://ckeditor.com/docs/ckeditor5/latest/features/mentions.html */
						]
					}
				]
			} ,
			placeholder  : 'Nhập hoặc dán nội dung của bạn vào đây!' ,
			table        : {
				contentToolbar : [ 'tableColumn' , 'tableRow' , 'mergeTableCells' , 'tableProperties' , 'tableCellProperties' ]
			} ,
			translations : [ translations ]
		};
		this.isLayoutReady = true;
		this.changeDetector.detectChanges();
	}

	onReady ( editor : ClassicEditor ) : void {
		Array.from( this.editorWordCount.nativeElement.children ).forEach( ( child : Element ) : void => child.remove() );
		const wordCount : WordCount = editor.plugins.get( 'WordCount' );
		this.editorWordCount.nativeElement.appendChild( wordCount.wordCountContainer );
		editor.plugins.get( 'FileRepository' ).createUploadAdapter = ( loader : any ) : UploadAdapter => new UploadAdapter( loader );
		editor.plugins.get( 'ImageUploadEditing' ).on( 'uploadComplete' , ( _ : EventInfo , response : ImageUploadEditingResponse ) : void => {
			if ( response.imageElement ) {
				editor.model.change( ( writer : Writer ) : void => {
					writer.setAttribute( 'alt' , response.data.alt , response.imageElement );
				} );
			}
			else {
				console.warn( 'viewItem is undefined in uploadComplete event' );
			}
		} );
		this.editor = editor;
		editor.model.document.on( "change" , () : void => {
			this.changes.emit( editor.getData() );
		} );

		//
		// editor.editing.view.document.on( "paste" , ( event , data ) : void => {
		// 	console.log( 'on paste' );
		// 	console.log( event );
		// 	console.log( data );
		// } );

		// Bắt sự kiện paste ảnh từ Word
		// editor.plugins.get( 'Clipboard' ).on( 'inputTransformation' , ( evt : any , data : any ) => {
		// 	console.log( 'Clipboard inputTransformation -------------------' );
		// 	const html         = data.dataTransfer.getData( 'text/html' ); // Lấy dữ liệu HTML từ clipboard
		// 	const base64Images = html.match( /<img.*?src=["'](data:image\/(png|jpeg|gif);base64,.*?)["']/g );
		// 	if ( base64Images ) {
		// 		console.log( 'base64Images' );
		// 		console.log( base64Images );
		// 		base64Images.forEach( ( imgTag : string ) => {
		// 			const base64Src = imgTag.match( /src=["'](data:image\/(png|jpeg|gif);base64,.*?)["']/ )[ 1 ];
		// 			this.uploadBase64Image( base64Src ).then( ( url ) => {
		// 				// Thay thế ảnh base64 bằng ảnh từ server
		// 				data.content = data.content.replace( base64Src , url );
		// 			} );
		// 		} );
		// 	}
		// } );
	}

	private async uploadBase64Image ( base64 : string ) : Promise<string> {
		return 'https://localhost:8008/assets/images/load-image-failed.jpg';
		// return new Promise( ( resolve , reject ) => {
		// 	this.http.post<{ url : string }>( 'http://localhost:3000/uploadBase64' , { image : base64 } ).subscribe(
		// 		( response ) => resolve( response.url ) ,
		// 		( error ) => reject( error )
		// 	);
		// } );
	}

	replaceImageAttributes ( imgTag : string , imageInfo : { url : string; width? : number; height? : number; alt? : string } ) : string {
		// Tạo object chứa các thuộc tính ảnh
		const attributes : { [ key : string ] : string } = {};

		// Trích xuất tất cả thuộc tính của ảnh
		const attrRegex = /(\w+)=["']([^"']+)["']/g;
		let attrMatch : string[];
		while ( ( attrMatch = attrRegex.exec( imgTag ) ) !== null ) {
			attributes[ attrMatch[ 1 ] ] = attrMatch[ 2 ];
		}

		// Ghi đè thuộc tính cần thay đổi
		attributes[ 'src' ]      = imageInfo.url;
		attributes[ 'data-src' ] = imageInfo.url;
		if ( imageInfo.width ) {
			attributes[ 'width' ] = imageInfo.width.toString()
		}
		if ( imageInfo.height ) {
			attributes[ 'height' ] = imageInfo.height.toString()
		}
		if ( imageInfo.alt ) {
			attributes[ 'alt' ] = imageInfo.alt
		}

		// Tạo lại thẻ <img> với các thuộc tính đã cập nhật
		return [ '<img' , ... Object.entries( attributes ).map( ( [ key , value ] : [ string , string ] ) : string => `${ key }="${ value }"` ) , '/>' ].join( ' ' );
	}


	base64UploadPlugin ( editor : any ) : void {
		editor.model.document.on( 'change:data' , () : void => {
			void this.uploadBase64Images( editor );
		} );
	}

	async uploadBase64Images ( editor : any ) : Promise<void> {
		const data : string                 = editor.getData();
		const base64Regex                   = /<img([^>]+)src="data:image\/(png|jpeg|gif);base64,([^">]+)"/g;
		const uploadTasks : Promise<void>[] = [];
		let newData : string                = data;
		let match : any[];

		// 🧊 Đặt CKEditor về readonly trong quá trình upload
		editor.isReadOnly = true;

		while ( ( match = base64Regex.exec( data ) ) !== null ) {
			const base64                  = `data:image/${ match[ 2 ] };base64,${ match[ 3 ] }`;
			const originalImgTag : string = match[ 0 ];
			const tempImgTag : string     = this.replaceImageAttributes( originalImgTag , { url : 'assets/images/svg/loading.svg' } );
			newData                       = newData.replace( originalImgTag , tempImgTag );
		}

		// Cập nhật ảnh loading tạm thời
		editor.setData( newData );

		// Tìm lại ảnh loading để xử lý lần lượt
		const updatedRegex = /<img([^>]+)src="assets\/images\/svg\/loading.svg"/g;
		let loadingMatch : RegExpExecArray;
		while ( ( loadingMatch = updatedRegex.exec( newData ) ) !== null ) {
			if ( ! loadingMatch.index ) continue; // Nếu không có index, bỏ qua
			const loadingImgTag : string = loadingMatch[ 0 ];
			const base64 : string        = this.extractBase64FromOldTag( data , loadingMatch.index );
			const task : Promise<void>   = this.uploadImageToServer( base64 ).then( ( info : IctuUploadResponse ) : void => {
				let currentData : string   = editor.getData();
				const finalImgTag : string = this.replaceImageAttributes( loadingImgTag , { url : info.default , alt : info.alt } );
				currentData                = currentData.replace( loadingImgTag , finalImgTag );
				editor.setData( currentData );
			} ).catch( () : void => {
				let currentData : string = editor.getData();
				currentData              = currentData.replace( loadingImgTag , '' );
				editor.setData( currentData );
				alert( '⚠️ Có ảnh upload thất bại. Vui lòng kiểm tra lại.' );
			} );

			uploadTasks.push( task );
		}

		// ⏳ Chờ tất cả upload hoàn tất
		await Promise.allSettled( uploadTasks );

		// 🔓 Mở lại CKEditor
		editor.isReadOnly = false;
	}

	// 🧠 Tìm lại base64 gốc tương ứng với ảnh tại vị trí cụ thể (tạm thời đơn giản)
	extractBase64FromOldTag ( oldHtml : string , index : number ) : string {
		const regex          = /<img([^>]+)src="data:image\/(png|jpeg|gif);base64,([^">]+)"/g;
		let match : any[];
		let counter : number = 0;
		while ( ( match = regex.exec( oldHtml ) ) !== null ) {
			if ( counter === 0 && regex.lastIndex >= index ) {
				return `data:image/${ match[ 2 ] };base64,${ match[ 3 ] }`;
			}
			counter++;
		}
		return '';
	}

	async uploadImageToServer ( base64 : string ) : Promise<IctuUploadResponse> {
		const file : File = Helper.base64ToFile2( base64 );
		return firstValueFrom( this.fileService.uploadFile( file , this.auth.user.donvi_id , this.auth.user.id ).pipe(
			map( ( info : OvicFile ) : IctuUploadResponse => (
				{
					default     : 'assets/images/svg/loading.svg' ,
					alt         : `serverFile|${ info.id }` ,
					storage     : 'serverFile' ,
					fileId      : info.id ,
					aspectRatio : '' ,
					title       : ''
				}
			) )
		) )
	}

}

class UploadAdapter {

	private fileService : FileService = inject( FileService );

	private auth : AuthService = inject( AuthService );

	constructor (
		private loader : any
	) {
	}

	async upload () : Promise<IctuUploadResponse> {
		return this.loader.file.then( async ( file : File ) : Promise<IctuUploadResponse> => {
			return await firstValueFrom( this.fileService.uploadFile( file , this.auth.user.donvi_id , this.auth.user.id ).pipe(
				map( ( info : OvicFile ) : IctuUploadResponse => (
					{
						default     : 'assets/images/svg/loading.svg' ,
						alt         : `serverFile|${ info.id }` ,
						storage     : 'serverFile' ,
						fileId      : info.id ,
						aspectRatio : '' ,
						title       : ''
					}
				) )
			) );
		} );
	}

	abort () : void {
		console.log( 'Upload aborted' );
	}
}

/*
 export class Base64UploadPlugin extends Plugin {
 init () {
 console.log( 'Base64UploadPlugin initialized!' );
 const editor = this.editor;

 editor.model.document.on( 'change:data' , () => {
 console.log( 'Detecting base64 image...' );
 // Gọi hàm xử lý ảnh base64
 this.uploadBase64Images();
 } );
 }

 async uploadBase64Images () {
 const editor = this.editor;
 const data   = editor.getData();
 console.log( 'Processing base64 images...' , data );

 // 📝 Thêm code xử lý upload base64 tại đây...
 }
 }*/
