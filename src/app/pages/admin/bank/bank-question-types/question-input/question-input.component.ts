import { Component , EventEmitter , Input , OnDestroy , OnInit , Output , WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BankQuestionChildComponentMode , BankQuestionEditorNode , BankQuestionNodeModel } from "@pages/admin/bank/bank-question-types/bank-question-node.model";
import { Subject } from "rxjs";
import { PaginatorModule } from "primeng/paginator";
import { formatAnswerCorrect } from "@pages/admin/bank/cap-nhat-cau-hoi/models/bank-questions";
import { BankQuestionType } from "@model/bank-question";

@Component( {
	selector    : 'app-question-input' ,
	standalone  : true ,
	imports     : [ CommonModule , PaginatorModule ] ,
	templateUrl : './question-input.component.html' ,
	styleUrls   : [ './question-input.component.css' ]
} )
export class QuestionInputComponent implements OnInit , OnDestroy , BankQuestionNodeModel {

	@Input( { required : true } ) question : WritableSignal<BankQuestionEditorNode>;

	@Input( { required : true } ) mode : BankQuestionChildComponentMode;

	@Output() markAsDirty : EventEmitter<BankQuestionType> = new EventEmitter();

	raw_answer : string = '';

	onDestroy$ : Subject<string> = new Subject();

	ngOnInit () : void {
		this.fill2Input();
	}

	fill2Input () : void {
		if ( this.question() ) {
			this.raw_answer = this.question().correct_answer ? this.question().correct_answer.split( '|' ).map( t => t ? t.trim() : '' ).filter( Boolean ).join( ';' ) : '';
		}
		else {
			this.raw_answer = '';
		}
	}

	updateAnswer () : void {
		if ( this.raw_answer ) {
			this.question().correct_answer = '|' + this.raw_answer.split( ';' ).map( t => t ? formatAnswerCorrect( t ).toLowerCase() : '' ).filter( Boolean ).join( '|' ) + '|';
		}
		else {
			this.question().correct_answer = '';
		}
		this.markAsDirty.emit( 'input' );
	}

	ngOnDestroy () : void {
		this.onDestroy$.next( 'destroyed' );
		this.onDestroy$.complete();
	}

}
