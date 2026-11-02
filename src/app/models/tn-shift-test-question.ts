export interface TnShiftTestQuestion {
	id? : number;
	shift_test_id:number;
	bank_question_id: number;
	group_id : number;
	part : number;
	question_type : string;
	question_direction: string;
	skill:string;
	answer:string;
    question_number: number;
    answer_correct?: any;
    result?: number;
    answer_option: Answer[];
    grading_teacher?: number;
    ordering?: number;
}
export interface Media{
	type:string;
	source: string;
	path: string;
	replay : number;
}
export interface Answer{
	id:number;
	value: string;
}
