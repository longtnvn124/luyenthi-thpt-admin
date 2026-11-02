import { NgModule } from '@angular/core';
import { RouterModule , Routes } from '@angular/router';

const routes : Routes = [
	{
		path          : 'danh-sach-thi-sinh' ,
		loadComponent : () : Promise<any> => import('@pages/admin/quan-li-thi-sinh/quan-li-thi-sinh.component').then( m => m.QuanLiThiSinhComponent )
	}
];

@NgModule( {
	imports : [ RouterModule.forChild( routes ) ] ,
	exports : [ RouterModule ]
} )
export class DoiTacRoutingModule {
}
