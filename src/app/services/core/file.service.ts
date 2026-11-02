import { Inject , Injectable } from '@angular/core';
import { distinctUntilChanged , firstValueFrom , map , Observable , retry , scan , switchMap } from 'rxjs';
import { AwsResponseInfo , Download , OvicFile , Upload } from '@model/file';
import { ACCESS_TOKEN_KEY , getLinkDownload , linkAwsInfo , linkDownloadDriveFile , linkFileInfo , linkGetFileContentAws } from '@env';
import { HttpClient , HttpEvent , HttpEventType , HttpParams , HttpProgressEvent , HttpResponse } from '@angular/common/http';
import { Saver , SAVER } from '../../providers/saver.provider';
import { saveAs } from 'file-saver';
import { Dto } from '@model/dto';

@Injectable( {
	providedIn : 'root'
} )
export class FileService {

	constructor (
		private http : HttpClient ,
		@Inject( SAVER ) private save : Saver
	) {
	}

	isHttpResponse<T> ( event : HttpEvent<T> ) : event is HttpResponse<T> {
		return event.type === HttpEventType.Response;
	}

	isHttpProgressEvent ( event : HttpEvent<unknown> ) : event is HttpProgressEvent {
		return ( event.type === HttpEventType.DownloadProgress || event.type === HttpEventType.UploadProgress );
	}

	downloadWithProgress ( id : number , filename? : string ) : Observable<Download> {
		return this.downloadExternalWithProgress( getLinkDownload( id.toString( 10 ) ) , filename );
	}

	/********************************************************************************
	 * Google drive functions
	 * ******************************************************************************/

	gdDownloadWithProgress ( id : string , filename? : string ) : Observable<Download> {
		return this.downloadExternalWithProgress( linkDownloadDriveFile( id ) , filename );
	}

	downloadDriveFile ( id : string ) : Observable<Blob> {
		return this.http.get( linkDownloadDriveFile( id ) , { responseType : 'blob' } );
	}

	downloadExternalWithProgress ( url : string , filename? : string ) : Observable<Download> {
		const saver : Saver | undefined = filename ? ( blob : Blob ) => this.save( blob , filename ) : undefined;
		return this.http.get( url , { reportProgress : true , observe : 'events' , responseType : 'blob' } ).pipe( this._downloadProcess( saver ) );
	}

	private _downloadProcess ( saver? : Saver ) : ( source : Observable<HttpEvent<Blob>> ) => Observable<Download> {
		return ( source : Observable<HttpEvent<Blob>> ) => source.pipe(
			scan(
				( download : Download , event ) : Download => {
					if ( this.isHttpProgressEvent( event ) ) {
						return {
							progress : event.total ? Math.round( ( 100 * event.loaded ) / event.total ) : download.progress ,
							state    : 'IN_PROGRESS' ,
							content  : null
						};
					}
					if ( this.isHttpResponse( event ) ) {
						if ( saver ) {
							saver( event.body as Blob );
						}
						return {
							progress : 100 ,
							state    : 'DONE' ,
							content  : event.body
						};
					}
					return download;
				} ,
				{ state : 'PENDING' , progress : 0 , content : null }
			) ,
			distinctUntilChanged( ( a , b ) => a.state === b.state && a.progress === b.progress && a.content === b.content )
		);
	}

	/********************************************************************************
	 * aws functions
	 * ******************************************************************************/
	awsDownloadWithProgress ( id : number , filename? : string ) : Observable<Download> {
		const saver : Saver | undefined = filename ? ( blob : Blob ) => this.save( blob , filename ) : undefined;
		return this.getLinkDownloadAws( id ).pipe( map( i => i.data ) , switchMap( link => this.http.get( link , { reportProgress : true , observe : 'events' , responseType : 'blob' } ).pipe( this._downloadProcess( saver ) ) ) );
	}

