export interface User {
	id: number;
	username: string;
	display_name: string;
	phone: string;
	email: string;
	password: string;
	avatar: string;
	donvi_id: number;
	realms: string[];
	role_ids: string[];
	status: number;
	created_at: string;
	updated_at: string;
	created_by: number;
	updated_by: number;
}

export type UserUpdatableFields = Pick<User, 'display_name' | 'phone' | 'email' | 'password'>

export type ConstructUser = Pick<User, 'username' | 'display_name' | 'phone' | 'email' | 'password'>

export interface UserMeta {
	id: number;
	user_id: number;
	meta_key: string;
	meta_title: string;
	meta_value: string;
}

export interface UserSignIn {
	username: string;
	password: string;
}

export interface GoogleSignIn {
	clientId: string;
	client_id: string;
	credential: string;
	select_by: string;
}

export interface Student {
	full_name: string;
	full_name_slug: string;
	name: string;
	email: string;
}


export interface PersonalInfo {
	id: number;
	user_id: number;
	code: number;
	avatar?: string;
	ho_va_ten: string;
	ngaysinh: string;
	gioitinh: string;
	dantoc: string;
	tongiao: string;
	cccd: string;
	cccd_ngaycap: string;
	cccd_noicap: string;
	quequan: string;
	diachi_thuongtru: string;
	email: string;
	sdt: string;
	donvi_id: string;
	ten_khoa: string;
	khoahoc: string;
	ten_nganh: string;
	ten_lop: string;
	ten_lienhe: string;
	sdt_lienhe: string;
	diachi_lienhe: string;
	//dưới là trường nhập xem ở đâu
	doituonguutien_id: string;
	stk_canhan?: string;
	o_ktx?: number;
}


export interface NgoaiTru{
	id? : number;
	sinhvien_id? : number;
	ten_sinhvien: string;
	tinh_thanh: number;
	quan_huyen: number;
	phuong_xa: number;
	ap_xom: string;
	sonha?: string;
	ten_chutro: string;
	sdt_chutro: string;
	ngay_batdau: string;
	ngay_ketthuc?: string;
	created_at?: string;
	created_by?: number;
	updated_at?: string;
	updated_by?: number;
	is_deleted?: number;
	deleted_by?: number;
	personalInfo?: PersonalInfo;
}