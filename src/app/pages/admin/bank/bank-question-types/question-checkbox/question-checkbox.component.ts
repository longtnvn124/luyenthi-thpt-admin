import { Component , EventEmitter , Input , OnDestroy , OnInit , Output , WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BankQuestionChildComponentMode , BankQuestionEditorNode , COLUMN_OPTIONS , maxValueInBankQuestionOptions } from "@pages/admin/bank/bank-question-types/bank-question-node.model";
import { Subject } from "rxjs";
import { BankQuestionAnswerOption , BankQuestionType } from "@model/bank-question";
import { ButtonModule } from "primeng/button";
import { CheckboxModule } from "primeng/checkbox";
import { DropdownModule } from "primeng/dropdown";
import { IsAnswerCorrectPipe } from "@pages/admin/bank/pipes/is-answer-correct.pipe";
import { RippleModule } from "primeng/ripple";
import { SafeHtmlSinglePipe } from "@pages/admin/bank/cap-nhat-cau-hoi/pipes/safe-html-single.pipe";
import { SelectOptions } from "@pages/admin/bank/cap-nhat-cau-hoi/models/bank-questions";
import { FormsModule } from "@angular/forms";
import { LoadMediaOnTextDirective } from "../../../../../directives/load-media-on-text.directive";
import { IctuWrapEditorComponent } from "@pages/admin/bank/cap-nhat-cau-hoi/input-question-direction/ictu-wrap-editor/ictu-wrap-editor.component";

@Component( {
	selector    : 'app-question-checkbox' ,
	standalone  : true ,
	imports     : [ CommonModule , ButtonModule , CheckboxModule , DropdownModule , IsAnswerCorrectPipe , RippleModule , SafeHtmlSinglePipe , FormsModule , LoadMediaOnTextDirective , IctuWrapEditorComponent ] ,
	templateUrl : './question-checkbox.component.html' ,
	styleUrls   : [ './question-checkbox.component.css' ]
} )
export class QuestionCheckboxComponent implements OnInit , OnDestroy {

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
		let _listOptions : string[]    = this.question().correct_answer.split( '|' ).filter( Boolean );
		_listOptions                   = _listOptions.includes( option.value ) ? _listOptions.filter( ( e : string ) : boolean => e !== option.value ).sort() : [ ... _listOptions , option.value ].sort();
		this.question().correct_answer = '|' + _listOptions.join( '|' ) + '|';
		this.markAsDirty.emit( 'checkbox' );
	}

	isValueInAnswerCorrect ( value : string ) : boolean {
		return this.question().correct_answer.split( '|' ).filter( Boolean ).reduce( ( reducer : boolean , srcAnswer : string ) : boolean => ( reducer || srcAnswer === value ) , false );
	}

	onChange ( content : string , option : BankQuestionAnswerOption ) : void {
		option.label = content;
		this.markAsDirty.emit( 'checkbox' );
	}

	ngOnDestroy () : void {
		this.onDestroy$.next( 'destroyed' );
		this.onDestroy$.complete();
	}

}
