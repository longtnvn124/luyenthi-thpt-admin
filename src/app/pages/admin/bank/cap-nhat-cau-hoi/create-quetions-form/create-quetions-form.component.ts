import { ChangeDetectorRef , Component , EventEmitter , Input , OnChanges , OnDestroy , OnInit , Output , SimpleChanges } from "@angular/core";
import { AbstractControl , FormBuilder , FormGroup , FormsModule , ReactiveFormsModule , Validators } from "@angular/forms";
import { Question } from "@model/question";
import { IctuQuestionType } from "@model/class";
import { formatAnswerCorrect , SelectOptions } from "@pages/admin/bank/cap-nhat-cau-hoi/models/bank-questions";
import { AuthService } from "@service/core/auth.service";
import { NotificationService } from "@appNotification";
import { TnBankQuestionService } from "@service/luyenthithpt/tn-bank-question.service";
import { OpenFileManagerService } from "@service/core/open-file-manager.service";
import { forkJoin , map , mergeMap , Observable , of } from "rxjs";
import { filter , tap } from "rxjs/operators";
import { NgClass , NgForOf , NgIf , NgSwitch , NgSwitchCase , NgSwitchDefault } from "@angular/common";
import { DropdownModule } from "primeng/dropdown";
import { InputQuestionDirectionComponent } from "@pages/admin/bank/cap-nhat-cau-hoi/input-question-direction/input-question-direction.component";
import { IctuMediaLinkPipe } from "@pages/admin/bank/cap-nhat-cau-hoi/pipes/ictu-media-link.pipe";
import { SafeUrlPipe } from "../../../../../pipes/safe-url.pipe";
import { InputTextModule } from "primeng/inputtext";
import { RippleModule } from "primeng/ripple";
import { ButtonModule } from "primeng/button";
import { GroupInputQuestionComponent } from "@pages/admin/bank/cap-nhat-cau-hoi/question-types/group-input-question/group-input-question.component";
import { GroupRadioQuestionEditorComponent } from "@pages/admin/bank/cap-nhat-cau-hoi/question-types/group-radio-question-editor/group-radio-question-editor.component";
import { DragAndDropQuestionComponent } from "@pages/admin/bank/cap-nhat-cau-hoi/question-types/drag-and-drop-question/drag-and-drop-question.component";
import { QuestionTypeRadioEditorComponent } from "@pages/admin/bank/cap-nhat-cau-hoi/question-types/question-type-radio-editor/question-type-radio-editor.component";
import { GroupingQuestionComponent } from "@pages/admin/bank/cap-nhat-cau-hoi/question-types/grouping-question/grouping-question.component";
import { InputTextareaModule } from "primeng/inputtextarea";
import { QuestionTypeInputBoxComponent } from "@pages/admin/bank/cap-nhat-cau-hoi/question-types/question-type-input-box/question-type-input-box.component";
import { QuestionTypeReorderWordsComponent } from "@pages/admin/bank/cap-nhat-cau-hoi/question-types/question-type-reorder-words/question-type-reorder-words.component";
import { CheckboxModule } from "primeng/checkbox";
import { TnBankQuestion } from "@model/tn-bank-question";
import { GroupQuestionComponent } from "../question-types/group-question/group-question.component";
import { DragAndDropQuestionCkEditorComponent } from "../question-types/drag-and-drop-question-ck-editor/drag-and-drop-question-ck-editor.component";
import { IctuMediaLoaderDirective } from "src/app/directives/ictu-media-loader.directive";
import { SafeHtmlPipe } from "src/app/pipes/safe-html.pipe";
import { TabMenuModule } from 'primeng/tabmenu';
import { MenuItem } from "primeng/api";
import { GroupRadioQuestionComponent } from "../question-types/group-radio-question/group-radio-question.component";

interface QuestionTypeSection {
	options : SelectOptions<IctuQuestionType>[];
	active : IctuQuestionType;
	placeholder : string;
}

interface GroupInputQuestion {
	question : Question;
	answer : string;
}

export type InputQuestionMode = "list" | "edit" | "create";

export type TestFormat = "tienganh" | "monkhac";

type CreateEditQuestionValidator = Record<
	IctuQuestionType ,
	() => CreateEditQuestionErrorName | null
>;

type CreateEditQuestionValidatorControl = Record<
	TestFormat ,
	CreateEditQuestionValidator
>;

type CreateEditQuestionErrorName =
	| "the_child_question_empty"
	| "direction_of_child_question_empty"
	| "the_direction_of_the_question_is_empty"
	| "the_answer_options_are_empty"
	| "the_correct_answer_is_empty"
	| "the_correct_answer_of_the_child_question_is_empty"
	| "the_answer_of_the_child_question_is_empty"
	| "the_level_the_question_is_empty";

export interface TnBankQuestionHierarchy extends TnBankQuestion {
	children : TnBankQuestion[];
}

export interface CreateQuestionInfo {
	question? : TnBankQuestionHierarchy | TnBankQuestion;
}

@Component( {
	selector    : "app-create-quetions-form" ,
	templateUrl : "./create-quetions-form.component.html" ,
	styleUrls   : [ "./create-quetions-form.component.css" ] ,
	imports     : [
		NgClass ,
		NgIf ,
		DropdownModule ,
		ReactiveFormsModule ,
		FormsModule ,
		InputQuestionDirectionComponent ,
		IctuMediaLinkPipe ,
		SafeUrlPipe ,
		InputTextModule ,
		RippleModule ,
		ButtonModule ,
		NgSwitch ,
		GroupInputQuestionComponent ,
		GroupRadioQuestionEditorComponent ,
		DragAndDropQuestionComponent ,
		QuestionTypeRadioEditorComponent ,
		GroupingQuestionComponent ,
		NgForOf ,
		InputTextareaModule ,
		QuestionTypeInputBoxComponent ,
		QuestionTypeReorderWordsComponent ,
		CheckboxModule ,
		NgSwitchCase ,
		NgSwitchDefault ,
		GroupQuestionComponent ,
		DragAndDropQuestionCkEditorComponent ,
		IctuMediaLoaderDirective ,
		SafeHtmlPipe ,
		TabMenuModule ,
		GroupRadioQuestionComponent
	] ,
	standalone  : true
} )
export class CreateQuetionsFormComponent implements OnInit , OnChanges , OnDestroy {

	@Output() close : EventEmitter<InputQuestionMode> = new EventEmitter<InputQuestionMode>();

	@Input() triggerFromParent : boolean = false;

	triggerInputQuestionDirection : boolean = false;

	@Input() set data ( info : CreateQuestionInfo ) {
		if ( info ) {
			this.info = info;
			this.fillForm( info );
			// this.level = cdrName2Label( info.level );
			this.formMode = "create";
			this.changesTestType();
		}
	}

	@Input() update : CreateQuestionInfo;


	@Input() set testFormat ( testFormat : TestFormat ) {
		this._testFormat = testFormat;
		// this._testFormat = 'tienganh';
		this.changesTestType();
	}

	@Output() emitCloseForm : EventEmitter<string> = new EventEmitter<string>();

	private _testFormat : TestFormat = "monkhac";

	changeAnswerMedia : number = 1;

	// when save question will change parent_id_saved = id from res, pass to child to save data in childe
	parent_id_saved : number             = 0;
	parent_vandung_type : number         = null;
	// already_to_save: {parentAlready: boolean, childrenAlready: boolean} = {parentAlready: false, childrenAlready: true}; // check all question not any error and already to save, (check parent question + pass to child to check all questions in child)
	parent_already_emit_change : boolean = false; // check parent question already
	// children_already_to_save: boolean = true; // check children question already
	children_ready_states : boolean[] = []; // Trạng thái của các con

	// question is saved
	questionIsSaved : boolean = false;

	@Input() set typeForm ( type : string ) {
		this._typeForm = type;
	}

	_typeForm : string = "add";

	numberQuestionChildrenGroup : number[] = [];

	get testFormat () : TestFormat {
		return this._testFormat;
	}

	formMode : "update" | "create" = "create";

	level : string;

	info : CreateQuestionInfo;

	loading : boolean = true;

	form : FormGroup;

