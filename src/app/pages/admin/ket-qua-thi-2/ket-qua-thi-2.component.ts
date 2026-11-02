import { Component , inject , Signal , signal , WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputTextModule } from "primeng/inputtext";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { FormsModule , ReactiveFormsModule } from "@angular/forms";
import { IctuDataTable } from "@model/ictu-data-table";
import { distinctUntilChanged , forkJoin , map , Observable , of , Subject , switchMap , takeUntil } from "rxjs";
import { TnBankService } from "@service/luyenthithpt/tn-bank.service";
import { HelperService } from "@service/core/helper.service";
import { NotificationService } from "@appNotification";
import { ComponentStateExtend , IctuDropdownOptionExtended } from "@model/commons";
import { DotThiService } from "@service/luyenthithpt/dotthi.service";
import { DoiTacService } from "@service/luyenthithpt/doi-tac.service";
import { DoiTac } from "@model/doi-tac";
import { DtoObject } from "@model/dto";
import { IctuPaginatorComponent } from "@theme/components/ictu-paginator/ictu-paginator.component";
import { AuthService } from "@service/core/auth.service";
import { ListStudentResultsOfPartnerComponent } from "@pages/admin/ket-qua-thi-2/list-student-results-of-partner/list-student-results-of-partner.component";
import { DotThiOption } from "@model/dotthi";
import { DonViService } from "@service/luyenthithpt/donvi.service";
import { DmDonvi } from "@model/dm-donvi";

type SearchInfoPosition = 'left' | 'right';

interface SearchInfo {
	position : SearchInfoPosition;
	data : string;
}

interface DoiTacLuyenThi extends Pick<DoiTac , 'id' | 'hoten' | 'user_id' | 'donvi_id'> {
	officeName : string; // ten don vi cua doi tac
}

@Component( {
	selector    : 'app-ket-qua-thi-2' ,
	standalone  : true ,
	imports     : [ CommonModule , InputTextModule , MatProgressBarModule , ReactiveFormsModule , FormsModule , IctuPaginatorComponent , ListStudentResultsOfPartnerComponent ] ,
	templateUrl : './ket-qua-thi-2.component.html' ,
	styleUrls   : [ './ket-qua-thi-2.component.css' ]
} )
export class KetQuaThi2Component {

	private readonly onDestroy$ : Subject<string> = new Subject<string>();

	private readonly auth : AuthService = inject<AuthService>( AuthService );

	private readonly dotThiService : DotThiService = inject<DotThiService>( DotThiService );

	private readonly doiTacService : DoiTacService = inject<DoiTacService>( DoiTacService );

	readonly state : WritableSignal<ComponentStateExtend> = signal<ComponentStateExtend>( 'loading' );

	public search : string = '';

	private _temp : { paged : number, resetPaginator : boolean } = { paged : 1 , resetPaginator : true };

	private readonly donViService : DonViService = inject<DonViService>( DonViService );

	readonly leftSectionState : WritableSignal<ComponentStateExtend> = signal<ComponentStateExtend>( 'loading' );

	public searchLeft : string = '';

	private observeOnSearch : Subject<SearchInfo> = new Subject<SearchInfo>();

	public DOT_THI_OPTIONS : IctuDropdownOptionExtended<number , DotThiOption>[] = null;

	public readonly dataTable : IctuDataTable<DoiTacLuyenThi> = new IctuDataTable( { pageLinkSize : 3 , rows : 10 , showFirstLastIcon : false } );

	readonly isAdminUser : Signal<boolean> = signal<boolean>( this.auth.userHasRole( 'admin_luyenthi_thpt' ) );

	readonly partnerId : WritableSignal<number> = signal<number>( 0 );

	ngOnInit () : void {
		this.loadData( 1 , true );
		this.observeOnSearch.asObservable().pipe(
			takeUntil( this.onDestroy$ ) ,
			distinctUntilChanged( ( prev : SearchInfo , temp : SearchInfo ) : boolean => {
				return prev.position === temp.position && prev.data === temp.data;
			} )
		).subscribe( () : void => {
			this.loadData( 1 , true );
		} )
	}

	reload ( event : MouseEvent ) : void {
		event.preventDefault();
		event.stopPropagation();
		this.loadData( this._temp.paged , this._temp.resetPaginator );
	}

	onSearchData ( data : string , position : SearchInfoPosition ) : void {
		this.observeOnSearch.next( { data , position } );
	}

	loadData ( paged : number , resetPaginator : boolean = false ) : void {
		if ( this.isAdminUser() ) {
			this.leftSectionState.set( 'loading' );
			forkJoin<[ any , DoiTacLuyenThi[] ]>( [
				this.loadDotThi() ,
				this.loadDoiTac( paged , resetPaginator )
			] ).pipe(
				takeUntil( this.onDestroy$ )
			).subscribe( {
				next  : ( [ _ , data ] : [ any , DoiTacLuyenThi[] ] ) : void => {
					this.dataTable.fillData( data );
					this.leftSectionState.set( 'success' );
				} ,
				error : () : void => {
					this.leftSectionState.set( 'error' );
				}
			} )
		}
		else {
			this.partnerId.set( this.auth.user.id );
		}
	}

	onChangePage ( paged : number ) : void {
		this.loadData( paged , false );
	}

	private loadDotThi () : Observable<IctuDropdownOptionExtended<number , DotThiOption>[]> {
		return this.DOT_THI_OPTIONS ? of( this.DOT_THI_OPTIONS ) : this.dotThiService.loadOptionsObject().pipe(
			map( ( options : IctuDropdownOptionExtended<number , DotThiOption>[] ) : IctuDropdownOptionExtended<number , DotThiOption>[] => {
				this.DOT_THI_OPTIONS = options;
				return options;
			} )
		)
	}

	private loadDoiTac ( paged : number , resetPaginator : boolean = false ) : Observable<DoiTacLuyenThi[]> {
		return this.doiTacService.loadall( this.searchLeft , { limit : this.dataTable.paginator.rows() , paged } ).pipe(
			switchMap( ( res : DtoObject<DoiTac[]> ) : Observable<[ DtoObject<DoiTac[]> , DmDonvi[] ]> => {
				const dvIds : number[]                      = res.data.map( ( i : DoiTac ) : number => i.donvi_id );
				const loadDmDoinVi$ : Observable<DmDonvi[]> = dvIds.length ? this.donViService.query( [] , { limit : -1 , paged : 1 , include : dvIds.join( ',' ) , include_by : 'id' } ).pipe(
					map( ( _res : DtoObject<DmDonvi[]> ) : DmDonvi[] => _res.data )
				) : of( [] );
				return forkJoin<[ DtoObject<DoiTac[]> , DmDonvi[] ]>( [
					of( res ) ,
					loadDmDoinVi$
				] )
			} ) ,
			map( ( [ res , dmDonVi ] : [ DtoObject<DoiTac[]> , DmDonvi[] ] ) : DtoObject<DoiTacLuyenThi[]> => {
				return {
					... res ,
					data : res.data.map( ( _dt : DoiTac ) : DoiTacLuyenThi => {
						return {
							... _dt ,
							officeName : dmDonVi.find( ( o : DmDonvi ) : boolean => o.id === _dt.donvi_id )?.ten ?? ''
						}
					} )
				}
			} ) ,
			map( ( res : DtoObject<DoiTacLuyenThi[]> ) : DoiTacLuyenThi[] => {
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

	identify ( _ : number , agent : DoiTacLuyenThi ) : number | string {
		return agent.id;
	}

	choosePartner ( agent : DoiTacLuyenThi ) : void {
		this.partnerId.set( agent.user_id );
	}

}
