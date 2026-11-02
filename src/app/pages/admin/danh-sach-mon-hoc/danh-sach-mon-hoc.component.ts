import { CommonModule } from '@angular/common';
import { Component , ElementRef , OnInit , TemplateRef , ViewChild } from '@angular/core';
import { AbstractControl , FormBuilder , FormGroup , FormsModule , ReactiveFormsModule , Validators } from '@angular/forms';
import { ButtonBase } from '@model/button';
import { FormType , OvicForm , OvicTableStructure } from '@model/ovic-models';
import { MonHoc } from '@model/mon-hoc';
import { AuthService } from '@service/core/auth.service';
import { HelperService } from '@service/core/helper.service';
import { ThemeSettingsService } from '@service/core/theme-settings.service';
import { MonHocService } from '@service/luyenthithpt/mon-hoc.service';
import { NotificationService } from '@theme/services/notification.service';
import { ButtonModule } from 'primeng/button';
import { Paginator , PaginatorModule , PaginatorState } from 'primeng/paginator';
import { debounceTime , Subject , Subscription } from 'rxjs';
import { OvicTableComponent } from 'src/app/templates/ovic-table/ovic-table.component';
import { InputTextModule } from 'primeng/inputtext';
import { RippleModule } from "primeng/ripple";

interface FormMonHoc extends OvicForm {
	object : MonHoc
}

@Component( {
	selector    : 'app-danh-sach-mon-hoc' ,
	templateUrl : './danh-sach-mon-hoc.component.html' ,
	styleUrls   : [ './danh-sach-mon-hoc.component.css' ] ,
	standalone  : true ,
	imports     : [
		CommonModule ,
		OvicTableComponent ,
		PaginatorModule ,
		ButtonModule ,
		FormsModule ,
		ReactiveFormsModule ,
		InputTextModule ,
		RippleModule
	]
} )
export class DanhSachMonHocComponent implements OnInit {
	@ViewChild( 'formMonHoc' ) formMonHoc : ElementRef;
	@ViewChild( 'toolbarLatex' ) toolbarLatex : ElementRef;
	@ViewChild( 'inputLatex' ) inputLatex : ElementRef;
	@ViewChild( 'outputLatex' ) outputLatex : ElementRef;
	@ViewChild( 'outputLatexIframe' ) outputLatexIframe : ElementRef;
	@ViewChild( 'fromUpdate' , { static : true } ) template : TemplateRef<any>;
	@ViewChild( Paginator ) paginator : Paginator;

	dmMonHoc : MonHoc[];
	selectedMonHoc : MonHoc;
	formData : FormGroup;
	readonly isAdmin : boolean;
	formTitle : string    = 'Thêm môn học mới';
	isLoading : boolean   = false;
	isUpdated : boolean   = false;
	slugIsValid : boolean = true;

	tblCols : OvicTableStructure[] = [
		{
			fieldType : 'normal' ,
			field     : [ '__title_covented' ] ,
			rowClass  : '' ,
			header    : 'Tên môn học' ,
			sortable  : false ,
			headClass : 'ovic-w-25' ,
			innerData : true
		} ,
		// {
		//     fieldType: 'normal',
		//     field: ['__status_converted'],
		//     rowClass: '',
		//     header: 'Trạng thái',
		//     sortable: false,
		//     innerData: true,
		//     headClass: ''
		// },
		{
			tooltip   : '' ,
			fieldType : 'buttons' ,
			field     : [] ,
			rowClass  : 'ost-w-150px text-center' ,
			checker   : 'fieldName' ,
			header    : 'Thao tác' ,
			sortable  : false ,
			headClass : 'ost-w-200px text-center' ,
			buttons   : [
				{
					tooltip  : 'Cập nhật' ,
					label    : '' ,
					icon     : 'pi pi-file-edit' ,
					name     : 'EDIT_DECISION' ,
					cssClass : 'btn-primary rounded'
				} ,
				{
					tooltip  : 'Xoá' ,
					label    : '' ,
					icon     : 'pi pi-trash' ,
					name     : 'DELETE_DECISION' ,
					cssClass : 'btn-danger rounded'
				}
			]
		}
	];

	headButtons = [
		{
			label : 'Thêm môn học mới' ,
			name  : 'BUTTON_ADD_NEW' ,
			icon  : 'pi-plus pi' ,
			class : 'p-button-success ml-3 mr-2'
		}
	];

