import { Injectable } from '@angular/core';
import { BehaviorSubject , catchError , filter , Observable , of , switchMap , take , throwError } from 'rxjs';
import { HttpErrorResponse , HttpEvent , HttpHandler , HttpRequest , HttpResponse , HttpInterceptor } from '@angular/common/http';
import { getHostDomain , environment } from '@env';
import { NotificationService } from '@appNotification';

type ServerResponseCode = 'update_fail' | 'create_fail' | 'delete_fail' | 'auth_fail' | 'user_not_found' | 'user_disable' | 'user_not_exist' | 'wrong_password' | 'system_error' | 'not_exist' | 'not_found' | 'forbidden' | 'unauthorized' | 'resume_login_after_5_minutes' | 'login_has_been_blocked__please_wait_5_minutes_to_continue_logging_in_' | 'messages-cannot-be-deleted-after-1-hour';

// @Injectable()
export class InterceptorService implements HttpInterceptor{

	private isRefreshing : boolean = false;

	private refreshTokenSubject$ : BehaviorSubject<string> = new BehaviorSubject<string>( '' );

	private serverResponseCode : Record<ServerResponseCode , string> = {
		'update_fail'                                                           : 'Cập nhật không thành công' ,
		'create_fail'                                                           : 'Tạo mới không thành công' ,
		'delete_fail'                                                           : 'Xóa không thành công' ,
		'auth_fail'                                                             : 'Đăng nhập thất bại' ,
		'user_not_found'                                                        : 'Không tìm thấy người dùng' ,
		'user_disable'                                                          : 'Người dùng đã bị vô hiệu hóa' ,
		'user_not_exist'                                                        : 'người dùng không tồn tại' ,
		'wrong_password'                                                        : 'Sai mật khẩu' ,
		'system_error'                                                          : 'Lỗi hệ thống' ,
		'not_exist'                                                             : 'Không tồn tại' ,
		'not_found'                                                             : 'Không tìm thấy' ,
		'forbidden'                                                             : 'Cấm truy cập' ,
		'unauthorized'                                                          : 'Không được phép truy cập' ,
		'resume_login_after_5_minutes'                                          : 'Đăng nhập lại sau 5 phút' ,
		'login_has_been_blocked__please_wait_5_minutes_to_continue_logging_in_' : 'Đăng nhập bị khóa, Vui lòng đăng nhập lại sau 5 phút' ,
		'messages-cannot-be-deleted-after-1-hour'                               : 'Tin nhắn không thể xoá sau khi đăng 1 giờ'
	};

	private errorMap : Map<string , string> = new Map<string , string>( [
		[ 'update_fail' , this.serverResponseCode.auth_fail ] ,
		[ 'create_fail' , this.serverResponseCode.create_fail ] ,
		[ 'delete_fail' , this.serverResponseCode.delete_fail ] ,
		[ 'auth_fail' , this.serverResponseCode.auth_fail ] ,
		[ 'user_not_found' , this.serverResponseCode.user_not_found ] ,
		[ 'user_disable' , this.serverResponseCode.user_disable ] ,
		[ 'user_not_exist' , this.serverResponseCode.user_not_exist ] ,
		[ 'wrong_password' , this.serverResponseCode.wrong_password ] ,
		[ 'system_error' , this.serverResponseCode.system_error ] ,
		[ 'not_exist' , this.serverResponseCode.not_exist ] ,
		[ 'not_found' , this.serverResponseCode.not_found ]
	] );

	constructor(
		private notification : NotificationService
		// private translate : TranslateService
	) {
		// translate.onLangChange.subscribe( r => {
		// 	if ( r.translations[ 'serverResponseCode' ] ) {
		// 		Object.keys( this.serverResponseCode ).forEach( key => this.serverResponseCode[ key ] = r.translations[ 'serverResponseCode' ][ key ] || this.serverResponseCode[ key ] );
		// 	}
		// } );
	}

	intercept( request : HttpRequest<any> , next : HttpHandler ) : Observable<HttpEvent<any>> {
		if ( request.url.startsWith( getHostDomain() ) ) {
			request = request.clone( { setHeaders : { 'X-APP-ID' : environment.deploy.X_APP_ID } } );
			if ( request.params.has( 'limit' ) && request.params.get( 'limit' )?.toString() === '-1' ) {
				request = request.clone( { setParams : { limit : '1000' } } );
			}
		}
		return next.handle( request ).pipe(
			switchMap( ( res : HttpEvent<any> ) : Observable<any> => {
				if ( request.params.has( 'limit' ) && request.params.get( 'limit' )?.toString() === '1000' && res instanceof HttpResponse && res.body.next && res.body.data && res.body.data.length === 1000 ) {
					return this.ictuHttpHandler( next , request , [] );
				}
				return of( res );
			} ) ,
			catchError( ( res : HttpErrorResponse ) => {
				if ( res.error instanceof ErrorEvent ) {
					return throwError( () => res );
				} else {
					switch ( res.status ) {
						case 0:
							this.notification.toastError( 'Mất kết nối với máy chủ' );
							break;
						case 404:
							this.__getMessage( res ).forEach( ( { body , heading } ) => this.notification.toastError( body , heading ) );
							break;
						case 403:
							this.__getMessage( res ).forEach( ( { body , heading } ) => this.notification.toastError( body , heading ) );
							break;
						case 401:
							if ( res.error && res.error.message === 'jwt expired' ) {
								this.notification.sessionExpired( 'Phiên làm việc của bạn đã hết hạn \n vui lòng đang nhập lại' );
							} else {
								if ( res.error[ 'code' ] === 'unauthorized' ) {
									this.notification.sessionExpired( 'Tài khoản của bạn đã được đăng nhập trên một thiết bị khác' );
								} else {
									this.__getMessage( res ).forEach( ( { body , heading } ) => this.notification.toastError( body , heading ) );
								}
							}
							break;
						default :
							this.__getMessage( res ).forEach( ( { body , heading } ) => this.notification.toastError( body , heading ) );
							break;
					}
				}
				return throwError( () => res );
			} )
		);
	}


