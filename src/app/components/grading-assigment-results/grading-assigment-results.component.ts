import { Component , inject , Input , OnDestroy , OnInit , signal , WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DropdownModule } from "primeng/dropdown";
import { IctuPaginatorComponent } from "@theme/components/ictu-paginator/ictu-paginator.component";
import { MatButtonModule } from "@angular/material/button";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatTooltipModule } from "@angular/material/tooltip";
import { ScoringAssigment , ScoringAssigmentProcess } from "@pages/admin/phan-quyen-cham-thi/phan-quyen-cham-thi.component";
import { Teacher } from "@model/teacher";
import { TooltipModule } from "primeng/tooltip";
import { InputTextModule } from "primeng/inputtext";
import { FormsModule } from "@angular/forms";
import { ComponentBaseState , IctuDropdownOption , IctuDropdownOptionExtended , IctuTableComponent } from "@model/commons";
import { ShiftRegisterTestService } from "@service/luyenthithpt/shift-register-test.service";
import { MonHocService } from "@service/luyenthithpt/mon-hoc.service";
import { NotificationService } from "@appNotification";
import { TeacherService } from "@service/luyenthithpt/teacher.service";
import { Router } from "@angular/router";
import { AuthService } from "@service/core/auth.service";
import { IctuDataTable , IctuDataTableRow } from "@model/ictu-data-table";
import { debounceTime , forkJoin , map , merge , Observable , of , Subject , switchMap , takeUntil } from "rxjs";
import { tap } from "rxjs/operators";
import { NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { DtoObject , IctuConditionParam , IctuQueryCondition , IctuQueryParams } from "@model/dto";
import { ShiftRegisterTest } from "@model/shift-register-test";
import { GradingResultQueryParams } from "@pages/grading-results/grading-results.component";
import { DotThiOption } from "@model/dotthi";
import { DotThiService } from "@service/luyenthithpt/dotthi.service";

interface GradingAssigment extends ScoringAssigment {
	teacher : GradingTeacherInfo;
}

type GradingTeacherInfo = Pick<Teacher , 'id' | 'full_name' | 'email' | 'phone'>

@Component( {
	selector    : 'app-grading-assigment-results' ,
	standalone  : true ,
	imports     : [ CommonModule , IctuPaginatorComponent , TooltipModule , DropdownModule , InputTextModule , FormsModule , MatCheckboxModule , MatButtonModule , MatTooltipModule ] ,
	templateUrl : './grading-assigment-results.component.html' ,
	styleUrls   : [ './grading-assigment-results.component.css' ]
} )
export class GradingAssigmentResultsComponent implements OnInit , OnDestroy , IctuTableComponent<GradingAssigment> {

	@Input() heading : string = 'Danh sách bài thi đã phân GV chấm';

	private readonly shiftRegisterTestService : ShiftRegisterTestService = inject<ShiftRegisterTestService>( ShiftRegisterTestService );

	private readonly monHocService : MonHocService = inject<MonHocService>( MonHocService );

	private readonly notification : NotificationService = inject<NotificationService>( NotificationService );

	private readonly teacherService : TeacherService = inject<TeacherService>( TeacherService );

	private readonly dotThiService : DotThiService = inject<DotThiService>( DotThiService );

	private readonly router : Router = inject<Router>( Router );

	private readonly auth : AuthService = inject<AuthService>( AuthService );

	public readonly dataTable : IctuDataTable<GradingAssigment> = new IctuDataTable();

	readonly state : WritableSignal<ComponentBaseState> = signal<ComponentBaseState>( 'loading' );

	private onDestroy$ : Subject<string> = new Subject<string>();

	private _temp : { paged : number, resetPaginator : boolean } = { paged : 1 , resetPaginator : true };

	public teacherList : IctuDropdownOptionExtended<number , GradingTeacherInfo>[] = [];

	private _defaultOption : IctuDropdownOptionExtended<number , GradingTeacherInfo> = {
		label  : 'Tất cả giáo viên' ,
		value  : 0 ,
		object : null
	}

	public filterByTeacherId : number = 0;

	private observeLoadData : Subject<void> = new Subject<void>();

	private subjectOptions : IctuDropdownOption<number>[] = [];

	private observeUpload : Subject<void> = new Subject<void>();

	private uploadProgress : ScoringAssigmentProcess = {
		list    : [] ,
		percent : 0 ,
		panel   : null ,
		step    : 0
	};

	public dotThiOptions : IctuDropdownOptionExtended<number , DotThiOption>[] = null;

	public dotThiSelected : number = null;

	private get filterByDotThi () : Observable<number> {
		return this.dotThiSelected ? of( this.dotThiSelected ) : this.loadDotThi().pipe(
			takeUntil( merge( this.observeLoadData , this.onDestroy$ ) ) ,
			map( ( options : IctuDropdownOptionExtended<number , DotThiOption>[] ) : number => {
				this.dotThiSelected = options.reduce( ( _reducer : number , item : IctuDropdownOptionExtended<number , DotThiOption> ) : number => item.object.status === 1 ? item.value : _reducer , options[ 0 ] ? options[ 0 ].value : null );
				return this.dotThiSelected;
			} )
		)
	}

	get isUserAdmin () : boolean {
		return this.auth.userHasRole( 'admin_luyenthi_thpt' );
	}

	get currentTeacherId () : number {
		return ( this.auth.userHasRole( 'teacher_luyenthi_thpt' ) ? this.auth.teacher?.id : 0 ) || 0;
	}

	constructor () {
		this.observeUpload.pipe(
			takeUntil( this.onDestroy$ ) ,
			tap( () : void => {
				this.uploadProgress.panel = this.notification.ProgressBarWithPercent( 0 , true );
				this.uploadProgress.step  = 100 / this.uploadProgress.list.length;
			} ) ,
			debounceTime( 1000 ) ,
			switchMap( () : Observable<NgbModalRef> => {
				return this._updateDataIndividually( this.uploadProgress.panel , this.uploadProgress.step )
			} )
		).subscribe( {
			next  : ( panel : NgbModalRef ) : void => {
				this.notification.updateProgressBarPercent( panel , 101 );
				this.loadData( 1 , true );
			} ,
			error : () : void => {
				this.uploadProgress.panel.close( '' );
				this.loadData( 1 , true );
				this.notification.toastWarning( 'Quá trình hủy phân quyền chấm bài bị gián đoạn do lỗi mất kết nối với máy chủ!' );
			}
		} )
	}

	ngOnInit () : void {
		this.loadData( 1 , true );
	}

	private loadDotThi () : Observable<IctuDropdownOptionExtended<number , DotThiOption>[]> {
		return this.dotThiOptions ? of( this.dotThiOptions ) : this.dotThiService.loadOptionsObject().pipe(
			map( ( options : IctuDropdownOptionExtended<number , DotThiOption>[] ) : IctuDropdownOptionExtended<number , DotThiOption>[] => {
				this.dotThiOptions = options;
				return options;
			} )
		)
	}

	identify ( _ : number , item : ScoringAssigment ) : number | string {
		return item.id;
	}

	onChangePage ( paged : number ) : void {
		this.loadData( paged , false );
	}

	private loadSubjectFirst () : Observable<IctuDropdownOption<number>[]> {
		return this.subjectOptions.length ? of( this.subjectOptions ) : this.monHocService.listSubjectsAsOptions().pipe(
			map( ( response : IctuDropdownOption<number>[] ) : IctuDropdownOption<number>[] => {
				this.subjectOptions = response;
				return this.subjectOptions;
			} )
		)
	}

	private loadTeacher () : Observable<IctuDropdownOptionExtended<number , GradingTeacherInfo>[]> {
		if ( this.teacherList.length ) {
			return of( this.teacherList );
		}
		if ( this.isUserAdmin ) {
			const conditions : IctuConditionParam[] = [];
			const queryParams : IctuQueryParams     = {
				paged  : 1 ,
				limit  : -1 ,
				select : 'id,full_name,email,phone'
			};
			return this.teacherService.query( conditions , queryParams ).pipe(
				map( ( response : DtoObject<Teacher[]> ) : IctuDropdownOptionExtended<number , GradingTeacherInfo>[] => {
					this.teacherList = [ this._defaultOption ];
					if ( response.data && response.data.length ) {
						this.teacherList.push( ... response.data.map( ( object : Teacher ) : IctuDropdownOptionExtended<number , GradingTeacherInfo> => ( {
							label    : object.full_name ,
							value    : object.id ,
							disabled : false ,
							object
						} ) ) )
					}
					return this.teacherList;
				} )
			)
		}
		else {
			if ( this.currentTeacherId ) {
				this.teacherList = [ {
					label  : this.auth.teacher.full_name ,
					value  : this.currentTeacherId ,
					object : this.auth.teacher
				} ];
			}
			return of( this.teacherList );
		}
	}

	private loadData ( paged : number = 1 , resetPaginator : boolean = true ) : void {
		this.state.set( 'loading' );
		this._temp = { paged , resetPaginator };
		this.observeLoadData.next();
		this.filterByDotThi.pipe(
			switchMap( ( session : number ) : Observable<{
				response : DtoObject<ShiftRegisterTest[]>,
				subjects : IctuDropdownOption<number>[],
				teacher : IctuDropdownOption<number>[]
			}> => {
				const conditions : IctuConditionParam[] = [
					{ conditionName : 'status' , condition : IctuQueryCondition.greaterThan , value : '2' } ,
					{ conditionName : 'dotthi_id' , condition : IctuQueryCondition.equal , value : session.toString() , orWhere : "and" }
				];
				if ( this.isUserAdmin ) {
					if ( this.filterByTeacherId ) {
						conditions.push( { conditionName : 'teacher_id' , condition : IctuQueryCondition.equal , value : this.filterByTeacherId.toString() , orWhere : "and" } );
					}
					else {
						conditions.push( { conditionName : 'teacher_id' , condition : IctuQueryCondition.greaterThan , value : '0' , orWhere : "and" } );
					}
				}
				else {
					conditions.push( { conditionName : 'teacher_id' , condition : IctuQueryCondition.equal , value : this.currentTeacherId.toString() , orWhere : "and" } );
				}
				const queryParams : IctuQueryParams = {
					limit   : this.dataTable.paginator.rows() ,
					paged   : paged ,
					with    : 'registers' ,
					select  : 'created_at,updated_at,id,shift_register_id,status,subject_id,teacher_id,tong_diem,hand_score,score,dotthi_id' ,
					order   : 'desc' ,
					orderby : 'updated_at'
				};
				return forkJoin<{
					response : Observable<DtoObject<ShiftRegisterTest[]>>,
					subjects : Observable<IctuDropdownOption<number>[]>,
					teacher : Observable<IctuDropdownOption<number>[]>
				}>( {
					response : this.shiftRegisterTestService.query( conditions , queryParams ) ,
					subjects : this.loadSubjectFirst() ,
					teacher  : this.loadTeacher()
				} );
			} ) ,
			map( ( { response , subjects } : {
				response : DtoObject<ShiftRegisterTest[]>,
				subjects : IctuDropdownOption<number>[]
			} ) : {
				data : ShiftRegisterTest[],
				subjects : IctuDropdownOption<number>[]
			} => {
				if ( resetPaginator ) {
					return {
						data : this.dataTable.paginator.setupPaginator( response ) ,
						subjects
					};
				}
				else {
					this.dataTable.paginator.changePage( paged );
					return {
						data : response.data ,
						subjects
					};
				}
			} ) ,
			map( ( { data , subjects } : {
				data : ShiftRegisterTest[],
				subjects : IctuDropdownOption<number>[]
			} ) : GradingAssigment[] => data.map( ( _item : ShiftRegisterTest ) : GradingAssigment => {
				return {
					... _item ,
					_subjectName : subjects.reduce( ( __reducer : string , __option : IctuDropdownOption<number> ) : string => __option.value === _item.subject_id ? __option.label : __reducer , '' ) ,
					registers    : _item[ 'registers' ] ,
					teacher      : this.teacherList.reduce( ( _reducer : GradingTeacherInfo , _otp : IctuDropdownOptionExtended<number , GradingTeacherInfo> ) : GradingTeacherInfo => _otp.value === _item.teacher_id ? _otp.object : _reducer , null )
				}
			} ) ) ,
			takeUntil( merge( this.observeLoadData , this.onDestroy$ ) )
		).subscribe( {
			next  : ( data : GradingAssigment[] ) : void => {
				this.dataTable.fillData( data );
				this.state.set( 'success' );
			} ,
			error : () : void => {
				this.state.set( 'error' )
			}
		} )
	}

	async submitData () : Promise<void> {
		try {
			this.uploadProgress.list = this.dataTable.data().filter( ( i : IctuDataTableRow<ScoringAssigment> ) : boolean => i._ictuDataTableRowChecked && i.status < 4 )
			if ( this.uploadProgress.list.length ) {
				const confirm : boolean = await this.notification.confirmV2( `Bạn có chắc chắn muốn hủy phân quyền chấm của ${ this.uploadProgress.list.length } bài thi không?` , 'Xác nhận' );
				if ( confirm ) {
					this.uploadProgress.percent = 0;
					this.observeUpload.next();
					this.state.set( 'loading' );
				}
			}
		}
		catch ( error ) {}
	}

	private _updateDataIndividually ( panel : NgbModalRef , step : number ) : Observable<NgbModalRef> {
		if ( this.uploadProgress.list.length ) {
			const item : ScoringAssigment = this.uploadProgress.list.pop();
			return this.shiftRegisterTestService.update( item.id , { teacher_id : 0 } ).pipe(
				takeUntil( this.onDestroy$ ) ,
				switchMap( () : Observable<any> => {
					this.uploadProgress.percent += step;
					this.notification.updateProgressBarPercent( panel , Math.floor( this.uploadProgress.percent ) );
					return this._updateDataIndividually( panel , step );
				} )
			)
		}
		else {
			return of( panel );
		}
	}

	reload ( event : MouseEvent ) : void {
		event.preventDefault();
		event.stopPropagation();
		this.loadData( this._temp.paged , this._temp.resetPaginator );
	}

	onSearch () : void {
		this.loadData( 1 , true );
	}

	getGradingResults ( { id , teacher_id } : GradingAssigment ) : void {
		const info : GradingResultQueryParams = { id , teacher_id };
		void this.router.navigate( [ 'grading-results' ] , { queryParams : { hash : this.auth.encryptData( JSON.stringify( info ) ) } } );
	}

	ngOnDestroy () : void {
		this.onDestroy$.next( 'OnDestroy' );
		this.onDestroy$.complete();
	}
}
