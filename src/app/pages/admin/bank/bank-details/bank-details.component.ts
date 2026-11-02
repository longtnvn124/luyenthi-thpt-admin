import { Component , computed , inject , OnDestroy , OnInit , Signal , signal , WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Bank } from "@model/tn-bank";
import { ComponentStateExtend , IctuBasePermissionClass , IctuTableComponent } from "@model/commons";
import { FormsModule } from "@angular/forms";
import { InputTextModule } from "primeng/inputtext";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { CollapsePanelComponent } from "@theme/components/collapse-panel.component";
import { IctuDataTable , IctuDataTableRow } from "@model/ictu-data-table";
import { distinctUntilChanged , forkJoin , map , Observable , of , Subject , switchMap , takeUntil } from "rxjs";
import { TnBankService } from "@service/luyenthithpt/tn-bank.service";
import { HelperService } from "@service/core/helper.service";
import { DtoObject } from "@model/dto";
import { IctuPaginatorComponent } from "@theme/components/ictu-paginator/ictu-paginator.component";
import { BankQuestionsComponent } from "@pages/admin/bank/bank-questions/bank-questions.component";
import { BankEnglishQuestionsComponent } from "@pages/admin/bank/bank-english-questions/bank-english-questions.component";
import { NotificationService } from "@appNotification";

interface OriginalBank extends Bank {
	children : Bank[];
	hasChildren : boolean;
	selected : boolean;
}

@Component( {
	selector    : 'app-bank-details' ,
	standalone  : true ,
	imports     : [
		CommonModule ,
		FormsModule ,
		InputTextModule ,
		MatProgressBarModule ,
		CollapsePanelComponent ,
		IctuPaginatorComponent ,
		BankQuestionsComponent ,
		BankEnglishQuestionsComponent
	] ,
	templateUrl : './bank-details.component.html' ,
	styleUrls   : [ './bank-details.component.css' ]
} )
export class BankDetailsComponent extends IctuBasePermissionClass implements OnInit , OnDestroy , IctuTableComponent<Bank> {

	dataTable : IctuDataTable<OriginalBank> = new IctuDataTable<OriginalBank>();

	onDestroy$ : Subject<string> = new Subject<string>();

	private readonly service : TnBankService = inject<TnBankService>( TnBankService );

	private readonly helperService : HelperService = inject<HelperService>( HelperService );

	private readonly notification : NotificationService = inject<NotificationService>( NotificationService );

	readonly state : WritableSignal<ComponentStateExtend> = signal<ComponentStateExtend>( 'loading' );

	search : string = '';

	private _temp : { paged : number, resetPaginator : boolean } = { paged : 1 , resetPaginator : true };

	private observeOnSearch : Subject<string> = new Subject<string>();

	activeBank : WritableSignal<Bank> = signal<Bank>( null );

	activeBankName : Signal<string> = computed( () : string => {
		if ( this.activeBank() ) {
			const activeId : number = this.activeBank().id;
			return this.activeBank() ? this.dataTable.data().reduce( ( reducer : string , parent : IctuDataTableRow<OriginalBank> ) : string => {
				if ( reducer ) {
					return reducer;
				}
				else {
					return parent.id === activeId ? parent.name : parent.hasChildren ? parent.children.reduce( ( _childReducer : string , _child : Bank ) : string => {
						return _childReducer ? _childReducer : _child.id === activeId ? `${ parent.name } > ${ _child.name }` : '';
					} , '' ) : reducer;
				}
			} , '' ) : '';
		}
		else {
			return '';
		}
	} );

	constructor () {
		super( 'ngan-hang/cap-nhat-cau-hoi' );
		this.observeOnSearch.asObservable().pipe(
			takeUntil( this.onDestroy$ ) ,
			distinctUntilChanged()
		).subscribe( () : void => {
			this.loadData( 1 , true );
		} )
	}

	ngOnInit () : void {
		this.loadData( 1 , true );
	}

	onSearchData () : void {
		this.observeOnSearch.next( this.search );
	}

	private loadData ( paged : number = 1 , resetPaginator : boolean = true ) : void {
		this.activeBank.set( null );
		this.state.set( 'loading' );
		this._temp = { paged , resetPaginator };
		this.loader( paged , resetPaginator ).subscribe( {
			next  : ( data : OriginalBank[] ) : void => {
				this.dataTable.fillData( data );
				this.state.set( data.length > 0 ? 'success' : 'empty' );
			} ,
			error : () : void => {
				this.state.set( 'error' )
			}
		} )
	}

	private loader ( paged : number = 1 , resetPaginator : boolean = true ) : Observable<OriginalBank[]> {
		return this.service.load( this.search , {
			limit  : this.dataTable.paginator.rows() ,
			paged ,
			select : 'id,name,parent_id,subject_id,slug,desc,status,user_id,ordering,type,format'
		} ).pipe(
			switchMap( ( res : DtoObject<Bank[]> ) : Observable<[ DtoObject<Bank[]> , Bank[] ]> => {
					const children : Observable<Bank[]> = res.data.length ? this.service.loadChild( res.data.map( ( m : Bank ) : number => m.id ) ) : of( [] );
					return forkJoin<[ DtoObject<Bank[]> , Bank[] ]>( [ of( res ) , children ] );
				}
			) ,
			map( ( [ res , childBanks ] : [ DtoObject<Bank[]> , Bank[] ] ) : DtoObject<OriginalBank[]> => {
				const data : OriginalBank[] = res.data.map( ( originalBank : Bank ) : OriginalBank => {
					const children : Bank[] = childBanks.filter( ( _child : Bank ) : boolean => _child.parent_id === originalBank.id );
					return {
						... originalBank ,
						children    : children.length > 0 ? this.helperService.arraySort<Bank>( children , "ordering" , 1 ).map( ( _child : Bank ) : Bank => ( {
							... _child ,
							format : originalBank.format // dịnh dạng ngân hàng con theo ngân hàng cha
						} ) ) : [] ,
						selected    : false ,
						hasChildren : children.length > 0
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

	reload ( event : MouseEvent ) : void {
		event.preventDefault();
		event.stopPropagation();
		this.loadData( this._temp.paged , this._temp.resetPaginator );
	}

	identify ( _ : number , item : OriginalBank ) : number | string {
		return item.id;
	}

	identifyChild ( _ : number , item : Bank ) : number | string {
		return item.id;
	}

	onChangePage ( paged : number ) : void {
		this.loadData( paged , false );
	}

	selectBank ( parent : Bank , child : Bank ) : void {
		this.dataTable.data.update( ( banks : IctuDataTableRow<OriginalBank>[] ) : IctuDataTableRow<OriginalBank>[] => {
			return banks.map( ( b : IctuDataTableRow<OriginalBank> ) : IctuDataTableRow<OriginalBank> => {
				b.selected = b.id === parent.id;
				return b
			} )
		} );
		this.activeBank.set( child );
	}

	alertBankEmptyChild () : void {
		this.notification.toastInfo( 'Ngân hàng này chưa được tạo danh mục đề!' );
	}

	ngOnDestroy () : void {
		this.onDestroy$.next( 'destroy' );
		this.onDestroy$.complete();
	}
}
