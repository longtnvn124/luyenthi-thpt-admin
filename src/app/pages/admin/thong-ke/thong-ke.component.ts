import { Component , inject , OnDestroy , OnInit , signal , WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComponentBaseState , IctuDropdownOptionExtended , IctuTableComponent } from "@model/commons";
import { delay , forkJoin , map , Observable , of , Subject , switchMap , takeUntil , timer } from "rxjs";
import { NotificationService } from "@appNotification";
import { DotThiService } from "@service/luyenthithpt/dotthi.service";
import { InputTextModule } from "primeng/inputtext";
import { MatButtonModule } from "@angular/material/button";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { MatTooltipModule } from "@angular/material/tooltip";
import { SharedModule } from "@sharedModule";
import { IctuDataTable } from "@model/ictu-data-table";
import { DoiTac } from "@model/doi-tac";
import { DoiTacService } from "@service/luyenthithpt/doi-tac.service";
import { DtoObject , IctuConditionParam , IctuQueryCondition , IctuQueryParams } from "@model/dto";
import { DotThiOption } from "@model/dotthi";
import { MonHocService } from "@service/luyenthithpt/mon-hoc.service";
import { MonHoc } from "@model/mon-hoc";
import { DropdownModule } from "primeng/dropdown";
import { ShiftRegisterTestService } from "@service/luyenthithpt/shift-register-test.service";
import { ShiftRegisterTest } from "@model/shift-register-test";
import { DoiTacThiSinhService } from "@service/luyenthithpt/doi-tac-thi-sinh.service";
import { DoiTacThiSinh } from "@model/doi-tac-thi-sinh";
import { NgbModalRef } from "@ng-bootstrap/ng-bootstrap";

interface ReportBySubject extends Pick<MonHoc , 'id' | 'slug' | 'ordering' | 'name'> {
	totalRegisters : number;
	totalAttempts : number;
}

type DoiTacShort = Pick<DoiTac , 'id' | 'hoten' | 'user_id' | 'donvi_id'>;

interface PartnerExtended extends DoiTacShort {
	reportSubjectList : ReportBySubject[];
	totalRegisters : number;
	totalAttempts : number;
	done : boolean;
}

interface PreloadData {
	dotThi : IctuDropdownOptionExtended<number , DotThiOption>[],
	subjectList : ReportBySubject[],
	partners : DoiTacShort[]
}

interface DoiTacThiSinhExtended extends Pick<DoiTacThiSinh , 'id' | 'subject_ids' | 'dotthi_id' | 'created_by'> {
	test : ShiftRegisterTest[],
	subjectIdArray : number[],
	subjectIdSet : Set<number>
	totalAttemptsBaseSubjectId : Map<number , number>
}

type ShiftRegisterTestShort = Pick<ShiftRegisterTest , 'id' | 'shift_register_id' | 'dotthi_id' | 'subject_id' | 'status'>

interface ShiftRegisterTestUpdate extends Pick<ShiftRegisterTest , 'id' | 'shift_register_id' | 'dotthi_id'> {
	completed : boolean;
}

interface TestValidator {
	list : ShiftRegisterTestUpdate[];
	step : number;
	panel : NgbModalRef;
	percent : number;
}

@Component( {
	selector    : 'app-thong-ke' ,
	standalone  : true ,
	imports     : [ CommonModule , InputTextModule , MatButtonModule , MatProgressBarModule , MatTooltipModule , SharedModule , DropdownModule ] ,
	templateUrl : './thong-ke.component.html' ,
	styleUrls   : [ './thong-ke.component.css' ]
} )
export class ThongKeComponent implements OnInit , OnDestroy , IctuTableComponent<PartnerExtended> {

	private readonly dotThiService : DotThiService = inject<DotThiService>( DotThiService );

	private readonly doiTacService : DoiTacService = inject<DoiTacService>( DoiTacService );

	private readonly monHocService : MonHocService = inject<MonHocService>( MonHocService );

	private readonly shiftRegisterTestService : ShiftRegisterTestService = inject<ShiftRegisterTestService>( ShiftRegisterTestService );

