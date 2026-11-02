import { inject , Injectable } from '@angular/core';
import { HttpClient , HttpParams } from "@angular/common/http";
import { getApiRouteLink } from "@env";
import { Teacher } from "@model/teacher";
import { DtoObject , IctuConditionParam , IctuQueryParams } from "@model/dto";
import { map , Observable } from "rxjs";
import { paramsConditionBuilder } from "@utilities/helper";

@Injectable( {
	providedIn : 'any'
} )
export class TeacherService {

	readonly http : HttpClient = inject( HttpClient );

	readonly api : string = getApiRouteLink( 'teachers/' );

	public getTeacherInfo () : Observable<Teacher> {
		return this.http.get<DtoObject<Teacher[]>>( this.api ).pipe( map( ( response : DtoObject<Teacher[]> ) : Teacher => response.data.length ? response.data[ 0 ] : null ) );
	}

	public query ( conditions : IctuConditionParam[] , queryParams? : IctuQueryParams ) : Observable<DtoObject<Teacher[]>> {
		const params : HttpParams = paramsConditionBuilder( conditions , new HttpParams( { fromObject : queryParams || {} } ) );
		return this.http.get<DtoObject<Teacher[]>>( this.api , { params } );
	}
}
