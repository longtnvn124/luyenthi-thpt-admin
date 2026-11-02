import { IctuBaseModel } from './commons';

export interface DoiTacThiSinh extends IctuBaseModel {
	id : number;
	user_id : number;
	hoten : string;
	ten : string;
	donvi_id : number;
	gioitinh : string;
	ngaysinh : Date;
	email : string;
	phone : number;
	subject_ids : string;
	dotthi_id : number;
	thanhtien : number;
	chitiet : Record<number , number>;
}
