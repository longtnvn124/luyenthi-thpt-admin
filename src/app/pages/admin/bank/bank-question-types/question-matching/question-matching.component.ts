import { Component , EventEmitter , inject , Input , OnDestroy , OnInit , Output , WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BankQuestionChildComponentMode , BankQuestionEditorNode , BankQuestionNodeModel , maxValueInBankQuestionOptions , questionCreator } from "@pages/admin/bank/bank-question-types/bank-question-node.model";
import { Subject , takeUntil } from "rxjs";
import { BankQuestionAnswerOption , BankQuestionType } from "@model/bank-question";
import { ButtonModule } from "primeng/button";
import { InputTextModule } from "primeng/inputtext";
import { RippleModule } from "primeng/ripple";
import { TooltipModule } from "primeng/tooltip";
import { NotificationService } from "@appNotification";
import { QuestionsService } from "@service/luyenthithpt/questions.service";
import { tap } from "rxjs/operators";
import { Helper } from "@utilities/helper";
import { FormsModule } from "@angular/forms";
import { IctuWrapEditorComponent } from "@pages/admin/bank/cap-nhat-cau-hoi/input-question-direction/ictu-wrap-editor/ictu-wrap-editor.component";

@Component( {
	selector    : 'app-question-matching' ,
	standalone  : true ,
	imports : [ CommonModule , TooltipModule , InputTextModule , FormsModule , RippleModule , ButtonModule , IctuWrapEditorComponent ] ,
	templateUrl : './question-matching.component.html' ,
	styleUrls   : [ './question-matching.component.css' ]
} )
export class QuestionMatchingComponent implements OnInit , OnDestroy , BankQuestionNodeModel {

	@Input( { required : true } ) question : WritableSignal<BankQuestionEditorNode>;

	@Input( { required : true } ) mode : BankQuestionChildComponentMode;

	@Output() markAsDirty : EventEmitter<BankQuestionType> = new EventEmitter();

	onDestroy$ : Subject<string> = new Subject();

	private readonly notificationService : NotificationService = inject<NotificationService>( NotificationService );

	private readonly service : QuestionsService = inject<QuestionsService>( QuestionsService );

	distractorOptions : BankQuestionAnswerOption[] = [];

	ngOnInit () : void {
		this.distractorOptions = [];
		if ( this.question().children.length ) {
			this.question().children = this.question().children.map( ( child : BankQuestionEditorNode ) : BankQuestionEditorNode => {
				const key : string = child.correct_answer.match( /\|\d+\|/g ) ? child.correct_answer.replace( /\|/g , '' ).trim() : '';
				child[ '__text' ]  = key ? this.question().options.reduce( ( reducer : string , option : BankQuestionAnswerOption ) : string => {
					return option.value === key ? option.label : reducer;
				} , '' ) : '';
				return child
			} );
			this.fillDistractorOptions();
		}
	}

	private fillDistractorOptions () : void {
		const usedIds : string[] = this.question().children.reduce( ( reducer : string[] , child : BankQuestionEditorNode ) : string[] => {
			if ( child.correct_answer.match( /\|\d+\|/g ) ) {
				reducer.push( child.correct_answer.replace( /\|/g , '' ).trim() );
			}
			return reducer;
		} , [] );
		this.distractorOptions   = this.question().options.filter( ( i : BankQuestionAnswerOption ) : boolean => ! usedIds.includes( i.value ) );
	}

