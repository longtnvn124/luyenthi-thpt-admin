import { Component , computed , inject , OnDestroy , OnInit , Signal , signal , WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute , Router } from "@angular/router";
import { AuthService } from "@service/core/auth.service";
import { forkJoin , map , merge , Observable , of , Subject , switchMap , takeUntil } from "rxjs";
import { ComponentBaseState } from "@model/commons";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { MatButtonModule } from "@angular/material/button";
import { FormsModule , ReactiveFormsModule } from "@angular/forms";
import { InputTextareaModule } from "primeng/inputtextarea";
import { ParagraphCounterPipe } from "../../pipes/paragraph-counter.pipe";
import { WordsCounterPipe } from "../../pipes/words-counter.pipe";
import { SafeHtmlPipe } from "../../pipes/safe-html.pipe";
import { InputTextModule } from "primeng/inputtext";
import { AutosizeDirective } from "../../directives/autosize.directive";
import { ShiftRegisterTest } from "@model/shift-register-test";
import { Assignment } from "@model/assignment";
import { BankQuestion , IctuQuestionAnswer } from "@model/bank-question";
import { ShiftRegisterTestAnswersService } from "@service/luyenthithpt/shift-register-test-answers.service";
import { QuestionsService } from "@service/luyenthithpt/questions.service";
import { AssignmentsService } from "@service/luyenthithpt/assignments.service";
import { DtoObject , IctuConditionParam , IctuQueryCondition , IctuQueryParams } from "@model/dto";
import { ShiftRegisterTestAnswers } from "@model/shift-register-test-answers";
import { SafeHtmlSinglePipe } from "@pages/admin/bank/cap-nhat-cau-hoi/pipes/safe-html-single.pipe";
import { LoadMediaOnTextDirective } from "../../directives/load-media-on-text.directive";
import { IctuMediaLoaderDirective } from "../../directives/ictu-media-loader.directive";

type TabName = 'answered' | 'question' | 'guide';

export type GradingResultQueryParams = Pick<ShiftRegisterTest , 'id' | 'teacher_id'>

type GradingResultViewer = 'admin' | 'teacher' | 'student' | 'partner';

type GradingResultAnswer = Pick<IctuQuestionAnswer , 'id' | 'question_id' | 'shift_register_test_id' | 'answer' | 'temporary' | 'result' | 'status'>;

type GradingResultAssigment = Pick<Assignment , 'id' | 'question_id' | 'shift_register_test_id' | 'teacher_id' | 'score' | 'comments' | 'status'>;

type GradingResultQuestion = Pick<BankQuestion , 'id' | 'type' | 'group_id' | 'scoring_guide' | 'content'>;

interface GradingResultResponse {
	answerObject : GradingResultAnswer,
	assigment : GradingResultAssigment,
	question : GradingResultQuestion,
}

@Component( {
	selector    : 'app-grading-results' ,
	standalone  : true ,
	imports     : [ CommonModule , MatProgressBarModule , MatButtonModule , FormsModule , InputTextareaModule , ParagraphCounterPipe , WordsCounterPipe , SafeHtmlPipe , InputTextModule , ReactiveFormsModule , AutosizeDirective , SafeHtmlSinglePipe , LoadMediaOnTextDirective , IctuMediaLoaderDirective ] ,
	templateUrl : './grading-results.component.html' ,
	styleUrls   : [ './grading-results.component.css' ]
} )
export default class GradingResultsComponent implements OnInit , OnDestroy {

	private readonly router : Router = inject( Router );

	private readonly activatedRoute : ActivatedRoute = inject( ActivatedRoute );

	private readonly auth : AuthService = inject<AuthService>( AuthService );

	private readonly shiftRegisterTestAnswersService : ShiftRegisterTestAnswersService = inject( ShiftRegisterTestAnswersService );

	private readonly questionsService : QuestionsService = inject( QuestionsService );

