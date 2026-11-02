import { Component , inject , OnDestroy , OnInit , signal , WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder , FormControl , FormGroup , FormsModule , ReactiveFormsModule , Validators } from "@angular/forms";
import { Assignment } from "@model/assignment";
import { BankQuestion , IctuQuestionAnswer } from "@model/bank-question";
import { ShiftRegisterTestPicks } from "@pages/admin/giao-vien/children/cham-thi/cham-thi.component";
import { InputTextModule } from "primeng/inputtext";
import { MatButtonModule } from "@angular/material/button";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { InputTextareaModule } from "primeng/inputtextarea";
import { ShiftRegisterTestService } from "@service/luyenthithpt/shift-register-test.service";
import { ShiftRegisterTestAnswersService } from "@service/luyenthithpt/shift-register-test-answers.service";
import { QuestionsService } from "@service/luyenthithpt/questions.service";
import { AssignmentsService } from "@service/luyenthithpt/assignments.service";
import { AuthService } from "@service/core/auth.service";
import { Router } from "@angular/router";
import { NotificationService } from "@appNotification";
import { debounceTime , forkJoin , map , Observable , of , Subject , switchMap , takeUntil } from "rxjs";
import { ComponentBaseState } from "@model/commons";
import { decimalNumberValidator , parseDecimal } from "@utilities/helper";
import { BUTTON_CANCEL , BUTTON_CONFIRMED , ButtonBase } from "@model/button";
import { DtoObject , IctuConditionParam , IctuQueryCondition , IctuQueryParams } from "@model/dto";
import { ShiftRegisterTest } from "@model/shift-register-test";
import { ShiftRegisterTestAnswers } from "@model/shift-register-test-answers";
import { NumericInputDirective } from "../../directives/numeric-input.directive";
import { ParagraphCounterPipe } from "../../pipes/paragraph-counter.pipe";
import { SafeHtmlPipe } from "../../pipes/safe-html.pipe";
import { WordsCounterPipe } from "../../pipes/words-counter.pipe";

type GradingAssignmentFormGroup = {
	question_id : FormControl<number>,
	shift_register_test_id : FormControl<number>,
	teacher_id : FormControl<number>,
	score : FormControl<string>,
	comments : FormControl<string>,
	status : FormControl<number>,
}

type  GradingAssignmentTabName = 'content' | 'guide';

type GradingAssignmentPicked = Pick<Assignment , 'id' | 'question_id' | 'shift_register_test_id' | 'teacher_id' | 'score' | 'comments' | 'status'>;

type GradingAssignmentQuestion = Pick<BankQuestion , 'id' | 'type' | 'group_id' | 'scoring_guide'>;

type GradingAssignmentAnswer = Pick<IctuQuestionAnswer , 'id' | 'question_id' | 'shift_register_test_id' | 'answer' | 'temporary' | 'result' | 'status'>;

interface GradingAssignmentInfo {
	test : ShiftRegisterTestPicks,
	assignment : GradingAssignmentPicked,
	question : GradingAssignmentQuestion,
	answer : GradingAssignmentAnswer,
}

@Component( {
	selector    : 'app-grading-assigment-list' ,
	standalone  : true ,
	imports : [ CommonModule , InputTextModule , MatButtonModule , MatProgressBarModule , InputTextareaModule , FormsModule , ReactiveFormsModule , NumericInputDirective , ParagraphCounterPipe , SafeHtmlPipe , WordsCounterPipe ] ,
	templateUrl : './grading-assigment-list.component.html' ,
	styleUrls   : [ './grading-assigment-list.component.css' ]
} )
export class GradingAssigmentListComponent implements OnInit , OnDestroy {

	private _info : GradingAssignmentInfo = {
		test       : null ,
		assignment : null ,
		question   : null ,
		answer     : null
	};

	get info () : GradingAssignmentInfo {
		return this._info;
	}

	set info ( info : GradingAssignmentInfo ) {
		this._info                                                                                                                 = info;
		const value : Pick<Assignment , 'question_id' | 'comments' | 'score' | 'shift_register_test_id' | 'status' | 'teacher_id'> = {
			question_id            : 0 ,
			comments               : '' ,
			score                  : '' ,
			shift_register_test_id : 0 ,
			status                 : 2 ,
			teacher_id             : 0
		}
		if ( info.answer ) {
			value.teacher_id             = info.test.teacher_id;
			value.question_id            = info.answer.question_id;
			value.shift_register_test_id = info.answer.shift_register_test_id;
		}
		if ( info.assignment ) {
			value.comments = info.assignment.comments;
			value.score    = info.assignment.score;
		}
		this.form.reset( value );
	}

	private readonly shiftRegisterTestService : ShiftRegisterTestService = inject( ShiftRegisterTestService );

	private readonly shiftRegisterTestAnswersService : ShiftRegisterTestAnswersService = inject( ShiftRegisterTestAnswersService );