	private readonly shiftRegistersService : DoiTacThiSinhService = inject<DoiTacThiSinhService>( DoiTacThiSinhService );

	private readonly notification : NotificationService = inject<NotificationService>( NotificationService );

	private readonly destroy$ : Subject<void> = new Subject<void>();

	readonly state : WritableSignal<ComponentBaseState> = signal<ComponentBaseState>( 'loading' );

	readonly dataTable : IctuDataTable<PartnerExtended> = new IctuDataTable<PartnerExtended>();

	public DOT_THI_OPTIONS : IctuDropdownOptionExtended<number , DotThiOption>[] = null;

	public dotThiSelected : number = null;

	private _partners : DoiTacShort[] = [];

	private _subjects : ReportBySubject[] = [];

	private testValidator : TestValidator = {
		list    : [] ,
		step    : 0 ,
		percent : 0 ,
		panel   : null
	};

	set subjectList ( subjects : ReportBySubject[] ) {
		this._subjects = subjects;
	}

	get subjectList () : ReportBySubject[] {
		return JSON.parse( JSON.stringify( this._subjects ) );
	}

	ngOnInit () : void {
		this.loadData();
	}

	identify ( _ : number , item : PartnerExtended ) : string | number {
		return item.id;
	};

	private partnerLoader () : Observable<DoiTacShort[]> {
		if ( this._partners.length !== 0 ) {
			return of( this._partners );
		}
		const conditions : IctuConditionParam[] = [];
		const queryParams : IctuQueryParams     = {
			limit  : -1 ,
			paged  : 1 ,
			select : 'id,hoten,user_id,donvi_id'
		};
		return this.doiTacService.query( conditions , queryParams ).pipe(
			map( ( response : DtoObject<DoiTac[]> ) : DoiTacShort[] => {
				this._partners = response.data;
				return this._partners;
			} )
		)
	}

	private dotThiLoader () : Observable<IctuDropdownOptionExtended<number , DotThiOption>[]> {
		return this.DOT_THI_OPTIONS ? of( this.DOT_THI_OPTIONS ) : this.dotThiService.loadOptionsObject().pipe(
			map( ( options : IctuDropdownOptionExtended<number , DotThiOption>[] ) : IctuDropdownOptionExtended<number , DotThiOption>[] => {
				this.DOT_THI_OPTIONS = options;
				return options;
			} )
		)
	}

	private subjectsLoader () : Observable<ReportBySubject[]> {
		if ( this._subjects && this._subjects.length > 0 ) {
			return of( this.subjectList );
		}
		else {
			const conditions : IctuConditionParam[] = [];
			const queryParams : IctuQueryParams     = {
				limit   : -1 ,
				paged   : 1 ,
				select  : 'id,slug,ordering,name' ,
				orderby : 'ordering' ,
				order   : 'asc'
			};
			return this.monHocService.query( conditions , queryParams ).pipe(
				map( ( response : DtoObject<MonHoc[]> ) : ReportBySubject[] => {
					this.subjectList = response.data.map( ( { id , slug , ordering , name } : MonHoc ) : ReportBySubject => (
						{
							id ,
							name ,
							slug ,
							ordering ,
							totalAttempts  : 0 ,
							totalRegisters : 0
						}
					) );
					return this.subjectList;
				} )
			)
		}
	}

	private preload () : Observable<PreloadData> {
		return forkJoin<{
			dotThi : Observable<IctuDropdownOptionExtended<number , DotThiOption>[]>,
			subjectList : Observable<ReportBySubject[]>,
			partners : Observable<DoiTacShort[]>
		}>( {
			dotThi      : this.dotThiLoader() ,
			subjectList : this.subjectsLoader() ,
			partners    : this.partnerLoader()
		} )
	}

