import { NgModule } from '@angular/core';
import { RouterModule , Routes } from '@angular/router';

const routes : Routes = [
	{
		path       : '' ,
		redirectTo : '/auth/login' ,
		pathMatch  : 'full'
	} ,
	{
		path          : 'login' ,
		loadComponent : () : Promise<any> => import('./login/login.component')
	} ,
	{
		path          : 'unauthorized' ,
		loadComponent : () : Promise<any> => import('./unauthorized/unauthorized.component')
	} ,
	{
		path          : 'forget-password' ,
		loadComponent : () : Promise<any> => import('./forget-password/forget-password.component')
	} ,
	// {
	// 	path: 'register',
	// 	loadComponent: () => import('./register/register.component')
	// },
	// {
	// 	path: 'reset-password',
	// 	loadComponent: () => import('./reset-password/reset-password.component')
	// },
	// {
	// 	path: 'register-account',
	// 	loadComponent: () => import('./register-account/register-account.component')
	// },
	// {
	// 	path: "verification",
	// 	loadComponent: () => import('./verification/verification.component')
	// },
];

@NgModule( {
	imports : [ RouterModule.forChild( routes ) ] ,
	exports : [ RouterModule ]
} )
export class AuthRoutingModule {
}
