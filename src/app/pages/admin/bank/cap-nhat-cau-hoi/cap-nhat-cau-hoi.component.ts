import { Component , OnInit , TemplateRef , ViewChild } from '@angular/core';
import { InputTextModule } from "primeng/inputtext";
import { Paginator , PaginatorModule } from "primeng/paginator";
import { ThemeSettingsService } from "@service/core/theme-settings.service";
import { RippleModule } from "primeng/ripple";
import { ButtonModule } from "primeng/button";
import { TnBankService } from "@service/luyenthithpt/tn-bank.service";
import { MonHocService } from "@service/luyenthithpt/mon-hoc.service";
import { NotificationService } from "@appNotification";
import { debounceTime , map , Observable , of , Subject , Subscription , switchMap } from "rxjs";
import { TnBank } from "@model/tn-bank";
import { NgClass , NgForOf , NgIf , NgSwitch , NgSwitchCase } from "@angular/common";
import { TnBankQuestionService } from "@service/luyenthithpt/tn-bank-question.service";
import { LoadingProgressBarComponent } from "../../../../templates/loading-progress-bar/loading-progress-bar.component";
import { TnBankQuestion } from "@model/tn-bank-question";
import { SplitterModule } from "primeng/splitter";
import { IctuQuestionType } from "@model/class";
import { CreateQuetionsFormComponent } from "@pages/admin/bank/cap-nhat-cau-hoi/create-quetions-form/create-quetions-form.component";
import { MonHoc } from "@model/mon-hoc";
import { ListQuestiosViewComponent } from "@pages/admin/bank/cap-nhat-cau-hoi/list-questios-view/list-questios-view.component";

export interface SelectOptions<T> {
	label : string;
	value : T;
	disable? : boolean;
}

interface ServerBank {
	recordsTotal : number,
	data : TnBank[]
}

@Component( {
	selector    : 'app-cap-nhat-cau-hoi' ,
	templateUrl : './cap-nhat-cau-hoi.component.html' ,
	styleUrls   : [ './cap-nhat-cau-hoi.component.css' ] ,
	imports     : [
		InputTextModule ,
		PaginatorModule ,
		RippleModule ,
		ButtonModule ,
		NgIf ,
		NgSwitch ,
		NgForOf ,
		NgClass ,
		NgSwitchCase ,
		LoadingProgressBarComponent ,
		SplitterModule ,
		CreateQuetionsFormComponent ,
		ListQuestiosViewComponent
	] ,
	standalone  : true
} )
export class CapNhatCauHoiComponent implements OnInit {
	@ViewChild( "fromUpdateQuestions" , { static : true } ) fromUpdateQuestions : TemplateRef<any>;
	@ViewChild( Paginator ) paginator : Paginator;
	stateQuestion : string                   = '';//loading/d
	menuName : string                        = 'formUpdateQuestion';
	btnActionChild : 'add' | 'edit'          = "add";
	rows : number                            = this.themeSettingsService.settings.rows;
	recordsTotal : number                    = 0;
	textSearch : string                      = '';
	textSearchQuestion : string              = '';
	page : number                            = 1;
	listData : TnBank[]                      = [];
	bank_id_select : number                  = 0;
	bank_id_select_create_questions : number = 0;
	bank_select : TnBank;
	bank_select_create : TnBank;
	bankQuestions : TnBankQuestion[];
	subscription : Subscription              = new Subscription();
	sizeFullWidth : number                   = 1024;
	textViewUpdateForm : string              = '';
	MonHoc : MonHoc[];
	triggerForUpdateQuestion : boolean       = false;
	triggerChange : boolean                  = false;
	navMenuIsOpen : boolean                  = false;
	isLoading : boolean                      = false;
	private inputChanged : Subject<string>   = new Subject<string>();

