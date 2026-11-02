import { Component , computed , inject , Input , numberAttribute , OnDestroy , Signal , signal , WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BankFormat } from "@model/tn-bank";
import { QuestionsService } from "@service/luyenthithpt/questions.service";
import { NotificationService } from "@appNotification";
import { ComponentStateExtend , IctuDropdownOption } from "@model/commons";
import { BankQuestionBase , BankQuestionEditorNode , questionCreator } from "@pages/admin/bank/bank-question-types/bank-question-node.model";
import { InputTextModule } from "primeng/inputtext";
import { MatButtonModule } from "@angular/material/button";
import { MatTooltipModule } from "@angular/material/tooltip";
import { BankQuestionEditorComponent , BankQuestionEditorConfig } from "@pages/admin/bank/bank-question-editor/bank-question-editor.component";
import { ButtonModule } from "primeng/button";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { RippleModule } from "primeng/ripple";
import { SharedModule } from "primeng/api";
import { SidebarModule } from "primeng/sidebar";
import { TooltipModule } from "primeng/tooltip";
import { BankQuestion , BankQuestionType , EnglishPartSlug } from "@model/bank-question";
import { bankQuestionTypeOptions , bankQuestionUntypedOption } from "@utilities/syscats";
import { map , merge , Observable , of , Subject , takeUntil } from "rxjs";
import { DtoObject } from "@model/dto";
import { FormBuilder , FormGroup , ReactiveFormsModule , Validators } from "@angular/forms";
import { DropdownModule } from "primeng/dropdown";
import { InputTextareaModule } from "primeng/inputtextarea";
import { IctuDropdownOptionMapPipe } from "../../../../pipes/ictu-dropdown-option-map.pipe";
import { LoadMediaOnTextDirective } from "../../../../directives/load-media-on-text.directive";
import { ListCorrectAnswersDirective } from "@pages/admin/bank/directives/list-correct-answers.directive";
import { IctuMediaLoaderDirective } from "../../../../directives/ictu-media-loader.directive";
import { SafeHtmlPipe } from "../../../../pipes/safe-html.pipe";
import { SafeHtmlSinglePipe } from "@pages/admin/bank/cap-nhat-cau-hoi/pipes/safe-html-single.pipe";
import { MatchCorrectAnswersPipe } from "@pages/admin/bank/pipes/match-correct-answers.pipe";
import { IsAnswerCorrectPipe } from "@pages/admin/bank/pipes/is-answer-correct.pipe";
import { QuestionPrefixPipe } from "@pages/admin/bank/cap-nhat-cau-hoi/pipes/question-prefix.pipe";
import { PreviewQuestionMatchingComponent } from "@pages/admin/bank/bank-question-preview/preview-question-matching/preview-question-matching.component";
import { InputQuestionDirectionComponent } from "@pages/admin/bank/cap-nhat-cau-hoi/input-question-direction/input-question-direction.component";

// Map EnglishPartSlug to EnglishPartName
type PartSlugToName = {
	'part-1' : 'Part 1';
	'part-2' : 'Part 2';
	'part-3' : 'Part 3';
	'part-4' : 'Part 4';
};

// Map EnglishPartSlug to EnglishPartOrder
type PartSlugToOrder = {
	'part-1' : 1;
	'part-2' : 2;
	'part-3' : 3;
	'part-4' : 4;
};

type EnglishPart<T extends EnglishPartSlug> = {
	slug : T;
	order : PartSlugToOrder[T];
	name : PartSlugToName[T];  // heading must match the title for this part
	question : BankQuestionEditorNode;
};

type EnglishStructure = {
	[K in EnglishPartSlug] : EnglishPart<K>;
};
type BankEnglishFromControlFormType = 'create' | 'edit'

interface BankEnglishFromControl {
	formGroup : FormGroup,
	loading : boolean,
	visible : boolean,
	options : IctuDropdownOption<EnglishPartSlug>[],
	object : BankQuestionEditorNode;
	formType : BankEnglishFromControlFormType
}

