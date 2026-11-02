import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DoiTac } from '@model/doi-tac';
import { DtoObject , IctuConditionParam , IctuQueryCondition , IctuQueryParams } from '@model/dto';
import { IctuBaseServiceClass } from '@model/ictu-base-service';

@Injectable( {
	providedIn : 'any'
} )
export class DoiTacService extends IctuBaseServiceClass<DoiTac> {

	constructor () {
		super( 'doitac' );
	}

	load ( user_id : number ) : Observable<DtoObject<DoiTac[]>> {
		const conditions : IctuConditionParam[] = [ {
			conditionName : 'user_id' ,
			condition     : IctuQueryCondition.equal ,
			value         : `${ user_id }`
		} ];
		return this.query( conditions );
	}

	loadall ( search : string , _queryParams? : Partial<IctuQueryParams> ) : Observable<DtoObject<DoiTac[]>> {
		const queryParams : IctuQueryParams     = Object.assign<IctuQueryParams , IctuQueryParams>( { limit : 20 , paged : 1 } , _queryParams );
		const conditions : IctuConditionParam[] = [];
		if ( search ) {
			conditions.push( {
				conditionName : 'hoten' ,
				value         : `%${ search }%` ,
				condition     : IctuQueryCondition.like ,
				orWhere       : 'and'
			} );
		}
		return this.query( conditions , queryParams );
	}
}
