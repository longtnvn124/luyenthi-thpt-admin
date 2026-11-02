import { computed , Signal , signal , WritableSignal } from "@angular/core";
import { DtoObject , IctuPaginator } from "@model/dto";

export interface IctuPaginatorConfig {
	pageLinkSize : number;
	showFirstLastIcon : boolean;
	rows : number;
}

export class IctuPaginatorControl {
	
	readonly showFirstLastIcon : Signal<boolean>;
	
	readonly pageLinkSize : Signal<number>;
	
	readonly rows : Signal<number>;
	
	private _totalRecords : WritableSignal<number> = signal<number>( 0 );
	
	private _paged : WritableSignal<number> = signal<number>( 1 );
	
	readonly totalRecords : Signal<number> = computed( () : number => this._totalRecords() );
	
	public paged : Signal<number> = computed( () : number => this._paged() );
	
	readonly startIndex : Signal<number> = computed( () : number => ( ( ( this.paged() * this.rows() ) - this.rows() ) + 1 ) );
	
	constructor ( { pageLinkSize , showFirstLastIcon , rows } : IctuPaginatorConfig ) {
		this.pageLinkSize      = signal<number>( Math.max( 3 , pageLinkSize ) );
		this.showFirstLastIcon = signal<boolean>( showFirstLastIcon );
		this.rows              = signal<number>( rows );
	}
	
	setupPaginator<T> ( response : IctuPaginator<T> | DtoObject<T[]> ) : T[] {
		const totalRecords : number = 'totalRecords' in response ? response.totalRecords : response.recordsFiltered;
		this._totalRecords.set( totalRecords );
		this.changePage( 1 );
		return response.data
	}
	
	changePage ( page : number ) : void {
		this._paged.set( page );
	}
	
}