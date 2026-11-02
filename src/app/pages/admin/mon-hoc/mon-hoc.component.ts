import { Component , inject , OnDestroy , OnInit , signal , ViewChild , WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl , FormBuilder , FormGroup , FormsModule , ReactiveFormsModule , Validators } from "@angular/forms";
import { ComponentBaseState , IctuBasePermissionClass , IctuDropdownOption , IctuTableComponent } from "@model/commons";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { Sidebar , SidebarModule } from "primeng/sidebar";
import { MonHoc } from "@model/mon-hoc";
import { IctuFormControl } from "@model/ictu-form-control";
import { DataTableEvent , DataTableEventName , IctuDataTable } from "@model/ictu-data-table";
import { filter , map , Observable , Subject , switchMap , takeUntil } from "rxjs";
import { NotificationService } from "@appNotification";
import { IctuDeleteAnimationControl } from "@model/ictu-delete-animation-control";
import { DtoObject } from "@model/dto";
import { MonHocService } from "@service/luyenthithpt/mon-hoc.service";
import { InputTextModule } from "primeng/inputtext";
import { MatButtonModule } from "@angular/material/button";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { IctuPaginatorComponent } from "@theme/components/ictu-paginator/ictu-paginator.component";
import { InputTextareaModule } from "primeng/inputtextarea";
import { HelperService } from "@service/core/helper.service";
import { DropdownModule } from "primeng/dropdown";

@Component( {
	selector    : 'app-mon-hoc' ,
	standalone  : true ,
	imports     : [ CommonModule , MatProgressBarModule , SidebarModule , InputTextModule , FormsModule , MatButtonModule , MatCheckboxModule , IctuPaginatorComponent , ReactiveFormsModule , InputTextareaModule , DropdownModule ] ,
	templateUrl : './mon-hoc.component.html' ,
	styleUrls   : [ './mon-hoc.component.css' ]
} )
export class MonHocComponent extends IctuBasePermissionClass implements OnInit , OnDestroy , IctuTableComponent<MonHoc> {

	readonly optionStates : IctuDropdownOption<number>[] = [
		{ value : 0 , label : 'Không kích hoạt' } ,
		{ value : 1 , label : 'Kích hoạt' }
	];

	private readonly service : MonHocService = inject<MonHocService>( MonHocService );

	private readonly notification : NotificationService = inject<NotificationService>( NotificationService );

	private readonly helperService : HelperService = inject<HelperService>( HelperService );

	readonly state : WritableSignal<ComponentBaseState> = signal<ComponentBaseState>( 'loading' );

	private readonly fb : FormBuilder = inject( FormBuilder );

	search : string = '';

	readonly formControl : IctuFormControl<MonHoc>;

	private readonly formGroup : FormGroup = this.fb.group( {
		id     : [ 0 ] ,
		name   : [ '' , [ Validators.required , Validators.minLength( 2 ) , Validators.maxLength( 255 ) ] ] ,
		slug   : [ '' , [ Validators.required ] , [ this.service.checkSlugExists() ] ] ,
		desc   : [ '' ] ,
		status : [ 0 ]
	} );

	@ViewChild( Sidebar , { static : true } ) _sidebar : Sidebar;

	dataTable : IctuDataTable<MonHoc> = new IctuDataTable<MonHoc>();

	private readonly eventObserver$ : Subject<DataTableEvent<MonHoc>> = new Subject<DataTableEvent<MonHoc>>();

	private readonly onDestroy$ : Subject<string> = new Subject<string>();

