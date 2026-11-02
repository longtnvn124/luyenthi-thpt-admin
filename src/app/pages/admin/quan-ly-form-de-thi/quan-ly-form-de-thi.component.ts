import { CommonModule } from "@angular/common";
import { Component , OnInit , TemplateRef , ViewChild } from "@angular/core";
import { AbstractControl , FormBuilder , FormGroup , FormsModule , ReactiveFormsModule , Validators } from "@angular/forms";
import { ButtonBase } from "@model/button";
import { IctuQueryCondition , IctuQueryParams } from "@model/dto";
import { OvicTableStructure } from "@model/ovic-models";
import { TnBank } from "@model/tn-bank";
import { TnFormDetail , TnTestForm } from "@model/tn-test-form";
import { AuthService } from "@service/core/auth.service";
import { HttpParamsHeplerService } from "@service/core/http-params-hepler.service";
import { ThemeSettingsService } from "@service/core/theme-settings.service";
import { TnBankService } from "@service/luyenthithpt/tn-bank.service";
import { TnTestFormService } from "@service/luyenthithpt/tn-test-form.service";
import { NotificationService } from "@theme/services/notification.service";
import { bankQuestion , LEVEL_QUESTION , QUESTION_TYPE } from "@utilities/syscats";
import { Paginator , PaginatorModule , PaginatorState } from "primeng/paginator";
import { filter , forkJoin , map , Observable , of , Subscription , switchMap } from "rxjs";
import { OvicDropdownComponent } from "src/app/templates/ovic-dropdown/ovic-dropdown.component";
import { OvicTableComponent } from "src/app/templates/ovic-table/ovic-table.component";
import { InputSwitchModule } from "primeng/inputswitch";
import { ButtonModule } from "primeng/button";
import { PickListModule } from "primeng/picklist";
import { TableModule } from "primeng/table";
import { TnBankQuestion } from "@model/tn-bank-question";
import { TnBankQuestionService } from "@service/luyenthithpt/tn-bank-question.service";
import { HelperService } from "@service/core/helper.service";
import { TnFormDetailService } from "@service/luyenthithpt/tn-form-detail.service";
import { TnQLCathiService } from "@service/luyenthithpt/tn-ql-ca-thi.service";
import { HttpParams } from "@angular/common/http";
import { DetailFormComponent } from "./components/detail-form/detail-form.component";
import { TableLoaderComponent } from "src/app/templates/table-loader/table-loader.component";

@Component( {
	selector    : "app-quan-ly-form-de-thi" ,
	templateUrl : "./quan-ly-form-de-thi.component.html" ,
	styleUrls   : [ "./quan-ly-form-de-thi.component.css" ] ,
	standalone  : true ,
	imports     : [
		OvicTableComponent ,
		PaginatorModule ,
		InputSwitchModule ,
		ReactiveFormsModule ,
		FormsModule ,
		CommonModule ,
		OvicDropdownComponent ,
		ButtonModule ,
		PickListModule ,
		TableModule ,
		DetailFormComponent ,
		TableLoaderComponent
	]
} )
export class QuanLyFormDeThiComponent implements OnInit {
	@ViewChild( "templateTestForm" , { static : true } ) template : TemplateRef<any>;
	@ViewChild( "templateFormDetailOther" , { static : true } )
	templateFormDetailOther : TemplateRef<any>;
	@ViewChild( "templateChooseCode" ) templateChooseCode : TemplateRef<any>;

	@ViewChild( Paginator ) paginator : Paginator;
	subscription        = new Subscription();
	sizeFullWidth       = 1024;
	isLoading : boolean = true;
	index               = 1;
	page                = 1;
	search : string     = '';
	rows                = this.themeSettingsService.settings.rows;
	recordsTotal        = 0;
	listData : TnTestForm[];
	dmBank : TnBank[];
	bank_question       = bankQuestion;
	questionType        = QUESTION_TYPE;
	selectedTestForm : TnTestForm;
	isUpdated           = false;

