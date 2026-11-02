import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import * as CryptoJS from 'crypto-js';
import { ACCESS_TOKEN_KEY , AUTH_OPTIONS , ENCRYPT_KEY , ENVIRONMENT , getApiRouteLink , IDENTITY_CODE , PERMISSION_STORAGE_KEY , REFRESH_TOKEN_KEY , SELECTED_DONVI_ID , TEACHER_STORAGE_KEY , UCASE_KEY , USER_META_STORAGE_KEY , USER_STORAGE_KEY } from '@env';
import { GoogleSignIn , User , UserMeta , UserSignIn } from '@model/user';
import { Permission , Token } from '@model/oauth';
import { BehaviorSubject , catchError , filter , firstValueFrom , forkJoin , map , mergeMap , Observable , of , Subject , switchMap , takeUntil , tap , timer } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { refreshTokenGetter , refreshTokenSetter , tokenGetter , tokenSetter } from '../../app.module';
import { Dto , DtoObject , IctuQueryCondition } from '@model/dto';
import { Helper , HelperClass } from '@utilities/helper';
import { SystemConfig } from '@model/system-config';
import { SysConfigsService } from '@service/core/sys-configs.service';
import { IctuNavigationItemPms , SimpleRole , UserPermission } from '@model/auth';
import { UserService } from './user.service';
import { Ucase , UcaseAdvance } from '@model/ucase';
import { DonVi } from '@model/danh-muc';
import { Teacher } from "@model/teacher";
import { TeacherService } from "@service/luyenthithpt/teacher.service";
import { PickRole } from "@model/role";

interface IdentityStoreData {
	teacher : Teacher | null,
	user : User | null,
	permission : Permission | null,
	userMeta : UserMeta[],
}

interface SignInBaseDto {
	userMeta : UserMeta[],
	user : User,
	permissions : Permission,
	configs : PickSystemConfig[]
}

interface SignInWithTeacherDto extends SignInBaseDto {
	teacher : Teacher
}

const nullPermission : Permission = Object.freeze( { data : { menus : [] , roles : [] } } );

type PickSystemConfig = Pick<SystemConfig , 'config_key' | 'value'>

const matchRoute : ( route : string , menu : Ucase ) => boolean = ( route : string , { id } : Ucase ) : boolean => id === route;

const extractPms : ( menu : Ucase ) => IctuNavigationItemPms = ( { pms } : Ucase ) : IctuNavigationItemPms => Object.assign<IctuNavigationItemPms , IctuNavigationItemPms>( [ 0 , 0 , 0 , 0 ] , pms );

@Injectable( {
	providedIn : 'root'
} )
export class AuthService {

	private readonly jwtHelperService : JwtHelperService = new JwtHelperService();

	private readonly _key : CryptoJS.lib.WordArray = CryptoJS.enc.Utf8.parse( ENCRYPT_KEY );

	private readonly _iv : CryptoJS.lib.WordArray = CryptoJS.enc.Utf8.parse( ENCRYPT_KEY );

	private _user : User | null = null;

	private _permission : Permission | null = nullPermission;

	private observeGetToLoginPage$ : Subject<string> = new Subject<string>();

	private userSetupBehavior : BehaviorSubject<User | null> = new BehaviorSubject<User | null>( null );

	private permissionSetupBehavior : BehaviorSubject<Permission | null> = new BehaviorSubject<Permission | null>( null );

	private _options : any[] = null;

	private get options () : any {
		if ( this._options ) {
			return this._options;
		}
		const decrypt : string = localStorage.getItem( AUTH_OPTIONS );
		return decrypt ? JSON.parse( this.decrypt( decrypt ) ) : [];
	}

	private set options ( options : any ) {
		this._options = options;
		localStorage.setItem( AUTH_OPTIONS , this.encrypt( JSON.stringify( options ) ) );
	}

	helper : HelperClass = Helper;

	private _configs : PickSystemConfig[];

	private changeUnit$ = new BehaviorSubject<any>( null ); //thay đổi đơn vị

	private _roles : SimpleRole[] = [];

	private _userMeta : UserMeta[] = [];

	private _useCases : Ucase[] = [];

	private onSignIn$ = new BehaviorSubject<string>( null );

