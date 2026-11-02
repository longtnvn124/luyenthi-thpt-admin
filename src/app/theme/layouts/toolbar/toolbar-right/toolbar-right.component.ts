import { Component , HostListener , OnDestroy , ViewChild } from '@angular/core';
import { NotificationService } from '@appNotification';
import { Subject , takeUntil } from 'rxjs';
import { MatMenuTrigger } from '@angular/material/menu';
import { Router } from '@angular/router';
import { AuthService } from '@service/core/auth.service';
import { DonViService } from '@service/core/don-vi.service';
import { Message } from '@model/message';

interface City {
	name : string,
	code : string
}

@Component( {
	selector    : 'app-nav-right' ,
	templateUrl : './toolbar-right.component.html' ,
	styleUrls   : [ './toolbar-right.component.scss' ]
} )
export class NavRightComponent implements OnDestroy {
	
	cards = [
		{
			icon        : 'custom-layer' ,
			time        : '2 min ago' ,
			position    : 'UI/UX Design' ,
			description :
				'Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley oftype and scrambled it to make a type'
		} ,
		{
			icon        : 'custom-sms' ,
			time        : '1 hour ago' ,
			position    : 'Message' ,
			description : 'Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500.'
		}
	];
	
	cards2 = [
		{
			icon        : 'custom-document-text' ,
			time        : '12 hour ago' ,
			position    : 'Forms' ,
			description :
				'Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley oftype and scrambled it to make a type'
		} ,
		{
			icon        : 'custom-security-safe' ,
			time        : '18 hour ago' ,
			position    : 'Security' ,
			description : 'Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500.'
		}
	];
	
	displayName : string = 'unknown';
	
	email : string = 'unknown';
	
	avatar : string = 'assets/images/user/avatar-2.jpg';
	
	private onDestroy$ : Subject<string> = new Subject<string>();
	
	state : 'loading' | 'success' | 'error' = 'loading';
	
	@ViewChild( 'miniCartMenuTrigger' , { static : true } ) miniCartMenuTrigger : MatMenuTrigger;
	
	featureName : string = '';
	
	maxMiniCartHeight : number = window.innerHeight - 250;
	
	@HostListener( 'window:resize' , [ '$event' ] ) onResize ( event : { target : { innerHeight : number; }; } ) {
		this.maxMiniCartHeight = event.target.innerHeight - 250;
	}
	
	listDonvi : any[];
	
	selectDonviId : number;
	
	isAdmin = false;
	
	
	// listdata
	listData : Message[] = [];
	
	constructor (
		private notification : NotificationService ,
		private router : Router ,
		private donviService : DonViService ,
		private auth : AuthService ,
		// private messageService: MessageService
	) {
		// this.isAdmin = this.auth.userHasRole('admin_ky_tuc_xa');
		this.auth.onUserSetup.pipe( takeUntil( this.onDestroy$ ) ).subscribe( user => {
			this.displayName = user.display_name;
			this.email       = user.email;
			this.avatar      = user.avatar;
		} );
	}
	
	async ngOnInit () : Promise<void> {
		this.loadInit();
	}
	
	
	loadInit () {
		
		this.loadData();
	}
	
	loadData () {
		// this.messageService.getAll().pipe(
		// 	map((data: { recordsTotal: number, data: Message[] }) => {
		// 		let newDataVal = data.data.map((item: Message) => {
		// 			if (!item.sender_avatar) {
		// 				item.sender_avatar = DEFAULT_AVATAR;
		// 			}
		// 			if (!item.user_avatar) {
		// 				item.user_avatar = DEFAULT_AVATAR;
		// 			}
		// 			return item;
		// 		});
		// 		// Return the transformed data
		// 		return { recordsTotal: data.recordsTotal, data: newDataVal };
		// 	})
		// ).subscribe({
		// 	next: (data: { recordsTotal: number, data: Message[] }) => {
		// 		this.listData = data.data;
		// 	},
		// 	error: (err) => {
		// 	}
		// });
		
	}
	
	confirmSignOut () {
		this.notification.confirmSignOut();
	}
	
	ngOnDestroy () : void {
		this.onDestroy$.next( '' );
		this.onDestroy$.complete();
	}
	
	preventCloseMenuOnClick ( event : Event ) {
		event.stopPropagation();
		event.preventDefault();
	}
	
	closeCartMenu ( event : Event ) {
		event.stopPropagation();
		event.preventDefault();
		this.miniCartMenuTrigger.closeMenu();
	}
}
