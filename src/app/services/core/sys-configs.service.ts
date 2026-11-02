import { Injectable } from "@angular/core";
import { HttpClient , HttpParams } from "@angular/common/http";
import { map , Observable } from "rxjs";
import { SystemConfig } from "@model/system-config";
import { getApiRouteLink } from "@env";
import { Dto , DtoObject , IctuConditionParam , IctuQueryCondition , IctuQueryParams } from "@model/dto";
import { HttpParamsHeplerService } from "./http-params-hepler.service";
import { ThemeSettingsService } from "./theme-settings.service";
import { paramsConditionBuilder } from "@utilities/helper";

@Injectable( {
	providedIn : "any"
} )
export class SysConfigsService {
	private readonly api : string = getApiRouteLink( "configs/" );

	constructor (
		private http : HttpClient ,
		private httpParamsHelper : HttpParamsHeplerService ,
		private themeSettingsService : ThemeSettingsService
	) {
	}

	getAppConfigs ( select : string = "" ) : Observable<SystemConfig[]> {
		const params : HttpParams = select
		                            ? new HttpParams().set( "select" , select )
		                            : new HttpParams();
		return this.http.get<DtoObject<SystemConfig[]>>( this.api , { params } ).pipe( map( ( r ) => r.data ) );
	}

	getAllAppConfigs () : Observable<SystemConfig[]> {
		const fromObject = {
			orderby : 'id' ,
			order   : 'ASC' ,
			limit   : '-1'
		};

		const conditions : IctuConditionParam[] = [
			{
				conditionName : 'config_key' ,
				condition     : IctuQueryCondition.equal ,
				value         : 'SAVE_METHOD' ,
				orWhere       : 'or'
			} ,
			{
				conditionName : 'config_key' ,
				condition     : IctuQueryCondition.equal ,
				value         : 'EXAM_VIEW_MODE' ,
				orWhere       : 'or'
			} ,
			{
				conditionName : 'config_key' ,
				condition     : IctuQueryCondition.equal ,
				value         : 'EXAM_RULES_MODE' ,
				orWhere       : 'or'
			}
		]

		const params = this.httpParamsHelper.paramsConditionBuilder( conditions , new HttpParams( { fromObject } ) );
		return this.http.get<Dto>( this.api , { params } ).pipe(
			map( res => res.data )
		);
	}

	update ( id : number , data : any ) : Observable<any> {
		return this.http.put<Dto>( this.api.concat( id.toString() ) , data ).pipe(
			map( res => res.data )
		);
	}

	query<T> ( conditions : IctuConditionParam[] , queryParams? : IctuQueryParams ) : Observable<DtoObject<T[]>> {
		const params : HttpParams = paramsConditionBuilder( conditions , new HttpParams( { fromObject : queryParams || {} } ) );
		return this.http.get<DtoObject<T[]>>( this.api , { params } );
	}
}

