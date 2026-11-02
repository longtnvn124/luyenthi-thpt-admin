import { Component , inject , OnDestroy , OnInit , signal , ViewChild , WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Bank , BankFormat , BankType } from "@model/tn-bank";
import { DropdownModule } from "primeng/dropdown";
import { InputTextModule } from "primeng/inputtext";
import { InputTextareaModule } from "primeng/inputtextarea";
import { MatButtonModule } from "@angular/material/button";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { PaginatorModule } from "primeng/paginator";
import { ToggleButtonModule } from 'primeng/togglebutton';
import { AbstractControl , FormBuilder , FormGroup , ReactiveFormsModule , Validators } from "@angular/forms";
import { SharedModule } from "primeng/api";
import { Sidebar , SidebarModule } from "primeng/sidebar";
import { MatTooltipModule } from "@angular/material/tooltip";
import { ComponentBaseState , IctuBasePermissionClass , IctuDropdownField , IctuDropdownOption , IctuTableComponent } from "@model/commons";
import { TnBankService } from "@service/luyenthithpt/tn-bank.service";
import { MonHocService } from "@service/luyenthithpt/mon-hoc.service";
import { NotificationService } from "@appNotification";
import { HelperService } from "@service/core/helper.service";
import { IctuFormControl } from "@model/ictu-form-control";
import { DataTableEvent , DataTableEventName , IctuDataTable } from "@model/ictu-data-table";
import { filter , forkJoin , map , Observable , of , Subject , switchMap , takeUntil } from "rxjs";
import { IctuDeleteAnimationControl } from "@model/ictu-delete-animation-control";
import { DtoObject } from "@model/dto";
import { IctuDropdownOptionMapPipe } from "../../../../pipes/ictu-dropdown-option-map.pipe";
import { IctuPaginatorComponent } from "@theme/components/ictu-paginator/ictu-paginator.component";
import { InputSwitchModule } from "primeng/inputswitch";

interface OriginalBank extends Bank {
	children : BankChild[];
	showChild : boolean;
	dirty : boolean;
}

type BankChildMode = 'input' | 'present';

interface BankChild extends Partial<Bank> {
	_mode : BankChildMode;
	_temp : Partial<Bank>;
	_loading : boolean;
}

@Component( {
	selector    : 'app-banks' ,
	standalone  : true ,
	imports     : [ CommonModule , DropdownModule , InputTextModule , InputTextareaModule , MatButtonModule , MatCheckboxModule , MatProgressBarModule , PaginatorModule , ReactiveFormsModule , SharedModule , SidebarModule , MatTooltipModule , IctuDropdownOptionMapPipe , IctuPaginatorComponent , ToggleButtonModule , InputSwitchModule ] ,
	templateUrl : './banks.component.html' ,
	styleUrls   : [ './banks.component.css' ]
} )
export class BanksComponent extends IctuBasePermissionClass implements OnInit , OnDestroy , IctuTableComponent<OriginalBank> {

	readonly optionStates : IctuDropdownOption<number>[] = [
		{ value : 0 , label : 'Không kích hoạt' } ,
		{ value : 1 , label : 'Kích hoạt' }
	];

	readonly TYPE_BANK_OPTIONS : IctuDropdownOption<BankType>[] = [
		{ value : "THI" , label : 'Thi' } ,
		{ value : "KIEMTRA" , label : 'Kiểm tra' }
	];

	readonly FORMAT_BANK_OPTIONS : IctuDropdownOption<BankFormat>[] = [
		{ value : "standard" , label : 'Tiêu chuẩn' } ,
		{ value : "english" , label : 'Tiếng anh' }
	];

	private readonly service : TnBankService = inject<TnBankService>( TnBankService );

	private readonly monHocService : MonHocService = inject<MonHocService>( MonHocService );

	private readonly notification : NotificationService = inject<NotificationService>( NotificationService );

	private readonly helperService : HelperService = inject<HelperService>( HelperService );