	private readonly assignmentsService : AssignmentsService = inject( AssignmentsService );

	private onDestroy$ : Subject<void> = new Subject<void>();

	private loaderObserver : Subject<void> = new Subject<void>();

	readonly tabActive : WritableSignal<TabName> = signal<TabName>( 'answered' );

	readonly state : WritableSignal<ComponentBaseState | 'invalid' | 'unauthorized'> = signal<ComponentBaseState>( 'loading' );

	private readonly data : WritableSignal<GradingResultResponse> = signal<GradingResultResponse>( {
		assigment    : null ,
		question     : null ,
		answerObject : null
	} );

	readonly answer : Signal<string> = computed( () : string => this.data().answerObject ? this.data().answerObject.answer : '' );

	readonly scoringGuide : Signal<string> = computed( () : string => this.data().question ? this.data().question.scoring_guide : 'Không có hướng dẫn chấm' );

	readonly comments : Signal<string> = computed( () : string => this.data().assigment ? this.data().assigment.comments : '' );

	readonly score : Signal<string> = computed( () : string => this.data().assigment ? this.data().assigment.score.toString() : '' );

	readonly questionContent : Signal<string> = computed( () : string => this.data().question ? this.data().question.content : '' );

	public params : GradingResultQueryParams = null;

	readonly reviewer : GradingResultViewer = 'student';

	constructor () {
		switch ( true ) {
			case this.auth.userHasRole( 'admin_luyenthi_thpt' ):
				this.reviewer = 'admin';
				break;
			case this.auth.userHasRole( 'teacher_luyenthi_thpt' ):
				this.reviewer = 'teacher';
				break;
			case this.auth.userHasRole( 'doitac' ):
				this.reviewer = 'partner';
				break;
			default:
				this.reviewer = 'student';
				break
		}
	}

	ngOnInit () : void {
		// Chặn copy, cut
		document.addEventListener( 'copy' , ( e ) => e.preventDefault() );
		document.addEventListener( 'cut' , ( e ) => e.preventDefault() );
		// Chặn chuột phải
		document.addEventListener( 'contextmenu' , ( e ) => e.preventDefault() );
		// Chặn chọn văn bản
		document.addEventListener( 'selectstart' , ( e ) => e.preventDefault() );

		if ( this.activatedRoute.snapshot.queryParamMap.has( 'hash' ) ) {
			const params : GradingResultQueryParams = this.decryptCode( decodeURIComponent( this.activatedRoute.snapshot.queryParamMap.get( 'hash' ) ) );
			if ( params ) {
				this.params = params;
				this.loadData( params );
			}
			else {
				this.state.set( 'invalid' );
			}
		}
		else {
			this.state.set( 'invalid' );
		}
	}

	get canShowguide () : boolean {
		return ! [ 'student' , 'partner' ].includes( this.reviewer );
	}

	reload ( event : MouseEvent ) : void {
		event.preventDefault();
		event.stopPropagation();
		this.loadData( this.params );
	}

	private decryptCode ( encrypted : string ) : GradingResultQueryParams {
		if ( encrypted ) {
			try {
				const str : string                      = this.auth.decryptData( encrypted );
				const params : GradingResultQueryParams = str ? JSON.parse( str ) : null;
				return params && params.id && params.teacher_id ? params : null;
			}
			catch ( e ) {
				return null;
			}
		}
		return null;
	}

	private loadData ( params : GradingResultQueryParams ) : void {
		this.state.set( 'loading' );
		this.loaderObserver.next();
		this.loadAssigmentFirst( params ).pipe(
			switchMap( ( assigment : GradingResultAssigment ) : Observable<GradingResultResponse> => forkJoin<{
				answerObject : Observable<GradingResultAnswer>,
				assigment : Observable<GradingResultAssigment>,
				question : Observable<GradingResultQuestion>
			}>( {
				assigment    : of( assigment ) ,
				answerObject : assigment ? this.loadAnswered( assigment ) : of( null ) ,
				question     : assigment ? this.loadQuestion( assigment ) : of( null )
			} ) ) ,
			takeUntil( merge( this.loaderObserver , this.onDestroy$ ) )
		).subscribe( {
			next  : ( data : GradingResultResponse ) : void => {
				if ( ! data.answerObject || ! data.assigment ) {
					this.state.set( 'unauthorized' );
				}
				else {
					this.data.set( data );
					this.state.set( 'success' );
				}
			} ,
			error : () : void => {
				this.state.set( 'error' );
			}
		} )
	}

