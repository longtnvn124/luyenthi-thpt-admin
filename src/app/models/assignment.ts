import { IctuBaseModel } from "@model/commons";

export interface Assignment extends IctuBaseModel {
	id : number;
	question_id : number;
	shift_register_test_id : number;
	teacher_id : number;
	score : string;
	comments : string;
	status : number; // 0 : chờ chấm; 1 : đang chấm ; : 2 đã chấm xong
}