	// custom new
	btn_checkAdd : 'Lưu lại' | 'Cập nhật';
	inputErrors : { name : boolean, slug : boolean } = { name : false , slug : false };
	search : string                                  = '';
	index : number                                   = 1;
	recordsTotal : number                            = 1;
	rows : number                                    = this.themeSettingsService.settings.rows;
	page : number                                    = 1;
	menuName : 'menu_monhoc';

	listForm =
		{
			[ FormType.ADDITION ] : {
				type   : FormType.ADDITION ,
				title  : 'Thêm mới môn học' ,
				object : null ,
				data   : null
			} ,
			[ FormType.UPDATE ]   : {
				type   : FormType.UPDATE ,
				title  : 'Cập nhật môn học' ,
				object : null ,
				data   : null
			}
		};


	formActive : FormMonHoc;
	subscription : Subscription                             = new Subscription();
	private OBSERVE_PROCESS_FORM_DATA : Subject<FormMonHoc> = new Subject<FormMonHoc>();

	constructor (
		private helperService : HelperService ,
		private MonHocService : MonHocService ,
		public formBuilder : FormBuilder ,
		private auth : AuthService ,
		private themeSettingsService : ThemeSettingsService ,
		private notificationService : NotificationService
	) {
		this.formData                = this.formBuilder.group(
			{
				name : [ '' , Validators.required ] ,
				slug : [ '' , Validators.required ] ,
				desc : [ '' ]
			}
		);
		this.isAdmin                 = this.auth.userHasRole( 'admin_luyenthi_thpt' );
		const observeProcessFormData = this.OBSERVE_PROCESS_FORM_DATA.asObservable().pipe( debounceTime( 100 ) ).subscribe( ( form ) => this.__processFrom( form ) );
		this.subscription.add( observeProcessFormData );
		const actions = [];
		if ( actions.length ) {
			this.tblCols.push( {
				tooltip   : 'môn học' ,
				fieldType : 'actions' ,
				field     : actions ,
				rowClass  : '' ,
				header    : 'Thao tác' ,
				sortable  : false ,
				headClass : 'ovic-w-90px'
			} );
		}
	}

	get f () : { [ key : string ] : AbstractControl<any> } {
		return this.formData.controls;
	}

	ngOnInit () : void {
		this.loadData();
	}

	loadData () : void {
		const limit : number = this.themeSettingsService.settings.rows;
		this.index           = this.page * limit - limit + 1;
		this.isLoading       = true;
		this.MonHocService.load( this.search , { paged : this.page , limit } ).subscribe( res => {
			if ( res ) {
				this.dmMonHoc     = res.data.map( m => {
					m[ '__title_covented' ]   = `<strong>${ m.name }</strong>` + ( m.desc ? `<br> ${ m.desc }` : '' );
					m[ '__status_converted' ] = m.status == 1 ? `<span class="status-active">Hoạt động</span>` : `<span class="status-ínactive">Không hoạt động</span>`
					return m;
				} ).filter( m => m.status !== -1 );
				this.recordsTotal = res.recordsTotal;
				this.isLoading    = false;
			}
		} );
	}

	onchangeSlug () : void {
		if ( this.f[ 'slug' ].value ) {
			const slug = this.helperService.sanitizeVietnameseTitle( this.f[ 'slug' ].value );
			this.f[ 'slug' ].setValue( slug );
			this.checkIsValid( 'slug' , slug );
		}
	}

	onChangeTitle () : void {
		if ( this.f[ 'name' ].value ) {
			const slug = this.helperService.sanitizeVietnameseTitle( this.f[ 'name' ].value );
			this.f[ 'slug' ].setValue( slug );
			this.checkIsValid( 'slug' , slug );
		}
	}

	checkIsValid ( col : string , item : string ) : void {
		this.MonHocService.getMonHocByCol( col , item ).subscribe(
			result => {
				//const res = result.filter(m=>m.status !== -1);
				const res = result;

				if ( res && res.length !== 0 ) {
					if ( this.isUpdated === false ) {
						this.slugIsValid      = false;
						this.inputErrors.slug = true;
					}
					else {
						const index = res.findIndex( m => m.id === this.selectedMonHoc.id );
						if ( index !== -1 ) {
							this.slugIsValid      = true;
							this.inputErrors.slug = false;
						}
						else {
							this.slugIsValid      = false;
							this.inputErrors.slug = true;
						}
					}
				}
				else {
					this.inputErrors.slug = false;
					this.slugIsValid      = true;
				}
			} );
	}

