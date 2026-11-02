import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import { DtoObject , IctuConditionParam , IctuQueryCondition , IctuQueryParams } from '@model/dto';
import { IctuBaseServiceClass } from '@model/ictu-base-service';
import { MonHoc } from "@model/mon-hoc";

@Injectable( {
	providedIn : 'any'
} )
export class SubjectService extends IctuBaseServiceClass<MonHoc> {
	constructor () {
		super( 'dm-subjects' );
	}

	load ( search : string , _queryParams? : Partial<IctuQueryParams> ) : Observable<DtoObject<any[]>> {
		const queryParams : IctuQueryParams = Object.assign<IctuQueryParams , IctuQueryParams>(
			{
				limit : 20 ,
				paged : 1
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
}
