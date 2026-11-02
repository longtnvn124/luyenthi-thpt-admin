import { Component , Input , OnInit } from '@angular/core';
import {Answers, Question} from "@model/question";
import {SelectOptions} from "@pages/admin/bank/cap-nhat-cau-hoi/models/bank-questions";
import {NotificationService} from "@appNotification";
import {TnBankQuestionService} from "@service/luyenthithpt/tn-bank-question.service";
import {NgClass, NgForOf, NgIf} from "@angular/common";
import {InputTextModule} from "primeng/inputtext";
import {ButtonModule} from "primeng/button";
import {RippleModule} from "primeng/ripple";
import {FormsModule} from "@angular/forms";
import {LoadMediaOnTextDirective} from "../../../../../../directives/load-media-on-text.directive";
import {CheckboxModule} from "primeng/checkbox";
import {PaginatorModule} from "primeng/paginator";
import {SafeHtmlSinglePipe} from "@pages/admin/bank/cap-nhat-cau-hoi/pipes/safe-html-single.pipe";
import { InputQuestionDirectionComponent } from '../../input-question-direction/input-question-direction.component';
interface GroupRadioQuestion {
	question : Question,
	answer : string
}
@Component({
	standalone: true,
	selector: 'group-radio-question-editor',
	templateUrl: './group-radio-question-editor.component.html',
	imports: [
		NgIf,
		NgClass,
		InputTextModule,
		ButtonModule,
		RippleModule,
		FormsModule,
		LoadMediaOnTextDirective,
		CheckboxModule,
		PaginatorModule,
		NgForOf,
		SafeHtmlSinglePipe,
		InputQuestionDirectionComponent
	],
	styleUrls: ['./group-radio-question-editor.component.css']
})
export class GroupRadioQuestionEditorComponent implements OnInit {

	@Input() set present( question : Question | any ) {
		if ( question ) {
			this._question = question;
		} else {
			this._question = null;
		}
		this.isPresent = true;
	}

	@Input() set question( question : Question ) {
		if ( question ) {
			this.childQuestion = this.questionToGroupInputQuestion( question );
			this._question     = question;

			// tiến hành xử lý đưa câu hỏi vào biến childQuestionsDirection. dù là câu hỏi nhưng để kiểu dữ liệu Answer để thỏa mãn điều kiện đưa vào htmlInputModel của app-input-question-direction
			question.children.map((child) => {
				this.handleChildQuestionDirection(child.question_direction);
			})
		} else {
			this._question     = null;
			this.childQuestion = [];
		}
		this.isPresent = false;
	}

	@Input() confirmOnDelete : boolean = false;

	isPresent : boolean = false;

	private _question : Question;

	get question() : Question {
		return this._question;
	}

	colOptions : SelectOptions<number>[] = [
		{ value : 1 , label : 'Hiển thị 1 phương án / dòng' , disable : false } ,
		{ value : 2 , label : 'Hiển thị 2 phương án / dòng' , disable : false } ,
		{ value : 4 , label : 'Hiển thị 4 phương án / dòng' , disable : false }
	];

	loading : boolean = false;

	childQuestion : GroupRadioQuestion[];

	indexQuestionDirection: number = 1;
	childQuestionsDirection: Answers[] = []; //dù là câu hỏi nhưng để kiểu dữ liệu Answer để thỏa mãn điều kiện đưa vào htmlInputModel của app-input-question-direction

	constructor(
		private notificationService : NotificationService ,
		// private courseQuestionsService : CourseQuestionsService
		private questionService:TnBankQuestionService
	) { }

	ngOnInit() : void {
	}

	private questionToGroupInputQuestion( question : Question ) : GroupRadioQuestion[] {
		return question.children.reduce( ( reducer : GroupRadioQuestion[] , q : Question ) : GroupRadioQuestion[] => {
			reducer.push( {
				question : q ,
				answer   : q.answer_correct ? q.answer_correct.split( '|' ).map( ( i : string ) : string => i ? i.trim() : '' ).filter( Boolean ).join( ';' ) : ''
			} );
			return reducer;
		} , new Array<GroupRadioQuestion>() );
	}

	handleChildQuestionDirection(value: string): void {
		this.indexQuestionDirection += 1;
		this.childQuestionsDirection.push({
			id: this.indexQuestionDirection.toString(),
			value: value
		})
	}

	markCorrectAnswer( question : Question , answer : string ) : void {
		question.answer_correct = '|' + answer + '|';
	}

	isCorrectAnswer( question : Question , answer : string ) : boolean {
		return question.answer_correct === '|' + answer + '|';
	}

	async deleteAnswer( index : number ) : Promise<void> {
		if ( this.confirmOnDelete ) {
			try {
				const confirm : boolean = await this.notificationService.confirmDelete();
				if ( confirm ) {
					this._delete( index );
				}
			} catch ( e ) {

			}
		} else {
			this._delete( index );
		}
	}

	private _delete( index : number ) : void {
		if ( this.question.children[ index ][ 'id' ] ) {
			this.loading = true;
			// this.courseQuestionsService.deleteCourseQuestions
			this.questionService.deleteQuestionByIds( [ this.question.children[ index ][ 'id' ] ] ).subscribe( {
				next  : () : void => {
					this.loading           = false;
					this.question.children = this.question.children.filter( c => c[ 'id' ] !== this.question.children[ index ][ 'id' ] );
				} ,
				error : () : void => {
					this.loading = false;
					this.notificationService.toastError( 'Mất kết nối với máy chủ' );
				}
			} );
		} else {
			this.question.children = this.question.children.filter( ( _ , i ) : boolean => i !== index );
		}
	}

	addMoreAnswerOption() : void {
		if ( this.question ) {
			const cloneQuestion : Question = Object.assign( JSON.parse( JSON.stringify( this.question ) ) , { children : [] , question_direction : '' , question_number : 0 , media : null , answer_option : [] , answer_correct : '' , group_id : 0 } );
			cloneQuestion.answer_option = [ {id: '1', value: 'Đúng'}, {id: '0', value: 'Sai'} ];
			
			if ( cloneQuestion['id'] ) {
				delete cloneQuestion[ 'id' ];
			}
			
			this.question.children.push( cloneQuestion );
		}
	}

	editorContentChange(event: any, index: number): void {
		// q.question.question_direction
		this.childQuestion[index].question.question_direction = event;
		
	}

}
