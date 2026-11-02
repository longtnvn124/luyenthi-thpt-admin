import { NgModule } from '@angular/core';
import { RouterModule , Routes } from '@angular/router';
import { AdminComponent } from "@layout/admin/admin.component";
import { canActivateChildAdmin } from "../../guards/auth.guard";

const routes : Routes = [
	{
		path             : '' ,
		component        : AdminComponent ,
		canActivateChild : [ canActivateChildAdmin ] ,
		children         : [
			{
				path       : '' ,
				redirectTo : 'dashboard' ,
				pathMatch  : 'prefix'
			} ,
			{
				path          : 'dashboard' ,
				loadComponent : () : Promise<any> => import('@pages/admin/dashboard/dashboard.component').then( m => m.DashboardComponent ) ,
				data          : { title : 'Dashboard' }
			} ,
			{
				path          : 'mon-hoc' ,
				loadComponent : () : Promise<any> => import('@pages/admin/mon-hoc/mon-hoc.component').then( m => m.MonHocComponent ) ,
				data          : { title : 'Mon Hoc' }
			} ,
			{
				path         : 'ngan-hang' ,
				loadChildren : () : Promise<any> => import('@pages/admin/bank/bank-routing.module').then( m => m.BankRoutingModule ) ,
				data         : { title : 'Ngan hang' }
			} ,
			{
				path          : 'form-de-thi' ,
				loadComponent : () : Promise<any> => import('@pages/admin/quan-ly-form-de-thi/quan-ly-form-de-thi.component').then( m => m.QuanLyFormDeThiComponent ) ,
				data          : { title : 'Form đề thi' }
			} ,
			{
				path          : 'ca-thi' ,
				loadComponent : () : Promise<any> => import('@pages/admin/ql-ca-thi/ql-ca-thi.component').then( m => m.QlCaThiComponent ) ,
				data          : { title : 'Ca thi' }
			} ,
			{
				path          : 'theo-doi-ca-thi' ,
				loadComponent : () : Promise<any> => import('@pages/admin/theo-doi-thi/theo-doi-thi.component').then( m => m.TheoDoiThiComponent ) ,
				data          : { title : 'Ca thi' }
			} ,
			{
				path          : 'ket-qua-thi' ,
				loadComponent : () : Promise<any> => import('@pages/admin/ket-qua-thi-2/ket-qua-thi-2.component').then( m => m.KetQuaThi2Component ) ,
				data          : { title : 'Kết quả thi' }
			} ,
			{
				path          : 'goi-dich-vu' ,
				loadComponent : () : Promise<any> => import('@pages/admin/goi-dich-vu/goi-dich-vu.component').then( m => m.GoiDichVuComponent ) ,
				data          : { title : 'Gói dịch vụ' }
			} ,
			{
				path          : 'khuyen-mai' ,
				loadComponent : () : Promise<any> => import('@pages/admin/khuyen-mai/khuyen-mai.component').then( m => m.KhuyenMaiComponent ) ,
				data          : { title : 'Khuyến mãi' }
			} ,
			{
				path          : 'lich-su-thanh-toan' ,
				loadComponent : () : Promise<any> => import('@pages/admin/history-active/history-active.component').then( m => m.HistoryActiveComponent ) ,
				data          : { title : 'Khuyến mãi' }
			} ,
			{
				path          : 'quan-ly-thi-sinh' ,
				loadComponent : () : Promise<any> => import('@pages/admin/quan-li-thi-sinh/quan-li-thi-sinh.component').then( m => m.QuanLiThiSinhComponent ) ,
				data          : { title : 'Quản lý thí sinh' }
			} ,
			{
				path          : 'xem-bai-thi' ,
				loadComponent : () : Promise<any> => import('@pages/admin/phuc-khao/phuc-khao.component').then( m => m.PhucKhaoComponent ) ,
				data          : { title : 'Xem bài thi' }
			} ,
			{
				path         : 'doi-tac' ,
				loadChildren : () : Promise<any> => import('@pages/admin/doi-tac/doi-tac.module').then( m => m.DoiTacModule )
			} ,
			{
				path          : 'danh-sach-doi-tac' ,
				loadComponent : () : Promise<any> => import('@pages/admin/danh-sach-doi-tac/danh-sach-doi-tac.component') ,
				data          : { title : 'Danh sách đối tác' }
			} ,
			{
				path         : 'he-thong' ,
				loadChildren : () : Promise<any> => import('@pages/admin/he-thong/he-thong.module').then( m => m.HeThongModule )
			} ,
			// {
			// 	path          : 'dot-thi' ,
			// 	loadComponent : () : Promise<any> => import('@pages/admin/doi-tac/children/doi-tac-ca-thi/doi-tac-ca-thi.component').then( m => m.DoiTacCaThiComponent )
			// } ,
			{
				path          : 'dot-thi' ,
				loadComponent : () : Promise<any> => import('@pages/admin/dot-thi/dot-thi.component').then( m => m.DotThiComponent )
			} ,
			{
				path          : 'danh-sach-thi-sinh' ,
				loadComponent : () : Promise<any> => import('@pages/admin/quan-li-thi-sinh/quan-li-thi-sinh.component').then( m => m.QuanLiThiSinhComponent )
			} ,
			{
				path         : 'giao-vien' ,
				loadChildren : () : Promise<any> => import('@pages/admin/giao-vien/giao-vien.module').then( m => m.GiaoVienModule ) ,
				data         : { title : 'Giáo viên' }
			} ,
			{
				path          : 'phan-quyen-cham-thi' ,
				loadComponent : () : Promise<any> => import('@pages/admin/phan-quyen-cham-thi/phan-quyen-cham-thi.component').then( c => c.PhanQuyenChamThiComponent ) ,
				data          : { title : 'Phần quyền chấm thi' }
			} ,
			{
				path          : 'ket-qua-cham-thi' ,
				loadComponent : () : Promise<any> => import('@pages/admin/ket-qua-cham-thi/ket-qua-cham-thi.component').then( c => c.KetQuaChamThiComponent ) ,
				data          : { title : 'Kết quả chấm thi' }
			} ,
			{
				path          : 'thong-ke' ,
				loadComponent : () : Promise<any> => import('@pages/admin/thong-ke/thong-ke.component').then( c => c.ThongKeComponent ) ,
				data          : { title : 'Thống kê báo cáo' }
			} ,
			{
				path       : '**' ,
				redirectTo : 'content-none' ,
				pathMatch  : 'prefix'
			}
		]
	}
];

@NgModule( {
	imports : [ RouterModule.forChild( routes ) ] ,
	exports : [ RouterModule ]
} )
export class AdminRoutingModule {
}
