import { IctuDocument , IctuFileInfo } from '@model/file';

interface ClassStudentParams {
	group : number;
	leader : boolean;
}

export interface ClassPramsGroupElement {
	leader_id : number,
	members : number[],
	group : number; // number of group, starts form 1
}

export interface ClassPrams {
	max_group : number;
	group_size : number;
	block_group : boolean;
	groups : ClassPramsGroupElement[];
}

export interface ClassScoreRatio {
	chuyencan : number,
	kiemtra : number
}

export interface Class {
	id : number;
	category_id : number; // Lớp thuộc ngành nào
	kyhieu : string;
	sotinchi : number;
	course_id : number;
	name : string;
	slug : string;
	course_info : { [ t : string ] : any };
	// manager_ids : number[];
	managers? : Instructor[];
	manager_ids : string;
	manager_info : string;
	time_start : string;
	time_end : string;
	hocky : string;
	khoa : string;
	dothoc : number;
	sosv_dangky : number;
	namhoc : string;
	trongso : ClassScoreRatio | null,
	price : number;
	status : number;
	params : ClassPrams;
	image : IctuFileInfo;
	user_id : number; // creator_id người tao
	created_at : string;
	updated_at : string;
}

export type Instructor = {
	avatar : string;
	display_name : string;
	email : string;
	phone : string;
	username : string;
}

export interface ClassWithInstructor extends Class {
	managers : Instructor[];
}

export interface ClassDocument {
	id : number;
	class_id : number;
	title : string;
	file_info : IctuDocument;
	student_ids : number[] | null; // [1,2,3]: id các học viên được share tài liệu | null share all
	created_at : string;
	updated_at : string;
}

export interface ClassHomeWorkTopic {
	group : number,
	topic : string,
	member_number : number,
	leader_id : number,
	group_point : number,
}

export interface ClassHomeWork {
	id : number;
	class_id : number;
	title : string; // Tiêu đề bài tập hay bài thảo luận
	type : string; // Loại bài tập: BAITAP | THAOLUAN
	desc : string; // Mô tả nội dung bài tập hay bài thảo luận
	files : IctuDocument[]; // ID file đính kèm (nếu có)
	deadlines : string; // Hạn cuối nộp bài
	time_start : string; // thời hạn của bài thảo luận
	user_id : number; // creator_id Người tạo
	room_id : string;
	student_ids : number[]; //null: Tất cả học viên [1, 2]: Id của học viên được giao bài tập thêm
	created_at : string; //Ngày tạo
	topic_type : 'SINGLE' | 'GROUP',
	topics : ClassHomeWorkTopic[];
	updated_at : string; //Ngày update lần cuối
}

export interface ClassHomeWorkPost {
	id : number;
	class_id : number;
	class_homework_id : number;
	class_student_id : number;
	// files : IctuDriveFile[];
	files : IctuDocument[];
	point : number; //	cho điểm nếu có | -1 là không cho điểm
	status : number; // 0: Chờ duyệt | 1: Chấp nhận | -1: Yêu cầu nộp lại
	note : string; // assignment bài làm của học viên
	ngaynop : string; // Ngày nộp bài
	comment : string; // nhận xét của giảng viên
	co_owner : string; // student_id của các thành viên trong nhóm( Trường hợp nộp bào tập theo nhóm) |15|20|36|
	created_at : string;
	updated_at : string;
}

// lớp học phần
export interface ClassStudent {
	id : number;
	class_id : number;
	student_id : number;
	user_id : number; // lấy trong bảng user
	user_info : object;
	status : ClassStudentStatusType; // 1: đang hoạt động bình thường 0: đang chờ duyệt -1: bỏ học, 2 : closed
	namhoc : string;
	hocky : number;
	params : ClassStudentParams; // không dùng nữa
	created_at : string;
	updated_at : string;
}

export type ClassStudentStatusType = -1 | 0 | 1 | 2 | number;

export interface MixClass {
	class_student : ClassStudent;
	class_object : Class;
	class_title_name : string;
	class_teacher : string;
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

export type IctuQuestionType = 'grouping' | 'drag_drop' | 'radio' | 'checkbox' | 'group-radio' | 'group-input' | 'inputbox' | 'reorder_words' | 'matching' | 'group' | 'input'; // 'selectbox' |


export interface AnswerOptionClassTestQuestion {
	id : string,
	value : string
}


export interface AnswerOption {
	id : string;
	value : string;
}
