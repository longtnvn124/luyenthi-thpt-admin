import { Component , ElementRef , OnInit , TemplateRef , ViewChild } from "@angular/core";
import { FormBuilder , FormGroup , ReactiveFormsModule , Validators } from "@angular/forms";
import { ButtonBase } from "@model/button";
import { FormType , OvicForm , OvicTableStructure } from "@model/ovic-models";
import { TnBank } from "@model/tn-bank";
import { MonHoc } from "@model/mon-hoc";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { AuthService } from "@service/core/auth.service";
import { HelperService } from "@service/core/helper.service";
import { ThemeSettingsService } from "@service/core/theme-settings.service";
import { TnBankService } from "@service/luyenthithpt/tn-bank.service";
import { MonHocService } from "@service/luyenthithpt/mon-hoc.service";
import { NotificationService } from "@theme/services/notification.service";
import { TYPE_BANK } from "@utilities/syscats";
import { Paginator , PaginatorModule , PaginatorState } from "primeng/paginator";
import { debounceTime , forkJoin , map , Subject , Subscription , switchMap , } from "rxjs";
import { ButtonModule } from "primeng/button";
import { RippleModule } from "primeng/ripple";
import { OvicTableComponent } from "../../../../templates/ovic-table/ovic-table.component";
import { OvicDropdownComponent } from "../../../../templates/ovic-dropdown/ovic-dropdown.component";
import { NgClass , NgForOf , NgIf } from "@angular/common";
import { InputTextModule } from "primeng/inputtext";
import { Helper } from "@utilities/helper";

interface FormBank extends OvicForm {
	object : TnBank;
}

@Component( {
	selector    : "app-danh-sach-bank" ,
	templateUrl : "./danh-sach-bank.component.html" ,
	styleUrls   : [ "./danh-sach-bank.component.css" ] ,
	standalone  : true ,
	imports     : [
		PaginatorModule ,
		ButtonModule ,
		RippleModule ,
		ReactiveFormsModule ,
		OvicTableComponent ,
		OvicDropdownComponent ,
		NgClass ,
		InputTextModule ,
		NgIf ,
		NgForOf
	]
} )
export class DanhSachBankComponent implements OnInit {
	handleChangeDonviSubscription : Subscription;
	@ViewChild( "formBank" ) formBank : ElementRef;
	@ViewChild( "templateChildrenBank" ) templateChildrenBank : TemplateRef<any>;
	@ViewChild( Paginator ) paginator : Paginator;
	@ViewChild( "fromUpdate" , { static : true } ) template : TemplateRef<any>;
	@ViewChild( "fromAddChild" , { static : true } ) templateChild : TemplateRef<any>;
	
	
	dmBank : TnBank[];
	listBankChildren : TnBank[]                     = [];
	searchBank : string;
	formData : FormGroup;
	slugIsValid : boolean                           = true;
	dmMonHoc : MonHoc[];
	typeTest : { type : "THI"; title : "Thi" }[]    = [ { type : "THI" , title : "Thi" } ];
	typeBank : { label : string, value : string }[] = TYPE_BANK;
	isAdmin : boolean                               = false;
	isUpdated : boolean                             = false;
	tblCols : OvicTableStructure[]                  = [
		{
			fieldType : "normal" ,
			field     : [ "name_converted" ] ,
			rowClass  : "" ,
			header    : "Tên ngân hàng" ,
			sortable  : false ,
			headClass : "ovic-w-25" ,
			innerData : true ,
		} ,
		{
			fieldType : "normal" ,
			field     : [ "name_subject" ] ,
			rowClass  : "" ,
			header    : "Tên môn học" ,
			sortable  : false ,
			headClass : "ovic-w-25" ,
		} ,
		{
			fieldType : "normal" ,
			field     : [ "type_name" ] ,
			rowClass  : "" ,
			header    : "Kiểu ngân hàng" ,
			sortable  : false ,
			headClass : "ovic-w-150px" ,
		} ,
		{
			fieldType : "normal" ,
			field     : [ "desc" ] ,
			rowClass  : "" ,
			header    : "Mô tả" ,
			sortable  : false ,
			innerData : true ,
			headClass : "" ,
		} ,
		{
			tooltip   : "" ,
			fieldType : "buttons" ,
			field     : [] ,
			rowClass  : "ost-w-150px text-center" ,
			checker   : "fieldName" ,
			header    : "Thao tác" ,
			sortable  : false ,
			headClass : "ost-w-200px text-center " ,
			buttons   : [
				{
					tooltip  : 'Thêm chương' ,
					label    : "" ,
					icon     : "pi pi-plus" ,
					name     : "ADD_CHILD_DECISION" ,
					cssClass : "btn-success rounded text-sm p-2 ml-2 icon-no-ml w-36 h-36" ,
				} ,
				{
					tooltip  : "Cập nhật" ,
					label    : "" ,
					icon     : "pi pi-file-edit" ,
					name     : "EDIT_DECISION" ,
					cssClass : "btn-primary rounded text-sm p-2 ml-2 icon-no-ml w-36 h-36" ,
				} ,
				
				{
					tooltip  : 'Xoá' ,
					label    : "" ,
					icon     : "pi pi-trash" ,
					name     : "DELETE_DECISION" ,
					cssClass : "btn-danger rounded text-sm p-2 ml-2 icon-no-ml w-36 h-36" ,
				} ,
			] ,
		} ,
	];
	
