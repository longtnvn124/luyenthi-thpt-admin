import { Component , inject , OnDestroy , OnInit , signal , ViewChild , WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IctuPaginatorComponent } from "@theme/components/ictu-paginator/ictu-paginator.component";
import { InputTextModule } from "primeng/inputtext";
import { MatButtonModule } from "@angular/material/button";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { PaginatorModule } from "primeng/paginator";
import { NotificationService } from "@appNotification";
import { ComponentBaseState , IctuBasePermissionClass , IctuDropdownOption , IctuTableComponent } from "@model/commons";
import { DotThi } from "@model/dotthi";
import { DataTableEvent , DataTableEventName , IctuDataTable } from '@model/ictu-data-table';
import { filter , map , Observable , Subject , switchMap , takeUntil } from "rxjs";
import { DotThiService } from "@service/luyenthithpt/dotthi.service";
import { DtoObject , IctuConditionParam , IctuQueryCondition , IctuQueryParams } from "@model/dto";
import { MatTooltipModule } from "@angular/material/tooltip";
import { InputTextareaModule } from "primeng/inputtextarea";
import { FormBuilder , FormGroup , ReactiveFormsModule , Validators } from "@angular/forms";
import { Sidebar , SidebarModule } from "primeng/sidebar";
import { IctuFormControl } from "@model/ictu-form-control";
import moment from "moment";
import { IctuDeleteAnimationControl } from "@model/ictu-delete-animation-control";

@Component( {
	selector    : 'app-dot-thi' ,
	standalone  : true ,
	imports     : [ CommonModule , IctuPaginatorComponent , InputTextModule , MatButtonModule , MatProgressBarModule , PaginatorModule , MatTooltipModule , InputTextareaModule , ReactiveFormsModule , SidebarModule ] ,
	templateUrl : './dot-thi.component.html' ,
	styleUrls   : [ './dot-thi.component.css' ]
} )
export class DotThiComponent extends IctuBasePermissionClass implements OnInit , OnDestroy , IctuTableComponent<DotThi> {

	readonly optionStates : IctuDropdownOption<number>[] = [
		{ value : 0 , label : 'Không kích hoạt' } ,
		{ value : 1 , label : 'Kích hoạt' }
	];

	readonly dataTable : IctuDataTable<DotThi> = new IctuDataTable<DotThi>();

	private readonly destroy$ : Subject<void> = new Subject<void>();

	private readonly notification : NotificationService = inject<NotificationService>( NotificationService );

	readonly state : WritableSignal<ComponentBaseState> = signal<ComponentBaseState>( 'loading' );

	private readonly service : DotThiService = inject<DotThiService>( DotThiService );

	private readonly fb : FormBuilder = inject( FormBuilder );