	private _mapPms = new Map<string , UcaseAdvance>();

	private _dsDonVi : DonVi[] = [];

	// private readonly appSocket : AppSocket;
	//
	// readonly observerAppSocketStatus : BehaviorSubject<boolean>;

	private subjectRequestCheckVersion : Subject<string> = new Subject<string>();

	private observeVersionUpdates : Subject<string> = new Subject<string>();

	private _teacher : Teacher;

	constructor (
		private http : HttpClient ,
		private sysConfigsService : SysConfigsService ,
		private userService : UserService ,
		private teacherService : TeacherService
	) {
		const stores : IdentityStoreData = this.loadDataFromStores();

		this._teacher            = stores.teacher;
		this.user                = stores.user;
		this.permission          = stores.permission || nullPermission;
		this.userMeta            = stores.userMeta || [];
		const apConfigs : string = localStorage.getItem( '__ap_configs' );
		this._configs            = apConfigs ? JSON.parse( apConfigs ) : [];
		this.checkAppVersion();
		if ( this.isLoggedIn() ) {
			this.onSignIn$.next( this.accessToken );
		}
		this.loadStoredUseCases();
		this.requestCheckVersion.asObservable().subscribe( () : void => this.compareVersions() );
	}

	get teacher () : Teacher {
		return this._teacher;
	}

	private _setTeacher ( teacher : Teacher ) : void {
		this._teacher = teacher;
		this.setStoreData( TEACHER_STORAGE_KEY , teacher );
	}

	setOption ( key : string , value : any ) : void {
		const _options  = this.options;
		_options[ key ] = value;
		this.options    = _options;
	}

	getOption<T> ( key : string , _default? : T ) : T {
		const _options = this.options;
		return key in _options ? _options[ key ] : ( _default || null );
	}

	get identityCode () : string {
		return IDENTITY_CODE + ( this._user?.id.toString( 10 ) || '' );
	}

	get dsDonVi () : DonVi[] {
		return this._dsDonVi;
	}

	setDsDonVi ( dsDonVi : DonVi[] ) {
		this._dsDonVi = dsDonVi;
	}

	private loadDataFromStores () : IdentityStoreData {
		const teacher : Teacher | null       = this.getStoreData<Teacher | null>( TEACHER_STORAGE_KEY , null );
		const user : User | null             = this.getStoreData<User | null>( USER_STORAGE_KEY , null );
		const permission : Permission | null = this.getStoreData<Permission | null>( PERMISSION_STORAGE_KEY , null );
		const userMeta : UserMeta[]          = this.getStoreData<UserMeta[] | null>( USER_META_STORAGE_KEY , null );
		return { user , permission , userMeta , teacher };
	}

	get isAuthenticated () : boolean {
		try {
			const token : string = tokenGetter() || '';
			return token ? ! this.jwtHelperService.isTokenExpired( token ) as boolean : false;
		}
		catch ( e ) {
			return false;
		}
	}

	getStoreData<T> ( key : string , _default : T ) : T {
		const encrypted : string | null = localStorage.getItem( key );
		return encrypted ? JSON.parse( this.decrypt( encrypted ) ) : _default;
	}

	setStoreData ( key : string , data : any ) : void {
		if ( data ) {
			const s : string = typeof data === 'string' ? data : JSON.stringify( data );
			const e : string = this.encrypt( s );
			localStorage.setItem( key , e );
		}
		else {
			localStorage.removeItem( key );
		}
	}

	encrypt ( message : string ) : string {
		let encrypted : CryptoJS.lib.CipherParams = CryptoJS.AES.encrypt(
			message , this._key , {
				keySize : ENCRYPT_KEY.length ,
				iv      : this._iv ,
				mode    : CryptoJS.mode.ECB ,
				padding : CryptoJS.pad.Pkcs7
			} );
		return encrypted.toString();
	}

	decrypt ( encrypted : string ) : string {
		return CryptoJS.AES.decrypt(
			encrypted , this._key , {
				keySize : ENCRYPT_KEY.length ,
				iv      : this._iv ,
				mode    : CryptoJS.mode.ECB ,
				padding : CryptoJS.pad.Pkcs7
			} ).toString( CryptoJS.enc.Utf8 );
	}

