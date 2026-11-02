import { Component , EventEmitter , Input , OnDestroy , OnInit , Output , WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BankQuestionChildComponentMode , BankQuestionEditorNode , BankQuestionNodeModel } from "@pages/admin/bank/bank-question-types/bank-question-node.model";
import { Subject } from "rxjs";
import { BankQuestionType } from "@model/bank-question";
import { PaginatorModule } from "primeng/paginator";
import { IctuWrapEditorComponent } from "@pages/admin/bank/cap-nhat-cau-hoi/input-question-direction/ictu-wrap-editor/ictu-wrap-editor.component";

@Component( {
	selector    : 'app-question-textarea' ,
	standalone  : true ,
	imports : [ CommonModule , PaginatorModule , IctuWrapEditorComponent ] ,
	templateUrl : './question-textarea.component.html' ,
	styleUrls   : [ './question-textarea.component.css' ]
} )
export class QuestionTextareaComponent implements OnInit , OnDestroy , BankQuestionNodeModel {

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

	updateScoringGuide ( content : string ) : void {
		this.question().scoring_guide = content;
		this.markAsDirty.emit( 'textarea' );
	}

}