	tblStructure : OvicTableStructure[] = [
		{
			fieldType     : "normal" ,
			field         : [ "name" ] ,
			innerData     : true ,
			header        : "Tên form" ,
			sortable      : false ,
			isFirstColumn : true ,

			buttons : [
				{
					label    : "Thông tin chi tiết form" ,
					icon     : "fa fa-pencil-square-o" ,
					name     : "EDIT_FORM_DETAILS" ,
					cssClass : "btn-edit"
				} ,
				{
					label    : "Cập nhật form" ,
					icon     : "pi pi-file-edit" ,
					name     : "EDIT_DECISION" ,
					cssClass : "btn-edit"
				} ,
				{
					label    : "Xoá" ,
					icon     : "pi pi-trash" ,
					name     : "DELETE_DECISION" ,
					cssClass : "btn-delete"
				}
			]
		} ,
		{
			fieldType : "normal" ,
			field     : [ "bank_name" ] ,
			innerData : true ,
			header    : "Tên ngân hàng" ,
			sortable  : false
		} ,

		{
			fieldType : "normal" ,
			field     : [ "__ht_goiy" ] ,
			innerData : true ,
			header    : "Hiển thị gợi ý" ,
			sortable  : false ,
			headClass : 'text-center' ,
			rowClass  : 'text-center'
		} ,
		// {
		//   fieldType: "normal",
		//   field: ["__ht_giaithich"],
		//   innerData: true,
		//   header: "Hiển thị giải thích",
		//   sortable: false,
		// },
		// {
		//   fieldType: "normal",
		//   field: ["__ht_ketqua"],
		//   innerData: true,
		//   header: "Hiển thị kết quả",
		//   sortable: false,
		// },
		{
			fieldType : "normal" ,
			field     : [ "__trangthai" ] ,
			innerData : true ,
			header    : "Trạng thái kích hoạt" ,
			sortable  : false ,
			headClass : 'text-center' ,
			rowClass  : 'text-center'
		} ,
		{
			fieldType : "normal" ,
			field     : [ "__mota" ] ,
			innerData : true ,
			header    : "Mô tả" ,
			sortable  : false
		}
	];

	headButtons   = [
		{
			label : "Thêm mới form đề thi" ,
			name  : "BUTTON_ADD_NEW" ,
			icon  : "pi-plus pi" ,
			class : "p-button-success ml-3 mr-2"
		}
	];
	formData : FormGroup;
	titleForm     = "";
	typeTime      = [ { value : "total" , label : "Bài thi" } ];
	errorMessages = {
		name    : "Vui lòng nhập tên form đề thi" ,
		bank_id : "Vui lòng chọn ngân hàng" ,
		// scoring_method: "Vui lòng chọn phương thức quy đổi điểm",
		total : "Vui lòng nhập thời gian thi"
	};

	//form detail
	dmFormDetail : TnFormDetail[];
	listChuong : TnBank[];
	levelQuestion                       = LEVEL_QUESTION;
	cantAction                          = false;
	sourceProducts : TnBankQuestion[];
	targetProducts : TnBankQuestion[]   = [];
	indexFormDetail : number;
	dmFormDetailDelete : TnFormDetail[] = [];

	constructor (
		private auth : AuthService ,
		private httpParamsHeplerService : HttpParamsHeplerService ,
		private helperService : HelperService ,
		private themeSettingsService : ThemeSettingsService ,
		private tnBankService : TnBankService ,
		private tnTestFormService : TnTestFormService ,
		private tnBankQuestionService : TnBankQuestionService ,
		private tnFormDetailService : TnFormDetailService ,
		private tnQLCathiService : TnQLCathiService ,
		private notifi : NotificationService ,
		private fb : FormBuilder
	) {
		const observeProcessCloseForm = this.notifi.onSideNavigationMenuClosed().pipe( filter( ( menuName ) => menuName === "" ) ).subscribe( () => this.loadData() );
		this.subscription.add( observeProcessCloseForm );
		const observerOnResize = this.notifi.observeScreenSize.subscribe(
			( size ) => ( this.sizeFullWidth = size.width )
		);
		this.subscription.add( observerOnResize );

		this.formData = this.fb.group( {
			name            : [ "" , Validators.required ] ,
			bank_id         : [ "" , Validators.required ] ,
			show_hint       : 0 ,
			show_explain    : 0 ,
			show_result     : 0 ,
			status          : 1 ,
			desc            : [ "" ] ,
			number_question : [ 0 , Validators.required ] ,
			// scoring_method: ["", Validators.required],
			params    : [ "" ] , //params là cái sẽ đẩy lên database
			type_bank : [ "THI" ] ,
			total     : [ "" , Validators.required ]  //để lưu trữ time sau sẽ xoá khi push lên database
		} );
	}