	token : string = this.auth.accessToken;

	vandungTypes = [
		{ value : 1 , label : "Hiểu" , disable : false } ,
		{ value : 2 , label : "Biết" , disable : false } ,
		{ value : 3 , label : "Vận dụng" , disable : false } ,
		{ value : 4 , label : "Phân tích" , disable : false }
	];

	vandungTypeSelect : number = 0;

	private resetQuestion : Record<
		IctuQuestionType ,
		( info : CreateQuestionInfo ) => Question
	> = {
		"group-input" : ( info : CreateQuestionInfo ) : Question => {
			return {
				question_direction : "" ,
				question_type      : "group-input" ,
				answer_option      : [] ,
				answer_correct     : "" ,
				group_id           : 0 ,
				media              : null ,
				part               : 0 ,
				question_number    : 0 ,
				code               : "" ,
				level              : null ,
				config             : {
					cols           : 1 ,
					invertedAnswer : true
				} ,
				children           : [
					{
						question_direction : "" ,
						question_type      : "group-input" ,
						answer_option      : [] ,
						answer_correct     : "" ,
						group_id           : 0 ,
						media              : null ,
						part               : 0 ,
						level              : null ,
						question_number    : 0 ,
						code               : "" ,
						config             : { cols : 1 , invertedAnswer : true } ,
						children           : []
					} ,
					{
						question_direction : "" ,
						question_type      : "group-input" ,
						answer_option      : [] ,
						answer_correct     : "" ,
						group_id           : 0 ,
						media              : null ,
						part               : 0 ,
						level              : null ,
						question_number    : 0 ,
						code               : "" ,
						config             : { cols : 1 , invertedAnswer : true } ,
						children           : []
					} ,
					{
						question_direction : "" ,
						question_type      : "group-input" ,
						answer_option      : [] ,
						answer_correct     : "" ,
						group_id           : 0 ,
						media              : null ,
						part               : 0 ,
						level              : null ,
						question_number    : 0 ,
						code               : "" ,
						config             : { cols : 1 , invertedAnswer : true } ,
						children           : []
					} ,
					{
						question_direction : "" ,
						question_type      : "group-input" ,
						answer_option      : [] ,
						answer_correct     : "" ,
						group_id           : 0 ,
						media              : null ,
						part               : 0 ,
						level              : null ,
						question_number    : 0 ,
						code               : "" ,
						config             : { cols : 1 , invertedAnswer : true } ,
						children           : []
					}
				]
			};
		} ,
		input         : ( info : CreateQuestionInfo ) : Question => {
			return {
				question_direction : "" ,
				question_type      : "input" ,
				answer_option      : [] ,
				answer_correct     : "" ,
				group_id           : 0 ,
				media              : null ,
				part               : 0 ,
				question_number    : 0 ,
				code               : "" ,
				level              : null ,
				config             : {
					cols           : 1 ,
					invertedAnswer : true
				} ,
				children           : []
			};
		} ,
		"group-radio" : ( info : CreateQuestionInfo ) : Question => {
			return {
				question_direction : "" ,
				question_type      : "group-radio" ,
				answer_option      : [] ,
				answer_correct     : "" ,
				group_id           : 0 ,
				media              : null ,
				part               : 0 ,
				question_number    : 0 ,
				code               : "" ,
				level              : null ,
				config             : {
					cols           : 1 ,
					invertedAnswer : true
				} ,
				children           : [
					{
						question_direction : "" ,
						question_type      : "group-radio" ,
						answer_option      : [
							{ id : "1" , value : "Đúng" } ,
							{ id : "0" , value : "Sai" }
						] ,
						answer_correct     : "" ,
						group_id           : 0 ,
						media              : null ,
						part               : 0 ,
						level              : null ,
						question_number    : 0 ,
						code               : "" ,
						config             : { cols : 1 , invertedAnswer : true } ,
						children           : []
					} ,
					{
						question_direction : "" ,
						question_type      : "group-radio" ,
						answer_option      : [
							{ id : "1" , value : "Đúng" } ,
							{ id : "0" , value : "Sai" }
						] ,
						answer_correct     : "" ,
						group_id           : 0 ,
						media              : null ,
						part               : 0 ,
						level              : null ,
						question_number    : 0 ,
						code               : "" ,
						config             : { cols : 1 , invertedAnswer : true } ,
						children           : []
					} ,
					{
						question_direction : "" ,
						question_type      : "group-radio" ,
						answer_option      : [
							{ id : "1" , value : "Đúng" } ,
							{ id : "0" , value : "Sai" }
						] ,
						answer_correct     : "" ,
						group_id           : 0 ,
						media              : null ,
						part               : 0 ,
						level              : null ,
						question_number    : 0 ,
						code               : "" ,
						config             : { cols : 1 , invertedAnswer : true } ,
						children           : []
					} ,
					{
						question_direction : "" ,
						question_type      : "group-radio" ,
						answer_option      : [
							{ id : "1" , value : "Đúng" } ,
							{ id : "0" , value : "Sai" }
						] ,
						answer_correct     : "" ,
						group_id           : 0 ,
						media              : null ,
						part               : 0 ,
						level              : null ,
						question_number    : 0 ,
						code               : "" ,
						config             : { cols : 1 , invertedAnswer : true } ,
						children           : []
					}
				]
			};
		} ,
		checkbox      : ( info : CreateQuestionInfo ) : Question => {
			return {
				question_direction : "" ,
				question_type      : "checkbox" ,
				answer_option      : [
					{ id : "1" , value : "" } ,
					{ id : "2" , value : "" } ,
					{ id : "3" , value : "" } ,
					{ id : "4" , value : "" }
				] ,
				answer_correct     : "" ,
				group_id           : 0 ,
				media              : null ,
				part               : 0 ,
				question_number    : 0 ,
				code               : "" ,
				config             : {
					cols           : 2 ,
					invertedAnswer : true
				} ,
				level              : null ,
				children           : []
			};
		} ,
		drag_drop     : ( info : CreateQuestionInfo ) : Question => {
			return {
				question_direction : "" ,
				question_type      : "drag_drop" ,
				answer_option      : [] ,
				answer_correct     : "" ,
				group_id           : 0 ,
				media              : null ,
				part               : 0 ,
				question_number    : 0 ,
				code               : "" ,
				level              : null ,
				config             : {
					cols           : 1 ,
					invertedAnswer : true
				} ,
				children           : []
			};
		} ,
		radio         : ( info : CreateQuestionInfo ) : Question => {
			return {
				question_direction : "" ,
				question_type      : "radio" ,
				answer_option      : [
					{ id : "1" , value : "" } ,
					{ id : "2" , value : "" } ,
					{ id : "3" , value : "" } ,
					{ id : "4" , value : "" }
				] ,
				answer_correct     : "" ,
				group_id           : 0 ,
				media              : null ,
				part               : 0 ,
				question_number    : 0 ,
				code               : "" ,
				level              : null ,
				config             : {
					cols           : 2 ,
					invertedAnswer : true
				} ,
				children           : []
			};
		} ,
		grouping      : ( info : CreateQuestionInfo ) : Question => {
			return {
				question_direction : "" ,
				question_type      : "grouping" ,
				answer_option      : [] ,
				answer_correct     : "" ,
				group_id           : 0 ,
				media              : null ,
				part               : 0 ,
				question_number    : 0 ,
				code               : "" ,
				level              : null ,
				config             : {
					cols           : 1 ,
					invertedAnswer : true
				} ,
				children           : []
			};
		} ,
		inputbox      : ( info : CreateQuestionInfo ) : Question => {
			return {
				question_direction : "" ,
				question_type      : "inputbox" ,
				answer_option      : [] ,
				answer_correct     : "" ,
				group_id           : 0 ,
				media              : null ,
				part               : 0 ,
				question_number    : 0 ,
				code               : "" ,
				level              : null ,
				config             : {
					cols           : 1 ,
					invertedAnswer : true
				} ,
				children           : []
			};
		} ,
		reorder_words : ( info : CreateQuestionInfo ) : Question => {
			return {
				question_direction : "" ,
				question_type      : "reorder_words" ,
				answer_option      : [] ,
				answer_correct     : "" ,
				group_id           : 0 ,
				media              : null ,
				part               : 0 ,
				question_number    : 0 ,
				code               : "" ,
				level              : null ,
				config             : {
					cols           : 1 ,
					invertedAnswer : true
				} ,
				children           : []
			};
		} ,
		group         : ( info : CreateQuestionInfo ) : Question => {
			return {
				question_direction : "" ,
				question_type      : "group" ,
				answer_option      : [] ,
				answer_correct     : "" ,
				group_id           : 0 ,
				media              : null ,
				part               : 0 ,
				question_number    : 0 ,
				code               : "" ,
				level              : null ,
				config             : {
					cols           : 2 ,
					invertedAnswer : true
				} ,
				children           : []
			};
		} ,
		// 'selectbox'     : ( info : CreateQuestionInfo ) : Question => {
		// 	return {
		// 		question_direction : '' ,
		// 		question_type      : 'selectbox' ,
		// 		answer_option      : [] ,
		// 		answer_correct     : '' ,
		// 		group_id           : 0 ,
		// 		media              : null ,
		// 		part               : 0 ,
		// 		cdr                : cdrName2Id( info.cdrName ) ,
		// 		question_number    : 0 ,
		// 		code               : '' ,
		// 		config             : {
		// 			cols           : 1 ,
		// 			invertedAnswer : false
		// 		} ,
		// 		children           : []
		// 	};
		// } ,
		matching : () : Question => {
			return null;
		}
	};

