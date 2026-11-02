export interface ClassStudentsTracking {
	id? : number;
	class_student_id : number;
	class_id : number;
	lesson_id : number;
	lesson_name? : string;
	time_play_video? : number;    // Thời gian thực tế xem video
	video_duration? : number;     // Thời lượng của video
	completed? : number;          // Học viên cần xem đủ 90% tổng thời lượng của video và có điểm stop video lớn nhất cao hơn 90% thì được tính là hoàn thành. 1 : Hoàn thành | 0 : chưa hoàn thành
	last_stopped? : number;       // Điểm stop video cuối
	max_stopped_time? : number;   // Điểm stop video lớn nhất
	test_results? : ClassStudentsTrackingResult[];
	created_at? : string;
	updated_at? : string;
}

export interface ClassStudentsTrackingResult {
	date : string; // date time
	time : number; // total test time (unit seconds)
	answer : string; // correct_answers / total questions
	point : number;
	tabId? : string;
}

export interface VideoTracker {
	id? : number;
	lesson_id : number;
	time_play_video? : number;    // Thời gian thực tế xem video
	video_duration? : number;     // Thời lượng của video
	completed : number;          // Học viên cần xem đủ 90% tổng thời lượng của video và có điểm stop video lớn nhất cao hơn 90% thì được tính là hoàn thành. 1 : Hoàn thành | 0 : chưa hoàn thành
	last_stopped? : number;       // Điểm stop video cuối
	max_stopped_time? : number;   // Điểm stop video lớn nhất
}
