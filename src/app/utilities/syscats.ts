import { Navigation } from '@theme/types/navigation';
import { NgbModalOptions } from '@ng-bootstrap/ng-bootstrap/modal/modal-config';
import { Gender , IctuDropdownOption } from "@model/commons";
import { BankQuestionType , BankQuestionUntyped } from "@model/bank-question";

export const menus : Navigation[]  = []
export const AppTableRows : number = 20;

export const FileType : Map<string , string> = new Map( [
	[ 'application/vnd.google-apps.folder' , 'folder' ] ,
	[ 'audio/mpeg' , 'mp3' ] ,
	[ 'audio/mp3' , 'mp3' ] ,
	[ 'audio/x-aac' , 'x-aac' ] ,
	[ 'application/zip' , 'zip' ] ,
	[ 'application/x-zip-compressed' , 'zip' ] ,
	[ 'application/x-rar-compressed' , 'rar' ] ,
	[ 'application/x-7z-compressed' , 'zip' ] ,
	[ 'application/msword' , 'doc' ] ,
	[ 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' , 'docx' ] ,
	[ 'application/vnd.ms-powerpoint' , 'ppt' ] ,
	[ 'application/vnd.openxmlformats-officedocument.presentationml.presentation' , 'pptx' ] ,
	[ 'application/vnd.ms-excel' , 'xls' ] ,
	[ 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' , 'xlsx' ] ,
	[ 'application/vnd.google-apps.spreadsheet' , 'xlsx' ] ,
	[ 'application/pdf' , 'pdf' ] ,
	[ 'video/x-msvideo' , 'video' ] ,
	[ 'video/mp4' , 'mp4' ] ,
	[ 'image/png' , 'img' ] ,
	[ 'image/jpeg' , 'img' ] ,
	[ 'image/jpg' , 'img' ] ,
	[ 'image/gif' , 'img' ] ,
	[ 'text/plain' , 'text' ]
] );

// { value: 'vn', label: 'Tiếng Việt' },
// { value: 'en', label: 'Tiếng Anh' }


export const NORMAL_MODAL_OPTIONS : NgbModalOptions = {
	size        : 'md' ,
	backdrop    : 'static' ,
	centered    : true ,
	windowClass : ' ictu-modal-class'
};

export const NORMAL_MODAL_OPTIONS_LG : NgbModalOptions = {
	size        : 'lg' ,
	backdrop    : 'static' ,
	centered    : true ,
	windowClass : ' ictu-modal-class'
};

export const NORMAL_MODAL_OPTIONS_ROUND : NgbModalOptions = {
	size        : 'md' ,
	backdrop    : 'static' ,
	centered    : true ,
	windowClass : ' ictu-modal-class ovic-modal--rounded'
};

export const ALERT_MODAL_OPTIONS : NgbModalOptions = {
	size        : 'md' ,
	backdrop    : 'static' ,
	centered    : true ,
	windowClass : ' ictu-modal-class ovic-alert-modal-class'
};
export const MODAL_SIZE_AUTO : NgbModalOptions     = {
	size        : 'lg' ,
	backdrop    : 'static' ,
	centered    : true ,
	windowClass : ' ictu-modal-class ictu-modal-class--size-auto'
};

export const GENDER_DROPDOWN_OPTIONS : IctuDropdownOption<Gender>[] = [
	{ label : 'Nam' , value : 'nam' } ,
	{ label : 'Nữ' , value : 'nu' } ,
	{ label : 'Khác' , value : 'khac' }
];

export const NORMAL_STATUS = [
	{ label : 'Đóng' , value : '0' } ,
	{ label : 'Mở' , value : '1' }
];

export const PROCESS_SHIFT = [
	{ label : 'Có xử lý' , value : '1' }
	// { label: 'Không xử lý', value: '0' },
];

export const SKILL_TEST = [
	{ label : 'Listening' , value : 'listening' } ,
	{ label : 'Reading' , value : 'reading' } ,
	// { label: 'Speaking', value: 'speaking' },
	{ label : 'Writing' , value : 'writing' }
];

export const TYPE_BANK = [
	{ label : 'Kiểm tra' , value : 'KIEMTRA' } ,
	{ label : 'Thi' , value : 'THI' }
];

export const TYPE_CA_THI = [
	{ label : 'Thí sinh tự do' , value : 'INDEPENDENT' } ,
	{ label : 'Tổ chức thi' , value : 'IMPORT' }
];

export const DANTOC = [
	{ name : 'kinh' , label : 'Kinh' } ,
	{ name : 'tay' , label : 'Tày' } ,
	{ name : 'thai' , label : 'Thái' } ,
	{ name : 'muong' , label : 'Mường' } ,
	{ name : 'nung' , label : 'Nùng' } ,
	{ name : 'dao' , label : 'Dao' } ,
	{ name : 'h-mong' , label : 'H\'mông' } ,
	{ name : 'khmer' , label : 'Khmer' } ,
	{ name : 'gia-rai' , label : 'Gia Rai' } ,
	{ name : 'ede' , label : 'Ê Đê' } ,
	{ name : 'bana' , label : 'Ba Na' } ,
	{ name : 'xo-dang' , label : 'Xơ Đăng' } ,
	{ name : 'san-chay' , label : 'Sán Chay' } ,
	{ name : 'co-ho' , label : 'Cơ Ho' } ,
	{ name : 'hoa' , label : 'Hoa' } ,
	{ name : 'cham' , label : 'Chăm' } ,
	{ name : 'san-diu' , label : 'Sán Dìu' } ,
	{ name : 'tho' , label : 'Thổ' } ,
	{ name : 'hre' , label : 'Hrê' } ,
	{ name : 'ra-gia' , label : 'Ra Glai' } ,
	{ name : 'm-nong' , label : 'M\'Nông' } ,
	{ name : 'x-tieng' , label : 'X\'Tiêng' } ,
	{ name : 'bru-van-kieu' , label : 'Bru-Vân Kiều' } ,
	{ name : 'kho-mu' , label : 'Khơ Mú' } ,
	{ name : 'co-tu' , label : 'Cơ Tu' } ,
	{ name : 'giay' , label : 'Giáy' } ,
	{ name : 'gie-trieng' , label : 'Giẻ Triêng' } ,
	{ name : 'ta-oi' , label : 'Tà Ôi' } ,
	{ name : 'ma' , label : 'Mạ' } ,
	{ name : 'co' , label : 'Co' } ,
	{ name : 'cho-ro' , label : 'Chơ Ro' } ,
	{ name : 'xinh-mun' , label : 'Xinh Mun' } ,
	{ name : 'ha-nhi' , label : 'Hà Nhì' } ,
	{ name : 'chu-ru' , label : 'Chu Ru' } ,
	{ name : 'lao' , label : 'Lào' } ,
	{ name : 'khang' , label : 'Kháng' } ,
	{ name : 'la-chi' , label : 'La Chí' } ,
	{ name : 'phu-la' , label : 'Phù Lá' } ,
	{ name : 'la-hu' , label : 'La Hủ' } ,
	{ name : 'la-ha' , label : 'La Ha' } ,
	{ name : 'pa-then' , label : 'Pà Thẻn' } ,
	{ name : 'chut' , label : 'Chứt' } ,
	{ name : 'lu' , label : 'Lự' } ,
	{ name : 'lo-lo' , label : 'Lô Lô' } ,
	{ name : 'mang' , label : 'Mảng' } ,
	{ name : 'co-lao' , label : 'Cờ Lao' } ,
	{ name : 'bo-y' , label : 'Bố Y' } ,
	{ name : 'cong' , label : 'Cống' } ,
	{ name : 'ngay' , label : 'Ngái' } ,
	{ name : 'si-la' , label : 'Si La' } ,
	{ name : 'pu-peo' , label : 'Pu Péo' } ,
	{ name : 'ro-mam' , label : 'Rơ măm' } ,
	{ name : 'brau' , label : 'Brâu' } ,
	{ name : 'o-du' , label : 'Ơ Đu' }
];

export const TONGIAOVIETNAM = [
	{ name : 'khong' , label : 'Không' } ,
	{ name : 'phat-giao' , label : 'Phật giáo' } ,
	{ name : 'hoi-giao' , label : 'Hồi giáo' } ,
	{ name : 'bahai' , label : 'Bahai' } ,
	{ name : 'cong-giao' , label : 'Công giáo' } ,
	{ name : 'tin-lanh' , label : 'Tin lành' } ,
	{ name : 'mac-mon' , label : 'Mặc môn' } ,
	{ name : 'phat-giao-hoa-hao' , label : 'Phật giáo Hòa Hảo' } ,
	{ name : 'cao-dai' , label : 'Cao Đài' } ,
	{ name : 'buu-son-ky-huong' , label : 'Bửu Sơn Kỳ Hương' } ,
	{ name : 'tinh-do-cu-si-phat-hoi' , label : 'Tịnh Độ Cư Sĩ Phật Hội' } ,
	{ name : 'tu-an-hieu-nghia' , label : 'Tứ Ân Hiếu Nghĩa' } ,
	{ name : 'phat-duong-nam-tong-minh-su-dao' , label : 'Phật Đường Nam Tông Minh Sư Đạo' } ,
	{ name : 'minh-ly-dao-tam-tong-mieu' , label : 'Minh Lý Đạo Tam Tông Miếu' } ,
	{ name : 'ba-la-mon-kho-me' , label : 'Bà la môn Khơ me' } ,
	{ name : 'phat-giao-hieu-nghia-ta-lon' , label : 'Phật giáo Hiếu Nghĩa Tà Lơn' }
];

export const WAITING_POPUP : NgbModalOptions = {
	scrollable  : true ,
	size        : 'xl' ,
	windowClass : 'modal-xxl ictu-modal-class' ,
	centered    : true ,
	backdrop    : 'static'
};

export const TYPE_FILE_IMAGE : string[] = [ 'image/png' , 'image/gif' , 'image/jpeg' , 'image/bmp' , ' image/x-icon' ];

export const bankQuestion = [
	{ value : 'Bình thường' , key : 'normal' }
];

export const LEVEL_QUESTION = [
	{ label : 'Hiểu' , value : 1 , level : 1 } ,
	{ label : 'Biết' , value : 2 , level : 2 } ,
	{ label : 'Vận dụng' , value : 3 , level : 3 } ,
	{ label : 'Phân tích' , value : 4 , level : 4 }
]

export const QUESTION_TYPE = [
	{ label : 'Chọn đáp án dạng A B C' , value : 'radio' }
	// { label: 'Chọn đáp án dạng selectbox', value: 'selectbox' },
	// { label: 'Nhập đáp án đúng', value: 'inputbox' },
	// { label: 'Hoàn thiện từ', value: 'complete_word' },
	// { label: 'Sắp xếp từ(drag-drop 1)', value: 'reorder_words' },
	// { label: 'Drag-drop 2', value: 'drag_drop' },
	// { label: 'Nhập vào văn bản (kỹ năng viết)', value: 'textarea' },
];


export const READ_NUMBER = {
	nguyen   : {
		1  : 'một' ,
		2  : 'hai' ,
		3  : 'ba' ,
		4  : 'bốn' ,
		5  : 'năm' ,
		6  : 'sáu' ,
		7  : 'bảy' ,
		8  : 'tám' ,
		9  : 'chín' ,
		10 : 'mười'
	} ,
	thapphan : {
		1 : 'một' ,
		2 : 'hai' ,
		3 : 'ba' ,
		4 : 'bốn' ,
		5 : 'rưỡi' ,
		6 : 'sáu' ,
		7 : 'bảy' ,
		8 : 'tám' ,
		9 : 'chín'
	}
}

export const pointBank = {
	vstep2  : {
		reading    : {
			0  : 0 ,
			1  : 1 ,
			2  : 1 ,
			3  : 2 ,
			4  : 2 ,
			5  : 3 ,
			6  : 4 ,
			7  : 5 ,
			8  : 6 ,
			9  : 7 ,
			10 : 8 ,
			11 : 9 ,
			12 : 10 ,
			13 : 10 ,
			14 : 11 ,
			15 : 12 ,
			16 : 13 ,
			17 : 14 ,
			18 : 15 ,
			19 : 15 ,
			20 : 16 ,
			21 : 17 ,
			22 : 18 ,
			23 : 19 ,
			24 : 20 ,
			25 : 20 ,
			26 : 21 ,
			27 : 22 ,
			28 : 23 ,
			29 : 24 ,
			30 : 25
		} ,
		listening  : {
			0  : 0 ,
			1  : 1 ,
			2  : 2 ,
			3  : 3 ,
			4  : 4 ,
			5  : 5 ,
			6  : 6 ,
			7  : 7 ,
			8  : 8 ,
			9  : 9 ,
			10 : 10 ,
			11 : 11 ,
			12 : 12 ,
			13 : 13 ,
			14 : 14 ,
			15 : 15 ,
			16 : 16 ,
			17 : 17 ,
			18 : 18 ,
			19 : 19 ,
			20 : 20 ,
			21 : 21 ,
			22 : 22 ,
			23 : 23 ,
			24 : 24 ,
			25 : 25
		} ,
		total_rate : 10 ,
		diemdat    : 6.5 ,
		part       : {
			listening : [ 10 , 20 , 30 , 40 , 50 ] ,
			reading   : [ 10 , 20 , 30 , 40 ] ,
			speaking  : [ 10 , 20 , 30 , 40 ] ,
			writing   : [ 10 , 20 , 30 ]
		}
	} ,
	vstep35 : {
		reading    : {
			raw_point  : 35 ,
			last_point : 10
		} ,
		listening  : {
			raw_point  : 40 ,
			last_point : 10
		} ,
		total_rate : 4 ,
		diemdat    : 4 ,
		part       : {
			listening : [ 10 , 20 , 21 , 22 , 30 , 31 , 32 ] ,
			reading   : [ 10 , 20 , 30 , 40 ] ,
			speaking  : [ 10 , 20 , 30 ] ,
			writing   : [ 10 , 20 ]
		}

	} ,
	ket     : {
		part       : {
			listening : [ 10 , 20 , 30 , 40 , 50 ] ,
			reading   : [ 10 , 20 , 31 , 32 , 40 , 50 ] ,
			writing   : [ 60 , 70 , 80 , 90 ]
		} ,
		reading    : {
			raw_point  : 35 ,
			last_point : 25
		} ,
		listening  : {
			raw_point  : 25 ,
			last_point : 25
		} ,
		total_rate : 1
	}
};

export const SKILL_TEST_RESUTL = [
	{ label : 'Nghe' , value : 'listening' } ,
	{ label : 'Đọc' , value : 'reading' } ,
	{ label : 'Nói' , value : 'speaking' } ,
	{ label : 'Viết' , value : 'writing' }
];

export const KEY_ANSWER_new = {
	0  : 'A' ,
	1  : 'B' ,
	2  : 'C' ,
	3  : 'D' ,
	4  : 'E' ,
	5  : 'F' ,
	6  : 'G' ,
	7  : 'H' ,
	8  : 'I' ,
	9  : 'J' ,
	10 : 'K' ,
	11 : 'L' ,
	12 : 'M' ,
	13 : 'N' ,
	14 : 'O' ,
	15 : 'P' ,
	16 : 'Q' ,
	17 : 'R' ,
	18 : 'S' ,
	19 : 'T' ,
	20 : 'U' ,
	21 : 'V' ,
	22 : 'W' ,
	23 : 'X' ,
	24 : 'Y' ,
	25 : 'Z'
};

export const SKILL_TEST_TOTAL_OBJECT = {
	listening : 'Nghe' ,
	reading   : 'Đọc' ,
	// speaking: 'Nói',
	writing    : 'Viết' ,
	'all-time' : 'Bài thi'
}

export const TITLE_LEFT = {
	donvitochuc    : 'TRƯỜNG ĐẠI HỌC CÔNG NGHỆ THÔNG TIN VÀ TRUYỀN THÔNG' ,
	donvitructhuoc : 'đại học thái nguyên'
}

export const LARGE_MODAL_OPTIONS : any = {
	scrollable  : true ,
	size        : 'xl' ,
	windowClass : 'modal-xxl ictu-modal-class' ,
	centered    : true
};

export const SM_MODAL_OPTIONS : any = {
	size        : 'sm' ,
	backdrop    : 'static' ,
	centered    : true ,
	windowClass : ' ictu-modal-class'
};
export const SKILL_TEST_OBJECT      = {
	listening : 'Listening' ,
	reading   : 'Reading' ,
	// speaking: 'Speaking',
	writing    : 'Writing' ,
	'all-time' : 'Thời gian còn lại'
}

export const SKILL_TEST_TOTAL = [
	{ label : 'Nghe' , value : 'listening' } ,
	{ label : 'Đọc' , value : 'reading' } ,
	// { label: 'Nói', value: 'speaking' },
	{ label : 'Viết' , value : 'writing' }
];

export const OvicVideoSourceObject = {
	local       : 'local' ,
	serverFile  : 'serverFile' ,
	vimeo       : 'vimeo' ,
	youtube     : 'youtube' ,
	googleDrive : 'googleDrive' ,
	encrypted   : 'encrypted' ,
	serverAws   : 'serverAws'
};

const _bankQuestionTypeOptions : IctuDropdownOption<BankQuestionType>[] = [
	{ value : "radio" , label : '[radio] - Câu hỏi MCQs' , disabled : false } ,
	{ value : "group-radio" , label : '[group-radio] - Câu hỏi MCQs dạng nhóm' , disabled : false } ,
	{ value : "input" , label : '[input] - Trả lời ngắn' , disabled : false } ,
	{ value : "matching" , label : '[matching] - Ghép hợp' , disabled : false } ,
	{ value : "textarea" , label : '[textarea] - Viết đoạn văn/ luận' , disabled : false } ,
	{ value : "group-true-false" , label : '[group-true-false] - Đúng Sai' , disabled : false } ,
	{ value : "checkbox" , label : '[checkbox] - Chọn nhiều đáp án' , disabled : false } ,
	{ value : "group-input" , label : '[group-input] - Nhóm câu hỏi nhập đáp án' , disabled : false } ,
	{ value : "grouping" , label : '[grouping] - Phân nhóm đáp án' , disabled : false } ,
	{ value : "drag-drop" , label : '[drag-drop] - Kéo thả - ghép hợp' , disabled : false } ,
	{ value : "fill-in-blank" , label : '[fill-in-blank] - Điền khuyết' , disabled : true } ,
	{ value : "complete-word" , label : '[complete-word] - Hoàn thiện từ với chứ cái đầu cho trước' , disabled : true } ,
	{ value : "arrange-words" , label : '[arrange-words] - Sắp xếp lại câu theo thứ tự đúng' , disabled : true } ,
	{ value : "true-false" , label : '[true-false] - Chọn đáp án Đúng - Sai' , disabled : false }
];

export const bankQuestionTypeOptions : IctuDropdownOption<BankQuestionType>[] = Object.seal( _bankQuestionTypeOptions );

export const bankQuestionUntypedOption : IctuDropdownOption<BankQuestionUntyped> = Object.seal( { value : "untyped" , label : '[untyped] - Chưa chọn định dạng câu hỏi' , disabled : false } );

