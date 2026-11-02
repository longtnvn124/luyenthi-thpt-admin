import { Component , inject , OnDestroy , OnInit , signal , WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IctuPaginatorComponent } from "@theme/components/ictu-paginator/ictu-paginator.component";
import { TooltipModule } from "primeng/tooltip";
import { IctuDataTable , IctuDataTableRow } from "@model/ictu-data-table";
import { debounceTime , forkJoin , map , merge , Observable , of , Subject , switchMap , takeUntil } from "rxjs";
import { ShiftRegisterTest } from "@model/shift-register-test";
import { ComponentBaseState , IctuDropdownOption , IctuTableComponent } from "@model/commons";
import { NotificationService } from "@appNotification";
import { DropdownModule } from "primeng/dropdown";
import { InputTextModule } from "primeng/inputtext";
import { FormsModule } from "@angular/forms";
import { ShiftRegisterTestService } from "@service/luyenthithpt/shift-register-test.service";
import { DtoObject , IctuConditionParam , IctuQueryCondition , IctuQueryParams } from "@model/dto";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MonHocService } from "@service/luyenthithpt/mon-hoc.service";
import { DoiTacThiSinh } from "@model/doi-tac-thi-sinh";
import { MatButtonModule } from "@angular/material/button";
import { MatTooltipModule } from "@angular/material/tooltip";
import { TeacherService } from "@service/luyenthithpt/teacher.service";
import { Teacher } from "@model/teacher";
import { NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { tap } from "rxjs/operators";

export interface ScoringAssigment extends Pick<ShiftRegisterTest , 'bank_id' | 'created_at' | 'id' | 'shift_register_id' | 'status' | 'subject_id' | 'teacher_id' | 'score' | 'hand_score' | 'tong_diem'> {
	_subjectName : string;
	registers : Pick<DoiTacThiSinh , 'id' | 'user_id' | 'hoten' | 'ngaysinh' | 'gioitinh' | 'email' | 'phone'>
}

export interface ScoringAssigmentProcess {
	list : ScoringAssigment[],
	percent : number,
	step : number,
	panel : NgbModalRef
}

@Component( {
	selector    : 'app-phan-quyen-cham-thi' ,
	standalone  : true ,
	imports     : [ CommonModule , IctuPaginatorComponent , TooltipModule , DropdownModule , InputTextModule , FormsModule , MatCheckboxModule , MatButtonModule , MatTooltipModule ] ,
	templateUrl : './phan-quyen-cham-thi.component.html' ,
	styleUrls   : [ './phan-quyen-cham-thi.component.css' ]
} )
export class PhanQuyenChamThiComponent implements OnInit , OnDestroy , IctuTableComponent<ScoringAssigment> {

	private readonly shiftRegisterTestService : ShiftRegisterTestService = inject<ShiftRegisterTestService>( ShiftRegisterTestService );

	private readonly monHocService : MonHocService = inject<MonHocService>( MonHocService );

	private readonly notification : NotificationService = inject<NotificationService>( NotificationService );

	private readonly teacherService : TeacherService = inject<TeacherService>( TeacherService );

	public readonly dataTable : IctuDataTable<ScoringAssigment> = new IctuDataTable();

	readonly state : WritableSignal<ComponentBaseState> = signal<ComponentBaseState>( 'loading' );

	private onDestroy$ : Subject<string> = new Subject<string>();

	private _temp : { paged : number, resetPaginator : boolean } = { paged : 1 , resetPaginator : true };

	public teacherList : IctuDropdownOption<number>[] = [];

	public teacher_id : number = null;

	private observeLoadData : Subject<void> = new Subject<void>();

	private subjectOptions : IctuDropdownOption<number>[] = [];

	private observeUpload : Subject<void> = new Subject<void>();

	// private get filterByDotThi () : Observable<number> {
	// 	return this.dotThiSelected ? of( this.dotThiSelected ) : this.loadDotThi().pipe(
	// 		takeUntil( merge( this.observeLoadData , this.onDestroy$ ) ) ,
	// 		map( ( options : IctuDropdownOptionExtended<number , DotThiOption>[] ) : number => options.reduce( ( _reducer : number , item : IctuDropdownOptionExtended<number , DotThiOption> ) : number => item.object.status === 1 ? item.value : _reducer , null ) )
	// 	)
	// }

	private uploadProgress : ScoringAssigmentProcess = {
		list    : [] ,
		percent : 0 ,
		panel   : null ,
		step    : 0
	};

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
				this.notification.toastWarning( 'Quá trình phân quyền chấm bài bị gián đoạn do lỗi mất kết nối với máy chủ!' );
			}
		} )
	}

	ngOnInit () : void {
		this.loadData( 1 , true );
	}

	identify ( _ : number , item : ScoringAssigment ) : number | string {
		return item.id;
	}

	onChangePage ( paged : number ) : void {
		this.loadData( paged , false );
	}

	// private loadDotThi () : Observable<IctuDropdownOptionExtended<number , DotThiOption>[]> {
	// 	return this.dotThiOption ? of( this.dotThiOption ) : this.dotThiService.loadOptionsObject().pipe(
	// 		map( ( options : IctuDropdownOptionExtended<number , DotThiOption>[] ) : IctuDropdownOptionExtended<number , DotThiOption>[] => {
	// 			this.dotThiOption = options;
	// 			return options;
	// 		} )
	// 	)
	// }

	// private loadData ( paged : number = 1 , resetPaginator : boolean = true ) : void {
	// 	this.state.set( 'loading' );
	// 	this._temp = { paged , resetPaginator };
	// 	this.filterByDotThi.pipe(
	// 		switchMap( ( dotThi : number ) : Observable<DtoObject<ShiftRegisterTest[]>> => {
	// 			const conditions : IctuConditionParam[] = [];
	// 			const queryParams : IctuQueryParams     = {
	// 				limit      : this.dataTable.paginator.rows() ,
	// 				paged      : paged ,
	// 				include    : this.dotThiSelected.toString() ,
	// 				include_by : 'shift_register_id' ,
	// 				with       : 'registers'
	// 			};
	// 			return this.shiftRegisterTestService.query( conditions , queryParams );
	// 		} ) ,
	// 		map( ( response : DtoObject<ShiftRegisterTest[]> ) : ShiftRegisterTest[] => {
	// 			if ( resetPaginator ) {
	// 				return this.dataTable.paginator.setupPaginator( response );
	// 			}
	// 			else {
	// 				this.dataTable.paginator.changePage( paged );
	// 				return response.data;
	// 			}
	// 		} )
	// 	).subscribe( {
	// 		next  : ( data : ShiftRegisterTest[] ) : void => {
	// 			this.dataTable.fillData( data );
	// 			this.state.set( 'success' );
	// 		} ,
	// 		error : () : void => {
	// 			this.state.set( 'error' )
	// 		}
	// 	} )
	// }
	//
	private loadSubjectFirst () : Observable<IctuDropdownOption<number>[]> {
		return this.subjectOptions.length ? of( this.subjectOptions ) : this.monHocService.listSubjectsAsOptions().pipe(
			map( ( response : IctuDropdownOption<number>[] ) : IctuDropdownOption<number>[] => {
				this.subjectOptions = response;
				return this.subjectOptions;
			} )
		)
	}

	private loadTeacher () : Observable<IctuDropdownOption<number>[]> {
		if ( this.teacherList.length ) {
			return of( this.teacherList );
		}
		const conditions : IctuConditionParam[] = [];
		const queryParams : IctuQueryParams     = {
			paged  : 1 ,
			limit  : -1 ,
			select : 'id,full_name'
		};
		return this.teacherService.query( conditions , queryParams ).pipe(
			map( ( response : DtoObject<Teacher[]> ) : IctuDropdownOption<number>[] => {
				if ( response.data && response.data.length ) {
					this.teacherList = response.data.map( ( row : Teacher ) : IctuDropdownOption<number> => ( {
						label    : row.full_name ,
						value    : row.id ,
						disabled : false
					} ) );
				}
				return this.teacherList;
			} )
		)
		// return this.teacherList.length ? of( this.teacherList ) : this.teacherService.listSubjectsAsOptions().pipe(
		// 	map( ( response : IctuDropdownOption<number>[] ) : IctuDropdownOption<number>[] => {
		// 		this.subjectOptions = response;
		// 		return this.subjectOptions;
		// 	} )
		// )
	}

	private loadData ( paged : number = 1 , resetPaginator : boolean = true ) : void {
		this.state.set( 'loading' );
		this._temp                              = { paged , resetPaginator };
		const conditions : IctuConditionParam[] = [
			{
				conditionName : 'status' ,
				condition     : IctuQueryCondition.equal ,
				value         : '3'
			} ,
			{
				conditionName : 'teacher_id' ,
				condition     : IctuQueryCondition.equal ,
				value         : '0' ,
				orWhere       : "and"
			}
		];
		const queryParams : IctuQueryParams     = {
			limit  : this.dataTable.paginator.rows() ,
			paged  : paged ,
			with   : 'registers' ,
			select : 'created_at,id,shift_register_id,status,subject_id,teacher_id'
		};
		this.observeLoadData.next();
		forkJoin<{
			response : Observable<DtoObject<ShiftRegisterTest[]>>,
			subjects : Observable<IctuDropdownOption<number>[]>,
			teacher : Observable<IctuDropdownOption<number>[]>
		}>( {
			response : this.shiftRegisterTestService.query( conditions , queryParams ) ,
			subjects : this.loadSubjectFirst() ,
			teacher  : this.loadTeacher()
		} ).pipe(
			takeUntil(
				merge( this.observeLoadData , this.onDestroy$ )
			) ,
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
			} ) : ScoringAssigment[] => data.map( ( _item : ShiftRegisterTest ) : ScoringAssigment => {
				return {
					... _item ,
					_subjectName : subjects.reduce( ( __reducer : string , __option : IctuDropdownOption<number> ) : string => __option.value === _item.subject_id ? __option.label : __reducer , '' ) ,
					registers    : _item[ 'registers' ]
				}
			} ) )
		).subscribe( {
			next  : ( data : ScoringAssigment[] ) : void => {
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
			this.uploadProgress.list = this.dataTable.data().filter( ( i : IctuDataTableRow<ScoringAssigment> ) : boolean => i._ictuDataTableRowChecked )
			if ( this.uploadProgress.list.length ) {
				const _option : IctuDropdownOption<number> = this.teacherList.find( ( o : IctuDropdownOption<number> ) : boolean => o.value === this.teacher_id );
				const confirm : boolean                    = await this.notification.confirmV2( `Bạn có chắc chắn muốn phân quyền chấm ${ this.uploadProgress.list.length } ${ _option ? ( 'bài cho giáo viên ' + _option.label ) : '' } không?` , 'Xác nhận' );
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
			return this.shiftRegisterTestService.update( item.id , { teacher_id : this.teacher_id } ).pipe(
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

	ngOnDestroy () : void {
		this.onDestroy$.next( 'OnDestroy' );
		this.onDestroy$.complete();
	}
}