	allQuestionType : SelectOptions<IctuQuestionType>[] = [
		{ value : 'group-input' , label : '[group-input] - Nhóm câu hỏi nhập đáp án' , disable : false } ,
		{ value : 'group-radio' , label : '[group-radio] - Nhóm câu hỏi chọn đáp án Đúng - Sai' , disable : false } ,
		{ value : 'checkbox' , label : '[check-box] - Chọn nhiều đáp án đúng' , disable : false } ,
		{ value : 'drag_drop' , label : '[drag-drop] - Câu hỏi nhóm kéo thả đáp án đúng' , disable : false } ,
		{ value : 'radio' , label : '[radio] - Chọn 1 đáp án đúng' , disable : false } ,
		{ value : 'grouping' , label : '[grouping] - Câu hỏi kéo thả đáp án vào cột tương ứng' , disable : false } ,
		{ value : 'inputbox' , label : '[input-box] - Nhập vào đáp án đúng' , disable : false } ,
		{ value : 'reorder_words' , label : '[reorder-words] - Sắp xếp lại câu theo thứ tự đúng' , disable : false } ,
		// { value : 'selectbox' , label : '[select-box] - Select box' , disable : false } ,
		{ value : 'matching' , label : '[matching] - Matching 2 vế' , disable : true }
	];
	vandungTypes                                        = [
		{ value : 1 , label : 'Hiểu'  } ,
		{ value : 2 , label : 'Biết'  } ,
		{ value : 3 , label : 'Vận dụng'  } ,
		{ value : 4 , label : 'Phân tích '  }
	]

	importQuestion =
		{
			mode : 'add' ,//add
			info : {
				question : {
					bank_id            : 0 ,
					group_id           : 0 ,
					question_type      : '' ,
					question_direction : '' ,
					answer_option      : [] ,
					answer_correct     : '' ,
					question_number    : null ,
					status             : 0 ,
					level              : 0 ,
					config             : {
						cols           : 2 ,
						invertedAnswer : true
					}
				} as TnBankQuestion
			}
		};

	constructor (
		private themeSettingsService : ThemeSettingsService ,
		private tnBankService : TnBankService ,
		private MonHocService : MonHocService ,
		private notificationService : NotificationService ,
		private questionBankService : TnBankQuestionService
	) {

		const observerOnResize = this.notificationService.observeScreenSize.subscribe( size => this.sizeFullWidth = size.width )
		this.subscription.add( observerOnResize );
	}

	ngOnInit () : void {
		this.inputChanged.pipe( debounceTime( 500 ) ).subscribe( ( search : string ) => {
			this.searchByInputs( search );
		} );
		this.MonHocService.getAllMonHoc().subscribe( {
			next      : ( data ) => {
				this.MonHoc = data;
				if ( data ) {
					this.loadInit();
				}
			} , error : () => {
				this.notificationService.toastError( 'load dữ liệu không thành công' );
			}
		} )

	}

	loadInit () : void {
		this.loadData();
	}

	loadData () : void {
		this.isLoading = true;
		this.tnBankService.getListLimit( this.page , this.textSearch ).pipe(
			switchMap( ( res : { recordsTotal : number, data : TnBank[] } ) => {
				let parentIds : number[] = res.data.reduce( ( ids : number[] , item : TnBank ) => {
					ids.push( item.id );
					return ids;
				} , [] );

				return this.tnBankService.getByParentIds( parentIds ).pipe(
					map( ( childBanks : TnBank[] ) => {
						res.data = res.data.map( ( item : TnBank ) => {
							item[ '__child' ] = childBanks.filter( ( child ) => {
								if ( child.parent_id === item.id ) {
									child[ '__mon_converted' ] = 'monkhac';
									return true;
								}
								return false;
							} );
							if ( item[ '__child' ]?.length ) {
								item[ '_haveChild' ] = true;
							}
							else {
								item[ '_haveChild' ] = false;
							}

							item[ '__mon_converted' ] = 'monkhac';
							return item;
						} )

						return res;
					} )
				)
			} )
		).subscribe( ( res ) => {
			this.listData     = res.data;
			this.recordsTotal = res.recordsTotal;
			this.notificationService.isProcessing( false );
			this.isLoading = false;

		} )
	}

	paginate ( event ) {
		this.page = event.page + 1;
		this.loadData();
	}

	btnRemoveTextSearch () {
		this.textSearch = '';
		this.onInputChange( '' )
	}

	private getChildInBanks ( item : ServerBank ) : Observable<ServerBank> {
		try {
			const index : number = item.data.findIndex( t => ! t[ '_haveChild' ] );
			if ( index !== -1 ) {
				return this.tnBankService.getallChildByParentId( item.data[ index ].id ).pipe( switchMap( m => {
					item.data[ index ][ '_haveChild' ] = true;
					item.data[ index ][ '__child' ]    = m.map( a => {
						// a['__mon_converted'] = this.MonHoc.find(f=> f.id === a.subject_id) && this.MonHoc.find(f=>
						// f.id === a.subject_id).slug === 'tienganh' ? 'tienganh': 'monkhac';
						a[ '__mon_converted' ] = 'monkhac';
						return a;
					} );
					return this.getChildInBanks( item )
				} ) )
			}
			else {
				return of( item );
			}
		}
		catch ( e ) {
			return of( item )
		}
	}