	private readonly questionsService : QuestionsService = inject( QuestionsService );

	private readonly assignmentsService : AssignmentsService = inject( AssignmentsService );

	private readonly auth : AuthService = inject( AuthService );

	private readonly fb : FormBuilder = inject( FormBuilder );

	private readonly router : Router = inject( Router );

	private readonly notificationService : NotificationService = inject( NotificationService );

	private readonly destroy$ : Subject<void> = new Subject<void>();

	readonly tabActive : WritableSignal<GradingAssignmentTabName> = signal( 'content' );

	readonly state : WritableSignal<ComponentBaseState | 'submitting' | 'submitFail' | 'empty' | 'emptyQuestion' | 'emptyAnswer'> = signal<ComponentBaseState>( 'loading' );

	form : FormGroup<GradingAssignmentFormGroup> = this.fb.group( {
		question_id            : [ 0 , [ Validators.required , Validators.min( 1 ) ] ] ,
		shift_register_test_id : [ 0 , [ Validators.required , Validators.min( 1 ) ] ] ,
		teacher_id             : [ 0 , [ Validators.required , Validators.min( 1 ) ] ] ,
		score                  : [ '' , [ Validators.required , decimalNumberValidator() ] ] ,
		comments               : [ '' ] ,
		status                 : [ 0 ]
	} );

	private requestBackToDashboardObserver : Subject<void> = new Subject<void>();

	private submitFormObserver : Subject<Partial<Assignment>> = new Subject<Partial<Assignment>>();

	readonly isProcessing : WritableSignal<boolean> = signal<boolean>( false );

	private _submitInfo : Partial<Assignment> = null;

	ngOnInit () : void {
		this.loadData();
		this.requestBackToDashboardObserver.pipe(
			takeUntil( this.destroy$ ) ,
			debounceTime( 300 ) ,
			switchMap( () : Observable<ButtonBase> => this.notificationService.confirm( {
				title   : 'Xác nhận chuyển hướng' ,
				heading : 'Bạn có chắc chắn muốn trở lại trang chủ không ?' ,
				message : '' ,
				buttons : [
					{ ... BUTTON_CANCEL , label : '[Không] - Huỷ yêu cầu' , icon : '' , class : 'p-button-secondary theme-button' } ,
					{ ... BUTTON_CONFIRMED , label : '[Có] - Tôi xác nhận' , icon : '' , class : 'p-button-primary theme-button' }
				]
			} ) )
		).subscribe( {
			next : ( { name } : ButtonBase ) : void => {
				if ( name === 'confirmed' ) {
					void this.router.navigate( [ '/admin/giao-vien/ket-qua-cham-thi' ] );
				}
				else {
					this.loadData();
				}
				this.isProcessing.set( false );
			} ,
			error () : void {
				this.loadData();
				this.isProcessing.set( false );
			}
		} )

		this.submitFormObserver.pipe(
			takeUntil( this.destroy$ ) ,
			debounceTime( 500 )
		).subscribe( ( info : Partial<Assignment> ) : void => {
			this._submitInfo = info;
			this.submitForm( info );
		} )
	}

	reload ( event : MouseEvent ) : void {
		event.preventDefault();
		event.stopPropagation();
		this.loadData();
	}

