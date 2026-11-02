import { Directive , ElementRef , EventEmitter , Input , OnChanges , OnDestroy , OnInit , Output , SimpleChanges } from '@angular/core';
import { IctuMediaLoaderInstance } from '@model/commons';
import { Download } from '@model/file';
import { LocalStoreFile } from '@pages/admin/bank/cap-nhat-cau-hoi/models/local-store-file';
import { FileService } from '@service/core/file.service';
import { StoreService } from '@service/core/store.service';
import { Helper } from '@utilities/helper';
import { debounceTime , map , Observable , of , Subject , takeUntil } from 'rxjs';
import { filter , tap } from 'rxjs/operators';

type MediaServerName = 'serverFile' | 'googleDrive' | 'serverAws';

@Directive( {
	selector   : '[IctuMediaLoader]' ,
	standalone : true ,
	exportAs   : 'IctuMediaLoader'
} )
export class IctuMediaLoaderDirective implements OnInit , OnChanges , OnDestroy , IctuMediaLoaderInstance {

	@Input( { alias : 'IctuMediaLoader' , required : true } ) anyChanges : any; // base for OnChanges event run, don't remove pls

	@Output() onIctuMediaLoaderSetup : EventEmitter<IctuMediaLoaderInstance> = new EventEmitter<IctuMediaLoaderInstance>();

	@Output() loaded : EventEmitter<string> = new EventEmitter<string>();

	@Output() failed : EventEmitter<string> = new EventEmitter<string>();

	private loader : Record<MediaServerName , ( id : string ) => Observable<string>> = {
		googleDrive : ( id : string ) : Observable<string> => {
			const _fileLoaded : LocalStoreFile = this.storeService.get( { org : 'googleDrive' , id } );
			return _fileLoaded ? of( _fileLoaded.url ) : this.fileService.downloadDriveFile( id ).pipe( map( ( blob : Blob ) : string => URL.createObjectURL( blob ) ) , tap( ( url : string ) => this.storeService.store( { org : 'googleDrive' , id , url } ) ) );
		} ,
		serverAws   : ( id : string ) : Observable<string> => {
			return this.fileService.getImageAsBlobAws( parseInt( id , 10 ) ).pipe(
				filter( ( info : Download ) : boolean => info.state === 'DONE' ) ,
				map( ( info : Download ) : string => URL.createObjectURL( info.content ) )
			);
		} ,
		serverFile  : ( id : string ) : Observable<string> => {
			const _fileLoaded : LocalStoreFile = this.storeService.get( { org : 'serverFile' , id } );
			return _fileLoaded ? of( _fileLoaded.url ) : this.fileService.getFile( id ).pipe( map( ( blob : Blob ) : string => URL.createObjectURL( blob ) ) , tap( ( url : string ) => this.storeService.store( { org : 'serverFile' , id , url } ) ) );
		}
	};

	private reloadObserver : Subject<string> = new Subject<string>();

	private destroyer : Subject<string> = new Subject<string>();

	constructor (
		private storeService : StoreService ,
		private tagElement : ElementRef ,
		private fileService : FileService
	) {
		this.reloadObserver.asObservable().pipe(
			takeUntil( this.destroyer ) ,
			debounceTime( 500 )
		).subscribe( () : void => this.loadMedia() );

	}

	ngOnInit () : void {
		this.onIctuMediaLoaderSetup.emit( this );
	}

	reload () : void {
		this.reloadObserver.next( 'reload' );
	}

