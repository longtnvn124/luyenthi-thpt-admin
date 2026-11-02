import { IctuBaseModel } from "@model/commons";

export interface ShiftRegisterTest extends IctuBaseModel {
	shift_register_id : number,
	dotthi_id : number,
	subject_id : number,
	org_bank_id : number,
	bank_id : number,
	question_ids : number[],
	tracking : ShiftRegisterTestTracking[],
	duration : number,
	time_left : number,
	score : string, // float in sql
	hand_score : string, // float in sql
	teacher_id : number, // id của giáo viên phụ trách chấm bài
	status : number,
	tong_diem : string,
}

export type ShiftRegisterTestTrackingName = 'exit_fullscreen' | 'hide_panel';

export interface ShiftRegisterTestTracking {
	name : ShiftRegisterTestTrackingName,
	time : string;
}