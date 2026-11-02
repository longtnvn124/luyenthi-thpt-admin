import { Component , computed , inject , OnDestroy , OnInit , Signal , signal , TemplateRef , ViewChild , WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl , FormBuilder , FormGroup , FormsModule , ReactiveFormsModule , Validators } from '@angular/forms';
import { ComponentBaseState , IctuBasePermissionClass , IctuDropdownField , IctuDropdownOption , IctuDropdownOptionExtended , IctuTableComponent } from '@model/commons';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Sidebar , SidebarModule } from 'primeng/sidebar';
import readXlsxFile , { Row } from 'read-excel-file';
import { IctuFormControl } from '@model/ictu-form-control';
import { DataTableEvent , DataTableEventName , IctuDataTable } from '@model/ictu-data-table';
import { debounceTime , filter , forkJoin , map , merge , Observable , of , Subject , switchMap , take , takeUntil } from 'rxjs';
import { NotificationService } from '@appNotification';
import { IctuDeleteAnimationControl } from '@model/ictu-delete-animation-control';
import { DtoObject } from '@model/dto';
import { InputTextModule } from 'primeng/inputtext';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { IctuPaginatorComponent } from '@theme/components/ictu-paginator/ictu-paginator.component';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { HelperService } from '@service/core/helper.service';
import { DropdownModule } from 'primeng/dropdown';
import { DoiTacThiSinh } from '@model/doi-tac-thi-sinh';
import { DoiTacThiSinhService } from '@service/luyenthithpt/doi-tac-thi-sinh.service';
import { MatDialog , MatDialogRef } from '@angular/material/dialog';
import { PersonalInfo } from '@model/user';
import { DragAndDropDirective } from '@theme/directives/drag-and-drop.directive';
import { FileService } from '@service/core/file.service';
import saveAs from 'file-saver';
import { SubjectService } from '@service/luyenthithpt/subject.service';
import { DotThiService } from '@service/luyenthithpt/dotthi.service';
import { MultiSelectModule } from 'primeng/multiselect';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SummaryService } from '@service/luyenthithpt/summary.service';
import { FormatVndCurrencyPipe } from 'src/app/pipes/format-vnd-currency.pipe';
import { DoiTacService } from '@service/luyenthithpt/doi-tac.service';
import { DoiTac } from '@model/doi-tac';
import { DonViService } from '@service/luyenthithpt/donvi.service';
import { IctuDropdownOptionMapPipe } from 'src/app/pipes/ictu-dropdown-option-map.pipe';
import { DotThi } from '@model/dotthi';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { DialogModule } from 'primeng/dialog';
import { AuthService } from '@service/core/auth.service';
import { tap } from "rxjs/operators";
import { DropdownChangeEvent } from "primeng/dropdown/dropdown.interface";

type ImportPanelLayout = 'SELECT_FILE' | 'PROCESS';

type Mode = 'DF' | 'import';

type TSImportState = 'prepare' | 'invalid' | 'waitting' | 'uploading' | 'uploadingFail' | 'uploaded'

interface TSImport {
	id : number;
	hoten : string;
	ten : string;
	email : string;
	phone : string;
	gioitinh : string;
	donvi_id : number;
	subject_ids : string;
	password : string;
	state : TSImportState;
	errorMessage : string;
	referenceObjectId : number;
	checked : boolean;
}

class ImportPanel<T> {
	readonly step : WritableSignal<ImportPanelLayout>;
	store : T[];
	readonly paged : WritableSignal<number>;
	readonly rows : Signal<number>;
	readonly filtered : WritableSignal<T[]>;
	readonly loadingTitle : WritableSignal<string>;
	readonly indexOffset : Signal<number> = computed( () : number => this.rows() * Math.min( 0 , this.paged() - 1 ) + 1 );
	readonly isLoading : Signal<boolean>  = computed( () : boolean => this.loadingTitle() && this.loadingTitle().length > 0 );

	constructor ( initState : ImportPanelLayout ) {
		this.step         = signal<ImportPanelLayout>( initState );
		this.rows         = signal<number>( 20 );
		this.paged        = signal<number>( 1 );
		this.store        = [];
		this.filtered     = signal<T[]>( [] );
		this.loadingTitle = signal<string>( null );
	}

	public openSelectLayout () : void {
		this.store = [];
		this.filtered.set( [] );
		this.paged.set( 1 );
	}

	public enableLoading ( loadingTitle : string ) : void {
		this.loadingTitle.set( loadingTitle );
	}

	public disableLoading () : void {
		this.loadingTitle.set( null );
	}
}

type ModeCaThiDoiTac = 'listDF' | 'single';
type DoiTacThiSinhImportRowState =
	| 'INVALID'
	| 'VALID'
	| 'UPLOADING'
	| 'UPLOADING_FAIL'
	| 'REJECTED'
	| 'UPLOADED';

interface DoiTacThiSinhImportRow {
	index : number;
	info : Pick<PersonalInfo , 'ho_va_ten' | 'ngaysinh' | 'gioitinh' | 'email' | 'sdt'>;
	doitacthisinh : DoiTacThiSinh;
	ready : Signal<boolean>;
	state : WritableSignal<DoiTacThiSinhImportRowState>;
}