	// custom news
	inputErrors : { name : boolean, slug : boolean }      = { name : false , slug : false }
	page : number                                         = 1;
	index : number                                        = 1;
	btn_checkAdd : "Lưu lại" | "Cập nhật";
	recordsTotal : number                                 = 0;
	bankSelected : TnBank;
	isLoading : boolean                                   = false;
	menuName : "menu_nganhang_cauhoi";
	menuNameChild : "menu_themchuong_nganhang_cauhoi";
	bankChild : string                                    = "";
	bankChildSelected : TnBank;
	btnActionChild : 'add' | 'edit'                       = 'add';
	rows : number                                         = this.themeSettingsService.settings.rows;
	private OBSERVE_PROCESS_FORM_DATA : Subject<FormBank> = new Subject<FormBank>();
	formActive : FormBank;
	
	headButtons = [
		{
			label : "Thêm ngân hàng câu hỏi" ,
			name  : "BUTTON_ADD_NEW" ,
			icon  : "pi-plus pi" ,
			class : "p-button-success ml-3 mr-2" ,
		} ,
	];
	
	listForm = {
		[ FormType.ADDITION ] : {
			type   : FormType.ADDITION ,
			title  : "Thêm mới ngân hàng câu hỏi" ,
			object : null ,
			data   : null ,
		} ,
		[ FormType.UPDATE ]   : {
			type   : FormType.UPDATE ,
			title  : "Cập nhật ngân hàng câu hỏi" ,
			object : null ,
			data   : null ,
		} ,
	};
	
	
	constructor (
		private helperService : HelperService ,
		private modalService : NgbModal ,
		private tnBankService : TnBankService ,
		public formBuilder : FormBuilder ,
		private auth : AuthService ,
		private MonHocService : MonHocService ,
		private themeSettingsService : ThemeSettingsService ,
		private notificationService : NotificationService
	) {
		this.formData = this.formBuilder.group( {
			name       : [ "" , Validators.required ] ,
			subject_id : [ "" ] ,
			slug       : [ "" , Validators.required ] ,
			desc       : [ "" ] ,
			user_id    : this.auth.user.id ,
			parent_id  : [ "" ] ,
			ordering   : [ "" ] ,
			type       : [ "THI" ] ,
		} );
		this.isAdmin  = this.auth.userHasRole( "admin_ky_tuc_xa" );
		
		this.OBSERVE_PROCESS_FORM_DATA.asObservable().pipe( debounceTime( 100 ) ).subscribe( ( form ) => this.__processFrom( form ) );
	}
	
	ngOnInit () : void {
		
		this.loadData();
	}
	
	get f () {
		return this.formData.controls;
	}
	
