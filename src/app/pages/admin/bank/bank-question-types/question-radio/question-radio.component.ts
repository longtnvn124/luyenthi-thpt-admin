import { Component , EventEmitter , Input , OnDestroy , OnInit , Output , WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BankQuestionChildComponentMode , BankQuestionEditorNode , BankQuestionNodeModel , COLUMN_OPTIONS , maxValueInBankQuestionOptions } from "@pages/admin/bank/bank-question-types/bank-question-node.model";
import { Subject } from "rxjs";
import { BankQuestionAnswerOption , BankQuestionType } from "@model/bank-question";
import { ButtonModule } from "primeng/button";
import { CheckboxModule } from "primeng/checkbox";
import { DropdownModule } from "primeng/dropdown";
import { InputTextModule } from "primeng/inputtext";
import { PaginatorModule } from "primeng/paginator";
import { RippleModule } from "primeng/ripple";
import { SafeHtmlSinglePipe } from "@pages/admin/bank/cap-nhat-cau-hoi/pipes/safe-html-single.pipe";
import { SelectOptions } from "@pages/admin/bank/cap-nhat-cau-hoi/models/bank-questions";
import { IsAnswerCorrectPipe } from "@pages/admin/bank/pipes/is-answer-correct.pipe";
import { LoadMediaOnTextDirective } from "../../../../../directives/load-media-on-text.directive";
import { IctuWrapEditorComponent } from "@pages/admin/bank/cap-nhat-cau-hoi/input-question-direction/ictu-wrap-editor/ictu-wrap-editor.component";

@Component( {
	selector    : 'app-question-radio' ,
	standalone  : true ,
	imports : [ CommonModule , ButtonModule , CheckboxModule , DropdownModule , InputTextModule , PaginatorModule , RippleModule , SafeHtmlSinglePipe , IsAnswerCorrectPipe , LoadMediaOnTextDirective , IctuWrapEditorComponent ] ,
	templateUrl : './question-radio.component.html' ,
	styleUrls   : [ './question-radio.component.css' ]
} )
export class QuestionRadioComponent implements OnInit , OnDestroy , BankQuestionNodeModel {

	@Input( { required : true } ) question : WritableSignal<BankQuestionEditorNode>;

	@Input( { required : true } ) mode : BankQuestionChildComponentMode;

	@Output() markAsDirty : EventEmitter<BankQuestionType> = new EventEmitter();

	onDestroy$ : Subject<string> = new Subject();

	colOptions : SelectOptions<number>[] = COLUMN_OPTIONS;

	ngOnInit () : void {
	}

	deleteAnswerOption ( option : BankQuestionAnswerOption ) : void {
		this.question().options = this.question().options.filter( ( o : BankQuestionAnswerOption ) : boolean => o.value !== option.value );
	}

	createNewAnswerOption () : void {
		if ( ! this.question().options || ! Array.isArray( this.question().options ) ) {
			this.question().options = [];
		}
		const maxId : number                       = maxValueInBankQuestionOptions( this.question() );
		const newOption : BankQuestionAnswerOption = { value : ( 1 + maxId ).toString( 10 ) , label : '' };
		this.question().options.push( newOption );
	}

	markCorrectAnswer ( option : BankQuestionAnswerOption ) : void {
		this.question().correct_answer = '|' + option.value + '|';
		this.markAsDirty.emit( 'radio' );
	}

	isValueInAnswerCorrect ( value : string ) : boolean {
		return ( '|' + value + '|' ) === this.question().correct_answer;
	}

	onChange ( content : string , option : BankQuestionAnswerOption ) : void {
		option.label = content;
		this.markAsDirty.emit( 'radio' );
	}

	ngOnDestroy () : void {
		this.onDestroy$.next( 'destroyed' );
		this.onDestroy$.complete();
	}

}
