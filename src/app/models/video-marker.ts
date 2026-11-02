import { AnswerOptionClassTestQuestion , IctuQuestionType } from '@model/class';

export interface VideoMarker {
	id : number,
	time : number,
	lesson_id : number;
	updated_by : number;
	created_by : number;
	is_deleted : number;
	deleted_by : number;
	created_at : string;
	updated_at : string;
}

export interface VideoMarkerQuestionConfigs {
	cols : 1 | 2 | 3 | 4;
}

export interface VideoMarkerQuestion {
	id : number;
	video_marker_id : number;
	lesson_id : number;
	question_direction : string;
	answer_correct : string;
	answer_option : AnswerOptionClassTestQuestion[];
	config : VideoMarkerQuestionConfigs;
	updated_by : number;
	created_by : number;
	is_deleted : number;
	deleted_by : number;
	created_at : string;
	updated_at : string;
	_answer : string;
	_ordering : number;
}

export interface VideoPromptResults {
	videoMarkerId : number,
	totalQuestions : number,
	correctAnswers : number,
	incorrectAnswers : number,
	passed : boolean
}