	private loadTests ( dotthi_id : number ) : Observable<ShiftRegisterTestShort[]> {
		const conditions : IctuConditionParam[] = [
			{
				conditionName : 'dotthi_id' ,
				condition     : IctuQueryCondition.equal ,
				value         : dotthi_id.toString( 10 )
			} , {
				conditionName : 'status' ,
				condition     : IctuQueryCondition.greaterThan ,
				value         : '2' ,
				orWhere       : "and"
			}
		];
		const queryParams : IctuQueryParams     = {
			limit  : -1 ,
			paged  : 1 ,
			select : 'id,shift_register_id,dotthi_id,subject_id,status'
		}
		return this.shiftRegisterTestService.query( conditions , queryParams ).pipe(
			map( ( _res : DtoObject<ShiftRegisterTest[]> ) : ShiftRegisterTestShort[] => _res.data )
		)
	}

	private _OldloadRegisters ( dotthi_id : number , tests : ShiftRegisterTestShort[] ) : Observable<DoiTacThiSinhExtended[]> {
		const conditions : IctuConditionParam[] = [ {
			conditionName : 'dotthi_id' ,
			condition     : IctuQueryCondition.equal ,
			value         : dotthi_id.toString( 10 )
		} ];
		const queryParams : IctuQueryParams     = {
			limit  : -1 ,
			paged  : 1 ,
			select : 'id,subject_ids,dotthi_id,created_by' ,
			with   : 'test'
		}
		return this.shiftRegistersService.query( conditions , queryParams ).pipe(
			map( ( response : DtoObject<DoiTacThiSinh[]> ) : DoiTacThiSinhExtended[] => response.data.map( ( __doiTacThiSinh : DoiTacThiSinh ) : DoiTacThiSinhExtended => {
				const totalTestOfRegister : ShiftRegisterTestShort[]    = tests.filter( ( o : ShiftRegisterTestShort ) : boolean => o.shift_register_id === __doiTacThiSinh.id );
				const subjectIdArray : number[]                         = __doiTacThiSinh.subject_ids ? __doiTacThiSinh.subject_ids.split( '|' ).map( ( _str : string ) : number => ( _str ? parseInt( _str , 10 ) : null ) ).filter( Boolean ) : [];
				const totalAttemptsBaseSubjectId : Map<number , number> = subjectIdArray.reduce( ( _rdc : Map<number , number> , subject_id : number ) : Map<number , number> => {
					const _set : Set<number> = new Set<number>( [ ... totalTestOfRegister.filter( ( _t : ShiftRegisterTestShort ) : boolean => _t.subject_id === subject_id ).map( ( s : ShiftRegisterTestShort ) : number => s.shift_register_id ) ] );
					_rdc.set( subject_id , _set.size );
					return _rdc;
				} , new Map<number , number>() );

				const __test : ShiftRegisterTest[] = __doiTacThiSinh[ 'test' ] ?? [];
				return {
					id           : __doiTacThiSinh.id ,
					subject_ids  : __doiTacThiSinh.subject_ids ,
					created_by   : __doiTacThiSinh.created_by ,
					test         : __test.filter( ( t : ShiftRegisterTest ) : boolean => t.status > 2 ) ,
					dotthi_id ,
					subjectIdArray ,
					totalAttemptsBaseSubjectId ,
					subjectIdSet : new Set( subjectIdArray )
				}
			} ) )
		)
	}

	private loadRegisters ( dotthi_id : number ) : Observable<DoiTacThiSinhExtended[]> {
		const conditions : IctuConditionParam[] = [ {
			conditionName : 'dotthi_id' ,
			condition     : IctuQueryCondition.equal ,
			value         : dotthi_id.toString( 10 )
		} ];
		const queryParams : IctuQueryParams     = {
			limit  : -1 ,
			paged  : 1 ,
			select : 'id,subject_ids,dotthi_id,created_by' ,
			with   : 'test'
		}
		return this.shiftRegistersService.query( conditions , queryParams ).pipe(
			map( ( response : DtoObject<DoiTacThiSinh[]> ) : DoiTacThiSinhExtended[] => response.data.map( ( __doiTacThiSinh : DoiTacThiSinh ) : DoiTacThiSinhExtended => {
				const __doiTacThiSinhTests : ShiftRegisterTest[]        = ( __doiTacThiSinh[ 'test' ] ?? [] ).filter( ( t : ShiftRegisterTest ) : boolean => t.status > 2 );
				const subjectIdArray : number[]                         = __doiTacThiSinh.subject_ids ? __doiTacThiSinh.subject_ids.split( '|' ).map( ( _str : string ) : number => ( _str ? parseInt( _str , 10 ) : null ) ).filter( Boolean ) : [];
				const totalAttemptsBaseSubjectId : Map<number , number> = subjectIdArray.reduce( ( _rdc : Map<number , number> , subject_id : number ) : Map<number , number> => {
					const _set : Set<number> = new Set<number>( [ ... __doiTacThiSinhTests.filter( ( _t : ShiftRegisterTest ) : boolean => _t.subject_id === subject_id ).map( ( s : ShiftRegisterTest ) : number => s.shift_register_id ) ] );
					_rdc.set( subject_id , _set.size );
					return _rdc;
				} , new Map<number , number>() );
				return {
					id           : __doiTacThiSinh.id ,
					subject_ids  : __doiTacThiSinh.subject_ids ,
					created_by   : __doiTacThiSinh.created_by ,
					test         : __doiTacThiSinhTests ,
					dotthi_id ,
					subjectIdArray ,
					totalAttemptsBaseSubjectId ,
					subjectIdSet : new Set( subjectIdArray )
				}
			} ) )
		)
	}

