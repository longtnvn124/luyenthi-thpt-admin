import { Component , EventEmitter , Input , OnDestroy , OnInit , Output , WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BankQuestionChildComponentMode , BankQuestionEditorNode , BankQuestionNodeModel } from "@pages/admin/bank/bank-question-types/bank-question-node.model";
import { Subject } from "rxjs";
import { BankQuestionAnswerOption , BankQuestionType } from "@model/bank-question";
import { ButtonModule } from "primeng/button";
import { RippleModule } from "primeng/ripple";

@Component( {
	selector    : 'app-question-true-false' ,
	standalone  : true ,
	imports : [ CommonModule , ButtonModule , RippleModule ] ,
	templateUrl : './question-true-false.component.html' ,
	styleUrls   : [ './question-true-false.component.css' ]
} )
export class QuestionTrueFalseComponent implements OnInit , OnDestroy , BankQuestionNodeModel {

	@Input( { required : true } ) question : WritableSignal<BankQuestionEditorNode>;

	@Input( { required : true } ) mode : BankQuestionChildComponentMode;

	@Output() markAsDirty : EventEmitter<BankQuestionType> = new EventEmitter();

	onDestroy$ : Subject<string> = new Subject();

	ngOnInit () : void {
	}

	isValueInAnswerCorrect ( value : string ) : boolean {
		return ( '|' + value + '|' ) === this.question().correct_answer;
	}

	markAnswerAsCorrectAnswer ( option : BankQuestionAnswerOption ) : void {
		this.question().correct_answer = '|' + option.value + '|';
		this.triggerChange();
	}

	private triggerChange () : void {
		this.markAsDirty.emit( this.question().type );
	}

	ngOnDestroy () : void {
		this.onDestroy$.next( 'destroyed' );
		this.onDestroy$.complete();
	}

}