@Component( {
	selector    : 'app-bank-english-questions' ,
	standalone  : true ,
	imports : [ CommonModule , InputTextModule , MatButtonModule , MatTooltipModule , BankQuestionEditorComponent , ButtonModule , MatProgressBarModule , RippleModule , SharedModule , SidebarModule , TooltipModule , DropdownModule , InputTextareaModule , ReactiveFormsModule , IctuDropdownOptionMapPipe , LoadMediaOnTextDirective , ListCorrectAnswersDirective , IctuMediaLoaderDirective , SafeHtmlPipe , SafeHtmlSinglePipe , MatchCorrectAnswersPipe , IsAnswerCorrectPipe , QuestionPrefixPipe , PreviewQuestionMatchingComponent , IsAnswerCorrectPipe , InputQuestionDirectionComponent ] ,
	templateUrl : './bank-english-questions.component.html' ,
	styleUrls   : [ './bank-english-questions.component.css' ]
} )
export class BankEnglishQuestionsComponent implements OnDestroy {

	@Input( { alias : 'bankId' , required : true , transform : numberAttribute } ) set bankId ( bankId : number ) {
		if ( ! this.bankId || this.bankId !== bankId ) {
			this._bankId = bankId;
			this.loadQuestions();
		}
	}

	private _bankId : number;

	get bankId () : number {
		return this._bankId;
	}

	@Input( { alias : 'format' , required : true } ) bankFormat : BankFormat = 'english';

	@Input( { alias : 'bankName' , required : true } ) bankName : string = '';

	private readonly service : QuestionsService = inject<QuestionsService>( QuestionsService );

	private readonly fb : FormBuilder = inject<FormBuilder>( FormBuilder );

	private readonly notification : NotificationService = inject<NotificationService>( NotificationService );

	readonly state : WritableSignal<ComponentStateExtend> = signal<ComponentStateExtend>( 'loading' );

	structure : WritableSignal<EnglishStructure> = signal<EnglishStructure>( {
		'part-1' : {
			slug     : 'part-1' ,  // Must be 'part-1'
			order    : 1 ,
			name     : 'Part 1' ,
			question : null
		} ,
		'part-2' : {
			slug     : 'part-2' ,  // Must be 'part-2'
			order    : 2 ,
			name     : 'Part 2' ,
			question : null
		} ,
		'part-3' : {
			slug     : 'part-3' ,  // Must be 'part-3'
			order    : 3 ,
			name     : 'Part 3' ,
			question : null
		} ,
		'part-4' : {
			slug     : 'part-4' ,  // Must be 'part-4'
			order    : 4 ,
			name     : 'Part 4' ,
			question : null
		}
	} );

	readonly isEmpty : Signal<boolean> = computed( () : boolean => {
		return ! this.structure()[ "part-1" ].question && ! this.structure()[ "part-2" ].question && ! this.structure()[ "part-3" ].question && ! this.structure()[ "part-4" ].question;
	} );

	search : string = "";

	sidebarVisible : boolean = false;

	private dirty : boolean = false;

	question : WritableSignal<BankQuestionEditorNode> = signal<BankQuestionEditorNode>( null );

	sidebarHeading : Signal<string> = computed( () : string => this.question() ? 'Cập nhật câu hỏi' : 'Soạn câu hỏi' );

	configEditor : WritableSignal<BankQuestionEditorConfig> = signal<BankQuestionEditorConfig>( null );

	bankQuestionTypeOptions : IctuDropdownOption<BankQuestionType>[] = bankQuestionTypeOptions;

	untypedLabel : string = bankQuestionUntypedOption.label;

	destroy$ : Subject<string> = new Subject<string>();

	observeResetForm : Subject<string> = new Subject<string>();

	canAddMorePart : Signal<boolean> = computed( () : boolean => {
		return ! ( this.structure()[ "part-1" ].question && this.structure()[ "part-2" ].question && this.structure()[ "part-3" ].question && this.structure()[ "part-4" ].question )
	} );

	formControl : BankEnglishFromControl = {
		formGroup : this.fb.group( {
			bank_id         : [ 0 , [ Validators.required , Validators.min( 1 ) ] ] ,
			group_id        : [ 0 ] ,
			question_number : [ 0 , [ Validators.required , Validators.min( 1 ) ] ] ,
			code            : [ '' , Validators.required ] ,
			content         : [ '' , Validators.required ]
		} ) ,
		loading   : true ,
		visible   : false ,
		options   : [] ,
		object    : null ,
		formType  : 'create'
	};

	private loadQuestions () : void {
		this.search = '';
		// this.data.set( [] );
		this.load();
	}