	customEncrypt ( message : string , secretKey : string ) : string {
		let encrypted : CryptoJS.lib.CipherParams = CryptoJS.AES.encrypt( message , secretKey );
		return encrypted.toString();
	}

	customDecrypt ( encrypted : string , secretKey : string ) : string {
		const byte : CryptoJS.lib.WordArray = CryptoJS.AES.decrypt( encrypted , secretKey );
		return byte.toString( CryptoJS.enc.Utf8 );
	}

	encryptStringToBase64Url ( input : string , secretKey : string = '' ) : string {
		const encryptString : string = secretKey ? this.customEncrypt( input , secretKey ) : input;
		return this.helper.base64URLEncode( encryptString );
	}

	decryptBase64UrlToString ( input : string , secretKey : string = '' ) : string {
		const decode : string = input ? this.helper.base64URLDecode( input ) : '';
		return secretKey ? this.customDecrypt( decode , secretKey ) : decode;
	}

	private checkAppVersion () {
		const searchParams : URLSearchParams | null = window.location.search ? new URLSearchParams( window.location.search ) : null;
		const hash : number                         = searchParams && searchParams.has( 'hash-code' ) ? parseInt( searchParams.get( 'hash-code' ) as string , 10 ) : NaN;
		const currentTime : number                  = Date.now();
		const fiveMinutes : number                  = ( 5 * 60000 );
		if ( Number.isNaN( hash ) || ( hash < ( currentTime - fiveMinutes ) && hash > ( currentTime + fiveMinutes ) ) ) {
			const currentVersion : number = Number( ENVIRONMENT.appVersion.replace( /\./g , '' ) );
			const latestVersion : number  = this.getSysConfigValue( '__APP_VERSION' , currentVersion );
			if ( currentVersion < latestVersion ) {
				this.forceReload();
			}
		}
	}

	private forceReload () {
		const url : URL = new URL( window.location.toString() );
		url.searchParams.set( 'hash-code' , Date.now().toString( 10 ) );
		window.location.assign( url.toString() );
	}

	googleSignIn ( signIn : GoogleSignIn ) : Promise<boolean> {
		return this._signIn( signIn , 'GOOGLE' ).then( success => {
			if ( ! success ) {
				this.clearSession();
			}
			return success;
		} );
	}

	signIn ( signIn : UserSignIn ) : Promise<boolean> {
		return this._signIn( signIn , 'LOCAL' ).then( success => {
			if ( ! success ) {
				this.clearSession();
			}
			return success;
		} );
	}

	private async _signIn ( signIn : UserSignIn | GoogleSignIn , provider : 'LOCAL' | 'GOOGLE' ) : Promise<boolean> {
		const route : string = provider === 'GOOGLE' ? 'login-google' : 'login';
		return firstValueFrom( this.http.post<Token>( getApiRouteLink( route ) , signIn ).pipe( switchMap( token => this.startSession( token ) ) , catchError( () => of( false ) ) ) );
	}

	private _loadTeacherInfo ( response : SignInBaseDto ) : Observable<SignInWithTeacherDto> {
		return this.teacherService.getTeacherInfo().pipe( map( ( teacher : Teacher ) : SignInWithTeacherDto => ( { ... response , teacher } ) ) );
	}