	loadData () : void {
		this.isLoading       = true;
		const limit : number = this.themeSettingsService.settings.rows;
		this.index           = this.page * limit - limit + 1;
		forkJoin( [
			this.MonHocService.getAllMonHoc() ,
			this.tnBankService.getListLimit( this.page , this.searchBank ).pipe(
				switchMap( ( res ) => {
					let subject_arr_ids = res.data.map( ( item ) => {
						return item.subject_id;
					} );
					subject_arr_ids     = [ ... new Set( subject_arr_ids ) ];
					return this.MonHocService.getSubjectByIds( subject_arr_ids ).pipe(
						map( ( subjects ) => {
							res.data = res.data.map( ( item ) => {
								
								item.subject = subjects.find( ( s ) => s.id === item.subject_id )
								return item;
							} );
							return res;
						} )
					);
				} )
			) ,
		] ).subscribe( {
			next  : ( [ listMonHoc , listBank ] ) => {
				this.dmMonHoc     = listMonHoc;
				this.recordsTotal = listBank.recordsTotal;
				this.dmBank       = listBank.data.map( ( item ) => {
					item[ "name_converted" ] = `<strong>${ item.name }</strong>`;
					return {
						... item ,
						name_subject : item?.subject?.name ,
						type_name    : item?.type ,
						desc         : item?.desc ?? "" ,
					};
				} );
				
				this.isLoading = false;
			} ,
			error : ( error ) => {
			} ,
		} );
	}
	
	getSubjectName ( dmBank : any , dmMonHoc : MonHoc[] ) {
		dmBank.forEach( ( f , key ) => {
			const index = dmMonHoc.findIndex( ( m ) => m.id === f.subject_id );
			if ( index !== -1 ) {
				if ( ! f.name_subject ) {
					f.name_subject = dmMonHoc[ index ].name;
				}
			}
			const index_ = this.typeBank.findIndex( ( m ) => m.value === f.type );
			if ( index_ !== -1 ) {
				f[ "type_name" ] = this.typeBank[ index_ ].label;
			}
		} );
		return dmBank;
	}
	
	convertData ( data : TnBank[] ) {
		let result    = [];
		const newData = data.map( ( m ) => {
			const length   = m[ "kyhieu" ].split( "." ).length;
			m[ "sortKey" ] = Number(
				m[ "kyhieu" ]
				.split( "." )
				.splice( 1 , length - 1 )
				.join( "." )
			);
			return m;
		} );
		const parent  = this.helperService.sort(
			newData.filter( ( m ) => m.parent_id === 0 ) ,
			"sortKey"
		);
		// this.listTieuchuan = [...parent];
		parent.map( ( m ) => {
			m[ "showName" ] = m.ten;
			m[ "newKey" ]   = m.kyhieu;
			m[ "core" ]     = ! m[ "cotloi" ] ? "- Not active" : "- Active";
			return m;
		} );
		parent.forEach( ( f , k ) => {
			const child = this.helperService.sort(
				newData.filter( ( m ) => m.parent_id === f.id ) ,
				"sortKey"
			);
			child.map( ( m ) => {
				m[ "showName" ] = "\xa0\xa0\xa0\xa0-\xa0".concat( m.ten );
				m[ "newKey" ]   = m.kyhieu;
				m[ "core" ]     = ! m[ "cotloi" ] ? "- Not active" : "- Active";
				return m;
			} );
			result = result.concat( f , child );
		} );
		return result;
	}
	
	private preSetupForm ( name : string ) {
		// this.notificationService.isProcessing(false);
		this.notificationService.openSideNavigationMenu( {
			name ,
			template  : this.template ,
			size      : 600 ,
			offsetTop : "0px" ,
		} );
	}
	
	closeForm () {
		this.loadData();
		this.formData.reset();
		this.formActive = null;
		this.bankChild  = "";
		this.notificationService.closeSideNavigationMenu( this.menuName );
	}
	
	private preSetupFormChild ( name : string ) {
		this.btnActionChild = 'add';
		this.notificationService.openSideNavigationMenu( {
			name ,
			template  : this.templateChild ,
			size      : 600 ,
			offsetTop : "0px" ,
		} );
	}
	
	closeFormChild () : void {
		this.loadData();
		this.formData.reset();
		this.formActive = null;
		this.notificationService.closeSideNavigationMenu( this.menuNameChild );
	}
	
	saveFormData () : void {
		if ( this.formData.valid ) {
			this.formActive.data = this.formData.value;
			this.OBSERVE_PROCESS_FORM_DATA.next( this.formActive );
		}
		else {
			this.notificationService.toastError( "Vui lòng nhập đủ và đúng thông tin" );
		}
	}
	
