import { Routes, RouterModule } from '@angular/router';
import { ThongTinTaiKhoanComponent } from './thong-tin-tai-khoan/thong-tin-tai-khoan.component';
import { QuanLyTaiKhoanComponent } from './quan-ly-tai-khoan/quan-ly-tai-khoan.component';
import { ConfigComponent } from './config/config.component';


const routes: Routes = [
  { 
    path : 'thong-tin-tai-khoan',
    component : ThongTinTaiKhoanComponent
  },
  { 
    path : 'quan-ly-tai-khoan',
    component : QuanLyTaiKhoanComponent
  },
  { 
    path : 'cau-hinh-chung',
    component : ConfigComponent
  },
  { 
    path : '**',
    redirectTo : 'thong-tin-tai-khoan'
  },
];


export const HeThongRoutes = RouterModule.forChild(routes);