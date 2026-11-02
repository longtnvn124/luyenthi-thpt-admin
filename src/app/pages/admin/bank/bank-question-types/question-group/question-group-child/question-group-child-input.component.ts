import { Component , EventEmitter , Input , OnDestroy , OnInit , Output } from '@angular/core';
import { InputTextModule } from "primeng/inputtext";
import { BankQuestionEditorNode } from "@pages/admin/bank/bank-question-types/bank-question-node.model";
import { BankQuestionType } from "@model/bank-question";
import { FormsModule } from "@angular/forms";
import { IctuWrapEditorComponent } from "@pages/admin/bank/cap-nhat-cau-hoi/input-question-direction/ictu-wrap-editor/ictu-wrap-editor.component";

@Component( {
	selector   : 'app-question-group-child-input' ,
	standalone : true ,
	imports    : [ InputTextModule , FormsModule , IctuWrapEditorComponent ] ,
	template   : `
		<div class="d-flex flex-column">
			<b class="question-preview__question__direction__prefix mb-1" style="color: #000000;display: flex;align-items: center;gap: 5px;">CÂU HỎI
				<div class="ovic-vertical__inputs ovic-vertical__inputs--layout-2" style="width: 100px;display: inline-block;padding: 0;margin: 0 auto 0 0;">
					<input style="font-size: 15px;font-weight: 700;color: #000000;border-radius: 4px;height: auto;line-height: 1;padding: 7px 10px;" [(ngModel)]="question.question_number" (ngModelChange)="changed()" class="admin-wrap-table__head-actions__search" pInputText placeholder="...." type="text">
				</div>
				<button (click)="delete()" class="btn btn-add-child-in-group btn-add-child-in-group--delete">
					<i class="pi pi-trash"></i>
				</button>
			</b>
			<app-ictu-wrap-editor [initData]="question.content" (resultData)="onChangeChildContent($event , question)"></app-ictu-wrap-editor>
			<div class="mt-1">
				<input type="text" pInputText placeholder="Đáp án" class="group-input-question__option__input" [(ngModel)]="correct_answer" (ngModelChange)="inputCorrectAnswer()">
			</div>
		</div>
	` ,
	styleUrls  : [ '../question-group.component.css' ]
} )
export class QuestionGroupChildInputComponent implements OnInit , OnDestroy {

	@Input( { required : true , alias : 'question' } ) question : BankQuestionEditorNode;

	@Output() markAsDirty : EventEmitter<BankQuestionType> = new EventEmitter();

	@Output() requireDelete : EventEmitter<BankQuestionEditorNode> = new EventEmitter();

	correct_answer : string = '';

	ngOnInit () : void {
		this.correct_answer = this.question.correct_answer.split( '|' ).filter( Boolean ).join( ';' );
	}

	onChangeChildContent ( content : string , question : BankQuestionEditorNode ) : void {
		question.content = content;
		this.changed();
	}

	changed () : void {
		this.markAsDirty.emit( 'group-input' );
	}

	inputCorrectAnswer () : void {
		this.question.correct_answer = '|' + this.correct_answer.split( ';' ).map( ( s : string ) : string => s.trim() ).filter( Boolean ).join( '|' ) + '|';
		this.changed();
	}

	delete () : void {
		this.requireDelete.emit( this.question );
	}

	ngOnDestroy () : void {
	}

}
