import { Component , computed , inject , Input , numberAttribute , OnDestroy , Signal , signal , WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputTextModule } from "primeng/inputtext";
import { ComponentStateExtend , IctuDropdownOption } from "@model/commons";
import { MatButtonModule } from "@angular/material/button";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { NotificationService } from "@appNotification";
import { ReactiveFormsModule } from "@angular/forms";
import { QuestionsService } from "@service/luyenthithpt/questions.service";
import { map , Observable , of , Subject , switchMap , takeUntil } from "rxjs";
import { DtoObject } from "@model/dto";
import { BankQuestion , BankQuestionType } from "@model/bank-question";
import { BankFormat } from "@model/tn-bank";
import { DropdownModule } from "primeng/dropdown";
import { InputTextareaModule } from "primeng/inputtextarea";
import { PaginatorModule } from "primeng/paginator";
import { SharedModule } from "primeng/api";
import { SidebarModule } from "primeng/sidebar";
import { BankQuestionEditorComponent , BankQuestionEditorConfig } from "@pages/admin/bank/bank-question-editor/bank-question-editor.component";
import { ButtonModule } from "primeng/button";
import { RippleModule } from "primeng/ripple";
import { TooltipModule } from "primeng/tooltip";
import { IsAnswerCorrectPipe } from "@pages/admin/bank/cap-nhat-cau-hoi/list-questios-view/is-answer-correct.pipe";
import { QuestionPrefixPipe } from "@pages/admin/bank/cap-nhat-cau-hoi/pipes/question-prefix.pipe";
import { SafeHtmlSinglePipe } from "@pages/admin/bank/cap-nhat-cau-hoi/pipes/safe-html-single.pipe";
import { LoadMediaOnTextDirective } from "../../../../directives/load-media-on-text.directive";
import { IctuMediaLoaderDirective } from "../../../../directives/ictu-media-loader.directive";
import { BankQuestionEditorNode } from "@pages/admin/bank/bank-question-types/bank-question-node.model";
import { ListCorrectAnswersDirective } from "@pages/admin/bank/directives/list-correct-answers.directive";
import { IctuDropdownOptionMapPipe } from "../../../../pipes/ictu-dropdown-option-map.pipe";
import { bankQuestionTypeOptions , bankQuestionUntypedOption } from "@utilities/syscats";
import { SafeHtmlPipe } from "../../../../pipes/safe-html.pipe";
import { MatchCorrectAnswersPipe } from "@pages/admin/bank/pipes/match-correct-answers.pipe";
import { PreviewQuestionMatchingComponent } from "@pages/admin/bank/bank-question-preview/preview-question-matching/preview-question-matching.component";

@Component( {
	selector    : 'app-bank-questions' ,
	standalone  : true ,
	imports : [ CommonModule , InputTextModule , MatButtonModule , MatTooltipModule , MatProgressBarModule , DropdownModule , InputTextareaModule , PaginatorModule , ReactiveFormsModule , SharedModule , SidebarModule , BankQuestionEditorComponent , ButtonModule , RippleModule , TooltipModule , IsAnswerCorrectPipe , QuestionPrefixPipe , SafeHtmlSinglePipe , LoadMediaOnTextDirective , IctuMediaLoaderDirective , ListCorrectAnswersDirective , IctuDropdownOptionMapPipe , SafeHtmlPipe , MatchCorrectAnswersPipe , PreviewQuestionMatchingComponent ] ,
	templateUrl : './bank-questions.component.html' ,
	styleUrls   : [ './bank-questions.component.css' ]
} )
export class BankQuestionsComponent implements OnDestroy {

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

	@Input( { alias : 'format' , required : true } ) bankFormat : BankFormat = 'standard';

	@Input( { alias : 'bankName' , required : true } ) bankName : string = '';

	private readonly service : QuestionsService = inject<QuestionsService>( QuestionsService );

	private readonly notification : NotificationService = inject<NotificationService>( NotificationService );

	readonly state : WritableSignal<ComponentStateExtend> = signal<ComponentStateExtend>( 'loading' );

	readonly data : WritableSignal<BankQuestionEditorNode[]> = signal<BankQuestionEditorNode[]>( [] );

	readonly isEmpty : Signal<boolean> = computed( () : boolean => ! this.data().length );

	search : string = "";

	sidebarVisible : boolean = false;

	private dirty : boolean = false;

	question : WritableSignal<BankQuestionEditorNode> = signal<BankQuestionEditorNode>( null );

	sidebarHeading : Signal<string> = computed( () : string => this.question() ? 'Cập nhật câu hỏi' : 'Soạn câu hỏi' );

	configEditor : WritableSignal<BankQuestionEditorConfig> = signal<BankQuestionEditorConfig>( null );

	bankQuestionTypeOptions : IctuDropdownOption<BankQuestionType>[] = bankQuestionTypeOptions;

	untypedLabel : string = bankQuestionUntypedOption.label;

	destroy$ : Subject<string> = new Subject<string>();

	private loadQuestions () : void {
		this.search = '';
		this.data.set( [] );
		this.load();
	}

	private load () : void {
		this.state.set( 'loading' );
		this.service.load( this.search , this.bankId , { paged : 1 , orderby : "question_number" , order : "ASC" , limit : -1 } ).pipe(
			map( ( res : DtoObject<BankQuestion[]> ) : BankQuestionEditorNode[] => {
				// this.loadMoreButton.visible = res.data.length === this.service.limit;
				if ( res.data.length ) {
					return res.data.filter( ( i : BankQuestion ) : boolean => i.group_id === 0 ).map( ( i : BankQuestion ) : BankQuestionEditorNode => ( {
						... i ,
						children : res.data.filter( ( c : BankQuestion ) : boolean => c.group_id === i.id ).map(
							( child : BankQuestion ) : BankQuestionEditorNode => ( {
								... child ,
								children : [] ,
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
			next  : ( data : BankQuestionEditorNode[] ) : void => {
				// this.data.update( ( data : BankQuestionEditorNode[] ) : BankQuestionEditorNode[] => {
				// 	return paged === 1 ? newData : [ ... data , ... newData ];
				// } );

				this.data.set( data );
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

	openQuestionEditor ( question_id : number ) : void {
		this.configEditor.set( {
			format     : this.bankFormat ,
			bankId     : this.bankId ,
			questionId : question_id
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
		try {
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

		}
	}

	private _deleteChildrenFrom ( parentId : number ) : Observable<any> {
		const question : BankQuestionEditorNode = this.data().find( ( i : BankQuestionEditorNode ) : boolean => i.id === parentId );
		if ( question.children.length ) {
			const selectedChild : BankQuestionEditorNode = question.children[ 0 ];
			return this.service.delete( selectedChild.id ).pipe(
				switchMap( () : Observable<any> => {
					this.data.update( ( store : BankQuestionEditorNode[] ) : BankQuestionEditorNode[] => {
						return store.map( ( parentNode : BankQuestionEditorNode ) : BankQuestionEditorNode => {
							if ( parentNode.id === parentId ) {
								parentNode.children = parentNode.children.filter( ( i : BankQuestionEditorNode ) : boolean => i.id !== selectedChild.id );
							}
							return parentNode;
						} );
					} )
					return this._deleteChildrenFrom( parentId );
				} )
			)
		}
		else {
			return of( 'done' );
		}
	}

	ngOnDestroy () : void {
		this.destroy$.next( 'completed' );
		this.destroy$.complete();
	}
}