	loadData () : void {
		this.state.set( 'loading' );
		const conditions : IctuConditionParam[] = [
			{ conditionName : 'status' , condition : IctuQueryCondition.equal , value : '3' } ,
			{ conditionName : 'teacher_id' , condition : IctuQueryCondition.equal , value : this.auth.teacher.id.toString( 10 ) , orWhere : "and" }
		];
		const queryParams : IctuQueryParams     = { limit : 1 , paged : 1 , select : 'id,shift_register_id,score,teacher_id,status,question_ids' };
		this.shiftRegisterTestService.query( conditions , queryParams ).pipe(
			map( ( response : DtoObject<ShiftRegisterTest[]> ) : ShiftRegisterTestPicks => response.data.length ? response.data[ 0 ] : null ) ,
			switchMap( ( test : ShiftRegisterTestPicks ) : Observable<GradingAssignmentInfo> => {
				const _conditions1 : IctuConditionParam[] = [
					{ conditionName : 'type' , condition : IctuQueryCondition.equal , value : 'textarea' } ,
					{ conditionName : 'group_id' , condition : IctuQueryCondition.equal , value : '0' , orWhere : "and" }
				];
				const _params : IctuQueryParams           = { limit : 1 , paged : 1 , select : 'id,type,group_id,scoring_guide' };
				let hasQuestions : boolean                = false;
				if ( test && Array.isArray( test.question_ids ) && test.question_ids.length ) {
					hasQuestions       = true;
					_params.include    = test.question_ids.join( ',' );
					_params.include_by = 'id';
				}
				return forkJoin<{
					test : Observable<ShiftRegisterTestPicks>,
					assignment : Observable<GradingAssignmentPicked>,
					question : Observable<GradingAssignmentQuestion>,
					answer : Observable<GradingAssignmentAnswer>,
				}>( {
					test       : of( test ) ,
					assignment : test ? this.getAssignment( test.id ) : of( null ) ,
					question   : hasQuestions ? this.questionsService.query( _conditions1 , _params ).pipe( map( ( _res : DtoObject<BankQuestion[]> ) : GradingAssignmentQuestion => _res.data.length ? _res.data[ 0 ] : null ) ) : of( null ) ,
					answer     : of( null )
				} );
			} ) ,
			switchMap( ( response : GradingAssignmentInfo ) : Observable<GradingAssignmentInfo> => {
				if ( response.question && response.test ) {
					const _conditions2 : IctuConditionParam[] = [
						{ conditionName : 'shift_register_test_id' , condition : IctuQueryCondition.equal , value : response.test.id.toString( 10 ) } ,
						{ conditionName : 'question_id' , condition : IctuQueryCondition.equal , value : response.question.id.toString( 10 ) , orWhere : "and" }
					];
					const _params2 : IctuQueryParams          = { limit : '1' , paged : '1' , select : 'id,question_id,shift_register_test_id,answer,temporary,result,status' };
					return this.shiftRegisterTestAnswersService.query( _conditions2 , _params2 ).pipe(
						map( ( _response : DtoObject<ShiftRegisterTestAnswers[]> ) : GradingAssignmentInfo => {
							const answer : GradingAssignmentAnswer = _response.data.length ? _response.data[ 0 ] : null;
							return { ... response , answer }
						} )
					);
				}
				else {
					return of( response );
				}
			} ) ,
			takeUntil( this.destroy$ )
		).subscribe( {
			next  : ( info : GradingAssignmentInfo ) : void => {
				console.log( info );

				switch ( true ) {
					case ( ! info.test ):
						this.state.set( 'empty' );
						break;
					case ( ! info.question ):
						this.state.set( 'emptyQuestion' );
						break;
					case ( ! info.answer ):
						this.state.set( 'emptyAnswer' );
						break;
					default:
						this.info = info;
						this.state.set( 'success' );
						break;
				}
			} ,
			error : () : void => {
				this.state.set( 'error' );
			}
		} );
	}

	private getAssignment ( shift_register_test_id : number ) : Observable<GradingAssignmentPicked> {
		const conditions : IctuConditionParam[] = [
			{
				conditionName : 'shift_register_test_id' ,
				condition     : IctuQueryCondition.equal ,
				value         : shift_register_test_id.toString( 10 )
			}
		];
		const queryParams : IctuQueryParams     = {
			limit  : 1 ,
			paged  : 1 ,
			select : 'id,question_id,shift_register_test_id,teacher_id,score,comments,status'
		};
		return this.assignmentsService.query( conditions , queryParams ).pipe(
			map( ( response : DtoObject<Assignment[]> ) : GradingAssignmentPicked => response.data.length ? response.data[ 0 ] : null )
		);
	}

	btnChangeTab ( tab : GradingAssignmentTabName ) : void {
		this.tabActive.set( tab );
	}

	backToDashboard ( event : MouseEvent ) : void {
		event.preventDefault();
		event.stopPropagation();
		this.isProcessing.set( true );
		this.requestBackToDashboardObserver.next();
	}

	callSubmitForm () : void {
		if ( this.form.valid ) {
			this.isProcessing.set( true );
			this.submitFormObserver.next( { ... this.form.value , score : parseDecimal( this.form.value.score ).toString( 10 ) } );
		}
		else {
			this.isProcessing.set( true );
		}
	}

	private submitForm ( info : Partial<Assignment> ) : void {
		this.isProcessing.set( false );
		this.state.set( 'submitting' );
		const updateTests : Partial<ShiftRegisterTest> = {
			hand_score : info.score ,
			status     : 4
		}
		const request : Observable<any>                = this.info.assignment ? this.assignmentsService.update( this.info.assignment.id , info ) : this.assignmentsService.create( info );
		request.pipe( switchMap( () : Observable<any> => this.shiftRegisterTestService.update( info.shift_register_test_id , updateTests ) ) ).subscribe( {
			next  : () : void => {
				this.notificationService.toastSuccess( 'Cập nhât kết quả chấm thành công' );
				this.loadData();
			} ,
			error : () : void => {
				this.state.set( 'submitFail' );
			}
		} );
	}

	resubmitting ( event : MouseEvent ) : void {
		event.preventDefault();
		event.stopPropagation();
		this.submitForm( this._submitInfo );
	}

	ngOnDestroy () : void {
		this.destroy$.next();
		this.destroy$.complete();
	}

}
