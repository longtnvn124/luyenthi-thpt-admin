import { Gender , IctuBaseModel } from "@model/commons";


export interface Teacher extends IctuBaseModel {
	id : number;
	user_id : number;
	full_name : string;
	name : string;
	dob : string; // ngày sinh
	gender : Gender;
	email : string;
	code : string; // mã giảng viên hoặc mã cán bộ
	phone : string;
	address : string;
	bio : string;
}
