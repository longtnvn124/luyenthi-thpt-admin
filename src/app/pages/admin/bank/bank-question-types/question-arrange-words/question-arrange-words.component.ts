import { Component , EventEmitter , Input , OnDestroy , OnInit , Output , WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BankQuestionChildComponentMode , BankQuestionEditorNode , BankQuestionNodeModel } from "@pages/admin/bank/bank-question-types/bank-question-node.model";
import { Subject } from "rxjs";
import { BankQuestionType } from "@model/bank-question";

@Component( {
	selector    : 'app-question-arrange-words' ,
	standalone  : true ,
	imports     : [ CommonModule ] ,
	templateUrl : './question-arrange-words.component.html' ,
	styleUrls   : [ './question-arrange-words.component.css' ]
} )
export class QuestionArrangeWordsComponent implements OnInit , OnDestroy , BankQuestionNodeModel {

	@Input( { required : true } ) question : WritableSignal<BankQuestionEditorNode>;

	@Input( { required : true } ) mode : BankQuestionChildComponentMode;

	@Output() markAsDirty : EventEmitter<BankQuestionType> = new EventEmitter();

	onDestroy$ : Subject<string> = new Subject();

	ngOnInit () : void {
	}

	ngOnDestroy () : void {
		this.onDestroy$.next( 'destroyed' );
		this.onDestroy$.complete();
	}

}
