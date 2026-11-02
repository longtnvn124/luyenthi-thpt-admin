import { MonHoc } from "./mon-hoc";
import { IctuBaseModel } from "@model/commons";

export interface TnBank {
	id? : number;
	name : string;
	subject_id : number;
	slug : string;
	desc : string;
	status : number;
	user_id : number;
	name_subject : string;
	parent_id? : number;
	ordering? : number;
	type? : string;
	subject? : MonHoc;
}

export type BankFormat = 'standard' | 'english'

export interface Bank extends IctuBaseModel {
	name : string;
	parent_id : number;
	subject_id : number;
	slug : string;
	desc : string;
	additional : string;
	status : number;
	user_id : number;
	ordering : number,
	type : BankType;
	format : BankFormat; // kiểu định dạng bài thi của ngân hàng
}

export type BankType = 'KIEMTRA' | 'THI';