	private startSession ( token : Token ) : Observable<boolean> {
		this.createNonce();
		this.saveToken( token );
		// if ( token ) {
		// 	this.appSocket.connect( this.accessToken );
		// }
		const userMeta : Observable<UserMeta[]>        = this.userService.getUserMeta();
		const user : Observable<User>                  = this.getUser();
		const permissions : Observable<Permission>     = this.getPermissions();
		const configs : Observable<PickSystemConfig[]> = this.sysConfigsService.getAppConfigs( 'config_key,value' );

		return forkJoin<{
			userMeta : Observable<UserMeta[]>,
			user : Observable<User>,
			permissions : Observable<Permission>,
			configs : Observable<PickSystemConfig[]>,
		}>( { userMeta , user , permissions , configs } ).pipe(
			mergeMap( ( response : SignInBaseDto ) : Observable<SignInWithTeacherDto> => {
				const userHasTeacherRole : boolean = response.permissions?.data?.roles?.length && -1 !== response.permissions.data.roles.findIndex( ( _role : PickRole ) : boolean => _role.name === 'teacher_luyenthi_thpt' );
				return userHasTeacherRole ? this._loadTeacherInfo( response ) : of( { ... response , teacher : null } );
			} ) ,
			mergeMap( ( {
				userMeta ,
				user ,
				permissions ,
				configs ,
				teacher
			} : {
				userMeta : UserMeta[],
				user : User,
				permissions : Permission,
				configs : PickSystemConfig[],
				teacher : Teacher
			} ) : Observable<boolean> => {
				this._setTeacher( teacher );
				this.setNewUser( user );
				this.setNewPermission( permissions );
				this.setUserMeta( userMeta );
				this.setConfigs( configs );
				this.storeUseCases( permissions.data.menus );
				timer( 1000 ).subscribe( () => this.checkAppVersion() );
				return of( true );
			} )
		)


		// return forkJoin<[ User , Permission , PickSystemConfig[] , UserMeta[] ]>( [ getUserInfo$ , getPermissions$ , configs$ , loadUserMeta$ ] ).pipe( map( ( [ user , permission , configs , userMeta ] ) : boolean => {
		// 	this.setNewUser( user );
		// 	this.setNewPermission( permission );
		// 	this.setUserMeta( userMeta );
		// 	this.setConfigs( configs );
		// 	this.storeUseCases( permission.data.menus );
		// 	timer( 1000 ).subscribe( () => this.checkAppVersion() );
		// 	return true;
		// } ) );

		// return forkJoin<[User, Permission, PickSystemConfig[] ]>([getUserInfo$, getPermissions$,
		// configs$]).pipe(map(([user, permission, configs]): boolean => { // this.storePersonalInfo(personalInfo);
		// this.setNewUser(user); this.setNewPermission(permission); // this.setUserMeta(userMeta);
		// this.setConfigs(configs);

		// 	timer(1000).subscribe(() => this.checkAppVersion());
		// 	return true;
		// }));
	}

	startPreviewFromTeacher ( token : Token , courseId : number ) : Observable<boolean> {
		this.createNonce();
		this.saveToken( token );
		const getUserInfo$ : Observable<User>           = this.getUser();
		const configs$ : Observable<PickSystemConfig[]> = this.sysConfigsService.getAppConfigs( 'config_key,value' );
		const getPermissions$ : Observable<Permission>  = this.getPermissions();
		return forkJoin<[ User , Permission , number[] , PickSystemConfig[] ]>( [ getUserInfo$ , getPermissions$ , of( [ courseId ] ) , configs$ ] ).pipe( map( ( [ user , permission , courseIds , configs ] ) : boolean => {
			if ( permission?.data?.roles?.reduce( ( find , role ) => find || [ 'giangvien' , 'admin_lcms_v3' , 'doitac' , 'duyet_khoahoc' ].includes( role.name ) , false ) ) {
				this.setNewPermission( permission );
				this.setNewUser( user );
				1
				this.setConfigs( [ ... configs , { config_key : 'SET_ENABLE_TEACHER_PREVIEW' , value : 1 } ] );
				return true;
			}
			return false;
		} ) );
	}

	getUser () : Observable<User> {
		return this.http.get<Dto>( getApiRouteLink( 'profile' ) ).pipe( map( res => Array.isArray( res.data ) ? res.data[ 0 ] : res.data ) );
	}

	private getPermissions () : Observable<Permission> {
		return this.http.get<Permission>( getApiRouteLink( 'permission' ) );
	}

	private saveToken ( token : Token ) {
		if ( token && token.access_token ) {
			tokenSetter( token.access_token );
		}
		if ( token && token.refresh_token ) {
			refreshTokenSetter( token.refresh_token );
		}
	}

	//token 
	isLoggedIn () : boolean {
		return !! ( this.accessToken );
	}

	get accessToken () : string {
		return localStorage.getItem( ACCESS_TOKEN_KEY );
	}

	set accessToken ( token : string ) {
		localStorage.setItem( ACCESS_TOKEN_KEY , token );
	}

