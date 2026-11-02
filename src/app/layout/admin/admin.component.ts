import { AfterViewInit , Component , OnDestroy , OnInit , ViewChild } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { MatDrawer , MatDrawerMode } from '@angular/material/sidenav';
import { LayoutService } from '@theme/services/layout.service';
import { ENVIRONMENT , HIDDEN_MENUS } from '@env';
import { Navigation } from '@theme/types/navigation';
import { AuthService } from '@service/core/auth.service';
import { Ucase } from '@model/ucase';
import { state , style , trigger } from '@angular/animations';
import { debounceTime , delay , filter , Observable , of , Subject , switchMap , takeUntil } from 'rxjs';
import { NotificationService , SideNavigationMenu } from '@theme/services/notification.service';
import { NavigationEnd , Router } from "@angular/router";

@Component( {
	selector    : 'app-admin' ,
	templateUrl : './admin.component.html' ,
	styleUrls   : [ './admin.component.scss' ] ,
	animations  : [
		trigger( 'overlayAnimations' , [
			state( 'open' , style( {
				opacity    : 1 ,
				visibility : 'visible'
			} ) ) ,
			state( 'close' , style( {
				opacity    : 0 ,
				visibility : 'hidden'
			} ) )
		] ) ,
		trigger( 'dropdown' , [
			state( 'open' , style( {
				top        : '100%' ,
				opacity    : 1 ,
				visibility : 'visible'
			} ) ) ,
			state( 'close' , style( {
				top        : 'calc(100% + 13px)' ,
				opacity    : 0 ,
				visibility : 'hidden'
			} ) )
		] ) ,
		trigger( 'navigationMenuEffect' , [ state( 'open' , style( { right : 0 } ) ) ] )
	]
} )
export class AdminComponent implements OnInit , AfterViewInit , OnDestroy {

	@ViewChild( 'sidebar' ) sidebar! : MatDrawer;

	menus : Navigation[];

	modeValue : MatDrawerMode = 'side';

	isSidebarClosed : boolean = false;

	sideNavigationMenuSettings : SideNavigationMenu;

	menuSize : string = '300px';

	initRight : string = '-310px';

	defaultNavigationOffsetTop : string = '60px';

	navigationOffsetTop : string = this.defaultNavigationOffsetTop;

	sideNavigationOffCanvasSize : string = '0';

	navigationMenuState : 'open' | 'close' = 'close';

	readonly currentApplicationVersion : string = ENVIRONMENT.appVersion;

	readonly hostname : string = location.hostname;

	private destroy$ : Subject<string> = new Subject<string>();

	constructor (
		private breakpointObserver : BreakpointObserver ,
		private auth : AuthService ,
		private layoutService : LayoutService ,
		private router : Router ,
		private notificationService : NotificationService
	) {
		this.notificationService.onSideNavigationMenuOpen().pipe(
			debounceTime( 100 ) ,
			switchMap( ( settings : SideNavigationMenu ) : Observable<string> => {
					this.sideNavigationMenuSettings  = settings;
					this.menuSize                    = settings.size ? `${ settings.size }px` : '100%';
					this.initRight                   = '-' + ( settings.size ? `${ settings.size + 10 }px` : '110%' );
					this.navigationOffsetTop         = settings.offsetTop ? settings.offsetTop : this.defaultNavigationOffsetTop;
					this.sideNavigationOffCanvasSize = settings[ 'offCanvas' ] ? Math.max( 0 , ( settings.size + 10 ) ) + 'px' : '0';
					return of( '' );
				}
			) ,
			delay( 50 ) ,
			takeUntil( this.destroy$ )
		).subscribe( () : void => {
			this.navigationMenuState = 'open';
		} );

		this.notificationService.onSideNavigationMenuClosed().pipe(
			debounceTime( 100 ) ,
			takeUntil( this.destroy$ )
		).subscribe( () : void => {
			this.navigationMenuState         = 'close';
			this.sideNavigationOffCanvasSize = '0';
		} );

		this.router.events.pipe(
			takeUntil( this.destroy$ ) ,
			filter( ( event : any ) : boolean => ( event instanceof NavigationEnd ) )
		).subscribe( {
			next : () : void => {
				this.auth.requestCheckVersion.next( '' );
			}
		} );
	}

	ngOnInit () : void {
		this.breakpointObserver.observe( [ '(min-width: 1025px)' , '(max-width: 1024.98px)' ] ).subscribe( ( result ) => {
			if ( result.breakpoints[ '(max-width: 1024.98px)' ] ) {
				this.modeValue = 'over';
			}
			else if ( result.breakpoints[ '(min-width: 1025px)' ] ) {
				this.modeValue = 'side';
			}
		} );
		this.menus = this.useCase2ToMenuItem( this.auth.permission.data.menus , null );
	}

	useCase2ToMenuItem ( data : Ucase[] , lang : any = null ) : Navigation[] {
		const translated          = lang ? lang.translations.route : null;
		let result : Navigation[] = [];
		if ( data.length ) {
			data.filter( u => u.position === 'left' ).forEach( ( { child , title , icon , id } ) => {
				if ( ! HIDDEN_MENUS.has( id ) ) {
					const menu : Navigation = {
						id    : id ,
						title : translated && translated.hasOwnProperty( id ) ? translated[ id ] : title ,
						icon  : icon ,
						type  : 'item' ,
						url   : id
					};
					if ( child && child.length ) {
						menu[ 'children' ] = [];
						const styleClass   = [ id ? id.replace( /\//gmi , '__' ) : '' ];
						child.filter( u => u.position === 'left' ).forEach( nodeChild => {
							if ( ! HIDDEN_MENUS.has( nodeChild.id ) ) {
								menu[ 'children' ].push( {
									id    : nodeChild.id ,
									url   : nodeChild.id ,
									title : translated && translated.hasOwnProperty( nodeChild.id ) ? translated[ nodeChild.id ] : nodeChild.title ,
									icon  : nodeChild.icon ,
									link  : nodeChild.id ,
									type  : 'item'

								} );
								styleClass.push( nodeChild.id ? nodeChild.id.replace( /\//gmi , '__' ) : '' );
							}
						} );
						menu[ 'styleClass' ] = styleClass.join( ' ' );
						menu[ 'type' ]       = 'collapse';
					}
					else {
						menu[ 'url' ] = id;
					}
					result.push( menu );
				}
			} )
		}
		return result;
	}

	ngAfterViewInit () : void {
		this.layoutService.layoutState.pipe(
			takeUntil( this.destroy$ )
		).subscribe( () : void => {
			void this.sidebar.toggle();
		} );

		this.sidebar.openedStart.pipe(
			takeUntil( this.destroy$ )
		).subscribe( () : void => {
			this.isSidebarClosed = false;
		} );

		this.sidebar.closedStart.pipe(
			takeUntil( this.destroy$ )
		).subscribe( () : void => {
			this.isSidebarClosed = true;
		} );
	}

	closePanel ( settings : SideNavigationMenu ) : void {
		if ( settings && ! settings[ 'preventCloseWhenClickOnOverlay' ] ) {
			this.notificationService.closeSideNavigationMenu( settings.name );
		}
	}

	ngOnDestroy () : void {
		this.destroy$.next( 'close' );
		this.destroy$.complete();
	}
}
