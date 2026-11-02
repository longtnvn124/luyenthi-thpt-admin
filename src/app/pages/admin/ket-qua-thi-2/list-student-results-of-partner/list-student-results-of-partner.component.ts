import { Component , inject , Input , numberAttribute , signal , TemplateRef , ViewChild , WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DotThiService } from "@service/luyenthithpt/dotthi.service";
import { ComponentStateExtend , IctuDropdownOptionExtended } from "@model/commons";
import { forkJoin , map , Observable , of , Subject , switchMap , takeUntil } from "rxjs";
import { IctuDataTable } from "@model/ictu-data-table";
import { InputTextModule } from "primeng/inputtext";
import { PaginatorModule } from "primeng/paginator";
import { ReactiveFormsModule } from "@angular/forms";
import { DotThiOption } from "@model/dotthi";
import { DoiTacThiSinhService } from "@service/luyenthithpt/doi-tac-thi-sinh.service";
import { DtoObject , IctuConditionParam , IctuQueryCondition , IctuQueryParams } from "@model/dto";
import { DoiTacThiSinh } from "@model/doi-tac-thi-sinh";
import { ShiftRegisterTest } from "@model/shift-register-test";
import { IctuPaginatorComponent } from "@theme/components/ictu-paginator/ictu-paginator.component";
import { InputSwitchModule } from "primeng/inputswitch";
import { MatButtonModule } from "@angular/material/button";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MonHocService } from "@service/luyenthithpt/mon-hoc.service";
import { MonHoc } from "@model/mon-hoc";
import { TooltipModule } from "primeng/tooltip";
import { NotificationService } from "@appNotification";
import { MatDialogRef } from "@angular/material/dialog";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { Helper } from "@utilities/helper";
import { GradingResultQueryParams } from "@pages/grading-results/grading-results.component";
import { Router } from "@angular/router";
import { AuthService } from "@service/core/auth.service";

interface TestResult extends Pick<DoiTacThiSinh , 'id' | 'ten' | 'hoten' | 'gioitinh' | 'subject_ids' | 'dotthi_id' | 'created_by' | 'email' | 'phone'> {
	test : ShiftRegisterTest[],
	results : TestSubjectReport[]
}

export type TestSubject = Pick<MonHoc , 'id' | 'name' | 'slug' | 'ordering'>;

export interface TestSubjectReport extends TestSubject {
	owned : boolean,
	attempt : number,
	lastScore : number,
}

interface PreLoadDto {
	subjects : TestSubject[],
	dotThiOptions : IctuDropdownOptionExtended<number , DotThiOption>[]
}

interface StudentTestDetail {
	attempts : ShiftRegisterTest[];
	result : TestResult;
	subject : TestSubject;
}

@Component( {
	selector    : 'app-list-student-results-of-partner' ,
	standalone  : true ,
	imports     : [ CommonModule , InputTextModule , PaginatorModule , ReactiveFormsModule , IctuPaginatorComponent , InputSwitchModule , MatButtonModule , MatCheckboxModule , MatTooltipModule , TooltipModule , MatProgressBarModule ] ,
	templateUrl : './list-student-results-of-partner.component.html' ,
	styleUrls   : [ './list-student-results-of-partner.component.css' ]
} )
export class ListStudentResultsOfPartnerComponent {

	private readonly dotThiService : DotThiService = inject<DotThiService>( DotThiService );

	private readonly doiTacThiSinhService : DoiTacThiSinhService = inject<DoiTacThiSinhService>( DoiTacThiSinhService );

	private readonly monHocService : MonHocService = inject<MonHocService>( MonHocService );

	private readonly notification : NotificationService = inject<NotificationService>( NotificationService );

	private readonly router : Router = inject<Router>( Router );

	private readonly auth : AuthService = inject<AuthService>( AuthService );

	@Input( { required : true , alias : 'partner_id' , transform : numberAttribute } ) set partnerId ( partnerId : number ) {
		this._partnerId = partnerId;
		this.loadData( 1 , true );
	}

	@Input( { required : true , alias : 'DOT_THI_OPTIONS' } ) DOT_THI_OPTIONS : IctuDropdownOptionExtended<number , DotThiOption>[] = null;