	get f () : { [ key : string ] : AbstractControl<any> } {
		return this.formData.controls;
	}

	ngOnInit () {
		this.loadData();
	}

	loadData () {
		this.tnTestFormService.getLimit( this.page , this.search ).pipe(
			switchMap( ( res : { recordsTotal : number; data : TnTestForm[] } ) => {
				let bankids = res.data.reduce( ( ids : number[] , item : TnTestForm ) => {
					if ( ids.includes( item.bank_id ) ) return ids;
					ids.push( item.bank_id );
					return ids;
				} , [] );

				return this.tnBankService.getByIds( bankids ).pipe(
					map( ( banks : TnBank[] ) => {
						res.data = banks.length ? res.data.map( ( item ) => {
							let bank            = banks.find( bank => bank.id === item.bank_id );
							item[ 'bank_name' ] = bank.name;
							item[ 'bank_id' ]   = bank.id;
							return item;
						} ) : res.data;
						return res;
					} )
				)
			} )
		).subscribe( {
			next : ( res ) => {
				this.recordsTotal = res.recordsTotal;
				this.listData     = res.data.map( ( m ) => {
					m[ "__ht_goiy" ] =
						m.show_hint === 0
						? '<span class="badge-grey" >không</span>'
						: '<span class="badge-green" >có</span>';
					// m["__ht_giaithich"] =
					//   m.show_explain === 0
					//     ? '<i class="fa fa-square-o" style="font-size: 15px" ></i>'
					//     : '<i class="fa fa-check-square-o" style="font-size: 15px" ></i>';
					// m["__ht_ketqua"] =
					//   m.show_result === 0
					//     ? '<i class="fa fa-square-o" style="font-size: 15px" ></i>'
					//     : '<i class="fa fa-check-square-o" style="font-size: 15px" ></i>';
					m[ "__trangthai" ] =
						m.status === 0
						? '<span class="badge-red" >Không kích hoạt</span>'
						: '<span class="badge-green" >Kích hoạt</span>';
					m[ "__mota" ] = m.desc ?? '';
					return m;
				} );

				this.isLoading = false;
			}
		} )

		this.tnBankService.getTnBankByType( 1 ).subscribe( {
			next : ( res ) => {
				this.dmBank = res.data;
			}
		} )

	}

	loadData2 ( page ) {
		this.tnBankService.getTnBankByType( 1 ).pipe(
			switchMap( ( dataBank ) => {
				this.dmBank = dataBank.data;
				const ids   = [];
				dataBank.data.forEach( ( dt ) => {
					ids.push( dt.id );
				} );
				const __condition = this.httpParamsHeplerService.paramsConditionBuilder( [
					{
						conditionName : "status" ,
						condition     : IctuQueryCondition.notEqual ,
						value         : "-1" ,
						orWhere       : "and"
					}
				] ).set( "order" , "DESC" ).set( "orderby" , "id" ).set( 'page' , page.toString() ).set( "include" , ids.toString() ).set( "include_by" , "bank_id" ).set( 'limit' , 10 )

				return this.tnTestFormService.getTnTestFormByCols( __condition ).pipe(
					switchMap( ( form ) => {
						form.forEach( ( f ) => {
							const index = dataBank.data.findIndex(
								( m ) => m.id === f.bank_id
							);
							if ( index !== -1 ) {
								f[ "bank_name" ] = dataBank.data[ index ].name;
								f[ 'bank_id' ]   = dataBank.data[ index ].id;
							}
							else {
								f[ "bank_name" ] = "--";
							}
						} );
						return of( form );
					} )
				);
			} )
		).subscribe( {
			next : ( _resForm ) => {
				this.listData     = _resForm.map( ( m ) => {
					m[ "__ht_goiy" ] =
						m.show_hint === 0
						? '<span class="badge-grey" >không</span>'
						: '<span class="badge-green" >có</span>';
					// m["__ht_giaithich"] =
					//   m.show_explain === 0
					//     ? '<i class="fa fa-square-o" style="font-size: 15px" ></i>'
					//     : '<i class="fa fa-check-square-o" style="font-size: 15px" ></i>';
					// m["__ht_ketqua"] =
					//   m.show_result === 0
					//     ? '<i class="fa fa-square-o" style="font-size: 15px" ></i>'
					//     : '<i class="fa fa-check-square-o" style="font-size: 15px" ></i>';
					m[ "__trangthai" ] =
						m.status === 0
						? '<span class="badge-red" >Không kích hoạt</span>'
						: '<span class="badge-green" >Kích hoạt</span>';

					m[ "__mota" ] = m.desc ?? '';
					return m;
				} );
				this.recordsTotal = _resForm.length;
				this.isLoading    = false;
			}
		} );
	}

