import { ActivatedRouteSnapshot , CanActivateFn , Router , RouterStateSnapshot , UrlTree } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '@service/core/auth.service';

export const authGuard : CanActivateFn = ( _ : ActivatedRouteSnapshot , state : RouterStateSnapshot ) : boolean | UrlTree => {
	return inject( AuthService ).isAuthenticated ? true : inject( Router ).createUrlTree( [ 'auth/login' ] , { queryParams : { returnUrl : state.url } } );
};

export const canActivateChildAdmin : CanActivateFn = ( _ : ActivatedRouteSnapshot , state : RouterStateSnapshot ) : boolean | UrlTree => {
	const _route : string    = state.url.replace( '/admin/' , '' ).split( '?' )[ 0 ];
	const router : Router    = inject( Router );
	const auth : AuthService = inject( AuthService );
	return _route !== 'content-none' && ! auth.userCanAccess( _route ) ? router.createUrlTree( [ 'content-none' ] ) : true;
}