type ReplacementPartner = Pick<DoiTac , 'created_by' | 'donvi_id'>

@Component( {
	selector    : 'app-quan-li-thi-sinh' ,
	standalone  : true ,
	imports     : [ CommonModule , MatProgressBarModule , SidebarModule , InputTextModule , FormsModule , MatButtonModule , MatCheckboxModule , IctuPaginatorComponent , ReactiveFormsModule , InputTextareaModule , DropdownModule , DragAndDropDirective , MultiSelectModule , MatTooltipModule , FormatVndCurrencyPipe , IctuDropdownOptionMapPipe , DialogModule ] ,
	templateUrl : './quan-li-thi-sinh.component.html' ,
	styleUrls   : [ './quan-li-thi-sinh.component.css' ]
} )
export class QuanLiThiSinhComponent extends IctuBasePermissionClass implements OnInit , OnDestroy , IctuTableComponent<DoiTacThiSinh> {
	searchDoiTac : string                           = '';
	id_selectDoiTac : number                        = 0;
	donvi_id : number                               = 0;
	subjectOption : any[]                           = [];
	subjectSelect : number | null                   = null;
	visibleDialog : boolean                         = false;
	isListImportDuplicate : WritableSignal<boolean> = signal( false );
	tongtien : number                               = 0;
	subjectIdsForm : any[]                          = [];
	recordsFiltered : number                        = 0;
	tongluotthi : number                            = 0;
	dotthiOptions : DotThi[]                        = [];
	user_id : number                                = 0;
	private readonly dotthiService : DotThiService  = inject<DotThiService>( DotThiService );
	private readonly donviService : DonViService    = inject<DonViService>( DonViService );
	private readonly doitacService : DoiTacService  = inject<DoiTacService>( DoiTacService );
	private readonly authCheckquyen : AuthService   = inject<AuthService>( AuthService );
	readonly isAdminUser : Signal<boolean>          = signal<boolean>( this.authCheckquyen.userHasRole( 'admin_luyenthi_thpt' ) );
	dotthiDropdownField : IctuDropdownField         = new IctuDropdownField( this.dotthiService.loadOptions() , 'Lọc theo đợt thi' );
	donviDropdownField : IctuDropdownField          = new IctuDropdownField( this.donviService.loadOptions() , 'Lọc theo đơn vị' );

	dotthiSelect : DotThi = {
		id             : 0 ,
		name           : '' ,
		date_start     : '' ,
		date_end       : '' ,
		status         : 0 ,
		ngaythi_dukien : '' ,
		is_deleted     : 0 ,
		deleted_by     : 0 ,
		created_by     : 0 ,
		updated_by     : 0 ,
		created_at     : '' ,
		updated_at     : ''
	};

	dotthiSelects : number                          = 0;
	dotthiConhan : DotThi[]                         = [];
	magiamgia : string                              = '';
	private observeImportHocSinh$ : Subject<string> = new Subject<string>();
	importDialogRef : MatDialogRef<boolean>;
	importDialogDirty : WritableSignal<boolean>     = signal<boolean>( false );

	@ViewChild( 'importTemplate' , { static : true } ) importTemplate : TemplateRef<any>;
	private readonly subjectService : SubjectService           = inject<SubjectService>( SubjectService );
	private observeOpenFileSelector : Subject<string>          = new Subject<string>();
	dmdoitac : DoiTac[]                                        = [];
	readonly importPanel : ImportPanel<DoiTacThiSinhImportRow> = new ImportPanel( 'SELECT_FILE' );
	readonly optionStates : IctuDropdownOption<number>[]       = [
		{ value : 0 , label : 'Không kích hoạt' } ,
		{ value : 1 , label : 'Kích hoạt' }
	];

	readonly replacementPartner : ReplacementPartner = {
		donvi_id   : 0 ,
		created_by : 0
	}

	readonly optionGioiTinh : IctuDropdownOption<number>[] = [
		{ value : 0 , label : 'Nam' } ,
		{ value : 1 , label : 'Nữ' } ,
		{ value : 2 , label : 'Khác' }
	];

	modeState : WritableSignal<Mode> = signal<Mode>( 'DF' );

	setMode ( mode : Mode ) {
		switch ( mode ) {
			case 'DF':
				this.modeState.set( 'DF' );
				this.dotthiSelects = 0;
				break;
			case 'import':
				this.modeState.set( 'import' );
				break;
		}
	}

	private readonly doitacservice : DoiTacService      = inject<DoiTacService>( DoiTacService );
	private readonly service : DoiTacThiSinhService     = inject<DoiTacThiSinhService>( DoiTacThiSinhService );
	private readonly summaryservice : SummaryService    = inject<SummaryService>( SummaryService );
	private readonly notification : NotificationService = inject<NotificationService>( NotificationService );
	private readonly helperService : HelperService      = inject<HelperService>( HelperService );
	readonly state : WritableSignal<ComponentBaseState> = signal<ComponentBaseState>( 'loading' );
	private readonly fb : FormBuilder                   = inject( FormBuilder );
	search : string                                     = '';

