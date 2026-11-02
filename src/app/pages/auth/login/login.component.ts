import { AfterViewInit , Component , inject , Inject , NgZone , OnDestroy , OnInit , Renderer2 } from '@angular/core';
import { CommonModule , DOCUMENT } from '@angular/common';
import { AbstractControl , FormBuilder , FormControl , FormGroup , Validators } from '@angular/forms';
import { ActivatedRoute , Router , RouterModule } from '@angular/router';
import { SharedModule } from '@sharedModule';
import { AuthService } from '@service/core/auth.service';
import { Title } from '@angular/platform-browser';
import { GoogleSignIn } from '@model/oauth';
import { ConstructUser , UserSignIn } from '@model/user';
import { UserService } from '@service/core/user.service';
import { ENVIRONMENT } from "@env";
import { APP_VERSION_WITH_TIMEZONE } from "../../../app.module";

declare var google : any;

interface GooglePayload {
	aud : string;
	azp : string;
	email : string;
	email_verified : boolean;
	exp : number;
	family_name : string;
	given_name : string;
	iat : number;
	iss : string;
	jti : string;
	locale : string;
	name : string;
	nbf : number;
	picture : string;
	sub : string;
}

interface IdConfiguration {
	client_id : string;
	auto_select? : boolean;
	callback : ( handleCredentialResponse : CredentialResponse ) => void;
	login_uri? : string;
	native_callback? : Function;
	cancel_on_tap_outside? : boolean;
	prompt_parent_id? : string;
	nonce? : string;
	context? : string;
	state_cookie_domain? : string;
	ux_mode? : 'popup' | 'redirect';
	allowed_parent_origin? : string | string[];
	intermediate_iframe_close_callback? : Function;
}

interface CredentialResponse {
	credential? : string;
	select_by? :
		| 'auto'
		| 'user'
		| 'user_1tap'
		| 'user_2tap'
		| 'btn'
		| 'btn_confirm'
		| 'brn_add_session'
		| 'btn_confirm_add_session';
	clientId? : string;
}

interface GsiButtonConfiguration {
	type : 'standard' | 'icon',
	theme? : 'outline' | 'filled_blue' | 'filled_black',
	size? : 'large' | 'medium' | 'small',
	text? : 'signin_with' | 'signup_with' | 'continue_with',
	shape? : 'rectangular' | 'pill' | 'circle' | 'square',
	logo_alignment? : 'left' | 'center',
	width? : string,
	local? : string,
}

interface PromptMomentNotification {
	isDisplayMoment : () => boolean;
	isDisplayed : () => boolean;
	isNotDisplayed : () => boolean;
	getNotDisplayedReason : () =>
		| 'browser_not_supported'
		| 'invalid_client'
		| 'missing_client_id'
		| 'opt_out_or_no_session'
		| 'secure_http_required'
		| 'suppressed_by_user'
		| 'unregistered_origin'
		| 'unknown_reason';
	isSkippedMoment : () => boolean;
	getSkippedReason : () =>
		| 'auto_cancel'
		| 'user_cancel'
		| 'tap_outside'
		| 'issuing_failed';
	isDismissedMoment : () => boolean;
	getDismissedReason : () =>
		| 'credential_returned'
		| 'cancel_called'
		| 'flow_restarted';
	getMomentType : () => 'display' | 'skipped' | 'dismissed';
}

interface Window {
	google? : {
		accounts : {
			id : {
				initialize : ( input : IdConfiguration ) => void
				prompt : (
					momentListener : ( res : PromptMomentNotification ) => void
				) => void
				renderButton : (
					parent : HTMLElement ,
					options : GsiButtonConfiguration ,
					clickHandler : Function
				) => void
				disableAutoSelect : Function
				storeCredential : () => {
					credentials : { id : string; password : string }
					callback : Function
				}
				cancel : () => void
				onGoogleLibraryLoad : Function
				revoke : () => {
					hint : string
					callback : () => { successful : boolean; error : string }
				}
			}
		}
	};
	onGoogleLibraryLoad? : () => void;
}

@Component( {
	selector    : 'app-login' ,
	standalone  : true ,
	imports     : [ CommonModule , SharedModule , RouterModule ] ,
	templateUrl : './login.component.html' ,
	styleUrls   : [ '../authentication.scss' , './login.component.scss' ]
} )
export default class LoginComponent implements OnInit , AfterViewInit , OnDestroy {

	hide : boolean = true;

	formGroup : FormGroup;

	loading : boolean = true;

	public appVersion : string = inject( APP_VERSION_WITH_TIMEZONE );

