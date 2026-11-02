import { Component , EventEmitter , Input , OnDestroy , OnInit , Output , WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BankQuestionChildComponentMode , BankQuestionEditorNode , BankQuestionNodeModel } from "@pages/admin/bank/bank-question-types/bank-question-node.model";
import { Subject } from "rxjs";
import { BankQuestionType } from "@model/bank-question";

@Component( {
	selector    : 'app-question-fill-in-blank' ,
	standalone  : true ,
	imports     : [ CommonModule ] ,
	templateUrl : './question-fill-in-blank.component.html' ,
	styleUrls   : [ './question-fill-in-blank.component.css' ]
} )
export class QuestionFillInBlankComponent implements OnInit , OnDestroy , BankQuestionNodeModel {

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