	@ViewChild( 'detailTpl' , { static : true } ) detailTpl : TemplateRef<any>;

	private _partnerId : number = 0;

	get partnerId () : number {
		return this._partnerId;
	}

	readonly state : WritableSignal<ComponentStateExtend> = signal<ComponentStateExtend>( 'loading' );

	public search : string = '';

	private observeOnSearch : Subject<string> = new Subject<string>();

	public readonly dataTable : IctuDataTable<TestResult> = new IctuDataTable( { pageLinkSize : 3 , rows : 20 , showFirstLastIcon : false } );

	private onDestroy$ : Subject<string> = new Subject<string>();

	private _temp : { paged : number, resetPaginator : boolean } = { paged : 1 , resetPaginator : true };

	public dotThiSelected : number = null;

	public testSubjects : TestSubject[] = [];

	private dialogRef : MatDialogRef<boolean>;

	public studentTestDetails : StudentTestDetail = null;

	constructor () {
		this.observeOnSearch.asObservable().pipe(
			takeUntil( this.onDestroy$ )
		).subscribe( () : void => {
			this.loadData( 1 , true );
		} )
	}

	private makeRequest ( paged : number , subjects : TestSubject[] ) : Observable<DtoObject<TestResult[]>> {
		const conditions : IctuConditionParam[] = [ {
			conditionName : 'created_by' ,
			condition     : IctuQueryCondition.equal ,
			value         : this.partnerId.toString()
		} ];
		if ( this.search ) {
			conditions.push(
				{
					conditionName : 'hoten' ,
					condition     : IctuQueryCondition.like ,
					value         : '%' + this.search + '%' ,
					orWhere       : "and"
				}
			);
		}

		const queryParams : IctuQueryParams = {
			limit      : this.dataTable.paginator.rows() ,
			paged      : paged ,
			include    : this.dotThiSelected.toString() ,
			include_by : 'dotthi_id' ,
			with       : 'test'
		};
		return this.doiTacThiSinhService.query( conditions , queryParams ).pipe(
			takeUntil( this.onDestroy$ ) ,
			map( ( _res : DtoObject<DoiTacThiSinh[]> ) : DtoObject<TestResult[]> => {
				return {
					... _res ,
					data : _res.data.map( ( item : DoiTacThiSinh ) : TestResult => {
						const __test : ShiftRegisterTest[] = item[ 'test' ] ?? [];
						const test : ShiftRegisterTest[]   = Helper.arraySort<ShiftRegisterTest>( __test.filter( ( t : ShiftRegisterTest ) : boolean => t.status > 2 ) , 'id' );
						const subjectIdArray : number[]    = item.subject_ids ? item.subject_ids.split( '|' ).map( ( _str : string ) : number => ( _str ? parseInt( _str , 10 ) : null ) ).filter( Boolean ) : [];
						return {
							... item ,
							test ,
							results : ( JSON.parse( JSON.stringify( subjects ) ) as TestSubject[] ).map( ( _subject : TestSubject ) : TestSubjectReport => {
								if ( subjectIdArray.includes( _subject.id ) ) {
									const { attempt , lastTest } : { attempt : number, lastTest : ShiftRegisterTest } = test.reduce( ( __reduce : { attempt : number, lastTest : ShiftRegisterTest } , __test : ShiftRegisterTest ) : { attempt : number, lastTest : ShiftRegisterTest } => {
										if ( __test.subject_id === _subject.id ) {
											__reduce.attempt += 1;
											if ( ! __reduce.lastTest || __reduce.lastTest.id < __test.id ) {
												__reduce.lastTest = __test;
											}
										}
										return __reduce;
									} , { attempt : 0 , lastTest : null } );
									return {
										... _subject ,
										lastScore : lastTest ? parseFloat( lastTest.tong_diem ) : 0 ,
										attempt ,
										owned     : true
									}
								}
								else {
									return {
										... _subject ,
										lastScore : 0 ,
										attempt   : 0 ,
										owned     : false
									}
								}
							} )
						}
					} )
				};
			} )
		)
	}