	readonly formControl : IctuFormControl<DoiTacThiSinh>;

	private readonly formGroup : FormGroup = this.fb.group( {
		hoten       : [ '' , [ Validators.required , Validators.minLength( 2 ) , Validators.maxLength( 255 ) ] ] ,
		gioitinh    : [ '' , [ Validators.required , Validators.minLength( 2 ) , Validators.maxLength( 255 ) ] ] ,
		email       : [ '' , [ Validators.required , Validators.minLength( 2 ) , Validators.maxLength( 255 ) ] ] ,
		subject_ids : '' ,
		dotthi_id   : [ 0 , [ Validators.required , Validators.min( 1 ) ] ] ,
		thanhtien   : 0 ,
		donvi_id    : this.donvi_id ,
		chitiet     : {}
	} );

	@ViewChild( Sidebar , { static : true } ) _sidebar : Sidebar;

	dataTable : IctuDataTable<DoiTacThiSinh> = new IctuDataTable<DoiTacThiSinh>();

	dataTableDoitac : IctuDataTable<DoiTac> = new IctuDataTable<DoiTac>();

	private readonly listImport : WritableSignal<TSImport[]> = signal( [] );

	readonly importFiltered : Signal<TSImport[]> = computed( () : TSImport[] => {
		return this.isListImportDuplicate() ? this.listImport().filter( ( item : TSImport ) : boolean => item.state == 'invalid' ) : this.listImport();
	} );

	readonly someItemsChecked : Signal<boolean> = computed( () : boolean => {
		if ( ! this.importFiltered().length ) {
			return false;
		}
		return this.importFiltered().some( ( e : TSImport ) : boolean => e.checked );
	} );

	readonly partiallyChecked : Signal<boolean> = computed( () : boolean => this.someItemsChecked() && ! this.totalChecked() );

	readonly totalChecked : Signal<boolean> = computed( () : boolean => {
		if ( ! this.importFiltered().length ) {
			return false;
		}
		return this.importFiltered().every( ( e : TSImport ) : boolean => e.checked );
	} );

	selectRow ( item : TSImport ) : void {
		this.listImport.update( ( data : TSImport[] ) : TSImport[] => {
			return [ ... data.map( ( row : TSImport ) : TSImport => {
				if ( row.id === item.id ) {
					row.checked = ! item.checked;
				}
				return row;
			} ) ];
		} );
	}

	checkAll ( checked : boolean ) : void {
		this.listImport.update( ( data : TSImport[] ) : TSImport[] => {
			return [ ... data.map( ( row : TSImport ) : TSImport => {
				if ( -1 !== this.importFiltered().findIndex( o => o.id === row.id ) ) {
					row.checked = checked;
				}
				return row;
			} ) ];
		} );
	}

	private readonly eventObserver$ : Subject<DataTableEvent<DoiTacThiSinh>> = new Subject<DataTableEvent<DoiTacThiSinh>>();

	private readonly onDestroy$ : Subject<string> = new Subject<string>();

	private readonly observeUploading : Subject<void> = new Subject();

	private readonly requestUploading : Subject<void> = new Subject();

	private readonly handelEvent : Record<DataTableEventName , ( data : DoiTacThiSinh ) => void> = {
		OPEN_FORM_ADD        : () : void => {
			this.formControl.formGroup.reset( {
				hoten       : '' ,
				gioitinh    : '' ,
				email       : '' ,
				subject_ids : '' ,
				dotthi_id   : 0 ,
				thanhtien   : 0 ,
				donvi_id    : this.donvi_id ,
				chitiet     : {}
			} );
			this.formControl.openFormAdd();
		} ,
		OPEN_FORM_UPDATE     : ( data : DoiTacThiSinh ) : void => {
			this.formControl.formGroup.reset( {
				hoten       : data.hoten ,
				gioitinh    : this.getValueFromLabel( data.gioitinh , this.optionGioiTinh ) ,
				email       : data.email ,
				subject_ids : data.subject_ids ,
				dotthi_id   : data.dotthi_id ,
				thanhtien   : data.thanhtien ,
				donvi_id    : this.donvi_id ,
				chitiet     : data.chitiet
			} );
			this.subjectIdsForm = this.parseNumberList( data.subject_ids );
			this.formControl.openFormEdit( data );
		} ,
		DELETE_SINGLE_ROW    : ( { id } : DoiTacThiSinh ) : void => {
			this.requestDeletingData( [ id ] );
		} ,
		DELETE_SELECTED_ROWS : () : void => {
			const ids : number[] = this.dataTable.getSelectedData().map( ( { id } : DoiTacThiSinh ) : number => id );
			if ( ids.length ) {
				this.requestDeletingData( ids );
			}
		} ,
		SUBMIT_FORM          : () : void => {
			if ( this.formControl.canSubmit ) {
				const info : Partial<DoiTacThiSinh> = {
					hoten       : this.formField( 'hoten' ).value ,
					gioitinh    : this.formField( 'gioitinh' ).value ,
					email       : this.formField( 'email' ).value ,
					subject_ids : this.formField( 'subject_ids' ).value ,
					dotthi_id   : this.formField( 'dotthi_id' ).value ,
					thanhtien   : this.formField( 'thanhtien' ).value ,
					donvi_id    : this.donvi_id ,
					chitiet     : this.formField( 'chitiet' ).value
				};
				const request : Observable<any>     = this.formControl.isFormAdd ? this.service.create( info ) : this.service.update( this.formControl.object.id , info );
				const message : string              = this.formControl.isFormAdd ? 'Thêm mới thành công' : 'Cập nhật thành công';
				this.formControl.submit( request ).subscribe( {
					next  : () : void => {
						this.notification.toastSuccess( message , 'Thông báo' );
						if ( this.formControl.isFormAdd ) {
							this.formControl.formGroup.reset( {} );
						}
						else {
							this.formControl.closeForm();
						}
					} ,
					error : () : void => {
						this.notification.toastError( message , 'Thông báo' );
					}
				} );
			}
		}
	};

