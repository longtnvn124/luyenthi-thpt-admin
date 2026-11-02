import { Injectable } from '@angular/core';
import { HttpClient , HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { getApiRouteLink } from '@env';
import { HttpParamsHeplerService } from './http-params-hepler.service';
import { Role } from '@model/role';
import { Dto, IctuQueryCondition } from '@model/dto';
import { SimpleRole } from '@model/auth';

@Injectable( {
	providedIn : 'root'
} )
export class RoleService {

	private readonly api = getApiRouteLink( 'roles/' );

	constructor(
		private http : HttpClient ,
		private appHttpParamsService : HttpParamsHeplerService
	) { }

	getRoleById( id : number , select = '' ) : Observable<Role> {
		const url     = ''.concat( this.api , id.toString() );
		const options = { params : select ? new HttpParams().set( 'select' , select ) : new HttpParams() };
		return this.http.get<Dto>( url , options ).pipe( map( res => res.data && res.data.length ? res.data : null ) );
	}

	filterRoles( roleId : string ) : Observable<Role[]> {
		const params = this.appHttpParamsService.paramsConditionBuilder( [ {
			conditionName : 'id' ,
			condition     : IctuQueryCondition.greaterThan ,
			value         : roleId
		} ] );
		return this.http.get<Dto>( this.api , { params } ).pipe( map( res => res.data ) );
	}

	listRoles( roleIds : string ) : Observable<Role[]> {
		const url = roleIds ? ''.concat( this.api , roleIds ) : this.api;
		return this.http.get<Dto>( url ).pipe( map( res => res.data ) );
	}

	listRolesFiltered( roleIds : string , select = '' ) : Observable<Role[]> {
		const url     = roleIds ? ''.concat( this.api , roleIds ) : this.api;
		const options = { params : select ? new HttpParams().set( 'select' , select ) : new HttpParams() };
		return this.http.get<Dto>( url , options ).pipe( map( res => res.data ) );
	}

	// getSimpleRoles( roleIds : string ) : Observable<Role[]> {
	// 	if ( roleIds ) {
	// 		return this.http.get<Dto>( this.api.concat( roleIds ) , { params : new HttpParams().set( 'select' , 'id,name,title,description,ucase_ids,ordering,status' ) } ).pipe(
	// 			map( res => res.data )
	// 		);
	// 	} else {
	// 		return of( [] );
	// 	}
	// }

  getRoles(selelct:string): Observable<SimpleRole[]>{
    const fromObject = {
      paged: 1,
      limit: -1,
      select:selelct
    };
    const params = this.appHttpParamsService.paramsConditionBuilder([], new HttpParams({ fromObject }));
    return this.http.get<Dto>(this.api, { params }).pipe(map(res =>  res.data));

  }
  
  getRolesByCols(condition: HttpParams): Observable<Role[]> {
	return this.http.get<Dto>(this.api, { params: condition }).pipe(
		map(res => res.data)
	);
}

}
