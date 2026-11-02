import { Component , computed , EventEmitter , inject , Input , OnDestroy , OnInit , Output , Signal , signal , WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BankFormat } from "@model/tn-bank";
import { DropdownModule } from "primeng/dropdown";
import { AbstractControl , FormBuilder , FormGroup , FormsModule , ReactiveFormsModule , Validators } from "@angular/forms";
import { BankQuestion , BankQuestionType , EnglishPartSlug } from "@model/bank-question";
import { ComponentBaseState , IctuDropdownOption } from "@model/commons";
import { bankQuestionTypeOptions } from "@utilities/syscats";
import { MatButtonModule } from "@angular/material/button";
import { debounceTime , filter , map , Observable , of , Subject , switchMap , takeUntil } from "rxjs";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { QuestionsService } from "@service/luyenthithpt/questions.service";
import { DtoObject , IctuConditionParamObject , IctuQueryCondition , IctuQueryParams } from "@model/dto";
import { InputTextModule } from "primeng/inputtext";
import { TabMenuModule } from "primeng/tabmenu";
import { BankQuestionBase , BankQuestionEditorNode , questionCreator } from "@pages/admin/bank/bank-question-types/bank-question-node.model";
import { NotificationService } from "@appNotification";
import { QuestionArrangeWordsComponent } from "@pages/admin/bank/bank-question-types/question-arrange-words/question-arrange-words.component";
import { QuestionCheckboxComponent } from "@pages/admin/bank/bank-question-types/question-checkbox/question-checkbox.component";
import { QuestionCompleteWordComponent } from "@pages/admin/bank/bank-question-types/question-complete-word/question-complete-word.component";
import { QuestionDragDropComponent } from "@pages/admin/bank/bank-question-types/question-drag-drop/question-drag-drop.component";
import { QuestionFillInBlankComponent } from "@pages/admin/bank/bank-question-types/question-fill-in-blank/question-fill-in-blank.component";
import { QuestionGroupingComponent } from "@pages/admin/bank/bank-question-types/question-grouping/question-grouping.component";
import { QuestionInputComponent } from "@pages/admin/bank/bank-question-types/question-input/question-input.component";
import { QuestionMatchingComponent } from "@pages/admin/bank/bank-question-types/question-matching/question-matching.component";
import { QuestionRadioComponent } from "@pages/admin/bank/bank-question-types/question-radio/question-radio.component";
import { QuestionTextareaComponent } from "@pages/admin/bank/bank-question-types/question-textarea/question-textarea.component";
import { QuestionTrueFalseComponent } from "@pages/admin/bank/bank-question-types/question-true-false/question-true-false.component";
import { QuestionGroupComponent } from "@pages/admin/bank/bank-question-types/question-group/question-group.component";
import { SafeHtmlPipe } from "../../../../pipes/safe-html.pipe";
import { IctuWrapEditorComponent } from "@pages/admin/bank/cap-nhat-cau-hoi/input-question-direction/ictu-wrap-editor/ictu-wrap-editor.component";

export interface BankQuestionEditorConfig {
	bankId : number;
	questionId : number;
	groupId? : number;
	format : BankFormat;
	code? : string;
}

type Null = 'null';

export type ComponentStateExtend = ComponentBaseState | Null;

@Component( {
	selector    : 'app-bank-question-editor' ,
	standalone  : true ,
	imports     : [ CommonModule , DropdownModule , FormsModule , ReactiveFormsModule , MatButtonModule , MatProgressBarModule , InputTextModule , TabMenuModule , QuestionArrangeWordsComponent , QuestionCheckboxComponent , QuestionCompleteWordComponent , QuestionDragDropComponent , QuestionFillInBlankComponent , QuestionGroupingComponent , QuestionInputComponent , QuestionMatchingComponent , QuestionRadioComponent , QuestionTextareaComponent , QuestionTrueFalseComponent , QuestionGroupComponent , SafeHtmlPipe , IctuWrapEditorComponent ] ,
	templateUrl : './bank-question-editor.component.html' ,
	styleUrls   : [ './bank-question-editor.component.css' , './bank-question-editor-layout.css' ] ,
	host        : {
		'class' : 'd-flex w-100 h-100'
	}
} )
export class BankQuestionEditorComponent implements OnInit , OnDestroy {

