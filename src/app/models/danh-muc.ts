import { OvicFile } from "./file";

export interface DmChung {
	is_deleted : number; //1: deleted; 0: not deleted
	deleted_by : number;
	created_by : number;
	updated_by : number;
	created_at : string; // sql timestamp
	updated_at : string; // sql timestamp
}

export interface DonVi {
	id : number;
	title : string;
	parent_id : number; //Đơn vị cấp trên ID
	description : string;
	status : number; //1 Active; 0: inactive
}

export interface DmLinhVuc extends DmChung {
	id : number;
	ten : string;
	kyhieu : string;// viet tat
	mota : string;
	status : number; //1 Active; 0: inactive
}

export interface DmTruongThanhVien {
	id : number;
	ten : string; //Tên trường thành viên
	kyhieu : string;
	mota : string; //Mô tả trường thành viên
}

export interface DmLoaiPhong {
	id : number;
	ten : string; //Tên trường thành viên
	so_vitri : number; // số vị trí
	mota : string; //Mô tả trường thành viên
	donvi_id? : number; //
	created_by? : number;
	updated_at? : Date;
	updated_by? : number;
	is_deleted? : boolean;
	deleted_by? : number;
	tai_san? : DmLoaiPhongTaiSan[];
}


export interface DmPhong {
	id? : number;
	so_phong : string;
	so_vitri? : number;
	tang : number;
	doituong_gioitinh : string;
	doituong_quocgia : string;
	vitri_trong? : number;
	image : OvicFile;
	trang_thai : string;
	donvi_id : number;
	toanha_id : number;
	khu_id : number;
	loaiphong_id : number;
	thongtin_vitri : Thongtin_vitri[];
	mota : string; //Mô tả trường thành viên
	khuName? : DmKhuKyTucXa;
	toaName? : DmToaNhaKyTucXa;
	loaiphong? : DmLoaiPhong;
	dongia? : DonGiaPhong;
	active? : boolean;
	created_by? : number;
	updated_at? : Date;
	created_at? : Date;
	updated_by? : number;
	is_deleted? : boolean;
	deleted_by? : number;
}

export interface Thongtin_vitri {
	vitri_giuong : number;
	user_id : number;
	ten : string;
}

export interface ThongTinViTriDangKy extends Thongtin_vitri {
	available : boolean; // trang thai kha dung
}

export interface DmPhongTaiSan {
	id? : number;
	phong_id : number;
	tai_san_id : number;
	loai_taisan_id? : number;
	nam_sudung? : number;
	trang_thai? : string;
	created_by? : number;
	updated_at? : Date;
	created_at? : Date;
	updated_by? : number;
	is_deleted? : number;
	deleted_by? : number;
	taisan? : DmTaiSan;
	isLoaded? : boolean;

}

export interface DmLoaiTaiSan {
	id? : number;
	kyhieu : string;
	ten : string;
	mota : string;
	donvi_id? : number;
	created_at? : Date;
	created_by? : number;
	updated_at? : Date;
	updated_by? : number;
	is_deleted? : number;
	deleted_by? : number;
}


export interface DmLoaiPhongTaiSan {
	id? : number;
	ten : string;
	soluong : number;
	dm_loai_taisan_id : number;
	dm_loaiphong_id : number;
	donvi_id : number;
	created_at? : Date;
	created_by? : number;
	updated_at? : Date;
	updated_by? : number;
	is_deleted? : number;
	deleted_by? : number;
}

export interface DmKhuKyTucXa {
	id : number;
	ten : string;
	mota : string;
	loai_khu : string;
	donvi_id : number;
	trang_thai? : number; //1 Active; 0: inactive
}

export interface DmToaNhaKyTucXa {
	id : number;
	ten : string;
	mota : string;
	kyhieu : string;
	sotang : string;
	khu_id : number;
	donvi_id : number;
	trang_thai? : number; //1 Active; 0: inactive
}

export interface BangGiaDien {
	id : number;
	bac : string;
	sanluong : string;
	giatien : string;
	tg_apdung : string;
}

export interface BangGiaNuoc {
	id : number;
	bac : string;
	sanluong : string;
	giatien : string;
	tg_apdung : string;
	donvi_id? : number;
}

export interface DonGiaPhong {
	id : number;
	loaiphong_id : string;
	donvitinh : string;
	dongia : number;
	dongia_ngay : number;
	dongia_tuan : number;
	dongia_thang : number;
	thoigian_apdung : Date;
}

export interface DmDoiTuongUuTien {
	id : number;
	doituong_uutien : string;
	heso_miengiam : number;
	donvi_id : number;
}


export interface DmTaiSan {
	id? : number | string;
	kyhieu : string;
	ten : string;
	mota : string;
	xuatxu : string;
	chungloai : string;
	hang : string;
	giatri : string;
	soluong : number;
	loai_taisan_id : number;
	created_at? : Date;
	created_by? : number;
	updated_at? : Date;
	updated_by? : number;
	is_deleted? : number;
	deleted_by? : number;
	loai_taisan? : DmLoaiTaiSan[];
}