import { NgModule } from '@angular/core';
import { RouterModule , Routes } from '@angular/router';
import { BanksComponent } from "@pages/admin/bank/banks/banks.component";
import { BankDetailsComponent } from "@pages/admin/bank/bank-details/bank-details.component";

const routes : Routes = [
	{
		path      : 'danh-sach' ,
		component : BanksComponent ,
		data      : { title : 'danh-sach' }
	} ,
	{
		path      : 'danh-sach-ngan-hang-cau-hoi' ,
		component : BanksComponent ,
		data      : { title : 'danh-sach-ngan-hang-cau-hoi' }
	} ,
	{
		path      : 'cap-nhat-cau-hoi' ,
		component : BankDetailsComponent ,
		data      : { title : 'danh-sach-ngan-hang-cau-hoi' }
	}
];

@NgModule( {
	imports : [ RouterModule.forChild( routes ) ] ,
	exports : [ RouterModule ]
} )
export class BankRoutingModule {
}