	private load () : void {
		this.state.set( 'loading' );
		this.service.load( this.search , this.bankId , { paged : 1 , orderby : "question_number" , order : "ASC" , limit : -1 } ).pipe(
			map( ( res : DtoObject<BankQuestion[]> ) : BankQuestionEditorNode[] => {
				if ( res.data.length ) {
					return res.data.filter( ( i : BankQuestion ) : boolean => i.group_id === 0 ).map( ( part : BankQuestion ) : BankQuestionEditorNode => ( {
						... part ,
						children : res.data.filter( ( c : BankQuestion ) : boolean => c.group_id === part.id ).map(
							( parentQuestion : BankQuestion ) : BankQuestionEditorNode => ( {
								... parentQuestion ,
								children : res.data.filter( ( _child : BankQuestion ) : boolean => _child.group_id === parentQuestion.id ).map(
									( _childQuestion : BankQuestion ) : BankQuestionEditorNode => ( {
										... _childQuestion ,
										children : [] ,
										dirty    : false
									} )
								) ,
								dirty    : false
							} )
						) ,
						dirty    : false
					} ) );
				}
				else {
					return [];
				}
			} )
		).subscribe( {
			next  : ( res : BankQuestionEditorNode[] ) : void => {
				const parts : EnglishPartSlug[] = this.structureParts();
				this.structure.update( ( data : EnglishStructure ) : EnglishStructure => {
					return {
						... parts.reduce( ( reducer : EnglishStructure , slug : EnglishPartSlug ) : EnglishStructure => {
							reducer[ slug ].question = res.find( ( q : BankQuestionEditorNode ) : boolean => q.group_id === 0 && q.code === slug );
							return reducer
						} , data )
					};
				} );
				this.state.set( 'success' );
			} ,
			error : () : void => {
				this.state.set( 'error' );
			}
		} );
	}

	reload ( event : MouseEvent ) : void {
		event.preventDefault();
		event.stopPropagation();
		this.load();
	}

	onDrawerHide () : void {
		if ( this.dirty ) {
			this.load();
		}
	}

	openQuestionEditor ( question_id : number , parent? : BankQuestionEditorNode ) : void {
		this.configEditor.set( {
			format     : this.bankFormat ,
			bankId     : this.bankId ,
			groupId    : parent ? parent.id : 0 ,
			questionId : question_id ,
			code       : parent.code
		} );
		this.dirty          = false;
		this.sidebarVisible = true;
	}

	setBankAsDirty () : void {
		this.dirty = true;
	}

	closeEditPanel () : void {
		this.sidebarVisible = false;
		this.configEditor.set( null );
	}

	async delete ( id : number ) : Promise<void> {

		return Promise.resolve();

		/*		try {
		 const confirm : boolean = await this.notification.confirmDelete();
		 if ( confirm ) {
		 const question : BankQuestionEditorNode = this.data().find( ( i : BankQuestionEditorNode ) : boolean => i.id === id );
		 let request : Observable<any>           = this.service.delete( question.id );
		 if ( question.children && question.children.length ) {
		 request = this._deleteChildrenFrom( question.id ).pipe(
		 switchMap( () : Observable<any> => this.service.delete( question.id ) )
		 )
		 }
		 this.notification.isProcessing( true );
		 request.pipe(
		 takeUntil( this.destroy$ )
		 ).subscribe( {
		 next  : () : void => {
		 this.data.update( ( store : BankQuestionEditorNode[] ) : BankQuestionEditorNode[] => {
		 return [ ... store.filter( ( node : BankQuestionEditorNode ) : boolean => node.id !== id ) ];
		 } );
		 this.notification.isProcessing( false );
		 this.notification.toastSuccess( 'Thành công' );
		 } ,
		 error : () : void => {
		 this.notification.isProcessing( false );
		 this.notification.toastError( 'Mất kết nối với máy chủ!' );
		 }
		 } )
		 }
		 }
		 catch ( e ) {

		 }*/
	}

