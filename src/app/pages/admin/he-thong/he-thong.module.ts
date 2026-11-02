import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThongTinTaiKhoanComponent } from './thong-tin-tai-khoan/thong-tin-tai-khoan.component';
import { PasswordComponent } from './thong-tin-tai-khoan/password/password.component';
import { QuanLyTaiKhoanComponent } from './quan-ly-tai-khoan/quan-ly-tai-khoan.component';
import { HeThongRoutes } from './he-thong.routes';
import { SafeUrlPipe } from "../../../pipes/safe-url.pipe";
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '@module/shared/shared.module';
import { ButtonModule  } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { DropdownModule } from 'primeng/dropdown';
import {MultiSelectModule} from 'primeng/multiselect';
import { OvicTableComponent } from 'src/app/templates/ovic-table/ovic-table.component';
import { PaginatorModule } from 'primeng/paginator';
import { OvicDropdownComponent } from 'src/app/templates/ovic-dropdown/ovic-dropdown.component';
import { OvicMultiSelectComponent } from 'src/app/templates/ovic-multi-select/ovic-multi-select.component';
import { ConfigComponent } from './config/config.component';
import { CardComponent } from '@theme/components/card/card.component';

@NgModule({
    declarations: [
        ThongTinTaiKhoanComponent,
        QuanLyTaiKhoanComponent,
        PasswordComponent,
        ConfigComponent
    ],
    imports: [
        CommonModule,
        HeThongRoutes,
        SafeUrlPipe,
        SharedModule,
        ButtonModule ,
        RippleModule,
        DropdownModule,
        MultiSelectModule,
        OvicTableComponent,
        PaginatorModule,
        OvicDropdownComponent,
        OvicMultiSelectComponent,
        CardComponent
    ]
})
export class HeThongModule { }