	clearSession () {
		this._teacher    = null;
		this._user       = null;
		this._permission = nullPermission;
		this.userMeta    = [];
		this._useCases   = [];
		this._mapPms.clear();
		localStorage.removeItem( TEACHER_STORAGE_KEY );
		localStorage.removeItem( USER_STORAGE_KEY );
		localStorage.removeItem( USER_META_STORAGE_KEY );
		localStorage.removeItem( ACCESS_TOKEN_KEY );
		localStorage.removeItem( REFRESH_TOKEN_KEY );
		localStorage.removeItem( PERMISSION_STORAGE_KEY );
		localStorage.removeItem( SELECTED_DONVI_ID );
		localStorage.removeItem( UCASE_KEY );
	}

	nonce () : string {
		return localStorage.getItem( '--nonce-code' ) || this.createNonce();
	}

	createNonce () : string {
		const nonce : string = Math.floor( Math.random() * 1000000 ).toString( 10 );
		localStorage.setItem( '--nonce-code' , nonce );
		return nonce;
	}

	setConfigs ( configs : PickSystemConfig[] ) {
		this._configs = configs;
		localStorage.setItem( '__ap_configs' , JSON.stringify( configs ) );
	}

	get configs () : PickSystemConfig[] {
		return this._configs;
	}

	/*************************************************
	 * User Object
	 *************************************************/
	updateAvatar ( file : File ) : Observable<string> {
		const formData : FormData = new FormData();
		formData.append( 'avatar' , file );
		return this.http.post<{ data : string, message : string }>( getApiRouteLink( 'avatar' ) , formData ).pipe(
			map( res => res.message && this.helper.sanitizeVietnameseTitle( res.message ) === 'update-avatar-success' && res.data ? res.data : null ) ,
			tap( ( avatar : string ) => {
				if ( avatar ) {
					const newInfo : User = { ... this._user };
					newInfo[ 'avatar' ]  = avatar;
					void this.setNewUser( newInfo );
				}
			} )
		);
	}

	setNewUser ( user : User ) : void {
		this.createNonce();
		user.avatar = user.avatar ? [ user.avatar.split( '?nonce=' )[ 0 ] , '?nonce=' , this.nonce() ].join( '' ) : 'assets/images/user/avatar-2.jpg';
		this.setStoreData( USER_STORAGE_KEY , user );
		this.user = user;
	}

	set user ( user : User | null ) {
		this._user = user;
		this.userSetupBehavior.next( user ? Object.freeze<User>( { ... user } ) : null );
	}

	get user () : User | null {
		return this._user;
	}

	get onUserSetup () : Observable<User> {
		return this.userSetupBehavior.asObservable().pipe( filter( Boolean ) );
	}

	private setNewPermission ( permission : Permission ) : void {
		this.setStoreData( PERMISSION_STORAGE_KEY , permission );
		this.permission = permission;
	}

	set permission ( permission : Permission ) {
		this.permissionSetupBehavior.next( permission ? Object.freeze<Permission>( { ... permission } ) : nullPermission );
		this._permission = permission;
	}

	get permission () : Permission | null {
		return this._permission;
	}

	getUserPermission ( route : string ) : UserPermission {
		const _pms : IctuNavigationItemPms = this.permission?.data?.menus ? this.permission.data.menus.reduce( ( reducer : IctuNavigationItemPms , menu : Ucase ) : IctuNavigationItemPms => {
			if ( matchRoute( route , menu ) ) {
				return extractPms( menu )
			}
			else if ( menu.child ) {
				return menu.child.reduce( ( childReducer : IctuNavigationItemPms , menuChild : Ucase ) : IctuNavigationItemPms => ( matchRoute( route , menuChild ) ? extractPms( menuChild ) : childReducer ) , reducer );
			}
			return reducer;
		} , [ 0 , 0 , 0 , 0 ] ) : [ 0 , 0 , 0 , 0 ];
		return {
			view   : Boolean( _pms[ 0 ] ) ,
			create : Boolean( _pms[ 1 ] ) ,
			update : Boolean( _pms[ 2 ] ) ,
			delete : Boolean( _pms[ 3 ] )
		}
	}

	get onPermissionSetup () : Observable<Permission> {
		return this.permissionSetupBehavior.asObservable().pipe( filter( Boolean ) );
	}