	async handleClickOnTable ( button : ButtonBase ) {
		if ( ! button ) {
			return;
		}


		const decision =
			      button.data && this.listData
			      ? this.listData.find( ( u ) => u.id === button.data )
			      : null;
		switch ( button.name ) {
			case "BUTTON_ADD_NEW":
				this.titleForm = "Thêm mới form đề thi";
				this.formData.reset( {
					show_hint    : 0 ,
					show_explain : 0 ,
					show_result  : 0 ,
					status       : 1
				} );
				this.preSetupForm( this.template );
				break;
			case "EDIT_DECISION":
				this.titleForm = "Cập nhật form đề thi";
				const object1  = this.listData.find( ( u ) => u.id === decision.id );

				this.selectedTestForm = object1;
				this.formData.reset( {
					name            : object1.name ,
					bank_id         : object1.bank_id ,
					show_hint       : object1.show_hint ,
					show_explain    : object1.show_explain ,
					show_result     : object1.show_result ,
					status          : object1.status ,
					desc            : object1.desc ,
					scoring_method  : object1.scoring_method ,
					type_bank       : [ "THI" ] ,
					total           : object1.params.total , //để lưu trữ time
					number_question : object1.number_question
				} );
				this.isUpdated = true;
				this.preSetupForm( this.template );
				break;
			case "DELETE_DECISION":
				const confirm = await this.notifi.confirmDelete( 'Nếu xóa form đề thì các dữ liệu phụ thuộc sẽ bị ảnh hưởng (Ca thi, Đề thi, Bài thi)' , 'Bạn có chắc chắn muốn xóa?' );
				if ( confirm ) {
					this.notifi.isProcessing( true );
					this.tnTestFormService.deleteTnTestForm( decision.id ).subscribe( {
						next  : () => {
							this.page = Math.max(
								1 ,
								this.page - ( this.listData.length > 1 ? 0 : 1 )
							);
							this.notifi.isProcessing( false );
							this.notifi.toastSuccess( "Thao tác thành công" );
							this.loadData();
						} ,
						error : () => {
							this.notifi.isProcessing( false );
							this.notifi.toastError( "Thao tác không thành công" );
						}
					} );
				}
				break;
			case "EDIT_FORM_DETAILS":
				if ( button.data ) {
					this.tnQLCathiService.getTnQLCathiByCol( "form_id" , button.data ).subscribe( ( _res ) => {
						if ( _res.length ) {
							this.cantAction = true;
							this.notifi.confirm( {
								heading :
									"Form đề này đã được sử dụng cho: " +
									_res.length +
									" ca thi. Bạn không thể thao tác"
							} );
						}
						else {
							this.cantAction = false;
						}
					} );
				}
				this.titleForm        = "Chi tiết form";
				const object12        = this.listData.find( ( u ) => u.id === decision.id );
				this.selectedTestForm = object12;
				this.loadFormDetail( this.selectedTestForm );
				this.notifi.openSideNavigationMenu( {
					name      : "" ,
					template  : this.templateFormDetailOther ,
					size      : window.innerWidth ,
					offsetTop : "0px"
				} );
				break;
			default:
				break;
		}
	}

