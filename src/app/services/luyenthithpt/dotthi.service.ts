import { Injectable } from '@angular/core';

import { map , Observable } from 'rxjs';

import { DtoObject , IctuConditionParam , IctuQueryCondition , IctuQueryParams } from '@model/dto';
import { IctuBaseServiceClass } from '@model/ictu-base-service';

import { DotThi , DotThiOption } from '@model/dotthi';
import { IctuDropdownOption , IctuDropdownOptionExtended } from '@model/commons';

@Injectable( {
	providedIn : 'any'
} )
export class DotThiService extends IctuBaseServiceClass<DotThi> {
	constructor () {
		super( 'dm-dotthi' );
	}

	load (
		search : string ,
		donvi_id? : number ,
		_queryParams? : Partial<IctuQueryParams>
	) : Observable<DtoObject<DotThi[]>> {
		const queryParams : IctuQueryParams = Object.assign<
			IctuQueryParams ,
			IctuQueryParams
		>(
			{
				limit : 20 ,
				paged : 1
				// include: donvi_id,
				// include_by:'donvi_id'
			} ,
			_queryParams
		);

		const conditions : IctuConditionParam[] = [];

		if ( search ) {
			conditions.push( {
				conditionName : 'name' ,
				condition     : IctuQueryCondition.like ,
				value         : `%${ search }%`
			} );
		}
		return this.query( conditions , queryParams );
	}

	loadOptions ( _queryParams? : Partial<IctuQueryParams> ) : Observable<IctuDropdownOption<number>[]> {
		const queryParams : IctuQueryParams = Object.assign<IctuQueryParams , IctuQueryParams>(
			{
				limit : -1 ,
				paged : 1 ,
				order : 'DESC'
			} ,
			_queryParams
		);
		return this.query( [] , queryParams ).pipe(
			map( ( { data } : DtoObject<DotThi[]> ) : IctuDropdownOption<number>[] =>
				data.map(
					( dotthi : DotThi ) : IctuDropdownOption<number> => ( {
						value : dotthi.id ,
						label : dotthi.name
					} )
				)
			)
		);
	}

	loadOptionsObject ( _queryParams? : Partial<IctuQueryParams> ) : Observable<IctuDropdownOptionExtended<number , DotThiOption>[]> {
		const queryParams : IctuQueryParams = Object.assign<IctuQueryParams , IctuQueryParams>(
			{
				limit   : -1 ,
				paged   : 1 ,
				order   : 'DESC' ,
				select  : 'id,name,ngaythi_dukien,date_start,date_end,status' ,
				orderby : 'ngaythi_dukien'
			} ,
			_queryParams
		);
		return this.query( [] , queryParams ).pipe(
			map( ( { data } : DtoObject<DotThiOption[]> ) : IctuDropdownOptionExtended<number , DotThiOption>[] =>
				data.map( ( object : DotThiOption ) : IctuDropdownOptionExtended<number , DotThiOption> => ( {
						value : object.id ,
						label : object.name ,
						object
					} )
				)
			)
		);
	}
}