	refreshToken () : Observable<string> {
		return this.http.post<{
			data : string
		}>( getApiRouteLink( 'refresh-token' ) , { 'refresh_token' : refreshTokenGetter() } ).pipe( map( ( { data } ) => tokenSetter( data ) ) );
	}

	get onGetToLoginPage () : Observable<string> {
		return this.observeGetToLoginPage$.asObservable();
	}

	get userMeta () : UserMeta[] {
		return this._userMeta;
	}

	set userMeta ( meta : UserMeta[] ) {
		this._userMeta = meta;
	}

	setUserMeta ( meta : UserMeta[] ) {
		this.setStoreData( USER_META_STORAGE_KEY , meta );
		this._userMeta = meta;
	}

	private loadStoredUserMeta () {
		const stored   = localStorage.getItem( USER_META_STORAGE_KEY );
		const decrypt  = stored ? this.decryptData( stored ) : '';
		this._userMeta = decrypt ? JSON.parse( decrypt ) : [];
	}

	private getToLoginPage () : void {
		this.observeGetToLoginPage$.next( 'need get to login page' );
	}

	logout () : void {
		// if ( this.appSocket ) {
		// 	this.appSocket.disconnect();
		// }
		this.clearSession();
		this.getToLoginPage();
	}

	forgetPassword ( to : string ) : Observable<number> {
		const home_url : string = location.protocol + '//' + location.host;
		const callback : string = location.protocol + '//' + location.host + '/auth/reset-password';
		return this.http.post<number>( getApiRouteLink( 'forget-password' ) , { to , callback , home_url } );
	}

	sendCodeResetPassword ( to : string ) : Observable<number> {
		const home_url = '';
		const callback = '';
		return this.http.post<number>( getApiRouteLink( 'forget-password' ) , { to , callback , home_url } );
	}

	resetPassword ( info : { token : string, password : string, password_confirmation : string } ) : Observable<any> {
		return this.http.post( getApiRouteLink( 'reset-password' ) , info );
	}

	getSysConfigValue ( config_key : string , _default : number = 0 ) : number {
		const config : PickSystemConfig = this.configs && Array.isArray( this.configs ) ? this.configs.find( i => i.config_key === config_key ) : null;
		return config ? config.value : _default;
	}

	userHasRole ( roleName : string ) : boolean {
		return -1 !== this.permission.data.roles.findIndex( ( { name } ) => roleName === name );
	}

	// Change đơn vị

	encryptData ( data : string ) : string {
		try {
			return CryptoJS.AES.encrypt( data , ENCRYPT_KEY ).toString();
		}
		catch ( e ) {
			return '';
		}
	}

	decryptData ( data : string ) : string {
		try {
			const bytes = CryptoJS.AES.decrypt( data , ENCRYPT_KEY );
			if ( bytes.toString() ) {
				return bytes.toString( CryptoJS.enc.Utf8 );
			}
			return data;
		}
		catch ( e ) {
			return '';
		}
	}

	changeUnitSettings () : Observable<any> {
		return this.changeUnit$.asObservable();
	}

	setUnitSettings ( donviId : number ) {
		this.user.donvi_id = donviId;
		if ( donviId ) {
			this.selectedDonvi = this.encryptData( JSON.stringify( donviId ) );
		}
		else {
			this.selectedDonvi = null;
			localStorage.removeItem( SELECTED_DONVI_ID );
		}
		this.changeUnit$.next( donviId );
	}

	get selectedDonvi () : string {
		return localStorage.getItem( SELECTED_DONVI_ID );
	}

	set selectedDonvi ( donvi : string ) {
		localStorage.setItem( SELECTED_DONVI_ID , donvi );
	}

	getSelectedDonvi () : number {
		if ( this.selectedDonvi != null ) {
			return JSON.parse( this.decryptData( this.selectedDonvi ) );
		}
		return null;
	}

	syncUserMeta () {
		this.userService.getUserMeta().subscribe( meta => this.setUserMeta( meta ) );
	}

	updateUserMeta ( data : UserMeta ) : Observable<UserMeta[]> {
		return this.userService.updateMeta( data ).pipe( switchMap( () => this.userService.getUserMeta() ) , tap( meta => this.setUserMeta( meta ) ) );
	}

