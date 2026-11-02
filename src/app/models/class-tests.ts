export type IctuQuestionType = 'radio' | 'checkbox' | 'selectbox' | 'textarea' | 'inputbox';

export interface ClassTest {
	id : number;
	// config : LessonTestConfigs;
	class_id : number;
	content : string;
	media : Object[];	 // json audio => local |video=> youtobe, vimeo, local | tạm thời chưa dùng đến
	status : number;	 // 0 : Deactivate | 1 : active | -1 : delete | 2 : closed
	time_start : string; // Thời gian bắt đầu làm bài kiểm tra (khung 24h)
	total_time : number; // Tổng thời gian làm bài (phút)
	point : number;		 // 10 điểm quy đổi về: thang điểm 10
	source : 'lesson_test_questions' | string;
	type_test : string;
	created_at : string;
	updated_at : string;
	created_by : number;
	structure : ClassTestStructure[];
}

export interface ClassTestStructure {
	prefix : string;
	question : number[];
	point : number;
	ordering : number;
	invertedQuestion : boolean;
	invertedAnswer : boolean;
	numberQuestion : number;
}

export interface ClassTestQuestion {
	id : number;
	group_id : number;
	class_id : number;
	class_test_id : number;
	question_number : number;
	question_direction : string;
	question_type : IctuQuestionType; //	radio; checkbox; selectbox; inputbox
	answer_option : AnswerOptionClassTestQuestion[];
	answer_correct : string;
	status : number; //	1: active; 0 inactive; -1: delete
	created_at : string;
	updated_at : string;
}

export interface AnswerOptionClassTestQuestion {
	id : string,
	value : string
}

export interface ClassStudentTestMap {
	prefix : string;
	question : number[];
	ordering : number;
	invertedQuestion : boolean;
	invertedAnswer : boolean;
	totalQuestion : number; // tổng số câu hỏi trong nhóms
}

export interface ClassStudentTest {
	id : number;
	class_test_id : number;
	class_id : number;
	student_id : number;
	time : number; // Thời gian làm bài của thí sinh(đơn vị giây)
	point : string; //decimal(10,2) default -1.00 | điểm quy về thang 10 (1 số thập phân); -1 là không thi
	note : string; //Ghi chú
	status : number; // -1 : Bỏ thi | 0 : Chưa thi | 1 : Đang thi | 2 : Đã thi xong (Chờ giáo viên chấm điểm) | 3 : Đã chấm xong
	map : ClassStudentTestMap[];
	created_at : string;
	updated_at : string;
}

export interface ClassStudentTestLog {
	id : number;
	class_id : number;
	student_id : number;
	class_student_test_id : number;
	content : string; //Bắt dầu thi; Nộp bài; Thoát khỏi chế độ full màn hình; Chuyển Ứng dụng khác | start_the_test | submit_result | escape_full_screen | switch_to_other_apps
	created_at : string;
	updated_at : string;
}

export interface ClassStudentTestAnswer {
	id : number;
	class_student_test_id : number;
	class_test_id : number;
	class_test_question_id : number;
	class_id : number;
	student_id : number;
	student_answer : string;
	result : number;	// 1: đúng | 0: sai ; tương đương: 1 => một điểm , 0 => không điểm
	created_at : string;
	updated_at : string;
}

export interface ClassStudentTestQuestion {
	id : number;
	class_student_test_id : number;
	class_test_id : number;
	class_test_question_id : number;
	class_id : number;
	student_id : number;
	student_answer : string;
	result : number;	// 1: đúng | 0: sai ; tương đương: 1 => một điểm , 0 => không điểm
	created_at : string;
	updated_at : string;
}

export enum TestLogStatus {
	startTheTest                    = 'start_the_test' ,
	submitResultByUser              = 'submit_result_by_user' ,
	closeTabDuringTheTest           = 'close_tab_during_the_test' ,
	resubmitResultByUser            = 'resubmit_result_by_user' ,
	forceSubmitResultBecauseTimeout = 'force_submit_result_because_timeout' ,
	exitFullScreen                  = 'exit_full_screen' ,
	openFullScreen                  = 'open_full_screen' ,
	switchToOtherApps               = 'switch_to_other_apps' ,
}
