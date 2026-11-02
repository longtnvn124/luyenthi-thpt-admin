import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DtoObject , IctuConditionParam , IctuQueryParams } from '@model/dto';
import { map , Observable } from 'rxjs';
import { IctuBaseServiceClass } from '@model/ictu-base-service';
import { paramsConditionBuilder } from '@utilities/helper';


@Injectable( {
	providedIn : 'root'
} )
export class SummaryService extends IctuBaseServiceClass<any> {

	constructor () {
		super( 'summary' );
	}

	loadCost (
		donvi_id : number ,
		dotthi_id : number ,
		subject_id : number ,
		user_id : number ,
		_queryParams? : Partial<IctuQueryParams>
	) : Observable<number> {
		const queryParams : IctuQueryParams = Object.assign<
			IctuQueryParams ,
			IctuQueryParams
		>( {} , _queryParams );

		const conditions : IctuConditionParam[] = [];
		queryParams[ 'subject_id' ]             = subject_id?.toString() ?? '';
		if ( donvi_id != 0 ) {
			queryParams[ 'donvi_id' ] = donvi_id?.toString() ?? '';
		}
		if ( user_id != 0 ) {
			queryParams[ 'user_id' ] = user_id?.toString() ?? '';
		}
		queryParams[ 'dotthi_id' ] = dotthi_id?.toString() ?? '';

		const params : HttpParams = paramsConditionBuilder(
			conditions ,
			new HttpParams( { fromObject : queryParams || {} } )
		);
		return this.http.get<DtoObject<number>>( ''.concat( this.api , 'cost-dangky' ) , { params } ).pipe( map( ( res : DtoObject<number> ) : number => res.data ) );
	}

	loadSum (
		donvi_id : number ,
		dotthi_id : number ,
		user_id : number ,
		_queryParams? : Partial<IctuQueryParams>
	) : Observable<number> {
		const queryParams : IctuQueryParams = Object.assign<
			IctuQueryParams ,
			IctuQueryParams
		>( {} , _queryParams );

		const conditions : IctuConditionParam[] = [];

		if ( donvi_id != 0 ) {
			queryParams[ 'donvi_id' ] = donvi_id?.toString() ?? '';
		}
		if ( user_id != 0 ) {
			queryParams[ 'user_id' ] = user_id?.toString() ?? '';
		}
		queryParams[ 'dotthi_id' ] = dotthi_id?.toString() ?? '';
		const params : HttpParams  = paramsConditionBuilder(
			conditions ,
			new HttpParams( { fromObject : queryParams || {} } )
		);
		return this.http.get<DtoObject<number>>( ''.concat( this.api , 'sum-dangky' ) , { params } ).pipe( map( ( res : DtoObject<number> ) : number => res.data ) );
	}

	loadSumTotalSubject (
		donvi_id : number ,
		dotthi_id : number ,
		user_id : number ,
		_queryParams? : Partial<IctuQueryParams>
	) : Observable<number> {
		const queryParams : IctuQueryParams = Object.assign<
			IctuQueryParams ,
			IctuQueryParams
		>( {} , _queryParams );

		const conditions : IctuConditionParam[] = [];

		if ( donvi_id != 0 ) {
			queryParams[ 'donvi_id' ] = donvi_id?.toString() ?? '';
		}
		if ( user_id != 0 ) {
			queryParams[ 'user_id' ] = user_id?.toString() ?? '';
		}
		queryParams[ 'dotthi_id' ] = dotthi_id?.toString() ?? '';

		const params : HttpParams = paramsConditionBuilder(
			conditions ,
			new HttpParams( { fromObject : queryParams || {} } )
		);
		return this.http.get<DtoObject<number>>( ''.concat( this.api , 'count-total-subjects' ) , {
			params
		} ).pipe( map( ( res : DtoObject<number> ) : number => res.data ) );
	}
}