	private preSetupForm ( template : any , name? : string ) {
		this.notifi.openSideNavigationMenu( {
			name ,
			template  : template ,
			size      : 600 ,
			offsetTop : "0px"
		} );
	}

	closeForm () {
		this.loadData();
		this.notifi.closeSideNavigationMenu();
	}

	onSearch ( text : string ) {
		this.search = text;
		this.loadData();
	}

	paginate ( { page } : PaginatorState ) {
		this.page = page + 1;
		this.loadData();
	}

	saveFormData () {
		if ( this.formData.valid ) {
			this.formData.value.params = {
				timePattern : this.typeTime[ 0 ].value ,
				total       : this.formData.value.total
			};
			if ( ! this.formData.controls[ 'type_bank' ].value ) {
				this.formData.controls[ 'type_bank' ].setValue( 'THI' )
			}
			delete this.formData.value.total;

			let dataSave = { ... this.formData.value };
			delete dataSave.total;
			dataSave.params = {
				timePattern : this.typeTime[ 0 ].value ,
				total       : this.formData.controls[ 'total' ].value
			}


			// return;
			if ( this.isUpdated ) {
				this.tnTestFormService.updateTnTestForm( this.selectedTestForm.id , dataSave ).subscribe( {
					next  : () => {
						this.notifi.toastSuccess( "Cập nhật thành công" );
						this.closeForm();
					} ,
					error : () => {
						this.notifi.toastError( "Cập nhật thất bại" );
					}
				} );
			}
			else {
				this.tnTestFormService.addTnTestForm( dataSave ).subscribe( {
					next  : () => {
						this.notifi.toastSuccess( "Thêm form mới thành công" );
						this.closeForm();
					} ,
					error : () => {
						this.notifi.toastError( "Thêm form mới thất bại" );
					}
				} );
			}
		}
		else {
			let i          = 0;
			let foundError = false;
			while ( i < Object.keys( this.errorMessages ).length && ! foundError ) {
				const currentKey = Object.keys( this.errorMessages )[ i ];
				if ( ! this.formData.get( currentKey ).valid ) {
					this.notifi.toastWarning( this.errorMessages[ currentKey ] );
					foundError = true;
				}
				i++;
			}
		}
	}

	//form detail

	loadFormDetail ( form : TnTestForm ) {

		this.dmFormDetail = [];
		const condition   = this.httpParamsHeplerService.paramsConditionBuilder( [
			{
				conditionName : "status" ,
				condition     : IctuQueryCondition.equal ,
				value         : "1" ,
				orWhere       : "and"
			} ,
			{
				conditionName : "parent_id" ,
				condition     : IctuQueryCondition.equal ,
				value         : form.bank_id.toString() ,
				orWhere       : "and"
			}
		] ).set( "order" , "ASC" ).set( "orderby" , "id" );
		forkJoin( [
			this.tnFormDetailService.getTnFormDetailByCol( "form_id" , form.id ) ,
			this.tnBankService.getTnBankByCols( condition )
		] ).subscribe( ( [ _res , _resChuong ] ) => {
			this.listChuong = _resChuong;

			this.dmFormDetail = _res.map( ( m ) => {
				m.required = true;
				return m;
			} );
		} );
	}

