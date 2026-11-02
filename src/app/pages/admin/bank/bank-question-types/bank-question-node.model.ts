import { EventEmitter , WritableSignal } from "@angular/core";
import { BankQuestion , BankQuestionAnswerOption , BankQuestionType } from "@model/bank-question";
import { Subject } from "rxjs";
import { SelectOptions } from "@pages/admin/bank/cap-nhat-cau-hoi/models/bank-questions";

export type BankQuestionBase = Pick<BankQuestion , 'id' | 'bank_id' | 'type' | 'content' | 'options' | 'correct_answer' | 'question_number' | 'ordering' | 'configs' | 'hint' | 'explain' | 'status' | 'group_id' | 'media' | 'scoring_guide' | 'code'>

export interface BankQuestionEditorNode extends BankQuestionBase {
	children : BankQuestionEditorNode[];
	dirty : boolean;
}

export const questionCreator : Record<BankQuestionType , ( parent? : BankQuestionEditorNode , attrs? : Partial<BankQuestionEditorNode> ) => BankQuestionEditorNode> = {
	'radio'            : ( parent? : BankQuestionEditorNode , attrs? : Partial<BankQuestionEditorNode> ) : BankQuestionEditorNode => Object.assign<BankQuestionEditorNode , Partial<BankQuestionEditorNode>>( {
		id              : 0 ,
		bank_id         : parent ? parent.bank_id : 0 ,
		type            : 'radio' ,
		content         : '' ,
		options         : [] ,
		correct_answer  : '' ,
		question_number : null ,
		ordering        : 100 ,
		configs         : {
			cols           : 2 ,
			invertedAnswer : false
		} ,
		hint            : '' ,
		explain         : '' ,
		code            : parent ? parent.code : '' ,
		status          : 1 ,
		group_id        : parent ? parent.id : 0 ,
		media           : null ,
		children        : [] ,
		dirty           : true ,
		scoring_guide   : ''
	} , attrs ) ,
	'checkbox'         : ( parent? : BankQuestionEditorNode , attrs? : Partial<BankQuestionEditorNode> ) : BankQuestionEditorNode => Object.assign<BankQuestionEditorNode , Partial<BankQuestionEditorNode>>( {
		id              : 0 ,
		bank_id         : parent ? parent.bank_id : 0 ,
		type            : 'checkbox' ,
		content         : '' ,
		options         : [] ,
		correct_answer  : '' ,
		question_number : null ,
		ordering        : 100 ,
		configs         : {
			cols           : 2 ,
			invertedAnswer : false
		} ,
		hint            : '' ,
		explain         : '' ,
		code            : parent ? parent.code : '' ,
		status          : 1 ,
		group_id        : parent ? parent.id : 0 ,
		media           : null ,
		children        : [] ,
		dirty           : true ,
		scoring_guide   : ''
	} , attrs ) ,
	'input'            : ( parent? : BankQuestionEditorNode , attrs? : Partial<BankQuestionEditorNode> ) : BankQuestionEditorNode => Object.assign<BankQuestionEditorNode , Partial<BankQuestionEditorNode>>( {
		id              : 0 ,
		bank_id         : parent ? parent.bank_id : 0 ,
		type            : 'input' ,
		content         : '' ,
		options         : [] ,
		correct_answer  : '' ,
		question_number : null ,
		ordering        : 100 ,
		configs         : {
			cols           : 1 ,
			invertedAnswer : false
		} ,
		hint            : '' ,
		explain         : '' ,
		code            : parent ? parent.code : '' ,
		status          : 1 ,
		group_id        : parent ? parent.id : 0 ,
		media           : null ,
		children        : [] ,
		dirty           : true ,
		scoring_guide   : ''
	} , attrs ) ,
	'textarea'         : ( parent? : BankQuestionEditorNode , attrs? : Partial<BankQuestionEditorNode> ) : BankQuestionEditorNode => Object.assign<BankQuestionEditorNode , Partial<BankQuestionEditorNode>>( {
		id              : 0 ,
		bank_id         : parent ? parent.bank_id : 0 ,
		type            : 'textarea' ,
		content         : '' ,
		options         : [] ,
		correct_answer  : '' ,
		question_number : null ,
		ordering        : 100 ,
		configs         : {
			cols           : 1 ,
			invertedAnswer : false
		} ,
		hint            : '' ,
		explain         : '' ,
		code            : parent ? parent.code : '' ,
		status          : 1 ,
		group_id        : parent ? parent.id : 0 ,
		media           : null ,
		children        : [] ,
		dirty           : true ,
		scoring_guide   : ''
	} , attrs ) ,
	'group-radio'      : ( parent? : BankQuestionEditorNode , attrs? : Partial<BankQuestionEditorNode> ) : BankQuestionEditorNode => Object.assign<BankQuestionEditorNode , Partial<BankQuestionEditorNode>>( {
		id              : 0 ,
		bank_id         : parent ? parent.bank_id : 0 ,
		type            : 'group-radio' ,
		content         : '' ,
		options         : [] ,
		correct_answer  : '' ,
		question_number : null ,
		ordering        : 100 ,
		configs         : {
			cols           : 2 ,
			invertedAnswer : false
		} ,
		hint            : '' ,
		explain         : '' ,
		code            : parent ? parent.code : '' ,
		status          : 1 ,
		group_id        : parent ? parent.id : 0 ,
		media           : null ,
		children        : [] ,
		dirty           : true ,
		scoring_guide   : ''
	} , attrs ) ,
	'group-input'      : ( parent? : BankQuestionEditorNode , attrs? : Partial<BankQuestionEditorNode> ) : BankQuestionEditorNode => Object.assign<BankQuestionEditorNode , Partial<BankQuestionEditorNode>>( {
		id              : 0 ,
		bank_id         : parent ? parent.bank_id : 0 ,
		type            : 'group-input' ,
		content         : '' ,
		options         : [] ,
		correct_answer  : '' ,
		question_number : null ,
		ordering        : 100 ,
		configs         : {
			cols           : 2 ,
			invertedAnswer : false
		} ,
		hint            : '' ,
		explain         : '' ,
		code            : parent ? parent.code : '' ,
		status          : 1 ,
		group_id        : parent ? parent.id : 0 ,
		media           : null ,
		children        : [] ,
		dirty           : true ,
		scoring_guide   : ''
	} , attrs ) ,
	'grouping'         : ( parent? : BankQuestionEditorNode , attrs? : Partial<BankQuestionEditorNode> ) : BankQuestionEditorNode => Object.assign<BankQuestionEditorNode , Partial<BankQuestionEditorNode>>( {
		id              : 0 ,
		bank_id         : parent ? parent.bank_id : 0 ,
		type            : 'grouping' ,
		content         : '' ,
		options         : [] ,
		correct_answer  : '' ,
		question_number : null ,
		ordering        : 100 ,
		configs         : {
			cols           : 2 ,
			invertedAnswer : false
		} ,
		hint            : '' ,
		explain         : '' ,
		code            : parent ? parent.code : '' ,
		status          : 1 ,
		group_id        : parent ? parent.id : 0 ,
		media           : null ,
		children        : [] ,
		dirty           : true ,
		scoring_guide   : ''
	} , attrs ) ,
	'drag-drop'        : ( parent? : BankQuestionEditorNode , attrs? : Partial<BankQuestionEditorNode> ) : BankQuestionEditorNode => Object.assign<BankQuestionEditorNode , Partial<BankQuestionEditorNode>>( {
		id              : 0 ,
		bank_id         : parent ? parent.bank_id : 0 ,
		type            : 'drag-drop' ,
		content         : '' ,
		options         : [] ,
		correct_answer  : '' ,
		question_number : null ,
		ordering        : 100 ,
		configs         : {
			cols           : 1 ,
			invertedAnswer : false
		} ,
		hint            : '' ,
		explain         : '' ,
		code            : parent ? parent.code : '' ,
		status          : 1 ,
		group_id        : parent ? parent.id : 0 ,
		media           : null ,
		children        : [] ,
		dirty           : true ,
		scoring_guide   : ''
	} , attrs ) ,
	'matching'         : ( parent? : BankQuestionEditorNode , attrs? : Partial<BankQuestionEditorNode> ) : BankQuestionEditorNode => Object.assign<BankQuestionEditorNode , Partial<BankQuestionEditorNode>>( {
		id              : 0 ,
		bank_id         : parent ? parent.bank_id : 0 ,
		type            : 'matching' ,
		content         : '' ,
		options         : [] ,
		correct_answer  : '' ,
		question_number : null ,
		ordering        : 100 ,
		configs         : {
			cols           : 2 ,
			invertedAnswer : false
		} ,
		hint            : '' ,
		explain         : '' ,
		code            : parent ? parent.code : '' ,
		status          : 1 ,
		group_id        : parent ? parent.id : 0 ,
		media           : null ,
		children        : [] ,
		dirty           : true ,
		scoring_guide   : ''
	} , attrs ) ,
	'fill-in-blank'    : ( parent? : BankQuestionEditorNode , attrs? : Partial<BankQuestionEditorNode> ) : BankQuestionEditorNode => Object.assign<BankQuestionEditorNode , Partial<BankQuestionEditorNode>>( {
		id              : 0 ,
		bank_id         : parent ? parent.bank_id : 0 ,
		type            : 'fill-in-blank' ,
		content         : '' ,
		options         : [] ,
		correct_answer  : '' ,
		question_number : null ,
		ordering        : 100 ,
		configs         : {
			cols           : 1 ,
			invertedAnswer : false
		} ,
		hint            : '' ,
		explain         : '' ,
		code            : parent ? parent.code : '' ,
		status          : 1 ,
		group_id        : parent ? parent.id : 0 ,
		media           : null ,
		children        : [] ,
		dirty           : true ,
		scoring_guide   : ''
	} , attrs ) ,
	'complete-word'    : ( parent? : BankQuestionEditorNode , attrs? : Partial<BankQuestionEditorNode> ) : BankQuestionEditorNode => Object.assign<BankQuestionEditorNode , Partial<BankQuestionEditorNode>>( {
		id              : 0 ,
		bank_id         : parent ? parent.bank_id : 0 ,
		type            : 'complete-word' ,
		content         : '' ,
		options         : [] ,
		correct_answer  : '' ,
		question_number : null ,
		ordering        : 100 ,
		configs         : {
			cols           : 1 ,
			invertedAnswer : false
		} ,
		hint            : '' ,
		explain         : '' ,
		code            : parent ? parent.code : '' ,
		status          : 1 ,
		group_id        : parent ? parent.id : 0 ,
		media           : null ,
		children        : [] ,
		dirty           : true ,
		scoring_guide   : ''
	} , attrs ) ,
	'arrange-words'    : ( parent? : BankQuestionEditorNode , attrs? : Partial<BankQuestionEditorNode> ) : BankQuestionEditorNode => Object.assign<BankQuestionEditorNode , Partial<BankQuestionEditorNode>>( {
		id              : 0 ,
		bank_id         : parent ? parent.bank_id : 0 ,
		type            : 'arrange-words' ,
		content         : '' ,
		options         : [] ,
		correct_answer  : '' ,
		question_number : null ,
		ordering        : 100 ,
		configs         : {
			cols           : 1 ,
			invertedAnswer : false
		} ,
		hint            : '' ,
		explain         : '' ,
		code            : parent ? parent.code : '' ,
		status          : 1 ,
		group_id        : parent ? parent.id : 0 ,
		media           : null ,
		children        : [] ,
		dirty           : true ,
		scoring_guide   : ''
	} , attrs ) ,
	'true-false'       : ( parent? : BankQuestionEditorNode , attrs? : Partial<BankQuestionEditorNode> ) : BankQuestionEditorNode => Object.assign<BankQuestionEditorNode , Partial<BankQuestionEditorNode>>( {
		id              : 0 ,
		bank_id         : parent ? parent.bank_id : 0 ,
		type            : 'true-false' ,
		content         : '' ,
		options         : [
			{ value : '1' , label : 'Đúng' } ,
			{ value : '0' , label : 'Sai' }
		] ,
		correct_answer  : '' ,
		question_number : null ,
		ordering        : 100 ,
		configs         : {
			cols           : 2 ,
			invertedAnswer : false
		} ,
		hint            : '' ,
		explain         : '' ,
		code            : parent ? parent.code : '' ,
		status          : 1 ,
		group_id        : parent ? parent.id : 0 ,
		media           : null ,
		children        : [] ,
		dirty           : true ,
		scoring_guide   : ''
	} , attrs ) ,
	'group-true-false' : ( parent? : BankQuestionEditorNode , attrs? : Partial<BankQuestionEditorNode> ) : BankQuestionEditorNode => Object.assign<BankQuestionEditorNode , Partial<BankQuestionEditorNode>>( {
		id              : 0 ,
		bank_id         : parent ? parent.bank_id : 0 ,
		type            : 'group-true-false' ,
		content         : '' ,
		options         : [] ,
		correct_answer  : '' ,
		question_number : null ,
		ordering        : 100 ,
		configs         : {
			cols           : 2 ,
			invertedAnswer : false
		} ,
		hint            : '' ,
		explain         : '' ,
		code            : parent ? parent.code : '' ,
		status          : 1 ,
		group_id        : parent ? parent.id : 0 ,
		media           : null ,
		children        : [] ,
		dirty           : true ,
		scoring_guide   : ''
	} , attrs )
}