	private allQuestionType : SelectOptions<IctuQuestionType>[] = [
		{
			value   : "group-input" ,
			label   : "[group-input] - Nhóm câu hỏi nhập đáp án" ,
			disable : false
		} ,
		{
			value   : "group-radio" ,
			label   : "[group-radio] - Nhóm câu hỏi chọn đáp án Đúng - Sai" ,
			disable : false
		} ,
		{
			value   : "checkbox" ,
			label   : "[check-box] - Chọn nhiều đáp án đúng" ,
			disable : false
		} ,
		{
			value : "drag_drop" ,
			// label: "[drag-drop] - Câu hỏi nhóm kéo thả đáp án đúng",
			label   : "[drag-drop] - Câu hỏi ghép hợp" ,
			disable : false
		} ,
		{ value : "radio" , label : "[radio] - Chọn 1 đáp án đúng" , disable : false } ,
		{
			value   : "grouping" ,
			label   : "[grouping] - Câu hỏi kéo thả đáp án vào cột tương ứng" ,
			disable : false
		} ,
		{
			value   : "inputbox" ,
			label   : "[input-box] - Nhập vào đáp án đúng" ,
			disable : false
		} ,
		{
			value   : "reorder_words" ,
			label   : "[reorder-words] - Sắp xếp lại câu theo thứ tự đúng" ,
			disable : false
		} ,
		// { value : 'selectbox' , label : '[select-box] - Select box' , disable : false } ,
		{ value : "matching" , label : "[matching] - Matching 2 vế" , disable : true } ,
		{ value : "group" , label : "[group] - Câu hỏi MCQs dạng nhóm" , disable : false } ,
		{
			value : "input" ,
			// label: "[input] - Câu hỏi nhập đáp án",
			label   : "[input] - Câu hỏi trả lời ngắn/ viết luận" ,
			disable : false
		}
	];

	private filterQuestionType : Record<TestFormat , IctuQuestionType[]> = {
		monkhac  : [
			// "grouping",
			"drag_drop" ,
			"radio" ,
			// "checkbox",
			"group-radio" ,
			// "group-input",
			"group" ,
			"input"
		] ,
		tienganh : [ "inputbox" , "drag_drop" , "reorder_words" , "radio" , "matching" ]
	};

	// testType : TestFormat;
	testTypeOptions : SelectOptions<TestFormat>[] = [
		{ value : "tienganh" , label : "Môn tiếng anh" , disable : false } ,
		{ value : "monkhac" , label : "Môn khác" , disable : false }
	];

	question : Question;

	questionAnswer : string; // used when question not have children question and only have question and answer

	questionTypeSection : QuestionTypeSection = {
		options     : [] ,
		active      : null ,
		placeholder : "--Vui lòng chọn đinh dạng bài kiểm tra--"
	};

	guideMessages : string = "Vui lòng chọn đinh dạng bài kiểm tra";