	private loadData () : void {
		this.state.set( 'loading' );
		this.preload().pipe(
			map( ( response : PreloadData ) : PartnerExtended[] => {
				return response.partners.map( ( { id , hoten , donvi_id , user_id } : DoiTac ) : PartnerExtended => {
					return {
						id ,
						hoten ,
						donvi_id ,
						user_id ,
						reportSubjectList : JSON.parse( JSON.stringify( response.subjectList ) ) ,
						totalAttempts     : 0 ,
						totalRegisters    : 0 ,
						done              : false
					}
				} );
			} ) ,
			switchMap( ( response : PartnerExtended[] ) : Observable<PartnerExtended[]> => {
				if ( ! this.dotThiSelected && this.DOT_THI_OPTIONS.length > 0 ) {
					const index : number = this.DOT_THI_OPTIONS.findIndex( ( option : IctuDropdownOptionExtended<number , DotThiOption> ) : boolean => option.object?.status === 1 );
					if ( -1 !== index ) {
						this.dotThiSelected = this.DOT_THI_OPTIONS[ index ].value;
					}
					else {
						this.dotThiSelected = this.DOT_THI_OPTIONS[ 0 ].value;
					}
				}
				/*return this.dotThiSelected ? this.loadTests( this.dotThiSelected ).pipe(
				 switchMap( ( tests : ShiftRegisterTestShort[] ) : Observable<DoiTacThiSinhExtended[]> => this.loadRegisters( this.dotThiSelected , tests ) ) ,
				 map( ( data : DoiTacThiSinhExtended[] ) : PartnerExtended[] => this.processData( response , data ) )
				 ) : of( response );*/

				return this.dotThiSelected ? this.loadRegisters( this.dotThiSelected ).pipe(
					map( ( data : DoiTacThiSinhExtended[] ) : PartnerExtended[] => this.processData( response , data ) )
				) : of( response );
			} ) ,
			takeUntil( this.destroy$ )
		).subscribe( {
			next  : ( data : PartnerExtended[] ) : void => {
				this.dataTable.fillData( data );
				this.state.set( 'success' );
			} ,
			error : () : void => {
				this.state.set( 'error' );
			}
		} );
	}

	private processData ( info : PartnerExtended[] , dsDoiTacThiSinh : DoiTacThiSinhExtended[] ) : PartnerExtended[] {
		return info.map( ( partner : PartnerExtended ) : PartnerExtended => this._partnerReporter( partner , dsDoiTacThiSinh.filter( ( dt : DoiTacThiSinhExtended ) : boolean => dt.created_by === partner.user_id ) ) );
	}

