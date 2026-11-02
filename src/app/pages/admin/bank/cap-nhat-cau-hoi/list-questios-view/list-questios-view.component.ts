import { Component , EventEmitter , Input , OnInit , Output } from "@angular/core";
import { CommonModule , JsonPipe , NgClass , NgForOf , NgIf , NgSwitch , NgSwitchCase , NgSwitchDefault } from "@angular/common";
import { SafeHtmlSinglePipe } from "@pages/admin/bank/cap-nhat-cau-hoi/pipes/safe-html-single.pipe";
import { LoadMediaOnTextDirective } from "../../../../../directives/load-media-on-text.directive";
import { QuestionTypeRadioEditorComponent } from "@pages/admin/bank/cap-nhat-cau-hoi/question-types/question-type-radio-editor/question-type-radio-editor.component";
import { RippleModule } from "primeng/ripple";
import { ButtonModule } from "primeng/button";
import { TooltipModule } from "primeng/tooltip";
import { IctuMediaLinkPipe } from "@pages/admin/bank/cap-nhat-cau-hoi/pipes/ictu-media-link.pipe";
import { ExtractCorrectAnswerPipe } from "@pages/admin/bank/cap-nhat-cau-hoi/pipes/extract-correct-answer.pipe";
import { GroupInputQuestionComponent } from "@pages/admin/bank/cap-nhat-cau-hoi/question-types/group-input-question/group-input-question.component";
import { QuestionPrefixPipe } from "@pages/admin/bank/cap-nhat-cau-hoi/pipes/question-prefix.pipe";
import { IsAnswerCorrectPipe } from "@pages/admin/bank/cap-nhat-cau-hoi/list-questios-view/is-answer-correct.pipe";
import { InputTextareaModule } from "primeng/inputtextarea";
import { InputTextModule } from "primeng/inputtext";
import { TnBankQuestion } from "@model/tn-bank-question";
import { AnswerLabelPipe } from "@pages/admin/bank/cap-nhat-cau-hoi/list-questios-view/answer-label.pipe";
import { SafeUrlPipe } from "../../../../../pipes/safe-url.pipe";
import { ACCESS_TOKEN_KEY } from "@env";
import { Observable , of , switchMap } from "rxjs";
import { NotificationService } from "@appNotification";
import { TnBankQuestionService } from "@service/luyenthithpt/tn-bank-question.service";
import { IctuMediaLoaderDirective } from "src/app/directives/ictu-media-loader.directive";
import { FormsModule } from "@angular/forms";
import { SafeHtmlPipe } from "src/app/pipes/safe-html.pipe";
import { GroupRadioQuestionEditorComponent } from "../question-types/group-radio-question-editor/group-radio-question-editor.component";

@Component( {
	selector    : "app-list-questios-view" ,
	templateUrl : "./list-questios-view.component.html" ,
	styleUrls   : [ "./list-questios-view.component.css" ] ,
	imports     : [
		NgSwitch ,
		SafeHtmlSinglePipe ,
		LoadMediaOnTextDirective ,
		GroupRadioQuestionEditorComponent ,
		QuestionTypeRadioEditorComponent ,
		NgIf ,
		NgForOf ,
		NgSwitchCase ,
		RippleModule ,
		ButtonModule ,
		TooltipModule ,
		NgClass ,
		IctuMediaLinkPipe ,
		ExtractCorrectAnswerPipe ,
		GroupInputQuestionComponent ,
		QuestionPrefixPipe ,
		IsAnswerCorrectPipe ,
		InputTextareaModule ,
		JsonPipe ,
		NgSwitchDefault ,
		InputTextModule ,
		AnswerLabelPipe ,
		SafeUrlPipe ,
		IctuMediaLoaderDirective ,
		CommonModule ,
		FormsModule ,
		SafeHtmlPipe
	] ,
	standalone  : true
} )
export class ListQuestiosViewComponent implements OnInit {
	@Input() triggerChange : boolean                  = false;
	@Output() openEdit : EventEmitter<TnBankQuestion> =
		          new EventEmitter<TnBankQuestion>();

	@Input() set bankQuestions ( questions : TnBankQuestion[] ) {
		this.listQuestionsDefault = questions;
		this.loadData( this.listQuestionsDefault );
	}

	@Input() set search ( input : string ) {
		this.searQuestion( input );
	}

	_search : string             = "";
	@Input() testFormat : string = "monkhac";

	listQuestions : TnBankQuestion[];

	listQuestionsDefault : TnBankQuestion[];

	token : string = ACCESS_TOKEN_KEY;

	// index : number = 1;
	constructor (
		private notifi : NotificationService ,
		private bankQuestionService : TnBankQuestionService
	) {
	}

	ngOnInit () : void {
	}

	loadData ( questions : TnBankQuestion[] ) {
		this.listQuestions = questions.map( ( q ) => {
			if ( q.question_type == "group" ) {
				//question type is group. loop through children question and update set answers
				q.children = q.children.map( ( c ) => {c[ "answer" ] = c.answer_correct ? c.answer_correct.split( "|" ).map( ( i : string ) : string => ( i ? i.trim() : "" ) ).filter( Boolean ).join( ";" ) : "";
					return c;
				} );
				return q;
			}
			else {
				// orther question type.
				q[ "answer" ] = q.answer_correct
				                ? q.answer_correct.split( "|" ).map( ( i : string ) : string => ( i ? i.trim() : "" ) ).filter( Boolean ).join( ";" )
				                : "";
				return q;
			}
		} );
	}

	async btnDelete ( q : TnBankQuestion ) : Promise<void> {
		const confirm : boolean = await this.notifi.confirmDelete();
		if ( confirm ) {
			const deleteChildrenFirst : Observable<any> = q[ "children" ].length
			                                              ? this.bankQuestionService.deleteTnQuestionsBy(
					"group_id" ,
					q.id.toString( 10 )
				)
			                                              : of( [] );
			this.notifi.isProcessing( true );
			deleteChildrenFirst.pipe(
				switchMap(
					() : Observable<number> =>
						this.bankQuestionService.deleteTnBankQuestion( q.id.toString() )
				)
			).subscribe( {
				next  : () : void => {
					this.listQuestions.filter( ( f ) => f.id !== q.id );
					this.notifi.toastSuccess( "Xóa câu hỏi thành công" );
					this.notifi.isProcessing( false );
				} ,
				error : () : void => {
					this.notifi.isProcessing( false );
					this.notifi.toastError( "Mất kết nối với máy chủ" );
				}
			} );
		}
	}

	btnEdit ( e : TnBankQuestion ) {

		this.openEdit.emit( e );
	}

	searQuestion ( name : string ) {
		if ( this.listQuestionsDefault && this.listQuestionsDefault.length > 0 ) {
			if ( name && name.trim().length !== 0 ) {
				const a = [];
				this.listQuestionsDefault.forEach( ( f , key ) => {
					let namePart = "PART ".concat(
						( f.part / 10 ).toString() ,
						f.question_direction.toLowerCase() ,
						" #".concat( f.id.toString() )
					);
					if ( f.media && f.media[ "exam_paper_code" ] ) {
						namePart = "".concat( namePart , " " , f.media[ "exam_paper_code" ] );
					}
					const index = namePart.toLowerCase().indexOf( name.toLowerCase() );
					if ( index !== -1 ) {
						a.push( f );
					}
				} );
				this.listQuestions = [ ... a ];
			}
			else {
				this.listQuestions = [ ... this.listQuestionsDefault ];
			}
		}
		else {
			this.listQuestions = this.listQuestionsDefault;
		}
	}
}