	private validator : CreateEditQuestionValidatorControl = {
		monkhac  : {
			inputbox      : () : CreateEditQuestionErrorName => {
				if ( ! this._validateQuestionDirection() ) {
					return "direction_of_child_question_empty";
				}
				if ( ! this.question.children.length ) {
					this.notificationService.toastInfo( "Vui lòng thêm các câu hỏi" );
					return "the_answer_options_are_empty";
				}

				const allChildrenHaveCorrectAnswer : boolean =
					      this.question.children.reduce(
						      ( reducer : boolean , o ) : boolean => reducer && !! o.answer_correct ,
						      true
					      );
				if ( allChildrenHaveCorrectAnswer ) {
					return null;
				}
				if ( ! this.question.level || this.question.level === 0 ) {
					this.notificationService.toastInfo( "Vui lòng chọn dạng vận dụng" );
					return "the_level_the_question_is_empty";
				}
				else {
					this.notificationService.toastInfo(
						"Vui lòng nhập đầy đủ thông tin của các phương án trả lời"
					);
					return "the_correct_answer_of_the_child_question_is_empty";
				}
			} ,
			radio         : () : CreateEditQuestionErrorName => {
				if ( ! this._validateQuestionDirection() ) {
					return "direction_of_child_question_empty";
				}

				if ( ! this.question.answer_option.length ) {
					this.notificationService.toastInfo(
						"Vui nhập các phương án trả lời cho câu hỏi"
					);
					return "the_answer_options_are_empty";
				}

				if ( !! this.question.answer_correct ) {
					const allAnswerOptionHaveValue : boolean =
						      this.question.answer_option.reduce(
							      ( reducer : boolean , o ) : boolean => reducer && !! o.value ,
							      true
						      );
					if ( allAnswerOptionHaveValue ) {
						return null;
					}
					else {
						this.notificationService.toastInfo(
							"Vui lòng nhập đầy đủ thông tin của các phương án trả lời"
						);
						return "the_correct_answer_of_the_child_question_is_empty";
					}
				}
				if ( ! this.question.level || this.question.level === 0 ) {
					this.notificationService.toastInfo( "Vui lòng chọn dạng vận dụng" );
					return "the_level_the_question_is_empty";
				}
				else {
					this.notificationService.toastInfo(
						"Vui lòng chọn phương án trả lời đúng"
					);
					return "the_correct_answer_is_empty";
				}
			} ,
			reorder_words : () : CreateEditQuestionErrorName => {
				if ( ! this._validateQuestionDirection() ) {
					return "direction_of_child_question_empty";
				}
				const allAnswerOptionHaveValue : boolean =
					      this.question.answer_option.reduce(
						      ( reducer : boolean , o ) : boolean => reducer && !! o.value ,
						      true
					      );
				if ( allAnswerOptionHaveValue ) {
					return null;
				}
				if ( ! this.question.level || this.question.level === 0 ) {
					this.notificationService.toastInfo( "Vui lòng chọn dạng vận dụng" );
					return "the_level_the_question_is_empty";
				}
				else {
					this.notificationService.toastInfo(
						"Vui lòng nhập đầy đủ thông tin của các phương án trả lời"
					);
					return "the_correct_answer_of_the_child_question_is_empty";
				}
			} ,
			grouping      : () : CreateEditQuestionErrorName => {
				if ( ! this._validateQuestionDirection() ) {
					return "direction_of_child_question_empty";
				}
				if ( ! this.question.children.length ) {
					this.notificationService.toastInfo( "Vui lòng nhập câu hỏi phụ" );
					return "the_child_question_empty";
				}
				const _initReducer : {
					noDirectionsEmpty : boolean;
					noCorrectAnswersEmpty : boolean;
				} = {
					noDirectionsEmpty     : true ,
					noCorrectAnswersEmpty : true
				};
				const allQuestionChild : {
					noDirectionsEmpty : boolean;
					noCorrectAnswersEmpty : boolean;
				} = this.question.children.reduce(
					(
						reducer : {
							noDirectionsEmpty : boolean;
							noCorrectAnswersEmpty : boolean;
						} ,
						o
					) : { noDirectionsEmpty : boolean; noCorrectAnswersEmpty : boolean } => {
						reducer.noDirectionsEmpty     =
							reducer.noDirectionsEmpty && !! o.question_direction;
						reducer.noCorrectAnswersEmpty =
							reducer.noCorrectAnswersEmpty && !! o.answer_correct;
						return reducer;
					} ,
					_initReducer
				);
				if ( ! allQuestionChild.noDirectionsEmpty ) {
					this.notificationService.toastInfo(
						"Vui lòng nhập nội dung câu hỏi cho câu hỏi phụ"
					);
					return "the_direction_of_the_question_is_empty";
				}
				if ( ! allQuestionChild.noCorrectAnswersEmpty ) {
					this.notificationService.toastInfo(
						"Vui lòng nhập đầy đủ đáp án đúng cho các câu hỏi phụ"
					);
					return "the_correct_answer_of_the_child_question_is_empty";
				}
				if ( ! this.question.level || this.question.level === 0 ) {
					this.notificationService.toastInfo( "Vui lòng chọn dạng vận dụng" );
					return "the_level_the_question_is_empty";
				}
				return null;
			} ,
			drag_drop     : () : CreateEditQuestionErrorName => {
				// tiêu đề câu hỏi được phép bỏ trống
				// if (!this._validateQuestionDirection()) {
				//   return "direction_of_child_question_empty";
				// }
				if ( ! this.question.children.length ) {
					this.notificationService.toastInfo( "Vui lòng nhập câu hỏi phụ" );
					return "the_child_question_empty";
				}
				const _initReducer : {
					noDirectionsEmpty : boolean;
					noCorrectAnswersEmpty : boolean;
				} = {
					noDirectionsEmpty     : true ,
					noCorrectAnswersEmpty : true
				};
				const allQuestionChild : {
					noDirectionsEmpty : boolean;
					noCorrectAnswersEmpty : boolean;
				} = this.question.children.reduce(
					(
						reducer : {
							noDirectionsEmpty : boolean;
							noCorrectAnswersEmpty : boolean;
						} ,
						o
					) : { noDirectionsEmpty : boolean; noCorrectAnswersEmpty : boolean } => {
						reducer.noDirectionsEmpty     =
							reducer.noDirectionsEmpty && !! o.question_direction;
						reducer.noCorrectAnswersEmpty =
							reducer.noCorrectAnswersEmpty && !! o.answer_correct;
						return reducer;
					} ,
					_initReducer
				);
				if ( ! allQuestionChild.noDirectionsEmpty ) {
					this.notificationService.toastInfo(
						"Vui lòng nhập nội dung câu hỏi cho câu hỏi phụ"
					);
					return "the_direction_of_the_question_is_empty";
				}
				if ( ! allQuestionChild.noCorrectAnswersEmpty ) {
					this.notificationService.toastInfo(
						"Vui lòng nhập đầy đủ đáp án đúng cho các câu hỏi phụ"
					);
					return "the_correct_answer_of_the_child_question_is_empty";
				}
				if ( ! this.question.level || this.question.level === 0 ) {
					this.notificationService.toastInfo( "Vui lòng chọn dạng vận dụng" );
					return "the_level_the_question_is_empty";
				}
				return null;
			} ,
			checkbox      : () : CreateEditQuestionErrorName => {
				if ( ! this._validateQuestionDirection() ) {
					return "direction_of_child_question_empty";
				}
				if ( ! this.question.answer_option.length ) {
					this.notificationService.toastInfo(
						"Vui nhập các phương án trả lời cho câu hỏi"
					);
					return "the_answer_options_are_empty";
				}
				if ( !! this.question.answer_correct ) {
					const allAnswerOptionHaveValue : boolean =
						      this.question.answer_option.reduce(
							      ( reducer : boolean , o ) : boolean => reducer && !! o.value ,
							      true
						      );
					if ( allAnswerOptionHaveValue ) {
						return null;
					}
					else {
						this.notificationService.toastInfo(
							"Vui lòng nhập đầy đủ thông tin của các phương án trả lời"
						);
						return "the_correct_answer_of_the_child_question_is_empty";
					}
				}
				if ( ! this.question.level || this.question.level === 0 ) {
					this.notificationService.toastInfo( "Vui lòng chọn dạng vận dụng" );
					return "the_level_the_question_is_empty";
				}
				else {
					this.notificationService.toastInfo(
						"Vui lòng chọn phương án trả lời đúng"
					);
					return "the_correct_answer_is_empty";
				}
			} ,
			"group-radio" : () : CreateEditQuestionErrorName => {
				if ( ! this._validateQuestionDirection() ) {
					return "direction_of_child_question_empty";
				}
				if ( ! this.question.children.length ) {
					this.notificationService.toastInfo( "Vui lòng nhập câu hỏi phụ" );
					return "the_child_question_empty";
				}
				const _initReducer : {
					noDirectionsEmpty : boolean;
					noCorrectAnswersEmpty : boolean;
				} = {
					noDirectionsEmpty     : true ,
					noCorrectAnswersEmpty : true
				};
				const allQuestionChild : {
					noDirectionsEmpty : boolean;
					noCorrectAnswersEmpty : boolean;
				} = this.question.children.reduce(
					(
						reducer : {
							noDirectionsEmpty : boolean;
							noCorrectAnswersEmpty : boolean;
						} ,
						o
					) : { noDirectionsEmpty : boolean; noCorrectAnswersEmpty : boolean } => {
						reducer.noDirectionsEmpty     =
							reducer.noDirectionsEmpty && !! o.question_direction;
						reducer.noCorrectAnswersEmpty =
							reducer.noCorrectAnswersEmpty && !! o.answer_correct;
						return reducer;
					} ,
					_initReducer
				);

				if ( ! allQuestionChild.noDirectionsEmpty ) {
					this.notificationService.toastInfo(
						"Vui lòng nhập nội dung câu hỏi cho câu hỏi phụ"
					);
					return "the_direction_of_the_question_is_empty";
				}
				if ( ! allQuestionChild.noCorrectAnswersEmpty ) {
					this.notificationService.toastInfo(
						"Vui lòng nhập đầy đủ đáp án đúng cho các câu hỏi phụ"
					);
					return "the_correct_answer_of_the_child_question_is_empty";
				}
				if ( ! this.question.level || this.question.level === 0 ) {
					this.notificationService.toastInfo( "Vui lòng chọn dạng vận dụng" );
					return "the_level_the_question_is_empty";
				}
				return null;
			} ,
			"group-input" : () : CreateEditQuestionErrorName => {
				if ( ! this._validateQuestionDirection() ) {
					return "direction_of_child_question_empty";
				}
				if ( ! this.question.children.length ) {
					this.notificationService.toastInfo( "Vui lòng nhập câu hỏi phụ" );
					return "the_child_question_empty";
				}
				const _initReducer : {
					noDirectionsEmpty : boolean;
					noCorrectAnswersEmpty : boolean;
				} = {
					noDirectionsEmpty     : true ,
					noCorrectAnswersEmpty : true
				};
				const allQuestionChild : {
					noDirectionsEmpty : boolean;
					noCorrectAnswersEmpty : boolean;
				} = this.question.children.reduce(
					(
						reducer : {
							noDirectionsEmpty : boolean;
							noCorrectAnswersEmpty : boolean;
						} ,
						o
					) : { noDirectionsEmpty : boolean; noCorrectAnswersEmpty : boolean } => {
						reducer.noDirectionsEmpty     =
							reducer.noDirectionsEmpty && !! o.question_direction;
						reducer.noCorrectAnswersEmpty =
							reducer.noCorrectAnswersEmpty && !! o.answer_correct;
						return reducer;
					} ,
					_initReducer
				);
				if ( ! allQuestionChild.noDirectionsEmpty ) {
					this.notificationService.toastInfo(
						"Vui lòng nhập nội dung câu hỏi cho câu hỏi phụ"
					);
					return "the_direction_of_the_question_is_empty";
				}
				if ( ! allQuestionChild.noCorrectAnswersEmpty ) {
					this.notificationService.toastInfo(
						"Vui lòng nhập đầy đủ đáp án đúng cho các câu hỏi phụ"
					);
					return "the_correct_answer_of_the_child_question_is_empty";
				}
				if ( ! this.question.level || this.question.level === 0 ) {
					this.notificationService.toastInfo( "Vui lòng chọn dạng vận dụng" );
					return "the_level_the_question_is_empty";
				}
				return null;
			} ,
			input         : () : CreateEditQuestionErrorName => {
				if ( ! this._validateQuestionDirection() ) {
					return "direction_of_child_question_empty";
				}

				return null;
			} ,
			group         : () : CreateEditQuestionErrorName => {

				// if (this.question.children.length > 0) {
				//   for (let index = 0; index < this.question.children.length; index++) {
				//     let error: CreateEditQuestionErrorName =
				//       this.validator[this.testFormat][
				//         this.question.children[index].question_type
				//       ]();

				//     if (error) return error;
				//   }
				// }
				// if (!error) {}

				return null;
			} ,
			matching      : () : CreateEditQuestionErrorName => {
				return null;
			}
		} ,
		tienganh : {
			inputbox      : () : CreateEditQuestionErrorName => {
				if ( ! this._validateQuestionDirection() ) {
					return "direction_of_child_question_empty";
				}
				if ( ! this.question.children.length ) {
					this.notificationService.toastInfo( "Vui lòng thêm các câu hỏi" );
					return "the_answer_options_are_empty";
				}
				const noCorrectAnswersEmpty : boolean = this.question.children.reduce(
					( reducer : boolean , o ) : boolean => reducer && !! o.answer_correct ,
					true
				);
				if ( ! noCorrectAnswersEmpty ) {
					this.notificationService.toastInfo(
						"Vui lòng nhập đầy đủ đáp án đúng cho các câu hỏi phụ"
					);
					return "the_correct_answer_of_the_child_question_is_empty";
				}
				return null;
			} ,
			radio         : () : CreateEditQuestionErrorName => {
				if ( ! this._validateQuestionDirection() ) {
					return "direction_of_child_question_empty";
				}
				if ( ! this.question.children.length ) {
					this.notificationService.toastInfo( "Vui lòng nhập câu hỏi phụ" );
					return "the_child_question_empty";
				}
				const _initReducer : {
					noDirectionsEmpty : boolean;
					noCorrectAnswersEmpty : boolean;
					noAnswersOptionsEmpty : boolean;
				} = {
					noDirectionsEmpty     : true ,
					noAnswersOptionsEmpty : true ,
					noCorrectAnswersEmpty : true
				};
				const allQuestionChild : {
					noDirectionsEmpty : boolean;
					noCorrectAnswersEmpty : boolean;
					noAnswersOptionsEmpty : boolean;
				} = this.question.children.reduce(
					(
						reducer : {
							noDirectionsEmpty : boolean;
							noCorrectAnswersEmpty : boolean;
							noAnswersOptionsEmpty : boolean;
						} ,
						o
					) : {
						noDirectionsEmpty : boolean;
						noCorrectAnswersEmpty : boolean;
						noAnswersOptionsEmpty : boolean;
					} => {
						reducer.noDirectionsEmpty     =
							reducer.noDirectionsEmpty && !! o.question_direction;
						reducer.noCorrectAnswersEmpty =
							reducer.noCorrectAnswersEmpty && !! o.answer_correct;
						reducer.noAnswersOptionsEmpty =
							reducer.noAnswersOptionsEmpty &&
							!! o.answer_option.length &&
							o.answer_option.reduce(
								( r2 : boolean , i2 ) : boolean => r2 && !! i2.value ,
								true
							);
						return reducer;
					} ,
					_initReducer
				);

				if ( ! allQuestionChild.noDirectionsEmpty ) {
					this.notificationService.toastInfo(
						"Vui lòng nhập nội dung câu hỏi cho câu hỏi phụ"
					);
					return "the_direction_of_the_question_is_empty";
				}
				if ( ! allQuestionChild.noAnswersOptionsEmpty ) {
					this.notificationService.toastInfo(
						"Vui lòng nhập đầy đủ nội dung các phương án trả lời cho câu hỏi phụ"
					);
					return "the_answer_of_the_child_question_is_empty";
				}
				if ( ! allQuestionChild.noCorrectAnswersEmpty ) {
					this.notificationService.toastInfo(
						"Vui lòng nhập đầy đủ đáp án đúng cho các câu hỏi phụ"
					);
					return "the_correct_answer_of_the_child_question_is_empty";
				}
				return null;
			} ,
			reorder_words : () : CreateEditQuestionErrorName => {
				if ( ! this._validateQuestionDirection() ) {
					return "direction_of_child_question_empty";
				}
				if ( ! this.question.children.length ) {
					this.notificationService.toastInfo( "Vui lòng nhập câu hỏi phụ" );
					return "the_child_question_empty";
				}
				const noCorrectAnswersEmpty : boolean = this.question.children.reduce(
					( reducer : boolean , o ) : boolean => reducer && !! o.answer_correct ,
					true
				);
				if ( ! noCorrectAnswersEmpty ) {
					this.notificationService.toastInfo(
						"Vui lòng nhập đầy đủ đáp án đúng cho các câu hỏi phụ"
					);
					return "the_correct_answer_of_the_child_question_is_empty";
				}
				return null;
			} ,
			grouping      : () : CreateEditQuestionErrorName => {
				if ( ! this._validateQuestionDirection() ) {
					return "direction_of_child_question_empty";
				}
				return null;
			} ,
			drag_drop     : () : CreateEditQuestionErrorName => {
				if ( ! this._validateQuestionDirection() ) {
					return "direction_of_child_question_empty";
				}
				if ( ! this.question.children.length ) {
					this.notificationService.toastInfo( "Vui lòng nhập câu hỏi phụ" );
					return "the_child_question_empty";
				}
				const _initReducer : {
					noDirectionsEmpty : boolean;
					noCorrectAnswersEmpty : boolean;
				} = {
					noDirectionsEmpty     : true ,
					noCorrectAnswersEmpty : true
				};
				const allQuestionChild : {
					noDirectionsEmpty : boolean;
					noCorrectAnswersEmpty : boolean;
				} = this.question.children.reduce(
					(
						reducer : {
							noDirectionsEmpty : boolean;
							noCorrectAnswersEmpty : boolean;
						} ,
						o
					) : { noDirectionsEmpty : boolean; noCorrectAnswersEmpty : boolean } => {
						reducer.noDirectionsEmpty     =
							reducer.noDirectionsEmpty && !! o.question_direction;
						reducer.noCorrectAnswersEmpty =
							reducer.noCorrectAnswersEmpty && !! o.answer_correct;
						return reducer;
					} ,
					_initReducer
				);
				if ( ! allQuestionChild.noDirectionsEmpty ) {
					this.notificationService.toastInfo(
						"Vui lòng nhập nội dung câu hỏi cho câu hỏi phụ"
					);
					return "the_direction_of_the_question_is_empty";
				}
				if ( ! allQuestionChild.noCorrectAnswersEmpty ) {
					this.notificationService.toastInfo(
						"Vui lòng nhập đầy đủ đáp án đúng cho các câu hỏi phụ"
					);
					return "the_correct_answer_of_the_child_question_is_empty";
				}
				return null;
			} ,
			checkbox      : () : CreateEditQuestionErrorName => {
				if ( ! this._validateQuestionDirection() ) {
					return "direction_of_child_question_empty";
				}
				return null;
			} ,
			"group-radio" : () : CreateEditQuestionErrorName => {
				if ( ! this._validateQuestionDirection() ) {
					return "direction_of_child_question_empty";
				}
				return null;
			} ,
			"group-input" : () : CreateEditQuestionErrorName => {
				if ( ! this._validateQuestionDirection() ) {
					return "direction_of_child_question_empty";
				}
				return null;
			} ,
			input         : () : CreateEditQuestionErrorName => {
				if ( ! this._validateQuestionDirection() ) {
					return "direction_of_child_question_empty";
				}

				return null;
			} ,
			group         : () : CreateEditQuestionErrorName => {
				return null;
			} ,
			matching      : () : CreateEditQuestionErrorName => {
				return null;
			}
		}
	};