	//-----------------------su ly input search -------------------------
	onInputChange ( event ) {
		this.inputChanged.next( event );
	}

	searchByInputs ( search : string ) {
		this.textSearch = search;
		this.page       = 1;
		this.loadData();
	}

	//-----------------------su ly btn select bank -------------------------
	reLoadQuestion () {
		this.getDataQuestionByBankId( this.bank_id_select_create_questions );
	}

	btnSelectBank ( item : TnBank ) {

		this.bank_id_select = item.id;

		if ( item[ '__child' ] && item[ '__child' ].length > 0 ) {
			this.bank_id_select_create_questions = 0;
		}
		else {
			this.bank_id_select_create_questions = item.id;
			this.btnChildByItemBank( item );
		}
		this.getDataQuestionByBankId( this.bank_id_select_create_questions )
		this.bank_select = item;
	}

	btnChildByItemBank ( item : TnBank ) {
		this.bank_select_create              = item
		this.bank_id_select_create_questions = item.id;
		this.getDataQuestionByBankId( item.id );

	}

	getDataQuestionByBankId ( id : number ) {
		this.textSearchQuestion = '';
		this.stateQuestion      = 'loading';
		this.questionBankService.getAllQuestionByBankId( id ).subscribe( {
			next      : ( data ) => {
				// this.bankQuestions=data;
				const dataParent = data && data.length > 0 ? data.filter( f => f.group_id === 0 ) : [];
				const dataChild  = data && data.length > 0 ? data.filter( f => f.group_id !== 0 ) : [];

				this.bankQuestions = dataParent.map( m => {
					m[ '__level_converted' ] = this.vandungTypes.find( f => f.value === m.level ) ? this.vandungTypes.find( f => f.value === m.level ).label : 'Chờ duyệt';
					m.children               = dataChild.filter( f => f.group_id === m.id );

					return m;
				} )

				this.bankQuestions = this.bankQuestions.map( m => {
					m.children = m.children.map( c => {
						c[ 'children' ] = dataChild.filter( f => f.group_id === c.id )
						return c;
					} )
					return m;
				} )

				this.stateQuestion = 'present'
			} , error : ( e ) => {
				this.stateQuestion = 'error';
				this.notificationService.toastError( 'Load dữ liệu câu hỏi không thành công' );
			}
		} )
	}

	// private preSetupFormChild(name: string) {
	//   // this.notificationService.isProcessing(false);
	//   this.btnActionChild = 'add';
	//   this.notificationService.openSideNavigationMenu({
	//     name,
	//     template: this.fromUpdateQuestions,
	//     size: 1024,
	//     offsetTop: "0px",
	//   });
	// }
	btnOpenFormCreateQuestion () {


		this.notificationService.openSideNavigationMenu( {
			name      : this.menuName ,
			size      : this.sizeFullWidth ,
			offsetTop : '0px' ,
			template  : this.fromUpdateQuestions
		} )
		this.navMenuIsOpen       = true;
		this.importQuestion.mode = "add";
		const questionParram     = {
			... this.importQuestion.info.question ,
			bank_id : this.bank_id_select_create_questions
		}
		this.importQuestion.info = { ... this.importQuestion.info , question : questionParram };
	}

	closeForm () {
		// window.location.reload();
		// this.ngOnInit();
		this.importQuestion.mode = '';
		this.notificationService.closeSideNavigationMenu( this.menuName );
		this.getDataQuestionByBankId( this.bank_id_select_create_questions );
		this.navMenuIsOpen = false;

	}

	searchNameQuestion ( event ) {
		this.textSearchQuestion = event;
	}

	btnViewEdit ( event ) {
		// this.importQuestion.info.question = null;

		this.triggerForUpdateQuestion = ! this.triggerForUpdateQuestion;
		this.notificationService.openSideNavigationMenu( {
			name      : this.menuName ,
			size      : this.sizeFullWidth ,
			offsetTop : '0px' ,
			template  : this.fromUpdateQuestions
		} )
		this.importQuestion.mode          = "edit";
		this.importQuestion.info.question = event;
		this.navMenuIsOpen                = true;
	}

	emitCloseNav () {
		this.triggerChange = ! this.triggerChange;
		if ( this.navMenuIsOpen ) {

			this.closeForm();
		}

	}
};