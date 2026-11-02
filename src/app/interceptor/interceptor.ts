import {
	HttpErrorResponse ,
	HttpEvent ,
	HttpHandlerFn ,
	HttpInterceptorFn ,
	HttpRequest ,
	HttpResponse
} from '@angular/common/http';
import { NotificationService } from '@appNotification';
import { inject } from '@angular/core';
import { ENVIRONMENT , getHostDomain } from '@env';
import { catchError , Observable , of , switchMap , throwError } from 'rxjs';
import { Router } from '@angular/router';
import { tokenGetter } from '../app.module';

interface AppHttpErrorMessage {
	body : string,
	heading : string
}

type ServerResponseCode = 'update_fail' | 'create_fail' | 'delete_fail' | 'auth_fail' | 'user_not_found' | 'user_disable' | 'user_not_exist' | 'wrong_password' | 'system_error' | 'not_exist' | 'not_found' | 'forbidden' | 'unauthorized' | 'resume_login_after_5_minutes' | 'login_has_been_blocked__please_wait_5_minutes_to_continue_logging_in_' | 'messages-cannot-be-deleted-after-1-hour';

const serverResponseCode : Record<ServerResponseCode , string> = {
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

const errorMap : Map<string , string> = new Map<string , string>( [
	[ 'update_fail' , serverResponseCode.auth_fail ] ,
	[ 'create_fail' , serverResponseCode.create_fail ] ,
	[ 'delete_fail' , serverResponseCode.delete_fail ] ,
	[ 'auth_fail' , serverResponseCode.auth_fail ] ,
	[ 'user_not_found' , serverResponseCode.user_not_found ] ,
	[ 'user_disable' , serverResponseCode.user_disable ] ,
	[ 'user_not_exist' , serverResponseCode.user_not_exist ] ,
	[ 'wrong_password' , serverResponseCode.wrong_password ] ,
	[ 'system_error' , serverResponseCode.system_error ] ,
	[ 'not_exist' , serverResponseCode.not_exist ] ,
	[ 'not_found' , serverResponseCode.not_found ]
] );

/**
 * removeAscent
 * Sanitizes a string into a slug
 * @param title - input ( string )
 * @return a slug converted from string input
 * */
const removeAscent : ( title : string ) => string = ( title : string ) : string => {
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
};

const appHttpHandler : ( request : HttpRequest<unknown> , next : HttpHandlerFn , data : any[] ) => Observable<HttpEvent<unknown>> = ( request : HttpRequest<unknown> , next : HttpHandlerFn , data : any[] ) : Observable<HttpEvent<unknown>> => {
	return next( request ).pipe( switchMap( ( response : HttpEvent<any> ) : Observable<HttpEvent<any>> => {
		if ( response instanceof HttpResponse && response.body.data ) {
			data.push( ... response.body.data );
			if ( response.body.count && response.body.count === 1000 ) {
				const newRequest : HttpRequest<any> = request.clone( { setParams : { paged : response.body[ 'next' ].toString( 10 ) } } );
				return appHttpHandler( newRequest , next , data );
			}
			else {
				response.body.data = data;
				return of( response );
			}
		}
		return of( response );
	} ) );
};


const collectHttpErrorMessages : ( res : HttpErrorResponse ) => AppHttpErrorMessage[] = ( res : HttpErrorResponse ) : AppHttpErrorMessage[] => {
	const result : { body : string, heading : string }[] = [];
	// analysis error if it exists in translated list
	if ( res.error[ 'message' ] ) {
		const heading : string = serverResponseCode[ res.error[ 'code' ] as ServerResponseCode ];
		if ( typeof res.error[ 'message' ] === 'string' ) {
			// const messageKey = res.error[ 'message' ].toLowerCase().replace( /\s|\.|,/g , '_' );
			// try translate message
			const body : string = serverResponseCode[ res.error[ 'message' ].toLowerCase().replace( /\s|\.|,/g , '_' ) as ServerResponseCode ] || res.error[ 'message' ];
			result.push( { body , heading } );
		}
		else if ( typeof res.error[ 'message' ] == 'object' && Object.keys( res.error[ 'message' ] ).length ) {
			Object.keys( res.error[ 'message' ] ).forEach( key => result.push( {
				body : res.error[ 'message' ][ key ] ,
				heading
			} ) );
		}
	}
	else if ( errorMap.has( res.error[ 'code' ] ) ) {
		let heading : string = '';
		let body : string    = errorMap.get( res.error[ 'code' ] ) as string;
		if ( res.error[ 'message' ] ) {
			if ( Array.isArray( res.error[ 'message' ] ) ) {
				const _arrMessage : string[] = res.error[ 'message' ] ? Object.values( res.error[ 'message' ] ) : [];
				heading                      = serverResponseCode[ res.error[ 'code' ] as ServerResponseCode ] || res.error[ 'code' ];
				body                         = _arrMessage.map( m => serverResponseCode[ removeAscent( m ) as ServerResponseCode ] || m ).join( '\n' );
			}
			else if ( res.error[ 'message' ] === 'string' ) {
				heading = serverResponseCode[ res.error[ 'code' ] as ServerResponseCode ] || res.error[ 'code' ];
				body    = serverResponseCode[ removeAscent( res.error[ 'message' ] ) as ServerResponseCode ] || res.error[ 'message' ];
			}
		}
		result.push( { body , heading } );
	}
	return result;
};

export const httpInterceptor : HttpInterceptorFn = ( request : HttpRequest<unknown> , next : HttpHandlerFn ) => {
	const notification : NotificationService = inject( NotificationService );
	const router : Router                    = inject( Router );
	let isLoginRequest : boolean             = false;
	if ( request.url.startsWith( getHostDomain() ) ) {
		request = request.clone( { setHeaders : { 'X-APP-ID' : ENVIRONMENT.deploy.X_APP_ID } } );
		if ( tokenGetter() ) {
			request = request.clone( { setHeaders : { Authorization : `Bearer ${ tokenGetter() }` } } );
			if ( request.params.has( 'limit' ) && request.params.get( 'limit' )?.toString() === '-1' ) {
				request = request.clone( { setParams : { limit : '1000' } } );
			}
		}
		isLoginRequest = request.url.includes( 'login-google' ) || request.url.includes( 'login' );
	}
	
	return next( request ).pipe(
		switchMap( ( res : HttpEvent<any> ) : Observable<any> => {
			if ( request.params.has( 'limit' ) && request.params.get( 'limit' )?.toString() === '1000' && res instanceof HttpResponse && res.body.next && res.body.data && res.body.data.length === 1000 ) {
				return appHttpHandler( request , next , [] );
			}
			return of( res );
		} ) ,
		catchError( ( res : HttpErrorResponse ) => {
			if ( res.error instanceof ErrorEvent ) {
				return throwError( () => res );
			}
			else {
				switch ( res.status ) {
					case 0:
						notification.toastError( 'Mất kết nối với máy chủ' );
						break;
					case 404:
						collectHttpErrorMessages( res ).forEach( ( {
							                                           body ,
							                                           heading
						                                           } ) => notification.toastError( body , heading ) );
						break;
					case 403:
						collectHttpErrorMessages( res ).forEach( ( {
							                                           body ,
							                                           heading
						                                           } ) => notification.toastError( body , heading ) );
						break;
					case 401:
						if ( res.error && res.error.message === 'jwt expired' ) {
							notification.toastInfo( 'Phiên làm việc của bạn đã hết hạn \n vui lòng đang nhập lại' );
							// notification.sessionExpired( 'Phiên làm việc của bạn đã hết hạn \n vui lòng đang nhập
							// lại' );
						}
						else {
							if ( res.error[ 'code' ] === 'unauthorized' ) {
								notification.toastInfo( isLoginRequest ? 'không được phép' : 'Tài khoản của bạn đã được đăng nhập trên một thiết bị khác' );
								// notification.sessionExpired( 'Tài khoản của bạn đã được đăng nhập trên một thiết bị
								// khác' );
							}
							else {
								collectHttpErrorMessages( res ).forEach( ( {
									                                           body ,
									                                           heading
								                                           } ) => notification.toastError( body , heading ) );
							}
						}
						if ( router.isActive( 'auth/login' , {
							paths        : 'exact' ,
							fragment     : 'ignored' ,
							queryParams  : 'ignored' ,
							matrixParams : 'ignored'
						} ) ) {
							void router.navigate( [ 'auth/login' ] );
						}
						break;
					default :
						collectHttpErrorMessages( res ).forEach( ( {
							                                           body ,
							                                           heading
						                                           } ) => notification.toastError( body , heading ) );
						break;
				}
			}
			return throwError( () => res );
		} )
	);
};
