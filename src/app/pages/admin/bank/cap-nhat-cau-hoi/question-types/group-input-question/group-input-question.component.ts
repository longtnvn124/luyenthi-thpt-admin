import { Component , Input , OnInit } from '@angular/core';

import {Answers, Question} from "@model/question";
import {formatAnswerCorrect, SelectOptions} from "@pages/admin/bank/cap-nhat-cau-hoi/models/bank-questions";
import {NotificationService} from "@appNotification";
import {TnBankQuestionService} from "@service/luyenthithpt/tn-bank-question.service";
import {NgClass, NgForOf, NgIf} from "@angular/common";
import {InputTextModule} from "primeng/inputtext";
import {ButtonModule} from "primeng/button";
import {RippleModule} from "primeng/ripple";
import {AbstractControl, FormBuilder, FormGroup, FormsModule, Validators} from "@angular/forms";
import {PaginatorModule} from "primeng/paginator";
import { InputQuestionDirectionComponent } from '../../input-question-direction/input-question-direction.component';
import { Answer } from '@model/tn-bank-question';
import { IctuMediaLoaderDirective } from 'src/app/directives/ictu-media-loader.directive';
import { SafeHtmlSinglePipe } from '../../pipes/safe-html-single.pipe';

interface GroupInputQuestion {
	question : Question,
	answer : string
}

@Component({
	standalone: true,
	selector: 'group-input-question',
	templateUrl: './group-input-question.component.html',
  imports: [
    NgIf,
    NgClass,
    InputTextModule,
    ButtonModule,
    RippleModule,
    FormsModule,
    PaginatorModule,
    NgForOf,
	InputQuestionDirectionComponent,
	IctuMediaLoaderDirective,
	SafeHtmlSinglePipe
  ],
	styleUrls: ['./group-input-question.component.css']
})
export class GroupInputQuestionComponent implements OnInit {

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

	@Input() set present( question : Question | any ) {
		if ( question ) {
			this.childQuestion = this.questionToGroupInputQuestion( question );
			this._question     = question;
		} else {
			this._question     = null;
			this.childQuestion = [];
		}
		this.isPresent = true;
	}

	@Input() confirmOnDelete : boolean = false;

	isPresent : boolean = false;

	private _question : Question;

	get question() : Question {
		return this._question;
	}

	childQuestion : GroupInputQuestion[];

	indexQuestionDirection: number = 1;
	childQuestionsDirection: Answers[] = []; //dù là câu hỏi nhưng để kiểu dữ liệu Answer để thỏa mãn điều kiện đưa vào htmlInputModel của app-input-question-direction

	colOptions : SelectOptions<number>[] = [
		{ value : 1 , label : 'Hiển thị 1 phương án / dòng' , disable : false } ,
		{ value : 2 , label : 'Hiển thị 2 phương án / dòng' , disable : false } ,
		{ value : 4 , label : 'Hiển thị 4 phương án / dòng' , disable : false }
	];

	loading : boolean = false;


	constructor(
		private notificationService : NotificationService ,
		// private courseQuestionsService : CourseQuestionsService
		private questionSerivice:TnBankQuestionService,
		private fb: FormBuilder,
	) { 

		
	}

	ngOnInit() : void {
		
	}

	handleChildQuestionDirection(value: string): void {
		this.indexQuestionDirection += 1;
		this.childQuestionsDirection.push({
			id: this.indexQuestionDirection.toString(),
			value: value
		})
	}
	

	private questionToGroupInputQuestion( question : Question ) : GroupInputQuestion[] {
		return question.children.reduce( ( reducer : GroupInputQuestion[] , q : Question ) : GroupInputQuestion[] => {
			reducer.push( {
				question : q ,
				answer   : q.answer_correct ? q.answer_correct.split( '|' ).map( ( i : string ) : string => i ? i.trim() : '' ).filter( Boolean ).join( ';' ) : ''
			} );
			return reducer;
		} , new Array<GroupInputQuestion>() );
	}

	async deleteAnswer( index : number ) : Promise<void> {
		if ( this.confirmOnDelete ) {
			try {
				const confirm : boolean = await this.notificationService.confirmDelete();
				if ( confirm ) {
					this.delete( index );
				}
			} catch ( e ) {

			}
		} else {
			this.delete( index );
		}
	}

	private delete( index : number ) : void {
		if ( this.childQuestion[ index ].question[ 'id' ] ) {
			this.loading = true;
			this.questionSerivice.deleteQuestionByIds( [ this.childQuestion[ index ].question[ 'id' ] ] ).subscribe( {
				next  : () : void => {
					this.loading           = false;
					this.question.children = this.question.children.filter( c => c[ 'id' ] !== this.childQuestion[ index ].question[ 'id' ] );
					this.childQuestion     = this.questionToGroupInputQuestion( this.question );
				} ,
				error : () : void => {
					this.loading = false;
					this.notificationService.toastError( 'Mất kết nối với máy chủ' );
				}
			} );
		} else {
			this.question.children = this.question.children.filter( ( _ , i ) : boolean => i !== index );
			this.childQuestion     = this.questionToGroupInputQuestion( this.question );
		}
	}

	addMoreAnswerOption() : void {
		if ( this.question ) {
			const cloneQuestion: Question = Object.assign( JSON.parse( JSON.stringify( this.question ) ), {children: [], question_direction: '', question_number: 0, media: null, answer_option: [], answer_correct: '', group_id: 0} );
			
			
			if ( cloneQuestion[ 'id' ] ) {
				delete cloneQuestion[ 'id' ];
			}
			
			this.question.children.push( cloneQuestion );
			
			this.childQuestion.push( {
				question : cloneQuestion ,
				answer   : ''
			} );

			this.handleChildQuestionDirection('');
		}
	}

	updateAnswer( q : GroupInputQuestion ) : void {
		const _rawAnswerCorrect : string[] = q.answer.split( ';' ).map( ( t : string ) : string => t ? formatAnswerCorrect( t ).toLowerCase() : '' ).filter( Boolean );
		q.question.answer_correct          = _rawAnswerCorrect.length ? ( '|' + _rawAnswerCorrect.join( '|' ) + '|' ) : '';
	}

	editorContentChange(event: any, index: number): void {
		// q.question.question_direction
		this.childQuestion[index].question.question_direction = event;
		
	}

}