	getLinkDownloadAws ( id : number ) : Observable<AwsResponseInfo> {
		return this.http.post<AwsResponseInfo>( linkGetFileContentAws( id ) , {} );
	}

	getImageASBlobAws ( id : number ) {
		return this.getLinkDownloadAws( id ).pipe( switchMap( res => this.http.get( res.data ) ) );
	}

	async getPathFileAws ( id : number ) : Promise<string> {
		try {
			const res : AwsResponseInfo = await firstValueFrom( this.getLinkDownloadAws( id ) );
			return Promise.resolve( res.code === 'success' && res.data ? res.data : null );
		}
		catch ( e ) {
			return Promise.resolve( null );
		}
	}

	/********************************************************************************
	 * Server file
	 * ******************************************************************************/

	getFile ( nameOrId : string ) : Observable<Blob> {
		return this.http.get( getLinkDownload( nameOrId ) , { responseType : 'blob' } );
	}

	downloadFileByName ( fileName : string , title : string ) : Promise<boolean> {
		return new Promise( resolve => {
			this.getFile( fileName ).subscribe(
				{
					next  : stream => {
						saveAs( stream , title );
						resolve( true );
					} ,
					error : () => resolve( false )
				}
			);
		} );
	}

	getImageContentFromLocalAssesFile ( file : string ) : Observable<string> {
		return this.http.get( file , { responseType : 'blob' } ).pipe( map( res => URL.createObjectURL( res ) ) );
	}

	getImageUrl ( fileList : FileList ) : { file : File, url : string }[] {
		return Array.from( fileList ).map( file => ( {
			file ,
			url : URL.createObjectURL( file )
		} ) );
	}

	/**********************************************************
	 * Convert, prebuild and packet functions
	 * ********************************************************/
	private static packFiles ( files : File[] , tag? : string ) : FormData {
		const formData = new FormData();
		if ( files && files.length ) {
			for ( const file of files ) {
				formData.append( 'upload' , file );
			}
		}

		if ( tag ) {
			formData.append( 'tag' , tag );
		}

		return formData;
	}

	/**********************************************************
	 * Upload file functions
	 * ********************************************************/
	uploadFile ( file : File , donvi_id : number = 0 , user_id : number = 0 ) : Observable<OvicFile> {
		const fromObject = { donvi_id , user_id };
		const params     = new HttpParams( { fromObject } );
		return this.http.post<Dto>( linkFileInfo( '' ) , FileService.packFiles( [ file ] ) , { params : params } ).pipe(
			retry( 2 ) ,
			map( res => Array.isArray( res.data ) ? res.data[ 0 ] : res.data )
		);
	}

	uploadMultiFiles ( files : File[] | any[] , donvi_id : number , user_id : number ) : Observable<any> {
		const fromObject = { donvi_id , user_id };
		const params     = new HttpParams( { fromObject } );
		return this.http.post<Dto>( linkFileInfo( '' ) , FileService.packFiles( files ) , { params : params } ).pipe(
			retry( 2 ) ,
			map( res => res.data )
		);
	}

	uploadFileWidthProgress ( file , tag : string = '' , id : number = 0 ) : Observable<Upload> {
		let params = new HttpParams()
		if ( id ) {
			params = params.set( "id" , id );
		}
		const initialState : Upload = { state : 'PENDING' , progress : 0 };
		const calculateState        = ( upload : Upload , event : HttpEvent<unknown> ) : Upload => {
			if ( this.isHttpProgressEvent( event ) ) {
				return { progress : event.total ? Math.round( ( 100 * event.loaded ) / event.total ) : upload.progress , state : 'IN_PROGRESS' };
			}
			if ( this.isHttpResponse( event ) ) {
				return { progress : 100 , state : 'DONE' , content : event.body };
			}
			return upload;
		};
		return this.http.post( linkFileInfo( '' ) , FileService.packFiles( [ file ] , tag ) , { params : params , reportProgress : true , observe : 'events' } ).pipe( scan( calculateState , initialState ) );
	}