	createMonHoc () {
		this.formData.reset();
		this.isUpdated   = false;
		this.slugIsValid = true;
		this.formTitle   = 'Thêm môn học mới';
		//   this.modalService.open(this.formMonHoc, NORMAL_MODAL_OPTIONS);
	}

	editMonHoc ( monhocId : number ) {
		this.slugIsValid    = true;
		this.selectedMonHoc = this.dmMonHoc.find( m => m.id === monhocId );
		if ( this.selectedMonHoc ) {
			this.isUpdated = true;
			this.formTitle = 'Sửa thông tin môn học';
		}
	}

	afterDeleteData ( monhocId : number ) {
		const index = this.dmMonHoc.findIndex( m => m.id === monhocId );
		if ( index !== -1 ) {
			this.dmMonHoc.splice( index , 1 );
		}
	}

	saveFormData () {
		if ( this.formData.valid ) {
			this.formActive.data = this.formData.value;
			this.OBSERVE_PROCESS_FORM_DATA.next( this.formActive );
		}
		else {
			this.notificationService.toastError( 'Vui lòng nhập đủ và đúng thông tin' );
		}
	}

	onSearch ( text : string ) {
		this.search = text;
		this.page   = 1;
		this.paginator.changePage( 1 );
		this.loadData();
	}

	private preSetupForm ( name : string ) {
		this.notificationService.openSideNavigationMenu( {
			name ,
			template  : this.template ,
			size      : 600 ,
			offsetTop : '0px'
		} );
	}

	closeForm () {
		this.loadData();
		this.formData.reset();
		this.formActive       = null;
		this.selectedMonHoc   = null;
		this.inputErrors.slug = false;
		this.notificationService.closeSideNavigationMenu( this.menuName );
	}

	async handleClickOnTable ( button : ButtonBase ) {

		if ( ! button ) {
			return;
		}
		const decision =
			      button.data && this.dmMonHoc
			      ? this.dmMonHoc.find( ( u ) => u.id === button.data )
			      : null;
		switch ( button.name ) {
			case 'BUTTON_ADD_NEW':
				this.isUpdated    = false;
				this.btn_checkAdd = 'Lưu lại';
				this.formActive   = this.listForm[ FormType.ADDITION ];
				this.preSetupForm( this.menuName );
				break;
			case 'EDIT_DECISION':
				this.btn_checkAdd = 'Cập nhật';
				const object1     = this.dmMonHoc.find( ( u ) => u.id === decision.id );
				if ( ! object1 ) break;
				// this.setUpCheckBox(object1);
				this.selectedMonHoc = object1;
				this.isUpdated      = true;
				this.formData.reset( {
					name : object1.name ,
					slug : object1.slug ,
					desc : object1.desc
				} );
				this.formActive        = this.listForm[ FormType.UPDATE ];
				this.formActive.object = object1;
				this.preSetupForm( this.menuName );
				break;

			case 'DELETE_DECISION':
				const confirm = await this.notificationService.confirmDelete();
				if ( confirm ) {
					this.MonHocService.deleteMonHoc( decision.id ).subscribe(
						() => {
							this.notificationService.toastSuccess( 'Xoá môn học thành công' );
							this.loadData();
						} ,
						() => this.notificationService.toastError( 'Xóa môn học thất bại' )
					);
				}
				break;
		}
	}

	paginate ( { page } : PaginatorState ) {
		this.page = page + 1;
	}


	private __processFrom ( { data , object , type } : FormMonHoc ) {
		if ( type === FormType.ADDITION ) {
			// set truong_id
			if ( ! this.slugIsValid ) {
				this.notificationService.toastError( 'Ký hiệu không được phép trùng' );
				return;
			}

			this.MonHocService.addMonHoc( this.formData.value ).subscribe( {
					next  : () => {
						this.notificationService.toastSuccess( 'Thêm môn học mới thành công' );
						this.formData.reset();
						this.loadData();
						this.closeForm();
					} ,
					error : () => this.notificationService.toastError( 'Thêm môn học thất bại' )
				}
			);
		}
		else {
			if ( ! this.slugIsValid ) {
				this.notificationService.toastError( 'Ký hiệu không được phép trùng' );
				return;
			}
			this.MonHocService.updateMonHoc( this.formActive.object.id , this.formData.value ).subscribe( {
					next  : () => {
						this.notificationService.toastSuccess( 'Sửa thông tin môn học thành công' );
						this.loadData();
						this.closeForm();
					} ,
					error : () => this.notificationService.toastError( 'Sửa thông tin môn học thất bại' )
				}
			);
		}
	}
}
