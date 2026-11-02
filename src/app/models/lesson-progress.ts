import { LessonTestType , LessonType } from '@model/lesson';

export interface LessonProgress {
	id : number;
	user_id : number;
	class_id : number;
	course_id : number;
	lesson_id : number;
	lesson_name : string;
	type : LessonType;
	duration : number;
	playing : number;
	stopped : number;
	max_stopped : number;
	params : LessonProgressParam;
	complete : number;
	created_at : string;
	updated_at : string;
}

export interface LessonProgressParamTestResult {
	type : LessonTestType, // lesson_test_type : 'english' | 'other' | string;
	total_time : number, // lesson_test_type : 'english' | 'other' | string;
	date : string; // date time gt+7 pls
	answer : string; // correct_answers / total questions
	point : number;
	tabId : string;
	passed : boolean;
}

export interface LessonProgressParam {
	test_results : LessonProgressParamTestResult[];
	markers : {
		[ T : number ] : string //  1 : '2023/12/19 10:25:36'
	};
}


export type  NewLessonProgress = Omit<LessonProgress , 'id' | 'created_at' | 'updated_at'>