	private loadAssigmentFirst ( params : GradingResultQueryParams ) : Observable<GradingResultAssigment> {
		const conditions : IctuConditionParam[] = [
			{ conditionName : 'shift_register_test_id' , condition : IctuQueryCondition.equal , value : params.id.toString( 10 ) } ,
			{ conditionName : 'teacher_id' , condition : IctuQueryCondition.equal , value : params.teacher_id.toString( 10 ) , orWhere : "and" }
		];
		const queryParams : IctuQueryParams     = {
			limit  : 1 ,
			paged  : 1 ,
			select : 'id,question_id,shift_register_test_id,teacher_id,score,comments,status'
		}
		return this.assignmentsService.query( conditions , queryParams ).pipe(
			map( ( response : DtoObject<Assignment[]> ) : GradingResultAssigment => response.data.length ? response.data[ 0 ] : null )
		)
	}

	private loadAnswered ( assigment : GradingResultAssigment ) : Observable<GradingResultAnswer> {
		const conditions : IctuConditionParam[] = [
			{ conditionName : 'question_id' , condition : IctuQueryCondition.equal , value : assigment.question_id.toString( 10 ) } ,
			{ conditionName : 'shift_register_test_id' , condition : IctuQueryCondition.equal , value : assigment.shift_register_test_id.toString( 10 ) , orWhere : "and" }
		];
		const queryParams : IctuQueryParams     = {
			limit  : 1 ,
			paged  : 1 ,
			select : 'id,question_id,shift_register_test_id,answer,temporary,result,status'
		};
		return this.shiftRegisterTestAnswersService.query( conditions , queryParams ).pipe(
			map( ( response : DtoObject<ShiftRegisterTestAnswers[]> ) : GradingResultAnswer => response.data.length ? response.data[ 0 ] : null )
		);
	}

	private loadQuestion ( assigment : GradingResultAssigment ) : Observable<GradingResultQuestion> {
		const conditions : IctuConditionParam[] = [
			{ conditionName : 'id' , condition : IctuQueryCondition.equal , value : assigment.question_id.toString( 10 ) }
		];
		const queryParams : IctuQueryParams     = {
			limit  : 1 ,
			paged  : 1 ,
			select : this.canShowguide ? 'id,scoring_guide,content' : 'id,content'
		};
		return this.questionsService.query( conditions , queryParams ).pipe(
			map( ( response : DtoObject<BankQuestion[]> ) : GradingResultQuestion => response.data.length ? response.data[ 0 ] : null )
		);
	}

	btnChangeTab ( tab : TabName ) : void {
		this.tabActive.set( tab );
	}

	backToDashboard ( event? : MouseEvent ) : void {
		if ( event ) {
			event.preventDefault();
			event.stopPropagation();
		}
		switch ( this.reviewer ) {
			case 'admin':
				void this.router.navigateByUrl( 'admin/ket-qua-cham-thi' );
				break;
			case 'teacher':
				void this.router.navigateByUrl( 'admin/giao-vien/ket-qua-cham-thi' );
				break;
			case 'partner':
				void this.router.navigateByUrl( 'admin/ket-qua-thi' );
				break;
			default:
				void this.router.navigateByUrl( 'admin/dashboard' );
				break;
		}
	}

	ngOnDestroy () : void {
		this.onDestroy$.next();
		this.onDestroy$.complete();
	}
}
