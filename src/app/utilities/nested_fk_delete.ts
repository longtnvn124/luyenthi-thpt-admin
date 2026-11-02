const nested_fk_delete = {
	dm_subjects : {

		banks : {
			bank_questions : {} ,
			forms          : {
				form_details : {} ,
				shifts       : {
					shift_rooms         : {} ,
					shift_tests         : {} ,
					shift_student_tests : {
						shift_student_tests_answer : {} ,
						shift_test_controls        : {}
					}
				}
			}
		}

	} ,
	packs       : {
		orders : {}
	}
}


const nested_fk_delete_1 = {
	dm_subjects : {
		fk       : "dm_subject_id" , // Khoá ngoại liên kết tới bảng cha
		children : {
			banks : {
				fk       : "dm_subject_id" , // Liên kết tới bảng dm_subjects
				children : {
					bank_questions : { fk : "bank_id" } , // Liên kết tới bảng banks
					forms          : {
						fk       : "bank_id" ,
						children : {
							form_details : { fk : "form_id" } , // Liên kết tới bảng forms
							shifts       : {
								fk       : "form_id" ,
								children : {
									shift_rooms         : { fk : "shift_id" } , // Liên kết tới bảng shifts
									shift_tests         : { fk : "shift_id" } ,
									shift_student_tests : {
										fk       : "shift_id" ,
										children : {
											shift_student_tests_answer : { fk : "shift_student_test_id" } ,
											shift_test_controls        : { fk : "shift_student_test_id" }
										}
									}
								}
							}
						}
					}
				}
			}
		}
	} ,
	packs       : {
		fk       : null , // Không có bảng cha
		children : {
			orders : { fk : "pack_id" }  // Liên kết tới bảng packs
		}
	}
};

module.exports = [
	{
		id       : "dashboard" ,
		title    : "Dashboard" ,
		icon     : "fa fa-tachometer" ,
		position : "left"
	} ,
	{
		id       : "mon-hoc" ,
		title    : "Danh sách môn học" ,
		icon     : "fa fa-book" ,
		position : "left"
	} ,
	{
		id       : "dot-thi" ,
		title    : "Đợt thi" ,
		icon     : "fa fa-caret-right" ,
		position : "left"
	} ,
	{
		id       : "danh-sach-thi-sinh" ,
		title    : "Thí sinh" ,
		icon     : "fa fa-users" ,
		position : "left"
	} ,
	{
		id       : "ngan-hang/danh-sach" ,
		title    : "Danh sách ngân hàng" ,
		icon     : "fa fa-university" ,
		position : "left"
	} ,
	{
		id       : "ngan-hang/cap-nhat-cau-hoi" ,
		title    : "Cập nhật câu hỏi" ,
		icon     : "fa fa-refresh" ,
		position : "left"
	} ,
	{
		id       : "form-de-thi" ,
		title    : "Form đề thi" ,
		icon     : "fa fa-clipboard" ,
		position : "left"
	} ,
	{
		id       : "ca-thi" ,
		title    : "Ca thi" ,
		icon     : "fa fa-slideshare" ,
		position : "left"
	} ,
	{
		id       : "theo-doi-ca-thi" ,
		title    : "Theo dõi ca thi" ,
		icon     : "fa fa-binoculars" ,
		position : "left"
	} ,
	{
		id       : "ket-qua-thi" ,
		title    : "Kết quả thi" ,
		icon     : "fa fa-pencil-square-o" ,
		position : "left"
	} ,
	{
		id       : "xem-bai-thi" ,
		title    : "Xem bài thi" ,
		icon     : "fa fa-file-text-o" ,
		position : "left"
	} ,
	{
		id       : "goi-dich-vu" ,
		title    : "Gói dịch vụ" ,
		icon     : "pi pi-dollar" ,
		position : "left"
	} ,
	{
		id       : "khuyen-mai" ,
		title    : "Khuyến mại" ,
		icon     : "pi pi-tags" ,
		position : "left"
	} ,
	{
		id       : "lich-su-thanh-toan" ,
		title    : "Lịch sử thanh toán" ,
		icon     : "pi pi-history" ,
		position : "left"
	} ,
	{
		id       : "he-thong/quan-ly-tai-khoan" ,
		title    : "Quản lý tài khoản" ,
		type     : "item" ,
		icon     : "fa fa-key" ,
		position : "left"
	} ,
	{
		id       : "he-thong/cau-hinh-chung" ,
		title    : "Cấu hình chung" ,
		type     : "item" ,
		icon     : "fa fa fa-cogs" ,
		position : "left"
	} ,
	{
		id       : "he-thong/thong-tin-tai-khoan" ,
		title    : "Thông tin tài khoản" ,
		type     : "item" ,
		icon     : "fa fa-user-circle-o" ,
		position : "left"
	} ,
	{
		id       : "ban-tin" ,
		title    : "Bảng tin" ,
		icon     : "fa fa-tachometer" ,
		position : "left"
	} ,
	{
		id       : "mon-thi" ,
		title    : "Môn thi" ,
		icon     : "fa fa-graduation-cap" ,
		position : "left"
	} ,
	{
		id       : "mon-thi/thi" ,
		title    : "Thi" ,
		icon     : "fa fa-graduation-cap" ,
		position : "left"
	} ,
	{
		id       : "tra-cuu" ,
		title    : "Tra cứu kết quả" ,
		icon     : "fa fa-line-chart" ,
		position : "left"
	} ,
	{
		id       : "huong-dan-thi" ,
		title    : "Hướng dẫn thi" ,
		icon     : "fa fa-phone" ,
		position : "left"
	} ,
	{
		id       : "ho-so" ,
		title    : "Hồ sơ của bạn" ,
		icon     : "fa fa-user-circle-o" ,
		position : "left"
	} ,
	{
		id       : "thanh-toan" ,
		title    : "Thanh toán" ,
		icon     : "pi pi-dollar" ,
		position : "left"
	} ,
	{
		id       : "lich-su" ,
		title    : "Lịch sử thanh toán" ,
		icon     : "pi pi-history" ,
		position : "left"
	} ,
	{
		id       : "giao-vien/cham-thi" ,
		title    : "Chấm thi" ,
		icon     : "fa fa-pencil-square-o" ,
		position : "left"
	} ,
	{
		id       : "giao-vien/ket-qua-cham-thi" ,
		title    : "Kết quả chấm thi" ,
		icon     : "fa fa-archive" ,
		position : "left"
	} ,
	{
		id       : "phan-quyen-cham-thi" ,
		title    : "Phân quyền chấm thi" ,
		icon     : "fa fa-pencil-square-o" ,
		position : "left"
	} ,
	{
		id       : "ket-qua-cham-thi" ,
		title    : "Kết quả chấm thi" ,
		icon     : "fa fa-pencil-square-o" ,
		position : "left"
	} ,
	{
		id       : "thong-ke" ,
		title    : "Thống kê" ,
		icon     : "fa fa-bar-chart" ,
		position : "left"
	} ,
	{
		id       : "partners" ,
		title    : "Đối tác" ,
		icon     : "fa fa-users" ,
		position : "left"
	}
];