	private readonly handelEvent : Record<DataTableEventName , ( data : MonHoc ) => void> = {
		OPEN_FORM_ADD        : () : void => {
			this.formControl.formGroup.reset( {
				id     : 0 ,
				name   : '' ,
				slug   : '' ,
				desc   : '' ,
				status : 0
			} );
			this.formControl.openFormAdd();
			this.formField( 'slug' ).enable();
		} ,
		OPEN_FORM_UPDATE     : ( data : MonHoc ) : void => {
			this.formControl.formGroup.reset( {
				id     : data.id ,
				name   : data.name ,
				slug   : data.slug ,
				desc   : data.desc ,
				status : data.status
			} );
			this.formControl.openFormEdit( data );
			this.formField( 'slug' ).disable();
		} ,
		DELETE_SINGLE_ROW    : ( { id } : MonHoc ) : void => {
			this.requestDeletingData( [ id ] );
		} ,
		DELETE_SELECTED_ROWS : () : void => {
			const ids : number[] = this.dataTable.getSelectedData().map( ( { id } : MonHoc ) : number => id );
			if ( ids.length ) {
				this.requestDeletingData( ids );
			}
		} ,
		SUBMIT_FORM          : () : void => {
			if ( this.formControl.canSubmit ) {
				const info : Partial<MonHoc>    = {
					name   : this.formField( 'name' ).value ,
					slug   : this.formField( 'slug' ).value ,
					desc   : this.formField( 'desc' ).value ,
					status : this.formField( 'status' ).value
				};
				const request : Observable<any> = this.formControl.isFormAdd ? this.service.create( info ) : this.service.update( this.formControl.object.id , info )
				const prefix : string           = this.formControl.isFormAdd ? 'Thêm mới' : 'Cập nhật';
				this.formControl.submit( request ).subscribe( {
					next  : () : void => {
						this.notification.toastSuccess( prefix.concat( ' thành công' ) , 'Thông báo' );
						if ( this.formControl.isFormAdd ) {
							this.formControl.formGroup.reset( {} );
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
		}
	}

	private _temp : { paged : number, resetPaginator : boolean } = { paged : 1 , resetPaginator : true };

	constructor () {
		super( 'mon-hoc' );
		this.formControl = new IctuFormControl( {
			formGroup      : this.formGroup ,
			objectName     : 'môn học' ,
			dropdownFields : [] ,
			sidebar        : this._sidebar
		} );

		this.eventObserver$.asObservable().pipe(
			takeUntil( this.onDestroy$ )
		).subscribe( ( { name , data } : DataTableEvent<MonHoc> ) : void => this.handelEvent[ name ]( data ) );

		this.formField( 'name' ).valueChanges.pipe(
			takeUntil( this.onDestroy$ ) ,
			filter( () : boolean => ! this.formField( 'id' ).value && this.formField( 'id' ).valid )
		).subscribe( ( value : string ) : void => {
			this.formField( 'slug' ).setValue( value ? this.helperService.sanitizeVietnameseTitle( value ) : '' );
			this.formField( 'slug' ).markAsTouched();
		} );
	}

	ngOnInit () : void {
		this.loadData( 1 , true );
	}

	formField ( name : keyof MonHoc ) : AbstractControl {
		return this.formControl.formGroup.get( name );
	}

	onDrawerHide () : void {
		if ( this.formControl.submitted ) {
			this.loadData( 1 , true );
		}
	}

	private requestDeletingData ( ids : number[] ) : void {
		this.notification.confirmDelete2( ids.length ).pipe(
			filter( ( confirm : boolean ) : boolean => confirm ) ,
			map( () : IctuDeleteAnimationControl<MonHoc> => new IctuDeleteAnimationControl( ids , this.service ) ) ,
			switchMap( ( deleteController : IctuDeleteAnimationControl<MonHoc> ) : Observable<boolean> => {
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

	loadData ( paged : number = 1 , resetPaginator : boolean = true ) : void {
		this.state.set( 'loading' );
		this._temp = { paged , resetPaginator };
		this.service.load( this.search , {
			limit : this.dataTable.paginator.rows() ,
			paged
		} ).pipe(
			map( ( res : DtoObject<MonHoc[]> ) : MonHoc[] => {
				if ( resetPaginator ) {
					return this.dataTable.paginator.setupPaginator( res );
				}
				else {
					this.dataTable.paginator.changePage( paged );
					return res.data;
				}
			} )
		).subscribe( {
			next  : ( data : MonHoc[] ) : void => {
				this.dataTable.fillData( data );
				this.state.set( 'success' );
			} ,
			error : () : void => {
				this.state.set( 'error' )
			}
		} )
	}

	deleteRow ( data : MonHoc ) : void {
		this.eventObserver$.next( { name : 'DELETE_SINGLE_ROW' , data } );
	}

	deleteSelectedRows () : void {
		this.eventObserver$.next( { name : 'DELETE_SELECTED_ROWS' , data : null } );
	}

	editRow ( data : MonHoc ) : void {
		this.eventObserver$.next( { name : 'OPEN_FORM_UPDATE' , data } );
	}

	reload ( event : MouseEvent ) : void {
		event.preventDefault();
		event.stopPropagation();
		this.loadData( this._temp.paged , this._temp.resetPaginator );
	}

	addNewItem () : void {
		this.eventObserver$.next( { name : 'OPEN_FORM_ADD' , data : null } );
	}

	submitForm () : void {
		this.eventObserver$.next( { name : 'SUBMIT_FORM' , data : null } );
	}

	onChangePage ( paged : number ) : void {
		this.loadData( paged , false );
	}

	onSearchData () : void {
		this.loadData( 1 , true );
	}

	ngOnDestroy () : void {
		this.onDestroy$.next( 'OnDestroy' );
		this.onDestroy$.complete();
	}

	identify ( _ : number , subject : MonHoc ) : number | string {
		return subject.id;
	}
}