	availableToSave : boolean = false;

	ckEditor : any;


	menusInputType : MenuItem[] = [
		{
			label : 'Text' ,
			// icon: 'pi pi-home',
			command : () => {
				this.menuActiveItem            = this.menusInputType[ 0 ]
				this.question.config.typeInput = 'text';
			}
		} ,
		{
			label : 'Editor' ,
			// icon: 'pi pi-home',
			command : () => {
				this.menuActiveItem            = this.menusInputType[ 1 ]
				this.question.config.typeInput = 'editor';

			}
		} ,

		{
			label : 'Ảnh' ,
			// icon: 'pi pi-home',
			command  : () => {
				this.menuActiveItem            = this.menusInputType[ 2 ]
				this.question.config.typeInput = 'image';

			} ,
			disabled : true
		}
	];

	menuActiveItem : MenuItem = this.menusInputType[ 0 ];

	constructor (
		private auth : AuthService ,
		private fb : FormBuilder ,
		private notificationService : NotificationService ,
		private bankQuestionService : TnBankQuestionService ,
		private openFileManagerService : OpenFileManagerService ,
		private cdr : ChangeDetectorRef
	) {
		this.form = this.fb.group( {
			bank_id            : [ 0 , [ Validators.required ] ] ,
			answer_correct     : [ "" , [ Validators.required ] ] ,
			question_number    : [ 0 ] ,
			question_direction : [ "" , [ Validators.required ] ] ,
			question_type      : [ "" , [ Validators.required ] ] ,
			level              : [ null , [ Validators.required ] ] ,
			answer_option      : [ null ] ,
			group_id           : [ 0 ] ,
			part               : [ 0 ] ,
			skill              : [ "" ] ,
			media              : [ null ] ,
			code               : [ "" ] ,
			config             : [ null ] ,
			shuff              : [ "" ]
		} );
	}