	changeValueFormAnhVan ( label , value , dropdow , index ) {

		if ( this.dmFormDetail[ index ].id ) {
			this.dmFormDetail[ index ][ "edit" ] = true;
		}
		else {
			this.dmFormDetail[ index ][ "new" ] = true;
		}
		if ( dropdow ) {
			this.dmFormDetail[ index ][ label ] = value;
			const fromObject : IctuQueryParams  = {
				limit   : "-1" ,
				order   : "desc" ,
				orderby : "id"
			};
			const condition                     = this.httpParamsHeplerService.paramsConditionBuilder( [
					{
						conditionName : "level" ,
						condition     : IctuQueryCondition.equal ,
						value         : label === "level" ? value : this.dmFormDetail[ index ].level
					} ,
					{
						conditionName : "bank_id" ,
						condition     : IctuQueryCondition.equal ,
						value         : label === "bank_id" ? value : this.dmFormDetail[ index ].bank_id ,
						orWhere       : "and"
					} ,
					{
						conditionName : "group_id" ,
						condition     : IctuQueryCondition.equal ,
						value         : "0" ,
						orWhere       : "and"
					} ,
					// {
					//   conditionName: "question_type",
					//   condition: IctuQueryCondition.equal,
					//   value:
					//     label === "question_type"
					//       ? value
					//       : this.dmFormDetail[index].question_type,
					//   orWhere: "and",
					// },
					{
						conditionName : "status" ,
						condition     : IctuQueryCondition.equal ,
						value         : "1" ,
						orWhere       : "and"
					}
				] ,
				new HttpParams( { fromObject } ) );
			this.tnBankQuestionService.getTnBankQuestionByCols( condition ).subscribe( ( _resBank ) => {
				this.dmFormDetail[ index ].dmQuestionType = [ ... _resBank ];
				this.dmFormDetail[ index ].param          = null;

				let tmpRes        = [ ... _resBank ];
				const id_question = [];
				tmpRes.forEach( ( f ) => {
					id_question.push( f.id );
				} );


				this.dmFormDetail[ index ].param = id_question.toString();
				if ( ! _resBank.length ) {
					this.dmFormDetail[ index ][ "required" ] = false;
				}
				else {
					this.dmFormDetail[ index ][ "required" ] = true;
				}
			} );
		}
		else {
		}
	}

	checkDropDown ( array , value , findCol : string , showCol : string ) {
		const index = array.findIndex( ( m ) => m[ findCol ] === value );
		if ( index !== -1 ) {
			return array[ index ][ showCol ];
		}
		else {
			return null;
		}
	}

	checkMultiSelect ( array , param , index ) {
		if ( this.dmFormDetail[ index ].id ) {

			if ( this.dmFormDetail[ index ][ "edit" ] ) {
				if ( array && array.length ) {
					if ( param ) {
						return "Đã chọn: ".concat( param.split( "," ).length.toString() );
					}
					else {
						return "Chưa chọn";
					}
				}
				else {
					return "Không có câu hỏi";
				}
			}
			else {
				if ( param ) {
					return "Đã chọn: ".concat( param.split( "," ).length.toString() );
				}
				else {
					return "Chưa chọn";
				}
			}
		}
		else {
			if ( array && array.length ) {
				if ( param ) {
					return "Đã chọn: ".concat( param.split( "," ).length.toString() );
				}
				else {
					return "Chưa chọn";
				}
			}
			else {
				return "Không có câu hỏi";
			}
		}
	}

	openTemplateChooseCode ( index ) {
		this.notifi.createDialog.open( this.templateChooseCode , {
			width        : "100vw" ,
			disableClose : true
		} );
		this.sourceProducts  = [];
		this.targetProducts  = [];
		this.indexFormDetail = index;

		this.loadNewQuesTion( this.dmFormDetail[ index ] );
	}

	closeDialog () {
		this.notifi.createDialog.closeAll();
	}