	async deleteChildQuestion ( child : BankQuestionEditorNode , index : number ) : Promise<void> {
		const confirm : boolean = await this.notificationService.confirmDelete();
		if ( confirm ) {
			this.notificationService.isProcessing( true );
			if ( child.id ) {
				this.service.delete( child.id ).pipe(
					takeUntil( this.onDestroy$ ) ,
					tap( () : void => {
						if ( child.correct_answer.match( /\|\d+\|/g ) ) {
							this.question().options = this.question().options.filter( ( i : BankQuestionAnswerOption ) : boolean => `|${ i.value }|` !== child.correct_answer );
						}
						this.question().children = this.question().children.filter( ( q : BankQuestionEditorNode ) : boolean => q.id !== child.id );
					} )
				).subscribe( {
					next  : () : void => {
						this.notificationService.isProcessing( false );
						this.notificationService.toastSuccess( 'Thao tác thành công' );
						this.changes();
					} ,
					error : () : void => {
						this.notificationService.isProcessing( false );
						this.notificationService.toastError( 'Lỗi mất kết nối trong quá trình xóa dữ liệu.' );
					}
				} );
			}
			else {
				this.changes();
				this.question().children = this.question().children.filter( ( _ : BankQuestionEditorNode , order : number ) : boolean => order !== index );
				if ( child.correct_answer.match( /\|\d+\|/g ) ) {
					this.question().options = this.question().options.filter( ( i : BankQuestionAnswerOption ) : boolean => `|${ i.value }|` !== child.correct_answer );
				}
				setTimeout( () : void => {
					this.notificationService.isProcessing( false );
					this.notificationService.toastSuccess( 'Thao tác thành công' );
				} , 500 );
			}
		}
	}

	changes () : void {
		this.question().children = Helper.arraySort<BankQuestionEditorNode>( this.question().children , "question_number" , 1 );
		this.markAsDirty.emit( this.question().type );
	}

	addNewMoreChild () : void {
		const parent : BankQuestionEditorNode   = this.question();
		const newChild : BankQuestionEditorNode = questionCreator[ parent.type ]( this.question() );
		newChild[ '__temp' ]                    = '';
		this.question().children.push( newChild );
		this.changes();
	}

	changeContent ( content : string , child : BankQuestionEditorNode ) : void {
		child.content = content;
		this.changes();
	}

	changeAnswer ( content : string , child : BankQuestionEditorNode ) : void {
		if ( child.correct_answer.match( /\|\d+\|/g ) ) {
			const value : string = child.correct_answer.replace( /\|/g , '' ).trim();
			this.question().options.map( ( option : BankQuestionAnswerOption ) : BankQuestionAnswerOption => {
				if ( option.value === value ) {
					option.label = content;
				}
				return option;
			} )
		}
		else {
			const maxOptionId : number = maxValueInBankQuestionOptions( this.question() );
			const value : string       = ( 1 + maxOptionId ).toString( 10 );
			const label : string       = content;
			child.correct_answer       = '|' + value + '|';
			this.question().options.push( { value , label } );
			this.question().options = Helper.arrayShuffle<BankQuestionAnswerOption>( this.question().options );
		}
		this.changes();
	}

	addNewDistractors () : void {
		const maxOptionId : number                  = maxValueInBankQuestionOptions( this.question() );
		const newAnswers : BankQuestionAnswerOption = {
			value : ( 1 + maxOptionId ).toString( 10 ) ,
			label : ''
		}
		this.distractorOptions.push( newAnswers );
		this.question().options.push( newAnswers );
		this.question().options = Helper.arrayShuffle<BankQuestionAnswerOption>( this.question().options );
	}

	updateDistractorLabel ( content : string , option : BankQuestionAnswerOption ) : void {
		option.label = content;
		this.changes();
	}

	async deleteDistractor ( option : BankQuestionAnswerOption ) : Promise<void> {
		const confirm : boolean = await this.notificationService.confirmDelete();
		if ( confirm ) {
			this.notificationService.isProcessing( true );
			this.question().options = Helper.arrayShuffle<BankQuestionAnswerOption>( this.question().options.filter( ( o : BankQuestionAnswerOption ) : boolean => o.value !== option.value ) );
			this.changes();
			this.fillDistractorOptions();
			setTimeout( () : void => {
				this.notificationService.isProcessing( false );
				this.notificationService.toastSuccess( 'Thao tác thành công' );
			} , 500 );
		}
	}

	ngOnDestroy () : void {
		this.onDestroy$.next( 'destroyed' );
		this.onDestroy$.complete();
	}
}

