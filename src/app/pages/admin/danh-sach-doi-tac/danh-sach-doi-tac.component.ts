import { Component , inject , OnDestroy , OnInit , signal , WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComponentBaseState , IctuTableComponent } from "@model/commons";
import { IctuDataTable } from "@model/ictu-data-table";
import { map , Subject } from "rxjs";
import { DoiTac } from "@model/doi-tac";
import { User } from "@model/user";
import { DonVi } from "@model/danh-muc";
import { DoiTacService } from "@service/luyenthithpt/doi-tac.service";
import { DropdownModule } from "primeng/dropdown";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { SharedModule } from "primeng/api";
import { IctuPaginatorComponent } from "@theme/components/ictu-paginator/ictu-paginator.component";
import { DtoObject } from "@model/dto";

type DoiTacShort = Pick<DoiTac , 'id' | 'hoten' | 'user_id' | 'donvi_id'>;

interface IctuPartnerExtended extends DoiTacShort {
	user : User;
	donvi : DonVi
}

@Component( {
	selector    : 'app-danh-sach-doi-tac' ,
	standalone  : true ,
	imports     : [ CommonModule , DropdownModule , MatProgressBarModule , SharedModule , IctuPaginatorComponent ] ,
	templateUrl : './danh-sach-doi-tac.component.html' ,
	styleUrls   : [ './danh-sach-doi-tac.component.css' ]
} )
export default class DanhSachDoiTacComponent implements OnInit , OnDestroy , IctuTableComponent<IctuPartnerExtended> {

	readonly dataTable : IctuDataTable<IctuPartnerExtended> = new IctuDataTable<IctuPartnerExtended>();

	readonly state : WritableSignal<ComponentBaseState> = signal<ComponentBaseState>( 'loading' );

	private destroy : Subject<void> = new Subject<void>();

	private readonly doiTacService : DoiTacService = inject<DoiTacService>( DoiTacService );

	private _temp : { paged : number; resetPaginator : boolean } = {
		paged          : 1 ,
		resetPaginator : true
	};

	ngOnInit () : void {
		this.loadData( 1 , true );
	}

	identify ( _ : number , item : IctuPartnerExtended ) : string | number {
		return item.id;
	};

	private loadData ( paged : number = 1 , resetPaginator : boolean = true ) : void {
		this.state.set( 'loading' );
		this._temp = { paged , resetPaginator };
		this.doiTacService.query( [] , {
			select : 'id,hoten,user_id,donvi_id' ,
			with   : 'user,donvi' ,
			limit  : this.dataTable.paginator.rows() ,
			paged
		} ).pipe(
			map( ( response : DtoObject<DoiTac[]> ) : DtoObject<IctuPartnerExtended[]> => ( { ... response , data : response.data.map( ( row : DoiTac ) : IctuPartnerExtended => row as unknown as IctuPartnerExtended ) } ) ) ,
			map( ( res : DtoObject<IctuPartnerExtended[]> ) : IctuPartnerExtended[] => {
				if ( resetPaginator ) {
					return this.dataTable.paginator.setupPaginator( res );
				}
				else {
					this.dataTable.paginator.changePage( paged );
					return res.data;
				}
			} )
		).subscribe( {
			next  : ( data : IctuPartnerExtended[] ) : void => {
				console.log( data );
				this.dataTable.fillData( data );
				this.state.set( 'success' );
			} ,
			error : () : void => {
				this.state.set( 'error' );
			}
		} );
	}

	reload ( event : MouseEvent ) : void {
		event.preventDefault();
		event.stopPropagation();
		this.loadData( this._temp.paged , this._temp.resetPaginator );
	}

	onChangePage ( paged : number ) : void {
		this.loadData( paged , false );
	}

	ngOnDestroy () : void {
		this.destroy.next();
		this.destroy.complete();
	}
}