	private readonly handelEvent : Record<DataTableEventName , ( data : DotThi ) => void> = {
		OPEN_FORM_ADD        : () : void => {
			this.formControl.formGroup.reset( {
				name           : '' ,
				ngaythi_dukien : '' ,
				date_start     : '' ,
				date_end       : '' ,
				status         : 0
			} );
			this.formControl.openFormAdd();
		} ,
		OPEN_FORM_UPDATE     : ( data : DotThi ) : void => {
			this.formControl.formGroup.reset( {
				name           : data.name ,
				ngaythi_dukien : data.ngaythi_dukien ? moment( data.ngaythi_dukien ).format( 'DD-MM-YYYY' ) : '' ,
				date_start     : data.date_start ? moment( data.date_start ).format( 'DD-MM-YYYY' ) : '' ,
				date_end       : data.date_end ? moment( data.date_end ).format( 'DD-MM-YYYY' ) : '' ,
				status         : data.status
			} );
			this.formControl.openFormEdit( data );
		} ,
		SUBMIT_FORM          : () : void => {
			if ( this.formControl.canSubmit ) {
				const _formValue : Partial<DotThi> = this.formControl.formGroup.value;
				const info : Partial<DotThi>       = {
					... _formValue ,
					ngaythi_dukien : _formValue.ngaythi_dukien.replace( /\//gm , '-' ).split( '-' ).reverse().join( '-' ) ,
					date_start     : _formValue.date_start.replace( /\//gm , '-' ).split( '-' ).reverse().join( '-' ) ,
					date_end       : _formValue.date_end.replace( /\//gm , '-' ).split( '-' ).reverse().join( '-' )
				};
				const request : Observable<any>    = this.formControl.isFormAdd ? this.service.create( info ) : this.service.update( this.formControl.object.id , info );
				const prefix : string              = this.formControl.isFormAdd ? 'Thêm mới' : 'Cập nhật';
				this.formControl.submit( request ).subscribe( {
					next  : () : void => {
						this.notification.toastSuccess( prefix.concat( ' thành công' ) , 'Thông báo' );
						if ( this.formControl.isFormAdd ) {
							this.formControl.formGroup.reset( {
								name           : '' ,
								ngaythi_dukien : '' ,
								date_start     : '' ,
								date_end       : '' ,
								status         : 0
							} );
						}
						else {
							this.formControl.closeForm();
						}
					} ,
					error : () : void => {
						this.notification.toastError( prefix.concat( ' thất bại' ) , 'Thông báo' );
					}
				} )
			}
		} ,
		DELETE_SINGLE_ROW    : ( { id } : DotThi ) : void => {
			this.requestDeletingData( [ id ] );
		} ,
		DELETE_SELECTED_ROWS : () : void => {
		}
	}

	private readonly eventObserver$ : Subject<DataTableEvent<DotThi>> = new Subject<DataTableEvent<DotThi>>();

	private _temp : { paged : number, resetPaginator : boolean } = { paged : 1 , resetPaginator : true };

	public search : string = '';

	readonly formControl : IctuFormControl<DotThi>;

	private readonly formGroup : FormGroup = this.fb.group( {
		name           : [ '' , [ Validators.required , Validators.minLength( 2 ) , Validators.maxLength( 255 ) ] ] ,
		ngaythi_dukien : [ '' , [ Validators.required , Validators.pattern( /^\d{2}[\-\/]\d{2}[\-\/]\d{4}$/ ) ] ] ,
		date_start     : [ '' , [ Validators.required , Validators.pattern( /^\d{2}[\-\/]\d{2}[\-\/]\d{4}$/ ) ] ] ,
		date_end       : [ '' , [ Validators.required , Validators.pattern( /^\d{2}[\-\/]\d{2}[\-\/]\d{4}$/ ) ] ] ,
		status         : [ 0 ]
	} );

	@ViewChild( Sidebar , { static : true } ) _sidebar : Sidebar;

	constructor () {
		super( 'dot-thi' );
		this.formControl = new IctuFormControl( {
			formGroup      : this.formGroup ,
			objectName     : 'đợt thi' ,
			dropdownFields : [] ,
			sidebar        : this._sidebar
		} );
	}

	ngOnInit () : void {
		this.eventObserver$.pipe(
			takeUntil( this.destroy$ )
		).subscribe( ( { name , data } : DataTableEvent<DotThi> ) : void => this.handelEvent[ name ]( data ) );

		this.loadData( 1 , true );
	}

	private loadData ( paged : number = 1 , resetPaginator : boolean = true ) : void {
		this.state.set( 'loading' );
		this._temp = { paged , resetPaginator };
		this.loader( this.search , paged ).pipe(
			map( ( res : DtoObject<DotThi[]> ) : DotThi[] => {
				if ( resetPaginator ) {
					return this.dataTable.paginator.setupPaginator( res );
				}
				else {
					this.dataTable.paginator.changePage( paged );
					return res.data;
				}
			} )
		).subscribe( {
			next  : ( data : DotThi[] ) : void => {
				this.dataTable.fillData( data );
				this.state.set( 'success' );
			} ,
			error : () : void => {
				this.state.set( 'error' )
			}
		} )
	}

	private loader ( search : string , paged : number = 1 ) : Observable<DtoObject<DotThi[]>> {
		const conditions : IctuConditionParam[] = [];
		const queryParams : IctuQueryParams     = {
			limit   : this.dataTable.paginator.rows() ,
			select  : 'id,name,ngaythi_dukien,date_start,date_end,status' ,
			order   : 'DESC' ,
			orderby : 'ngaythi_dukien' ,
			paged
		};
		if ( search ) {
			conditions.push( {
				conditionName : 'name' ,
				condition     : IctuQueryCondition.like ,
				value         : `%${ search }%`
			} );
		}
		return this.service.query( conditions , queryParams )
	}

	identify ( _ : number , item : DotThi ) : number {
		return item.id;
	}

	reload ( event : MouseEvent ) : void {
		event.preventDefault();
		event.stopPropagation();
		this.loadData( this._temp.paged , this._temp.resetPaginator );
	}

	onChangePage ( paged : number ) : void {
		this.loadData( paged , false );
	}

	onSearchData () : void {
		this.loadData( 1 , true );
	}

	createNewData () : void {
		this.eventObserver$.next( { name : 'OPEN_FORM_ADD' , data : null } );
	}

	editRow ( data : DotThi ) : void {
		this.eventObserver$.next( { name : 'OPEN_FORM_UPDATE' , data } );
	}

	deleteRow ( data : DotThi ) : void {
		this.eventObserver$.next( { name : 'DELETE_SINGLE_ROW' , data } );
	}

	submitForm () : void {
		this.eventObserver$.next( { name : 'SUBMIT_FORM' , data : null } );
	}

	onDrawerHide () : void {
		if ( this.formControl.submitted ) {
			this.loadData( 1 , true );
		}
	}

	private requestDeletingData ( ids : number[] ) : void {
		this.notification.confirmDelete2( ids.length ).pipe(
			filter( ( confirm : boolean ) : boolean => confirm ) ,
			map( () : IctuDeleteAnimationControl<DotThi> => new IctuDeleteAnimationControl( ids , this.service ) ) ,
			switchMap( ( deleteController : IctuDeleteAnimationControl<DotThi> ) : Observable<boolean> => {
				deleteController.run();
				return this.notification.startDeleting( deleteController.progress );
			} )
		).subscribe( {
			next  : ( success : boolean ) : void => {
				if ( success ) {
					this.notification.toastSuccess( 'Xóa thành công' );
				}
				this.loadData( 1 , true );
			} ,
			error : () : void => {
				this.notification.toastError( 'Xóa thất bại' );
			}
		} );
	}

	ngOnDestroy () : void {
		this.destroy$.next();
		this.destroy$.complete();
	}
}
