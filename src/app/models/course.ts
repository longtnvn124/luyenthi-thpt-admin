import { IctuDocument } from '@model/file';
import { DropdownOption } from '@model/commons';

export interface Course {
	id : number,
	category_ids : number[], //một khoá học có thể thuộc nhiều chuyên mục
	donvi_id : number,
	title : string,
	subtitle : string,
	slug : string,
	maso : string, // mã học phần dùng để map với lớp học phần
	desc : string,
	img_url : IctuDocument, // ảnh đại diện
	word : string, // nhieu work, cach nhau dau phay (,)
	decuong : IctuDocument[];//	đề cương môn học
	sobaigiang : number, //số bài giảng mà giáo viên đăng ký xây dựng cho môn học
	files : IctuDocument[]; //	cac file tai lieu dinh kem dang json
	video_introduce : string,
	text_introduce : string,
	certification : CourseCertificationType, // 0. Không có chứng nhận | 1. Chứng nhận Online | 2. Chứng nhận In giấy | 3. Chứng chỉ
	text_benefit : string,
	danhchoai : string,
	language : 'vn' | 'en';
	type_fee : 1 | 2 | 3 // Kiểu học phí: 1 miễn phí, 2- trả phí, 3-bán
	type_duration : 1 | 2 | 3 //Kiểu thời gian sử dụng khoa học: 1-không thời hạn, 2- có thời hạn(ngày), 3-có thời hạn(tháng)
	time_duration : number, //thời hạn học khóa học
	total_time : string, // Thời lượng của khóa học = Tổng thời lượng của các lesson cộng lại
	course_ids : number[]// id của combo các khóa học
	playlist_id : string, //	ID của playlist trên youtube
	playlist_source : string,
	seo : string[], //title, subtitle, word,..
	price : number,
	sale_price : number,
	num_of_like : number,
	num_of_view : number,
	feature : 1 | 0 // Đánh dấu là khóa học tiêu biểu
	status : -1 | 0 | 1 // -1: delete, 0: inactive; 1: active
	activated : number, // Số học viên kích hoạt
	teacher_ids : number[],
	type_test : 'tienganh' | 'monkhac',
	creator_id : number, // nguoi tao ra bai giang
	creator_name : string,
	deleted_by : number,
	updated_by : number, // id của giáo viên được quyền sửa
	created_at : string,
	updated_at : string,
	is_deleted : 0 | 1,
	created_by : number
}

export interface CategoryDropdownOption extends DropdownOption {
	value : number;
}

export interface CourseExtend extends Course {
	categories_object : CategoryDropdownOption[];
	owned : boolean;
}

export interface CourseStudent {
	id : number,
	user_id : number,
	order_id : number,
	course_id : number,
	date_end : string,
	created_by : number,
	is_deleted : 0 | 1,
	updated_by : number,
	deleted_by : number,
	created_at : string,
	updated_at : string
}

export interface CoursePrice {
	price : string,
	sale : string,
	free : boolean,
}

export interface CourseQuery {
	limit : number;
	paged : number;
	search : string,
	category : number;
}

export type CourseCertificationType = 0 | 1 | 2 | 3;

export const CourseCertificationRecord : Record<CourseCertificationType , string> = {
	'0' : 'Không' ,
	'1' : 'Chứng nhận Online' ,
	'2' : 'Chứng nhận In giấy' ,
	'3' : 'Chứng chỉ'
};

export interface CourseInstructor {
	name : string,
	full_name : string,
	gender : null,
	address : string,
	tenkhoa : string,
	tenlop_quanly : string,
	hocham_hocvi : string,
	donvi_congtac : string,
	chucvu : string,
	kinhnghiem : string,
	// bio : string,
	social_link : {
		[ T : string ] : string
	}
}
