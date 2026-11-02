import { DmPhong, DmToaNhaKyTucXa } from "./danh-muc";
import { DonDangKy } from "./dondangky";
import { PersonalInfo } from "./user";

export interface HopDong {
  id?                   : number;
  so                    : string;
  trichyeu              : string;
  donvi_quanly          : string;
  daidien               : string;
  chucvu                : string;
  email                 : string;
  sdt                   : string;
  ten_sinhvien          : string;
  gioitinh              : string;
  ngaysinh              : string;
  diachi_sv             : string;
  sdt_sv                : string;
  email_sv              : string;
  cccd_sv?               : string;
  truongdanghoc_id?     : number;
  truongdanghoc_ten?    : string;
  sinhvien_id           : number;
  donvi_id             : number;
  khu_id                : number;
  toanha_id             : number;
  phong_id              : number;
  vitri_giuong?         : string; // chưa làm
  ngay_hieuluc          : string;
  ngay_hethieuluc       : string;
  ngay_thanhly          : string;
  ngay_giahan           : string;
  trangthai?            : number;
  donvitinh?            : string; // chưa làm
  soluong?              : number; // chưa làm
  dm_dongia_ktx         : number;
  dongia                : number;
  tien_datcoc?          : number;// chưa làm
  dieukhoan?            : string;// chưa làm
  hs_miengiam?          : number;
  doituonguutien_id?    : number;
  image_doituonguutien? : string;
  tong_tientruocthue?   : string;
  thue?                 : number;
  tong_tiensauthue?     : string;
  tien_dathanhtoan      : number;
  tien_conlai?          : number; // chưa làm
  phuongthuc            : string; // chưa làm
  ngayky                : string;
  nguoiky_id?           : string; /// chưa biết
  dondangky_id?         : number;
  files?                : string;
  created_at?           : string;
  created_by?           : number;
  updated_at?           : string;
  updated_by?           : number;
  is_deleted?           : number;
  deleted_by?           : number;
  phong?                : DmPhong;
  toaNha?               : DmToaNhaKyTucXa;
  sinhvien?             : PersonalInfo;
  donDangKy?            : DonDangKy;

}