	private loadMedia () : void {
		const serverFileImages : NodeList = this.tagElement.nativeElement.querySelectorAll( 'img[data-org="serverFile"]:not(.ictu-img-lazy), img[alt$="serverFile"]:not(.ictu-img-lazy)' );
		const driverImages : NodeList     = this.tagElement.nativeElement.querySelectorAll( 'img[data-org="googleDrive"]:not(.ictu-img-lazy)' );
		const awsImages : NodeList        = this.tagElement.nativeElement.querySelectorAll( 'img[data-org="serverAws"]:not(.ictu-img-lazy), img[alt$="serverAws"]:not(.ictu-img-lazy)' );
		const oembed : NodeList           = this.tagElement.nativeElement.querySelectorAll( 'oembed:not(.ictu-oembed--done)' );
		const imgLoading : string         = 'assets/images/svg/loading.svg';
		const imgError : string           = 'assets/images/load-image-failed.jpg';
		if ( serverFileImages.length || driverImages.length || awsImages.length ) {
			this.tagElement.nativeElement.classList.add( 'ictu-element--contain-images' );
			const ulTag = this.tagElement.nativeElement.closest( 'ul' );
			if ( ulTag ) {
				ulTag.classList.add( 'ictu-list--contain-images' );
			}
			if ( serverFileImages.length ) {
				serverFileImages.forEach( ( node : Node ) : void => {
					const img : HTMLImageElement = node as HTMLImageElement;
					const _id : number           = img.getAttribute( 'src' ) ? parseInt( img.getAttribute( 'src' ) as string , 10 ) : NaN;
					const id : number            = ! Number.isNaN( _id ) ? _id : img.hasAttribute( 'data-src' ) ? parseInt( img.getAttribute( 'data-src' ) as string , 10 ) : NaN;
					if ( ! Number.isNaN( id ) ) {
						img.dataset[ 'src' ] = id.toString( 10 );
						img.classList.add( 'ictu-img-lazy' );
						if ( img.classList.contains( 'img-load--failed' ) ) {
							img.classList.remove( 'img-load--failed' );
						}
						img.src = imgLoading;
						this.loader.serverFile( id.toString( 10 ) ).subscribe( {
							next  : ( src : string ) : void => {
								img.src = src;
								img.classList.add( 'img-loaded--success' );
								this.loaded.emit( id.toString() );
							} ,
							error : () : void => {
								this.handleErrorImages( img , { host : 'serverFile' , id : id.toString( 10 ) } , imgError , imgLoading );
								this.failed.emit( id.toString() );
							}
						} );
					}
				} );
			}
			if ( driverImages.length ) {
				driverImages.forEach( ( node : Node ) : void => {
					const img : HTMLImageElement = node as HTMLImageElement;
					if ( img.getAttribute( 'src' ) && ! img.classList.contains( 'img-loaded--success' ) ) {
						// const imgId : string = img.hasAttribute( 'data-src' ) ? img.getAttribute( 'data-src' ) : img.getAttribute( 'src' ) as string;
						const imgId : string = img.getAttribute( 'src' );
						img.dataset[ 'src' ] = imgId;
						img.classList.add( 'ictu-img-lazy' );
						if ( img.classList.contains( 'img-load--failed' ) ) {
							img.classList.remove( 'img-load--failed' );
						}
						img.src = imgLoading;
						this.loader.googleDrive( imgId ).subscribe( {
							next  : ( src : string ) : void => {
								img.src = src;
								img.classList.add( 'img-loaded--success' );
								this.loaded.emit( imgId );
							} ,
							error : () : void => {
								this.handleErrorImages( img , { host : 'googleDrive' , id : imgId } , imgError , imgLoading );
								this.failed.emit( imgId );
							}
						} );
					}
				} );
			}
			if ( awsImages.length ) {
				awsImages.forEach( ( node : Node ) : void => {
					const img : HTMLImageElement = node as HTMLImageElement;
					const _id : number           = img.getAttribute( 'src' ) ? parseInt( img.getAttribute( 'src' ) as string , 10 ) : NaN;
					const id : number            = ! Number.isNaN( _id ) ? _id : img.dataset[ 'src' ] ? parseInt( img.dataset[ 'src' ] , 10 ) : NaN;
					if ( ! Number.isNaN( id ) ) {
						img.dataset[ 'src' ] = id.toString( 10 );
						img.classList.add( 'ictu-img-lazy' );
						if ( img.classList.contains( 'img-load--failed' ) ) {
							img.classList.remove( 'img-load--failed' );
						}
						// const urlObject : URL = new URL( linkGetFileContentAws( id ) );
						// urlObject.searchParams.append( 'token' , tokenGetter() as string );
						// img.src     = urlObject.toString();
						// img.onerror = () : void => this.handleErrorImages( img , urlObject , imgError , imgLoading );
						img.src = imgLoading;
						this.loader.serverAws( id.toString( 10 ) ).subscribe( {
							next  : ( src : string ) : void => {
								img.src = src;
								if ( img.classList.contains( '--wrap-by-parent' ) ) {
									img.classList.remove( '--wrap-by-parent' );
								}
								img.classList.add( 'img-loaded--success' );
								this.loaded.emit( id.toString() );
							} ,
							error : () : void => {
								this.handleErrorImages( img , { host : 'serverAws' , id : id.toString( 10 ) } , imgError , imgLoading );
								this.failed.emit( id.toString() );
							}
						} );
					}
					else {
						img.classList.add( 'img-src--error' );
					}
				} );
			}
		}
		if ( oembed.length ) {
			oembed.forEach( ( oembedTag : Node ) => {
				const htmlEmbedElement : HTMLEmbedElement = ( oembedTag as HTMLEmbedElement );
				const url : string                        = htmlEmbedElement.getAttribute( 'url' ) as string;
				if ( url ) {
					// oembedTag.parentNode.insertBefore( this.buildIframeTags( url ) , oembedTag.nextSibling );
					htmlEmbedElement.parentNode?.insertBefore( this.buildIframeTags( url ) , oembedTag.nextSibling );
					htmlEmbedElement.classList.add( 'ictu-oembed--done' );
					htmlEmbedElement.classList.add( 'd-none' );
				}
			} );
		}

		// new set setting for ictuMediaFile
		const newImages : NodeList = this.tagElement.nativeElement.querySelectorAll( 'img[alt*=serverFile]:not(.ictu-img-lazy), img[alt*=googleDrive]:not(.ictu-img-lazy), img[alt*=serverAws]:not(.ictu-img-lazy)' );
		if ( newImages.length ) {
			newImages.forEach( ( node : Node ) : void => {
				const img : HTMLImageElement = node as HTMLImageElement;
				let id : number              = img.getAttribute( 'src' ) ? parseInt( img.getAttribute( 'src' ) as string , 10 ) : NaN;
				let host : MediaServerName   = null;
				const altSplit : string[]    = img.alt ? img.alt.trim().split( '|' ) : [];
				if ( altSplit.length > 1 && ! Number.isNaN( parseInt( altSplit[ 0 ] , 10 ) ) ) {
					id   = Number.isNaN( id ) ? parseInt( altSplit[ 0 ] , 10 ) : id;
					host = altSplit[ 1 ] as MediaServerName;
				}
				if ( id && ! Number.isNaN( id ) && host in this.loader ) {
					img.dataset[ 'src' ] = id.toString( 10 );
					img.classList.add( 'ictu-img-lazy' );
					if ( img.classList.contains( 'img-load--failed' ) ) {
						img.classList.remove( 'img-load--failed' );
					}
					img.src = imgLoading;
					this.loader[ host ]( id.toString( 10 ) ).subscribe( {
						next  : ( src : string ) : void => {
							img.src = src;
							img.classList.add( 'img-loaded--success' );
							this.loaded.emit( id.toString() );
						} ,
						error : () : void => {
							this.handleErrorImages( img , { host , id : id.toString() } , imgError , imgLoading );
							this.failed.emit( id.toString() );
						}
					} );
					// if ( host === 'serverAws' ) {
					// 	const urlObject : URL = new URL( linkGetFileContentAws( id ) );
					// 	urlObject.searchParams.append( 'token' , tokenGetter() as string );
					// 	img.src     = urlObject.toString();
					// 	img.onerror = () : void => this.handleErrorImages( img , urlObject , imgError , imgLoading );
					// } else {
					// 	this.loader[ host ]( id.toString( 10 ) ).subscribe( {
					// 		next  : ( src : string ) : void => {
					// 			img.src = src;
					// 			img.classList.add( 'img-loaded--success' );
					// 		} ,
					// 		error : () : void => {
					// 			this.handleErrorImages( img , { host , id : id.toString() } , imgError , imgLoading );
					// 		}
					// 	} );
					// }
				}
			} );
		}
	}