	private _partnerReporter ( partner : PartnerExtended , dsDoiTacThiSinh : DoiTacThiSinhExtended[] ) : PartnerExtended {
		partner.reportSubjectList.map( ( subject : ReportBySubject ) : ReportBySubject => {
			subject.totalRegisters = dsDoiTacThiSinh.reduce( ( __reducer : number , _reg : DoiTacThiSinhExtended ) : number => ( __reducer + ( _reg.subjectIdSet.has( subject.id ) ? 1 : 0 ) ) , 0 );
			subject.totalAttempts  = dsDoiTacThiSinh.reduce( ( __reducer : number , _reg : DoiTacThiSinhExtended ) : number => {
				return __reducer + ( _reg.totalAttemptsBaseSubjectId.has( subject.id ) ? _reg.totalAttemptsBaseSubjectId.get( subject.id ) : 0 );
			} , 0 );
			return subject;
		} );
		partner.totalRegisters = partner.reportSubjectList.reduce( ( _total : number , _subject : ReportBySubject ) : number => _total + _subject.totalRegisters , 0 );
		partner.totalAttempts  = partner.reportSubjectList.reduce( ( _total : number , _subject : ReportBySubject ) : number => _total + _subject.totalAttempts , 0 );
		partner.done           = partner.totalRegisters ? ( partner.totalRegisters === partner.totalAttempts ) : true;
		return partner;
	}


	reload ( event : MouseEvent ) : void {
		event.preventDefault();
		event.stopPropagation();
		this.loadData();
	}

	onSearch () : void {
		this.loadData();
	}

	checkData () : void {
		this.state.set( 'loading' );
		const conditions : IctuConditionParam[] = [ {
			conditionName : 'dotthi_id' ,
			condition     : IctuQueryCondition.equal ,
			value         : '0'
		} ];
		const queryParams : IctuQueryParams     = {
			limit  : -1 ,
			paged  : 1 ,
			select : 'id,shift_register_id,dotthi_id'
		}
		this.shiftRegisterTestService.query( conditions , queryParams ).pipe(
			takeUntil( this.destroy$ ) ,
			map( ( _res : DtoObject<ShiftRegisterTest[]> ) : ShiftRegisterTestUpdate[] => _res.data.map( ( i : ShiftRegisterTest ) : ShiftRegisterTestUpdate => ( {
				... i ,
				completed : false
			} ) ) ) ,
			switchMap( ( tests : ShiftRegisterTestUpdate[] ) : Observable<boolean> => {
				if ( tests.length > 0 ) {
					this.testValidator.percent = 0;
					this.testValidator.list    = tests;
					this.testValidator.step    = 100 / tests.length;
					this.testValidator.panel   = this.notification.ProgressBarWithPercent( 0 , true );
					return timer( 500 ).pipe(
						switchMap( () : Observable<boolean> => this.updateDataIndividually( true ) )
					)
				}
				else {
					return of( false );
				}
			} )
		).subscribe( {
			next  : ( complete : boolean ) : void => {
				if ( complete ) {
					this.testValidator.panel.componentInstance.percent = 101;
				}
				else {
					this.notification.toastSuccess( 'Thành công' )
				}
				this.state.set( 'success' );
			} ,
			error : () : void => {
				this.state.set( 'success' );
				this.notification.toastError( 'Kiểm tra thất bại' )
			}
		} );
	}

	private updateDataIndividually ( state : boolean ) : Observable<boolean> {
		const index : number = this.testValidator.list.findIndex( ( i : ShiftRegisterTestUpdate ) : boolean => ! i.completed );
		if ( -1 !== index ) {
			return this.shiftRegistersService.getDataById( this.testValidator.list[ index ].shift_register_id , { select : 'id,dotthi_id' } ).pipe(
				switchMap( ( { dotthi_id } : DoiTacThiSinh ) : Observable<number> => this.shiftRegisterTestService.update( this.testValidator.list[ index ].id , { dotthi_id } ) ) ,
				map( () : void => {
					this.testValidator.percent += this.testValidator.step;
					this.testValidator.panel.componentInstance.percent = Math.min( Math.round( this.testValidator.percent ) , 99 );
					this.testValidator.list[ index ].completed         = true;
				} ) ,
				delay( 100 ) ,
				switchMap( () : Observable<boolean> => this.updateDataIndividually( state ) )
			)
		}
		else {
			return of( state )
		}
	}

	ngOnDestroy () : void {
		this.destroy$.next();
		this.destroy$.complete();
	}
}