export interface BankQuestionNodeModel {
	question : WritableSignal<BankQuestionEditorNode>
	mode : BankQuestionChildComponentMode;
	markAsDirty : EventEmitter<BankQuestionType>;
	onDestroy$ : Subject<string>
}

export type BankQuestionChildComponentMode = 'preview' | 'edit'

// export class BankQuestionChildComponent {
//
// 	// question : WritableSignal<BankQuestionEditorNode>;
// 	//
// 	// mode : BankQuestionChildComponentMode;
//
// 	// onDestroy$ : Subject<string> = new Subject();
// 	//
// 	// changes () : void {
// 	// 	this.question().dirty = true;
// 	// }
// 	//
// 	// deleteAnswer ( value : string ) : void {
// 	// 	this.question().options = this.question().options.filter( ( o : BankQuestionAnswerOption ) : boolean => o.value !== value );
// 	// 	this.changes();
// 	// }
// }

export const COLUMN_OPTIONS : SelectOptions<number>[] = [
	{ value : 1 , label : 'Hiển thị 1 phương án / dòng' , disable : false } ,
	{ value : 2 , label : 'Hiển thị 2 phương án / dòng' , disable : false } ,
	{ value : 3 , label : 'Hiển thị 3 phương án / dòng' , disable : false } ,
	{ value : 4 , label : 'Hiển thị 4 phương án / dòng' , disable : false }
];

export const maxValueInBankQuestionOptions : ( question : BankQuestionEditorNode | BankQuestion ) => number = ( question : BankQuestionEditorNode | BankQuestion ) : number => {
	return question.options.reduce( ( reducer : number , option : BankQuestionAnswerOption ) : number => ! Number.isNaN( parseInt( option.value , 10 ) ) ? Math.max( reducer , parseInt( option.value , 10 ) ) : reducer , 0 );
};
