import { IctuBaseModel } from "@model/commons";

export interface ShiftRegisterTestAnswers extends IctuBaseModel {
	question_id : number;
	shift_register_test_id : number;
	answer : string;
	temporary : string;
	result : number;
	status : number;
}