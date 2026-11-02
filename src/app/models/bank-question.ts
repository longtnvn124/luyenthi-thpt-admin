import { IctuBaseModel } from "@model/commons";
import { IctuFile , IctuFileSource } from "@model/ictu-file";

export type BankQuestionUntyped = 'untyped';

export type BankQuestionType = 'radio' | 'checkbox' | 'input' | 'textarea' | 'group-radio' | 'group-input' | 'grouping' | 'drag-drop' | 'matching' | 'fill-in-blank' | 'complete-word' | 'arrange-words' | 'true-false' | 'group-true-false';

export interface BankQuestionAnswerOption {
	value : string,
	label : string,
}

export interface BankQuestionConfigs {
	cols : number,
	invertedAnswer : boolean,
}

export interface BankQuestionMedia extends Pick<IctuFile , 'id' | 'ext' | 'type' | 'size' | 'title' | 'name'> {
	storage : IctuFileSource
}

export interface BankQuestion extends IctuBaseModel {
	bank_id : number,
	type : BankQuestionType,
	content : string,
	options : BankQuestionAnswerOption[],
	correct_answer : string,
	question_number : number,
	ordering : number,
	configs : BankQuestionConfigs,
	scoring_guide : string,
	hint : string,
	code : EnglishPartSlug | '',
	explain : string,
	status : number,
	group_id : number,
	media : BankQuestionMedia,
}

export type EnglishPartSlug = 'part-1' | 'part-2' | 'part-3' | 'part-4';

export interface IctuMediaObject extends Pick<IctuFile , 'id'> {
	storage : IctuFileSource
}

export interface IctuQuestionAnswer extends IctuBaseModel {
	question_id : number;
	shift_register_test_id : number;
	answer : string;
	temporary : string;
	result : number;
	status : number;
}


/* <img src="assets/image/placeholder.png?storage=aws&id=1234&width=125&height=140&loading=on" alt="123" width="125" height="140" >    => image is loading. */
/* <img src="assets/image/placeholder.png?storage=aws&id=1234&width=125&height=140&loading=fail" alt="123" width="125" height="140" >  => loading fail( lost connection). */
/* <img src="assets/image/placeholder.png?storage=aws&id=1234&width=125&height=140&loading=error" alt="123" width="125" height="140" > => loading error( File not exist of removed.) */