	private buildIframeTags ( url : string ) : HTMLDivElement {
		const div : HTMLDivElement = document.createElement( 'div' );
		div.style.position         = 'relative';
		div.style.display          = 'none';
		// div.style [ 'padding-bottom' ] = '100%';
		div.style[ 'height' ]      = '0';
		div.style[ 'width' ]       = '100%';
		div.style.paddingBottom    = '56.2493%';
		if ( url.includes( 'youtube.com' ) ) {
			const iFrame : HTMLIFrameElement = document.createElement( 'iframe' );
			iFrame.src                       = 'https://www.youtube.com/embed/' + Helper.getYoutubeIdFromUrl( url );
			iFrame.style[ 'position' ]       = 'absolute';
			iFrame.style[ 'width' ]          = '100%';
			iFrame.style[ 'height' ]         = '100%';
			iFrame.style[ 'top' ]            = '0';
			iFrame.style[ 'left' ]           = '0';
			iFrame.setAttribute( 'frameborder' , '0' );
			iFrame.setAttribute( 'allow' , 'autoplay; encrypted-media' );
			iFrame.setAttribute( 'allowfullscreen' , '' );
			div.append( iFrame );
			div.style.display = 'block';
		}
		else if ( url.includes( 'vimeo.com' ) ) {
			const _pathVideoId : string = url.split( '/' ).pop() as string;
			const _strVideoId : string  = _pathVideoId ? _pathVideoId.split( '?' ).shift() as string : '';
			const _videoId : number     = _strVideoId ? parseInt( _strVideoId , 10 ) : NaN;
			if ( ! Number.isNaN( _videoId ) ) {
				const iFrame : HTMLIFrameElement = document.createElement( 'iframe' );
				iFrame.src                       = 'https://player.vimeo.com/video/' + _strVideoId;
				iFrame.style[ 'position' ]       = 'absolute';
				iFrame.style[ 'width' ]          = '100%';
				iFrame.style[ 'height' ]         = '100%';
				iFrame.style[ 'top' ]            = '0';
				iFrame.style[ 'left' ]           = '0';
				iFrame.setAttribute( 'frameborder' , '0' );
				iFrame.setAttribute( 'allow' , 'autoplay; fullscreen; picture-in-picture' );
				iFrame.setAttribute( 'allowfullscreen' , '' );
				div.append( iFrame );
				div.style.display = 'block';
			}
			// <iframe src="https://player.vimeo.com/video/858765708?h=c9f008bd6e" width="640" height="360" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>
		}
		else if ( url.includes( 'dailymotion.com' ) ) {
			const videoId : string = this.getDailyMotionId( url );
			if ( videoId ) {
				const iFrame : HTMLIFrameElement = document.createElement( 'iframe' );
				iFrame.src                       = 'https://www.dailymotion.com/embed/video/x8nseh8' + videoId + '?autoplay=1';
				iFrame.style[ 'position' ]       = 'absolute';
				iFrame.style[ 'width' ]          = '100%';
				iFrame.style[ 'height' ]         = '100%';
				iFrame.style[ 'top' ]            = '0';
				iFrame.style[ 'left' ]           = '0';
				iFrame.style[ 'overflow' ]       = 'hidden';
				iFrame.style[ 'left' ]           = '0';
				iFrame.setAttribute( 'frameborder' , '0' );
				iFrame.setAttribute( 'type' , 'text/html' );
				iFrame.setAttribute( 'allow' , 'autoplay; fullscreen; picture-in-picture' );
				iFrame.setAttribute( 'allowfullscreen' , '' );
				iFrame.setAttribute( 'width' , '100' );
				iFrame.setAttribute( 'height' , '100' );
				div.append( iFrame );
				div.style.overflow = 'hidden';
				div.style.display  = 'block';
			}
		}
		return div;
	}

