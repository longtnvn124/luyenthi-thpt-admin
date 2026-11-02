import { Component , HostListener , Inject , inject , OnDestroy } from '@angular/core';
import { NavigationCancel , NavigationEnd , NavigationError , NavigationStart , Router } from '@angular/router';
import { AuthService } from '@service/core/auth.service';
import { debounceTime , distinctUntilChanged , fromEvent , map , merge , Observable , Observer , Subject , takeUntil } from 'rxjs';
import { NotificationService } from '@appNotification';
import { applyInlineStyles } from "@utilities/helper";
import { DOCUMENT } from '@angular/common';
import { APP_VERSION_WITH_TIMEZONE } from "./app.module";
import { ConfirmDialogData } from "@theme/components/confirm/confirm.component";
import { Button } from "@model/button";

@Component( {
	selector    : 'app-root' ,
	templateUrl : './app.component.html' ,
	styleUrls   : [ './app.component.css' ]
} )
export class AppComponent implements OnDestroy {

	isSpinnerVisible : boolean = true;

	isLoading : boolean = false;

	@HostListener( 'window:resize' ) onWindowResize () : void {
		this.measureDeviceScreenSize();
	}

	private destroy$ : Subject<string> = new Subject<string>();

	isInternetConnected : boolean = true;

	public appVersion : string = inject( APP_VERSION_WITH_TIMEZONE );

	constructor (
		private router : Router ,
		private auth : AuthService ,
		private notification : NotificationService ,
		@Inject( DOCUMENT ) private document : Document
	) {
		this.notification.onAppLoading.pipe(
			debounceTime( 50 ) ,
			distinctUntilChanged() ,
			takeUntil( this.destroy$ )
		).subscribe( ( isLoading : boolean ) : void => {
			this.isLoading = isLoading;
		} );

		this.router.events.subscribe( {
			next  : ( event ) : void => {
				if ( event instanceof NavigationStart ) {
					this.isSpinnerVisible = true;
				}
				else if ( event instanceof NavigationEnd || event instanceof NavigationCancel || event instanceof NavigationError ) {
					this.isSpinnerVisible = false;
				}
			} ,
			error : () : void => {
				this.isSpinnerVisible = false;
			}
		} );

		this.auth.onGetToLoginPage.pipe(
			debounceTime( 100 ) ,
			takeUntil( this.destroy$ )
		).subscribe( () : void => {
			void this.router.navigateByUrl( '/auth/login' )
		} );

		this.notification.onSignOut.pipe(
			debounceTime( 100 ) ,
			takeUntil( this.destroy$ )
		).subscribe( () : void => {
			this.auth.logout();
		} );

		this.auth.onHasANewVersion.subscribe( ( newVersion : string ) : void => this.showNoticeVersionUpdates( newVersion ) );

		this.measureDeviceScreenSize();

		merge(
			fromEvent<boolean>( window , 'offline' ).pipe( map( () : boolean => false ) ) ,
			fromEvent<boolean>( window , 'online' ).pipe( map( () : boolean => true ) ) ,
			new Observable<boolean>( ( subscribe : Observer<boolean> ) : void => {
				subscribe.next( navigator.onLine );
				subscribe.complete();
			} )
		).pipe( takeUntil( this.destroy$ ) ).subscribe( ( isInternetConnected : boolean ) : void => {
			this.isInternetConnected = isInternetConnected;
		} );
	}

	private measureDeviceScreenSize () : void {
		const checker : HTMLElement = Object.assign( this.document.createElement( 'div' ) , { classList : 'element-app-checker' } );
		this.document.body.appendChild( applyInlineStyles( checker , {
			position : 'fixed' ,
			top      : '0' ,
			right    : '0' ,
			bottom   : '0' ,
			left     : '0' ,
			zIndex   : '-999999'
		} ) );
		this.document.body.style.setProperty( '--max-screen-height' , checker.clientHeight + 'px' );
		this.document.body.style.setProperty( '--max-screen-width' , checker.clientWidth + 'px' );
		setTimeout( () : void => checker.remove() , 1000 );
	}

	private showNoticeVersionUpdates ( newVersion : string ) : void {
		const CONFIRM_UPDATE_BUTTON : Button = {
			label    : 'CẬP NHẬT' ,
			icon     : 'pi pi-sync' ,
			readonly : false ,
			ngStyle  : {
				'font-size'     : '13px' ,
				'padding'       : '12px 15px' ,
				'border-radius' : '4px' ,
				'outline'       : 'none' ,
				'box-shadow'    : 'none'
			}
		};
		const data : ConfirmDialogData       = {
			heading : 'Thông báo cập nhật' ,
			message : `<p class="m-0 text-secondary --fs-15">Ứng dụng đã có phiên bản mới <span class="text-warning">${ newVersion }</span></p> <p class="m-0 text-secondary --fs-15">Vui lòng nhấn <span class="text-primary">CẬP NHẬT</span> để nâng cấp lên phiên bản mới nhất.</p>` ,
			buttons : [ CONFIRM_UPDATE_BUTTON ]
		};
		this.notification.confirm( data ).subscribe( () : void => {
			const url : URL = new URL( window.location.href );
			url.searchParams.set( 'version' , newVersion );
			window.location.assign( url.toString() );
		} );
	}

	ngOnDestroy () : void {
		this.destroy$.next( 'close' );
		this.destroy$.complete();
	}
}

