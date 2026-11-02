import { User } from "./user";

export interface TnStudent {
	id? : number;
	user_id?: number;
	hoten : string;
	ten : string;
	ngaysinh : string;
	gioitinh : string;
	email : string;
	phone : string;
	diachi : string;
	avata : string;
	status : number;
	creator_id : number;
	student_code : string;
	user?: User;
}