	private preload () : Observable<PreLoadDto> {
		const loadSubject$ : Observable<TestSubject[]> = this.testSubjects.length ? of( this.testSubjects ) : this.monHocService.query( [] , { limit : -1 , paged : 1 , order : 'ASC' , orderby : 'ordering' , select : 'id,name,slug,ordering' } ).pipe( map( ( res : DtoObject<TestSubject[]> ) : TestSubject[] => {
			this.testSubjects = res.data;
			return this.testSubjects
		} ) );
		return forkJoin<{
			subjects : Observable<TestSubject[]>,
			dotThiOptions : Observable<IctuDropdownOptionExtended<number , DotThiOption>[]>
		}>( {
			subjects      : loadSubject$ ,
			dotThiOptions : this.loadDotThi()
		} )

	}

	private loadData ( paged : number , resetPaginator : boolean = false ) : void {
		this.state.set( 'loading' );
		this.preload().pipe(
			takeUntil( this.onDestroy$ ) ,
			switchMap( ( { subjects , dotThiOptions } : PreLoadDto ) : Observable<DtoObject<TestResult[]>> => {
				if ( dotThiOptions.length ) {
					return this.makeRequest( paged , subjects )
				}
				else {
					return of( {
						draw            : 0 ,
						data            : [] ,
						recordsTotal    : 0 ,
						recordsFiltered : 0
					} );
				}
			} ) ,
			map( ( res : DtoObject<TestResult[]> ) : TestResult[] => {
				if ( resetPaginator ) {
					return this.dataTable.paginator.setupPaginator( res );
				}
				else {
					this.dataTable.paginator.changePage( paged );
					return res.data;
				}
			} )
		).subscribe( {
			next  : ( data : TestResult[] ) : void => {
				this.dataTable.fillData( data );
				this.state.set( 'success' );
			} ,
			error : () : void => {
				this.state.set( 'error' );
			}
		} )
	}

	reload ( event : MouseEvent ) : void {
		event.preventDefault();
		event.stopPropagation();
		this.loadData( this._temp.paged , this._temp.resetPaginator );
	}

	onChangePage ( paged : number ) : void {
		this.loadData( paged , false );
	}

	onSearch () : void {
		this.observeOnSearch.next( '' );
	}

	private loadDotThi () : Observable<IctuDropdownOptionExtended<number , DotThiOption>[]> {
		return this.DOT_THI_OPTIONS ? of( this.DOT_THI_OPTIONS ) : this.dotThiService.loadOptionsObject().pipe(
			map( ( options : IctuDropdownOptionExtended<number , DotThiOption>[] ) : IctuDropdownOptionExtended<number , DotThiOption>[] => {
				this.DOT_THI_OPTIONS                                                   = options;
				let dotThiSelected : IctuDropdownOptionExtended<number , DotThiOption> = options.find( ( option : IctuDropdownOptionExtended<number , DotThiOption> ) : boolean => option.object.status === 1 );
				if ( ! dotThiSelected ) {
					dotThiSelected = options[ 0 ];
				}
				this.dotThiSelected = dotThiSelected.value;
				return options;
			} )
		)
	}

	identify ( _ : number , item : TestResult ) : number | string {
		return item.id;
	}

	btnGetMoreDetail ( result : TestResult , subject : TestSubject ) : void {
		this.studentTestDetails = {
			result ,
			subject ,
			attempts : result.test.filter( ( i : ShiftRegisterTest ) : boolean => i.subject_id === subject.id )
		}
		this.dialogRef          = this.notification.matDialog.open(
			this.detailTpl ,
			{
				disableClose : true ,
				maxHeight    : 'var(--max-screen-height)' ,
				minHeight    : 'var(--max-screen-height)' ,
				minWidth     : 'var(--max-screen-width)' ,
				maxWidth     : 'var(--max-screen-width)'
			}
		);
	}

	closePanel () : void {
		if ( this.dialogRef ) {
			this.dialogRef.close( '' );
		}
		this.studentTestDetails = null;
	}

	getGradingResults ( { teacher_id , id } : ShiftRegisterTest ) : void {
		this.closePanel();
		const info : GradingResultQueryParams = { id , teacher_id };
		void this.router.navigate( [ 'grading-results' ] , { queryParams : { hash : this.auth.encryptData( JSON.stringify( info ) ) } } );
	}
}