	constructor (
		private title : Title ,
		private activatedRoute : ActivatedRoute ,
		private fb : FormBuilder ,
		private auth : AuthService ,
		private _renderer2 : Renderer2 ,
		private router : Router ,
		private userService : UserService ,
		@Inject( DOCUMENT ) private _document : Document ,
		private ngZone : NgZone
	) {
		this.formGroup = this.fb.group( {
			username : [ '' , [ Validators.required , Validators.maxLength( 200 ) ] ] ,
			password : [ '' , [ Validators.required , Validators.maxLength( 200 ) ] ]
		} );
	}

	ngOnInit () : void {
		this.title.setTitle( 'Đăng nhập' );
		if ( this.auth.isAuthenticated ) {
			setTimeout( () => this.redirectUser() , 200 );
		}
		else {
			const _window : Window           = window as Window;
			_window[ 'onGoogleLibraryLoad' ] = () => {
				google.accounts.id.initialize( {
					client_id             : ENVIRONMENT.deploy.googleClientId ,
					callback              : this.handleGoogleCredentialResponse.bind( this ) ,
					auto_select           : false ,
					cancel_on_tap_outside : true
				} );
				google.accounts!.id.renderButton(
					document!.getElementById( 'google_sign_in_area' )! ,
					{
						width : '100%' ,
						size  : 'large' ,
						type  : 'standard' ,
						shape : 'circle' ,
						text  : 'signin_with' ,
						theme : 'filled_blue'
					}
				);
			};
			this.loading                     = false;
		}
	}

	get username () : FormControl {
		return <FormControl<any>> this.f[ 'username' ];
	}

	get password () : FormControl {
		return <FormControl<any>> this.f[ 'password' ];
	}

	get f () : { [ key : string ] : AbstractControl<any> } {
		return this.formGroup.controls;
	}

	ngAfterViewInit () : void {
		const script1 = this._renderer2.createElement( 'script' );
		script1.src   = `https://accounts.google.com/gsi/client`;
		script1.async = `true`;
		script1.defer = `true`;
		this._renderer2.appendChild( this._document.body , script1 );
	}

	async handleGoogleCredentialResponse ( response : GoogleSignIn ) : Promise<void> {
		this.loading = true;
		this.ngZone.run( () => this.checkCreateNewAccount( response ) );
	}

	private checkCreateNewAccount ( response : GoogleSignIn ) {
		const base64Url : string      = response.credential.split( '.' )[ 1 ];
		const base64 : string         = base64Url.replace( /-/g , '+' ).replace( /_/g , '/' );
		const jsonPayload : string    = decodeURIComponent( atob( base64 ).split( '' ).map( function ( c ) {
			return '%' + ( '00' + c.charCodeAt( 0 ).toString( 16 ) ).slice( -2 );
		} ).join( '' ) );
		const payload : GooglePayload = JSON.parse( jsonPayload );
		const newUser : ConstructUser = {
			username     : payload.email.replace( /@/gi , '_' ).replace( /\./gi , '_' ) ,
			display_name : payload.name ,
			phone        : payload.email ,
			email        : payload.email ,
			password     : [ '#1Qw@' , payload.jti || Date.now().toString( 10 ) , '56dOP98#S%^' ].join( '' ).slice( 0 , 9 )
		};
		this.userService.create( newUser ).subscribe( {
			next  : () => this.handleAfterRegisterUser( response ) ,
			error : () => this.loading = false
		} );
	}

	private async handleAfterRegisterUser ( response : GoogleSignIn ) : Promise<void> {
		try {
			const successful : boolean = await this.auth.googleSignIn( response );
			if ( successful ) {
				this.redirectUser();
			}
			this.loading = false;
		}
		catch ( e ) {
			this.loading = false;
		}
	}

	async loginWithUserPassword () {
		if ( this.formGroup.valid ) {
			this.loading              = true;
			const signIn : UserSignIn = {
				username : this.username.value.trim() ,
				password : this.password.value.trim()
			};
			try {
				const successful : boolean = await this.auth.signIn( signIn );
				if ( successful ) {
					this.redirectUser();
				}
				this.loading = false;
			}
			catch ( e ) {
				this.loading = false;
			}
		}
	}

	private redirectUser () : void {
		this.title.setTitle( ENVIRONMENT.deploy.title );
		if ( this.activatedRoute.snapshot.queryParamMap.has( 'returnUrl' ) ) {
			void this.router.navigate( [ this.activatedRoute.snapshot.queryParamMap.get( 'returnUrl' ) ] );
		}
		else {
			void this.router.navigate( [ 'admin/dashboard' ] );
		}
	}

	ngOnDestroy () : void {
	}
}