	// custom news
	
	checkIsValid ( col : string , item : string ) {
		this.tnBankService.getTnBankByCol2( col , item ).subscribe(
			result => {
				//const res = result.filter(m=>m.status !== -1);
				const res = result;
				if ( res && res.length !== 0 ) {
					if ( this.isUpdated === false ) {
						this.slugIsValid      = false;
						this.inputErrors.slug = true;
					}
					else {
						const index = res.findIndex( m => m.id === this.bankSelected.id );
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
	
	onchangeSlug () : void {
		if ( this.f[ 'slug' ].value ) {
			const slug : string = this.helperService.sanitizeVietnameseTitle( this.f[ 'slug' ].value );
			this.f[ 'slug' ].setValue( slug );
			this.checkIsValid( 'slug' , slug );
		}
	}
	
	onChangeTitle () : void {
		if ( this.f[ 'name' ].value ) {
			const slug : string = this.helperService.sanitizeVietnameseTitle( this.f[ 'name' ].value );
			this.f[ 'slug' ].setValue( slug );
			this.checkIsValid( 'slug' , slug );
		}
	}
	
	loadChildrentBank () : void {
		this.tnBankService.getAllChildFromParentId( this.bankSelected.id ).subscribe( res => {
			this.listBankChildren = res.data;
		} );
	}
	
	async handleClickOnTable ( button : ButtonBase ) : Promise<void> {
		
		if ( ! button ) {
			return;
		}
		const decision : TnBank =
			      button.data && this.dmBank
			      ? this.dmBank.find( ( u : TnBank ) : boolean => u.id === button.data )
			      : null;
		switch ( button.name ) {
			case "BUTTON_ADD_NEW":
				this.isUpdated    = false;
				this.btn_checkAdd = "Lưu lại";
				this.formActive   = this.listForm[ FormType.ADDITION ];
				this.preSetupForm( this.menuName );
				break;
			case "EDIT_DECISION":
				this.btn_checkAdd      = "Cập nhật";
				this.isUpdated         = true;
				const object1 : TnBank = this.dmBank.find( ( u : TnBank ) : boolean => u.id === decision.id );
				if ( ! object1 ) {
					break
				}
				this.bankSelected = object1;
				this.formData.reset( {
					name       : object1.name ,
					slug       : object1.slug ,
					desc       : object1.desc ,
					parent_id  : object1.parent_id ,
					ordering   : object1.ordering ,
					subject_id : object1.subject_id ,
					type       : object1.type ,
				} );
				this.formActive        = this.listForm[ FormType.UPDATE ];
				this.formActive.object = object1;
				this.preSetupForm( this.menuName );
				break;
			
			case "DELETE_DECISION":
				const confirm : boolean = await this.notificationService.confirmDelete();
				if ( confirm ) {
					this.tnBankService.deleteTnBank( decision.id ).subscribe( {
						next  : () : void => {
							this.notificationService.toastSuccess( "Xoá thành công" );
							this.loadData();
						} ,
						error : () : void => {
							this.notificationService.toastError( "Xóa ngân hàng câu hỏi thất bại" )
						}
					} );
				}
				break;
			case "ADD_CHILD_DECISION":
				this.bankSelected = decision;
				this.loadChildrentBank();
				this.preSetupFormChild( this.menuNameChild );
				break;
		}
	}
	
	paginate ( { page } : PaginatorState ) : void {
		this.page = page + 1;
		this.loadData();
	}
	
	onSearch ( text : string ) : void {
		this.searchBank = text;
		this.paginator.changePage( 1 );
		this.page = 1;
		this.loadData();
	}
	
	private __processFrom ( { type } : FormBank ) : void {
		if ( ! this.slugIsValid ) {
			this.notificationService.toastError( 'Ký hiệu không được phép trùng' );
			return;
		}
		if ( type === FormType.ADDITION ) {
			// set truong_id
			this.formData.controls[ "ordering" ].setValue( 100 );
			this.formData.controls[ "parent_id" ].setValue( 0 );
			// return;
			this.tnBankService.addTnBank( this.formData.value ).subscribe( {
				next  : () : void => {
					this.notificationService.toastSuccess(
						"Thêm ngân hàng câu hỏi mới thành công"
					);
					this.formData.reset();
					this.closeForm();
				} ,
				error : () : void =>
					this.notificationService.toastError(
						"Thêm ngân hàng câu hỏi thất bại"
					) ,
			} );
		}
		else {
			this.tnBankService.updateTnBank( this.formActive.object.id , this.formData.value ).subscribe( {
				next  : () : void => {
					this.notificationService.toastSuccess( "Sửa thông tin ngân hàng câu hỏi thành công" );
					this.closeForm();
				} ,
				error : () : void =>
					this.notificationService.toastError( "Sửa thông tin ngân hàng câu hỏi thất bại" ) ,
			} );
		}
	}
	
	// handle save child
	btnSaveChild () : void {
		if ( ! this.bankChild.trim() ) {
			this.notificationService.toastError( 'Vui lòng không nhập khoảng trống!' )
			return;
		}
		let bankChildSave : TnBank = {} as TnBank;
		bankChildSave.name         = this.bankChild;
		bankChildSave.ordering     = 100;
		bankChildSave.parent_id    = this.bankSelected.id;
		bankChildSave.subject_id   = this.bankSelected.subject_id;
		bankChildSave.user_id      = this.auth.user.id;
		bankChildSave.status       = 1;
		bankChildSave.type         = this.bankSelected.type;
		bankChildSave.slug         = Helper.sanitizeVietnameseTitle( this.bankChild ).concat( "_" , this.bankSelected.id.toString() )
		
		this.tnBankService.addTnBank( bankChildSave ).subscribe( {
			next  : () : void => {
				this.notificationService.toastSuccess( "Thêm ngân hàng câu hỏi mới thành công" );
				this.bankChild = '';
				this.loadChildrentBank();
			} ,
			error : () : void =>
				this.notificationService.toastError( "Thêm ngân hàng câu hỏi thất bại" ) ,
		} );
	}
	
	btnEditChildBank ( item : TnBank ) : void {
		this.bankChildSelected = item;
		this.bankChild         = item.name;
		this.btnActionChild    = 'edit';
	}
	
	btnSaveEdit () : void {
		let bankChildUpdate : TnBank = this.listBankChildren.filter( ( item : TnBank ) : boolean => item.id === this.bankChildSelected.id )[ 0 ];
		bankChildUpdate.name         = this.bankChild;
		let data : TnBank            = {} as TnBank;
		data.name                    = bankChildUpdate.name;
		data.ordering                = bankChildUpdate.ordering;
		data.parent_id               = bankChildUpdate.parent_id;
		data.subject_id              = bankChildUpdate.subject_id;
		data.user_id                 = bankChildUpdate.user_id;
		data.status                  = bankChildUpdate.status;
		data.type                    = bankChildUpdate.type;
		data.slug                    = this.helperService.sanitizeVietnameseTitle( this.bankChild ).concat( "_" , this.bankSelected.id.toString() )
		this.tnBankService.updateTnBank( bankChildUpdate.id , data ).subscribe( {
			next  : () : void => {
				this.notificationService.toastSuccess( "Cập nhật ngân hàng câu hỏi thành công" );
				this.bankChild = '';
				this.loadChildrentBank();
				this.btnActionChild = 'add';
			} ,
			error : () : void =>
				this.notificationService.toastError( "Cập nhật ngân hàng câu hỏi thất bại" ) ,
		} );
		
	}
	
	async btnDeleteChildBank ( item : TnBank ) : Promise<void> {
		this.bankChildSelected = item;
		let confirm : boolean  = await this.notificationService.confirmDelete();
		if ( confirm ) {
			this.tnBankService.deleteTnBank( item.id ).subscribe( {
				next  : () : void => {
					this.notificationService.toastSuccess( "Xóa ngân hàng câu hỏi thành công" );
					this.bankChild        = '';
					this.listBankChildren = this.listBankChildren.filter( ( i : TnBank ) : boolean => i.id !== item.id );
				} ,
				error : () : void =>
					this.notificationService.toastError( "Xóa ngân hàng câu hỏi thất bại" ) ,
			} );
		}
	}
	
	btnRemoveChild () : void {
		this.btnActionChild = 'add';
		this.bankChild      = '';
	}
}