	ngOnDestroy () : void {

	}

	ngOnChanges ( changes : SimpleChanges ) : void {
		if ( changes[ "update" ] || changes[ "triggerFromParent" ] ) {

			if ( this.update ) {
				this.info = this.update;

				// this.fillForm( info );
				// this.level = cdrName2Label( info.cdrName );
				if ( this.update.question ) {
					// if(this.update.question.config.typeInput = 'text'){

					// }
					if ( this.update.question.config.typeInput == 'editor' ) this.menuActiveItem = this.menusInputType[ 1 ]
					else if ( this.update.question.config.typeInput == 'image' ) this.menuActiveItem = this.menusInputType[ 2 ];
					else this.menuActiveItem = this.menusInputType[ 0 ];

					this.question = this.update.question as any;

					this.formMode = "update";
					this.form.reset( {
						level              : this.update.question.level ,
						bank_id            : this.update.question.bank_id ,
						answer_correct     : this.update.question.answer_correct ,
						question_number    : this.update.question.question_number ,
						question_direction : this.update.question.question_direction ,
						question_type      : this.update.question.question_type ,
						answer_option      : this.update.question.answer_option ,
						group_id           : this.update.question.group_id ,
						part               : this.update.question.part ,
						skill              : this.update.question[ "skill" ] ,
						media              : this.update.question.media ,
						code               : this.update.question.code ,
						config             : this.update.question.config ,
						shuff              : this.update.question[ "shuff" ]
					} );


					if ( this.info.question.question_type == "input" ) {
						this.questionAnswer = this.update.question[ "answer" ];
					}
					this.loading = false;
				}
			}
		}
	}

	ngOnInit () : void {

		if ( this.typeForm == "add" ) {
			this.f[ "question_type" ].valueChanges.pipe( filter( ( value ) => !! value ) ).subscribe( ( type : IctuQuestionType ) => {

				this.f[ "question_direction" ].setValue( "" );
				this.question = this.resetQuestion[ type ]( this.info );

				if ( this.ckEditor ) {
					this.ckEditor.data.set( "" );
				}
			} );
		}
		this.f[ "question_direction" ].valueChanges.subscribe( ( text : string ) => {


			if ( this.question.question_type !== 'drag_drop' ) {

				this.availableToSave = !! text;
			}
			else {

				this.availableToSave = true;
			}
		} );
		// this.f['level'].valueChanges.subscribe((lv:number)=>{
		//   this.question.level = lv;
		// })
	}

	private _validateQuestionDirection () : boolean {
		const notEmpty : boolean = !! this.f[ "question_direction" ].value;
		if ( ! notEmpty ) {
			this.notificationService.toastInfo( "Vui lòng nhập nội dung câu hỏi" );
		}
		return notEmpty;
	}

	ckEditorSetup ( ckEditor : any ) : void {

		this.ckEditor = ckEditor;
	}

	private fillForm (
		info : CreateQuestionInfo ,
		defaultQuestionType : string = ""
	) : void {
		const resetInfo = {
			bank_id            : info.question.bank_id ,
			answer_correct     : "" ,
			question_number    : 0 ,
			question_direction : "" ,
			question_type      : defaultQuestionType ,
			answer_option      : null ,
			level              : null ,
			group_id           : 0 ,
			part               : 0 ,
			skill              : "" ,
			media              : null ,
			code               : "" ,
			config             : null ,
			shuff              : ""
		};
		this.form.reset( resetInfo );
		this.loading = false;
	}

	get f () : { [ key : string ] : AbstractControl<any> } {
		return this.form.controls;
	}

	changesTestType () : void {
		this.questionTypeSection.active      = null;
		this.questionTypeSection.options     = this.getAcceptQuestionType(
			this.testFormat
		);
		this.questionTypeSection.placeholder = "--Chọn loại câu hỏi--";
		this.f[ "question_type" ].setValue( "" );
		this.guideMessages = "Chọn loại câu hỏi";
		this.f[ "level" ].setValue( null );
	}

	private getAcceptQuestionType (
		testType : TestFormat
	) : SelectOptions<IctuQuestionType>[] {
		const questionTypeAccepted : IctuQuestionType[] = testType
		                                                  ? this.filterQuestionType[ testType ]
		                                                  : [];
		return this.allQuestionType.filter(
			( option : SelectOptions<IctuQuestionType> ) : boolean =>
				questionTypeAccepted.includes( option.value )
		);
	}

	changesQuestionType () : void {

		this.f[ "question_type" ].setValue( this.questionTypeSection.active );

		if ( this.questionTypeSection.active == 'drag_drop' ) {

			this.availableToSave = false;

		}
		if ( this.f[ "question_type" ].value ) {
			this.f[ "question_direction" ].setValue( "" );
			this.question = this.resetQuestion[ this.f[ "question_type" ].value ](
				this.info
			);
		}
	}

	changesVandungType () : void {
		this.f[ "level" ].setValue( this.vandungTypeSelect );
		if ( this.question ) {
			this.question.level = this.vandungTypeSelect;
		}
		this.parent_vandung_type = this.vandungTypeSelect;
	}

	private _uploadSingleQuestion (
		question : Question ,
		send : boolean = false
	) : Observable<number> {

		if ( ! question[ 'id' ] ) {

		}

		// Kiểm tra và cập nhật trạng thái của câu hỏi nếu cần
		if ( send === true ) {
			question[ "status" ] = question[ "status" ] === -1 ? -2 : question[ "status" ];
		}

		// Thực hiện thêm hoặc sửa câu hỏi
		let res : Observable<number>;

		if ( question[ "id" ] ) {
			res = this.updateQuestion( question ).pipe(
				tap( () => {
					// Emit dữ liệu khi sửa câu hỏi
					// this.emitCloseForm.emit("");

					setTimeout( () => {
						this.vandungTypeSelect = null;

					} , 500 );
				} )
			);
		}
		else {
			res = this.bankQuestionService.addTnBankQuestion( this.filterNecessaryFieldsForUpdate( question ) ).pipe(
				tap( () => {
					// Emit dữ liệu khi thêm câu hỏi

					// this.emitCloseForm.emit("");
					setTimeout( () => {
						this.vandungTypeSelect = null;
					} , 500 );
				} ) ,
				map( ( res ) => {
					return parseInt( res , 10 ); // Trả về ID như một số nguyên
				} )
			);
		}

		return res;
	}

