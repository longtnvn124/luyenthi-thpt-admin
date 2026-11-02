import { Injectable } from '@angular/core';
import { DtoObject , IctuConditionParam , IctuQueryCondition , IctuQueryParams } from '@model/dto';
import { ThemeSettingsService } from '@service/core/theme-settings.service';
import { map , Observable } from 'rxjs';
import { IctuBaseServiceClass } from '@model/ictu-base-service';
import { DoiTacThiSinh } from '@model/doi-tac-thi-sinh';
import { HttpParams } from "@angular/common/http";

@Injectable( {
	providedIn : 'root'
} )
export class DoiTacThiSinhService extends IctuBaseServiceClass<DoiTacThiSinh> {

	constructor ( private themeSettingsService : ThemeSettingsService ) {
		super( 'shift-registers' );
	}

	load ( search : string , donvi_id : number , dotthi_id : number , subject_id : number , user_id : number , _queryParams? : Partial<IctuQueryParams> ) : Observable<DtoObject<DoiTacThiSinh[]>> {
		const defaultQueryParams : IctuQueryParams = {
			orderby : 'hoten' ,
			order   : 'ASC' ,
			limit   : this.themeSettingsService.settings.rows ,
			paged   : 1
		}
		if ( donvi_id ) {
			defaultQueryParams[ 'include' ]    = donvi_id
			defaultQueryParams[ 'include_by' ] = 'donvi_id'
		}
		const queryParams : IctuQueryParams     = Object.assign<IctuQueryParams , IctuQueryParams>( defaultQueryParams , _queryParams );
		const conditions : IctuConditionParam[] = [];
		if ( search ) {
			conditions.push( {
				conditionName : 'hoten' ,
				value         : `%${ search }%` ,
				condition     : IctuQueryCondition.like ,
				orWhere       : 'and'
			} );
		}
		if ( dotthi_id ) {
			conditions.push( {
				conditionName : 'dotthi_id' ,
				value         : `${ dotthi_id }` ,
				condition     : IctuQueryCondition.equal ,
				orWhere       : 'and'
			} );
		}
		else {
			conditions.push( {
				conditionName : 'dotthi_id' ,
				value         : `${ -1 }` ,
				condition     : IctuQueryCondition.equal ,
				orWhere       : 'and'
			} );
		}
		if ( user_id != 0 ) {
			conditions.push( {
				conditionName : 'created_by' ,
				value         : `${ user_id }` ,
				condition     : IctuQueryCondition.equal ,
				orWhere       : 'and'
			} );
		}
		if ( subject_id ) {
			conditions.push( {
				conditionName : 'subject_ids' ,
				value         : `%|${ subject_id }|%` ,
				condition     : IctuQueryCondition.like
			} );
		}
		return this.query( conditions , queryParams );
	}

	getDataById ( id : number , queryParams? : Partial<IctuQueryParams> ) : Observable<DoiTacThiSinh> {
		const params : HttpParams = new HttpParams( { fromObject : queryParams || {} } );
		const route : string      = ''.concat( this.api , id.toString( 10 ) );
		return this.http.get<DtoObject<DoiTacThiSinh>>( route , { params } ).pipe(
			map( ( response : DtoObject<DoiTacThiSinh> ) : DoiTacThiSinh => response.data )
		)
	}

}