	private _deleteChildrenFrom ( parentId : number ) : Observable<any> {
		return of( 'done' );


		// const question : BankQuestionEditorNode = this.data().find( ( i : BankQuestionEditorNode ) : boolean => i.id === parentId );
		// if ( question.children.length ) {
		// 	const selectedChild : BankQuestionEditorNode = question.children[ 0 ];
		// 	return this.service.delete( selectedChild.id ).pipe(
		// 		switchMap( () : Observable<any> => {
		// 			this.data.update( ( store : BankQuestionEditorNode[] ) : BankQuestionEditorNode[] => {
		// 				return store.map( ( parentNode : BankQuestionEditorNode ) : BankQuestionEditorNode => {
		// 					if ( parentNode.id === parentId ) {
		// 						parentNode.children = parentNode.children.filter( ( i : BankQuestionEditorNode ) : boolean => i.id !== selectedChild.id );
		// 					}
		// 					return parentNode;
		// 				} );
		// 			} )
		// 			return this._deleteChildrenFrom( parentId );
		// 		} )
		// 	)
		// }
		// else {
		// 	return of( 'done' );
		// }
	}

	createNewPart () : void {
		if ( this.canAddMorePart() ) {
			this.resetFromControl( null );
			this.formControl.visible = true;
		}
	}

	updatePart ( part : EnglishPartSlug ) : void {
		this.resetFromControl( this.structure()[ part ][ 'question' ] );
		this.formControl.visible = true;
	}

	private resetFromControl ( object : BankQuestionEditorNode ) : void {
		this.observeResetForm.next( 'reset' );
		this.formControl.formType = object ? 'edit' : 'create'
		this.formControl.formGroup.reset( {
			bank_id         : object ? object.bank_id : this.bankId ,
			group_id        : object ? object.group_id : 0 ,
			question_number : object ? object.question_number : 0 ,
			code            : object ? object.code : '' ,
			content         : object ? object.content : ''
		} );
		this.formControl.object  = object;
		this.formControl.options = Object.keys( this.structure() ).reduce( ( reducer : IctuDropdownOption<EnglishPartSlug>[] , part : EnglishPartSlug ) : IctuDropdownOption<EnglishPartSlug>[] => {
			reducer.push( { value : part , label : this.structure()[ part ].name , disabled : !! this.structure()[ part ].question } )
			return reducer;
		} , [] );

		if ( this.formControl.formType === 'create' ) {
			this.formControl.formGroup.get( 'code' ).valueChanges.pipe(
				takeUntil( merge( this.destroy$ , this.observeResetForm ) )
			).subscribe( ( value : EnglishPartSlug ) : void => {
				this.formControl.formGroup.get( 'question_number' ).setValue( this.structure()[ value ].order )
			} );
		}

		this.formControl.loading = false;
	}

	closeFromPanel () : void {
		this.formControl.visible = false;
		this.observeResetForm.next( 'reset' );
		setTimeout( () : void => {
			this.formControl.formGroup.reset( {
				bank_id         : this.bankId ,
				group_id        : 0 ,
				question_number : 0 ,
				code            : '' ,
				content         : ''
			} );
		} , 500 );
	}

	private filterTheRequiredFieldsOfQuestion ( { bank_id , type , content , options , correct_answer , question_number , ordering , configs , hint , explain , status , group_id , media , scoring_guide , code } : BankQuestionEditorNode ) : Omit<BankQuestionBase , 'id'> {
		return { type , bank_id , content , options , correct_answer , question_number , ordering , configs , hint , explain , status , group_id , media , scoring_guide , code };
	}

	submitForm () : void {
		this.formControl.loading            = true;
		const info : BankQuestionEditorNode = questionCreator[ 'radio' ]( null , this.formControl.formGroup.value );
		const request : Observable<any>     = this.formControl.formType === 'create' ? this.service.create( this.filterTheRequiredFieldsOfQuestion( info ) ) : this.service.update( this.formControl.object.id , this.filterTheRequiredFieldsOfQuestion( info ) )
		request.pipe(
			takeUntil( this.destroy$ )
		).subscribe( {
			next  : () : void => {
				this.dirty = true;
				this.notification.toastSuccess( 'Thêm mới thành công' );
				this.closeFromPanel();
			} ,
			error : () : void => {
				this.notification.toastError( 'Mất kết nối với máy chủ' );
				this.formControl.loading = false;
			}
		} )
	}

	structureParts () : EnglishPartSlug[] {
		return Object.keys( this.structure() ) as EnglishPartSlug[];
	}

	ngOnDestroy () : void {
		this.destroy$.next( 'completed' );
		this.destroy$.complete();
	}


	protected readonly Object = Object;
}