	updateQuestion ( question : Question ) : Observable<number> {

		return this.bankQuestionService.updateTnBankQuestion(
			question[ "id" ] ,
			this.filterNecessaryFieldsForUpdate( question )
		).pipe(
			tap( ( id ) => {
				// Thực hiện logic ở đây chỉ khi là update
				// Có thể thêm logic khác tại đây nếu cần
			} ) ,
			map( ( id : string ) => parseInt( id , 10 ) ) // Trả về ID như một số nguyên
		);
	}

	handleChildAlreadyToSave ( isReady : boolean , index : number ) {
		this.children_ready_states[ index ] = isReady; // Cập nhật trạng thái của con tại index


		// Kiểm tra nếu tất cả các con đã sẵn sàng
		const allReady = this.children_ready_states.every(
			( state ) => state === true
		);
		if ( allReady && ! this.questionIsSaved ) {
			this.questionIsSaved = true;
			this.saveQuestion();
		}
	}

	btnSaveQuestion () {

		// return;
		if ( this._typeForm == "add" ) {
			this.question[ 'isNew' ] = true;

			// check type question selected
			if ( ! this.vandungTypeSelect || ! this.question.question_type ) {
				this.notificationService.toastError( "Vui lòng chọn dạng vận dụng" );
				return;
			}

			const error : CreateEditQuestionErrorName =
				      this.validator[ this.testFormat ][ this.question.question_type ]();
			if ( error ) {
				return;
			}
			if ( this.f[ "question_type" ].value == "group" ) {
				this.parent_already_emit_change = ! this.parent_already_emit_change; // set to false to children can listener changes input and recheck child question
			}
			else {

				this.saveQuestion();
			}
		}
		else {
			this.parent_vandung_type                  = this.question.level;
			this.question[ 'isNew' ]                  = false;
			const error : CreateEditQuestionErrorName =
				      this.validator[ this.testFormat ][ this.question.question_type ]();
			if ( error ) {
				return;
			}
			this.saveQuestion();
		}
	}

	saveQuestion ( send : boolean = false ) : void {
		// if (!error) {

		// this.notificationService.isProcessing(true);
		this.question.question_direction = this.f[ "question_direction" ].value;
		this.question.level              = this.f[ "level" ].value;

		// this.question = this.f['bank_id'].value;
		this.question.bank_id = this.f[ "bank_id" ].value;
		if ( this.question.children.length > 0 ) {
			this.question.children.map( ( e ) => {
				e.level   = this.f[ "level" ].value;
				e.bank_id = this.f[ "bank_id" ].value;
				return e;
			} );
		}

		// return;

		// if(!this.parent_already_emit_change && !t) return;

		this._uploadSingleQuestion( this.question , send ).pipe(
			mergeMap( ( id : number ) : Observable<Question> => {
				this.question[ "id" ] = id;
				this.question.children.map( ( _qChild : Question ) : Question => {
					_qChild.group_id        = id;
					_qChild[ "__uploaded" ] = false;
					return _qChild;
				} );
				return of( this.question );
			} ) ,
			mergeMap( ( question : Question ) : Observable<Question> => {
				if ( question.children.length ) {
					const _observes : Observable<any>[] = question.children.filter( ( i ) => i[ "__uploaded" ] === false ).reduce( ( reducer , c ) => {
						if ( reducer.length < question.children.length / 4 ) {
							const _i : Observable<number> = this._uploadSingleQuestion( c );
							reducer.push(
								_i.pipe(
									map( ( id : number ) : any => {
										c[ "id" ]         = id;
										c[ "__uploaded" ] = true;
									} )
								)
							);
						}
						3;
						return reducer;
					} , new Array<Observable<any>>() );
					return _observes.length
					       ? forkJoin( _observes ).pipe(
							map( () => {

								return question;
							} )
						)
					       : of( question );
				}
				else {
					return of( question );
				}
			} ) ,
			mergeMap( ( question : Question ) : Observable<Question> => {
				if ( question.children.length ) {
					const _observes : Observable<any>[] = question.children.filter( ( i ) => i[ "__uploaded" ] === false ).reduce( ( reducer , c ) => {
						if ( reducer.length < question.children.length / 4 ) {
							const _i : Observable<number> = this._uploadSingleQuestion( c );
							reducer.push(
								_i.pipe(
									map( ( id : number ) : any => {
										c[ "id" ]         = id;
										c[ "__uploaded" ] = true;
									} )
								)
							);
						}
						return reducer;
					} , new Array<Observable<any>>() );
					return _observes.length
					       ? forkJoin( _observes ).pipe( map( () => question ) )
					       : of( question );
				}
				else {
					return of( question );
				}
			} ) ,
			mergeMap( ( question : Question ) : Observable<Question> => {
				if ( question.children.length ) {
					const _observes : Observable<any>[] = question.children.filter( ( i ) => i[ "__uploaded" ] === false ).reduce( ( reducer , c ) => {
						if ( reducer.length < question.children.length / 4 ) {
							const _i : Observable<number> = this._uploadSingleQuestion( c );
							reducer.push(
								_i.pipe(
									map( ( id : number ) : any => {
										c[ "id" ]         = id;
										c[ "__uploaded" ] = true;
									} )
								)
							);
						}
						return reducer;
					} , new Array<Observable<any>>() );
					return _observes.length
					       ? forkJoin( _observes ).pipe( map( () => question ) )
					       : of( question );
				}
				else {
					return of( question );
				}
			} ) ,
			mergeMap( ( question : Question ) : Observable<Question> => {
				if ( question.children.length ) {
					const _observes : Observable<any>[] = question.children.filter( ( i ) => i[ "__uploaded" ] === false ).reduce( ( reducer , c ) => {
						const _i : Observable<number> = this._uploadSingleQuestion( c );
						reducer.push(
							_i.pipe(
								map( ( id : number ) : any => {
									c[ "id" ]         = id;
									c[ "__uploaded" ] = true;
								} )
							)
						);
						return reducer;
					} , new Array<Observable<any>>() );
					return _observes.length
					       ? forkJoin( _observes ).pipe( map( () => question ) )
					       : of( question );
				}
				else {
					return of( question );
				}
			} )
		).subscribe( {
			next  : ( question : Question ) : void => {
				this.parent_id_saved = question.id;

				if ( this._typeForm === "add" ) {
					this.question               = this.resetQuestion[ question.question_type ](
						this.info
					);
					this.question.question_type = question.question_type;
					this.question.bank_id       = question.bank_id;
					this.f[ "level" ].setValue( question.level );
					this.f[ "question_direction" ].setValue( "" );
				}

				// try {
				//   const _qIndex: number = this.info.cdr.group[ cdrId2Name( question.cdr ) ].questions.findIndex( q => q.id === question[ 'id' ] );
				//   if ( -1 === _qIndex ) {
				//     this.info.cdr.group[ cdrId2Name( question.cdr ) ].questions.push( question as any );
				//     this.info.cdr.group[ cdrId2Name( question.cdr ) ].reachRequirement = this.info.cdr.group[ cdrId2Name( question.cdr ) ].questions.length === this.info.cdr.group[ cdrId2Name( question.cdr ) ].require;
				//     if ( this.info.cdr.group[ cdrId2Name( question.cdr ) ].reachRequirement ) {
				//       if ( this.formMode === 'update' ) {
				//         this.close.emit( 'list' );
				//       } else {
				//         this.notificationService.toastInfo( 'Số lượng câu hỏi phân phối theo Cdr này đã đạt tới ngưỡng yêu cầu.' );
				//         this.close.emit( null );
				//       }
				//     } else {
				//       this.fillForm( this.info, this.f[ 'question_type' ].value );
				//
				//       // this.f[ 'question_type' ].setValue( this.questionTypeSection.active );
				//
				//       // this.level = cdrName2Label( this.info.cdrName );
				//       // this.testType = null;
				//       // this.changesTestType();
				//       // this.question = null;
				//       if ( this.formMode === 'update' ) {
				//         this.close.emit( 'list' );
				//       }
				//     }
				//   } else {
				//     // this.info.cdr.group[ cdrId2Name( question.cdr ) ].questions[ _qIndex ] = question as any;
				//     if ( this.formMode === 'update' ) {
				//       this.close.emit( 'list' );
				//     } else {
				//       this.close.emit( null );
				//     }
				//   }
				//
				//   if ( this.formMode === 'update' ) {
				//     this.close.emit( 'list' );
				//   } else {
				//     this.close.emit( null );
				//   }
				// } catch ( e ) {

				// }

				// this.question = null;

				this.notificationService.isProcessing( false );


				if ( question.question_type !== 'group' || this.numberQuestionChildrenGroup.length <= 0 ) { // if !question type is group and is update. close form


					this.emitCloseForm.emit( "" );
				}
			} ,
			error : ( e ) : void => {
				this.notificationService.toastError( "Mất kết nối với máy chủ" );
				this.notificationService.isProcessing( false );
			}
		} );
	}

