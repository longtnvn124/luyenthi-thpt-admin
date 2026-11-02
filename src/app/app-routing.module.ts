import { NgModule } from '@angular/core';
import { RouterModule , Routes } from '@angular/router';
import { EmptyComponent } from '@layout/empty';
import { authGuard } from './guards/auth.guard';
import { PreviewComponent , previewRoutes } from "@pages/preview";

const routes : Routes = [
	{
		path          : 'content-none' ,
		loadComponent : () : Promise<any> => import('@pages/content-none/content-none.component').then( m => m.default )
	} ,
	{
		path         : 'admin' ,
		canActivate  : [ authGuard ] ,
		loadChildren : () : Promise<any> => import('@layout/admin').then( m => m.AdminModule )
	} ,
	{
		path      : 'preview' ,
		component : PreviewComponent ,
		children  : previewRoutes
	} ,
	{
		path          : 'grading-assignment' ,
		canActivate   : [ authGuard ] ,
		loadComponent : () : Promise<any> => import('@pages/grading-assignment/grading-assignment.component')
	} ,
	{
		path          : 'grading-results' ,
		canActivate   : [ authGuard ] ,
		loadComponent : () : Promise<any> => import('@pages/grading-results/grading-results.component')
	} ,
	{
		path      : '' ,
		component : EmptyComponent ,
		children  : [
			{
				path         : 'auth' ,
				loadChildren : () : Promise<any> => import('@pages/auth/auth.module').then( m => m.AuthModule )
			} ,
			{
				path       : '**' ,
				redirectTo : '/auth/login' ,
				pathMatch  : 'full'
			}
		]
	} ,
	{
		path          : 'unauthorized' ,
		loadComponent : () : Promise<any> => import('@pages/auth/unauthorized/unauthorized.component') ,
		data          : { state : 'unauthorized' }
	}
];


@NgModule( {
	imports : [ RouterModule.forRoot( routes ) ] ,
	exports : [ RouterModule ]
} )
export class AppRoutingModule {
}