	private _temp : { paged : number; resetPaginator : boolean } = {
		paged          : 1 ,
		resetPaginator : true
	};

	private _temp1 : { paged : number; resetPaginator : boolean } = {
		paged          : 1 ,
		resetPaginator : true
	};


	public replacementPartnerOptions : IctuDropdownOptionExtended<number , DoiTac>[] = [];

	private _partnerOptions : IctuDropdownOptionExtended<number , DoiTac>[] = [];

	private get replacementPartnerOptionsLoader () : Observable<IctuDropdownOptionExtended<number , DoiTac>[]> {
		return this._partnerOptions.length ? of( this._partnerOptions ) : this.doitacservice.query( [] , {
			paged  : 1 ,
			limit  : '-1' ,
			select : 'id,hoten,ten,user_id,donvi_id'
		} ).pipe(
			map( ( response : DtoObject<DoiTac[]> ) : IctuDropdownOptionExtended<number , DoiTac>[] => response.data.map( ( _dt : DoiTac ) : IctuDropdownOptionExtended<number , DoiTac> => ( {
				label  : _dt.hoten ,
				value  : _dt.user_id ,
				object : _dt
			} ) ) ) ,
			tap( ( options : IctuDropdownOptionExtended<number , DoiTac>[] ) : void => {
				this._partnerOptions = options
			} )
		)
	};

	public readonly replacementPartnerState : WritableSignal<ComponentBaseState> = signal<ComponentBaseState>( 'loading' );

	constructor ( private fileService : FileService ) {
		super( 'quan-ly-thi-sinh' );
		this.formControl = new IctuFormControl( {
			formGroup      : this.formGroup ,
			objectName     : 'thí sinh' ,
			dropdownFields : [] ,
			sidebar        : this._sidebar
		} );

		this.eventObserver$.asObservable().pipe( takeUntil( this.onDestroy$ ) ).subscribe( ( { name , data } : DataTableEvent<DoiTacThiSinh> ) : void => {
			this.handelEvent[ name ]( data );
		} );

		this.observeImportHocSinh$.asObservable().pipe(
			takeUntil( this.onDestroy$ ) ,
			map( () : MatDialog => this.notification.matDialog ) ,
			debounceTime( 250 )
		).subscribe( ( importDialog : MatDialog ) : void => {
			this.importDialogDirty.set( false );
			const importTemplateRef : MatDialogRef<boolean> = importDialog.open(
				this.importTemplate ,
				{
					disableClose : true ,
					maxHeight    : '100vh' ,
					minHeight    : '100vh' ,
					minWidth     : '100vw' ,
					maxWidth     : '100vw'
				}
			);

			importTemplateRef.afterOpened().subscribe( () : void => {
				if ( this.isAdminUser() ) {
					this.replacementPartner.created_by = 0;
					this.replacementPartner.donvi_id   = 0;
					this.loadReplacementPartnerOptions();
				}
			} );

			importTemplateRef.afterClosed().subscribe( ( dirty : boolean ) : void => {
				if ( dirty ) {
					this._doReload();
				}
			} );
			this.importDialogRef = importTemplateRef;
		} );

		this.observeOpenFileSelector.asObservable().pipe( takeUntil( this.onDestroy$ ) , debounceTime( 250 ) ).subscribe( () : void => {
			const inputElement : HTMLInputElement = Object.assign( document.createElement<'input'>( 'input' ) , { type : 'file' , accept : '.xlsx' , multiple : false } );

			inputElement.oncancel = () : void => {
				setTimeout( () : void => inputElement.remove() , 1000 );
			};

			inputElement.onchange = () : void => {
				this.onInputFile( inputElement.files );
				setTimeout( () : void => inputElement.remove() , 1000 );
			};

			inputElement.click();
		} );
	}

	ngOnInit () : void {
		this.user_id = this.isAdminUser() ? 0 : this.auth.user.id;
		if ( this.isAdminUser() ) {
			this.loadDataDoiTac( 1 , true );
		}
		this.loadData( 1 , true );

		this.requestUploading.pipe(
			takeUntil( this.onDestroy$ ) ,
			debounceTime( 500 )
		).
		subscribe( () : void => {

		} )
	}

