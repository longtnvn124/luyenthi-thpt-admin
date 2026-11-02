import {Answers, Config, configAdvance} from "@model/question";

export interface TnBankQuestion {
	id?: number;
	bank_id:number;
	group_id: number;
	question_type: string;
	question_direction: string;
	answer_option: Answers[];
	answer_correct: any;
	question_number?: number;
	status?: number;
	level  : number;
	part?: number;
	skill?:string;
	media?: any;
	code?: string;
	config?: configAdvance;
	hint?: string;
	explain?: string;
	children?: TnBankQuestion[];
	creater_id?: number;
	count ?: number;
	checker_id ?: number;
	// id? : number;
	// bank_id : number;
	// group_id : number;
	// part : number;
	// question_type : string;
	// question_direction : string;
	// media? : Media;
	// skill : string;
	// shuff : string;
	// answer_option? : Answer[];
	// answer_correct? : any;
	// hint : string;
	// explain : string;
	// status : number;
	// creater_id : number;
	// checker_id : number;
	// count : number;
  //   question_number: number;
  //   level?: number;
  //   code: string;

}

export interface Media {
	type : string;
	source : string;
	path : string;
	replay : number;
}

export interface Answer {
	id : number;
	value : string;
}

export interface TnBankDirection {
	bank_id : number;
	group_id : number;
	part : number;
	question_type : string;
	question_direction : string;
	media : Media;
	skill : string;
	shuff : string;
	status : number;
	creater_id : number;
	checker_id : number;
	count : number;
}