	loadNewQuesTion ( object : TnFormDetail ) {
		if ( object.dmQuestionType && object.dmQuestionType.length ) {
			let tmpRes = [ ... object.dmQuestionType ];
			if ( object.param && object.param.length !== 0 ) {
				const arrTarget        = object.param.split( "," );
				const tmpTargetProduct = [];
				arrTarget.forEach( ( f , key ) => {
					const index = tmpRes.findIndex( ( m ) => m.id === Number( f ) );
					if ( index !== -1 ) {
						const tmp = tmpRes.splice( index , 1 );
						tmpTargetProduct.push( tmp[ 0 ] );
					}
				} );
				this.targetProducts = this.helperService.sort( tmpTargetProduct , "id" );
			}
			this.sourceProducts = this.helperService.sort(
				tmpRes.filter( ( m ) => m.status !== -1 ) ,
				"id"
			);
		}
		else {
			const fromObject : IctuQueryParams = {
				limit   : "-1" ,
				order   : "desc" ,
				orderby : "id"
			};
			const condition                    = this.httpParamsHeplerService.paramsConditionBuilder(
				[
					{
						conditionName : "level" ,
						condition     : IctuQueryCondition.equal ,
						value         : object.level.toString()
					} ,
					{
						conditionName : "bank_id" ,
						condition     : IctuQueryCondition.equal ,
						value         : object.bank_id.toString() ,
						orWhere       : "and"
					} ,
					{
						conditionName : "question_type" ,
						condition     : IctuQueryCondition.equal ,
						value         : object.question_type ,
						orWhere       : "and"
					} ,
					{
						conditionName : "status" ,
						condition     : IctuQueryCondition.equal ,
						value         : "1" ,
						orWhere       : "and"
					}
				] ,
				new HttpParams( { fromObject } )
			);
			this.tnBankQuestionService.getTnBankQuestionByCols( condition ).subscribe( ( _resBank ) => {


				let tmpRes = [ ... _resBank ];
				if ( object.param && object.param.length !== 0 ) {
					const arrTarget        = object.param.split( "," );
					const tmpTargetProduct = [];
					arrTarget.forEach( ( f , key ) => {
						const index = tmpRes.findIndex( ( m ) => m.id === Number( f ) );
						if ( index !== -1 ) {
							const tmp = tmpRes.splice( index , 1 );
							tmpTargetProduct.push( tmp[ 0 ] );
						}
					} );
					this.targetProducts = this.helperService.sort(
						tmpTargetProduct ,
						"id"
					);
				}

				this.sourceProducts = this.helperService.sort( tmpRes , "id" );

			} );
		}
	}

	async deleteFormDetail ( index ) {
		if ( this.dmFormDetail[ index ].id ) {
			// this.notifi.confirmDelete().then(() => {
			//     this.dmFormDetailDelete.push(this.dmFormDetail.splice(index, 1)[0]);
			// }, () => null)
			const confirm = await this.notifi.confirmDelete();
			if ( confirm ) {
				this.dmFormDetailDelete.push( this.dmFormDetail.splice( index , 1 )[ 0 ] );
			}
		}
		else {
			this.dmFormDetail.splice( index , 1 );
		}
	}

	addNewFormDetail () {
		const newData    = [];
		const updateData = [];
		const index      = this.dmFormDetail.findIndex(
			( m ) => ! m.required || ! m.last_point || ! m.param || ! m.number_questions
		);
		if ( index !== -1 ) {
			this.notifi.toastWarning( "Xin vui lòng kiểm tra lại thông tin" );
			return;
		}
		const index_1 = this.dmFormDetail.findIndex(
			( m ) => m.param && m.number_questions > m.param.split( "," ).length
		);
		if ( index_1 !== -1 ) {
			this.notifi.toastWarning(
				"Câu hỏi số " + ( index_1 + 1 ) + " có số lượng câu hỏi lớn hơn giới hạn"
			);
			return;
		}
		this.dmFormDetail.forEach( ( f , key ) => {
			f.ordering = key + 1;
			f.limit    = f.param ? 4 : 1;
			delete f.dmQuestionType;
			delete f.required;
			if ( f[ "edit" ] ) {
				delete f[ "edit" ];
				updateData.push( f );
			}
			if ( ! f.id ) {
				delete f[ "new" ];
				newData.push( f );
			}
		} );
		const idDeletes                       = [];
		const arrayQuerry : Observable<any>[] = [];
		if ( this.dmFormDetailDelete && this.dmFormDetailDelete.length ) {
			this.dmFormDetailDelete.forEach( ( f ) => {
				idDeletes.push( f.id );
			} );
			arrayQuerry.push(
				this.tnFormDetailService.deleteTnFormDetail( idDeletes.toString() )
			);
		}

		if ( newData && newData.length ) {
			newData.forEach( ( f ) => {
				arrayQuerry.push( this.tnFormDetailService.addTnFormDetail( f ) );
			} );
			// arrayQuerry.push(this.tnFormDetailService.addTnFormDetail(newData))
		}

		if ( arrayQuerry.length ) {
			forkJoin( arrayQuerry ).subscribe( {
				next  : ( _res ) => {
					this.notifi.toastSuccess( "Cập nhật thành công" );
					updateData.forEach( ( f , key ) => {
						setTimeout( () => {
							const idUpdate = f.id;
							delete f.id;
							this.tnFormDetailService.updateTnFormDetail( idUpdate , f );
						} , 100 * key );
					} );
				} ,
				error : () => {
					this.notifi.toastError( "Cập nhật thất bại" );
				}
			} );
		}
		else {
			let i = 0;
			updateData.forEach( ( f , key ) => {
				setTimeout( () => {
					const idUpdate = f.id;
					delete f.id;
					this.tnFormDetailService.updateTnFormDetail( idUpdate , f ).subscribe( () => {
						i = i + 1;
						if ( i === updateData.length ) {
							this.notifi.toastSuccess( "Cập nhật thành công" );
							// this.helperService.closeOvicFlexibleTemplate();
						}
					} );
				} , 100 * key );
			} );
		}
	}