	formField ( name : keyof DoiTacThiSinh ) : AbstractControl {
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
			map( () : IctuDeleteAnimationControl<DoiTacThiSinh> => new IctuDeleteAnimationControl( ids , this.service ) ) ,
			switchMap( ( deleteController : IctuDeleteAnimationControl<DoiTacThiSinh> ) : Observable<boolean> => {
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

	loadTongtien () : void {
		this.summaryservice.loadSumTotalSubject( this.donvi_id , this.dotthiSelect.id , this.user_id ).subscribe( {
			next  : ( res ) => {
				if ( this.search ) {
					this.tongluotthi = 0;
				}
				else {
					this.tongluotthi = res ?? 0
				}
			} ,
			error : ( err ) => {
				this.tongluotthi = 0;
			}
		} );
		if ( this.subjectSelect == null || this.subjectSelect == -1 ) {
			this.summaryservice.loadSum( this.donvi_id , this.dotthiSelect.id , this.user_id ).subscribe( {
				next  : ( res ) => {
					if ( this.search ) {
						this.tongtien = 0;
					}
					else {
						this.tongtien = res ?? 0;
					}
				} ,
				error : ( err ) => {
					this.tongtien = 0;
				}
			} );
		}
		else {
			this.summaryservice.loadCost( this.donvi_id , this.dotthiSelect.id , this.subjectSelect , this.user_id ).subscribe( {
				next  : ( res ) => {
					if ( this.search ) {
						this.tongtien = 0;
					}
					else {
						this.tongtien = res ?? 0;
					}
				} ,
				error : ( err ) => {
					this.tongtien = 0;
				}
			} );
		}
	}

	loadDataDoiTac ( paged : number = 1 , resetPaginator : boolean = true ) : void {
		this.state.set( 'loading' );
		this._temp1 = { paged , resetPaginator };
		this.doitacservice.loadall( this.searchDoiTac , {
			limit : this.dataTableDoitac.paginator.rows() ,
			paged
		} ).pipe(
			map( ( res : DtoObject<DoiTac[]> ) : DoiTac[] => {
				if ( resetPaginator ) {
					return this.dataTableDoitac.paginator.setupPaginator( res );
				}
				else {
					this.dataTableDoitac.paginator.changePage( paged );
					return res.data;
				}
			} )
		).subscribe( {
			next  : ( doitac : DoiTac[] ) : void => {
				this.dataTableDoitac.fillData( doitac );
				this.state.set( 'success' );
			} ,
			error : () : void => {
				this.state.set( 'error' );
			}
		} );
	}

	preload () : Observable<number> {
		return this.donvi_id ? of( this.donvi_id ) : this.doitacService.load( this.user_id ).pipe(
			map( ( res : DtoObject<DoiTac[]> ) : number => {
				this.donvi_id = res.data.length ? res.data[ 0 ].donvi_id : null;
				return this.donvi_id;
			} )
		);
	}

	loadData ( paged : number = 1 , resetPaginator : boolean = true ) : void {
		if ( this.isAdminUser() ) {
			this.loadData1( paged , resetPaginator );
		}
		else {
			this.preload().subscribe( {
				next  : () : void => {
					this.loadData1( paged , resetPaginator );
				} ,
				error : () : void => {
					this.state.set( 'error' );
				}
			} );
		}
	}

	loadData1 ( paged : number = 1 , resetPaginator : boolean = true ) : void {
		this.state.set( 'loading' );
		this._temp = { paged , resetPaginator };
		forkJoin( {
			subjects       : this.subjectOption.length ? of( this.subjectOption ) : this.subjectService.load( '' , { limit : -1 , paged : 1 } ).pipe( map( ( res : DtoObject<any[]> ) : any[] => res.data ) ) ,
			dotthi         : this.dotthiOptions.length ? of( this.dotthiOptions ) : this.dotthiService.load( '' ).pipe( map( ( res : DtoObject<any[]> ) : any[] => res.data ) ) ,
			donvi          : this.isAdminUser() ? this.donviDropdownField.load() : of( this.donviDropdownField.options() ) ,
			doiTacThiSinhs : this.service.load(
				this.search ,
				this.donvi_id ,
				this.dotthiSelect?.id ,
				this.subjectSelect ,
				this.user_id ,
				{
					limit : this.dataTable.paginator.rows() ,
					paged
				}
			).
			pipe(
				map( ( res : DtoObject<DoiTacThiSinh[]> ) : DoiTacThiSinh[] => {
					this.recordsFiltered = res.recordsFiltered;
					if ( resetPaginator ) {
						return this.dataTable.paginator.setupPaginator( res );
					}
					else {
						this.dataTable.paginator.changePage( paged );
						return res.data;
					}
				} )
			)
		} ).
		subscribe( {
			next  : ( { subjects , doiTacThiSinhs , dotthi } ) : void => {
				this.subjectOption = subjects;
				this.dotthiOptions = dotthi;
				this.dataTable.fillData( doiTacThiSinhs );
				this.state.set( 'success' );
			} ,
			error : () : void => {
				this.state.set( 'error' );
			}
		} );
	}

	deleteRow ( data : DoiTacThiSinh ) : void {
		this.eventObserver$.next( { name : 'DELETE_SINGLE_ROW' , data } );
	}

	deleteSelectedRows () : void {
		this.eventObserver$.next( { name : 'DELETE_SELECTED_ROWS' , data : null } );
	}

	editRow ( data : DoiTacThiSinh ) : void {
		this.eventObserver$.next( { name : 'OPEN_FORM_UPDATE' , data } );
	}

	reload ( event : MouseEvent ) : void {
		event.preventDefault();
		event.stopPropagation();
		this.loadTongtien();
		if ( this.isAdminUser() ) {
			this.loadDataDoiTac( 1 , true );
		}
		this.loadData( this._temp.paged , this._temp.resetPaginator );
	}

	addNewItem () : void {
		this.eventObserver$.next( { name : 'OPEN_FORM_ADD' , data : null } );
	}

	submitForm () : void {
		this.eventObserver$.next( { name : 'SUBMIT_FORM' , data : null } );
	}

	onChangePage ( paged : number ) : void {
		this.loadTongtien();
		this.loadData( paged , false );
	}

	onChangePagenew ( paged : number ) : void {
		this.loadTongtien();
		this.loadDataDoiTac( paged , false );
	}

	onSearchData () : void {
		this.loadTongtien();
		this.loadData( 1 , true );
	}

	onSearchDataSubject () : void {
		this.loadTongtien();
		this.loadData( 1 , true );
	}

	identify ( _ : number , subject : DoiTacThiSinh ) : number | string {
		return subject.id;
	}

	openImportingFromFile () : void {
		this.importPanel.disableLoading();
		this.closeImportingFromFile( false );
		this.observeImportHocSinh$.next( 'create' );
	}

	closeImportingFromFile ( dirty : boolean ) : void {
		if ( this.importDialogRef ) {
			this.importDialogRef.close( dirty );
		}
	}

	downloadFileImportSample () : void {
		this.fileService.getImageAsBlob( '..\assets\files\Danh_sach_thi_sinh_du_thi_mau_luyen_thi.xlsx' ).subscribe( ( blob : Blob ) : void => {
			saveAs( blob , 'danh_sach_thi_sinh_du_thi_mau_luyen_thi.xlsx' );
		} );
	}

	private _doReload () : void {
		this.loadData( this._temp.paged , this._temp.resetPaginator );
	}

	onInputFile ( files : FileList ) : void {
		this.isListImportDuplicate.set( false );
		if ( files.length ) {
			this.importPanel.enableLoading( 'Xử lý file...' );

			if ( ! files[ 0 ].name.toLowerCase().endsWith( '.xlsx' ) ) {
				this.notification.toastError(
					'Hệ thống chỉ chấp nhận file định dạng .xlsx' ,
					'Lỗi định dạng File!'
				);
				this.importPanel.disableLoading();
				return;
			}
			if ( files[ 0 ].size >= 10485760 ) {
				this.notification.toastError(
					'Hệ thống chỉ hỗ trợ file có dung lượng từ 10Mb trở xuống' ,
					'File dung lượng quá lớn!'
				);
				this.importPanel.disableLoading();
				return;
			}

			readXlsxFile( files[ 0 ] ).then( ( rows : Row[] ) : void => {
				setTimeout( () => {

				} );
				this.setMode( 'import' );
				const dataFromRow1 = [];

				for ( let i = 1 ; i < rows.length ; i++ ) {
					const row = rows[ i ];
					if ( ! row[ 1 ] ) break;
					dataFromRow1.push( row );
				}

				const _listImport : TSImport[] = this.validateInportData(
					dataFromRow1.map( ( item , index : number ) : TSImport => {
						// console.log(this.joinIdsubject(item, rows[0]));
						const info : TSImport = {
							id                : index ,
							hoten             : item[ 1 ] ,
							ten               : this.getLastName( item[ 1 ] ) ,
							email             : item[ 2 ] ,
							phone             : item[ 3 ] ,
							gioitinh          : item[ 4 ] ?? '' ,
							donvi_id          : 0 ,
							subject_ids       : this.joinIdsubject( item , rows[ 0 ] ) ,
							password          : item[ 5 ] ?? '' ,
							state             : 'prepare' ,
							errorMessage      : '' ,
							referenceObjectId : 0 ,
							checked           : false
						};
						return info;
					} ) )
				this.importPanel.disableLoading();
				this.closeImportingFromFile( this.importDialogDirty() );
				this.listImport.set( _listImport );
				if ( _listImport.filter( ( item ) => item.state == 'invalid' ).length ) {
					this.openDialog();
				}
			} );
		}
		else {
			this.listImport.set( [] );
		}
	}

	private validateInportData ( listImport : TSImport[] ) : TSImport[] {
		if ( listImport && listImport.length ) {
			return listImport.filter( ( item ) => item.state != 'uploaded' ).map( i => {
				i.state = 'prepare';
				return i
			} ).map( ( info : TSImport ) : TSImport => {
				if ( ! Boolean( info.email ) ) {
					info.state        = 'invalid';
					info.errorMessage = 'Thiếu Email';
				}
				else if ( ! Boolean( info.phone ) ) {
					info.state        = 'invalid';
					info.errorMessage = 'Thiếu Sdt';
				}
				else if ( ! /^\d{6,}$/gm.test( info.phone.toString().trim() ) ) {
					info.state        = 'invalid';
					info.errorMessage = 'Không đúng định dạng Sdt';
				}
				else if ( ! /[A-Za-z0-9\._%+\-]+@[A-Za-z0-9\.\-]+\.[A-Za-z]{2,}/gm.test( info.email.trim() ) ) {
					info.state        = 'invalid';
					info.errorMessage = 'Không đúng định dạng Email';
				}
				else {
					const objectDuplicateEmail : TSImport = listImport.find( i => i.id !== info.id && i.state === 'prepare' && i.email && i.email.trim().toLowerCase() === info.email.toString().trim().toLocaleLowerCase() );

					if ( objectDuplicateEmail ) {
						info.state             = 'invalid';
						info.errorMessage      = 'Trùng Email';
						info.referenceObjectId = objectDuplicateEmail.id;
					}
					else {
						const objectDuplicatePhone : TSImport = listImport.find( i => i.id !== info.id && i.state === 'prepare' && i.phone && i.phone.toString().trim().toLowerCase() === info.phone.toString().trim().toLocaleLowerCase() );
						if ( objectDuplicatePhone ) {
							info.state             = 'invalid';
							info.errorMessage      = 'Trùng Sdt';
							info.referenceObjectId = objectDuplicatePhone.id;
						}
						else {
							info.errorMessage = '';
						}
					}
				}
				return info;
			} );
		}
		else {
			return [];
		}
	}

	private startUploading () : void {
		const requests = this.listImport().filter( item => [ 'uploadingFail' , 'waitting' , 'prepare' ].includes( item.state ) ).map( t => {
			t.state = 'waitting';
			return t;
		} );
		if ( requests.length ) {
			this.importPanel.enableLoading( 'Xử lý file...' );
			this.closeImportingFromFile( this.importDialogDirty() );
			// clear previous uploading
			this.observeUploading.next();
			const step : number = 100 / requests.length;
			this._uploader( requests , this.notification.ProgressBarWithPercent( 0 , true ) , step );
		}
		else {
			this.notification.toastError( 'Không có thí sinh nào cần upload' );
		}
	}

	private _uploader ( requests : TSImport[] , animation : NgbModalRef , step : number ) : void {
		const index : number             = requests.findIndex( r => r.state === 'waitting' );
		const stopSign : Observable<any> = merge( this.observeUploading , this.onDestroy$ );
		if ( index !== -1 ) {
			const info : any = {
				hoten       : requests[ index ].hoten ,
				ten         : requests[ index ].ten ,
				email       : requests[ index ].email ,
				phone       : requests[ index ].phone ,
				gioitinh    : requests[ index ].gioitinh ,
				donvi_id    : this.isAdminUser() ? 0 : this.donvi_id ,
				subject_ids : requests[ index ].subject_ids ,
				dotthi_id   : this.dotthiSelects ,
				magiamgia   : this.magiamgia ,
				password    : requests[ index ].password
			};
			this.service.create( info ).pipe(
				takeUntil( stopSign )
			).subscribe( {
				next  : () : void => {
					requests[ index ].state             = 'uploaded';
					animation.componentInstance.percent = Math.min( Math.round( animation.componentInstance.percent += step ) , 100 );
					this._uploader( requests , animation , step );
				} ,
				error : ( err ) : void => {
					requests[ index ].state = 'uploadingFail';
					this._uploader( requests , animation , step );
				}
			} );
		}
		else {
			animation.close();
		}
		stopSign.pipe(
			take( 1 )
		).subscribe( () => animation.close() )
	}

	submitImport () : void {
		if ( this.dotthiSelects != 0 ) {
			this.requestUploading.next();
		}
		else {
			this.notification.toastError( 'Bạn chưa chọn ca thi' );
		}
	}

	getidSubject ( subjectOption : any[] , label : string ) : number | 0 {
		const subject = subjectOption.find( ( item ) : boolean => item.slug === this.helperService.sanitizeVietnameseTitle( label ) );
		return subject?.id;
	}

	sanitizeString ( string : string ) : string {
		return this.helperService.sanitizeVietnameseTitle( string );
	}

	getLastName ( fullName : string ) : string {
		return fullName.trim().split( /\s+/ ).pop() || '';
	}

	joinIdsubject ( dataList : any[] , dataListRow1 : any[] ) {
		var result = [];
		for ( let i = 6 ; i < dataList.length ; i++ ) {
			if ( dataList[ i ] ) {
				result.push( this.getidSubject( this.subjectOption , dataListRow1[ i ] ) );
			}
		}
		return '|' + result.join( '|' ) + '|';
	}

	parseNumberList ( input : string ) : number[] {
		return input.split( '|' ).filter( ( item ) => item !== '' ).map( Number );
	}

	getLabelSubjectFromIds ( listId : number[] , option : any[] ) : string[] {
		const idToLabelMap = new Map( option.map( ( item ) => [ item.id , item.name ] ) );
		return listId.map( ( id ) => idToLabelMap.get( id ) || '' );
	}

	getLabelDotThiFromId ( Id : number , option : any[] ) : string {
		const result = option.find( ( item ) : boolean => item.value == Id );
		return result.name;
	}

	getnameSubjectFromId ( Id : number , option : any[] ) : string {
		const result = option.find( ( item ) : boolean => item.id == Id );
		return result.name;
	}

	getCostSubject ( subject_id : number , chitiet : Record<number , number> ) : number {
		return chitiet[ subject_id ] || 0;
	}

	getIdSubjectFromLabel ( label : string , option : any[] ) : number | null {
		const result = option.find( ( item ) : boolean => item.label === label );
		return result ? result.value : null;
	}

	shortenEmailEnd ( email : string ) : string {
		return email.length > 15 ? '...' + email.slice( -15 ) : email;
	}

	convertToDate ( dateStr : string ) : Date {
		const [ day , month , year ] = dateStr.split( '/' );
		const date                   = new Date( `${ year }-${ month }-${ day }` );
		if ( isNaN( date.getTime() ) ) {
			throw new Error( 'Ngày không hợp lệ' );
		}
		return date;
	}

	formatDateHTML ( isoString : string ) : string {
		const date = new Date( isoString );
		return date.toLocaleDateString( 'vi-VN' );
	}

	checkErrorThiSinh () : boolean {
		if ( this.listImport().find( ( item : TSImport ) : boolean => item.state === 'invalid' ) ) {
			return false;
		}
		else {
			return true;
		}
	}

	getValueFromLabel ( label : string , options : IctuDropdownOption<number>[] ) : number | null {
		const found : IctuDropdownOption<number> = options.find( ( option : IctuDropdownOption<number> ) : boolean => this.helperService.sanitizeVietnameseTitle( option.label ) === this.helperService.sanitizeVietnameseTitle( label ) );
		return found ? found.value : null;
	}

	updatedonviID ( donviID : number , id : number , user_id : number ) : void {
		this.donvi_id        = donviID;
		this.id_selectDoiTac = id;
		this.user_id         = user_id;
		this.loadData( 1 , true );
		this.loadTongtien();
	}

	resetDonviID () : void {
		this.donvi_id        = 0;
		this.id_selectDoiTac = 0;
		this.searchDoiTac    = '';
		this.user_id         = 0;
		if ( this.isAdminUser() ) {
			this.loadDataDoiTac( 1 , true );
		}
		this.loadData( 1 , true );
		this.loadTongtien();
	}

	deleteSelectedThiSinhImport () : void {
		this.notification.confirmDelete2( this.importFiltered().filter( i => i.checked ).length ).subscribe(
			( result : boolean ) : void => {
				if ( result ) {
					const ids : number[] = this.importFiltered().filter( i => i.checked ).map( o => o.id );
					this.listImport.update( ( list : TSImport[] ) => ( [ ... list.filter( i => ! ids.includes( i.id ) ) ] ) );
				}
			}
		);
	}

	deleteThiSinhImport ( item : TSImport ) : void {
		this.notification.confirmDelete2( 1 ).subscribe(
			( result : boolean ) => {
				if ( result ) {
					this.listImport.update( ( list : TSImport[] ) => ( [ ... list.filter( i => i.id !== item.id ) ] ) );
				}
			}
		);
	}

	getExpiredDotThi ( dotthiList : DotThi[] ) : void {
		this.dotthiConhan = dotthiList.filter( dotthi => dotthi.status === 1 ).map( dotthi => ( {
			... dotthi ,
			name : `${ dotthi.name }`
		} ) );
	}

	openDialog () : void {
		this.visibleDialog = ! this.visibleDialog;
	}

	openListImportDuplicate () : void {
		this.isListImportDuplicate.update( ( isChecked : boolean ) : boolean => ! isChecked );
	}

	openFileSelector () : void {
		this.observeOpenFileSelector.next( 'open' );
	}

	private loadReplacementPartnerOptions () : void {
		this.replacementPartnerState.set( 'loading' );
		this.replacementPartnerOptionsLoader.pipe(
			takeUntil( this.onDestroy$ )
		).subscribe( {
			next  : ( options : IctuDropdownOptionExtended<number , DoiTac>[] ) : void => {
				this.replacementPartnerOptions = options;
				this.replacementPartnerState.set( 'success' );
			} ,
			error : () : void => {
				this.replacementPartnerState.set( 'error' );
			}
		} )
	}

	public reloadReplacementPartnerOptions ( event : MouseEvent ) : void {
		event.preventDefault();
		event.stopPropagation();
		this.loadReplacementPartnerOptions();
	}

	public changeReplacementPartner ( event : DropdownChangeEvent ) : void {
		this.replacementPartner.donvi_id = this.replacementPartnerOptions.find( ( i : IctuDropdownOptionExtended<number , DoiTac> ) : boolean => i.value === event.value ).object.donvi_id;
	}

	ngOnDestroy () : void {
		this.onDestroy$.next( 'OnDestroy' );
		this.onDestroy$.complete();
	}
}
