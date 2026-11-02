import { NgModule } from '@angular/core';
import { RouterModule , Routes } from '@angular/router';

const routes : Routes = [
	{
		path       : '' ,
		redirectTo : 'cham-thi' ,
		pathMatch  : 'prefix'
	} ,
	{
		path          : 'cham-thi' ,
		loadComponent : () : Promise<any> => import('@pages/admin/giao-vien/children/cham-thi/cham-thi.component').then( c => c.ChamThiComponent ) ,
		data          : { title : 'Chấm thi' }
	} ,
	{
		path          : 'ket-qua-cham-thi' ,
		loadComponent : () : Promise<any> => import('@pages/admin/giao-vien/children/ket-qua-cham-thi/ket-qua-cham-thi.component').then( c => c.KetQuaChamThiComponent ) ,
		data          : { title : 'Kết quả chấm thi' }
	}
];

@NgModule( {
	imports : [ RouterModule.forChild( routes ) ] ,
	exports : [ RouterModule ]
} )
export class GiaoVienRoutingModule {}