	@Input( { alias : 'configs' , required : true } ) set configs ( info : BankQuestionEditorConfig ) {
		this.init( info );
	}

	@Output() change : EventEmitter<string> = new EventEmitter<string>();

	@Output() closePanel : EventEmitter<string> = new EventEmitter<string>();

	readonly setting : WritableSignal<BankQuestionEditorConfig> = signal<BankQuestionEditorConfig>( null );

	isCreateForm : Signal<boolean> = computed( () : boolean => ( this.setting() && this.setting().questionId === 0 ) );

	readonly bankFormat : Signal<BankFormat> = computed( () : BankFormat => this.setting()?.format || 'standard' );

	private readonly service : QuestionsService = inject<QuestionsService>( QuestionsService );

	// private _filterQuestionType : Record<BankFormat , BankQuestionType[]> = {
	// 	english  : [ 'radio' , 'checkbox' , 'input' , 'textarea' , 'grouping' , 'drag-drop' , 'matching' , 'fill-in-blank' , "true-false" , "group-true-false" , 'complete-word' , 'arrange-words' ] ,
	// 	standard : [ 'radio' , 'checkbox' , 'input' , 'group-radio' , 'group-input' , 'grouping' , 'drag-drop' , 'matching' , 'textarea' , "true-false" , "group-true-false" ]
	// }

	private _filterQuestionType : Record<BankFormat , BankQuestionType[]> = {
		english  : [ 'radio' , 'input' , 'matching' , "group-true-false" ] ,
		standard : [ 'radio' , 'input' , 'matching' , "group-true-false" , 'textarea' , 'group-radio']
	}

	readonly questionTypeMatchBankFormat : Signal<IctuDropdownOption<BankQuestionType>[]> = computed( () : IctuDropdownOption<BankQuestionType>[] => {
		const format : BankFormat = this.bankFormat();
		return bankQuestionTypeOptions.filter( ( option : IctuDropdownOption<BankQuestionType> ) : boolean => this._filterQuestionType[ format ].includes( option.value ) )
	} );

	private readonly fb : FormBuilder = inject( FormBuilder );

	formGroup : FormGroup;

	get formatField () : AbstractControl<BankQuestionType> {
		return this.formGroup.controls[ 'format' ];
	}

	private onDestroy$ : Subject<string> = new Subject<string>();

	question : WritableSignal<BankQuestionEditorNode> = signal<BankQuestionEditorNode>( null );


	dirty : WritableSignal<boolean> = signal<boolean>( false );

	private get dirtyState () : boolean {
		return this.question() ? ( this.question().dirty || this.question().children.reduce( ( reducer : boolean , q : BankQuestionEditorNode ) : boolean => reducer ? reducer : q.dirty , false ) ) : false;
	}

	readonly state : WritableSignal<ComponentStateExtend> = signal<ComponentStateExtend>( 'loading' );

	sessionCounter : WritableSignal<number> = signal<number>( Date.now() );

	private notification : NotificationService = inject( NotificationService );

	constructor () {
		this.formGroup = this.fb.group( {
			format : [ '' , Validators.required ]
		} );
		this.formatField.valueChanges.pipe(
			debounceTime( 100 ) ,
			filter( () : boolean => ! this.formatField.disabled )
		).subscribe( ( type : BankQuestionType ) : void => {
			if ( ! this.formatField.disabled ) {
				this.dirty.set( false );
				this.question.set( type ? { ... questionCreator[ type ]( null , { bank_id : this.setting().bankId , group_id : this.setting().groupId ? this.setting().groupId : 0 , code : ( this.setting().code ? this.setting().code : "" ) as EnglishPartSlug } ) } : null );
			}
		} )
	}

	ngOnInit () : void {
		console.log( 'bank-question-editor : init' )
	}

	resetForm () : void {
		this.formGroup.reset( {
			format : ''
		} );
	}

