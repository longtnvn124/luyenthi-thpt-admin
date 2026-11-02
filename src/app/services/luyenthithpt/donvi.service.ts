import { Injectable } from '@angular/core';

import { map , Observable } from 'rxjs';

import { DtoObject , IctuQueryParams } from '@model/dto';
import { IctuBaseServiceClass } from '@model/ictu-base-service';
import { IctuDropdownOption } from '@model/commons';
import { DmDonvi } from "@model/dm-donvi";

@Injectable( {
	providedIn : 'any'
} )
export class DonViService extends IctuBaseServiceClass<DmDonvi> {
	constructor () {
		super( 'dm-donvi' );
	}

	loadOptions (
		_queryParams? : Partial<IctuQueryParams>
	) : Observable<IctuDropdownOption<number>[]> {
		const queryParams : IctuQueryParams = Object.assign<
			IctuQueryParams ,
			IctuQueryParams
		>(
			{
				limit : -1 ,
				paged : 1 ,
				order : 'DESC'
			} ,
			_queryParams
		);
		return this.query( [] , queryParams ).pipe(
			map( ( { data } : DtoObject<any[]> ) : IctuDropdownOption<number>[] =>
				data.map(
					( donvi : any ) : IctuDropdownOption<number> => ( {
						value : donvi.id ,
						label : donvi.ten
					} )
				)
			)
		);
	}
}
