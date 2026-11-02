import { CommonModule , DOCUMENT } from "@angular/common";
import { Component , Inject , NgZone , OnInit , Renderer2 } from "@angular/core";
import { FormBuilder , FormGroup } from "@angular/forms";
import { ActivatedRoute , Router , RouterModule } from "@angular/router";
import { SharedModule } from "@module/shared/shared.module";
import { Title } from "@angular/platform-browser";
import { environment } from "@env";
import { GoogleSignIn , ConstructUser } from "@model/user";
import { AuthService } from "@service/core/auth.service";
import { UserService } from "@service/core/user.service";

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

declare var google : any;

@Component( {
	selector    : 'app-register-account' ,
	templateUrl : './register-account.component.html' ,
	styleUrls   : [ './register-account.component.css' , '../authentication.scss' ] ,
	standalone  : true ,
	imports     : [ CommonModule , SharedModule , RouterModule ] ,
} )

export default class RegisterAccountComponent implements OnInit {

	hide : boolean = true;

	formGroup : FormGroup;

	loading : boolean = true;

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
	}

	ngOnInit () : void {
		this.title.setTitle( 'Đăng nhập' );
		if ( this.auth.isAuthenticated ) {
			setTimeout( () => this.redirectUser() , 200 );
		}
		else {
			const _window : Window = window as Window;
			_window[ 'onGoogleLibraryLoad' ] = () => {
				google.accounts.id.initialize( {
					client_id             : environment.deploy.googleClientId ,
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
			this.loading = false;
		}
	}

	ngAfterViewInit () : void {
		const script1 : HTMLScriptElement = this._renderer2.createElement( 'script' );
		script1.src = 'https://accounts.google.com/gsi/client';
		script1.async = true;
		script1.defer = true;
		this._renderer2.appendChild( this._document.body , script1 );
	}

	async handleGoogleCredentialResponse ( response : GoogleSignIn ) : Promise<void> {
		this.loading = true;
		this.ngZone.run( () : void => this.checkCreateNewAccount( response ) );
	}

	private checkCreateNewAccount ( response : GoogleSignIn ) {
		// This next is for decoding the idToken to an object if you want to see the details.
		const base64Url : string = response.credential.split( '.' )[ 1 ];
		const base64 : string = base64Url.replace( /-/g , '+' ).replace( /_/g , '/' );
		const jsonPayload : string = decodeURIComponent( atob( base64 ).split( '' ).map( function ( c ) {
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
			next  : () : void => {
				void this.handleAfterRegisterUser( response );
			} ,
			error : () : void => {
				this.loading = false
			}
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

	private redirectUser () : void {
		this.title.setTitle( environment.deploy.title );
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
