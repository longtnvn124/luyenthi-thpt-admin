import { IctuDocument , IctuMedia } from '@model/file';
import { ClassStudentsTracking } from '@model/class-students-tracking';
import { AnswerOption } from '@service/lesson-tests-questions.service';
import { VideoMarker } from '@model/video-marker';
import { VideoTrackLoggerEventParams } from '@pages/learning/board/learning-board/learning-board-video/learning-board-video.component';

export type LessonType = 'LESSON' | 'TEST' | 'COURSE_CLASS_DOCUMENT' | 'COURSE_OUTLINE'; // LESSON | TEST

export interface Lesson {
	id? : number;
	course_id : number;
	parent_id : number;
	title : string;
	slug : string;
	type : LessonType;
	desc : string;
	audio : IctuDocument[] | null;
	video : IctuDocument | null;
	other_video : IctuDocument[] | null;
	slide : IctuDocument[] | null;
	documents : IctuDocument[] | null;
	trailer : 0 | 1;
	params : LessonParams;
	ordering : number;
	teacher : string;
	duration : string;
	activated : number;
	status : number;
	created_at : string;
	updated_at : string;
	//check? : ClassStudentsTracking; // logged
	completed? : boolean;
	state? : string;
	available? : boolean | null; // lesson chỉ khả dụng khi các lesson có id năm trong params.require[] đề completed
}

export interface LessonVideoLogEvent {
	video_duration : number;
	time_play_video : number;
	completed : number;
	max_stopped_time : number;
	last_stopped : number;
}

export interface LessonParams extends Object {
	// condition? : number; // phần trăm đáp án đúng thí sinh cần đạt để qua bài , vd condition : 80 => thí sinh cần trả lời đúng > 80% thì đạt yêu cầu
	require? : number[]; // id những lesson yêu cầu hoàn thành trước khi bắt đầu học lesson này
	can_jump_forward? : boolean;
	skip? : boolean;
	ignore? : boolean;
}

export type LessonTestType = 'english' | 'other';

export interface LessonTest {
	id : number;
	lesson_id : number;
	content : string;
	type : LessonTestType;
	media : IctuMedia;
	config : LessonTestConfigs;
	created_by : number;
	point : number;
	time_start : number;
	total_time : number;
	updated_at : string;
	created_at : string;
}

export interface LessonTestConfigs {
	invertedQuestion? : boolean;  // true thì đảo thứ tự các câu hỏi trước khi show ra
	invertedAnswer? : boolean;    // Đảo thứ tự của các phương án trả lời
	showHint? : boolean;          // Hiển thị gợi ý
	showExplain? : boolean;       // Hiển thị giải thích
	showAnswer? : boolean;        // Hiển thị đáp án đúng
	percentComplete? : number;    // Số phần trăm cần đạt để được tính là đạt yêu cầu
	numberQuestion? : number;     // Số lượng câu hỏi show ra
	maxTestTimes? : number;       // Số lần được phép làm bài
}

export type CountLessonType = 'LESSON' | 'TEST';

export interface CountLesson {
	audio : IctuDocument[];
	video : IctuDocument;
	other_video : IctuDocument[];
	slide : IctuDocument[];
	documents : IctuDocument[];
	id? : number;
	course_id : number;
	parent_id : number;
	title : string;
	slug : string;
	type : CountLessonType;
	check? : ClassStudentsTracking; // logged
	ordering? : number;
}

export interface SurveyQuestionParams {
	enable_comments? : boolean,
	placeholder? : string, // áp dụng cho LessonCommentType = TEXT hoặc khi enable_comments = true
	min? : number, // áp dụng cho LessonCommentType = RANGE_SLIDER
	max? : number, // áp dụng cho LessonCommentType = RANGE_SLIDER
	step? : number, // áp dụng cho LessonCommentType = RANGE_SLIDER
	range? : number, // áp dụng cho LessonCommentType = RANGE_SLIDER ( When range property is present, slider provides two handles to define two values. In range mode, value should be an array instead of a single value. )
}

export interface SurveyQuestion {
	id : number;
	type : LessonCommentType;
	question : string;
	answer_option : AnswerOption[];
	params : SurveyQuestionParams;
	required : boolean;
	status : number;
}

/**
 * LessonCommentType
 * RATE : Kiểu mặc định của tất cả các lesson
 * SELECT : Hiển thị danh sách dạng dropdown nhưng chỉ chọn được một phương án trả lời
 * MULTI_SELECT : Hiển thị danh sách dạng dropdown và chọn được nhiều phương án trả lời
 * TEXT : Hiển thị thanh input để người dụng nhập thông tin
 * RADIO : Hiển thị danh sách các phương án theo chiều dọc. Chỉ chọn được một phương án trong danh sách
 * CHECK_BOX : Hiển thị danh sách các phương án theo chiều dọc. Chọn được nhiều phương án trong danh sách
 * BUTTON_SELECT : Hiển thị danh sách các label(hoặc button) theo chiều ngang. Những AnswerOption nào có id = '' thì sẽ hiển thị dưới dạng label và không được tính là 1 phương án chọn
 * RANGE_SLIDER : Hiện thị thanh trượt để người dùng thay đổi giá trị bằng cách trượt thanh trượt trong khoảng [min - max , step] hoặc trong danh sách AnswerOptions[]
 * */
export type LessonCommentType = 'RATING' | 'SELECT' | 'MULTI_SELECT' | 'TEXT' | 'RADIO' | 'CHECK_BOX' | 'BUTTON_SELECT' | 'RANGE_SLIDER'

export interface LessonComment {
	id : number,
	question_type : LessonCommentType,
	course_id : number,
	question_id : number,
	class_id : number,
	lesson_id : number,
	student_id : number,
	namhoc : string,
	hocky : number,
	rate : number, // thang điểm từ 1 - 5 | 0 = skip rating
	comments : string,
	answers : string,
	unique_code : string; // chuỗi có định dạng [course_id]_[class_id]_[lesson_id]_[question_id]_[student_id] dùng để group_by chống dumplicate dữ liệu
	is_deleted : number,
	deleted_by : number,
	created_by : number,
	created_at : string,
	updated_at : string,
	updated_by : number,
}

export interface LearningBoardVideoPromptConfigs {
	videoMarker : VideoMarker,
	trackLoggerParams : VideoTrackLoggerEventParams,
	lesson : Lesson,
}

export interface Curriculum extends Pick<Lesson , 'id' | 'parent_id' | 'title' | 'slug' | 'type' | 'desc' | 'created_at' | 'duration' | 'ordering' | 'trailer'> {
	child? : Curriculum[];
}

export interface CourseCurriculumPreview {
	courseId : number,
	lessonId : number;
}