	private handleErrorImages ( image : HTMLImageElement , provider : URL | { host : MediaServerName, id : string } , imgError : string , imgLoading : string ) : void {


		if ( ! image.classList.contains( '--wrap-by-parent' ) ) {
			image.src = imgError;
			image.classList.add( 'img-load--failed' );
			image.classList.add( '--wrap-by-parent' );


			// make sure the template already rendered;
			setTimeout( () : void => {
				const imageWrapper : HTMLElement = Object.assign( document.createElement( 'figure' ) , { className : 'ictu-wrap-img--new' } );
				this.wrap( image , imageWrapper );
				if ( provider instanceof URL ) {
					imageWrapper.onclick = ( ev : MouseEvent ) : void => {
						ev.preventDefault();
						ev.stopPropagation();
						provider.searchParams.append( 'hash-diff' , Date.now().toString( 10 ) );
						image.src = provider.toString();
					};
					image.onload         = () : void => {
						if ( image.classList.contains( '--wrap-by-parent' ) ) {
							image.classList.remove( '--wrap-by-parent' );
						}
						if ( image.classList.contains( 'img-load--failed' ) ) {
							image.classList.remove( 'img-load--failed' );
						}
						this.unwrap( image );
					};
				}
				else if ( provider instanceof Object && provider.host && provider.id && provider.host in this.loader ) {
					imageWrapper.onclick = ( ev : MouseEvent ) : void => {
						ev.preventDefault();
						ev.stopPropagation();
						image.src = imgLoading;
						if ( image.classList.contains( 'img-load--failed' ) ) {
							image.classList.remove( 'img-load--failed' );
						}
						imageWrapper.classList.add( 'elm-media--loading' );
						this.loader[ provider.host ]( provider.id ).subscribe( {
							next  : ( src : string ) : void => {
								image.src = src;
								if ( image.classList.contains( '--wrap-by-parent' ) ) {
									image.classList.remove( '--wrap-by-parent' );
								}
								if ( image.classList.contains( 'img-load--failed' ) ) {
									image.classList.remove( 'img-load--failed' );
								}
								image.classList.add( 'img-loaded--success' );
								this.loaded.emit( provider.id.toString() );
								this.unwrap( image );
								if ( imageWrapper && imageWrapper.classList.contains( 'elm-media--loading' ) ) {
									imageWrapper.classList.remove( 'elm-media--loading' );
								}
							} ,
							error : () : void => {
								if ( imgError ) {
									image.src = imgError;
								}
								if ( imageWrapper && imageWrapper.classList.contains( 'elm-media--loading' ) ) {
									imageWrapper.classList.remove( 'elm-media--loading' );
								}
								this.failed.emit( provider.id.toString() );
							}
						} );
					};
				}
			} , 500 );
		}
	}

	ngOnChanges ( changes : SimpleChanges ) : void {


		this.loadMedia();
	}

	private getDailyMotionId ( url : string ) : string {
		const m : RegExpMatchArray | null = url.match( /^.+dailymotion.com\/(video|hub)\/([^_]+)[^#]*(#video=([^_&]+))?/ );
		if ( m !== null ) {
			if ( m[ 4 ] !== undefined ) {
				return m[ 4 ];
			}
			return m[ 2 ];
		}
		return '';
	}

	private wrap ( element : HTMLElement , wrapper : HTMLElement ) : void {
		element.parentNode.insertBefore( wrapper , element );
		wrapper.appendChild( element );
	}

	private unwrap ( element : HTMLElement ) : void {
		element.parentNode.parentNode.replaceChild( element , element.parentNode );
	}

	ngOnDestroy () : void {
		this.destroyer.next( 'destroy' );
		this.destroyer.complete();
		this.reloadObserver.complete();
	}
}