	getPreviewLinkLocalFile ( { id } : OvicFile | { id : number } ) : string {
		const url = new URL( getLinkDownload( id.toString() ) );
		url.searchParams.append( 'token' , localStorage.getItem( ACCESS_TOKEN_KEY ) || '' );
		return url.toString();
	}

	base64ToFile ( base64 : string , fileName : string ) : File {
		const bytes = base64.split( ',' )[ 0 ].indexOf( 'base64' ) >= 0 ? atob( base64.split( ',' )[ 1 ] ) : ( <any> window ).unescape( base64.split( ',' )[ 1 ] );
		const mime  = base64.split( ',' )[ 0 ].split( ':' )[ 1 ].split( ';' )[ 0 ];
		const max   = bytes.length;
		const ia    = new Uint8Array( max );
		for ( let i = 0 ; i < max ; i++ ) {
			ia[ i ] = bytes.charCodeAt( i );
		}
		return new File( [ ia ] , fileName , { lastModified : new Date().getTime() , type : mime } );
	}

	blobToFile ( theBlob : Blob , fileName : string ) : File {
		return new File( [ theBlob ] , fileName , { lastModified : new Date().getTime() , type : theBlob.type } );
	}

	getImageAsBlob ( imageUrl : string ) : Observable<Blob> {
		return this.http.get( imageUrl , { responseType : 'blob' } );
	}

	// ===================================================================
	uploadFileAwsWidthProgress ( file , tag : string = '' ) : Observable<Upload> {
		const initialState : Upload = { state : 'PENDING' , progress : 0 }
		const calculateState        = ( upload : Upload , event : HttpEvent<unknown> ) : Upload => {
			if ( this.isHttpProgressEvent( event ) ) {
				return {
					progress : event.total
					           ? Math.round( ( 100 * event.loaded ) / event.total )
					           : upload.progress ,
					state    : 'IN_PROGRESS'
				}
			}
			if ( this.isHttpResponse( event ) ) {
				return {
					progress : 100 ,
					state    : 'DONE' ,
					content  : event.body
				}
			}
			return upload
		}

		return this.http.post( linkAwsInfo( '' ) , FileService.packFilesV2( [ file ] ) , { reportProgress : true , observe : 'events' } ).pipe( scan( calculateState , initialState ) );
	}

	awsGetFileAsBlob ( id : string ) : Observable<Blob> {
		const params = new HttpParams().set( 'token' , ACCESS_TOKEN_KEY );
		return this.http.get( linkGetFileContentAws( parseInt( id ) ) , { params , responseType : 'blob' } );
		// return this.getAwsPublicUrl(id).pipe(switchMap(url => this.http.get(url, { responseType: 'blob' })));
	}

	//==============================================long custom===========================================
	private static packFilesV2 ( files : File[] , status : number = 0 ) : FormData {
		const formData = new FormData();
		if ( files && files.length ) {
			for ( const file of files ) {
				formData.append( 'upload' , file );
			}
		}
		// formData.append('public', status.toString(10));
		return formData;
	}

	//==============================================trang custom from lms-v3===========================================
	getImageAsBlobAws ( id : number ) : Observable<Download> {
		return this.getLinkDownloadAws( id ).pipe( switchMap( ( info : AwsResponseInfo ) => this.http.get( info.data , { reportProgress : true , observe : 'events' , responseType : 'blob' } ).pipe( this._downloadProcess( null ) ) ) );
	}


	/**
	 * downloadLocalFile
	 * @var path : string - path get to file stored folder
	 * @var fileName : string - File name (without extension)
	 * */
	downloadLocalFile ( path : string , fileName : string ) : void {
		const anchorElement : HTMLAnchorElement = Object.assign( document.createElement<'a'>( "a" ) , {
			download : fileName ,
			href     : path
		} );
		anchorElement.click();
		setTimeout( () : void => anchorElement.remove() , 5000 );
	}
}
