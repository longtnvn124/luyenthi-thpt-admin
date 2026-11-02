import { Dto , DtoObject , IctuConditionParam , IctuQueryParams } from "@model/dto";
import { map , Observable } from "rxjs";
import { HttpClient , HttpParams } from "@angular/common/http";
import { inject } from "@angular/core";
import { paramsConditionBuilder } from "@utilities/helper";
import { getApiRouteLink } from "@env";
import { IctuBaseService } from "@model/commons";

export class IctuBaseServiceClass<T> implements IctuBaseService<T> {

	readonly api : string;

	readonly http : HttpClient = inject( HttpClient );

	constructor ( router : string ) {
		this.api = ''.concat( getApiRouteLink( router.replace( /\//g , '' ).trim() ) , '/' );
	}

	public create ( info : Partial<T> ) : Observable<number> {
		return this.http.post<DtoObject<number>>( this.api , info ).pipe( map( ( r : Dto ) : number => r.data ) );
	}

	public update ( id : number , info : Partial<T> ) : Observable<any> {
		return this.http.put<DtoObject<any>>( ''.concat( this.api , id.toString( 10 ) ) , info ).pipe( map( ( r : Dto ) : any => r.data ) );
	}

	public delete ( id : number ) : Observable<any> {
		return this.http.delete<DtoObject<any>>( ''.concat( this.api , id.toString( 10 ) ) ).pipe( map( ( r : Dto ) : any => r.data ) );
	}

	public query( conditions : IctuConditionParam[] , queryParams? : IctuQueryParams ) : Observable<DtoObject<T[]>> {
		const params : HttpParams = paramsConditionBuilder( conditions , new HttpParams( { fromObject : queryParams || {} } ) );
		return this.http.get<DtoObject<T[]>>( this.api , { params } );
	}
}