	private ictuHttpHandler( next : HttpHandler , request : HttpRequest<any> , data : any[] ) : Observable<HttpEvent<any>> {
		return next.handle( request ).pipe( switchMap( ( response : HttpEvent<any> ) : Observable<HttpEvent<any>> => {
			if ( response instanceof HttpResponse && response.body.data ) {
				data.push( ... response.body.data );
				if ( response.body.count && response.body.count === 1000 ) {
					const newRequest : HttpRequest<any> = request.clone( { setParams : { paged : response.body[ 'next' ].toString( 10 ) } } );
					return this.ictuHttpHandler( next , newRequest , data );
				} else {
					response.body.data = data;
					return of( response );
				}
			}
			return of( response );
		} ) );
	}


	private __getMessage( res : HttpErrorResponse ) : { body : string, heading : string }[] {
		const result : { body : string, heading : string }[] = [];
		// analysis error if it exists in translated list
		if ( this.errorMap.has( res.error[ 'code' ] ) ) {
			let heading : string = '';
			let body : string    = this.errorMap.get( res.error[ 'code' ] ) as string;
			if ( res.error[ 'message' ] ) {
				if ( Array.isArray( res.error[ 'message' ] ) ) {
					const _arrMessage : string[] = res.error[ 'message' ] ? Object.values( res.error[ 'message' ] ) : [];
					heading                      = this.serverResponseCode[ res.error[ 'code' ] as ServerResponseCode ] || res.error[ 'code' ];
					body                         = _arrMessage.map( m => this.serverResponseCode[ this.removeAscent( m ) as ServerResponseCode ] || m ).join( '\n' );
				} else if ( res.error[ 'message' ] === 'string' ) {
					heading = this.serverResponseCode[ res.error[ 'code' ] as ServerResponseCode ] || res.error[ 'code' ];
					body    = this.serverResponseCode[ this.removeAscent( res.error[ 'message' ] ) as ServerResponseCode ] || res.error[ 'message' ];
				}
			}
			result.push( { body , heading } );
		} else if ( res.error[ 'message' ] ) {
			const heading : string = this.serverResponseCode[ res.error[ 'code' ] as ServerResponseCode ];
			if ( typeof res.error[ 'message' ] === 'string' ) {
				// const messageKey = res.error[ 'message' ].toLowerCase().replace( /\s|\.|,/g , '_' );
				// try translate message
				const body : string = this.serverResponseCode[ res.error[ 'message' ].toLowerCase().replace( /\s|\.|,/g , '_' ) as ServerResponseCode ] || res.error[ 'message' ];
				result.push( { body , heading } );
			} else if ( typeof res.error[ 'message' ] == 'object' && Object.keys( res.error[ 'message' ] ).length ) {
				Object.keys( res.error[ 'message' ] ).forEach( key => result.push( { body : res.error[ 'message' ][ key ] , heading } ) );
			}
		}
		return result;
	}

	// private static addTokenAndXappID( request : HttpRequest<any> , token : string ) : HttpRequest<any> {
	// 	return request.clone( { setHeaders : { Authorization : 'Bearer ' + token , 'X-APP-ID' : X_APP_ID } } );
	// }

	private static updateToken( request : HttpRequest<any> , token : string ) : HttpRequest<any> {
		return request.clone( { setHeaders : { Authorization : 'Bearer ' + token } } );
	}

	// private handle401Error( request : HttpRequest<any> , next : HttpHandler ) : Observable<HttpEvent<any>> {
	// 	if ( !this.isRefreshing ) {
	// 		this.isRefreshing = true;
	// 		this.refreshTokenSubject$.next( '' );
	// 		this.notification.noticeTokenNeedsToBeRefreshed();
	// 		return this.notification.onNoticeNewAccessTokenServe.pipe(
	// 			switchMap( ( token : string ) => {
	// 				this.isRefreshing = false;
	// 				this.refreshTokenSubject$.next( token );
	// 				return next.handle( InterceptorService.updateToken( request , token ) );
	// 			} ) ,
	// 			catchError( err => {
	// 				this.refreshTokenSubject$.error( 'Invalid refresh token' );
	// 				return throwError( () => err );
	// 			} )
	// 		);
	// 	} else {
	// 		return this.refreshTokenSubject$.pipe(
	// 			filter( ( token : string ) => token != null ) ,
	// 			take( 1 ) ,
	// 			switchMap( ( token : string ) => next.handle( InterceptorService.updateToken( request , token ) ) ) );
	// 	}
	// }

	/**
	 * removeAscent
	 * Sanitizes a string into a slug
	 * @param title - input ( string )
	 * @return a slug converted from string input
	 * */
	removeAscent( title : string ) : string {
		let str : string    = title;
		str                 = str.replace( /^\s+|\s+$/g , '' );
		str                 = str.toLowerCase();
		const from : string = 'àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ·/_,:;';
		const to : string   = 'aaaaaaaaaaaaaaaaaeeeeeeeeeeeiiiiiooooooooooooooooouuuuuuuuuuuyyyyyd------';
		for ( let i : number = 0 ; i <= from.length ; i++ ) {
			str = str.replace( new RegExp( from.charAt( i ) , 'g' ) , to.charAt( i ) );
		}

		str = str.replace( /[^a-z\d -]/g , '' ).replace( /\s+/g , '-' ).replace( /-+/g , '-' );
		return str;
	}
}