	private _startSaveQuestion () : void {
		// handle upload
		if ( ! this.question[ "uploaded" ] ) {
			if (
				! this.question[ "__upload_fail" ] ||
				this.question[ "__upload_fail" ] < 2
			) {
				// upload parent first;
				this.notificationService.isProcessing( true );
				this.question.question_direction = this.f[ "question_direction" ].value;
				this.questionUploader( this.question );
			}
		}
		else {
			// find in children
			const childIndex : any = this.question.children.findIndex(
				( c ) => ! c[ "uploaded" ] && ( ! c[ "__upload_fail" ] || c[ "__upload_fail" ] < 2 )
			);
			if ( -1 !== childIndex ) {
				this.questionUploader( this.question.children[ childIndex ] );
				// const childInfo : any                     = this.filterNecessaryFieldsForUpdate( this.question.children[ childIndex ] );
				// const childUploader$ : Observable<number> = this.question.children[ childIndex ][ 'id' ] ? this.courseQuestionsService.updateCourseQuestions( this.question.children[ childIndex ][ 'id' ] , childInfo ) : this.courseQuestionsService.addCourseQuestions( childInfo );
			}
		}
		// const uploadSuccess : boolean = this.question[ 'uploaded' ] && this.question.children.reduce();
	}

	private questionUploader ( question : Question ) : void {
		const newInfo : any                   = this.filterNecessaryFieldsForUpdate( question );
		const _upLoader$ : Observable<number> = question[ "id" ]
		                                        ? this.bankQuestionService.updateTnBankQuestion( question[ "id" ] , newInfo )
		                                        : this.bankQuestionService.addTnBankQuestion( newInfo );
		_upLoader$.pipe(
			map( ( id : number ) : void => {
				question = Object.assign( question , { id } , newInfo );
				question.children.map( ( _qChild : Question ) : Question => {
					_qChild.group_id = id;
					return _qChild;
				} );
				question[ "uploaded" ] = true;
			} )
		).subscribe( {
			next  : () : void => {
				this._startSaveQuestion();
			} ,
			error : () : void => {
				this.notificationService.toastError( "Mất kết nối với máy chủ" );
				question[ "uploaded" ] = false;
				if ( ! question[ "__upload_fail" ] ) {
					question[ "__upload_fail" ] = 1;
					/*try again*/
				}
				else {
					// increase fail counter one more times and stop;
					question[ "__upload_fail" ] += 1;
				}
				this._startSaveQuestion();
			}
		} );
	}

	private filterNecessaryFieldsForUpdate ( q : Question ) : any {
		return {
			question_direction : q.question_direction ,
			question_type      : q.question_type ,
			answer_option      : q.answer_option ,
			answer_correct     : q.answer_correct ,
			group_id           : q.group_id ,
			media              : q.media ,
			part               : q.part ,
			question_number    : q.question_number ,
			code               : q.code ,
			config             : q.config ,
			bank_id            : q.bank_id ,
			level              : q.level ,
			status             : q[ "status" ]
		};
	}

	addMoreChildQuestion () : void {
		if ( this.questionTypeSection.active ) {
			const cloneQuestion : Question = this.resetQuestion[
				this.questionTypeSection.active
				]( this.info );
			if ( cloneQuestion.question_type === "radio" ) {
				cloneQuestion.config.cols   = 2;
				cloneQuestion.answer_option = [
					{ id : "1" , value : "" } ,
					{ id : "2" , value : "" } ,
					{ id : "3" , value : "" } ,
					{ id : "4" , value : "" }
				];
			}
			this.question.children.push( cloneQuestion );
		}
		else {
			void this.notificationService.toastWarning(
				"Thông báo" ,
				"Vui lòng chọn loại câu hỏi"
			);
		}
	}

	async removeChildQuestion ( index : number ) : Promise<void> {
		try {
			if ( this.question.children[ index ][ "id" ] ) {
				const confirm : boolean = await this.notificationService.confirmDelete();
				if ( confirm ) {
					this.loading = true;
					this.bankQuestionService.deleteQuestionByIds( [ this.question.children[ index ][ "id" ] ] ).subscribe( {
						next  : () : void => {
							this.loading           = false;
							this.question.children = this.question.children.filter(
								( _ , i ) : boolean => i !== index
							);
						} ,
						error : () : void => {
							this.loading = false;
							this.notificationService.toastError( "Mất kết nối với máy chủ" );
						}
					} );
				}
			}
			else {
				this.question.children = this.question.children.filter(
					( _ , i ) : boolean => i !== index
				);
			}
		}
		catch ( e ) {}
	}

	// async btnImportQuestionMedia(): Promise<void> {
	//   try {
	//     const file: OvicFile[] = await this.openFileManagerService.openFileManagerNew( {isMultipleMode: true, ext: 'mp3', tag: 'question'} );
	//     if ( [ 'serverAws', 'serverFile' ].includes( file[ 0 ].source ) ) {
	//       this.question.media = {type: 'audio', source: file[ 0 ].source, path: file[ 0 ].id.toString( 10 ), replay: 1};
	//     }
	//   } catch ( e ) {
	//
	//   }
	// }
	validateInputMediaReplay () : void {
		if ( this.question.media?.replay ) {
			if ( typeof this.question.media.replay !== "number" ) {
				const replay : number = parseInt( this.question.media.replay , 10 );
				if ( ! Number.isNaN( replay ) ) {
					this.question.media.replay = Math.min( 10 , Math.max( 1 , replay ) );
				}
				else {
					this.question.media.replay = 1;
				}
			}
		}
	}

	loadTest () {
	}

	// custom new
	addChildQuestionTypeGroup () {
		this.numberQuestionChildrenGroup = [
			... this.numberQuestionChildrenGroup ,
			this.numberQuestionChildrenGroup.length + 1
		]; // add child
		this.children_ready_states.push( false );

	}

	updateAnswerTypeInput () : void {
		const _rawAnswerCorrect : string[] = this.questionAnswer.split( ";" ).map( ( t : string ) : string =>
			t ? formatAnswerCorrect( t ).toLowerCase() : ""
		).filter( Boolean );
		this.question.answer_correct       = _rawAnswerCorrect.length
		                                     ? "|" + _rawAnswerCorrect.join( "|" ) + "|"
		                                     : "";

	}

	changeAnswerImage () {
		this.changeAnswerMedia += 1;
	}

	// save all question, close form
	handleChildQuestionSaved ( event : any ) : void {
		this.emitCloseForm.emit( "" );
	}

	deleteQuestionChildrenGroup ( event : any , i : number ) : void {
		// Xóa phần tử tại vị trí `i` trong mảng `numberQuestionChildrenGroup`
		this.numberQuestionChildrenGroup.splice( i , 1 );

		// Đồng bộ mảng `children_ready_states` (nếu có)
		this.children_ready_states.splice( i , 1 );

		// Kiểm tra mảng sau khi xóa
	}

}