	readonly state : WritableSignal<ComponentBaseState> = signal<ComponentBaseState>( 'loading' );

	private readonly fb : FormBuilder = inject( FormBuilder );

	search : string = '';

	readonly formControl : IctuFormControl<Bank>;

	private readonly formGroup : FormGroup = this.fb.group( {
		name       : [ '' , [ Validators.required , Validators.minLength( 2 ) , Validators.maxLength( 255 ) ] ] ,
		slug       : [ '' ] ,
		subject_id : [ 0 , [ Validators.required , Validators.min( 1 ) ] ] ,
		type       : [ '' , Validators.required ] ,
		desc       : [ '' ] ,
		format     : [ 'standard' ] ,
		status     : [ 0 ]
	} );

	@ViewChild( Sidebar , { static : true } ) _sidebar : Sidebar;

	dataTable : IctuDataTable<OriginalBank> = new IctuDataTable<OriginalBank>();

	private readonly eventObserver$ : Subject<DataTableEvent<Bank>> = new Subject<DataTableEvent<Bank>>();

	private readonly onDestroy$ : Subject<string> = new Subject<string>();

	private readonly handelEvent : Record<DataTableEventName , ( data : Bank ) => void> = {
		OPEN_FORM_ADD        : () : void => {
			this.formControl.formGroup.reset( {
				name       : '' ,
				slug       : '' ,
				subject_id : 0 ,
				type       : '' ,
				desc       : '' ,
				format     : 'standard' ,
				status     : 0
			} );
			this.formControl.openFormAdd();
		} ,
		OPEN_FORM_UPDATE     : ( data : Bank ) : void => {
			this.formControl.formGroup.reset( {
				name       : data.name ,
				slug       : data.slug ,
				subject_id : data.subject_id ,
				type       : data.type ,
				desc       : data.desc ,
				status     : data.status ,
				format     : data.format
			} );
			this.formControl.openFormEdit( data );
		} ,
		DELETE_SINGLE_ROW    : ( { id } : Bank ) : void => {
			this.requestDeletingData( [ id ] );
		} ,
		DELETE_SELECTED_ROWS : () : void => {
			const ids : number[] = this.dataTable.getSelectedData().map( ( { id } : Bank ) : number => id );
			if ( ids.length ) {
				this.requestDeletingData( ids );
			}
		} ,
		SUBMIT_FORM          : () : void => {
			if ( this.formControl.canSubmit ) {
				const info : Partial<Bank>      = this.formControl.formGroup.value;
				const request : Observable<any> = this.formControl.isFormAdd ? this.service.create( info ) : this.service.update( this.formControl.object.id , info );
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

	subjectDropdownField : IctuDropdownField = new IctuDropdownField( this.monHocService.listSubjectsAsOptions() , 'Chọn môn học' );

	constructor () {
		super( 'ngan-hang/danh-sach' );
		this.formControl = new IctuFormControl( {
			formGroup      : this.formGroup ,
			objectName     : 'ngân hàng' ,
			dropdownFields : [] ,
			sidebar        : this._sidebar
		} );

		this.eventObserver$.asObservable().pipe(
			takeUntil( this.onDestroy$ )
		).subscribe( ( { name , data } : DataTableEvent<OriginalBank> ) : void => this.handelEvent[ name ]( data ) );

		this.formField( 'name' ).valueChanges.pipe(
			takeUntil( this.onDestroy$ )
		).subscribe( ( value : string ) : void => {
			this.formField( 'slug' ).setValue( value ? this.helperService.sanitizeVietnameseTitle( value ) : '' );
		} );
	}

	ngOnInit () : void {
		this.loadData( 1 , true );
	}

	formField ( name : keyof Bank ) : AbstractControl {
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
			map( () : IctuDeleteAnimationControl<Bank> => new IctuDeleteAnimationControl( ids , this.service ) ) ,
			switchMap( ( deleteController : IctuDeleteAnimationControl<Bank> ) : Observable<boolean> => {
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

	private loader ( paged : number = 1 , resetPaginator : boolean = true ) : Observable<OriginalBank[]> {
		return this.service.load( this.search , {
			limit  : this.dataTable.paginator.rows() ,
			paged ,
			select : 'id,name,parent_id,subject_id,slug,desc,status,user_id,ordering,type,format,additional'
		} ).pipe(
			switchMap( ( res : DtoObject<Bank[]> ) : Observable<[ DtoObject<Bank[]> , Bank[] ]> => {
					const child : Observable<Bank[]> = res.data.length ? this.service.loadChild( res.data.map( ( m : Bank ) : number => m.id ) ) : of( [] );
					return forkJoin<[ DtoObject<Bank[]> , Bank[] ]>( [ of( res ) , child ] );
				}
			) ,
			map( ( [ res , child ] : [ DtoObject<Bank[]> , Bank[] ] ) : DtoObject<OriginalBank[]> => {
				const data : OriginalBank[] = res.data.map( ( _parent : Bank ) : OriginalBank => {
					const children : BankChild[] = child.filter( ( _child : Bank ) : boolean => _child.parent_id === _parent.id ).map( ( __child : Bank ) : BankChild => ( {
						... __child ,
						_mode    : 'present' ,
						_temp    : null ,
						_loading : false
					} ) );
					return {
						... _parent ,
						children  : this.helperService.arraySort<BankChild>( children , "ordering" , 1 ) ,
						showChild : false ,
						dirty     : false
					}
				} );
				return { ... res , data };
			} ) ,
			map( ( res : DtoObject<OriginalBank[]> ) : OriginalBank[] => {
				if ( resetPaginator ) {
					return this.dataTable.paginator.setupPaginator( res );
				}
				else {
					this.dataTable.paginator.changePage( paged );
					return res.data;
				}
			} )
		)
	}

	private loadData ( paged : number = 1 , resetPaginator : boolean = true ) : void {
		this.state.set( 'loading' );
		this._temp = { paged , resetPaginator };
		forkJoin<[ any , OriginalBank[] ]>( [
			this.loadSubjectOption() ,
			this.loader( paged , resetPaginator )
		] ).subscribe( {
			next  : ( [ _ , data ] : [ any , OriginalBank[] ] ) : void => {
				this.dataTable.fillData( data );
				this.state.set( 'success' );
			} ,
			error : () : void => {
				this.state.set( 'error' )
			}
		} )
	}

	private loadSubjectOption () : Observable<any> {
		return this.subjectDropdownField.dirty ? this.subjectDropdownField.load() : of( '' );
	}

	deleteRow ( data : OriginalBank ) : void {
		this.eventObserver$.next( { name : 'DELETE_SINGLE_ROW' , data } );
	}

	deleteSelectedRows () : void {
		this.eventObserver$.next( { name : 'DELETE_SELECTED_ROWS' , data : null } );
	}

	showBankChild ( data : OriginalBank ) : void {
		if ( data.showChild ) {
			data.children  = data.children.filter( ( child : BankChild ) : boolean => !! child.id );
			data.showChild = false;
		}
		else {
			data.showChild = true;
		}
	}

	editRow ( data : OriginalBank ) : void {
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

	identify ( _ : number , item : OriginalBank ) : number | string {
		return item.id;
	}

	identifyChild ( _ : number , item : BankChild ) : number | string {
		return item.id;
	}

	deleteChild ( parent : OriginalBank , child : BankChild ) : void {
		this.notification.confirmDelete2( 1 ).pipe(
			filter( ( confirm : boolean ) : boolean => confirm ) ,
			map( () : IctuDeleteAnimationControl<Bank> => new IctuDeleteAnimationControl( [ child.id ] , this.service ) ) ,
			switchMap( ( deleteController : IctuDeleteAnimationControl<Bank> ) : Observable<boolean> => {
				deleteController.run();
				return this.notification.startDeleting( deleteController.progress );
			} )
		).subscribe( {
			next  : ( success : boolean ) : void => {
				parent.children = parent.children.filter( ( _child : BankChild ) : boolean => _child.id !== child.id );
				if ( success ) {
					this.notification.toastSuccess( 'Xóa thành công' );
				}
			} ,
			error : () : void => {
				this.notification.toastError( 'Xóa thất bại' );
			}
		} );
	}

	createNewBankChildModel ( parent : OriginalBank ) : void {
		parent.children.push( {
			id         : 0 ,
			name       : '' ,
			slug       : '' ,
			desc       : '' ,
			additional : '' ,
			ordering   : 1000 ,
			parent_id  : parent.id ,
			subject_id : parent.subject_id ,
			status     : parent.status ,
			user_id    : parent.user_id ,
			type       : parent.type ,
			format     : parent.format ,
			_loading   : false ,
			_mode      : 'input' ,
			_temp      : {
				name       : '' ,
				slug       : '' ,
				desc       : '' ,
				additional : '' ,
				ordering   : 1000 ,
				status     : 0
			}
		} )
	}

	updateChild ( parent : OriginalBank , item : BankChild ) : void {
		item._loading = true;
		if ( item.id ) {
			this.service.update( item.id , item._temp ).pipe(
				takeUntil( this.onDestroy$ )
			).subscribe( {
				next  : () : void => {
					item.name       = item._temp.name;
					item.slug       = item._temp.slug;
					item.desc       = item._temp.desc;
					item.additional = item._temp.additional;
					item.status     = item._temp.status;
					item.ordering   = parseInt( item._temp.ordering.toString( 10 ) , 10 );
					item._loading   = false;
					this.notification.toastSuccess( 'Lưu khối kiến thức thành công' , 'Thông báo' );
					item._mode      = 'present';
					parent.children = this.helperService.arraySort<BankChild>( parent.children , "ordering" , 1 );
				} ,
				error : () : void => {
					item._loading = false;
					this.notification.toastError( 'Lưu khối kiến thức thất bại' , 'Cảnh báo' )
				}
			} );
		}
		else {
			this.service.create( {
				name       : item._temp.name ,
				slug       : item._temp.slug ,
				desc       : item._temp.desc ,
				additional : item._temp.additional ,
				ordering   : item._temp.ordering ,
				status     : item._temp.status ,
				parent_id  : parent.id ,
				subject_id : parent.subject_id ,
				user_id    : parent.user_id ,
				type       : parent.type ,
				format     : parent.format
			} ).pipe(
				takeUntil( this.onDestroy$ )
			).subscribe( {
				next  : ( id : number ) : void => {
					item.id         = id;
					item.name       = item._temp.name;
					item.slug       = item._temp.slug;
					item.desc       = item._temp.desc;
					item.additional = item._temp.additional;
					item.status     = item._temp.status;
					item.ordering   = parseInt( item._temp.ordering.toString( 10 ) , 10 );
					item._loading   = false;
					this.notification.toastSuccess( 'Lưu khối kiến thức thành công' , 'Thông báo' );
					item._mode      = 'present';
					parent.children = this.helperService.arraySort<BankChild>( parent.children , "ordering" , 1 );
				} ,
				error : () : void => {
					item._loading = false;
					this.notification.toastError( 'Lưu khối kiến thức thất bại' , 'Cảnh báo' )
				}
			} );
		}
	}

	cancelEditChild ( item : BankChild ) : void {
		item._loading = false;
		item._temp    = null;
		item._mode    = 'present';
	}

	editChild ( item : BankChild ) : void {
		item._temp = {
			name       : item.name ,
			slug       : item.slug ,
			desc       : item.desc ,
			additional : item.additional ,
			ordering   : item.ordering ,
			status     : item.status
		};
		item._mode = 'input';
	}

	generateChildSlug ( item : BankChild ) : void {
		item._temp.slug = this.helperService.sanitizeVietnameseTitle( item._temp.name );
	}

	ngOnDestroy () : void {
		this.onDestroy$.next( 'OnDestroy' );
		this.onDestroy$.complete();
	}
}