	reloadFormDetail () {
		this.loadFormDetail( this.selectedTestForm );
	}

	addQuestion () {
		const fromObject : IctuQueryParams = {
			limit   : "-1" ,
			order   : "desc" ,
			orderby : "id"
		};
		const condition                    = this.httpParamsHeplerService.paramsConditionBuilder(
			[
				{
					conditionName : "level" ,
					condition     : IctuQueryCondition.equal ,
					value         : this.levelQuestion[ 1 ].value.toString()
				} ,
				{
					conditionName : "bank_id" ,
					condition     : IctuQueryCondition.equal ,
					value         : this.listChuong[ 0 ].id.toString() ,
					orWhere       : "and"
				} ,
				{
					conditionName : "question_type" ,
					condition     : IctuQueryCondition.equal ,
					value         : this.questionType[ 0 ].value ,
					orWhere       : "and"
				} ,
				{
					conditionName : "status" ,
					condition     : IctuQueryCondition.equal ,
					value         : "1" ,
					orWhere       : "and"
				}
			] ,
			new HttpParams( { fromObject } )
		);
		this.tnBankQuestionService.getTnBankQuestionByCols( condition ).subscribe( ( _resBank ) => {
			const ids = [];
			_resBank.forEach( ( f ) => {
				ids.push( f.id );
			} );
			let chuong_id = this.listChuong[ 0 ].id + "";
			let data      = {
				bank_id          : parseInt( chuong_id ) ,
				form_id          : this.selectedTestForm.id ,
				skill            : null ,
				level            : this.levelQuestion[ 0 ].value ,
				number_questions : null ,
				time             : null ,
				raw_point        : null ,
				last_point       : null ,
				limit            : 4 ,
				param            : ids.toString() ,
				question_type    : this.questionType[ 0 ].value ,
				dmQuestionType   : [ ... _resBank ] ,
				required         : _resBank.length ? true : false
			};


			this.dmFormDetail = [ ... this.dmFormDetail , data ];


			if ( this.dmFormDetail.length > 0 ) {
				this.changeValueFormAnhVan(
					"bank_id" ,
					this.dmFormDetail[ 0 ].bank_id ,
					true ,
					0
				);

				this.changeValueFormAnhVan(
					"level" ,
					this.dmFormDetail[ 0 ].level ,
					true ,
					0
				);


				this.loadNewQuesTion( this.dmFormDetail[ 0 ] );
			}
		} );
	}

	addFormParam () {
		if ( this.dmFormDetail[ this.indexFormDetail ].id ) {
			this.dmFormDetail[ this.indexFormDetail ][ "edit" ] = true;
		}
		else {
			this.dmFormDetail[ this.indexFormDetail ][ "new" ] = true;
		}
		const ids = [];
		this.targetProducts.forEach( ( f ) => {
			ids.push( f.id );
		} );
		this.dmFormDetail[ this.indexFormDetail ].param = ids.toString();
	}

	onMoveToTargetNew ( event ) {
		this.targetProducts = this.helperService.sort( this.targetProducts , "id" );
		this.addFormParam();
	}

	onMoveToSourceNew ( event ) {
		this.sourceProducts = this.helperService.sort( this.sourceProducts , "id" );
		this.addFormParam();
	}
}