	//userCaes
	private storeUseCases ( useCases : Ucase[] ) {
		this.setUseCases( useCases );
		const _data   = ( useCases && useCases.length ) ? useCases : [];
		const encrypt = this.encryptData( JSON.stringify( _data ) );
		localStorage.setItem( UCASE_KEY , encrypt );
	}

	get useCases () : Ucase[] {
		return this._useCases;
	}

	private setUseCases ( useCases : Ucase[] ) {
		this._useCases = useCases;
		this._mapPms.clear();
		useCases.forEach( node => {
			this._mapPms.set( node.id , {
				id        : node.id ,
				icon      : node.icon ,
				title     : node.title ,
				position  : node.position ,
				pms       : node.pms ,
				canAccess : !! ( node.pms[ 0 ] ) ,
				canAdd    : !! ( node.pms[ 1 ] ) ,
				canEdit   : !! ( node.pms[ 2 ] ) ,
				canDelete : !! ( node.pms[ 3 ] )
			} );
			if ( node.child && node.child.length ) {
				node.child.forEach( child => this._mapPms.set( child.id , {
					id        : child.id ,
					icon      : child.icon ,
					title     : child.title ,
					position  : child.position ,
					pms       : child.pms ,
					canAccess : !! ( child.pms[ 0 ] ) ,
					canAdd    : !! ( child.pms[ 1 ] ) ,
					canEdit   : !! ( child.pms[ 2 ] ) ,
					canDelete : !! ( child.pms[ 3 ] )
				} ) );
			}
		} );
	}

	private loadStoredUseCases () {
		const stored  = localStorage.getItem( UCASE_KEY );
		const decrypt = stored ? this.decryptData( stored ) : '';
		this.setUseCases( decrypt ? JSON.parse( decrypt ) : [] );
	}

	userCanAccess ( route : string ) : boolean {
		if ( this._mapPms.size === 0 || ! this._mapPms.has( route ) ) {
			return false;
		}
		return this._mapPms.get( route ).canAccess;
	}

	userCanAdd ( route : string ) : boolean {
		if ( this._mapPms.size === 0 || ! this._mapPms.has( route ) ) {
			return false;
		}
		return this._mapPms.get( route ).canAdd;
	}

	userCanEdit ( route : string ) : boolean {
		if ( this._mapPms.size === 0 || ! this._mapPms.has( route ) ) {
			return false;
		}
		return this._mapPms.get( route ).canEdit;
	}

	userCanDelete ( route : string ) : boolean {
		if ( this._mapPms.size === 0 || ! this._mapPms.has( route ) ) {
			return false;
		}
		return this._mapPms.get( route ).canDelete;
	}

	getUseCase ( route : string ) : Ucase {
		return this._mapPms.get( route );
	}

	private compareVersions () : void {
		const currentAppVersion : string = ENVIRONMENT.appVersion.replace( /\./gmi , '' );
		this.sysConfigsService.query<Pick<SystemConfig , 'value' | 'title'>>( [
			{ conditionName : 'config_key' , condition : IctuQueryCondition.equal , value : '__APP_ADMIN_VERSION' } ,
			{ conditionName : 'value' , condition : IctuQueryCondition.greaterThan , value : currentAppVersion , orWhere : "and" }
		] , { paged : 1 , limit : 1 , select : 'value,title' } ).pipe(
			takeUntil( this.subjectRequestCheckVersion ) ,
			map( ( res : DtoObject<Pick<SystemConfig , 'value' | 'title'>[]> ) : Pick<SystemConfig , 'value' | 'title'>[] => res.data ) ,
			filter( ( res : Pick<SystemConfig , 'value' | 'title'>[] ) : boolean => res.length > 0 )
		).subscribe( ( res : Pick<SystemConfig , 'value' | 'title'>[] ) : void => {
			this.observeVersionUpdates.next( res[ 0 ].title );
		} )
	}

	get requestCheckVersion () : Subject<string> {
		return this.subjectRequestCheckVersion;
	}

	get onHasANewVersion () : Subject<string> {
		return this.observeVersionUpdates;
	}

}