	private init ( info : BankQuestionEditorConfig ) : void {
		this.resetForm();
		this.setting.set( info );
		if ( info?.questionId ) {
			this.formatField.disable();
			this.state.set( 'loading' );
			const conditions : IctuConditionParamObject<BankQuestion>[] = [
				{
					conditionName : 'id' ,
					condition     : IctuQueryCondition.equal ,
					value         : info.questionId.toString( 10 )
				} ,
				{
					conditionName : 'group_id' ,
					condition     : IctuQueryCondition.equal ,
					value         : info.questionId.toString( 10 ) ,
					orWhere       : "or"
				}
			];
			const queryParams : IctuQueryParams                         = {
				paged      : 1 ,
				limit      : -1 ,
				include    : this.setting().bankId ,
				include_by : 'bank_id'
			}
			this.service.query( conditions , queryParams ).pipe(
				takeUntil( this.onDestroy$ ) ,
				map( ( res : DtoObject<BankQuestion[]> ) : BankQuestionEditorNode => {
					const parent : BankQuestion = res.data.find( ( i : BankQuestion ) : boolean => i.id === info.questionId )
					return parent ? {
						... parent ,
						children : res.data.filter( ( c : BankQuestion ) : boolean => c.group_id === info.questionId ).map(
							( child : BankQuestion ) : BankQuestionEditorNode => ( {
								... child ,
								children : [] ,
								dirty    : false
							} )
						) ,
						dirty    : false
					} : null
				} )
			).subscribe( {
				next  : ( question : BankQuestionEditorNode ) : void => {
					this.question.set( question );
					this.dirty.set( false );
					this.formatField.setValue( question.type );
					this.state.set( 'success' );
				} ,
				error : () : void => {
					this.question.set( null );
					this.state.set( 'error' );
				}
			} )
		}
		else {
			this.formatField.enable();
			this.state.set( 'success' );
		}
	}

	changeAnswerImage () : void {
		this.sessionCounter.update( ( n : number ) : number => 1 + n );
	}

	submitForm () : void {
		this.notification.isProcessing( true );
		this.change.emit( 'change' );
		this.updateParentFirst().pipe(
			switchMap( ( parentId : number ) : Observable<any> => this.updateChildren( parentId , 0 ) )
		).subscribe( {
			next  : () : void => {
				this.notification.isProcessing( false );
				this.notification.toastSuccess( 'Hoàn thành' );
				if ( this.isCreateForm() ) {
					this.question.set( null );
					this.dirty.set( false );
					this.resetForm();
					this.formatField.enable();
				}
				else {
					this.closePanel.emit( 'close' );
				}
			} ,
			error : () : void => {
				this.notification.toastError( 'Sự cố gián đoạn kết nối với máy chủ.' );
				this.notification.isProcessing( false );
			}
		} )
	}

	private filterTheRequiredFieldsOfQuestion ( { bank_id , type , content , options , correct_answer , question_number , ordering , configs , hint , explain , status , group_id , media , scoring_guide , code } : BankQuestionEditorNode ) : Omit<BankQuestionBase , 'id'> {
		return { type , bank_id , content , options , correct_answer , question_number , ordering , configs , hint , explain , status , group_id , media , scoring_guide , code };
	}

	private updateParentFirst () : Observable<number> {
		return this.updateBankQuestionEditorNode( this.question() );
	}

	private updateBankQuestionEditorNode ( node : BankQuestionEditorNode ) : Observable<number> {
		const id : number                          = node.id;
		const info : Omit<BankQuestionBase , 'id'> = this.filterTheRequiredFieldsOfQuestion( node );
		return id ? this.service.update( id , info ).pipe( map( () : number => id ) ) : this.service.create( info )
	}

	private updateChildren ( parentId : number , index : number ) : Observable<any> {
		if ( this.question()?.children[ index ] ) {
			this.question().children[ index ].group_id = parentId;
			return this.updateBankQuestionEditorNode( this.question().children[ index ] ).pipe(
				map( ( id : number ) : void => {
					this.question().children[ index ].id    = id;
					this.question().children[ index ].dirty = false;
				} ) ,
				switchMap( () : Observable<any> => this.updateChildren( parentId , ( index + 1 ) ) )
			)
		}
		else {
			this.question().dirty = false;
			return of( '' );
		}
	}

	updateDirection ( text : string ) : void {
		this.question().content = text;
		this.markQuestionAsDirty();
	}

	markQuestionAsDirty () : void {
		this.question().dirty = true;
		this.dirty.update( () : boolean => this.dirtyState );
		this.formatField.disable();
	}

	ngOnDestroy () : void {
		this.onDestroy$.next( '' );
		this.onDestroy$.complete();
	}

}
