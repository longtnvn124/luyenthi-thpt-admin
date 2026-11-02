import { computed , Signal , signal , WritableSignal } from "@angular/core";
import { IctuPaginatorConfig , IctuPaginatorControl } from "@theme/components/ictu-paginator/ictu-paginator-control";

export type IctuDataTableRow<T extends {}> = T & {
	_ictuDataTableRowChecked : boolean;
};

export class IctuDataTable<T> {
	
	readonly paginator : IctuPaginatorControl;
	
	readonly data : WritableSignal<IctuDataTableRow<T>[]> = signal<IctuDataTableRow<T>[]>( [] );
	
	readonly partiallyChecked : Signal<boolean> = computed( () : boolean => this.someItemsChecked() && ! this.totalChecked() );
	
	readonly totalChecked : Signal<boolean> = computed( () : boolean => {
		const elements : IctuDataTableRow<T>[] = this.data();
		if ( ! elements.length ) {
			return false;
		}
		return elements.every( ( e : IctuDataTableRow<T> ) : boolean => e._ictuDataTableRowChecked );
	} );
	
	readonly someItemsChecked : Signal<boolean> = computed( () : boolean => {
		const elements : IctuDataTableRow<T>[] = this.data();
		if ( ! elements.length ) {
			return false;
		}
		return elements.some( ( row : IctuDataTableRow<T> ) : boolean => row._ictuDataTableRowChecked );
	} );
	
	constructor ( paginatorConfig? : Partial<IctuPaginatorConfig> ) {
		const pageLinkSize : number       = paginatorConfig?.pageLinkSize || 5;
		const rows : number               = paginatorConfig?.rows || 20;
		const showFirstLastIcon : boolean = paginatorConfig?.showFirstLastIcon || true;
		this.paginator                    = new IctuPaginatorControl( { pageLinkSize , rows , showFirstLastIcon } );
	}
	
	selectRow ( checked : boolean , index? : number ) : void {
		this.data.update( ( data : IctuDataTableRow<T>[] ) : IctuDataTableRow<T>[] => {
			if ( index === undefined ) {
				return data.map( ( row : IctuDataTableRow<T> ) : IctuDataTableRow<T> => {
					row._ictuDataTableRowChecked = checked;
					return row;
				} );
			}
			else {
				data[ index ]._ictuDataTableRowChecked = checked;
				return [ ... data ];
			}
		} );
	}
	
	fillData ( data : T[] ) : void {
		this.data.set( data.map( ( row : T ) : IctuDataTableRow<T> => this.toIctuDataTableRow( row ) ) );
	}
	
	toIctuDataTableRow ( data : T ) : IctuDataTableRow<T> {
		return { ... data , _ictuDataTableRowChecked : false };
	}
	
	getSelectedData () : T[] {
		return this.data().filter( ( row : IctuDataTableRow<T> ) : boolean => row._ictuDataTableRowChecked );
	}
	
}

export type DataTableEventName = 'OPEN_FORM_ADD' | 'DELETE_SINGLE_ROW' | 'OPEN_FORM_UPDATE' | 'DELETE_SELECTED_ROWS' | 'SUBMIT_FORM';

export interface DataTableEvent<T> {
	name : DataTableEventName;
	data : T;
}
