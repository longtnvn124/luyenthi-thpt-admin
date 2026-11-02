import { Directive , ElementRef , Input } from '@angular/core';
import { AwsResponseInfo , Download , IctuDocument , IctuMediaSourceType } from '@model/file';
import { filter } from 'rxjs/operators';
import { FileService } from '@service/core/file.service';
import { LocalStorageMediaService } from '@service/core/local-storage-media.service';

@Directive( {
	selector   : '[appLoadCourseThumbnail]' ,
	standalone : true
} )
export class LoadCourseThumbnailDirective {

	private loader : Record<IctuMediaSourceType , ( file : IctuDocument ) => void> = {
		googleDrive : ( file : IctuDocument ) : void => {
			this.tagElement.nativeElement.classList.add( 'thumbnail-loading' );
			if ( this.localStorageMediaService.get( file ) ) {
				this.tagElement.nativeElement.setAttribute( 'src' , this.localStorageMediaService.get( file ) );
				this.tagElement.nativeElement.classList.remove( 'thumbnail-loading' );
				this.tagElement.nativeElement.classList.add( 'thumbnail-loaded' );
			} else {
				this.fileService.gdDownloadWithProgress( file.path as string ).pipe(
					filter( i => i.state === 'DONE' )
				).subscribe( {
					next  : ( res : Download ) => {
						this.localStorageMediaService.set( file , URL.createObjectURL( res.content ) );
						this.tagElement.nativeElement.setAttribute( 'src' , this.localStorageMediaService.get( file ) );
						this.tagElement.nativeElement.classList.remove( 'thumbnail-loading' );
						this.tagElement.nativeElement.classList.add( 'thumbnail-loaded' );
					} ,
					error : () => {
						this.tagElement.nativeElement.classList.remove( 'thumbnail-loading' );
						this.tagElement.nativeElement.classList.add( 'thumbnail-load-fail' );
					}
				} );
			}
		} ,
		serverFile  : ( file : IctuDocument ) : void => {
			
			
			this.tagElement.nativeElement.classList.add( 'thumbnail-loading' );
			const id : string = typeof file.path === 'string' ? file.path : file.path.toString( 10 );
			const url = new URL(location.origin +'/assets/images/svg/loading.svg');
			url.searchParams.append('file',id);
			url.searchParams.append('origin','serverFile');
			url.searchParams.append('nonce', Date.now().toString());
			const placeholder : string = url.toString();
			this.tagElement.nativeElement.src=placeholder;
			this.fileService.getFile( id ).subscribe( {
				next  : ( blob : Blob ) => {
					const img = document.querySelector('img[src="'+placeholder+'"]');
					if(img){
						img.setAttribute( 'src' , URL.createObjectURL(blob) );
						img.classList.remove( 'thumbnail-loading' );
						img.classList.add( 'thumbnail-loaded' );
					}
				} ,
				error : () => {
					const img = document.querySelector('img[src="'+placeholder+'"]');
					if(img){
						img.classList.remove( 'thumbnail-loading' );
					img.classList.add( 'thumbnail-load-fail' );
					}
				}
			} );
		} ,
		serverAws   : ( file : IctuDocument ) : void => {
			this.tagElement.nativeElement.classList.add( 'thumbnail-loading' );
			if ( this.localStorageMediaService.get( file ) ) {
				this.tagElement.nativeElement.setAttribute( 'src' , this.localStorageMediaService.get( file ) );
				this.tagElement.nativeElement.classList.remove( 'thumbnail-loading' );
			} else {
				const id : number = typeof file.path === 'string' ? parseInt( file.path ) : file.path;
				this.fileService.getLinkDownloadAws( id ).subscribe( {
					next  : ( res : AwsResponseInfo ) => {
						this.localStorageMediaService.set( file , res.data );
						this.tagElement.nativeElement.setAttribute( 'src' , this.localStorageMediaService.get( file ) );
						this.tagElement.nativeElement.classList.remove( 'thumbnail-loading' );
						this.tagElement.nativeElement.classList.add( 'thumbnail-loaded' );
					} ,
					error : () => {
						this.tagElement.nativeElement.classList.remove( 'thumbnail-loading' );
						this.tagElement.nativeElement.classList.add( 'thumbnail-load-fail' );
					}
				} );
			}
		} ,
		encrypted   : () : void => {} ,
		local       : () : void => {} ,
		vimeo       : () : void => {} ,
		youtube     : () : void => {}
	};

	@Input( 'appLoadCourseThumbnail' ) set file( file : IctuDocument ) {
		if ( file ) {
			this.loader[ file.source ]( file );
		}
	}

	constructor(
		private tagElement : ElementRef ,
		private fileService : FileService ,
		private localStorageMediaService : LocalStorageMediaService
	) {}
}
