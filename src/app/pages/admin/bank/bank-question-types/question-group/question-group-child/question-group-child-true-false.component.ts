import { Component , EventEmitter , Input , OnDestroy , OnInit , Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BankQuestionChildComponentMode , BankQuestionEditorNode } from "@pages/admin/bank/bank-question-types/bank-question-node.model";
import { BankQuestionAnswerOption , BankQuestionType } from "@model/bank-question";
import { RippleModule } from "primeng/ripple";
import { ButtonModule } from "primeng/button";
import { FormsModule } from "@angular/forms";
import { InputTextModule } from "primeng/inputtext";
import { IctuWrapEditorComponent } from "@pages/admin/bank/cap-nhat-cau-hoi/input-question-direction/ictu-wrap-editor/ictu-wrap-editor.component";

@Component( {
	selector   : 'app-question-group-child-true-false' ,
	standalone : true ,
	imports    : [ CommonModule , RippleModule , ButtonModule , FormsModule , InputTextModule , IctuWrapEditorComponent ] ,
	template   : `
		<div class="d-flex flex-column">
			<b class="question-preview__question__direction__prefix mb-1" style="color: #000000;display: flex;align-items: center;gap: 5px;">CÂU HỎI
				<div class="ovic-vertical__inputs ovic-vertical__inputs--layout-2" style="width: 100px;display: inline-block;padding: 0;margin: 0 auto 0 0;">
					<input style="font-size: 15px;font-weight: 700;color: #000000;border-radius: 4px;height: auto;line-height: 1;padding: 7px 10px;" [(ngModel)]="question.question_number" (ngModelChange)="triggerChange()" class="admin-wrap-table__head-actions__search" pInputText placeholder="...." type="text">
				</div>
				<button (click)="delete()" class="btn btn-add-child-in-group btn-add-child-in-group--delete">
					<i class="pi pi-trash"></i>
				</button>
			</b>
			<app-ictu-wrap-editor [initData]="question.content" (resultData)="onChangeChildContent($event , question)"></app-ictu-wrap-editor>
			<div class="d-block" style="margin: 30px 0 0;">
				<ul class="ictu-logic-question__answers">
					<li class="ictu-logic-question__answers__element" *ngFor="let btn of question.options">
						<button class="btn ictu-logic-question__answers__btn" [class.high-light]="isValueInAnswerCorrect(btn.value)" (click)="markAnswerAsCorrectAnswer(btn)">{{ btn.label }}</button>
					</li>
				</ul>
			</div>
		</div>` ,
	styleUrls  : [ '../question-group.component.css' ]
} )
export class QuestionGroupChildTrueFalseComponent implements OnInit , OnDestroy {

	@Input( { required : true , alias : 'question' } ) question : BankQuestionEditorNode;

	@Input( { required : true } ) mode : BankQuestionChildComponentMode;

	@Output() markAsDirty : EventEmitter<BankQuestionType> = new EventEmitter();

	@Output() requireDelete : EventEmitter<BankQuestionEditorNode> = new EventEmitter();

	ngOnInit () : void {
	}

	onChangeChildContent ( content : string , question : BankQuestionEditorNode ) : void {
		question.content = content;
		this.triggerChange();
	}

	triggerChange () : void {
		this.markAsDirty.emit( this.question.type );
	}

	delete () : void {
		this.requireDelete.emit( this.question );
	}

	isValueInAnswerCorrect ( value : string ) : boolean {
		return ( '|' + value + '|' ) === this.question.correct_answer;
	}

	markAnswerAsCorrectAnswer ( option : BankQuestionAnswerOption ) : void {
		this.question.correct_answer = '|' + option.value + '|';
		this.triggerChange();
	}

	ngOnDestroy () : void {
	}

}