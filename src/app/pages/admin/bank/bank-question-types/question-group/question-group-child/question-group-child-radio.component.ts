import { Component , EventEmitter , Input , OnDestroy , OnInit , Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BankQuestionChildComponentMode , BankQuestionEditorNode , COLUMN_OPTIONS , maxValueInBankQuestionOptions } from "@pages/admin/bank/bank-question-types/bank-question-node.model";
import { BankQuestionAnswerOption , BankQuestionType } from "@model/bank-question";
import { FormsModule } from "@angular/forms";
import { InputTextModule } from "primeng/inputtext";
import { ButtonModule } from "primeng/button";
import { RippleModule } from "primeng/ripple";
import { DropdownModule } from "primeng/dropdown";
import { SelectOptions } from "@pages/admin/bank/cap-nhat-cau-hoi/models/bank-questions";
import { IsAnswerCorrectPipe } from "@pages/admin/bank/pipes/is-answer-correct.pipe";
import { SafeHtmlSinglePipe } from "@pages/admin/bank/cap-nhat-cau-hoi/pipes/safe-html-single.pipe";
import { LoadMediaOnTextDirective } from "../../../../../../directives/load-media-on-text.directive";
import { IctuWrapEditorComponent } from "@pages/admin/bank/cap-nhat-cau-hoi/input-question-direction/ictu-wrap-editor/ictu-wrap-editor.component";
import { CheckboxModule } from "primeng/checkbox";

@Component( {
	selector   : 'app-question-group-child-radio' ,
	standalone : true ,
	imports : [ CommonModule , FormsModule , InputTextModule , ButtonModule , RippleModule , DropdownModule , IsAnswerCorrectPipe , SafeHtmlSinglePipe , LoadMediaOnTextDirective , IctuWrapEditorComponent , CheckboxModule ] ,
	template   : `
		<div class="d-flex flex-column">
			<b class="question-preview__question__direction__prefix mb-1" style="color: #000000;display: flex;align-items: center;gap: 5px;">CÂU HỎI
				<div class="ovic-vertical__inputs ovic-vertical__inputs--layout-2" style="width: 100px;display: inline-block;padding: 0;margin: 0 auto 0 0;">
					<input style="font-size: 15px;font-weight: 700;color: #000000;border-radius: 4px;height: auto;line-height: 1;padding: 7px 10px;" [(ngModel)]="question.question_number" (ngModelChange)="triggerChange()" class="admin-wrap-table__head-actions__search" pInputText placeholder="...." type="text">
				</div>
				<p-checkbox [(ngModel)]="question.configs.invertedAnswer" (ngModelChange)="markAsDirty.emit('group-radio')" [binary]="true" label="Đảo vị trí của phương án trả lời"></p-checkbox>
				<div class="ovic-vertical__inputs ovic-vertical__inputs--layout-2">
					<p class="form-row mt-0">
						<p-dropdown class="input-element ovic-dropdown-style" [filter]="false" [options]="colOptions" [(ngModel)]="question.configs.cols" optionLabel="label" optionValue="value" optionDisabled="disable" placeholder="--Lựa chọn--"></p-dropdown>
					</p>
				</div>
				<button (click)="createNewAnswerOption()" class="btn btn-add-child-in-group">
					<i class="pi pi-plus-circle"></i>
				</button>
				<button (click)="delete()" class="btn btn-add-child-in-group btn-add-child-in-group--delete">
					<i class="pi pi-trash"></i>
				</button>
			</b>
			<app-ictu-wrap-editor [initData]="question.content" (resultData)="onChangeChildContent($event , question)"></app-ictu-wrap-editor>
			<div class="d-block" style="margin: 30px 0 0;">
				<ul class="group-input-question__list" *ngIf="question.options">
					<li class="group-input-question__list__element" [ngClass]="'group-input-question__list__element--size-'+question.configs.cols" *ngFor="let option of question.options">
						<div class="question-type-radio__option" [class.question-type-radio__option--correct]="isValueInAnswerCorrect(option.value)" style="max-width: 100%;">
							<ng-container *ngIf="mode === 'edit'">
								<button (click)="markCorrectAnswer(option)" pButton pRipple [icon]="isValueInAnswerCorrect(option.value) ? 'pi pi-check-circle' : 'pi pi-circle'" class="question-type-radio__option__prefix"></button>
								<div class="group-radio-question__block__editor" style="flex: 1 1 auto;max-width: calc(100% - 40px - 40px - 10px - 10px);">
									<app-ictu-wrap-editor style="max-width: 100%;" [initData]="option.label" (resultData)="onChange($event , option)"></app-ictu-wrap-editor>
								</div>
								<button (click)="deleteAnswerOption(option)" pButton pRipple icon="pi pi-trash" class="question-type-radio__option__btn-remove p-button-danger p-button-rounded p-button-text p-button-outlined"></button>
							</ng-container>
							<ng-container *ngIf="mode === 'preview'">
								<button pButton pRipple [icon]="(option | isAnswerCorrect : question) ? 'pi pi-check-circle' : 'pi pi-circle'" class="question-type-radio__option__prefix"></button>
								<div class="question-type-radio__option__input question-type-radio__option__input--media flex-fill" [appLoadMediaOnText]="option.value" [innerHTML]="option.label | safeHtmlSingle"></div>
							</ng-container>
						</div>
					</li>
				</ul>
			</div>
		</div>` ,
	styleUrls  : [ '../question-group.component.css' ]
} )
export class QuestionGroupChildRadioComponent implements OnInit , OnDestroy {

	@Input( { required : true , alias : 'question' } ) question : BankQuestionEditorNode;

	@Input( { required : true } ) mode : BankQuestionChildComponentMode;

	@Output() markAsDirty : EventEmitter<BankQuestionType> = new EventEmitter();

	@Output() requireDelete : EventEmitter<BankQuestionEditorNode> = new EventEmitter();

	correct_answer : string = '';

	readonly colOptions : SelectOptions<number>[] = COLUMN_OPTIONS;

	ngOnInit () : void {
		this.correct_answer = this.question.correct_answer.split( '|' ).filter( Boolean ).join( ';' );
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

	deleteAnswerOption ( option : BankQuestionAnswerOption ) : void {
		this.question.options = this.question.options.filter( ( o : BankQuestionAnswerOption ) : boolean => o.value !== option.value );
	}

	markCorrectAnswer ( option : BankQuestionAnswerOption ) : void {
		this.question.correct_answer = '|' + option.value + '|';
		this.triggerChange();
	}

	isValueInAnswerCorrect ( value : string ) : boolean {
		return ( '|' + value + '|' ) === this.question.correct_answer;
	}

	onChange ( content : string , option : BankQuestionAnswerOption ) : void {
		option.label = content;
		this.triggerChange();
	}

	createNewAnswerOption () : void {
		if ( ! this.question.options || ! Array.isArray( this.question.options ) ) {
			this.question.options = [];
		}
		const maxId : number                       = maxValueInBankQuestionOptions( this.question );
		const newOption : BankQuestionAnswerOption = { value : ( 1 + maxId ).toString( 10 ) , label : '' };
		this.question.options.push( newOption );
	}

	ngOnDestroy () : void {
	}
}
